# SEO CSV Issue Response — 2026-07-08

Uploaded CSV: `thehippiescientist.net_IssueDetailsBySeverity_7_8_2026.csv`

The CSV is an aggregate issue summary, not a URL-level export. It lists issue categories and page counts only, so this patch addresses the most likely site-wide causes without pretending to know the exact affected URLs.

## CSV summary

| Issue | Type | Pages affected |
| --- | --- | ---: |
| HTTP 400–499 errors | Error | 29 |
| HTML size is too long | Warning | 10 |
| Title too long | Warning | 1 |
| H1 tag missing | Notice | 32 |

## Implemented fixes

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

The CSV does not identify which pages were flagged. Core index templates and the 404 template already render visible H1 elements. The likely reason for this aggregate notice is stale crawl data, redirected pages, or old/no-longer-current URLs. A URL-level export is needed for exact row-by-row H1 remediation.

### HTTP 400–499 errors

The CSV does not include affected URLs. Existing redirect coverage is already extensive for known legacy route patterns. A URL-level export is needed to safely add exact 301 redirects without guessing and potentially creating bad redirect targets.

## Follow-up needed if issues remain

Export the URL-level issue details from the audit tool for:

- HTTP 400–499 errors
- H1 tag missing

Then add exact redirects or template fixes for those specific URLs.
