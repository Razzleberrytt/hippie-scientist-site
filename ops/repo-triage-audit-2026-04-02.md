# Repo triage audit — 2026-04-02

## Scope inspected
- `package.json` build/prebuild/postbuild chain.
- `netlify.toml` deploy command/publish dir.
- `.github/workflows/deploy.yml` and `.github/workflows/data-audit.yml`.
- Data-generation and publication scripts:
  - `scripts/quality-gate-data.mjs`
  - `scripts/generate-homepage-data.mjs`
  - `scripts/generate-sitemap.mjs`
  - `scripts/generate-rss.mjs`
  - `scripts/sync-updated-datasets.mjs`
  - `scripts/dedupe-entities.mjs`
  - `scripts/generate-indexable-herbs.mjs`
  - `scripts/generate-indexable-compounds.mjs`
  - `scripts/verify-publishing.mjs`

## Root causes found
1. **Prebuild ordering was stale for publication consumers**
   - `generate-site-counts` and `generate-homepage-data` were run before data sync/dedupe/quality-gate/index generation.
   - This caused homepage + count artifacts to be built from stale/near-empty prior manifests.

2. **Source counting in quality-gate undercounted real citations**
   - `countSources` only considered `record.sources` array entries.
   - Citations in `source`, `references`, `citations`, or delimiter-joined strings were ignored.

3. **Missing publication index artifact**
   - `public/data/publication-index.json` was not generated in the pipeline.
   - Downstream systems had to rely directly on `publication-manifest.json` with no compact index fallback.

4. **Sitemap/homepage lacked publication-index fallback**
   - If manifest data is stale/empty for any run, these generators had no lightweight fallback path.

## Schema/data quality patterns observed
- High frequency placeholder/narrative weakness still exists in content corpus (especially compound descriptions), producing low indexable coverage in current gate.
- `nan/null/undefined` tokens still exist in source corpora and can leak to generated summaries without sanitization safeguards.

## Build/deploy blockers assessed
- Netlify command (`npm ci && npm run build`) is correct and lifecycle runs `prebuild`/`postbuild`.
- Deploy workflow triggers Netlify hook; generation quality depends on prebuild correctness.
- Current primary blocker was generation order, not Netlify config itself.

## Safe fixes implemented
1. Reordered `prebuild` so publication sources are generated first, then consumers:
   - sync → dedupe → quality-gate → publication-index/indexables/entity payloads → site counts/homepage/RSS.
2. Added `scripts/generate-publication-index.mjs` and wired it into `prebuild`.
3. Expanded source counting logic in `quality-gate-data.mjs` to include additional source field patterns.
4. Added publication-index fallback reads in:
   - `scripts/generate-homepage-data.mjs`
   - `scripts/generate-sitemap.mjs`
5. Hardened publication entry description fallback in quality-gate to avoid shipping placeholder-like description text.

## Remaining risks / follow-ups
- Compounds remain largely non-indexable due weak/placeholder descriptions in source corpus; this is a data enrichment issue, not a pipeline wiring issue.
- Consider a dedicated sanitizer pass before quality-gate for `nan/null/undefined` tokens across long-tail fields.
- Consider promoting richer source fields into canonical `sources` during merge so quality-gate is less inference-based.

## Exact commands to run next
```bash
npm ci
npm run prebuild
npm run build
npm run verify:publishing
npm run data:report
```
