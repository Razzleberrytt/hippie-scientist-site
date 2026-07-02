# Phase 3 Expansion: Custom Protocol Planner, Relational Graph, and Sourcing Comparison

This implementation planning document outlines the three clusters and nine atomic tasks for the Phase 3 Expansion sprint of **The Hippie Scientist**. These features represent major additions in decision-support intelligence, scientific authority, and monetization efficiency.

---

## Cluster 1: Custom Regimen Planner & Constituent Yield Aggregator

### Task 1.1: Multi-Phase Daily Regimen Planner (`/protocols/planner`)
- **Goal**: Create an interactive regimen scheduler where users can organize chosen herbs/compounds into custom daily time intervals (Morning, Afternoon, Evening, Pre-Bed).
- **Why It Matters**: Drives high user retention and long-term utility. Simplifies botanical scheduling.
- **Files Involved**:
  - `app/protocols/planner/page.tsx` [NEW]
  - `src/components/protocols/RegimenPlannerClient.tsx` [NEW]
- **Implementation Notes**:
  - Load `public/data/workbook-herbs.json` and `public/data/workbook-compounds.json`.
  - Provide an interface to select ingredients and assign them to Morning, Afternoon, Evening, or Pre-Bed schedules.
  - Store schedules in `localStorage` for continuous persistence.
- **Dependencies / Risks**:
  - Requires clean parsing of ingestion time recommendations if available, with a manual fallback option.
- **Success Criteria**:
  - Users can select 3+ items, allocate them to daily intervals, and view their schedule in a structured timeline.
- **Estimated Complexity**: Medium

### Task 1.2: Cross-Regimen Safety & Active Yield Auditor
- **Goal**: Aggregate the total daily doses of active constituents (e.g. caffeine, L-theanine) and display safety overload warnings if daily bounds are exceeded.
- **Why It Matters**: Crucial authority and harm-reduction utility. Protects users from stacking excessive stimulant dosages.
- **Files Involved**:
  - `src/components/protocols/RegimenPlannerClient.tsx` [MODIFY]
  - `src/components/protocols/__tests__/RegimenPlannerClient.test.tsx` [NEW]
- **Implementation Notes**:
  - Compute cumulative daily intake for shared categories (e.g. stimulant stimulants, CNS depressants).
  - Flag warnings (e.g., "Daily Caffeine Exceeds 400mg", "High cumulative GABAergic load").
- **Dependencies / Risks**:
  - Needs structured base values for calculations; will use fallback averages when dose strings are unquantified.
- **Success Criteria**:
  - Adding multiple stimulants (e.g. Caffeine, Green Tea Extract) triggers a prominent stimulant limits caution flag.
- **Estimated Complexity**: Medium

### Task 1.3: Regimen Export & Share Engine (URL/JSON/Print)
- **Goal**: Build sharing capabilities allowing users to serialize their daily schedules into URL query parameters, download/upload JSON backup files, or print a formatted grid.
- **Why It Matters**: Promotes organic shareability, backlinks, and offline utility.
- **Files Involved**:
  - `src/components/protocols/RegimenPlannerClient.tsx` [MODIFY]
- **Implementation Notes**:
  - Encode selection IDs and time intervals into a compressed URL hash.
  - Add standard browser `window.print()` stylesheets for a clean offline sheet layout.
- **Dependencies / Risks**:
  - Query parameters must remain within browser URL length limits.
- **Success Criteria**:
  - Users can click "Share", copy a serialized link, and load it in a separate browser session to restore the exact schedule.
- **Estimated Complexity**: Low

---

## Cluster 2: Relational Knowledge Graph & Semantic Explore Hub

### Task 2.1: Semantic Goal-Symptom Relational Mapping Engine (`/explore/graph`)
- **Goal**: Build an interactive relational explore hub matching user objectives (Anxiety, Restless Sleep, Focus) to biological targets and botanical candidates.
- **Why It Matters**: Acts as a comprehensive scientific search gateway.
- **Files Involved**:
  - `app/explore/graph/page.tsx` [NEW]
  - `src/components/graph/RelationalGraphClient.tsx` [NEW]
- **Implementation Notes**:
  - Create a interactive grid of target systems linked to botanical solutions.
  - Toggle between objective domains to filter matching pathways.
- **Dependencies / Risks**:
  - Ensure the client component renders quickly to maintain premium usability.
- **Success Criteria**:
  - Selecting an objective (e.g. "Focus") highlights GABAergic vs Dopaminergic receptor pathways and maps corresponding ingredients.
- **Estimated Complexity**: Medium

### Task 2.2: Synergistic Stack Pairing Suggestion Engine
- **Goal**: Analyze the user's selected list in the explore graph and dynamically suggest synergistic pairings (e.g. pairing Caffeine with L-Theanine, Curcumin with Piperine) to optimize efficacy.
- **Why It Matters**: Major competitive differentiator ("data moat") based on pharmacological synergies.
- **Files Involved**:
  - `src/components/graph/RelationalGraphClient.tsx` [MODIFY]
  - `src/components/graph/__tests__/RelationalGraphClient.test.tsx` [NEW]
- **Implementation Notes**:
  - Define a hardcoded map of well-researched synergistic relationships in the component.
  - Alert the user of active synergy matches or suggest additions to complete a pairing.
- **Dependencies / Risks**:
  - Synergy claims must be backed by clinical consensus.
- **Success Criteria**:
  - Selecting Caffeine triggers a side recommendation to pair it with L-Theanine for reduced jitteriness.
- **Estimated Complexity**: Low

### Task 2.3: GRADE Scientific Evidence Confidence Indexer
- **Goal**: Render explicit confidence index ratings for each objective connection based on clinical evidence certitude (GRADE scale).
- **Why It Matters**: Drives authority, trust, and transparency.
- **Files Involved**:
  - `src/components/graph/RelationalGraphClient.tsx` [MODIFY]
- **Implementation Notes**:
  - Map evidence certitude metrics (A-tier human RCTs vs C-tier preclinical).
  - Render an interactive evidence score drilldown showing study size metrics.
- **Dependencies / Risks**:
  - Data sources must provide enough structural information to differentiate evidence.
- **Success Criteria**:
  - Clicking on a mapped connection displays a certainty scorecard detailing GRADE ratings and study profiles.
- **Estimated Complexity**: Medium

---

## Cluster 3: Sourcing Comparison & Sourcing Cart

### Task 3.1: Contextual Sourcing Comparison & Cost-Per-Dose Auditor (`/compare/sourcing`)
- **Goal**: Create a comparative dashboard computing the average cost per dose and cost per serving across botanical catalog entries.
- **Why It Matters**: Directly supports monetization and conversion readiness.
- **Files Involved**:
  - `app/compare/sourcing/page.tsx` [NEW]
  - `src/components/sourcing/SourcingComparerClient.tsx` [NEW]
- **Implementation Notes**:
  - Define average brand price boundaries in the client dataset.
  - Compute cost per serving and cost per day based on standard dosing ranges.
- **Dependencies / Risks**:
  - Market prices change; must display average ranges rather than static figures.
- **Success Criteria**:
  - Displays relative cost tiers (e.g. "Low cost, ~$0.30/dose") alongside Amazon search CTAs.
- **Estimated Complexity**: Medium

### Task 3.2: Automated Active Yield Sourcing Auditor
- **Goal**: Compare the cost-efficiency of brands by calculating active compound yield per dollar (e.g., milligrams of Withanolides or Ginsenosides per $1.00 spent).
- **Why It Matters**: Premium authority utility that simplifies smart purchasing.
- **Files Involved**:
  - `src/components/sourcing/SourcingComparerClient.tsx` [MODIFY]
  - `src/components/sourcing/__tests__/SourcingComparerClient.test.tsx` [NEW]
- **Implementation Notes**:
  - Standardize raw powder yield vs concentrated extract yields.
  - Show a comparison rating (e.g., "Highly Cost-Efficient yield").
- **Dependencies / Risks**:
  - Requires clean input of extract standardization numbers.
- **Success Criteria**:
  - Computes and renders active yield ratings when matching extract concentration numbers are selected.
- **Estimated Complexity**: Medium

### Task 3.3: Sourcing Cart & Checklist Export
- **Goal**: Allow users to compile a checkout checklist showing quality standard checkmarks (COA, testing) and export direct Amazon affiliate buy links.
- **Why It Matters**: High monetization conversion readiness.
- **Files Involved**:
  - `src/components/sourcing/SourcingComparerClient.tsx` [MODIFY]
- **Implementation Notes**:
  - Build a shopping cart list staging chosen items.
  - Display checklist checkboxes (e.g., third-party tested, GMP certified) with outbound affiliate redirect buttons.
- **Dependencies / Risks**:
  - Must resolve the central `AFFILIATE_TAGS.amazon` tag correctly.
- **Success Criteria**:
  - Staging 2 items compiles a clean checklist and provides Amazon buy buttons utilizing correct affiliate tags.
- **Estimated Complexity**: Low

---

## Handoff / Handoff Summary
- [x] Cluster 1 Implementation Completed & Verified
- [x] Cluster 2 Implementation Completed & Verified
- [x] Cluster 3 Implementation Completed & Verified

### Completed Work Summaries

#### Cluster 1: Custom Regimen Planner & Constituent Yield Aggregator
- **Task 1.1**: Implemented `/protocols/planner` static route rendering the interactive `RegimenPlannerClient`.
- **Task 1.2**: Created cumulative audits tracking total daily caffeine limits (>400mg) and sedative CNS loading (alerting if multiple GABAergic agents are scheduled).
- **Task 1.3**: Built URL parameter state serialization, JSON backup file import/export, and standard `@media print` CSS layout grid support.

#### Cluster 2: Relational Knowledge Graph & Semantic Explore Hub
- **Task 2.1**: Created `/explore/graph` route rendering the `RelationalGraphClient` mapping objectives (Focus, Calm, Sleep, Mood, Neuroplasticity) to biological target pathways and solutions.
- **Task 2.2**: Integrated a real-time synergy pairing workspace mapping Caffeine + L-Theanine, Curcumin + Piperine, and Caffeine + CoQ10. Highlights active synergies and displays partner recommendations.
- **Task 2.3**: Built high-fidelity interactive GRADE scorecard showing study counts, patient sample size, and risk-of-bias metrics.

#### Cluster 3: Sourcing Comparison & Sourcing Cart
- **Task 3.1**: Built `/compare/sourcing` static route and the `SourcingComparerClient` calculating cost per serving, daily cost, and cost tiers.
- **Task 3.2**: Programmed extract active compound yield per dollar metrics (e.g. active constituent mg per $1.00 spent) allowing standardizations comparison.
- **Task 3.3**: Created Sourcing Cart staging area with GMP, COA, and third-party laboratory verification checklist, plus outbound Amazon search redirects using central `AFFILIATE_TAGS.amazon` tag config.

### Changed Files
- [page.tsx](file:///c:/hippies/app/protocols/planner/page.tsx) [NEW]
- [RegimenPlannerClient.tsx](file:///c:/hippies/src/components/protocols/RegimenPlannerClient.tsx) [NEW]
- [RegimenPlannerClient.test.tsx](file:///c:/hippies/src/components/protocols/__tests__/RegimenPlannerClient.test.tsx) [NEW]
- [page.tsx](file:///c:/hippies/app/explore/graph/page.tsx) [NEW]
- [RelationalGraphClient.tsx](file:///c:/hippies/src/components/graph/RelationalGraphClient.tsx) [NEW/MODIFY]
- [RelationalGraphClient.test.tsx](file:///c:/hippies/src/components/graph/__tests__/RelationalGraphClient.test.tsx) [NEW]
- [page.tsx](file:///c:/hippies/app/compare/sourcing/page.tsx) [NEW]
- [SourcingComparerClient.tsx](file:///c:/hippies/src/components/sourcing/SourcingComparerClient.tsx) [NEW]
- [SourcingComparerClient.test.tsx](file:///c:/hippies/src/components/sourcing/__tests__/SourcingComparerClient.test.tsx) [NEW]

### Architectural Decisions & Risk Assessments
- **Static Export Preservation**: Added all new pages as pure client/static-supported pages without using node-runtime codes, middlewares, or dynamic routes.
- **Accessory Safety**: Checked all accessibility label identifiers (`id`, `htmlFor`) to ensure tests and users have semantic interactions.
- **Affiliate Tag Governance**: Directly imported and dynamically resolved the Amazon affiliate tag from `config/affiliate.ts`.

### Validation Checks Run
- TypeScript compilation: `npm run typecheck` (**PASS**)
- ESLint syntax & styles: `npm run lint` (**PASS**)
- Static Export validation: `npm run validate:static-export` (**PASS**)
- Route SEO check: `npm run validate:route-seo` (**PASS**)
- Production build: `npm run build` (**PASS**)
- Vitest unit tests: `npm run test` (**32 of 32 tests passed cleanly**)

