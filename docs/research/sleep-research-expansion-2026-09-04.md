# Sleep Research Expansion — 2026-09-04

## Status

**Expansion pass: implemented.**

The sleep cluster was expanded from a supplement-heavy guide set into a broader evidence system covering ingredient efficacy, sleep endpoints, measurement methods, circadian timing, upstream disruptors, behavior, formulation directness, and research-method interpretation.

The goal is not to publish the largest possible list of sleep aids. The goal is to make every sleep claim answer:

> **What changed, by how much, in which population, measured how, compared with what, using which formulation, and with what safety/uncertainty?**

## New ingredient evidence pages

### Tart cherry for sleep

**Route:** `/articles/tart-cherry-for-sleep/`

**Position:** Limited and heterogeneous.

Anchors include the 2025 systematic review (PMID 40964149), the small 2018 older-adult insomnia pilot (PMID 28901958), older chronic-insomnia data (PMID 20438325), and newer null trials (PMIDs 39683518 and 35790450).

**Guardrail:** Juice, concentrate, powder, capsule, and melatonin-related biomarker changes are not automatically interchangeable or equivalent to exogenous melatonin.

### Saffron for sleep

**Route:** `/articles/saffron-for-sleep/`

**Position:** Moderate short-term evidence, primarily subjective and product-specific.

Anchors include the 2022 meta-analysis (PMID 35325766), 2023 systematic review (PMID 37484523), positive standardized-extract RCTs, and the 2025 moderate-insomnia RCT (PMID 40698027).

**Guardrail:** “Modest short-term benefit with product-specific uncertainty” is more defensible than “proven insomnia treatment.”

### Chamomile for sleep

**Route:** `/articles/chamomile-for-sleep/`

**Position:** Limited and outcome-specific.

Anchors include the 2024 meta-analysis (PMID 39106912), 2019 synthesis (PMID 31006899), and the direct null chronic-primary-insomnia pilot (PMID 21939549).

**Guardrail:** Do not transfer standardized-extract evidence directly to tea or isolated apigenin.

### L-tryptophan for sleep

**Route:** `/articles/l-tryptophan-for-sleep/`

**Position:** Limited, endpoint-specific.

The 2022 meta-analysis (PMID 33942088) has its clearest pooled signal for reduced **wake after sleep onset (WASO)** rather than a generic pooled sleep-latency benefit. AASM guidance (PMID 27998379) remains cautious for chronic insomnia.

**Data correction completed:** The served `tryptophan` compound payload previously claimed “moderate evidence for modest sleep latency reduction.” That stale summary was replaced with an endpoint-accurate limited-evidence verdict.

### 5-HTP for sleep

**Route:** `/articles/5-htp-for-sleep/`

**Position:** Limited.

Anchors include the small 2024 randomized trial in older adults (PMID 38309227), NCCIH's limited-evidence framing, a human serotonergic interaction report (PMID 25978918), and overdose safety context (PMID 35878559).

**Guardrail:** One small trial does not establish chronic-insomnia efficacy, a universal bedtime dose, or equivalence with melatonin.

## New evidence-methodology pages

### Why sleep supplement formulations are not interchangeable

**Route:** `/articles/sleep-supplement-formulations/`

This page formalizes a recurring site-wide rule: a clinical trial tests a **specific preparation**.

Examples include:

- magnesium bisglycinate vs other magnesium salts;
- standardized saffron extracts vs generic saffron products;
- tart-cherry juice/concentrate/powder differences;
- chamomile extract vs tea;
- valerian extract heterogeneity;
- separately studied ingredients vs an untested multi-ingredient stack.

The farther a product moves from the formulation actually studied, the more cautious the efficacy claim should become.

### Why sleep studies disagree

**Route:** `/articles/why-sleep-studies-disagree/`

This page explains why apparently conflicting sleep trials can be answering different questions. It covers:

1. different sleeper populations and insomnia phenotypes;
2. different endpoints such as SOL, WASO, TST, sleep efficiency, and symptom scales;
3. subjective vs objective measurement;
4. formulation heterogeneity;
5. unstable estimates from small samples;
6. multiple endpoints and selective emphasis;
7. placebo response and regression toward the mean;
8. acute vs repeated-treatment duration; and
9. heterogeneity inherited by systematic reviews and meta-analyses.

Anchors include the 2025 scoping review of OTC insomnia RCTs (PMID 40054227), the 2025 insomnia subjective/objective umbrella review (PMID 40850055), the 2025 tart-cherry systematic review (PMID 40964149), the 2024 valerian umbrella review (PMID 38359657), and the 2022 meta-epidemiological analysis of ambiguous insomnia definitions (PMID 36231555).

**Purpose:** Replace the vague phrase “research is mixed” with a structured explanation of exactly why findings differ.

## New sleep-science authority pages

### Sleep onset vs sleep maintenance

**Route:** `/articles/sleep-onset-vs-sleep-maintenance/`

Separates SOL, WASO, total sleep time, sleep efficiency, subjective sleep quality, insomnia severity, and next-day function.

**Purpose:** Prevent one favorable endpoint from becoming the generic claim “improves sleep.”

### Subjective vs objective sleep

**Route:** `/articles/subjective-vs-objective-sleep/`

Anchored to the 2025 umbrella review (PMID 40850055), CBT-I objective meta-analysis (PMID 31377503), AASM actigraphy evidence (PMID 29991438), and sleep-state-misperception literature (PMID 40327948).

**Purpose:** Prevent both “subjective = worthless” and “PSG/wearable = complete measure of sleep experience.”

### Sleep tracker accuracy

**Route:** `/articles/sleep-trackers-accuracy/`

Anchored to the 2026 wearable systematic review (PMID 41946254), 2025 World Sleep Society guidance (PMID 40300398), and actigraphy-vs-PSG literature.

**Purpose:** Treat wearables as useful trend detectors without turning proprietary stage estimates into diagnostic facts.

### Sleep regularity

**Route:** `/articles/sleep-regularity-health/`

Anchored to the 2025 systematic review of 59 studies (PMID 41259946) and 2024 older-adult review (PMID 38831959).

**Guardrail:** Most evidence is observational; association is not proof of causation.

### Insomnia vs sleep deprivation

**Route:** `/articles/insomnia-vs-sleep-deprivation/`

Separates insomnia despite adequate sleep opportunity from insufficient sleep caused by too little opportunity, while acknowledging overlap.

Anchors include NHLBI definitions, insomnia-nosology work (PMID 37122153), and the meta-epidemiological finding that research often uses “insomnia” imprecisely (PMID 36231555).

## New upstream-variable pages

### Caffeine and sleep timing

**Route:** `/articles/caffeine-and-sleep-timing/`

Anchors include the 2023 meta-analysis (PMID 36870101), classic 6-hour controlled study (PMID 24235903), 2024 dose/timing crossover trial (PMID 39377163), and 2025 dose/age meta-analysis (PMID 41124973).

**Guardrail:** Pooled/modelled timing thresholds are not universal biological cutoffs.

### Alcohol and sleep

**Route:** `/articles/alcohol-and-sleep/`

Anchored to the 2025 systematic review/meta-analysis (PMID 39631226).

Core finding: REM disruption appears even at lower alcohol doses and worsens with dose, while high-dose alcohol can shorten sleep-onset latency. Sedation is therefore not equivalent to better sleep.

**Guardrail:** The review has greater certainty for REM disruption than for pooled total sleep time, sleep efficiency, or WASO.

### Morning light and sleep timing

**Route:** `/articles/morning-light-and-sleep-timing/`

Anchors include recent insomnia light-therapy syntheses (PMIDs 39733392 and 37002704), the adult delayed-sleep-wake-phase review (PMID 34381579), and the 2026 morning-blue-light meta-analysis (PMID 42263407).

Core principle: morning light generally advances circadian timing while evening light generally delays it; the intervention must match the timing problem.

### Exercise timing and sleep

**Route:** `/articles/exercise-timing-and-sleep/`

Anchored to the 2026 morning-vs-evening systematic review/meta-analysis (PMID 42632303), plus broader exercise/sleep reviews.

Core finding: there is no clear universal morning advantage for most sleep outcomes. Evening/nighttime exercise has a modest WASO signal, with intensity and proximity to bedtime appearing more important than “evening” as a label.

### Naps and nighttime sleep

**Route:** `/articles/naps-and-nighttime-sleep/`

Anchors include day-level actigraphy data (PMID 35195690), population timing data (PMID 31300205), cognitive-benefit meta-analysis (PMID 36041284), and night-shift napping evidence (PMID 32492169).

Core position: naps are context-dependent tools. Long/late naps can reduce nighttime sleep pressure, while strategic naps can improve cognition or manage shift-work sleepiness.

## Hub integration

`/guides/sleep/` now has distinct layers for:

1. **Decision-first guides** — route by the actual sleep problem.
2. **Comparisons** — direct buyer/decision questions.
3. **Ingredient research** — saffron, tart cherry, chamomile, tryptophan, 5-HTP, and formulation directness.
4. **Sleep science** — endpoints, study methodology, measurement, wearables, regularity, caffeine, alcohol, light, exercise, naps, and insomnia-vs-insufficient-sleep.
5. **ADHD & sleep** — separate timing/stimulant context.
6. **Depth profiles** — herb/compound records.

The hub schema graph includes both the ingredient research and sleep-science article sets so the new pages are not orphaned.

## Evidence-discipline standard for future sleep work

Every future sleep article should preserve:

1. **Population** — healthy poor sleepers, diagnosed insomnia, older adults, children, shift workers, etc.
2. **Endpoint** — SOL, WASO, TST, sleep efficiency, questionnaire score, stage, next-day function.
3. **Measurement** — diary, validated questionnaire, actigraphy, consumer wearable, or PSG.
4. **Comparator** — within-group change is not the same as placebo-separated benefit.
5. **Magnitude** — statistical significance is not automatically clinically meaningful.
6. **Formulation** — product/extract/form evidence should not be generalized without justification.
7. **Duration** — acute, short-term, and repeated dosing answer different questions.
8. **Safety** — preserve medication, sedative, serotonergic, pregnancy, kidney/liver, and disorder-specific context.
9. **Null outcomes** — do not bury major measures that failed to improve.
10. **Highest-level synthesis** — recent systematic reviews/meta-analyses should anchor the verdict when available.

## Remaining high-ROI gaps after this pass

The cluster is now broad enough that the next work should prioritize **integration and refreshes over raw page count**.

Best remaining opportunities:

- contextual links from flagship ranking pages into the new depth articles;
- refresh existing melatonin pages around dose **versus timing** without creating redundant URLs;
- audit older blog posts for unsupported dose language and formulation overreach;
- promote vetted enrichment findings into currently noindex compound/herb records where provenance requirements are satisfied;
- monitor 2026+ systematic reviews and RCTs for changes that materially alter existing evidence grades.

## Strategic outcome

The sleep cluster now has a defensible research moat: it can explain not only **which option has evidence**, but **what kind of evidence it is, what part of sleep changed, whether the measurement was subjective or objective, why studies can disagree, whether the formulation matches, and whether an upstream behavior is a more likely bottleneck than another bedtime supplement**.
