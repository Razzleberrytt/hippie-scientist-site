# The Hippie Scientist — 1,000-Ticket Backlog Implementation Playbook

## Purpose

This document is the execution contract for agents working through the `THS-0001` through `THS-1000` backlog.

In the repository, `backlog/master_backlog.csv` is the writable operational source of truth for ticket status, priority, dependencies, ownership, PR/commit links, and proof. `backlog/master_backlog.xlsx` is the human-friendly dashboard/reference snapshot. This playbook defines how agents are allowed to execute those tickets.

Primary website: https://thehippiescientist.net/

## Backlog structure

The backlog contains exactly 1,000 tickets across 40 workstreams, 25 tickets per workstream.

### Phase 1 — Foundation — 175 tickets

- Homepage & First Impression
- Navigation & Information Architecture
- Visual Design System
- Typography & Reading Experience
- Mobile & Responsive UX
- Accessibility
- Trust, Author, Editorial & Legal

### Phase 2 — Core Content — 375 tickets

- Herb Profile Template
- Compound Profile Template
- Topic & Goal Hubs
- Guides, Comparisons & Best-Of Pages
- Articles & Learning Library
- Herb & Compound Directories
- Site Search & Discovery
- Safety Checker & Interactive Tools
- Evidence Lookup & Citation Explorer
- Evidence Grading & Methodology
- Safety & Interaction Data
- Dosing & Product Quality
- Content Quality & Editorial Consistency
- Claim Substantiation & Language
- Citations & Research References

### Phase 3 — Discoverability & Growth — 275 tickets

- Content Freshness & Review Queues
- Internal Linking & Related Content
- On-Page SEO
- Technical SEO & Indexation
- Structured Data & Schema
- Performance & Core Web Vitals
- Analytics & Measurement
- Conversion & Email Capture
- Affiliate & Monetization
- UX States, Forms & Microcopy
- Growth, Backlinks & Distribution

### Phase 4 — Scale & Governance — 175 tickets

- Component Architecture & Refactor
- Data Model & Validation
- Content Pipeline & Automation
- Testing, CI & Visual QA
- Security, Privacy & Compliance
- Internationalization & Translation
- Agent Operations & Governance

## Priority system

- **P0 Critical:** foundation, health/safety/evidence integrity, indexation, major UX, or regression-prevention work. Execute before optional growth work.
- **P1 High:** strong expected value and should follow P0 blockers/foundations.
- **P2 Medium:** worthwhile optimization. Use analytics/Search Console/revenue evidence to decide exact order.
- **P3 Later:** valid work that should not displace higher-ROI tickets yet.

The spreadsheet contains a computed **ROI Score = Impact × Confidence ÷ Effort Points**. Use it only as a tie-breaker after priority, dependencies, and safety constraints.

## Status system

`Not Started → Ready → In Progress → In Review → Done`

Alternative states:

- `Blocked` — a real dependency/conflict prevents safe execution.
- `Won't Do` — intentionally rejected or superseded; reason must be recorded.

**Done never means “code was written.”** Done means the change was implemented, tested, reviewed, merged/deployed where applicable, and the proof/PR field was updated.

## Standard agent loop

1. **Select** the highest-priority `Ready` ticket whose dependencies are satisfied.
2. **Inspect** existing code, data, content, styles, tests, and documentation before changing anything.
3. **Scope** work to the ticket. Do not silently absorb unrelated cleanup.
4. **Implement** at the shared layer whenever possible: design token, component, template, data model, validation rule, content pipeline, or reusable helper.
5. **Test** the implementation and add regression coverage appropriate to the risk.
6. **QA** representative desktop/mobile states for UI work and positive/negative fixtures for data/evidence/safety work.
7. **Document** the change, tests, caveats, and before/after proof where useful.
8. **Merge** after success. Rebase before beginning the next ticket.
9. **Update** the backlog row: status, owner, PR/commit, proof/notes.
10. **Measure** the expected outcome when a metric is available.

## Batch size

Default to **1–5 closely related tickets per agent**.

Use **one ticket / one PR** for:

- evidence grading changes
- safety or interaction logic
- data migrations
- technical SEO/indexation rules
- privacy/security changes
- architecture changes
- high-risk affiliate/editorial changes

A tightly coupled micro-batch may share a PR if splitting it would create broken intermediate states. Record every included ticket ID.

## Branch and commit convention

Recommended branch format:

`ths/THS-####-short-description`

Recommended commit prefix:

`THS-####:`

Examples:

- `ths/THS-0001-homepage-value-prop`
- `THS-0001: clarify homepage value proposition`

For a micro-batch:

`ths/THS-0001-0003-homepage-hero`

The PR description must enumerate every ticket ID it closes.

## Definition of Ready

A ticket is `Ready` only when:

- required dependencies are complete or verified unnecessary;
- the relevant code/content/data can be located;
- the task does not conflict with a newer architecture decision;
- acceptance criteria are clear enough to test;
- high-risk medical/evidence/safety work has an explicit review path.

## Definition of Done

A ticket is `Done` only when all applicable gates pass:

- implementation complete;
- lint/type/build checks pass;
- relevant automated tests pass;
- regression test added when the bug could recur;
- desktop QA complete for visual changes;
- mobile QA complete for visual changes;
- keyboard/accessibility QA complete for interactive changes where relevant;
- evidence/safety changes tested using positive and negative fixtures;
- SEO changes inspected in rendered HTML;
- schema changes validate;
- analytics events fire once and contain no sensitive data;
- no known regression remains;
- PR/commit is recorded;
- proof/notes are recorded;
- merged/deployed where applicable.

## Evidence and medical-safety guardrails

The site is evidence-first. Agents must not trade accuracy for conversion, SEO, or visual simplicity.

1. Human evidence must remain visibly distinct from mechanism, animal, or in-vitro evidence.
2. A mechanism cannot be rewritten as a proven human outcome.
3. Evidence grades may only change under the canonical grading rules.
4. Safety severity and evidence strength are separate concepts.
5. Unknown interaction data must never be presented as proof of safety.
6. Avoid/Insufficient must not be softened into positive marketing language.
7. Do not automatically rewrite a medical conclusion solely because a new paper, guideline, regulatory page, or review appears.
8. Material evidence or safety changes enter review before publication.
9. Affiliate value must never determine evidence grade, ordering of scientific conclusions, or safety wording.
10. If a ticket could materially alter a health conclusion and the expected behavior is unclear, mark it `Blocked` and document the question.

## Design implementation rules

The visual-design tickets are intended to eliminate one-off styling.

- Establish tokens before repeatedly changing raw colors/spacing across pages.
- Reuse shared components before creating new variants.
- Prefer one canonical page pattern per content type.
- Test long titles, missing fields, dense safety warnings, and unusually large evidence/reference sections.
- Every major visual change must be checked on mobile and desktop.
- Do not hide important safety/evidence information merely to make the page prettier.

## Content implementation rules

- Remove filler before adding more words.
- Put the answer or verdict early when evidence allows it.
- Keep uncertainty visible.
- Use plain English without deleting meaningful scientific nuance.
- Do not imply endorsement simply because an ingredient is popular.
- Keep product research visually and editorially separate from evidence conclusions.
- Major claims must remain traceable to sources.

## SEO rules

- Search optimization cannot introduce weaker or more sensational medical claims.
- Do not generate hundreds of near-duplicate pages to chase keywords.
- Do not index internal search results, filters, or utility pages unless the ticket explicitly establishes a safe canonical/indexation strategy.
- A technical SEO ticket is not complete until representative rendered HTML has been inspected.
- For indexation changes, verify sitemap, canonical, robots, status code, and internal linking together.

## Agent escalation / stop conditions

Stop the current ticket and mark it `Blocked` when:

- requirements conflict;
- the ticket would overwrite another active agent's foundational work;
- a migration can cause irreversible data loss;
- the correct evidence/safety conclusion is ambiguous;
- tests fail for a reason unrelated to the ticket and the failure cannot safely be isolated;
- the live data model materially differs from the ticket assumption;
- implementing the ticket would require an undocumented architectural rewrite;
- secrets, personal data, or sensitive analytics data could be exposed.

Record the blocker. Do not guess.

## Proof expectations

Examples of acceptable `Proof / Notes` entries:

- before/after screenshot path or PR attachment;
- tests added and exact command run;
- representative routes checked;
- validation fixtures added;
- Lighthouse/CWV before-and-after result;
- schema validator result;
- crawl/index check result;
- event payload verified;
- content QA sample set reviewed.

## Suggested implementation sequence

Do not execute `THS-0001 → THS-1000` blindly just because the IDs are sequential.

1. Resolve P0 foundational design, navigation, trust, data, evidence, safety, testing, and indexation blockers.
2. Establish canonical herb and compound templates.
3. Upgrade high-value/high-traffic pages through those shared templates.
4. Strengthen search, directories, tools, and internal linking.
5. Add measurement before large conversion or revenue experiments.
6. Use Search Console, analytics, revenue, and content-quality data to reorder later P1/P2 work.
7. Introduce scale automation only after validation and rollback systems exist.

The **Agent Queue** tab in the workbook provides an initial top-100 queue. Re-rank it as dependencies and real-world data change. When a ticket changes state, update the matching row in `backlog/master_backlog.csv`; do not rely on the XLSX snapshot as the authoritative status record.

## Master prompt for an implementation agent

Use this as a starting instruction for a coding/content agent:

```text
You are implementing The Hippie Scientist master backlog.

Treat `backlog/master_backlog.csv` and repository documentation as the source of truth. Use `backlog/master_backlog.xlsx` as the dashboard/reference snapshot.

Work only on the assigned THS ticket(s). Before changing anything, inspect the existing implementation and relevant tests/data. Preserve the site's evidence-first, safety-aware editorial boundaries.

For each ticket:
1. Confirm dependencies and acceptance criteria.
2. Implement the smallest durable solution at the shared component/template/data layer when possible.
3. Do not introduce unrelated architecture changes or medical/evidence claims.
4. Add/update appropriate tests.
5. Run all relevant lint, type, build, unit, integration, accessibility, visual, data, SEO, or E2E checks.
6. For UI changes, QA desktop and mobile.
7. For evidence/safety/data changes, test positive and negative fixtures and do not auto-change medical conclusions without review.
8. Record before/after proof where useful.
9. If successful, commit/PR with the THS ticket ID and merge according to repository policy.
10. Update the ticket status, PR/commit, and proof notes in `backlog/master_backlog.csv`.
11. Rebase before starting the next ticket.

If requirements conflict, a migration is unsafe, a medical/safety conclusion becomes ambiguous, or a required dependency is missing, STOP and mark the ticket Blocked with a concise explanation instead of guessing.
```

## Workbook tabs

### Dashboard
Portfolio-level counts and progress by priority/workstream/phase.

### Master Backlog
The 1,000-ticket reference dataset. Contains priority, impact, confidence, effort, ROI score, task, instructions, acceptance criteria, QA, dependencies, target route, measurement, status, owner, PR/commit, and proof.

### Agent Queue
An initial top-100 execution queue. It is a starting point, not an immutable ordering.

### Definitions
Priority/status/effort/risk and completion definitions.

### Execution Protocol
Short-form rules embedded in the workbook for agents that do not load this full document.

## Current-site audit basis

The backlog was designed against the current public site structure visible at https://thehippiescientist.net/ on August 16, 2026, including the homepage's goal hubs, ingredient databases, comparisons, evidence resources, safety tools, newsletter capture, research library, and trust/legal surfaces. The public homepage currently reports 291 herb records and 565 compound records. Individual pages should still be re-inspected at implementation time because the site can change after this backlog was generated.

## Operating principle

The goal is not to finish 1,000 rows as fast as possible.

The goal is to make every completed ticket leave the site measurably more trustworthy, readable, useful, discoverable, maintainable, or profitable **without degrading scientific accuracy or safety**.
