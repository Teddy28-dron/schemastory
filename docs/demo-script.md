# 30-second demo recording

Record at 1280×720 or larger with a large terminal font. Use the synthetic files in `examples/`; do not record personal paths, shell history, notifications, or credentials.

## Preparation

```bash
npm install
npm run demo
```

Open one terminal in the repository root and have `examples/report.html` ready in a browser. Hide bookmarks and unrelated tabs.

## Shot list

|   Time | Action                                                                              | Caption                                           |
| -----: | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
|   0–4s | Show a short excerpt from `examples/v1.jsonl` and `examples/v2.jsonl`.              | “Your data changed. There was no schema.”         |
|  4–12s | Run `node ./bin/schemastory.js ./examples/v1.jsonl ./examples/v2.jsonl --no-color`. | “Compare real JSON/JSONL samples locally.”        |
| 12–20s | Pause on `$.message.content`, `$.sessionId`, and `$.usage`.                         | “Types, removed paths, coverage, and null drift.” |
| 20–28s | Switch to the HTML report and click Breaking, Warning, then search `usage`.         | “Share one standalone report — no raw values.”    |
| 28–32s | End on the repository name and quick-start command.                                 | “npx schemastory before.jsonl after.jsonl”        |

Export as an optimized MP4 and a GIF under 8 MiB. Review the final recording frame by frame for private information before publishing.
