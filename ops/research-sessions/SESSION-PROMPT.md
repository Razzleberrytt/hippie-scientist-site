# Research Enrichment Session bootstrap

Use this file when a user asks to run **Research Enrichment Session A, B, C, D, E, F, G, or H**.

## Session directive

You are one worker in The Hippie Scientist's parallel research-enrichment system.

1. Read `ops/research-sessions/session-manifest.json` and resolve the requested session's `workerId`, `shard`, and global `shardCount`.
2. Treat that shard as an exclusive ownership boundary. Do not research or submit a pipeline job/workpack assigned to another shard.
3. Bootstrap the requested session from the live corpus with `node scripts/enrichment-pipeline/session-bootstrap-cli.mjs <SESSION_ID>` before ad-hoc queue mining. Use the generated exhaustive owned-work inventory to reconcile already-staged work, closure debt, stranded work, and the highest-ROI remaining candidates.
4. Treat **staged research as unfinished work**. A workpack with any nonterminal finding remains in `closureBacklogWorkpacks` and must be prioritized ahead of brand-new research in that shard.
5. Inspect the current enrichment backlog, governed enrichment, source registry, normalized findings, existing submissions, and relevant entity data before looking for new sources.
6. Take the highest-ROI unfinished items in this order: (a) staged workpacks that still require review/promotion closure, then (b) unstarted workpacks. Within each group prefer safety-critical gaps, missing human evidence, contradictions/null findings, provenance gaps, and high-public-priority entities over low-value cosmetic enrichment.
7. Search existing registered sources first. Then research externally as needed, prioritizing primary studies, systematic reviews/meta-analyses, regulatory labels/monographs, and authoritative reference databases appropriate to the claim type.
8. Record findings as deltas. Preserve negative/null results, evidence conflicts, uncertainty, study population, preparation/regimen context, and source provenance. Never infer clinical efficacy from preclinical or traditional evidence.
9. Do not edit `ops/enrichment-submissions.json`. Add a new fragment under `ops/enrichment-submissions/sessions/session-<letter>/` using `schemas/enrichment-session-fragment.schema.json`.
10. Keep each submission source-grounded and compatible with `schemas/enrichment-submission.schema.json`. A new source must be registered through the existing source-registry governance path before a finding can be promoted.
11. Run/ensure `node scripts/ci/validate-enrichment-session-safety.mjs` plus the existing enrichment/scientific governance checks pass. Fix deterministic failures rather than weakening checks.
12. Reconcile duplicate/near-duplicate findings and contradictions explicitly. Do not silently overwrite prior evidence.
13. Route every staged finding to a terminal governed outcome. The normal successful path is: **research → validation → scientific/source review → source admission where required → canonical promotion → generated public/runtime verification → exact-head repository gates → merge → production verification when observable**.
14. A finding may instead terminate without promotion only through an explicit governed disposition such as `rejected`, `deprecated_submission`, `inactive`, `not_promoted`, or `quarantined`, with the evidence/blocker preserved. `draft_submission`, `ready_for_review`, and `approved_for_rollup` are intermediate states, never Definition of Done.
15. Do not close a research issue, retire a workpack, or report the session item complete merely because its staging PR merged. Re-run the session bootstrap after staging/review/promotion work; the workpack is complete only when it leaves `closureBacklogWorkpacks` and `completedWorkpacks` reflects a terminal disposition for every staged finding.
16. Open focused PRs for staging, governed promotion, or required canonical/public changes as appropriate. Merge automatically only when the intended head is conflict-free and all required CI/scientific/governance gates are green.
17. After a promotion/canonical PR merges, verify that generated public data/page behavior reflects the intended governed change. If production deployment is observable, verify production too; otherwise record the exact external/deployment blocker as `Unknown` rather than pretending completion.
18. Continue with the next highest-value unfinished item in the same shard until the requested run is exhausted or a genuine external/semantic blocker remains.
19. **Throughput target: approximately five useful findings per hourly worker run.** Do not stop after the first completed finding/workpack when additional high-ROI owned work is safely actionable.
20. Prefer terminal throughput: when dependencies permit, close approximately five findings through governed promotion or an explicit governed terminal non-promotion outcome before starting lower-ROI new research.
21. If five terminal findings cannot safely complete because CI, source review, governor leases, semantic ambiguity, merge dependencies, or another external dependency is genuinely blocking, continue to advance enough distinct source-grounded findings to keep useful research throughput near five and report the exact terminal-versus-staged shortfall.
22. One counted finding is one distinct evidence proposition tied to an exact source identity and scientifically material context. Rephrases, near-duplicates, generic mechanism summaries, unsourced prose, or artificial splitting of one study into trivial variants do not count toward throughput.
23. Never lower evidence, safety, provenance, null/conflict visibility, source-admission, or CI standards to hit the target. A throughput miss with a precise blocker is preferable to quota-padding or unsafe promotion.
24. Re-rank immediately after each completed finding or workpack cluster and continue with the next highest-ROI owned item until the run is exhausted, the approximate five-finding target is reached, or a genuine blocker remains.

### Canonical session bootstrap command

Run this before selecting new work and again after staging/review/promotion changes:

```bash
node scripts/enrichment-pipeline/session-bootstrap-cli.mjs A
```

Replace `A` with the requested session letter. The command writes `artifacts/enrichment-session-bootstrap-<letter>.json` containing every live herb/compound workpack owned by that session, whether it has been staged, whether all staged findings have terminal dispositions, its deterministic integrity-ROI score/reasons, the closure backlog, and the next highest-ranked unfinished candidates.

Bootstrap lifecycle fields are execution state, not scientific authority:

- `stagedWorkpacks`: workpacks with at least one research submission.
- `closureBacklogWorkpacks`: staged workpacks with one or more nonterminal findings.
- `completedWorkpacks`: staged workpacks whose findings are all terminal (promoted or explicitly declined/quarantined/inactive).
- `unstartedWorkpacks`: owned workpacks with no staged research yet.
- `remainingWorkpacks`: every owned workpack that is not terminally complete. This includes staged closure debt.

Bootstrap output does not approve evidence, register sources, attest semantics, promote findings, or bypass shard/safety gates.

### Local pipeline claim command

Substitute the session values from the manifest:

```bash
node scripts/enrichment-pipeline/cli.mjs claim \
  --worker <workerId> \
  --shard <shard> --shards <shardCount> \
  --limit 25 \
  --ignore-scope
```

`--ignore-scope` permits research/staging outside a production readiness pilot; it does **not** bypass any production promotion gate.

### Workpack ownership check

For governed workpacks, ownership is `shardOf(workpackId, shardCount)` using `scripts/enrichment-pipeline/lib/ids.mjs`. A session fragment containing a foreign-shard workpack fails CI.

### Definition of Done

For a normal enrichment workpack, **staging is a checkpoint, not completion**. The workpack is done only when every staged finding has reached one of these outcomes:

- promoted through governed canonical/public handling and verified in generated output; or
- explicitly terminal without promotion because review rejected/deprecated/inactivated/quarantined it or recorded a governed not-promoted disposition.

A merged research-only PR with findings still in `draft_submission`, `ready_for_review`, or `approved_for_rollup` remains active closure debt and should be selected before new research.

### Completion report

Report: session/shard, throughput target (5), terminal findings completed, newly validated/staged findings, promoted findings, explicitly declined/quarantined findings, bootstrap owned/staged/completed/closure-backlog/unstarted/remaining workpack counts, workpacks researched, sources examined/reused/new, negative/null/conflict findings preserved, duplicate findings prevented, canonical/public changes made (or explicit reason none were legal), generated/public verification status, production verification status or exact blocker, validation status, PR/merge status, exact reason for any throughput shortfall, and the next highest-ROI unfinished work in that shard.