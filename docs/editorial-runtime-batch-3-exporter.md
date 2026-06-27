# Batch 3 — Editorial Runtime Exporter

## Purpose

Add a read-only exporter that turns workbook editorial sheets into review payloads under `ops/editorial-runtime/`.

This is not a production promotion step. It must not write to `public/data`.

## Required script

Create:

- `scripts/data/import-editorial-runtime.mjs`

## Required package script

Add:

- `editorial:import`

Expected command behavior:

- default output: `ops/editorial-runtime`
- optional `--out <dir>` argument
- optional `--strict` argument that forwards strict validation expectations later

## Required outputs

- `ops/editorial-runtime/compound-pages.json`
- `ops/editorial-runtime/learn-articles.json`
- `ops/editorial-runtime/research-notes.json`
- `ops/editorial-runtime/compare-rows.json`
- `ops/editorial-runtime/manifest.json`

## Guardrails

- no workbook mutation
- no `public/data` writes
- no generated runtime edits
- no dependency changes
- no direct `xlsx` import
- use `scripts/workbook-source.mjs`
- use `scripts/data/workbook-parser.mjs`

## Runtime promotion remains deferred

This batch only creates review payloads. A future batch can promote reviewed payloads into runtime data after schema validation and human approval.
