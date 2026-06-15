# AGENTS.md

## Project guidance for coding agents

- Keep routes like `/herbs/:slug`, `/compounds/:slug`, `/goals/:slug` stable; if you must rename or remove one, add a redirect in `public/_redirects` so links and SEO don't break.
- Prefer minimal, surgical changes.
- Treat `/public/data` as a core publish target.
- Validate slugs and required fields before writing JSON artifacts.
- Avoid replacing existing data pipelines when they can be extended.
- Keep changes small and easy to review.
- Run build checks after data-pipeline edits.
- Favor lean payloads for initial shipping.
- This project currently deploys as a static export (`output: 'export'` on Cloudflare Pages). Server features (API routes, middleware, server actions, `next/headers`, `next/server` runtime, `force-dynamic`, runtime revalidation) will not work under static export — if you need them, migrate the deployment model first.

## Site architecture

### Two-layer content model
1. **Discovery layer** — entry pages and cluster guides that capture broader search intent and funnel users into the depth layer
2. **Depth layer** — herb and compound detail pages, goal pages, comparison pages

### Discovery layer routes (stable; add a redirect if you change one)
- `/natural-anxiolytics-beyond-ashwagandha` — anxiolytic herb cluster
- `/sleep-herbs-vs-melatonin` — sleep supplement comparison cluster
- `/psychedelic-adjacent-herbs` — harm-reduction herb cluster
- `/goals/:slug` — goal-based decision guides
- `/best-supplements-for-*` — SEO entry pages (see `app/seo-entry-pages.tsx`)

### Depth layer routes (stable; add a redirect if you change one)
- `/herbs/:slug` — individual herb profiles
- `/compounds/:slug` — individual compound profiles
- `/stacks/:slug` — supplement stacks

## Data pipeline
- Primary source: `data-sources/herb_monograph_master.xlsx`. The workbook is editable — edit it to make broad/structured content changes, then run `npm run data:build`.
- Generated JSON lives in `public/data/`. You may also edit these files directly to fix or patch content; CI no longer blocks direct edits (the guard is advisory only). For larger changes prefer the workbook so edits aren't lost on the next regeneration.
- Run `npm run data:build` after workbook changes, before `npm run build`.

## Affiliate config
- Affiliate tag is in `config/affiliate.ts` — use `AFFILIATE_TAGS.amazon` not hardcoded strings
- Set `AMAZON_AFFILIATE_TAG` env var in Cloudflare Pages to override

## Theme
- Light and dark mode are both supported (toggle in the header via `DarkModeProvider`/`DarkModeToggle`). Default base: `--bg: #fffdf7`, dark text on warm background.
- Emerald accent: `#358f52`
- `app/globals.css` is the source of truth for CSS variables, including the `.dark` overrides.
- New pages may use `dark:` classes; keep light and dark variants in sync.

## Publication manifest
- Build/update with:
  - `node scripts/build-publication-manifest-from-workbook.mjs`
- Verify:
  - `public/data/publication-manifest.json`
  - `counts.herbs_eligible > 0`

## Agent Enrichment and Patch Workflow

The agent system automatically generates patches for content enrichment. These patches are tracked and validated in CI:

**Agent execution:**
```bash
npm run agent:run --mode=standard --batch=5
```
Produces JSON patches in `agent/patches/{date}/*.json`

**CI Validation (automatic in npm run check:full):**
- `npm run validate:agent-patches` — Validates patch JSON structure and required fields
- `npm run report:pending-patches` — Reports summary of pending patches

**Manual Review:**
```bash
npm run agent:review
```
Generates `ops/agent-review/approved-patches.{json,csv}` with patch summaries.

**Integration:**
1. Review approved patches from CSV/JSON
2. Extract and merge approved data into workbook
3. Run `npm run data:build` to regenerate public/data

See `docs/agent-integration-guide.md` for full details on patch formats, validation, and future automation.
