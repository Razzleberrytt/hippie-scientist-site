# Request Indexing randomized crawl experiment

## Purpose

Measure whether Search Console **Request Indexing** changes time-to-recrawl for a fixed cohort of eligible herb pages without confusing ordinary crawl allocation, sitemap churn, or content changes with the treatment effect.

## Design

- 97 eligible herb URLs in the registry.
- 20 randomly assigned to **treatment**: Request Indexing.
- 20 randomly assigned to **causal control**: no request.
- 57 untouched URLs are an **observational surveillance cohort**, not a causal control.
- Primary outcome: elapsed time from experiment start to the first verified Googlebot HTML recrawl.
- Follow-up: 28 days.

The current manifest intentionally starts as `pending_registry`. The exact 97-URL source registry was not present in the supplied discussion or repository, and the current curated herb allowlist is not a valid substitute. Telemetry is safe to deploy while pending; treatment/control assignment is forbidden until the exact registry is imported.

## Edge telemetry

`functions/herbs/_middleware.ts` observes responses for `/herbs/*` after they are generated. Scoping the middleware to herb routes captures the complete experiment surface without imposing a Pages Function invocation on unrelated site traffic. It:

1. ignores non-Googlebot-looking user agents;
2. ignores non-HTML responses;
3. obtains the source address from Cloudflare's `CF-Connecting-IP` header;
4. verifies it against Google's published **common crawler** CIDR feed (`https://developers.google.com/static/crawling/ipranges/common-crawlers.json`);
5. emits one event for a verified Googlebot HTML request.

Verification happens in the `waitUntil()` telemetry path after the page response is available, so fetching/refreshing Google's CIDR list does not add crawler-facing response latency. CIDRs are cached per isolate for six hours. No raw source IP is logged.

Each event contains only:

- `timestamp`
- `pathname`
- `http_status`
- `googlebot_type`
- `verification_method`
- `experiment_arm`
- `lastmod_block`
- `baseline_last_crawled`
- `baseline_lastmod`
- `cf_ray`

Every event is written to Cloudflare function logs. For durable event retention, create a Pages KV namespace binding named **`CRAWL_EXPERIMENT_KV`**. When present, each event is also stored for 90 days under `crawl-experiment/v1/...`. The middleware does not depend on Bot Management or an Enterprise plan.

## Recovering and arming the 97-URL registry

Export/recover the exact eligible registry used to define the 97 pages, including baseline crawl data when available, then run:

```bash
node scripts/seo/build-crawl-experiment-manifest.mjs --input path/to/eligible-97.csv
node scripts/ci/validate-crawl-experiment.mjs
```

The importer accepts CSV or JSON and refuses to arm unless it receives exactly 97 unique canonical `/herbs/<slug>` paths that exist in current herb data **and are currently sitemap/indexability eligible**. It snapshots current content hashes and lastmod values, deterministically samples 40 pages using the committed seed, block-balances the 20/20 arm assignment using lastmod-age blocks, and fingerprints the route-policy surface that controls herb canonical/indexability behavior.

Do **not** hand-pick or replace missing URLs after seeing assignments. If eligibility changes before activation, rebuild the entire registry from the pre-specified eligibility rule and record the new seed/version.

## 28-day freeze

The 40 randomized pages are frozen for 28 days:

- no substantive content edits;
- no canonical-owner changes;
- no indexability changes;
- no legitimate `lastmod` changes.

The other 57 pages are not frozen by the causal protocol and may continue to evolve with the site.

At activation, the manifest records a SHA-256 fingerprint of the route-policy files controlling the herb page, sitemap eligibility, canonical/indexability rules, and redirects. This is intentionally conservative: if that policy surface changes during the 28-day window, CI stops the change so it can be evaluated as experimental contamination rather than silently merged.

`crawl-experiment-guard.yml` runs on relevant PRs. Once the manifest is active it fails if:

- counts differ from 20/20/57;
- an experiment URL disappears from current herb data;
- an experiment URL loses current sitemap/indexability eligibility;
- a treatment/control record's content fingerprint changes;
- a treatment/control lastmod changes;
- canonical/indexability/redirect policy differs from the activation snapshot;
- the freeze window is not exactly 28 days.

## Crawl Stats baseline

Capture Search Console Crawl Stats for the 90-day report and, where useful, compare 28-day and 90-day trends. Keep these as baseline/context metrics rather than treating the headline total as page-fetch capacity:

| Metric | Interpretation |
| --- | --- |
| HTML crawl requests/day | Approximate page-fetch activity rather than all resources |
| Refresh crawls/day | Most relevant to already-known stale eligible URLs |
| Discovery crawls/day | Detects attention spent discovering/churning URLs |
| 200 / 301 / 404 share | Separates productive fetches from redirect/dead-URL waste |
| Smartphone Googlebot share | Main indexing crawler mix |
| Average/median response time | Checks whether latency may constrain crawl rate |
| Host status | Checks infrastructure health/throttling |
| 28/90-day trend | Shows whether crawl allocation is already changing |

Search Console example URLs are samples, not a complete access log. Do not extrapolate an exact count of historical dead URLs being crawled from those examples alone.

## Analysis

Use the randomized 20 vs 20 comparison for causal inference. Use the 57-page cohort only to describe background crawl behavior. Edge telemetry is the primary recrawl timestamp; URL Inspection can remain a secondary verification source rather than the timing source of truth.
