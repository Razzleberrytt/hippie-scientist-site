# Evidence-First Decision Page Standard

Use this standard for best-of guides, supplement comparisons, stacks, condition-adjacent pages, and any route that helps a reader decide what to take or buy.

## Core principle

A decision page does not rank ingredient popularity. It maps a clearly defined reader problem to the closest directly studied outcome while keeping population, comparator, product, duration, uncertainty, safety, and commercial incentives visible.

## Required evidence questions

For every ranked ingredient or intervention, answer:

1. **What exact outcome was measured?** Attention, reaction time, free recall, sleep onset, fatigue, symptom scale, laboratory marker, or another endpoint are not interchangeable.
2. **Who was studied?** Healthy young adults, older adults with memory complaints, children with ADHD, people with deficiency, and clinical populations support different claims.
3. **What was the comparator?** Placebo, active treatment, baseline, another ingredient, or no control changes confidence.
4. **Was the ingredient tested alone?** A combination product cannot prove the contribution of one component.
5. **Was the product equivalent?** Extract, standardization, plant part, salt, branded ingredient, dose form, and manufacturing quality can limit generalization.
6. **How large and durable was the effect?** Statistical significance on one task is not a broad, clinically meaningful benefit.
7. **What did not improve?** Include null outcomes, negative trials, inconsistent domains, and subgroup-only findings.
8. **What are the bias signals?** Report small samples, high risk of bias, product funding, investigator conflicts, selective outcomes, and lack of independent replication.
9. **What is the safety boundary?** Include age, pregnancy, kidney/liver, cardiovascular, mood, allergy, medication, stimulant, sedative, and cumulative-dose context as relevant.

## Directness ladder

Rank confidence by claim directness, not by excitement:

1. direct randomized evidence for the exact outcome and population;
2. systematic review or meta-analysis of sufficiently comparable direct trials;
3. randomized evidence in a related population or adjacent outcome;
4. observational association;
5. mechanistic or biomarker evidence;
6. preclinical evidence;
7. traditional use or marketing rationale.

Do not silently move a claim upward. Mechanism can explain a hypothesis; it cannot establish a clinical outcome.

## Dose and timeline policy

- Label trial doses and durations as **study context**, not instructions.
- Do not create a universal starting protocol from heterogeneous studies.
- Do not copy a pediatric, older-adult, deficient, clinical, or branded-product dose into a general recommendation.
- Distinguish total compound weight from active or elemental amount.
- Count cumulative exposure from food, drinks, medications, and other supplements when relevant.
- A review date must match the studied timeframe; acute and chronic interventions cannot share one expected timeline.

## Negative-evidence requirement

A high-quality decision page must actively look for:

- trials that favored placebo or an active comparator;
- outcomes that did not improve;
- systematic reviews concluding evidence is contradictory or inadequate;
- confidence intervals that include trivial or uncertain effects;
- studies that failed to replicate earlier positive findings;
- evidence that applies only to a subgroup or secondary endpoint.

Negative or null evidence is not a footnote. It helps define the decision boundary.

## Commercial-neutrality rules

- Evidence order is determined before product availability or commission.
- A broad comparison should not monetize only one ranked option unless the page explicitly explains why commercial coverage is asymmetric.
- Prefer product modules on dedicated buying pages where the reader has already chosen the ingredient category.
- Do not let a revenue product set create or strengthen an efficacy ranking.
- Product criteria must address identity, active amount, standardization, contaminants, third-party testing, allergens, and hidden stimulant or sedative ingredients.
- Affiliate disclosure does not repair biased evidence architecture.

## Page architecture

A strong decision page normally contains:

1. an immediate answer with the main evidence boundary;
2. a decision map organized by real outcome or context;
3. item-level evidence profiles with “shows” and “does not show” sections;
4. study-context and dose-boundary language;
5. safety, medication, and stop rules;
6. a one-change-at-a-time trial framework when self-monitoring is appropriate;
7. links to narrower evidence, safety, and buying pages;
8. FAQ schema that repeats the calibrated answer rather than introducing stronger claims;
9. primary or authoritative references sufficient for every ranked option;
10. regression tests against the exact claim and commercial patterns removed during the upgrade.

## Canonical and cannibalization rule

Two pages should remain separate only when they serve materially different reader jobs. Different titles, templates, or monetization modules do not create different intent.

Consolidate when pages substantially overlap in:

- target query and immediate answer;
- compared ingredients or products;
- evidence and safety questions;
- conversion action;
- internal-link role.

A consolidation must update internal links, add permanent redirects for all aliases, remove the retired route, document canonical ownership, and add tests preventing recreation.

## Implemented examples

- `/guides/adhd/adhd-supplements/`
- `/guides/adhd/best-magnesium-supplement-for-adhd/`
- `/guides/adhd/magnesium-glycinate-vs-citrate-for-adhd/`
- `/guides/adhd/l-theanine-magnesium-adhd-stack/`
- `/guides/focus/best-nootropics-for-focus/`

Each upgraded page has route-specific regression coverage under `app/__tests__/`.
