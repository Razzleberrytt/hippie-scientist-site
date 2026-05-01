# Cloudflare Pages Deployment

## Production mode

Canonical production hosting is **Cloudflare Pages**.

## Required commands

- Build: `npm run build`
- Verify: `npm run verify:build`

## Static output directory

- Next App Router static export output: `out/`
- Cloudflare Pages deploy target: `out/`

## Pages project settings

- Framework preset: `None` (static)
- Build command: `npm run build`
- Build output directory: `out`
- Node version: `22`

## Redirect and header infrastructure

- `public/_redirects` and `public/_headers` are Cloudflare static infrastructure files.
- They must be present in deploy output (`out/_redirects`, `out/_headers`) after build/export.

## Data ownership policy

- Workbook (`data-sources/herb_monograph_master.xlsx`) is the only source of truth.
- `public/data/**` and `public/blogdata/**` are generated artifacts and must not be manually edited.
