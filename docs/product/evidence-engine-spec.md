# Evidence Engine Specification

Date: 2026-05-30
Owner: Chief Research Architect
Scope: product architecture, editorial model, workbook model, trust UX, and static-export-compatible evidence navigation. This document does not propose code changes, route refactors, API routes, server actions, middleware, or runtime revalidation.

## Executive summary

The Hippie Scientist should evolve from a searchable herb database into an evidence-verification platform. The core shift is from “what is this herb?” to “what exact claim is being made, what studies support or challenge it, and what should a skeptical user do with that uncertainty?”

The Evidence Engine should make every recommendation traceable to a structured claim, every claim traceable to studies, and every study interpreted through transparent quality, relevance, consistency, and safety rules. The platform should not merely cite papers. It should show whether the cited evidence is actually relevant to the user’s decision.

The product promise becomes:

> Start with a problem, inspect the evidence behind each possible option, understand contradictions and safety limits, then make a cautious decision.

## Design principles

1. **Claims, not herbs, are the atomic product unit.** Herbs and compounds are navigational entities. Studies are evidence objects. Claims are the testable assertions users need verified.
2. **Evidence is directional, not decorative.** Citations must say whether they support, partially support, contradict, or do not meaningfully test the claim.
3. **Human relevance outranks citation volume.** A single well-designed human trial in the right population can matter more than many mechanistic or animal studies.
4. **Contradiction is a trust feature.** Disagreement should be visible, summarized, and connected to study design differences.
5. **Safety can override benefit.** A claim with promising efficacy but unacceptable risk for common populations should not be treated as a strong user recommendation.
6. **Decisions are contextual.** The same ingredient can be reasonable for one goal, weak for another, and unsafe for a specific user context.
7. **Static export remains compatible.** The Evidence Engine should be generated from workbook-backed artifacts and served as static JSON and static pages.
8. **Lean payloads first.** List pages and decision cards should load claim summaries; full study extraction belongs on detail surfaces.
9. **No disease-treatment framing.** Claims should be phrased as structure/function, wellness support, or evidence summaries, not diagnosis, cure, treatment, or prevention.

## 1. Core unit of information

### Recommendation

The **core unit of information is the Claim**.

A claim is the smallest meaningful, verifiable assertion that connects an intervention to an outcome in a defined context.

```txt
Intervention + outcome + population/context + dose/preparation + timeframe + certainty boundary
```

Example:

```txt
Ashwagandha root extract may modestly support perceived stress reduction in generally healthy adults over 6–8 weeks, but results depend on extract standardization and study quality.
```

### Why not herb, compound, or study?

| Candidate unit | Role in the platform | Why it is not the core unit |
| --- | --- | --- |
| Herb | User-facing entity and navigation container | A herb has many possible claims with different evidence strength, safety concerns, and contexts. “Ashwagandha works” is too broad to verify. |
| Compound | Mechanistic and product-quality entity | A compound may explain plausibility, but most user decisions are about a claim: outcome, context, preparation, and risk. |
| Study | Evidence source | A study is not a user decision. Studies answer narrower questions and must be mapped to claims before users can act on them. |
| Claim | Verifiable assertion | It is the bridge between user intent, entity pages, evidence appraisal, contradictions, and decision guidance. |

### Claim taxonomy

Each claim should have a type so unlike assertions are never mixed:

| Claim type | Question answered | Example |
| --- | --- | --- |
| Efficacy claim | “May this help the goal?” | “Magnesium glycinate may support sleep quality in people with low magnesium intake.” |
| Safety claim | “Who should avoid or use caution?” | “Kava has liver-safety concerns and should not be combined casually with alcohol or sedatives.” |
| Interaction claim | “What can it interact with?” | “Berberine may interact with glucose-lowering medications.” |
| Mechanism claim | “Why might it work?” | “L-theanine may influence relaxation partly through glutamate and GABA-related pathways.” |
| Form/preparation claim | “What version matters?” | “Extract standardization may affect expected withanolide exposure.” |
| Comparative claim | “How does it compare?” | “Melatonin is more directly circadian-timing oriented than most sedative herbs.” |
| Evidence-gap claim | “What is unknown?” | “Long-term safety data are limited for this preparation.” |

### Claim identity

Every claim needs a stable ID independent of page placement:

```txt
claim_{entitySlug}_{goalSlug}_{claimType}_{shortOutcome}_{version}
```

Example:

```txt
claim_ashwagandha_stress_efficacy_perceived-stress_v1
```

The stable claim ID becomes the anchor for workbook rows, generated JSON, internal links, editorial review, UI modules, and future claim pages.

## 2. How claims should connect to studies

### Relationship model

Claims and studies should connect through an explicit **ClaimStudyLink**, not a plain citation list. The link records how the study relates to the claim.

A study can map to many claims. A claim can map to many studies.

```txt
Claim ↔ ClaimStudyLink ↔ Study
```

### Required relationship fields

Each claim-study link should answer:

| Field | Purpose |
| --- | --- |
| `claimId` | The claim being evaluated. |
| `studyId` | The source being appraised. |
| `relationship` | Whether the study supports, partially supports, contradicts, is neutral, or is background-only. |
| `evidenceClass` | Human clinical, observational, preclinical, mechanistic, traditional use, regulatory monograph, review, meta-analysis. |
| `directness` | Whether the study directly tests the same intervention, outcome, population, preparation, and timeframe. |
| `populationMatch` | How well the study population matches the user-facing claim context. |
| `interventionMatch` | How well the exact herb, compound, extract, dose, and route match. |
| `outcomeMatch` | Whether the study measured the same endpoint or only a proxy. |
| `directionOfEffect` | Positive, negative, mixed, null, or unclear. |
| `effectMagnitude` | Small, moderate, large, clinically unclear, not extractable. |
| `statisticalSignal` | Significant, non-significant, mixed, not applicable, not reported. |
| `riskOfBias` | Low, some concerns, high, unclear. |
| `sampleSizeBand` | Tiny, small, medium, large, very large. |
| `durationBand` | Acute, short, medium, long, unknown. |
| `extractionNote` | Short editorial interpretation of why this source does or does not move the claim. |

### Relationship enum

Use a small, visible enum:

| Relationship | Meaning |
| --- | --- |
| `supports` | Directly relevant evidence favors the claim. |
| `partially-supports` | Evidence favors part of the claim or a narrower context. |
| `contradicts` | Evidence directly challenges the claim or finds a contrary effect. |
| `mixed` | The study contains both supportive and non-supportive signals. |
| `no-clear-effect` | The study tests the claim but does not show a clear benefit. |
| `background` | Useful for context, mechanism, safety, or tradition but not direct efficacy support. |

### Study records are source objects, not prose citations

A study record should include enough metadata to audit relevance without reading the paper every time:

- title
- authors
- year
- journal/source
- DOI, PubMed ID, or URL
- publication type
- design
- population
- sample size
- intervention and comparator
- dose/preparation
- duration
- outcomes measured
- funding/conflict signals when known
- source registry ID
- extraction status
- reviewer and review date

## 3. How evidence strength should be calculated

### Evidence strength is a claim-level score

Evidence strength should be calculated for each claim, not for a herb as a whole. A herb page may summarize the strongest and weakest claims, but the actual scoring belongs to claims.

### Two outputs: user label and audit score

The platform should expose a simple user-facing label backed by an auditable internal score.

| User label | Internal score band | Meaning |
| --- | ---: | --- |
| Strong | 80–100 | Multiple relevant human studies or high-quality synthesis, consistent direction, tolerable safety context, and good directness. |
| Moderate | 60–79 | Some human evidence with reasonable relevance, but limitations remain. |
| Limited | 35–59 | Early, small, indirect, inconsistent, or mostly non-clinical evidence. |
| Theoretical | 10–34 | Mechanistic, traditional, animal, or plausibility evidence with little direct human support. |
| Unsupported | 0–9 | No meaningful evidence for the claim or evidence mostly fails to support it. |
| Conflicting | Overlay flag | Supportive and contradictory evidence both materially affect interpretation. |
| Safety-limited | Overlay flag | Benefit signal exists, but safety constraints materially limit recommendation strength. |

### Score dimensions

The internal evidence score should be a weighted composite. Editorial judgment should be allowed only through structured fields and review notes.

| Dimension | Weight | What it measures |
| --- | ---: | --- |
| Human relevance | 25% | Human clinical evidence outranks preclinical, mechanistic, and traditional evidence. |
| Directness | 20% | Match between claim and study for intervention, outcome, population, dose/preparation, comparator, and timeframe. |
| Study quality | 20% | Risk of bias, blinding, comparator quality, randomization, attrition, preregistration, outcome validity. |
| Consistency | 15% | Whether relevant studies point in the same direction. |
| Effect usefulness | 10% | Whether the effect appears practically meaningful, not just statistically detectable. |
| Evidence volume | 5% | Number of relevant studies, capped to prevent citation spam. |
| Recency and reproducibility | 5% | Whether evidence has been replicated and is not dependent on a single outdated or isolated source. |

### Safety adjustment

Safety should not be hidden inside the efficacy score. Instead, it should apply a visible decision modifier:

| Safety state | Effect on display |
| --- | --- |
| Low known concern | No reduction; show normal cautions. |
| Moderate caution | Add caution badge; reduce recommendation confidence by one decision tier when relevant to common users. |
| High caution | Add prominent safety warning; suppress casual “try this” language. |
| Contraindicated for common context | Move to avoid/caution group for that context even if efficacy evidence is promising. |
| Unknown long-term safety | Add uncertainty badge and require “what we still do not know” text. |

### Calculation method

1. Score every claim-study link for quality and relevance.
2. Convert each link into weighted evidence contribution based on relationship direction.
3. Aggregate supportive, neutral, and contradictory contributions separately.
4. Calculate directness-adjusted support.
5. Calculate contradiction pressure.
6. Apply safety modifier as a visible overlay, not a hidden deletion.
7. Output:
   - `evidenceScore`
   - `evidenceLabel`
   - `contradictionLevel`
   - `safetyModifier`
   - `topReasons[]`
   - `topLimitations[]`

### Guardrails against score inflation

- Cap contribution from mechanistic and traditional-use evidence.
- Require at least one direct human source for `Moderate` or `Strong` efficacy labels.
- Require consistency across more than one study or a high-quality synthesis for `Strong`.
- Do not let review articles count as independent primary evidence unless the claim is about expert consensus or regulatory interpretation.
- Penalize claims that rely on a different extract, dose, route, population, or endpoint than the user-facing wording.
- Separate “promising but not proven” from “works.”

## 4. How contradictory evidence should be displayed

### Principle

Contradiction should be surfaced as an interpretive layer, not buried in citations. A skeptical user trusts the platform when it openly says, “Here is why the evidence disagrees.”

### Contradiction levels

| Level | Display label | Meaning |
| --- | --- | --- |
| None | Consistent evidence | Relevant evidence generally points in one direction. |
| Low | Minor disagreement | Some differences exist, but they do not change the practical interpretation. |
| Moderate | Mixed evidence | Relevant studies differ enough that the claim should be framed cautiously. |
| High | Conflicting evidence | Direct evidence materially disagrees; strong recommendation language is inappropriate. |
| Unresolved | Not enough to reconcile | Evidence is sparse, indirect, or too heterogeneous to explain confidently. |

### Contradiction UI pattern

Every claim page and claim module should include a **What disagrees?** block when contradiction is moderate or higher.

Recommended structure:

1. **Plain-language summary:** “Some trials show improvement, while others find little or no effect.”
2. **Why results may differ:** extract type, dose, baseline deficiency, population, outcome measure, study duration, comparator, funding, risk of bias.
3. **Evidence split table:** supportive, neutral, contradictory, background.
4. **Decision consequence:** “This moves the claim from Strong to Moderate,” or “This makes it best treated as experimental.”
5. **Editorial stance:** what the platform concludes and what would change the conclusion.

### Contradiction copy rules

- Never present contradiction as a failure of science.
- Avoid both-sides flattening when one side is much stronger.
- Explain whether contradiction is about efficacy, dose, safety, population, or form.
- Use “mixed,” “inconsistent,” or “uncertain” instead of sensational language.
- Always link contradictions back to studies and extraction notes.

## 5. User navigation: Problem → Evidence → Decision

### Desired journey

The product should guide users through three levels:

```txt
Problem → Claim set → Evidence review → Decision guidance
```

### Problem layer

Problem pages are goal or symptom-intent surfaces, such as sleep, stress, focus, anxiety-adjacent support, recovery, or energy.

The page should ask:

- What outcome does the user want?
- What context changes the answer?
- Which options are first-line, situational, experimental, or avoid/caution?
- Which claims are the strongest reason to consider each option?

Problem layer output:

- ranked claim cards
- safety filters
- comparison prompts
- “best fit if / avoid if” sections
- links to claim pages and herb/compound pages

### Evidence layer

Evidence pages are claim-centered. They answer:

- What exact claim is being evaluated?
- What studies support or challenge it?
- How relevant are those studies?
- What is unknown?
- How should a skeptical reader interpret the claim?

Evidence layer output:

- evidence grade
- score breakdown
- study table
- contradiction block
- extraction notes
- source trail

### Decision layer

Decision guidance converts evidence into practical next steps without becoming medical advice.

Decision outputs:

- Consider first
- Consider only if context fits
- Experimental / not a first choice
- Avoid or ask a clinician first
- Not enough evidence to recommend
- Product-quality checklist if commerce-ready
- Alternative options when safety or evidence is weak

### Navigation examples

#### Goal-first

```txt
/goals/sleep
→ “Sleep maintenance” claim cluster
→ Claim: magnesium glycinate may support sleep quality in low-intake users
→ Evidence review
→ Decision: reasonable to consider if deficiency/intake risk is plausible; compare with melatonin for circadian timing
```

#### Herb-first

```txt
/herbs/ashwagandha
→ “What it may help with” claim list
→ Stress claim has Moderate evidence and Moderate safety cautions
→ Claim evidence page
→ Decision: consider if stress-focused and not pregnant, thyroid-sensitive, or on relevant medications; compare with L-theanine or magnesium
```

#### Safety-first

```txt
User searches “kava liver safety”
→ Kava herb page safety snapshot
→ Safety claim page
→ Evidence and regulatory context
→ Decision: avoid casual use with alcohol, liver disease, or sedatives; no commerce CTA in high-risk contexts
```

## 6. Required data model

### Entity overview

The Evidence Engine needs the following first-class entities:

1. **Entity** — herb, compound, stack, or preparation.
2. **Claim** — verifiable assertion tied to an entity and outcome.
3. **Study** — source record with bibliographic and methodological metadata.
4. **ClaimStudyLink** — structured appraisal relationship between claim and study.
5. **Outcome** — normalized goal or endpoint taxonomy.
6. **PopulationContext** — user or study population modifiers.
7. **Preparation** — form, extract, standardization, dose, route.
8. **SafetySignal** — contraindication, interaction, adverse effect, or population caution.
9. **EvidenceGrade** — generated claim-level scoring result.
10. **DecisionRecommendation** — generated user-facing interpretation.
11. **ReviewRecord** — editorial status, reviewer, date, and quality-control notes.

### Claim object

```json
{
  "claimId": "claim_ashwagandha_stress_efficacy_perceived-stress_v1",
  "slug": "ashwagandha-stress-perceived-stress",
  "entityType": "herb",
  "entitySlug": "ashwagandha",
  "claimType": "efficacy",
  "outcomeSlug": "stress",
  "claimText": "Ashwagandha root extract may support perceived stress reduction in generally healthy adults over 6–8 weeks.",
  "plainLanguageSummary": "Promising but not universal stress-support evidence, with extract-specific and safety caveats.",
  "populationContext": ["generally-healthy-adults"],
  "preparationContext": ["root-extract", "standardized-extract"],
  "timeframe": "6-8-weeks",
  "evidenceLabel": "Moderate",
  "contradictionLevel": "Moderate",
  "safetyModifier": "Moderate caution",
  "decisionStatus": "consider-if-context-fits",
  "lastReviewedAt": "2026-05-30",
  "reviewedBy": "editorial-team",
  "editorialStatus": "in-review"
}
```

### Study object

```json
{
  "studyId": "study_pubmed_00000000",
  "sourceRegistryId": "src_pubmed_00000000",
  "title": "Human trial title",
  "year": 2024,
  "publicationType": "randomized-controlled-trial",
  "evidenceClass": "human-clinical",
  "population": "Adults reporting perceived stress",
  "sampleSize": 120,
  "intervention": "Standardized ashwagandha root extract",
  "comparator": "Placebo",
  "duration": "8 weeks",
  "primaryOutcomes": ["Perceived stress score"],
  "fundingConflictSignal": "industry-funded",
  "riskOfBias": "some-concerns",
  "sourceUrl": "https://example.org/source",
  "doi": "10.xxxx/example",
  "pmid": "00000000"
}
```

### ClaimStudyLink object

```json
{
  "claimId": "claim_ashwagandha_stress_efficacy_perceived-stress_v1",
  "studyId": "study_pubmed_00000000",
  "relationship": "partially-supports",
  "directness": "moderate",
  "populationMatch": "moderate",
  "interventionMatch": "high",
  "outcomeMatch": "high",
  "directionOfEffect": "positive",
  "effectMagnitude": "small-to-moderate",
  "statisticalSignal": "significant",
  "riskOfBias": "some-concerns",
  "sampleSizeBand": "medium",
  "durationBand": "medium",
  "weight": 0.62,
  "extractionNote": "Direct stress outcome and matching extract class, but single study and sponsor signal limit confidence."
}
```

### EvidenceGrade object

```json
{
  "claimId": "claim_ashwagandha_stress_efficacy_perceived-stress_v1",
  "evidenceScore": 68,
  "evidenceLabel": "Moderate",
  "supportScore": 72,
  "contradictionPressure": 38,
  "humanRelevanceScore": 80,
  "directnessScore": 70,
  "qualityScore": 60,
  "consistencyScore": 55,
  "effectUsefulnessScore": 65,
  "volumeScore": 45,
  "recencyReplicationScore": 55,
  "safetyModifier": "Moderate caution",
  "topReasons": [
    "Human clinical evidence exists",
    "Outcome matches perceived stress",
    "Preparation is partly extract-specific"
  ],
  "topLimitations": [
    "Not all studies use the same extract",
    "Safety cautions matter for pregnancy, thyroid context, and medication use",
    "Long-term use remains less certain"
  ]
}
```

### Generated static artifacts

The build pipeline should eventually generate lean artifacts such as:

| Artifact | Purpose |
| --- | --- |
| `public/data/claims-index.json` | Lightweight claim cards for search, goals, and entity pages. |
| `public/data/claims-detail/<claim-slug>.json` | Full claim page payload. |
| `public/data/studies-index.json` | Deduplicated source and study metadata. |
| `public/data/claim-study-links.json` | Claim-to-study relationship graph. |
| `public/data/evidence-grades.json` | Generated claim-level score outputs. |
| `public/data/decision-recommendations.json` | Goal and context-specific decision outputs. |

## 7. Required workbook structure

The workbook should remain the source of truth and be extended rather than replaced. It needs normalized sheets that separate entities, claims, studies, and appraisals.

### Proposed sheets

| Sheet | Purpose | Required? |
| --- | --- | --- |
| `Entities` | Herbs, compounds, stacks, preparations, aliases, route slugs. | Yes |
| `Claims` | One row per verifiable claim. | Yes |
| `Studies` | One row per source/study. | Yes |
| `ClaimStudyLinks` | One row per claim-study appraisal. | Yes |
| `Outcomes` | Controlled goal and endpoint taxonomy. | Yes |
| `Preparations` | Extracts, parts used, standardization, forms, dose units. | Yes |
| `SafetySignals` | Interactions, contraindications, adverse effects, population cautions. | Yes |
| `DecisionRules` | Context-specific decision statuses and demotion rules. | Yes |
| `ReviewQueue` | Editorial status, reviewer, date, unresolved questions. | Yes |
| `SourceRegistry` | Canonical source IDs, URLs, DOI/PMID, source type. | Yes, if not already externalized |
| `ClaimPageCopy` | Optional editorial intros, summaries, FAQs, and caveats. | Optional |

### `Claims` columns

Minimum columns:

- `claim_id`
- `claim_slug`
- `entity_type`
- `entity_slug`
- `claim_type`
- `outcome_slug`
- `claim_text`
- `plain_language_summary`
- `population_context`
- `preparation_context`
- `timeframe`
- `evidence_label_override` only if governance allows
- `decision_status`
- `commerce_readiness`
- `safety_modifier`
- `contradiction_level`
- `review_status`
- `reviewed_by`
- `last_reviewed_at`

Validation rules:

- `claim_id` must be unique and stable.
- `claim_slug` must be unique and URL-safe.
- `entity_slug` must resolve to an entity.
- `outcome_slug` must resolve to `Outcomes`.
- `claim_text` must avoid disease-treatment claims unless explicitly handled as a safety/regulatory discussion.
- `review_status=published` requires at least one source relationship or an explicit “no evidence found” record.

### `Studies` columns

Minimum columns:

- `study_id`
- `source_registry_id`
- `title`
- `year`
- `authors_short`
- `journal_or_source`
- `doi`
- `pmid`
- `url`
- `publication_type`
- `evidence_class`
- `study_design`
- `population`
- `sample_size`
- `intervention`
- `comparator`
- `dose_preparation`
- `duration`
- `primary_outcomes`
- `funding_conflict_signal`
- `risk_of_bias`
- `review_status`

Validation rules:

- `study_id` must be unique.
- DOI, PMID, or URL is required unless the source is a print monograph with registry metadata.
- `evidence_class` must use controlled values.
- `sample_size` must be numeric or explicitly `not-applicable`.

### `ClaimStudyLinks` columns

Minimum columns:

- `claim_id`
- `study_id`
- `relationship`
- `directness`
- `population_match`
- `intervention_match`
- `outcome_match`
- `direction_of_effect`
- `effect_magnitude`
- `statistical_signal`
- `risk_of_bias`
- `sample_size_band`
- `duration_band`
- `weight`
- `extraction_note`
- `reviewed_by`
- `last_reviewed_at`

Validation rules:

- `claim_id` must resolve to `Claims`.
- `study_id` must resolve to `Studies`.
- `relationship` must use the controlled enum.
- Published claim pages require at least one link unless the claim is an evidence-gap claim.
- Links marked `supports` or `contradicts` require non-empty directness and outcome match fields.

### `SafetySignals` columns

Minimum columns:

- `safety_signal_id`
- `entity_slug`
- `claim_id` when claim-specific
- `signal_type`
- `severity`
- `population_context`
- `medication_or_condition_context`
- `mechanism_known`
- `evidence_class`
- `source_registry_id`
- `action_language`
- `commerce_suppression_flag`

### Workbook publishing gate

A claim should be eligible for publication only when:

1. Required fields are present.
2. Slugs resolve.
3. Source IDs resolve.
4. Study links are validated.
5. Evidence grade can be generated or intentionally marked as `not-graded`.
6. Safety signals are attached or explicitly reviewed as none identified.
7. Reviewer and review date are present.
8. User-facing copy passes anti-hype and medical-claim checks.

## 8. Required UI components

### Evidence primitives

| Component | Purpose |
| --- | --- |
| Evidence badge | Shows claim-level label: Strong, Moderate, Limited, Theoretical, Unsupported. |
| Contradiction badge | Shows Mixed, Conflicting, or Unresolved when relevant. |
| Safety modifier badge | Shows Caution, High caution, Avoid context, Unknown long-term safety. |
| Claim card | Lightweight summary of claim, entity, goal, grade, and decision status. |
| Claim evidence meter | Visual score breakdown by human relevance, directness, quality, consistency, usefulness, volume, recency. |
| Study relationship chip | Supportive, partial, contradicts, no clear effect, background. |
| Source trace drawer | Lets users inspect source metadata and extraction notes without leaving the page. |
| Evidence split table | Groups studies by relationship to the claim. |
| What disagrees block | Explains contradictory findings and why they may differ. |
| What we still do not know block | Summarizes gaps, long-term uncertainty, missing populations, and preparation ambiguity. |

### Decision components

| Component | Purpose |
| --- | --- |
| Decision snapshot | Above-the-fold “consider / caution / avoid / compare” summary. |
| Best fit / poor fit panel | Translates evidence into user context. |
| Safety gate | Prominent warnings before commerce modules. |
| Alternative options rail | Routes users to safer or better-supported claims. |
| Compare evidence table | Compares ingredients by claim-specific grades, safety, onset, and use case. |
| Product-quality checklist | Shows what form, testing, standardization, and contaminants to inspect before buying. |
| Commerce eligibility notice | Explains when a product CTA is absent because evidence or safety does not justify it. |

### Navigation components

| Component | Purpose |
| --- | --- |
| Problem intake selector | Starts with user goal and constraints. |
| Claim cluster module | Groups claims under a goal, such as sleep onset, sleep maintenance, stress-driven sleep. |
| Evidence trail breadcrumb | `Goal → Claim → Study evidence → Decision`. |
| Entity claim map | On herb/compound pages, displays all claims by goal and strength. |
| Study cards | Show design, population, intervention, outcome, direction, and relevance. |
| Review timestamp | Shows last reviewed date and editorial status. |

## 9. Gold-standard claim page

A gold-standard claim page should be the trust center for a single assertion. It should not look like a blog post or herb encyclopedia entry. It should look like an evidence docket.

### Suggested route

If claim pages are added in the future, use a route that does not disturb existing contracts, such as:

```txt
/claims/:slug
```

This is a future route proposal only, not a required route refactor.

### Page structure

#### 1. Claim header

- Claim text
- Entity and goal links
- Evidence label
- Contradiction badge
- Safety modifier
- Last reviewed date
- Medical and affiliate disclosure link

Example:

```txt
Ashwagandha root extract may support perceived stress reduction in generally healthy adults over 6–8 weeks.
Evidence: Moderate | Mixed evidence | Safety: Caution for specific contexts
```

#### 2. Bottom-line interpretation

A short, skeptical summary:

- What the evidence suggests
- Who it may apply to
- What limits confidence
- What should not be inferred

#### 3. Decision snapshot

Use structured statuses:

| Status | Example copy |
| --- | --- |
| Consider if context fits | “Reasonable to compare if stress support is the goal and safety cautions do not apply.” |
| Not first choice | “Evidence is indirect or inconsistent compared with alternatives.” |
| Avoid in context | “Avoid for pregnancy, liver disease, sedative combinations, or other defined high-risk contexts.” |
| Evidence too limited | “Treat as experimental; do not use as a primary decision driver.” |

#### 4. Evidence score breakdown

Show both the simple grade and the audit logic:

- Human relevance
- Directness
- Study quality
- Consistency
- Effect usefulness
- Evidence volume
- Recency/replication

Do not show a score without explaining the top reasons and limitations.

#### 5. Evidence split

A table grouped by relationship:

| Relationship | Studies | Interpretation |
| --- | --- | --- |
| Supports | Study cards | What supports the claim. |
| Partially supports | Study cards | What supports a narrower version. |
| No clear effect | Study cards | What tested but did not confirm it. |
| Contradicts | Study cards | What challenges it. |
| Background | Study cards | Mechanism, tradition, or context only. |

#### 6. What disagrees?

Visible when contradiction is moderate or high:

- Why study results differ
- Whether disagreement is due to dose, extract, population, duration, outcome, or design
- Whether the platform changes the decision recommendation because of disagreement

#### 7. Safety and context

- Contraindications
- Medication cautions
- Pregnancy/lactation notes
- Condition-specific cautions
- Side effects
- Unknowns
- When commerce CTAs are suppressed

#### 8. Preparation and product-quality relevance

Only when relevant:

- Plant part
- Extract ratio
- Standardization markers
- Dose form
- Testing signals
- Contaminant risks
- Why generic products may not match the studied preparation

#### 9. What we still do not know

This should be mandatory for all but the strongest claims:

- Long-term data gaps
- Sparse replication
- Understudied populations
- Different extracts or forms
- Publication bias concerns
- Clinically meaningful effect uncertainty

#### 10. Source trail

Each source should show:

- citation metadata
- study type
- sample size
- intervention
- comparator
- duration
- outcome
- relationship to claim
- extraction note
- risk-of-bias summary

#### 11. Decision next steps

End with practical navigation:

- Compare alternatives for the same goal
- View entity profile
- View safety page/section
- View product-quality checklist when eligible
- Save or shortlist in future user features

### Claim page trust standard

A skeptical user should be able to answer five questions within 30 seconds:

1. What exact claim is being made?
2. Is the evidence human-relevant and direct?
3. What evidence disagrees?
4. Who should be cautious or avoid it?
5. What decision does this evidence justify — and what does it not justify?

## 10. Gold-standard herb page

A gold-standard herb page should become a claim map and decision hub, not a single averaged verdict.

### Above-the-fold structure

1. Herb name, aliases, and short identity.
2. Decision snapshot.
3. Top supported claims by goal.
4. Major safety cautions.
5. Evidence range: strongest claim, weakest common claim, and unresolved areas.
6. Links to claim evidence pages.

Example framing:

```txt
Ashwagandha is not one evidence grade. Its stress, sleep, hormone-adjacent, athletic-performance, and safety claims have different levels of support and different caveats.
```

### Required sections

#### 1. Decision snapshot

- Best fit if
- Poor fit if
- Consider alternatives when
- Do not use casually if
- Commerce readiness status

#### 2. Claim map

A table of all published claims for the herb:

| Claim | Goal | Evidence | Contradiction | Safety | Decision |
| --- | --- | --- | --- | --- | --- |
| Stress support | Stress | Moderate | Mixed | Caution | Consider if context fits |
| Sleep quality | Sleep | Limited | Unresolved | Caution | Not first choice |
| Testosterone support | Hormone-adjacent | Limited | Mixed | Caution | Experimental |

Each row links to the claim page or claim evidence section.

#### 3. Evidence summary by goal

Instead of one generic “benefits” list, group by user goal:

- Stress
- Sleep
- Focus
- Energy
- Recovery
- Mood
- Safety-sensitive contexts

Each group should show:

- claim cards
- evidence grade
- top reason
- top limitation
- next best comparison

#### 4. Mechanisms without overclaiming

Mechanisms should be labeled as plausibility, not proof. The page should distinguish:

- human outcome evidence
- biomarker evidence
- preclinical mechanism
- traditional use

#### 5. Safety snapshot

Safety should be visible before product CTAs:

- major contraindications
- interaction categories
- vulnerable populations
- adverse-effect pattern
- severity and uncertainty
- “ask a clinician first” contexts

#### 6. Preparation and quality guide

For commerce-ready herbs, show:

- parts used
- extract types
- standardization markers
- dose-form considerations
- contamination/adulteration concerns
- third-party testing signals
- how studied preparations compare with common products

#### 7. Contradictions and unknowns

A herb-level synthesis should summarize where the claim map disagrees:

- Which claims are mixed?
- Which outcomes have only indirect evidence?
- Which claims depend heavily on one extract or one study group?
- What would upgrade or downgrade confidence?

#### 8. Comparisons and alternatives

Herb pages should route users to decision alternatives:

- same goal, stronger evidence
- same goal, lower safety concern
- same mechanism, different use case
- non-supplement or clinician-first guidance when risk is high

#### 9. Source and review transparency

Show:

- last reviewed date
- reviewer/editorial status
- source count by evidence class
- link to source trail
- conflicts or funding caveats where relevant

### Herb page anti-patterns to avoid

- One global evidence grade for the herb.
- “Benefits” lists without claim-specific evidence labels.
- Mechanism sections that imply clinical proof.
- Product recommendations before safety context.
- Citations that do not state whether they support the exact claim.
- Hiding weak or contradictory evidence beneath positive marketing language.

## Implementation roadmap without code changes

### Phase 1: Editorial model and workbook extension

- Define controlled enums for claims, outcomes, relationships, evidence classes, directness, risk of bias, and decision status.
- Add workbook sheets for claims, studies, and claim-study links.
- Pilot 10–20 high-value claims across sleep, stress, anxiety-adjacent support, and focus.
- Validate slugs and required fields before generating artifacts.

### Phase 2: Static artifacts and internal QA

- Generate claim index and claim detail artifacts from workbook data.
- Generate evidence grades from structured link appraisals.
- Create QA views or reports for unresolved claims, missing source links, high contradiction pressure, and missing safety review.

### Phase 3: Trust UI integration

- Add claim cards to goal pages and herb pages.
- Add evidence split and contradiction modules to depth pages.
- Show safety modifiers before product CTAs.
- Route users from problem pages into claim-level evidence.

### Phase 4: Claim pages and evidence graph

- Add dedicated claim pages if product and SEO strategy support them.
- Add source trail drawers and evidence score breakdowns.
- Add comparisons powered by claim-level grades rather than entity-level summaries.

### Phase 5: Decision intelligence

- Use claim evidence, safety context, and user constraints to generate context-specific decision recommendations.
- Suppress or demote commerce modules when safety or evidence limits are high.
- Add saved comparisons and shortlist features if future architecture supports user state.

## Success metrics

### Trust metrics

- Users engage with evidence accordions, contradiction blocks, and source trails.
- Users click “why this grade?” modules.
- Users navigate from goal pages to claim evidence before commerce CTAs.
- Return visits increase for comparison and safety content.

### Quality metrics

- Percent of published claims with validated study links.
- Percent of claim-study links with directness and extraction notes.
- Percent of claims with safety review completed.
- Number of claims downgraded because of contradiction or safety.
- Number of commerce modules suppressed because evidence or safety is insufficient.

### Product metrics

- Goal-page to claim-page click-through.
- Claim-page to comparison click-through.
- Evidence-engaged affiliate click-through.
- Lower bounce from herb pages due to clearer decision framing.
- Search growth from claim-level long-tail queries.

## Final product standard

The Evidence Engine succeeds when The Hippie Scientist can say, for every important user-facing recommendation:

1. This is the exact claim.
2. These are the studies that support it.
3. These are the studies that challenge it.
4. This is how relevant the evidence is to the user’s problem.
5. This is how safety changes the decision.
6. This is what we still do not know.
7. This is the cautious next step the evidence actually justifies.

That is the difference between a herb database and an evidence-verification platform.
