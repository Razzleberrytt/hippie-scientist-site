# AI Query Opportunity Report

This analyzer turns the local Bing Webmaster Tools **AI Performance** exports into a compact opportunity report without publishing the raw CSVs.

## Inputs

Place the Bing exports in:

```text
data-sources/ai-performance/
```

The analyzer recognizes the two current export shapes:

- Overview: `Date`, `Citations`, `Cited Pages`
- Search queries: `Grounding Query`, `Intent`, `Topic`, `Citations`, `Citation Share`

Raw AI Performance exports stay local/private under the repository's existing `.gitignore` policy.

## Run

```bash
node scripts/seo/ai-query-opportunity-report.mjs
```

Optional paths:

```bash
node scripts/seo/ai-query-opportunity-report.mjs \
  --dir=/path/to/ai-performance \
  --out=/path/to/reports
```

Outputs:

```text
ops/reports/ai-query-opportunities.json
ops/reports/ai-query-opportunities.md
```

## What it measures

The report separates overview totals from query-level citations so the two exports are never summed together.

It reports:

- latest daily citation count and cited-page breadth;
- first-seven-day versus last-seven-day citation velocity;
- first-seven-day versus last-seven-day breadth growth;
- highest-volume grounding queries;
- topic, intent, and primary query clusters;
- a simple ROI proxy using citation volume, citation share, and intent weighting.

The ROI proxy is only a prioritization aid. It is **not revenue attribution**.

## Content operating rule

Use recurring query variants to strengthen an existing canonical page or comparison hub when they express the same underlying intent. Do not create one thin page per grounding query. A new page should exist only when the query cluster represents a genuinely distinct user decision or evidence question.

Preserve the site's evidence, safety, canonical, provenance, and review gates. After a content change, compare subsequent citation velocity and cited-page breadth against the retained baseline rather than assuming the edit worked.

## September 2, 2026 baseline

The first production dataset used to validate this analyzer contained 29 overview days (August 3–31, 2026) and 237 surfaced grounding queries.

Observed baseline:

- 16,055 overview citations;
- 1,012 citations on August 31 across 60 cited pages;
- 873.1 citations/day in the last seven days versus 351/day in the first seven days (+148.8%);
- 53.9 cited pages/day in the last seven days versus 21.1 initially (+154.7%);
- 7,400 citations represented in the surfaced-query export, 46.1% of the overview total.

The largest primary query clusters in that surfaced subset were broad sleep, stress/resilience, valerian sleep, anxiety/calm, and mushroom coffee. Treat query-export coverage as partial unless Bing changes the export contract.
