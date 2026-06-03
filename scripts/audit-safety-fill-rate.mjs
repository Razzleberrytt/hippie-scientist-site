#!/usr/bin/env node

import { assertWorkbookExists, resolveWorkbookPath } from './workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './data/workbook-parser.mjs'

const SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
}

function clean(value) {
  return String(value ?? '').trim()
}

function slugFor(row, fallbackPrefix, index) {
  return (
    clean(row.slug) ||
    clean(row.canonical_slug) ||
    clean(row.canonicalCompoundId) ||
    clean(row.compoundName) ||
    clean(row.name) ||
    `${fallbackPrefix}-${index + 1}`
  )
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function safetyValue(row) {
  return clean(row.safety_level || row['safety level'] || row.safety || row.safety_rating || row.safetyRating)
}

function classifySafety(value) {
  if (!value) return 'MISSING'
  if (/^needs[_\s-]?review$/i.test(value)) return 'NEEDS_REVIEW'
  return 'FILLED'
}

function pct(filled, total) {
  return total > 0 ? `${Math.round((filled / total) * 100)}%` : '0%'
}

function summarize(rows, type) {
  const records = rows.map((row, index) => {
    const value = safetyValue(row)
    return {
      slug: slugFor(row, type, index),
      type,
      priority: 0.9,
      value,
      status: classifySafety(value),
    }
  })

  const filled = records.filter((record) => record.status === 'FILLED').length
  return { records, filled, total: records.length }
}

function distribution(records) {
  const counts = new Map()
  for (const record of records) {
    const key = record.value || '(empty)'
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function linesForReport(herbSummary, compoundSummary) {
  const allRecords = [...herbSummary.records, ...compoundSummary.records]
  const combinedFilled = herbSummary.filled + compoundSummary.filled
  const combinedTotal = herbSummary.total + compoundSummary.total
  const missing = allRecords
    .filter((record) => record.status !== 'FILLED')
    .sort((a, b) => b.priority - a.priority || a.type.localeCompare(b.type) || a.slug.localeCompare(b.slug))
    .slice(0, 20)

  return [
    'SAFETY FILL RATE REPORT',
    '=======================',
    `Herbs:     ${herbSummary.filled} filled / ${herbSummary.total} total (${pct(herbSummary.filled, herbSummary.total)})`,
    `Compounds: ${compoundSummary.filled} filled / ${compoundSummary.total} total (${pct(compoundSummary.filled, compoundSummary.total)})`,
    `Combined:  ${combinedFilled} filled / ${combinedTotal} total (${pct(combinedFilled, combinedTotal)})`,
    '',
    'TOP 20 MISSING (by estimated traffic - sitemap priority proxy):',
    ...missing.map((record) => `${record.slug} ${record.type} ${record.priority}`),
    '',
    'ENUM VALUE DISTRIBUTION:',
    ...distribution(allRecords).map(([value, count]) => `${value}: ${count}`),
  ]
}

async function main() {
  const repoRoot = process.cwd()
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)
  const workbook = await readWorkbook(workbookPath)

  const herbRows = sheetToRows(getSheet(workbook, SHEETS.herbs))
  const compoundRows = sheetToRows(getSheet(workbook, SHEETS.compounds))
  const report = linesForReport(
    summarize(herbRows, 'herb'),
    summarize(compoundRows, 'compound'),
  )

  console.log(report.join('\n'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
