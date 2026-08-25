# Site Swarm Update Ledger

This is the durable, human-readable history of completed changes made by the autonomous five-lane site swarm.

## Ownership and update contract

- **Integration lane owns this file.** Lanes 1–4 must not edit it directly, which prevents a shared-file merge-conflict hotspot.
- After a PR is **actually merged**, Integration appends one row. Open, abandoned, superseded, or merely green PRs do not count as completed updates.
- Integration must reconcile this ledger against recent merged PR history each run and backfill any missing swarm-authored merge.
- Entries describe the shipped outcome, not speculative intent. Unknown production outcomes remain explicitly unknown.
- Scientific, safety, provenance, SEO, accessibility, publication, and governance constraints are never summarized away when material to the change.
- Prefer one row per merged PR. Use the PR as the auditable source for exact implementation and validation details.

## Updates

| Merged (UTC) | PR | Area | Shipped update | Result / why it matters |
|---|---:|---|---|---|
| 2026-08-25 22:29 | #4281 | Analytics / control records | Recorded REV-001 as blocked on authorized production-receipt evidence after the analytics reliability fix merged. | Prevents code/CI readiness from being misreported as verified GA production receipt; unknown stays Unknown. |
| 2026-08-25 22:21 | #4278 | SEO / internal links | Canonicalized shared authority and goal routes to trailing-slash URLs and added regressions. | Removes avoidable internal redirect hops at the source while retaining post-build canonicalization as defense in depth. |
| 2026-08-25 22:10 | #4269 | Analytics / UX growth | Preserved first consented GA events during deferred loading and added explicit SPA page-view ownership. | Makes funnel measurement more trustworthy without weakening consent, DNT/GPC, or deferred-loading performance behavior. |
| 2026-08-25 21:16 | #4274 | SEO / AI discovery | Added agent-readable Markdown links to `llms.txt` plus a read-only post-build index-quality shadow diagnostic. | Improves machine discovery and creates differentiated-quality diagnostics without changing publication, robots, or sitemap decisions. |
| 2026-08-25 20:51 | #4272 | Swarm governance | Required lease owner identity for enrichment-governor lease release and audited denied cross-owner attempts. | Strengthens collision protection for parallel swarm lanes without changing scientific or publication policy. |
| 2026-08-25 19:36 | #4264 | Search / AI visibility | Added selective Google Preferred Sources exposure, post-spam Search Console cohorts, AI anomaly isolation, and differentiated-value enrichment priority. | Improves search/AI monitoring and prioritizes unique evidence/safety/mechanism value rather than commodity completeness. |
| 2026-08-25 19:23 | #4263 | SEO / control records | Closed SEO-001 with final publication-parity evidence. | Records 846 built profiles, 285 sitemap-eligible/included, and zero parity mismatches without confusing sitemap parity with Google index coverage. |
| 2026-08-25 19:18 | #4248 | Accessibility / CI | Added accessibility baseline, anti-pattern ratchet, and component-a11y enforcement to Fast UI. | Prevents new accessibility debt from silently entering future UI changes. |
| 2026-08-25 17:22 | #4262 | SEO / publication verification | Added one post-build profile publication-truth reconciliation across robots, canonical, redirects, and sitemap inclusion. | Gives a deterministic verification view of what actually ships without creating a second publication controller. |
| 2026-08-25 14:32 | #4253 | Performance / CI | Added representative desktop Lighthouse coverage alongside existing mobile/accessibility matrices. | Expands viewport coverage while keeping flaky performance metrics as trends and hard accessibility/build gates intact. |
| 2026-08-25 14:30 | #4251 | Research quality | Exposed the existing outcome-review queue in the canonical quality roll-up and remediation reporting. | Improves research-quality visibility without creating a duplicate analyzer or changing scientific conclusions. |
| 2026-08-25 14:09 | #4255 | Deploy safety | Restored fixed catastrophic sitemap coverage canaries of 10 herbs and 8 compounds. | Prevents dynamic floor-lowering from masking severe publication regressions. |
| 2026-08-25 14:09 | #4246 | Scientific enrichment | Cleared Ashwagandha/Luteolin null- and safety-visibility canary debt with source-specific human evidence and stronger provenance guards. | Preserves null/mixed findings and trial-specific safety limits while raising governed evidence quality. |
| 2026-08-25 13:42 | #4257 | CI / monetization / route integrity | Repaired current-main regression drift across comparison inventory, research assertions, experience selectors, and recommendation governance. | Restored green validation without weakening scientific, accessibility, SEO, or monetization policy. |
| 2026-08-25 03:23 | #4244 | Enrichment pipeline | Staged canonical-pathways research with 36 evidence-backed fills, 12 explicit no-ops, canonical mechanism vocabulary, and safer candidate batching. | Improves mechanism-data quality while leaving the workbook untouched until governed apply. |

## Entry template

Use this when reconciling a newly merged PR:

```text
| YYYY-MM-DD HH:MM | #PR | Area | What actually shipped. | Concrete user/site/system value and any material boundary preserved. |
```
