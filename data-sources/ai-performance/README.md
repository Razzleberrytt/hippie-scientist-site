# Bing AI Performance input

This directory is the local intake for Bing Webmaster Tools **AI Performance** exports used by the citation tracker and incident monitor.

## Data acquisition boundary

Bing's AI Performance documentation currently describes CSV/Excel exports from the dashboard. The general Bing Webmaster API documentation covers search/index webmaster data, but does not document an AI Performance retrieval endpoint. Because of that boundary, this repository does **not** scrape the authenticated dashboard or pretend the feed is fully automated.

Export the relevant Bing AI Performance views and place the files here before running the monitor. Raw exports are ignored by Git by default so page/query analytics are not published in the public repository; only this README is tracked.

Preferred export:

1. a dated Overview/time-series export with `Date`, citation count, and cited-page count;
2. optionally Page and Grounding Query exports for deeper analysis.

The detector accepts common Bing header variants including `Total Citations`, `Citations`, `Cited Pages`, `Date`, `URL`/`Page`, and `Grounding Query`.

## Run

```bash
node scripts/seo/run-ai-citation-analytics.mjs
node scripts/seo/ai-citation-incident-monitor.mjs
```

The monitor deliberately selects one dated export for domain-level incident totals instead of summing Overview, Page, and Query exports together. Those views overlap and can legitimately disagree, so adding them would double-count the same underlying citation activity.

## Swarm activation

Fresh page-level telemetry may also be promoted into the **derived, non-raw** swarm signal file at `config/ai-citation-swarm-priorities.json`. Do not commit the authenticated CSV merely to make the scheduler portable.

The current operating contract is `docs/AI-CITATION-GROWTH-LOOP.md`. Citation telemetry is allowed to prioritize already-eligible work, protect high-citation assets, and strengthen adjacent evidence clusters; it is not traffic, ranking, conversion, revenue, or causal proof.

For citation-aware enrichment scheduling, use:

```bash
node scripts/enrichment-pipeline/citation-aware-schedule.mjs <workpacks.json> <shard> [limit]
```

When `limit` is supplied, the scheduler applies the checked-in portfolio policy: approximately 65% citation-adjacent selection while preserving at least a 35% exploration floor when enough uncited work exists. Scientific, safety, provenance, canonical-owner, hard-block, WIP, accessibility, and release gates remain unchanged.

Refresh the derived signal manifest from a new Page export rather than carrying winner assumptions indefinitely. Preserve the snapshot date and measurement boundary so later comparisons remain auditable.

## Freshness

AI Performance is a delayed, aggregated measurement surface. Keep exports current and let the monitor's processing-lag guard ignore the newest potentially incomplete dates. Known corrupted reporting windows are excluded by `scripts/seo/ai-visibility-anomaly.mjs`.

If no usable dated export exists, the monitor produces a waiting-state report instead of treating missing input as a ranking collapse.
