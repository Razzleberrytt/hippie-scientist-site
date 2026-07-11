# Site Integration (Phase 6)

> Status: **adapter + comparison implemented**. The live site still reads the
> workbook-generated `public/data` (fallback kept) — the switch is deferred until
> derived fields reach parity (see gap below).

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

| Collection | Canonical | Site | Only in canonical | Only in site | Name changes |
|---|---|---|---|---|---|
| Herbs | 291 | 291 | 0 | 0 | 0 |
| Compounds | 565 | 565 | 0 | 0 | 0 |

**Slug sets and names match exactly** — the route contract
(`/herbs/:slug`, `/compounds/:slug`), canonical URLs, and sitemap membership are
fully preserved. Report: `data/generated/reports/site-comparison-latest.json`.

## Remaining parity gap (why we don't switch yet)

The adapter ports raw/source fields (name, summary, effects, mechanisms, dosage,
evidence grade, contraindications, tags, governance/legal status). It does **not**
yet reproduce these **derived** fields, which the 905-line workbook build computes
(indexability policy, mechanism normalization, evidence engine, affiliate/SEO):

- Herbs (10): `raw_mechanisms, mechanism_categories, mechanism_classes,
  mechanism_normalization_status, unmapped_mechanisms, affiliate_label,
  visibility_tier, robots, indexability_status, indexability_reasons`.
- Compounds (15): the above plus `allow_restricted_reference_export,
  regulatory_status, regulatory_federal, last_regulatory_check,
  regulatory_changelog`.

These are computed, not authored — porting them means moving the derivation
steps (indexability scorer, mechanism normalizer, meta builder) to run on
canonical data. Until then the workbook path remains the site's source and the
canonical export is a shadow output validated by the comparison.

## Recommended build flow (once parity closes)

```
validate canonical  (data:canonical:validate)
  → build SQLite     (data:build-db)
  → export site data (data:export → public/data)
  → next build
```

Cloudflare Pages never needs the workbook or a writable SQLite DB — all runtime
data is generated JSON produced before `next build`, exactly as today.

## Files created

- `scripts/data/canonical/site-export.mjs` — export adapter (deterministic, governed).
- `scripts/data/compare-site-output.mjs` — comparison report.
- `scripts/ci/validate-generated-freshness.mjs` — staleness guard.
- `data/generated/site/{herbs,compounds}.json` — committed canonical-derived export (un-ignored for review/diffing).
- npm scripts: `data:compare-site`, `data:site-pipeline`, `validate:generated-freshness`.

## Verification

Export + comparison run clean; slug/name parity is exact (0 unexplained losses);
freshness check passes; existing site build/tests unaffected (workbook path
untouched).
