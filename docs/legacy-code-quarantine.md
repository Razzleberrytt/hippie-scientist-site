# Legacy Code Quarantine

This repository intentionally quarantines a set of legacy `src/**` modules from the active TypeScript compilation.

The current production MVP is centered around:

- `app/**`
- `components/**`
- `lib/**`
- `data/**`
- active `src/lib/runtime-*.ts` modules

The quarantined files below belong to removed or deferred systems documented in the README:

- legacy lead capture
- affiliate/product modules
- governed enrichment tooling
- effect-search experiments
- old client-router UI surfaces
- deprecated analytics/tracking experiments
- duplicate pre-workbook data loaders

## Quarantined paths

### Legacy App Router predecessor pages

Excluded:

- `src/pages/**`

Reasons:

- legacy pre-App Router route tree
- not used by the current Next.js App Router runtime
- imports quarantined enrichment/data systems which pull deferred modules back into TypeScript compilation
- preserving these pages in the active type graph causes excluded legacy modules to be reintroduced through import reachability

To revive:

- migrate route logic into `app/**`
- reconnect only to workbook/runtime-backed data helpers
- remove imports to quarantined enrichment and legacy data loaders

### Legacy component surfaces

Excluded examples include:

- `src/components/AdvancedSearch.tsx`
- `src/components/CategoryAnalytics.tsx`
- `src/components/CategoryFilter.tsx`
- `src/components/EffectExplorer.tsx`
- `src/components/EmailCapture.tsx`
- `src/components/NewsletterCard.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/components/BlendSummaryCard.tsx`
- `src/components/HerbList.tsx`
- `src/components/QuickFillModal.tsx`
- `src/components/ShareInsightCard.tsx`
- `src/components/cta/**`
- `src/components/detail/**`
- `src/components/filters/**`
- `src/components/interactions/**`
- `src/components/trust/**`

Reasons:

- depend on deleted `@/utils/*` helpers
- depend on deleted `@/hooks/*` lead-capture flows
- depend on removed `@/data/*` affiliate/product datasets
- depend on removed governed-enrichment schemas
- not reachable from active App Router pages
- imported quarantined legacy data hooks such as `@/lib/herb-data` and analytics modules such as `@/lib/growth`
- acted as import-chain parents that reintroduced quarantined files into TypeScript despite direct excludes

To revive:

- reconnect through workbook-generated runtime data
- rebuild utilities against active runtime APIs
- replace deleted schemas/types with current canonical runtime contracts
- verify import reachability from `app/**`

### Legacy library/data surfaces

Excluded examples include:

- `src/lib/curatedProducts.ts`
- `src/lib/governedCta.ts`
- `src/lib/governedResearch.ts`
- `src/lib/researchEnrichment.ts`
- `src/lib/herbRecommendations.ts`
- `src/lib/compound-data.ts`
- `src/lib/compoundHerbRelations.ts`
- `src/lib/governedCollectionIntro.ts`
- `src/lib/herb-data.ts`
- `src/lib/data/herbs.ts`
- `src/types.ts`

The latest remaining TypeScript quarantine gap pass explicitly confirms these deferred `src`-era modules are excluded from active type checking:

- `src/lib/compound-data.ts`
- `src/lib/data.ts`
- `src/lib/growth.ts`
- `src/lib/herb-data.ts`
- `src/lib/herbProducts.ts`
- `src/lib/interactionSeed.ts`
- `src/lib/researchEnrichment.ts`
- `src/types.ts`

Reasons:

- rely on deleted recommendation/enrichment schemas
- rely on removed analytics/event-storage systems
- duplicate workbook-driven runtime data systems
- predate the current static-export architecture
- some files act as import-chain parents that pull quarantined modules back into TypeScript despite direct excludes
- the remaining gap files depend on removed legacy modules and types such as `@/utils/calculateConfidence`, `@/utils/sanitizeData`, `@/types/enrichmentDiscovery`, `@/types/researchEnrichment`, `@/types/herb`, `../types/compound`, `@/utils/storageState`, `@/data/herbProducts`, `@/data/interactionTags.seed`, and `@/utils/interactions/interactionTagUtils`

To revive:

- migrate to workbook-governed runtime payloads under `public/data/**`
- replace deleted utility dependencies with maintained runtime helpers
- rebuild types from current workbook/runtime contracts instead of restoring obsolete schemas

## Import reachability rule

Excluding a file directly in `tsconfig.json` is insufficient if an active checked file imports it.

Before adding or keeping a quarantine entry, verify that no active checked surface imports it, including:

- `app/**`
- `components/**`
- `lib/**`
- `data/**`
- `scripts/data/**`
- active `src/lib/runtime-*.ts`
- active `src/components` navigation files

If an active checked file imports a quarantined module, either replace that import with the active workbook/runtime data source or quarantine the importing file only when that importing file is also clearly legacy/deferred.

## Important constraints

These exclusions are intentionally narrow.

The following remain type-checked and must stay active:

- `app/**`
- `components/**`
- `lib/**`
- active static-export runtime modules
- sitemap/robots/SEO infrastructure
- current data-build pipeline integration points

Do not broaden the quarantine without confirming a file is unreachable from the active App Router runtime.
