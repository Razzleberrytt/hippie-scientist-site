# Day 1 Expansion: High-Throughput Phase 2 Expansion Sprint

This planning document outlines the three clusters and nine atomic tasks designed to materially expand feature depth, authority signaling, user retention, and monetization readiness.

---

## Cluster 1: Interactive Decision Support & Personalization

### Task 1.1: Interactive Supplement Stack Builder & Overlap Validator
- **Goal**: Allow users to select multiple herbs and compounds to create a custom "Stack" and receive real-time, evidence-based alerts about total dosage, primary receptor overlap, duplicate mechanism warnings, and safety concern scores.
- **Why It Matters**: High user retention and engagement. Instead of just reading static stack lists, users can construct their own stacks and check if they are duplicating cholinergic pathways or stacking too many CNS depressants.
- **Files Involved**:
  - `app/stacks/builder/page.tsx` [NEW]
  - `src/components/stacks/StackBuilderClient.tsx` [NEW]
- **Implementation Notes**:
  - Load `public/data/workbook-herbs.json` and `public/data/workbook-compounds.json` at client-side.
  - Provide a search-and-add interface.
  - Sum up overlapping mechanisms and display warning flags (e.g. "High cholinergic load", "Serotonergic overlap alert").
  - Save the stack in localStorage for persistence.
- **Dependencies / Risks**:
  - Needs clean parsing of active mechanism strings. Fallback to generic warning if mechanisms are unstructured.
- **Success Criteria**:
  - User can select 3+ items, see aggregated effects, and view warning alerts when overlapping pathways are active.
- **Estimated Complexity**: Medium

### Task 1.2: Personalized Recommendation Quiz
- **Goal**: Create an interactive onboarding quiz at `/start-here/quiz` that guides the user to top recommended herbs/compounds based on goal (Focus, Sleep, Stress) and restrictions (e.g., caffeine-free, high safety).
- **Why It Matters**: First-session retention. Guides new users to specific monograph pages without requiring database search knowledge.
- **Files Involved**:
  - `app/start-here/quiz/page.tsx` [NEW]
  - `src/components/quiz/RecommendationQuiz.tsx` [NEW]
- **Implementation Notes**:
  - Create a step-by-step questionnaire (Goal -> State -> Sensitivity -> Experience).
  - Filter the JSON dataset using weight metrics derived from evidence grades and safety tolerance.
  - Present top 3 matches with matching indicators (e.g., "95% Match").
- **Dependencies / Risks**:
  - Data structure must contain valid goals/effects fields for matching.
- **Success Criteria**:
  - Submitting the quiz dynamically displays the top 3 herbs/compounds with clickable monograph links.
- **Estimated Complexity**: Low

### Task 1.3: Evidence Drilldown & Interactive PMID Transparency Explorer
- **Goal**: Create a side-drawer or modal explorer for study citations. Clicking an evidence reference displays study type, GRADE certitude, citation metadata, and risk of bias scores.
- **Why It Matters**: Extreme authority and trust signaling. Validates scientific integrity inline.
- **Files Involved**:
  - `app/education/citation-explorer/page.tsx` [NEW]
  - `src/components/education/CitationDrawer.tsx` [NEW]
- **Implementation Notes**:
  - Parse references dynamically and display a drawer using clientside state.
  - Match details with a secondary dataset or mock study database where specific PMIDs are present.
- **Dependencies / Risks**:
  - Requires fallback states for references lacking metadata.
- **Success Criteria**:
  - Clicking any citation loads a detail side-drawer displaying study metrics and GRADE levels.
- **Estimated Complexity**: Medium

---

## Cluster 2: Advanced Search, Discovery & Filtering

### Task 2.1: Biological Pathway Connectivity Explorer
- **Goal**: Build an explorer at `/pathways/explorer` mapping target receptors (e.g. GABA-A, D2) to modulating compounds and herbs in the database.
- **Why It Matters**: Visualizes the scientific data moat. Translates neurochemistry to practical botanical selection.
- **Files Involved**:
  - `app/pathways/explorer/page.tsx` [NEW]
  - `src/components/pathways/PathwayExplorerClient.tsx` [NEW]
- **Implementation Notes**:
  - Map receptors parsed from mechanism fields.
  - Display interactive receptor cards that expand to reveal all active herbs/compounds agonizing/antagonizing that receptor.
- **Dependencies / Risks**:
  - Requires clean parser for active neurotransmitter keywords in the workbook records.
- **Success Criteria**:
  - Selecting a target receptor lists all modulating database entries sorted by mechanism confidence.
- **Estimated Complexity**: Medium

### Task 2.2: Dynamic Side-by-Side Comparison Matrix
- **Goal**: Allow users to select any two herbs/compounds from autocomplete inputs to compare evidence tiers, safety indicators, onset timing, target receptors, and common preparations side-by-side.
- **Why It Matters**: Key decision-support moment. Automates option triage.
- **Files Involved**:
  - `app/compare/dynamic/page.tsx` [NEW]
  - `src/components/compare/DynamicComparerClient.tsx` [NEW]
- **Implementation Notes**:
  - Multi-select autocomplete inputs.
  - Grid-based comparison rows.
  - Clear color indicators matching our branding rules (emerald for positive, amber for caution).
- **Dependencies / Risks**:
  - Must align with existing routing schemas.
- **Success Criteria**:
  - Comparison matrix successfully loads and updates dynamically as items are selected.
- **Estimated Complexity**: Medium

### Task 2.3: Affiliate-Aware Sourcing & Sourcing Checklist Tool
- **Goal**: Create a buying guide at `/buy-guide` detailing criteria checklists for popular herbs (e.g., standardization, testing) alongside affiliate links.
- **Why It Matters**: Direct monetization support and conversion readiness.
- **Files Involved**:
  - `app/buy-guide/page.tsx` [NEW]
  - `src/components/sourcing/BuyGuideClient.tsx` [NEW]
- **Implementation Notes**:
  - Map workbook `buying_criteria` array.
  - Render checklist cards showing quality thresholds.
  - Output CTA buttons with Amazon affiliate tags resolved from configuration.
- **Dependencies / Risks**:
  - Must load `AFFILIATE_TAGS.amazon` from `config/affiliate.ts` safely.
- **Success Criteria**:
  - Sourcing page successfully displays checklists and correct Amazon query URLs.
- **Estimated Complexity**: Low

---

## Cluster 3: Safety, Interactions & Trust Systems

### Task 3.1: Multi-Item Safety Interaction Checker Matrix
- **Goal**: Create a dedicated safety checker page at `/safety-checker` to verify polypharmacy and contraindication warning flags when taking multiple supplements together.
- **Why It Matters**: Core harm-reduction differentiator.
- **Files Involved**:
  - `app/safety-checker/page.tsx` [NEW]
  - `src/components/safety/SafetyCheckerClient.tsx` [NEW]
- **Implementation Notes**:
  - Input list search.
  - Cross-check interaction labels (e.g., MAOI interaction, anticoagulant warning).
  - Print prominent, non-collapsible caution alerts.
- **Dependencies / Risks**:
  - Safety data in workbook must be populated to show detailed warnings.
- **Success Criteria**:
  - Stacking 3 contradictory items triggers clear, readable safety warning alerts.
- **Estimated Complexity**: High

### Task 3.2: Dynamic Dosing & Yield Calculator
- **Goal**: Build an advanced dosage calculator at `/dosing` computing standard ranges based on user weight, baseline tolerance, and compound extract form.
- **Why It Matters**: Answers the most common user query accessibly.
- **Files Involved**:
  - `app/dosing/page.tsx` [NEW]
  - `src/components/dosing/DosageCalculatorClient.tsx` [NEW]
- **Implementation Notes**:
  - Build input fields for weight, extract standard, and compound choices.
  - Read workbook dosage fields and extrapolate calculations.
- **Dependencies / Risks**:
  - Strict disclaimers must be displayed above calculations.
- **Success Criteria**:
  - Selecting a compound and inputting metrics displays educational dosing ranges.
- **Estimated Complexity**: Medium

### Task 3.3: Verified Evidence Trust Score Dashboard
- **Goal**: Build a data-moat visualization page `/data-moat` presenting database completeness metrics, study counts, and GRADE certainty distributions.
- **Why It Matters**: Authority trust index. Visualizes database scale.
- **Files Involved**:
  - `app/data-moat/page.tsx` [NEW]
  - `src/components/moat/DataMoatClient.tsx` [NEW]
- **Implementation Notes**:
  - Aggregate workbook completeness factors (evidence tier, safety notes, mechanisms).
  - Render analytics charts showing data coverage.
- **Dependencies / Risks**:
  - JSON payloads must be read efficiently to prevent slow render loads.
- **Success Criteria**:
  - Dashboard loads completeness scores, lists database counts, and provides charts showing evidence distributions.
- **Estimated Complexity**: Medium

---

## Handoff / Next Step Notes

- [x] Cluster 1 Implementation Completed
  - **Summary**: Implemented the Interactive Stack Builder & Overlap Validator, Recommendation Quiz, and Citation side-drawer.
  - **Changed Files**:
    - `app/stacks/builder/page.tsx`
    - `src/components/stacks/StackBuilderClient.tsx`
    - `app/start-here/quiz/page.tsx`
    - `src/components/quiz/RecommendationQuiz.tsx`
    - `app/education/citation-explorer/page.tsx`
    - `src/components/education/CitationDrawer.tsx`
    - `app/layout.tsx`
  - **Architectural Decisions**:
    - Created decoupled global event handler in `CitationDrawer.tsx` to handle side-drawer triggers across all monograph pages without passing prop callbacks.
    - Used a weight-based scoring system in `RecommendationQuiz` to filter the static database for personalized recommendations.
    - Stored the custom stack in local storage to preserve configurations.
- [x] Cluster 2 Implementation Completed
  - **Summary**: Implemented the Biological Pathway Connectivity Explorer, Dynamic Side-by-Side Comparison Matrix, and Sourcing Checklist & Buy Guide.
  - **Changed Files**:
    - `app/pathways/explorer/page.tsx`
    - `src/components/pathways/PathwayExplorerClient.tsx`
    - `app/compare/dynamic/page.tsx`
    - `src/components/compare/DynamicComparerClient.tsx`
    - `app/buy-guide/page.tsx`
    - `src/components/sourcing/BuyGuideClient.tsx`
  - **Architectural Decisions**:
    - Built a client-side keyword matching parser to identify target neurochemical pathway connections and pull descriptive mechanism snippets dynamically.
    - Created an autocomplete search & swap interface for the side-by-side tradeoff matrix to allow flexible item comparisons.
    - Loaded buying checklists and resolved the Amazon affiliate tag variables dynamically using `AFFILIATE_TAGS` config definitions.
- [x] Cluster 3 Implementation Completed
  - **Summary**: Implemented the Multi-Item Safety Interaction Checker Matrix, Dynamic Dosing & Yield Calculator, and Verified Evidence Trust Score Dashboard.
  - **Changed Files**:
    - `app/safety-checker/page.tsx`
    - `src/components/safety/SafetyCheckerClient.tsx`
    - `app/dosing/page.tsx`
    - `src/components/dosing/DosageCalculatorClient.tsx`
    - `app/data-moat/page.tsx`
    - `src/components/moat/DataMoatClient.tsx`
    - `src/components/stacks/StackBuilderClient.tsx`
  - **Architectural Decisions**:
    - Implemented a multi-factor interaction checker matching cross-mechanisms (e.g. MAOI + stimulants, multiple sedatives, multiple anticoagulants) to show clinical warning cards.
    - Built a scaling dosage calculator applying adjustments for body weight, baseline experience (microdosing tolerance testing vs clinical upper bounds), and extract concentrations.
    - Aggregated total monograph completeness metrics (dosing, safety, citations, and evidence grades) to render a statistical trustworthiness summary page.
  - **Unresolved Risks**: None. All new routes build, pass strict lint parameters, and preserve static-export compliance.
