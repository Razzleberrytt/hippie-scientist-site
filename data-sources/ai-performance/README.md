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

The scheduler emits the signal snapshot label, measurement boundary, shard, selected-workpack count, direct-winner count, and citation-adjacent count in its summary so a selection run can be audited without exposing the raw authenticated export.

Refresh the derived signal manifest from a new Page export rather than carrying winner assumptions indefinitely. Preserve the snapshot date and measurement boundary so later comparisons remain auditable.

## Protected high-citation winner baseline (P0 #6685)

The source-of-truth **dated, derived** Bing Page Stats signal is `config/ai-citation-swarm-priorities.json`. The durable guard is `config/ai-citation-protected-assets.json`, generated with:

```bash
node scripts/seo/ai-citation-protected-assets.mjs
node scripts/ci/validate-ai-citation-protected-assets.mjs
```

The **2026-10-12** reviewed baseline protects **10 directly source-owned URLs**, totaling **33,560 of 49,177 Page Stats citations (68.24%)**. It protects file ownership and extractable stable source titles, frontmatter slugs, and literal canonical/H1 fields when they genuinely appear in source. A dynamic guide source without a static field is **not** represented as a verified rendered H1 or canonical. For MD/MDX article source, frontmatter titles and slugs are guarded without pretending they establish independently verified rendered H1.

Three cited article routes currently lack an exact direct canonical article owner: `/articles/2c-b-effects/`, `/articles/magnesium-types-for-sleep/`, `/articles/yerba-mate-vs-green-tea/`. They are recorded in `unresolvedOwners`; do **not** map them to similarly named blog posts or guides without canonical/redirect/build proof.

This is an **identity-change guard**, not a content freeze. Scientific safety corrections, study/claim updates, and source repairs must remain possible through the usual editorial verification. Intentional canonical/title/slug migrations require separately documented redirect, rollback and review proof before refreshing the baseline. A missing or changed protected source fails validation while the snapshot is fresh. A stale, malformed, or future-dated citation snapshot becomes neutral rather than obstructing unrelated work; the status is explicit, not a silent successful integrity check.

The ledger stores the owner-verified snapshot date, not a fabricated export generation time. Raw authenticated Bing CSVs remain excluded from Git. Changes to source/content owner routing should be checked against the existing static output, article publication manifest and real canonical tags; pure source signatures alone cannot establish search or AI citation growth.

## Freshness

AI Performance is a delayed, aggregated measurement surface. Keep exports current and let the monitor's processing-lag guard ignore the newest potentially incomplete dates. Known corrupted reporting windows are excluded by `scripts/seo/ai-visibility-anomaly.mjs`.

If no usable dated export exists, the monitor produces a waiting-state report instead of treating missing input as a ranking collapse.
