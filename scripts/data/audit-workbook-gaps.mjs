#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertWorkbookExists, resolveWorkbookPath } from '../workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './workbook-parser.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const reportsDir = path.join(repoRoot, 'reports')

const JUNK_VALUES = new Set(['', 'na', 'n/a', 'none', 'null', 'undefined', 'unknown', 'unk', 'tbd', '-', '--'])

const REQUIRED_HERB_FIELDS = ['name', 'slug', 'summary', 'description', 'dosage', 'safetyNotes', 'preparation']
const REQUIRED_COMPOUND_FIELDS = ['compoundName', 'canonicalCompoundId', 'summary', 'safetyNotes']

function cleanText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim()
}

function isJunk(value) {
  const text = cleanText(value).toLowerCase()
  return !text || JUNK_VALUES.has(text)
}

async function run() {
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)

  const workbook = await readWorkbook(workbookPath)
  const gaps = []

  // Audit Herbs Sheet
  const herbSheet = getSheet(workbook, 'Herb Master V3')
  let herbsScanned = 0
  if (herbSheet) {
    const rows = sheetToRows(herbSheet)
    herbsScanned = rows.length
    rows.forEach((row, index) => {
      const rowNumber = index + 2
      const entityName = cleanText(row.name || row.slug || `Row ${rowNumber}`)
      
      REQUIRED_HERB_FIELDS.forEach(field => {
        const val = row[field]
        if (isJunk(val)) {
          gaps.push({
            sheet: 'Herb Master V3',
            rowNumber,
            entityName,
            field,
            type: !cleanText(val) ? 'missing' : 'placeholder',
            value: cleanText(val)
          })
        }
      })
    })
  }

  // Audit Compounds Sheet
  const compoundSheet = getSheet(workbook, 'Compound Master V3')
  let compoundsScanned = 0
  if (compoundSheet) {
    const rows = sheetToRows(compoundSheet)
    compoundsScanned = rows.length
    rows.forEach((row, index) => {
      const rowNumber = index + 2
      const entityName = cleanText(row.compoundName || row.canonicalCompoundId || `Row ${rowNumber}`)
      
      REQUIRED_COMPOUND_FIELDS.forEach(field => {
        const val = row[field]
        if (isJunk(val)) {
          gaps.push({
            sheet: 'Compound Master V3',
            rowNumber,
            entityName,
            field,
            type: !cleanText(val) ? 'missing' : 'placeholder',
            value: cleanText(val)
          })
        }
      })
    })
  }

  const summary = {
    scannedAt: new Date().toISOString(),
    workbookPath: path.relative(repoRoot, workbookPath),
    summary: {
      totalHerbsScanned: herbsScanned,
      totalCompoundsScanned: compoundsScanned,
      totalGapsFound: gaps.length
    },
    gaps
  }

  fs.mkdirSync(reportsDir, { recursive: true })
  
  // Write JSON report
  fs.writeFileSync(
    path.join(reportsDir, 'workbook-gaps-report.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8'
  )

  // Write Markdown report
  const mdReport = [
    '# Workbook Metadata Gap Audit Report',
    '',
    `- **Workbook Audited:** \`${summary.workbookPath}\``,
    `- **Audited At:** ${summary.scannedAt}`,
    `- **Total Herbs Scanned:** ${summary.summary.totalHerbsScanned}`,
    `- **Total Compounds Scanned:** ${summary.summary.totalCompoundsScanned}`,
    `- **Total Gap Warnings Found:** ${summary.summary.totalGapsFound}`,
    '',
    '## Detailed Gap Findings',
    '',
    '| Sheet | Row | Entity Name | Field | Type | Raw Value |',
    '| --- | --- | --- | --- | --- | --- |',
    ...gaps.map(gap => `| ${gap.sheet} | ${gap.rowNumber} | ${gap.entityName} | \`${gap.field}\` | ${gap.type} | ${gap.value ? `\`"${gap.value}"\`` : '*empty*'} |`),
    ''
  ]

  fs.writeFileSync(
    path.join(reportsDir, 'workbook-gaps-report.md'),
    mdReport.join('\n'),
    'utf8'
  )

  console.log(`[audit-workbook-gaps] Scanned ${herbsScanned} herbs and ${compoundsScanned} compounds. Found ${gaps.length} gaps.`)
  console.log('[audit-workbook-gaps] Wrote reports/workbook-gaps-report.json')
  console.log('[audit-workbook-gaps] Wrote reports/workbook-gaps-report.md')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
