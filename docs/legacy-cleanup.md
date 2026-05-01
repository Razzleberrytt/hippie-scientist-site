# Legacy Cleanup Summary

## Active MVP baseline

- Runtime architecture is Next.js App Router static export to `out/` for Cloudflare Pages.
- Workbook remains the only source of truth; generated JSON is disposable output.

## Removed/archived/deferred from active MVP

The following feature groups are **not active MVP production behavior** and are treated as removed, archived, or deferred:

- Lead capture flows (`EmailCapture`, `useSubmissionForm`-driven legacy capture UI)
- Product and affiliate modules
- Recommendation modules
- Graph/relevance experiences
- Effect search explorer patterns
- Governed enrichment authoring/runtime tooling
- Dev analytics viewer patterns
- Old SPA-era Vite/React Router entrypoint assumptions

## Cleanup approach used

- Missing/broken legacy dependencies were resolved by deletion, quarantine, or minimal data-free helper shims only when required for active build health.
- No fake data sources were recreated.
- No deleted legacy data modules were restored.
