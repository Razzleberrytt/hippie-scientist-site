Read `AGENTS.md`, `ops/codex-queue.yaml`, and `$run-enrichment-step`.

Your job is to execute exactly one queue step: the step whose `id` matches the top-level `current` field in `ops/codex-queue.yaml`.

Rules:
- Execute only the current step.
- Follow the queue protocol in `AGENTS.md`.
- Keep the diff narrow.
- Do not skip ahead.
- Do not merge anything.
- If blocked, update the queue step to `blocked`, add a concise blocker note, and stop.
- If the step succeeds, mark it `done`, advance `current` to the next queued step, and set that next step to `ready`.
- If there is no current step or no remaining queued step, make no code changes and write a short “queue complete” summary.

When deciding what to do, rely on:
1. the current queue step,
2. the repository files referenced by that step,
3. the standing rules in `AGENTS.md`.

At the end of the run, provide:
1. changed-file list
2. key diffs
3. commands run
4. verification results
5. risks or follow-ups
6. queue update made
