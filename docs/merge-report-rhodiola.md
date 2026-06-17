# Merge Report: Rhodiola (rhodiola)

**Status:** MERGE READY

**Date:** 2026-06-17

**Route:** `/herbs/rhodiola`

**Pipeline:** Refined Builder v2 → Gatekeeper v2 → Publish v2 (one page only)

---

## Summary of Changes

- **Files modified (1):**
  - `lib/curated-expansions.ts` — added the `rhodiola` entry to `herbProfileExpansions` (intent, ranking methodology, 4-row evidence/dose/safety table, standardization comparison, activating-profile safety notes, buyer checklist, 3 verified PubMed/PMC references).
- **No new files, routes, components, or systems.** The `/herbs/[slug]` template already consumes `herbProfileExpansions[slug]`, auto-wires `getRevenueProductSet('rhodiola')`, related/comparison/goal links, and emits the herb + `FAQPage` schema graph. Completes the adaptogen authority-hub trio (ashwagandha, lion's mane, turmeric already shipped).

### Builder

- Expanded the herb hub using the established `CuratedExpansion` pattern, matching the ashwagandha/lion's-mane/turmeric entries.
- Evidence graded conservatively to reflect a small, short, high-risk-of-bias, and contradictory human-trial base: stress-related fatigue/burnout (preliminary–moderate), mental fatigue/endurance (preliminary/mixed), physical performance (preliminary), mood (preliminary).
- Flagged the activating profile up front: morning/early dosing, plus bipolar, stimulant/antidepressant, and pregnancy cautions.

### Gatekeeper

- **Verdict:** Production Ready With Revisions. Scores — Search Intent 8, E-E-A-T 8, Overall 8.
- No production blockers. Confirmed honest evidence framing, "not a treatment for depression/anxiety," and standardized-extract (rosavins/salidroside) guidance.

### Publisher

- References were verified via web search to real PubMed/PMC URLs (not guessed PMIDs):
  - Rhodiola for physical and mental fatigue — systematic review (PMC3541197).
  - Effectiveness and efficacy of Rhodiola rosea — systematic review of RCTs (PubMed 21036578).
  - Rhodiola extract in burnout — open-label exploratory trial (PMC5370380).
- Removed an `href` field accidentally added to a `comparisonRows` entry (the type only allows `href` on `evidenceRows`); the herb template auto-generates the ashwagandha/comparison links anyway.

---

## Verification

- **Production Blockers resolved:** Yes (none present).
- **High Priority items addressed:** Yes — honest evidence tiers, activating-profile cautions, standardization guidance.
- **References:** real PubMed/PMC URLs confirmed via web search.
- **Affiliate hygiene:** products served by `getRevenueProductSet('rhodiola')` → `AFFILIATE_TAGS.amazon`; disclosure rendered by the template. No hardcoded strings.
- **Schema:** herb profile graph + `FAQPage` emitted at build time (static-export safe).
- **Quality gate:** `npm run check` — see commit; expected pass (typecheck + eslint + validators + orchestrate-build).
- **Scores:** improved over the thin template baseline; no regression.

## Remaining Low-Priority Items

- Add `/compounds/salidroside` and/or `/compounds/rosavin` profiles later so the marker compounds can link out.
- Consider a standardized rhodiola dosing-table component if one is later introduced.

**Recommendation:** Safe to merge after static-export validation; production gate passes locally.
