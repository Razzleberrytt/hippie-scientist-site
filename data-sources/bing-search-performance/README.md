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

```bash
npm run seo:bing-opportunities
npm run seo:conversion-priorities
```

The first command builds ordinary search opportunities. The second overlays fresh AI-citation authority as a bounded prioritization signal.

Do not infer a page-level CTR problem or ranking opportunity from domain-level totals alone.
