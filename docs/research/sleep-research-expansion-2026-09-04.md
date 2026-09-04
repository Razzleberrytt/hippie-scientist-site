# Sleep Research Expansion — 2026-09-04

## Status

**Expansion pass: implemented and extended.**

The sleep cluster was expanded from a supplement-heavy guide set into a broader evidence system covering ingredient efficacy, sleep endpoints, measurement methods, circadian timing, upstream disruptors, behavior, formulation directness, research-method interpretation, disorder-level decision boundaries, thermal environment, and chrononutrition.

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

### Lavender for sleep

**Route:** `/articles/lavender-for-sleep/`

**Position:** Promising but still formulation- and endpoint-limited.

The 2026 meta-analysis (PMID 40600743) pooled 11 randomized trials with 628 adults and found a statistically significant sleep-quality signal (SMD -0.56, 95% CI -0.96 to -0.17). Earlier randomized and systematic evidence generally points in the same direction, but delivery methods, populations, comparators, and outcome measures vary substantially.

**Guardrail:** Most direct sleep evidence is for inhaled lavender essential oil/aromatherapy. Do not transfer that effect directly to oral lavender, tea, topical cosmetics, isolated linalool, or arbitrary diffuser concentrations. Subjective sleep-quality improvement is not proof of increased deep sleep or REM.

### Passionflower for sleep

**Route:** `/articles/passionflower-for-sleep/`

**Position:** Limited, with direct insomnia evidence.

The 2020 double-blind randomized trial in 110 adults with DSM-5 insomnia (PMID 31714321) found an approximately 23-minute placebo-separated increase in total sleep time over two weeks. Sleep efficiency and WASO improved within the passionflower group but did not significantly separate from placebo. The older tea crossover study (PMID 21294203) supports subjective sleep quality, while a 2024 standardized-extract RCT (PMID 38646244) adds a positive stress-and-sleep signal.

**Guardrail:** Tea, standardized extracts, standalone botanicals, and multi-herb formulas are not interchangeable. Do not convert one favorable TST result into a generic claim that passionflower improves all insomnia endpoints.

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
- inhaled lavender essential oil vs oral/topical lavender;
- passionflower tea vs standardized extract vs combinations; and
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

The newer time-restricted-eating syntheses reinforce the same lesson: reviews can reach different-looking conclusions when one includes Ramadan fasting and broader observational contexts while another emphasizes controlled TRE comparisons.

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

### Weekend catch-up sleep

**Route:** `/articles/weekend-catch-up-sleep/`

Anchors include the 2025 review of sleep-debt repayment (PMID 41148489), the 2025 depression meta-analysis (PMID 40021063), the homeostasis-vs-social-jet-lag review (PMID 40412461), and population data showing that napping/catch-up sleep do not fully compensate for chronic short sleep (PMID 32866843).

**Position:** Extra sleep can provide partial short-term recovery, but weekend catch-up sleep is not a complete reset and large timing shifts can add circadian misalignment.

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

### Melatonin timing vs dose

**Route:** `/articles/melatonin-timing-vs-dose/`

Anchored to the 2024 systematic review and dose-response meta-analysis (PMID 38888087; 26 double-blind RCTs, 1,689 observations) and the 2026 scoping review of systematic reviews (PMID 41014554; 57 systematic reviews containing 227 meta-analyses).

The 2024 modelling suggests that both dose and administration timing help explain trial outcomes, including a modelled dose-response region around 4 mg and earlier administration relative to the sleep episode. These are **research-level model outputs, not universal personal dosing instructions**.

The 2026 evidence map found that most inactive-comparator meta-analyses favored melatonin, while only 8.8% of included systematic reviews met all seven predefined rigor criteria and definitions of sleep quality varied substantially.

**Position:** Melatonin has a broad human sleep signal, but it should be framed as a circadian-timing intervention as well as a sleep-promoting agent. Indication, clock timing, formulation, and endpoint matter alongside milligrams.

**Guardrail:** Do not convert meta-regression averages into a default regimen. Immediate-release and prolonged-release formulations are not interchangeable.

### Blue light, screens and sleep

**Route:** `/articles/blue-light-screens-and-sleep/`

Anchors include the 2025 blue-blocking-glasses actigraphy meta-analysis (PMID 41341515), the broader short-wavelength-light intervention review (PMID 37192881), the Cochrane spectacle-lens review (PMID 37593770), and a randomized healthy-adult trial showing subjective changes without objective actigraphy improvement (PMID 33707105).

**Position:** The circadian mechanism is real, but screen effects are not only a wavelength problem. Brightness, timing, duration, content, arousal, and delayed bedtime also matter.

**Guardrail:** Do not turn “blue light affects circadian biology” into “all blue light is bad.” Morning light can be useful for phase timing.

### Sleep temperature and cooling

**Route:** `/articles/sleep-temperature-and-cooling/`

Anchored to the 2024 systematic review of ambient heat and real-world sleep (PMID 38598988), the recent cooling-bedding systematic review/meta-analysis (PMID 39708549), and the 2024 sleepwear/bedding-fibre review (PMID 38627879).

**Position:** Excess ambient heat is generally associated with worse sleep quality and quantity, but that does not prove that every cooling product improves sleep. The cooling-bedding meta-analysis included nine randomized studies and found no pooled benefit for SOL, sleep efficiency, WASO, TST, or sleep-stage proportions; certainty was very low to low.

**Guardrail:** Temperature change is not a surrogate for sleep benefit. Do not turn thermoregulation plausibility into unsupported claims about deep sleep, REM, or a universal bedroom thermostat setting.

### Time-restricted eating and sleep

**Route:** `/articles/time-restricted-eating-and-sleep/`

Anchored to the 2026 TRE systematic review/meta-analysis (PMID 40498475; 13 studies, 638 participants), the 2025 time-restricted-feeding meta-analysis (PMID 41208478), and the 2024 systematic review of randomized TRE trials (PMID 39144285).

The 2026 synthesis found small within-group improvements in sleep duration and PSQI but no significant controlled-trial advantage for sleep duration or PSQI. The broader 2025 synthesis found worse subjective sleep and shorter self-reported TST overall, with materially different patterns for Ramadan vs non-Ramadan protocols. The randomized-trial review found no consistent sleep benefit and several negative signals in individual studies.

**Position:** Meal timing has circadian plausibility, but current human evidence is limited and context-dependent.

**Guardrail:** Do not market TRE, intermittent fasting, or a specific fasting window as a dependable insomnia treatment. Ramadan fasting, early TRE, late TRE, and weight-management fasting protocols should not be collapsed into one intervention.

### Exercise timing and sleep

**Route:** `/articles/exercise-timing-and-sleep/`

Anchored to the 2026 morning-vs-evening systematic review/meta-analysis (PMID 42632303), plus broader exercise/sleep reviews.

Core finding: there is no clear universal morning advantage for most sleep outcomes. Evening/nighttime exercise has a modest WASO signal, with intensity and proximity to bedtime appearing more important than “evening” as a label.

### Naps and nighttime sleep

**Route:** `/articles/naps-and-nighttime-sleep/`

Anchors include day-level actigraphy data (PMID 35195690), population timing data (PMID 31300205), cognitive-benefit meta-analysis (PMID 36041284), and night-shift napping evidence (PMID 32492169).

Core position: naps are context-dependent tools. Long/late naps can reduce nighttime sleep pressure, while strategic naps can improve cognition or manage shift-work sleepiness.

## New disorder / decision-boundary pages

### CBT-I vs sleep supplements

**Route:** `/articles/cbt-i-vs-sleep-supplements/`

Anchored to the AASM behavioral-treatment guideline (PMID 33164742), ACP chronic-insomnia guideline (PMID 27136449), and the 2026 AASM combination-treatment guideline (PMID 41975142).

**Position:** CBT-I is the evidence benchmark for chronic insomnia. Sleep hygiene alone is not CBT-I, and supplements should be framed as narrower tools rather than a replacement for first-line insomnia treatment.

The 2026 AASM guideline adds an important hierarchy: CBT-I plus insomnia medication is suggested over medication alone, but combination treatment is suggested **against** over CBT-I alone.

### Sleep apnea vs insomnia / COMISA

**Route:** `/articles/sleep-apnea-vs-insomnia/`

Anchors include the 2026 COMISA treatment network meta-analysis (PMID 42107468), the 2026 physiopathology systematic review/meta-analysis (PMID 41863735), and the 2025 clinical review (PMID 40258387).

**Position:** Insomnia and obstructive sleep apnea can coexist. Sedation, melatonin, magnesium, or herbs do not treat airway obstruction. COMISA may require both OSA-specific treatment and insomnia-specific treatment rather than forcing all symptoms into one bucket.

### Restless legs, iron and sleep

**Route:** `/articles/restless-legs-iron-and-sleep/`

Anchored to the current AASM RLS/periodic-limb-movement guideline (PMID 39324694).

**Position:** RLS can present as difficulty falling asleep, but the evidence pathway is disorder-specific. AASM guidance centers ferritin and transferrin saturation in clinically significant RLS.

**Guardrail:** Iron is not a generic sleep supplement. Do not recommend blind iron use from a symptom match; laboratory context matters and RLS-specific iron thresholds differ from general-population deficiency rules.

## Hub integration

`/guides/sleep/` now has distinct layers for:

1. **Decision-first guides** — route by the actual sleep problem.
2. **Comparisons** — direct buyer/decision questions.
3. **Ingredient research** — saffron, tart cherry, chamomile, lavender, passionflower, tryptophan, 5-HTP, and formulation directness.
4. **Sleep science** — endpoints, study methodology, measurement, wearables, regularity, catch-up sleep, caffeine, alcohol, light/screens, melatonin timing, thermal environment, chrononutrition, exercise, naps, and insomnia-vs-insufficient-sleep.
5. **Check the bottleneck** — CBT-I, sleep apnea/COMISA, and restless legs/iron when another supplement may be the wrong next move.
6. **ADHD & sleep** — separate timing/stimulant context.
7. **Depth profiles** — herb/compound records.

The hub schema graph includes the ingredient research, sleep-science, and bottleneck article sets so the new pages are not orphaned.

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
11. **Disorder boundary** — do not let a supplement ranking substitute for evaluation of a plausible sleep disorder.
12. **Behavior/environment distinction** — a plausible circadian, thermal, or behavioral mechanism is not proof that a consumer protocol or product improves sleep.
13. **Analysis hierarchy** — when a review reports both within-group and controlled effects, prioritize the controlled comparison for efficacy claims.

## Remaining high-ROI gaps after this pass

The cluster is now broad enough that the next work should prioritize **integration, contradiction repair, and refreshes over raw page count**.

Best remaining opportunities:

- contextual links from flagship ranking pages into the new ingredient, timing, CBT-I / COMISA / RLS, temperature, and chrononutrition depth pages;
- propagate the new **melatonin timing-versus-dose** guardrails across older melatonin pages without creating redundant URLs;
- audit older blog posts for unsupported dose language, formulation overreach, sleep-stage claims, exact-temperature claims, and sleep-disorder claims;
- inspect flagship `best herbs` and `sleep herbs vs melatonin` language so lavender and passionflower grades match the new direct reviews;
- clean unresolved sleep/ADHD research TODOs in internal source drafts where evidence has already been verified elsewhere;
- promote vetted enrichment findings into currently noindex compound/herb records where provenance requirements are satisfied;
- monitor 2026+ systematic reviews and RCTs for changes that materially alter existing evidence grades.

## Strategic outcome

The sleep cluster now has a defensible research moat: it can explain not only **which option has evidence**, but **what kind of evidence it is, what part of sleep changed, whether the measurement was subjective or objective, why studies can disagree, whether the formulation matches, whether timing/temperature/meal schedule is an upstream variable, whether a behavioral mechanism actually survives a controlled comparison, and when the sleep complaint belongs in a disorder-specific evidence pathway instead of a supplement stack**.
