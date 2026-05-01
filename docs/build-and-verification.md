# Build and Verification Flow

Contractor-facing source of truth for build and deploy verification.

## Canonical production target

- Host: **Cloudflare Pages**
- Build command: `npm run build`
- Verification command: `npm run verify:build`
- Static output directory: `out/`
- Deploy target directory: `out/`

## Canonical scripts

- `npm run check` → alias to `npm run build`
- `npm run build` → workbook data generation + validation + source-of-truth guards + `next build` + `npm run verify:build`
- `npm run verify:build` → core route checks + redirect checks + CSS asset checks + deploy readiness + generated-data verification

## Workbook-only source of truth

- Source of truth workbook: `data-sources/herb_monograph_master.xlsx`
- Generated runtime JSON: `public/data/**`
- Generated blog data: `public/blogdata/**`
- Generated JSON is disposable build output; do not manually edit it.

Source errors must be triaged as one of:

- `WORKBOOK_FIX`
- `WORKBOOK_GPT_FIX`
- `GENERATOR_FIX`

## Generated artifact policy

### Source-controlled generated artifacts

- `public/data/**`
- `public/blogdata/**`

### Build/deploy artifacts (do not commit)

- `out/**` static export output
- `.next/**` local build artifacts

### Cloudflare static infra files

- `public/_redirects` and `public/_headers` are static infrastructure files copied to `out/` for Cloudflare Pages behavior.
