# Phase 0 — repository discovery and baseline (G0)

Recorded 2026-08-23 against `d7de88fb5`. Read-only: no production file was
modified while this baseline was taken.

---

## 1. Canonical source of truth

`data-sources/herb_monograph_master.xlsx` — 2,259,046 bytes, 22 sheets.
Everything under `public/data/**` is generated from it and is disposable.

| Sheet | Rows | Cols | Role |
|-------|------|------|------|
| `Entity_Master` | 881 | 52 | **Canonical entity records.** herb=293, compound=588 |
| `Evidence_Register` | 696 | 21 | Per-entity study rows |
| `Source_Register` | 569 | 15 | Bibliographic sources |
| `Entity_Relationships` | 2,936 | 13 | Herb→compound and related edges |
| `Maintenance_Queue` | 5,242 | 16 | Open editorial backlog, P0/P1/P2 |
| `Taxonomy_Rules` | 1,216 | 11 | Alias and taxonomy rules |
| `Content_Workflow` | 1,511 | 14 | Editorial workflow |
| `Gap_Fill_Log` | 36,128 | 6 | Historical gap-fill audit trail |
| `Entity_Runtime_Overlay` | 562 | 8 | Runtime field overlay |
| `Unresolved_Gaps` | 29 | 7 | **Field-level** blank counts (not per-entity) |
| Others | — | — | Dashboards, import reports, slug aliases, flags |

Entity content hash at baseline: `b4c542aee4a0b04d`.

The workbook cannot be opened by ExcelJS directly — it uses namespace-prefixed
OOXML. `scripts/utils/read-workbook-exceljs.mjs` normalizes 14 XML parts into a
temporary copy first. This is expected and is reported as a warning, not a
failure.

## 2. Write path

There is exactly one safe programmatic write path into the workbook:

- `scripts/data/edit-entity-master-cell.mjs` — surgical single-cell editor.
  Slug-keyed, Entity_Master-only, byte-stable (proven by `npm run workbook:roundtrip-test`).
- `scripts/data/apply-workbook-patch.mjs` — reviewable patch runner on top of it.
  Validation-only by default; `--apply` requires `--out` or `--in-place`;
  in-place writes are atomic (copy to temp, rename).
- `scripts/ci/validate-workbook-patches.mjs` — CI-validates every patch file in
  `data-sources/workbook-patches/` against the current workbook.

The runner already enforces: stale-patch rejection, a governance-protected
column list, a human-review column list, DOI-backed sources, no duplicate edits,
and no writes while a patch is still `proposal`.

**Consequence:** no safe write path exists for `Evidence_Register`,
`Source_Register`, or `Entity_Relationships`. Additive rows for those sheets go
through `data-sources/runtime-enrichment/` (a deterministic gzip ledger applied
through the parser, structurally incapable of replacing canonical values).

## 3. Baseline gap measurement

Entity_Master fill rates for enrichable columns (881 rows):

| Column | Filled | Gap | Classification |
|--------|--------|-----|----------------|
| `latin_name` | 186 (21%) | **107 herbs** | automatic |
| `secondary_effects` | 8 (1%) | 873 | automatic (human review) |
| `canonical_pathways` | 762 (86%) | 119 | automatic |
| `canonical_ecosystem` | 865 (98%) | 16 | automatic |
| `topic_ecosystems` | 865 (98%) | 16 | automatic |
| `description` | 19 (2%) | 862 | automatic (human review) |
| `keywords` | 8 (1%) | 873 | automatic |
| `contraindications_or_flags` | 599 (68%) | 285 | manual-review |
| `runtime_safety` | 115 (13%) | 766 | manual-review |
| `tags` | 24 (3%) | 857 | manual-review |
| `summary` | 881 (100%) | 1 | manual-review |
| `primary_effects_or_targets` | 877 (100%) | 6 | manual-review |
| `dosage_or_preferred_form` | 881 (100%) | 2 | manual-review |

`latin_name` applies to herbs only (293 entities), so its gap is 107, not 695.

The first pipeline scan reproduces these numbers exactly: 881 entities scanned,
4,768 jobs (2,850 automatic, 1,918 manual-review), 11,367 populated cells left
alone.

## 4. Data-quality findings

1. **`evidence_grade` has 32 distinct raw values** across 881 rows —
   `c` (483), `b` (131), `moderate` (76), `a` (34), `insufficient` (31),
   `high` (25), `B` (5), `C+` (4), … A normalization pass is needed before this
   field could ever be written automatically. It stays manual-review.
2. **`confidence_tier` has 18 distinct values**, including free text such as
   `moderate_for_sleep_support_not_insomnia_treatment`.
3. **`publish_status` has 14 values, some malformed** — e.g.
   `publishable_needs_final_human_review | publishable`.
4. **Some compounds are typed `herb`** — `quercetin`, `resveratrol`,
   `phosphatidylserine`. They will be queued for `latin_name`; the correct
   answer is a no-op.
5. **`Unresolved_Gaps` is a field-level summary, not a per-entity flag.** Its
   rows record how many blanks remain for a field across a whole sheet. Treating
   them as per-entity verdicts re-queues every populated cell — the scanner uses
   open `Maintenance_Queue` rows instead, which are genuinely per-entity.
6. **`Maintenance_Queue` is a usable priority signal**: 4,590 open rows,
   P0=8 / P1=1,834 / P2=3,390, keyed by `entity_slug` and `issue_area`.
   Cross-referenced against Entity_Master, no open row currently disputes a
   *populated* automatic field, so no populated cell is queued today.

## 5. Baseline health

| Check | Result |
|-------|--------|
| `npm run test` | **490 files, 2,249 tests, all passing** |
| `node scripts/ci/validate-workbook-source.mjs` | PASS |
| `node scripts/ci/validate-workbook-schema.mjs` | PASS (1 warning: `summary_quality` column absent — pre-existing, informational) |
| `node scripts/ci/validate-workbook-patches.mjs` | PASS — 14 patch records |
| Duplicate slugs in Entity_Master | 0 |
| `public/data/herbs.json` | 291 |
| `public/data/compounds.json` | 565 |

**Pre-existing issues (not regressions):**

- `scripts/data/audit-workbook-gaps.mjs` targets sheets `Herb Master V3` and
  `Compound Master V3`, which no longer exist in the workbook. It degrades
  silently to zero gaps. It is superseded by the new scanner.
- `validate-workbook-schema` warns that `summary_quality` is referenced by the
  indexability policy but absent from Entity_Master.
- Per `docs`/repo history: the committed `public/data` is parser output; a full
  `data:build` applies a governance overlay that changes indexable counts. Do not
  commit a wholesale regeneration.

## 6. Existing tooling reused

| Need | Existing asset |
|------|----------------|
| Workbook read | `scripts/utils/read-workbook-exceljs.mjs` |
| Atomic cell write | `scripts/data/edit-entity-master-cell.mjs` |
| Reviewable patch + atomic apply | `scripts/data/apply-workbook-patch.mjs` |
| Patch CI validation | `scripts/ci/validate-workbook-patches.mjs` |
| Schema contract guard | `scripts/ci/validate-workbook-schema.mjs` |
| "Is this cell missing?" | `lib/data-quality.mjs` (`isMissingLike`) |
| Source-class vocabulary | `schemas/source-class-governance.json` |
| Additive evidence/source rows | `data-sources/runtime-enrichment/` |
| Bibliographic backfill | `npm run citations:fetch-pubmed`, `citations:apply-pubmed` |
| Evidence-grade normalization | `scripts/data/normalize-evidence-grades.ts` |

Nothing in the new pipeline duplicates a write path, a validator, or a
normalization pass that already exists.

## 7. Risk register

| Risk | Mitigation |
|------|------------|
| An automated write reaches a governance or publishing column | 22 columns marked `prohibited` in the contract; the loader pins their policy to `never`; `apply-workbook-patch.mjs` independently refuses them |
| A safety or dosage value is written without review | 12 columns marked `manual-review`; the runner independently requires `--approve-human-review` |
| Mechanistic evidence becomes a clinical claim | `secondary_effects` excludes preclinical source classes; the scientific validator blocks clinical language without a human source and requires preclinical-only support to be labelled |
| A populated cell is silently replaced | Default overwrite policy is `never`; `only-if-empty` routes any populated cell to review; `expected_old_value` makes a drifted cell a hard conflict |
| A worker rewrites a whole entity | The brief carries only the requested fields; a candidate touching any other field is rejected |
| A candidate reaches canonical data directly | `assertPipelineWritePath` restricts writes to `ops/enrichment/` (plus the reviewed patch directory for exports) |
| An import runs before approval | `assertProductionImportAllowed` fails closed with no readiness record, and checks command, fields, jobs, and batch size |
| A duplicate import creates duplicate values | The importer classifies an already-applied patch as a no-op and never invokes the runner |
| Losing pipeline state | `ops/enrichment/` is git-ignored and fully rebuildable; job ids are deterministic |

## 8. Checks required before a production import

```bash
npm run enrich:doctor                     # contract vs. workbook
npm run enrich:test                       # pipeline test suite
node scripts/enrichment-pipeline/cli.mjs import --patch <patch>   # dry run
npm run validate:workbook-patches
npm run typecheck && npm run lint
npm run test
# after import
npm run data:build:core
npm run guard:source-of-truth
npm run data:validate
npm run validate:evidence-language
```
