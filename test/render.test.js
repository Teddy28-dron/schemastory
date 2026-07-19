import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { compareProfiles } from '../src/compare.js';
import { renderHtml } from '../src/html.js';
import { profileRecords } from '../src/profile.js';
import { renderTerminal } from '../src/terminal.js';

function reportFor(before, after) {
  const source = (label, count) => ({
    label,
    format: 'jsonl',
    sampledRecords: count,
    totalRecords: count,
    truncated: false,
  });
  return compareProfiles(
    profileRecords(before, source('before.jsonl', before.length)),
    profileRecords(after, source('after.jsonl', after.length)),
    { generatedAt: '2026-07-19T00:00:00.000Z' },
  );
}

describe('report renderers', () => {
  it('renders a readable terminal report without ANSI when disabled', () => {
    const output = renderTerminal(reportFor([{ value: 'x' }], [{ value: [] }]), {
      color: false,
    });
    assert.match(output, /SchemaStory/);
    assert.match(output, /BREAKING/);
    assert.match(output, /\$\.value/);
    assert.equal(output.includes('\u001B['), false);
  });

  it('renders a standalone, filterable HTML document', () => {
    const output = renderHtml(reportFor([{ value: 'x' }], [{ value: [] }]));
    assert.match(output, /^<!doctype html>/);
    assert.match(output, /data-filter="breaking"/);
    assert.match(output, /Local report · no raw values/);
    assert.equal(output.includes('https://'), false);
  });

  it('escapes source labels and paths in HTML', () => {
    const profile = profileRecords([{ '<script>alert(1)</script>': 1 }], {
      label: '<img src=x onerror=alert(1)>.json',
      format: 'json',
      sampledRecords: 1,
      totalRecords: 1,
      truncated: false,
    });
    const after = profileRecords([{}], {
      label: 'after.json',
      format: 'json',
      sampledRecords: 1,
      totalRecords: 1,
      truncated: false,
    });
    const output = renderHtml(
      compareProfiles(profile, after, { generatedAt: '2026-07-19T00:00:00.000Z' }),
    );
    assert.equal(output.includes('<script>alert(1)</script>'), false);
    assert.equal(output.includes('<img src=x onerror=alert(1)>'), false);
    assert.match(output, /&lt;script&gt;/);
  });

  it('does not leak recognizable values into terminal or HTML', () => {
    const secret = 'sk_live_DO_NOT_LEAK_123456';
    const report = reportFor([{ token: secret }], [{ token: 5 }]);
    assert.equal(renderTerminal(report).includes(secret), false);
    assert.equal(renderHtml(report).includes(secret), false);
  });
});
