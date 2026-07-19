# Security Policy

## Supported versions

SchemaStory is pre-1.0. Security fixes are applied to the latest published minor release.

| Version        | Supported |
| -------------- | --------- |
| Latest `0.x`   | Yes       |
| Older releases | No        |

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability or privacy leak.

After the GitHub repository is published, use **Security → Report a vulnerability** to send a private advisory to the maintainers. Until that channel is configured, do not send sensitive reproduction data; open a minimal public issue asking for a private contact channel without including exploit details.

Include, when safe:

- affected version and operating system;
- the smallest synthetic reproduction;
- expected and actual impact;
- whether input values can appear in terminal, JSON, HTML, errors, or filenames;
- any suggested mitigation.

Maintainers should acknowledge a complete report within 7 days, provide an initial assessment within 14 days, and coordinate disclosure after a fix is available. These are response goals, not a service-level agreement.

## Security boundaries

SchemaStory parses untrusted local files. It limits JSON size, sampled records, traversal depth, and observed paths, but it is not a sandbox. Run it with the same care as other local data-processing tools.

Reports intentionally exclude raw values. They can include input basenames, JSON paths, aggregate counts, inferred types, timestamps, and tool metadata. HTML output is self-contained and escapes user-derived text. Runtime code performs no network requests.
