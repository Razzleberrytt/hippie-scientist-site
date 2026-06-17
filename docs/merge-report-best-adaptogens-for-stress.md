# Merge Report: Best Adaptogens for Stress (best-adaptogens-for-stress)

**Status:** MERGE READY

**Date:** 2026-06-17

**Route:** `/best-adaptogens-for-stress`

**Pipeline:** Refined Builder v2 → Gatekeeper v2 → Publish v2 (one page)

## Summary of Changes
- `lib/curated-expansions.ts` — added the `best-adaptogens-for-stress` `CuratedExpansion` (intent, methodology, 5-row evidence/dose/safety table, comparison, safety notes, buyer checklist, 3 verified references).
- `app/seo-entry-pages.tsx` — wired `revenueProductSlugs` = `['ashwagandha', 'rhodiola', 'holy-basil']` (`AFFILIATE_TAGS.amazon` only).
- No new files/routes/systems; renders via `SeoEntryPage`; schema auto-emitted. Roadmap #18; funnels into the stress money page and the ashwagandha/rhodiola hubs (now both expanded).

### Builder
- Calming (ashwagandha) vs activating (rhodiola) framing; multi-week adaptogen support kept distinct from same-day calm. Holy basil (preliminary), eleuthero (limited), cordyceps (limited for stress).

### Gatekeeper
- Verdict: Production Ready With Revisions (8/8/8). No blockers. "Not a treatment for anxiety/depression/burnout," multi-week expectation, and pregnancy/thyroid/bipolar/liver cautions explicit.

### Publisher
- References web-verified / repo-established: ashwagandha stress RCT (PMC6750292), rhodiola fatigue systematic review (PMC3541197), ashwagandha stress/anxiety review (PubMed 39348746). Links verified: ashwagandha→`/herbs/ashwagandha`, rhodiola→`/herbs/rhodiola`, holy-basil→`/herbs/holy-basil`.

## Verification
- Blockers resolved: Yes (none). Internal links verified. Affiliate hygiene OK. Schema static-export safe.
- Quality gate: `npm run check` — passed (26 steps, exit 0).

## Remaining Low-Priority Items
- Add eleuthero/cordyceps product sets if the catalog later supports vetted options.

**Recommendation:** Safe to merge after static-export validation; gate passes locally.
