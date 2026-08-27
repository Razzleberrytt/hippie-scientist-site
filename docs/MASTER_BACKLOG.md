# Master Backlog

**Status:** Authoritative ranked backlog
**Updated:** 2026-08-27
**Immediate work:** Only tickets present in [CURRENT_SPRINT.md](CURRENT_SPRINT.md) may be started. Closed/completed work must be removed from active sections on the next control-plane sync.

## Scoring and gates

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

Business impact, user value, traffic potential, strategic leverage, and effort use 1–5. Confidence is 0.50, 0.75, or 1.00. Higher is better; effort is the denominator. Dependencies and evidence/safety/provenance/disclosure/accessibility/security/release gates override numeric score.

The formula remains singular. **Strategic Leverage explicitly includes dependency-unlock value**: shared infrastructure, recurring throughput unlocked, and the number/importance of otherwise blocked high-value items may raise that existing input. **Confidence is freshness-sensitive**: when a ranked item's score depends on external demand, production state, analytics, platform behavior, or an unresolved technical assumption, the item must carry a current `last_verified` date/scope before promotion. Stale assumptions lower Confidence or force revalidation; they do not receive a hidden bonus or a second score. Safety, scientific correctness, production incidents, accessibility blockers, and other hard gates are never weakened by freshness mechanics.

Workstreams remain **D** Discovery/SEO, **R** Revenue/Conversion, **A** Authority/Content, and **O** Operations. The Evidence → Distribution initiative is one Revenue/Growth initiative with five orthogonal implementation lanes: **L1 rendering/media infrastructure, L2 factual/provenance, L3 opportunity/measurement, L4 presentation/experiments, L5 lifecycle/publishing**. One active ticket per lane is allowed only when scopes are demonstrably non-overlapping and the overall sprint WIP limit is respected.

### Backlog hygiene rules

- GitHub issue/PR state outranks stale prose in this file.
- A merged/closed item may remain only in a completed/history section, never in `Now`.
- An open PR that already owns a problem outranks creating a duplicate ticket.
- The normal sprint WIP cap is three implementation tickets. If an urgent control/incident repair temporarily causes overflow, the exception must be explicit and **admission freezes until active WIP falls below the cap**; temporary overflow never silently raises the permanent limit.
- External-access blockers stay explicit; they do not become fake PASS states and do not freeze unrelated legal work.
- Externally contingent ranked work must expose a current `last_verified` scope/date before promotion. Stale evidence lowers Confidence or requires revalidation.
- Strategic Leverage may reflect dependency-unlock value; no separate unlock score is permitted.
- Before promoting an experiment, check the durable experiment-learning history once #4414 lands. A materially equivalent prior test requires an explicit changed assumption/retest condition.
- Observed attributable outcomes may update Business Impact, Traffic Potential, Strategic Leverage, or Confidence; they do not create a second scoring formula.
- Scale decisions should prefer **marginal qualified outcome per incremental resource** over gross output when the required observations exist. Missing effort/cost/outcome data remains `Unknown`, never invented.
- Safety/scientific correctness, publication integrity, production incidents, security, accessibility blockers, and crawl/indexing regressions may override numeric ordering.
- No broad auto-publishing is authorized until factual fidelity, attribution, lifecycle receipts, rollback, measurement quality, and channel-policy checks are proven.

## Now — active exact work

**Temporary WIP exception: 4/3. Admission is frozen.** PR #4411 is a scoped CI/control throughput repair opened after the three distribution lanes were already active. It does not raise the normal cap. No fifth implementation ticket may start; after any active ticket merges/closes, do not refill a slot until active WIP is below three.

| ID | Title | WS/Lane | Status | Priority | BI/UV/TP/SL/C/E | Score | Dependencies | Acceptance / proof boundary |
|---|---|---|---|---|---|---:|---|---|
| #4410 / PR #4411 | Make medium-risk merge gates changed-file relevant | O / control | In Review — temporary WIP exception | P0 throughput | 4/4/3/5/1/2 | 120.0 | Existing autonomous merge controller + exact-head workflow evidence | Distribution/media changes wait for targeted Research Distribution/core validation, public-site changes retain site/content gates, high-risk work remains full-gate, and any known completed failure still blocks |
| #4389 / PR #4388 | Render deterministic provenance-bound SVG carousels | R / L1 | In Review | P0 | 5/5/5/5/1/3 | 208.3 | Validated media pack + validated-lossless creative spec | Deterministic SVG bytes/manifest hashes; canonical source/content-hash provenance on every asset; no renderer rewrite/truncation; exact-head Research Distribution and release gates green |
| #4400 / PR #4401 | Add field-level factual provenance receipts | R / L2 | In Review | P0 | 4/5/4/5/1/2 | 200.0 | Canonical research object + Distribution Pack v1 | Every factual payload maps to the exact owned canonical field/hash; null context remains null; tampering fails closed; no new factual authority |
| #4404 / PR #4405 | Wire lossless pagination into creative presentation output | R / L4 | In Review | P0 trust | 4/5/4/5/1/2 | 200.0 | Merged lossless pagination contract | Long finding/limitation copy reconstructs exactly across ordered continuations; citations/safe areas/color contracts survive; no ellipsis/paraphrase/drop of factual copy |

## Next — ordered dependency queue

Start the highest legal item only after the temporary WIP overflow has cleared and a real slot exists. Do not bypass a dependency merely because a lower-level implementation is easy.

| ID | Title | WS/Lane | Status | Priority | BI/UV/TP/SL/C/E | Score | Dependencies / freshness | Acceptance / proof boundary |
|---|---|---|---|---|---|---:|---|---|
| #4412 | Machine-reconcile roadmap, sprint, and backlog against GitHub state | O / control | Ready after #4411 + WIP slot | P0 control | 4/4/3/5/1/2 | 120.0 | #4411 stable; current GitHub state | Deterministically detect merged/closed active work, duplicate ownership, WIP overflow, cross-doc contradictions, and offline/Unknown state without mutating GitHub or scientific/public data |
| #4406 | Add governed ready → publish → measured lifecycle | R / L5 | Ready after renderer/creative integration | P0 | 5/4/5/5/1/2 | 250.0 | Validated pack, creative spec, asset manifest, attribution identity | One idempotent provenance-bound lifecycle; stale assets rejected; dry-run default; durable publish receipts; retry/partial-failure/rollback semantics; no broad auto-posting |
| #4407 | Ingest attributable asset outcomes into feedback loop | R / L3 | Ready after lifecycle receipt contract | P0 | 5/4/5/5/.75/2 | 187.5 | #4406 receipt identity + existing feedback engine | Deterministic observation schema/replay; Unknown instead of invented zero; cross-platform isolation; existing 250-view positive-reward threshold preserved; feedback can re-rank only already-eligible opportunities |
| #4413 | Make prioritization freshness- and unlock-aware without a second score | O / control | Planned | P1 compounding | 3/3/3/5/1/2 | 67.5 | #4412 preferred; revalidate exact-main assumptions at start | Strategic Leverage explicitly carries unlock value; externally contingent items expose `last_verified`; stale evidence reduces Confidence/forces revalidation; replayed inputs produce the same queue |
| #4414 | Add durable experiment-learning ledger and anti-repeat guard | R/O / L4 learning | Planned | P1 learning | 3/4/3/4/.75/2 | 54.0 | #4407 observations preferred; current experiment contracts | Stable experiment identity; positive/negative/null/underpowered/invalid/Unknown states; prior-test detection; legitimate retest requires changed assumption; scientific authority remains separate |
| #4415 | Add marginal outcome-per-effort economics to scaling decisions | R/O measurement | Planned | P1 scale economics | 4/4/4/5/.75/3 | 80.0 | #4227 and/or #4407 observations; REV data when available | Reproducible qualified-outcome/resource ratios with named inputs/windows; missing values Unknown; gross throughput cannot justify scale when marginal efficiency/trust deteriorates |
| #4227 | Deduplicate uncached production exports across PR workflows | O | Planned | P1 compounding | 3/3/2/5/1/2 | 45.0 | Preserve fail-closed exact-SHA validation; `last_verified` at promotion | Quantify duplicated runner minutes; exact-SHA reusable artifact/cache or equivalent; cache miss performs full governed build; no quality thresholds weakened |
| SEO-003 | Clear current schema identity gate | D | Ready | P1 | 4/4/4/4/1/2 | 128.0 | Reproduce current exact-main failure immediately before promotion | First-party identity IDs are consistent and full schema policy passes; route/schema regressions and production build prove the fix |
| AUTH-001 | Resolve verified duplicate-intent route pairs | A | Ready | P1 | 4/4/4/4/.75/2 | 96.0 | Revalidate current route/query evidence before promotion | Each pair has one owner or a genuinely distinct user job; removed owners get direct redirects; internal links/canonicals point to winner |
| #4266 | Evaluate 2026 KSM-66 Ashwagandha safety RCT | O/A evidence | Planned | P1 evidence | 4/5/3/5/.75/3 | 75.0 | Governor lease + provenance/source review; revalidate source status at start | Preserve formulation, dose, duration, population, null findings, limitations, funding/product-supply context; no broad safety or efficacy generalization |
| #4260 | Add 2026 healthy-adult CBD safety meta-analysis | O/A evidence | Planned | P1 evidence | 4/5/3/5/.75/3 | 75.0 | Governor lease + source dedupe; revalidate source status at start | Preserve short-term healthy-adult scope, diarrhea signal and null findings; no general dose or long-term safety reassurance |
| DOC-002 | Continuously triage open issues against authoritative queue | O | Continuous maintenance until #4412 replaces manual detection | P2 | 3/3/2/5/1/2 | 45.0 | Current GitHub state | Every open issue is current, duplicate, superseded, blocked, historical, or queued; stale closed work never occupies `Now` |

## Blocked — important but not startable

| ID | Title | WS | Status | Score | Blocker / next legal action |
|---|---|---|---|---:|---|
| REV-001 / #4280 | Verify production analytics and governed funnel events | R | Blocked external access | 400.0 | Authorized production environment + GA4/Ahrefs receipt evidence; code readiness already merged, but production receipt remains Unknown |
| SEO-004 | Import aligned 28-day GSC opportunity baseline | D | Blocked external access | 375.0 | Search Console/service-account access or dated export |
| REV-002 | Establish aligned funnel/revenue baseline | R | Blocked external access | 375.0 | REV-001 plus GA4/Amazon/Mailchimp data; partial source-level observations may still be recorded honestly |
| REV-003 | Select one flagship commercial decision page | R | Blocked | 375.0 | SEO-004 + REV-002 aligned data |
| SEO-002 | Recover reviewed flagship profile source roles | D | Blocked review dependency | 117.2 | Review existing source-role work before duplicating; never force indexability |
| AUTH-003 | Upgrade selected flagship decision page | A | Blocked | 117.2 | REV-003/REV-004 + evidence review |
| REV-004 | Validate flagship disclosure/destinations | R | Blocked | 67.5 | REV-003 selected page |
| AUTH-002 | Strengthen links to selected flagship | A | Blocked | 54.0 | REV-003 selected page |
| #4014 | Enforce `main` branch protection/ruleset | O | Blocked external settings | — | Authorized repository settings action; documentation alone is not enforcement |
| #4341 | Resolve recurring Cloudflare production deployment failure class | O | Blocked external logs | — | Inspect Cloudflare production logs/failed deployment class, then repair only if repository/config root cause is proven |

## Later — only after dependency proof

| ID | Title | WS | Status | Dependency / stop rule |
|---|---|---|---|---|
| DIST-VIDEO-001 | Deterministic 30-second vertical-video renderer | R/L1 | Planned | Carousel renderer/lossless presentation/lifecycle contracts proven; factual narration remains governed |
| DIST-GEN-001 | Optional generative B-roll adapter | R/L1/L4 | Planned | Generated media remains visual-only and non-authoritative; no need to implement before measurable distribution MVP |
| ENGINE-001 | Codify repeatable decision-page qualification/proof | A | Planned | Requires M2 flagship result; avoid template-driven filler |
| CLUSTER-001 | Expand one validated authority cluster | A | Planned | Requires demand + repeatable page engine + positive marginal qualified outcomes |
| AUTO-001 | Automate publication-governance anomaly reporting | O | Planned | Stable truth and known baselines first |
| EMAIL-001 | Validate/optimize email conversion journey | R | Planned | REV-001/002 + Mailchimp access |
| PARTNER-001 | Evidence-safe partnership policy/pilot | R | Planned | Proven decision/growth economics; independence/disclosure safeguards |

## Recently completed / retired from active queue

These are capability proofs, not claims of business impact.

| Item | Verified disposition |
|---|---|
| PR #4408 / #4409 | Merged/closed — roadmap, sprint, and backlog synchronized to exact GitHub state on 2026-08-27 |
| REV-005 / PR #4358 | Merged — governed media-pack contract established |
| PR #4371 | Merged — canonical research-distribution builder emits validated media packs |
| PR #4381 | Merged — claim-safe downstream factual-copy lint |
| PR #4382 | Merged — deterministic governed opportunity-selection MVP |
| PR #4384 | Merged — first governed Ashwagandha research object |
| PR #4387 | Merged — lossless governed-copy pagination |
| PR #4391 | Merged — deterministic attribution/discoverability metadata |
| PR #4394 | Merged — feedback-aware opportunity guardrails |
| PR #4395 | Merged — formulation/duration study context preserved when canonically owned |
| PR #4397 | Merged — trust-preserving creative experiment identity/immutability contract |
| PR #4399 | Merged — positive performance reward requires ≥250 measured views |
| PR #4402 | Merged — roadmap optimized for measured scaling and bounded early distribution pilots |
| #4238 | Closed/completed — normalized source-registry baseline/provenance continuation no longer active |
| #4182 | Closed/completed — five herb/compound identity correction no longer active |
| AUTH-004 / PR #4145 | Merged — canonical visual refinement across Herbs/Compounds browse surfaces |
| SEO-005 / PR #4331 | Merged — Bing AI citation incident monitor; real export remains an operator input |
| I18N-001 / PR #4332 | Merged — Japanese/Korean core locale expansion with detailed profiles still fail-closed |

## Legacy backlog disposition

Historical `backlog/`, `ops/backlog/`, old sprint tickets, and old open issues are discovery inputs, not execution queues. Revalidate the underlying problem against current `main`, current production, current analytics, current experiment history where applicable, and current PR overlap before promoting anything here. A large backlog is useful only if the top is trustworthy.