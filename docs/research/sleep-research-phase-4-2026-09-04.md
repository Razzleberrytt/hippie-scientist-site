# Sleep Research Expansion — Phase 4

Date: 2026-09-04

## Goal

Continue widening the sleep authority graph beyond supplement selection by adding high-value diagnostic boundaries, circadian distinctions, airway-adjunct evidence, medication effects, and central-hypersomnolence context.

All Phase 4 work is developed on a branch rather than written directly to `main`, preserving the governed PR → autonomous controller → deploy lifecycle.

## Parallel coverage intentionally excluded

### Sleep paralysis — merged independently
Canonical route: `/articles/sleep-paralysis/`

Sleep paralysis was independently researched and merged through PR #5199 while Phase 4 was being staged. The duplicate Phase 4 draft was deleted rather than competing with the now-established canonical page.

### REM sleep behavior disorder — merged independently
Canonical route: `/articles/rem-sleep-behavior-disorder/`

PR #5202 independently merged the canonical RBD review, covering diagnosis, polysomnography, injury prevention, treatment guidance and neurologic/synucleinopathy context. Phase 4 therefore treats that page as an established dependency rather than creating another RBD core review.

### Night terrors versus nightmares — merged independently
Canonical route: `/articles/night-terrors-vs-nightmares/`

PR #5209 independently shipped the cross-parasomnia night-terror/nightmare comparison while Phase 4 was staged. Because the Phase 4 `nightmares-sleep-terrors-and-rbd` draft substantially overlapped that decision intent and the already-canonical RBD review, the duplicate Phase 4 page was deleted rather than creating a competing diagnostic router.

This is the duplicate-control policy working as intended: search not only current `main`, but also active/recent parallel PRs before publication.

## Staged on this branch

### 1. Advanced sleep phase versus early waking
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

### 2. Sleep bruxism and OSA
Canonical target: `/articles/sleep-bruxism-and-sleep-apnea/`

Evidence anchors:
- PMID 39182463 — 2024 meta-analysis found no significant increase in bruxism odds in OSA
- PMID 40725707 — 2025 systematic review described more overlap but unresolved causality
- PMID 40043438 — bruxism and sleep-quality synthesis
- PMID 38295573 — instrumental bruxism measurement review

Editorial boundary:
- Teeth grinding is not an OSA diagnostic shortcut.
- Preserve disagreement between recent reviews rather than flattening it.
- Self-report, tooth wear, EMG and PSG are not interchangeable bruxism measures.
- Night guards can protect teeth without treating airway obstruction.

### 3. Nasal obstruction and OSA
Canonical target: `/articles/nasal-obstruction-and-sleep-apnea/`

Evidence anchors:
- PMID 39268344 — 2024 systematic review
- PMID 42314704 — 2026 functional-rhinoplasty systematic review/meta-analysis
- PMID 36358372 — 2022 isolated-nasal-surgery systematic review

Editorial boundary:
- Nasal treatment can improve obstruction, subjective sleep quality, sleepiness, snoring and CPAP tolerance.
- Isolated nasal surgery usually does not improve AHI enough to qualify as primary OSA treatment.
- Better nasal breathing is therefore commonly an adjunctive success, not proof of OSA cure.

### 4. Medications and sleep
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
- Prescription dose/timing/stopping changes belong with a prescriber or pharmacist rather than DIY experimentation.
- Do not build sedative/stimulant stacks to cancel side effects before identifying the source.

### 5. Hypersomnolence versus insufficient sleep
Canonical target: `/articles/hypersomnolence-vs-insufficient-sleep/`

Evidence anchors:
- PMID 38796978 — clinical considerations in idiopathic hypersomnia (2024)
- PMID 40533080 — central disorders of hypersomnolence review (2025)
- PMID 40976193 — biomarkers review (2025)
- PMID 40990641 — idiopathic hypersomnia diagnosis/pathophysiology review (2025)
- PMID 39150683 — prior sleep opportunity and MSLT results (2024)

Editorial boundary:
- Central hypersomnolence requires persistent pathological sleepiness despite adequate sleep opportunity; chronic short sleep is a major mimic.
- Narcolepsy type 1 has a clearer orexin/cataplexy biology than narcolepsy type 2 or idiopathic hypersomnia.
- MSLT is useful but not a standalone disease detector; test preparation and preceding sleep opportunity materially affect interpretation.
- Actigraphy and sleep logs help establish whether chronic restriction or circadian irregularity is contaminating the workup.
- Stimulant response does not diagnose the cause of sleepiness.
- This page remains a cause-of-sleepiness router rather than a replacement for the canonical narcolepsy and idiopathic-hypersomnia disease reviews added in parallel.

## Collision audit

Repeated recent-PR search on 2026-09-04 pruned three overlapping drafts before publication:
- sleep paralysis → PR #5199 canonical page;
- RBD core review → PR #5202 canonical page;
- nightmares versus sleep terrors comparison → PR #5209 canonical comparison.

The five remaining Phase 4 intents are:
- advanced sleep phase / early waking;
- sleep bruxism and OSA;
- nasal obstruction and OSA;
- medication-related sleep effects;
- hypersomnolence versus insufficient sleep.

Re-run this audit immediately before opening the Phase 4 PR because parallel workers are moving quickly.

## Dependency on Phase 3

Two Phase 4 pages intentionally cross-link to routes still being recut through PR #5201:
- `/articles/sleep-debt-and-recovery/`
- `/articles/daytime-sleepiness-vs-fatigue/`

The RBD dependency is already satisfied on `main` by PR #5202 at `/articles/rem-sleep-behavior-disorder/`.

Phase 4 should not publish until the two Phase 3 routes exist on `main`, or until the branch is refreshed onto a base that contains them.

## Integration after Phase 4 research merges

A separate fresh-main integration pass should update:
- `app/guides/sleep/page.tsx`
- `content/articles/sleep-interventions-evidence-matrix.md`
- `app/__tests__/sleep-research-cluster-integrity.test.ts`

Do not overwrite these shared files from a stale research branch. Parallel sleep workers are actively modifying the hub and integration layer.

## Remaining high-value gaps

Screen before publication:
- medication-specific deep dives only where search intent justifies them;
- pediatric sleep only if age-specific safety/evidence can stay clearly separate;
- sleep and cardiometabolic disease only where causality versus observational association is handled explicitly.

PTSD/trauma sleep is no longer a remaining gap; that lane was covered in parallel on `main`.

Priority remains diagnostic clarity, evidence reconciliation and high-volume myth correction over low-certainty supplement proliferation.
