const ANSI = {
  reset: '\u001B[0m',
  bold: '\u001B[1m',
  dim: '\u001B[2m',
  cyan: '\u001B[36m',
  red: '\u001B[31m',
  yellow: '\u001B[33m',
  green: '\u001B[32m',
};

function paint(text, style, enabled) {
  return enabled ? `${ANSI[style]}${text}${ANSI.reset}` : text;
}

function percentage(value) {
  const percent = value * 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(1)}%`;
}

function sourceLine(side) {
  const source = side.source;
  const total = source.totalRecords === null ? 'unknown total' : `${source.totalRecords} total`;
  const truncated = source.truncated ? ', sampled limit reached' : '';
  return `${source.label} · ${source.format.toUpperCase()} · ${source.sampledRecords} sampled / ${total}${truncated}`;
}

function metricLine(item) {
  if (!item.before || !item.after) return null;
  const typeBefore = Object.keys(item.before.types).join(' | ');
  const typeAfter = Object.keys(item.after.types).join(' | ');
  return [
    `types ${typeBefore} → ${typeAfter}`,
    `coverage ${percentage(item.before.recordCoverage)} → ${percentage(item.after.recordCoverage)}`,
    `null ${percentage(item.before.nullRatio)} → ${percentage(item.after.nullRatio)}`,
  ].join(' · ');
}

export function renderTerminal(report, options = {}) {
  const color = options.color ?? false;
  const lines = [];
  lines.push(paint('SchemaStory', 'bold', color));
  lines.push(paint('Observed JSON structure drift', 'cyan', color));
  lines.push('');
  lines.push(`${paint('BEFORE', 'dim', color)}  ${sourceLine(report.before)}`);
  lines.push(`${paint('AFTER ', 'dim', color)}  ${sourceLine(report.after)}`);
  lines.push('');
  lines.push(
    [
      paint(`${report.summary.breaking} breaking`, 'red', color),
      paint(`${report.summary.warning} warning`, 'yellow', color),
      paint(`${report.summary.info} info`, 'green', color),
    ].join(' · '),
  );
  lines.push('');

  if (report.changes.length === 0) {
    lines.push(paint('No observed structural drift.', 'green', color));
  } else {
    for (const item of report.changes) {
      const label = item.severity.toUpperCase().padEnd(8);
      const style =
        item.severity === 'breaking' ? 'red' : item.severity === 'warning' ? 'yellow' : 'green';
      lines.push(`${paint(label, style, color)} ${paint(item.path, 'bold', color)}`);
      lines.push(`         ${item.message}`);
      const metrics = metricLine(item);
      if (metrics) lines.push(`         ${paint(metrics, 'dim', color)}`);
      lines.push('');
    }
  }

  lines.push(paint('Important', 'bold', color));
  for (const caveat of report.caveats) lines.push(`  - ${caveat}`);
  return `${lines.join('\n')}\n`;
}
