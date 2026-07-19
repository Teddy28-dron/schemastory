import { SchemaStoryError } from './errors.js';
import { appendArrayItem, appendProperty } from './paths.js';

export const TYPE_ORDER = ['null', 'boolean', 'integer', 'number', 'string', 'object', 'array'];

export const DEFAULT_PROFILE_LIMITS = Object.freeze({
  maxDepth: 20,
  maxFields: 5_000,
});

export function jsonType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'number';
  return typeof value;
}

function createMutableField(path) {
  return {
    path,
    observations: 0,
    presentRecords: new Set(),
    nullCount: 0,
    typeCounts: new Map(),
  };
}

function getOrCreateField(context, path) {
  const existing = context.fields.get(path);
  if (existing) return existing;

  if (context.fields.size >= context.maxFields) {
    throw new SchemaStoryError(
      'PATH_LIMIT_EXCEEDED',
      `The sample contains more than ${context.maxFields.toLocaleString()} observed paths.`,
      'Use a smaller sample or lower --max-depth so the report stays bounded and reviewable.',
    );
  }

  const field = createMutableField(path);
  context.fields.set(path, field);
  return field;
}

function observe(value, path, recordIndex, depth, context) {
  const field = getOrCreateField(context, path);
  const type = jsonType(value);

  field.observations += 1;
  field.presentRecords.add(recordIndex);
  field.typeCounts.set(type, (field.typeCounts.get(type) ?? 0) + 1);
  if (type === 'null') field.nullCount += 1;

  if (depth >= context.maxDepth && (type === 'object' || type === 'array')) {
    context.truncatedBranches += 1;
    return;
  }

  if (type === 'object') {
    for (const key of Object.keys(value).sort()) {
      observe(value[key], appendProperty(path, key), recordIndex, depth + 1, context);
    }
    return;
  }

  if (type === 'array') {
    const itemPath = appendArrayItem(path);
    for (const item of value) {
      observe(item, itemPath, recordIndex, depth + 1, context);
    }
  }
}

function finalizeField(field, recordCount) {
  const types = {};
  for (const type of TYPE_ORDER) {
    const count = field.typeCounts.get(type);
    if (count) types[type] = count;
  }

  return {
    path: field.path,
    observations: field.observations,
    presentRecords: field.presentRecords.size,
    recordCoverage: recordCount === 0 ? 0 : field.presentRecords.size / recordCount,
    nullCount: field.nullCount,
    nullRatio: field.observations === 0 ? 0 : field.nullCount / field.observations,
    types,
  };
}

export function profileRecords(records, source, options = {}) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new SchemaStoryError(
      'EMPTY_SAMPLE',
      'No JSON records were available to profile.',
      'Provide a non-empty JSON value, JSON array, JSONL file, or NDJSON file.',
    );
  }

  const maxDepth = options.maxDepth ?? DEFAULT_PROFILE_LIMITS.maxDepth;
  const maxFields = options.maxFields ?? DEFAULT_PROFILE_LIMITS.maxFields;
  const context = {
    fields: new Map(),
    maxDepth,
    maxFields,
    truncatedBranches: 0,
  };

  records.forEach((record, index) => observe(record, '$', index, 0, context));

  return {
    source,
    recordCount: records.length,
    fieldCount: context.fields.size,
    truncatedBranches: context.truncatedBranches,
    limits: { maxDepth, maxFields },
    fields: [...context.fields.values()]
      .map((field) => finalizeField(field, records.length))
      .sort((left, right) => left.path.localeCompare(right.path)),
  };
}
