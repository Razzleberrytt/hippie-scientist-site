import fs from 'node:fs'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { assertPipelineWritePath, exportsDir } from './paths.mjs'

/**
 * Excel export.
 *
 * Output only. The pipeline never reads its own state back from a spreadsheet —
 * the job ledger and the candidate store are the state, and this file is a
 * convenience view for reviewers who work in Excel. Deleting it loses nothing.
 */

const SHEETS = ['Queue', 'Accepted Changes', 'Needs Review', 'Failed', 'Metrics']

function addSheet(workbook, name, columns, rows) {
  const sheet = workbook.addWorksheet(name)
  sheet.columns = columns.map((header) => ({ header, key: header, width: Math.min(48, Math.max(12, header.length + 4)) }))
  sheet.getRow(1).font = { bold: true }
  for (const row of rows) sheet.addRow(row)
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  return sheet
}

function flatten(value) {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.join('; ')
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

export async function exportWorkbook({ jobs, results = [], metrics, label }) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'scripts/enrichment-pipeline'

  addSheet(
    workbook,
    'Queue',
    ['job_id', 'priority', 'score', 'mode', 'entity_type', 'slug', 'requested_fields', 'status', 'risk_band', 'reasons'],
    jobs.map((job) => ({
      job_id: job.job_id,
      priority: job.priority,
      score: job.score,
      mode: job.mode,
      entity_type: job.entity_type,
      slug: job.slug,
      requested_fields: flatten(job.requested_fields),
      status: job.status,
      risk_band: job.risk_band,
      reasons: flatten(job.reasons),
    })),
  )

  const accepted = []
  const review = []
  const failed = []

  for (const result of results) {
    const { candidate, verdict } = result
    for (const decision of verdict.apply_decisions) {
      accepted.push({
        job_id: candidate.job_id,
        candidate_id: candidate.candidate_id,
        slug: candidate.entity.slug,
        field: decision.field,
        proposed_value: decision.proposed_value,
        reason: decision.reason,
      })
    }
    for (const decision of verdict.review_decisions) {
      review.push({
        job_id: candidate.job_id,
        slug: candidate.entity.slug,
        field: decision.field,
        canonical_value: decision.canonical_value ?? '',
        proposed_value: decision.proposed_value ?? '',
        reason: decision.reason,
      })
    }
    for (const finding of verdict.review_findings) {
      review.push({
        job_id: candidate.job_id,
        slug: candidate.entity.slug,
        field: finding.field ?? '',
        canonical_value: '',
        proposed_value: finding.value ?? '',
        reason: `${finding.rule}: ${finding.message}`,
      })
    }
    for (const error of verdict.errors) {
      failed.push({
        job_id: candidate.job_id,
        slug: candidate.entity.slug,
        field: error.field ?? '',
        rule: error.rule,
        message: error.message,
        fix: error.fix ?? '',
      })
    }
  }

  addSheet(
    workbook,
    'Accepted Changes',
    ['job_id', 'candidate_id', 'slug', 'field', 'proposed_value', 'reason'],
    accepted,
  )
  addSheet(
    workbook,
    'Needs Review',
    ['job_id', 'slug', 'field', 'canonical_value', 'proposed_value', 'reason'],
    review,
  )
  addSheet(workbook, 'Failed', ['job_id', 'slug', 'field', 'rule', 'message', 'fix'], failed)

  const metricRows = []
  const walk = (prefix, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [key, child] of Object.entries(value)) walk(prefix ? `${prefix}.${key}` : key, child)
    } else {
      metricRows.push({ metric: prefix, value: flatten(value) })
    }
  }
  walk('', metrics)
  addSheet(workbook, 'Metrics', ['metric', 'value'], metricRows)

  const target = path.join(exportsDir, `${label}.xlsx`)
  assertPipelineWritePath(target)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  await workbook.xlsx.writeFile(target)
  return target
}

export { SHEETS }
