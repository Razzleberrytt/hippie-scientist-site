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

## Canonical automation of approval decisions (October 2026)

[Canonical automatic publication approval policy](governance/canonical-automatic-publication-approval.md) is the implementation contract. The trusted merge controller automatically clears **inert research/editorial staging** through ordinary source/CI checks but never interprets this as permission to publish its clinical conclusions. Public medical content, governed public data and source-of-truth changes require **named repository-owner human approval bound to the exact PR-head SHA** and independently satisfy the separate scientific/source/safety validations.

A GitHub-approved review at the exact head or a matching verified-owner PR comment is a **human editorial approval receipt, not medical credentials or an independent scientific verdict**. It must precede promotion; the controller checks it again immediately before merging. Broad messages such as “approve all,” stale-head approvals, untrusted accounts, AI review artifacts, and successful CI without owner receipt are insufficient. Draft article intake remains draft until all specific blockers are resolved.

This policy applies to automated merges via the existing controller, not to privileged direct admin merges; main-branch protection must be enabled and verified before claiming global enforcement.
