# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev                      # Start Next.js dev server (Turbo)
npm run build                    # Full production build (orchestrated pipeline)
npm run check                    # Fast local quality gate: tsc + eslint + blog + orchestrate
npm run check:full               # Exhaustive gate: all validations, data pipeline, build, verify
npm run lint                     # ESLint with zero warnings
npm run typecheck                # tsc --noEmit
npm run test                     # Vitest (single run)
npm run test:watch               # Vitest watch mode
npm run data:build               # Regenerate public/data from workbook
npm run data:validate            # Validate generated data
npm run verify:build             # Post-build verification (routes, SEO, headers, etc.)
npm run agent:run                # Generate agent enrichment patches (see CLAUDE.md Agent section)
npm run agent:review             # Review pending patches and generate summary
npm run validate:agent-patches   # Validate patch JSON structure (part of check:full)
npm run report:pending-patches   # Report pending patches that need review (part of check:full)
```

Run a single test file:
```bash
npx vitest run app/__tests__/a11y.test.tsx
```

## Architecture

### Static Export on Cloudflare Pages

This is a **Next.js App Router** project with `output: 'export'` — it produces a fully static `out/` directory deployed to Cloudflare Pages. **No server-side features are allowed**: no API routes, no middleware, no `next/headers`, no `force-dynamic`, no server actions, no runtime revalidation. All data must be available at build time.

### Data Pipeline (workbook → `public/data`)

The single canonical data source is `data-sources/herb_monograph_master.xlsx`. All runtime JSON in `public/data/**` is a **generated artifact** — never edit it manually. The pipeline:

1. `scripts/data/build-runtime-from-workbook.mjs` — parses the workbook, emits `herbs.json`, `compounds.json`, detail files, etc.
2. Several post-processors build related maps, summary indexes, route/sitemap manifests, semantic snapshots.
3. `scripts/ci/guard-generated-data.mjs` — CI guard that fails if `public/data` was edited without a corresponding workbook change.

To fix a content issue, classify it as `WORKBOOK_FIX`, `WORKBOOK_GPT_FIX`, or `GENERATOR_FIX` and fix at the right layer. See `docs/workbook-only-data-contract.md`.

### Two-Layer Content Model

**Discovery layer** — captures broad search intent, funnels to depth:
- `/goals/:slug`, `/guides/:slug`, `/natural-anxiolytics-beyond-ashwagandha`, `/sleep-herbs-vs-melatonin`, `/psychedelic-adjacent-herbs`, `app/seo-entry-pages.tsx` (`/best-supplements-for-*`)

**Depth layer** — authoritative profiles:
- `/herbs/:slug`, `/compounds/:slug`, `/stacks/:slug`, `/compare/:slug`

### Key Directory Layout

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router pages and layouts |
| `components/` | Shared React components (grouped by domain) |
| `lib/` | Pure logic: SEO helpers, evidence scoring, graph queries, metadata engine |
| `src/` | Legacy client-side lib, components, hooks, store (partially active — see `tsconfig.json` excludes) |
| `scripts/` | Build tooling, CI validators, data pipeline scripts (Node ESM) |
| `agent/` | AI enrichment agent system (runs separately via `npm run agent:run`) |
| `data-sources/` | Workbook source of truth (`.xlsx`) |
| `public/data/` | Generated runtime data (disposable; re-created by `npm run data:build`) |
| `config/` | Static config (affiliate tags, etc.) |
| `schemas/` | JSON Schema definitions for data validation |

### `lib/` vs `src/lib/`

`lib/` (root-level) contains the active, production-used helpers. `src/lib/` is a legacy directory; some files there are still imported but the active App Router source lives under `app/` and `components/`. Check `tsconfig.json` `paths` and `vitest.config.ts` aliases to understand which `@/lib/*` imports resolve where.

### Agent Enrichment System (`agent/`)

A separate pipeline (`npm run agent:run`) that orchestrates AI-assisted content enrichment. Agents produce patch files under `agent/patches/`. Patches are automatically validated in CI (`npm run validate:agent-patches`), then reviewed (`npm run agent:review`) before being merged into the workbook source of truth. Patches do not modify `public/data` directly.

**Workflow:**
1. Run agents: `npm run agent:run --mode=standard --batch=5`
2. Patches appear in `agent/patches/{date}/*.json`
3. CI validates patches automatically (part of `npm run check:full`)
4. Review patches: `npm run agent:review` → creates `ops/agent-review/approved-patches.json`
5. Manually apply approved data to workbook
6. Run `npm run data:build` to regenerate `public/data`

See `docs/agent-integration-guide.md` for detailed integration workflow and future automation plans.

## Static Export Constraints

Before any build change, run:
```bash
npm run validate:static-export
```

Never add `export const dynamic = 'force-dynamic'`, `export const revalidate`, `cookies()`, `headers()`, or any Next.js runtime-only API to App Router pages.

## Theme and Styling

- **Light mode only.** Do not add dark-mode classes (`dark:`) to new pages.
- CSS variables defined in `app/globals.css`: `--bg: #fffdf7`, emerald accent `#358f52`.
- Fonts: Inter (body) + Fraunces (display), both loaded via `next/font/google`.
- Tailwind CSS v4 (`tailwindcss: 4.3.0`).

## Affiliate Config

Always use `AFFILIATE_TAGS.amazon` from `config/affiliate.ts`. Never hardcode affiliate strings. Set `AMAZON_AFFILIATE_TAG` env var in Cloudflare Pages for production.

## Route Contracts (never delete or rename)

- `/herbs/:slug`
- `/compounds/:slug`
- `/goals/:slug`
- `/stacks/:slug`
- `/compare/:slug`
- Discovery cluster routes in `AGENTS.md`

## Pre-PR Quality Gate

```bash
npm run lint && npm run typecheck && npm run check
```

For data changes, also run:
```bash
npm run data:build && npm run data:validate && npm run guard:source-of-truth
```
