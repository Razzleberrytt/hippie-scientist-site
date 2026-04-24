# Workbook-only data contract

This document defines the minimum viable contract for the workbook-only hard reset migration.

## Source of truth

- Canonical workbook source: `data-sources/herb_monograph_master.xlsx`.
- During migration, runtime artifacts are generated to `public/data-next`.
- Final target state is `public/data`.

## Required route contract

The workbook-only architecture must preserve these route contracts:

- `/herbs/:slug`
- `/compounds/:slug`
- `/goals/:slug` (compatibility contract during migration/cutover)

## Blocking identity fields

All emitted herb/compound records must include:

- `name`
- `slug`

## Compound blocking constraints

Compound records must fail blocking validation when either identity field is:

- numeric-only
- single-character

## Optional field behavior (sparse-tolerant rendering)

- Missing array fields default to `[]`.
- Missing string fields default to `""`.
- Missing summary text displays: `Profile pending review`.
- Empty sections are hidden in UI rendering.

## Generated output layout

The generated runtime layout (final-state under `public/data`) is:

- `herbs.json`
- `compounds.json`
- `herbs-summary.json`
- `compounds-summary.json`
- `herbs-detail/*.json`
- `compounds-detail/*.json`
- `_meta/build-info.json`

During migration, this same layout is produced under `public/data-next`.

## Canonical workbook-only commands

- `npm run data:build`
- `npm run data:validate`
- `npm run data:report:quality`

## Rollback concept

If workbook-only cutover causes regression:

1. Restore old `package.json` scripts from git.
2. Restore previous `public/data` artifacts from git.

