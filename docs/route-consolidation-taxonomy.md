# Route Consolidation Taxonomy

Last updated: 2026-06-16

This is the single source of truth for how the site's content is organized.
Every page belongs to exactly one layer of one clear pathway, broad intent → deep reference:

```text
/goals            "I have a problem"      discovery / decision entry
   ↓
/education        "how & why it works"    foundational neuroscience & pharmacology
   ↓
/guides           "what should I do"      practical, problem-solving, stacks, buying criteria
   ↓
/articles         "the deep research"     long-form monographs on alkaloids / compounds / topics
   ↓
/herbs, /compounds  "the reference card"  workbook-driven depth-layer profiles
```

Two specialized clusters sit alongside the pathway and **link into** it rather than
duplicating it:

- `/compare/:slug` — head-to-head comparisons (decision support).
- `/psychoactive/*` + `/novel-psychoactive-substances/*` — a harm-reduction cluster
  for psychoactive categories and emerging substances. These pages funnel readers to
  the canonical `/articles` monographs for full pharmacology and to `/guides` for
  practical guidance.

## Canonical route families

| Family | Role | Source of truth |
|--------|------|-----------------|
| `/` | Home | — |
| `/goals`, `/goals/:slug` | Decision entry | `data/goals.ts` |
| `/education`, `/education/:slug` | Foundational explainers (how/why) | `lib/education` + `content/education` |
| `/guides`, `/guides/:slug` | Practical guides & stacks (what to do) | `lib/guides` + `content/guides` + curated static pages |
| `/articles`, `/articles/:slug` | Long-form research monographs | `content/articles/*.mdx` (preferred) + `content/articles/*.md` generated into `data/articles/articles.json` |
| `/herbs`, `/herbs/:slug` | Herb reference profiles | workbook (`herb_monograph_master.xlsx`) |
| `/compounds`, `/compounds/:slug` | Compound reference profiles | workbook — **workbook-only**, no injected MDX |
| `/stacks`, `/stacks/:slug` | Pre-built stacks | `public/data/stacks.json` |
| `/compare`, `/compare/:slug` | Comparisons | `data/comparisons` + `data/generated-comparisons` |
| `/psychoactive/*` | Psychoactive category hubs (harm reduction) | static pages |
| `/novel-psychoactive-substances/*` | Emerging-substance cluster (harm reduction) | `content` collection |
| `/search` | Noindex utility | — |
| `/safety-checker` | Trust utility | — |

### One source per URL

A given URL has exactly one source. Notable rules learned the hard way:

- **Articles:** `content/articles/*.mdx` is rendered directly by content collections.
  Legacy `content/articles/*.md` files are generated into `data/articles/articles.json`.
  When a slug exists as both MDX and JSON, the MDX wins at render and the JSON entry
  is dead. Keep the monograph in **one** place (prefer MDX) — do not author the same
  article twice.
- **Compounds are workbook-only.** Do not add `content/compounds/*.mdx`; isolated
  alkaloids that warrant a deep dive belong in `/articles`, and their reference card
  (if they are a real workbook compound) lives at `/compounds/:slug`.

### Kratom-derivative cluster (canonical example)

The 7-OH / MGM-15 / mitragynine-pseudoindoxyl / mitragynine cluster is the reference
implementation of the pathway:

- **Canonical deep dive:** `/articles/{slug}` (the MDX monographs).
- **Reference card:** `/compounds/{slug}` for the ones that are workbook compounds
  (`mitragynine`, `7-hydroxymitragynine`, `kratom`); the monograph links to it.
- **Comparison + harm reduction:** `/novel-psychoactive-substances/*`, which links
  up to the `/articles` monographs.
- Old duplicate `/compounds/{mgm-15,pseudoindoxyl,7-oh-vs-...}` URLs 301 to the
  canonical homes (see `public/_redirects`).

## Redirected route families

These should not receive new pages; route old URLs to the canonical family:

- root commercial pages such as `/best-supplements-for-*`
- root one-offs such as `/best-herbs-for-anxiety`, `/best-nootropics-for-focus`, `/herbs-for-sleep`
- `/top/*`, `/best-for/*`
- `/blog` and `/research-notes` → `/articles`
- duplicate comparison URLs when a canonical `/compare/:slug` exists

Redirects live in `public/_redirects` for Cloudflare Pages static export.

## `/learn` status

`/learn/:slug` hosts a small set of richly-structured stack guides (`app/learn/data.ts`).
They are surfaced from the `/guides` hub as "stack guides" and are part of the
**guides** layer conceptually. Do not add new top-level `/learn` content — author new
stack/practical content under `/guides`. A future pass may migrate the existing
`/learn/:slug` pages into `/guides/:slug` with 301s; until then they remain to avoid
degrading their structured rendering.

## Noindex route families

Available for users/internal exploration but should not compete with canonical pages:

- `/protocols/*`, `/pathways/*`, `/explore/*`, `/topics/*`, `/ecosystems/*`, `/supernodes/*`
- `/compare/dynamic`, `/compare/sourcing`, `/dosing`
- `/stacks/builder`
- `/blog/categories`, `/blog/tags`

Noindex is implemented with route metadata or route-family layouts.

## Sitemap policy

`app/sitemap.ts` includes only canonical indexable surfaces: homepage, goal hub,
education hub + articles, guide hub + canonical guides, entity libraries + profiles,
comparison hub + canonical comparisons, stacks, the novel-psychoactive-substances
cluster, approved clusters/collections, and the safety checker. It excludes merged,
noindex, experimental, and utility-only families.

## Guardrail

Before adding any new route, place it in exactly one bucket:

1. Decision/discovery route (`/goals`).
2. Foundational explainer (`/education`).
3. Practical guide or stack (`/guides`).
4. Long-form research monograph (`/articles`).
5. Depth-layer reference profile (`/herbs`, `/compounds`).
6. Comparison (`/compare`).
7. Harm-reduction cluster page (`/psychoactive`, `/novel-psychoactive-substances`).
8. Noindex utility.

If it does not fit one bucket — or it would duplicate a topic that already lives in
another bucket — do not add the route; extend or link to the existing page instead.
