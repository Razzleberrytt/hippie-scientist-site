# Master Backlog

**Status:** Authoritative ranked backlog
**Updated:** 2026-08-29
**WIP cap:** 3

**Control dependencies:** #4412 <- #4411; #4406 <- #4388, #4401, #4405; #4407 <- #4406
**Immediate work:** Only tickets present in [CURRENT_SPRINT.md](CURRENT_SPRINT.md) may be started. Closed/completed work must be removed from active sections on the next control-plane sync.

## Scoring and gates

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

Business impact, user value, traffic potential, strategic leverage, and effort use 1–5. Confidence is 0.50, 0.75, or 1.00. Higher is better; effort is the denominator. Dependencies and evidence/safety/provenance/disclosure/accessibility/security/release gates override numeric score.

The formula remains singular. **Strategic Leverage explicitly includes dependency-unlock value**: shared infrastructure, recurring throughput unlocked, and the number/importance of otherwise blocked high-value items may raise that existing input. **Confidence is freshness-sensitive**: when a ranked item's score depends on external demand, production state, analytics, platform behavior, or an unresolved technical assumption, the item must carry a current `last_verified` date/scope before promotion. Stale assumptions lower Confidence or force revalidation; they do not receive a hidden bonus or a second score. Safety, scientific correctness, production incidents, accessibility blockers, and other hard gates are never weakened by freshness mechanics.

Normal workstreams under `AGENTS.md` are **D** Discovery/SEO, **R** Revenue/Conversion, and **A** Authority/Content, with one active ticket per workstream. **O** Operations remains a classification, not a fourth normal workstream. The Evidence → Distribution surfaces—**L1 rendering/media infrastructure, L2 factual/provenance, L3 opportunity/measurement, L4 presentation/experiments, L5 lifecycle/publishing**—describe ownership, not permission for concurrent Revenue/Conversion tickets.

### Backlog hygiene rules

- GitHub issue/PR state outranks stale prose in this file.
- A merged/closed item may remain only in a completed/history section, never in `Now`.
- An open PR that already owns a problem outranks creating a duplicate ticket.
- The normal sprint WIP cap is three implementation tickets. If an urgent control/incident repair temporarily causes overflow, the exception must be explicit and **admission freezes until active WIP falls below the cap**; temporary overflow never silently raises the permanent limit.
- External-access blockers stay explicit; they do not become fake PASS states and do not freeze unrelated legal work.
- Externally contingent ranked work must expose a current `last_verified` scope/date before promotion. Stale evidence lowers Confidence or requires revalidation.
- Strategic Leverage may reflect dependency-unlock value; no separate unlock score is permitted.
- Before promoting an experiment, check the durable experiment-learning history from merged #4414. A materially equivalent prior test requires an explicit changed assumption/retest condition.
- Observed attributable outcomes may update Business Impact, Traffic Potential, Strategic Leverage, or Confidence; they do not create a second scoring formula.
- Scale decisions should prefer **marginal qualified outcome per incremental resource** over gross output when the required observations exist. Missing effort/cost/outcome data remains `Unknown`, never invented.
- Safety/scientific correctness, publication integrity, production incidents, security, accessibility blockers, and crawl/indexing regressions may override numeric ordering.
- No broad auto-publishing is authorized until factual fidelity, attribution, lifecycle receipts, rollback, measurement quality, and channel-policy checks are proven.

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

No implementation ticket is currently recorded as active in this control snapshot. Admission remains governed by [CURRENT_SPRINT.md](CURRENT_SPRINT.md), the one-ticket-per-workstream rule, dependency/freshness checks, and the normal WIP cap. Research-only staging under the dedicated Research Enrichment Session contract remains separate from canonical implementation/promotion WIP.

## Next — ordered dependency queue

Start the highest legal item only when a real WIP slot exists. Do not bypass a dependency merely because a lower-level implementation is easy.

| ID | Title | WS/Lane | Status | Priority | BI/UV/TP/SL/C/E | Score | Dependencies / freshness | Acceptance / proof boundary |
|---|---|---|---|---|---|---:|---|---|
| #4227 | Deduplicate uncached production exports across PR workflows | O | Planned | P1 compounding | 3/3/2/5/1/2 | 45.0 | Preserve fail-closed exact-SHA validation; `last_verified` at promotion | Quantify duplicated runner minutes; exact-SHA reusable artifact/cache or equivalent; cache miss performs full governed build; no quality thresholds weakened |
| SEO-003 | Clear current schema identity gate | D | Ready | P1 | 4/4/4/4/1/2 | 128.0 | Reproduce current exact-main failure immediately before promotion | First-party identity IDs are consistent and full schema policy passes; route/schema regressions and production build prove the fix |
| AUTH-001 | Resolve verified duplicate-intent route pairs | A | Ready | P1 | 4/4/4/4/.75/2 | 96.0 | Revalidate current route/query evidence before promotion | Each pair has one owner or a genuinely distinct user job; removed owners get direct redirects; internal links/canonicals point to winner |
| #4266 | Evaluate 2026 KSM-66 Ashwagandha safety RCT | O/A evidence | In Review (research staging PR #4631) | P1 evidence | 4/5/3/5/.75/3 | 75.0 | Governor lease + provenance/source review; revalidate source status at start | Preserve formulation, dose, duration, population, null findings, limitations, funding/product-supply context; no broad safety or efficacy generalization |
| #4260 | Add 2026 healthy-adult CBD safety meta-analysis | O/A evidence | Planned | P1 evidence | 4/5/3/5/.75/3 | 75.0 | Governor lease + source dedupe; revalidate source status at start | Preserve short-term healthy-adult scope, diarrhea signal and null findings; no general dose or long-term safety reassurance |
| DOC-002 | Continuously triage open issues against authoritative queue | O | Continuous reconciliation maintenance | P2 | 3/3/2/5/1/2 | 45.0 | Current GitHub state | Every open issue is current, duplicate, superseded, blocked, historical, or queued; stale closed work never occupies `Now` |

## Blocked — important but not startable

| ID | Title | WS | Status | Score | Blocker / next legal action |
|---|---|---|---|---:|---|
| REV-001 / #4280 | Verify production analytics and governed funnel events | R | Blocked external access | 400.0 | Authorized production environment + GA4/Ahrefs receipt evidence; code readiness already merged, but production receipt remains Unknown |
| SEO-004 | Import aligned 28-day GSC opportunity baseline | D | Blocked external access | 375.0 | Search Console/service-account access or dated export |
| REV-002 | Establish aligned funnel/revenue baseline | R | Blocked external access | 375.0 | REV-001 plus GA4/GSC/Amazon/Mailchimp data; partial source-level observations may still be recorded honestly |
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
| #4415 / PR #4492 | Merged as 23dc2485720ff6b31043413b2b9295c4886944cb — comparable, explicitly guarded, exposure-bound economics; 42 focused and 2,866 total tests plus real production build/output/SEO passed; actual efficiency observations remain Unknown |
| #4414 / PR #4490 | Merged as 2e67f9e55f4d96dc7d82a683a829a29b4e2298f1 — durable experiment-learning capability; no longer queued; populated history/producer adoption still requires evidence |
| #4477 / PR #4478 | Merged as 2b25ae9beed63afe1e6c045491828e3f096037e4 — creative template catalog; no longer active |
| PR #4491 | Merged as d726f81bc5ababbb024b86782da2e94fbc15989e — governed safety-line preservation; no longer active |
| #4407 / PR #4484 | Merged as 6fba155c6f241af7cee38981c413bde710d56c1b — attributable outcome ingestion; final-head checks passed; real performance observations remain unverified |
| #4413 / PR #4469 | Merged as d0936fbe7d41c84c753a8374f2a7b25047322339 — freshness/unlock-aware prioritization; retired from active ownership |
| #4476 / PR #4475 | Merged as 65605fd2f4e9cfd85af63c14bd2a583471551bf2 — canonical evidence-grade binding; retired from active ownership |
| #4482 / PR #4481 | Research draft staging merged as d6934eacff95b4b9dc1c3c5be2f0c8a91e9bc4a1; not scientific-promotion approval or resolution of its recorded registry blocker |
| PR #4457 | Completed/merged as 95ec9ba285f06c947f2844a2f81abce031b9e437 — complete canonical safety-warning preservation; removed from `Now` |
| #4412 / PR #4446 | Completed/merged as 96a07976dee22cf7b91c337c820cc83ff7e6b860 — machine reconciliation is on main; removed from `Now` |
| #4463 | Completed/merged as f300e0e8f3ef8b9a485f0cbd8c0993725bd425b1 — trust-safe thumbnail variants are on main; removed from `Now` |
| #4460 | Completed/merged as 48bebb81e35c4bd605dedbfc15156cabeb915b06 — duplicate-angle suppression is on main; removed from `Now` |
| #4406 | Completed — governed ready → publish → measured lifecycle merged; removed from `Next` |
| #4439 / PR #4440 | Completed/merged — canonical claim/source binding; removed from `Now` |
| PR #4448 | Closed unmerged — provenance-bound vertical MP4 implementation preserved for later legal reuse and does not occupy active WIP |
| #4447 / PR #4445 | Merged as 692d85d1a496188b4bc48113f8f64b5e94c82098 — opening hook trust contract; no longer active |
| #4410 / PR #4411 | Merged — changed-file-relevant merge gates; temporary overflow exception retired |
| PRs #4388, #4401, #4405 | Merged — renderer, factual receipts, and lossless presentation; implementation no longer active |
| PR #4408 / #4409 | Merged/closed — roadmap, sprint, and master backlog synchronized to exact GitHub state on 2026-08-27 |
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