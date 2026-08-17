# Backlog

This directory is the repository-facing execution system for The Hippie Scientist's 1,000-ticket improvement backlog.

## Files

- `master_backlog.csv.xz.b64` — immutable compressed/base64 ticket-definition seed for all 1,000 tickets.
- `status.csv` — **mutable Git-friendly source of truth for execution state and ownership**.
- `materialize_backlog.py` — combines the immutable seed + `status.csv` into a readable `master_backlog.csv`.
- `AGENT_COORDINATION.md` — specialist lanes, claiming, ownership, collision prevention, blockers, and merge protocol.
- `../BACKLOG_IMPLEMENTATION_PLAYBOOK.md` — implementation contract for any agent working a THS ticket.

A separate XLSX dashboard can be regenerated periodically for human review; agents do not need it for routine execution.

## Generate the readable backlog

```bash
python backlog/materialize_backlog.py
```

This writes `backlog/master_backlog.csv`. The generated file is a working view, not the mutable state store.

## Team model

Do not manually assign all 1,000 tickets one by one. Tickets already carry a specialty role in the master backlog. Run persistent lanes such as:

- Coordinator
- Design
- Engineering
- Evidence
- Safety
- SEO
- QA
- Growth

The coordinator manages queue health, dependencies, collision prevention, stale claims, blockers, and reprioritization. Specialist agents claim the highest-priority eligible `Ready` ticket in their lane.

See `AGENT_COORDINATION.md` for the full protocol.

## Claim before implementation

Before editing implementation files, the agent must claim the ticket in `status.csv`.

Required active-claim fields:

- `ID`
- `Status=In Progress`
- `Owner`
- `Claimed At`
- `Branch`

Example:

```csv
THS-0042,In Progress,design-agent,2026-08-16T21:15:00-04:00,ths/THS-0042-herb-card,,,
```

An agent must not start a ticket already actively owned by another agent.

## Agent workflow

1. Read `../BACKLOG_IMPLEMENTATION_PLAYBOOK.md` and `AGENT_COORDINATION.md`.
2. Sync/rebase with the target branch.
3. Materialize the backlog.
4. Select the highest-priority `Ready` ticket in the agent's specialty lane whose dependencies are satisfied and whose scope does not collide with active work.
5. Claim it in `status.csv` and publish the claim.
6. Inspect the existing implementation before changing anything.
7. Implement only the scoped ticket.
8. Run the relevant automated checks and QA.
9. Move the ticket to `In Review` and record the PR.
10. Merge only after all applicable acceptance/QA gates pass.
11. Update `status.csv` to `Done` with the final PR/commit and proof.
12. Sync again before claiming the next ticket.

## Mutable execution fields

`status.csv` records:

- `Status`
- `Owner`
- `Claimed At`
- `Branch`
- `PR / Commit`
- `Blocker`
- `Proof / Notes`

`Blocked` tickets require a concrete blocker explanation.

## Source-of-truth rule

Ticket definitions live in the immutable seed. Live execution state lives in `status.csv`.

The readable CSV is regenerated from the seed + status ledger instead of being used as the mutable authority. This keeps ordinary agent updates small and reviewable in Git.

## Done means done

Do not mark a ticket `Done` merely because code was written. Applicable acceptance criteria, automated tests, visual/mobile/accessibility/data/SEO QA, merge/deploy, and proof must be complete.

## Concurrency

Multiple agents may work in parallel only when their tickets do not materially overlap the same foundational component, canonical template, data model, route family, migration, build configuration, or generated source.

Start with roughly four implementation lanes active at once and increase concurrency only after the claim/merge process is stable.
