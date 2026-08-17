# Multi-Agent Backlog Coordination

This file defines how specialist agents share The Hippie Scientist backlog without duplicating work or creating avoidable merge conflicts.

## Team model

Use a small set of persistent specialty lanes rather than manually assigning all 1,000 tickets one by one.

| Lane | Primary responsibility |
|---|---|
| Coordinator | Queue health, dependencies, ownership, collision prevention, reprioritization, blocker triage |
| Design | Visual system, layouts, typography, responsive UX, UI polish |
| Engineering | Components, architecture, data plumbing, performance, build/runtime systems |
| Evidence | Evidence grades, study quality, claim support, citations, methodology |
| Safety | Interactions, contraindications, warnings, safety presentation and validation |
| SEO | Metadata, schema, internal linking, crawl/indexation, search architecture |
| QA | Automated tests, visual regression, accessibility, release verification |
| Growth | Conversion, email capture, affiliate UX, analytics, distribution experiments |

The master backlog already contains an `Agent Role` / specialty assignment for each ticket. That field defines the lane. `backlog/status.csv` records the live human/agent owner.

## Coordinator responsibilities

The coordinator normally does not implement feature tickets. It manages flow.

Before agents begin a work cycle, the coordinator should:

1. Materialize the backlog with `python backlog/materialize_backlog.py`.
2. Identify the highest-priority `Ready` tickets with satisfied dependencies.
3. Exclude tickets that overlap active work on the same foundational component, data model, route family, or migration.
4. Allow each specialist to claim the highest-priority eligible ticket in its lane.
5. Keep the number of simultaneous foundational edits small.
6. Re-rank later work when analytics, Search Console, revenue, incidents, or completed dependencies materially change expected ROI.
7. Triage `Blocked` tickets and either resolve the dependency, create a prerequisite ticket, or leave the item blocked with a clear reason.

## Claim protocol

An agent must claim a ticket before editing implementation files.

A claim is a row in `backlog/status.csv` with:

- `ID`
- `Status=In Progress`
- `Owner=<agent identifier>`
- `Claimed At=<ISO-8601 timestamp>`
- `Branch=<working branch>`
- empty or current `PR / Commit`
- empty `Blocker`
- optional `Proof / Notes`

Example:

```csv
THS-0042,In Progress,design-agent,2026-08-16T21:15:00-04:00,ths/THS-0042-herb-card,,,
```

After changing `status.csv`, commit or otherwise publish the claim before substantive implementation begins. An agent that sees an existing active owner must not start the same ticket.

## Ticket selection rule

Each specialist uses this order:

1. Its own specialty lane.
2. `Ready` status only.
3. Dependencies satisfied.
4. Highest priority first: P0, then P1, P2, P3.
5. Within the same priority, prefer higher expected ROI and lower collision risk.
6. Never select a ticket already owned by another active agent.

Do not execute ticket IDs sequentially merely because they are numbered sequentially.

## One-owner rule

Every active ticket has exactly one implementation owner.

Other agents may review or supply evidence, but they do not independently edit the same ticket scope unless the owner explicitly hands it off.

For coupled cross-specialty work, choose one owner and record reviewers or supporting work in `Proof / Notes` rather than creating competing implementations.

## Collision rules

Do not run parallel implementation tickets that both materially modify the same:

- shared design-system primitive;
- canonical herb or compound template;
- evidence-grade model;
- safety/interactions model;
- global routing or metadata layer;
- schema/indexation infrastructure;
- migration;
- CI/build configuration;
- generated dataset source.

The coordinator may serialize related tickets even when both are technically `Ready`.

## Recommended starting concurrency

Start with roughly four implementation lanes active at once:

- Design
- Engineering
- Evidence/Safety
- SEO/QA

Growth work can run when it does not depend on unfinished measurement or foundational UX work.

Increase concurrency only after the claim/merge process is proving stable.

## Branch conventions

Single ticket:

`ths/THS-####-short-description`

Tightly coupled micro-batch:

`ths/THS-####-####-short-description`

A branch belongs to one active implementation owner. Do not have multiple agents force-push the same working branch.

## State transitions

Normal lifecycle:

`Ready → In Progress → In Review → Done`

Exceptional lifecycle:

`Ready → In Progress → Blocked`

A ticket may return from `Blocked` to `Ready` only when its recorded blocker is resolved.

When moving to `In Review`, retain Owner/Claimed At/Branch and record the PR.

When moving to `Done`, record:

- final PR or commit;
- tests/QA proof;
- meaningful before/after evidence where applicable;
- any follow-up ticket IDs created.

## Blocker protocol

A `Blocked` status requires the `Blocker` column to explain the actual reason.

Good examples:

- `Depends on THS-0120 canonical evidence enum migration.`
- `Conflicts with active THS-0031 navigation refactor owned by design-agent.`
- `Safety conclusion requires editorial review; current sources disagree.`

Bad examples:

- `Hard`
- `Didn't work`
- `Need help`

## Merge protocol

Before merge:

1. Sync/rebase with the target branch.
2. Re-check that no other merged ticket invalidated the acceptance criteria.
3. Run all applicable tests and QA gates.
4. Verify the PR contains only the intended ticket(s) plus necessary supporting changes.
5. Update the ticket to `In Review` with the PR reference.

After successful merge/deploy where applicable:

1. Set `Status=Done`.
2. Record final PR/commit.
3. Record proof.
4. Clear `Blocker`.
5. Sync before claiming another ticket.

## Stale claim recovery

A coordinator may release a stale claim only after confirming no active implementation is still using the branch.

When releasing a claim:

- set the ticket back to `Ready` if safe;
- clear `Owner`, `Claimed At`, and `Branch`;
- retain a short note explaining why the claim was released.

Do not silently take over another agent's active branch.

## Source of truth

- Immutable ticket definitions: `backlog/master_backlog.csv.xz.b64`
- Mutable execution state: `backlog/status.csv`
- Generated readable view: `backlog/master_backlog.csv` via `python backlog/materialize_backlog.py`
- Optional human XLSX dashboard: generated separately when needed; it is not the repository execution authority
- Execution rules: `BACKLOG_IMPLEMENTATION_PLAYBOOK.md`
- One-command launcher: `BEGIN_BACKLOG_PROCESS.md`
- Multi-agent ownership rules: this file

Agents update `status.csv`; they do not edit the compressed ticket-definition seed.
