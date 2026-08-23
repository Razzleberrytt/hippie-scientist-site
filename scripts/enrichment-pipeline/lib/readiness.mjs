import fs from 'node:fs'
import { readinessPath, relative } from './paths.mjs'

/**
 * Production-enrichment readiness gate (G13/G14).
 *
 * Every command that could change canonical production data calls
 * `assertProductionImportAllowed` first. With no readiness record on disk the
 * answer is no — the gate fails closed, so an operator cannot reach a
 * production import by forgetting a flag or by running a command out of order.
 *
 * The record is written by a human, not by the pipeline. `writeReadiness` exists
 * for tests and for `cli.mjs readiness --init`, which produces an unapproved
 * template that a reviewer must fill in and approve.
 */

export const REQUIRED_READINESS_FIELDS = [
  'approved_by',
  'approved_at',
  'gate',
  'pilot_scope',
  'allowed_fields',
  'allowed_commands',
  'conflict_reviewer',
  'rollback_procedure',
]

export function readinessTemplate() {
  return {
    readiness_version: 1,
    gate: 'G13',
    approved: false,
    approved_by: '',
    approved_at: '',
    pilot_scope: {
      description: '',
      max_jobs: 10,
      job_ids: [],
    },
    allowed_fields: [],
    allowed_commands: ['scan', 'queue', 'status', 'validate', 'export', 'import --dry-run'],
    waived_requirements: [],
    conflict_reviewer: '',
    rollback_procedure:
      'git checkout -- data-sources/herb_monograph_master.xlsx (the workbook is versioned; an in-place patch is a single tracked file change), then npm run data:build:core && npm run guard:source-of-truth.',
    notes: '',
  }
}

export function readReadiness() {
  if (!fs.existsSync(readinessPath)) return null
  try {
    return JSON.parse(fs.readFileSync(readinessPath, 'utf8'))
  } catch (error) {
    throw new Error(`Cannot parse readiness record ${relative(readinessPath)}: ${error.message}`)
  }
}

export function readinessStatus(record = readReadiness()) {
  if (!record) {
    return {
      approved: false,
      gate: null,
      missing: ['readiness record does not exist'],
    }
  }
  const missing = []
  if (record.readiness_version !== 1) missing.push('readiness_version must equal 1')
  if (record.approved !== true) missing.push('approved must be exactly true')
  for (const field of REQUIRED_READINESS_FIELDS) {
    const value = record[field]
    const empty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)
    if (empty) missing.push(`${field} is required`)
  }
  if (record.pilot_scope && !String(record.pilot_scope.description || '').trim()) {
    missing.push('pilot_scope.description is required')
  }
  return { approved: missing.length === 0, gate: record.gate ?? null, missing, record }
}

/**
 * Fail-closed guard. Throws unless an approved readiness record authorises this
 * exact command and every field the patch would touch.
 */
export function assertProductionImportAllowed({ command, fields = [], jobIds = [] } = {}) {
  const status = readinessStatus()
  if (!status.approved) {
    throw new Error(
      'Production import is blocked: no approved readiness record.\n' +
        `  expected: ${relative(readinessPath)}\n` +
        (status.missing.length ? `  missing:  ${status.missing.join('; ')}\n` : '') +
        '  Create a template with: node scripts/enrichment-pipeline/cli.mjs readiness --init\n' +
        '  A human must review the gate checklist in docs/enrichment-pipeline.md and set approved: true.',
    )
  }

  const record = status.record
  if (command && !record.allowed_commands.includes(command)) {
    throw new Error(
      `Production import is blocked: command "${command}" is not in allowed_commands ` +
        `(${record.allowed_commands.join(', ')}).`,
    )
  }

  const allowed = new Set(record.allowed_fields)
  const disallowed = [...new Set(fields)].filter((field) => !allowed.has(field))
  if (disallowed.length) {
    throw new Error(
      `Production import is blocked: field(s) outside the approved scope: ${disallowed.join(', ')}.\n` +
        `  approved fields: ${record.allowed_fields.join(', ')}`,
    )
  }

  const scopedJobs = record.pilot_scope?.job_ids || []
  if (scopedJobs.length) {
    const outOfScope = jobIds.filter((id) => !scopedJobs.includes(id))
    if (outOfScope.length) {
      throw new Error(
        `Production import is blocked: job(s) outside the approved pilot scope: ${outOfScope.join(', ')}.`,
      )
    }
  }
  const maxJobs = record.pilot_scope?.max_jobs
  if (Number.isInteger(maxJobs) && jobIds.length > maxJobs) {
    throw new Error(
      `Production import is blocked: ${jobIds.length} jobs exceeds the approved pilot maximum of ${maxJobs}.`,
    )
  }

  return record
}

export function writeReadiness(record) {
  fs.mkdirSync(relativeDir(readinessPath), { recursive: true })
  fs.writeFileSync(readinessPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
  return readinessPath
}

function relativeDir(filePath) {
  return filePath.slice(0, Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\')))
}
