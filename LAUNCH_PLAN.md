# SchemaStory Launch Plan

This plan optimizes for earning the first 100 stars by solving a narrow problem credibly. It does not assume an existing audience or paid promotion.

## Positioning

**One sentence:** See how your real JSON shape changed — even when you never had a schema.

**Initial audience:** developers maintaining event streams, LLM/agent traces, API fixtures, exports, and small data pipelines where observed payloads drift before formal contracts catch up.

**Promise:** two local files become an explainable report in one command; no upload and no raw values in the report.

**Avoid claiming:** complete compatibility proof, automatic schema generation, PII detection, semantic drift, or guaranteed privacy for sensitive filenames.

## Release gate

Before publishing:

- [x] Replace repository URL placeholders with the GitHub owner `Teddy28-dron`.
- [ ] Confirm the GitHub repository and npm names immediately before release.
- [ ] Enable GitHub private vulnerability reporting.
- [ ] Run `npm ci && npm run check` on Node 22 and 24.
- [ ] Run `npm pack`, inspect its file list, and install the tarball in a clean folder.
- [ ] Run the exact README quick-start commands.
- [ ] Open `examples/report.html` on desktop and mobile widths.
- [ ] Confirm the demo report contains none of the synthetic raw record values.
- [ ] Create a `v0.1.0` tag and GitHub Release with the changelog notes.
- [ ] Publish to npm only after package ownership and provenance are correct.

## Launch assets

- GitHub description: `See how your real JSON shape changed — even when you never had a schema.`
- Topics: `json`, `jsonl`, `schema-drift`, `data-contracts`, `data-quality`, `cli`, `developer-tools`.
- Social image: adapt `docs/assets/demo.svg` to GitHub's 1280×640 social preview.
- Short demo: follow `docs/demo-script.md`; target 25–35 seconds and no narration requirement.
- Release post: show the before record, after record, and resulting three-line explanation.

## First release

**Title:** `SchemaStory v0.1.0 — explain structural JSON drift from real samples`

**Release notes:**

> SchemaStory's first release compares two local JSON, JSONL, or NDJSON samples and explains what changed in their observed structure. It identifies removed paths, incompatible types, coverage drops, null increases, and additions; outputs terminal, versioned JSON, or standalone HTML; and supports explicit CI failure policies. Reports contain aggregate structure only and never copy raw values. Runtime code has zero dependencies and makes no network requests. Start with `npx schemastory before.jsonl after.jsonl` on Node.js 22+.

Attach `docs/assets/demo.svg`, link the changelog, and state the known limits: samples are not complete contracts, JSON arrays are parsed in memory, and v0.1 does not detect semantic value drift or renames.

## Channel-specific drafts

Every post should link directly to the repository and include the visual demo. Publish only where project sharing is allowed, participate in replies, and do not repost unchanged copy across unrelated communities.

### Hacker News

**Title:** `Show HN: SchemaStory – See how real JSON changed without a schema`

**Text:**

> I maintain payloads where the real data changes before the contract does. SchemaStory compares two JSON/JSONL samples and reports observed structural drift: removed paths, type changes, coverage drops, new nulls, and additions. It is a Node CLI with zero runtime dependencies; it runs locally and deliberately keeps raw values out of terminal, JSON, and HTML reports. The default is exploratory, while `--fail-on breaking` makes the same report useful in CI. The hard product question is rule severity rather than parsing, so I would value examples where the current classification is surprising.

### Reddit

Use a problem-specific title in an appropriate developer or data-engineering community after checking its current promotion rules.

**Title:** `I made a local CLI to catch JSON/JSONL shape drift before a downstream job breaks`

**Text:**

> A field in an event stream changed from a string to an array and our existing value diff was too noisy to make the structural break obvious. I built SchemaStory to aggregate paths and types across two samples, compare coverage/null ratios, and generate a shareable standalone report. It does not upload data or include raw values in reports. Here is the exact synthetic fixture and output. I am looking for feedback from people who maintain event payloads: which rule would be a false positive in your workflow?

### X / Twitter

> Your JSON changed. There was no schema. The consumer broke later. SchemaStory compares two real JSON/JSONL samples and explains removed fields, type changes, coverage drops, and new nulls — locally, with zero runtime deps and no raw values in reports. `npx schemastory before.jsonl after.jsonl` [link] [demo]

Follow-up reply: show the `$.message.content` string → array result and the HTML filter interaction.

### LinkedIn

> Formal data contracts are valuable, but many teams meet payload drift before the contract exists or after it becomes stale. SchemaStory is a small open-source CLI that compares two observed JSON/JSONL samples and produces an explainable structural change report. A developer can see removed paths, incompatible types, coverage drops, null growth, and additions in one command. Everything runs locally; reports retain aggregates but not source values. The first release focuses on a complete, auditable workflow rather than a monitoring platform. I would be interested in how teams currently review fixture and event-shape changes. [link]

### 中文技术社区

**标题：** `开源了一个本地 JSON 结构漂移检查工具：没有 Schema 也能发现破坏性变化`

**正文：**

> 数据接口、埋点事件和 Agent trace 经常先发生变化，Schema 和文档却没有同步。SchemaStory 直接比较两份 JSON/JSONL 样本，把字段删除、类型变化、覆盖率下降、空值增长和新增字段整理成终端、JSON 或单文件 HTML 报告。它运行时零依赖、完全本地运行，报告不包含原始值；默认只观察，也可以通过 `--fail-on breaking` 接入 CI。仓库里有可复现的合成数据和真实生成的报告。最希望得到的反馈不是“再加一个大功能”，而是：当前哪条判断规则在你的数据里会误报？[链接]

Potential homes include developer-tool newsletters, data-engineering forums, Node.js communities, and AI-agent engineering groups. Verify each community's current rules and use an example native to its audience before posting.

## Technical blog outline

**Working title:** `Your JSON changed before your schema did`

1. A concrete string-to-array incident and why ordinary line diffs hide it.
2. The gap between formal contract diffing and raw value diffing.
3. Modeling observed paths, record coverage, null ratio, and heterogeneous arrays.
4. Why SchemaStory says “observed” and refuses to invent a compatibility score.
5. Privacy by data-model boundary: renderers never receive records.
6. Bounded JSONL streaming and honest truncation notices.
7. Turning transparent rules into local exploration and CI policy.
8. Known limitations and the feedback needed for v0.2.

## 30-second product introduction

> SchemaStory shows how real JSON changed when you do not have a reliable schema. Give it a before and after JSON or JSONL sample. It profiles the paths and types that actually appeared, then explains removals, incompatible types, coverage drops, new nulls, and additions. You get a readable terminal result, stable JSON for CI, or a standalone HTML report. It runs locally with zero runtime dependencies, and reports never contain raw values.

## Launch sequence

### Day 0 — Publish a complete repository

1. Create the public GitHub repository and push `main`.
2. Verify CI and badge URLs, then publish `v0.1.0`.
3. Share a concise post from the maintainer's own account with the visual demo and a concrete question: “What kind of JSON drift has broken your pipeline?”
4. Send it individually to 5–10 practitioners who actually work with event payloads or LLM traces. Ask for criticism, not stars.

### Days 1–3 — Earn trust

1. Respond to every reproducible issue with a synthetic regression test.
2. Publish one technical explanation of the privacy model and why reports exclude values.
3. Share only in communities where self-promotion is allowed and the problem is directly relevant. Tailor the example rather than cross-posting identical copy.
4. Label small, well-scoped issues as `good first issue` only after the expected behavior is clear.

### Days 4–14 — Convert feedback into proof

1. Prioritize installation failures, false positives, and confusing output above new formats.
2. Add one anonymized fixture category at a time based on real requests.
3. Publish a comparison or migration guide only where users repeatedly confuse SchemaStory with formal schema diff tools.
4. Track which examples lead to successful first runs; improve the top README section accordingly.

## Seven-day publishing rhythm

| Day | Action                                                                  | Evidence to collect                          |
| --: | ----------------------------------------------------------------------- | -------------------------------------------- |
|   1 | Publish repository, release, visual demo, and maintainer post.          | CI status, README first-run friction.        |
|   2 | Post Show HN if the maintainer can stay available for replies.          | Questions, misunderstood positioning.        |
|   3 | Write the privacy/model-boundary explanation.                           | Security concerns and trust signals.         |
|   4 | Share the event-stream example in one rule-compatible community.        | Reproducible rule counterexamples.           |
|   5 | Fix the highest-impact first-run problem and release a patch if needed. | Install and CLI-error reports.               |
|   6 | Publish the short demo and one before/after breakdown.                  | Completion and click-through differences.    |
|   7 | Summarize what changed from feedback and update the roadmap publicly.   | Repeat requests rather than raw vote totals. |

## Thirty-day iteration plan

### Week 1: reliability

- Triage every install, Windows path, parsing, and packaging failure first.
- Record first-run steps and elapsed time from voluntary issue reports.
- Add regression tests for every confirmed renderer privacy problem.

### Week 2: rule quality

- Group false positives by removal, type, coverage, and null rules.
- Publish a rule rationale and change thresholds only with fixtures.
- Decide whether ignore-path configuration is necessary for v0.2.

### Week 3: repeat use

- Interview or correspond with 3–5 users who ran a second comparison.
- Validate demand for reusable profiles, Markdown output, and CI annotations.
- Write one end-to-end integration guide for the most common repeat workflow.

### Week 4: choose, release, and report

- Select at most two v0.2 improvements based on repeated evidence.
- Ship a focused release with migration notes and updated demos.
- Publish a transparent month-one note: successful workflows, top failures, fixes, and deliberately rejected scope.
- Re-rank the roadmap; do not start hosted monitoring or plugin architecture without demand.

## Suggested launch post

> A string became an array in an event payload and the downstream failure showed up much later. I built SchemaStory to compare two real JSON/JSONL samples and explain structural drift — removed paths, type changes, coverage drops, and new nulls. It runs locally, has zero runtime dependencies, and its reports never include raw values. One command, with terminal/JSON/standalone HTML output. I would love blunt feedback on the rules and report clarity: [repository URL]

## Success measures

Stars are a distribution signal, not the product outcome. Track:

- successful quick-start runs reported by users;
- issues containing a minimal reproducible fixture;
- unique contributors and merged fixes;
- repeat users asking for CI/profile workflows;
- stars: 25 validates the message, 50 suggests repeatable interest, 100 is the first public milestone.

Do not add telemetry just to measure conversion. Use GitHub traffic, npm public download counts, and voluntary feedback.

## First-response playbook

- **False positive:** acknowledge the exact rule, ask for a synthetic boundary case, add a regression test before changing severity.
- **Missed change:** establish whether it is structural or value-semantic; keep semantic drift out of scope unless repeated evidence changes the roadmap.
- **Privacy concern:** reproduce with a recognizable canary value and test every renderer plus error output.
- **Format request:** ask for sample size, streaming constraints, and why conversion to JSONL is insufficient.
- **Feature idea:** capture the user workflow and desired decision before discussing implementation.
