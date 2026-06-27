# Workbook-only data contract

This document defines the current minimum viable contract for the workbook-only runtime data architecture.

## Source of truth

- Canonical workbook source: `data-sources/herb_monograph_master.xlsx`.
- Runtime artifacts are generated to `public/data`.

## Required route contract

The workbook-only architecture must preserve these route contracts:

- `/herbs/:slug`
- `/compounds/:slug`
- `/goals/:slug`

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

The generated runtime layout under `public/data` is:

- `herbs.json`
- `compounds.json`
- `herbs-summary.json`
- `compounds-summary.json`
- `herbs-detail/*.json`
- `compounds-detail/*.json`
- `_meta/build-info.json`

## Canonical workbook-only commands

- `npm run data:build`
- `npm run data:validate`

## Recovery concept

If generated runtime data regresses, fix the workbook or exporter, rerun `npm run data:build`, and verify with `npm run check`.

