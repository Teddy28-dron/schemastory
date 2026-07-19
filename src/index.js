import { compareProfiles } from './compare.js';
import { renderHtml } from './html.js';
import { loadInput } from './input.js';
import { profileRecords } from './profile.js';

export { compareProfiles, DEFAULT_THRESHOLDS } from './compare.js';
export { SchemaStoryError } from './errors.js';
export { renderHtml } from './html.js';
export { DEFAULT_INPUT_LIMITS, loadInput } from './input.js';
export { jsonType, profileRecords, TYPE_ORDER } from './profile.js';
export { renderTerminal } from './terminal.js';
export { VERSION } from './version.js';

export async function analyzeFiles(beforePath, afterPath, options = {}) {
  const inputOptions = {
    maxRecords: options.maxRecords,
    maxJsonBytes: options.maxJsonBytes,
  };
  const [beforeInput, afterInput] = await Promise.all([
    loadInput(beforePath, inputOptions),
    loadInput(afterPath, inputOptions),
  ]);
  const profileOptions = {
    maxDepth: options.maxDepth,
    maxFields: options.maxFields,
  };
  const beforeProfile = profileRecords(beforeInput.records, beforeInput.source, profileOptions);
  const afterProfile = profileRecords(afterInput.records, afterInput.source, profileOptions);

  return compareProfiles(beforeProfile, afterProfile, {
    coverageDrop: options.coverageDrop,
    nullIncrease: options.nullIncrease,
    generatedAt: options.generatedAt,
  });
}

export async function analyzeToHtml(beforePath, afterPath, options = {}) {
  return renderHtml(await analyzeFiles(beforePath, afterPath, options));
}
