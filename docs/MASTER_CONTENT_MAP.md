# Master Content Map

> Source of truth for content types, ownership, and routing governance.  
> Last updated: 2026-06-17

---

## Content Architecture Overview

The site uses a two-layer model:

**Discovery layer** — broad search intent, funnels to depth:
- `/goals/:slug` — evidence hubs by health goal
- `/guides/:slug` — long-form how-to / roundup guides
- `/articles/:slug` — Q&A, deep dives, comparisons
- `/best-supplements-for-*` — entry pages

**Depth layer** — authoritative profiles driven by the workbook:
- `/herbs/:slug` — herb monographs (workbook-only)
- `/compounds/:slug` — compound profiles (workbook-only)
- `/stacks/:slug` — curated stacks (workbook-only)
- `/compare/:slug` — head-to-head comparisons

---

## Content Types

### `/herbs/:slug` — Herb Monographs

| Property | Value |
|----------|-------|
| Source of truth | `data-sources/herb_monograph_master.xlsx` |
| Data pipeline | `npm run data:build` → `public/data/` |
| Route file | `app/herbs/[slug]/page.tsx` (dynamic catch-all) |
| Edit workflow | Edit workbook → `npm run data:build` |
| Static params | Generated from `public/data/herbs.json` |
| Owner | Workbook only — **never edit `public/data` directly for herb content** |

Do not create manual `app/herbs/<slug>/page.tsx` files. All herb pages are rendered by the dynamic route from workbook-generated JSON.

---

### `/compounds/:slug` — Compound Profiles

| Property | Value |
|----------|-------|
| Source of truth | `data-sources/herb_monograph_master.xlsx` |
| Data pipeline | `npm run data:build` → `public/data/` |
| Route file | `app/compounds/[slug]/page.tsx` (dynamic catch-all) |
| Edit workflow | Edit workbook → `npm run data:build` |
| Static params | Generated from `public/data/compounds.json` |
| Owner | Workbook only — **never edit `public/data` directly for compound content** |

Same rule as herbs: no manual static compound pages.

---

### `/guides/:slug` — Long-Form Guides

| Property | Value |
|----------|-------|
| Source of truth | Static TSX files in `app/guides/<slug>/page.tsx` |
| Data pipeline | None (static) |
| Route file | `app/guides/[slug]/page.tsx` (catch-all handles legacy slugs via `getGuideBySlug`) |
| Create workflow | `npm run create:page` → type: guide |
| Owner | Engineering / Editorial |

**Purpose:** Long-form roundup guides, best-of lists, how-to content. These target high-volume "best supplements for X" and "how to Y" queries.

**Static guide pages (current):**
- adhd-supplements
- best-adaptogens-for-stress
- best-herbs-for-anxiety
- best-herbs-for-stress-and-anxiety-at-night
- best-natural-sleep-aids-that-work
- best-nootropics-for-focus
- best-supplements-for-focus
- best-supplements-for-overthinking
- best-supplements-for-sleep
- best-supplements-for-stress
- elderberry
- focus-without-caffeine-crash
- how-to-lower-cortisol-naturally
- kava
- kratom-7oh-withdrawal-management
- magnesium-for-sleep
- magnesium-vs-melatonin
- natural-alternatives-to-anxiety-medication
- natural-anxiolytics-beyond-ashwagandha
- passionflower
- psychedelic-adjacent-herbs
- rhodiola-complete-guide / rhodiola-energy / rhodiola-extract-vs-powder / rhodiola-sleep-stack
- sleep-herbs-vs-melatonin
- supplements-for-brain-fog-and-fatigue
- turmeric-curcumin

**Note:** The `[slug]` catch-all serves `ashwagandha` and `lions-mane` from the legacy guide system (`getGuideBySlug`). All new guides use static per-page files.

---

### `/articles/:slug` — Deep-Dive Articles

| Property | Value |
|----------|-------|
| Source of truth | Static TSX files in `app/articles/<slug>/page.tsx` AND `data/articles/articles.json` (for JSON-driven articles) |
| Data pipeline | `npm run articles:build` regenerates the `[slug]` catch-all index |
| Route file | `app/articles/[slug]/page.tsx` (catch-all handles both JSON and static pages) |
| Create workflow | `npm run create:page` → type: article |
| Owner | Engineering / Editorial |

**Purpose:** Q&A articles, condition-specific deep dives, ingredient spotlights. These target long-tail queries like "L-theanine for anxiety dosage" and "ashwagandha vs magnesium for sleep."

**Two rendering paths:**
1. **Static page** (`app/articles/<slug>/page.tsx`) — full editorial control, rich components. Preferred for flagship articles.
2. **JSON-driven** (`data/articles/articles.json`) — markdown-content articles rendered by the `[slug]` catch-all. Used for bulk/agent-enriched content.

**Static article pages (current):**
- adhd-blood-tests, adhd-stack-guide, anxiety-stack-guide
- ashwagandha-for-adhd, ashwagandha-for-anxiety, ashwagandha-for-sleep, ashwagandha-vs-magnesium-for-sleep
- best-herbs-for-sleep, best-magnesium-for-sleep, best-magnesium-supplement-for-adhd, best-supplements-for-adhd
- cbd-vs-ashwagandha-for-anxiety, citicoline-vs-alpha-gpc
- iron-ferritin-and-adhd
- l-theanine-for-adhd, l-theanine-for-anxiety, l-theanine-for-calm, l-theanine-for-sleep
- l-theanine-magnesium-adhd-stack, l-theanine-vs-caffeine-for-focus, l-theanine-without-caffeine
- magnesium-for-adhd, magnesium-for-sleep, magnesium-glycinate-vs-citrate-for-adhd, magnesium-types-for-sleep
- melatonin-for-adhd-sleep, melatonin-vs-valerian
- natural-anxiety-relief, nutrient-deficiencies-and-adhd
- omega-3-and-adhd, sleep-and-adhd, sleep-best-supplements, sleep-stack-guide, sleep-stack-magnesium-melatonin
- vitamin-d-and-adhd, zinc-and-adhd

**JSON-driven articles (current):**
- adaptogenic-natural-compounds
- ashwagandha (bacopa-monnieri, elderberry, ginkgo-biloba, kava, l-theanine, lions-mane, magnesium-glycinate, nac, passionflower, peptides-research-guide, rhodiola-rosea, valerian-root)
- entourage-effect-herbal-supplements
- lions-mane-mushroom-benefits-mechanisms-dosage-evidence-guide
- natural-compounds-research-clusters

---

### `/compare/:slug` — Head-to-Head Comparisons

| Property | Value |
|----------|-------|
| Source of truth | Static TSX files in `app/compare/<slug>/page.tsx` AND `src/data/comparisons.ts` (for dynamic comparisons) |
| Data pipeline | None for static pages |
| Route file | `app/compare/[slug]/page.tsx` (catch-all handles dynamic comparisons from supplement data) |
| Create workflow | `npm run create:page` → type: compare |
| Owner | Engineering / Editorial |

**Purpose:** Head-to-head comparisons of supplements, compounds, or approaches. Targets "[A] vs [B]" queries with high commercial intent.

**Slug convention:** Use `a-vs-b` or `a-vs-b-vs-c` format. The generator auto-suggests component names from the slug.

**Static compare pages (current):**
- ashwagandha-vs-l-theanine-vs-magnesium
- berberine-vs-metformin
- caffeine-vs-l-theanine-vs-bacopa-for-focus
- curcumin-vs-boswellia-vs-omega-3
- kanna-vs-ssris
- kava-vs-alcohol
- l-theanine-vs-magnesium
- magnesium-glycinate-vs-l-threonate-for-sleep
- magnesium-glycinate-vs-magnesium-oxide
- melatonin-vs-valerian-vs-magnesium-for-sleep
- mitragynine-vs-7-hydroxymitragynine
- rhodiola-vs-ashwagandha
- sleep-herbs-vs-melatonin

---

## Route Ownership Summary

| Route pattern | Owned by | Edit via |
|---------------|----------|----------|
| `/herbs/:slug` | Workbook | Edit xlsx → `npm run data:build` |
| `/compounds/:slug` | Workbook | Edit xlsx → `npm run data:build` |
| `/stacks/:slug` | Workbook | Edit xlsx → `npm run data:build` |
| `/goals/:slug` | Workbook | Edit xlsx → `npm run data:build` |
| `/guides/:slug` | Static TSX | `npm run create:page` |
| `/articles/:slug` (flagship) | Static TSX | `npm run create:page` |
| `/articles/:slug` (bulk) | `data/articles/articles.json` | Edit JSON + `npm run articles:build` |
| `/compare/:slug` (static) | Static TSX | `npm run create:page` |
| `/compare/:slug` (dynamic) | `src/data/comparisons.ts` | Edit data file |

---

## Slug Governance

- Slugs must be lowercase letters, numbers, and hyphens only.
- No leading or trailing hyphens.
- Must be unique across the type's route namespace (the generator enforces this).
- Stable once published — add a redirect in `public/_redirects` before changing a live slug.
- Compare slugs use `-vs-` as the separator.

---

## What NOT to Do

- Do not create `app/herbs/<slug>/page.tsx` or `app/compounds/<slug>/page.tsx` — those routes are owned by the workbook.
- Do not edit `public/data/*.json` directly for herb/compound content — changes will be overwritten by `npm run data:build`.
- Do not add `force-dynamic`, `export const revalidate`, `cookies()`, `headers()`, or `next/headers` — this is a static export and these will break the build.
- Do not hardcode affiliate strings — always use `AFFILIATE_TAGS.amazon` from `config/affiliate.ts`.
