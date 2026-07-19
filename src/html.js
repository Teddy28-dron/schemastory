function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function percentage(value) {
  const percent = value * 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(1)}%`;
}

function width(value) {
  return Math.max(0, Math.min(100, value * 100)).toFixed(2);
}

function typePills(snapshot) {
  if (!snapshot) return '<span class="empty-value">not observed</span>';
  return Object.entries(snapshot.types)
    .map(
      ([type, count]) =>
        `<span class="type-pill">${escapeHtml(type)} <small>${count.toLocaleString()}</small></span>`,
    )
    .join('');
}

function sourceCard(label, side) {
  const source = side.source;
  const total = source.totalRecords === null ? 'unknown' : source.totalRecords.toLocaleString();
  return `
    <article class="source-card">
      <span class="eyebrow">${label}</span>
      <h3>${escapeHtml(source.label)}</h3>
      <dl>
        <div><dt>Format</dt><dd>${escapeHtml(source.format.toUpperCase())}</dd></div>
        <div><dt>Sampled</dt><dd>${source.sampledRecords.toLocaleString()}</dd></div>
        <div><dt>Total</dt><dd>${total}</dd></div>
        <div><dt>Paths</dt><dd>${side.fieldCount.toLocaleString()}</dd></div>
      </dl>
      ${source.truncated ? '<p class="limit-note">Record limit reached</p>' : ''}
    </article>`;
}

function metrics(snapshot, side) {
  if (!snapshot) {
    return `<div class="metric-column"><span class="metric-label">${side}</span><p class="empty-value">Not observed</p></div>`;
  }
  return `
    <div class="metric-column">
      <span class="metric-label">${side}</span>
      <div class="types">${typePills(snapshot)}</div>
      <div class="measure">
        <span>Record coverage <strong>${percentage(snapshot.recordCoverage)}</strong></span>
        <i><b style="width:${width(snapshot.recordCoverage)}%"></b></i>
      </div>
      <div class="measure null">
        <span>Null ratio <strong>${percentage(snapshot.nullRatio)}</strong></span>
        <i><b style="width:${width(snapshot.nullRatio)}%"></b></i>
      </div>
      <p class="observation-count">${snapshot.observations.toLocaleString()} observations</p>
    </div>`;
}

function changeCard(item, index) {
  const haystack = `${item.path} ${item.kind} ${item.message}`.toLowerCase();
  return `
    <article class="change-card ${item.severity}" data-severity="${item.severity}" data-search="${escapeHtml(haystack)}">
      <div class="change-index">${String(index + 1).padStart(2, '0')}</div>
      <div class="change-body">
        <div class="change-heading">
          <span class="severity">${item.severity}</span>
          <span class="kind">${escapeHtml(item.kind.replaceAll('_', ' '))}</span>
        </div>
        <h3>${escapeHtml(item.path)}</h3>
        <p class="message">${escapeHtml(item.message)}</p>
        <div class="metric-grid">
          ${metrics(item.before, 'Before')}
          ${metrics(item.after, 'After')}
        </div>
      </div>
    </article>`;
}

function emptyState() {
  return `
    <div class="empty-state">
      <span>✓</span>
      <h3>No observed structural drift</h3>
      <p>The sampled paths, types, coverage and null ratios stayed within the configured thresholds.</p>
    </div>`;
}

export function renderHtml(report) {
  const changes = report.changes.length
    ? report.changes.map((item, index) => changeCard(item, index)).join('')
    : emptyState();
  const generated = new Date(report.generatedAt).toLocaleString('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>SchemaStory · ${report.summary.total} observed changes</title>
  <style>
    :root { --ink:#16233a; --muted:#667085; --paper:#f7f5ef; --card:#fffdf8; --line:#dcd8cd; --navy:#17253e; --cyan:#3dd6d0; --lime:#c8f169; --red:#e35d58; --yellow:#d49a31; --green:#228b64; }
    * { box-sizing:border-box; }
    body { margin:0; color:var(--ink); background:var(--paper); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
    body::before { content:""; display:block; height:8px; background:linear-gradient(90deg,var(--cyan),var(--lime) 55%,#ffb36c); }
    code,h1,h2,h3,.brand,.change-index { font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace; }
    .shell { width:min(1120px,calc(100% - 40px)); margin:0 auto; }
    header { padding:28px 0 54px; background:var(--navy); color:white; overflow:hidden; position:relative; }
    header::after { content:"{ }"; position:absolute; right:-28px; top:-80px; color:rgba(255,255,255,.045); font:700 260px/1 monospace; transform:rotate(-8deg); }
    nav { display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
    .brand { display:flex; gap:11px; align-items:center; font-size:18px; font-weight:700; }
    .mark { display:grid; place-items:center; width:34px; height:34px; color:var(--navy); background:var(--lime); border-radius:9px; font-weight:900; }
    .privacy { border:1px solid rgba(255,255,255,.22); border-radius:999px; padding:8px 13px; color:#d9e4f5; font-size:13px; }
    .hero { max-width:830px; padding-top:68px; position:relative; z-index:1; }
    .kicker,.eyebrow { text-transform:uppercase; letter-spacing:.14em; font-size:12px; font-weight:800; }
    .kicker { color:var(--cyan); }
    h1 { margin:15px 0 18px; max-width:760px; font-size:clamp(39px,7vw,74px); line-height:.98; letter-spacing:-.055em; }
    .hero > p { max-width:670px; color:#c8d4e5; font-size:18px; line-height:1.65; }
    .summary-strip { display:grid; grid-template-columns:repeat(3,1fr); margin-top:-30px; position:relative; z-index:2; border:1px solid var(--line); border-radius:18px; overflow:hidden; background:var(--card); box-shadow:0 18px 50px rgba(31,42,62,.09); }
    .summary-item { padding:25px 28px; border-right:1px solid var(--line); }
    .summary-item:last-child { border-right:0; }
    .summary-item strong { display:block; font:700 38px/1 monospace; }
    .summary-item span { color:var(--muted); font-size:13px; text-transform:uppercase; letter-spacing:.1em; }
    .summary-item.breaking strong { color:var(--red); } .summary-item.warning strong { color:var(--yellow); } .summary-item.info strong { color:var(--green); }
    main { padding:58px 0 80px; }
    .section-heading { display:flex; align-items:end; justify-content:space-between; gap:24px; margin-bottom:20px; }
    h2 { margin:0; font-size:28px; letter-spacing:-.04em; }
    .section-heading p { margin:0; color:var(--muted); }
    .sources { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:44px; }
    .source-card { padding:24px; border:1px solid var(--line); border-radius:16px; background:var(--card); }
    .source-card .eyebrow { color:var(--green); }
    .source-card h3 { margin:9px 0 20px; font-size:20px; word-break:break-all; }
    dl { display:grid; grid-template-columns:repeat(4,1fr); margin:0; gap:12px; }
    dl div { display:flex; flex-direction:column; gap:4px; } dt { color:var(--muted); font-size:11px; text-transform:uppercase; } dd { margin:0; font-weight:750; }
    .limit-note { margin:17px 0 0; color:var(--yellow); font-size:13px; font-weight:700; }
    .callout { display:flex; gap:15px; align-items:flex-start; margin:0 0 44px; padding:18px 20px; border:1px solid #b8ddd3; background:#effbf6; border-radius:14px; }
    .callout strong { color:var(--green); } .callout p { margin:2px 0 0; color:#3f6257; line-height:1.5; }
    .controls { display:flex; flex-wrap:wrap; gap:9px; margin:20px 0; }
    button,input { font:inherit; }
    button { padding:9px 13px; border:1px solid var(--line); border-radius:999px; background:var(--card); color:var(--ink); cursor:pointer; font-size:13px; font-weight:700; }
    button.active { color:white; background:var(--navy); border-color:var(--navy); }
    .search { flex:1; min-width:220px; margin-left:auto; padding:10px 14px; border:1px solid var(--line); border-radius:999px; background:white; color:var(--ink); outline:none; }
    .search:focus { border-color:#6aa7a4; box-shadow:0 0 0 3px rgba(61,214,208,.18); }
    .change-list { display:grid; gap:12px; }
    .change-card { display:grid; grid-template-columns:58px 1fr; border:1px solid var(--line); border-radius:16px; background:var(--card); overflow:hidden; }
    .change-card[hidden] { display:none; }
    .change-index { display:grid; place-items:start center; padding-top:25px; border-right:1px solid var(--line); color:#8d938f; font-size:12px; }
    .change-card.breaking { border-left:5px solid var(--red); } .change-card.warning { border-left:5px solid var(--yellow); } .change-card.info { border-left:5px solid var(--green); }
    .change-body { padding:23px 25px 25px; min-width:0; }
    .change-heading { display:flex; gap:8px; align-items:center; }
    .severity,.kind { display:inline-flex; padding:4px 8px; border-radius:6px; font-size:10px; font-weight:850; text-transform:uppercase; letter-spacing:.08em; }
    .breaking .severity { color:#9f2e2b; background:#fde5e3; } .warning .severity { color:#8a5b0a; background:#fff0cf; } .info .severity { color:#126649; background:#dff5e9; }
    .kind { color:#576171; background:#edf0f3; }
    .change-card h3 { margin:13px 0 8px; font-size:18px; overflow-wrap:anywhere; }
    .message { margin:0; color:#596477; line-height:1.55; }
    .metric-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:21px; }
    .metric-column { padding:15px; border:1px solid #e7e3d9; border-radius:12px; background:#fbfaf6; }
    .metric-label { display:block; margin-bottom:10px; color:var(--muted); font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; }
    .types { display:flex; flex-wrap:wrap; gap:6px; min-height:24px; }
    .type-pill { padding:4px 7px; color:#344054; background:#e9edf2; border-radius:6px; font:650 12px/1.2 monospace; }
    .type-pill small { color:#7a8493; }
    .measure { margin-top:14px; }
    .measure span { display:flex; justify-content:space-between; color:#657080; font-size:11px; }
    .measure i { display:block; height:5px; margin-top:6px; border-radius:9px; background:#e6e4dd; overflow:hidden; }
    .measure b { display:block; height:100%; background:var(--cyan); border-radius:9px; } .measure.null b { background:#ffb36c; }
    .observation-count,.empty-value { margin:12px 0 0; color:#8a918f; font-size:11px; }
    .empty-state { padding:65px 20px; text-align:center; border:1px solid var(--line); border-radius:16px; background:var(--card); }
    .empty-state span { display:grid; place-items:center; width:48px; height:48px; margin:0 auto 15px; border-radius:50%; background:#dff5e9; color:var(--green); font-size:24px; }
    .empty-state h3 { margin:0 0 8px; } .empty-state p { color:var(--muted); }
    .caveats { margin-top:42px; padding-top:26px; border-top:1px solid var(--line); }
    .caveats h2 { font-size:18px; } .caveats ul { color:var(--muted); line-height:1.7; }
    footer { display:flex; justify-content:space-between; gap:20px; padding:24px 0 42px; color:#7a827f; font-size:12px; }
    @media (max-width:720px) { .shell{width:min(100% - 24px,1120px)} header{padding-bottom:44px}.hero{padding-top:48px}.summary-strip{grid-template-columns:1fr}.summary-item{border-right:0;border-bottom:1px solid var(--line)}.summary-item:last-child{border-bottom:0}.sources,.metric-grid{grid-template-columns:1fr}.section-heading,footer{align-items:flex-start;flex-direction:column}dl{grid-template-columns:1fr 1fr}.change-card{grid-template-columns:42px 1fr}.change-body{padding:19px 17px}.controls .search{order:-1;flex-basis:100%;margin-left:0}.privacy{display:none} }
    @media print { header{padding:24px 0;background:white;color:var(--ink)} header::after,.controls{display:none}.kicker,.hero>p{color:var(--muted)}.summary-strip{margin-top:20px;box-shadow:none}.change-card{break-inside:avoid} }
  </style>
</head>
<body>
  <header>
    <div class="shell">
      <nav>
        <div class="brand"><span class="mark">S</span> SchemaStory</div>
        <div class="privacy">Local report · no raw values</div>
      </nav>
      <div class="hero">
        <span class="kicker">Observed structure drift</span>
        <h1>Your JSON changed its shape.</h1>
        <p>SchemaStory compared two real samples without requiring a formal schema. Review what disappeared, became risky or appeared for the first time.</p>
      </div>
    </div>
  </header>
  <div class="shell">
    <section class="summary-strip" aria-label="Change summary">
      <div class="summary-item breaking"><strong>${report.summary.breaking}</strong><span>Breaking</span></div>
      <div class="summary-item warning"><strong>${report.summary.warning}</strong><span>Warning</span></div>
      <div class="summary-item info"><strong>${report.summary.info}</strong><span>Information</span></div>
    </section>
    <main>
      <section>
        <div class="section-heading"><h2>Samples</h2><p>${report.before.recordCount.toLocaleString()} → ${report.after.recordCount.toLocaleString()} records analyzed</p></div>
        <div class="sources">${sourceCard('Before', report.before)}${sourceCard('After', report.after)}</div>
      </section>
      <aside class="callout"><strong>Privacy boundary</strong><p>This report contains paths and aggregate counts only. SchemaStory does not copy source values into default reports.</p></aside>
      <section>
        <div class="section-heading"><h2>Observed changes</h2><p>${report.summary.total.toLocaleString()} changes after subtree deduplication</p></div>
        ${report.changes.length ? `<div class="controls"><button class="active" data-filter="all">All ${report.summary.total}</button><button data-filter="breaking">Breaking ${report.summary.breaking}</button><button data-filter="warning">Warnings ${report.summary.warning}</button><button data-filter="info">Info ${report.summary.info}</button><input class="search" type="search" placeholder="Filter by path or change…" aria-label="Filter changes"></div>` : ''}
        <div class="change-list">${changes}</div>
      </section>
      <section class="caveats"><h2>Read this report correctly</h2><ul>${report.caveats.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
    </main>
    <footer><span>Generated by SchemaStory ${escapeHtml(report.tool.version)}</span><span>${escapeHtml(generated)} UTC · coverage threshold ${percentage(report.thresholds.coverageDrop)} · null threshold ${percentage(report.thresholds.nullIncrease)}</span></footer>
  </div>
  <script>
    (() => {
      const buttons = [...document.querySelectorAll('[data-filter]')];
      const cards = [...document.querySelectorAll('.change-card')];
      const search = document.querySelector('.search');
      let active = 'all';
      const apply = () => {
        const query = (search?.value || '').trim().toLowerCase();
        for (const card of cards) card.hidden = !((active === 'all' || card.dataset.severity === active) && (!query || card.dataset.search.includes(query)));
      };
      for (const button of buttons) button.addEventListener('click', () => {
        active = button.dataset.filter;
        for (const item of buttons) item.classList.toggle('active', item === button);
        apply();
      });
      search?.addEventListener('input', apply);
    })();
  </script>
</body>
</html>\n`;
}
