# Refactor Summary (Consolidation QA Pass)

## What changed

- Removed stale/dead migration adapter code and files that were no longer referenced by runtime routes:
  - Removed unused page variants (`HerbDetailView`, `HerbDetailPage`, `HerbCardPage`).
  - Removed deprecated herb adapter exports (`src/data/herbs/herbsfull.ts`, `src/data/index.ts`).
  - Removed unused legacy migration scripts tied to the old herb adapter chain.
- Corrected learning-path links to match currently available herb/compound/blog routes and data slugs.
- Code-split learning-path content by moving path data to `src/data/learning-paths.ts` and dynamically importing it from `src/pages/LearningPaths.tsx`.
- Tightened detail-page behavior:
  - Compound detail now waits for both herb + compound catalogs before rendering linked-herb routes.
  - Minor type cleanup in herb detail list handling.
- Cleaned unrelated foreign-project residue from repository root/docs (non-site config/doc artifacts).
- Updated README + data architecture docs to reflect the canonical herb/compound pipeline and current route behavior.

## Intentionally deferred

- `src/lib/data.ts` remains for legacy entity indexing and is still delegated to canonical herb loading.
- Analytics local-event legacy key migration in `src/utils/analytics/eventStorage.ts` remains in place for user storage continuity.
- Additional script-folder pruning was not fully exhaustive to avoid removing still-occasional operational scripts.

## Risky areas to smoke test manually

1. `/learning` path cards (all links and completion toggles).
2. `/compounds/:slug` pages that show “Found In” herb chips (verify final herb slugs).
3. `/herbs/:slug` render paths for edge-case records with sparse fields.
4. `/analytics` behavior in both dev and production-mode builds (with and without `VITE_ENABLE_ANALYTICS_ROUTE=true`).
5. Entity/browse pages that still rely on `src/lib/data.ts` output shape.
