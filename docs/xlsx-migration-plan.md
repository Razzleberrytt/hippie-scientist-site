# xlsx Migration Plan

## Status

- [x] Parser adapter boundary implemented
- [ ] exceljs introduced
- [ ] Secondary scripts migrated to the adapter
- [ ] xlsx removed from dependencies
- [ ] Full parity validation completed after parser replacement

## Scope

This is a staged migration plan for isolating and eventually replacing `xlsx`.

The current security concern is that `xlsx` is a direct dependency and `npm audit` reports high-severity vulnerabilities. The workbook exporter is production-critical, so the dependency must not be replaced blindly.

## Current adapter boundary

A workbook parser adapter now exists at:

- `scripts/data/workbook-parser.mjs`

The production exporter:

- `scripts/data/build-runtime-from-workbook.mjs`

no longer imports `xlsx` directly.

All direct parser access for the production exporter is now routed through:

- `readWorkbook(filePath)`
- `getSheetNames(workbook)`
- `getSheet(workbook, sheetName)`
- `sheetToRows(sheet)`

This adapter boundary exists specifically so a later `exceljs` migration can replace parser internals without rewriting normalization, semantic governance, or runtime export logic.

Current semantic guarantees preserved by the adapter:

- blank cells become `''`
- row object keys match `xlsx` `sheet_to_json` behavior
- workbook shape still supports `Sheets` + `SheetNames`
- downstream normalization and deterministic JSON ordering remain unchanged

## Current xlsx usage inventory

Repository text searches found `xlsx` usage in these code locations:

### Critical runtime-data build path

- `scripts/data/workbook-parser.mjs`
  - now owns all direct `xlsx` workbook access for the production exporter

### Secondary workbook inspection/import/report scripts

These still access `xlsx` directly and should migrate later to the shared adapter:

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

### Current parser APIs used through the adapter

The exporter now relies on the adapter surface instead of importing `xlsx` directly:

- `readWorkbook(workbookPath)`
- `getSheetNames(workbook)`
- `getSheet(workbook, sheetName)`
- `sheetToRows(sheet)`

The adapter currently preserves the underlying `xlsx` semantics:

- `XLSX.readFile(workbookPath)`
- `XLSX.utils.sheet_to_json(sheet, { defval: '' })`
- workbook `Sheets`
- workbook `SheetNames`

A future migration should preserve those semantics unless a separate schema/runtime migration is approved.

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
- `resolveVersionedSheet(wb, names)`
- `read(wb, names, versioned = false)`

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
- Migration can now be isolated primarily to `scripts/data/workbook-parser.mjs`.

## Remaining migration strategy

### Phase 2: Replace parser internals with exceljs

Target file:

- `scripts/data/workbook-parser.mjs`

Goal:

- preserve the adapter API
- replace only the internal parser implementation
- avoid changing downstream exporter logic

Important semantics to preserve:

- first row treated as headers
- row objects use existing header strings
- blank cells become `''`
- empty trailing rows do not generate bogus records
- deterministic row ordering
- stable object-key behavior

### Phase 3: Migrate secondary scripts

After the critical build path has parity, migrate remaining direct `xlsx` imports to the shared adapter:

- `scripts/build-runtime-data.mjs`
- `scripts/import-xlsx-monographs.mjs`
- `scripts/export-workbook-to-json.mjs`
- `scripts/generate-monograph-projection.mjs`
- `scripts/inspect-citation-import.mjs`
- `scripts/inspect-workbook.mjs`
- `scripts/verify-workbook-import-reconciliation.mjs`
- `scripts/data/report-migration-parity.mjs`
- `scripts/data/report-workbook-parser-coverage.mjs`

### Phase 4: Remove dependency

Only after all code imports are migrated and validation passes:

1. Remove `xlsx` from `package.json`.
2. Regenerate `package-lock.json` with `npm install`.
3. Run `npm ci` from a clean checkout.
4. Run the full parity validation suite.

## Validation checklist

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

Generate baseline output with the current adapter-backed implementation:

```bash
rm -rf /tmp/hippie-xlsx-baseline /tmp/hippie-exceljs-candidate
npm run data:build -- --out /tmp/hippie-xlsx-baseline
```

Generate candidate output after the exceljs migration:

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
- Keep implementation PRs narrowly focused on parser parity.
