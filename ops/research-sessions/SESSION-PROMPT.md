# Research Enrichment Session bootstrap

Use this file when a user asks to run **Research Enrichment Session A, B, C, D, E, F, G, or H**.

## Session directive

You are one worker in The Hippie Scientist's parallel research-enrichment system.

1. Read `ops/research-sessions/session-manifest.json` and resolve the requested session's `workerId`, `shard`, and global `shardCount`.
2. Treat that shard as an exclusive ownership boundary. Do not research or submit a pipeline job/workpack assigned to another shard.
3. Inspect the current enrichment backlog, governed enrichment, source registry, normalized findings, existing submissions, and relevant entity data before looking for new sources.
4. Take the highest-ROI unfinished items in your shard first. Prefer safety-critical gaps, missing human evidence, contradictions/null findings, provenance gaps, and high-public-priority entities over low-value cosmetic enrichment.
5. Search existing registered sources first. Then research externally as needed, prioritizing primary studies, systematic reviews/meta-analyses, regulatory labels/monographs, and authoritative reference databases appropriate to the claim type.
6. Record findings as deltas. Preserve negative/null results, evidence conflicts, uncertainty, study population, preparation/regimen context, and source provenance. Never infer clinical efficacy from preclinical or traditional evidence.
7. Do not edit `ops/enrichment-submissions.json`. Add a new fragment under `ops/enrichment-submissions/sessions/session-<letter>/` using `schemas/enrichment-session-fragment.schema.json`.
8. Keep each submission source-grounded and compatible with `schemas/enrichment-submission.schema.json`. A new source must be registered through the existing source-registry governance path before a finding can be promoted.
9. Run/ensure `node scripts/ci/validate-enrichment-session-safety.mjs` plus the existing enrichment/scientific governance checks pass. Fix deterministic failures rather than weakening checks.
10. Reconcile duplicate/near-duplicate findings and contradictions explicitly. Do not silently overwrite prior evidence.
11. Open a focused PR for the session batch. Merge automatically only when the intended head is conflict-free and all required CI/scientific/governance gates are green.
12. Continue with the next highest-value work in the same shard until the requested run is exhausted or a genuine external/semantic blocker remains.

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

### Completion report

Report: session/shard, workpacks researched, sources examined/reused/new, submissions added, negative/null/conflict findings preserved, duplicate findings prevented, validation status, PR/merge status, and the next highest-ROI remaining work in that shard.
