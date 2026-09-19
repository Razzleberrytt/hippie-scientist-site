# Search Conversion Loop

## Purpose

The site already has a strong Bing AI-citation signal. The next growth objective is to convert that authority into ordinary organic-search visibility and clicks rather than maximizing citation count for its own sake.

The control-plane sequence is:

1. **Measure search demand** with page/query exports.
2. **Rank CTR gaps** at the page's current position.
3. **Rank striking-distance pages** in positions 4–15.
4. **Overlay fresh AI-citation authority** only as a bounded confidence signal.
5. **Run reversible metadata/internal-link experiments first** where the evidence supports them.
6. **Use substantive content upgrades** only where observed queries show a real coverage gap.
7. **Create net-new pages only for distinct intent** after canonical/cannibalization review.

## Current aggregate signal

The 2026-09-19 user-supplied Bing screenshots show:

- AI Performance, 30 days: 23.1K citations and 49 average cited pages.
- Traditional Bing search: 7.1K impressions, 58 clicks, 0.82% CTR.
- The traditional-search screenshot did not expose its date selector, so its exact window is not asserted.

These numbers establish the **conversion-gap objective**, but they are not enough to choose individual URLs. Page-level search exports are required for that.

## Runbook

### 1. Export Bing search performance

Place page/query CSV exports in:

```
data-sources/bing-search-performance/
```

Expected fields are matched case-insensitively:

```
Query | Page | Clicks | Impressions | CTR | Position
```

### 2. Build the search opportunity report

```bash
npm run seo:bing-opportunities
```

This writes:

```
ops/reports/search-opportunities.json
ops/reports/search-opportunities.md
```

### 3. Build the citation → click queue

```bash
npm run seo:conversion-priorities
```

This writes:

```
ops/reports/search-conversion-priorities.json
ops/reports/search-conversion-priorities.md
```

The report keeps search opportunity primary. Fresh AI-citation telemetry can add at most a 35% boost and cannot create an opportunity when measured search upside is zero.

## Swarm operating rule

When a fresh conversion report exists, Discovery/SEO should prefer, in order:

1. high-impression CTR underperformers;
2. positions 4–15 with meaningful impressions;
3. cited winners that also have measurable search upside;
4. substantive refreshes supported by query gaps;
5. net-new content for distinct intent only.

A high AI-citation count by itself is a **defend/observe** signal, not a command to keep expanding that cluster.

Scientific, safety, canonical ownership, provenance, accessibility, WIP, review, and release gates still outrank all demand signals.
