# Current Sprint

**Status:** Authoritative immediate execution queue
**Sprint:** Governed Distribution MVP + Measurement Foundation
**Updated:** 2026-08-27
**Normal WIP limit:** Maximum three concurrent implementation tickets. The Evidence → Distribution initiative may use separate lanes only when scopes are orthogonal and one ticket per lane is active.
**Temporary exception:** PR #4411 / issue #4410 is a scoped CI/control throughput repair opened after three distribution tickets were already active. Current implementation WIP is therefore **4/3**. This does not change the permanent cap: **admission is frozen; no fifth implementation ticket may start, and no slot is refilled until active WIP falls below three.**

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

## Active — temporary WIP 4/3, admission frozen

| Lane / surface | Issue / PR | Ticket | Status | Must prove before merge |
|---|---|---|---|---|
| Control / CI | #4410 / PR #4411 | Changed-file-relevant medium-risk merge gates | In Review — temporary WIP exception | Medium-risk distribution/media requires targeted Research Distribution + core validation; public-site changes retain site/content gates; high-risk work remains full-gate; any known completed failure still blocks; exact-head/current-base proof remains mandatory |
| L1 Rendering | #4389 / PR #4388 | Deterministic provenance-bound SVG carousel renderer | In Review | Identical validated inputs → byte-stable SVGs/manifest hashes; source URL/content hash retained; no factual rewrite/truncation; oversized copy fails closed; Research Distribution + release gates green |
| L2 Provenance | #4400 / PR #4401 | Field-level factual provenance receipts | In Review | Finding/limitation and canonically owned study context map to exact canonical field/hash; null context is not fabricated; tampering fails; whole-object stale invalidation remains intact |
| L4 Presentation | #4404 / PR #4405 | Lossless creative presentation adapter | In Review | Ordered continuation slides reconstruct governed factual copy exactly; citations/color/safe-area metadata survive every continuation; no ellipsis, drop, reorder, paraphrase, or rewrite |

## Ready next — strict dependency order

**Do not start any item below while active WIP is 3 or more.** A free slot exists only after active WIP falls to two or fewer.

### 1. O/control — #4412 machine reconciliation

**Start when:** #4411 is merged/stable and a true WIP slot exists.

**Required result:**

- deterministic comparison of active/ready control-doc issue/PR identifiers against exact GitHub state;
- merged/closed active work, duplicate ownership, WIP overflow, and cross-document contradictions are surfaced as failures/drift;
- temporary WIP exceptions must be explicit and admission-blocking;
- unavailable GitHub state yields `Unknown/waiting`, never fake PASS;
- the checker is read-only with respect to GitHub/scientific/public data;
- current exact-main control documents reconcile cleanly after intentional exceptions are represented.

### 2. L5 — #4406 governed ready → publish → measured lifecycle

**Start when:** the renderer and presentation boundaries it consumes are merged/stable enough to bind exact asset identity, and a true WIP slot exists.

**Required result:**

- one canonical lifecycle for generated/validated/ready/scheduled/published/measured (or the smallest equivalent compatible state model);
- state transitions bound to exact upstream research-object, pack, creative, render-manifest, destination, platform/format, and attribution identity;
- stale assets fail closed;
- idempotent scheduling/publishing with durable receipts;
- duplicate attempts cannot create duplicate publication;
- partial/external failures are explicit and retry-safe;
- pause/stop/rollback semantics exist before scale;
- dry-run is the default; absent provider credentials/support yields a waiting state, not fake success;
- no scientific or canonical-site mutation.

### 3. L3 — #4407 attributable outcome ingestion

**Start when:** #4406 provides a stable publication/asset receipt identity and a true WIP slot exists.

**Required result:**

- canonical observation schema keyed to campaign/asset/platform/format/source/hash/receipt/window;
- deterministic normalization and replay;
- missing/stale/mismatched/duplicate observations remain Unknown/rejected;
- platform results stay attribution-separated;
- existing anti-saturation and duplicate-angle penalties continue to work without performance data;
- positive rewards remain impossible below the existing ≥250 measured-view threshold;
- performance feedback cannot alter scientific eligibility, claims, evidence grades, limitations, safety, or canonical content.

### 4. First bounded pilot package

**Start when:** L1/L2/L4 + #4406 + #4407 boundaries are proven.

The first pilot should use already-governed research, deterministic assets, tagged destinations, durable lifecycle receipts, and an explicit observation window. It may be published only through a supported, attributable, policy-compliant path. If no provider integration/credentials are available, the sprint may complete the end-to-end dry-run and record the external execution blocker rather than inventing a live result.

## Control hardening queue — after the immediate chain or when dependency-safe

These are durable second-order improvements, not reasons to block scientific/production incidents or invent a fourth permanent workstream.

### #4413 — freshness- and unlock-aware prioritization

- Keep the existing backlog formula unchanged.
- Define dependency-unlock value inside Strategic Leverage.
- Require current verification scope/date for externally contingent ranked assumptions.
- Stale evidence lowers Confidence or requires revalidation before promotion.
- Replay of identical inputs must produce identical queue order.

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

These items are **not active while WIP is full/overflowing**. Promote one only after checking overlap, current exact-main state, and freshness of the evidence supporting promotion.

1. **#4227** — reduce duplicated full production exports without weakening exact-SHA fail-closed validation; also supplies resource observations useful to #4415.
2. **SEO-003** — reproduce and clear the current schema identity gate.
3. **AUTH-001** — resolve verified duplicate-intent owners using current route/query evidence.
4. **#4266 / #4260** — governed recent-evidence enrichment under the existing governor/lease/provenance contract.

## Sprint exit conditions

The sprint exits only when all of the following are true or have a precise external blocker:

- PRs #4388, #4401, and #4405 are merged or explicitly blocked with exact failing proof; no stale active status remains in control docs.
- PR #4411 / #4410 is merged or explicitly blocked, and active implementation WIP is again within the normal three-ticket cap.
- #4412 either proves machine reconciliation or has a precise blocker/queued continuation that does not leave known stale active state unresolved.
- The governed research object → validated pack → lossless creative plan → deterministic rendered asset chain is reproducible and provenance-bound.
- #4406 proves an idempotent dry-run lifecycle with stale-asset rejection, durable receipts, retry safety, and rollback/stop semantics.
- #4407 proves deterministic attributable observation ingestion, Unknown handling, replay, cross-platform isolation, and the existing minimum-exposure guard.
- A bounded pilot package can be generated end-to-end and is measurement-ready; live publication is optional only if a supported/authorized provider path exists.
- #4413, #4414, and #4415 are durably queued with their single-formula/freshness, experiment-memory, and marginal-efficiency boundaries preserved; they are not required to fake completion of the distribution MVP.
- No broad auto-publishing or high-volume scheduling is enabled merely because the technical chain exists.
- Revenue/GSC/analytics blockers remain honestly labeled and do not silently satisfy M1/M2 exits.
- Backlog and sprint agree with current GitHub state: no completed issue or merged PR occupies an active slot.
- Required scientific, provenance, safety, accessibility, release, and exact-head validation gates remain intact.

## Recently retired from this sprint

- **PR #4408 / #4409:** merged/closed; roadmap, sprint, and master backlog synchronized to exact GitHub state on 2026-08-27.
- **#4182:** closed/completed; five herb/compound identity correction is no longer active.
- **#4238:** closed/completed; normalized source-registry provenance continuation is no longer active.
- **AUTH-004 / PR #4145:** merged; visual browse refinement is no longer active.
- **SEO-005 / PR #4331:** merged; monitor remains file-fed until a supported Bing AI Performance acquisition path exists.
- **I18N-001 / PR #4332:** merged; Japanese/Korean core localization is live while detailed scientific profiles remain fail-closed.
- **REV-005 / PR #4358:** merged; the validated media-pack foundation is now upstream infrastructure for this sprint.