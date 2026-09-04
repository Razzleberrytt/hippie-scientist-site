# Sleep Cluster Integration Status — 2026-09-04

## Purpose

This is the post-expansion integration ledger for the 2026-09-04 sleep program. It complements, rather than replaces, the detailed scientific dossier in `docs/research/sleep-research-expansion-2026-09-04.md` and the phase-specific research notes.

The scientific article bodies remain the source of truth for claims, study details, effect sizes, uncertainty, safety context, and formulation-specific conclusions. This document records how that research is exposed, connected, regression-protected, and routed through the public sleep experience.

## Main snapshot at consolidation start

- Consolidation base: `0a2ce029d8b65a3976681898b77adb91e4b6a2e0`
- Public sleep hub: `/guides/sleep/`
- Public cross-intervention map: `/articles/sleep-interventions-evidence-matrix/`
- Shared article citation resolver: `lib/article-citation-metadata.ts`
- Modular sleep decision registry: `data/article-citation-overrides-sleep.ts`
- Earlier root-registry sleep decision pages: `data/article-citation-overrides.ts`

## Structured decision coverage

The upgraded sleep decision graph has a verified floor of **67 canonical article pages**:

- **60+ modular sleep overrides** assembled through `data/article-citation-overrides-sleep.ts`.
- **7 earlier recent-sleep overrides** retained in the root article citation registry:
  - `sleep-debt-and-recovery`
  - `daytime-sleepiness-vs-fatigue`
  - `sleep-bruxism-and-sleep-apnea`
  - `hypersomnolence-vs-insufficient-sleep`
  - `sleep-apnea-in-women`
  - `cpap-vs-oral-appliance-for-sleep-apnea`
  - `home-sleep-apnea-test-vs-polysomnography`

The runtime resolver intentionally checks the modular sleep registry before the root registry. The two sleep sets should remain non-overlapping.

Every upgraded page is expected to retain:

1. at least four curated related-page relationships;
2. at least five normalized canonical concepts;
3. at least four evidence-calibrated Decision snapshot rows;
4. at least three substantive visible FAQ answers; and
5. a canonical article file at `content/articles/<slug>.md`.

The cluster-level regression contract is `app/__tests__/sleep-cluster-decision-coverage.test.ts`. Existing batch-specific tests remain the stronger claim-boundary contracts for individual topic groups.

## Governed enhancement batches merged

### Initial recent-page upgrade — PR #5238

Established the reusable Decision snapshot + visible FAQ + structured FAQ + curated relationship architecture for the first recent sleep evidence pages and strengthened the bruxism/OSA synthesis with newer review evidence.

### Adjacent diagnostic/environment upgrade — PR #5250

Extended the system to advanced sleep phase, nasal obstruction/OSA, medication effects, sleep paralysis, REM sleep behavior disorder, and the sleep-environment evidence guide. Added canonical relationship aliases so stale internal relationship slugs resolve to live pages.

### Core sleep science — PR #5254

Upgraded foundational interpretation pages including sleep onset vs maintenance, subjective vs objective sleep, why studies disagree, tracker accuracy, sleep regularity, weekend catch-up sleep, adult sleep duration, and the 90-minute-cycle myth.

### Behavior/circadian exposures — PR #5260

Upgraded caffeine, alcohol, cannabis/cannabinoids, nicotine/vaping, morning light, melatonin timing, screens/blue light, and exercise timing. The governing rule is that timing, exposure, formulation, and comparator matter more than generic lifestyle labels.

### Environmental/non-drug interventions — PR #5264

Upgraded cooling, warm baths/showers, white noise, music, weighted blankets, mindfulness, time-restricted eating, and naps while preserving subjective/objective outcome splits and comparator quality.

### Diagnostic/safety pages — PR #5267

Upgraded CBT-I vs supplements, insomnia vs insufficient sleep, sleep apnea vs insomnia, snoring vs OSA, mouth taping, RLS/iron, OTC antihistamines, and position/OSA/reflux. The central rule is to identify the bottleneck before escalating a sleep aid.

### Circadian/schedule pages — PR #5271

Upgraded night-owl chronotype vs disorder, delayed phase vs insomnia, jet lag, shift-work sleep disorder, teen school-start timing, and sleep inertia. Preference, phase direction, impairment, and timing remain distinct concepts.

### Life-stage/comorbidity pages — PR #5273

Upgraded adolescent sleep, menopause, pregnancy/postpartum, older-adult sleep, chronic pain, migraine, anxiety, depression, and tinnitus. Improving insomnia can help a comorbidity without proving that the comorbid condition itself has been treated.

### Remaining high-value diagnostic/environment routes — PR #5278

Upgraded PTSD/nightmares, NREM parasomnias, narcolepsy, idiopathic hypersomnia vs narcolepsy, nocturia, eye masks/earplugs, and bedroom ventilation/CO2. The emphasis is diagnostic separation, testing limits, and avoiding hospital-to-home or marker-to-cause overgeneralization.

## Public integration audit

The public sleep hub already follows a decision-first architecture and does not need indiscriminate deep-link expansion.

High-value entry points already include:

- Sleep Interventions Evidence Matrix;
- CBT-I vs Sleep Supplements;
- Insomnia vs Sleep Deprivation;
- Melatonin Timing vs Dose;
- Why Sleep Studies Disagree;
- Sleep Environment Guide;
- Shift Work Sleep Disorder; and
- separate supplement, science, circadian, environment, substance, life-stage, and disorder groups.

The commercial Best Supplements for Sleep guide already routes readers toward the broader sleep supplement evidence hub and natural-sleep-aids flagship. That is preferable to adding dozens of deep research links to a commercial comparison page.

## Evidence-boundary philosophy locked by the upgrade

The cluster should continue to preserve these distinctions:

- sedation is not the same endpoint as restorative sleep;
- subjective improvement is not objective normalization;
- one improved endpoint is not generic “better sleep”;
- a positive formulation does not validate every product in an ingredient class;
- an association is not automatically causal;
- a symptom such as snoring, nocturia, fatigue, grinding, or morning headache is not a diagnosis;
- chronotype preference is not automatically a circadian disorder;
- objective sleep tests have indication-specific blind spots and confounders;
- improving insomnia can improve a comorbid condition without replacing condition-specific treatment;
- environmental interventions help most when the matching environmental bottleneck is actually present; and
- strong evidence for a hospital, older-adult, pregnancy, menopause, adolescent, or other specific population should not be silently generalized to everyone.

## Highest-ROI next work

With structured coverage established, future sleep work should prioritize integration and evidence maintenance over raw page count:

1. keep the Sleep Interventions Evidence Matrix current as major reviews or guidelines change;
2. refresh high-authority flagship guide evidence dates and citations when newer syntheses materially change rankings;
3. audit generated/served data for stale claims that bypass Markdown articles;
4. add contextual links only where the user intent naturally benefits from a deeper evidence page;
5. preserve canonical routes and consolidate duplicate intents before publication;
6. run periodic collision/orphan checks as autonomous research workers add new sleep pages; and
7. update the master scientific dossier when evidence conclusions change, rather than using this integration ledger as a substitute for research notes.

## Completion definition

This consolidation pass is complete when:

- the 67-page coverage floor is regression-protected;
- modular and root sleep registries remain non-overlapping;
- every covered slug maps to a canonical article file;
- the hub keeps the evidence matrix and non-supplement decision routes visible;
- no new scientific claim is introduced merely to improve extraction/SEO; and
- future expansion can add new modular registries without modifying the shared resolver for each batch.
