# Skill #2: Ahrefs Site Audit — Technical Health

**Date**: 2026-07-03  
**Target**: thehippiescientist.net  
**Project**: "Thehippiescientist" (ID: 10017926)

## Crawl History

| Crawl | Date | Status | Pages Crawled |
|-------|------|--------|---------------|
| 5 | Jul 2 | Failed | — |
| 4 | Jul 1 | Failed | — |
| 3 | Jun 30 | Stopped | — |
| 2 | Jun 28 | Completed | 2,503 |
| 1 | Jun 27 | Completed | 2,503 |

Last 3 crawls have failed — needs investigation.

## Health Overview (from Crawl 2)

| Metric | Value |
|--------|-------|
| Pages crawled | 2,503 |
| Billed pages | 1,687 |
| URLs with errors | 307 / 1,849 (16.6%) |
| **Total issues** | **5,136** |
| — Critical | 336 |
| — Warnings | 1,182 |
| — Notices | 3,618 |

## Top 10 Critical Issues

| # | Count | Issue |
|---|-------|-------|
| 1 | 264 | Page has links to broken page |
| 2 | 22 | 404 page |
| 3 | 22 | 4XX page |
| 4 | 10 | Orphan page (no incoming internal links) |
| 5 | 8 | Canonical points to 4XX |
| 6 | 3 | Double slash in URL |
| 7 | 3 | Image broken |
| 8 | 3 | Page size exceeds 2 MB |
| 9 | 1 | Page has broken image |

## Top Warning Issues

| # | Count | Issue |
|---|-------|-------|
| 1 | 466 | Noindex page |
| 2 | 426 | Links to broken page |
| 3 | 93 | Meta description too long |
| 4 | 67 | Links to redirect |
| 5 | 49 | 3XX redirect |
| 6 | 37 | OG URL not matching canonical |
| 7 | 21 | OG tags incomplete |

## Key Notice Issues

| # | Count | Issue |
|---|-------|-------|
| 1 | 974 | Pages to submit to IndexNow |
| 2 | 878 | Schema.org validation errors |
| 3 | **746** | Indexable page not in sitemap |
| 4 | 466 | Noindex follow page |
| 5 | 398 | External 5XX |
| 6 | 91 | Only 1 dofollow internal link |
| 7 | 34 | H1 tag missing or empty |
| 8 | 33 | Low word count |
| 9 | 33 | HTML lang attribute missing |

## Priority Actions

1. Fix 746 pages missing from sitemap
2. Fix 264 pages with broken internal links
3. Review 466 noindex pages — intentional or blocking?
4. Fix 22 404 pages — create redirects or remove links
5. Add internal links to 10 orphan pages
6. Fix 878 schema.org validation errors
7. Fix 93 meta descriptions that are too long
8. Resolve crawl failures (last 3 failed)