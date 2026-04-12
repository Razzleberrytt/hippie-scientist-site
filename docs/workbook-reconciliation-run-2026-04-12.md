# Workbook reconciliation run (2026-04-12)

Workbook used: `data-sources/herb_monograph_master.xlsx`

## Commands run

1. `node scripts/sync-updated-datasets.mjs`
2. `npm run verify:workbook-import`

## Before vs after counts

- Herb dataset count: **812 → 812**
- Compound dataset count: **407 → 407**
- Unmatched herbs: **155 → 49**
- Unmatched compounds: **100 → 500**

## Import reconciliation output

- Rows read: herbs **172**, compounds **630**
- Updated (matched-and-patched): herbs **120**, compounds **130**, total **250**
- New records created: herbs **0**, compounds **0**
- Matched-no-change: herbs **3**, compounds **0**

## Improvement vs previous run

- Herbs unmatched improvement vs previous run: **+106 (68.39%)**
- Compounds unmatched improvement vs previous run: **-400 (-400.00%)**

## Coverage verification

- Baseline exact-match coverage: herbs **68/172**, compounds **0/630**
- Reconciled dry-run coverage: herbs **121/172**, compounds **130/630**

## Identity reconciliation result

Coverage increased for both herbs and compounds versus strict exact-match baseline, but only existing site entities were patched; no new herb or compound records were created in this run.
