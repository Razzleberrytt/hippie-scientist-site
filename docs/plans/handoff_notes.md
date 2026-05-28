# Handoff Notes — Phase 3 Public Decision Surfaces, SEO, and Affiliate Revenue Readiness

Phase 3 (Public Decision Surfaces, SEO, and Affiliate Revenue Readiness) has been successfully implemented and validated.

## Completed Tasks

### Phase 3A & 3B — Decision Surface Components & detail page integrations
- Created the reusable, disclosure-compliant `SourcingCta` component under `src/components/sourcing/SourcingCta.tsx`.
- Integrated `SourcingCta` across Herbs and Compounds detail page templates under the "Authority & Sourcing" tab, separating evidence from monetization.
- Integrated `getEvidenceConfidence` and human efficacy flag mapping directly into the detail page above-fold "5-second profile read" snapshots.

### Phase 3C — Goal Page Upgrade
- Expanded the central goal definitions list in `data/goals.ts` from 4 to 9 initial goals (sleep, stress, anxiety, focus, energy, inflammation, pain, cognition, longevity) with titles and descriptions.
- Refactored `app/goals/[goal]/page.tsx` to dynamically query and rank herbs and compounds matching the target goal using the Phase 2 `rankEntitiesForGoal` engine.
- Upgraded sitemap generation dynamically to include the 9 goal paths.

### Phase 3D — Compare Page Enrichment
- Refactored `app/compare/[slug]/page.tsx` to calculate and render mechanisms unique to each compound (divergent mechanisms).
- Added explicit, dynamic "Choose this if" and "Consider this instead if" comparison logic to the Winner and Loser comparison cards.

### Phase 3E & 3F — Affiliate Revenue Readiness & SEO Metadata
- Standardized Amazon outbound links to use the centralized `AFFILIATE_TAGS.amazon` config.
- Improved dynamic goal page metadata (meta descriptions now list the top 3 ranked ingredients for the corresponding goal).

### Phase 3G — Business Coverage Report
- Generated `docs/reports/phase3_decision_surface_coverage.md` detailing missing attributes (e.g. `best_for`, `avoid_if` safety flags, affiliate ASINs) across all 520 entities to guide future authoring.

---

## Verification & Build Status

- **Typecheck & Linter**: `npm run check:fast` passes cleanly.
- **Tests**: `npm run test` executes successfully.
- **Production Build Check**: `npm run check` (next build + static export audits) runs and compiles cleanly.

---

## Recommended Phase 4 Tasks
1. **Workbook Content Enrichment:** Populate `best_for` summaries, `avoid_if` contraindication tags, and direct Amazon product listing links inside `data-sources/herb_monograph_master.xlsx` to resolve the coverage gaps.
2. **Comparison Routing Expansion:** Automate comparison page generation for the top-20 most popular supplement pairs.
3. **Safety Checker Visibility:** Surface dynamic drug-supplement safety warnings prominently across goal hub decision pages.
