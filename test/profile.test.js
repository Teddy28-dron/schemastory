import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaStoryError } from '../src/errors.js';
import { jsonType, profileRecords } from '../src/profile.js';

const source = {
  label: 'sample.jsonl',
  format: 'jsonl',
  sampledRecords: 2,
  totalRecords: 2,
  truncated: false,
};

describe('jsonType', () => {
  it('uses JSON-oriented number and container types', () => {
    assert.equal(jsonType(null), 'null');
    assert.equal(jsonType(true), 'boolean');
    assert.equal(jsonType(2), 'integer');
    assert.equal(jsonType(2.5), 'number');
    assert.equal(jsonType('two'), 'string');
    assert.equal(jsonType([]), 'array');
    assert.equal(jsonType({}), 'object');
  });
});

describe('profileRecords', () => {
  it('profiles nested fields, arrays, coverage, and null ratio', () => {
    const profile = profileRecords(
      [
        { id: 1, nested: { name: 'Ada' }, items: [{ value: 3 }, { value: null }] },
        { id: 2, nested: {}, items: [{ value: 4.5 }] },
      ],
      source,
    );
    const byPath = new Map(profile.fields.map((field) => [field.path, field]));

    assert.equal(profile.recordCount, 2);
    assert.deepEqual(byPath.get('$.id').types, { integer: 2 });
    assert.equal(byPath.get('$.nested.name').recordCoverage, 0.5);
    assert.equal(byPath.get('$.items[]').observations, 3);
    assert.deepEqual(byPath.get('$.items[].value').types, { null: 1, integer: 1, number: 1 });
    assert.equal(byPath.get('$.items[].value').nullRatio, 1 / 3);
  });

  it('quotes property names that are not safe identifiers', () => {
    const profile = profileRecords([{ 'build.id': 1, 'space key': true }], source);
    const paths = profile.fields.map((field) => field.path);
    assert.ok(paths.includes('$["build.id"]'));
    assert.ok(paths.includes('$["space key"]'));
  });

  it('records depth truncation without traversing beyond the limit', () => {
    const profile = profileRecords([{ a: { b: { c: 1 } } }], source, { maxDepth: 1 });
    assert.deepEqual(
      profile.fields.map((field) => field.path),
      ['$', '$.a'],
    );
    assert.equal(profile.truncatedBranches, 1);
  });

  it('rejects an empty sample with an actionable error', () => {
    assert.throws(
      () => profileRecords([], source),
      (error) => error instanceof SchemaStoryError && error.code === 'EMPTY_SAMPLE',
    );
  });

  it('bounds the number of observed paths', () => {
    assert.throws(
      () => profileRecords([{ a: 1, b: 2 }], source, { maxFields: 2 }),
      (error) => error instanceof SchemaStoryError && error.code === 'PATH_LIMIT_EXCEEDED',
    );
  });
});
