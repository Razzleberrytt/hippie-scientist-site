# Google index recovery baseline — 2026-09-20

Source: operator-supplied Google Search Console **Page indexing** export for `https://thehippiescientist.net/`, downloaded 2026-09-20, plus issue drilldowns for **Crawled – currently not indexed**, **Discovered – currently not indexed**, and **Duplicate without user-selected canonical**.

This is a dated external observation, not a claim about what Google will index after a recrawl. The chart in the export runs through **2026-09-13**, so the measurement itself is already lagged relative to the download date.

## Coverage snapshot

| GSC state | URLs |
| --- | ---: |
| Google-known URLs | 4,601 |
| Indexed | 18 |
| Not indexed | 4,583 |
| Not found (404) | 1,993 |
| Crawled – currently not indexed | 1,231 |
| Discovered – currently not indexed | 596 |
| Page with redirect | 444 |
| Excluded by `noindex` | 263 |
| Alternate page with proper canonical | 53 |
| Blocked by robots.txt | 2 |
| Duplicate without user-selected canonical | 1 |

Indexed coverage at this snapshot is **18 / 4,601 = 0.39%**. The GSC history in the same export falls from 335 indexed URLs on 2026-07-09 to 18 by 2026-08-21, then remains roughly 18–19 through the latest chart window.

## Crawled – currently not indexed drilldown

GSC exports at most 1,000 example URLs for this reason; the reason-level total is 1,231. The supplied 1,000-row sample is therefore **not an exhaustive URL list**.

Largest route families in the sample:

| Route family | Sample rows |
| --- | ---: |
| `/compounds/` | 602 |
| `/herbs/` | 226 |
| `/guides/` | 35 |
| `/compare/` | 24 |
| `/articles/` | 23 |

The sample contains **223 normalized paths present in both trailing-slash and no-slash form**, involving **446 rows**. This is historical Google-known URL evidence; it does not prove current main still emits both forms.

Last-crawl month distribution in the 1,000-row sample:

| Last crawled | Rows |
| --- | ---: |
| May 2026 | 535 |
| June 2026 | 354 |
| July 2026 | 62 |
| August 2026 | 28 |
| September 2026 | 21 |

Only **21 / 1,000** sample rows were last crawled on or after 2026-09-01. A May/June crawl decision must therefore not be narrated as a fresh September verdict on the current site.

Representative slash-variant families observed in the export include `/compounds/ashwagandha-extract-ksm-66`, `/herbs/ashwagandha`, `/guides/best-adaptogens-for-stress`, and `/compounds/magnesium-glycinate`.

## Discovered – currently not indexed drilldown

All 596 supplied rows are represented in this drilldown. Largest route families:

| Route family | Rows |
| --- | ---: |
| `/guides/` | 162 |
| `/articles/` | 130 |
| `/herbs/` | 72 |
| `/learn/` | 71 |
| Localized core routes (pt/de/es/fr/it/ja/ko/nl/pl) | 91 |
| `/info/` | 20 |
| `/compounds/` | 10 |
| `/evidence/` | 9 |
| `/lead-magnets/` | 8 |
| `/tools/` | 8 |

The export does not provide a real crawl date for these rows; they are treated as discovered/not-yet-crawled observations, not content-quality verdicts.

## Query-parameter duplicate

The supplied duplicate drilldown contains:

`https://thehippiescientist.net/compare/?c=commipheric-acid,5-htp`

The clean path and the query-bearing source URL must remain separately visible in diagnostics. Stripping `?c=...` would erase the evidence that made this a duplicate/canonical observation.

## Reconciliation against current publication truth

The repo's final publication authority is **post-build truth**, not pre-governance workbook flags:

- `reports/profile-publication-truth.json` reconciles rendered robots, canonical, redirects, final sitemap membership, and governance for built herb/compound profiles.
- `out/sitemap.xml` is the final advertised canonical crawl set.
- `out/_redirects` is the final redirect surface.
- `scripts/ci/audit-static-crawl-surface.mjs` verifies representative static HTML and library discovery.
- `scripts/seo/index-quality-shadow.mjs` is observation-only and cannot mutate publication.

The September GSC universe must therefore be partitioned before any remediation:

1. **Current published** — built, indexable, self-canonical, sitemap-included now. A stale crawled-not-indexed observation is an external selection signal, not permission to noindex it.
2. **Governance-held / intentional noindex** — current publication truth says the page should not be indexed. Do not force it into the sitemap just to improve GSC counts.
3. **Redirect or canonicalized-away alias** — historical URL is expected to disappear after recrawl; preserve a correct equivalent redirect only when one exists.
4. **Historical/unbuilt 404 ghost** — keep a real 404 when no equivalent exists. Do not bulk-redirect unrelated URLs.
5. **Query/parameter variant** — retain the exact query-bearing source in diagnostics and verify canonical behavior separately.

Current source already enforces the apex host and trailing-slash canonical form, and final-build sitemap/canonical parity is guarded in CI. The fresh export therefore proves a severe **Google index-selection/crawl recovery problem**, but by itself does **not** prove a new current-main canonical defect. Any runtime change under #5688 requires deterministic current-main evidence first.

## Recovery action

#5688 extends the read-only search-index feedback layer so that:

- `crawled_but_not_in_index` is distinct from `content_quality`;
- `not_yet_crawled` remains a crawl-attention signal;
- query-bearing URLs retain the original query string rather than collapsing into a clean route;
- optional `last_crawled` is preserved with exact crawl age;
- crawl age is descriptive only and never automatically changes robots, sitemap inclusion, canonicals, redirects, or scientific content.

The supplied Page Indexing export does **not** unblock the separate fixed-window page/query Search Performance baseline needed for CTR/position opportunity selection. Google clicks, ranking lift, recrawl outcome, conversion, and revenue impact remain **Unknown** until directly observed.
