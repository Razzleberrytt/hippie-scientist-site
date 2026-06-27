# Production Gate Audit — `guides/best-supplements-for-sleep`

**File:** `app/guides/best-supplements-for-sleep/page.tsx`
**Date:** 2026-06-16
**Auditor:** Antigravity — Senior Biomedical Reviewer / EEAT Editor / Technical SEO
**Role:** Production gatekeeper. Not a writer. Not a designer.

---

## Verdict

**Production Ready With Revisions**

One hard blocker must be fixed before shipping. Three high-priority revisions should land in the same commit. The page is substantively sound — the evidence grading, mechanism descriptions, stacking logic, and harm framing are all accurate and appropriately hedged.

---

## Production Blockers

### CRITICAL-1 — Broken internal link: `/herbs/passionflower` will 404

**Location:** `SLEEP_SUPPLEMENTS[5].href` (line 80) and the rendered card link + "Full profile →" anchor

**Finding:** The href is set to `/herbs/passionflower`. This slug does not exist.
- `public/data/herbs-summary.json` → slug is `passiflora-incarnata`
- `public/data/herbs-detail/` → file is `passiflora-incarnata.json`, no `passionflower.json`
- `app/herbs/[slug]/` → dynamic route will receive `passionflower`, find no data, and 404 on static export

A live, fully-built guide page exists at `app/guides/passionflower/page.tsx`.

**Fix:** Change line 80 to `href: '/guides/passionflower'`

**A page cannot launch with a 404 on a linked card.**

---

## High Priority Revisions

### MEDIUM-1 — Melatonin dose card contradicts the "Common Mistakes" section on the same page

**Location:** `SLEEP_SUPPLEMENTS[2].dose` vs. line 252

**Finding:**
- Dose card states: `up to 3–5 mg for general onset`
- "Common Mistakes" states: `0.5 mg is often as effective as 10 mg`

A reader sees conflicting signals within a single scroll. This is an internal consistency failure on a YMYL page. It will also fail a manual editorial review.

**Fix:** Cap the dose card at `up to 3 mg` and append `(higher doses show diminishing returns)`. Consistent with published meta-analyses and consistent with the site's own messaging below the fold.

---

### MEDIUM-2 — No visible on-page author or reviewer attribution

**Location:** Hero section (lines 126–143). Schema only.

**Finding:** The `StructuredData` component correctly emits `author` and `reviewedBy` in JSON-LD as "Will Thomas." There is no visible byline on the page. Google's Search Quality Rater Guidelines for YMYL health content require visible evidence of authorship — schema signals alone are treated as weaker corroboration.

**Fix:** Add one line below the eyebrow label or below the disclaimer box: `Written and reviewed by Will Thomas — [link to /author]`. No redesign required. One JSX line.

---

### MEDIUM-3 — Ashwagandha safety note underspecifies thyroid medication risk

**Location:** `SLEEP_SUPPLEMENTS[3].safety` (line 58)

**Finding:** Current text: `avoid in thyroid conditions without supervision`

Ashwagandha is documented to increase serum T3 and T4 levels. In users on levothyroxine or antithyroid medication, this can shift dosing requirements. The current phrasing does not distinguish condition type (hypo vs. hyper) or name the interaction mechanism. For a YMYL page, this is material.

**Fix:** Replace with: `Caution in thyroid disorders — may raise T3/T4 levels; consult a clinician if on thyroid medication.`

---

### MEDIUM-4 — Valerian safety note missing pregnancy contraindication

**Location:** `SLEEP_SUPPLEMENTS[4].safety` (line 68)

**Finding:** Current text: `Generally safe; occasional paradoxical stimulation; not for use with sedatives/alcohol`

Valerian is classified as likely unsafe in pregnancy (uterine stimulant effect). The page's own related guide (`/guides/passionflower`) correctly warns against sedative herbs in pregnancy. Omitting this from valerian on a page titled "best supplements for sleep" — a query used by pregnant women — creates liability exposure.

**Fix:** Append: `Not recommended during pregnancy or for children.`

---

### MEDIUM-5 — `/guides/sleep-herbs-vs-melatonin` link routes to discovery-layer stub, not the full content

**Location:** Related links nav, line 263

**Finding:** Links to `/guides/sleep-herbs-vs-melatonin` (a thin gateway page that immediately sends users to `/compare/sleep-herbs-vs-melatonin`). The fully built comparison page lives at `/compare/sleep-herbs-vs-melatonin` with rich content and a proper canonical. Every other page on the site (articles, learn pages, the compare index) links directly to `/compare/sleep-herbs-vs-melatonin`. This is an unnecessary two-hop for the user.

**Fix:** Change line 263 to `href="/compare/sleep-herbs-vs-melatonin"`.

---

## Future Optimizations

### LOW-1 — Canonical chain between `/best-supplements-for-sleep` and this guide is undefined

Two URLs compete on the same head keyword. The entry page has no `canonicalOverride` pointing to this richer guide. Low urgency — these pages serve different funnel positions — but should be addressed in the next SEO pass to consolidate authority.

---

### LOW-2 — Onset timing not addressed per supplement

Users commonly ask "how long does [supplement] take to work?" The page handles this for valerian in the "Common Mistakes" section but not in the dose fields for the other five supplements. Addressable with a data-layer note per supplement in the existing dose field. No structural change.

---

### LOW-3 — Valerian 0.8% valerenic acid standardization figure is unlinked and unverified against site data

`herbs-detail/valerian.json` does not specify a valerenic acid percentage. The figure is industry-standard but unconfirmed in the site's own data layer. Flag for the next content enrichment pass.

---

### LOW-4 — Schema `zone` prop not explicitly passed; defaults to `harm-reduction`

The page is listed in `revenueProductSlugs` in `seo-entry-pages.tsx` under `'guides/best-supplements-for-sleep'`. If affiliate product cards are added in a future expansion, the current `MedicalWebPage` schema type will conflict with the commercial nature. Passing `zone` explicitly now documents the design intent.

---

### LOW-5 — No citation callout linking to sourced compound profiles

The evidence grades (A/B/C) are credible and accurately applied. There is no "Source" or "How we grade evidence" link. Adding a single sentence linking to the methodology page or compound profiles would strengthen EEAT signals with zero structural change.

---

## Scores

| Dimension | Score | Rationale |
|---|---|---|
| **Search Intent** | **8 / 10** | Decision framework, stacking guide, and individual profiles cover the full journey. User can identify their problem, find a supplement, and reach the depth layer without leaving the site. One-hop gap (passionflower 404) breaks flow for one of six supplements. Fix IL-1 and this is a 9. |
| **EEAT** | **6 / 10** | Mechanism descriptions and evidence grading are accurate and conservatively framed. The disclaimer box is well-executed. Loses points for no visible author attribution, no inline citations, and no reviewer credential visible on-page. Fixable with two low-effort additions. |
| **Overall Score** | **71 / 100** | Substantively solid. Evidence grading, mechanism content, safety framing, and stacking logic are above average for this category. Penalized for one hard 404, one internal consistency error (melatonin dose), two safety gaps, and absent on-page EEAT signals. No fabricated claims, no dangerous advice, no schema malformation. Fix the five medium items and this is an 85+. |

---

## Final Recommendation

**Fix Then Ship**

Fix CRITICAL-1 (the passionflower 404) before deploying. Bundle MEDIUM-1 through MEDIUM-4 into the same commit — they are small, targeted corrections that do not require redesign. MEDIUM-5 is a one-line href change. Total fix time: under 30 minutes.

The underlying content is trustworthy and ready. This is a gate issue, not a content issue.
