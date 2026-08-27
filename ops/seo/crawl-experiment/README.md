# Google crawl / Request Indexing experiment

This experiment is intentionally fail-closed until the exact 97 eligible herb URLs are supplied. Do not substitute a convenient set of 97 pages.

## Design

- 20 URLs: randomized **Request Indexing treatment**.
- 20 URLs: randomized **causal controls**.
- 57 URLs: untouched **observational surveillance cohort** (not controls).
- Randomization is deterministic from a fixed seed after canonicalizing and validating exactly 97 unique `/herbs/<slug>/` routes.
- The 40 randomized treatment/control URLs enter a 28-day content/SEO freeze. The rest of the site continues normally.

## Baseline input

Create `ops/seo/crawl-experiment/eligible-urls.csv` from the actual eligibility export, with exactly 97 unique rows and these columns:

- `url` (or `pathname`)
- `baseline_last_crawled` (required for every row)
- `baseline_lastmod` (optional; if blank, initialization reads the current live sitemap)

Capture Crawl Stats separately with `gsc-crawl-stats-baseline.template.json`. Track HTML requests, Refresh, Discovery, 200/301/404 share, Smartphone Googlebot share, average response time, host status, and 28/90-day trends. Do not infer exact historical crawl waste from Search Console example URLs because they are samples.

## Initialize

```bash
node scripts/seo/initialize-crawl-experiment.mjs \
  --input=ops/seo/crawl-experiment/eligible-urls.csv
```

Initialization refuses any set other than exactly 97 unique canonical herb URLs. It captures current source fingerprints and live sitemap lastmod, deterministically assigns 20/20/57, writes `manifest.json`, writes the 20-row manual Request Indexing checklist, writes the edge registry, and captures Google's current published common-crawler CIDRs.

The treatment action is deliberately manual in Search Console URL Inspection. Google's Indexing API is not used as a generic Request Indexing API for these pages.

## Freeze validation

During the 28-day freeze, the validator blocks changes to the 40 randomized pages' source-data fingerprints, canonical owner, indexability, or sitemap lastmod:

```bash
node scripts/seo/validate-crawl-experiment.mjs --structure-only
node scripts/seo/validate-crawl-experiment.mjs --out-dir=out
```

The 57 observational URLs are monitored but are not frozen by this causal-control contract.

## Edge measurement

`functions/_middleware.js` runs in front of static routes, but records an event only when all of these are true:

1. Experiment is active and the requested pathname is in the 97-page registry.
2. User-Agent looks like Googlebot.
3. `CF-Connecting-IP` matches Google's published **common crawler** CIDRs.
4. The final response is HTML.

The event contains only: timestamp, pathname, HTTP status, Googlebot type, verification method, experiment arm, lastmod block, baseline last-crawled, baseline lastmod, and `cf-ray`. Source IP and page HTML are never logged.

If a `CRAWL_EXPERIMENT_ANALYTICS` Analytics Engine binding exists, events go there. Otherwise the middleware falls back to one structured `console.log` event per verified in-registry HTML crawl. Logging failure cannot block page delivery.

Cloudflare Bot Management's `verifiedBot` signal is recorded only as optional corroboration when present; the experiment does not depend on Enterprise Bot Management.

## Googlebot CIDR refresh

```bash
node scripts/seo/refresh-google-crawler-ranges.mjs
```

This fetches `https://developers.google.com/static/crawling/ipranges/common-crawlers.json` and regenerates the checked-in range module. Do this immediately before experiment activation and refresh it during the measurement window when Google publishes a newer range set.
