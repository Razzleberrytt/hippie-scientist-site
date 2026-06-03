# Goal-Driven Decision System Specification

## Purpose

The audit finding is that the site behaves like a searchable database: users must already know a herb, compound, or stack before the product becomes useful. This specification redesigns the experience around a goal-first decision engine where users begin with the outcome they want, provide lightweight context, receive filtered recommendations, and can then inspect the underlying evidence.

The system must preserve the existing static-export architecture and route contracts. It should extend the current discovery and depth layers rather than replace them.

## Product principle

The product should answer a user's practical question before exposing the database:

> “Given my goal, constraints, safety profile, and preference for evidence strength, what should I consider first, what should I avoid, and why?”

The experience should therefore be organized around eight primary goals:

1. Sleep
2. Focus
3. Stress
4. Anxiety
5. Energy
6. Mood
7. Pain
8. Recovery

Each goal becomes a decision surface, not merely a category page.

## Scope

### In scope

- Homepage flow that starts with goals instead of search or encyclopedic browsing.
- Navigation redesign that makes goals the primary information architecture.
- Goal page redesign for `/goals/:slug` routes.
- Intake quiz architecture for static-export-compatible personalization.
- Recommendation logic that ranks herbs, compounds, stacks, and educational next steps.
- Safety filtering logic that suppresses, demotes, or warns against unsafe options.
- Affiliate placement strategy that aligns monetization with user trust and decision readiness.

### Out of scope

- API routes, server actions, middleware, runtime revalidation, or any dynamic server runtime.
- Replacing the workbook as the source of truth.
- Hand-editing generated workbook JSON.
- Creating medical diagnosis, treatment, or emergency-care workflows.
- Claims that supplements treat, cure, or prevent disease.

## Non-negotiable architecture constraints

- Preserve existing depth routes:
  - `/herbs/:slug`
  - `/compounds/:slug`
  - `/stacks/:slug`
- Preserve goal routes:
  - `/goals/:slug`
- Preserve static export compatibility.
- Keep public generated data lean enough for static delivery.
- Treat recommendation outputs as educational decision support, not medical advice.
- Make safety filtering visible and explainable.
- Do not hide evidence limitations behind commercial calls to action.

## 1. Homepage flow

### Homepage objective

The homepage should stop functioning as a directory and become a guided entry point. Its primary job is to route users into the correct goal journey in fewer than ten seconds.

### Recommended homepage structure

#### 1. Hero: outcome-first promise

The first screen should communicate:

- What the site helps with: choosing herbs and supplements by goal.
- How it helps: evidence-aware, safety-filtered recommendations.
- What it is not: a diagnosis or substitute for medical care.

Suggested content hierarchy:

1. Headline: “Choose supplements by what you want to feel, not by what you already know.”
2. Subheadline: “Start with a goal, answer a few safety questions, and compare evidence-backed herbs, compounds, and stacks.”
3. Primary CTA: “Find my options”
4. Secondary CTA: “Browse goals”

The primary CTA should open the intake quiz or scroll to the goal selector. The secondary CTA should expose the eight goal cards.

#### 2. Goal selector grid

Display the eight goals as the dominant homepage navigation unit:

| Goal | User intent | Example homepage microcopy |
| --- | --- | --- |
| Sleep | Fall asleep, stay asleep, improve sleep quality | “Wind down, sleep deeper, or compare sleep aids.” |
| Focus | Attention, mental clarity, task persistence | “Support concentration without overstimulation.” |
| Stress | General stress load, resilience, calm | “Compare calming adaptogens and relaxation supports.” |
| Anxiety | Acute or recurring anxious feelings | “Find lower-risk calming options and safety notes.” |
| Energy | Fatigue, motivation, daytime vitality | “Explore steady energy without a crash.” |
| Mood | Low mood, emotional balance, positivity | “Compare mood-support options and interaction risks.” |
| Pain | Aches, inflammation, discomfort support | “Review evidence and safety tradeoffs for pain support.” |
| Recovery | Exercise recovery, soreness, immune resilience | “Support repair, soreness, and return-to-baseline.” |

Each card should link to `/goals/:slug` and offer a secondary “Answer questions first” action that launches the quiz with that goal preselected.

#### 3. Decision-path explanation

Below the goal grid, explain the decision process in three steps:

1. Pick your goal.
2. Filter by constraints, medications, sensitivities, and timing.
3. Compare first-line, situational, and avoid/caution options.

This section builds trust by showing that the site is not just ranking products by affiliate value.

#### 4. Featured goal modules

Feature two to four timely or high-demand modules, such as:

- “Sleep herbs vs. melatonin”
- “Natural anxiolytics beyond ashwagandha”
- “Best supplements for focus without caffeine”
- “Recovery stack for soreness and sleep quality”

These modules should route into goal pages or cluster guides, not directly into affiliate offers.

#### 5. Evidence and safety trust block

A concise trust block should explain:

- Evidence is graded.
- Safety constraints can remove or demote options.
- Herb and compound pages contain deeper citations and mechanisms.
- Affiliate links do not determine recommendation order.

#### 6. Optional browse fallback

Database browsing should remain available but visually secondary:

- Browse herbs
- Browse compounds
- Browse stacks
- Read guides

This preserves expert-user workflows without making them the default path.

### Homepage success metrics

- Percentage of homepage sessions entering a goal page.
- Percentage of homepage sessions starting the intake quiz.
- Reduction in direct reliance on global search as the primary first action.
- Click-through from goal pages to depth pages.
- Affiliate clicks after a recommendation explanation, not before.

## 2. Navigation redesign

### Navigation objective

Navigation should communicate that the site is a decision engine first and a reference library second.

### Primary navigation model

Recommended top-level navigation:

1. Goals
2. Quiz
3. Guides
4. Herbs
5. Compounds
6. Stacks

### Desktop navigation behavior

#### Goals menu

The Goals item should be the first primary nav element and should open a structured menu with the eight goals:

- Sleep
- Focus
- Stress
- Anxiety
- Energy
- Mood
- Pain
- Recovery

Each menu item should include a one-line intent cue. Example:

- Sleep — “Wind down, stay asleep, compare sleep aids.”
- Focus — “Support concentration, clarity, and task stamina.”

The menu should also include a persistent “Take the quiz” CTA.

#### Quiz item

The Quiz item should be prominent but not overbearing. It should route users to a goal-neutral intake start state where they first choose one of the eight goals.

#### Guides item

Guides should contain broader discovery content and comparison pages. It should not compete with Goals as the main path.

#### Herbs, Compounds, and Stacks

These should remain available for users with known-item intent. They should be visually lower priority than Goals and Quiz.

### Mobile navigation behavior

Mobile navigation should prioritize fast decision routing:

1. Sticky bottom or top action: “Find options”
2. First drawer section: “Choose a goal”
3. Second drawer section: “Browse library”
4. Third drawer section: “Guides and comparisons”

The mobile menu should avoid long alphabetical herb or compound lists as the first interaction.

### Breadcrumb model

Goal-first breadcrumbs should show the decision path:

- Home → Goals → Sleep
- Home → Goals → Sleep → Valerian
- Home → Quiz → Anxiety → Results

Depth pages reached from a goal should preserve goal context where feasible:

- “Recommended for Sleep” badge
- “Back to Sleep options” link
- Goal-specific comparison snippets

### Cross-linking rules

- Every herb and compound detail page should expose related goals.
- Every goal page should link to recommended herbs, compounds, stacks, and relevant guides.
- Every stack page should state the goal and use case it serves.
- Comparison guides should include a “Start with your goal” CTA.

## 3. Goal page redesign

### Goal page objective

Each `/goals/:slug` page should become a decision guide that helps users choose an option, not a static collection of related entries.

### Universal goal page template

All eight goal pages should share a consistent structure.

#### 1. Goal-specific hero

The hero should answer:

- What this goal means.
- Who this page is for.
- What decision the page helps make.
- Whether the user should take the quiz for safety filtering.

Example for Sleep:

- H1: “Best herbs and supplements for sleep support”
- Intro: “Compare options for winding down, sleep onset, sleep quality, and next-day grogginess risk.”
- Primary CTA: “Filter sleep options”
- Secondary CTA: “Compare all sleep supports”

#### 2. Intent segmentation

Each goal should split into sub-intents because one goal can mean different things.

| Goal | Sub-intents |
| --- | --- |
| Sleep | Sleep onset, staying asleep, sleep quality, next-day grogginess avoidance |
| Focus | Calm focus, stimulant-free focus, study/work endurance, mental clarity |
| Stress | Acute stress, daily resilience, nervous-system downshift, burnout support |
| Anxiety | Occasional anxious feelings, social tension, racing thoughts, body tension |
| Energy | Morning energy, afternoon slump, stimulant-free energy, fatigue support |
| Mood | Low mood support, emotional balance, stress-related mood, seasonal support |
| Pain | General aches, inflammatory discomfort, tension-related discomfort, recovery pain |
| Recovery | Muscle soreness, sleep-linked recovery, immune resilience, training adaptation |

The page should let users choose a sub-intent before showing a ranked list when possible.

#### 3. Recommendation tiers

Recommendations should be grouped into decision tiers rather than presented as one flat list.

Recommended tiers:

1. Best first look
   - Strongest balance of relevance, evidence, tolerability, and usability.
2. Good fit when
   - More situational options tied to sub-intents or preferences.
3. Use caution
   - Options with meaningful interaction, sedation, stimulation, pregnancy, liver, blood-thinning, or other risk considerations.
4. Usually not first-line
   - Lower evidence, narrow applicability, higher uncertainty, or better reserved for specific cases.

Each recommendation card should include:

- Name.
- Type: herb, compound, stack, or guide.
- Best-fit sub-intent.
- Evidence strength.
- Onset expectation, if known.
- Key safety flags.
- Why it appears here.
- “Compare” action.
- “Read full profile” action.

#### 4. Comparison table

Each goal page should include a concise comparison table with columns such as:

- Option
- Best for
- Evidence level
- Main tradeoff
- Avoid or ask clinician if
- Detail link

The table should be scannable and should not replace the explanatory recommendation cards.

#### 5. Safety checkpoint

Before affiliate placements or product links, each goal page should include a safety checkpoint:

- Medications that may change suitability.
- Pregnancy or breastfeeding cautions.
- Surgery or bleeding-risk cautions.
- Sedation, stimulation, or driving cautions.
- Liver, kidney, cardiovascular, psychiatric, or seizure-related cautions where relevant.

The page should invite users to run the quiz if any safety condition applies.

#### 6. Goal-specific education block

Each goal page should include educational context:

- What the goal commonly involves.
- Why mechanisms differ.
- Why “strongest” is not always “best.”
- When lifestyle, sleep, medical, or professional support may matter more than supplements.

#### 7. Related depth layer

Link users to:

- Herb profiles.
- Compound profiles.
- Stack pages.
- Comparison guides.
- Cluster pages.

The depth layer should feel like supporting evidence, not the starting point.

#### 8. Affiliate-aware buying guidance

At the bottom or after safety filtering, include product-selection guidance:

- What to look for on a label.
- Dose-form considerations.
- Quality markers.
- Third-party testing or certificate-of-analysis guidance where applicable.
- Ingredient forms to avoid if relevant.

Affiliate links should appear only after this guidance and should be clearly labeled.

### Goal page content requirements

Each goal page should define:

- `goal_slug`
- `goal_name`
- `primary_intents`
- `contraindication_prompts`
- `recommended_options`
- `excluded_or_caution_options`
- `related_guides`
- `affiliate_slots`
- `disclaimer_variant`

## 4. Intake quiz architecture

### Quiz objective

The intake quiz should convert a broad user goal into a safer, more useful recommendation set. It should be short enough to complete but robust enough to avoid obviously unsuitable suggestions.

### Static-export-compatible implementation model

The quiz should be client-side and data-driven. It should not require server state, API routes, or runtime personalization. The quiz can read static JSON decision data and produce results in the browser.

### Quiz entry points

The quiz should be accessible from:

- Homepage hero.
- Goal cards.
- Goal page hero.
- Safety checkpoint sections.
- Navigation.
- Recommendation cards where safety flags apply.

### Quiz flow overview

#### Step 1: Goal selection

Prompt:

- “What do you want help with first?”

Options:

- Sleep
- Focus
- Stress
- Anxiety
- Energy
- Mood
- Pain
- Recovery

If the user starts from a goal page, preselect that goal but allow changing it.

#### Step 2: Sub-intent selection

Prompt:

- “What version of this goal best matches you?”

Examples:

- Sleep: falling asleep, staying asleep, avoiding grogginess, general sleep quality.
- Focus: calm focus, stimulant-free focus, work endurance, mental clarity.
- Energy: morning energy, afternoon slump, stimulant-free energy, exercise-related energy.

#### Step 3: Preference filters

Capture non-medical preferences:

- Avoid sedation.
- Avoid stimulation.
- Avoid caffeine.
- Prefer fast onset.
- Prefer daily support.
- Prefer occasional use.
- Prefer single ingredients.
- Open to stacks.
- Vegan or capsule constraints, if relevant.

#### Step 4: Safety screening

Ask broad safety questions without collecting unnecessary personal health data:

- Are you pregnant, trying to conceive, or breastfeeding?
- Are you taking prescription medications?
- Are you taking blood thinners, sedatives, antidepressants, stimulants, blood-pressure medication, diabetes medication, or immune-suppressing medication?
- Do you have liver disease, kidney disease, bipolar disorder, seizure disorder, cardiovascular disease, or a hormone-sensitive condition?
- Do you have surgery scheduled in the next two weeks?
- Are you under 18?

Answers can be:

- Yes
- No
- Not sure
- Prefer not to say

“Not sure” and “Prefer not to say” should trigger conservative filtering or stronger warnings.

#### Step 5: Experience and sensitivity

Ask:

- Are you sensitive to sedating supplements?
- Are you sensitive to stimulants?
- Have you had side effects from herbs or supplements before?
- Do you need to drive, work, or operate machinery after use?

#### Step 6: Results

Results should be grouped into:

1. Best first options
2. Good situational fits
3. Consider only with caution
4. Not a fit based on your answers

The results page should explain why each option appears, is demoted, or is filtered out.

### Quiz result card requirements

Each result card should show:

- Recommendation tier.
- Option name.
- Goal and sub-intent match.
- Evidence level.
- Preference match.
- Safety status:
  - Clear based on answers
  - Caution
  - Avoid based on answers
  - Ask a clinician
- Top reason for inclusion.
- Top reason for caution.
- Links to full herb, compound, or stack page.
- Optional product-selection guidance, after safety notes.

### State and privacy model

- Keep quiz state in browser memory or URL-safe parameters when useful.
- Do not collect names, email addresses, diagnoses, or free-text health details as part of the core quiz.
- If results are shareable, avoid exposing sensitive health answers in plain URL parameters.
- If persistence is added later, require explicit consent.

### Quiz completion metrics

- Quiz starts by source.
- Step drop-off.
- Goal selection distribution.
- Safety filter activation rate.
- Result-card clicks.
- Affiliate clicks from result pages.
- “Not a fit” impressions, which indicate safety logic is active.

## 5. Recommendation logic

### Recommendation objective

The recommendation engine should balance relevance, evidence, safety, user preference, content quality, and monetization integrity. It should not simply sort by popularity, affiliate value, or search volume.

### Recommendation inputs

#### Goal match

Each option should map to one or more goals:

- Primary goal match.
- Secondary goal match.
- Unsupported or speculative goal match.

#### Sub-intent match

Options should map to sub-intents within a goal. For example, an option may be suitable for sleep onset but not sleep maintenance.

#### Evidence score

Evidence should be normalized across herbs, compounds, and stacks. Suggested evidence dimensions:

- Human clinical evidence.
- Traditional-use support.
- Mechanistic plausibility.
- Consistency of findings.
- Quality and recency of sources.
- Relevance to the exact goal and sub-intent.

#### Safety score

Safety should include:

- Known contraindications.
- Interaction potential.
- Side-effect burden.
- Special population risks.
- Dose sensitivity.
- Sedation or stimulation risk.
- Quality-control concerns.

#### Fit score

Fit should include user preferences:

- Fast onset versus daily support.
- Sedating versus non-sedating.
- Stimulating versus non-stimulating.
- Single ingredient versus stack.
- Avoidance preferences.
- Tolerance for uncertainty.

#### Content readiness score

To preserve trust, recommendations should favor options with complete public-facing support:

- Published herb, compound, or stack page.
- Evidence summary available.
- Safety summary available.
- Slug and required fields valid.
- Affiliate guidance available only where appropriate.

### Suggested ranking model

Use a transparent weighted model:

```text
base_score =
  goal_match_weight
+ sub_intent_weight
+ evidence_weight
+ preference_fit_weight
+ content_readiness_weight
- safety_risk_penalty
- uncertainty_penalty
```

Safety penalties should be capable of overriding all other scores.

### Recommendation tiers

#### Best first look

Criteria:

- Strong goal and sub-intent match.
- Acceptable safety profile for general audiences.
- Adequate evidence or clear traditional-use framing.
- Complete content page.
- Not primarily monetization-driven.

#### Good fit when

Criteria:

- Strong match for a narrower sub-intent.
- Useful when the user has a specific preference.
- Moderate evidence or narrower applicability.
- Safety profile is manageable with clear warnings.

#### Use caution

Criteria:

- Relevant to the goal but has meaningful safety, interaction, sedation, stimulation, or quality concerns.
- May be appropriate only for selected users.
- Should not be presented as a default first choice.

#### Usually not first-line

Criteria:

- Weak evidence for the specific goal.
- Better alternatives exist.
- Risk or uncertainty is high relative to benefit.
- Content is incomplete.

#### Not a fit based on your answers

Criteria:

- User-selected safety or preference answers conflict with the option.
- The option is contraindicated, strongly cautioned, or mismatched.

### Explainability requirements

Every recommendation should include at least one positive reason and one tradeoff:

- “Why it may fit”
- “Why it may not”
- “What to compare it against”

When an option is filtered out, the result should not silently disappear. The system should disclose:

- The option name.
- The reason it was excluded or demoted.
- A safer next step, such as reading safety notes or asking a clinician.

### Editorial override model

The system should allow editorial controls for:

- Temporarily suppressing an option.
- Pinning a caution note.
- Preventing affiliate placement for an option.
- Marking content as incomplete.
- Requiring clinician guidance language.

Overrides should be documented and auditable.

## 6. Safety filtering logic

### Safety objective

Safety filtering should prevent the recommendation engine from promoting options that are inappropriate for a user's stated constraints. It should be conservative, explainable, and more important than ranking score.

### Safety severity levels

Use a consistent severity model:

| Level | Label | Behavior |
| --- | --- | --- |
| 0 | No known issue from provided answers | Recommendation can appear normally. |
| 1 | Note | Show contextual safety note without demotion. |
| 2 | Caution | Show warning and demote from first-line placement. |
| 3 | Ask clinician | Remove from “best first” and require clinician guidance language. |
| 4 | Avoid based on answers | Exclude from recommended tiers and show in “not a fit” if relevant. |

### Safety rule categories

#### Medication interaction rules

Potential rule families:

- Sedatives and sleep medications.
- Antidepressants and serotonergic agents.
- Stimulants and ADHD medications.
- Blood thinners and antiplatelet drugs.
- Blood-pressure medications.
- Diabetes medications.
- Immunosuppressants.
- Hormonal medications.

#### Condition-based rules

Potential rule families:

- Pregnancy, trying to conceive, or breastfeeding.
- Under 18.
- Liver disease.
- Kidney disease.
- Bipolar disorder or mania history.
- Seizure disorder.
- Cardiovascular disease or arrhythmia.
- Hormone-sensitive conditions.
- Autoimmune conditions.
- Surgery scheduled within two weeks.

#### Functional safety rules

Potential rule families:

- Needs to drive or operate machinery.
- Avoids sedation.
- Avoids stimulation.
- Sensitive to caffeine or stimulants.
- Needs workplace-safe daytime use.
- Wants to avoid next-day grogginess.

#### Product-quality rules

Potential rule families:

- High adulteration risk category.
- Narrow therapeutic window.
- Requires standardized extract to interpret evidence.
- Requires third-party testing or certificate of analysis.
- Known contamination or mislabeling concerns.

### Rule processing order

Safety rules should run before recommendation ranking is finalized.

Recommended order:

1. Validate goal and sub-intent.
2. Load candidate options for the goal.
3. Apply hard exclusions from direct safety conflicts.
4. Apply clinician-guidance rules.
5. Apply caution demotions.
6. Apply preference mismatches.
7. Score remaining candidates.
8. Assign tiers.
9. Generate explanations and warnings.
10. Add affiliate placements only for eligible, non-excluded options.

### Hard exclusion examples

Hard exclusions should be used sparingly and only when the rule is clear enough for conservative public guidance. Examples of exclusion triggers may include:

- Pregnancy or breastfeeding when the option lacks adequate safety support or carries known concern.
- Blood-thinner use for options with meaningful bleeding-risk concern.
- Sedating options when the user must drive or operate machinery soon after use.
- Stimulant-like options when the user explicitly avoids stimulation or has relevant cardiovascular concerns.

### Demotion examples

Demotion is appropriate when risk is meaningful but not necessarily disqualifying:

- Mild sedation risk for a user who prefers non-sedating support.
- Caffeine-like stimulation for a focus user who did not explicitly avoid stimulants.
- Interaction uncertainty for users who take prescription medications but do not specify category.
- Evidence uncertainty for options with mostly traditional or mechanistic support.

### Safety copy requirements

Safety language should be direct but not alarmist.

Recommended pattern:

1. State the issue.
2. Explain why it matters.
3. Tell the user what to do next.

Example:

> “This option may increase drowsiness. Because you said you need to drive or work after use, it is not shown as a first-line sleep option. Review the safety notes and consider asking a clinician before using it.”

### Medical disclaimer placement

Disclaimers should appear:

- On quiz start.
- Before quiz results.
- In every goal page safety checkpoint.
- Near any recommendation result affected by medication, pregnancy, psychiatric, cardiovascular, liver, kidney, seizure, or surgery-related concerns.
- Before affiliate links when safety concerns are present.

Disclaimers should not be used as a substitute for filtering.

## 7. Affiliate placement strategy

### Affiliate objective

Affiliate monetization should support the decision journey without undermining trust. The user should encounter product links only after the site has clarified fit, safety, and quality criteria.

### Placement principles

- Never rank recommendations by affiliate payout.
- Never place affiliate CTAs above safety warnings.
- Never place affiliate CTAs on excluded or “avoid based on answers” options.
- Avoid aggressive product grids on goal-page hero sections.
- Prefer educational buying guidance before product links.
- Make affiliate relationships visible and plain-language.

### Recommended affiliate surfaces

#### 1. Goal page buying guidance

After recommendations and safety checkpoints, include a “How to choose a product” section for eligible options.

Content should include:

- Preferred forms.
- Standardization notes.
- Label checks.
- Quality markers.
- When to avoid blends.
- When third-party testing matters.

Affiliate links can appear after this section as:

- “Example product category” links.
- “Compare options” links.
- “See vetted picks” modules, if the site has a vetted-product process.

#### 2. Recommendation result cards

Affiliate links may appear on quiz result cards only when:

- The option is in “Best first options” or “Good situational fits.”
- No unresolved high-severity safety conflict exists.
- The user has already seen the relevant safety note.
- The link is secondary to “Read full profile” or “Compare.”

Recommended CTA hierarchy:

1. Read full profile
2. Compare options
3. Product selection tips
4. Shop examples

#### 3. Herb, compound, and stack detail pages

Depth pages can include affiliate placements after:

- Evidence summary.
- Safety summary.
- Dose-form or product-quality discussion.

Affiliate CTAs should be option-specific and should not obscure contraindications.

#### 4. Comparison guides

Guides can include affiliate modules when the user is comparing product categories, but modules should be placed after the comparison criteria and safety caveats.

#### 5. Email or saved-results follow-up, future phase

If the product later adds saved results or email follow-up, affiliate links should remain tied to the user's filtered recommendations and should include the same safety caveats.

### Affiliate suppression rules

Suppress affiliate CTAs when:

- The option is excluded by safety filtering.
- The option is in “Ask clinician” state.
- Evidence is too weak for a product-forward recommendation.
- Content readiness is incomplete.
- The product category has unresolved quality-control concerns.
- The user selected pregnancy, breastfeeding, under 18, complex medication use, or “not sure” for major safety questions, unless the CTA is purely educational and non-product-specific.

### Affiliate disclosure model

Disclosures should be clear and local to the placement. Example:

> “Some links may earn a commission. Recommendation order is based on goal fit, evidence, safety, and content quality — not commission.”

The disclosure should appear:

- On pages with affiliate links.
- Near product modules.
- In quiz results when product links are shown.

### Trust-preserving monetization metrics

Track affiliate performance alongside trust and safety metrics:

- Affiliate clicks by recommendation tier.
- Affiliate clicks after safety warning exposure.
- Affiliate clicks on excluded options, expected to be zero.
- Depth-page reads before affiliate clicks.
- Quiz completion before affiliate clicks.
- Product-module impressions by goal.

Revenue should be evaluated against user progression quality, not raw outbound clicks alone.

## Data model implications

Although this specification requires no code changes, implementation will require goal-first metadata that can be generated from or linked to the existing workbook and editorial data.

### Required conceptual entities

#### Goal

Fields:

- `slug`
- `name`
- `description`
- `sub_intents`
- `safety_prompts`
- `related_guides`
- `disclaimer_variant`

#### Recommendation candidate

Fields:

- `target_type`: herb, compound, stack, guide
- `target_slug`
- `goal_slug`
- `sub_intent_slugs`
- `goal_match_strength`
- `evidence_level`
- `safety_flags`
- `preference_tags`
- `content_readiness`
- `affiliate_eligibility`
- `editorial_notes`

#### Safety rule

Fields:

- `rule_id`
- `trigger_question`
- `trigger_answer`
- `affected_target_type`
- `affected_target_slug`
- `severity`
- `action`: note, demote, clinician, exclude
- `user_message`
- `editorial_rationale`

#### Affiliate slot

Fields:

- `slot_id`
- `page_type`
- `goal_slug`
- `target_type`
- `target_slug`
- `placement`
- `eligibility_rule`
- `disclosure_required`

## Rollout plan

### Phase 1: Static goal-first IA

- Update homepage hierarchy to prioritize the eight goals.
- Redesign navigation around Goals and Quiz.
- Update `/goals/:slug` pages to use the universal goal template.
- Add non-personalized recommendation tiers using existing content.
- Add visible safety checkpoints.

### Phase 2: Client-side quiz MVP

- Add goal and sub-intent quiz steps.
- Add basic preference filters.
- Add conservative safety screening.
- Generate explainable static results from public data.
- Suppress affiliate links for excluded or clinician-guidance states.

### Phase 3: Ranking and safety maturity

- Add weighted scoring.
- Add editorial override controls.
- Add richer safety rule coverage.
- Add analytics for filtering, demotion, result clicks, and affiliate safety compliance.

### Phase 4: Product-selection maturity

- Add vetted product criteria.
- Add COA or third-party testing guidance.
- Add goal-specific product selection modules.
- Add saved results or email follow-up only if privacy and consent requirements are met.

## Acceptance criteria

The goal-driven system is successful when:

- A first-time user can start from one of the eight goals without knowing any herb or compound name.
- Every goal page provides ranked, explained options rather than a flat database list.
- Safety filtering can demote or exclude recommendations before affiliate links appear.
- Affiliate placements are downstream of evidence, safety, and product-quality education.
- Database browsing remains available but is no longer the dominant mental model.
- The architecture remains compatible with static export and existing route contracts.

## Open questions

- Which evidence grading scale should be canonical across herbs, compounds, and stacks?
- Which safety rules are strict enough for hard exclusion versus demotion?
- Should quiz result URLs be shareable, and if so, how should sensitive answers be protected?
- What qualifies a product for “vetted” placement versus generic buying guidance?
- Should stacks be recommended only after single-ingredient options, or can some stacks appear as first-line for selected goals?
