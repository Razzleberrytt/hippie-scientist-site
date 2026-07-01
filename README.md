# The Hippie Scientist

Evidence-first supplement and botanical reference site built with the Next.js App Router and exported as static Cloudflare Pages output.

## Quick Start

```bash
npm ci
npm run dev
```

## Current Site Model

The site is organized around two public layers:

- Discovery layer: `/guides`, `/guides/adhd`, `/guides/sleep`, `/guides/anxiety`, `/guides/focus`, `/guides/herbs`, `/guides/compare`, `/guides/best`, `/learn`, `/info`, and `/evidence`.
- Depth layer: `/herbs/:slug` and `/compounds/:slug` monograph profiles, with stable redirects for older guide, article, comparison, goal, and stack URLs.

Do not reintroduce old top-level navigation families unless the deployment model and redirect plan are updated together. See `docs/site-organization.md`.

## Data Pipeline

- Canonical source: `data-sources/herb_monograph_master.xlsx`
- Generated runtime output: `public/data/**`
- Core data build: `npm run data:build`
- Static export build: `npm run build`

Treat `public/data` as a publish target. Prefer workbook edits for broad structured content changes; direct JSON patches are acceptable only for narrow publish fixes that will not be lost on the next regeneration.

## Verification

Use the smallest check that matches the change:

- Code-only UI/content change: `npm run typecheck && npm run lint`
- Route or SEO change: `npm run validate:route-seo && npm run audit:internal-links`
- Static export change: `npm run validate:static-export && npm run build:app`
- Release pass: `npm run validate:release`

Regenerate route docs after route moves:

```bash
npm run routes:inventory
```

## Deployment

- Host: Cloudflare Pages
- Build command: `npm run build`
- Deploy directory: `out/`
- Static infrastructure: `public/_redirects` and `public/_headers`

This repo uses static export. Server-only Next.js features such as API routes, middleware, server actions, runtime revalidation, and `next/headers` are not available unless the deployment model changes first.
