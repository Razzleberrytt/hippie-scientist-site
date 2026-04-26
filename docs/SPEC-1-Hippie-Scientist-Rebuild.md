# SPEC-1: Hippie Scientist Rebuild

## Purpose

This specification defines rebuild governance and architecture boundaries for Hippie Scientist. This is a documentation-first phase intended to establish safe operating rules before any app or data-pipeline implementation work.

## Canonical Data and Output Targets

- **Workbook-only source of truth:** `data-sources/herb_monograph_master.xlsx`
- **Migration output:** `public/data-next`
- **Final runtime output:** `public/data`

These targets are mandatory and govern all future migration and publishing workflows.

## Feature and Domain Architecture

Rebuild work should organize domain logic under feature-oriented modules:

- `src/features/herbs`
- `src/features/compounds`
- `src/features/search`

## Shared UI Layer

Reusable interface primitives and search UI should live in shared component layers:

- `src/components/ui`
- `src/components/search`

Shared UI should remain reusable and decoupled from domain-specific business logic.

## Central Route Registry

Route contracts and route builders should be managed in one place:

- `src/routes.ts`

Preserved route contracts:

- `/herbs/:slug`
- `/compounds/:slug`
- `/goals/:slug`

## Data Access Layer

Generated runtime data should be consumed through centralized helpers and types:

- `src/data/runtime.ts`
- `src/data/types.ts`

## Script Surface for Rebuild Governance

The following script names are part of rebuild governance and should be used for data checking, generation, validation, and quality reporting:

- `data:check:workbook-source`
- `data:inspect`
- `data:check:generated`
- `data:build:next`
- `data:validate:next`
- `data:report:quality:next`

## Branch Discipline

- One focused branch per task.
- No mega-refactor PRs.
- No manual generated JSON edits.

## Related Governance Docs

- [Generated Data Policy](./generated-data-policy.md)
- [Import Boundaries](./import-boundaries.md)
- [Contractor Onboarding](./contractor-onboarding.md)
