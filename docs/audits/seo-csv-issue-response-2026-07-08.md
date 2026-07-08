# SEO CSV Issue Response — 2026-07-08

Uploaded CSVs:

- `thehippiescientist.net_IssueDetailsBySeverity_7_8_2026.csv`
- `thehippiescientist.net_PagesByIssueCategory_7_8_2026.csv`

The first CSV is an aggregate issue summary. The second CSV provides the exact 29 URLs for the HTTP 400–499 bucket.

## CSV summary

| Issue | Type | Pages affected |
| --- | --- | ---: |
| HTTP 400–499 errors | Error | 29 |
| HTML size is too long | Warning | 10 |
| Title too long | Warning | 1 |
| H1 tag missing | Notice | 32 |

## Implemented fixes

### HTTP 400–499 errors

The URL-level CSV showed 29 affected URLs. Most were orphaned `/guides/compare/...` URLs for comparison pages that are not currently built as static routes.

This patch adds `public/redirect-overrides/seo-csv-400-2026-07-08.txt` with exact 301 redirects for all 29 listed URLs. The rules point either to a close matching live page, such as:

- `/guides/compare/ashwagandha-vs-rhodiola/` → `/guides/compare/rhodiola-vs-ashwagandha/`
- `/guides/compare/melatonin-vs-valerian/` → `/guides/herbs/melatonin-vs-valerian/`
- `/guides/compare/alpha-gpc-vs-cdp-choline/` → `/guides/adhd/citicoline-vs-alpha-gpc/`

or to the closest live topic hub when no specific comparison page exists.

A deploy-build step now runs `scripts/seo/apply-redirect-overrides.mjs`, which prepends these exact audit-cleanup rules into `out/_redirects`. Prepending is intentional so these URL-level fixes win over older stale or wildcard rules.

### HTML size too long

The herb and compound index pages were passing full runtime/profile records into client components. Those records can contain workbook-derived text, safety fields, mechanisms, evidence fields, and other properties that inflate the serialized Next.js page payload.

This patch adds a lean profile index serializer and uses it for:

- `/herbs/`
- `/herbs/page/[page]/`
- `/compounds/`
- `/compounds/page/[page]/`

The pages still keep crawlable profile links and visible cards, but the client-side payload is limited to fields needed by the index UI.

### Title too long

The PT-141 guide had a long metadata title. This patch shortens the metadata title while keeping the visible page H1 intact.

### H1 missing

The available URL-level export only covered HTTP 400–499 pages. Core index templates and the 404 template already render visible H1 elements. Exact row-by-row H1 remediation still requires the URL-level H1 issue export.

## Follow-up needed if H1 notices remain

Export the URL-level issue details for `H1 tag missing`, then fix the exact affected templates or redirect stale URLs if the flagged pages are no longer meant to be live.
