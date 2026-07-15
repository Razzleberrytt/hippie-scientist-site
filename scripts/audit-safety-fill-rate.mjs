#!/usr/bin/env node

import { assertWorkbookExists, resolveWorkbookPath } from './workbook-source.mjs'
import { getSheet, readWorkbook, sheetToRows } from './data/workbook-parser.mjs'
import { pathToFileURL } from 'node:url'
import { CLUSTER_MEMBER_RUNTIME_DECISION } from '../config/cluster-member-runtime-trust.mjs'

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

function first(row, keys) {
  for (const key of keys) {
    const value = clean(row[key])
    if (value) return value
  }
  return ''
}

export function safetyContext(row) {
  const runtimePrimary = first(row, ['runtime_safety', 'runtime safety'])
  const sourcePrimary = first(row, ['safety_notes', 'safety notes', 'safety'])
  return {
    primary: first(row, [
      'safety_level',
      'safety level',
      'runtime_safety',
      'runtime safety',
      'safety_notes',
      'safety notes',
      'safety',
      'safety_rating',
      'safetyRating',
    ]),
    flags: first(row, [
      'contraindications_or_flags',
      'contraindications or flags',
      'contraindications',
      'avoid_if',
      'avoid if',
    ]),
    level: first(row, ['safety_level', 'safety level', 'safety_rating', 'safetyRating']),
    runtimePrimary,
    sourcePrimary,
  }
}

export function classifySafety({ primary, flags }) {
  if (!primary && !flags) return 'MISSING'
  if ([primary, flags].some((value) => /^needs[_\s-]?review$/i.test(value))) return 'NEEDS_REVIEW'
  if (!primary) return 'FLAGS_ONLY'
  if (!flags) return 'PRIMARY_ONLY'
  return 'FILLED'
}

export function classifyRuntimeTrust(row) {
  const context = safetyContext(row)
  if (clean(row.runtime_export_decision) !== CLUSTER_MEMBER_RUNTIME_DECISION) return 'NOT_TARGETED'
  if (!context.runtimePrimary) return context.sourcePrimary ? 'SOURCE_ONLY_NOT_RUNTIME' : 'MISSING_RUNTIME'
  if (!/^Safety evidence:/i.test(context.runtimePrimary)) return 'UNLABELLED_RUNTIME'
  if (!context.flags) return 'RUNTIME_WITHOUT_FLAGS'
  return 'RUNTIME_TRUST_COMPLETE'
}

function pct(filled, total) {
  return total > 0 ? `${Math.round((filled / total) * 100)}%` : '0%'
}

export function summarize(rows, type) {
  const records = rows.map((row, index) => {
    const context = safetyContext(row)
    return {
      slug: slugFor(row, type, index),
      type,
      priority: Number(first(row, ['recommendation_weight', 'discovery_weight'])) || 0,
      isPublic: /^public$/i.test(clean(row.public_search_visibility)),
      isIndexable: /^index$/i.test(clean(row.seo_indexing_recommendation)),
      ...context,
      status: classifySafety(context),
      runtimeTrustStatus: classifyRuntimeTrust(row),
    }
  })

  const filled = records.filter((record) => record.status !== 'MISSING' && record.status !== 'NEEDS_REVIEW').length
  const complete = records.filter((record) => record.status === 'FILLED').length
  return { records, filled, complete, total: records.length }
}

function distribution(records, valueForRecord) {
  const counts = new Map()
  for (const record of records) {
    const key = valueForRecord(record)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function linesForReport(herbSummary, compoundSummary) {
  const allRecords = [...herbSummary.records, ...compoundSummary.records]
  const combinedFilled = herbSummary.filled + compoundSummary.filled
  const combinedTotal = herbSummary.total + compoundSummary.total
  const clusterRuntime = allRecords.filter(record => record.runtimeTrustStatus !== 'NOT_TARGETED')
  const clusterRuntimeComplete = clusterRuntime.filter(record => record.runtimeTrustStatus === 'RUNTIME_TRUST_COMPLETE').length
  const clusterRuntimeGaps = clusterRuntime.filter(record => record.runtimeTrustStatus !== 'RUNTIME_TRUST_COMPLETE')
  const gaps = allRecords
    .filter((record) => record.status !== 'FILLED')
    .sort((a, b) =>
      Number(b.isPublic) - Number(a.isPublic) ||
      Number(b.isIndexable) - Number(a.isIndexable) ||
      b.priority - a.priority ||
      a.type.localeCompare(b.type) ||
      a.slug.localeCompare(b.slug),
    )
    .slice(0, 20)

  return [
    'SAFETY FILL RATE REPORT',
    '=======================',
    `Herbs:     ${herbSummary.filled} with safety context / ${herbSummary.total} total (${pct(herbSummary.filled, herbSummary.total)}); ${herbSummary.complete} also include contraindications/flags`,
    `Compounds: ${compoundSummary.filled} with safety context / ${compoundSummary.total} total (${pct(compoundSummary.filled, compoundSummary.total)}); ${compoundSummary.complete} also include contraindications/flags`,
    `Combined:  ${combinedFilled} with safety context / ${combinedTotal} total (${pct(combinedFilled, combinedTotal)})`,
    `Cluster-member runtime trust: ${clusterRuntimeComplete}/${clusterRuntime.length} complete`,
    ...(clusterRuntimeGaps.length
      ? clusterRuntimeGaps.map(record => `Runtime gap: ${record.slug} ${record.runtimeTrustStatus.toLowerCase()}`)
      : ['Cluster-member runtime gaps: None']),
    '',
    'TOP 20 SAFETY COVERAGE GAPS (public/indexable profiles first):',
    ...(gaps.length
      ? gaps.map((record) => `${record.slug} ${record.type} ${record.status.toLowerCase()} priority=${record.priority}`)
      : ['None']),
    '',
    'COVERAGE DISTRIBUTION:',
    ...distribution(allRecords, (record) => record.status.toLowerCase()).map(([value, count]) => `${value}: ${count}`),
    '',
    'SAFETY LEVEL DISTRIBUTION:',
    ...distribution(allRecords, (record) => record.level || '(no safety_level; narrative context audited)').map(
      ([value, count]) => `${value}: ${count}`,
    ),
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

export async function auditSafetyFillRate(repoRoot = process.cwd()) {
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)
  const workbook = await readWorkbook(workbookPath)

  const herbRows = resolveRows(workbook, 'herbs')
  const compoundRows = resolveRows(workbook, 'compounds')
  const herbSummary = summarize(herbRows, 'herb')
  const compoundSummary = summarize(compoundRows, 'compound')
  const report = linesForReport(herbSummary, compoundSummary)

  return { herbSummary, compoundSummary, lines: report }
}

async function main() {
  const report = await auditSafetyFillRate()

  console.log(report.lines.join('\n'))
  const runtimeGaps = [...report.herbSummary.records, ...report.compoundSummary.records]
    .filter(record => !['NOT_TARGETED', 'RUNTIME_TRUST_COMPLETE'].includes(record.runtimeTrustStatus))
  if (process.argv.includes('--strict') && runtimeGaps.length) process.exit(1)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
