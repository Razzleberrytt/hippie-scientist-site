# Cloudflare Pages deployment

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

Cloudflare Pages deploys `out/` directly.

## Required GitHub Actions secrets

Set the following repository secrets for deploy:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT`

## Node version

CI deploy uses Node `22` (compatible with `engines.node: >=20 <=22`).

## SPA fallback behavior

SPA fallback is provided by `public/_redirects` and must be present in deployed output as `out/_redirects`.

Required catch-all rule:

```txt
/* /index.html 200
```

`npm run verify:build` checks redirects in the same static output directory that Cloudflare deploys (`STATIC_OUTPUT_DIR`, default `out`).
