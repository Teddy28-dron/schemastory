# Contributing to SchemaStory

Thanks for helping make unplanned data changes easier to understand. Small, focused contributions are especially welcome.

## Before opening an issue

- Search existing issues and the [roadmap](ROADMAP.md).
- Remove secrets and identifying data from every fixture.
- For a possible false positive, include the smallest synthetic before/after sample that reproduces it.
- For security or privacy vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Development setup

Requirements: Git and Node.js 22 or newer.

```bash
git clone https://github.com/Teddy28-dron/schemastory.git
cd schemastory
npm install
npm run check
```

Useful commands:

```bash
npm test                 # unit and CLI integration tests
npm run test:coverage   # Node's source coverage report
npm run lint            # ESLint
npm run format          # apply Prettier formatting
npm run demo            # rebuild examples/report.html
```

## Change workflow

1. Create a focused branch from `main`.
2. Add or update tests before changing a drift rule.
3. Keep runtime code dependency-free unless an issue has established a strong need.
4. Update user-facing docs and `CHANGELOG.md` for visible behavior changes.
5. Run `npm run check` and `npm pack --dry-run`.
6. Open a pull request using the repository template.

## Design principles

- Say **observed** when describing samples; do not imply a complete contract.
- Never add raw values, example values, hashes of values, or record contents to profiles or reports.
- Prefer transparent rules over opaque scores or heuristics.
- Keep results deterministic across operating systems.
- Turn expected user mistakes into short errors with a concrete next action.
- Preserve the `schemaVersion` contract or document a deliberate version change.

## Tests and fixtures

Tests use `node:test` and belong in `test/*.test.js`. Use generated, obviously synthetic values in fixtures. A rule test should cover the triggering boundary and at least one nearby non-triggering case when practical.

CLI tests should assert exit behavior and a small set of meaningful output fragments rather than copying a whole report snapshot.

## Commit and pull-request style

There is no required commit convention. Clear subjects such as `fix: avoid duplicate subtree removals` are helpful. Pull requests should explain the user problem, behavior before and after, privacy implications, and verification performed.

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Contributions are licensed under the repository's [MIT License](LICENSE).
