import fs from 'node:fs'
import path from 'node:path'

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

const regex = /from ['"]xlsx['"]|require\(['"]xlsx['"]\)/

function getFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = entries.flatMap((entry) => {
    const res = path.join(dir, entry.name)
    return entry.isDirectory() ? getFiles(res) : res
  })
  return files
}

const allFiles = getFiles('scripts')
const xlsxFiles = []

for (const file of allFiles) {
  if (/\.(js|ts|mjs|tsx|jsx)$/.test(file)) {
    const content = fs.readFileSync(file, 'utf8')
    if (regex.test(content)) {
      const normalizedPath = path.normalize(file).replace(/\\/g, '/')
      xlsxFiles.push(normalizedPath)
    }
  }
}

const bad = xlsxFiles.filter(f => !allowed.has(f))
if (bad.length) {
  console.error('xlsx import boundary violation:\n' + bad.join('\n'))
  process.exit(1)
}
console.log('validate-xlsx-boundary: OK')

