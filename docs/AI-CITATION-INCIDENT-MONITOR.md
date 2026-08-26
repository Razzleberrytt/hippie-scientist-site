# Bing AI Citation Incident Monitor

The site treats Bing Webmaster Tools AI Performance as a useful but fallible measurement surface. A sudden AI citation drop is **not** automatically interpreted as a content-quality or indexing failure.

## What the monitor does

`scripts/seo/ai-citation-incident-monitor.mjs` reads dated CSV exports from:

```text
data-sources/ai-performance/
```

It accepts multiple Bing AI Performance exports at once, but deliberately selects **one dated source** instead of summing overlapping Overview / Page / Query reports. This prevents the same citations from being counted more than once.

Selection is **freshness first**: the candidate with the newest dated row wins. Source richness breaks ties only among candidates ending on the same date, preferring Overview data with cited-page breadth, then other usable Overview/Page/Query data. An older richer export may never outrank a newer usable export.

Known corrupted reporting dates are excluded through `ai-visibility-anomaly.mjs` before baselines are calculated.

### Data acquisition boundary

Bing's AI Performance documentation currently exposes CSV/Excel export from the authenticated dashboard. The general Bing Webmaster API documentation covers search/index webmaster data but does not document an AI Performance retrieval endpoint.

For that reason this system does not scrape the dashboard or invent an unsupported API integration. Raw AI Performance exports remain ignored by Git by default. When a fresh export is available locally or is otherwise intentionally injected into a run, the monitor analyzes it; when it is absent, the monitor emits an explicit waiting-state report rather than treating missing input as a citation collapse.

**The unattended weekly Search Console workflow does not run this monitor.** That workflow has no supported way to acquire a fresh authenticated Bing AI Performance export, so scheduling the detector there would create a false sense of monitoring while every clean runner merely entered the waiting state. Run the detector only in a checkout/run that actually has a fresh Bing export. If Bing later exposes a supported retrieval API or an authorized artifact feed is added, scheduled invocation can be reviewed separately.

The durable intake instructions live in `data-sources/ai-performance/README.md`.

## Incident rule

The default detector evaluates only reporting dates that are at least **2 days old** so a partially processed Bing day does not trigger a false alarm.

A full incident requires both of these signals on a mature clean day:

- citations fall at least **50%** below the trailing 7-day median;
- cited-page breadth falls at least **35%** below the trailing median.

The baseline must contain at least three usable days, at least 100 median citations, and at least 10 median cited pages before the synchronized detector is trusted.

The monitor scans the recent mature window rather than inspecting only the latest day. If citations collapse on Tuesday and recover by Friday, the Tuesday incident remains visible on the next operator run instead of disappearing because the newest date is healthy.

A citation drop without a cited-page breadth collapse is classified separately as `citation-drop-only` and does not trigger the stronger incident diagnosis.

## Independent cross-checks

When a synchronized incident is detected, the monitor checks three independent surfaces:

### Google Search Console

`data-sources/search-console/pages-by-date.csv` is aggregated by date and compared with the same trailing-median method.

- Search impressions down less than 30%: `stable`
- Search impressions down 30–49.9%: `soft-drop`
- Search impressions down 50% or more: `collapsed`

Stable ordinary search while Bing AI citations and cited-page breadth collapse together is evidence against a site-wide visibility failure.

### Repository technical sanity

The monitor verifies that the current checkout still contains a meaningful production corpus:

- at least 400 herb + compound summary records;
- at least 200 profiles marked `PUBLISH`;
- at least 250 route-manifest entries;
- at least 20 redirect rules.

These are catastrophic-regression guards, not a substitute for the stricter crawl/indexability CI already in the repository.

### SEO-sensitive changes

The monitor examines available git history during the baseline-to-incident window and surfaces changes to high-risk SEO ownership paths such as sitemap/robots, redirects, indexability summaries, runtime manifests, and IndexNow/index-quality code.

If the checkout is shallow or history is unavailable, the monitor marks the change evidence incomplete and downgrades an otherwise high-confidence external-event classification rather than pretending no relevant change happened.

A sensitive change lowers confidence in an external-event classification, but it is not treated as proof of causation.

## Diagnoses

The important outcomes are:

| Diagnosis | Meaning | Default response |
| --- | --- | --- |
| `probable-bing-ai-reporting-or-grounding-event` | AI citations + breadth collapsed while ordinary search and current technical sanity stayed healthy | Observe; do not broadly rewrite or deindex content |
| `bing-ai-event-suspected` | AI incident is real but independent search evidence is incomplete or only mildly soft | Observe through the next finalized window |
| `possible-site-or-indexability-event` | AI incident coincides with ordinary-search collapse or failed technical sanity checks | Investigate the site first |
| `citation-volatility-without-breadth-collapse` | Citation count fell, but cited-page breadth did not | Treat as volatility, not a domain incident |
| `no-incident` | Thresholds were not met | Continue monitoring |
| `insufficient-evidence` | Not enough mature dated data | Collect more exports |

## IndexNow safeguard

The monitor **never mass-resubmits the site merely because the Bing AI dashboard falls**.

Deploy-time IndexNow already fingerprints changed pages and sends changed URLs. If the monitor identifies a likely site/indexability issue, fix the underlying problem first and let normal deployment notify the affected URLs. This prevents a vendor reporting wobble from causing a second self-inflicted SEO event.

## Outputs

Every run writes:

```text
ops/reports/ai-citation-incident.json
ops/reports/ai-citation-incident.md
```

When a full synchronized incident exists it also writes a dated forensic snapshot:

```text
ops/ai-citations/incidents/YYYY-MM-DD.json
```

These outputs are produced only when the monitor is explicitly run. The existing weekly Search Console workflow remains focused on its supported Search Console and anomaly-safe analytics inputs and does not pretend to have Bing AI Performance data that it cannot acquire.

## Manual or injected-data run

```bash
node scripts/seo/ai-citation-incident-monitor.mjs
```

Useful overrides:

```bash
node scripts/seo/ai-citation-incident-monitor.mjs --lag-days=3 --lookback-days=7
node scripts/seo/ai-citation-incident-monitor.mjs --dir=/path/to/bing-exports
node scripts/seo/ai-citation-incident-monitor.mjs --search-console=/path/to/pages-by-date.csv
```

For deterministic regression/debug runs, `--now=YYYY-MM-DD` pins the detector's processing cutoff.
