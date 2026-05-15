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

### Legacy component surfaces

Excluded examples include:

- `src/components/EffectExplorer.tsx`
- `src/components/EmailCapture.tsx`
- `src/components/NewsletterCard.tsx`
- `src/components/NewsletterSignup.tsx`
- `src/components/BlendSummaryCard.tsx`
- `src/components/HerbList.tsx`
- `src/components/QuickFillModal.tsx`
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
- `src/lib/herb-data.ts`
- `src/lib/data/herbs.ts`
- `src/types.ts`

Reasons:

- rely on deleted recommendation/enrichment schemas
- rely on removed analytics/event-storage systems
- duplicate workbook-driven runtime data systems
- predate the current static-export architecture

To revive:

- migrate to workbook-governed runtime payloads under `public/data/**`
- replace deleted utility dependencies with maintained runtime helpers
- rebuild types from current workbook/runtime contracts instead of restoring obsolete schemas

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
