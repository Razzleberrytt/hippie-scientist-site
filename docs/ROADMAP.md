# Roadmap

**Status:** Authoritative milestone plan
**Last updated:** 2026-08-27
**Planning rule:** A milestone is complete only when every exit condition has reproducible proof. Dates are intentionally omitted until dependencies and throughput are measured.
**Scaling rule:** Once verified user or commercial outcomes exist, observed attributable behavior outranks speculative opportunity. Evidence, safety, disclosure, provenance, publication, and release gates remain non-negotiable and cannot be overridden by traffic or revenue.

## Status summary

| Milestone | Status | Current constraint |
|---|---|---|
| M0 — Project Control Reset | In progress | Production measurement remains only partially observable; schema identity and other scoped release-gate work remain |
| M1 — Revenue Foundation | In progress | Partial source-level commercial observations may be recorded immediately, but the aligned GA4/GSC/affiliate baseline and production receipt still require authorized access |
| M2 — First Proven Organic Revenue Loop | Blocked | Requires an aligned attributed baseline and one evidence-safe flagship; isolated affiliate outcomes do not by themselves prove the organic loop |
| M3 — Repeatable Decision-Page Engine | Not started | Requires one measured, evidence-safe flagship result |
| M4 — Authority Expansion | Not started | Requires validated topics and repeatable page standard |
| M5 — Growth Engine | Not started | Full multi-channel scaling requires proven acquisition and conversion economics, while bounded distribution learning may begin earlier under the acceleration track below |
| M6 — Scale | Not started | Requires stable quality controls, repeatable growth, and evidence that incremental throughput still produces proportional qualified outcomes |

## Scaling flywheel

The project should scale a measured decision system, not page count.

1. **Discover demand** — identify verified search, referral, social, email, or direct demand.
2. **Route to a decision surface** — move the visitor toward a useful goal, comparison, profile, or buying-decision journey.
3. **Create a qualified action** — earn a deeper evidence view, comparison, affiliate click, email signup, or other explicit next step without weakening editorial independence.
4. **Observe the outcome** — record orders and revenue only when the supplying network reports them; never infer revenue from clicks.
5. **Learn the economics** — compare traffic, engagement, outbound behavior, conversion, and revenue efficiency over a fixed window.
6. **Re-rank the backlog** — use observed outcomes to raise or lower confidence and business-impact inputs in the existing backlog score rather than introducing a second competing scoring formula.
7. **Compound the winner** — improve the winning page, then its supporting cluster, internal links, distribution assets, and retention path before broadening supply.
8. **Repeat with stop rules** — stop or pivot when marginal outcome quality declines, attribution becomes unreliable, or safety/evidence/quality debt rises.

### Measurement hierarchy

When available, the scoreboard should connect these layers with exact source and date ranges:

- **Demand:** impressions, clicks, CTR, position, landing sessions, referral/social/email visits.
- **Decision behavior:** goal/quiz starts, comparison interactions, depth-page clicks, CTA exposure, outbound affiliate clicks, affiliate CTR.
- **Commercial efficiency:** network-reported orders, order conversion rate, earnings per affiliate click, revenue per 1,000 sessions, and revenue per 1,000 organic impressions when attribution supports it.
- **Retention/distribution:** email signup and return rate, distribution asset reach, qualified visits, assisted conversions where source evidence exists.
- **Trust/quality:** evidence coverage, safety coverage, citation integrity, duplicate-intent rate, publication eligibility, performance, accessibility, and release-gate health.

A metric may be recorded as a **partial baseline** as soon as its source, scope, and date range are known. Partial baselines must remain visibly partial and cannot silently satisfy a milestone that requires cross-source attribution.

### Observed-signal prioritization

The existing backlog formula remains authoritative:

`Score = (Business Impact × User Value × Traffic Potential × Strategic Leverage × Confidence) / Effort`

Verified outcomes refine its inputs instead of creating a second score:

- Attributable orders or revenue increase confidence in the relevant commercial path only to the extent justified by sample size and repeatability.
- Strong qualified engagement without purchase can increase user-value or traffic confidence while leaving commercial confidence limited.
- Repeated null results reduce confidence and may trigger a pivot even when theoretical traffic potential remains high.
- A small number of purchases is a directional signal, not proof of durable unit economics.
- Revenue never increases the score of work that would weaken evidence, safety, disclosure, provenance, accessibility, security, or editorial independence.

## Controlled distribution acceleration track

Distribution learning should not wait until M5, but broad autonomous publishing should.

Beginning during M1–M4, the project may run **bounded, attributable distribution pilots** around already-governed research and decision assets when the following conditions hold:

- the source research object or decision page has passed the relevant evidence/safety/provenance gates;
- factual claims retain canonical lineage and cannot be strengthened by the media transformation;
- the pilot has a named source/campaign dimension or other reproducible attribution path;
- the pilot is small enough to stop without creating channel or content debt;
- results are compared against a fixed baseline or clearly labeled as exploratory when no baseline exists.

Permitted pilot surfaces include evidence-linked infographics, carousels, short-form video, social posts, email modules, outreach assets, and link-earning visuals. These pilots may validate acquisition mechanics earlier, while M5 remains the milestone for repeatable multi-channel growth with proven economics and operating discipline.

Auto-posting or high-volume distribution remains gated until rendering quality, factual fidelity, attribution, rollback, and channel-specific policy checks are proven.

## M0 — Project Control Reset

**Objective:** Establish one operational truth, a small queue, trustworthy validation, and observable growth metrics.

**Success criteria:** Control documents are authoritative; no more than three workstreams are active; current release failures have scoped owners; production analytics/event configuration is verified or explicitly blocked; a reproducible post-build publication report matches sitemap/robots behavior. The publication-parity condition was verified by SEO-001 in PR #4262.

**Major deliverables:** charter, current state, roadmap, sprint, backlog, decisions, docs index, scoreboard, AGENTS rules, CI triage, measurement smoke test, publication-parity audit.

**Prerequisites:** repository, GitHub, live-site, and build access. Analytics accounts are required for measured values but not for recording the access blocker.

**Exit conditions:** all control docs pass review; top sprint tickets have proof; production build passes or every failure has a current scoped ticket; measurement owners and access are established; one post-invariant source reports profile eligibility consistently.

**Key risks:** stale generated artifacts, overlapping PRs, inaccessible analytics accounts, and treating governance demotions as simple SEO errors.

## M1 — Revenue Foundation

**Objective:** Make commercial journeys trustworthy, observable, technically reliable, and ready to learn from partial as well as aligned measurement.

**Success criteria:** consent behavior and affiliate events are verified; disclosures precede commercial links; page/CTA/destination dimensions reach analytics; affiliate destinations on the selected flagship are valid; GA4/GSC/affiliate/email reporting periods align where access exists; any source-level commercial observations already available are recorded with exact scope instead of being discarded while other sources remain blocked.

**Major deliverables:** measurement proof, source-level and aligned baselines, outbound-click baseline, disclosure audit, destination audit, first page-level funnel report, commercial-efficiency metric definitions, and conversion-path defect fixes.

**Prerequisites:** M0 measurement and publication parity; access to analytics and affiliate reporting for the portions being verified.

**Exit conditions:** at least one commercial page has reproducible impression/session → outbound click measurement; source-reported commercial outcomes are reconciled where available; failures alert or appear on the scoreboard; no unresolved safety/evidence gate exists on the selected page. A partial affiliate baseline alone does not satisfy the aligned-funnel exit condition.

**Key risks:** optimizing generic search links without traffic evidence, over-weighting tiny samples, event duplication, consent violations, and affiliate incentives influencing rankings.

## M2 — First Proven Organic Revenue Loop

**Objective:** Demonstrate a measurable path from organic impression to decision page, outbound affiliate click, and reported revenue where the affiliate network supplies it.

**Success criteria:** one flagship page is selected from verified demand; its query, landing-page, engagement, outbound-click, order, and revenue data are reported for a fixed period where available; changes are compared against a recorded baseline; the path distinguishes source-level observations from fully attributed outcomes.

**Major deliverables:** opportunity selection, evidence/safety upgrade, internal-link support, conversion UX improvement, measurement window, commercial-efficiency report, and result review.

**Prerequisites:** M1; sufficient impressions or a documented minimum observation period.

**Exit conditions:** the loop is either proven with non-zero qualified outcomes or a well-instrumented null result yields a documented pivot. Revenue must never be invented or inferred from clicks. One isolated purchase or revenue event is evidence of feasibility, not enough by itself to establish a repeatable loop.

**Key risks:** low traffic, attribution gaps, seasonality, small-sample overfitting, premature conclusions, and changing multiple variables at once.

## M3 — Repeatable Decision-Page Engine

**Objective:** Convert the proven flagship workflow into a repeatable, evidence-safe page and upgrade system that optimizes qualified outcomes rather than page volume.

**Success criteria:** a reusable brief/template separates outcomes, captures study directness and safety, standardizes disclosure and CTAs, defines measurement and commercial-efficiency fields, and has regression tests for prior overclaims/canonical/monetization defects.

**Major deliverables:** page qualification rubric, editorial/evidence checklist, product-selection policy, schema/canonical tests, measurement spec, outcome-review template, and two additional validated upgrades.

**Prerequisites:** M2 result and postmortem.

**Exit conditions:** at least three pages use the system with complete proof; quality gates pass; effort and outcome ranges are known; the project can explain which page characteristics are associated with stronger qualified behavior without mistaking correlation for causation.

**Key risks:** template-driven repetition, evidence flattening, duplicated search intent, small-sample overfitting, and confusing trial context with recommendations.

## M4 — Authority Expansion

**Objective:** Strengthen only the topic clusters supported by search demand, user value, commercial relevance, evidence depth, and observed downstream behavior.

**Success criteria:** cluster gaps are based on GSC/query and internal-link evidence; observed conversion or engagement signals influence confidence without overriding evidence quality; existing pages are upgraded before new pages; every new page has a distinct reader job and canonical owner.

**Major deliverables:** cluster maps, supporting-page upgrades, selective new content, internal links, expert/editorial review, consolidation redirects, and cluster-level outcome tracking.

**Prerequisites:** M3 repeatable engine and stable content-quality gates.

**Exit conditions:** validated clusters gain qualified impressions/clicks and downstream decision actions without increasing unresolved evidence, safety, duplicate-intent, or orphan-page risks; expansion pauses when marginal qualified outcomes no longer justify added content/maintenance cost.

**Key risks:** volume goals overtaking usefulness, topical dilution, chasing revenue with weak evidence, and unreviewed programmatic claims.

## M5 — Growth Engine

**Objective:** Turn successful bounded acquisition experiments into repeatable distribution and retention around validated decision journeys.

**Success criteria:** internal linking, outreach/backlinks, social/media distribution, email, partnerships, and conversion experiments have named owners, baselines, incremental outcome measures, attribution boundaries, and stop rules.

**Major deliverables:** distribution calendar, governed media pipeline, link-earning assets, email journeys, partnership policy, channel scorecard, and controlled conversion tests.

**Prerequisites:** validated decision journeys, dependable attribution for the channels being scaled, and enough M1–M4 pilot evidence to distinguish promising channels from noise.

**Exit conditions:** at least two channels beyond on-page SEO produce repeatable qualified visits or conversions with acceptable trust and operating cost; one channel can be increased without disproportionate quality, policy, or maintenance debt.

**Key risks:** paid/partner influence on editorial judgment, weak attribution, spammy outreach, audience fatigue, platform dependence, and scaling reach before message/claim fidelity is stable.

## M6 — Scale

**Objective:** Increase throughput only where measured marginal returns remain positive, without scaling risk, duplication, or low-quality output.

**Success criteria:** automation is guarded by validation, rollback, anomaly detection, and risk-proportional review; routine human approval is not a throughput dependency when equivalent automated governance is proven; programmatic changes have rollback paths; quality, revenue, and operational metrics remain stable or improve as throughput grows.

**Major deliverables:** marginal-ROI prioritization, prioritized automation, quality sampling, anomaly alerts, partner/tooling expansion, capacity planning, and automated stop/pivot signals for declining channel or page economics.

**Prerequisites:** proven unit economics or strategic value, stable M3–M5 systems, and green release gates.

**Exit conditions:** increased throughput produces proportional qualified outcomes without degrading evidence coverage, safety coverage, performance, accessibility, editorial independence, or attributable commercial efficiency. If throughput grows faster than qualified outcomes for a sustained measured window, the system reduces or redirects expansion rather than continuing by inertia.

**Key risks:** automation amplifying errors, generated-content sprawl, vendor/platform dependence, measurement gaming, winner overfitting, and optimizing short-term revenue at the expense of trust.
