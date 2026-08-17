# The Hippie Scientist — Begin Backlog Process

This file defines the exact launch behavior for the user command:

> **begin the backlog process**

When that phrase, or a clearly equivalent instruction, is given for The Hippie Scientist, operate as the backlog coordinator and begin execution without asking the user to manually choose a ticket.

## Startup authority

Before touching implementation source:

1. fetch current `main`;
2. inspect current open PRs for overlap, stale branches, already-implemented work, and unresolved blockers;
3. read `BACKLOG_IMPLEMENTATION_PLAYBOOK.md`;
4. read `backlog/AGENT_COORDINATION.md`;
5. inspect `backlog/status.csv`;
6. run `python backlog/materialize_backlog.py`;
7. inspect the generated `backlog/master_backlog.csv` and current repository state before selecting work.

The immutable 1,000-ticket definitions plus `backlog/status.csv` are the backlog system of record. Current repository code, tests, live-site behavior, current search/analytics evidence, and safety/evidence requirements outrank stale ticket assumptions.

## Resume-first rule

Reconcile existing execution state before claiming anything new.

- If a ticket is `In Progress` or `In Review`, confirm its branch/PR still exists, remains current, and does not conflict with newer `main`.
- Resume valid active work before opening a duplicate implementation.
- If an active claim is stale, already merged, invalidated, or abandoned, reconcile the ledger according to `backlog/AGENT_COORDINATION.md` before selecting new work.
- `Blocked` tickets remain blocked until their concrete blocker is resolved. Do not silently relabel them merely to keep work moving.
- If a blocked ticket has a safe, non-overlapping prerequisite or another eligible lane can proceed, continue with that work.

## Ticket selection rule

Select work in this order:

1. a concrete safety, evidence-integrity, production, build, security, indexation, or regression failure that makes downstream work unsafe or invalid;
2. unresolved prerequisites for the highest-priority eligible tickets;
3. `Ready` P0 tickets with satisfied dependencies;
4. `Ready` P1, then P2, then P3 tickets;
5. within the same priority, prefer higher ROI and lower collision risk.

Do not execute tickets merely because their IDs are sequential.

Before activation verify that:

- dependencies are satisfied or demonstrably unnecessary;
- current `main` does not already satisfy the acceptance criteria;
- no open PR or active ticket owns the same implementation surface;
- the ticket uses the existing canonical component/template/data/evidence/safety/SEO owner where one exists;
- applicable safety and evidence guardrails are understood;
- the expected QA and proof can actually be produced.

## Specialist routing

Use the ticket's existing `Agent Role` / specialty lane. Typical lanes are:

- Design
- Engineering
- Evidence
- Safety
- SEO
- QA
- Growth

The coordinator owns queue health, dependencies, collision prevention, stale claims, blockers, and reprioritization.

Multiple lanes may proceed only when scopes are genuinely non-overlapping. Keep foundational/global work serialized when two tickets touch the same canonical template, evidence model, safety model, routing layer, migration, CI/build configuration, or generated data source.

If the active environment cannot safely run parallel implementation lanes, execute eligible tickets sequentially rather than inventing parallel state.

## Claim protocol

Before substantive implementation edits, update `backlog/status.csv` with:

- `ID`
- `Status=In Progress`
- one `Owner`
- ISO-8601 `Claimed At`
- one working `Branch`
- current `PR / Commit` if applicable
- an empty blocker unless genuinely blocked
- concise proof/notes when useful

Use branch convention:

`ths/THS-####-short-description`

Publish the claim before implementation.

## Execution loop

For each claimed ticket:

1. inspect the existing implementation, tests, data, routes, templates, and related open PRs first;
2. implement only the smallest coherent scope needed to satisfy the ticket;
3. preserve working functionality and shared architecture;
4. never trade evidence accuracy, safety accuracy, accessibility, or user trust for SEO, conversion, or design polish;
5. add or update focused regression coverage where useful;
6. run all applicable tests, lint, type checks, production build/static-export checks, content/evidence/safety validation, and route-level checks;
7. perform desktop/mobile/accessibility/visual QA for user-facing changes;
8. fix regressions caused by the change;
9. move the ticket to `In Review` and record the PR when review is required;
10. merge only when applicable acceptance and QA gates pass;
11. update `status.csv` to `Done` with final PR/commit and proof after successful merge/deploy where applicable;
12. fetch current `main`, rematerialize the backlog, re-check blockers/dependencies/open PRs, and select the next eligible ticket.

Do **not** stop after one successful ticket merely to ask the user what to work on next. Continue the backlog process until a real stop condition is reached.

## Evidence and safety guardrails

For evidence, safety, dosing, interaction, contraindication, pregnancy, medication, disease-claim, or other health-sensitive tickets:

- preserve the canonical evidence-grade rules;
- separate human outcome evidence from mechanism, animal, and in-vitro evidence;
- keep safety severity separate from evidence strength;
- do not infer that an unknown interaction is safe;
- do not soften `Avoid/Insufficient` merely for conversion or affiliate value;
- do not automatically rewrite high-stakes medical conclusions from external updates without the review required by repository policy;
- do not invent citations, study findings, regulatory positions, or safety conclusions.

## Stop conditions

Stop autonomous implementation only when one of these is true:

- a concrete blocker makes further implementation unsafe or impossible;
- no eligible `Ready` work remains after dependencies and collisions are considered;
- proceeding requires an unresolved high-stakes editorial/product decision not already answered by repository authority;
- required credentials, external systems, or manual-only actions are unavailable and no safe source work remains;
- the user explicitly tells the process to stop, pause, or change direction.

When blocked, record the concrete blocker in `backlog/status.csv`, preserve proof, and continue with another safe non-overlapping eligible ticket when coordination rules permit it.

## Completion reporting

Keep reports concise. After a merge or meaningful blocker report:

- ticket ID/title;
- specialist lane;
- validation/QA result;
- status;
- PR/commit;
- next selected ticket or concrete blocker.

## Exact launch interpretation

If the user says only:

> **begin the backlog process**

that is sufficient authorization to start this coordinator loop. Do not ask the user to choose a ticket, lane, branch, or priority unless repository authority cannot resolve a genuinely consequential decision.
