# Sleep Research Expansion — Phase 3

Date: 2026-09-04

## Purpose

This phase turns the sleep section from a supplement-focused cluster into a broader evidence-first sleep authority layer while preserving deployment governance.

## New authority coverage

### Foundational sleep science
- Adult sleep duration: population recommendation versus individual need.
- Sleep-cycle timing: cycles are real, but a fixed 90-minute rule is not.
- Sleep onset versus sleep maintenance.
- Subjective versus objective sleep measurement.
- Why sleep studies disagree.
- Wearable sleep-tracker accuracy.
- Sleep debt and recovery dynamics: different outcomes recover at different rates after restriction.

### Circadian and schedule
- Night-owl chronotype versus delayed sleep-wake phase disorder.
- Delayed sleep phase versus insomnia.
- Morning light and sleep timing.
- Melatonin timing versus dose.
- Shift-work sleep disorder.
- Jet lag.
- Teen/adolescent sleep and school-start-time evidence.

### Environment and non-drug tools
- Sleep environment evidence guide.
- Eye masks and earplugs.
- White noise, including newer pink-noise polysomnography evidence.
- Bedroom temperature and cooling.
- Warm bath or shower before bed.
- Bedroom ventilation / CO2 as an environmental marker.
- Sleep position for positional OSA and reflux.
- Music, weighted blankets, mindfulness, naps, exercise timing and sleep regularity.

### Symptoms, disorders and comorbidity
- Snoring versus obstructive sleep apnea.
- Sleep apnea versus insomnia.
- Restless legs and iron evaluation.
- Nocturia and sleep.
- Daytime sleepiness versus fatigue, including microsleep and hypersomnolence boundaries.
- REM sleep behavior disorder and dream-enactment red flags.
- Chronic pain and sleep.
- Migraine and sleep (merged in parallel through PR #5187).
- Menopause and sleep.
- Pregnancy/postpartum sleep.
- Older-adult sleep.

### Ingredient evidence
The ingredient layer now includes direct reviews for saffron, tart cherry, chamomile, lavender, passionflower, lemon balm, L-tryptophan, 5-HTP, oral GABA, omega-3, vitamin D and hops, with formulation and endpoint caveats preserved.

## Evidence-discipline rules

Every sleep page should preserve:
1. the exact population studied;
2. the intervention or formulation tested;
3. the sleep endpoint that actually changed;
4. subjective versus objective measurement;
5. positive and null outcomes from the same evidence base;
6. statistical versus practical significance;
7. important diagnostic or safety boundaries;
8. the distinction between a mechanism and an established treatment effect.

## Canonical architecture

The public sleep hub should route readers by problem before product:

1. core sleep science;
2. chronic insomnia / disorder-level pathways;
3. circadian and schedule problems;
4. environment and behavioral tools;
5. substances and OTC products;
6. life-stage and comorbidity contexts;
7. supplements and ingredient research.

The public Sleep Interventions Evidence Matrix is the cross-cluster evidence map.

## Duplicate-control rule

Before publishing a new sleep page:
- search current `content/articles` and sleep guides for overlapping intent;
- preserve the stronger established canonical URL when one already exists;
- merge new evidence into that canonical page when the new page would substantially overlap;
- keep two pages only when they answer materially different queries.

Examples from this phase:
- the stronger existing older-adult sleep page was kept and the duplicate draft removed;
- newer pink-noise evidence was consolidated into the established white-noise URL;
- teen sleep and the narrower school-start-time intervention review were retained because they answer different intents.

## Deployment governance

Production deploys intentionally fail closed for direct pushes to `main`.

The deploy verifier requires the deployment SHA to map to exactly one merged pull request and then requires either:
- repository-owner merge provenance; or
- a successful `autonomous-merge/authorized` receipt on the exact PR head.

Therefore future autonomous research changes should be created on a branch and merged through the repository's autonomous merge controller rather than written directly to `main`.

This preserves both goals:
- rapid autonomous content/research iteration; and
- a deployable, provenance-checked production branch.

## Governed continuation implemented on this PR

The recovery PR also adds three high-value evidence pages without writing directly to `main`:
- `sleep-debt-and-recovery`;
- `daytime-sleepiness-vs-fatigue`;
- `rem-sleep-behavior-disorder-red-flags`.

These intentionally expand the diagnostic/science layer rather than adding more low-certainty supplement content.

## Next research targets

High-value remaining candidates should be screened for duplication and evidence quality before publication. Likely next topics include:
- hypersomnia versus insufficient sleep;
- bruxism and sleep;
- nasal obstruction and sleep-disordered breathing;
- medication-induced insomnia or sleepiness;
- sleep paralysis and nightmare/parasomnia differentiation;
- circadian advanced sleep phase / early-morning waking.

Prioritize topics that expand diagnostic decision coverage or correct common high-volume sleep myths before adding more low-certainty supplement pages.
