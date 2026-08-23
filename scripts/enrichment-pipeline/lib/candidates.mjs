import fs from 'node:fs'
import path from 'node:path'
import { assertPipelineWritePath, candidatesDir, relative } from './paths.mjs'
import { candidateId } from './ids.mjs'

/**
 * Candidate layer.
 *
 * A candidate is a proposed *delta*, never a rewritten entity. It lives under
 * ops/enrichment/candidates and is structurally incapable of reaching canonical
 * data: `writeCandidate` refuses any path outside the pipeline state directory,
 * and the only route onward is the exporter, which produces a reviewable
 * workbook patch that a human must approve.
 */

export const CANDIDATE_OPERATIONS = new Set(['set', 'no-op'])

export function candidatePath(jobId, attempt = 1) {
  return path.join(candidatesDir, `${jobId}.${String(attempt).padStart(2, '0')}.json`)
}

function fail(errors, filePath) {
  throw new Error(`Invalid candidate${filePath ? ` (${relative(filePath)})` : ''}:\n- ${errors.join('\n- ')}`)
}

/**
 * Structural validation. Contract, scientific, and citation rules live in the
 * validators module — this only checks that the document is well formed and,
 * critically, that it stays inside the field scope its job asked for.
 */
export function validateCandidateShape(candidate, { job = null, filePath = null } = {}) {
  const errors = []

  if (candidate?.candidate_version !== 1) errors.push('candidate_version must equal 1')
  if (!String(candidate?.job_id || '').trim()) errors.push('job_id is required')
  if (!String(candidate?.candidate_id || '').trim()) errors.push('candidate_id is required')
  if (!String(candidate?.worker || '').trim()) errors.push('worker is required')
  if (!candidate?.entity?.slug) errors.push('entity.slug is required')
  if (!candidate?.entity?.type) errors.push('entity.type is required')
  if (!candidate?.entity?.sheet) errors.push('entity.sheet is required')
  if (!Array.isArray(candidate?.changes) || candidate.changes.length === 0) {
    errors.push('changes must contain at least one entry (use operation "no-op" to record that nothing was found)')
  }
  if (!Array.isArray(candidate?.sources)) errors.push('sources must be an array')

  const sourceIds = new Set()
  for (const [index, source] of (candidate?.sources || []).entries()) {
    const prefix = `sources[${index}]`
    const id = String(source?.id || '').trim()
    if (!id) errors.push(`${prefix}.id is required`)
    else if (sourceIds.has(id)) errors.push(`${prefix}.id duplicates "${id}"`)
    else sourceIds.add(id)
    if (!String(source?.class || '').trim()) errors.push(`${prefix}.class is required`)
    const hasIdentifier = ['doi', 'pmid', 'pmcid', 'url', 'canonical_ref'].some((key) =>
      String(source?.[key] || '').trim(),
    )
    if (!hasIdentifier) errors.push(`${prefix} needs at least one of doi, pmid, pmcid, url, canonical_ref`)
  }

  const seenFields = new Set()
  for (const [index, change] of (candidate?.changes || []).entries()) {
    const prefix = `changes[${index}]`
    const field = String(change?.field || '').trim()
    if (!field) errors.push(`${prefix}.field is required`)
    if (field && seenFields.has(field)) errors.push(`${prefix}.field "${field}" appears twice`)
    if (field) seenFields.add(field)
    if (!CANDIDATE_OPERATIONS.has(change?.operation)) {
      errors.push(`${prefix}.operation must be one of: ${[...CANDIDATE_OPERATIONS].join(', ')}`)
    }
    if (!Object.prototype.hasOwnProperty.call(change || {}, 'current_value')) {
      errors.push(`${prefix}.current_value is required (the value the worker observed)`)
    }
    if (change?.operation === 'set') {
      if (!String(change?.proposed_value ?? '').trim()) {
        errors.push(`${prefix}.proposed_value is required for operation "set"`)
      }
      if (!String(change?.rationale || '').trim()) errors.push(`${prefix}.rationale is required`)
      if (!Array.isArray(change?.source_ids) || change.source_ids.length === 0) {
        errors.push(`${prefix}.source_ids must reference at least one source`)
      }
      for (const id of change?.source_ids || []) {
        if (!sourceIds.has(id)) errors.push(`${prefix}.source_ids references unknown source "${id}"`)
      }
    }
  }

  if (job) {
    if (candidate?.job_id !== job.job_id) {
      errors.push(`job_id "${candidate?.job_id}" does not match the job it was written for (${job.job_id})`)
    }
    if (candidate?.entity?.slug !== job.slug) {
      errors.push(`entity.slug "${candidate?.entity?.slug}" does not match job slug "${job.slug}"`)
    }
    const requested = new Set(job.requested_fields)
    for (const field of seenFields) {
      if (!requested.has(field)) {
        errors.push(
          `changes touch "${field}" which job ${job.job_id} did not request ` +
            `(requested: ${job.requested_fields.join(', ')}). Workers may only answer the fields they were asked for.`,
        )
      }
    }
  }

  if (errors.length) fail(errors, filePath)
  return true
}

export function buildCandidate({ job, worker, changes, sources = [], provenance = {}, attempt = 1, clock = Date.now }) {
  const candidate = {
    candidate_version: 1,
    candidate_id: candidateId(job.job_id, attempt),
    job_id: job.job_id,
    worker,
    created_at: new Date(clock()).toISOString(),
    entity: { type: job.entity_type, slug: job.slug, sheet: job.sheet },
    requested_fields: [...job.requested_fields],
    changes,
    sources,
    provenance: {
      job_id: job.job_id,
      requested_fields: [...job.requested_fields],
      budget: job.budget,
      sources_examined: provenance.sources_examined ?? sources.length,
      sources_reused: provenance.sources_reused ?? 0,
      sources_new: provenance.sources_new ?? sources.length,
      cache_hits: provenance.cache_hits ?? 0,
      external_research_required: provenance.external_research_required ?? sources.length > 0,
      tool: provenance.tool ?? worker,
      notes: provenance.notes ?? '',
    },
  }
  validateCandidateShape(candidate, { job })
  return candidate
}

export function writeCandidate(candidate, { job = null, attempt = 1 } = {}) {
  validateCandidateShape(candidate, { job })
  const target = candidatePath(candidate.job_id, attempt)
  assertPipelineWritePath(target)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8')
  return target
}

export function readCandidate(filePath) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  validateCandidateShape(parsed, { filePath })
  return parsed
}

export function listCandidates() {
  if (!fs.existsSync(candidatesDir)) return []
  return fs
    .readdirSync(candidatesDir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => path.join(candidatesDir, name))
}

export function latestCandidateForJob(jobId) {
  const matches = listCandidates().filter((filePath) => path.basename(filePath).startsWith(`${jobId}.`))
  return matches.length ? matches[matches.length - 1] : null
}
