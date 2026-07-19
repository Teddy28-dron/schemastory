import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { analyzeFiles } from './index.js';
import { SchemaStoryError, formatUserError } from './errors.js';
import { renderHtml } from './html.js';
import { DEFAULT_INPUT_LIMITS } from './input.js';
import { DEFAULT_PROFILE_LIMITS } from './profile.js';
import { renderTerminal } from './terminal.js';
import { VERSION } from './version.js';

const HELP = `SchemaStory ${VERSION}

See how your real JSON shape changed — even when you never had a schema.

Usage:
  schemastory [options] <before.json|jsonl> <after.json|jsonl>

Options:
  -f, --format <terminal|json|html>  Output format (default: terminal)
  -o, --output <path>               Write output to a file
      --max-records <number>        Maximum records per input (default: 10000)
      --max-depth <number>          Maximum nested traversal depth (default: 20)
      --coverage-threshold <0..1>   Coverage-drop threshold (default: 0.20)
      --null-threshold <0..1>       Null-increase threshold (default: 0.20)
      --fail-on <breaking|warning|never>
                                     CI failure policy (default: never)
      --open                        Open the generated HTML report
      --no-color                    Disable ANSI terminal colors
  -h, --help                        Show help
  -v, --version                     Show version

Examples:
  schemastory old.jsonl new.jsonl
  schemastory old.json new.json --format html --output report.html
  schemastory old.jsonl new.jsonl --format json --fail-on breaking

Exit codes:
  0  Analysis completed and policy passed
  1  Analysis completed and configured change policy failed
  2  Invalid arguments, unreadable input, or malformed data
`;

function argumentError(message, hint = 'Run schemastory --help to see supported arguments.') {
  return new SchemaStoryError('INVALID_ARGUMENT', message, hint);
}

function positiveInteger(rawValue, option, maximum) {
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw argumentError(
      `${option} must be an integer between 1 and ${maximum.toLocaleString()}.`,
      `Choose a value in range and pass it as ${option} <number>.`,
    );
  }
  return value;
}

function ratio(rawValue, option) {
  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw argumentError(
      `${option} must be a number between 0 and 1.`,
      `For example, use ${option} 0.20 for twenty percentage points.`,
    );
  }
  return value;
}

function optionValue(argv, index, inlineValue, option) {
  if (inlineValue !== undefined && inlineValue !== '') return { value: inlineValue, index };
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('-')) {
    throw argumentError(`${option} requires a value.`);
  }
  return { value, index: index + 1 };
}

export function parseArgs(argv) {
  const options = {
    format: 'terminal',
    formatExplicit: false,
    output: null,
    maxRecords: DEFAULT_INPUT_LIMITS.maxRecords,
    maxDepth: DEFAULT_PROFILE_LIMITS.maxDepth,
    coverageDrop: 0.2,
    nullIncrease: 0.2,
    failOn: 'never',
    open: false,
    color: true,
    help: false,
    version: false,
    positionals: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const rawToken = argv[index];
    if (rawToken === '--') {
      options.positionals.push(...argv.slice(index + 1));
      break;
    }

    const equalsIndex = rawToken.startsWith('--') ? rawToken.indexOf('=') : -1;
    const token = equalsIndex > -1 ? rawToken.slice(0, equalsIndex) : rawToken;
    const inlineValue = equalsIndex > -1 ? rawToken.slice(equalsIndex + 1) : undefined;

    if (!token.startsWith('-')) {
      options.positionals.push(token);
      continue;
    }

    if (token === '-h' || token === '--help') {
      options.help = true;
      continue;
    }
    if (token === '-v' || token === '--version') {
      options.version = true;
      continue;
    }
    if (token === '--open') {
      options.open = true;
      continue;
    }
    if (token === '--no-color') {
      options.color = false;
      continue;
    }

    const result = optionValue(argv, index, inlineValue, token);
    index = result.index;

    if (token === '-f' || token === '--format') {
      if (!['terminal', 'json', 'html'].includes(result.value)) {
        throw argumentError('--format must be terminal, json, or html.');
      }
      options.format = result.value;
      options.formatExplicit = true;
      continue;
    }
    if (token === '-o' || token === '--output') {
      options.output = result.value;
      continue;
    }
    if (token === '--max-records') {
      options.maxRecords = positiveInteger(result.value, token, 1_000_000);
      continue;
    }
    if (token === '--max-depth') {
      options.maxDepth = positiveInteger(result.value, token, 100);
      continue;
    }
    if (token === '--coverage-threshold') {
      options.coverageDrop = ratio(result.value, token);
      continue;
    }
    if (token === '--null-threshold') {
      options.nullIncrease = ratio(result.value, token);
      continue;
    }
    if (token === '--fail-on') {
      if (!['breaking', 'warning', 'never'].includes(result.value)) {
        throw argumentError('--fail-on must be breaking, warning, or never.');
      }
      options.failOn = result.value;
      continue;
    }

    throw argumentError(`Unknown option: ${token}`);
  }

  if (!options.formatExplicit && options.output) {
    const extension = path.extname(options.output).toLowerCase();
    if (extension === '.html' || extension === '.htm') options.format = 'html';
    if (extension === '.json') options.format = 'json';
  }
  if (options.open && !options.formatExplicit) options.format = 'html';

  if (!options.help && !options.version && options.positionals.length !== 2) {
    throw argumentError(
      `Expected two input files but received ${options.positionals.length}.`,
      'Pass the before sample first and the after sample second.',
    );
  }
  if (options.open && options.format !== 'html') {
    throw argumentError('--open can only be used with HTML output.');
  }
  if (options.format === 'html' && !options.output) options.output = 'schemastory-report.html';

  return options;
}

function policyFailed(report, failOn) {
  if (failOn === 'never') return false;
  if (failOn === 'breaking') return report.summary.breaking > 0;
  return report.summary.breaking + report.summary.warning > 0;
}

function serializedReport(report, format, color) {
  if (format === 'json') return `${JSON.stringify(report, null, 2)}\n`;
  if (format === 'html') return renderHtml(report);
  return renderTerminal(report, { color });
}

async function writeOutput(outputPath, content, inputPaths) {
  const resolvedOutput = path.resolve(outputPath);
  const resolvedInputs = inputPaths.map((input) => path.resolve(input));
  if (resolvedInputs.includes(resolvedOutput)) {
    throw new SchemaStoryError(
      'OUTPUT_OVERWRITES_INPUT',
      'The output path points to one of the input files.',
      'Choose a different --output path so source data cannot be overwritten.',
    );
  }

  await mkdir(path.dirname(resolvedOutput), { recursive: true });
  await writeFile(resolvedOutput, content, 'utf8');
  return resolvedOutput;
}

function openReport(reportPath) {
  const command =
    process.platform === 'win32'
      ? 'explorer.exe'
      : process.platform === 'darwin'
        ? 'open'
        : 'xdg-open';
  return new Promise((resolve) => {
    const child = spawn(command, [reportPath], { detached: true, stdio: 'ignore' });
    child.once('spawn', () => {
      child.unref();
      resolve(true);
    });
    child.once('error', () => resolve(false));
  });
}

export async function runCli(argv) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      console.log(HELP);
      return 0;
    }
    if (options.version) {
      console.log(VERSION);
      return 0;
    }

    const [beforePath, afterPath] = options.positionals;
    const report = await analyzeFiles(beforePath, afterPath, options);
    const useColor =
      options.color &&
      options.format === 'terminal' &&
      !options.output &&
      process.stdout.isTTY &&
      !process.env.NO_COLOR;
    const output = serializedReport(report, options.format, useColor);

    if (options.output) {
      const writtenPath = await writeOutput(options.output, output, [beforePath, afterPath]);
      console.log(`${options.format.toUpperCase()} report written to ${writtenPath}`);
      if (options.open) {
        const opened = await openReport(writtenPath);
        if (!opened)
          console.warn('The report was created, but no system browser opener was available.');
      }
    } else {
      process.stdout.write(output);
    }

    return policyFailed(report, options.failOn) ? 1 : 0;
  } catch (error) {
    console.error(formatUserError(error));
    return 2;
  }
}

export { HELP };
