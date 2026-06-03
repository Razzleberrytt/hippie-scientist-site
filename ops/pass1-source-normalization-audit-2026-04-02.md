# Pass 1 Audit: canonical data flow + source counting

## Canonical data flow (current repo)

1. **Raw input sync**: `scripts/sync-updated-datasets.mjs` copies `*_combined_updated.json` into `public/data/herbs.json` and `public/data/compounds.json` (plus `*_combined_updated.json` mirrors).  
2. **Normalization/dedupe layer**: `scripts/dedupe-entities.mjs` deduplicates `public/data/herbs.json` and `public/data/compounds.json` in place.  
3. **Quality/index gating**: `scripts/quality-gate-data.mjs` reads `public/data/herbs.json` + `public/data/compounds.json`, then writes:
   - `public/data/publication-manifest.json`
   - `public/data/indexable-herbs.json`
   - `public/data/indexable-compounds.json`
   - `public/data/quality-report.json`
4. **Publication index**: `scripts/generate-publication-index.mjs` derives `public/data/publication-index.json` from `publication-manifest.json`.  
5. **Homepage payload**: `scripts/generate-homepage-data.mjs` reads the gated/index files and writes `src/generated/homepage-data.json`.

## Pass 1 source-counting fix scope applied

- Unified homepage source scoring/buckets to use the same normalized source inputs (`sources`, `source`, `references`, `citations`) instead of only `sources`.
- Updated dedupe completeness scoring to use normalized bootstrap source counting.
- Updated route-manifest fallback scoring to use normalized bootstrap source counting.

## Next steps (Pass 2/3)

1. Add targeted sanitization pass for junk marker values and placeholder boilerplate.
2. Re-run and compare before/after gate and blank-field counts after sanitization.
3. Validate publication/homepage/sitemap outputs after sanitized regeneration.
