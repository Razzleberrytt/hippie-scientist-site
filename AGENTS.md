# AGENTS.md

## Project guidance for coding agents

- Preserve route contracts:
  - `/herbs/:slug`
  - `/compounds/:slug`
  - `/goals/:slug`
- Prefer minimal, surgical changes.
- Treat `/public/data` as a core publish target.
- Validate slugs and required fields before writing JSON artifacts.
- Avoid replacing existing data pipelines when they can be extended.
- Keep changes small and easy to review.
- Run build checks after data-pipeline edits.
- Avoid unrelated refactors.
- Favor lean payloads for initial shipping.
