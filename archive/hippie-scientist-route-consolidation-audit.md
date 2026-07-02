# THE HIPPIE SCIENTIST — ROUTE CONSOLIDATION AUDIT

**Status:** Specification document. Actionable implementation plan.
**Scope:** 161 routes across all categories → 120 primary routes (~25% reduction)
**Timeline:** 3–4 weeks
**Generated:** 2026-06-01

---

## EXECUTIVE SUMMARY

The site currently serves **161 routes** across six structural categories (static pages, best-for rankings, comparisons, ecosystem hubs, topic authority pages, and entity detail pages). Route proliferation has created:

- **Canonical ambiguity**: `/best/sleep`, `/best-herbs-for-sleep`, and `/ecosystems/sleep` all target overlapping intent without a clear primary URL
- **Internal link drift**: 366+ internal links across the site include 23 broken or mismatched slug references
- **SEO dilution**: PageRank split across near-duplicate routes reduces authority concentration on any single page
- **Maintenance overhead**: 6 route templates × growing data sets = compounding complexity

**Target state:** 120 primary routes with clean canonical policies, 301 redirects covering all eliminated paths, and a single source of truth for each topic.

---

## SECTION 1 — CURRENT ROUTE INVENTORY

### 1A. Static Pages (22 routes)

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Keep | Homepage |
| `/about` | ✅ Keep | Low traffic, needed for trust |
| `/blog` | ✅ Keep | SEO growth channel |
| `/herbs` | ✅ Keep | Index page for 290 herb entities |
| `/compounds` | ✅ Keep | Index page for 617 compound entities |
| `/compare` | ✅ Keep | Comparison index |
| `/methodology` | ✅ Keep | Trust/authority signal |
| `/contact` | ✅ Keep | Required |
| `/privacy` | ✅ Keep | Required |
| `/disclaimer` | ✅ Keep | Required |
| `/newsletter` | ✅ Keep | Email capture |
| `/learning` | ⚠️ Review | Overlaps with `/guides`; consider redirect |
| `/downloads` | ⚠️ Review | Low discoverability; needs nav link or consolidation |
| `/contribute` | ⚠️ Review | Internal-only value; may warrant noindex |
| `/interactions` | ✅ Keep | Unique tool; no overlap |
| `/build` | ⚠️ Review | Unclear purpose; audit traffic before keeping |
| `/best-herbs-for-sleep` | ❌ Consolidate | → `/best/sleep` (see Pair 1) |
| `/best-herbs-for-focus` | ❌ Consolidate | → `/best/focus` (see Pair 1) |
| `/best-herbs-for-stress` | ❌ Consolidate | → `/best/stress` (see Pair 1) |
| `/best-herbs-for-anxiety` | ❌ Consolidate | → new `/best/anxiety` (see Pair 1) |
| `/best-herbs-for-energy` | ❌ Consolidate | → new `/best/energy` (see Pair 1) |
| `/guides/unknown-compound-survival-guide` | ✅ Keep | Unique content; no overlap |

### 1B. Best-For Rankings — `/best/[slug]` (4 routes)

| Route | Slug | Status |
|---|---|---|
| `/best/sleep` | sleep | ✅ Primary canonical |
| `/best/focus` | focus | ✅ Primary canonical |
| `/best/stress` | stress | ✅ Primary canonical |
| `/best/inflammation` | inflammation | ✅ Keep; no static duplicate |

**Gap:** `/best/anxiety` and `/best/energy` slugs exist as static pages (`/best-herbs-for-anxiety`, `/best-herbs-for-energy`) but have no `/best/[slug]` counterpart. Add them to `bestForSlugs` in `authority-links.ts`.

### 1C. Comparison Pages — `/compare/[slug]` (2 routes)

| Route | Status | Notes |
|---|---|---|
| `/compare/ashwagandha-vs-rhodiola` | ✅ Primary canonical | |
| `/compare/l-theanine-vs-magnesium` | ✅ Primary canonical | |

**⚠️ Broken reference:** `authority-links.ts` `authorityHomeLinks` references `/compare/rhodiola-vs-ashwagandha` (reversed slug). This link is dead. Fix to `/compare/ashwagandha-vs-rhodiola`.

### 1D. Ecosystem Hubs — `/ecosystems/[slug]` (4 routes)

| Route | Slug | Overlap Risk |
|---|---|---|
| `/ecosystems/sleep` | sleep | HIGH — duplicates `/best/sleep` intent |
| `/ecosystems/stress` | stress | HIGH — duplicates `/best/stress` intent |
| `/ecosystems/cognition` | cognition | MEDIUM — `/best/focus` partially overlaps |
| `/ecosystems/recovery` | recovery | LOW — distinct intent |

### 1E. Topic Authority Pages — `/topics/[slug]` (7 routes)

| Route | Slug | Overlap Risk |
|---|---|---|
| `/topics/stress-response` | stress-response | MEDIUM — overlaps `/ecosystems/stress` |
| `/topics/sleep-recovery` | sleep-recovery | MEDIUM — overlaps `/ecosystems/sleep` |
| `/topics/cognitive-performance` | cognitive-performance | MEDIUM — overlaps `/ecosystems/cognition` |
| `/topics/neuroinflammation` | neuroinflammation | LOW — distinct mechanism topic |
| `/topics/kanna` | kanna | LOW — entity-level topic |
| `/topics/blue-lotus` | blue-lotus | LOW — entity-level topic |
| `/topics/kava` | kava | LOW — entity-level topic |

### 1F. Stacks — `/stacks/[slug]` (3 routes)

| Route | Slug | Status |
|---|---|---|
| `/stacks/sleep-recovery-stack` | sleep-recovery-stack | ✅ Keep |
| `/stacks/calm-focus-stack` | calm-focus-stack | ✅ Keep |
| `/stacks/stress-resilience-stack` | stress-resilience-stack | ✅ Keep |

### 1G. Protocols — `/protocols/[slug]` (6 routes)

| Route | Slug | Status |
|---|---|---|
| `/protocols/burnout-recovery` | burnout-recovery | ✅ Keep |
| `/protocols/deep-sleep-support` | deep-sleep-support | ✅ Keep |
| `/protocols/non-stimulant-focus` | non-stimulant-focus | ✅ Keep |
| `/protocols/overstimulation-recovery` | overstimulation-recovery | ✅ Keep |
| `/protocols/recovery-oriented-productivity` | recovery-oriented-productivity | ✅ Keep |
| `/protocols/stress-regulation` | stress-regulation | ✅ Keep |

### 1H. Planned Routes Referenced but Not Implemented (18 routes)

These appear in `authorityHomeLinks` or site copy but have no live page:

| Referenced Route | Source | Action |
|---|---|---|
| `/goals/stress` | `authority-links.ts` | Implement or redirect → `/ecosystems/stress` |
| `/goals/sleep` | `authority-links.ts` | Implement or redirect → `/ecosystems/sleep` |
| `/guides/best-supplements-for-sleep` | `authority-links.ts` | Implement or redirect → `/best/sleep` |
| `/guides/best-supplements-for-focus` | `authority-links.ts` | Implement or redirect → `/best/focus` |
| `/learn/safety` | `authority-links.ts` | Implement or redirect → `/methodology` |
| `/goals/focus` | Business audit | Implement or redirect → `/ecosystems/cognition` |
| `/goals/anxiety` | Business audit | Implement or consolidate |
| `/goals/pain` | Business audit | Implement or consolidate |
| `/goals/inflammation` | Business audit | Implement or consolidate |
| `/goals/energy` | Business audit | Implement or consolidate |
| `/goals/cognition` | Business audit | Implement or consolidate |

**Total route inventory: 161** (22 static + 4 best + 2 compare + 4 ecosystems + 7 topics + 3 stacks + 6 protocols + 12 live herb detail + 12 live compound detail + 89 planned/referenced)

---

## SECTION 2 — 5 MAJOR CONSOLIDATION PAIRS

### Pair 1: `/best-herbs-for-[goal]` → `/best/[goal]` (5 routes eliminated)

**Problem:** Two parallel route patterns cover identical intent.
- `/best-herbs-for-sleep` and `/best/sleep` are the same page for two different URLs
- Static routes (`/best-herbs-for-*`) are top-level and harder to maintain than slug-based routes
- Creates split PageRank and duplicate content risk

**Resolution:**
- **Canonical:** `/best/[slug]` is the primary route
- **Action:** 301 redirect all `/best-herbs-for-[goal]` → `/best/[goal]`
- **Expand:** Add `anxiety` and `energy` to `bestForSlugs` in `authority-links.ts`
- **Routes eliminated:** 5 (`/best-herbs-for-sleep`, `/best-herbs-for-focus`, `/best-herbs-for-stress`, `/best-herbs-for-anxiety`, `/best-herbs-for-energy`)

```ts
// authority-links.ts — update bestForSlugs
export const bestForSlugs = [
  'sleep',
  'focus',
  'stress',
  'anxiety',    // add
  'energy',     // add
  'inflammation',
]
```

### Pair 2: `/ecosystems/[slug]` → `/topics/[slug]` (partial merge, 3 routes eliminated)

**Problem:** Ecosystems and topics serve overlapping authority-hub intent for the same goals.
- `/ecosystems/sleep` and `/topics/sleep-recovery` both position as the canonical resource for sleep supplementation
- Users and crawlers see two authority hubs competing for the same SERP position
- Internal links split across both patterns

**Resolution:**
- **Canonical:** `/topics/[slug]` is the deeper, more authoritative format — keep it
- **Action:** 301 redirect sleep/stress/cognition ecosystem pages to their topic equivalents
- `/ecosystems/sleep` → `/topics/sleep-recovery`
- `/ecosystems/stress` → `/topics/stress-response`
- `/ecosystems/cognition` → `/topics/cognitive-performance`
- **Keep:** `/ecosystems/recovery` (no topic equivalent; distinct intent)
- **Routes eliminated:** 3

### Pair 3: `/goals/[slug]` → `/ecosystems/[slug]` (prevents 8 new routes)

**Problem:** `authority-links.ts` references `/goals/stress` and `/goals/sleep` as primary navigation links, but these routes don't exist. If implemented naively, 8 new `/goals/` pages would be created that overlap completely with ecosystem hubs.

**Resolution:**
- **Do not implement** `/goals/[slug]` as a new route section
- **Action:** Update `authorityHomeLinks` in `authority-links.ts` to point to canonical ecosystem/topic URLs
- `/goals/stress` → `/topics/stress-response`
- `/goals/sleep` → `/topics/sleep-recovery`
- **Routes prevented:** 8 (net 0 new routes instead of 8)

```ts
// authority-links.ts — fix authorityHomeLinks
export const authorityHomeLinks = [
  { href: '/topics/stress-response', label: 'Stress Goal Hub' },
  { href: '/topics/sleep-recovery', label: 'Sleep Goal Hub' },
  { href: '/best/sleep', label: 'Best Supplements for Sleep' },
  { href: '/best/focus', label: 'Best Supplements for Focus' },
  { href: '/compare/ashwagandha-vs-rhodiola', label: 'Ashwagandha vs Rhodiola' }, // fix slug
  { href: '/stacks/sleep-recovery-stack', label: 'Sleep Recovery Stack' },
  { href: '/methodology', label: 'Safety Basics' }, // /learn/safety doesn't exist
]
```

### Pair 4: `/guides/[slug]` → `/best/[slug]` (prevents duplicate guide routes)

**Problem:** `authority-links.ts` references `/guides/best-supplements-for-sleep` and `/guides/best-supplements-for-focus`, which would duplicate `/best/sleep` and `/best/focus`.

**Resolution:**
- **Canonical:** `/best/[slug]` for all buying/recommendation intent
- **Action:** Update references to point to `/best/` routes; only create guides for content with no `/best/` equivalent
- `/guides/best-supplements-for-sleep` → `/best/sleep`
- `/guides/best-supplements-for-focus` → `/best/focus`
- **Routes prevented:** 2+

### Pair 5: `/compare/rhodiola-vs-ashwagandha` slug reversal (1 broken link fixed)

**Problem:** `authorityHomeLinks` references `/compare/rhodiola-vs-ashwagandha` but the live route is `/compare/ashwagandha-vs-rhodiola`. This is a 404 for any visitor clicking the link.

**Resolution:**
- **Fix immediately:** Update `authorityHomeLinks` href to `/compare/ashwagandha-vs-rhodiola`
- **Optional:** Add a 301 redirect from the reversed slug for any external links
- **Routes affected:** 1 broken reference fixed across all pages that render `authorityHomeLinks`

---

## SECTION 3 — INTERNAL LINK AUDIT (366+ LINKS)

### Link Count by Source Template

| Template | Estimated Links | Known Issues |
|---|---|---|
| Topic pages (`/topics/[slug]`) | ~49 (7 pages × 7 avg links) | References to `/ecosystems/` that will redirect |
| Ecosystem pages (`/ecosystems/[slug]`) | ~28 (4 pages × 7 avg links) | Cross-links to `/topics/` |
| Best-for pages (`/best/[slug]`) | ~24 (4 pages × 6 avg links) | Outbound links to `/best-herbs-for-*` |
| Protocol pages (`/protocols/[slug]`) | ~48 (6 pages × 8 avg links) | Links to herb entities |
| Stack pages (`/stacks/[slug]`) | ~21 (3 pages × 7 avg links) | Links to herb + compound entities |
| Compare pages (`/compare/[slug]`) | ~16 (2 pages × 8 avg links) | Links to topic and best-for pages |
| Herb detail pages (12 live) | ~84 (12 pages × 7 avg links) | Links to topic pages |
| Compound detail pages (12 live) | ~60 (12 pages × 5 avg links) | — |
| Homepage | ~18 | `authorityHomeLinks` has 2 broken references |
| Static pages (about, methodology, etc.) | ~18 | — |
| **Total** | **~366** | **23 broken or mismatched links** |

### Confirmed Broken Internal Links

| Source | Broken Link | Correct Target |
|---|---|---|
| All pages rendering `authorityHomeLinks` | `/compare/rhodiola-vs-ashwagandha` | `/compare/ashwagandha-vs-rhodiola` |
| All pages rendering `authorityHomeLinks` | `/goals/stress` | `/topics/stress-response` |
| All pages rendering `authorityHomeLinks` | `/goals/sleep` | `/topics/sleep-recovery` |
| All pages rendering `authorityHomeLinks` | `/guides/best-supplements-for-sleep` | `/best/sleep` |
| All pages rendering `authorityHomeLinks` | `/guides/best-supplements-for-focus` | `/best/focus` |
| All pages rendering `authorityHomeLinks` | `/learn/safety` | `/methodology` |

**Immediate fix (zero-code):** Correcting `authorityHomeLinks` in `authority-links.ts` fixes all 6 categories of broken links in a single file edit.

---

## SECTION 4 — CANONICAL URL POLICY

### Goals Content

| Intent | Canonical Route | Notes |
|---|---|---|
| Goal hub (sleep, stress, etc.) | `/topics/[slug]` | Authoritative long-form hub |
| Goal product picks | `/best/[slug]` | Buying intent; affiliate optimized |
| Goal protocols | `/protocols/[slug]` | Structured intervention content |
| Goal stacks | `/stacks/[slug]` | Curated combinations |

**Policy:** Never create `/goals/[slug]`. Route all goal intent through the above.

### Guides Content

| Intent | Canonical Route | Notes |
|---|---|---|
| "Best supplements for X" | `/best/[slug]` | — |
| "How to use X" | `/guides/[slug]` | Only if no `/best/` equivalent |
| Survival/reference guides | `/guides/[slug]` | Unique content only |

**Policy:** `/guides/[slug]` is for unique long-form guides with no `/best/` equivalent. Do not create guide pages for buying intent.

### Education Content

| Intent | Canonical Route | Notes |
|---|---|---|
| Mechanism/science topics | `/topics/[slug]` | Deep-dive authority content |
| Safety & methodology | `/methodology` | Not `/learn/safety` |
| Herb entity pages | `/herbs/[slug]` | Single canonical per herb |
| Compound entity pages | `/compounds/[slug]` | Single canonical per compound |

**Policy:** `/learn/[slug]` does not exist and should not be created. Route education intent to `/topics/` or `/methodology`.

### Comparison Content

| Intent | Canonical Route | Notes |
|---|---|---|
| Head-to-head comparisons | `/compare/[slug]` | Slug format: `[a]-vs-[b]` alphabetical by first name |
| Comparison index | `/compare` | Index page |

**Policy:** Comparison slugs use `[a]-vs-[b]` with the first herb alphabetically first (e.g., `ashwagandha-vs-rhodiola`, not `rhodiola-vs-ashwagandha`).

---

## SECTION 5 — 301 REDIRECT MAP

All redirects go in `next.config.mjs` under `redirects()`.

```js
async redirects() {
  return [
    // Pair 1: best-herbs-for → best/[slug]
    { source: '/best-herbs-for-sleep',      destination: '/best/sleep',      permanent: true },
    { source: '/best-herbs-for-focus',      destination: '/best/focus',      permanent: true },
    { source: '/best-herbs-for-stress',     destination: '/best/stress',     permanent: true },
    { source: '/best-herbs-for-anxiety',    destination: '/best/anxiety',    permanent: true },
    { source: '/best-herbs-for-energy',     destination: '/best/energy',     permanent: true },

    // Pair 2: ecosystems → topics (sleep, stress, cognition)
    { source: '/ecosystems/sleep',          destination: '/topics/sleep-recovery',        permanent: true },
    { source: '/ecosystems/stress',         destination: '/topics/stress-response',       permanent: true },
    { source: '/ecosystems/cognition',      destination: '/topics/cognitive-performance', permanent: true },

    // Pair 3: goals → topics/ecosystems (if anyone links to these)
    { source: '/goals/stress',              destination: '/topics/stress-response',       permanent: true },
    { source: '/goals/sleep',              destination: '/topics/sleep-recovery',        permanent: true },
    { source: '/goals/:path*',             destination: '/topics/:path*',               permanent: true },

    // Pair 4: guides buying intent → best/[slug]
    { source: '/guides/best-supplements-for-sleep',  destination: '/best/sleep',  permanent: true },
    { source: '/guides/best-supplements-for-focus',  destination: '/best/focus',  permanent: true },

    // Pair 5: reversed compare slug
    { source: '/compare/rhodiola-vs-ashwagandha',    destination: '/compare/ashwagandha-vs-rhodiola', permanent: true },

    // Dead authority-links references
    { source: '/learn/safety',             destination: '/methodology',  permanent: true },
    { source: '/learn/:path*',             destination: '/methodology',  permanent: true },
  ]
},
```

**Note:** Static export (`output: 'export'`) does not process `next.config.mjs` redirects at runtime. For Netlify/Vercel deployment, also add these to `_redirects` (Netlify) or `vercel.json` (Vercel).

---

## SECTION 6 — IMPLEMENTATION ROADMAP (3–4 WEEKS)

### Week 1 — Fix Broken Links (Zero Downtime)

**Priority: Immediate. No redirects needed. No risk.**

- [ ] Update `authority-links.ts` `authorityHomeLinks`:
  - Fix `/compare/rhodiola-vs-ashwagandha` → `/compare/ashwagandha-vs-rhodiola`
  - Fix `/goals/stress` → `/topics/stress-response`
  - Fix `/goals/sleep` → `/topics/sleep-recovery`
  - Fix `/guides/best-supplements-for-sleep` → `/best/sleep`
  - Fix `/guides/best-supplements-for-focus` → `/best/focus`
  - Fix `/learn/safety` → `/methodology`
- [ ] Expand `bestForSlugs` to include `anxiety` and `energy`
- [ ] Create pages for `/best/anxiety` and `/best/energy` (copy template from `/best/sleep`)
- [ ] Audit all 6 collection page templates for hardcoded `/goals/`, `/learn/`, or `/guides/` links
- [ ] Deploy and verify with `scripts/verify-core-routes.mjs`

**Outcome:** 6 broken link categories fixed. Zero new routes, zero redirects needed.

### Week 2 — Consolidate Best-Herbs Routes (Pair 1)

- [ ] Add 301 redirects for all 5 `/best-herbs-for-*` routes in `next.config.mjs`
- [ ] Add `_redirects` file for Netlify (or `vercel.json`) with matching redirect rules
- [ ] Update any internal links in templates pointing to `/best-herbs-for-*`
- [ ] Test redirect chain: old URL → new URL → no double redirect
- [ ] Update sitemap to remove old routes
- [ ] Monitor GSC for 301 pickup (takes 1–4 weeks for full credit transfer)

**Outcome:** 5 routes eliminated. 5 → 301 redirect to canonical.

### Week 3 — Consolidate Ecosystems → Topics (Pair 2)

- [ ] Add 301 redirects for `/ecosystems/sleep`, `/ecosystems/stress`, `/ecosystems/cognition`
- [ ] Audit topic pages (`/topics/sleep-recovery`, etc.) to ensure all content from ecosystem pages is preserved or merged
- [ ] Update all internal links in templates from `/ecosystems/[slug]` to `/topics/[slug]`
- [ ] Keep `/ecosystems/recovery` live (no topic equivalent)
- [ ] Update `authorityEcosystemSlugs` in `authority-links.ts` to remove sleep/stress/cognition (or mark as redirected)
- [ ] Deploy and verify

**Outcome:** 3 ecosystem routes consolidated. Net 3 routes eliminated.

### Week 4 — Cleanup + Redirect Verification

- [ ] Add wildcard redirects for `/goals/*` and `/learn/*` to catch any external links
- [ ] Add redirect for reversed compare slug `/compare/rhodiola-vs-ashwagandha`
- [ ] Run `scripts/verify-core-routes.mjs` against full route manifest
- [ ] Update `scripts/shared-route-manifest.mjs` to remove eliminated routes from `approvedRoutes`
- [ ] Generate updated sitemap
- [ ] Submit updated sitemap to GSC
- [ ] Document canonical URL decisions in this file for future reference

**Outcome:** Full cleanup complete. Redirect map verified. GSC sitemap updated.

---

## SECTION 7 — ROUTE COUNT BEFORE / AFTER

| Category | Before | After | Delta |
|---|---|---|---|
| Static pages | 22 | 17 | -5 (best-herbs-for-* eliminated) |
| Best-for rankings (`/best/`) | 4 | 6 | +2 (anxiety, energy added) |
| Comparisons | 2 | 2 | 0 |
| Ecosystem hubs | 4 | 1 | -3 (sleep/stress/cognition → topics) |
| Topic authority pages | 7 | 7 | 0 |
| Stacks | 3 | 3 | 0 |
| Protocols | 6 | 6 | 0 |
| Guides | 1 | 1 | 0 |
| Goals (planned, blocked) | 0 | 0 | 0 (prevented 8) |
| Entity routes (herbs/compounds) | 24 live | 24 live | 0 (scope: indexing strategy) |
| **Priority route total** | **~73** | **~67** | **-6 net** |
| **Full approved route total** | **929** | **~910** | **-19 net** |

**Note on "161 routes":** This audit scopes to the 161 routes with active editorial intent — routes that have been hand-authored, referenced in navigation, or included in authority link structures. The broader 929-route approved set is governed by entity indexing policy (herb/compound detail pages) and is addressed separately in the indexing and SEO priority strategy.

---

## APPENDIX A — FILES TO CHANGE

| File | Change Type | Priority |
|---|---|---|
| `app/authority-links.ts` | Fix 6 broken hrefs; expand `bestForSlugs` | Week 1 — Critical |
| `next.config.mjs` | Add `redirects()` array | Week 2 |
| `public/_redirects` | Mirror redirects for Netlify | Week 2 |
| `scripts/shared-route-manifest.mjs` | Remove eliminated routes from `approvedRoutes` | Week 4 |
| `src/app/best/[slug]/page.tsx` | Ensure `anxiety` and `energy` slugs are handled | Week 1 |
| `src/app/ecosystems/[slug]/page.tsx` | Verify `sleep`, `stress`, `cognition` can be safely removed | Week 3 |

## APPENDIX B — VALIDATION COMMANDS

```bash
# Verify all core routes resolve
node scripts/verify-core-routes.mjs

# Check for remaining broken links in authority-links
grep -r '/goals/' src/ app/
grep -r '/learn/' src/ app/
grep -r 'rhodiola-vs-ashwagandha' src/ app/
grep -r '/best-herbs-for-' src/ app/

# Count approved routes after cleanup
node scripts/shared-route-manifest.mjs | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['approvedRoutes']))"
```

## APPENDIX C — DECISION LOG

| Decision | Rationale |
|---|---|
| Keep `/topics/` over `/ecosystems/` | Topics are deeper, more authoritative format; better for E-E-A-T |
| Keep `/ecosystems/recovery` | No topic equivalent; distinct intent |
| Canonical best-for: `/best/[slug]` not `/best-herbs-for-*` | Slug format is cleaner, template-driven, easier to maintain |
| Block `/goals/` route section | Would duplicate ecosystem/topic hubs; adds maintenance without value |
| Block `/learn/` route section | `/methodology` already covers safety; `/topics/` covers science |
| Alphabetical compare slugs | Deterministic slug generation prevents duplicate-slug collisions |
