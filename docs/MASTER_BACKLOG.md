# Master Backlog

**Status:** Authoritative ranked backlog
**Updated:** 2026-09-04
**WIP cap:** 3

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406
**Immediate work:** Only tickets present in [CURRENT_SPRINT.md](CURRENT_SPRINT.md) may be started. Closed/completed work must never occupy actionable state.

## Scoring and gates

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

Business Impact, User Value, Traffic Potential, Strategic Leverage, and Effort use 1–5. Confidence is 0.50, 0.75, or 1.00. Higher is better; Effort is the denominator. Dependencies and evidence/safety/provenance/disclosure/accessibility/security/release gates override numeric score.

The formula remains singular. Strategic Leverage may include dependency-unlock value. Confidence is freshness-sensitive. Fresh page-level AI citation telemetry may update existing **Traffic Potential**, **Strategic Leverage**, or **Confidence** inputs when the relationship to a candidate is explicit and the snapshot is current.

Citation counts are evidence of answer-engine reuse, **not** traffic, ranking, conversion, revenue, or causal lift. `config/ai-citation-swarm-priorities.json` is the current derived signal snapshot; `docs/AI-CITATION-GROWTH-LOOP.md` defines its use. No hidden citation multiplier or second backlog score is permitted.

Normal implementation workstreams are Discovery/SEO, Revenue/Conversion, and Authority/Content, with one active ticket per workstream and a total WIP cap of three. Operations remains a classification, not a fourth normal workstream.

### Backlog hygiene rules

- GitHub issue/PR state outranks stale prose.
- An open PR that owns an issue must be recorded with its active issue in the control tables.
- A merged/closed item may remain only in completed/history sections.
- Fresh AI citation evidence may strengthen existing score inputs but cannot bypass Ready/dependency/canonical/scientific/safety/provenance/accessibility/release gates.
- For discretionary citation-driven selection, target roughly **65% citation-adjacent capacity** while preserving a **35% exploration floor**. This is a portfolio rule, not a scoring formula.
- High-citation winners default to additive/reversible changes; identity, canonical, route, or broad answer-structure changes require migration/rollback and a fresh-measurement plan.
- Safety/scientific correctness, publication integrity, production incidents, security, accessibility blockers, and crawl/indexing regressions override numeric ordering.
- Before repeating an equivalent experiment, check the durable experiment-learning history and name the changed assumption/retest condition.
- Missing cost, analytics, traffic, revenue, conversion, or attributable-outcome observations remain `Unknown`.
- No broad auto-publishing is authorized by citation success alone.

## Milestone projection

| Milestone | Status |
|---|---|
| M0 | In progress |
| M1 | In progress |
| M2 | Blocked |
| M3 | Not started |
| M4 | Not started |
| M5 | Not started |
| M6 | Not started |

## Now — active exact work

Fresh reconciliation shows **1/3 normal implementation workstreams occupied**:

| Ticket | Title | Lane | Status | Current proof boundary |
|---|---|---|---|---|
| #5206 / PR #5210 | Capitalize on Bing AI citation winners and wire signals into swarm priority | D / L3 | In progress | 2026-09-04 Page Stats export: 16,204 citations across 91 URLs; top two pages contribute 53.17%. Integrate derived signals, winner protection, cluster execution, and bounded citation-aware scheduling without creating a second score or weakening gates. |

- **D — occupied:** #5206 / PR #5210 owns the citation activation pass.
- **R — free:** #5076 is completed/retired and is not a queue candidate.
- **A — free:** no new Authority/Content ticket is promoted solely to fill capacity.

Research-only enrichment staging remains separate from canonical implementation/promotion WIP.

## Next — ordered dependency queue

No additional normal implementation ticket is currently promoted. Revalidate current GitHub state, exact-main overlap, evidence freshness, collision risk, and the 65/35 citation portfolio before promoting another item.

| ID | Title | WS/Lane | Status | Priority | BI/UV/TP/SL/C/E | Score | Dependencies / freshness | Acceptance / proof boundary |
|---|---|---|---|---|---|---:|---|---|
| DOC-002 | Continuously triage open issues against authoritative queue | O | Continuous reconciliation maintenance | P2 | 3/3/2/5/1/2 | 45.0 | Current GitHub state | Every actionable issue is current; stale closed work never occupies `Now` or `Next`; open owning PRs are recorded with active issues. |

## Citation-backed opportunity map

The current derived snapshot establishes the following strategic order. This is opportunity evidence, not automatic implementation authority.

| Order | Opportunity | Evidence | Backlog treatment |
|---:|---|---|---|
| 1 | Defend natural-sleep-aids winner | 5,424 citations | Higher change bar; preserve identity/direct-answer/evidence/safety structure; prefer additive work |
| 2 | Defend supplements-for-stress winner | 3,192 citations | Higher change bar; expand adjacent stress/anxiety evidence and post-answer paths |
| 3 | Expand Sleep cluster | 7,235 citations / 16 cited URLs | Prioritize non-duplicate, scientifically eligible adjacency and internal-link coherence |
| 4 | Expand Stress/Anxiety cluster | 5,164 citations / 10 cited URLs | Prioritize evidence/safety depth, comparisons, and coherent cluster ownership |
| 5 | Audit sleep intent/canonical overlap | Multiple cited near-overlapping routes | Resolve intent/canonical/redirect/sitemap/internal-link ownership before creating more similar pages |
| 6 | Strengthen ADHD canonical hub | 341 citations across 19 URLs | Use broad spoke citation footprint to test hub consolidation rather than producing another disconnected wave |
| 7 | Protect commercial-adjacent trust winners | Mushroom coffee 472; supplement-quality 444 | Add transparent downstream journeys only after answer/evidence/safety content |
| 8 | Expand proven herb/compound spokes | Valerian 827; kava 417; rhodiola 122; L-theanine ADHD 101 | Prefer evidence/safety/comparison adjacency under normal scientific gates |

The coordinator should use `config/ai-citation-swarm-priorities.json` during workpack selection and refresh it from a new page-level export rather than treating the 2026-09-04 snapshot as permanent truth.

## Blocked — important but not startable

| ID | Title | WS | Status | Score | Blocker / next legal action |
|---|---|---|---|---:|---|
| REV-001 / #4280 | Verify production analytics and governed funnel events | R | Blocked external access | 400.0 | Obtain authorized production analytics receipt; code readiness alone is not observation proof |
| SEO-004 | Import aligned 28-day GSC opportunity baseline | D | Blocked external access | 375.0 | Supply authorized Search Console access/export with exact dates |
| REV-002 | Establish aligned funnel/revenue baseline | R | Blocked external access | 375.0 | Reconcile GA4/GSC/Amazon/Mailchimp once source access exists |
| REV-003 | Select one flagship commercial decision page | R | Blocked | 375.0 | Requires aligned SEO/revenue baseline rather than citation data alone |
| SEO-002 | Recover reviewed flagship profile source roles | D | Blocked review dependency | 117.2 | Review existing source-role work before duplicating; never force indexability |
| AUTH-003 | Upgrade selected flagship decision page | A | Blocked | 117.2 | Requires selected flagship plus evidence review |
| REV-004 | Validate flagship disclosure/destinations | R | Blocked | 67.5 | Requires selected flagship |
| AUTH-002 | Strengthen links to selected flagship | A | Blocked | 54.0 | Requires selected flagship |
| #4782 | Canonical bicarbonate → sodium-bicarbonate migration | A/O canonical | Blocked on real governor lease | — | Acquire and merge valid owner-authorized lease transaction before canonical migration |
| #4783 | Resolve duplicate CoQ10 generated-data owners | A/O canonical | Blocked on real governor lease | — | Acquire and merge valid owner-authorized lease transaction before canonical owner/data migration |
| #4014 | Enforce `main` branch protection/ruleset | O | Blocked external settings | — | Apply/verify with authorized repository-settings access |
| #4341 | Resolve recurring Cloudflare production deployment failure class | O | Blocked external logs | — | Inspect provider deployment logs and repair only a proven deterministic repository/config root cause |

## Later — only after dependency proof

| ID | Title | WS | Status | Dependency / stop rule |
|---|---|---|---|---|
| DIST-VIDEO-001 | Deterministic 30-second vertical-video renderer | R/L1 | Planned | Requires separately admitted provenance-bound implementation |
| DIST-GEN-001 | Optional generative B-roll adapter | R/L1/L4 | Planned | Generated media remains visual-only/non-authoritative; no need before measurable distribution MVP |
| ENGINE-001 | Codify repeatable decision-page qualification/proof | A | Planned | Requires M2 flagship result; avoid template filler |
| CLUSTER-001 | Expand one validated authority cluster | A | Planned | Fresh citation data validates demand/authority for Sleep and Stress/Anxiety, but broad scaling still requires non-duplicate intent ownership and positive marginal qualified outcomes |
| AUTO-001 | Automate publication-governance anomaly reporting | O | Planned | Stable truth and known baselines first |
| EMAIL-001 | Validate/optimize email conversion journey | R | Planned | Requires attributable analytics/Mailchimp access |
| PARTNER-001 | Evidence-safe partnership policy/pilot | R | Planned | Requires proven economics and disclosure/independence safeguards |

## Recently completed / retired from actionable state

These are capability proofs, not business-impact claims.

| Item | Verified disposition |
|---|---|
| #5076 / PR #5136 | Completed. The reusable claim-neutral `SleepResearchNextActions` surface exists on main; PR #5136 completed the second representative guide integration and closed #5076. Attributable conversion lift remains `Unknown`. |
| #5031 / PR #5090 | Completed newsletter CTA trust-defect repair; conversion lift remains `Unknown` until attributable observation exists. |
| #5021 / PR #5028 | Completed governed Vitamin B6 evidence/safety closure; no traffic/conversion/revenue result is inferred. |
| PR #5084 | Completed AI-citation asset-identity protection; the fresh 2026-09-04 telemetry now supplies its intended winner input. |
| #4415 / PR #4492 | Marginal-resource economics capability merged; real efficiency observations remain `Unknown`. |
| #4414 / PR #4490 | Durable experiment-learning capability merged; actual producer history remains evidence-bound. |
| #4413 / PR #4469 | Freshness/unlock-aware prioritization merged; no second score authorized. |
| #4412 / PR #4446 | Machine reconciliation merged; control docs must still track exact GitHub state. |
| #4407 / PR #4484 | Attributable outcome ingestion capability merged; real observed performance remains unverified. |
| #4406 | Governed ready → publish → measured lifecycle capability completed. |
| #4410 / PR #4411 | Changed-file-relevant merge gates merged; temporary overflow exception retired. |
| REV-005 / PR #4358 | Governed media-pack contract merged. |
| SEO-005 / PR #4331 | Bing AI citation incident monitor merged; authenticated export remains an operator input. |

Detailed historical merge provenance remains in repository history and `docs/SWARM-UPDATES.md`. This file intentionally keeps the actionable ranking surface compact so stale completed work cannot masquerade as queue state.

## Legacy backlog disposition

Historical backlog files, old sprint tickets, old issue lists, and generated reports are discovery inputs, not execution queues. Revalidate the underlying problem against current `main`, current production, current analytics, the current citation snapshot when relevant, current experiment history, and current PR overlap before promoting anything here.
