# Day 4: Phase 3 Public Decision Surfaces, SEO, and Revenue Readiness

Primary Objective:
Turn Phase 1 Knowledge Graph and Phase 2 Semantic Intelligence systems into visible, useful, indexable, conversion-oriented site features. Avoid hidden backend changes and focus strictly on user decision-making, search visibility, internal linking, affiliate readiness, page quality, and conversion.

## Current-State Summary
- Phase 1 (Knowledge Graph) and Phase 2 (Semantic Intelligence & Decisions) are fully implemented and typecheck successfully.
- Detail page templates exist for Herbs (`app/herbs/[slug]/page.tsx`) and Compounds (`app/compounds/[slug]/page.tsx`) and are currently using a preliminary "Evidence Snapshot" and "Decision Support" tab layout.
- Goal routes (`app/goals/[goal]/page.tsx`) are statically defined and fetch from a hardcoded list of 4 goals in `data/goals.ts`.
- Compare routes (`app/compare/[slug]/page.tsx`) exist but do not yet fully capitalize on dynamic overlap metrics and evidence contrast.
- Outbound affiliate routes are set up but need a unified disclosure and clear sourcing call-to-actions.

## Exact Phase 3 Objective
Create premium presentational decision surfaces, integrate them into detail pages, dynamically enrich goal and comparison templates, add safe disclosures/CTAs, configure semantic internal linking, and deliver a comprehensive coverage report.

## Files Touch List
- `docs/plans/day4_public_decision_surfaces.md` [NEW]
- `docs/plans/handoff_notes.md` [MODIFY]
- `src/components/sourcing/SourcingCta.tsx` [NEW]
- `data/goals.ts` [MODIFY]
- `app/goals/[goal]/page.tsx` [MODIFY]
- `app/goals/page.tsx` [MODIFY]
- `app/compare/[slug]/page.tsx` [MODIFY]
- `app/compare/page.tsx` [MODIFY]
- `app/herbs/[slug]/page.tsx` [MODIFY]
- `app/compounds/[slug]/page.tsx` [MODIFY]
- `docs/reports/phase3_decision_surface_coverage.md` [NEW]

## Ordered Task List
1. **Task 3A: Decision Surface Sourcing CTA Component**
   - Create a reusable `SourcingCta` component under `src/components/sourcing/SourcingCta.tsx`.
   - Add affiliate-ready detection, secure outbound link styling using `AFFILIATE_TAGS.amazon`, clear disclosure logic, and fallback text.
2. **Task 3B: Herb & Compound Detail Page Integration**
   - Incorporate the new `SourcingCta` component cleanly into `app/herbs/[slug]/page.tsx` and `app/compounds/[slug]/page.tsx` under the "Authority & Sourcing" tab and main sourcing areas (below safety warnings).
   - Ensure affiliate links are never rendered above safety/contraindication notes.
3. **Task 3C: Goal Page Upgrade**
   - Expand the list of goals in `data/goals.ts` from 4 to 9 (sleep, stress, anxiety, focus, energy, inflammation, pain, cognition, longevity) with rich descriptions.
   - Refactor `app/goals/[goal]/page.tsx` to dynamically query, rank, and format herbs/compounds for the given goal using the Phase 2 `rankEntitiesForGoal` engine.
   - Update `app/goals/page.tsx` to reference all 9 goals.
4. **Task 3D: Compare Page Enrichment**
   - Refactor `app/compare/[slug]/page.tsx` to enrich comparison views using semantic overlap metrics, explicit shared vs different mechanisms, best-use distinctions, and evidence contrast.
5. **Task 3E: Affiliate Revenue Readiness & Disclosures**
   - Integrate the existing `<AffiliateDisclosure />` and new `SourcingCta` across decision hubs.
   - Verify that no revenue-driven bias impacts evidence tiers.
6. **Task 3F: Semantic SEO & Internal Linking**
   - Enable internal link suggestions dynamically on detail, compare, and goal pages using `getRelatedPageSuggestions` and `getEntityLinks`.
   - Ensure title/meta descriptions dynamically reflect decision contexts.
7. **Task 3G: Decision Surface Coverage Report**
   - Create `docs/reports/phase3_decision_surface_coverage.md` identifying any gaps in data parameters (`best_for`, `avoid_if`, sourcing links) for Phase 4 remediation.

## Validation Strategy
- Run `npm run typecheck` and `npm run lint` at every atomic task checkpoint.
- Run `npm run test` to verify Vitest suite remains fully green.
- Run `npm run build` at the end to check sitemap generation and static export health.

## Rollback Strategy
- Perform changes incrementally.
- Use `git checkout -- <file>` or `git reset --hard` to rollback in case of blocker or compilation failures.

## SEO Impact
- Boosts crawlable semantic internal links.
- Ensures every dynamic page has schema-rich structured JSON-LD (FAQ, Breadcrumb, CollectionPage).
- Avoids doorway pages and duplicate thin content.

## Affiliate/Revenue Impact
- Makes detail pages immediately monetizable through standard disclosure-compliant Amazon search/source links.
- Maintains scientific authority and trust by separating safety/efficacy from sourcing links.

## Known Risks
- Generating too many static params could increase build time. We will stick to the predefined 9 goals and comparison pairs.
- Next.js static export compatibility: no dynamic headers, middleware, or edge-only imports.
