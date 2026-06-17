# Merge Report: Best Supplements for Blood Pressure Support (best-supplements-for-blood-pressure)

**Status:** MERGE READY

**Date:** 2026-06-17

**Route:** `/best-supplements-for-blood-pressure`

**Pipeline:** Refined Builder v2 → Gatekeeper v2 → Publish v2 (one page only)

---

## Summary of Changes

- **Files modified (2):**
  - `lib/curated-expansions.ts` — added the `best-supplements-for-blood-pressure` `CuratedExpansion` entry (intent, ranking methodology, 7-row evidence/dose/safety table, "which to try first" comparison, safety notes, buyer checklist, 5 references).
  - `app/seo-entry-pages.tsx` — wired affiliate placements via `revenueProductSlugs['best-supplements-for-blood-pressure'] = ['magnesium', 'coenzyme-q10', 'omega-3', 'garlic']`.
- **No new files, routes, components, or systems** were created. The page renders through the existing `SeoEntryPage` path; schema (`BreadcrumbList` + `FAQPage`) is auto-emitted by `buildSeoEntrySchemaGraph`, and affiliate links use `AFFILIATE_TAGS.amazon` only.

### Builder

- Expanded the thin SEO-entry page into an evidence-first money page using the established Magnificent-10 pattern (matching sleep / stress / focus / gut-health / fat-loss entries).
- Evidence rows graded conservatively: dietary potassium / DASH (moderate–strong, dietary), magnesium (low–moderate), omega-3 (low–moderate), garlic (preliminary–moderate), hibiscus (preliminary), beetroot/nitrate (preliminary, short-term), CoQ10 (insufficient/mixed — marketing-vs-evidence gap stated honestly).
- "Diet and lifestyle first" is the explicit lead lever; supplements framed only as small adjuncts.

### Gatekeeper

- **Verdict:** Production Ready With Revisions. Scores — Search Intent 8, E-E-A-T 8, Overall 8.
- Confirmed conservative YMYL framing, explicit drug/kidney interaction warnings (potassium + ACE/ARB/K-sparing diuretics), an emergency-BP threshold (≥180/120 + symptoms), and `/disclaimer` routing.
- No production blockers found.

### Publisher

- Applied the high-priority items inline (all were resolvable during build):
  - Swapped the unverifiable NCCIH URL (WAF-blocked, uncertain slug) for the canonical, stable **MedlinePlus High Blood Pressure** topic page to avoid a possible 404.
  - Left hibiscus **unlinked** because `/herbs/hibiscus` does not exist in the dataset (broken-link avoidance); all other rows link to verified routes (`/compounds/potassium`, `/compounds/magnesium`, `/compounds/omega-3`, `/compounds/coenzyme-q10`, `/herbs/garlic`).

---

## Verification

- **Production Blockers resolved:** Yes (none were present).
- **High Priority items addressed:** Yes — NCCIH→MedlinePlus reference swap; potassium interaction wording; emergency threshold; broken-link avoidance for hibiscus.
- **Internal links:** verified against `public/data` (potassium, magnesium, omega-3, coenzyme-q10 compounds; garlic herb all exist).
- **Affiliate hygiene:** placements route through `revenueProductSlugs` → `getRevenueProductSet` → `AFFILIATE_TAGS.amazon`; `AffiliateDisclosure` renders before product cards. No hardcoded affiliate strings.
- **Schema:** `BreadcrumbList` + `FAQPage` emitted at build time (static-export safe; no `force-dynamic`/`cookies()`/`headers()`).
- **Quality gate:** `npm run check` (typecheck + eslint --max-warnings=0 + article-quality + blog/articles build + orchestrate-build, 26 steps) — **passed, exit 0**.
- **Search Intent / E-E-A-T / Overall scores:** improved from the prior thin SEO-entry baseline; no regression.

## Remaining Low-Priority Items

- Add a `/herbs/hibiscus` (or `/compounds/hibiscus`) profile later so the hibiscus row can link out.
- Optionally cite one primary meta-analysis per row (garlic, magnesium) once the citation library supports per-claim PMC/DOI links.
- Consider a dedicated `/compare/*` funnel link if a BP-specific comparison page is created.

**Recommendation:** Safe to merge after static-export validation; the production gate already passed locally.
