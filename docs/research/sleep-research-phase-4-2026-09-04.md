# Sleep Research Expansion — Phase 4

Date: 2026-09-04

## Goal

Continue widening the sleep authority graph beyond supplement selection by adding high-value diagnostic boundaries, circadian distinctions, airway-adjunct evidence, medication effects, and parasomnia differentiation.

All Phase 4 work is being developed on a branch rather than written directly to `main`, preserving the repository's governed PR → controller → deploy lifecycle.

## Implemented on this branch

### 1. Sleep paralysis
Canonical target: `/articles/sleep-paralysis/`

Evidence anchors:
- PMID 38368058 — recurrent isolated sleep paralysis review (2024)
- PMID 40919623 — pathogenesis, manifestations and treatment review (2025)
- PMID 39184697 — mechanisms/management review (2024)

Editorial boundary:
- REM atonia persisting into wakefulness explains paralysis.
- Isolated episodes are usually benign.
- Hallucination-like experiences do not establish psychosis or an external event.
- Sleep paralysis alone does not diagnose narcolepsy.
- Severe daytime sleepiness, sleep attacks or cataplexy change the diagnostic context.

### 2. Advanced sleep phase versus early waking
Canonical target: `/articles/advanced-sleep-phase-vs-early-waking/`

Evidence anchors:
- PMID 39864932 — advanced sleep phase, genetics and aging (2025)
- PMID 39975943 — circadian assessment and treatment update (2025)
- PMID 26414986 — AASM intrinsic circadian rhythm guideline
- PMID 31256787 — circadian phase-disorder review

Editorial boundary:
- An early chronotype is not automatically a disorder.
- ASWPD requires persistent early timing plus distress/functional impairment.
- Early waking can also reflect insomnia, OSA, mood, nocturia, pain, medication or environment.
- Light is direction- and phase-dependent; generic morning-light advice can be wrong for an already advanced clock.

### 3. Sleep bruxism and OSA
Canonical target: `/articles/sleep-bruxism-and-sleep-apnea/`

Evidence anchors:
- PMID 39182463 — 2024 meta-analysis found no significant increase in bruxism odds in OSA
- PMID 40725707 — 2025 systematic review described more overlap but unresolved causality
- PMID 40043438 — bruxism and sleep-quality synthesis
- PMID 38295573 — instrumental bruxism measurement review

Editorial boundary:
- Teeth grinding is not an OSA diagnostic shortcut.
- Preserve the disagreement between recent reviews rather than flattening it.
- Self-report, tooth wear, EMG and PSG are not interchangeable bruxism measures.
- Night guards can protect teeth without treating airway obstruction.

### 4. Nasal obstruction and OSA
Canonical target: `/articles/nasal-obstruction-and-sleep-apnea/`

Evidence anchors:
- PMID 39268344 — 2024 systematic review
- PMID 42314704 — 2026 functional-rhinoplasty systematic review/meta-analysis
- PMID 36358372 — 2022 isolated-nasal-surgery systematic review

Editorial boundary:
- Nasal treatment can improve obstruction, subjective sleep quality, sleepiness, snoring and CPAP tolerance.
- Isolated nasal surgery usually does not improve AHI enough to qualify as primary OSA treatment.
- Better nasal breathing is therefore commonly an adjunctive success, not proof of OSA cure.

### 5. Medications and sleep
Canonical target: `/articles/medications-and-sleep/`

Evidence anchors:
- PMID 40318905 — 2025 Mayo Clinic review of commonly prescribed medications and sleep
- PMID 29759266 — drug-induced insomnia/excessive sleepiness review
- PMID 36150808 — updated drug-induced insomnia/excessive sleepiness review
- PMID 21628140 — medication-induced sleep disturbances review
- PMID 39658346 — beta-blocker neuropsychiatric adverse-effect meta-analysis

Editorial boundary:
- Medication effects are drug-specific and can move sleep in opposite directions.
- Disease effects and medication effects can be confounded.
- Sedation is not automatically restorative sleep.
- Medication timing can matter, but prescription dose/timing/stopping should be reviewed with a prescriber or pharmacist rather than improvised.
- Do not build a sedative/stimulant stack to cancel medication side effects before identifying the source.

### 6. Nightmares, sleep terrors and RBD
Canonical target: `/articles/nightmares-sleep-terrors-and-rbd/`

Evidence anchors:
- PMID 38368059 — nightmare disorder review (2024)
- PMID 38368070 — sleep terrors review (2024)
- PMID 38328386 — REM parasomnia neurophysiology review (2024)
- PMID 37590824 — REM sleep behavior disorder and other REM parasomnias review
- PMID 35388549 — disorders of arousal review
- PMID 39419343 — conscious experience in NREM parasomnias review

Editorial boundary:
- Nightmares: distressing REM dreams, usually remembered.
- Sleep terrors/sleepwalking: NREM disorders of arousal, often confused with limited/variable recall.
- RBD: REM dream enactment caused by abnormal loss of REM atonia.
- Adult NREM parasomnias can be complex and injurious; they are not exclusively pediatric.
- Violent, injurious, stereotyped or unusual adult-onset episodes require a broader differential including seizure and sleep-disordered breathing.

## Dependency on Phase 3

Several Phase 4 pages intentionally cross-link to Phase 3 pages currently being validated in PR #5188:
- `/articles/sleep-debt-and-recovery/`
- `/articles/daytime-sleepiness-vs-fatigue/`
- `/articles/rem-sleep-behavior-disorder-red-flags/`

Phase 4 should not be opened as a production PR until Phase 3 has merged (or the Phase 4 branch has been refreshed onto a base containing those routes), because publication should not knowingly create transient broken internal links.

## Integration after Phase 4 research merges

A separate integration pass should update the freshest versions of:
- `app/guides/sleep/page.tsx`
- `content/articles/sleep-interventions-evidence-matrix.md`
- `app/__tests__/sleep-research-cluster-integrity.test.ts`

Do not bundle a stale full-hub rewrite into the research PR. The hub is being modified by parallel sleep workers, so integration should be rebased from the latest `main` after research pages exist.

## Remaining high-value gaps

Screen before publication:
- central hypersomnolence / idiopathic hypersomnia versus insufficient sleep (avoid duplicating Phase 3 daytime-sleepiness page);
- medication-specific deep dives only where search intent justifies them;
- pediatric sleep only if age-specific safety and evidence can be kept clearly separate;
- sleep and cardiometabolic disease only where causality versus observational association can be handled carefully.

Priority remains diagnostic clarity and high-volume myth correction over low-certainty supplement proliferation.
