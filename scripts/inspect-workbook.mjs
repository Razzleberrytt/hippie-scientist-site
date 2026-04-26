import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { assertWorkbookExists, getRepoRoot, resolveWorkbookPath } from './workbook-source.mjs'

const require = createRequire(import.meta.url)

function detectExcelLibrary(rootDir) {
  const packageJsonPath = path.resolve(rootDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const combinedDeps = {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  }

  const ordered = ['xlsx', 'exceljs', 'read-excel-file']
  return ordered.find((name) => Object.prototype.hasOwnProperty.call(combinedDeps, name))
}

async function getWorkbookSummary(workbookPath, libraryName) {
  if (libraryName === 'xlsx') {
    const XLSX = require('xlsx')
    const workbook = XLSX.readFile(workbookPath)
    return workbook.SheetNames.map((sheetName) => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        blankrows: false,
        defval: '',
      })
      const headers = Array.isArray(rows[0]) ? rows[0] : []
      const rowCount = Math.max(rows.length - 1, 0)
      return { sheetName, headers, rowCount }
    })
  }

  if (libraryName === 'exceljs') {
    const ExcelJS = require('exceljs')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(workbookPath)
    return workbook.worksheets.map((worksheet) => {
      const headerRow = worksheet.getRow(1)
      const headers = (headerRow.values || [])
        .slice(1)
        .map((value) => (value == null ? '' : String(value)))
      const rowCount = Math.max(worksheet.actualRowCount - 1, 0)
      return { sheetName: worksheet.name, headers, rowCount }
    })
  }

  if (libraryName === 'read-excel-file') {
    const { default: readXlsxFile, readSheetNames } = await import('read-excel-file/node')
    const sheetNames = await readSheetNames(workbookPath)

    const summaries = []
    for (const sheetName of sheetNames) {
      const rows = await readXlsxFile(workbookPath, { sheet: sheetName })
      const headers = Array.isArray(rows[0]) ? rows[0].map((value) => (value == null ? '' : String(value))) : []
      const rowCount = Math.max(rows.length - 1, 0)
      summaries.push({ sheetName, headers, rowCount })
    }
    return summaries
  }

  throw new Error(`Unsupported library: ${libraryName}`)
}

async function main() {
  const rootDir = getRepoRoot()
  const workbookPath = resolveWorkbookPath(rootDir)
  assertWorkbookExists(workbookPath)

  const libraryName = detectExcelLibrary(rootDir)
  if (!libraryName) {
    console.error('Error: No xlsx library found. Install xlsx, exceljs, or read-excel-file.')
    process.exit(1)
  }

  console.log(`[inspect-workbook] Using library: ${libraryName}`)
  const summary = await getWorkbookSummary(workbookPath, libraryName)

  console.log('Sheet names:')
  for (const sheet of summary) {
    const headerText = sheet.headers.length ? sheet.headers.join(' | ') : '(none)'
    console.log(`- ${sheet.sheetName}`)
    console.log(`  Headers: ${headerText}`)
    console.log(`  Row count (excluding header): ${sheet.rowCount}`)
  }
}

try {
  await main()
  process.exit(0)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Error: ${message}`)
  process.exit(1)
}
