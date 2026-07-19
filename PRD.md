# SchemaStory Product Requirements

> Version target: 0.1.0  
> Status: Approved for implementation  
> Product statement: See how your real JSON shape changed — even when you never had a schema.

## 1. Target user

The primary user is a developer who consumes or maintains informal JSON/JSONL data: API snapshots, exports, crawler output, event streams, model output or agent traces. They have samples but no reliable formal schema.

## 2. Problem

Line diffs answer which values changed. They do not clearly answer whether a field disappeared, became nullable, changed type or stopped appearing in most records. Formal schema tools cannot help until a schema is created and maintained. Full data-quality platforms are disproportionate for a local, one-off compatibility review.

The dangerous failure mode is silent: downstream code keeps running while ignoring or misinterpreting changed records.

## 3. Core user journey

1. A developer finds SchemaStory after a parser breaks or before accepting a producer upgrade.
2. The README tells them it compares observed shape, keeps values out of reports and runs locally.
3. They run one `npx` command with an old and new JSON/JSONL sample.
4. SchemaStory reads both inputs and profiles paths, observed types, record coverage and null ratios.
5. The terminal immediately lists breaking, warning and informational changes.
6. The developer optionally writes a standalone HTML report for a PR or issue.
7. They add `--fail-on breaking` to CI if the result is useful.
8. They share or star the project because the report replaced a noisy manual explanation.

## 4. MVP scope

### P0 — required for product value

- Read `.json`, `.jsonl` and `.ndjson` from local paths.
- Treat a JSON array as a record collection and a JSON object/value as one record.
- Stream JSONL so typical log/trace files do not need to fit entirely in memory.
- Infer an observed profile for nested objects and arrays.
- Track field path, observed types, observation count, record coverage and null ratio.
- Compare profiles using transparent breaking/warning/info rules.
- Collapse redundant descendant additions/removals.
- Render readable terminal, stable JSON and standalone HTML output.
- Never include raw values in a report by default.
- Expose sample limits and truncation in every report.
- Provide CI policy exit codes through `--fail-on`.
- Work on Windows, macOS and Linux with Node.js 22+.
- Return actionable input/configuration errors.

### P1 — improves adoption after v0.1

- stdin support for one input.
- Config file for thresholds and ignored paths.
- Markdown output for PR comments.
- GitHub Action wrapper.
- CSV input for flat datasets.
- Machine-readable JSON Schema export labeled as “observed”, not authoritative.
- Rename hints when one path disappears and a statistically similar path appears.

### P2 — future exploration

- Plugin API for new input adapters and rule packs.
- Compare stored privacy-safe profiles instead of raw data.
- Directory/batch comparison.
- Optional schema validation when a formal JSON Schema exists.
- A browser-only drag-and-drop build.

### Explicitly not doing

- Database or warehouse connections.
- Cloud accounts, hosted dashboards or telemetry.
- Statistical/ML distribution drift.
- PII/secret detection or data anonymization.
- Showing representative raw values by default.
- Automatically changing producer or consumer code.
- Claiming that samples constitute a complete contract.

## 5. Change rules

Rules must be deterministic and visible in documentation.

| Change                                               | Default severity | Rationale                                                      |
| ---------------------------------------------------- | ---------------- | -------------------------------------------------------------- |
| Observed path removed                                | Breaking         | Existing consumers may access it                               |
| Previously observed non-null type no longer accepted | Breaking         | Existing values and new values are structurally incompatible   |
| `integer` widens to `number`                         | Info             | Integers remain valid numbers                                  |
| New non-null type appears                            | Warning          | Consumers may not handle the union                             |
| `null` becomes observed                              | Warning          | Non-null assumptions may fail                                  |
| Field coverage drops by configured threshold         | Warning          | Field became materially sparser                                |
| Near-universal field drops below 50% coverage        | Breaking         | Strong signal of contract loss, still labeled observed         |
| Null ratio rises by configured threshold             | Warning          | Existing nullable fields can degrade without a type-set change |
| New path appears                                     | Info             | Usually backwards compatible                                   |
| Type narrows only by losing `null`                   | Info             | Consumers accepting nullable values remain compatible          |

Default coverage and null-ratio thresholds are 0.20 (20 percentage points).

## 6. CLI contract

```text
schemastory [options] <before.json|jsonl> <after.json|jsonl>

Options:
  -f, --format <terminal|json|html>
  -o, --output <path>
      --max-records <number>
      --max-depth <number>
      --coverage-threshold <0..1>
      --null-threshold <0..1>
      --fail-on <breaking|warning|never>
      --open
      --no-color
  -h, --help
  -v, --version
```

Exit codes:

- `0`: analysis completed and the configured policy passed;
- `1`: analysis completed and changes met the configured `--fail-on` policy;
- `2`: invalid arguments, unreadable input or malformed data.

The exploratory default is `--fail-on never`. CI users must opt into policy failure explicitly.

## 7. Success criteria

| Metric                                      | v0.1 target                                                         |
| ------------------------------------------- | ------------------------------------------------------------------- |
| Time from README to first sample report     | Under 3 minutes                                                     |
| Installation steps                          | One `npx` command or one dev dependency install                     |
| Core task time on bundled example           | Under 2 seconds on a typical laptop                                 |
| Paid services required                      | None                                                                |
| Network required after package installation | None                                                                |
| Supported platforms                         | Windows, macOS, Linux                                               |
| Demo clarity                                | A 15–30 second before/diff/after sequence communicates value        |
| Privacy                                     | Generated reports contain no input values in default mode           |
| CI integration                              | One documented command with deterministic exit behavior             |
| Tutorial fit                                | English README plus Chinese translation, copy-paste commands tested |

Performance targets are acceptance targets, not claimed benchmark results until measured.

## 8. Acceptance examples

Given v1 records where `message.content` is always a string and v2 records where it is always an array, the report must include a breaking type change at `$.message.content`.

Given a field present in every v1 record and 70% of v2 records, the default report must include a warning coverage drop.

Given values such as emails, API-like tokens or names, no input value may appear in terminal, JSON or HTML output.

Given malformed JSONL on line 8, the CLI must identify the file and line and suggest correcting the record.

Given more records than `--max-records`, the report must show that sampling was truncated.

## 9. Product risks and mitigations

| Risk                                         | Mitigation                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Sample absence mistaken for contract removal | Use “observed” language, always show sample counts, document inference limits                  |
| Sparse/small samples create noise            | Show coverage and counts; provide thresholds; do not emit opaque confidence scores             |
| Heterogeneous arrays explode the path tree   | Limit depth, field count and records; aggregate array items under `[]`                         |
| Raw data leaks through errors or reports     | Error messages include location, never the offending record contents; privacy regression tests |
| CLI becomes another data platform            | Enforce explicit non-goals and adapter-based roadmap                                           |
