#!/usr/bin/env node

import { assertWorkbookExists, resolveWorkbookPath } from './workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './data/workbook-parser.mjs'

// Current workbook schema (see docs/workbook-only-data-contract.md) keeps herbs
// and compounds together on one unified sheet, distinguished by entity_type.
// There is no per-entity-type "safety_level" enum anymore — safety completeness
// is tracked via the free-text contraindications_or_flags column, backed by
// safety_notes. Legacy field names are still checked as a fallback in case a
// future workbook revision reintroduces a dedicated enum column.
//
// Sheet name resolution mirrors scripts/data/build-runtime-from-workbook.mjs's
// candidate-list approach: the unified sheet is sometimes saved under the
// 'Sheet7' alias, and older workbooks may still carry the pre-consolidation
// split herb/compound sheets. Resolving via a single hard-coded name here
// previously caused a silent 0/0 report (see docs/LOOP_NOTES.md) — any sheet
// this script can't find must fail loudly instead of reporting zero rows.
const ENTITY_SHEET_CANDIDATES = ['Entity_Master', 'Sheet7']
const LEGACY_SHEET_CANDIDATES = {
  herbs: ['Herb Master V3', 'Herb Monographs', 'Site Export Herbs'],
  compounds: ['Compound Master V3', 'Site Export Compounds'],
}
const ENTITY_TYPES = {
  herbs: 'herb',
  compounds: 'compound',
}

function resolveSheetName(workbook, candidates) {
  return candidates.find((candidate) => getSheet(workbook, candidate)) || null
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
  return clean(
    row.contraindications_or_flags ||
      row.safety_level ||
      row['safety level'] ||
      row.safety ||
      row.safety_rating ||
      row.safetyRating,
  )
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

function resolveRows(workbook, type) {
  const entitySheetName = resolveSheetName(workbook, ENTITY_SHEET_CANDIDATES)
  if (entitySheetName) {
    const entityRows = sheetToRows(getSheet(workbook, entitySheetName))
    return entityRows.filter((row) => clean(row.entity_type).toLowerCase() === ENTITY_TYPES[type])
  }

  const legacySheetName = resolveSheetName(workbook, LEGACY_SHEET_CANDIDATES[type])
  if (legacySheetName) {
    return sheetToRows(getSheet(workbook, legacySheetName))
  }

  throw new Error(
    `[audit:safety] could not find a ${type} sheet — tried ${[...ENTITY_SHEET_CANDIDATES, ...LEGACY_SHEET_CANDIDATES[type]].join(', ')}`,
  )
}

async function main() {
  const repoRoot = process.cwd()
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)
  const workbook = await readWorkbook(workbookPath)

  const herbRows = resolveRows(workbook, 'herbs')
  const compoundRows = resolveRows(workbook, 'compounds')
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
