# SPEC-1: Hippie Scientist Rebuild Architecture

## Purpose

This document defines the architecture and delivery constraints for rebuilding Hippie Scientist without changing existing app code in this phase. The goal is to establish a clear, durable blueprint that supports incremental migration and safe data publishing.

## 1) Workbook-only Source of Truth

- The workbook under `data-sources` is the **only editorial source of truth** for herbs, compounds, goals, and related metadata.
- No manual edits should be made to generated publish artifacts in `public/data`.
- Every publishable dataset must be reproducible from workbook inputs through deterministic scripts.
- Validation must run before artifact generation to prevent invalid slugs, missing required fields, and inconsistent references.

## 2) Generated Data Separation

- Separate **authored inputs** from **generated outputs**:
  - Authored input: workbook and source support files under `data-sources`.
  - Generated output: versioned JSON artifacts under `public/data`.
- Treat `public/data` as a deployment target, not authoring space.
- Generation pipeline should produce lean route payloads suitable for initial page loads, with optional expanded records when needed.

## 3) Framework Recommendation: Next.js + TypeScript

- Recommended target stack:
  - **Next.js** (App Router or Pages Router selected during implementation planning)
  - **TypeScript** for end-to-end type safety in routes, content models, and UI contracts
- Rationale:
  - Strong routing and static generation support
  - Clear server/client boundaries
  - Mature ecosystem for content-heavy sites
  - Better maintainability through typed domain models

## 4) Feature/Domain Architecture

Organize code by domain to mirror content model and keep logic discoverable:

- `domains/herbs`
- `domains/compounds`
- `domains/goals`
- `domains/common` (cross-domain taxonomies, references, and shared utilities)

Each domain should own:

- route model + slug contract
- schema/types for domain entities
- selectors/transformers from generated data
- domain-specific UI compositions

## 5) Design System / UI Layer

- Introduce a shared UI layer for reusable primitives and tokens:
  - typography
  - spacing and layout primitives
  - color and semantic tokens
  - controls and card/list/detail patterns
- Keep design-system primitives framework-agnostic where feasible.
- Domain screens should compose UI primitives rather than duplicate styling logic.

## 6) Route Registry

Maintain a single route registry that maps domain entities to route contracts and generators.

### Required preserved contracts

- `/herbs/:slug`
- `/compounds/:slug`
- `/goals/:slug`

Registry responsibilities:

- validate slug uniqueness and format
- map route params to generated data records
- provide canonical route builders used across app and generation scripts

## 7) Import Boundaries

Enforce directional imports to prevent architectural drift:

- `data pipeline -> generated artifacts`
- `domain data adapters -> domain features`
- `design system -> feature UI`
- `routes -> domain feature entrypoints`

Boundary rules:

- domains do not import from app shells/pages directly
- design-system code does not import domain business logic
- generation scripts do not import runtime UI code

## 8) Data Audit Scripts

Create or extend scripts that run in CI and local checks to audit generated content:

- required field coverage per domain
- slug validity and uniqueness
- orphan reference detection across herbs/compounds/goals
- schema conformance checks
- diff-oriented summaries for generated output changes

Audit scripts should fail fast with actionable errors and line/record context where possible.

## 9) Delivery Strategy: Small Branches, No Mega-Refactor PRs

- Prefer small, focused branches that implement one architectural slice at a time.
- Avoid mega-refactor pull requests that mix data pipeline changes, routing rewrites, and UI overhauls in one diff.
- Suggested sequence:
  1. schemas + validators
  2. generation/audit scripts
  3. route registry
  4. domain adapters
  5. UI migration by page slice
- Each PR should preserve behavior or explicitly document intentional deltas.

## 10) Non-goals for This Spec Drop

- No workbook edits.
- No refactor of existing runtime app code yet.
- No deletion of existing source files.

## Acceptance for This Document

This spec is complete when:

- it exists at `docs/SPEC-1-Hippie-Scientist-Rebuild.md`
- it captures data-source, architecture, and delivery boundaries above
- it can guide subsequent implementation PRs without requiring a mega-refactor plan
