# SchemaStory Roadmap

The roadmap is intentionally outcome-based. Items may move after real user feedback.

## 0.1.0 — First useful release

- JSON, JSONL and NDJSON input.
- Bounded observed structure profiles.
- Breaking/warning/info comparison rules.
- Terminal, JSON and standalone HTML reports.
- Privacy-safe reports with no raw values.
- CI-friendly policy exits.
- Cross-platform package, tests, examples and documentation.

## 0.2 — Adoption fixes

- Address installation failures and false positives reported by first users.
- Ignore-path and threshold configuration file.
- Markdown output for PR/issue comments.
- Stored privacy-safe profiles for comparing runs without retaining raw data.
- Expanded heterogeneous-array fixtures.

## 0.3 — Integrations

- Official GitHub Action.
- CSV adapter for flat datasets.
- Directory/batch comparison.
- Optional formal JSON Schema validation alongside observed drift.

## Later, only with demand

- Browser-only drag-and-drop build.
- Plugin API for adapters and rules.
- Rename suggestions with explicit uncertainty.
- Additional formats such as YAML streams or Parquet metadata.

## Not on the roadmap

- Hosted monitoring service.
- Database credentials and warehouse connectors.
- ML model monitoring or statistical distribution drift.
- AI-generated root-cause explanations.
- Automatic mutation of production data.
