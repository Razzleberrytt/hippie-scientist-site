# xlsx Migration Plan

## Scope

This is a documentation-only migration plan. Do not change workbook parsing code, `package.json`, or `package-lock.json` until a dedicated implementation PR.

The current security concern is that `xlsx` is a direct dependency and `npm audit` reports high-severity vulnerabilities. The workbook exporter is production-critical, so the dependency must not be replaced blindly.

## Current xlsx usage inventory

Repository text searches found `xlsx` usage in these code locations:

### Critical runtime-data build path

- `scripts/data/build-runtime-from-workbook.mjs`
  - imports `XLSX` from `xlsx`
  - reads the source workbook
  - generates the static runtime payloads consumed by the Next.js app

### Secondary workbook inspection/import/report scripts

- `scripts/build-runtime-data.mjs`
- `scripts/import-xlsx-monographs.mjs`
- `scripts/export-workbook-to-json.mjs`
- `scripts/generate-monograph-projection.mjs`
- `scripts/inspect-citation-import.mjs`
- `scripts/inspect-workbook.mjs`
- `scripts/verify-workbook-import-reconciliation.mjs`
- `scripts/data/report-migration-parity.mjs`
- `scripts/data/report-workbook-parser-coverage.mjs`

### Documentation / dependency metadata references

- `README.md`
- `AGENTS.md`
- `docs/cloudflare-pages.md`
- `docs/citation-import-plan.md`
- `docs/workbook-import-audit.md`
- `docs/generated-data-policy.md`
- `docs/build-and-verification.md`
- `docs/source-of-truth-inventory.md`
- `docs/workbook-only-data-contract.md`
- `docs/workbook-reconciliation-run-2026-04-12.md`
- `docs/workbook-identity-map-cleanup-2026-04-12.md`
- `docs/contractor-onboarding.md`
- `package.json`
- `package-lock.json`

## Critical script behavior: `scripts/data/build-runtime-from-workbook.mjs`

### xlsx APIs currently used

The critical build script uses a small subset of the `xlsx` API:

- `XLSX.readFile(workbookPath)`
- `XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' })`
- workbook object properties:
  - `wb.Sheets`
  - `wb.SheetNames`

A replacement parser must reproduce those behaviors closely enough that downstream normalization receives the same row objects.

### Workbook source

The workbook path is resolved through:

- `scripts/workbook-source.mjs`
- `resolveWorkbookPath(repoRoot)`

The script requires the workbook file to exist before reading.

### Required sheets

The script hard-fails if these sheets are missing:

- `Herb Master V3`
- `Compound Master V3`

### Sheet aliases read by the exporter

#### Herb sheets

The exporter reads the first available sheet from:

- `Herb Master V3`
- `Herb Monographs`
- `Site Export Herbs`

#### Compound sheets

The exporter reads the first available sheet from:

- `Compound Master V3`
- `Site Export Compounds`

#### Herb-compound map

- `Herb Compound Map V3`

#### Claims / study registry

- `Study Registry`

#### Graph / semantic sheets

The exporter reads versioned graph sheets where supported. If multiple sheets match a base name plus ` vN`, the highest version wins.

- `Topic Ecosystems`
- `Pathway Ecosystems`
- `Authority Supernodes`
- `Relationship Edges`
- `Comparison Candidates`
- `Stack Synergy`
- `Sparse Recovery`
- `KG Nodes`

### Sheet resolution helpers

These functions depend on workbook shape, not directly on cell APIs:

- `resolveSheet(wb, names)`
  - checks `wb.Sheets[n]`
  - returns the first matching configured sheet name

- `resolveVersionedSheet(wb, names)`
  - uses `wb.SheetNames`
  - supports exact case-insensitive matches
  - supports versioned names like `Topic Ecosystems v2`
  - sorts by descending version number, then name

- `read(wb, names, versioned = false)`
  - resolves the sheet name
  - logs loaded/skipped sheets
  - converts a sheet to row objects with blank cells preserved as empty strings

### Expected column access pattern

The exporter does not require one exact header set. It uses tolerant field aliases through `first(row, fields)` and normalized-key matching.

Important helpers:

- `clean(value)`
- `lower(value)`
- `slug(value)`
- `splitList(value)`
- `uniqueList(value)`
- `bool(value)`
- `num(value)`
- `normKey(value)`
- `first(row, fields)`
- `firstList(row, fields)`
- `compact(value)`
- `stripEmpty(value)`
- `stripRecord(record)`
- `pick(record, fields)`

Because `first()` checks both exact header names and normalized header names, header text, blank-cell behavior, and object-key generation from the parser must remain stable.

### Major expected fields

#### Shared profile fields

Used for both herbs and compounds:

- `name`
- `slug`
- `id`
- `title`
- `common_name`
- `common name`
- `summary`
- `short_description`
- `description`
- `core_insight`
- `card_blurb`
- `summary_quality`
- `summary quality`
- `primary_effects`
- `primary effects`
- `effects`
- `evidence_grade`
- `evidence grade`
- `evidence_tier`
- `evidence tier`
- `evidence_level`
- `evidence_summary`
- `evidence summary`
- `human_evidence`
- `human evidence`
- `profile_status`
- `profile status`
- `runtime_export_decision`
- `runtime export decision`
- `mechanisms`
- `mechanism`
- `mechanism_targets`
- `mechanism targets`
- `pathways`
- `pathway`
- `pathways_v2`
- `related_compounds`
- `related compounds`
- `related_herbs`
- `related herbs`
- `safety`
- `safety_notes`
- `safety notes`
- `contraindications`
- `avoid_if`
- `avoid if`
- `interactions`
- `side_effects`
- `side effects`
- `dosage`
- `typical_dosage`
- `typical dosage`
- `forms`
- `available_forms`
- `available forms`
- `conditions`
- `best_for`
- `best for`
- `tags`
- `keywords`
- `affiliate_ready`
- `affiliate ready`
- `affiliate_query`
- `affiliate query`
- `default_product_type`
- `default product type`
- `buying_criteria`
- `buying criteria`
- `amazon_affiliate_url`
- `amazon affiliate url`
- `iherb_affiliate_url`
- `iherb affiliate url`
- `meta_title`
- `meta title`
- `meta_description`
- `meta description`

#### Semantic fields

- `topic_clusters`
- `topic clusters`
- `ecosystem_tags`
- `ecosystem tags`
- `topic ecosystems`
- `topic_ecosystems`
- `pathway_companions`
- `pathway companions`
- `comparison_candidates`
- `comparison candidates`
- `synergy_relationships`
- `synergy relationships`
- `stack candidates`
- `authority_supernode`
- `authority supernode`
- `supernode`
- `semantic_neighbors`
- `semantic neighbors`
- `related profiles`
- `ecosystem_anchors`
- `ecosystem anchors`
- `anchors`
- `related_topics`
- `related topics`
- `conditions`
- `pathway_ecosystems`
- `pathway ecosystems`
- `mechanism_ecosystems`
- `mechanism ecosystems`
- `authority_score`
- `authority score`
- `evidence_authority_status`
- `evidence authority status`
- `authority_status`
- `authority status`
- `clusters`
- `cluster`
- `semantic_ready`
- `semantic ready`

#### Herb-only semantic fields

- `herb_internal_link_cluster`
- `internal_link_cluster`
- `internal link cluster`

#### Compound-only semantic fields

- `compound_cluster`
- `compound cluster`
- `comparison_group`
- `comparison group`
- `comparison_priority`
- `comparison priority`
- `internal_link_cluster`
- `internal link cluster`
- `pathway_bucket`
- `pathway bucket`
- `pathways_v2`
- `pathway_weight`
- `pathway weight`

#### Herb-compound map fields

- `herb`
- `herb name`
- `herb_name`
- `compound`
- `compound name`
- `compound_name`
- `herb_slug`
- `herb slug`
- `compound_slug`
- `compound slug`
- `relationship`
- `relationship_type`
- `role`
- `notes`
- `summary`
- `rationale`

#### Claim / study registry fields

- `id`
- `claim_id`
- `claim id`
- `title`
- `study title`
- `claim`
- `summary`
- `pmid`
- `PMID`
- `finding`
- `conclusion`
- `doi`
- `DOI`
- `source_url`
- `url`
- `link`
- `evidence_tier`
- `study_type`
- `profile_slug`
- `slug`
- `herb_slug`
- `compound_slug`

#### Graph row fields

- `source`
- `source slug`
- `from`
- `profile a`
- `anchor`
- `profile`
- `target`
- `target slug`
- `to`
- `profile b`
- `companion`
- `candidate`
- `name`
- `title`
- `topic`
- `pathway`
- `supernode`
- `label`
- `id`
- `slug`
- `type`
- `relationship`
- `relationship type`
- `weight`
- `score`
- `strength`
- `graph score`
- `semantic summary`
- `authority summary`
- `ecosystem summary`
- `retrieval summary`
- `reason`
- `why`
- `evidence context`
- `evidence_context`
- `evidence framing`
- `profiles`
- `members`
- `herbs`
- `related herbs`
- `top herbs`
- `compounds`
- `related compounds`
- `top compounds`
- `topic themes`
- `topic overlap`
- `pathway themes`
- `pathway overlap`
- `mechanism themes`
- `mechanism overlap`
- `recommendations`
- `candidates`
- `related`
- `relationship targets`

### Output files produced

The critical exporter writes these files under the output directory, defaulting to `public/data`:

- `herbs.json`
- `compounds.json`
- `claims.json`
- `herb-compound-map.json`
- `herb-index.json`
- `compound-index.json`
- `topics.json`
- `pathways.json`
- `supernodes.json`
- `relationships.json`
- `comparison-candidates.json`
- `stack-synergy.json`
- `sparse-recovery.json`
- `knowledge-graph.json`
- `agent-patches.json`
- `herb-detail/:slug.json`
- `compound-detail/:slug.json`
- `build-report.json`

## Risks of keeping xlsx

- `npm audit` reports high-severity vulnerabilities for the dependency.
- The package is used in build/import scripts that may process workbook files.
- If untrusted workbook files are ever parsed, parser vulnerabilities become more serious.
- Keeping a known vulnerable parser creates recurring audit noise and can block CI/security gates.
- The dependency is part of the source-of-truth data pipeline, so a failed or compromised parser affects all generated runtime JSON.

## Recommended replacement path

Preferred migration target: `exceljs`.

Reasons:

- Actively maintained for workbook parsing workflows.
- Good support for `.xlsx` files, worksheets, row iteration, and cell values.
- Migration can be isolated behind a small parser adapter instead of rewriting business logic.

## Implementation strategy

### Phase 1: Add parser adapter without changing outputs

Create a small adapter file, for example:

- `scripts/data/workbook-parser.mjs`

Target API:

```js
export async function readWorkbook(filePath) {
  // returns { Sheets, SheetNames } compatible enough for existing script OR a cleaner internal shape
}

export function sheetToJson(workbook, sheetName) {
  // returns array of row objects with blank cells as ''
}
```

Recommended safer API:

```js
export async function loadWorkbookRows(filePath) {
  return {
    sheetNames: string[],
    getRows(sheetName): Record<string, unknown>[],
    hasSheet(sheetName): boolean,
  }
}
```

Then update only these functions in `scripts/data/build-runtime-from-workbook.mjs`:

- import section
- `resolveSheet`
- `resolveVersionedSheet`
- `read`
- `main` workbook loading and required-sheet checks

Do not touch normalization functions unless parity testing proves parser value shapes require it.

### Phase 2: Preserve `sheet_to_json` semantics

The migration must reproduce the important `xlsx` behavior currently provided by:

```js
XLSX.utils.sheet_to_json(sheet, { defval: '' })
```

Important details to preserve:

- first row is treated as headers
- row objects use header text as object keys
- blank/missing cells become `''`, not `undefined`
- empty trailing rows should not create bogus records
- header whitespace should be preserved enough for existing `first()` normalization to work
- numeric cells should remain usable by `Number(clean(v))`
- date cells should not unexpectedly become JS `Date` objects unless normalized back to stable strings

With `exceljs`, implement row conversion by:

1. Reading worksheet row 1 as headers.
2. Trimming only where safe; avoid changing header identity more than current `xlsx` output does.
3. Iterating rows 2..lastRow.
4. For each header column, setting `rowObject[header] = normalizedCellValue || ''`.
5. Skipping rows where all values are blank.

### Phase 3: Migrate secondary scripts

After the critical build path has parity, migrate secondary scripts that import or require `xlsx`:

- `scripts/build-runtime-data.mjs`
- `scripts/import-xlsx-monographs.mjs`
- `scripts/export-workbook-to-json.mjs`
- `scripts/generate-monograph-projection.mjs`
- `scripts/inspect-citation-import.mjs`
- `scripts/inspect-workbook.mjs`
- `scripts/verify-workbook-import-reconciliation.mjs`
- `scripts/data/report-migration-parity.mjs`
- `scripts/data/report-workbook-parser-coverage.mjs`

Prefer reusing the same parser adapter so workbook behavior stays centralized.

### Phase 4: Remove dependency

Only after all code imports are migrated and validation passes:

1. Remove `xlsx` from `package.json`.
2. Regenerate `package-lock.json` with `npm install`.
3. Run `npm ci` from a clean checkout.
4. Run the full validation checklist below.

## Validation checklist

Run this before and after the parser migration and compare generated outputs.

### Clean baseline

```bash
git status --short
npm ci
npm run data:build
npm run data:validate
npm run guard:source-of-truth
npm run verify:build
```

### Parser parity output diff

Generate baseline output with current `xlsx` implementation:

```bash
rm -rf /tmp/hippie-xlsx-baseline /tmp/hippie-exceljs-candidate
npm run data:build -- --out /tmp/hippie-xlsx-baseline
```

Generate candidate output after the parser adapter migration:

```bash
npm run data:build -- --out /tmp/hippie-exceljs-candidate
```

Compare output:

```bash
diff -ru /tmp/hippie-xlsx-baseline /tmp/hippie-exceljs-candidate
```

Expected result:

- no semantic diff in runtime payloads
- acceptable differences only if documented and proven harmless, such as `build-report.json.generatedAt`

### Required payload checks

Confirm these files are present and non-empty:

```bash
test -s /tmp/hippie-exceljs-candidate/herbs.json
test -s /tmp/hippie-exceljs-candidate/compounds.json
test -s /tmp/hippie-exceljs-candidate/herb-index.json
test -s /tmp/hippie-exceljs-candidate/compound-index.json
test -s /tmp/hippie-exceljs-candidate/knowledge-graph.json
test -s /tmp/hippie-exceljs-candidate/build-report.json
```

### Count parity

Compare counts from both `build-report.json` files:

```bash
node - <<'NODE'
const fs = require('fs')
const a = JSON.parse(fs.readFileSync('/tmp/hippie-xlsx-baseline/build-report.json', 'utf8')).counts
const b = JSON.parse(fs.readFileSync('/tmp/hippie-exceljs-candidate/build-report.json', 'utf8')).counts
console.log({ baseline: a, candidate: b })
if (JSON.stringify(a) !== JSON.stringify(b)) process.exit(1)
NODE
```

### Route/build validation

```bash
npm run build
npx tsc --noEmit --pretty false
npm run lint
npm audit
```

`npm audit` should no longer report the `xlsx` vulnerability after dependency removal.

## Contractor notes

- Do not restore removed duplicate datasets to satisfy parser migration.
- Do not change workbook field semantics during parser migration.
- Do not change generated runtime schemas unless a separate schema migration is approved.
- Treat `scripts/data/build-runtime-from-workbook.mjs` as the canonical exporter until a broader data pipeline refactor is approved.
- Keep the first implementation PR focused on parser parity, not workbook schema cleanup.
