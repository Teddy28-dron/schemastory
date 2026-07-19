import { isDescendantPath } from './paths.js';
import { VERSION } from './version.js';

export const DEFAULT_THRESHOLDS = Object.freeze({
  coverageDrop: 0.2,
  nullIncrease: 0.2,
});

const SEVERITY_ORDER = { breaking: 0, warning: 1, info: 2 };

function fieldSnapshot(field) {
  if (!field) return null;
  return {
    observations: field.observations,
    presentRecords: field.presentRecords,
    recordCoverage: field.recordCoverage,
    nullCount: field.nullCount,
    nullRatio: field.nullRatio,
    types: field.types,
  };
}

function typeNames(field) {
  return Object.keys(field.types);
}

function sameTypes(beforeTypes, afterTypes) {
  return (
    beforeTypes.length === afterTypes.length &&
    beforeTypes.every((type, index) => type === afterTypes[index])
  );
}

function acceptsBeforeType(type, afterTypes) {
  return afterTypes.includes(type) || (type === 'integer' && afterTypes.includes('number'));
}

function classifyTypeChange(beforeTypes, afterTypes) {
  const incompatibleRemoved = beforeTypes.filter(
    (type) => type !== 'null' && !acceptsBeforeType(type, afterTypes),
  );
  if (incompatibleRemoved.length > 0) return 'breaking';

  const meaningfulAdded = afterTypes.filter(
    (type) =>
      !beforeTypes.includes(type) && !(type === 'number' && beforeTypes.includes('integer')),
  );
  if (meaningfulAdded.length > 0) return 'warning';

  return 'info';
}

function change(kind, severity, path, message, before, after) {
  return {
    kind,
    severity,
    path,
    message,
    before: fieldSnapshot(before),
    after: fieldSnapshot(after),
  };
}

function suppressRedundantSubtrees(changes) {
  return changes.filter((candidate) => {
    if (candidate.kind !== 'added' && candidate.kind !== 'removed') return true;

    return !changes.some(
      (other) =>
        other !== candidate &&
        other.kind === candidate.kind &&
        isDescendantPath(candidate.path, other.path),
    );
  });
}

function profileSummary(profile) {
  return {
    source: profile.source,
    recordCount: profile.recordCount,
    fieldCount: profile.fieldCount,
    truncatedBranches: profile.truncatedBranches,
    limits: profile.limits,
  };
}

export function compareProfiles(beforeProfile, afterProfile, options = {}) {
  const coverageDrop = options.coverageDrop ?? DEFAULT_THRESHOLDS.coverageDrop;
  const nullIncrease = options.nullIncrease ?? DEFAULT_THRESHOLDS.nullIncrease;
  const beforeByPath = new Map(beforeProfile.fields.map((field) => [field.path, field]));
  const afterByPath = new Map(afterProfile.fields.map((field) => [field.path, field]));
  const paths = [...new Set([...beforeByPath.keys(), ...afterByPath.keys()])].sort();
  const changes = [];

  for (const path of paths) {
    const before = beforeByPath.get(path);
    const after = afterByPath.get(path);

    if (!before) {
      changes.push(
        change(
          'added',
          'info',
          path,
          'This path was observed in the after sample only.',
          null,
          after,
        ),
      );
      continue;
    }

    if (!after) {
      changes.push(
        change(
          'removed',
          'breaking',
          path,
          'This previously observed path is absent from the after sample.',
          before,
          null,
        ),
      );
      continue;
    }

    const beforeTypes = typeNames(before);
    const afterTypes = typeNames(after);
    const typesChanged = !sameTypes(beforeTypes, afterTypes);

    if (typesChanged) {
      const severity = classifyTypeChange(beforeTypes, afterTypes);
      changes.push(
        change(
          'type_changed',
          severity,
          path,
          `Observed types changed from ${beforeTypes.join(' | ')} to ${afterTypes.join(' | ')}.`,
          before,
          after,
        ),
      );
    }

    const coverageDifference = before.recordCoverage - after.recordCoverage;
    if (path !== '$' && coverageDifference >= coverageDrop) {
      const severity =
        before.recordCoverage >= 0.95 && after.recordCoverage < 0.5 ? 'breaking' : 'warning';
      changes.push(
        change(
          'coverage_drop',
          severity,
          path,
          `Record coverage dropped by ${Math.round(coverageDifference * 100)} percentage points.`,
          before,
          after,
        ),
      );
    }

    const nullDifference = after.nullRatio - before.nullRatio;
    const nullWasAddedAsType = !beforeTypes.includes('null') && afterTypes.includes('null');
    if (nullDifference >= nullIncrease && !nullWasAddedAsType) {
      changes.push(
        change(
          'null_increase',
          'warning',
          path,
          `Observed null ratio increased by ${Math.round(nullDifference * 100)} percentage points.`,
          before,
          after,
        ),
      );
    }
  }

  const filteredChanges = suppressRedundantSubtrees(changes).sort(
    (left, right) =>
      SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity] ||
      left.path.localeCompare(right.path) ||
      left.kind.localeCompare(right.kind),
  );

  const summary = { breaking: 0, warning: 0, info: 0, total: filteredChanges.length };
  for (const item of filteredChanges) summary[item.severity] += 1;

  const caveats = [
    'SchemaStory compares observed samples, not a complete formal contract.',
    'Reports contain structural aggregates and do not include raw input values.',
  ];
  if (beforeProfile.source.truncated || afterProfile.source.truncated) {
    caveats.push('At least one input was truncated at the configured record limit.');
  }
  if (beforeProfile.truncatedBranches > 0 || afterProfile.truncatedBranches > 0) {
    caveats.push('At least one nested branch reached the configured depth limit.');
  }

  return {
    schemaVersion: 1,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    tool: { name: 'SchemaStory', version: VERSION },
    thresholds: { coverageDrop, nullIncrease },
    before: profileSummary(beforeProfile),
    after: profileSummary(afterProfile),
    summary,
    changes: filteredChanges,
    caveats,
  };
}
