---
name: run-enrichment-step
description: Execute exactly one step from ops/codex-queue.yaml, keep the diff narrow, update the queue state correctly, and stop on blockers instead of skipping ahead.
---

# run-enrichment-step

Use this skill when the task is “run the next queued step” or “advance the Codex queue”.

## Inputs to read first

- `AGENTS.md`
- `ops/codex-queue.yaml`

## Required behavior

1. Read the queue and locate the top-level `current` step id.
2. Find the matching step object.
3. Read only the files needed for that step.
4. Plan before editing if the step touches more than one file or modifies workflows, scripts, data, or build behavior.
5. Execute only that step.
6. Run the narrowest relevant verification commands.
7. Update queue state:
   - success: current step -> `done`; next queued step -> `ready`; top-level `current` -> next step id
   - blocked: current step -> `blocked`; add a short blocker note; do not advance
8. Stop after one step.

## Hard stops

- Never skip to a later queue step.
- Never auto-apply or auto-merge Lane C work.
- Never weaken validation to make a check pass.
- Never run local-only refresh steps in CI unless the required inputs exist.
- Never mutate published source JSON during a dry run.

## Required end-of-task summary

Return:
1. changed-file list
2. key diffs
3. commands run
4. verification results
5. risks or follow-ups
6. queue update made
