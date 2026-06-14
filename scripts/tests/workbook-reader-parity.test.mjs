import { pathToFileURL } from 'node:url'
import { assertWorkbookExists, resolveWorkbookPath } from '../workbook-source.mjs'
import {
  getSheet,
  getSheetNames,
  readWorkbook,
  sheetToRows,
} from '../data/workbook-parser.mjs'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'

function comparable(value) {
  if (value == null) return ''
  if (value instanceof Date) return value.toISOString()
  return String(value).trim()
}

function compareRows(sheetName, oldRows, newRows) {
  const discrepancies = []
  if (oldRows.length !== newRows.length) {
    discrepancies.push({
      sheetName,
      rowNumber: '(sheet)',
      field: 'row_count',
      oldValue: oldRows.length,
      newValue: newRows.length,
    })
  }

  const sampleCount = Math.min(10, oldRows.length, newRows.length)
  for (let index = 0; index < sampleCount; index += 1) {
    const oldRow = oldRows[index] || {}
    const newRow = newRows[index] || {}
    const fields = new Set([...Object.keys(oldRow), ...Object.keys(newRow)])
    for (const field of fields) {
      const oldValue = comparable(oldRow[field])
      const newValue = comparable(newRow[field])
      if (oldValue !== newValue) {
        discrepancies.push({
          sheetName,
          rowNumber: index + 2,
          field,
          oldValue,
          newValue,
        })
      }
    }
  }

  return discrepancies
}

async function runParity({ log = true } = {}) {
  const repoRoot = process.cwd()
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)

  const oldWorkbook = await readWorkbook(workbookPath)
  const newWorkbook = await readWorkbookExcelJS(workbookPath)
  const oldSheetNames = getSheetNames(oldWorkbook)
  const newSheetNames = new Set(newWorkbook.getSheetNames())
  const allDiscrepancies = []

  const lines = [
    'WORKBOOK READER PARITY REPORT',
    '=============================',
    `Workbook: ${workbookPath}`,
    `Sheets: ${oldSheetNames.length}`,
    '',
  ]

  for (const sheetName of oldSheetNames) {
    if (!newSheetNames.has(sheetName)) {
      allDiscrepancies.push({
        sheetName,
        rowNumber: '(sheet)',
        field: 'missing_sheet',
        oldValue: 'present',
        newValue: 'missing',
      })
      continue
    }

    const oldRows = sheetToRows(getSheet(oldWorkbook, sheetName))
    const newRows = newWorkbook.getSheetData(sheetName)
    const discrepancies = compareRows(sheetName, oldRows, newRows)
    allDiscrepancies.push(...discrepancies)

    lines.push(`${sheetName}: old=${oldRows.length} new=${newRows.length} discrepancies=${discrepancies.length}`)
  }

  lines.push('')
  if (allDiscrepancies.length === 0) {
    lines.push('Parity: 100%')
    lines.push('Ready to migrate downstream scripts.')
    if (log) console.log(lines.join('\n'))
    return { discrepancies: allDiscrepancies, output: lines.join('\n') }
  }

  lines.push(`Parity discrepancies: ${allDiscrepancies.length}`)
  for (const item of allDiscrepancies.slice(0, 200)) {
    lines.push(
      `[${item.sheetName}] row=${item.rowNumber} field=${item.field} old=${JSON.stringify(item.oldValue)} new=${JSON.stringify(item.newValue)}`,
    )
  }
  if (allDiscrepancies.length > 200) {
    lines.push(`... ${allDiscrepancies.length - 200} additional discrepancies omitted`)
  }

  if (log) console.log(lines.join('\n'))
  return { discrepancies: allDiscrepancies, output: lines.join('\n') }
}

if (process.env.VITEST) {
  const { expect, test } = await import('vitest')

  test('exceljs workbook reader matches the parser adapter sample output', async () => {
    const result = await runParity({ log: false })
    expect(result.discrepancies).toEqual([])
  }, 30000)

  test('parser adapter can materialize only requested sheets', async () => {
    const repoRoot = process.cwd()
    const workbookPath = resolveWorkbookPath(repoRoot)
    assertWorkbookExists(workbookPath)

    const workbook = await readWorkbook(workbookPath, {
      sheets: ['Herb Master V3'],
    })

    expect(getSheetNames(workbook)).toContain('Compound Master V3')
    expect(sheetToRows(getSheet(workbook, 'Herb Master V3')).length).toBeGreaterThan(0)
    expect(getSheet(workbook, 'Compound Master V3')).toBeNull()
  }, 30000)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runParity().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
