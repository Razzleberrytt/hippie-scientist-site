# Batch 1 — Editorial Runtime Importer Implementation Checklist

## Status

Branch: `batch/editorial-runtime-importer`

The repo already has:

- `scripts/workbook-source.mjs`
- `scripts/data/workbook-parser.mjs`
- `scripts/data/build-runtime-from-workbook.mjs`
- `scripts/data/validate-data-next.mjs`
- workbook-only source-of-truth guards

Do not bypass those systems.

## Implement next

Create:

```txt
scripts/data/validate-editorial-workbook.mjs
```

Requirements:

- ESM Node script
- shebang exactly: `#!/usr/bin/env node`
- import workbook through `readWorkbook`, `getSheet`, `getSheetNames`, `sheetToRows` from `scripts/data/workbook-parser.mjs`
- resolve workbook through `resolveWorkbookPath(repoRoot)` from `scripts/workbook-source.mjs`
- call `assertWorkbookExists`
- no new dependencies
- no writes to `public/data`

## Required sheets

Fail on missing:

- Editorial Compound Pages
- Editorial Learn Articles
- Editorial Research Notes
- Editorial Compare Tables

Warn on missing:

- Canonical Enums
- Runtime Validation Rules
- Runtime Payload Spec
- Runtime QA Gates
- Publisher Workflow

## Compound validation

For `Editorial Compound Pages`:

- title/name required
- slug required or derived from title/name
- duplicate slug is an error
- warn if page text does not mention individual variation
- warn if evidence tier does not match canonical values when present
- warn if safety level does not match canonical values when present

Canonical evidence tiers:

```txt
Strong
Moderate
Limited
Theoretical
Unknown
```

Canonical safety levels:

```txt
Safe
Review
Caution
Avoid
Unknown
```

## Research note validation

For `Editorial Research Notes`:

- title required
- limitations should exist
- citation or needs-verification marker should exist

## CLI behavior

Support:

```bash
node scripts/data/validate-editorial-workbook.mjs
node scripts/data/validate-editorial-workbook.mjs --strict
```

Normal mode:

- fail only on errors
- warn on review issues

Strict mode:

- fail on errors and warnings

## package.json script

Add:

```json
"validate:editorial-workbook": "node scripts/data/validate-editorial-workbook.mjs"
```

Do not alter existing build scripts yet.

## Verification

Run:

```bash
npm run validate:editorial-workbook
npm run validate:workbook-source
```

If available, also run:

```bash
npm run lint
npm run typecheck
```

## PR acceptance criteria

- no runtime generated data edited
- no workbook edited
- no dependency changes
- no weakening existing checks
- validator reads only through existing workbook parser boundary
- validator resolves workbook only through existing workbook-source boundary
