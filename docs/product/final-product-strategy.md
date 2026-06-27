# Final Product Strategy

Date: 2026-05-30
Role: Chief Product Officer synthesis
Scope: strategy only. No code, route, component, data-pipeline, or refactor work is included.

## Executive decision

The Hippie Scientist should not become a general supplement encyclopedia, a full recommendation app, or a product marketplace. The highest-ROI product is a **static, evidence-and-safety decision guide that helps supplement buyers choose a small, sensible shortlist for a specific goal before clicking to product-quality or affiliate paths**.

The strategy is therefore:

> Win the moment immediately before purchase by helping skeptical users answer: “What should I consider first, what should I avoid, and what product-quality signals matter?”

This means the product should simplify around goal-led decision pages, concise safety screening, comparison support, and a small curated commercial layer. Everything else should be secondary until those surfaces prove traffic and outbound-click potential.

## 1. Planning-document review

### 1.1 Contradictions between documents

| Contradiction | Documents in tension | CPO decision |
| --- | --- | --- |
| **Number of primary goals varies.** The plans name 6, 8, 10, and broader commercial categories. | `goal-driven-system` centers 8 goals; `homepage-v2` recommends 6 homepage goals; `intake-wizard` lists 10 choices; `product-vision` and `revenue-priority-plan` mention still broader jobs like blood pressure, testosterone, gut health, fat loss, joint support, and brain fog. | Use **6 homepage goals** for focus and conversion: Sleep, Stress/Calm, Focus/Energy, Mood, Inflammation/Recovery, Gut Comfort. Keep additional goals as SEO/depth pages, not primary navigation until demand proves them. |
| **Wizard length differs.** | `intake-wizard` says default 3 questions, expand to 5; `homepage-v2` recommends 4-6 questions. | MVP wizard should be **3 required questions plus 1 optional safety question**. More questions reduce completion before value is delivered. |
| **Product wants a decision engine, but specs drift toward an app.** | `product-vision`, `goal-driven-system`, `intake-wizard`, and `recommendation-engine` describe saved results, preference tuning, alternatives, diversity rules, editorial overrides, and detailed states. | Build a **decision guide MVP**, not a personalized app. No accounts, saved plans, dynamic personalization, or complex recommendation infrastructure in the first shipping cycle. |
| **Route consolidation says keep many surfaces while product strategy says simplify.** | `route-consolidation-plan` keeps most routes and delays redirects; revenue/product docs call for clearer canonical journeys. | Do not modify routes now. Product direction should still identify a **canonical journey**: homepage/SEO entry -> goal guide -> comparison/profile -> product-quality CTA. |
| **Commercial urgency conflicts with safety-first sequencing.** | `revenue-priority-plan` prioritizes product registry and affiliate conversion; `recommendation-engine` and `goal-driven-system` require safety gates before affiliate output. | Safety wins. Affiliate CTAs appear only after evidence, fit, and safety context. Product registry is valuable only for ingredients with adequate safety and content readiness. |
| **Homepage spec has too many sections for a first impression.** | `homepage-v2` defines hero, goals, wizard, recommendation preview, comparison preview, evidence, safety, affiliate placements, mobile rules, metrics, and more. | MVP homepage should expose only the first four jobs: promise, choose goal, answer 3 questions, see what a shortlist looks like. Trust and monetization modules should be concise. |
| **Terminology fragments the same job.** | Documents alternate between quiz, intake wizard, recommendation engine, safety checker, planner, builder, decision engine, sourcing, and buy guide. | Use one customer-facing concept: **Find my shortlist**. Internal modules can remain separate, but the user should experience one flow. |

### 1.2 Duplicate features

The same user need appears under multiple product names:

1. **Quiz / intake wizard / start-here flow / recommendation preview** — all attempt to route a user from a broad goal to a shortlist.
2. **Recommendation engine / goal page tiers / profile recommendation rails** — all rank or frame options by goal fit, evidence, and safety.
3. **Safety checker / safety gates / contraindication modules / conservative states** — all identify avoid, caution, or clinician-review situations.
4. **Buy guide / sourcing pages / product-quality checklists / vetted product registry** — all help users decide what product form or quality signals matter.
5. **Top pages / best-supplements pages / best-for pages / goal pages** — all answer “what should I try for this goal?” with different SEO wrappers.
6. **Comparison previews / comparison routes / alternatives in recommendation output** — all serve the same decision bridge between options.
7. **Builder / planner / stack builder / protocols planner** — all imply multi-step stack construction, which is lower priority than single-goal single-ingredient decisions.

CPO decision: collapse duplicates into four mental models:

- **Goal guides** — canonical decision surfaces.
- **Find my shortlist** — lightweight intake and shortlist flow.
- **Compare options** — decision bridge for high-intent users.
- **Product-quality guidance** — buying criteria and affiliate path after trust is earned.

### 1.3 Over-engineered features

These features are too complex for the current revenue stage:

- Full weighted recommendation engine with scoring components, diversity rules, alternatives, and multiple output states.
- Editorial override controls before the team knows which goals and pages convert.
- Saved results, email updates, and account-like retention mechanics.
- Shareable result URLs that may encode sensitive safety answers.
- Full vetted marketplace behavior across many herbs and compounds.
- Large route consolidation program across 186 routes before canonical money pages are proven.
- Many specialized interactive tools: stack builder, planner, safety checker, quiz, pathway explorer, and build flow.
- Granular dashboards before a simpler event set confirms outbound-click behavior.

CPO decision: use **manual editorial shortlists and static decision tables first**. Add scoring only after real traffic shows repeated choices that need automation.

### 1.4 Features unlikely to generate near-term revenue

These may build trust, but they are not near-term revenue drivers unless tightly connected to decision journeys:

- Broad education hubs not tied to buyer intent.
- Deep mechanism pages without product-quality or comparison next steps.
- Safety-sensitive workflows as standalone destinations; these reduce harm and improve trust, but direct affiliate conversion will be low.
- Email capture before the first useful shortlist.
- Long-tail topic hubs that do not map to monetizable goals.
- Stack-building for advanced users before simple single-goal recommendations convert.
- Route-cleanup work that does not improve rankings, clicks, or conversion clarity.

CPO decision: keep trust content, but measure it by assisted conversion and internal-link value, not direct revenue.

### 1.5 Features requiring significant maintenance

High-maintenance items that should be constrained:

- Curated or vetted product registry, because products, prices, labels, availability, testing claims, and seller quality change frequently.
- Safety rules and contraindication logic, because omissions create trust and harm risk.
- Evidence grading across hundreds of herbs and compounds.
- Multi-goal recommendation scoring across herbs, compounds, stacks, and guides.
- Large comparison libraries, because each comparison needs updated evidence, safety, and product-form guidance.
- Route consolidation inventories and redirect maps.
- Email sequences or saved-result updates.
- Analytics taxonomies if every module, goal, ingredient, and device dimension is tracked from day one.

CPO decision: start with a **small commercial set**: the top goals and top ingredients where content readiness, search demand, and product-quality guidance overlap.

### 1.6 Features creating technical complexity without improving user outcomes

Avoid or postpone:

- Server-like personalization, API-backed recommendations, or runtime-only behavior that conflicts with static export.
- Multiple parallel interactive entry points that all ask similar questions.
- Recommendation scores exposed as pseudo-precision when editorial explanations would be clearer.
- Automated product ranking before the brand can define and maintain quality criteria.
- Dynamic result sharing if it complicates privacy and safety messaging.
- Deep route restructuring before content parity and search impact are clear.
- Loading large datasets on first homepage interaction instead of using lean curated payloads.

## 2. What is the single core job this product performs?

**The Hippie Scientist helps a skeptical supplement buyer choose a safe, evidence-aware shortlist for a specific goal and understand what product-quality signals to check before buying.**

Everything should support that one job:

1. Start from a goal or buyer-intent search.
2. Reduce the universe to a few plausible options.
3. Make safety and uncertainty visible.
4. Compare the most realistic alternatives.
5. Send ready users to product-quality or affiliate paths only after trust is earned.

## 3. The 3 most important user journeys

### Journey 1: Goal-led buyer journey

**User question:** “What should I try for sleep, stress, focus, mood, recovery, or gut comfort?”

Path:

1. User lands on homepage, a goal page, or a `best-supplements-for-*` SEO page.
2. User selects a goal.
3. Page shows a concise decision table: best first options, situational options, and avoid/caution options.
4. User sees evidence level, safety caveat, and form/quality guidance.
5. User clicks to comparison, profile, or product-quality CTA.

Why it matters: this is the broadest, highest-ROI journey because it captures problem-aware and purchase-aware traffic.

### Journey 2: Ingredient-led validation journey

**User question:** “I heard about this ingredient. Is it worth considering, and is it safe for me?”

Path:

1. User lands on `/herbs/:slug` or `/compounds/:slug`.
2. Profile gives a decision snapshot: best if, avoid if, evidence level, safety watchout, and related goals.
3. User can compare against the most common alternatives.
4. Product-quality guidance appears only after evidence and safety context.

Why it matters: many users arrive with branded or ingredient-specific intent and need one trustworthy final nudge.

### Journey 3: Comparison-led decision journey

**User question:** “Which of these two or three options is the better fit?”

Path:

1. User lands on a comparison page, goal page comparison module, or recommendation card.
2. A small matrix compares best use case, onset, sedation/stimulation risk, evidence confidence, safety caveats, and form to look for.
3. User chooses a direction and proceeds to profile or product-quality guidance.

Why it matters: comparison intent is close to purchase and differentiates the brand from generic “best supplement” lists.

## 4. The 5 highest-ROI features

### 1. Goal decision tables for priority goals

Build static, editorially controlled tables for the highest commercial goals. Each table should include:

- best first options,
- situational options,
- avoid/caution options,
- evidence confidence,
- strongest safety watchout,
- product form or quality signal,
- profile/comparison next step.

Priority goals for launch:

1. Sleep.
2. Stress/Calm.
3. Focus/Energy.
4. Mood.
5. Inflammation/Recovery.
6. Gut Comfort.

### 2. A lightweight “Find my shortlist” intake

Ship a 3-question flow:

1. Goal.
2. Desired effect profile or timing.
3. Safety context.

Output should be a conservative shortlist, not a clinical plan. Do not require account creation or email.

### 3. Profile decision snapshots on top commercial ingredients

For top herbs and compounds, add a compact module:

- Best fit if...
- Avoid or use caution if...
- Evidence strength.
- Product form/quality signal.
- Compare against...

This converts ingredient-aware traffic without redesigning every profile.

### 4. Product-quality CTA and small curated commercial registry

Start with buying criteria and a small set of commercially meaningful ingredients. Do not attempt a marketplace. The first commercial layer should answer:

- Which form matters?
- What label details matter?
- What testing or transparency signals matter?
- When should the user avoid buying?

Affiliate links should be suppressed for unsafe, incomplete, or weak-evidence contexts.

### 5. Simple funnel analytics

Track only what informs revenue decisions:

- goal selected,
- shortlist started/completed,
- profile click,
- comparison click,
- product-quality CTA click,
- affiliate outbound click.

Avoid a complex dashboard until these basic events identify winning goals, ingredients, and templates.

## 5. What should be removed?

“Removed” means removed from the product roadmap or user-facing priority, not deleted from routes in this strategy document.

1. **Marketplace ambition** — do not build a broad vetted product marketplace yet.
2. **Account/saved-plan assumptions** — no login, saved plans, or retention mechanics before conversion basics work.
3. **Multiple competing entry tools** — do not promote quiz, builder, planner, safety checker, pathway explorer, and stack builder as equal primary actions.
4. **Pseudo-precise scoring UX** — do not show numeric recommendation scores that imply clinical certainty.
5. **Affiliate-first modules** — no hero shopping blocks, no product cards before safety context, no monetization on excluded/cautionary outputs.
6. **Broad homepage database browsing as the primary path** — keep browse links secondary.
7. **Full-route cleanup as a revenue prerequisite** — do not spend the next phase consolidating routes unless a duplicate is actively hurting a priority journey.

## 6. What should be postponed?

Postpone until the first revenue loop proves demand:

1. Full weighted recommendation engine and diversity/alternative logic.
2. Editorial override tooling.
3. Large-scale route redirects and namespace consolidation.
4. Saved shortlist, email updates, and account-like retention.
5. Shareable personalized result URLs.
6. Stack builder and protocol planner improvements beyond basic linking.
7. Broad product registry expansion beyond the first high-intent ingredients.
8. Deep analytics dashboard dimensions beyond the six core events.
9. Large comparison library expansion outside priority goals.
10. Additional homepage sections beyond MVP hierarchy.

## 7. What should be built first?

### First build: Goal-first revenue MVP

The first build should be a tight, static-export-compatible MVP with no route changes:

1. **Homepage simplification**
   - One promise.
   - Six goal cards/chips.
   - One “Find my shortlist” CTA.
   - One recommendation-preview example.
   - One concise trust/safety block.

2. **Priority goal page template**
   - Start with Sleep, Stress/Calm, and Focus/Energy.
   - Add decision tables and safety-first tiers.
   - Link to the best existing profiles and comparisons.

3. **Top ingredient profile snapshots**
   - Add decision snapshots only to ingredients that support the three initial goals and have enough evidence/safety content.

4. **Product-quality CTA**
   - Add buying criteria before affiliate links.
   - Use a small commercial registry or curated product guidance only where maintainable.

5. **Simple analytics**
   - Track shortlist starts, completions, comparison clicks, profile clicks, product-quality clicks, and affiliate outbounds.

### Build order

| Order | Build item | Reason |
| --- | --- | --- |
| 1 | Sleep goal decision table | Highest buyer intent and easiest to compare against melatonin/magnesium/calming herbs. |
| 2 | Stress/Calm goal decision table | Strong demand and natural fit for safety-sensitive guidance. |
| 3 | Focus/Energy goal decision table | High commercial value and clear stimulant/sedation tradeoffs. |
| 4 | Top 10 profile decision snapshots | Converts existing ingredient traffic with minimal surface area. |
| 5 | Product-quality CTA for first commercial ingredients | Creates revenue path after trust context. |
| 6 | Lightweight intake flow | Useful once static goal tables provide reliable outputs. |
| 7 | Basic analytics review loop | Confirms which goals and CTAs deserve expansion. |

## 8. Non-negotiable product principles

1. **Safety before monetization.** If safety context is high-risk or unclear, the next step is education or clinician review, not a product link.
2. **Fewer, better decisions.** The product should reduce choices, not expose the whole database at once.
3. **Manual before automated.** Editorial shortlists beat complex scoring until enough behavior data exists.
4. **Static-first.** Preserve static export and route contracts.
5. **Trust compounds.** Cautious language, disclosures, evidence limits, and “do not buy” guidance are part of the revenue strategy, not obstacles to it.
