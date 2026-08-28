# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Governed Distribution MVP + Measurement Foundation
**Updated:** 2026-08-28
**Normal WIP limit:** Maximum three concurrent implementation tickets. The Evidence → Distribution initiative may use separate lanes only when scopes are orthogonal and one ticket per lane is active.
**WIP cap:** 3
**Current admission:** Closed at the normal three-ticket cap. GitHub snapshot at 2026-08-28T13:07Z: #4413 / PR #4469, #4476 / PR #4475, and #4477 / PR #4478 are active. Revalidate live ownership before any admission; this documentation-only sync opens no implementation lane.

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406

## Sprint objective

Finish the smallest trustworthy Evidence → Distribution loop that can produce a governed asset, preserve exact factual provenance through presentation/rendering, move it through an idempotent dry-run publishing lifecycle, and accept attributable outcome observations for deterministic feedback.

At the same time, finish the smallest control-plane hardening needed to keep autonomous execution trustworthy as throughput increases: changed-file-relevant merge gates first (#4410/#4411), then machine reconciliation of GitHub state against the planning docs (#4412). Freshness/unlock-aware prioritization (#4413), durable experiment memory (#4414), and marginal-resource economics (#4415) are queued hardening improvements and must not displace higher-value incident/scientific work merely because they are easy to implement.

This sprint is an **acceleration track inside M1**, not a declaration that the Revenue Foundation is complete. GA4/GSC/affiliate alignment and production analytics receipt remain blocked by authorized external access. Those blockers stay visible, but they do not freeze unrelated governed distribution work.

The sprint does **not** authorize broad/high-volume auto-posting, scientific rewriting, evidence-grade mutation, invented safety language, consumer-dose directives, a second factual dataset, speculative content volume, a second prioritization formula, or milestone completion without proof.

## Execution rules

- Start only tickets listed under `Active`, `Ready next`, or `Control hardening queue` below, and only when a real WIP slot exists.
- GitHub issue/PR state outranks stale document wording.
- When a ticket merges/closes, remove it from `Active` on the next control sync.
- The normal WIP cap remains three. A temporary incident/control overflow must be explicitly documented and blocks admission of further work until active WIP is below the cap.
- One lane may not edit another lane's source-of-truth surface merely to move faster.
- L1 owns rendering/media infrastructure; L2 factual/provenance; L3 opportunity/measurement; L4 presentation/experiments; L5 lifecycle/publishing.
- Canonical research objects and governed upstream evidence remain factual authority.
- Every distribution asset must retain canonical source URL/content hash and the exact approved factual/limitation boundary.
- Missing production/external metrics remain `Unknown`, never zero and never inferred success.
- Positive performance feedback must preserve the existing minimum-exposure threshold and may re-rank only already-eligible opportunities.
- The backlog keeps exactly one score formula. Dependency-unlock value belongs inside Strategic Leverage; stale external assumptions reduce Confidence or force revalidation before promotion.
- Externally contingent work must expose a current `last_verified` date/scope at promotion time once #4413 lands; stale hypotheses may not remain perpetually `Ready` by inertia.
- Before repeating a governed experiment once #4414 lands, check durable experiment history; a materially equivalent prior test requires a named changed assumption/retest condition.
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

## Active — WIP 3/3, admission closed

| Lane / surface | Issue / PR | Ticket | Status | Must prove before merge |
|---|---|---|---|---|
| O / control | #4413 / PR #4469 | Freshness- and unlock-aware prioritization | In Review | Single score formula, freshness/revalidation, deterministic replay, hard safety overrides, exact-head hosted gates |
| L2 factual/provenance | #4476 / PR #4475 | Bind canonical evidence grade into claims | In Review | Exact canonical grade projection, substitution rejection, existing safety/provenance regressions, hosted gates |
| L4 presentation/experiments | #4477 / PR #4478 | Evidence-safe creative template catalog | In Review | Governed-field requirements, citation/disclosure preservation, no factual inference, deterministic template regressions, hosted gates |

PR #4481 / #4482 is separately staged research-only draft input, not a runtime implementation or approved public content. Its source-registry provenance blocker remains explicit. It does not create spare implementation capacity or authorize scientific promotion.

## Ready next — strict dependency order

**A free slot exists only when the candidate's dependencies and lane ownership are current and no higher-risk incident overrides admission.**

### 3. L3 — #4407 attributable outcome ingestion

**Start when:** the merged #4406 lifecycle receipt contract remains stable and a true WIP slot exists.

**Required result:**

- canonical observation schema keyed to campaign/asset/platform/format/source/hash/receipt/window;
- deterministic normalization and replay;
- missing/stale/mismatched/duplicate observations remain Unknown/rejected;
- platform results stay attribution-separated;
- existing anti-saturation and duplicate-angle penalties continue to work without performance data;
- positive rewards remain impossible below the existing ≥250 measured-view threshold;
- performance feedback cannot alter scientific eligibility, claims, evidence grades, limitations, safety, or canonical content.

### 4. First bounded pilot package

**Start when:** L1/L2/L4 + merged #4406 + #4407 boundaries are proven.

The first pilot should use already-governed research, deterministic assets, tagged destinations, durable lifecycle receipts, and an explicit observation window. It may be published only through a supported, attributable, policy-compliant path. If no provider integration/credentials are available, the sprint may complete the end-to-end dry-run and record the external execution blocker rather than inventing a live result.

## Control hardening queue — after the immediate chain or when dependency-safe

These are durable second-order improvements, not reasons to block scientific/production incidents or invent a fourth permanent workstream.

#4413 is already owned by PR #4469 in `Active`; do not start a second implementation.

### #4414 — durable experiment-learning ledger

- Stable experiment identity and append-only/auditable history.
- Distinguish positive, negative, null, underpowered, invalid, and Unknown.
- Detect materially equivalent prior experiments before promotion.
- Retest requires a named changed assumption and fresh baseline.
- The ledger is experiment history only, never scientific authority or a second score.

### #4415 — marginal resource economics

- Connect qualified outcomes to real resource denominators where available: engineering/operator time, CI runner minutes, asset count, maintained surfaces, or supplied tool spend.
- Every ratio names source, numerator/denominator definitions, scope, and window.
- Missing labor/cost/outcome values remain Unknown unless explicitly labeled estimates.
- Sustained deterioration in marginal qualified outcomes, attribution, or trust/maintenance cost triggers stop/pivot rather than automatic scaling.

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
- #4413, #4414, and #4415 are durably queued with their single-formula/freshness, experiment-memory, and marginal-efficiency boundaries preserved; they are not required to fake completion of the distribution MVP.
- No broad auto-publishing or high-volume scheduling is enabled merely because the technical chain exists.
- Revenue/GSC/analytics blockers remain honestly labeled and do not silently satisfy M1/M2 exits.
- Backlog and sprint agree with current GitHub state: no completed issue or merged PR occupies an active slot.
- Required scientific, provenance, safety, accessibility, release, and exact-head validation gates remain intact.

## Recently retired from this sprint

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