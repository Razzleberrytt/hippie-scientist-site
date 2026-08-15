# Backlog 816 — Weekly content-integrity checks

Status: implemented.

The `Weekly Content Integrity` GitHub Actions workflow runs every Tuesday at 06:20 UTC and can also be dispatched manually.

It reuses the repository's canonical audits rather than creating another validation stack:

- `npm run audit:content`
- `npm run gate:content-quality`
- `npm run audit:citation-density`
- `npm run audit:leaked-text`

Generated audit artifacts are retained for 30 days. Any failing audit fails the workflow so content regressions become visible without waiting for a production deployment.
