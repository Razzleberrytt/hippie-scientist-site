# P0 CI measurement — evidence before optimization

**Tracking:** #6438 (parent #6431). Read-only diagnostic: no changes to CI gates or provider permissions.

## Invocation

Supply exact numeric Actions run IDs from comparable PRs. Store the minimal-scope read-only token in GH_TOKEN environment; never in the repository.

    node scripts/ci/report-generation-ci-timing.mjs --repo Razzleberrytt/hippie-scientist-site --runs 123456,123457

The script accesses GitHub's standard run and job metadata using an environment credential. It never makes mutation requests or publishes the credential. Run only when an authorized GH_TOKEN has Actions metadata read scope.

## Report

JSON includes run name/ID/exact SHA, workflow wall minutes, per-job elapsed minutes, cumulative runner job minutes, missing/incomplete timings as null (Unknown), measured sample count, P50/P95 and repeated named validation steps marked **manual equivalence review required**. An empty sample is Unknown rather than zero.

Parallelism matters: 30 wall minutes can coexist with 50 runner-minutes. Shared step names alone do not prove checks are equivalent; distinct builds, source trees, environment, clinical/security scope, cache states or gate semantics can differ.

## Release-safe optimization protocol

1. Collect comparable code-change CI samples, with exact SHA, base, path classifier, workflow trigger, status, terminal conclusion and reason for rerun.
2. Keep failed, canceled, infrastructure-retried and stale-base attempts separate from a successful timing cohort rather than silently ignoring waste.
3. Verify every proposed duplicate against exact same tree, inputs, environment, risk/safety/SEO/a11y scope and authoritative gate before asking to drop it.
4. Make a scoped implementation issue and adversarial regressions. Preserve all required CI, source review, deployment, accessibility and security gates on the current PR head/base.
5. Measure before/after CI wall/runtime, runner minutes, reruns and safely deployed throughput with sample counts. Do not claim percentage savings until evidence supports them.

See [P0 methodology](../GENERATIONAL_ENGINEERING_P0.md). The profiler is a diagnostic tool, not a new runtime service, gate bypass, backlog authority or automatic deployment.
