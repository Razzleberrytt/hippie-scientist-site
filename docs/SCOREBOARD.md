# Growth Scoreboard

**Status:** Authoritative metric definitions and reporting surface
**Updated:** 2026-08-21
**Default reporting period:** Rolling 28 complete days compared with the preceding 28 complete days. Repository/build health uses the latest main-branch run. `Unknown` means no authorized source value was available; it does not mean zero.

## Measurement status

**Verified:** Consent-gated analytics and affiliate-event code exists.
**Unknown:** Production property configuration/event receipt and all business performance values.
**Next:** Complete REV-001, then import read-only GSC, GA4, Amazon Associates, and Mailchimp reports with matching date ranges. Never commit credentials or person-level data.

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
| Build failures | Main-branch production/deploy failures | Fresh local production build/output verification passed; full schema policy still fails 38 identity checks; prior Lighthouse failure not rerun; strict site-health audit now passes locally | Local validation + GitHub Actions | 2026-08-21 | Engineering lead | Merge, confirm CI, then execute SEO-003/PERF-001 | A successful deploy does not mean all gates pass |
| Metadata errors | Missing/invalid title/description/robots/canonical in fresh built scope | Latest current CI metadata audit passed; source audit found one missing metadata source | CI + `audit:content` | 2026-08-21 | SEO engineer | Confirm in final local build and resolve duplicate article route | Stale local `out/` produced false signals during archaeology |
| Canonical errors | Built/live pages with missing, non-self, or wrong-host canonical | 0 in sampled live core routes; sitewide value Unknown | Live sample | 2026-08-21 | SEO engineer | Full fresh-output canonical audit | Sample success is not a sitewide zero |
| Orphan pages | Canonical pages with no qualifying internal links under audit definition | 1 definite source orphan; latest full CI reported 16 non-blocking orphans | Source/full link audits | 2026-08-21 | Content SEO | Reconcile audit definitions and review high-value pages | Pagination/tooling can create false positives |
| Analytics failures | Missing/duplicate/consent-violating production events | Unknown | Network + analytics DebugView | Current | Analytics engineer | Execute REV-001 | No production receipt evidence was available |
| Affiliate tracking failures | Recognized outbound clicks not recorded once, with required context | Unknown | Network/event report | Current | Analytics engineer | Execute REV-001 and compare controlled click to receipt | Do not click live affiliate links excessively |
| Publication parity failures | Profiles whose final governed-data eligibility, rendered robots/canonical/redirect state, and sitemap membership disagree | 0 across 846 built profiles; 285 sitemap-eligible and 285 included | `reports/profile-publication-truth.json`; Production Content Invariants run #1746; PR #4262 | 2026-08-25 clean build | Data/SEO engineer | Monitor the retained CI artifact for count or reason drift | This proves final deploy-surface parity, not parity with legacy/pre-build manifests or Google index coverage |

## Data acquisition checklist

1. Grant read-only Search Console access or set `GSC_SERVICE_ACCOUNT_JSON` outside the repository; run the existing fetch script for exact dates.
2. Confirm the production build receives `NEXT_PUBLIC_GA4_ID` and/or approved analytics key, then test consent and DebugView/Realtime receipt.
3. Export the same 28 complete days from analytics, Amazon Associates, and Mailchimp; document timezone, currency, and attribution windows.
4. Store aggregates or links to controlled reports—not secrets or user-level records—and update this file with source/date.
5. Repeat on a fixed cadence only after definitions are stable.
