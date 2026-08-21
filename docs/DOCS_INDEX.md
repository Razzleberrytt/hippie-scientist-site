# Documentation Index

**Status:** Authoritative documentation map
**Updated:** 2026-08-21
**Inventory scope:** All 321 files found under `docs/` during the 2026-08-21 archaeology pass. Classification is intentionally rule-based so this index does not become a second 321-row maintenance burden.

## Required reading order

1. [`AGENTS.md`](../AGENTS.md) — execution and safety rules
2. [`docs/PROJECT_CHARTER.md`](PROJECT_CHARTER.md) — mission and operating boundaries
3. [`docs/CURRENT_STATE.md`](CURRENT_STATE.md) — verified present reality
4. [`docs/ROADMAP.md`](ROADMAP.md) — milestone direction
5. [`docs/CURRENT_SPRINT.md`](CURRENT_SPRINT.md) — only immediate execution queue
6. [`docs/MASTER_BACKLOG.md`](MASTER_BACKLOG.md) — ranked future work
7. [`docs/DECISIONS.md`](DECISIONS.md) — durable choices and rationale
8. [`docs/SCOREBOARD.md`](SCOREBOARD.md) — metric definitions and current values

## Authority levels

| Level | Meaning | Update expectation |
|---|---|---|
| Authoritative | Governs current decisions or describes current reality | Update in the same change when its assumptions, queue, decisions, or metrics change |
| Supporting standard | Detailed policy/specification used within authoritative boundaries | Update when the governed implementation or standard changes; cite proof |
| Operational | Procedures, runbooks, and generated work aids | Keep commands and owners current; validate before use |
| Historical / legacy | Past plan, audit, handoff, experiment, or implementation record | Retain for context; do not select work or quote status without revalidation |
| Generated | Produced by scripts/builds | Do not hand-edit; regenerate and record freshness/source |

When documents conflict, current code/configuration/tests/deployment evidence establishes implementation reality, then the authoritative documents decide what should happen next.

## Authoritative documents

| Document | Purpose | Audience | Update expectation |
|---|---|---|---|
| [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md) | Mission, audience, value, business/editorial/safety boundaries | Everyone | Rare; only for durable strategy changes |
| [`CURRENT_STATE.md`](CURRENT_STATE.md) | Verified implementation, inventory, risks, unknowns | Agents, maintainers, stakeholders | After material architecture/product/measurement changes and control audits |
| [`ROADMAP.md`](ROADMAP.md) | Milestones and exit conditions | Product/project leads | At milestone review; never mark complete without proof |
| [`CURRENT_SPRINT.md`](CURRENT_SPRINT.md) | Maximum-three-workstream execution queue | Executing agents | On ticket start/block/review/completion |
| [`MASTER_BACKLOG.md`](MASTER_BACKLOG.md) | Prioritized Now/Next/Later/Blocked/Completed system | Project control | When evidence, priority, dependencies, or proof changes |
| [`DECISIONS.md`](DECISIONS.md) | Dated architectural/editorial/business decisions | Everyone | Append/supersede when a durable choice is made |
| [`SCOREBOARD.md`](SCOREBOARD.md) | Growth-loop metric definitions, values, sources, owners | Growth/product/engineering | Fixed reporting cadence with source/date; Unknown is valid |
| [`DOCS_INDEX.md`](DOCS_INDEX.md) | Authority and disposition of every docs category | Everyone | When documents or categories change |

`AGENTS.md` is outside `docs/` but is the highest-priority operating rule set.

## Supporting documents

These remain valuable but cannot override the control system.

| Path or rule | Purpose | Audience | Authority / update expectation |
|---|---|---|---|
| `content-quality/**`, especially [`evidence-first-decision-page-standard.md`](content-quality/evidence-first-decision-page-standard.md) | Evidence-first release and editorial quality standards | Content/evidence/product agents | Supporting release gate; update through editorial/evidence review |
| [`site-organization.md`](site-organization.md), `seo/**` | Route taxonomy, SEO, canonical, sitemap, and linking policy | SEO/engineering | Supporting; reconcile with live routes before route work |
| [`data-pipeline.md`](data-pipeline.md), [`generated-data-policy.md`](generated-data-policy.md), `canonical-data-system/**`, workbook/XLSX/source-registry root docs | Workbook, identity, data, and generated-artifact contracts | Data/content engineering | Supporting; update with pipeline changes and builds |
| [`build-and-verification.md`](build-and-verification.md), [`cloudflare-pages.md`](cloudflare-pages.md), `ci/**`, `security/**`, [`RELEASE.md`](RELEASE.md), [`VALIDATION.md`](VALIDATION.md) | Build, deploy, CI, dependency, and release procedures | Engineering/operations | Operational-supporting; commands must be tested before relying on them |
| [`agent-integration-guide.md`](agent-integration-guide.md), `agents/**`, `AGENT-*`, `agent-*`, enrichment/editorial workflow docs | Agent patch and editorial review mechanics | Agents/reviewers | Supporting; `CURRENT_SPRINT.md` still controls what may run |
| `content/**`, `page-specs/**`, `page-expansion-specs/**`, `templates/**`, `methodology/**`, `quality/**` | Page-specific research, specifications, templates, and quality references | Content/design/evidence agents | Supporting reference; verify against current page and standard before use |
| `product/**`, `ux/**`, `ui/**`, `design/**`, `media/**`, `performance.md` | Product/UI/UX/performance reference and prior specifications | Product/design/engineering | Supporting unless dated/completed; no redesign authority |
| `analytics-content-journey-events.md`, `marketing/affiliate-tracking-guide.md`, `marketing/affiliate-tracking-checklist.md` | Measurement/event definitions and implementation guides | Analytics/revenue agents | Supporting; production receipt still requires REV-001 proof |
| `POLICY.md`, `PUBLISHING_WORKFLOW.md`, `QA_CHECKLIST.md`, `production-content-lint.md`, evidence/citation/safety/mental-health root standards | Editorial, publishing, quality, and safety practices | Content/evidence/review agents | Supporting gates; use the stricter current rule when overlap exists |

## Operational documents

| Path or rule | Purpose | Audience | Update expectation |
|---|---|---|---|
| `ops/**`, `qa/**`, `production-audits/**` | Current runbooks or point-in-time operational checks | Operations/QA | Confirm date and scope before execution |
| `MOBILE.md`, `mobile-workflows.md`, `PLAYTEST.md`, `accessibility-wcag-22-audit.md` | Device/accessibility/manual-test procedures | QA/design | Re-run for affected UI; old outcomes are not current proof |
| `script-inventory.md`, `source-of-truth-inventory.md`, `import-boundaries.md`, `static-dynamic-boundary.md` | Repository/tooling maps | Engineering/agents | Refresh after structural changes |
| `resend-setup.md` and external-service setup notes | Provider setup references | Operations | Treat secrets/config state as Unknown until verified externally |

## Generated documents

The following are generated work aids, not status authorities:

- `generated/**` from `npm run routes:inventory`;
- `internal-link-map.md`, `pages-needing-links.md`, and `topic-clusters.md` from link/data scripts;
- `safety-fill-rate-report.md` and other script-labeled report outputs;
- machine-written performance logs or audit summaries whose header names a generator.

**Action:** Keep and regenerate when their source changes. Always record the generating command/date. A generated file that disagrees with the fresh build is stale.

## Historical and legacy documents

The rules below classify every remaining docs file. First matching rule wins. These files are kept in place to avoid casually breaking links; new historical material should go under `docs/archive/` or an appropriately dated audit directory.

| Path or filename rule | Disposition | Purpose / audience | Update expectation |
|---|---|---|---|
| `audits/**`, `audit/**`, `site-audit-*`, `post-fix-audit.md`, `audit-remediation-handoff.md`, `blog-*-audit.md`, `compound-quality-gate-audit.md`, `workbook-import-audit.md`, `spec-*-audit.md`, `production-audit-*` | Historical | Point-in-time findings for investigators | Do not update findings; rerun and create current proof/ticket |
| `merge-report-*`, `zip-part-*-report.md`, `*-completion-*`, `*-discovery-*`, `*-batch-*`, `high-roi-content-pass-*` | Historical | Merge/batch evidence and implementation chronology | Retain unchanged unless correcting provenance |
| `PROGRESS_LOG.md`, `LOOP_NOTES.md`, `site-update-log.md`, `update-log.md`, `UPDATES.md`, `codex-changelog.md`, migration/upgrade/repair pass docs | Historical | Development chronology | Not current status; add new durable facts to `CURRENT_STATE.md` |
| `sprint-001-technical-health.md`, `next-work-checklist-*`, `IMPLEMENTATION-CHECKLIST.md`, `top25-expansion-roadmap.md`, `expansion-*`, `magnificent-10.md` | Legacy plan | Previous queues/expansion plans | Never execute directly; revalidate and promote a ticket |
| `CONTENT_STRATEGY.md`, `DIFFERENTIATION_STRATEGY.md`, `MASTER_CONTENT_MAP.md`, `content-command-center.md`, `content-priority-scoreboard.md`, `business/**`, `roi/**`, `strategy/**` | Legacy strategy/control | Prior strategy, prioritization, and commercial assumptions | Context only; charter/roadmap/backlog/scoreboard now govern |
| `marketing/weekly-cro-tracker.md`, `revenue-activation-report.md` | Legacy measurement | Placeholder or point-in-time revenue/CRO records | Values are unverified unless linked to a source export; use `SCOREBOARD.md` |
| Completed implementation specifications and handoffs (`*-implementation.md`, `*-handoff.md`, repair/migration plans) | Historical technical reference | Explains why existing code may look as it does | Verify code before relying on claimed status |
| Any docs file not matched above and not explicitly authoritative/supporting/operational/generated | Supporting reference, authority unverified | Potentially useful specialist context | Inspect code/current evidence; promote or archive at next touch |

## Documentation cleanup policy

- Prefer an authority banner or index classification over deleting useful history.
- Merge a legacy document only when its still-valid rule is needed by an authoritative document.
- Move untouched historical material to `docs/archive/` only when inbound links and generators are updated.
- Delete only clear duplicates or generated debris with no provenance or value.
- Never treat a historical zero, forecast, checklist tick, or merged PR as current outcome proof.

## Audit disposition summary

This reset created the eight authoritative documents, retained detailed standards and runbooks, classified old audits/merge reports/plans as historical or legacy, and retained generated aids with freshness warnings. No bulk deletion or route/content migration was justified. `docs/marketing/weekly-cro-tracker.md` and `docs/CONTENT_STRATEGY.md` now carry explicit legacy warnings; `docs/README.md` points here.
