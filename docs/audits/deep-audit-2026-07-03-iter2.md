# Deep Audit Report — July 3, 2026 — Iteration 2

Source archive: `hippie-scientist-site-main-34-deep-audited-clean.zip`  
Patched archive target: `hippie-scientist-site-main-34-deep-audited-iter2.zip`

## Executive Summary

This second pass focused on issues that remained after the first cleanup: runtime privacy behavior, TypeScript coverage gaps, generated data consistency, and stale handoff tooling.

### High-confidence changes applied

- Fixed analytics consent behavior:
  - Removed unconditional GA4 and Ahrefs script injection from `app/layout.tsx`.
  - Mounted the existing `ConsentBanner` from the root layout so visitors can grant or deny analytics.
  - Added `'use client'` to `src/components/ConsentBanner.tsx` because it is now imported from a Server Component boundary.
  - Updated `src/lib/loadAnalytics.ts` so both GA4 and Ahrefs load only after stored visitor consent is `granted`.
  - Removed the hardcoded Ahrefs fallback key; Ahrefs now requires `NEXT_PUBLIC_AHREFS_ANALYTICS_KEY`.
  - Updated `.env.example` and `docs/security-headers.md` to match the consent-gated model.
- Fixed TypeScript audit coverage:
  - Removed `src/lib/consent.ts` and `src/lib/loadAnalytics.ts` from `tsconfig.json` exclusions because both are reachable from the active App Router layout through the footer/privacy flow.
  - Custom reachability scan now reports **0 active reachable files excluded from TypeScript**.
  - Custom active import scan now reports **0 unresolved local imports** outside expected generated `.content-collections` paths.
- Fixed generated runtime data consistency:
  - `public/data/herbs.json` had 290 herbs, but `public/data/herbs-detail/` had only 287 detail payloads.
  - Updated `scripts/data/apply-governance-overlay.mjs` so future data builds create missing plural detail files from canonical flat records without fabricating claims or citations.
  - Added detail payloads for:
    - `capsicum-frutescens`
    - `citicoline`
    - `withania-somnifera`
- Refreshed derived runtime artifacts after the governance overlay:
  - summary indexes
  - runtime route manifests
  - sitemap chunk manifest
  - export batch manifest
  - semantic snapshots
  - indexability summary
  - governance overlay report
- Updated the Codex replacement prompt to reference the new iteration-2 zip.

## Files changed

### Application/runtime

- `app/layout.tsx`
- `src/components/ConsentBanner.tsx`
- `src/lib/loadAnalytics.ts`
- `tsconfig.json`

### Data/governance

- `scripts/data/apply-governance-overlay.mjs`
- `public/data/herbs-detail/capsicum-frutescens.json`
- `public/data/herbs-detail/citicoline.json`
- `public/data/herbs-detail/withania-somnifera.json`
- `public/data/herbs.json`
- `public/data/compounds.json`
- `public/data/summary-indexes/*`
- `public/data/runtime-manifests/*`
- `ops/audit/governance-overlay-report.json`
- `ops/indexability-review/indexability-summary.json`

### Docs/handoff

- `.env.example`
- `docs/security-headers.md`
- `docs/generated/route-inventory.md`
- `CODEX_REPLACE_WITH_AUDITED_ZIP_PROMPT.md`

## Validation run

The following checks passed in this environment:

```text
node scripts/ci/check-node-version.mjs
node scripts/ci/validate-security-headers.mjs
node scripts/ci/validate-quarantine-imports.mjs
node scripts/ci/validate-public-json-imports.mjs
node scripts/ci/validate-xlsx-boundary.mjs
node scripts/ci/validate-static-export-compatibility.mjs
node scripts/ci/validate-route-seo.mjs
node scripts/validate-route-governance.mjs
node scripts/ci/validate-guide-faqs.mjs
node scripts/ci/validate-dangerously-set-inner-html.mjs
node scripts/ci/validate-direct-dependencies.mjs
node scripts/validators/validate-canonical-host.mjs
node scripts/validators/validate-no-google-font-build-dependency.mjs
node scripts/ci/validate-runtime-payload-budgets.mjs
node scripts/ci/validate-deterministic-json-order.mjs
node scripts/ci/validate-semantic-graph-health.mjs
node scripts/ci/validate-deploy-readiness.mjs
node scripts/ci/validate-workbook-source.mjs
node scripts/ci/validate-evidence-language.mjs
node scripts/data/validate-data-next.mjs
node scripts/validate-data-files.mjs
node scripts/ci/validate-indexability-metadata.mjs
node scripts/ci/validate-data-governance.mjs
```

Additional generation commands that completed:

```text
node scripts/data/apply-governance-overlay.mjs --data-dir=public/data
node scripts/data/build-runtime-summary-indexes.mjs --data-dir=public/data
node scripts/data/build-route-manifest.mjs --data-dir=public/data
node scripts/data/build-internal-link-engine.mjs --data-dir=public/data
node scripts/data/build-sitemap-manifest.mjs --data-dir=public/data
node scripts/data/build-export-batches.mjs --data-dir=public/data
node scripts/data/build-semantic-snapshots.mjs --data-dir=public/data
```

## Known remaining warnings / checks not completed here

### Still warning, non-failing

`node scripts/ci/validate-data-governance.mjs` still reports:

```text
INDEXABLE_COMPOUNDS_WITHOUT_SOURCES
```

This remains diagnostic-only. The affected indexable compound profiles are manually/curated indexable but still lack compound-source ingestion. I did not fabricate citations.

`node scripts/ci/validate-evidence-language.mjs` passed with 0 critical findings and 444 warnings. The warnings are style/tone warnings, not build blockers.

### Could not fully run without installed dependencies

This environment does not include `node_modules`, so commands that import packages such as `gray-matter`, `exceljs`, or `glob` cannot run here until `npm ci` is executed in Codex/the cloud repo.

Examples blocked by missing `node_modules` here:

```text
node scripts/ci/validate-article-quality.mjs
node scripts/build-articles.mjs
node scripts/data/generate-freshness-metadata.mjs
node scripts/data/build-search-index.mjs
node scripts/validators/validate-pagefind-body.mjs
```

### Build-output check expectedly failed pre-build

`node scripts/ci/validate-build-seo-metadata.mjs` expects an `out/` directory and failed because no production build output exists in this sandbox. Run it only after `npm run build` or the repo’s deploy build command.

## Recommended Codex follow-up

Apply `hippie-scientist-site-main-34-deep-audited-iter2.zip` with a clean `rsync --delete` replacement while preserving `.git/`, environment secrets, `node_modules/`, `.next/`, and `out/`.

Then run:

```bash
npm ci
npm run check:node
npm run typecheck
npm run lint:nocache
npm run validate:static-export
npm run validate:security-headers
npm run validate:route-seo
npm run validate:data
npm run build:deploy
npm run verify:output
```

If `validate:data` regenerates freshness/search artifacts after dependencies install, commit the generated deterministic changes if the validations pass.
