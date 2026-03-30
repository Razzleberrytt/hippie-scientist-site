# Build and Verification Flow

This document is the contractor-facing source of truth for build, verification, and generated artifacts.

## 1) Script groups by purpose

### Data generation
- `npm run data:generate` (alias of `prebuild:data`): converts local CSV inputs and enrichment outputs into canonical JSON data.
- `npm run autofill:data`: fills missing non-critical herb fields.
- `npm run data:entity-payloads`: creates summary/detail entity payload shards in `public/data/*-summary.json` and `public/data/*-detail/`.
- `npm run data:refresh`: end-to-end local operator refresh (`data:generate` + `autofill:data` + `data:validate`).

### Prerender/publication
- `npm run build`: canonical production build entry point.
  - Lifecycle order: `prebuild` -> `build:compile` -> `postbuild`.
- `npm run prebuild`: generates data-derived publication inputs and feed artifacts.
- `npm run build:compile`: runs `vite build` only.
- `npm run postbuild`: runs static prerender + sitemap/robots generation + publishing/prerender verifications.

### Verification / quality gates
- `npm run data:validate`: schema + data audit checks for checked-in herb data.
- `npm run verify:prerender`: route-manifest and prerender consistency checks.
- `npm run verify:publishing`: publishing gate checks against indexable/publication manifests.
- `npm run verify:redirects`: confirms `dist/_redirects` is present.
- `npm run verify:build`: postbuild verification bundle (`verify:prerender` + `verify:publishing` + `verify:redirects`).

### Reporting
- `npm run data:report`: writes herb data coverage reports under `scripts/out/`.
- `npm run report:entity-route-payloads`: writes payload import-size report to `ops/reports/entity-route-payloads.json`.
- `npm run report:ops`: combined reporting helper (`data:report` + `report:entity-route-payloads`).

## 2) Required local workflow (recommended)

### Fast path (app + publication verification)
1. `npm ci`
2. `npm run build`
3. `npm run verify:build`

### Local operator data refresh path (only when CSV inputs are available)
1. `npm ci`
2. `npm run data:refresh`
3. `npm run build`
4. `npm run verify:build`
5. `npm run report:ops`

## 3) Generated artifact policy

### Must be committed (source-controlled generated artifacts)
These are runtime/publication inputs and must stay committed:
- `public/data/*.json` (including `quality-report.json`, `publication-manifest.json`, indexable lists, summaries)
- `public/data/herbs-detail/*.json` and `public/data/compounds-detail/*.json`
- `public/blogdata/**` (blog index and generated post metadata)
- `src/generated/site-counts.json` and `src/generated/homepage-data.json`
- `public/feed.xml` and `public/rss.xml`
- `public/sitemap.xml` and `public/robots.txt` (public-root crawl assets)

### Generated in CI/build only (do not commit)
- `dist/**` build output (including `dist/sitemap.xml`, `dist/robots.txt`, `dist/_redirects`, prerendered HTML, and verification artifacts)

### Reports/artifacts for diagnostics only (do not commit unless explicitly requested)
- `scripts/out/**` (`coverage.json`, `coverage.md`, `missing_key_fields.csv`)
- `ops/reports/*.json` (for example `entity-route-payloads.json`)

## 4) Consolidation notes applied

- `build` now relies on npm lifecycle hooks instead of manually invoking `prebuild` inside the script, preventing duplicate `prebuild` execution.
- Added explicit grouped entry points (`data:generate`, `data:validate`, `verify:build`, `report:ops`) while preserving existing script names for backward compatibility.
- `data:refresh+build` now uses canonical `npm run build` so local+build flow includes standard `prebuild/postbuild` publication checks.
