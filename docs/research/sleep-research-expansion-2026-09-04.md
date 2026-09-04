# Sleep Research Expansion — 2026-09-04

## Goal

Build the sleep cluster into an evidence-dense topical authority layer rather than a collection of repetitive “best sleep aid” pages. New content should add distinct search intent, improve internal evidence discipline, preserve null/conflicting results, and make it easier for readers and downstream AI systems to distinguish outcomes, populations, formulations, and measurement methods.

## Expansion completed today

### Ingredient evidence pages

#### 1. Tart cherry for sleep

**Page:** `/articles/tart-cherry-for-sleep/`

**Evidence position:** Limited and heterogeneous.

Evidence anchors:

- 2025 systematic review: 7 interventional studies; only some reported improvement in sleep indicators and melatonin-related measures, with substantial heterogeneity. PMID 40964149.
- 2018 older-adult insomnia crossover pilot: 8 completers; large polysomnographic total-sleep-time signal, but far too small for a stable expected effect estimate. PMID 28901958.
- 2010 chronic-insomnia pilot: improvements in selected outcomes but no placebo-separated improvement across several other key sleep measures. PMID 20438325.
- 2024 randomized crossover powder study: no significant measured sleep benefit. PMID 39683518.
- 2022 controlled trial in healthy adults: no meaningful sleep benefit. PMID 35790450.

**Do not overclaim:** “Contains melatonin” does not establish melatonin-like clinical efficacy. Juice, concentrate, powder, capsule, and standardized products are not automatically equivalent.

#### 2. Saffron for sleep

**Page:** `/articles/saffron-for-sleep/`

**Evidence position:** Moderate short-term evidence, mainly subjective and product-specific.

Evidence anchors:

- 2022 meta-analysis of RCTs: pooled improvements in PSQI, ISI, and RSQ. PMID 35325766.
- 2023 systematic review: 5 RCTs, 379 participants, initial support for improved sleep quality. PMID 37484523.
- 2020 and 2021 RCTs: positive subjective sleep signals with standardized extracts. PMIDs 32056539 and 34438361.
- 2025 RCT in 165 adults with moderate insomnia: statistically significant but small primary insomnia-score improvement, alongside mixed secondary outcomes. PMID 40698027.

**Do not overclaim:** “Modest short-term benefit with product-specific uncertainty” is more defensible than “clinically proven insomnia treatment.”

#### 3. Chamomile for sleep

**Page:** `/articles/chamomile-for-sleep/`

**Evidence position:** Limited and outcome-specific.

Evidence anchors:

- 2024 systematic review/meta-analysis: favorable signal especially around nighttime awakenings, but not consistent across sleep duration, efficiency, and daytime outcomes. PMID 39106912.
- 2019 systematic review/meta-analysis: pooled subjective sleep-quality signal, but direct insomnia-severity evidence remained weak. PMID 31006899.
- 2011 chronic primary insomnia RCT: no significant between-group improvement across major sleep endpoints. PMID 21939549.

**Do not overclaim:** Extract evidence should not be transferred automatically to chamomile tea or isolated apigenin.

#### 4. L-tryptophan for sleep

**Page:** `/articles/l-tryptophan-for-sleep/`

**Evidence position:** Limited, endpoint-specific.

Evidence anchors:

- 2022 systematic review/meta-analysis: the clearest pooled signal is reduced **wake after sleep onset (WASO)**, not a broad pooled sleep-latency benefit. PMID 33942088.
- AASM chronic-insomnia pharmacologic guideline: suggested against tryptophan for sleep-onset or sleep-maintenance insomnia because evidence was insufficient. PMID 27998379.
- NCCIH continues to describe insomnia evidence for tryptophan/5-HTP as very limited.

**Contradiction repaired:** The served `tryptophan` compound payload previously said “moderate evidence for modest sleep latency reduction.” It now reflects the endpoint-level synthesis: limited evidence with the clearest pooled signal for reduced WASO.

**Do not overclaim:** Being a serotonin/melatonin precursor does not make tryptophan equivalent to exogenous melatonin or establish a predictable bedtime effect.

#### 5. 5-HTP for sleep

**Page:** `/articles/5-htp-for-sleep/`

**Evidence position:** Limited.

Evidence anchors:

- 2024 randomized trial in 30 older adults: selected subjective sleep-quality improvements, particularly among participants with poor sleep at baseline. PMID 38309227.
- NCCIH: insomnia evidence remains very limited.
- Human serotonin-syndrome interaction report involving 5-HTP and linezolid. PMID 25978918.
- Human overdose case reinforces biological activity and dose-related risk. PMID 35878559.

**Do not overclaim:** One small population-specific RCT does not establish treatment efficacy for chronic insomnia or prove superiority to tryptophan/melatonin.

## Sleep-science authority pages completed

### 6. Sleep onset vs sleep maintenance

**Page:** `/articles/sleep-onset-vs-sleep-maintenance/`

Separates:

- sleep-onset latency (SOL),
- wake after sleep onset (WASO),
- total sleep time (TST),
- sleep efficiency,
- subjective sleep quality,
- insomnia severity,
- next-day functioning.

**Authority value:** Creates a reusable internal evidence framework so future pages cannot convert one favorable endpoint into the generic claim “improves sleep.”

### 7. Subjective vs objective sleep

**Page:** `/articles/subjective-vs-objective-sleep/`

Evidence anchors:

- 2025 umbrella review: insomnia-control differences are largest and most consistent on subjective measures; objective changes are generally smaller. PMID 40850055.
- 2019 CBT-I meta-analysis: strong diary improvement without consistent PSG transformation. PMID 31377503.
- AASM actigraphy evidence review. PMID 29991438.
- 2025 sleep-state misperception theoretical review. PMID 40327948.

**Authority value:** Prevents the common mistakes “subjective = worthless” and “wearable/PSG = complete measure of how sleep feels.”

### 8. Sleep tracker accuracy

**Page:** `/articles/sleep-trackers-accuracy/`

Evidence anchors:

- 2026 systematic review: poor-to-moderate concordance between consumer wearable metrics and validated subjective sleep quality; systematic bias in several parameters. PMID 41946254.
- 2025 World Sleep Society recommendations for consumer sleep trackers. PMID 40300398.
- Actigraphy-vs-PSG systematic review/meta-analysis. PMID 31154154.

**Authority value:** Captures current consumer search intent while positioning wearables as trend tools rather than miniature sleep laboratories.

### 9. Sleep regularity

**Page:** `/articles/sleep-regularity-health/`

Evidence anchors:

- 2025 systematic review of 59 studies: increasingly consistent associations between sleep irregularity and several mental, metabolic, cardiovascular, cognitive, and mortality outcomes. PMID 41259946.
- 2024 older-adult review: similar signal for cardiovascular, cognitive, and mortality outcomes. PMID 38831959.

**Do not overclaim:** The evidence is heavily observational. Association is not proof that irregular timing directly causes the downstream disease.

### 10. Caffeine and sleep timing

**Page:** `/articles/caffeine-and-sleep-timing/`

Evidence anchors:

- 2023 systematic review/meta-analysis: caffeine reduced total sleep time and efficiency, increased SOL/WASO, and reduced slow-wave sleep; modeled timing effects varied by dose. PMID 36870101.
- 2013 controlled 400-mg study: measurable disruption even 6 hours before bedtime. PMID 24235903.
- 2024 randomized dose/timing crossover trial. PMID 39377163.
- 2025 dose/age meta-analysis of controlled crossover trials. PMID 41124973.

**Do not overclaim:** The modeled 8.8-hour coffee interval is not a universal prescription or biological cliff.

### 11. Insomnia vs sleep deprivation

**Page:** `/articles/insomnia-vs-sleep-deprivation/`

Evidence anchors:

- NHLBI insomnia definition emphasizes difficulty sleeping despite adequate opportunity/environment.
- NHLBI sleep-deprivation framework separates insufficient sleep from broader sleep deficiency.
- 2023 systematic review of insomnia nosology. PMID 37122153.
- 2022 meta-epidemiological study: many RCTs/reviews use “insomnia” without clearly distinguishing disorder from symptoms. PMID 36231555.

**Authority value:** Prevents treatment mismatch. A short sleep opportunity and insomnia disorder can produce similar daytime symptoms but do not imply the same intervention.

## Hub integration completed

`/guides/sleep/` now separates:

1. decision-first sleep guides,
2. ingredient evidence reviews,
3. sleep-science / evidence-literacy pages,
4. ADHD-specific sleep pages,
5. compound/herb depth profiles.

The hub schema graph includes the new research and sleep-science pages, reducing orphan risk and strengthening the semantic cluster.

## Evidence-discipline rules now established for the sleep cluster

Every future sleep article should explicitly preserve:

1. **Population** — healthy poor sleepers, diagnosed insomnia, older adults, children, shift workers, etc.
2. **Endpoint** — SOL, WASO, TST, sleep efficiency, questionnaire score, sleep stage, next-day function.
3. **Measurement method** — diary, validated questionnaire, actigraphy, consumer wearable, or PSG.
4. **Comparator** — within-group change is not the same as beating placebo.
5. **Magnitude** — statistical significance is not automatically clinically large.
6. **Formulation** — specific extract/product evidence should not be generalized to an ingredient class without justification.
7. **Duration** — one-night, short-term, and multi-week outcomes are different evidence questions.
8. **Safety context** — especially sedative, serotonergic, pregnancy, kidney/liver, and medication-interaction considerations.
9. **Null findings** — preserve major outcomes that did not improve.
10. **Highest-level synthesis** — recent systematic reviews/meta-analyses should anchor the verdict when available.

## Next high-ROI expansion queue

### A. Sleep formulation equivalence — HIGH

Create an article explaining why magnesium salts, saffron extracts, tart-cherry formats, chamomile preparations, valerian extracts, and branded formulations cannot be assumed clinically interchangeable.

**Strategic value:** This becomes a reusable citation target across dozens of supplement pages and protects against ingredient-class overgeneralization.

### B. Alcohol and sleep architecture — HIGH

Build a research-first page separating faster perceived sleep onset from later-night fragmentation, REM effects, breathing risk, and next-day sleep quality.

**Strategic value:** Large consumer search intent and a strong non-supplement sleep-disruptor page that can route users upstream before they add more bedtime products.

### C. Morning light and circadian timing — HIGH

Explain light timing, circadian phase shifting, delayed sleep schedules, and why “more light” is not a timing-neutral intervention.

**Strategic value:** Strengthens melatonin/circadian content and ADHD sleep routing without creating another redundant melatonin article.

### D. Exercise timing and sleep — MEDIUM-HIGH

Synthesize exercise and sleep meta-analyses while keeping time-of-day, intensity, training status, and individual response separate.

### E. Naps and nighttime sleep — MEDIUM-HIGH

Separate short strategic naps from long/late naps, sleep pressure, shift-work contexts, and sleep-deprivation recovery.

### F. Why sleep supplement studies disagree — MEDIUM-HIGH

Cross-cutting methodology page covering small samples, product identity, baseline deficiency, sleep phenotype, placebo effects, measurement mismatch, and multiplicity of endpoints.

## Internal-link expansion queue

Priority contextual links still worth adding:

- Best Supplements for Sleep → saffron, tart cherry, chamomile, tryptophan, 5-HTP depth pages where appropriate.
- Best Herbs for Sleep → saffron and chamomile.
- Apigenin for Sleep → chamomile evidence page.
- Sleep Herbs vs Melatonin → chamomile evidence page.
- Existing caffeine/focus pages → caffeine-and-sleep-timing when sleep disruption is discussed.
- Wearable references across magnesium/sleep pages → sleep-trackers-accuracy.
- Articles using subjective-only outcomes → subjective-vs-objective-sleep.
- Any page saying “insomnia” loosely → insomnia-vs-sleep-deprivation or outcome-specific explainer as context.

## Highest-ROI editorial principle

The competitive edge is not publishing the largest list of sleep supplements. It is building a cluster where each claim can answer:

> **What changed, by how much, in which population, measured how, compared with what, using which formulation, and with what safety/uncertainty?**

That structure is useful to readers, search engines, and AI systems because it makes the evidence graph explicit rather than burying it inside generic wellness copy.
