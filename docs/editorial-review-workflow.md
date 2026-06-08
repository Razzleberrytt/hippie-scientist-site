# Editorial Review Workflow

## Principle

The workbook remains the canonical source of truth.

Editorial runtime payloads are review artifacts, not production artifacts.

The system should optimize for:

- trust preservation
- scientific caution
- controlled publishing
- schema integrity
- human oversight

## Workflow

```txt
Workbook
  ↓
Editorial validator
  ↓
Editorial runtime exporter
  ↓
ops/editorial-runtime/*
  ↓
Human review
  ↓
Future runtime promotion
  ↓
public/data
```

## Human review requirements

The following require explicit human approval before promotion:

- dosage guidance
- safety claims
- hormonal claims
- longevity claims
- affiliate recommendations
- interpretation of weak/conflicting evidence

## Automatic block conditions

Promotion should fail automatically when:

- citations are missing
- duplicate slugs exist
- safety sections are missing
- canonical enums fail validation
- medical claims are detected
- unsupported certainty language is detected

## Required uncertainty language

Editorial assets should consistently acknowledge:

- evidence limitations
- individual variability
- conflicting findings when applicable
- lack of long-term human evidence when applicable

## Commercial separation

Affiliate positioning must remain downstream from evidence interpretation.

Commercial considerations should never override:

- evidence hierarchy
- safety framing
- uncertainty disclosure
- contradiction summaries

## Future automation constraints

Future AI-assisted workflows should:

- generate drafts only
- never self-publish
- never bypass validation
- never bypass human review
- never overwrite runtime payloads directly
