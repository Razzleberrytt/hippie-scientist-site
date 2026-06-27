# Missing Import Resolution (MVP Cleanup)

## Resolution policy

Missing imports were resolved without recreating fake data systems.

Accepted resolution patterns:

- Delete dead/legacy code paths that are out of MVP scope.
- Quarantine legacy modules that are not part of active App Router routes.
- Add minimal pure helpers only when required to unblock active build/type checks.
- Access runtime generated data via existing active data-access patterns.

## Explicit non-goals

- No restoration of deleted hand-authored duplicate data sources.
- No manual edits in `public/data/**`.
- No recreation of legacy recommendation/product/lead-capture ecosystems just to satisfy stale imports.

## Source-of-truth ownership

If a data/content error is discovered, classify it as:

- `WORKBOOK_FIX`
- `WORKBOOK_GPT_FIX`
- `GENERATOR_FIX`

Do not patch generated JSON directly.
