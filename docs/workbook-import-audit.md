# Workbook Import Audit (`herb_monograph_master.xlsx`)

## Scope

This audit reviews and upgrades `scripts/import-xlsx-monographs.mjs` so that `data-sources/herb_monograph_master.xlsx` is a reliable import source without rebuilding workbook structure or renaming the workbook file.

## Baseline behavior (before fixes)

Importer run before reconciliation:

- Herbs: **12 / 17 matched**, **0 patched**
- Compounds: **127 / 531 matched**, **0 patched**

## Why matching was failing

### 1) Lookup was too strict

The importer only matched:

- herb `row.slug` to site `herb.slug`
- herb `row.name` to site `herb.name`
- compound `row.canonicalCompoundId` to site `compound.id`
- compound `row.compoundName` to site `compound.name`

It did not attempt normalization variants (apostrophe stripping, punctuation harmonization, hyphen/space alternatives, parenthetical variants).

### 2) No explicit alias handling

Workbook/site mismatches like these were not resolvable with strict lookup:

- `omega-3 fatty acids` (workbook) vs `omega-3-fatty-acids` (site ID)
- `vitamin d` (workbook) vs `vitamin-d` (site ID)

### 3) Patch policy was overly conservative

Patch logic mostly updated only when existing site values were considered “weak” by hard minimum thresholds.

That blocked many valid workbook upgrades where site content existed but workbook content was materially stronger (longer/more detailed mechanism/safety text, richer arrays, richer source metadata).

## What was fixed

### Reconciliation layer

Added deterministic reconciliation with:

- Unicode + punctuation normalization
- apostrophe normalization
- hyphen/space/slash variants
- compact alphanumeric key variants
- parenthetical stripping variants

### Explicit alias maps

Added explicit alias maps for known workbook/site ID/name mismatches:

- `HERB_EXPLICIT_ALIASES`
- `COMPOUND_EXPLICIT_ALIASES`

### Stronger patch decision model

Added value-strength heuristics and patch conditions that allow patching when workbook values are **meaningfully stronger**, not just when current values are empty/weak.

### Clear outcome categories

Importer now logs three categories per entity type:

- `matched-and-patched`
- `matched-no-change`
- `unmatched`

### Unmatched reports

Importer now writes workbook unmatched rows to:

- `reports/workbook-unmatched-herbs.json`
- `reports/workbook-unmatched-compounds.json`

### Dry-run mode

Added `--dry-run` option so importer can run reconciliation, patch evaluation, and report generation without writing `public/data/*.json`.

### Verification script

Added `scripts/verify-workbook-import-reconciliation.mjs` (also exposed as `npm run verify:workbook-import`) to verify:

- reconciled coverage does not regress herbs
- reconciled coverage improves compounds over strict baseline
- unmatched report counts align with importer output

## Current match coverage (after fixes)

Using updated importer:

- Herbs: **12 / 17 matched** (same coverage; 5 workbook herbs still do not exist in current site dataset)
- Compounds: **129 / 531 matched** (improved from 127)

Patch outcomes in current dataset:

- Herbs: **11 matched-and-patched**, **1 matched-no-change**, **5 unmatched**
- Compounds: **60 matched-and-patched**, **69 matched-no-change**, **402 unmatched**

## Notes

- Most unmatched workbook compounds are currently absent from `public/data/compounds.json`; reconciliation cannot match entities that do not exist in site data.
- The importer preserves workbook structure and filename (`herb_monograph_master.xlsx`) as required.
