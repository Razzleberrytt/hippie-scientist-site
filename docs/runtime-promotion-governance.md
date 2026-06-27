# Runtime Promotion Governance

## Purpose

Define how editorial review payloads may eventually become production runtime data.

This promotion layer is intentionally separate from:

- workbook ingestion
- editorial validation
- editorial runtime export

The separation is a safety boundary.

## Core principle

Nothing should move from:

```txt
ops/editorial-runtime/
```

into:

```txt
public/data/
```

without:

- validation
- normalization
- governance review
- explicit approval

## Promotion workflow

```txt
Workbook
  ↓
Editorial validator
  ↓
Editorial exporter
  ↓
ops/editorial-runtime/*
  ↓
Scientific review
  ↓
Governance review
  ↓
Promotion validation
  ↓
public/data/*
```

## Promotion requirements

A payload should fail promotion when:

- citations are missing
- duplicate slugs exist
- unsupported enums exist
- safety sections are missing
- unsupported certainty language exists
- medical claims are detected
- runtime schema validation fails

## Human approval requirements

Mandatory human approval should exist for:

- hormonal claims
- longevity claims
- pediatric-related content
- dosage interpretation
- affiliate recommendations
- controversial compounds
- conflicting evidence summaries

## Future approval metadata

Future payloads may include:

```txt
reviewed_by
review_timestamp
citation_verified
safety_reviewed
approved_for_runtime
promotion_version
```

## Runtime immutability principle

Generated runtime data should:

- never be hand-edited
- always be reproducible
- remain derivable from source systems
- preserve deterministic exports

## Strategic reason for separation

Without promotion governance, the platform risks:

- uncontrolled AI publishing
- corrupted runtime payloads
- inconsistent evidence labels
- affiliate-driven bias drift
- silent scientific inaccuracies
- schema fragmentation

## Long-term vision

Eventually the platform may support:

- reviewed promotion queues
- runtime schema enforcement
- citation freshness monitoring
- semantic relationship validation
- contradiction-aware rendering
- trust-layer scoring

But those systems should remain downstream from editorial review.
