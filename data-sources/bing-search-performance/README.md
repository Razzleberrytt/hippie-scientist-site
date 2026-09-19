# Bing Search Performance input

This directory is the local intake for Bing Webmaster Tools **Search Performance** page/query exports used by the search-opportunity and search-conversion reports.

Raw authenticated exports should remain uncommitted. Keep only this README in Git.

## Preferred export shape

Use a page/query export containing as many of these fields as Bing supplies:

```
Query | Page | Clicks | Impressions | CTR | Position
```

Column names are matched case-insensitively.

## Run

Record the exact date window shown by Bing when you export the page/query data:

```bash
npm run seo:bing-opportunities -- --observed-start=2026-08-20 --observed-end=2026-09-18
npm run seo:conversion-priorities
```

The conversion queue requires a dated, fresh search observation and fails closed when that provenance is missing or stale.

The first command builds ordinary search opportunities. The second overlays fresh AI-citation authority as a bounded prioritization signal.

Do not infer a page-level CTR problem or ranking opportunity from domain-level totals alone.
