# Sprint 001 — Technical Health: Findings & Inventory

**Branch:** `claude/sprint-001-technical-health`
**Date:** 2026-06-18
**Scope:** Reduce technical debt only. No new content, no redesign, no architecture changes.

## Phase 0 — Baseline (before any changes)

Commands run: `npm run audit:content`, `npm run audit:links`, `npm run build` (all pass / exit 0).

### `audit:content` summary (BEFORE)

| Metric | Count |
|---|---|
| Pages audited | 78 |
| Duplicate slugs | 2 |
| Missing metadata | 5 |
| Thin pages (<500w) | 35 *(explicitly OUT OF SCOPE)* |
| Orphaned pages | 1 |
| Broken internal links | 11 |
| Hardcoded affiliate tags | 0 |

`audit:links` is advisory (linking opportunities); exits 0 with no errors.
`build` passes (26/26 pipeline steps; 367 sitemap URLs).

---

## Root-cause analysis

Every actionable finding was investigated against **ground truth** (the built `out/**/index.html`
and rendered `<title>`/`<meta>`/`<link rel=canonical>`). Result: the findings are **false positives
caused by blind spots in `scripts/content-audit.mjs`**, not real defects in the site. Changing the
flagged pages/links would have *removed working behavior and risked SEO*, violating the sprint's
decision hierarchy (Stability → SEO → Maintainability). The real technical debt is the audit's
accuracy. Fixes below target the audit, not the content. **Zero URLs, redirects, metadata values,
or page content were changed.**

### Broken internal links (11) — FALSE POSITIVES (valid dynamic routes)

The audit's `buildKnownRouteSet()` only enumerates **static** `app/**` directories; it cannot see
dynamically-generated `[slug]` routes. All 11 targets build and render real pages (verified in `out/`):

| Source page | Linked target | Status (built?) |
|---|---|---|
| guides/best-natural-sleep-aids-that-work | /compare/magnesium-vs-melatonin | REAL |
| guides/magnesium-vs-melatonin | /compare/magnesium-vs-melatonin | REAL |
| guides/focus-without-caffeine-crash | /compare/caffeine-vs-l-theanine | REAL |
| guides/kava | /guides/ashwagandha | REAL |
| guides/kratom-7oh-withdrawal-management | /articles/mitragynine, /articles/7-hydroxymitragynine | REAL |
| guides/supplements-for-brain-fog-and-fatigue | /compare/creatine-vs-caffeine | REAL |
| compare/berberine-vs-metformin | /compare/berberine-vs-inositol, /compare/berberine-vs-psyllium | REAL |
| compare/mitragynine-vs-7-hydroxymitragynine | /articles/mitragynine, /articles/7-hydroxymitragynine | REAL |

**Fix:** `buildKnownRouteSet()` now unions in the actual built routes from `out/` when present, so
real dynamic routes are recognized while genuinely-missing routes are still flagged.

### Missing metadata (5) — FALSE POSITIVES (helper/variable metadata)

The audit's `checkMetadata()` only matched **string-literal** `title:`/`description:`. The flagged
pages supply metadata via a spread helper or a variable, and the rendered HTML has correct
title/description/canonical:

| Page | Mechanism | Rendered `<title>` present? |
|---|---|---|
| articles/anxiety-stack-guide | `buildPageMetadata({ title: articleTitle, ... })` | Yes |
| guides/magnesium-for-sleep | `{ ...generateSeoEntryMetadata(route) }` | Yes |
| guides/magnesium-vs-melatonin | `{ ...generateSeoEntryMetadata(route) }` | Yes |

**Fix:** `checkMetadata()` now recognizes metadata produced via `buildPageMetadata`, a spread of a
`*Metadata()` helper, or identifier (non-quoted) `title`/`description` values.

### Orphaned page (1) — FALSE POSITIVE (object-property link)

`/guides/elderberry` **is** linked from `app/guides/page.tsx:76` via `href: '/guides/elderberry'`
(an object property). The audit's `buildBacklinkSet()` only matched JSX `href="..."` (with `=`) and
double-quoted strings, missing single-quoted object-property hrefs.

**Fix:** `buildBacklinkSet()` now also captures `href: '/path'` / `href: "/path"` object-property links.

### Duplicate slugs (2) — REAL signal, intentional architecture → MANUAL REVIEW

These are genuine cross-family static pages, each with a **distinct self-canonical** (no
duplicate-URL/canonical penalty), reflecting the site's documented two-layer content model
(discovery vs depth families):

- `magnesium-for-sleep` → `/articles/magnesium-for-sleep` **and** `/guides/magnesium-for-sleep`
- `sleep-herbs-vs-melatonin` → `/guides/sleep-herbs-vs-melatonin` **and** `/compare/sleep-herbs-vs-melatonin`
  (note: bare `/sleep-herbs-vs-melatonin` already 301s to the guide in `public/_redirects`)

Consolidating these requires a **content/SEO decision** about which page wins (potential keyword
cannibalization), which is explicitly out of scope for a no-content-change technical-debt sprint and
risks harming a ranking page. **Left untouched and escalated to MANUAL REVIEW.** The audit check is
correct to surface them, so it was not modified.

---

## Validation (after fixes)

| Audit metric | BEFORE | AFTER |
|---|---:|---:|
| Broken internal links | 11 | **0** |
| Missing metadata | 5 | **0** |
| Orphaned pages | 1 | **0** |
| Duplicate slugs | 2 | 2 *(manual review — see below)* |
| Thin pages (<500w) | 35 | 35 *(out of scope)* |
| **Total issues** | 54 | **37** |

- `npm run audit:content` — passes (exit 0); real defects eliminated.
- `npm run audit:links` — passes (exit 0; advisory).
- `npm run build` — passes (26/26 pipeline steps; 367 sitemap URLs).
- **Regression guard:** verified the broken-link check still flags a genuinely
  non-existent route after the accuracy fix (no false-negatives introduced).
- **No URLs, redirects, page content, or metadata values were changed.**

## Files modified

| File | Change |
|---|---|
| `scripts/content-audit.mjs` | Audit accuracy fixes (no behavior change to the site): (1) `buildKnownRouteSet` now unions real built routes from `out/` so dynamic `[slug]` routes are recognized; (2) `checkMetadata` recognizes `buildPageMetadata`, spread `*Metadata()` helpers, and identifier title/description values; (3) `buildBacklinkSet` now captures `href: '/path'` object-property links. |
| `docs/sprint-001-technical-health.md` | This findings/inventory/validation report (new). |

## Manual review (human attention required)

1. **Duplicate slugs (2) — content/SEO decision, intentionally NOT auto-resolved.**
   - `magnesium-for-sleep`: `/articles/magnesium-for-sleep` + `/guides/magnesium-for-sleep`
   - `sleep-herbs-vs-melatonin`: `/guides/sleep-herbs-vs-melatonin` + `/compare/sleep-herbs-vs-melatonin`
     (bare `/sleep-herbs-vs-melatonin` already 301s to the guide)

   Each page has a distinct self-canonical, so there is no duplicate-URL penalty today, but the
   pairs may compete for the same query (cannibalization). Choosing a winner and adding a
   cross-canonical or 301 is a content/SEO decision that needs an operator and is out of scope for a
   no-content-change technical-debt sprint. Recommended follow-up: pick the stronger page per pair,
   point the weaker page's canonical at it (preserving both URLs), and prefer keeping the older URL.

2. **Reversed-comparison duplicate (pre-existing, noted in prior work):** `/compare/magnesium-vs-melatonin`
   (dynamic) and `/compare/melatonin-vs-magnesium` (static) both exist. Consider a 301 from the
   former to the latter to consolidate. Out of scope here; tracked for a future content sprint.
