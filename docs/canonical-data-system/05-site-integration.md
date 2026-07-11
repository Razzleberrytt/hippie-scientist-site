# Site Integration (Phase 6, + derived-field parity follow-up)

> Status: **full field parity achieved**. The canonical export now reproduces the
> live `public/data` records exactly (slugs, names, and all tracked derived
> fields). The workbook path is retained as a fallback; switching the site over is
> now a safe, mechanical change (swap the export target to `public/data`).

## Goal

Convert canonical entities/claims/relationships into the exact record shape the
Next.js site consumes, **without changing URLs or visible content**, and prove
via a comparison report that there are no unexplained losses before switching.

## Export adapter

`scripts/data/canonical/site-export.mjs` maps canonical `herb`/`compound`
entities into the `public/data/herbs.json` record shape:

- Deterministic: sorted by slug, stable key set, **no wall-clock timestamps**
  (fixed `last_updated`), so files change only when data changes.
- Governance mirror: drops the same restricted substances the current runtime
  drops (term list + explicit Schedule I / controlled-substance flag). Prose like
  "not a controlled substance" is never substring-matched.
- Writes to `data/generated/site/{herbs,compounds}.json` — **does not** overwrite
  `public/data` (the workbook path stays authoritative).

```bash
npm run data:export                  # write data/generated/site/*.json
npm run data:compare-site            # comparison report vs public/data
npm run validate:generated-freshness # fail if the export is stale vs canonical
npm run data:site-pipeline           # validate canonical → build SQLite → export
```

## Comparison result (canonical export vs live `public/data`)

| Collection | Canonical | Site | Only in canonical | Only in site | Name changes | Fields not ported | Value parity |
|---|---|---|---|---|---|---|---|
| Herbs | 291 | 291 | 0 | 0 | 0 | 0 | **22/22 exact** |
| Compounds | 565 | 565 | 0 | 0 | 0 | 0 | **22/22 exact** |

Slug sets, names, and every tracked field match exactly. The comparison now does
**value-level diffing** (order-insensitive for arrays) across 22 key fields —
name, summary, evidence grade/tier, dosage, all mechanism fields, indexability
status/score/reasons, robots, visibility tier, affiliate label, regulatory
fields — and reports **zero mismatches**. Report:
`data/generated/reports/site-comparison-latest.json`.

## How the derived fields are reproduced (parity follow-up)

The derived fields the 905-line workbook build computes are now reproduced by a
shared derivation module (`scripts/data/canonical/derive.mjs`) that the export
adapter uses:

- **Mechanism normalization** — the 53 canonical-mechanism rows
  (`Taxonomy_Rules` where `source_table = Canonical_Mechanisms`) are migrated into
  `mechanism` entities; the adapter rebuilds the alias→mechanism map and runs the
  same `normalizeMechanisms` to derive `raw_mechanisms`, `canonical_mechanisms`,
  `mechanism_categories`, `mechanism_classes`, `mechanism_target_systems`,
  `mechanism_normalization_status`, `unmapped_mechanisms`.
- **Indexability / visibility** — reuses the existing `scoreIndexability` policy
  module with a base assembled from canonical data, producing identical
  `visibility_tier`, `robots`, `sitemap_included`, `indexability_status`,
  `indexability_score`, `indexability_reasons`.
- **User-facing text hygiene** — the same leaked-pipeline-text filter + fallback
  is applied to `summary`/`description`, so suppressed text matches the live site.
- **Regulatory / affiliate / evidence detail fields** — mapped from the
  provenance-preserving `legacy` blob captured at migration.
- **Per-type field sets** — compound-only fields
  (`allow_restricted_reference_export`, `regulatory_federal`,
  `last_regulatory_check`, `regulatory_changelog`) are omitted from herb records,
  matching the workbook build's runtime field whitelist.

To guarantee no drift, the string tokenizers (`clean`/`splitList`/`uniqueList`/
`normalizeAlias`), the mechanism normalizer, the leak filter, and the visibility
wrapper are faithful copies of the workbook build's, and the indexability step
imports the same policy module.

## Recommended build flow (once parity closes)

```
validate canonical  (data:canonical:validate)
  → build SQLite     (data:build-db)
  → export site data (data:export → public/data)
  → next build
```

Cloudflare Pages never needs the workbook or a writable SQLite DB — all runtime
data is generated JSON produced before `next build`, exactly as today.

## Files created / changed

- `scripts/data/canonical/site-export.mjs` — export adapter (deterministic, governed, derived-field-complete).
- `scripts/data/canonical/derive.mjs` — shared derivation module (mechanism normalization, indexability/visibility, text hygiene).
- `scripts/data/canonical/workbook-map.mjs` — migrates the 53 canonical-mechanism rows into `mechanism` entities.
- `scripts/data/compare-site-output.mjs` — comparison report with value-level parity diffing.
- `scripts/ci/validate-generated-freshness.mjs` — staleness guard.
- `data/generated/site/{herbs,compounds}.json` — committed canonical-derived export (un-ignored for review/diffing).
- `data/canonical/entities/mechanism.jsonl` — 53 migrated mechanism entities.
- npm scripts: `data:compare-site`, `data:site-pipeline`, `validate:generated-freshness`.

## Verification

Export + comparison run clean; **exact slug/name/value parity (22/22 fields) with
zero mismatches**; 0 fields unported; freshness check passes; canonical validation
(1677 entities) + full test suite (553) + production build all green; existing
workbook path untouched.
