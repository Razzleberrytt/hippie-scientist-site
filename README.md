# The Hippie Scientistttt

Data-driven educational site for herbs and compounds.

## Quick start

```bash
npm install
npm run dev
```

## Current MVP Architecture

- Framework/runtime: **Next.js App Router** with static export.
- Canonical production host: **Cloudflare Pages**.
- Build command: `npm run build`.
- Verification command: `npm run verify:build`.
- Static deploy directory: `out/` (Cloudflare deploy target).
- Data source of truth: `data-sources/herb_monograph_master.xlsx` (workbook-only policy).
- Generated runtime data: `public/data/**` and `public/blogdata/**` are disposable generated artifacts and must not be manually edited.
- Legacy feature sets (lead capture, affiliate/product modules, recommendations, graph/effect search, governed enrichment tooling, old SPA/Vite/React Router paths) are removed from active MVP scope or deferred unless explicitly reintroduced through approved routes and passing build checks.

## Data pipeline (production default)

Production data is generated from a single workbook source of truth:

- Source workbook: `data-sources/herb_monograph_master.xlsx`
- Generated output: `public/data/**`
- Do not manually edit generated JSON in `public/data`
- Build runtime data with: `npm run data:build`

Build path summary:

- `npm run build` runs workbook generation + validation + source-of-truth guards + `next build` + `npm run verify:build`

If a content issue is found, classify and fix at the proper layer:

- `WORKBOOK_FIX`
- `WORKBOOK_GPT_FIX`
- `GENERATOR_FIX`

See `docs/workbook-only-data-contract.md`.

## Active routes (MVP)

Document only active Next App Router routes:

- `/`
- `/about`
- `/a-tier`
- `/blog`
- `/collections/:slug`
- `/compare/:slug`
- `/compounds`
- `/compounds/:slug`
- `/contact`
- `/disclaimer`
- `/faq`
- `/guides/:slug`
- `/herbs`
- `/herbs/:slug`
- `/learning`
- `/privacy`
- `/top/*`

## Deployment (production)

This repository is a **source repo**. Deploy static output from `out/`.

- Host: Cloudflare Pages
- Build command: `npm run build`
- Verify before deploy: `npm run verify:build`
- Deploy directory: `out/`
- Redirect and header infrastructure is static and Cloudflare-compatible via `public/_redirects` and `public/_headers` (exported into `out/`)

Do **not** commit generated deploy output.
