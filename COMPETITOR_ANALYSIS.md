# Competitor Analysis

> Product: SchemaStory  
> Snapshot: 2026-07-19  
> Status: MVP direction approved

## Product boundary

SchemaStory compares two collections of real JSON or JSONL records and reports how their **observed structure** changed. It does not require a formal schema and does not expose raw values in its reports.

This creates a narrow category between three established groups:

1. value-oriented JSON/YAML diff tools;
2. formal JSON Schema or OpenAPI compatibility tools;
3. data-quality and statistical-drift platforms.

## Evidence of demand

- [Claude Code issue #53516](https://github.com/anthropics/claude-code/issues/53516) describes downstream tooling silently mis-parsing JSONL after the producer changes record shapes. The request explicitly asks for consumers to fail loudly on drift.
- [Hugging Face Datasets issue #7322](https://github.com/huggingface/datasets/issues/7322) shows heterogeneous nested objects being coerced into a unified schema, introducing misleading nulls and breaking downstream logic.
- [Spark BigQuery Connector documentation](https://github.com/GoogleCloudDataproc/spark-bigquery-connector) documents type-mismatch failures and protections against accidental schema drift.
- Mature adjacent tools demonstrate that developers already spend time on structural diffs and data drift; the opportunity is a substantially smaller first-use path.

## Comparison table

| Project                                                                         | Core positioning                                      | Strengths                                        | Limitations for our target workflow                                                                          | Activity snapshot                                                   | What to learn                                   | What to avoid                                   | SchemaStory opportunity                               |
| ------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| [dyff](https://github.com/homeport/dyff)                                        | Structure-aware YAML/JSON document diff               | Compact paths, stdin support, single binary      | Compares concrete values in two documents; does not infer occurrence/type behavior across record collections | Package documentation updated in 2026                               | Concise path language and excellent terminal UX | Another prettier value diff                     | Compare observed contracts, never values              |
| [json-schema-diff](https://www.npmjs.com/package/json-schema-diff)              | Compatibility diff for two JSON Schemas               | Semantic change classification and CI fit        | Requires maintained schemas before it can help                                                               | Package history still visible in 2026                               | Breaking/non-breaking vocabulary                | Claiming sample inference is a formal schema    | Serve teams precisely when no schema exists           |
| [oasdiff](https://github.com/oasdiff/oasdiff)                                   | OpenAPI diff, breaking changes and changelog          | Mature CLI, Git integration, rich formats        | Only applies to formal OpenAPI contracts                                                                     | Actively documented and released                                    | Multiple output formats and transparent rules   | Becoming an API lifecycle platform              | Cover exports, traces and informal payloads           |
| [YData Profiling](https://github.com/Data-Centric-AI-Community/ydata-profiling) | Broad DataFrame profiling and comparison              | Rich visual reports and dataset comparison       | Python/DataFrame setup, broad EDA output, nested JSON is not the shortest path                               | Package/community transition visible in 2026                        | Standalone HTML and reproducibility metadata    | A dashboard full of unrelated statistics        | Answer only “what shape changed and can it break me?” |
| [Evidently](https://github.com/evidentlyai/evidently)                           | ML/LLM evaluation, data quality and statistical drift | Large metric catalog, reports, tests, monitoring | Heavier installation and an ML/observability mental model                                                    | GitHub listed a March 2026 release during research                  | Reports plus explicit test thresholds           | Monitoring services and statistical drift in v1 | Zero-config, one-off nested JSON contract review      |
| [whylogs](https://github.com/whylabs/whylogs)                                   | Privacy-preserving data profiles and drift            | Mergeable profiles and scalable summaries        | Library-centered workflow; broad ML/data focus                                                               | Public and usable; maintenance cadence needs re-check before launch | Aggregate rather than reveal raw values         | Promising big-data scale in MVP                 | Privacy-safe structural aggregates by default         |
| [Great Expectations](https://github.com/great-expectations/great_expectations)  | Comprehensive expectation-based data quality          | Mature ecosystem and expressive validation       | Requires expectation/configuration lifecycle and wider platform concepts                                     | Official 2026 documentation remains active                          | Clear validation language                       | A configuration platform                        | Useful first report before users author any rule      |

## Why users would choose SchemaStory

| User question                                              | Existing route                                      | SchemaStory route                                   |
| ---------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| “Did any nested JSON field disappear?”                     | Read a noisy value diff or author a schema          | Compare two samples directly                        |
| “Did a field become nullable or change type?”              | Write custom scripts or adopt a profiling framework | See a risk-ranked change card                       |
| “Can I attach the result without sharing customer values?” | Manually sanitize screenshots/reports               | Reports contain aggregate structure only by default |
| “Can CI stop on breaking structural drift?”                | Build a custom schema pipeline                      | `--fail-on breaking`                                |
| “Can a reviewer understand it without Python/Jupyter?”     | Export and explain a notebook                       | Open one standalone HTML file                       |

## Competitive risks

1. YData Profiling, Evidently or whylogs could add a smaller CLI path.
2. A JSON Schema inference tool could add compatibility comparison.
3. Users with strong data contracts should continue to prefer formal schema validation.
4. If reports include statistical distributions, raw examples or monitoring, positioning becomes indistinct.

## Defensible focus

- Use “observed contract” consistently; never imply complete schema knowledge.
- Treat nested arrays and heterogeneous records as first-class input.
- Keep output privacy-safe: paths, type counts, record coverage and null ratios only.
- Make the report itself an excellent PR/issue artifact.
- Keep the core deterministic and dependency-light so contributors can audit every rule.

## Validation still required after v0.1.0

- Interview or observe 5–8 maintainers who consume informal JSON/JSONL.
- Ask for the last real drift incident and collect anonymized fixtures.
- Track false positives, especially arrays, sparse fields and small samples.
- Measure whether a new user can produce and understand a report in under three minutes.
- Re-check GitHub/npm naming and competitor releases immediately before public launch.
