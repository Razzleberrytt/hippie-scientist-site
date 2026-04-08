# Codex Type Repair Pass

## Root causes

- Shared data contracts drifted between summary/detail loaders and page consumers (`Herb`, `HerbSummary`, `CompoundRecord`, and related enrichment fields).
- Governed enrichment and research normalizers used nullable map/filter pipelines that leaked `null` into strict typed arrays.
- Legacy adapters/pages assumed optional fields (for example `researchEnrichmentSummary`, `activeConstituents`, `sourceCount`) without those fields being present in canonical shared types.
- A few strict-mode test and utility typing issues (mock `window.localStorage`, optional cleanup, ambient navigator hints) failed under current `tsconfig` strictness.

## Files changed

- `api/subscribe.ts`
- `src/__tests__/curatedProducts.test.ts`
- `src/components/AdvancedSearch.tsx`
- `src/components/detail/GovernedResearchSections.tsx`
- `src/hooks/useCompounds.ts`
- `src/lib/ambientEffects.ts`
- `src/lib/compound-data.ts`
- `src/lib/compoundHerbRelations.ts`
- `src/lib/fullCounts.ts`
- `src/lib/governedResearch.ts`
- `src/lib/herb-data.ts`
- `src/lib/researchEnrichment.ts`
- `src/pages/BlendView.tsx`
- `src/pages/CollectionPage.tsx`
- `src/pages/HerbDetail.tsx`
- `src/pages/InteractionsPage.tsx`
- `src/types.ts`
- `src/types/herb.ts`

## Remaining issues

- No remaining TypeScript errors on `npx tsc --noEmit` at the end of this pass.
- `npm run lint` passes; only tool/runtime warnings are emitted by npm/node/eslint regarding config/module metadata.
