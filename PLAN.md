# SEO, Content Depth & Conversion Plan — thehippiescientist.net

**Status:** Implemented (June 2, 2026) per recommended defaults below.  
**Date:** June 2, 2026  
**Scope:** Static-export Next.js App Router site; workbook-driven data (`data-sources/herb_monograph_master.xlsx`).

---

## Executive summary

The site already has a solid SEO foundation: centralized metadata helpers (`src/lib/seo.ts`), JSON-LD on goal/herb/compound/stack/blog routes, a large programmatic sitemap, robots.txt, affiliate components, and goal decision pages with comparison tables. The highest-impact gaps are **canonical/host inconsistency (www vs apex)**, **under-optimized goal-page metadata** (titles/descriptions/OG vs. your target keyword patterns), **weak internal linking across goals → stacks**, **uneven conversion UX** (two email capture systems; lead magnet not unified), and **missing on-page freshness signals**. Content depth for money pages should extend the existing workbook + `data/goals.ts` pipelines—not hand-edit `public/data/*.json`.

Estimated implementation: **4 phases**, ~**12–18 focused PRs** (or one stacked branch), with build validation after data-pipeline touches.

---

## Current state (audit)

### Architecture (relevant)

| Layer | Routes | Data source |
|--------|--------|-------------|
| Discovery | `/goals`, `/best-supplements-for-*`, cluster guides | `data/goals.ts`, `app/seo-entry-pages.tsx` |
| Depth | `/herbs/:slug`, `/compounds/:slug`, `/stacks/:slug` | Workbook → `npm run data:build` → `public/data/` |
| Tools | `/compare`, `/safety-checker`, `/search` | Runtime JSON + static compare configs |

- **Static export:** `output: 'export'` in `next.config.mjs` — no API routes or server runtime.
- **Path alias:** `@/*` resolves `src/*` first, then repo root — `@/lib/seo` → `src/lib/seo.ts` (not root `lib/seo.ts`).

### What is already working well

1. **Metadata helpers** — `generateDetailMetadata()`, `buildMeta()`, governed descriptions for enriched profiles.
2. **JSON-LD** — MedicalWebPage + Breadcrumb on herbs/compounds; FAQ + Collection + ItemList on goals; Product schema when revenue products exist; site Organization/WebSite in `app/layout.tsx`.
3. **Sitemap** (`app/sitemap.ts`) — Home, herbs, compounds, goals, stacks, compares, blog, guides, SEO entry pages; git-based `lastModified`; deprecated slug filtering.
4. **Robots** (`app/robots.ts`) — Allows `/`, disallows dev/dashboard paths, points to sitemap.
5. **Trust + affiliate** — `RecommendationSection`, `SourcingCta`, `AffiliateDisclosure`, safety classifications, suppressed affiliate on high-risk herbs.
6. **SEO entry pages** — `app/seo-entry-pages.tsx` already uses stronger titles (e.g. “Best Supplements for Sleep”) and `EmailCaptureBox` with lead magnets.

### Critical issues found

| Issue | Severity | Evidence |
|--------|----------|----------|
| **www vs apex domain split** | High | `app/layout.tsx` + sitemap use `https://thehippiescientist.net`; `src/lib/seo.ts` uses `SITE_URL = https://www.thehippiescientist.net` for JSON-LD and `buildMeta()` canonicals |
| **Goal metadata not SERP-competitive** | High | `app/goals/[goal]/page.tsx` titles like `{goal.title} Guide` — no year, no “Best Evidence-Based…” pattern; no `openGraph` / `twitter` |
| **Goal canonicals relative only** | Medium | `alternates.canonical: `/goals/${slug}`` — works with `metadataBase` but inconsistent with herb pages using absolute URLs from `buildMeta()` |
| **Thin FAQ schema on goals** | Medium | FAQ answers are one-line templates from `quickPicks`, not full on-page FAQ copy |
| **Goals → stacks linking gap** | Medium | Goal pages link to herb/compound profiles; no prominent stack links (`/stacks/sleep`, etc.) |
| **Herbs → goals linking gap** | Medium | Only special-case (`AshwagandhaStressClaim`) links to `/goals/stress` |
| **Duplicate email capture paths** | Medium | `EmailCapture` (GET → `/newsletter/confirmed`) on goals vs `EmailCaptureBox` + `content/emailCapture.ts` on SEO entry / free-guide |
| **Product schema placeholder pricing** | Medium | Herb/compound Product JSON-LD uses hardcoded `lowPrice: '15'`, `highPrice: '50'` — risk of rich-result quality issues |
| **Images unoptimized** | Low (export constraint) | `images.unoptimized: true` — expected for static export; mitigate with sizing, lazy load, fewer hero assets |
| **No visible last-updated UI** | Low | Workbook fields (`reviewed_date`, etc.) used in sitemap but not surfaced on goal/herb/compare pages |
| **Trailing slash** | Low | `trailingSlash: true` — ensure canonicals and internal links consistently include trailing slashes where Next emits them |

### Sitemap / robots recommendations

- **Keep** current sitemap structure; it is comprehensive.
- **Add** after audit: explicit inclusion check for `/safety-checker`, `/supplement-safety-checklist`, `/free-guide`, `/start-here` if not already present (some may be missing from `canonicalStaticRoutes`).
- **Robots:** Consider `Disallow: /compare/dynamic` if that page is thin or duplicate intent (verify in implementation).
- **Compare pages:** Large auto-generated `[slug]` set — prioritize indexing for curated compares in `data/comparisons.ts` + flagship static pages; consider `noindex` for ultra-thin auto pairs (governance via `getRuntimeVisibility` pattern).

---

## Target outcomes

1. **Organic:** Improved CTR from benefit-focused titles; fewer canonical splits; richer FAQ rich results where content supports it.
2. **Revenue:** Higher affiliate click-through via trust-first “Why we recommend” blocks without aggressive popups.
3. **List growth:** Unified lead magnet (“Evidence-Based Supplement Safety Checklist”) with goal-specific variants.
4. **Trust:** Visible review dates, methodology links, consistent YMYL disclaimers.

---

## Phase 1 — SEO audit & fixes (priority 1)

### 1.1 Unify canonical domain (blocking)

**Files:** `src/lib/seo.ts`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, any hardcoded URLs in JSON-LD scripts.

**Actions:**

- Single constant: `https://thehippiescientist.net` (match production + `metadataBase`).
- Replace all `www.` references in schema URLs and `buildMeta()` output.
- Add redirect note in plan comments only if Cloudflare already handles www → apex (verify in Cloudflare dashboard; do not change hosting in code).

### 1.2 Centralize page metadata builder

**New or extend:** `src/lib/seo.ts` — add `buildPageMetadata()` used by goals, index pages, tools.

**Standard fields for every indexable template:**

- `title` (keyword-rich, ≤60 chars where possible)
- `description` (benefit + evidence + safety hook, ≤155 chars via `formatMetaDescription`)
- `alternates.canonical` (absolute URL, trailing-slash consistent)
- `openGraph` + `twitter` (title, description, `url`, default OG image from layout)
- `robots` when `noindex` needed

### 1.3 Goal page metadata overhaul

**Files:** `app/goals/[goal]/page.tsx`, `data/goals.ts` (optional `seoTitle` / `seoDescription` fields per goal).

**Title pattern (examples):**

| Slug | Proposed title |
|------|----------------|
| sleep | Best Evidence-Based Supplements for Sleep 2026 – Safety & Comparisons |
| stress | Best Supplements for Stress 2026 – Evidence, Safety & What to Avoid |
| anxiety | Best Natural Options for Anxiety Support 2026 – Compared by Evidence |
| focus | Best Focus Supplements 2026 – Stimulant vs Non-Stimulant Compared |

Implementation: map high-intent slugs to templates; fallback to `{goal.title} Guide 2026` for long-tail goals (gut-health, blood-pressure, etc.).

**Descriptions:** Include top 3 ranked entities from `rankEntitiesForGoal()`, evidence framing, and “not medical advice” without wasting characters.

### 1.4 Herb & compound metadata pass

**Files:** `src/lib/seo.ts` (`generateDetailMetadata`), `app/herbs/[slug]/page.tsx`, `app/compounds/[slug]/page.tsx`.

**Actions:**

- Align OG `type`, images (entity-specific when `og_image` exists in runtime record).
- Use `buildGovernedMetaTitle` / `buildGovernedMetaDescription` where `enrichedAndReviewed` (already partially implemented).
- Ensure deprecated alias URLs keep `noindex` + canonical to primary slug (already on herbs).

### 1.5 Main & hub pages

**Files:** `app/goals/page.tsx`, `app/herbs/page.tsx`, `app/compounds/page.tsx`, `app/compare/page.tsx`, `app/safety-checker/page.tsx`, `app/page.tsx`.

- Fill missing OG/twitter on tools.
- Add canonicals where absent.

### 1.6 JSON-LD improvements

| Page type | Schema | Changes |
|-----------|--------|---------|
| Goals | FAQPage, CollectionPage, ItemList, Breadcrumb | Expand FAQ to 4–6 Q&As mirroring visible page sections; add `dateModified` from workbook/git |
| Herbs/compounds | MedicalWebPage, Breadcrumb, Product (conditional) | Remove or replace placeholder AggregateOffer prices with `offers` only when real product data exists; add FAQ block for top 3 safety/dose questions |
| Compare | Article or WebPage + FAQ | Add compare-specific FAQ where pages have Q&A sections |
| Blog | BlogPosting | Already present — ensure `dateModified` matches post updates |

**New component (optional):** `components/seo/StructuredData.tsx` — dedupe repeated `<script type="application/ld+json">` patterns.

### 1.7 Internal linking mesh

**New:** `lib/goal-hub-links.ts` (or extend `lib/semantic-internal-linking.ts`)

**Goal pages (`app/goals/[goal]/page.tsx`):**

- Section: “Related stacks” → `/stacks/{sleep|stress|cognition}` when slug maps.
- Section: “Compare head-to-head” → 2–4 curated compares from `data/comparisons.ts` / `getValidComparisonSlug`.
- Footer: “Explore herbs for {goal}” → top N herb links from `rankEntitiesForGoal`.

**Herb/compound pages:**

- “Best for your goal” chips → `/goals/{slug}` via effects/mechanism tags (reuse `rankEntitiesForGoal` inverse or static map for top 20 entities).
- Keep existing compare + stack sections.

**Stacks pages:**

- Link up to parent goal + constitutent herb/compound profiles.

### 1.8 Sitemap & robots polish

**Files:** `app/sitemap.ts`, `app/robots.ts`

- Add missing high-value static routes to sitemap.
- Deduplicate stack/compare URLs (stabilize already exists).
- Document `SITEMAP_MAX_ROUTES` env for CI.

---

## Phase 2 — Content depth boost (priority 2)

### Selection criteria

High commercial + informational intent, existing partial content, feasible without inventing clinical claims:

| Priority | URL | Rationale |
|----------|-----|-----------|
| 1 | `/goals/sleep` | Core money keyword; SEO entry page exists |
| 2 | `/goals/stress` | High volume; overlaps adaptogen affiliate catalog |
| 3 | `/goals/anxiety` | Safety-sensitive; trust differentiator |
| 4 | `/goals/focus` | Compare + stimulant nuance |
| 5 | `/best-supplements-for-sleep` | Discovery → depth funnel (seo-entry) |
| 6 | `/herbs/ashwagandha` | Flagship herb + `AshwagandhaStressClaim` |
| 7 | `/herbs/valerian` or `/compounds/melatonin` | Sleep cluster depth |
| 8 | `/compare/ashwagandha-vs-rhodiola-for-stress` | Existing flagship compare |

### Content additions (per page type)

**Goal pages (`data/goals.ts` + page template):**

- `faqItems[]` — 5–6 evidence-aware Q&As (visible + JSON-LD).
- `dosingNotes[]` — conservative ranges with “verify label / clinician” framing.
- `evidenceTable[]` — compound, evidence grade, human vs preclinical, key limitation (from runtime when available).
- `safetySection` — expanded bullet list (pregnancy, meds, stacking).
- `citations[]` — links to PubMed IDs or on-site methodology (from workbook study fields where populated).

**Herb/compound pages (workbook-first):**

- Extend workbook columns for: `typical_dose_range`, `evidence_summary_table`, `key_studies` (if not present).
- Run `npm run data:build` → surfaces in template sections (Evidence table, Dosing, Studies).
- Do **not** hand-edit `public/data/workbook-herbs.json`.

**Compare pages:**

- “Winner depends on…” decision matrix row.
- Safety comparison column.
- Link block back to `/goals/{slug}`.

### Tone guardrails

- Educational only; no treatment promises.
- Label evidence as strong / moderate / limited / preclinical.
- Surface uncertainty and population limits.

---

## Phase 3 — Conversion & monetization (priority 3)

### 3.1 Unified newsletter + lead magnet

**Files:** `content/emailCapture.ts`, new `components/monetization/SafetyChecklistLeadMagnet.tsx`, replace goal-page `EmailCapture` with `EmailCaptureBox`.

**Lead magnet copy:**

- Title: **Free Evidence-Based Supplement Safety Checklist (PDF)**
- Bullets: medication review, dose/form check, stacking risks, quality markers.
- Goal-specific variants reuse existing `leadMagnets` map; add `safety-checklist` goal key.

**Placement:**

- Goals (after comparison table).
- Herb/compound (after safety section, before affiliate).
- `/supplement-safety-checklist` as primary landing page.
- Footer site-wide slim bar (optional, Phase 3b).

**Provider:** Wire `NEXT_PUBLIC_EMAIL_CAPTURE_ACTION` (Mailchimp/ConvertKit) — keep honest “coming soon” when unset.

### 3.2 Affiliate trust upgrades

**Files:** `components/RecommendationSection.tsx`, `src/components/sourcing/SourcingCta.tsx`, new `components/monetization/WhyWeRecommend.tsx`.

**“Why we recommend” block (per product slot):**

- Selection criteria: third-party testing, standardization, dose transparency.
- Link to `/learn/product-quality` and `/affiliate-disclosure`.
- No star ratings unless sourced from verifiable data.

### 3.3 Non-intrusive prompts

**New client component:** `components/monetization/ScrollEngagementPrompt.tsx`

| Trigger | Behavior | Guardrails |
|---------|----------|------------|
| Scroll 65% on goal/herb | Slide-in card, dismissible | `sessionStorage` — once per session |
| Exit intent (desktop only) | Safety checklist CTA | Disabled on mobile; respect `prefers-reduced-motion` |

**Do not use:** full-screen modals, timer spam, second popup on same page.

### 3.4 Analytics hooks

Extend `lib/revenue-tracking.ts` events: `lead_magnet_view`, `lead_magnet_submit`, `affiliate_why_expand`.

---

## Phase 4 — Technical polish (priority 4)

### 4.1 Performance (Core Web Vitals)

**Files:** `next.config.mjs`, herb/compare client components, `app/globals.css`

- Audit LCP: reduce font blocking (`@fontsource` — subset or `display: swap` if not set).
- Lazy-load below-fold tables and recommendation grids.
- Explicit `width`/`height` on any remaining `<img>` tags.
- Preconnect to Amazon only on pages with affiliate CTAs ( sparingly ).
- Document that `images.unoptimized` is required for static export unless migrating to Cloudflare Images + custom loader (out of scope unless approved).

### 4.2 Mobile UX — compare & safety tools

**Files:** `src/components/safety/SafetyCheckerClient.tsx`, compare table in `app/compare/[slug]/page.tsx`

- Sticky first column or card layout `< md` for wide tables.
- Touch targets ≥44px on checkboxes and “add to stack” controls.
- Test iOS Safari horizontal scroll for comparison tables.

### 4.3 Freshness signals

**New:** `components/editorial/LastUpdatedBadge.tsx`

- Source: `reviewed_date` / `updated_at` from runtime record, else git date from build script.
- Display on: herb, compound, goal, compare flagship pages.
- Optional: `dateModified` in JSON-LD aligned with badge.

### 4.4 Accessibility

- Ensure scroll/exit prompts trap focus and are keyboard-dismissible.
- Table headers associated with `scope="col"`.
- Affiliate links: visible “sponsored” context (already partially via disclosure).

---

## Implementation order & file touch list

```
Phase 1 (SEO foundation)
├── src/lib/seo.ts                    # domain unify, buildPageMetadata, FAQ helpers
├── app/goals/[goal]/page.tsx         # metadata + linking + FAQ content hooks
├── data/goals.ts                     # seo fields, faqItems, evidence tables
├── app/herbs/[slug]/page.tsx         # goal links, freshness badge, schema fix
├── app/compounds/[slug]/page.tsx     # same
├── app/sitemap.ts                    # route additions
├── lib/goal-hub-links.ts             # NEW internal link resolver
└── components/seo/StructuredData.tsx # optional DRY

Phase 2 (content)
├── data/goals.ts                     # expanded sections
├── data-sources/herb_monograph_master.xlsx  # new columns (if needed)
├── scripts/* (existing pipeline)       # map new workbook fields
└── app/goals/[goal]/page.tsx         # render new sections

Phase 3 (conversion)
├── content/emailCapture.ts
├── components/monetization/*
├── app/goals/[goal]/page.tsx
└── components/RecommendationSection.tsx

Phase 4 (polish)
├── components/editorial/LastUpdatedBadge.tsx
├── src/components/safety/SafetyCheckerClient.tsx
└── app/globals.css / font loading
```

---

## Validation checklist (post-implementation)

- [ ] `npm run validate:workbook-source` (if workbook touched)
- [ ] `npm run data:build` (if workbook touched)
- [ ] `npm run build` — static export succeeds
- [ ] Spot-check rendered HTML: one goal, one herb, one compound, one compare
- [ ] Google Rich Results Test on goal FAQ + herb MedicalWebPage
- [ ] Confirm all canonicals use apex domain, trailing slashes consistent
- [ ] Lighthouse mobile on `/goals/sleep`, `/safety-checker`, `/compare/ashwagandha-vs-rhodiola-for-stress`
- [ ] No edits to `public/data/workbook-*.json` by hand

---

## Risks & constraints

| Risk | Mitigation |
|------|------------|
| YMYL / medical claims | Keep “educational only”; no cure language |
| Thin auto-compare pages | Index governance; strengthen flagship compares first |
| Schema spam | FAQ JSON-LD only where visible content exists |
| Affiliate trust | Disclosure above fold on monetized sections |
| Workbook drift | CI validate + data:build before merge |

---

## Success metrics (90-day)

| Metric | Target direction |
|--------|------------------|
| GSC impressions on `/goals/*`, `/best-supplements-*` | +30–50% |
| Average position for “best supplements for sleep” cluster | Top 20 → top 10 |
| Affiliate CTR (tracked) | +15% on herb pages with recommendations |
| Email signups | Baseline + lead magnet landing; track by `location` param |
| Core Web Vitals | LCP < 2.5s mobile on key templates |

---

## Out of scope (unless you approve later)

- Migrating off static export for dynamic OG images or API routes
- Paid search / ad landing pages
- Full Mailchimp automation setup (code hooks only)
- Rewriting entire herb library in one pass
- Dark mode (per AGENTS.md)

---

## Approval requested

Please confirm or adjust:

1. **Canonical host:** `https://thehippiescientist.net` (no www) — OK?
2. **Title pattern:** Year suffix “2026” on money pages — OK?
3. **Phase order:** 1 → 2 → 3 → 4 as listed — OK?
4. **Content depth:** Workbook column additions for top herbs vs. goals-only expansion in `data/goals.ts` first?
5. **Exit-intent popup:** Approve desktop-only, session-once behavior — or skip entirely?
6. **Auto-compare noindex:** Aggressive (many URLs) vs. conservative (flagship only) — preference?

Reply with approval or edits; implementation will begin only after your go-ahead.