import fs from 'node:fs'
import path from 'node:path'
import {
  assertPipelineWritePath,
  exportsDir,
  workbookPatchesDir,
  relative,
} from './paths.mjs'
import { patchId } from './ids.mjs'
import { sourceIdentity } from './source-identity.mjs'

/**
 * Exporter.
 *
 * The terminal artifact of the pipeline is a *reviewable workbook patch* in
 * data-sources/workbook-patches — the same format the repository already uses,
 * already validated in CI by scripts/ci/validate-workbook-patches.mjs, and
 * already applied by the atomic runner in scripts/data/apply-workbook-patch.mjs.
 *
 * That is deliberate: rather than building a second write path into the
 * workbook, validated candidates are converted into proposals that a human must
 * flip from `proposal` to `approved` before anything can be written. Every
 * production change therefore stays visible in Git review and traceable back to
 * its job and candidate.
 */

const AUTHORITY_CLASSES = new Set(['reference-database-authority', 'regulatory-agency-monograph-guidance'])

function patchSourceFrom(source) {
  const identity = sourceIdentity(source)
  const base = {
    id: source.id,
    title: source.title || source.url || source.id,
    year: source.year ?? null,
  }
  if (identity.kind === 'doi') return { ...base, doi: identity.value }
  if (source.doi) return { ...base, doi: source.doi }
  if (AUTHORITY_CLASSES.has(source.class)) {
    return { ...base, source_type: 'authority-reference', url: source.url }
  }
  return { ...base, doi: '' }
}

/**
 * Build a workbook patch from validated results.
 *
 * Only `apply` decisions become patch changes. Review decisions and rejections
 * are returned separately so the caller can write them to the review export
 * instead of quietly dropping them.
 */
export function buildPatch({ results, batchLabel, contract, status = 'proposal' }) {
  const changes = []
  const sources = new Map()
  const includedJobs = []
  const excluded = []

  for (const result of results) {
    const { candidate, verdict } = result
    if (!verdict.apply_decisions.length) {
      excluded.push({
        job_id: candidate.job_id,
        slug: candidate.entity.slug,
        reason: verdict.status,
        errors: verdict.errors.map((e) => e.message),
        reviews: [
          ...verdict.review_findings.map((f) => f.message),
          ...verdict.review_decisions.map((d) => `${d.field}: ${d.reason}`),
        ],
      })
      continue
    }
    if (verdict.status !== 'validated') {
      excluded.push({
        job_id: candidate.job_id,
        slug: candidate.entity.slug,
        reason: verdict.status,
        errors: verdict.errors.map((e) => e.message),
        reviews: [
          ...verdict.review_findings.map((f) => f.message),
          ...verdict.review_decisions.map((d) => `${d.field}: ${d.reason}`),
        ],
      })
      continue
    }

    includedJobs.push(candidate.job_id)

    for (const decision of verdict.apply_decisions) {
      const change = candidate.changes.find((c) => c.field === decision.field)
      const field = contract.fields.get(decision.field)
      for (const id of change.source_ids) {
        const source = candidate.sources.find((s) => s.id === id)
        if (source && !sources.has(id)) sources.set(id, patchSourceFrom(source))
      }
      changes.push({
        slug: candidate.entity.slug,
        column: decision.field,
        expected_old_value: change.current_value,
        new_value: decision.proposed_value,
        confidence: change.confidence,
        source_ids: [...change.source_ids],
        rationale: `${change.rationale} [enrichment-pipeline job ${candidate.job_id}, candidate ${candidate.candidate_id}]`,
        ...(field?.requires_human_review ? { requires_human_review: true } : {}),
      })
    }
  }

  changes.sort((a, b) => a.slug.localeCompare(b.slug) || a.column.localeCompare(b.column))

  const patch = {
    patch_version: 1,
    id: patchId(batchLabel, includedJobs),
    status,
    generated_by: 'scripts/enrichment-pipeline',
    job_ids: [...includedJobs].sort(),
    sources: [...sources.values()].sort((a, b) => a.id.localeCompare(b.id)),
    changes,
  }

  return { patch, excluded, includedJobs }
}

export function writePatch(patch, { directory = workbookPatchesDir } = {}) {
  const target = path.join(directory, `${patch.id}.json`)
  assertPipelineWritePath(target, { allowPatchDir: true })
  fs.mkdirSync(path.dirname(target), { recursive: true })
  if (fs.existsSync(target)) {
    const existing = JSON.parse(fs.readFileSync(target, 'utf8'))
    if (existing.status !== 'proposal') {
      throw new Error(
        `Refusing to overwrite ${relative(target)}: its status is "${existing.status}", not "proposal".`,
      )
    }
  }
  fs.writeFileSync(target, `${JSON.stringify(patch, null, 2)}\n`, 'utf8')
  return target
}

/** Everything that did not make it into the patch, written where a human can read it. */
export function writeReviewExport({ batchLabel, excluded, results }) {
  const target = path.join(exportsDir, `${batchLabel}-review.json`)
  assertPipelineWritePath(target)
  fs.mkdirSync(path.dirname(target), { recursive: true })

  const payload = {
    export_version: 1,
    batch: batchLabel,
    needs_review: excluded,
    summary: {
      total_candidates: results.length,
      validated: results.filter((r) => r.verdict.status === 'validated').length,
      needs_review: results.filter((r) => r.verdict.status === 'needs_review').length,
      rejected: results.filter((r) => r.verdict.status === 'rejected').length,
      no_op: results.filter((r) => r.verdict.status === 'no_op').length,
    },
  }
  fs.writeFileSync(target, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  return target
}
