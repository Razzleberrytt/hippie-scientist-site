---
name: ths-publishing-seo-qa
version: 1.0.0
description: Audit or repair THS pages for evidence, indexing, canonical routes, schema, broken links, author/disclosure placement, a11y and exact live deployment.
owner: The Hippie Scientist
---
# THS Publishing, SEO and Exact-Live QA
First read `../ths-operating-system/SKILL.md` and evidence standard. Only use admitted scoped tickets for code edits.

## Route and content inspection
1. Determine the reader job and canonical existing route; reuse or improve content rather than duplicating near-identical pages. Protect `/herbs/*`, `/compounds/*`, `/guides/*` and legitimate legacy paths; never bulk-redirect all removed URLs to irrelevant hub pages.
2. Compare structured source workbook, generated `public/data`, rendered `out/`, sitemap, canonical, robots and Google results; `noindex` may be intentional evidence quarantine. An attractive content score does not override human-source requirements.
3. On health/commercial comparison or best-of pages check factual source→claim matches, updated review date/byline, human evidence transparency, null evidence, funding, affiliate disclosures, Amazon tag integrity, readable UX, and links that go to the actual destination indicated.
4. Evaluate mobile/desktop, light/dark, accessibility, security headers, internal links and schema against actual final build and live Cloudflare output.
5. Record reproduction for wrong PMID, stale metadata, broken link, misleading search-only affiliate placement and policy violation; limit repair to one ticket and add regression.
6. Run relevant repo checks and source-of-truth data pipeline, production build and postbuild indexing QA. Confirm the deployed Cloudflare SHA and re-fetch exact URLs; a merged PR is not a live fix.

## Output
`URL | reader job | defect | severity | source of truth | intended change | test/build evidence | main commit | live result | follow-up`. Avoid vanity “pages shipped” counts. When external analytics are missing, say Unknown instead of 0.

## Fail-closed action
- **Trigger:** The authoritative study, source workbook, final build, canonical/indexing checks, safety review, or exact Cloudflare deployment verification fails or is missing.
- **Action:** STOP the release or page-promotion claim; retain the existing noindex/quarantine state when applicable, log the precise failed gate and ticket, repair the same scoped change, and recheck output/deployed SHA before calling the defect fixed.
