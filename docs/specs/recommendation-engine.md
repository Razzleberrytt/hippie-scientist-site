# Recommendation Engine Product Logic Specification

## 1. Purpose

The recommendation engine turns a user's stated goal and decision constraints into a transparent, safety-aware shortlist of herbs, compounds, or stacks. It should help users answer:

> What should I compare first, what is a reasonable alternative, and what should I avoid or research before buying?

The engine is a product decision layer, not a clinical diagnosis tool, treatment planner, or personalized medical advice system. It should make the site's existing depth content easier to act on while preserving evidence context, safety caveats, and static-export compatibility.

## 2. Product Principles

1. **Safety gates before scoring** — do not let popularity, low cost, or affiliate potential override material safety concerns.
2. **Evidence-weighted, not hype-weighted** — recommendations should reward goal-relevant evidence and clear uncertainty language.
3. **Explain every ranking** — each ranked item should include concise reasons, tradeoffs, and the strongest caution.
4. **Prefer helpful comparisons over isolated picks** — the engine should guide users toward adjacent options worth comparing.
5. **Affiliate content follows user fit** — affiliate suggestions should be generated only after the recommendation and safety logic; monetization must not influence clinical or evidence rank.
6. **Static payload friendly** — the product contract should be implementable from generated JSON or client-side data without API routes, middleware, server actions, runtime revalidation, or dynamic server behavior.

## 3. Inputs

The engine accepts six product inputs. Inputs can come from an intake wizard, goal page, comparison page, search route, or editorial defaults.

| Input | Role in logic | Example values | Required |
| --- | --- | --- | --- |
| Goal | Defines the outcome the user wants and the primary fit axis. | Sleep onset, stress resilience, daytime calm, focus, energy, digestion, recovery | Yes |
| Evidence level | Sets the user's minimum confidence threshold and shapes ranking penalties. | Strong, moderate, emerging, traditional, no preference | Yes |
| Safety profile | Defines whether an option is eligible, cautionary, or excluded for this user context. | Standard, medication review, condition review, pregnancy/lactation review, stimulant-sensitive, sedative-sensitive, unknown risk | Yes |
| Time to effect | Matches expected onset with user expectation. | Same day, within one week, 2–4 weeks, long-term support, no preference | Yes |
| Cost | Adjusts practical fit after evidence and safety. | Low, moderate, high, no preference | Optional but recommended |
| Popularity | Helps identify familiar options and comparison anchors without replacing evidence. | Mainstream, growing, niche, unknown, no preference | Optional |

### 3.1 Goal input

The goal input should map to a canonical goal slug, not free text, before the engine runs. Free-text entry can be supported by a separate search or synonym layer, but the recommendation logic should receive a normalized goal.

Goal matching should consider:

- Primary goal fit.
- Secondary goal fit.
- Effect direction, such as calming, sedating, stimulating, or neutral.
- Whether the item has enough content depth to support a recommendation card.

### 3.2 Evidence-level input

Evidence level is both a user preference and a ranking constraint.

Recommended interpretation:

| User evidence preference | Ranking behavior |
| --- | --- |
| Strong | Prefer human clinical evidence and conservative claims; demote emerging and traditional-only options. |
| Moderate | Allow plausible options with moderate human evidence or strong mechanistic support when safety is acceptable. |
| Emerging | Include early-stage options if safety and rationale are clear; label uncertainty prominently. |
| Traditional | Include historically used botanicals when evidence is limited; avoid overstating certainty. |
| No preference | Use the default evidence-weighted ranking for the goal. |

Evidence should never be represented as a guarantee of effect.

### 3.3 Safety-profile input

Safety profile is the highest-priority input. It determines whether an item is:

- **Eligible** — can appear in ranked recommendations.
- **Cautionary** — can appear, but with a visible safety note and lower rank.
- **Alternative only** — not a primary recommendation, but may be shown as an option to research with medical review.
- **Excluded** — should not appear in recommendation or affiliate modules for that user context.

Safety contexts should be conservative when the user's status is unknown. For example, if a user indicates medication use but does not specify the medication, the engine should not pretend to clear interaction risk.

### 3.4 Time-to-effect input

Time to effect should reduce expectation mismatch. Acute-feel options can rank higher when a user wants near-term effects; long-horizon options can rank higher when the user wants steady support.

Recommended interpretation:

| Time preference | Ranking behavior |
| --- | --- |
| Same day | Favor options with plausible acute subjective effects and fast user feedback loops. |
| Within one week | Favor options with short ramp-up or practical trial windows. |
| 2–4 weeks | Favor adaptogens, nutrient repletion, and cumulative-effect options where appropriate. |
| Long-term support | Favor sustained-use logic, safety tolerability, and cost practicality. |
| No preference | Do not apply a speed adjustment. |

### 3.5 Cost input

Cost should affect practical ranking only after safety, evidence, and goal fit. A low-cost weak-fit option should not outrank a safer, better-supported moderate-cost option solely because it is cheap.

Recommended cost bands:

- **Low** — inexpensive and widely available.
- **Moderate** — typical supplement pricing or variable quality tiers.
- **High** — costly extracts, specialized formulations, or frequent dosing burden.
- **Unknown** — insufficient pricing confidence.

### 3.6 Popularity input

Popularity should help with user familiarity and comparison suggestions. It should not directly imply effectiveness.

Recommended uses:

- Promote familiar options as comparison anchors when they are safe enough to discuss.
- Surface niche alternatives for users who prefer less mainstream options.
- Avoid using popularity to overcome weak evidence or safety concerns.
- Flag heavily marketed options when the evidence-to-hype gap is large.

## 4. Candidate Eligibility

Before ranking, the engine should build a candidate set for the selected goal.

A candidate is eligible for scoring only if it has:

1. A valid route target, such as `/herbs/:slug`, `/compounds/:slug`, or `/stacks/:slug`.
2. A canonical title and slug.
3. At least one mapped goal or use case.
4. An evidence descriptor or evidence fallback.
5. A safety descriptor or safety fallback.
6. Enough summary content to explain why it appears.

Items that fail these requirements should be excluded from user-facing ranked outputs until content quality is improved.

## 5. Ranking Model

### 5.1 Ranking sequence

The engine should rank in this order:

1. Normalize inputs.
2. Load candidates mapped to the selected goal.
3. Apply hard safety exclusions.
4. Apply required field and route eligibility checks.
5. Score remaining candidates.
6. Apply diversity rules.
7. Generate alternatives and comparison suggestions.
8. Generate affiliate suggestions from the final safe recommendation set.
9. Attach explanations, caveats, and next-step links.

### 5.2 Suggested score components

The exact numeric weights can evolve, but product behavior should follow this hierarchy.

| Component | Relative priority | Product intent |
| --- | --- | --- |
| Safety fit | Highest | Protect users from clearly mismatched or high-risk options. |
| Goal fit | High | Reward options with direct relevance to the user's stated goal. |
| Evidence fit | High | Reward options that meet or exceed the user's confidence threshold. |
| Time-to-effect fit | Medium | Reduce mismatch between expected onset and user expectation. |
| Cost fit | Medium-low | Improve practicality without overpowering evidence or safety. |
| Popularity fit | Low | Use familiarity as a tie-breaker or comparison aid. |
| Content readiness | Required gate or low tie-breaker | Avoid recommending items that cannot be explained well. |

### 5.3 Example scoring shape

A future implementation could use a 100-point model as a transparent internal convention:

| Score area | Max points | Notes |
| --- | ---: | --- |
| Safety fit | 30 | Hard exclusions happen before scoring; cautionary items lose points. |
| Goal fit | 25 | Direct goal match scores higher than adjacent or secondary use. |
| Evidence fit | 20 | Depends on both item evidence and user threshold. |
| Time-to-effect fit | 10 | Penalizes expectation mismatch. |
| Cost fit | 5 | Practicality adjustment only. |
| Popularity fit | 5 | Tie-breaker or familiarity adjustment. |
| Explanation readiness | 5 | Rewards complete card copy, route availability, and comparison metadata. |

This score model is illustrative. Product acceptance should be based on behavior, not the exact numbers.

### 5.4 Safety demotion and exclusion rules

Recommended safety behavior:

| Safety finding | Product action |
| --- | --- |
| Clear contraindication for selected profile | Exclude from ranked recommendations and affiliate suggestions. |
| Significant interaction uncertainty | Demote and show as cautionary or alternative-only. |
| Sedating option for sedative-sensitive user | Demote or exclude depending on severity. |
| Stimulating option for stimulant-sensitive user | Demote or exclude depending on severity. |
| Pregnancy/lactation uncertainty | Exclude from primary recommendation unless the content is explicitly appropriate for that context. |
| Unknown user safety context | Use conservative language and avoid high-risk options as primary picks. |

### 5.5 Diversity rules

A useful shortlist should not be three versions of the same idea. After scoring, apply diversity rules so users see meaningfully different paths.

Examples:

- Do not show more than two items with the same dominant mechanism in the top recommendations.
- Include at least one lower-risk or lower-intensity option when available.
- Avoid filling the whole shortlist with high-cost or hard-to-source items.
- For beginner users, prefer recognizable or easy-to-evaluate options if safety and evidence are similar.
- For researcher-oriented users, include one emerging or mechanistically interesting option as an alternative, not necessarily a top pick.

## 6. Outputs

The engine produces four output groups:

1. Ranked recommendations.
2. Alternatives.
3. Comparison suggestions.
4. Affiliate suggestions.

### 6.1 Ranked recommendations

Ranked recommendations are the primary shortlist. Default count should be 3, with an optional expansion to 5.

Each recommendation should include:

- Rank.
- Title.
- Entity type: herb, compound, or stack.
- Slug and route.
- One-sentence fit summary.
- Evidence label.
- Safety label.
- Time-to-effect label.
- Cost label when available.
- Popularity label when useful.
- Top reason it ranked.
- Main tradeoff.
- Strongest safety note.
- Suggested next action.

Recommended card language pattern:

> Best fit because: [goal fit + evidence or timing]. Watch out for: [main safety or uncertainty]. Next: [open profile, compare, or review buying checklist].

Ranked recommendations should not include direct affiliate CTAs as the first action. The first action should be informational or comparative.

### 6.2 Alternatives

Alternatives are not failed recommendations. They are useful adjacent options that did not make the top shortlist because of evidence threshold, time mismatch, safety caution, cost, or narrower fit.

Alternative categories:

| Alternative type | When to show | Example label |
| --- | --- | --- |
| Safer conservative option | User has safety concerns or unknown risk. | “Lower-intensity option to research.” |
| Faster-acting option | User chose long-term candidate but may want acute support. | “If you need something sooner.” |
| Longer-horizon option | User wants fast relief but goal often needs cumulative support. | “For steady support over time.” |
| Lower-cost option | Top fit is expensive and a credible cheaper option exists. | “Budget-friendly alternative.” |
| Higher-evidence option | User selected openness to emerging options. | “More established option.” |
| Niche or traditional option | User accepts lower certainty or wants botanical depth. | “Traditional-use alternative.” |

Each alternative should state why it is not ranked above the primary picks.

### 6.3 Comparison suggestions

Comparison suggestions should help users make the next decision. They can appear as comparison cards, internal links, or prompts for future comparison pages.

Generate comparisons when:

- Two high-ranking items serve the same goal through different tradeoffs.
- A popular option is not the top recommendation and needs context.
- A safety-sensitive user needs to compare lower-risk choices.
- A high-cost option should be compared with a cheaper credible alternative.
- A fast-acting option should be compared with a longer-horizon option.

Recommended comparison formats:

| Comparison type | Product question |
| --- | --- |
| Evidence comparison | “Which has better support for this goal?” |
| Safety comparison | “Which is easier to use cautiously?” |
| Speed comparison | “Which is more likely to be noticed sooner?” |
| Cost comparison | “Which is more practical for a trial period?” |
| Popularity comparison | “Is the familiar option actually the best fit?” |
| Mechanism comparison | “Do these work through meaningfully different paths?” |

Each comparison suggestion should include:

- Two to three entities.
- A comparison title.
- The reason this comparison matters.
- The recommended destination, such as an existing profile route, goal route, or future comparison route.

### 6.4 Affiliate suggestions

Affiliate suggestions should be generated from the recommendation result, not used to generate the recommendation result.

Affiliate outputs should focus on product-selection help rather than aggressive purchase prompts.

Allowed affiliate suggestion types:

- Product-quality checklist for the top recommendation.
- Category-level shopping guidance, such as extract form, third-party testing, or formulation notes.
- “What to look for” modules linked from a herb, compound, or stack profile.
- Affiliate-supported product suggestions only when the item is eligible and safety-compatible.

Affiliate suggestions must not appear when:

- The item is excluded by safety logic.
- The user is in a high-risk safety profile and the engine cannot provide a conservative context.
- The item lacks enough sourcing guidance to avoid misleading buyers.
- The affiliate product would imply a medical claim not supported by the content.

Recommended affiliate suggestion fields:

- Entity slug.
- Product category.
- Suggested placement.
- Buying guidance summary.
- Required disclaimer state.
- Suppression reason if no affiliate suggestion is shown.

## 7. Output States

### 7.1 Standard successful state

Show:

1. Three ranked recommendations.
2. Two to four alternatives.
3. Two comparison suggestions.
4. Affiliate guidance for eligible top recommendations.
5. A general safety reminder.

### 7.2 Conservative safety state

Use when the user indicates medication use, medical condition, pregnancy/lactation, or unknown high-risk status.

Show:

1. A safety-first message before the shortlist.
2. Only eligible or low-concern primary recommendations.
3. Cautionary items as alternatives only, if shown at all.
4. No direct affiliate product suggestions for uncertain or cautionary items.
5. Stronger next steps, such as reading the profile or discussing with a clinician.

### 7.3 Not enough data state

Use when too few candidates meet eligibility requirements.

Show:

1. A transparent message that the site does not have enough recommendation-ready content for this exact filter.
2. A broader goal page link.
3. Search or browse suggestions.
4. Safe adjacent alternatives if available.
5. No forced ranking.

### 7.4 No safe match state

Use when safety exclusions remove all candidates.

Show:

1. A clear statement that the engine cannot produce a responsible shortlist for the selected safety profile.
2. Educational links only.
3. No ranked recommendations.
4. No affiliate suggestions.
5. A suggestion to review options with a qualified professional if the user is considering supplements.

## 8. Explanation Requirements

Every recommendation should answer four user-facing questions:

1. **Why this?** — goal fit, evidence fit, timing, or practicality.
2. **Why not something else?** — key tradeoff versus alternatives.
3. **What could make it a bad fit?** — strongest safety or uncertainty note.
4. **What should I do next?** — read profile, compare, review sourcing, or avoid without medical review.

Avoid vague explanation labels such as “recommended for you” without supporting details.

## 9. Product Acceptance Criteria

A recommendation output is acceptable when:

- Safety exclusions are applied before ranking.
- The top recommendation has a direct goal fit unless no direct candidate exists.
- A high-popularity option cannot outrank a materially safer and better-evidenced option solely because it is popular.
- A low-cost option cannot outrank a materially better option solely because it is cheap.
- Alternatives explain why they are alternatives.
- Comparison suggestions are useful next decisions, not random internal links.
- Affiliate suggestions are suppressed when safety or content quality is insufficient.
- Every user-facing output has a route or a clear non-route state.
- No output implies diagnosis, cure, guaranteed benefit, or individualized medical clearance.

## 10. Example Product Scenarios

### 10.1 User wants sleep support with same-day effect

Expected behavior:

- Favor options with plausible acute calming or sleep-onset relevance.
- Demote options that generally require weeks unless they are clearly framed as long-term alternatives.
- Suggest comparisons between fast-acting and long-horizon sleep options.
- Avoid affiliate prompts until the user opens sourcing guidance or a profile.

### 10.2 User wants daytime calm with stimulant sensitivity

Expected behavior:

- Exclude or demote stimulating options.
- Favor non-sedating calm-support candidates.
- Surface safety notes around sedation, driving, and medication uncertainty where relevant.
- Suggest comparisons that distinguish calm-without-sedation from sleep-oriented options.

### 10.3 User wants focus with a strong evidence threshold

Expected behavior:

- Favor better-supported focus candidates over trendy nootropics.
- Move emerging or niche options into alternatives with uncertainty labels.
- Use popularity to suggest comparisons such as familiar stimulant-like options versus steadier alternatives.
- Keep affiliate suggestions tied to quality criteria rather than performance claims.

### 10.4 User indicates pregnancy or lactation

Expected behavior:

- Switch into conservative safety state.
- Exclude uncertain or contraindicated items from primary ranking.
- Avoid direct affiliate suggestions unless the content is explicitly safe and appropriate for that context.
- Prefer educational links and clinician-review language over recommendation confidence.

## 11. Future Implementation Notes

This document does not require implementation. If implemented later, the engine should remain compatible with the site's static architecture by using generated data artifacts or client-side logic.

Future data fields may include:

- `goalSlugs`.
- `evidenceLevel`.
- `safetyFlags`.
- `timeToEffect`.
- `costBand`.
- `popularityBand`.
- `affiliateEligible`.
- `comparisonTags`.
- `mechanismTags`.
- `recommendationSummary`.
- `safetySummary`.

Any future implementation should validate slugs and required fields before generating JSON artifacts and should avoid replacing existing data pipelines when they can be extended.
