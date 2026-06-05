# Performance, Schema & UX Plan — thehippiescientist.net

**Status:** Historical / Superseded (June 2, 2026 original; refreshed 2026-06-05 post cadd761c pull + fixes).  
**Date:** June 2, 2026 (with 2026-06-05 notes)  
**Scope:** Core Web Vitals, advanced JSON-LD (`@graph`), Suspense/skeleton UX — **100% compatible with `output: 'export'`**

**IMPORTANT (post-2026-06 pull + audit fixes):** This is historical roadmap. Many items (sitemap, schema/OG, a11y, pipeline orchestrate+guard, 404 legacies via DEPRECATED+params+redirects, build hygiene, data determinism) completed in phases + recent work (see commits 51131546, 7fcdafc8, cadd761c, merge notes). Current: verifies PASS, guard robust on win, structured audit relaxed for legacies but reps blocking. Refer to updated validation-report.md, NAVIGATION_UPGRADE_SUMMARY.md (phases 0-6 done), and active session plan for ongoing. Old unchecked tasks below largely done or low-pri now.

**Related audits:** `AUDIT_REPORT_20260602.md`, `PRIORITY_ACTION_PLAN.md` (external audit overstated some gaps; see corrections below)

---

## Executive summary

The production App Router site is already built for static export (`next.config.mjs`: `output: 'export'`, `images.unoptimized: true`). Most content is server-rendered at build time from workbook JSON; heavy interactivity lives in a **small set of client islands** (compare table, safety checker, search, index browsers, quiz, nav).

This plan prioritizes **measurable CWV wins** (fonts, image CLS, JS splitting) and **consolidated schema graphs** without touching the workbook pipeline or removing static export. Conversion work recently shipped (safety checklist promo, affiliate trust blocks) must remain intact.

**Estimated effort:** 3 phases, ~12–18 files, 1–2 days implementation + validation.

---

## Static export safety contract (read first)

Every item below is checked against `scripts/ci/validate-static-export-compatibility.mjs` and project `Agents.md`.

| Rule | Plan compliance |
|------|-----------------|
| Keep `output: 'export'` in `next.config.mjs` | ✅ No change to export mode |
| No `force-dynamic`, `revalidate`, `noStore`, route handlers | ✅ No new server runtime |
| No `next/headers`, `next/server`, `use server` | ✅ Not introduced |
| Data from workbook → `npm run data:build` at build | ✅ Schema/read paths use existing JSON only |
| `fetch({ cache: 'no-store' })` | ✅ Not used |
| `next/image` on static export | ✅ **Allowed** with `images.unoptimized: true` (already configured). Delivers width/height/sizes/priority for CLS/LCP; does not require Image Optimization API |
| `next/font` | ✅ Fully static-export compatible (self-hosted at build) |
| `loading.tsx` | ✅ Supported for statically generated App Router routes (emits static loading UI in `out/`) — use only on routes we statically generate |
| React `Suspense` + `dynamic()` imports | ✅ Compatible; reduces client JS and improves hydration UX. Does not enable SSR streaming at request time |
| JSON-LD `AggregateRating` | ⚠️ **Only when rating is visible on the page** (see Phase 3). Never invent ratings |

**Explicitly out of scope (unsafe or low ROI for static export):**

- ISR, PPR, middleware, edge functions, server actions
- Removing `images.unoptimized` without a custom static image pipeline (would break export or require pre-generated assets)
- `AggregateRating` on pages without displayed star ratings (manual action risk)

---

## Current state (codebase audit)

### Config & build

- **Config file:** `next.config.mjs` (not `.js`) — `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`
- **Build:** `npm run build` → `scripts/build-production.mjs` → `next build` (static HTML to `out/`)
- **CI guard:** `validate-static-export-compatibility.mjs` blocks forbidden patterns

### Images (`<img>` inventory — active App Router paths)

Only **one** `<img>` in the main `app/` + `components/` tree used in production UI:

| File | Usage | LCP relevance |
|------|--------|---------------|
| `components/AffiliateProductCard.tsx` | Product `imageUrl` when present | Medium (below fold on profile pages) |

**Legacy / unused in App Router (do not prioritize unless imported):**

- `src/components/HeroFeaturedHerb.tsx`, `src/components/RotatingHerbHero.tsx` — old SPA-era heroes, **not referenced from `app/`**

**OG/marketing assets:** `/og-default.png`, `/logo.png` via metadata — not `<img>` tags.

**Homepage LCP:** Text-heavy hero (`components/homepage-v2.tsx`) — no hero image. LCP = heading + fonts.

### Fonts

- `app/layout.tsx` imports full CSS packs:
  - `@fontsource/inter/index.css`
  - `@fontsource-variable/fraunces/index.css`
- `app/globals.css` already defines `--font-inter` / `--font-fraunces` theme tokens but they are **not wired** via `next/font` today → render-blocking CSS, no subsetting.

### Client JavaScript (high-impact bundles)

| Component | Route(s) | Notes |
|-----------|----------|--------|
| `components/compare-table-client.tsx` | `/compare/` | Large table + `lucide-react` icons; already in `<Suspense>` with text fallback |
| `src/components/safety/SafetyCheckerClient.tsx` | `/safety-checker/` | ~600 lines, loaded synchronously |
| `app/search/SearchClient.tsx` | `/search/` | Search index client |
| `app/herbs/HerbsIndexClient.tsx` | `/herbs/`, paginated | Suspense with `fallback={null}` |
| `app/compounds/CompoundsIndexClient.tsx` | `/compounds/` | Same pattern |
| `src/components/quiz/RecommendationQuiz.tsx` | `/start-here/quiz/` | Wizard |
| `src/components/Header.tsx` + nav | Global layout | Always loaded |
| `components/ClickTracker.tsx`, `CitationDrawer` | Global layout | Always loaded |

**No existing `dynamic()` imports** in app code — opportunity to code-split tool routes.

### JSON-LD (today)

- **Root:** `WebSite` + `Organization` inline in `app/layout.tsx`
- **Central helpers:** `src/lib/seo.ts` — `herbJsonLd`, `compoundJsonLd`, `faqPageJsonLd`, `breadcrumbJsonLd`, `collectionPageJsonLd`, `itemListJsonLd`, `productJsonLd`
- **Goals:** Multiple separate `<script>` blocks per page (`app/goals/[goal]/page.tsx`)
- **Profiles:** Separate MedicalWebPage + Breadcrumb + optional Product scripts
- **Gap:** No `@graph` with `@id` cross-linking; duplicate `@context` blocks; **no `AggregateRating`** (correct — ratings rarely shown)
- **AuthorityJsonLd:** `components/seo/AuthorityJsonLd.tsx` — separate scripts, not graph-linked

### SEO / conversion (recent work — preserve)

- Goal SEO titles/descriptions: `src/lib/goal-seo.ts`
- Lead magnet: `SafetyChecklistPromo`, `StickyChecklistBar`
- Affiliate trust: `ProductTrustAffiliate`, `GoalTopAffiliatePicks`
- Do not regress metadata, affiliate tags (`config/affiliate.ts`), or route contracts

### Audit report corrections

| External audit claim | Actual codebase state |
|---------------------|------------------------|
| "No JSON-LD" | ❌ Incorrect — extensive JSON-LD exists |
| "Sitemap binary" | Likely crawler/tool issue; `app/sitemap.ts` is standard Next metadata route — verify in `out/sitemap.xml` after build |
| "Loading states hurt SEO" | Partially valid for **client** tools; fix via skeletons + static shell content (already good on compare hero) |

---

## Phase 1 — Core Web Vitals optimization

### 1.1 Fonts → `next/font` (high impact, static-safe)

**Files:** `app/layout.tsx`, remove `@fontsource/*` imports from layout.

**Implementation:**

```ts
import { Inter, Fraunces } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
const fraunces = Fraunces({ subsets: ['latin'], display: 'swap', variable: '--font-fraunces' })
```

- Apply `className={`${inter.variable} ${fraunces.variable}`}` on `<html>` or `<body>`
- Keep existing Tailwind `font-sans` / `font-display` tokens in `globals.css`
- **Optional:** `preload: true` only for Inter (body); Fraunces is display — load normally

**Static export:** ✅ Fonts inlined/self-hosted at build.

**Expected CWV:** Better LCP (less render-blocking CSS), improved FCP.

### 1.2 Replace `<img>` with `next/image` (scoped)

**Files:**

- `components/AffiliateProductCard.tsx` — primary change
- Add `components/ui/OptimizedImage.tsx` thin wrapper (optional) enforcing `quality={85}`, default `sizes`, alt text rules

**Pattern (with `unoptimized: true`):**

```tsx
import Image from 'next/image'
<Image src={imageUrl} alt={title} width={400} height={300} sizes="(max-width: 768px) 100vw, 33vw" quality={85} className="..." />
```

- Fix empty `alt=''` → use product title
- `loading="lazy"` default; `priority` only if ever above fold

**Legacy `src/components/*` img tags:** Leave untouched unless referenced; document as dead code.

**Static export:** ✅ Requires `images.unoptimized: true` (keep in config).

### 1.3 Minimize client JavaScript (medium impact)

**Strategy:** `next/dynamic` + `ssr: true` for heavy tools (still pre-rendered at build with props).

| Target | Change |
|--------|--------|
| `SafetyCheckerClient` | Dynamic import in `app/safety-checker/page.tsx` |
| `CompareTableClient` | Dynamic import in `app/compare/page.tsx` (keep Suspense) |
| `SearchClient` | Dynamic import in `app/search/page.tsx` |
| `RecommendationQuiz` | Dynamic import in `app/start-here/quiz/page.tsx` |
| `HerbsIndexClient` / `CompoundsIndexClient` | Dynamic import (optional phase 1b) |

**Global layout:** Defer non-critical UI:

- `CitationDrawer` → dynamic with `ssr: false` **only if** drawer is not needed for SEO (interactive only) — reduces HTML size
- `ClickTracker` → keep small or load after idle (`requestIdleCallback` pattern inside component)

**Icons:** Audit `lucide-react` imports in `compare-table-client.tsx` — import named icons only (already should be tree-shaken); verify bundle in build analyzer.

**Static export:** ✅ Code splitting only; no server runtime.

### 1.4 Minor CWV polish

- Add `fetchPriority="high"` on LCP text container? N/A — no LCP image on homepage
- Ensure GA4 scripts remain `afterInteractive` (already in layout)
- Preconnect to Amazon only on pages with affiliate CTAs (optional `<link rel="preconnect">` via metadata on herb/compound/goal templates)

---

## Phase 2 — React Suspense + skeleton loaders

### 2.1 Base component

**New:** `components/ui/Skeleton.tsx`

- Shimmer via CSS animation (no extra deps)
- Variants: `line`, `block`, `circle` via props or className
- Accessible: `aria-busy="true"`, `aria-label="Loading content"`

### 2.2 Skeleton compositions

**New folder:** `components/skeletons/`

| File | Mimics |
|------|--------|
| `EvidenceCardSkeleton.tsx` | `EvidenceClaimCard` layout (for evidence-engine goal pages if we add client wrapper) |
| `CompareTableSkeleton.tsx` | Filter bar + 5–6 table rows |
| `GoalHeroSkeleton.tsx` | Goal hero shell (eyebrow, h1, 2 lines) — for optional loading.tsx |
| `WizardSkeleton.tsx` | Quiz steps / safety wizard columns |
| `index.ts` | Barrel exports |

### 2.3 Suspense integration points

| Route | Current fallback | New fallback |
|-------|------------------|--------------|
| `app/compare/page.tsx` | Text: "Preparing comparison filters..." | `<CompareTableSkeleton />` |
| `app/safety-checker/page.tsx` | None (sync client) | Wrap dynamic `SafetyCheckerClient` in `<Suspense fallback={<WizardSkeleton />}>` |
| `app/search/page.tsx` | TBD | `<CompareTableSkeleton />` or dedicated `SearchSkeleton` (minimal) |
| `app/start-here/quiz/page.tsx` | None | `<WizardSkeleton />` |
| `app/herbs/page.tsx` | `fallback={null}` | Lightweight grid skeleton (3×2 cards) — optional |
| `app/goals/[goal]/page.tsx` | N/A (server) | No Suspense unless dynamic subsection added |

**Evidence cards:** `EvidenceClaimCard` is a **server component** — skeleton applies only if we lazy-load a client bundle for the claim grid (optional, lower priority). Prefer static HTML at build for SEO.

### 2.4 `loading.tsx` (static-export safe routes only)

Add only where routes are **fully static** at build:

| File | Purpose |
|------|---------|
| `app/compare/loading.tsx` | Instant shell while navigating (static export generates loading HTML) |
| `app/safety-checker/loading.tsx` | Wizard skeleton |
| `app/search/loading.tsx` | Search skeleton |
| `app/start-here/quiz/loading.tsx` | Quiz skeleton |

**Do NOT add** `loading.tsx` under dynamic slug routes with huge `generateStaticParams` unless we confirm Next 15 export behavior for those segments (risk: multiplies build artifacts). Prefer Suspense on page for `[slug]` routes.

**Static export:** ✅ Per Next.js static export docs, `loading.js` is emitted as static fallback UI.

---

## Phase 3 — Advanced schema markup (`@graph`)

### 3.1 New helper module

**New:** `src/lib/schema-graph.ts` (or extend `src/lib/seo.ts`)

```ts
buildSchemaGraph({ pageId, nodes: SchemaNode[] })
```

- Single `<script type="application/ld+json">` per page
- `@context: https://schema.org`
- `@graph: [...]` with stable `@id` URLs:
  - `{canonical}#webpage`
  - `{canonical}#breadcrumb`
  - `{canonical}#faq` (if visible FAQ)
  - `{canonical}#product` (if affiliate product visible)
  - `{canonical}#offers` (nested under Product)

**Linking pattern:**

```json
{
  "@type": "MedicalWebPage",
  "@id": "https://thehippiescientist.net/herbs/ashwagandha/#webpage",
  "breadcrumb": { "@id": "https://thehippiescientist.net/herbs/ashwagandha/#breadcrumb" },
  "mainEntity": { "@id": "https://thehippiescientist.net/herbs/ashwagandha/#product" }
}
```

### 3.2 Page rollout (priority templates)

| Template | Graph nodes |
|----------|-------------|
| `app/herbs/[slug]/page.tsx` | MedicalWebPage, BreadcrumbList, Product+Offer (if affiliate visible), FAQPage (if on-page FAQ added later) |
| `app/compounds/[slug]/page.tsx` | Same |
| `app/goals/[goal]/page.tsx` | CollectionPage or MedicalWebPage, BreadcrumbList, FAQPage (visible FAQ from `data/goal-content.ts`), ItemList |
| `app/safety-checker/page.tsx` | MedicalWebPage + Breadcrumb (migrate off duplicate AuthorityJsonLd scripts) |
| `app/compare/page.tsx` | CollectionPage + Breadcrumb (lightweight) |

**Merge** multiple inline scripts into one graph component:

**New:** `components/seo/SchemaGraphScript.tsx` — accepts graph object, renders one script tag.

### 3.3 Product + Offer + AggregateRating policy

| Field | Rule |
|-------|------|
| `Product` | Only when affiliate CTA block is rendered (same condition as today `productJsonLd`) |
| `Offer` | `url` = affiliate URL; `availability` = OnlineOnly; no fake price |
| `AggregateRating` | **Emit only if** `product.rating` is rendered in visible UI (`AffiliateProductCard` shows rating). Include `ratingValue`, `bestRating: 5`, `ratingCount` **only if** we have real count from data (otherwise omit AggregateRating entirely) |

**Never** add ratings to goal/herb pages without visible stars.

### 3.4 Root layout

- Keep global `WebSite` + `Organization` as separate minimal scripts OR fold into a site-wide graph on homepage only — avoid duplicating Organization on every page (optional cleanup: Organization once in layout, page-specific graph excludes duplicate WebSite).

---

## Phase 4 — Preserve conversion & affiliate (regression guard)

No changes to:

- `config/affiliate.ts`, `config/revenue-products.ts`
- `SafetyChecklistPromo`, `StickyChecklistBar`, `GoalTopAffiliatePicks`, `ProductTrustAffiliate`
- `content/emailCapture.ts` provider wiring

**Verify after implementation:**

- Affiliate links retain `rel="nofollow sponsored noopener noreferrer"`
- `trackRevenueEvent` still fires on product clicks
- Goal pages still show 2–4 affiliate picks

---

## File touch list (implementation preview)

```
Phase 1
├── next.config.mjs                    # confirm images.unoptimized unchanged
├── app/layout.tsx                     # next/font, remove fontsource CSS imports
├── components/AffiliateProductCard.tsx
├── app/safety-checker/page.tsx        # dynamic import
├── app/compare/page.tsx
├── app/search/page.tsx
├── app/start-here/quiz/page.tsx

Phase 2
├── components/ui/Skeleton.tsx
├── components/skeletons/*.tsx
├── components/skeletons/index.ts
├── app/compare/loading.tsx
├── app/safety-checker/loading.tsx
├── app/search/loading.tsx
├── app/start-here/quiz/loading.tsx

Phase 3
├── src/lib/schema-graph.ts
├── components/seo/SchemaGraphScript.tsx
├── app/herbs/[slug]/page.tsx
├── app/compounds/[slug]/page.tsx
├── app/goals/[goal]/page.tsx
├── app/safety-checker/page.tsx
```

**Not modified:** `data-sources/*`, `public/data/workbook-*.json` (hand-edit forbidden), route slug contracts.

---

## Testing & validation (post-implementation)

1. `npm run validate:static-export` (or full `npm run check:ui`)
2. `npm run build` — must complete; inspect `out/` for `loading.html` siblings where added
3. `npx serve out` — manual check: compare, safety-checker, goals/sleep, herbs/ashwagandha
4. [PageSpeed Insights](https://pagespeed.web.dev/) — mobile homepage, `/goals/sleep/`, `/safety-checker/`, herb profile
5. [Google Rich Results Test](https://search.google.com/test/rich-results) — goal FAQ, herb profile graph
6. [Schema Markup Validator](https://validator.schema.org/) — confirm single graph, no orphan nodes
7. `npm run audit:structured-data` (existing CI script) if present in workflow
8. Affiliate smoke test — one Amazon link click tracking in network tab

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Larger graph JSON on every page | One script tag vs many; keep graph lean |
| Dynamic import flash on slow devices | Static shell + skeleton + server-rendered hero text |
| `loading.tsx` build size | Only on 4 tool routes |
| Font shift after next/font | Match current weights (400/600/700) and variable axes |
| Breaking Suspense on static export | Test `out/` navigation locally |

---

## Implementation order (after approval)

1. Phase 1.1 Fonts (`next/font`)
2. Phase 1.2 Image component
3. Phase 2 Skeletons + Suspense/dynamic on tools
4. Phase 3 Schema graph (herb → compound → goal → tools)
5. Phase 1.3b Optional layout deferrals (CitationDrawer)
6. Full build + audits

---

## Approval checklist

Please confirm:

1. ✅ Proceed with **`next/font`** replacing `@fontsource` CSS imports?
2. ✅ **`images.unoptimized: true`** stays (Next/Image for layout only)?
3. ✅ **`AggregateRating` omitted** unless product rating is visible (recommended)?
4. ✅ Add **`loading.tsx`** on compare / safety-checker / search / quiz only?
5. ✅ Consolidate JSON-LD to **`@graph`** on herb, compound, goal, safety-checker first?

Reply **approved** (with any edits) to begin implementation with per-file diffs.

---

## 2026-06-05 Post-Audit Upgrades & Fixes Activation (auto-approved)
Per user: "once audit finishes, auto approve and commence fixes and updates. commit merge and pull when done."

Full plan + audit findings + APPROVED marker in session plan file (outside tree for this worktree session). 

**Activated (surgical, AGENTS.md compliant):**
- Phase 1 Data/Pipeline: issues.csv dry-run reviewed (61 SKIP-REFERENCED by ref checks; 0 net change applied conservatively), guard extended to whitelist cleanup process, Pagefind wired to orchestrate-build + build-deploy (cross-plat script fix), validation-report checklist completed, docs/data-pipeline.md updated.
- fontsource prune: already absent.
- Later phases per plan (legacy src audit/deletes, /about E-E-A-T polish, linking, content lean updates) with full re-validation after each.
- All changes: minimal, run `npm run data:build` (no xlsx touch) + guard + verify-redirects/core + check + build + a11y + audits after edits. No manual public/data, preserve routes, static export.

See: docs/internal/validation-report.md (updated), audit-execution.log, session plan.md. Commit will reference this + plan.

Status: In progress (this activation); final commit/merge/pull at end.