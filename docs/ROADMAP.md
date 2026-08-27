# Roadmap

**Status:** Authoritative milestone plan
**Last updated:** 2026-08-27
**Change tracking:** #4403; execution sync 2026-08-27
**Planning rule:** A milestone is complete only when every exit condition has reproducible proof. Dates are intentionally omitted until dependencies and throughput are measured.
**Scaling rule:** Once verified user or commercial outcomes exist, observed attributable behavior outranks speculative opportunity. Evidence, safety, disclosure, provenance, publication, accessibility, security, and release gates remain non-negotiable and cannot be overridden by traffic or revenue.

## Status summary

| Milestone | Status | Current constraint |
|---|---|---|
| M0 — Project Control Reset | In progress | Control documents are being kept synchronized, but production measurement remains only partially observable and external enforcement/logging gaps remain |
| M1 — Revenue Foundation | In progress | Partial source-level observations may be recorded; aligned GA4/GSC/affiliate measurement and production receipt still require authorized access; governed distribution MVP is an acceleration track inside M1 |
| M2 — First Proven Organic Revenue Loop | Blocked | Requires an aligned attributed baseline and one evidence-safe flagship; isolated affiliate or distribution outcomes do not prove the organic loop |
| M3 — Repeatable Decision-Page Engine | Not started | Requires one measured, evidence-safe flagship result |
| M4 — Authority Expansion | Not started | Requires validated topics, repeatable page standard, and positive marginal qualified outcomes |
| M5 — Growth Engine | Not started | Full multi-channel scaling requires proven acquisition/conversion economics; bounded attributable distribution learning may begin earlier |
| M6 — Scale | Not started | Requires stable quality controls, repeatable growth, and evidence that increased throughput still produces proportional qualified outcomes |

## Current execution emphasis — 2026-08-27

The highest-leverage unblocked work is completing the governed Evidence → Distribution MVP while preserving the M0/M1 measurement blockers as explicit Unknowns rather than letting them freeze unrelated progress.

Current dependency chain:

1. **L1 rendering — #4389 / PR #4388:** deterministic provenance-bound SVG carousel assets and manifest.
2. **L2 provenance — #4400 / PR #4401:** exact field-level provenance receipts for every governed factual payload.
3. **L4 presentation — #4404 / PR #4405:** lossless factual continuation so presentation never shortens or drops findings/limitations.
4. **L5 lifecycle — #4406:** one idempotent `ready → publish → measured` lifecycle with stale-asset rejection, durable receipts, retry safety, dry-run default, pause/rollback, and no broad auto-posting.
5. **L3 measurement — #4407:** attributable asset-outcome ingestion into the existing feedback engine with Unknown handling, replayability, cross-platform isolation, and the existing minimum-exposure guard.
6. **Bounded pilot:** only after the above boundaries are proven, create one small attributable pilot package from already-governed research. Live publication requires a supported/authorized provider path; otherwise complete the end-to-end dry-run and record the external blocker.

This chain does **not** advance M1 or M2 by itself. It establishes a controlled acquisition-learning capability that can generate evidence for later milestone decisions.

## Scaling flywheel

The project should scale a measured decision system, not page count or content volume.

1. **Discover demand** — identify verified search, referral, social, email, or direct demand.
2. **Route to a decision surface** — move the visitor toward a useful goal, comparison, profile, or buying-decision journey.
3. **Create a qualified action** — earn a deeper evidence view, comparison, affiliate click, email signup, or other explicit next step without weakening editorial independence.
4. **Observe the outcome** — record orders/revenue only when the supplying network reports them; never infer revenue from clicks.
5. **Learn the economics** — compare traffic, engagement, outbound behavior, conversion, revenue efficiency, and operating cost over a fixed window.
6. **Re-rank the backlog** — use observed outcomes to refine Business Impact, Traffic Potential, and Confidence in the existing backlog score rather than introducing a second formula.
7. **Compound the winner** — improve the winning page, supporting cluster, internal links, distribution assets, and retention path before broadening supply.
8. **Apply stop rules** — stop or pivot when marginal outcome quality declines, attribution becomes unreliable, audience/channel fatigue rises, or evidence/safety/quality debt increases.

### Measurement hierarchy

When available, the scoreboard should connect these layers with exact source and date ranges:

- **Demand:** impressions, clicks, CTR, position, landing sessions, referral/social/email visits.
- **Decision behavior:** goal/quiz starts, comparison interactions, depth-page clicks, CTA exposure, outbound affiliate clicks, affiliate CTR.
- **Commercial efficiency:** network-reported orders, order conversion rate, earnings per affiliate click, revenue per 1,000 sessions, and revenue per 1,000 organic impressions when attribution supports it.
- **Distribution efficiency:** asset exposure/views, completion rate, save/share rate where available, qualified tagged visits, assisted conversions only where source evidence supports them, and operating cost/time per attributable result.
- **Retention:** email signup, return rate, repeat qualified actions.
- **Trust/quality:** evidence coverage, safety coverage, citation/provenance integrity, duplicate-intent rate, publication eligibility, performance, accessibility, and release-gate health.

A metric may be recorded as a **partial baseline** as soon as its source, scope, and date range are known. Partial baselines remain visibly partial and cannot silently satisfy a milestone that requires cross-source attribution.

### Observed-signal prioritization

The existing backlog formula remains authoritative:

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

Verified outcomes refine its inputs instead of creating a second score:

- Attributable orders/revenue may raise confidence only to the extent justified by sample size and repeatability.
- Strong qualified engagement without purchase can raise user-value or traffic confidence while leaving commercial confidence limited.
- Repeated null results reduce confidence and can trigger a pivot even when theoretical traffic potential is high.
- A small number of purchases or high-performing posts is directional evidence, not proof of durable economics.
- Platform-distribution differences remain confounders unless the observation design supports comparison.
- Revenue or reach never increases the score of work that weakens evidence, safety, disclosure, provenance, accessibility, security, or editorial independence.

## Controlled distribution acceleration track

Distribution learning should not wait until M5, but broad autonomous publishing should.

During M1–M4 the project may run **bounded, attributable distribution pilots** around already-governed research and decision assets when all of the following hold:

- the source research object or decision page passed relevant evidence/safety/provenance gates;
- factual claims retain canonical lineage and cannot be strengthened, silently shortened, reordered, or detached from limitations by media transformation;
- the rendered asset is deterministically bound to its source content hash and validated creative contract;
- the lifecycle emits durable attribution/publication receipts and rejects stale assets;
- the pilot has a named source/campaign dimension or other reproducible attribution path;
- the pilot is small enough to stop/withdraw without creating channel or content debt;
- results are measured over a stated window or labeled exploratory when no valid baseline exists;
- missing observations remain Unknown rather than fabricated as zero/success.

Permitted pilot surfaces include evidence-linked infographics, carousels, short-form video, social posts, email modules, outreach assets, and link-earning visuals. These pilots can validate acquisition mechanics early. M5 remains the milestone for repeatable multi-channel growth with proven economics and operating discipline.

Auto-posting or high-volume distribution remains gated until rendering quality, factual fidelity, attribution, lifecycle idempotency, rollback/withdrawal, measurement quality, provider/platform policy, and channel-specific safety checks are proven.

## M0 — Project Control Reset

**Objective:** Establish one operational truth, a small trustworthy queue, reliable validation, and observable growth metrics.

**Success criteria:** control documents agree with live GitHub state; completed work cannot remain active; current release/production failures have scoped owners; production analytics/event configuration is verified or explicitly blocked; publication truth agrees with built robots/sitemap.

**Major deliverables:** charter, current state, roadmap, sprint, master backlog, decisions, docs index, scoreboard, agent rules, CI triage, measurement smoke test, publication-parity audit, backlog-hygiene loop.

**Exit conditions:** all control docs pass review and remain synchronized; active tickets have proof; production build passes or every failure has a current scoped ticket; measurement owners/access are established or explicitly blocked; one post-invariant source reports publication eligibility consistently; stale closed tickets do not occupy WIP.

**Key risks:** stale generated artifacts, overlapping PRs, inaccessible analytics/accounts/logs, and treating governance demotions as ordinary SEO errors.

## M1 — Revenue Foundation

**Objective:** Make commercial and acquisition journeys trustworthy, observable, technically reliable, and ready to learn from partial as well as aligned measurement.

**Success criteria:** consent/affiliate behavior is verified; disclosures precede commercial links; page/CTA/destination dimensions reach analytics; source-level commercial observations are recorded with exact scope; aligned GA4/GSC/affiliate/email reporting exists when access permits; governed distribution can produce attributable pilot-ready assets without creating a second scientific authority.

**Major deliverables:** measurement proof, source-level/aligned baselines, outbound-click baseline, disclosure/destination audit, first page-level funnel report, commercial-efficiency definitions, conversion-path fixes, governed distribution MVP and bounded-pilot readiness.

**Exit conditions:** at least one commercial page has reproducible impression/session → outbound-click measurement; source-reported commercial outcomes are reconciled where available; analytics failures are visible; no unresolved evidence/safety gate exists on the selected page; distribution pilot readiness does not substitute for the aligned-funnel requirement.

**Key risks:** event duplication, consent violations, optimizing generic links without demand data, tiny-sample overfitting, platform vanity metrics, and affiliate incentives influencing editorial decisions.

## M2 — First Proven Organic Revenue Loop

**Objective:** Demonstrate a measurable path from organic impression to decision page, outbound affiliate click, and reported revenue where the affiliate network supplies it.

**Success criteria:** one flagship page is selected from verified demand; query, landing-page, engagement, outbound-click, order, and revenue data are reported for a fixed period where available; changes are compared against a recorded baseline; source-level observations remain distinct from fully attributed outcomes.

**Major deliverables:** opportunity selection, evidence/safety upgrade, internal-link support, conversion UX improvement, measurement window, commercial-efficiency report, result review.

**Exit conditions:** the loop is proven with non-zero qualified outcomes or a well-instrumented null result yields a documented pivot. Revenue is never invented or inferred from clicks. One purchase/revenue event proves feasibility, not repeatability.

**Key risks:** low traffic, attribution gaps, seasonality, small samples, premature conclusions, and changing multiple variables at once.

## M3 — Repeatable Decision-Page Engine

**Objective:** Convert the proven flagship workflow into a repeatable evidence-safe page/upgrade system that optimizes qualified outcomes rather than volume.

**Success criteria:** a reusable brief/template separates outcomes, captures study directness/safety, standardizes disclosure/CTAs, defines measurement/commercial-efficiency fields, and has regressions for prior overclaims/canonical/monetization defects.

**Major deliverables:** qualification rubric, evidence/editorial checklist, product-selection policy, schema/canonical tests, measurement spec, outcome-review template, and two additional validated upgrades.

**Exit conditions:** at least three pages use the system with complete proof; quality gates pass; effort/outcome ranges are known; the project can describe which page characteristics correlate with stronger qualified behavior without claiming causality it cannot establish.

## M4 — Authority Expansion

**Objective:** Strengthen only topic clusters supported by demand, user value, commercial relevance, evidence depth, and observed downstream behavior.

**Success criteria:** gaps are based on query/internal-link evidence; observed outcomes affect confidence without overriding evidence quality; existing pages are upgraded before new pages; every new page has a distinct reader job and canonical owner.

**Exit conditions:** validated clusters gain qualified impressions/clicks and downstream actions without increasing unresolved evidence, safety, duplicate-intent, orphan, or maintenance risk; expansion pauses when marginal qualified outcomes no longer justify cost.

## M5 — Growth Engine

**Objective:** Turn successful bounded acquisition experiments into repeatable distribution and retention around validated decision journeys.

**Success criteria:** internal linking, outreach/backlinks, social/media distribution, email, partnerships, and conversion experiments have named owners, baselines, incremental outcome measures, attribution boundaries, operating-cost measures, and stop rules.

**Major deliverables:** distribution calendar, governed media/publishing pipeline, link-earning assets, email journeys, partnership policy, channel scorecard, controlled conversion tests.

**Exit conditions:** at least two channels beyond on-page SEO produce repeatable qualified visits or conversions with acceptable trust and operating cost; at least one channel can be increased without disproportionate quality, policy, attribution, audience-fatigue, or maintenance debt.

## M6 — Scale

**Objective:** Increase throughput only where measured marginal returns remain positive without scaling risk, duplication, or low-quality output.

**Success criteria:** automation is guarded by validation, rollback, anomaly detection, stale-input rejection, idempotency, and risk-proportional review; routine human approval is not a throughput dependency when equivalent automated governance is proven; quality/revenue/operational metrics remain stable or improve as throughput grows.

**Major deliverables:** marginal-ROI prioritization, guarded automation, quality sampling, anomaly alerts, partner/tooling expansion, capacity planning, and automatic stop/pivot signals for declining economics or trust.

**Exit conditions:** increased throughput produces proportional qualified outcomes without degrading evidence coverage, safety, provenance, performance, accessibility, editorial independence, or attributable commercial efficiency. If throughput grows faster than qualified outcomes for a sustained measured window, the system reduces or redirects expansion rather than continuing by inertia.

**Key risks:** automation amplifying errors, content/distribution sprawl, vendor/platform dependence, measurement gaming, winner overfitting, audience fatigue, and optimizing short-term reach/revenue at the expense of trust.