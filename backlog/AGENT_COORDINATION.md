# Multi-Agent Backlog Coordination

This file defines how specialist agents share The Hippie Scientist backlog without duplicating work or creating avoidable merge conflicts.

## Capacity model

The swarm has exactly **three implementation workstreams**.

| Workstream | Purpose |
|---|---|
| Discovery / SEO | Search discovery, information architecture, crawl/indexation, AI citation protection, discovery opportunities |
| Revenue / Conversion | Conversion, affiliate UX, email capture, analytics, distribution and monetization experiments |
| Authority / Content | Evidence, research enrichment, safety, canonical content quality and scientific authority |

These three workstreams are the **implementation-capacity model**.

### Hard WIP rule

- Maximum **3 active implementation items** total.
- Maximum **1 active implementation item per workstream**.
- There is no fourth implementation slot.
- There is no fifth implementation slot.
- A specialty role does not create additional implementation capacity.

This distinction is intentional:

- **Workstreams** determine how many implementation items can run simultaneously.
- **Specialty roles** determine expertise, ownership, review, or supporting responsibility.
- **Coordinator** is orchestration and does not consume an implementation slot.

## Specialty roles

Use persistent specialty roles for expertise rather than treating each specialty as an additional implementation lane.

| Role | Primary responsibility |
|---|---|
| Coordinator | Queue health, dependencies, ownership, collision prevention, reprioritization, blocker triage, fresh demand-signal allocation |
| Design | Visual system, layouts, typography, responsive UX, UI polish |
| Engineering | Components, architecture, data plumbing, performance, build/runtime systems |
| Evidence | Evidence grades, study quality, claim support, citations, methodology; prioritize citation-adjacent evidence gaps when scientifically eligible |
| Safety | Interactions, contraindications, warnings, safety presentation and validation; safety gates always outrank demand signals |
| SEO | Metadata, schema, internal linking, crawl/indexation, search architecture, AI-citation winner protection and cluster expansion |
| QA | Automated tests, visual regression, accessibility, release verification |
| Growth | Conversion, email capture, affiliate UX, analytics, distribution experiments; monetize citation winners only downstream of answer/evidence/safety |

The master backlog already contains an `Agent Role` / specialty assignment for each ticket. That field defines the required expertise or ownership dimension. It does **not** create another implementation slot. `backlog/status.csv` records the live human/agent owner.

A single implementation workstream may involve multiple specialty roles, but it still consumes only one implementation slot and has exactly one implementation owner.

## Coordinator responsibilities

The coordinator normally does not implement feature tickets. It manages flow.

Before agents begin a work cycle, the coordinator should:

1. Materialize the backlog with `python backlog/materialize_backlog.py`.
2. Read `config/search-conversion-priorities.json` plus `config/ai-citation-swarm-priorities.json` when present and fresh. Search impressions/clicks/CTR/position are the primary discovery signal; AI citations are a bounded authority/confidence overlay and never traffic or revenue proof.
3. Identify the highest-priority `Ready` tickets with satisfied dependencies.
4. Exclude tickets that overlap active work on the same foundational component, data model, route family, citation winner, cluster hub, or migration.
5. Fill only the available implementation workstream slots.
6. Allow the appropriate specialist to claim the highest-priority eligible ticket within each available workstream.
7. Keep the number of simultaneous foundational edits small.
8. Re-rank later work when analytics, Search Console, fresh AI-citation telemetry, revenue, incidents, or completed dependencies materially change expected ROI.
9. Triage `Blocked` tickets and either resolve the dependency, create a prerequisite ticket, or leave the item blocked with a clear reason.

## AI citation feedback loop

Fresh page-level AI citation telemetry is an allowed prioritization input under the existing backlog formula and WIP system. The current operating standard is [`docs/AI-CITATION-GROWTH-LOOP.md`](../docs/AI-CITATION-GROWTH-LOOP.md), with the latest derived non-raw signals in `config/ai-citation-swarm-priorities.json`.

For discretionary Discovery/SEO and research-enrichment selection, target roughly:

- **65% citation-adjacent capacity** for protecting proven winners, filling adjacent evidence/safety gaps, strengthening cited clusters and hubs, fixing canonical/intent overlap, and improving bounded post-answer journeys;
- **35% exploration floor** for uncited topics, new research, emerging demand, safety gaps, and novel opportunities.

This is a portfolio allocation target, not a second score formula. It never overrides the three-workstream WIP cap, dependencies, canonical ownership, scientific review, safety, accessibility, release gates, or hard blockers.

Citation signals may update the existing scoring inputs—especially Traffic Potential, Strategic Leverage, and Confidence—when the snapshot is fresh and the connection to the ticket is explicit. Do not add a hidden citation multiplier to backlog scores.

When a page is a high-citation winner, prefer additive/reversible work. A broad rewrite, route change, title/H1/canonical change, or consolidation requires a documented intent, migration/rollback boundary, and fresh measurement plan.


## Search conversion feedback loop

The current operating standard is [`docs/SEARCH-CONVERSION-LOOP.md`](../docs/SEARCH-CONVERSION-LOOP.md).

When page-level search data is available, Discovery / SEO should rank work in this order:

1. meaningful-impression pages with CTR below the expected curve for their observed position;
2. pages in positions 4-15 with meaningful impressions;
3. high-citation winners that also have measurable search upside;
4. substantive evidence/content refreshes supported by observed query gaps;
5. net-new pages only for a genuinely distinct intent after canonical and cannibalization checks.

Pure citation growth does not earn additional discretionary capacity by itself. A citation-only winner with no measured search opportunity is normally a **defend / observe** asset, not a rewrite target.

Run `npm run seo:conversion-priorities` after the ordinary search-opportunity report. The conversion report caps the citation-derived score boost at 35%, so citation authority can break ties or strengthen confidence but cannot manufacture a search opportunity.

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
