# Workbook reconciliation run (2026-04-12)

Workbook used: `data-sources/herb_monograph_master.xlsx`

## Commands run

1. `node scripts/sync-updated-datasets.mjs` (pre-fix baseline capture)
2. `node scripts/sync-updated-datasets.mjs` (post-fix rerun)
3. `npm run verify:workbook-import`

## Coverage and identity-map contribution

### Pre-fix (identity map contribution inactive)

- Herb match coverage: **121 / 172 (70.35%)**
- Compound match coverage: **130 / 630 (20.63%)**
- Matched via identity map: **herbs 0**, **compounds 0**
- Unmatched herbs: **49**
- Unmatched compounds: **500**

### Post-fix (identity map contribution active)

- Herb match coverage: **130 / 172 (75.58%)**
- Compound match coverage: **132 / 630 (20.95%)**
- Matched via identity map: **herbs 9**, **compounds 2**
- Unmatched herbs: **42**
- Unmatched compounds: **498**

## Improvement from identity-map fix

- Herb match count improvement: **+9** (**+7.44%** vs pre-fix matched count)
- Compound match count improvement: **+2** (**+1.54%** vs pre-fix matched count)
- Herb unmatched reduction: **-7** (**14.29% fewer unmatched herbs**)
- Compound unmatched reduction: **-2** (**0.40% fewer unmatched compounds**)

## Fully aligned?

**Not fully aligned yet.**

Identity mapping is now contributing directly, but workbook-to-site alignment is still incomplete:

- Remaining unmatched herbs: **42** (`reports/workbook-unmatched-herbs.json`)
- Remaining unmatched compounds: **498** (`reports/workbook-unmatched-compounds.json`)

The system is improved and identity-map-assisted, but not fully aligned end-to-end.
