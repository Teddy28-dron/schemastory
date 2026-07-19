import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { it } from 'node:test';

import { VERSION } from '../src/version.js';

it('keeps the runtime and package versions synchronized', async () => {
  const packageJson = JSON.parse(
    await readFile(path.resolve(import.meta.dirname, '..', 'package.json'), 'utf8'),
  );
  assert.equal(VERSION, packageJson.version);
});
