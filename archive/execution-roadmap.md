# Execution Roadmap

Date: 2026-05-30

## Source inputs

This roadmap synthesizes the revenue, product, goal-driven IA, homepage, intake wizard, recommendation engine, and route-consolidation documents listed below:

- `docs/business/revenue-priority-plan.md`
- `docs/product/product-vision.md`
- `docs/product/goal-driven-system.md`
- `docs/specs/homepage-v2.md`
- `docs/specs/intake-wizard.md`
- `docs/specs/recommendation-engine.md`
- `docs/architecture/route-consolidation-plan.md`

## Guiding implementation principles

- Preserve the protected route contracts: `/herbs/:slug`, `/compounds/:slug`, `/goals/:slug`, and `/stacks/:slug`.
- Keep the static-export architecture intact: no API routes, middleware, server actions, `next/server`, runtime revalidation, or dynamic server-only personalization.
- Extend the existing goal, homepage, product-pick, affiliate, and public-data systems rather than replacing pipelines.
- Place affiliate CTAs downstream of evidence, safety, and product-quality context.
- Use route consolidation only after content parity checks; avoid deleting or renaming discovery routes during the first implementation pass.

## Phase 1 (Highest ROI): Goal-first revenue foundation

### Expected impact

- Makes the homepage and global navigation immediately legible for goal-led visitors who do not know ingredient names.
- Creates one repeated buyer-intent grammar: choose goal → compare evidence and safety → use product-quality guidance → continue to a profile, comparison, quiz, or sourcing endpoint.
- Establishes the lowest-effort monetization guardrails from the revenue plan: visible disclosure context, safety checkpoints, and product-quality CTAs before deeper product-selection work.
- Improves internal linking toward the highest-value route families without changing route contracts.

### Risk

- Low to medium.
- Main risks are homepage clutter, over-commercial copy, or accidentally routing users to weak/broken conversion surfaces.
- Mitigation: keep changes surgical, use static links only, use existing goal data, keep safety/disclaimer copy visible, and avoid new data-pipeline dependencies.

### Complexity

- Low to medium.
- Mostly server-rendered React/Next static UI changes plus one planning document.
- No workbook edits, generated public JSON edits, or runtime personalization required.

### Files affected

- `docs/plans/execution-roadmap.md`
- `components/homepage-v2.tsx`
- `src/components/Header.tsx`
- `src/components/mobile-bottom-nav.tsx`
- Potentially `app/goals/page.tsx` if Phase 1 needs additional goal-index framing after homepage/navigation updates.

### Acceptance criteria

- `docs/plans/execution-roadmap.md` exists and includes all four phases with expected impact, risk, complexity, files affected, and acceptance criteria.
- Homepage hero has one dominant goal-first CTA, a secondary quiz/safety path, and a trust strip aligned to evidence, safety, and static-export constraints.
- Homepage prioritizes goal cards before ingredient-led exploration and includes a lightweight intake-wizard entry, recommendation preview, comparison preview, credibility section, safety section, and affiliate-disclosure-aware product-quality CTA.
- Header and mobile bottom navigation prioritize `Goals` and `Quiz`/safety entry points while preserving access to herbs, compounds, search, and education.
- No protected route contract is renamed or removed.
- Build-oriented checks pass after the implementation milestone.

## Phase 2: Buyer-intent decision page upgrades

### Expected impact

- Converts commercial search traffic from `/best-supplements-for-*`, `/top/*`, and goal pages into clearer decisions.
- Reduces keyword cannibalization by assigning clear canonical roles: goal pages for decision systems, SEO entry pages for lean acquisition funnels, top pages for ranked category lists, and profiles for depth.
- Adds structured tables that answer purchase-intent questions without becoming hype-driven product marketplaces.

### Risk

- Medium.
- Risks include duplicate content across route families, inconsistent claims, and adding product CTAs before safety context.
- Mitigation: follow the route-consolidation sequence, compare headings/FAQs/tables before redirects, and require safety/product-quality rows in every commercial decision table.

### Complexity

- Medium.
- Requires coordinated copy/template work across several static page families and likely reusable table/CTA components.
- May require product-pick data extensions but should avoid workbook pipeline changes unless required fields become source-of-truth content.

### Files affected

- `app/best-supplements-for-sleep/page.tsx`
- `app/best-supplements-for-stress/page.tsx` or equivalent stress entry pages
- `app/best-supplements-for-focus/page.tsx`
- `app/best-supplements-for-gut-health/page.tsx` if present or newly mapped through existing SEO-entry infrastructure
- `app/best-supplements-for-joint-support/page.tsx`
- `app/best-supplements-for-blood-pressure/page.tsx`
- `app/best-supplements-for-fat-loss/page.tsx`
- `app/top/sleep/page.tsx`, `app/top/stress/page.tsx`, `app/top/focus/page.tsx`
- Shared components/data such as `components/conversion-affiliate-card.tsx`, `components/AffiliateProductCard.tsx`, `data/product-picks.ts`, and `app/seo-entry-pages.tsx` if reused.

### Acceptance criteria

- Priority buyer-intent pages include a decision table with ingredient, best fit, evidence confidence, safety watchout, product form to look for, profile link, and product-quality next step.
- Pages link to relevant comparisons where users commonly need a final decision bridge.
- Affiliate disclosures appear near the first commercial module.
- Affiliate links, when present, use approved affiliate configuration and compliant `rel` behavior.
- Canonical intent notes are reflected in internal links without deleting protected discovery/depth routes.

## Phase 3: Profile monetization and recommendation maturity

### Expected impact

- Turns high-traffic herb and compound profiles into trusted conversion pages after users have read evidence and safety context.
- Adds explainable, goal-aware recommendation tiers and safety demotions that can power profile modules, quiz results, and goal pages.
- Raises revenue potential for ingredient-aware visitors while preserving the trust moat.

### Risk

- Medium to high.
- Risks include overfitting recommendations with incomplete data, implying individualized medical advice, or adding commerce modules to records with insufficient evidence/safety coverage.
- Mitigation: require safety exclusions before ranking, suppress affiliate links for clinician-guidance states, and keep explanations conservative.

### Complexity

- Medium to high.
- Requires reusable recommendation logic, richer safety filtering, potentially editorial overrides, and careful profile template integration.

### Files affected

- Herb/compound profile route templates under `app/herbs/[slug]/` and `app/compounds/[slug]/` if present in the active app tree.
- Recommendation-related libraries/components under `lib/`, `components/ui/RecommendationRail.tsx`, `components/ui/SemanticRecommendationCard.tsx`, and related decision primitives.
- Data/config files that power product picks, click signals, revenue dashboards, and goal candidates, such as `data/product-picks.ts`, `data/click-signals.ts`, `data/revenue-dashboard.ts`, and `data/goals.ts`.
- Public-data generators only if new fields must be emitted from the workbook source of truth.

### Acceptance criteria

- Top commercial ingredients include “best if,” “avoid if,” and “form to look for” guidance on profile pages.
- Recommendation outputs apply safety exclusions before ranking and explain why each option is recommended or demoted.
- Affiliate suggestions are suppressed for unsafe, incomplete, or clinician-guidance states.
- Profile pages route undecided users to relevant comparisons before final product CTAs.
- Build checks and any affected data validation scripts pass.

## Phase 4: Optimization loop and route consolidation

### Expected impact

- Improves revenue per visit by using route-level, module-level, ingredient-level, and device-level evidence from click behavior.
- Consolidates overlapping routes after content parity is verified, strengthening authority for canonical buyer-intent destinations.
- Prioritizes future product registry expansion only where user behavior proves demand.

### Risk

- Medium.
- Risks include premature redirects, loss of long-tail traffic, and noisy analytics that drive the wrong content changes.
- Mitigation: keep route inventory updated, validate redirects, preserve protected route contracts, and compare content blocks before any merge/redirect.

### Complexity

- Medium.
- Requires analytics review, route inventory maintenance, redirect validation, and iterative content/template tuning.

### Files affected

- Analytics/click-signal utilities and dashboard data such as `data/click-signals.ts` and `data/revenue-dashboard.ts`.
- Route inventory and sitemap/redirect validation scripts under `scripts/ci/` and `scripts/data/` if consolidation changes require updates.
- Candidate redirect or merge pages identified in `docs/architecture/route-consolidation-plan.md`.
- Internal-link surfaces across homepage, education, goals, top pages, and SEO entry pages.

### Acceptance criteria

- Outbound click reporting can be reviewed by route family, CTA/module, ingredient, and device.
- Pages with high traffic and low CTR have documented decision-clarity experiments.
- Pages with high CTR and thin safety/trust context have safety/product-quality improvements before additional monetization.
- Redirects are added only after content parity review and pass route/redirect validation.
- Winners are promoted through internal links from homepage, education, goal pages, and relevant profiles.
