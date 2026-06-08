# Editorial Runtime Schema Roadmap

## Goal

Move from workbook-driven content generation toward a governed schema-aware publishing system.

The system should eventually support:

- normalized runtime entities
- semantic relationships
- compare-table rendering
- decision-engine rendering
- evidence confidence rendering
- trust-aware UI blocks
- controlled runtime promotion

## Current state

Implemented:

- workbook source-of-truth enforcement
- workbook parser boundary
- editorial workbook validator
- editorial runtime exporter architecture
- payload contract documentation
- editorial review workflow

Not yet implemented:

- runtime importer execution
- schema registry
- runtime payload promotion
- semantic relationship exports
- automated citation freshness checks
- contradiction-aware rendering

## Proposed schema layers

### Layer 1 — Editorial records

Review-oriented normalized records exported from workbook sheets.

Examples:

- compound-pages.json
- learn-articles.json
- research-notes.json
- compare-rows.json

## Layer 2 — Canonical entities

Normalized reusable entities.

Examples:

- compounds
- mechanisms
- outcomes
- safety flags
- evidence tiers
- compare categories

## Layer 3 — Runtime graph

Relationship-aware runtime payloads.

Examples:

- related compounds
- synergistic relationships
- contradiction relationships
- compare relationships
- semantic topic clusters

## Layer 4 — Presentation layer

UI-ready payloads.

Examples:

- Quick Verdict
- Evidence Confidence
- Safety Snapshot
- What We Still Don't Know
- Compare cards
- Trust badges

## Runtime safety principles

The runtime layer should:

- fail loudly on invalid schema
- reject malformed enums
- reject duplicate slugs
- reject missing required fields
- reject unsupported runtime payloads

## Future schema validation

Future validation should include:

- citation structure validation
- PMID/DOI formatting checks
- canonical enum normalization
- semantic relationship validation
- confidence-score validation
- internal-link integrity checks

## Important architectural constraint

The workbook remains authoritative.

Runtime payloads are derived artifacts only.
