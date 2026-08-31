# Growth Scoreboard

**Status:** Authoritative metric definitions and reporting surface
**Updated:** 2026-08-31 (technical release-gate evidence; economics definitions retain their 2026-08-28 boundary and earlier measurement rows retain their dated evidence)
**Default reporting period:** Rolling 28 complete days compared with the preceding 28 complete days. Repository/build health uses the latest main-branch run. `Unknown` means no authorized source value was available; it does not mean zero.

## Measurement status

**Verified:** Consent-gated analytics and affiliate-event code exists. PR #4269 merged as `ac20330`, preserving first consented GA events during deferred loading and assigning explicit initial/client-route page views to one owner.
**Unknown:** Production property configuration/event receipt and all business performance values.
**Next:** Resolve the authorized production receipt blocker in issue #4280, then import read-only GSC, GA4, Amazon Associates, and Mailchimp reports with matching date ranges. Never commit credentials or person-level data.

## Search

| Metric | Definition | Current value | Source | Period | Owner | Next measurement action | Interpretation notes |
|---|---|---|---|---|---|---|---|
| Google impressions | GSC web-search impressions for canonical site pages | Unknown | Google Search Console | 28 days | Growth analyst | Run authorized page/query export | Sitemap URLs are not impressions |
| Google clicks | GSC web-search clicks | Unknown | GSC | 28 days | Growth analyst | Same export as impressions | Exclude internal analytics clicks |
| Click-through rate | GSC clicks ÷ impressions | Unknown | GSC | 28 days | Growth analyst | Calculate from unrounded totals | Segment by query/page before acting |
| Average position | GSC impression-weighted position | Unknown | GSC | 28 days | Growth analyst | Export by page/query and device | Directional; not a rank tracker |
| Indexed pages | Canonical pages Google reports indexed | Unknown | GSC Page Indexing/URL Inspection | Snapshot | SEO engineer | Export Page Indexing and inspect priority samples | Live main sitemap had 486 URLs; that is not index coverage |
| Pages gaining impressions | Pages with positive impression change vs prior comparable period and a minimum-volume rule | Unknown | GSC | 28d vs prior 28d | Growth analyst | Define minimum 20 prior/current impressions, then export | Record the threshold with each report |
| Pages losing impressions | Pages with negative impression change beyond the agreed threshold | Unknown | GSC | 28d vs prior 28d | Growth analyst | Same cohort export | Check seasonality and canonical changes |
| Pages entering top 20 | Pages whose comparable query/page position crosses from >20 to ≤20 with impressions | Unknown | GSC | 28d vs prior 28d | Growth analyst | Build cohort from page/query export | Avoid averages across unrelated queries |
| Pages entering top 10 | Pages crossing from >10 to ≤10 with impressions | Unknown | GSC | 28d vs prior 28d | Growth analyst | Build cohort from page/query export | Use as opportunity evidence, not success alone |

## Engagement

| Metric | Definition | Current value | Source | Period | Owner | Next measurement action | Interpretation notes |
|---|---|---|---|---|---|---|---|
| Landing-page sessions | Sessions whose first page is a site content page; report organic and all-channel views | Unknown | GA4 or approved analytics | 28 days | Analytics engineer | Verify production configuration, then export landing page/channel | Confirm timezone and bot filtering |
| Engagement rate | Engaged sessions ÷ sessions under the analytics property's documented definition | Unknown | GA4 | 28 days | Analytics engineer | Export with definition/property ID recorded | Do not silently redefine between periods |
| Engaged time | Average engagement time per active user or selected stable alternative | Unknown | GA4 | 28 days | Analytics engineer | Select one property-supported metric and freeze definition | Raw “time on page” can be misleading |
| Scroll depth | Share of decision-page sessions reaching defined 50% and 90% thresholds | Unknown | Governed analytics events | 28 days | Analytics engineer | Confirm event implementation/receipt or scope a ticket | Only use if event coverage is reliable |
| Return visits | Returning-user sessions or stable privacy-safe alternative | Unknown | GA4 | 28 days | Analytics engineer | Confirm identity/reporting definition | Consent and browser limits affect counts |
| Decision-page engagement | Sessions with a defined meaningful event: evidence expansion, comparison interaction, or CTA view/click | Unknown | Governed analytics events | 28 days | Product analyst | Audit existing events and choose a stable event set | Do not combine unlike interactions without breakdown |

## Monetization

| Metric | Definition | Current value | Source | Period | Owner | Next measurement action | Interpretation notes |
|---|---|---|---|---|---|---|---|
| Outbound affiliate clicks | Consent-governed clicks to recognized affiliate destinations | Unknown | GA4/event store | 28 days | Analytics engineer | Verify `affiliate_click` receipt and deduplication | Code presence is not event receipt |
| Affiliate click-through rate | Unique decision-page sessions with affiliate click ÷ eligible decision-page sessions | Unknown | Analytics | 28 days | Product analyst | Align click and session scope | Also report raw clicks for diagnostics |
| Clicks by commercial landing page | Affiliate clicks attributed to the canonical landing page | Unknown | Analytics | 28 days | Growth analyst | Export page/CTA/destination dimensions | Required to select a flagship |
| Revenue | Confirmed affiliate-network commission in reporting currency | Unknown | Amazon Associates/other network | 28 days | Business owner | Export network report with attribution limits | Never infer revenue from clicks |
| Revenue per 1,000 sessions | Confirmed revenue ÷ eligible sessions × 1,000 | Unknown | Affiliate report + analytics | 28 days | Business owner | Reconcile currency, timezone, and session scope | Report attribution limitations |
| Email signups | Confirmed new subscribed contacts, excluding tests/bots/duplicates | Unknown | Mailchimp | 28 days | Lifecycle owner | Export campaign/audience report after function verification | Form submissions are not confirmed subscribers |
| Email conversion rate | Confirmed signups ÷ eligible form-view or landing sessions | Unknown | Mailchimp + analytics | 28 days | Lifecycle owner | Define denominator and reconcile dates | Keep denominator stable |

## Marginal resource economics — #4415

**Contract verified:** Merged [PR #4492](https://github.com/Razzleberrytt/hippie-scientist-site/pull/4492) supplies [ratio derivation and scale evaluation](../scripts/measurement/marginal-economics.mjs), covered by [focused regressions](../tests/marginal-economics.test.mjs). This section is the reporting surface for its definitions and future observations, not a new telemetry source. Implementation tests/builds are not observed efficiency or business outcomes.

### Definitions and observation inventory

An efficiency ratio is a named qualified outcome divided by a named resource quantity, with numerator and denominator covering the **same scope and exact observation window**. Missing values or a zero denominator produce `Unknown`, not zero efficiency. Missing required metadata is invalid input, not evidence.

- Supported outcome types: `qualified_visits`, `deep_evidence_interactions`, `affiliate_outbound_actions`, `email_signups`, `network_reported_orders`, `network_reported_revenue`, `governed_distribution_outcomes`, and diagnostic-only `merged_changes`. Define the exact event/cohort; do not pool unlike outcomes.
- Supported resource types: `engineering_hours`, `operator_hours`, `ci_runner_minutes`, `assets_produced`, `maintained_surfaces`, `external_tool_spend`, and `incremental_throughput`. Record the actual resource unit and source; commit timestamps are not measured labor and runner minutes are not a dollar cost.
- Marginal change is `(current efficiency - prior efficiency) / prior efficiency`, reported as a fraction (multiply by 100 only when labeling a percentage). Unknown/non-finite ratios or a zero prior ratio cannot support comparison.
- Use the default 28 complete days versus the preceding 28 complete days. Record exact boundaries, timezone, cohort, and any currency/unit conventions; numerator/denominator windows match within each period, and comparison periods have equal duration, metric types, definitions, scope, and attribution boundary.

| Metric | Definition | Current value | Source | Period | Owner | Next measurement action | Interpretation notes |
|---|---|---|---|---|---|---|---|
| CI throughput efficiency | `merged_changes / ci_runner_minutes` for one explicitly linked PR/run cohort | Unknown; prior Unknown | GitHub merged-PR records and Actions job timing, including a stated retry/failure accounting rule | 28d vs prior 28d; actual boundaries Unknown | Engineering lead | Supply cohort-bound run durations and merge counts | Operational diagnostic only; cannot authorize scaling or substitute for a qualified user outcome |
| Attributable visits per asset | `qualified_visits / assets_produced` for one campaign/platform and governed asset cohort | Unknown; prior Unknown | Governed #4407 outcome observations plus matching asset/lifecycle receipts; values not yet supplied here | 28d vs prior 28d; actual boundaries Unknown | Growth analyst | Supply aggregate tagged visits, validated asset counts and measured-view receipts | Keep platform/campaign scopes separate; generated assets alone are not observed visits |
| Qualified actions per operator hour | One defined eligible outcome type, such as `email_signups`, divided by `operator_hours` for the same scope | Unknown; prior Unknown | Authorized outcome report plus supplied operator-time record | 28d vs prior 28d; actual boundaries Unknown | Growth analyst | Supply observed hours and the exact action definition/source | No inferred labor estimates; estimates may be labeled diagnostics but cannot authorize scaling |
| Attributable revenue per maintained surface | `network_reported_revenue / maintained_surfaces` for one attributable surface cohort | Unknown; prior Unknown | Authorized network report and scoped maintained-surface inventory | 28d vs prior 28d; actual boundaries Unknown | Business owner | Supply network-reported revenue, currency and cohort attribution limits | Never infer revenue from clicks or count unsupported cross-surface attribution |
| Marginal qualified efficiency change | Fractional change between two comparable qualified-outcome/resource ratios defined above | Unknown | The named current/prior source observations, not a separate analytics source | Same comparison windows as the underlying ratio | Growth analyst | Derive only after input/window/comparability checks | Gross output growth alone is not evidence of marginal qualified improvement |

### Required reporting fields and scale guardrails

For each supplied metric report, retain the ratio ID; each numerator/denominator's `type`, `value`, `source` receipt, `scope`, `window.start/end`, `definition` and `confidence`; `attributionBoundary`; the `estimate` flag; and both current/prior values and windows. Keep timezone, currency/unit conventions, operator/source owner, verification date and receipt links in the report notes. Store aggregates or controlled-report references only, never credentials or person-level data.

**Current reporting status:** Actual numerator/denominator values, dated source receipts, windows, confidence, exposure, attribution reliability and quality-debt observations are all `Unknown` here. No supplied-input scale decision has been verified. Populate this section only from authorized observations; the default reporting period is not a fabricated dated observation.

- Positive eligibility requires explicit `attributionReliable: true` and `qualityDebtRising: false`. Missing/unverified states return `WAIT`; explicit unreliable attribution or rising debt returns `STOP_OR_PIVOT`, even with missing outcome values. Retain evidence for these states, not just a favorable Boolean.
- Both periods require source/scope/window-bound `exposure` observations of type `measured_views`, with integer counts of **at least 250 each**, reusing [the existing distribution threshold](../scripts/distribution/opportunity-feedback.mjs). Required exposure fields also include `source`, `definition` and `confidence`. Missing/underexposed/Unknown-confidence evidence waits; incompatible scope/window receipts are rejected. This is not a new general sufficiency policy for non-distribution outcomes.
- `merged_changes` ratios and estimates remain diagnostics and return `WAIT` for scale evaluation. A valid observed ratio alone does not imply eligibility.
- After the observation/comparability/guardrail gates, the default deterioration threshold is 0.15: relative change at or below -15% returns `STOP_OR_PIVOT`. Record any configured threshold with the report. `ELIGIBLE_TO_SCALE` is only this contract's conditional signal; scientific, safety, disclosure, privacy, accessibility, publication, channel-policy, resource authority and other release gates remain independent. It does not authorize spending or publishing.

## Content

| Metric | Definition | Current value | Source | Period | Owner | Next measurement action | Interpretation notes |
|---|---|---|---|---|---|---|---|
| Priority pages upgraded | Sprint-selected existing pages meeting acceptance/proof criteria | 0 recorded in this reset | Sprint/backlog evidence | Current sprint | Content lead | Increment only when ticket proof is complete | Not a count of incidental edits |
| Pages earning clicks | Canonical landing pages with ≥1 GSC click | Unknown | GSC | 28 days | Growth analyst | Export landing pages | Use thresholds for prioritization |
| Pages entering top 20 | Same cohort definition as Search | Unknown | GSC | 28 days | Growth analyst | Import GSC cohort | Do not duplicate as a separate calculation |
| Pages entering top 10 | Same cohort definition as Search | Unknown | GSC | 28 days | Growth analyst | Import GSC cohort | — |
| Pages with verified evidence and safety coverage | Published pages passing the agreed claim-source and safety release gates in the final artifact | Unknown sitewide | Post-invariant publication artifact | Latest build | Evidence lead | Complete SEO-001 and define one final pass count | Workbook safety context alone does not prove page-level evidence completeness |
| Pages with unresolved content risks | Published/indexable pages with open blocking evidence, safety, duplicate-intent, or disclosure findings | Unknown sitewide | Quality audits/issues | Latest build | Editorial operations | Unify blocking audit output after SEO-001/SAFE-001 | Current CI demotes many risks rather than publishing them |

## Technical

| Metric | Definition | Current value | Source | Period | Owner | Next measurement action | Interpretation notes |
|---|---|---|---|---|---|---|---|
| Broken links | Internal source links with missing final targets in audit scope | 0 in 188-page source audit | `npm run audit:content` | 2026-08-21 audit | SEO engineer | Re-run after route/content changes and validate built output | Scope is not every generated route |
| Indexing errors | Google-reported canonical/indexing errors | Unknown | GSC | Snapshot | SEO engineer | Import Page Indexing/URL Inspection results | `noindex` governance holds are intentional until repaired |
| Build failures | Main-branch production/deploy failures | Current main (`0c667ca`) is terminal-green across validation/tests/data, production build/output/SEO, content invariants/lint, schema/media, static contract, site audit, Lighthouse, Cloudflare Pages, and deploy. | GitHub Actions post-merge checks for `0c667ca7bd9bf49279594e7df79a806cb4c1237a`; PR #4952 exact-head evidence | 2026-08-31 | Engineering lead | Monitor future main/deploy runs and investigate only new failing evidence | This is deterministic release/deploy proof, not production traffic, indexing, analytics receipt, or business performance |
| Metadata errors | Missing/invalid title/description/robots/canonical in fresh built scope | Latest current CI metadata audit passed; source audit found one missing metadata source | CI + `audit:content` | 2026-08-21 | SEO engineer | Confirm in final local build and resolve duplicate article route | Stale local `out/` produced false signals during archaeology |
| Canonical errors | Built/live pages with missing, non-self, or wrong-host canonical | 0 in sampled live core routes; sitewide value Unknown | Live sample | 2026-08-21 | SEO engineer | Full fresh-output canonical audit | Sample success is not a sitewide zero |
| Orphan pages | Canonical pages with no qualifying internal links under audit definition | PR #4952 exact-head output audit reported 32 total, 0 crawlable blockers, and 32 non-blocking/noindex cases; the same tree is merged to current main and its post-merge production output/SEO check passed | PR #4952 exact-head audit plus post-merge `0c667ca` production output/SEO check | 2026-08-31 | Content SEO | Monitor the retained output audit for new crawlable blockers | This proves the scoped route is discoverable under the repository audit definition; it does not prove traffic, ranking, or Google indexing |
| Analytics failures | Missing/duplicate/consent-violating production events | Unknown; code-readiness fix merged in PR #4269, but production receipt is unobserved | Network + analytics DebugView | Current | Analytics engineer | Resolve issue #4280 with authorized pre/post-consent network and timestamped receipt evidence | GitHub code and CI cannot prove production property configuration or receipt |
| Affiliate tracking failures | Recognized outbound clicks not recorded once, with required context | Unknown | Network/event report | Current | Analytics engineer | Execute REV-001 and compare controlled click to receipt | Do not click live affiliate links excessively |
| Publication parity failures | Profiles whose final governed-data eligibility, rendered robots/canonical/redirect state, and sitemap membership disagree | 0 across 846 built profiles; 285 sitemap-eligible and 285 included | `reports/profile-publication-truth.json`; Production Content Invariants run #1746; PR #4262 | 2026-08-25 clean build | Data/SEO engineer | Monitor the retained CI artifact for count or reason drift | This proves final deploy-surface parity, not parity with legacy/pre-build manifests or Google index coverage |

## Data acquisition checklist

1. Grant read-only Search Console access or set `GSC_SERVICE_ACCOUNT_JSON` outside the repository; run the existing fetch script for exact dates.
2. Confirm the production build receives `NEXT_PUBLIC_GA4_ID` and/or approved analytics key, then test consent and DebugView/Realtime receipt.
3. Export the same 28 complete days from analytics, Amazon Associates, and Mailchimp; document timezone, currency, and attribution windows.
4. Store aggregates or links to controlled reports—not secrets or user-level records—and update this file with source/date.
5. Repeat on a fixed cadence only after definitions are stable.
