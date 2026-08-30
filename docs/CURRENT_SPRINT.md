# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Governed Distribution MVP + Measurement Foundation
**Updated:** 2026-08-29
**Normal WIP limit:** `AGENTS.md` permits Discovery/SEO, Revenue/Conversion, and Authority/Content only, with one active ticket per workstream. Distribution lanes do not independently grant additional Revenue/Conversion slots; Operations is not a fourth normal workstream.
**WIP cap:** 3
**Current admission:** Reconciled to current GitHub state. The previously recorded overlapping Revenue/Conversion reviews are complete and no longer occupy Active. Numeric capacity alone does not admit new implementation; workstream ownership, dependencies, freshness, incident/control state, and exact-head validation remain mandatory.

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406

## Sprint objective

Finish the smallest trustworthy Evidence → Distribution loop that can produce a governed asset, preserve exact factual provenance through presentation/rendering, move it through an idempotent dry-run publishing lifecycle, and accept attributable outcome observations for deterministic feedback.

At the same time, finish the smallest control-plane hardening needed to keep autonomous execution trustworthy as throughput increases: changed-file-relevant merge gates first (#4410/#4411), then machine reconciliation of GitHub state against the planning docs (#4412). Freshness/unlock-aware prioritization (#4413), durable experiment memory (#4414), and marginal-resource economics (#4415) are merged. Their implementation is not ready work; using them with real observations remains subject to evidence and admission gates.

This sprint is an **acceleration track inside M1**, not a declaration that the Revenue Foundation is complete. GA4/GSC/affiliate alignment and production analytics receipt remain blocked by authorized external access. Those blockers stay visible, but they do not freeze unrelated governed distribution work.

The sprint does **not** authorize broad/high-volume auto-posting, scientific rewriting, evidence-grade mutation, invented safety language, consumer-dose directives, a second factual dataset, speculative content volume, a second prioritization formula, or milestone completion without proof.

## Execution rules

- Start only tickets listed under `Active` or `Ready next` below, and only when a real WIP slot exists. Merged control-hardening implementations are history, not admission candidates.
- GitHub issue/PR state outranks stale document wording.
- When a ticket merges/closes, remove it from `Active` on the next control sync.
- The normal WIP cap remains three. A temporary incident/control overflow must be explicitly documented and blocks admission of further work until active WIP is below the cap.
- One lane may not edit another lane's source-of-truth surface merely to move faster.
- L1 owns rendering/media infrastructure; L2 factual/provenance; L3 opportunity/measurement; L4 presentation/experiments; L5 lifecycle/publishing. These surface owners do not override the one-ticket-per-workstream limit.
- Canonical research objects and governed upstream evidence remain factual authority.
- Every distribution asset must retain canonical source URL/content hash and the exact approved factual/limitation boundary.
- Missing production/external metrics remain `Unknown`, never zero and never inferred success.
- Positive performance feedback must preserve the existing minimum-exposure threshold and may re-rank only already-eligible opportunities.
- The backlog keeps exactly one score formula. Dependency-unlock value belongs inside Strategic Leverage; stale external assumptions reduce Confidence or force revalidation before promotion.
- Externally contingent work must expose a current `last_verified` date/scope at promotion time under merged #4413; stale hypotheses may not remain perpetually `Ready` by inertia.
- Before repeating a governed experiment using merged #4414, check durable experiment history; a materially equivalent prior test requires a named changed assumption/retest condition.
- When comparable resource observations exist, scale based on marginal qualified outcomes per incremental resource, not gross output alone. Missing resource/outcome data remains `Unknown`.
- Deterministic failures found inside scope are repaired before merge. Merge only on exact intended head when required gates are green and no blocking review/governance defect remains.

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

## Active — observed implementation WIP 1/3

| Workstream / lane | Issue / PR | Ticket | Status | Must prove before merge |
|---|---|---|---|---|
| R / L5 bounded pilot | #4715 / PR #4716 | First bounded governed distribution pilot | In Review | One provenance-bound deterministic carousel package; dry-run scheduled lifecycle only; future 28-day observation window remains null/Unknown; scoped regressions and hosted exact-head gates |

Research-only Session F staging in PR #4673 does not mutate canonical content or publication authority and remains governed by its dedicated enrichment-session contract. It does not authorize additional Authority implementation or promotion work.

## Ready next — strict dependency order

**A free slot exists only when the candidate's dependencies and lane ownership are current and no higher-risk incident overrides admission.**

### First bounded pilot package

**Start when:** L1/L2/L4 + merged #4406 + #4407 boundaries are proven, Revenue/Conversion is free, and current admission checks allow the pilot.

The first pilot should use already-governed research, deterministic assets, tagged destinations, durable lifecycle receipts, and an explicit observation window. It may be published only through a supported, attributable, policy-compliant path. If no provider integration/credentials are available, the sprint may complete the end-to-end dry-run and record the external execution blocker rather than inventing a live result.

## Control hardening — merged implementation, observed use still gated

#4413 / PR #4469, #4414 / PR #4490, and #4415 / PR #4492 are merged and retired below. Do not recreate them from an older queue.

- Consult the durable experiment-learning ledger before repeating an equivalent experiment; a retest requires a changed assumption and fresh evidence. Ledger capability does not prove that every producer already emits history.
- The economics contract derives ratios from named observations; missing values remain Unknown. Comparable metric definitions, scope, attribution boundary and window duration are required.
- Positive scale eligibility requires explicit attribution/quality-debt observations and source-bound exposure at the unchanged 250-view floor in both periods. Estimates and merged-code throughput cannot authorize scaling; other domain-specific sufficiency policies are not invented.
- Real CI/resource and attributable growth ratios remain waiting until their supplying observations exist. Neither merge advances M1/M2 or proves business impact.

## External blockers preserved from M0/M1

| ID | Blocker | Current truth | Next legal action |
|---|---|---|---|
| REV-001 / #4280 | Production analytics receipt | Code readiness merged; production GA4/Ahrefs configuration/event receipt remains Unknown | Obtain authorized environment/property/network/DebugView evidence without exposing secrets |
| SEO-004 | 28-day GSC baseline | No authorized fixed-window export in repo | Supply authorized Search Console access/export and record exact dates |
| REV-002 | Aligned funnel/revenue baseline | Cross-source baseline incomplete | Reconcile GA4/GSC/Amazon/Mailchimp once source access exists; partial source-level observations remain explicitly partial |
| #4014 | `main` branch protection/ruleset | Repository enforcement is not proven | Apply/verify required settings with authorized repository-settings access |
| #4341 | Recurring Cloudflare production failure class | Repository-side checks do not expose root-cause logs | Inspect failed production deployment logs; repair only if a deterministic repository/config cause is identified |

## Highest-value fallback work if the distribution/control dependency chain is blocked

Promote one only after checking overlap, current exact-main state, and freshness of the evidence supporting promotion.

1. **#4227** — reduce duplicated full production exports without weakening exact-SHA fail-closed validation; also supplies resource observations useful to #4415.
2. **SEO-003** — reproduce and clear the current schema identity gate.
3. **AUTH-001** — resolve verified duplicate-intent owners using current route/query evidence.
4. **#4266 / #4260** — governed recent-evidence enrichment under the existing governor/lease/provenance contract.

## Sprint exit conditions

The sprint exits only when all of the following are true or have a precise external blocker:

- PRs #4388, #4401, and #4405 are merged or explicitly blocked with exact failing proof; no stale active status remains in control docs.
- PR #4411 / #4410 is merged or explicitly blocked, and active implementation WIP is within the normal three-ticket cap.
- #4412 has proven machine reconciliation and merged; known stale active state must still be reconciled rather than suppressed.
- The governed research object → validated pack → lossless creative plan → deterministic rendered asset chain is reproducible and provenance-bound.
- #4406 has proven an idempotent dry-run lifecycle with stale-asset rejection, durable receipts, retry safety, and rollback/stop semantics.
- #4407 proves deterministic attributable observation ingestion, Unknown handling, replay, cross-platform isolation, and the existing minimum-exposure guard.
- A bounded pilot package can be generated end-to-end and is measurement-ready; live publication is optional only if a supported/authorized provider path exists.
- #4413/#4414/#4415 implementations are merged, and their single-formula/freshness, experiment-memory, and marginal-efficiency boundaries remain preserved in actual use; their merges do not substitute for distribution MVP or observed-outcome proof.
- No broad auto-publishing or high-volume scheduling is enabled merely because the technical chain exists.
- Revenue/GSC/analytics blockers remain honestly labeled and do not silently satisfy M1/M2 exits.
- Backlog and sprint agree with current GitHub state: no completed issue or merged PR occupies an active slot.
- Required scientific, provenance, safety, accessibility, release, and exact-head validation gates remain intact.

## Recently retired from this sprint

- **#4415 / PR #4492:** merged as `23dc2485720ff6b31043413b2b9295c4886944cb`. Final-head CI passed 2,866 tests across 593 files, real production build/output/SEO, and 42 focused economics regressions ([CI proof](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33193431644), [focused proof](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33193431712)). Repaired files verified on main; four review findings resolved after evidence review. Real efficiency observations remain Unknown.
- **#4414 / PR #4490:** merged as `2e67f9e55f4d96dc7d82a683a829a29b4e2298f1`; durable experiment-learning capability is no longer queued. Recorded outcomes and producer integration require their own evidence.
- **#4477 / PR #4478:** merged as `2b25ae9beed63afe1e6c045491828e3f096037e4`; the template catalog no longer occupies active WIP.
- **PR #4491:** merged as `d726f81bc5ababbb024b86782da2e94fbc15989e`; governed safety-line preservation is no longer active.

- **#4407 / PR #4484:** merged as `6fba155c6f241af7cee38981c413bde710d56c1b`; attributable outcome ingestion is no longer ready work. Final-head checks passed; this is implementation proof, not evidence of real observed performance or an executed pilot.

- **#4413 / PR #4469:** merged as `d0936fbe7d41c84c753a8374f2a7b25047322339`; freshness/unlock-aware prioritization no longer occupies active WIP.
- **#4476 / PR #4475:** merged as `65605fd2f4e9cfd85af63c14bd2a583471551bf2`; canonical evidence-grade binding no longer occupies active WIP.
- **#4482 / PR #4481:** research draft staging merged as `d6934eacff95b4b9dc1c3c5be2f0c8a91e9bc4a1`; this is not approval for scientific promotion and does not resolve the recorded source-registry blocker.

- **PR #4457:** completed/merged as `95ec9ba285f06c947f2844a2f81abce031b9e437`; complete canonical safety-warning preservation no longer occupies active WIP.

- **#4412 / PR #4446:** completed/merged as `96a07976dee22cf7b91c337c820cc83ff7e6b860`; machine reconciliation is on main and no longer occupies active WIP. Final-head hosted CI passed all 18 reconciliation cases and 2,785 tests across 587 files; production build/output/SEO passed in [run 33148069222](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/33148069222). Both review findings are verified/resolved. This is implementation proof, not a claim that later planning snapshots or business outcomes are healthy.
- **#4463:** completed/merged as `f300e0e8f3ef8b9a485f0cbd8c0993725bd425b1`; trust-safe thumbnail variants are on main and no longer occupy active WIP.
- **#4460:** completed/merged as `48bebb81e35c4bd605dedbfc15156cabeb915b06`; duplicate-angle suppression is on main and no longer occupies active WIP.
- **#4406:** completed; the governed ready → publish → measured lifecycle is merged and no longer occupies the ready queue.
- **#4439 / PR #4440:** completed/merged; canonical claim/source binding no longer occupies an active slot.
- **PR #4448:** closed unmerged; vertical MP4 implementation is preserved for later legal reuse and does not occupy active WIP.
- **#4447 / PR #4445:** merged as `692d85d1a496188b4bc48113f8f64b5e94c82098`; the hook trust contract no longer occupies an active slot.
- **#4410 / PR #4411:** merged; scoped changed-file-relevant gates are on main. The temporary overflow exception is retired.
- **PRs #4388, #4401, #4405:** merged; renderer, provenance-receipt, and lossless-presentation implementation no longer occupy active slots.
- **PR #4408 / #4409:** merged/closed; roadmap, sprint, and master backlog synchronized to exact GitHub state on 2026-08-27.
- **#4182:** closed/completed; five herb/compound identity correction no longer active.
- **#4238:** closed/completed; normalized source-registry baseline/provenance continuation no longer active.
- **AUTH-004 / PR #4145:** merged; visual browse refinement no longer active.
- **SEO-005 / PR #4331:** merged; monitor remains file-fed until a supported Bing AI Performance acquisition path exists.
- **I18N-001 / PR #4332:** merged; Japanese/Korean core locale expansion is live while detailed scientific profiles remain fail-closed.
- **REV-005 / PR #4358:** merged; the validated media-pack foundation is now upstream infrastructure for this sprint.