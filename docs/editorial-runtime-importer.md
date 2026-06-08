# Editorial Runtime Importer Batch

This batch introduces the first implementation layer for the workbook editorial governance system.

## Intent

The workbook already remains the source of truth. The editorial importer should read review-oriented workbook sheets and export non-production review payloads before anything is promoted into `public/data`.

## Source workbook policy

- Canonical workbook: `data-sources/herb_monograph_master.xlsx`
- Workbook path resolution must continue through `scripts/workbook-source.mjs`
- Spreadsheet parsing must continue through `scripts/data/workbook-parser.mjs`
- Generated `public/data/**` files remain disposable runtime artifacts and must not be hand-edited

## Planned review payload output

Default output should be under:

```txt
ops/editorial-runtime/
```

Expected files:

```txt
compound-pages.json
learn-articles.json
research-notes.json
compare-rows.json
validation-report.json
manifest.json
```

## Required editorial sheets

The importer should tolerate missing sheets in non-strict mode, but report them clearly:

- Editorial Compound Pages
- Editorial Learn Articles
- Editorial Research Notes
- Editorial Compare Tables
- Canonical Enums
- Runtime Validation Rules
- Runtime Payload Spec

## Validation expectations

The first importer should check:

- missing title
- missing slug
- duplicate slug
- missing research-note limitations
- missing citation or citation-verification marker
- non-canonical evidence tier
- non-canonical safety level
- missing individual-variation language on compound pages

## Non-goals for this batch

Do not promote editorial payloads directly into production route data yet.
Do not mutate workbook sheets.
Do not weaken existing build, TypeScript, lint, or source-of-truth guards.
Do not add a new spreadsheet parser dependency.
