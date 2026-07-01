# Build and Verification Flow

Contractor-facing source of truth for build and deploy verification.

## Canonical production target

- Host: **Cloudflare Pages**
- Build command: `npm run build`
- Verification command: `npm run verify:build`
- Static output directory: `out/`
- Deploy target directory: `out/`

## Canonical scripts

- `npm run check` -> fast local validation: typecheck, lint, article build, core data build, and data-file validation.
- `npm run build` -> Cloudflare export build through `scripts/build-deploy.mjs`.
- `npm run build:app` -> article/blog generation plus `next build`; useful for UI and route changes.
- `npm run verify:build` -> prebuild checks, build, and postbuild audits.
- `npm run validate:release` -> full release gate.
- `npm run validate:workbook-source` -> validates workbook path/presence/extension/size and rejects generated `public/data` workbook artifacts as canonical input.

## Workbook-only source of truth

- Source of truth workbook: `data-sources/herb_monograph_master.xlsx`
- Generated runtime JSON: `public/data/**`
- Generated blog data: `public/blogdata/**`
- Generated JSON is disposable build output; do not manually edit it.

Source errors should be triaged as one of:

- `WORKBOOK_FIX`
- `WORKBOOK_GPT_FIX`
- `GENERATOR_FIX`

## Route and docs verification

- Run `npm run routes:inventory` after route moves so `docs/generated/route-inventory.md` matches the App Router tree.
- Run `npm run validate:route-seo` after canonical path, metadata, or redirect changes.
- Run `npm run audit:internal-links` after guide taxonomy, navigation, or footer changes.

## Generated artifact policy

### Source-controlled generated artifacts

- `public/data/**`
- `public/blogdata/**`

### Build/deploy artifacts (do not commit)

- `out/**` static export output
- `.next/**` local build artifacts

### Cloudflare static infra files

- `public/_redirects` and `public/_headers` are static infrastructure files copied to `out/` for Cloudflare Pages behavior.
