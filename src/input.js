import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';

import { SchemaStoryError } from './errors.js';

export const DEFAULT_INPUT_LIMITS = Object.freeze({
  maxRecords: 10_000,
  maxJsonBytes: 50 * 1024 * 1024,
});

const JSONL_EXTENSIONS = new Set(['.jsonl', '.ndjson']);

function sourceMetadata(input, format, sampledRecords, totalRecords, truncated) {
  return {
    label: path.basename(input),
    format,
    sampledRecords,
    totalRecords,
    truncated,
  };
}

async function inspectInput(input) {
  let details;
  try {
    details = await stat(input);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new SchemaStoryError(
        'INPUT_NOT_FOUND',
        `Input file was not found: ${input}`,
        'Check the path and run the command again with an existing .json, .jsonl, or .ndjson file.',
        { cause: error },
      );
    }
    throw new SchemaStoryError(
      'INPUT_UNREADABLE',
      `Input file could not be inspected: ${input}`,
      'Check file permissions and confirm that the path is a readable local file.',
      { cause: error },
    );
  }

  if (!details.isFile()) {
    throw new SchemaStoryError(
      'INPUT_NOT_FILE',
      `Input path is not a file: ${input}`,
      'Pass a .json, .jsonl, or .ndjson file rather than a directory.',
    );
  }

  return details;
}

async function readJsonInput(input, details, maxRecords, maxJsonBytes) {
  if (details.size > maxJsonBytes) {
    throw new SchemaStoryError(
      'JSON_SIZE_LIMIT',
      `${path.basename(input)} is larger than the ${Math.floor(maxJsonBytes / 1024 / 1024)} MiB JSON limit.`,
      'Convert the collection to JSONL for streaming, or provide a smaller representative sample.',
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(await readFile(input, 'utf8'));
  } catch (error) {
    throw new SchemaStoryError(
      'JSON_PARSE_ERROR',
      `Could not parse ${path.basename(input)} as JSON: ${error.message}`,
      'Fix the JSON syntax. For one JSON value per line, rename the file to .jsonl or .ndjson.',
      { cause: error },
    );
  }

  const allRecords = Array.isArray(parsed) ? parsed : [parsed];
  if (allRecords.length === 0) {
    throw new SchemaStoryError(
      'EMPTY_SAMPLE',
      `${path.basename(input)} contains an empty JSON array.`,
      'Provide at least one representative JSON record.',
    );
  }

  const records = allRecords.slice(0, maxRecords);
  return {
    records,
    source: sourceMetadata(
      input,
      'json',
      records.length,
      allRecords.length,
      allRecords.length > maxRecords,
    ),
  };
}

async function readJsonLinesInput(input, maxRecords) {
  const records = [];
  let lineNumber = 0;
  let truncated = false;

  const lines = createInterface({
    input: createReadStream(input, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  try {
    for await (const line of lines) {
      lineNumber += 1;
      if (line.trim() === '') continue;

      if (records.length >= maxRecords) {
        truncated = true;
        break;
      }

      try {
        records.push(JSON.parse(line));
      } catch (error) {
        throw new SchemaStoryError(
          'JSONL_PARSE_ERROR',
          `Could not parse ${path.basename(input)} at line ${lineNumber}.`,
          'Ensure every non-empty line contains exactly one valid JSON value.',
          { cause: error },
        );
      }
    }
  } catch (error) {
    if (error instanceof SchemaStoryError) throw error;
    throw new SchemaStoryError(
      'INPUT_UNREADABLE',
      `Could not read ${path.basename(input)} as JSONL.`,
      'Check file permissions and confirm the file is valid UTF-8 text.',
      { cause: error },
    );
  } finally {
    lines.close();
  }

  if (records.length === 0) {
    throw new SchemaStoryError(
      'EMPTY_SAMPLE',
      `${path.basename(input)} contains no JSONL records.`,
      'Add at least one non-empty line containing a valid JSON value.',
    );
  }

  return {
    records,
    source: sourceMetadata(
      input,
      'jsonl',
      records.length,
      truncated ? null : records.length,
      truncated,
    ),
  };
}

export async function loadInput(input, options = {}) {
  const maxRecords = options.maxRecords ?? DEFAULT_INPUT_LIMITS.maxRecords;
  const maxJsonBytes = options.maxJsonBytes ?? DEFAULT_INPUT_LIMITS.maxJsonBytes;
  const extension = path.extname(input).toLowerCase();

  if (extension !== '.json' && !JSONL_EXTENSIONS.has(extension)) {
    throw new SchemaStoryError(
      'UNSUPPORTED_INPUT',
      `Unsupported input extension for ${path.basename(input) || input}.`,
      'Use a .json, .jsonl, or .ndjson file.',
    );
  }

  const details = await inspectInput(input);
  return JSONL_EXTENSIONS.has(extension)
    ? readJsonLinesInput(input, maxRecords)
    : readJsonInput(input, details, maxRecords, maxJsonBytes);
}
