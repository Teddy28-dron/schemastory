import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';

import { SchemaStoryError } from '../src/errors.js';
import { loadInput } from '../src/input.js';

let directory;

before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'schemastory-input-'));
});

after(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe('loadInput', () => {
  it('loads and truncates a JSON array with known total records', async () => {
    const file = path.join(directory, 'records.json');
    await writeFile(file, JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }]));
    const result = await loadInput(file, { maxRecords: 2 });
    assert.equal(result.records.length, 2);
    assert.equal(result.source.totalRecords, 3);
    assert.equal(result.source.truncated, true);
  });

  it('treats one JSON object as one record', async () => {
    const file = path.join(directory, 'single.json');
    await writeFile(file, JSON.stringify({ id: 1 }));
    const result = await loadInput(file);
    assert.deepEqual(result.records, [{ id: 1 }]);
  });

  it('streams JSONL, ignores blank lines, and reports truncation', async () => {
    const file = path.join(directory, 'records.jsonl');
    await writeFile(file, '{"id":1}\n\n{"id":2}\n{"id":3}\n');
    const result = await loadInput(file, { maxRecords: 2 });
    assert.deepEqual(result.records, [{ id: 1 }, { id: 2 }]);
    assert.equal(result.source.totalRecords, null);
    assert.equal(result.source.truncated, true);
  });

  it('reports an exact malformed JSONL line without echoing its value', async () => {
    const file = path.join(directory, 'broken.jsonl');
    const sensitiveLine = '{"token":"do-not-print"';
    await writeFile(file, `{"ok":true}\n${sensitiveLine}\n`);
    await assert.rejects(
      loadInput(file),
      (error) =>
        error instanceof SchemaStoryError &&
        error.code === 'JSONL_PARSE_ERROR' &&
        error.message.includes('line 2') &&
        !error.message.includes('do-not-print'),
    );
  });

  it('rejects unsupported extensions', async () => {
    const file = path.join(directory, 'records.txt');
    await writeFile(file, '{"id":1}');
    await assert.rejects(
      loadInput(file),
      (error) => error instanceof SchemaStoryError && error.code === 'UNSUPPORTED_INPUT',
    );
  });

  it('returns an actionable missing-file error', async () => {
    await assert.rejects(
      loadInput(path.join(directory, 'missing.json')),
      (error) => error instanceof SchemaStoryError && error.code === 'INPUT_NOT_FOUND',
    );
  });
});
