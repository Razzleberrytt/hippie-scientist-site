import fs from 'node:fs'
import path from 'node:path'
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
    // The parser adapter no longer reproduces the raw workbook exactly: it
    // applies the reviewed additive enrichment ledger, which appends rows to
    // three registers. That divergence is the feature, so the parity guarantee
    // is narrowed rather than dropped -- the only permitted difference is a row
    // count on those three sheets, by exactly the post-dedupe totals the
    // manifest declares. Anything else, including a changed field on a sampled
    // row, still fails.
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'data-sources', 'runtime-enrichment', '2026-08-23-manifest.json'),
        'utf8',
      ),
    )
    const expectedGrowth = new Map([
      ['Evidence_Register', manifest.counts.evidence_rows_after_canonical_dedupe],
      ['Source_Register', manifest.counts.source_rows_after_canonical_dedupe],
      ['Entity_Relationships', manifest.counts.live_relationship_rows_new_after_dedupe],
    ])

    const result = await runParity({ log: false })

    // `oldValue` is the parser adapter (enriched); `newValue` is the raw reader.
    const unexplained = result.discrepancies.filter((item) => {
      if (item.field !== 'row_count') return false
      const growth = expectedGrowth.get(item.sheetName)
      return growth === undefined || item.oldValue - item.newValue !== growth
    })
    const nonRowCount = result.discrepancies.filter((item) => item.field !== 'row_count')

    expect(nonRowCount).toEqual([])
    expect(unexplained).toEqual([])
    // Every declared register must actually have grown, so a silently skipped
    // enrichment cannot pass as parity.
    expect(
      result.discrepancies.filter((item) => item.field === 'row_count').map((item) => item.sheetName).sort(),
    ).toEqual([...expectedGrowth.keys()].sort())
  }, 30000)

  test('parser adapter can materialize only requested sheets', async () => {
    const repoRoot = process.cwd()
    const workbookPath = resolveWorkbookPath(repoRoot)
    assertWorkbookExists(workbookPath)

    const workbook = await readWorkbook(workbookPath, {
      sheets: ['Entity_Master'],
    })

    expect(getSheetNames(workbook)).toContain('Source_Register')
    expect(sheetToRows(getSheet(workbook, 'Entity_Master')).length).toBeGreaterThan(0)
    expect(getSheet(workbook, 'Source_Register')).toBeNull()
  }, 30000)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runParity().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
