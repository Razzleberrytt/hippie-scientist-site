# Static export guardrails

## Why static export is required

This site deploys with Next.js `output: "export"` and publishes static files to Cloudflare Pages. Static export keeps deploys deterministic, fast, and aligned with the workbook-first content pipeline.

## Forbidden runtime/server features

`npm run validate:static-export` fails if active static-export code introduces:

- `app/**/route.(ts|tsx|js|jsx)` API route handlers
- `middleware.ts` or `middleware.js`
- `"use server"` server actions
- imports from `next/headers` or `next/server`
- runtime request APIs: `cookies()`, `headers()`, `draftMode()`
- dynamic rendering directives: `dynamic = "force-dynamic"`
- cache-busting runtime APIs: `unstable_noStore()`, `noStore()`
- runtime revalidation patterns such as `export const revalidate = ...` or `revalidateTag()/revalidatePath()`

## Allowed alternatives

- Build-time data generation through existing scripts in `scripts/data/**`
- Static App Router pages under `app/**/page.tsx`
- Compile-time JSON/runtime payload consumption from generated `public/data/**`
- Route generation with static params patterns already used by the project

## How to add static pages safely

1. Add route files as `app/**/page.tsx` only.
2. Keep data access build-time/static.
3. Run:
   - `npm run validate:workbook-source`
   - `npm run validate:static-export`
   - `npm run build`

## If server-side features are needed in the future

Do not bypass this guard in normal PRs. Propose an explicit architecture change PR that:

1. Documents migration away from static export
2. Updates `next.config.mjs` and deployment/runtime assumptions
3. Updates CI, security model, and operational docs accordingly
4. Gets maintainers' explicit approval before merging runtime-server features
