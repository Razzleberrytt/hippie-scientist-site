# Indexability Governance

## Purpose

Indexability governance keeps several publishing concerns separate so later SEO changes can be made deliberately:

- Renderability: whether a route can exist and remain reachable for users.
- Indexability: whether a route should invite search indexing.
- Sitemap inclusion: whether a route should be listed as a discovery target for crawlers.
- Monetization or featuring eligibility: whether a profile is mature enough to promote, feature, or monetize.

The intent is to make generated herb and compound metadata auditable before it is used for broader sitemap or noindex decisions.

## Status Definitions

- `PUBLISH`: The record has enough identity, content depth, safety context, and evidence signal to be treated as indexable.
- `NOINDEX`: The record can remain available to users, but should not currently be promoted for search indexing.
- `NEEDS_REVIEW`: The record is close enough to inspect editorially before deciding whether to publish or noindex.
- `BLOCKED`: The record has a hard blocking issue, such as an invalid slug, invalid name, hidden decision, or explicit blocking robots signal.

## Current Phase 1 Behavior

Herb and compound runtime records have build-time indexability metadata emitted by the workbook data pipeline. Existing runtime fields are preserved, and the metadata is added alongside the current visibility fields.

Runtime visibility also has a fallback path when metadata is missing, so older or partial payloads can still render with conservative behavior.

Sitemap and noindex behavior has not yet been broadly changed for every route class. This document and the Phase 1.5 scripts are for reporting and validation only.

## Field Definitions

- `indexability_status`: Policy decision for search governance. Valid values are `PUBLISH`, `NOINDEX`, `NEEDS_REVIEW`, and `BLOCKED`.
- `indexability_score`: Numeric score from the build-time policy. It is a review aid, not a standalone publishing rule.
- `indexability_reasons`: Deterministic list of policy signals that explain the score and status.
- `robots`: Intended robots directive for the record. Current valid values are `index,follow` and `noindex,follow`.
- `sitemap_included`: Boolean indicating whether the record is eligible for sitemap inclusion under the indexability policy.
- `visibility_tier`: Runtime-facing tier used by the site to describe visibility and publishing maturity.

## Editorial Review Workflow

Run the metadata validator before relying on indexability fields:

```bash
npm run indexability:validate
```

Generate the editorial and SEO summary:

```bash
npm run indexability:report
```

The report writes a concise machine-readable artifact to:

```text
ops/indexability-review/indexability-summary.json
```

Use that report to review high-scoring `NEEDS_REVIEW` records, `NOINDEX` records closest to publishability, and any low-scoring `PUBLISH` records that look suspicious.

## Phase 2 Recommendation

The next phase should use route manifest indexability metadata as the source for sitemap filtering. Sitemap chunks should be filtered by publishability while keeping accessible noindex pages reachable through normal navigation when they are useful to users.

Avoid changing static education pages until those route classes have governed fields. Avoid mass noindex changes until the Phase 1.5 report has been reviewed and any metadata gaps are understood.

## Guardrails

- Do not remove routes just because they are `NOINDEX`.
- Do not make sitemap behavior depend on runtime-only heuristics.
- Do not index thin or generated pages just because they exist.
- Do not manually edit `public/data` JSON.
- Do not commit generated churn unless it is intentionally part of a data update.
