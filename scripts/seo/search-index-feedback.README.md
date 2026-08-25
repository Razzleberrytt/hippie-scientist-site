# Search index feedback loop

This layer turns observed search-engine crawl/index-selection outcomes into **read-only evidence for enrichment priority**.

It does not change robots, canonicals, sitemap inclusion, publication state, or scientific content.

## Inputs

`data-sources/search-index-observations.json` is the durable operator/automation input. Each observation records:

- `engine`
- `status`
- canonical `url`
- `observed_at`
- `source`
- `active`

The top-level `version` describes the observation-file schema, not the freshness of its measurements. Increment it only when the schema contract changes; newer measurements are represented by new `observed_at` values.

Observation URLs should be canonical `https://thehippiescientist.net/` URLs. The reconciliation layer normalizes site paths for reporting, while enrichment mapping deliberately recognizes only exact herb/compound profile routes.

Supported priority statuses are defined once in `scripts/enrichment-pipeline/contract/priority-config.json`.

Current mappings:

- `content_quality` → strongest enrichment-priority signal
- `discovered_but_not_in_index` → strong enrichment-priority signal
- `not_yet_crawled` → weaker crawl-allocation signal
- `indexed` → explicit zero rejection signal

For the enrichment queue, only exact `/herbs/<slug>/` and `/compounds/<slug>/` observations map to canonical entities. Other routes remain visible in the reconciliation report but cannot accidentally affect entity research jobs.

## Reconciliation workflow

After a production build:

```bash
npm run build
npm run audit:profile-publication
node scripts/seo/index-quality-shadow.mjs
node scripts/seo/search-index-feedback.mjs
```

Outputs:

- `ops/reports/search-index-feedback.json`
- `ops/reports/search-index-feedback.md`

The report distinguishes:

- external rejection + internal shadow failure (`AGREEMENT_HIGH_PRIORITY`)
- external rejection + internal pass (`EXTERNAL_INTERNAL_DISAGREEMENT`)
- crawl allocation (`CRAWL_ATTENTION`)
- shadow weakness on a page the engine says is indexed (`SHADOW_ONLY_INDEXED`)

## Enrichment priority behavior

`search_index_feedback` is an optional value signal in the existing enrichment priority engine. The pre-existing weights are uniformly scaled by `0.92` and the new signal receives `0.08`. When an entity has no active search-index observation, the engine renormalizes the remaining weights back to the exact legacy ratios, preventing queue churn for the rest of the corpus.

When a new observation is added for a profile, the latest active observation wins. Equal-date observations conservatively retain the stronger rejection. No time-decay value is invented; stale observations should be superseded or marked inactive when newer evidence arrives.

## Guardrail

External search-engine rejection is evidence for **what to investigate or enrich**, not permission to hide a page. Any future publication-gate change requires separate longitudinal validation and its own reviewed change.
