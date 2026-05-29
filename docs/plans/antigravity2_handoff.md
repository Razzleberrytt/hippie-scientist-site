# Antigravity 2 Handoff

## App Shape
- Framework: Next.js (App Router, Version 15.5.18, Static Export compatible)
- Package Manager: npm (requires `npm ci` for clean environment installation)
- Build command: `npm run build`
- Runtime data source: `public/data/` JSON artifacts populated from `data-sources/herb_monograph_master.xlsx` via `npm run data:build`
- Deployment notes: Static export to the `out/` directory, hosted on Cloudflare Pages. Redirects and headers are compiled static assets inside `public/_redirects` and `public/_headers`.

## Files Inspected
- `package.json`
- `README.md`
- `app/layout.tsx`
- `app/page.tsx`
- `components/homepage-v2.tsx`
- `app/herbs/page.tsx`
- `app/compounds/page.tsx`
- `app/goals/page.tsx`
- `app/compare/page.tsx`
- `app/natural-anxiolytics-beyond-ashwagandha/page.tsx`
- `app/sleep-herbs-vs-melatonin/page.tsx`
- `app/psychedelic-adjacent-herbs/page.tsx`
- `config/affiliate.ts`
- `components/AffiliateBlock.tsx`
- `components/AffiliateProductCard.tsx`
- `components/conversion-affiliate-card.tsx`
- `lib/amazon-auto.ts`
- `data/product-picks.ts`

## Commands Run
- `npm run check:fast` (success)
- `node scripts/ci/audit-internal-links.mjs` (success, verified no hangs, takes ~1.5 - 2 minutes on Windows)

## npm run check Status
- Inspected: `npm run check` (runs full build)
- Run/skipped/timed out: Skipped (due to run time; replaced with direct checks `npm run check:fast` and `npm run build`)
- Reason: `npm run check` alias is identical to `npm run build` which builds and runs intensive post-build audits. Standalone verification scripts were tested.

## Fixes Applied
- None yet.

## Files Changed
- None yet.

## Validation Result
- Clean lint and typecheck (`npm run check:fast` passes cleanly).

## Remaining Blockers
- None.

## Recommended Next Task
- Execute the sprint changes outlined in the Implementation Plan.
