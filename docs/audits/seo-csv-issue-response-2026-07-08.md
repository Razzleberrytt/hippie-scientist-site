# SEO CSV Issue Response — 2026-07-08

Uploaded CSVs:

- `thehippiescientist.net_IssueDetailsBySeverity_7_8_2026.csv`
- `thehippiescientist.net_PagesByIssueCategory_7_8_2026.csv`
- `thehippiescientist.net_PagesByIssueCategory_7_8_2026 2.csv`
- `thehippiescientist.net_PagesByIssueCategory_7_8_2026 3.csv`

The first CSV is an aggregate issue summary. The follow-up CSVs provide URL-level rows for the HTTP 400–499, H1-missing, and HTML-size buckets.

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

This patch adds `public/redirect-overrides/seo-csv-400-2026-07-08.txt` with exact 301 redirects for all 29 listed URLs. The rules point either to a close matching live page or to the closest live topic hub when no specific comparison page exists.

A deploy-build step now runs `scripts/seo/apply-redirect-overrides.mjs`, which prepends these exact audit-cleanup rules into `out/_redirects`. Prepending is intentional so these URL-level fixes win over older stale or wildcard rules.

### H1 missing

The URL-level H1 CSV showed 32 old duplicate/deprecated compound URLs, including duplicate extract, blend, sleep-context, and organism/compound aliases. These are not good standalone pages to preserve.

This patch adds `public/redirect-overrides/seo-csv-h1-2026-07-08.txt` with exact 301 redirects for all 32 listed URLs. Targets point to the closest canonical herb profile, compound profile, or live guide hub.

### HTML size too long

The URL-level HTML-size CSV showed 10 pages:

- `/compounds/` and four `/compounds/?context=...` variants
- `/learn/explorer/`
- `/learn/product-quality/`
- `/info/dosing/`
- `/guides/compare/dynamic/`
- `/safety-checker/`

The largest actionable site-wide cause is the compound index payload. This patch adds a lean profile index serializer and uses it for:

- `/herbs/`
- `/herbs/page/[page]/`
- `/compounds/`
- `/compounds/page/[page]/`

The query-string variants of `/compounds/` render the same page, so the lean compound payload applies there too.

This patch also redirects `/guides/compare/dynamic/` to `/guides/compare/` through `public/redirect-overrides/seo-csv-html-size-2026-07-08.txt` because the dynamic compare route should not be crawled as a standalone heavy page.

The remaining long HTML pages are real utility/education pages. They are documented here for follow-up component-level slimming if the audit threshold still flags them after deploy.

### Title too long

The PT-141 guide had a long metadata title. This patch shortens the metadata title while keeping the visible page H1 intact.
