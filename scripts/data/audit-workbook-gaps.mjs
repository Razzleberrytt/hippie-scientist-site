#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertWorkbookExists, resolveWorkbookPath } from '../workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './workbook-parser.mjs'
import { isMissingLike, normalizeStructuredText } from '../../lib/data-quality.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const reportsDir = path.join(repoRoot, 'reports')

const REQUIRED_HERB_FIELDS = ['name', 'slug', 'summary', 'description', 'dosage', 'safetyNotes', 'preparation']
const REQUIRED_COMPOUND_FIELDS = ['name', 'slug', 'summary', 'safetyNotes']

function collectSheetGaps(sheet, requiredFields) {
  if (!sheet) return { scanned: 0, gaps: [] }
  const rows = sheetToRows(sheet)
  const gaps = []

  rows.forEach((row, index) => {
    const rowNumber = index + 2
    const entityName = normalizeStructuredText(row.name || row.slug || `Row ${rowNumber}`)
    for (const field of requiredFields) {
      const value = row[field]
      if (!isMissingLike(value)) continue
      gaps.push({
        rowNumber,
        entityName,
        field,
        type: normalizeStructuredText(value) ? 'placeholder' : 'missing',
        value: normalizeStructuredText(value),
      })
    }
  })

  return { scanned: rows.length, gaps }
}

async function run() {
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)

  let workbook
  try {
    workbook = await readWorkbook(workbookPath, { sheets: ['Herb Master V3', 'Compound Master V3'] })
  } catch (err) {
    console.warn('[workbook-gaps] WARNING: Could not parse workbook:', err.message)
    console.warn('[workbook-gaps] Skipping workbook gap audit — resolve xlsx parse error to re-enable.')
    process.exit(0)
  }

  const herb = collectSheetGaps(getSheet(workbook, 'Herb Master V3'), REQUIRED_HERB_FIELDS)
  const compound = collectSheetGaps(getSheet(workbook, 'Compound Master V3'), REQUIRED_COMPOUND_FIELDS)
  const gaps = [
    ...herb.gaps.map((gap) => ({ sheet: 'Herb Master V3', ...gap })),
    ...compound.gaps.map((gap) => ({ sheet: 'Compound Master V3', ...gap })),
  ]

  const summary = {
    scannedAt: new Date().toISOString(),
    workbookPath: path.relative(repoRoot, workbookPath),
    summary: {
      totalHerbsScanned: herb.scanned,
      totalCompoundsScanned: compound.scanned,
      totalGapsFound: gaps.length,
    },
    gaps,
  }

  fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(path.join(reportsDir, 'workbook-gaps-report.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')

  const mdReport = [
    '# Workbook Metadata Gap Audit Report',
    '',
    `- **Workbook Audited:** \`${summary.workbookPath}\``,
    `- **Audited At:** ${summary.scannedAt}`,
    `- **Total Herbs Scanned:** ${herb.scanned}`,
    `- **Total Compounds Scanned:** ${compound.scanned}`,
    `- **Total Gap Warnings Found:** ${gaps.length}`,
    '',
    '## Detailed Gap Findings',
    '',
    '| Sheet | Row | Entity Name | Field | Type | Raw Value |',
    '| --- | --- | --- | --- | --- | --- |',
    ...gaps.map((gap) => `| ${gap.sheet} | ${gap.rowNumber} | ${gap.entityName} | \`${gap.field}\` | ${gap.type} | ${gap.value ? `\`"${gap.value}"\`` : '*empty*'} |`),
    '',
  ]
  fs.writeFileSync(path.join(reportsDir, 'workbook-gaps-report.md'), mdReport.join('\n'), 'utf8')

  console.log(`[audit-workbook-gaps] Scanned ${herb.scanned} herbs and ${compound.scanned} compounds. Found ${gaps.length} gaps.`)
  console.log('[audit-workbook-gaps] Wrote reports/workbook-gaps-report.{json,md}')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
