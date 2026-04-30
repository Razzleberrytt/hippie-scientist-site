# Cloudflare Pages deployment

## Production deploy mode

Production is Cloudflare Pages with GitHub integration.

That means Cloudflare watches the GitHub repository, runs the build command, and deploys the static output directory. The repo does **not** need Cloudflare API deploy secrets for the normal production path.

## Build command

Use the repository build command:

```bash
npm run build
```

This command runs the canonical sequence:

1. `npm run data:build`
2. `npm run data:validate`
3. `npm run data:audit`
4. `npm run guard:source-of-truth`
5. `next build`
6. `npm run verify:build`

## Static output directory

This repo uses `next.config.mjs` with `output: 'export'`, so the static export output is written to:

- `out/`

Cloudflare Pages should deploy `out/` directly.

## Cloudflare Pages settings

Use these settings in the Cloudflare Pages project:

- Framework preset: `None` or `Next.js static export` if available
- Build command: `npm run build`
- Build output directory: `out`
- Node version: `22`

## Required secrets

### Normal GitHub integration deploy

No Cloudflare API secrets are required for the normal production path.

The deploy-readiness script treats missing direct API secrets as a warning when using GitHub integration.

### Direct API deploy only

Only set these if you intentionally switch to direct API deployment:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`

If direct API deploy becomes required, set:

```bash
DEPLOY_MODE=cloudflare-direct
REQUIRE_CLOUDFLARE_DIRECT_SECRETS=true
```

## Node version

CI deploy should use Node `22` because `package.json` allows `>=20 <=22`.

## SPA fallback behavior

SPA fallback is provided by `public/_redirects` and must be present in deployed output as `out/_redirects`.

Required catch-all rule:

```txt
/* /index.html 200
```

`npm run verify:build` checks redirects in the same static output directory that Cloudflare deploys (`STATIC_OUTPUT_DIR`, default `out`).

## Source-of-truth rule

The workbook remains the only canonical production data source:

```txt
data-sources/herb_monograph_master.xlsx
```

Generated JSON under `public/data/` is build output only. Do not manually patch generated JSON to fix content problems.
