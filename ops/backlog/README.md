# The Hippie Scientist — Master Backlog

This directory is the canonical control board for site-quality work. `master-backlog.mjs` expands the original 15 tickets into a machine-readable 375-ticket queue covering design, UX, page templates, content, evidence, safety, SEO, internal linking, conversion, accessibility, performance, structured data/AI, analytics, automation, testing, and technical debt.

## Execution loop

`Idea → Ticket → Agent → Implementation → Automated tests → Visual/behavior QA → Merge → Measure`

Code existing on a branch is **not** completion. A ticket may move to `complete` only after the implementation is present on the canonical source path, relevant automated gates pass, rendered UI is checked on mobile and desktop when applicable, regressions are ruled out, the work is merged to `main`, and a post-merge measurement or verification note is recorded.

## Ticket ID namespace

- The master backlog owns the three-digit `THS-001` through `THS-999` namespace. The current board uses `THS-001` through `THS-375`.
- A reference such as `THS-0028` is **not** a master-backlog ticket. Parallel or external agent systems may use their own identifiers, but those identifiers must not be treated as canonical backlog IDs.
- Record external ticket-like references in `work_refs` with an explicit namespace, for example `external:THS-0028`.
- Dependencies and active claims may reference only canonical three-digit master-backlog IDs.
- If the master backlog ever needs more than 999 tickets, change/version the schema deliberately rather than silently widening the ID format.

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
10. Keep `ops/backlog/master-backlog.mjs` authoritative; chat transcripts and issue comments are secondary notes.

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
