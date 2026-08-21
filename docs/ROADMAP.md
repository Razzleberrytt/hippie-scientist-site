# Roadmap

**Status:** Authoritative milestone plan
**Last updated:** 2026-08-21
**Planning rule:** A milestone is complete only when every exit condition has reproducible proof. Dates are intentionally omitted until dependencies and throughput are measured.

## Status summary

| Milestone | Status | Current constraint |
|---|---|---|
| M0 — Project Control Reset | In progress | Measurement and generated-publication truth are not yet verified end to end |
| M1 — Revenue Foundation | Not started | Requires M0 measurement visibility and quality-gate triage |
| M2 — First Proven Organic Revenue Loop | Blocked | No GSC/GA4/affiliate revenue baseline is available |
| M3 — Repeatable Decision-Page Engine | Not started | Requires one measured, evidence-safe flagship result |
| M4 — Authority Expansion | Not started | Requires validated topics and repeatable page standard |
| M5 — Growth Engine | Not started | Requires proven acquisition and conversion economics |
| M6 — Scale | Not started | Requires stable quality controls and repeatable growth |

## M0 — Project Control Reset

**Objective:** Establish one operational truth, a small queue, trustworthy validation, and observable growth metrics.

**Success criteria:** Control documents are authoritative; no more than three workstreams are active; current release failures have scoped owners; production analytics/event configuration is verified or explicitly blocked; a reproducible post-build publication manifest matches sitemap/robots behavior.

**Major deliverables:** charter, current state, roadmap, sprint, backlog, decisions, docs index, scoreboard, AGENTS rules, CI triage, measurement smoke test, publication-parity audit.

**Prerequisites:** repository, GitHub, live-site, and build access. Analytics accounts are required for measured values but not for recording the access blocker.

**Exit conditions:** all control docs pass review; top sprint tickets have proof; production build passes or every failure has a current scoped ticket; measurement owners and access are established; one post-invariant source reports profile eligibility consistently.

**Key risks:** stale generated artifacts, overlapping PRs, inaccessible analytics accounts, and treating governance demotions as simple SEO errors.

## M1 — Revenue Foundation

**Objective:** Make commercial journeys trustworthy, observable, and technically reliable.

**Success criteria:** consent behavior and affiliate events are verified; disclosures precede commercial links; page/CTA/destination dimensions reach analytics; affiliate destinations on the selected flagship are valid; GA4/GSC/Amazon/Mailchimp reporting periods align.

**Major deliverables:** measurement proof, outbound-click baseline, disclosure audit, destination audit, first page-level funnel report, and conversion-path defect fixes.

**Prerequisites:** M0 measurement and publication parity; access to analytics and affiliate reporting.

**Exit conditions:** at least one commercial page has reproducible impression/session → outbound click measurement; failures alert or appear on the scoreboard; no unresolved safety/evidence gate exists on the selected page.

**Key risks:** optimizing generic search links without traffic evidence, event duplication, consent violations, and affiliate incentives influencing rankings.

## M2 — First Proven Organic Revenue Loop

**Objective:** Demonstrate a measurable path from organic impression to decision page, outbound affiliate click, and reported revenue where the affiliate network supplies it.

**Success criteria:** one flagship page is selected from verified demand; its query, landing-page, engagement, outbound-click, and revenue data are reported for a fixed period; changes are compared against a recorded baseline.

**Major deliverables:** opportunity selection, evidence/safety upgrade, internal-link support, conversion UX improvement, measurement window, and result review.

**Prerequisites:** M1; sufficient impressions or a documented minimum observation period.

**Exit conditions:** the loop is either proven with non-zero qualified outcomes or a well-instrumented null result yields a documented pivot. Revenue must never be invented or inferred from clicks.

**Key risks:** low traffic, attribution gaps, seasonality, premature conclusions, and changing multiple variables at once.

## M3 — Repeatable Decision-Page Engine

**Objective:** Convert the proven flagship workflow into a repeatable, evidence-safe page and upgrade system.

**Success criteria:** a reusable brief/template separates outcomes, captures study directness and safety, standardizes disclosure and CTAs, and has regression tests for prior overclaims/canonical/monetization defects.

**Major deliverables:** page qualification rubric, editorial/evidence checklist, product-selection policy, schema/canonical tests, measurement spec, and two additional validated upgrades.

**Prerequisites:** M2 result and postmortem.

**Exit conditions:** at least three pages use the system with complete proof; quality gates pass; effort and outcome ranges are known.

**Key risks:** template-driven repetition, evidence flattening, duplicated search intent, and confusing trial context with recommendations.

## M4 — Authority Expansion

**Objective:** Strengthen only the topic clusters supported by search demand, user value, commercial relevance, and evidence depth.

**Success criteria:** cluster gaps are based on GSC/query and internal-link evidence; existing pages are upgraded before new pages; every new page has a distinct reader job and canonical owner.

**Major deliverables:** cluster maps, supporting-page upgrades, selective new content, internal links, expert/editorial review, and consolidation redirects.

**Prerequisites:** M3 repeatable engine and stable content-quality gates.

**Exit conditions:** validated clusters gain qualified impressions/clicks without increasing unresolved evidence, safety, duplicate-intent, or orphan-page risks.

**Key risks:** volume goals overtaking usefulness, topical dilution, and unreviewed programmatic claims.

## M5 — Growth Engine

**Objective:** Add repeatable distribution and retention around validated decision journeys.

**Success criteria:** internal linking, outreach/backlinks, email, partnerships, and conversion experiments have named owners, baselines, and incremental outcome measures.

**Major deliverables:** distribution calendar, link-earning assets, email journeys, partnership policy, and controlled conversion tests.

**Prerequisites:** M4 authority and dependable attribution.

**Exit conditions:** at least two channels beyond on-page SEO produce repeatable qualified visits or conversions with acceptable trust and operating cost.

**Key risks:** paid/partner influence on editorial judgment, weak attribution, spammy outreach, and audience fatigue.

## M6 — Scale

**Objective:** Scale validated systems without scaling risk, duplication, or low-quality output.

**Success criteria:** automation is guarded by validation and human review; programmatic changes have rollback paths; quality, revenue, and operational metrics remain stable as throughput grows.

**Major deliverables:** prioritized automation, quality sampling, anomaly alerts, partner/tooling expansion, and operational capacity planning.

**Prerequisites:** proven unit economics or strategic value, stable M3–M5 systems, and green release gates.

**Exit conditions:** increased throughput produces proportional qualified outcomes without degrading evidence coverage, safety coverage, performance, or editorial independence.

**Key risks:** automation amplifying errors, generated-content sprawl, vendor dependence, and measurement gaming.
