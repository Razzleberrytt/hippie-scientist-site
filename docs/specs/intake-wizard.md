# Intake Wizard Specification

## 1. Purpose

The intake wizard should take a visitor from a broad, uncertain starting point — “I want help” — to a concise set of evidence-aware supplement, herb, compound, or stack options that fit their goal, desired experience, safety context, and tolerance for uncertainty.

The wizard is not a diagnosis tool, treatment plan, or medical advice engine. It is a decision-support layer that narrows the site’s existing depth content into a safer, more useful shortlist.

Primary outcome:

> Here are the best evidence-aware options for your stated goal and constraints, with safety flags and clear next steps.

## 2. Product Principles

1. **Safety before ranking** — options with relevant medication, pregnancy, condition, or high-risk interaction concerns should be filtered or demoted before fit scores are presented.
2. **Evidence-aware, not evidence-only** — recommendations should account for evidence strength, goal fit, user preference, practical usability, and safety fit.
3. **Short, calm, and reversible** — the default intake should be 3 questions; expand to 5 only when safety or preference clarification is needed.
4. **No false personalization** — the wizard should explain why an option is shown, not imply clinical certainty.
5. **Static-export compatible** — all logic should be implementable client-side from static JSON payloads; no API route, server action, runtime revalidation, or dynamic server dependency is required.

## 3. Scope

### In scope

- A 3–5 question guided intake flow.
- Goal-based recommendation shortlists.
- Safety filtering and warning states.
- Preference-based ranking adjustments.
- Links into existing depth routes:
  - `/goals/:slug`
  - `/herbs/:slug`
  - `/compounds/:slug`
  - `/stacks/:slug`

### Out of scope

- User accounts or saved plans.
- Diagnosis, dosing personalization, or treatment claims.
- Real-time drug interaction APIs.
- Runtime backend recommendation services.
- Product checkout or direct “buy now” as the wizard’s first output.

## 4. Recommended Question Flow

The default wizard should begin with 3 required questions and add up to 2 conditional questions.

| Step | Question | Required | Purpose | Example choices |
| --- | --- | --- | --- | --- |
| 1 | What do you want help with? | Yes | Establish primary goal and route intent. | Sleep, stress/anxiety, focus, mood, energy, recovery, digestion, inflammation, libido, immune support |
| 2 | How soon are you hoping to feel something? | Yes | Capture speed expectation and distinguish acute-feel options from longer-horizon options. | Today/this week, within 2–4 weeks, long-term support, no preference |
| 3 | What kind of effect do you prefer? | Yes | Match sedating, calming, neutral, or stimulating profiles. | More calming/sedating, calm but daytime-friendly, more energizing/stimulating, no preference |
| 4 | Are you taking medications or managing a medical condition? | Conditional but strongly recommended for higher-risk goals | Trigger safety filters and conservative result language. | No, yes medications, yes medical condition, pregnancy/breastfeeding, not sure |
| 5 | How experienced are you with supplements or herbs? | Conditional | Tune explanation depth, novelty, and risk tolerance. | Beginner, some experience, experienced, clinician/researcher |

### Flow rule

- If the visitor enters from a goal page or goal-specific SEO entry page, prefill Question 1 and start at Question 2.
- If the selected goal is safety-sensitive or commonly medication-overlapping, always include Question 4.
- If the user selects “beginner,” recommendation copy should favor familiar, lower-complexity options and stronger education prompts.
- If the user selects “clinician/researcher,” recommendation copy may expose more evidence details, mechanisms, and caveats, but should not loosen safety filtering.

## 5. Branching Logic

### 5.1 Step 1 — Goal

Question:

> What do you want help with?

Goal selection maps the user to one primary goal slug and optional adjacent goals.

| User choice | Primary goal slug | Adjacent goal signals |
| --- | --- | --- |
| Sleep | `sleep` | stress, relaxation, recovery |
| Stress/anxiety | `stress-anxiety` | mood, sleep, focus |
| Focus | `focus` | energy, stress-anxiety, mood |
| Mood | `mood` | stress-anxiety, sleep, energy |
| Energy | `energy` | focus, recovery, mood |
| Recovery | `recovery` | sleep, inflammation, energy |
| Digestion | `digestion` | inflammation, immune support |
| Inflammation | `inflammation` | recovery, joint comfort |
| Libido | `libido` | energy, mood, stress-anxiety |
| Immune support | `immune-support` | inflammation, recovery |

Branching:

- If the user selects **sleep**, emphasize timing, next-day grogginess, and sedating profile.
- If the user selects **stress/anxiety**, emphasize daytime function, medication cautions, and sedation preference.
- If the user selects **focus** or **energy**, emphasize stimulation tolerance and anxiety sensitivity.
- If the user selects **inflammation**, **libido**, **immune support**, or **digestion**, treat “speed” as a lower-weight preference because many relevant options are longer-horizon.

### 5.2 Step 2 — Desired speed

Question:

> How soon are you hoping to feel something?

| Choice | Scoring signal | Copy implication |
| --- | --- | --- |
| Today/this week | Boost options with acute or noticeable short-term effects; warn against overpromising. | “These are more likely to be noticeable quickly, but effects vary.” |
| Within 2–4 weeks | Boost adaptogens, nutrient repletion, and gradual support options. | “These fit a realistic trial window.” |
| Long-term support | Boost options with prevention, resilience, or maintenance positioning. | “These are better evaluated over a longer horizon.” |
| No preference | Neutral. | Do not overemphasize onset. |

Branching:

- If the user selects “today/this week” for a goal where evidence is usually longer-horizon, show a small expectation-setting note before results.
- If the user selects “long-term support,” de-emphasize acute sedatives and stimulants unless they are also strong goal fits.

### 5.3 Step 3 — Sedating vs. stimulating preference

Question:

> What kind of effect would fit your day best?

| Choice | Preference tag | Ranking effect |
| --- | --- | --- |
| More calming/sedating | `sedating` | Boost sedating and evening-use options; demote stimulating options. |
| Calm but daytime-friendly | `daytime-calm` | Boost non-sedating anxiolytic or neutral options; demote strong sedatives. |
| More energizing/stimulating | `stimulating` | Boost stimulating or alertness-support options; demote sedating options. |
| No preference | `neutral` | No preference adjustment. |

Branching:

- If the selected goal is **sleep**, “stimulating” should trigger a clarification note: “For sleep, we’ll prioritize non-stimulating options and explain any daytime-support alternatives separately.”
- If the selected goal is **focus** or **energy**, “sedating” should produce a blended result set: calming focus supports first, direct sedatives lower.
- If the selected goal is **stress/anxiety**, “stimulating” should trigger an anxiety-sensitivity warning for stimulant-like options.

### 5.4 Step 4 — Medications and medical context

Question:

> Are you taking medications, pregnant or breastfeeding, or managing a medical condition?

| Choice | Safety state | Result behavior |
| --- | --- | --- |
| No | `standard` | Apply baseline safety filters and normal warnings. |
| Yes, medications | `medication-review` | Show medication caution banner; suppress high-interaction options when interaction tags match. |
| Yes, medical condition | `condition-review` | Show condition caution banner; suppress or demote condition-relevant risks. |
| Pregnant or breastfeeding | `pregnancy-lactation-review` | Only show options explicitly marked as low-concern for pregnancy/lactation or route to clinician-first guidance. |
| Not sure | `unknown-risk` | Use conservative filtering and prompt user to review safety details. |

Branching:

- If the user selects any state other than “No,” every result card should display a safety-first reason before evidence or fit language.
- If no safe shortlist remains after filtering, show “No low-concern shortlist found” and route to educational safety pages or goal pages rather than forcing recommendations.
- The wizard should never ask for specific medication names in the first version unless the data model can support reliable matching and disclaimers.

### 5.5 Step 5 — Experience level

Question:

> How familiar are you with supplements and herbs?

| Choice | Explanation style | Ranking effect |
| --- | --- | --- |
| Beginner | Plain-language cards, fewer options, stronger “how to compare” guidance. | Boost familiar, lower-complexity, lower-risk options. |
| Some experience | Balanced explanation with moderate detail. | Neutral. |
| Experienced | More tradeoffs, mechanism notes, and comparison links. | Slightly boost specialized options if safety is acceptable. |
| Clinician/researcher | Evidence detail, citations, mechanisms, and uncertainty notes. | No automatic risk relaxation. |

Branching:

- Beginner users should receive 3 recommendations plus 1 “learn before choosing” card.
- Experienced users may receive 5 recommendations and a comparison prompt.
- Clinician/researcher users should see evidence confidence and mechanism labels more prominently.

## 6. Result Types

The wizard should produce a structured result set rather than a single “winner.”

### 6.1 Primary shortlist

3–5 options ranked by safety-adjusted score. Each card should include:

- Name.
- Type: herb, compound, stack, or guide.
- Best-fit reason.
- Evidence confidence.
- Safety status.
- Preference fit badges.
- Link to detail route.

### 6.2 Watch-outs

A separate section for options the user may expect to see but should approach carefully.

Examples:

- “Popular but not a fit for your medication context.”
- “May be too sedating for your daytime preference.”
- “Evidence is early or mixed for this goal.”

### 6.3 Next step

Each result page should end with one decision-oriented next step:

- Compare top 2–3 options.
- Read the goal guide.
- Open safety details.
- Review product-quality checklist.
- Browse all options for this goal.

## 7. Data Model

The first implementation should use a lean, static-compatible data model. It can be generated from existing workbook and enrichment sources later, but the wizard contract should remain stable.

### 7.1 Intake answer model

```ts
type IntakeAnswers = {
  goalSlug: string;
  desiredSpeed: 'acute' | 'two_to_four_weeks' | 'long_term' | 'no_preference';
  effectPreference: 'sedating' | 'daytime_calm' | 'stimulating' | 'neutral';
  safetyContext?: 'standard' | 'medication_review' | 'condition_review' | 'pregnancy_lactation_review' | 'unknown_risk';
  experienceLevel?: 'beginner' | 'some_experience' | 'experienced' | 'clinician_researcher';
  sourceRoute?: string;
};
```

### 7.2 Recommendation candidate model

```ts
type IntakeCandidate = {
  id: string;
  slug: string;
  route: `/herbs/${string}` | `/compounds/${string}` | `/stacks/${string}` | `/goals/${string}`;
  name: string;
  type: 'herb' | 'compound' | 'stack' | 'guide';
  goalSlugs: string[];
  adjacentGoalSlugs?: string[];
  evidenceGrade: 'strong' | 'moderate' | 'limited' | 'early' | 'mixed' | 'insufficient';
  evidenceScore: number;
  goalFitScore: number;
  onsetProfile: 'acute' | 'days' | 'weeks' | 'long_term' | 'unclear';
  effectProfile: Array<'sedating' | 'daytime_calm' | 'stimulating' | 'neutral'>;
  complexity: 'low' | 'medium' | 'high';
  safetyRiskLevel: 'low' | 'moderate' | 'high' | 'unknown';
  contraindicationTags: string[];
  medicationCautionTags: string[];
  conditionCautionTags: string[];
  pregnancyLactationStatus: 'low_concern' | 'caution' | 'avoid' | 'unknown';
  rationale: string;
  safetySummary: string;
};
```

### 7.3 Result model

```ts
type IntakeResult = {
  answers: IntakeAnswers;
  summary: string;
  recommendations: ScoredRecommendation[];
  watchOuts: ScoredRecommendation[];
  safetyNotices: SafetyNotice[];
  nextSteps: Array<{
    label: string;
    route: string;
    reason: string;
  }>;
};

type ScoredRecommendation = IntakeCandidate & {
  totalScore: number;
  scoreBreakdown: {
    safety: number;
    evidence: number;
    goalFit: number;
    preferenceFit: number;
    practicality: number;
  };
  rankReason: string;
  cautionReason?: string;
};

type SafetyNotice = {
  severity: 'info' | 'caution' | 'avoid' | 'clinician_review';
  message: string;
  affectedCandidateIds?: string[];
};
```

## 8. Scoring System

Scoring should be explainable and conservative. Use filtering first, then ranking.

### 8.1 Scoring order

1. Build candidate pool from primary and adjacent goal tags.
2. Apply hard safety exclusions.
3. Apply safety demotions.
4. Calculate base fit score.
5. Apply preference modifiers.
6. Apply experience-level modifiers.
7. Sort and separate recommendations from watch-outs.

### 8.2 Suggested weights

| Component | Weight | Notes |
| --- | ---: | --- |
| Safety fit | 35% | Highest weight; unsafe options should not win because of popularity or evidence. |
| Goal fit | 25% | Measures relevance to the selected goal. |
| Evidence confidence | 20% | Rewards stronger evidence but preserves useful lower-evidence options when labeled clearly. |
| Preference fit | 10% | Speed and sedating/stimulating alignment. |
| Practicality | 10% | Beginner friendliness, simplicity, availability, and ease of comparison. |

### 8.3 Base formula

```text
totalScore =
  safetyScore * 0.35 +
  goalFitScore * 0.25 +
  evidenceScore * 0.20 +
  preferenceFitScore * 0.10 +
  practicalityScore * 0.10
```

All component scores should use a 0–100 scale.

### 8.4 Evidence score mapping

| Evidence grade | Suggested score |
| --- | ---: |
| Strong | 90–100 |
| Moderate | 70–89 |
| Limited | 45–69 |
| Early | 30–50 |
| Mixed | 25–60, depending on consistency and safety |
| Insufficient | 0–30 |

Rules:

- Evidence score should never override hard safety exclusions.
- “Mixed” evidence should show an uncertainty note even if the option ranks well for preference fit.
- “Insufficient” evidence should usually appear only in watch-outs or educational sections.

### 8.5 Preference fit scoring

| Match type | Suggested modifier |
| --- | ---: |
| Direct match to desired speed and effect profile | +15 |
| Match to either speed or effect profile | +8 |
| Neutral or unclear match | 0 |
| Mild mismatch | -8 |
| Strong mismatch | -20 |

Examples:

- A sedating option receives a boost for a sleep user who selected “more calming/sedating.”
- A stimulating option is demoted for a stress/anxiety user who selected “calm but daytime-friendly.”
- A long-horizon option is not heavily penalized for inflammation, digestion, or immune goals because those categories are less acute by nature.

### 8.6 Experience modifiers

| Experience level | Modifier behavior |
| --- | --- |
| Beginner | Boost low-complexity and lower-risk options; cap high-complexity options unless evidence and safety are strong. |
| Some experience | No major modifier. |
| Experienced | Small boost for moderate-complexity options when safety is acceptable. |
| Clinician/researcher | No ranking boost required; expose more detail instead. |

## 9. Safety Filtering

Safety filtering is the most important part of the wizard. It should produce fewer recommendations rather than unsafe recommendations.

### 9.1 Hard exclusions

A candidate should be excluded from the primary shortlist when:

- `safetyRiskLevel` is `high` and the user has any non-standard safety context.
- `pregnancyLactationStatus` is `avoid` and the user selects pregnancy or breastfeeding.
- The candidate has a contraindication tag that directly matches the selected safety context.
- The candidate lacks enough safety data and the user selects pregnancy, breastfeeding, medication review, or unknown risk.
- The candidate is explicitly not appropriate for the user’s stated goal context.

Excluded candidates may appear in watch-outs only if the explanation is useful and the card is clearly labeled “not recommended for your current context.”

### 9.2 Safety demotions

A candidate should be demoted, not excluded, when:

- Safety risk is moderate but not directly matched to the user’s context.
- Medication or condition caution tags are broad rather than direct.
- Safety evidence is incomplete but not alarming.
- The user selected “not sure” and the candidate is otherwise a strong fit.

Suggested demotions:

| Condition | Demotion |
| --- | ---: |
| Moderate safety risk with standard context | -10 |
| Moderate safety risk with unknown-risk context | -20 |
| Broad medication caution | -15 |
| Broad condition caution | -15 |
| Unknown pregnancy/lactation status for pregnancy/lactation user | Exclude or -40 and move to watch-outs |
| High risk with standard context | -35 and show warning |

### 9.3 Safety notice levels

| Level | Meaning | Result behavior |
| --- | --- | --- |
| Info | General supplement caution. | Show after results header or inside card. |
| Caution | User should review safety details before considering. | Show on affected cards and summary. |
| Avoid | Not a fit for selected context. | Move to watch-outs or exclude. |
| Clinician review | User context requires professional review. | Replace shortlist if no low-concern options remain. |

### 9.4 Medication handling

Version 1 should not attempt detailed medication-name matching unless structured interaction data exists. Instead:

- Ask whether medications are present.
- Apply medication caution tags at the category level.
- Show conservative language.
- Link users into the relevant herb or compound safety details.
- Avoid presenting high-interaction candidates as primary recommendations.

Recommended copy:

> Because you selected medications, these results are filtered conservatively. Review safety details and ask a qualified clinician or pharmacist before combining supplements with prescriptions.

### 9.5 Pregnancy and breastfeeding handling

Pregnancy and breastfeeding should be a strict safety branch.

Behavior:

- Exclude anything marked `avoid`, `unknown`, or high risk.
- Prefer routing to educational guidance if fewer than 2 low-concern candidates remain.
- Avoid persuasive recommendation language.
- Do not show affiliate product prompts in this branch unless the architecture later supports a vetted, policy-approved pathway.

Recommended copy:

> Pregnancy and breastfeeding change the safety bar. We are only showing options with low-concern safety labeling, and this is not a substitute for clinician guidance.

## 10. Recommendation Presentation

### 10.1 Results header

The results page or panel should summarize the intake in one sentence.

Example:

> For sleep, with a preference for calming options and a 2–4 week trial window, these are the best evidence-aware starting points we found.

If safety context is present:

> Because you selected medications or a health condition, safety fit was weighted more heavily than popularity or speed.

### 10.2 Result card fields

Each card should include:

- Recommendation name.
- “Why it fits” summary.
- Evidence label.
- Safety label.
- Preference fit label.
- “Best next step” link.

Example labels:

- Evidence: `Moderate evidence`, `Limited but plausible`, `Mixed evidence`.
- Safety: `Low concern`, `Review interactions`, `Avoid in this context`.
- Preference: `Daytime-friendly`, `More sedating`, `Longer-horizon`.

### 10.3 Ranking explanations

Use short, plain explanations:

- “Ranked high because it matches your sleep goal, calming preference, and has moderate evidence.”
- “Included as a watch-out because it is popular for stress but may not fit your medication context.”
- “Demoted because it may be too stimulating for anxiety-sensitive users.”

## 11. Edge Cases

| Scenario | Expected behavior |
| --- | --- |
| User skips optional questions | Use neutral defaults and disclose that results are less tailored. |
| No candidates after filtering | Show no forced recommendations; offer safety-first guide and broader goal page. |
| User selects conflicting preferences | Explain the tradeoff and rank balanced options first. |
| User arrives with preselected goal | Skip or prefill goal question and preserve route context. |
| User selects “not sure” for safety | Use conservative filtering and ask them to review safety pages. |
| Evidence is weak across a goal | Show transparent uncertainty and suggest lifestyle/clinician-first guidance where appropriate. |

## 12. Analytics Events

Track the wizard as a decision path, not only as a conversion funnel.

Suggested events:

| Event | Properties |
| --- | --- |
| `intake_started` | source route, prefilled goal |
| `intake_question_answered` | step id, answer id |
| `intake_safety_branch_triggered` | safety state |
| `intake_results_viewed` | goal, recommendation count, watch-out count, safety notice count |
| `intake_result_clicked` | candidate id, rank, route, type |
| `intake_watchout_opened` | candidate id, caution reason |
| `intake_next_step_clicked` | route, next step type |

Do not track specific medication names in Version 1.

## 13. Editorial and Data Governance

- Recommendation candidates should be generated from source-of-truth content where possible, not manually duplicated across surfaces.
- Every candidate must have a slug, route, goal tags, evidence label, safety label, and rationale before it can appear in results.
- Safety copy should be reviewed more conservatively than marketing or SEO copy.
- Generated JSON artifacts should be validated for required fields before publishing.
- Result copy should avoid claims such as “cures,” “guaranteed,” or “doctor-approved” unless directly substantiated and policy-approved.

## 14. MVP Acceptance Criteria

The first shippable version is complete when:

1. The wizard can run with 3 required questions and up to 2 conditional questions.
2. Results include a ranked shortlist, watch-outs, safety notices, and next steps.
3. Medication, condition, pregnancy/breastfeeding, and unknown-risk branches apply conservative filtering.
4. Every recommendation includes an explainable score breakdown.
5. No result card suggests that the site is diagnosing, treating, or replacing clinician advice.
6. Existing route contracts for goal, herb, compound, and stack detail pages are preserved.
7. The flow can be implemented from static data without server runtime changes.
