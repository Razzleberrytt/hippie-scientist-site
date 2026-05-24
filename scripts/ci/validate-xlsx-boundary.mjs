import { execSync } from 'node:child_process'
const allowed = new Set([
  'scripts/data/workbook-parser.mjs',
  'scripts/data/report-migration-parity.mjs',
  'scripts/generate-monograph-projection.mjs',
  'scripts/inspect-citation-import.mjs',
  'scripts/export-workbook-to-json.mjs',
  'scripts/inspect-workbook.mjs',
  'scripts/build-runtime-data.mjs',
  'scripts/generate-a-tier-index.mjs',
  'scripts/data/apply-a-tier-patch.mjs',
  'scripts/data/report-workbook-parser-coverage.mjs',
  'scripts/verify-workbook-import-reconciliation.mjs',
  'scripts/import-xlsx-monographs.mjs'
])
const out = execSync("rg -l \"from ['\\\"]xlsx['\\\"]|require\\(['\\\"]xlsx['\\\"]\\)\" scripts", {encoding:'utf8'}).trim()
const files = out?out.split('\n').filter(Boolean):[]
const bad=files.filter(f=>!allowed.has(f))
if(bad.length){console.error('xlsx import boundary violation:\n'+bad.join('\n'));process.exit(1)}
console.log('validate-xlsx-boundary: OK')
