# Multi-Agent Backlog Coordination

This file defines how specialist agents share The Hippie Scientist backlog without duplicating work or creating avoidable merge conflicts.

## Team model

Use a small set of persistent specialty lanes rather than manually assigning all 1,000 tickets one by one.

| Lane | Primary responsibility |
|---|---|
| Coordinator | Queue health, dependencies, ownership, collision prevention, reprioritization, blocker triage, fresh demand-signal allocation |
| Design | Visual system, layouts, typography, responsive UX, UI polish |
| Engineering | Components, architecture, data plumbing, performance, build/runtime systems |
| Evidence | Evidence grades, study quality, claim support, citations, methodology; prioritize citation-adjacent evidence gaps when scientifically eligible |
| Safety | Interactions, contraindications, warnings, safety presentation and validation; safety gates always outrank demand signals |
| SEO | Metadata, schema, internal linking, crawl/indexation, search architecture, AI-citation winner protection and cluster expansion |
| QA | Automated tests, visual regression, accessibility, release verification |
| Growth | Conversion, email capture, affiliate UX, analytics, distribution experiments; monetize citation winners only downstream of answer/evidence/safety |

The master backlog already contains an `Agent Role` / specialty assignment for each ticket. That field defines the lane. `backlog/status.csv` records the live human/agent owner.

## Coordinator responsibilities

The coordinator normally does not implement feature tickets. It manages flow.

Before agents begin a work cycle, the coordinator should:

1. Materialize the backlog with `python backlog/materialize_backlog.py`.
2. Read `config/ai-citation-swarm-priorities.json` when present and fresh; treat it as a bounded first-party demand/authority input, never as traffic or revenue proof.
3. Identify the highest-priority `Ready` tickets with satisfied dependencies.
4. Exclude tickets that overlap active work on the same foundational component, data model, route family, citation winner, cluster hub, or migration.
5. Allow each specialist to claim the highest-priority eligible ticket in its lane.
6. Keep the number of simultaneous foundational edits small.
7. Re-rank later work when analytics, Search Console, fresh AI-citation telemetry, revenue, incidents, or completed dependencies materially change expected ROI.
8. Triage `Blocked` tickets and either resolve the dependency, create a prerequisite ticket, or leave the item blocked with a clear reason.

## AI citation feedback loop

Fresh page-level AI citation telemetry is an allowed prioritization input under the existing backlog formula and WIP system. The current operating standard is [`docs/AI-CITATION-GROWTH-LOOP.md`](../docs/AI-CITATION-GROWTH-LOOP.md), with the latest derived non-raw signals in `config/ai-citation-swarm-priorities.json`.

For discretionary Discovery/SEO and research-enrichment selection, target roughly:

- **65% citation-adjacent capacity** for protecting proven winners, filling adjacent evidence/safety gaps, strengthening cited clusters and hubs, fixing canonical/intent overlap, and improving bounded post-answer journeys;
- **35% exploration floor** for uncited topics, new research, emerging demand, safety gaps, and novel opportunities.

This is a portfolio allocation target, not a second score formula. It never overrides the three-workstream WIP cap, dependencies, canonical ownership, scientific review, safety, accessibility, release gates, or hard blockers.

Citation signals may update the existing scoring inputs—especially Traffic Potential, Strategic Leverage, and Confidence—when the snapshot is fresh and the connection to the ticket is explicit. Do not add a hidden citation multiplier to backlog scores.

When a page is a high-citation winner, prefer additive/reversible work. A broad rewrite, route change, title/H1/canonical change, or consolidation requires a documented intent, migration/rollback boundary, and fresh measurement plan.

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
5. Within the same priority, prefer higher expected ROI and lower collision risk; fresh page-level AI citation evidence may strengthen the existing ROI case when the ticket is directly citation-adjacent.
6. Preserve the 35% exploration floor over rolling discretionary work rather than allowing winner-chasing to consume all discovery capacity.
7. Never select a ticket already owned by another active agent.

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
- high-citation winner or canonical cluster hub;
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
- AI citation execution standard: `docs/AI-CITATION-GROWTH-LOOP.md`
- Derived citation swarm signals: `config/ai-citation-swarm-priorities.json`
- Execution rules: `BACKLOG_IMPLEMENTATION_PLAYBOOK.md`
- One-command launcher: `BEGIN_BACKLOG_PROCESS.md`
- Multi-agent ownership rules: this file

Agents update `status.csv`; they do not edit the compressed ticket-definition seed.
