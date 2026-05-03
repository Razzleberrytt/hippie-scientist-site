# AGENTS.md

## Project guidance for coding agents

- Preserve route contracts:
  - `/herbs/:slug`
  - `/compounds/:slug`
  - `/goals/:slug`
- Prefer minimal, surgical changes.
- Treat `/public/data` as a core publish target.
- Validate slugs and required fields before writing JSON artifacts.
- Avoid replacing existing data pipelines when they can be extended.
- Keep changes small and easy to review.
- Run build checks after data-pipeline edits.
- Avoid unrelated refactors.
- Favor lean payloads for initial shipping.

## Site architecture

### Two-layer content model
1. **Discovery layer** — entry pages and cluster guides that capture broader search intent and funnel users into the depth layer
2. **Depth layer** — herb and compound detail pages, goal pages, comparison pages

### Discovery layer routes (do not delete or rename)
- `/natural-anxiolytics-beyond-ashwagandha` — anxiolytic herb cluster
- `/sleep-herbs-vs-melatonin` — sleep supplement comparison cluster
- `/psychedelic-adjacent-herbs` — harm-reduction herb cluster
- `/goals/:slug` — goal-based decision guides
- `/best-supplements-for-*` — SEO entry pages (see `app/seo-entry-pages.tsx`)

### Depth layer routes (do not delete or rename)
- `/herbs/:slug` — individual herb profiles
- `/compounds/:slug` — individual compound profiles
- `/stacks/:slug` — supplement stacks

## Data pipeline
- Source of truth: `data-sources/herb_monograph_master.xlsx`
- Generated JSON lives in `public/data/` — treat as build artifact, not source
- Do NOT modify `public/data/workbook-herbs.json` or `public/data/workbook-compounds.json` directly
- Run `npm run data:build` after workbook changes, before `npm run build`

## Affiliate config
- Affiliate tag is in `config/affiliate.ts` — use `AFFILIATE_TAGS.amazon` not hardcoded strings
- Set `AMAZON_AFFILIATE_TAG` env var in Cloudflare Pages to override

## Theme
- Light mode only. `--bg: #f3eadc`, dark text on warm background.
- Emerald accent: `#10b981`
- Do NOT add dark-mode classes to new pages unless the whole site theme is migrated.

## Publication manifest
- Build/update with:
  - `node scripts/build-publication-manifest-from-workbook.mjs`
- Verify:
  - `public/data/publication-manifest.json`
  - `counts.herbs_eligible > 0`
- Do not hand-edit generated workbook JSON to force eligibility.
