import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { compareProfiles } from '../src/compare.js';
import { profileRecords } from '../src/profile.js';

function source(label, count) {
  return {
    label,
    format: 'jsonl',
    sampledRecords: count,
    totalRecords: count,
    truncated: false,
  };
}

function compare(before, after, options = {}) {
  return compareProfiles(
    profileRecords(before, source('before.jsonl', before.length)),
    profileRecords(after, source('after.jsonl', after.length)),
    { generatedAt: '2026-07-19T00:00:00.000Z', ...options },
  );
}

describe('compareProfiles', () => {
  it('classifies a removed path as breaking', () => {
    const report = compare([{ id: 1, name: 'Ada' }], [{ id: 1 }]);
    const removed = report.changes.find((item) => item.path === '$.name');
    assert.equal(removed.kind, 'removed');
    assert.equal(removed.severity, 'breaking');
  });

  it('classifies an incompatible type change as breaking', () => {
    const report = compare([{ content: 'hello' }], [{ content: ['hello'] }]);
    const changed = report.changes.find(
      (item) => item.path === '$.content' && item.kind === 'type_changed',
    );
    assert.equal(changed.severity, 'breaking');
  });

  it('treats integer to number as an informational widening', () => {
    const report = compare([{ amount: 1 }], [{ amount: 1.5 }]);
    const changed = report.changes.find((item) => item.path === '$.amount');
    assert.equal(changed.severity, 'info');
  });

  it('warns when null becomes observed', () => {
    const report = compare([{ value: 'ok' }], [{ value: null }, { value: 'ok' }]);
    const changed = report.changes.find(
      (item) => item.path === '$.value' && item.kind === 'type_changed',
    );
    assert.equal(changed.severity, 'warning');
    assert.equal(
      report.changes.filter((item) => item.path === '$.value' && item.kind === 'null_increase')
        .length,
      0,
    );
  });

  it('flags a material coverage drop', () => {
    const before = Array.from({ length: 10 }, (_, id) => ({ id, stable: true }));
    const after = Array.from({ length: 10 }, (_, id) => (id < 7 ? { id, stable: true } : { id }));
    const report = compare(before, after);
    const changed = report.changes.find(
      (item) => item.path === '$.stable' && item.kind === 'coverage_drop',
    );
    assert.equal(changed.severity, 'warning');
    assert.equal(changed.before.recordCoverage, 1);
    assert.equal(changed.after.recordCoverage, 0.7);
  });

  it('makes a near-universal field becoming sparse breaking', () => {
    const before = Array.from({ length: 10 }, (_, id) => ({ id, stable: true }));
    const after = Array.from({ length: 10 }, (_, id) => (id < 4 ? { id, stable: true } : { id }));
    const report = compare(before, after);
    const changed = report.changes.find(
      (item) => item.path === '$.stable' && item.kind === 'coverage_drop',
    );
    assert.equal(changed.severity, 'breaking');
  });

  it('collapses descendant additions and removals', () => {
    const report = compare(
      [{ old: { nested: { value: 1 } } }],
      [{ fresh: { deep: { value: 1 } } }],
    );
    const removedPaths = report.changes
      .filter((item) => item.kind === 'removed')
      .map((item) => item.path);
    const addedPaths = report.changes
      .filter((item) => item.kind === 'added')
      .map((item) => item.path);
    assert.deepEqual(removedPaths, ['$.old']);
    assert.deepEqual(addedPaths, ['$.fresh']);
  });

  it('never includes source values in the normalized report', () => {
    const secret = 'github_pat_SUPER_SECRET_VALUE_123456';
    const report = compare([{ token: secret, email: 'private@example.com' }], [{ token: 42 }]);
    const serialized = JSON.stringify(report);
    assert.equal(serialized.includes(secret), false);
    assert.equal(serialized.includes('private@example.com'), false);
  });

  it('returns stable summary counts and caveats', () => {
    const report = compare([{ a: 1 }], [{ b: 1 }]);
    assert.deepEqual(report.summary, { breaking: 1, warning: 0, info: 1, total: 2 });
    assert.equal(report.schemaVersion, 1);
    assert.match(report.caveats[0], /observed samples/i);
  });
});
