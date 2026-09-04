# Sleep Research Expansion — Phase 3

Date: 2026-09-04

## Purpose

This phase extends the sleep cluster beyond supplement selection into recovery physiology, daytime symptom differentiation, and REM parasomnia red flags while preserving the repository's governed PR → controller → deploy lifecycle.

## Governed continuation in this PR

### Sleep debt and recovery
Canonical route: `/articles/sleep-debt-and-recovery/`

Evidence boundaries:
- Sleep debt is useful shorthand, not a literal hour-for-hour biological account.
- Acute and chronic restriction are different recovery problems.
- Sleepiness, vigilance, memory, mood and executive function can recover on different timelines.
- Weekend catch-up sleep can help short-term symptoms without proving complete reversal of chronic restriction.
- Regular adequate sleep remains the cleaner prevention strategy.

Key evidence anchors include PMIDs 37193276, 38759474, 39427809, 41148489 and 40946426.

### Daytime sleepiness versus fatigue
Canonical route: `/articles/daytime-sleepiness-vs-fatigue/`

Evidence boundaries:
- Sleepiness is propensity to fall asleep; fatigue is depletion/exhaustion without necessarily being able to sleep.
- The two can coexist and should not be treated as mutually exclusive diagnoses.
- Microsleeps and involuntary dozing are higher-priority safety signals than nonspecific low energy.
- OSA, insufficient sleep, circadian misalignment, medications and central hypersomnolence all remain differential considerations.
- Stimulant response does not identify the cause of sleepiness.

Key evidence anchors include PMIDs 12505556, 20514923, 40128860, 40558583, 40482398, 40539239 and 38796978.

### REM sleep behavior disorder red flags
Canonical route: `/articles/rem-sleep-behavior-disorder-red-flags/`

Evidence boundaries:
- RBD is dream enactment associated with loss of normal REM atonia, not simply vivid dreaming.
- Injury prevention is a first-line safety priority.
- Video or wearable data can support history but do not replace diagnostic polysomnography.
- Adult-onset isolated RBD has an important association with synucleinopathies, but it is not a deterministic Parkinson disease prediction.
- Medication-associated, narcolepsy-associated and neurologic contexts require different interpretation.

Key evidence anchors include PMIDs 36515157, 36515150, 40408791 and 41134495.

## Evidence-discipline rules

Every sleep page should preserve:
1. the exact population studied;
2. the intervention, exposure or diagnostic context;
3. the endpoint that actually changed;
4. subjective versus objective measurement;
5. positive and null findings from the same evidence base;
6. statistical versus practical significance;
7. important diagnostic and safety boundaries; and
8. mechanism versus established treatment effect.

## Duplicate-control rule

Before publication:
- search current `content/articles`, guides, merged PRs and active PRs for overlapping intent;
- preserve the stronger established canonical URL when one exists;
- merge new evidence into an existing canonical page when intent substantially overlaps;
- keep separate pages only when they answer materially different reader decisions.

This rule matters because parallel sleep workers are actively expanding the cluster. For example, sleep paralysis was independently published through PR #5199 and therefore should not be republished from a separate Phase 4 draft.

## Deployment governance

Production deploys intentionally fail closed for direct pushes to `main`.

This Phase 3 recut was created from the latest authorized `main` after the original PR #5188 repeatedly became stale while parallel sleep PRs advanced the base. The recut carries only still-missing source files and the targeted regression correction; it does not replay stale branch history.

The autonomous merge controller must perform the production merge. No deployment provenance gate is weakened in this phase.

## Regression contract

The sleep-cycle integrity test should verify the scientific conclusion—that the universal fixed 90-minute rule is rejected—rather than forbid the article from mentioning that myth while debunking it.

Internal links in the three new pages must resolve to canonical sleep routes before merge.

## Next phase

Phase 4 should be re-audited against both current `main` and active parallel PRs before publication. Current staged topics include advanced sleep phase, bruxism/OSA, nasal obstruction/OSA, medications and sleep, parasomnia differentiation, and hypersomnolence versus insufficient sleep. Any topic merged by another worker first should be removed or consolidated rather than duplicated.
