# SEO CSV Issue Response — 2026-07-08

Uploaded CSVs:

- `thehippiescientist.net_IssueDetailsBySeverity_7_8_2026.csv`
- `thehippiescientist.net_PagesByIssueCategory_7_8_2026.csv`
- `thehippiescientist.net_PagesByIssueCategory_7_8_2026 2.csv`
- `thehippiescientist.net_PagesByIssueCategory_7_8_2026 3.csv`
- `www.thehippiescientist.net_issues_20260708.csv`
- `www.thehippiescientist.net_internal_broken_links_20260708.csv`

The issue summary CSVs are aggregate exports. The follow-up CSVs provide URL-level rows for the HTTP 400–499, H1-missing, HTML-size, and internal broken-link buckets.

## CSV summary

| Issue | Type | Failed checks |
| --- | --- | ---: |
| Broken internal links | Error | 3,826 |
| HTTP 400–499 errors | Error | 392 |
| Structured data markup errors | Error | 276 |
| HTML size is too long | Warning | 10 |
| Title too long | Warning | 1 |
| H1 tag missing | Notice/Warning | 32 / 3 depending export |

## Implemented fixes

### Broken internal links

The Semrush internal broken-link export had 3,826 broken-link instances, but only 308 unique broken target URLs. The top 20 targets accounted for 3,067 of the 3,826 rows.

This patch adds `public/redirect-overrides/000-semrush-broken-internal-links-2026-07-08.txt` with exact 301 cleanup redirects for all 308 unique broken targets from the export. The redirect file is intentionally prefixed with `000-` so its rules are processed before older cleanup files.

The largest repeated sources were old `/goals/...` routes and duplicate scientific herb slugs. These now point to active guide hubs or canonical herb profiles, for example:

- `/goals/anxiety/` → `/guides/anxiety/`
- `/goals/blood-pressure/` → `/guides/best/supplements-for-blood-pressure/`
- `/herbs/angelica-sinensis/` → `/herbs/dong-quai/`
- `/herbs/astragalus-membranaceus/` → `/herbs/astragalus/`

### HTTP 400–499 errors

The URL-level CSV showed 29 affected URLs. Most were orphaned `/guides/compare/...` URLs for comparison pages that are not currently built as static routes.

This patch adds `public/redirect-overrides/seo-csv-400-2026-07-08.txt` with exact 301 redirects for all 29 listed URLs. The rules point either to a close matching live page or to the closest live topic hub when no specific comparison page exists.

A deploy-build step now runs `scripts/seo/apply-redirect-overrides.mjs`, which prepends these exact audit-cleanup rules into `out/_redirects`. Prepending is intentional so these URL-level fixes win over older stale or wildcard rules.

The override script also emits both slash and non-slash variants for exact path redirects. That matters because Semrush may discover `/old-url` while a CSV row lists `/old-url/`, or vice versa.

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
