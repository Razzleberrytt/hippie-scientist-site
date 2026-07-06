#!/usr/bin/env node
/**
 * RETIRED. This script targeted the removed `Herb Master V3` / `Compound Master
 * V3` sheets and relied on ExcelJS's full read/write path, which crashes on this
 * workbook's table definitions.
 *
 * The supported, safe, surgical replacement is
 * `scripts/data/edit-entity-master-cell.mjs` (run it via `npm run workbook:edit`).
 * It edits `Entity_Master` cells by slug + column name through zip/XML surgery
 * without touching unrelated workbook structure, and is proven byte-stable by
 * `npm run workbook:roundtrip-test`. See docs/workbook-pipeline.md §7.
 */
console.error(
  '\n[edit-workbook] This tool is RETIRED. Use the surgical Entity_Master editor instead:\n' +
    '  npm run workbook:edit -- --slug <slug> --column <column> --value "<value>" --dry-run\n' +
    '  (scripts/data/edit-entity-master-cell.mjs)\n' +
    'Verify the write path with: npm run workbook:roundtrip-test\n' +
    'Docs: docs/workbook-pipeline.md §7.\n',
)
process.exit(1)
