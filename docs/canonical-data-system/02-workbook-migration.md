# Workbook Migration (Phase 3)

> Status: **implemented and run**. Canonical data is populated from the workbook;
> the live site is NOT switched to it yet (that is Phase 6).

## Command

```bash
node scripts/data/migrate-workbook.mjs [--file <path.xlsx>] [--dry-run|--write|--promote]
npm run data:migrate-workbook -- --file data-sources/herb_monograph_master.xlsx --dry-run
```

- Default is **dry-run** (reports only, nothing written).
- `--write` stages to `data/staging/canonical/**`.
- `--promote` (implies `--write`) copies staging → `data/canonical/**`.
- `--file` overrides the workbook path (must stay inside `data-sources/` unless
  `ALLOW_EXTERNAL_WORKBOOK_PATH=true`). The original workbook is **never**
  modified — it is only read.

## What it does

| Workbook sheet | → Canonical |
|---|---|
| `Entity_Master` (herb/compound rows) | `entities/herb.jsonl`, `entities/compound.jsonl` |
| `Source_Register` | `sources/sources.jsonl` |
| `Evidence_Register` | `claims/claims.jsonl` + derived `entities/study.jsonl` + inline sources |
| `Evidence_Register.effect_or_condition` | derived `entities/effect.jsonl` |
| `Entity_Relationships` | `relationships/edges.jsonl` |

Every record carries **provenance** (`sheet!rowN`), a **deterministic ID**
(re-running never mints new IDs for unchanged rows — verified byte-identical
across re-runs), and any column without a mapped destination is preserved
verbatim under `legacy` (nothing discarded). Values are normalized for
whitespace, casing, boolean variants, mixed delimiters, empty strings, and
duplicate aliases (`scripts/data/canonical/normalize.mjs`).

## Reports (written every run, even dry-run)

`docs/canonical-data-system/reports/` gets timestamped + `*-latest.json` copies:

- `migration-*.json` — reconciliation counts + **discrepancy explanations**.
- `duplicates-*.json` — exact duplicates, similar names, alias collisions,
  conflicting slugs (no silent merging — reported for human review).
- `missing-data-*.json` — gaps in important fields per entity type.
- `relationships-*.json` — edge counts by type.

## Migration result & reconciliation

| Metric | Workbook | Canonical | Explanation |
|---|---|---|---|
| Herbs | 293 | 293 | 1:1, no filtering at migration time. |
| Compounds | 588 | 588 | 1:1. |
| Evidence rows → claims | 696 | 572 claims | 51 rows have subject slugs absent from `Entity_Master` (listed in `unmatched.claims`); the remaining 645 collapse to 572 distinct claims via deterministic claim-ID dedup (same subject+effect+qualifier asserted by multiple rows). |
| Relationship rows → edges | 2936 | 2819 edges | 117 rows are duplicate `(from, rel_type, to)` triples; 0 unmatched. |
| Source rows → sources | 569 | 479 sources | Duplicate citations (same PMID/DOI/URL) dedupe by source-ID; inline citations found in `Evidence_Register` are added when not already registered. |
| Derived effects | — | 223 | Distinct `effect_or_condition` values. |
| Derived studies | — | 520 | Distinct `Evidence_Register.record_id` values. |

**Totals:** 1624 entities, 572 claims, 2819 edges, 479 sources — all schema-valid
with referential integrity intact (`npm run data:check`). Duplicate candidates
flagged: 25 similar-name, 24 alias-collision, 0 exact, 0 conflicting-slug.

## Files created

- `scripts/data/migrate-workbook.mjs` — CLI (dry-run/write/promote, reports, reconciliation).
- `scripts/data/canonical/workbook-map.mjs` — pure workbook→canonical transform.
- `scripts/data/canonical/normalize.mjs` — value normalizers.
- `scripts/data/canonical/__tests__/workbook-map.test.mjs` — 13 tests.
- `data/canonical/**` — populated JSONL (committed).
- npm script `data:migrate-workbook`.

## Verification

`npm run data:migrate-workbook -- --dry-run` and `--write --promote` both run
clean; re-running produces byte-identical canonical files (idempotent);
`npm run data:check` passes on the migrated data; 504 tests + typecheck pass.
The existing workbook→`public/data` site pipeline and production build are
untouched (they do not read `data/canonical/**`).
