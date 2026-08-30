# Parallel research-enrichment sessions

This directory is the coordination contract for running independent research sessions against the same enrichment backlog without duplicating work or fighting over shared files.

## Ready-to-use session lanes

Eight stable lanes are defined in `session-manifest.json`:

| Session | Worker id | Shard |
| --- | --- | ---: |
| A | `research-session-a` | 0 / 8 |
| B | `research-session-b` | 1 / 8 |
| C | `research-session-c` | 2 / 8 |
| D | `research-session-d` | 3 / 8 |
| E | `research-session-e` | 4 / 8 |
| F | `research-session-f` | 5 / 8 |
| G | `research-session-g` | 6 / 8 |
| H | `research-session-h` | 7 / 8 |

Assignment is deterministic. Pipeline jobs use `shardOf(job_id, 8)` and governed research workpacks use `shardOf(workpackId, 8)`. The function is the existing `scripts/enrichment-pipeline/lib/ids.mjs#shardOf`, so the allocation is stable across rescans, clones, and independent chat sessions.

**Do not renumber an active session.** Different shard indices are disjoint by construction, so A/B/C can research simultaneously without sharing a filesystem or a live lock.

## What a session should do

When asked to run `Session A` (substitute the requested letter):

1. Read `ops/research-sessions/session-manifest.json` and resolve the session's worker id and shard.
2. Refresh/read the current enrichment backlog and existing governed/source data before external research.
3. Bootstrap the session and inspect `closureBacklogWorkpacks` before selecting new research.
4. Treat staged-but-nonterminal work as unfinished and prioritize its review/promotion closure before brand-new work in the shard.
5. Only take pipeline jobs or workpacks assigned to that shard.
6. Reuse already-registered sources first; search externally only for remaining gaps.
7. Preserve negative, null, mixed, contradictory, and uncertainty findings. Do not cherry-pick positive evidence.
8. Research only the requested field/topic scope. Do not rewrite an entire entity opportunistically.
9. Write new findings to a **new append-only fragment** under `ops/enrichment-submissions/sessions/session-<letter-lower>/`.
10. Never edit `ops/enrichment-submissions.json` from a parallel session; it remains a legacy/read-only input.
11. Run the coordination validator before opening or merging a research PR.
12. Route findings through existing scientific/source/governance validation and then to a terminal outcome: governed canonical/public promotion, or an explicit governed non-promotion disposition.
13. Re-run session bootstrap after staging/review/promotion work. A merged staging PR does not make the workpack complete while any finding remains nonterminal.
14. Verify generated public/runtime output after canonical promotion, and verify production when deployment state is observable. Otherwise preserve the exact production blocker as `Unknown`.

For the canonical enrichment-pipeline job ledger, the equivalent local command for Session A is:

```bash
node scripts/enrichment-pipeline/cli.mjs claim \
  --worker research-session-a \
  --shard 0 --shards 8 \
  --limit 25 \
  --ignore-scope
```

Use `--ignore-scope` only for research/staging work. Production promotion still follows the repository's normal readiness, evidence, safety, and validation gates.

## Lifecycle / Definition of Done

Research staging is an intermediate state, not a terminal state.

The session bootstrap distinguishes:

- `stagedWorkpacks`: at least one research finding exists.
- `closureBacklogWorkpacks`: at least one finding is still nonterminal.
- `completedWorkpacks`: every staged finding has a terminal disposition.
- `unstartedWorkpacks`: no staged findings yet.
- `remainingWorkpacks`: all workpacks not terminally complete, including staged closure debt.

`draft_submission`, `ready_for_review`, and `approved_for_rollup` are nonterminal. A finding becomes terminal when it is promoted through governed handling or explicitly ends as rejected, deprecated, inactive, quarantined, or another governed not-promoted disposition. The bootstrap deliberately sorts staged closure debt ahead of unstarted research so the system cannot improve its research throughput while silently accumulating an ever-larger promotion backlog.

## Append-only fragment format

Each batch gets its own file, for example:

`ops/enrichment-submissions/sessions/session-a/2026-08-27-batch-001.json`

```json
{
  "fragmentVersion": 1,
  "sessionId": "A",
  "shard": 0,
  "batchId": "2026-08-27-batch-001",
  "createdAt": "2026-08-28T01:00:00.000Z",
  "submissions": [
    {
      "submissionId": "sub_example-evidence-signal",
      "authoringPackId": "ap_example",
      "workpackId": "wp_example",
      "entityType": "herb",
      "entitySlug": "example",
      "sourceId": "src_example",
      "topicType": "supported_use",
      "claimType": "efficacy_signal",
      "evidenceClass": "human-clinical",
      "findingTextShort": "A concise source-grounded finding.",
      "findingTextNormalized": "A source-grounded normalized finding with the population, design, uncertainty, and scope preserved.",
      "reviewStatus": "draft_submission",
      "active": true
    }
  ]
}
```

The fragment's workpacks must all belong to that session's shard. A batch may contain multiple findings from the same source/workpack when they represent distinct governed topic/claim types.

## Collision prevention

The coordination validator fails when a fragment:

- uses an unknown/disabled session or wrong shard;
- is stored under another session's directory;
- contains a workpack assigned to another shard;
- reuses an existing `submissionId`;
- duplicates an existing legacy/parallel finding with the same target, source, topic, claim type, and normalized text;
- contains duplicate findings inside the parallel fragment set.

This makes the old single-file merge-conflict pattern unnecessary. Parallel sessions only add their own files; reconciliation reads all fragments as one candidate stream.

## Scaling beyond H

Do **not** casually change `shardCount` while A-H work is in flight: changing the modulus reassigns existing work. To scale past eight active lanes, finish/drain the current generation and deliberately create a new manifest generation with a new shard count and migration record.

Eight concurrent research sessions is intentionally the first stable ceiling: it is enough to saturate the current backlog while keeping review/reconciliation throughput manageable.
