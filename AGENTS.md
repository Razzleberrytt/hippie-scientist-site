# AGENTS.md

## Project
TheHippieScientist.net

This repository contains the production data pipeline for the herb and compound database used by the site.

## Primary Goal
Safely grow the production database without corrupting existing rows or weakening data quality.

## Canonical Production Workbook
`hs_production_db.xlsx`

## Canonical Sheets
1. `Herb Master Clean`
2. `Compound Master Clean`
3. `Herb Compound Map Clean`

## Canonical Sheet Contracts

### Herb Master Clean
Columns:
- `name`
- `slug`
- `summary`
- `description`
- `primaryActions`
- `mechanisms`
- `safetyNotes`
- `contraindications`
- `interactions`
- `dosage`
- `preparation`
- `traditionalUses`
- `evidenceLevel`
- `region`
- `review_status`
- `source_status`

Primary key:
- `slug`

### Compound Master Clean
Columns:
- `name`
- `slug`
- `summary`
- `description`
- `compoundClass`
- `mechanisms`
- `targets`
- `foundIn`
- `safetyNotes`
- `evidenceLevel`
- `review_status`
- `source_status`

Primary key:
- `slug`

### Herb Compound Map Clean
Columns:
- `herb_name`
- `herb_slug`
- `compound_name`
- `compound_slug`
- `confidence`
- `source_status`
- `notes`

Unique key:
- `(herb_slug, compound_slug)`

## Merge Policy

### General
- Never invent scientific content, citations, DOI, PMID, PMCID, URLs, study designs, or safety claims.
- Never overwrite strong existing non-empty production values with weaker, empty, or lower-confidence data.
- Prefer filling blanks over rewriting populated fields.
- Preserve existing structure and column order exactly.
- Slugs must remain lowercase-hyphenated.
- Lists must use `comma + space` delimiters only.
- Reject malformed values such as:
  - `nan`
  - `[object Object]`
  - empty delimiter strings
  - corrupted or obviously malformed characters

### Herb Row Merge
Match by `slug`.

If row exists:
- fill missing blank fields only
- only replace a populated field if the new value is clearly more complete and still conservative
- do not casually rewrite:
  - `summary`
  - `description`
  - `safetyNotes`

If row does not exist:
- insert a new row using canonical column order

### Compound Row Merge
Match by `slug`.

If row exists:
- fill missing blank fields only
- do not downgrade quality or remove existing information

If row does not exist:
- insert a new row using canonical column order

### Map Row Merge
Match by `(herb_slug, compound_slug)`.

If row exists:
- keep the higher confidence value using this order:
  - `high` > `medium` > `low`
- update `source_status` only if improved
- append to `notes` only if useful and non-duplicative

If row does not exist:
- insert the new row

## Validation Rules

Reject any incoming herb or compound row if:
- `name` is missing
- `slug` is missing
- `slug` is malformed
- required schema columns are missing
- row contains obvious junk placeholders

Reject any map row if:
- `herb_slug` is missing
- `compound_slug` is missing
- either slug is malformed

Flag but do not necessarily reject if:
- `review_status` is `needs_source`
- `source_status` is `weak`
- descriptions are sparse but non-junk

## Production Safety Rules
- Production is the source of truth.
- Production should stay boring, stable, and import-safe.
- Do not use production sheets for scratch notes, research batches, workflow queues, or experiments.
- Do not rename canonical sheets.
- Do not reorder canonical columns unless explicitly instructed.

## Intake Path
Validated batches should arrive in:
`ops/inbox/`

Processed batches should be moved to:
`ops/archive/`

## Expected Batch Format
Preferred formats:
- JSON
- CSV
- XLSX

Preferred JSON structure:
- `herbs`
- `compounds`
- `map_rows`

## Recommended Codex Task Behavior
When asked to merge a validated batch:
1. Read latest file from `ops/inbox/`
2. Validate schema and required keys
3. Merge into `hs_production_db.xlsx`
4. Save workbook
5. Optionally regenerate downstream JSON artifacts if repository scripts exist
6. Run validation/build checks if available
7. Summarize changes clearly
8. Prefer opening a PR or branch-based change over directly modifying `main`

## Forbidden Behavior
- Do not fabricate evidence
- Do not perform speculative enrichment during merge
- Do not silently delete rows
- Do not rewrite the workbook structure during a normal merge
