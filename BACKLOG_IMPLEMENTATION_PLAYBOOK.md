# The Hippie Scientist — 1,000-Ticket Backlog Implementation Playbook

## Purpose

This document is the execution contract for agents working through the `THS-0001` through `THS-1000` backlog.

The system is designed for several specialist agents working in parallel without duplicating tickets, overwriting each other, or weakening evidence/safety standards.

Read this file **and** `backlog/AGENT_COORDINATION.md` before claiming work.

## Repository backlog files

- `backlog/master_backlog.csv.zlib` — immutable definition seed for the 1,000 tickets.
- `backlog/status.csv` — mutable source of truth for status, ownership, branch, blocker, PR/commit, and proof.
- `backlog/materialize_backlog.py` — generates a readable `backlog/master_backlog.csv` from the seed + status ledger.
- `backlog/master_backlog.xlsx` — human dashboard/reference snapshot.
- `backlog/AGENT_COORDINATION.md` — claiming, specialty lanes, collision prevention, stale claims, and coordinator rules.

Generate the current readable backlog with:

```bash
python backlog/materialize_backlog.py
```

Agents must never edit the compressed ticket-definition seed to change execution state.

## Team model

Do not manually assign all 1,000 tickets one by one. Each ticket already has a specialty lane in the master backlog.

Recommended lanes:

| Lane | Primary responsibility |
|---|---|
| Coordinator | Queue health, dependencies, claims, collision prevention, blocker triage, reprioritization |
| Design | Visual system, layout, typography, responsive UX, UI polish |
| Engineering | Components, architecture, data plumbing, performance, build/runtime systems |
| Evidence | Evidence grading, study quality, claims, citations, methodology |
| Safety | Interactions, contraindications, warnings, safety validation |
| SEO | Metadata, schema, internal linking, crawl/indexation, search architecture |
| QA | Automated tests, visual regression, accessibility, release verification |
| Growth | Conversion, email, affiliate UX, analytics, distribution experiments |

The coordinator manages flow. Specialists implement tickets.

## Priority system

- **P0 Critical:** foundations, health/safety/evidence integrity, indexation, major UX, regression prevention.
- **P1 High:** strong expected value after P0 foundations/blockers.
- **P2 Medium:** worthwhile optimization; order increasingly by data.
- **P3 Later:** valid work that should not displace higher-return tasks.

Use ROI score only as a tie-breaker after priority, dependencies, safety, and collision risk.

## Status system

Normal lifecycle:

`Ready → In Progress → In Review → Done`

Alternative states:

- `Not Started` — defined but not yet eligible.
- `Blocked` — a real dependency/conflict/review requirement prevents safe execution.
- `Won't Do` — intentionally rejected/superseded; reason must be recorded.

**Done never means “code was written.”** Done means implementation, applicable tests/QA, merge/deploy where relevant, and proof are complete.

## Claim-before-work rule

Before changing implementation files, an agent must claim the ticket in `backlog/status.csv`.

An active claim records:

- `ID`
- `Status=In Progress`
- `Owner`
- `Claimed At` (ISO-8601 timestamp)
- `Branch`
- optional `PR / Commit`
- empty `Blocker`
- optional `Proof / Notes`

Example:

```csv
THS-0042,In Progress,design-agent,2026-08-16T21:15:00-04:00,ths/THS-0042-herb-card,,,
```

Publish the claim before substantive implementation begins. If another owner already has an active claim, do not start the same ticket.

## Ticket selection rule

A specialist selects work in this order:

1. Ticket belongs to that specialist's lane.
2. Status is `Ready`.
3. Dependencies are satisfied.
4. No active ticket materially overlaps the same foundational system/files.
5. Highest priority first: P0, P1, P2, P3.
6. Within a priority, prefer higher expected ROI and lower collision risk.

Do **not** execute `THS-0001 → THS-1000` blindly because IDs are sequential.

## Standard agent loop

1. **Sync** with the target branch.
2. **Read** this playbook and `backlog/AGENT_COORDINATION.md`.
3. **Materialize** the backlog.
4. **Select** the highest-priority eligible ticket in your lane.
5. **Claim** it in `backlog/status.csv` and publish the claim.
6. **Inspect** existing code, data, content, styles, tests, and documentation before changing anything.
7. **Scope** work to the ticket; do not absorb unrelated cleanup.
8. **Implement** the smallest durable solution, preferring shared components/templates/data rules when appropriate.
9. **Test** and add regression coverage appropriate to risk.
10. **QA** applicable desktop/mobile/accessibility/data/evidence/SEO states.
11. **Move to In Review** and record the PR.
12. **Merge** only after applicable gates pass.
13. **Mark Done** in `status.csv`, recording final PR/commit and proof.
14. **Sync again** before claiming the next ticket.

## Coordinator loop

The coordinator normally does not implement feature tickets.

1. Materialize the backlog.
2. Review active claims and blocked work.
3. Verify dependencies for candidate `Ready` tickets.
4. Detect overlapping foundational work and serialize it when needed.
5. Allow each specialist to claim its highest-priority eligible ticket.
6. Resolve/re-route blockers and stale claims.
7. Reprioritize later work when Search Console, analytics, revenue, incidents, completed dependencies, or architecture changes materially alter ROI.
8. Keep concurrency intentionally limited until the process is stable.

Recommended starting concurrency is roughly four implementation lanes at once:

- Design
- Engineering
- Evidence/Safety
- SEO/QA

Growth can run concurrently when it is not blocked by unfinished measurement/foundational UX work.

## One-owner rule

Every active ticket has exactly one implementation owner.

Other agents may review or provide specialty input, but they must not independently implement competing versions of the same ticket.

For cross-specialty work, choose one owner and record supporting reviewers/work in `Proof / Notes`.

## Collision rules

Do not run parallel tickets that both materially change the same:

- shared design primitive;
- canonical herb/compound template;
- evidence-grade model;
- safety/interactions model;
- global routing/metadata layer;
- schema/indexation infrastructure;
- migration;
- CI/build configuration;
- generated dataset source.

The coordinator may serialize tickets even when both are otherwise `Ready`.

## Branch and commit convention

Single ticket:

`ths/THS-####-short-description`

Tightly coupled micro-batch:

`ths/THS-####-####-short-description`

Recommended commit prefix:

`THS-####:`

A working branch belongs to one implementation owner. Do not have multiple agents force-push the same branch.

## Batch size

Default to **1–5 closely related tickets per agent**, but prefer **one ticket / one PR** for high-risk work including:

- evidence grading;
- safety/interactions;
- data migrations;
- technical SEO/indexation rules;
- privacy/security;
- architecture;
- high-risk affiliate/editorial changes.

A micro-batch may share a PR only when splitting would create a broken intermediate state. Record every included ticket ID.

## Definition of Ready

A ticket is `Ready` only when:

- required dependencies are complete or verified unnecessary;
- relevant code/content/data can be located;
- task does not conflict with a newer architecture decision;
- acceptance criteria are testable;
- required review path exists for high-risk medical/evidence/safety work;
- no active claim overlaps the same foundational scope.

## Definition of Done

A ticket is `Done` only when all applicable gates pass:

- implementation complete;
- lint/type/build checks pass;
- relevant automated tests pass;
- regression coverage added where recurrence is plausible;
- desktop QA complete for visual changes;
- mobile QA complete for visual changes;
- keyboard/accessibility QA complete for interactive changes where relevant;
- evidence/safety changes tested with positive and negative fixtures;
- SEO changes inspected in rendered HTML;
- schema changes validate;
- analytics events fire once and contain no sensitive data;
- no known regression remains;
- PR/commit recorded;
- proof/notes recorded;
- merged/deployed where applicable.

## Evidence and medical-safety guardrails

The site is evidence-first. Agents must not trade accuracy for conversion, SEO, or visual simplicity.

1. Human evidence must remain visibly distinct from mechanism, animal, or in-vitro evidence.
2. A mechanism cannot be rewritten as a proven human outcome.
3. Evidence grades may change only under canonical grading rules.
4. Safety severity and evidence strength are separate concepts.
5. Unknown interaction data must never be presented as proof of safety.
6. Avoid/Insufficient must not be softened into positive marketing language.
7. Do not automatically rewrite medical conclusions solely because a new paper/guideline/regulatory page appears.
8. Material evidence or safety changes require review before publication.
9. Affiliate value must never determine evidence grade, scientific conclusions, or safety wording.
10. If a ticket could materially alter a health conclusion and expected behavior is unclear, mark it `Blocked` with a concrete explanation.

## Design rules

- Establish/reuse design tokens rather than multiplying one-off values.
- Reuse shared components before creating variants.
- Prefer one canonical pattern per content type.
- Test long titles, missing fields, dense warnings, and unusually large evidence/reference sections.
- Check major visual changes on mobile and desktop.
- Never hide meaningful safety/evidence information merely to make the page prettier.

## Content rules

- Remove filler before adding words.
- Put the answer/verdict early when evidence allows it.
- Keep uncertainty visible.
- Use plain English without deleting scientific nuance.
- Do not imply endorsement because an ingredient is popular.
- Keep commercial content editorially separate from evidence conclusions.
- Major claims must remain traceable to sources.

## SEO rules

- Search optimization cannot introduce weaker or more sensational medical claims.
- Do not mass-generate near-duplicate pages to chase keywords.
- Do not index internal search/filter/utility pages without an explicit safe strategy.
- Technical SEO tickets are not complete until representative rendered HTML is inspected.
- For indexation changes, verify sitemap, canonical, robots, status code, and internal linking together.

## Blocker / stop conditions

Stop and mark the ticket `Blocked` when:

- requirements conflict;
- ticket overlaps another active agent's foundational work;
- migration can cause irreversible data loss;
- evidence/safety conclusion is ambiguous;
- tests fail for an unrelated reason that cannot safely be isolated;
- live data model materially differs from ticket assumptions;
- implementation would require an undocumented architectural rewrite;
- secrets, personal data, or sensitive analytics could be exposed.

`Blocked` requires a concrete `Blocker` entry. Do not guess.

## Proof expectations

Useful proof includes:

- before/after screenshot path or PR attachment;
- exact tests/check commands run;
- representative routes checked;
- validation fixtures added;
- Lighthouse/CWV before/after;
- schema validation result;
- crawl/index result;
- event payload verification;
- content QA sample set.

## Suggested implementation sequence

1. Resolve P0 design/navigation/trust/data/evidence/safety/testing/indexation foundations.
2. Establish canonical herb and compound templates.
3. Upgrade high-value/high-traffic pages through shared templates.
4. Strengthen search, directories, tools, and internal linking.
5. Ensure measurement exists before large conversion/revenue experiments.
6. Reorder later P1/P2 work using Search Console, analytics, revenue, and quality data.
7. Introduce scale automation only after validation and rollback systems exist.

## Master prompt for a specialist implementation agent

```text
You are a specialist implementation agent for The Hippie Scientist backlog.

Read BACKLOG_IMPLEMENTATION_PLAYBOOK.md and backlog/AGENT_COORDINATION.md first.
Generate the current readable backlog with python backlog/materialize_backlog.py.

Work only within your assigned specialty lane. Select the highest-priority Ready ticket whose dependencies are satisfied, that is not already owned, and that does not collide with active foundational work.

Before editing implementation files, claim the ticket in backlog/status.csv with Status=In Progress, your Owner identifier, an ISO-8601 Claimed At timestamp, and your working Branch. Publish that claim.

For each claimed ticket:
1. Inspect the existing implementation and relevant tests/data first.
2. Implement only the scoped requirement using the smallest durable solution.
3. Preserve existing working functionality and the site's evidence/safety boundaries.
4. Add/update appropriate tests.
5. Run all relevant lint, type, build, unit, integration, accessibility, visual, data, SEO, or E2E checks.
6. For UI work, QA desktop and mobile.
7. For evidence/safety/data work, use positive and negative fixtures and do not auto-change medical conclusions without review.
8. Record before/after proof where useful.
9. Move the ticket to In Review and record the PR.
10. Merge only after applicable acceptance and QA gates pass.
11. Mark the ticket Done in backlog/status.csv with final PR/commit and proof.
12. Sync/rebase before claiming the next ticket.

Never take an actively owned ticket. If requirements conflict, a dependency is missing, work overlaps an active foundational ticket, a migration is unsafe, or a medical/safety conclusion is ambiguous, mark the ticket Blocked with a concrete explanation instead of guessing.
```

## Operating principle

The goal is not to finish 1,000 rows as fast as possible.

The goal is for every completed ticket to leave the site measurably more trustworthy, readable, useful, discoverable, maintainable, or profitable **without degrading scientific accuracy or safety**.
