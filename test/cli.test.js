import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { after, before, describe, it } from 'node:test';

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..');
const bin = path.join(root, 'bin', 'schemastory.js');
let directory;
let beforeFile;
let afterFile;

before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), 'schemastory-cli-'));
  beforeFile = path.join(directory, 'before.jsonl');
  afterFile = path.join(directory, 'after.jsonl');
  await writeFile(beforeFile, '{"id":1,"content":"hello"}\n');
  await writeFile(afterFile, '{"id":1,"content":[]}\n');
});

after(async () => {
  await rm(directory, { recursive: true, force: true });
});

async function run(args) {
  try {
    const result = await execFileAsync(process.execPath, [bin, ...args], {
      cwd: root,
      env: { ...process.env, NO_COLOR: '1' },
    });
    return { ...result, exitCode: 0 };
  } catch (error) {
    return { stdout: error.stdout, stderr: error.stderr, exitCode: error.code };
  }
}

describe('SchemaStory CLI', () => {
  it('shows help and version', async () => {
    const help = await run(['--help']);
    const version = await run(['--version']);
    assert.equal(help.exitCode, 0);
    assert.match(help.stdout, /Usage:/);
    assert.equal(version.stdout.trim(), '0.1.0');
  });

  it('prints terminal output and passes under the default exploratory policy', async () => {
    const result = await run([beforeFile, afterFile, '--no-color']);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /1 breaking/);
    assert.match(result.stdout, /\$\.content/);
  });

  it('emits stable JSON and fails when the explicit breaking policy is met', async () => {
    const result = await run([beforeFile, afterFile, '--format', 'json', '--fail-on', 'breaking']);
    assert.equal(result.exitCode, 1);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.summary.breaking, 1);
  });

  it('writes a standalone HTML report', async () => {
    const output = path.join(directory, 'nested', 'report.html');
    const result = await run([beforeFile, afterFile, '--output', output]);
    assert.equal(result.exitCode, 0);
    assert.match(result.stdout, /HTML report written/);
    const html = await readFile(output, 'utf8');
    assert.match(html, /^<!doctype html>/);
    assert.match(html, /Your JSON changed its shape/);
  });

  it('refuses to overwrite an input file', async () => {
    const result = await run([beforeFile, afterFile, '--output', beforeFile]);
    assert.equal(result.exitCode, 2);
    assert.match(result.stderr, /OUTPUT_OVERWRITES_INPUT/);
  });

  it('returns code 2 for invalid arguments with a fix hint', async () => {
    const result = await run([]);
    assert.equal(result.exitCode, 2);
    assert.match(result.stderr, /Expected two input files/);
    assert.match(result.stderr, /How to fix/);
  });
});
