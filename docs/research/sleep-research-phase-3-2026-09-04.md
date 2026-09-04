# Sleep Research Expansion — Phase 3

Date: 2026-09-04

## Purpose

This governed continuation extends the sleep cluster into recovery physiology and daytime symptom differentiation while preserving the repository's PR → autonomous controller → deploy lifecycle.

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

## Parallel coverage intentionally excluded

### REM sleep behavior disorder
The Phase 3 RBD red-flag draft was deleted after PR #5202 independently merged the canonical `/articles/rem-sleep-behavior-disorder/` review. That merged page already covers diagnosis, polysomnography, injury prevention, mimics, treatment guidance and synucleinopathy risk, so publishing a second RBD page would duplicate intent.

### Sleep paralysis
Sleep paralysis was independently published through PR #5199 and was removed from the separate Phase 4 draft for the same reason.

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

The duplicate-control rule is active, not aspirational: both sleep paralysis and RBD drafts were removed when stronger parallel canonical pages landed first.

## Deployment governance

Production deploys intentionally fail closed for direct pushes to `main`.

This Phase 3 recut was created after the original PR #5188 repeatedly became stale while parallel sleep PRs advanced the base. The recut carries only still-missing source files plus a low-conflict wording correction in the canonical 90-minute-cycle article; it does not replay stale branch history.

The autonomous merge controller must perform the production merge. No deployment provenance gate is weakened in this phase.

## Regression contract

The canonical 90-minute-cycle article must continue to reject a universal fixed 90-minute rule. The current regression test contains a phrase-level false positive, so this recut avoids that exact wording while preserving the scientific conclusion. A future fresh-main test cleanup can make the regression semantic rather than mention-based.

Internal links in the two new pages must resolve to canonical sleep routes before merge.

## Next phase

Phase 4 is now collision-audited to six staged intents:
- advanced sleep phase / early waking;
- bruxism and OSA;
- nasal obstruction and OSA;
- medications and sleep;
- nightmares versus sleep terrors versus RBD;
- hypersomnolence versus insufficient sleep.

Any topic merged by another worker first should be removed or consolidated rather than duplicated.
