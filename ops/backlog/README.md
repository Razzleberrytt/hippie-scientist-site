# The Hippie Scientist — Master Backlog

This directory is the canonical control board for site-quality work.

## Execution loop

`Idea → Ticket → Agent → Implementation → Automated tests → Visual/behavior QA → Merge → Measure`

Code existing on a branch is **not** completion. A ticket may move to `complete` only after the implementation is present on the canonical source path, relevant automated gates pass, rendered UI is checked on mobile and desktop when applicable, regressions are ruled out, the work is merged to `main`, and a post-merge measurement or verification note is recorded.

## Status model

- `backlog` — defined, not selected.
- `verify_existing` — the capability appears to exist already, but it has not cleared the full completion gate.
- `ready` — dependencies are complete and the ticket is ready to claim.
- `in_progress` — an agent is actively implementing or verifying it.
- `blocked` — an explicit blocker prevents progress.
- `qa` — implementation is on a branch/PR and is undergoing automated and visual/behavior QA.
- `merged_observing` — merged successfully; the measurement window remains open.
- `complete` — every gate, including measurement, is evidenced.

## Agent rules

1. Read the current implementation before changing it. Do not rewrite working systems merely to create activity.
2. Prefer the smallest shared primitive or source-of-truth fix that satisfies the ticket.
3. Preserve evidence, safety, canonical-route, visibility, and monetization policy boundaries.
4. Add or strengthen a regression check for every meaningful invariant introduced or repaired.
5. Record the affected routes and validation commands in the PR.
6. For rendered UI, verify at least a narrow mobile and a desktop viewport plus both themes when theme styling changes.
7. Do not merge red CI.
8. Do not mark a merged ticket complete until the result has been measured or explicitly post-merge verified.
9. If a ticket exposes a prerequisite, add the prerequisite as a dependency rather than silently expanding scope.
10. Keep `ops/backlog/master-backlog.json` authoritative; chat transcripts and issue comments are secondary notes.

## Commands

Validate the backlog:

```bash
node scripts/ci/validate-master-backlog.mjs
```

Select the highest-priority unblocked work:

```bash
node scripts/backlog/next-ticket.mjs
```

Filter selection by area and return more than one candidate:

```bash
node scripts/backlog/next-ticket.mjs --area Evidence --limit 5
```

The selector never changes ticket state. Claiming a ticket remains an explicit repository edit so the ownership transition is reviewable.
