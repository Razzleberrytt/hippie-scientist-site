import { shardOf } from './ids.mjs'
import { getEntity } from './canonical.mjs'
import { forEntity } from './research-index.mjs'
import { normalizeText } from './normalize.mjs'

/**
 * Worker inputs and work assignment.
 *
 * A brief tells a worker exactly which fields to answer and nothing else. It
 * carries the entity's identifying context, the current value of each requested
 * field, the contract requirements those answers must satisfy, the sources the
 * site already holds for that entity, and the research budget. It deliberately
 * does NOT carry the rest of the entity row: whole-entity re-research is what
 * produced duplicated effort and drifting rewrites, so the brief makes it
 * impossible to answer a question that was not asked.
 */

/** Context a worker needs to identify the entity, but may not propose changes to. */
const CONTEXT_FIELDS = [
  'name',
  'entity_type',
  'latin_name',
  'class_or_domain',
  'primary_effects_or_targets',
  'summary',
]

export function buildWorkerBrief({ job, canonical, contract, researchIndex = null }) {
  const entity = getEntity(canonical, job.slug)
  if (!entity) throw new Error(`Cannot build a brief: slug "${job.slug}" is not in ${canonical.entitySheet}`)

  const requested = job.requested_fields.map((name) => {
    const field = contract.fields.get(name)
    return {
      field: name,
      current_value: normalizeText(entity.row[name]),
      gap_reason: job.reasons?.[name] ?? 'missing',
      overwrite_policy: field.overwrite_policy,
      requires_human_review: field.requires_human_review === true,
      min_sources: field.min_sources,
      accepted_source_classes: field.accepted_source_classes,
      min_evidence_level: field.min_evidence_level,
      max_length: field.max_length,
      normalizer: field.normalizer,
      allowed_values: field.allowed_values ?? null,
      controlled_vocabulary_source: field.controlled_vocabulary_source ?? null,
      guidance: field.rationale,
    }
  })

  const existingSources = researchIndex
    ? forEntity(researchIndex, job.slug).map((record) => ({
        key: record.key,
        doi: record.doi,
        pmid: record.pmid,
        url: record.url,
        title: record.title,
        year: record.year,
        journal: record.journal,
        study_type: record.study_type,
        workbook_ids: record.workbook_ids,
        note: 'Already cited by this site for this entity. Verify it supports the specific field before reusing it.',
      }))
    : []

  return {
    brief_version: 1,
    job_id: job.job_id,
    entity: {
      slug: job.slug,
      type: job.entity_type,
      sheet: job.sheet,
      context: Object.fromEntries(
        CONTEXT_FIELDS.filter((name) => !job.requested_fields.includes(name)).map((name) => [
          name,
          normalizeText(entity.row[name]),
        ]),
      ),
    },
    requested_fields: requested,
    existing_sources: existingSources,
    budget: job.budget,
    rules: [
      'Answer only the fields listed in requested_fields. A change to any other field is rejected.',
      'Search existing_sources before looking for new literature.',
      'Every proposed value needs at least one source that meets the field’s accepted_source_classes and min_evidence_level.',
      'Never fabricate a DOI, PMID, study result, or safety claim.',
      'Preserve negative, null, and contradictory findings — flag them with negative_or_null_finding or contradicts_existing_evidence.',
      'If nothing adequately supported is found, return operation "no-op" with a rationale. That is a valid, useful answer.',
      'Describe studied regimens as what was studied, never as a recommendation.',
    ],
  }
}

/* ------------------------------------------------------------------ *
 * Work assignment
 * ------------------------------------------------------------------ */

/**
 * Deterministic sharding. Assignment depends only on the job id, so shards are
 * stable across rescans and two workers given different shard indices can never
 * receive the same job — no coordination required.
 */
export function assignShard(jobId, shardCount) {
  return shardOf(jobId, shardCount)
}

export function filterByShard(jobs, { shard, shardCount }) {
  if (shard === undefined || shard === null) return jobs
  if (!Number.isInteger(shardCount) || shardCount < 1) {
    throw new Error('filterByShard requires an integer shardCount >= 1')
  }
  if (!Number.isInteger(shard) || shard < 0 || shard >= shardCount) {
    throw new Error(`shard must be an integer in 0..${shardCount - 1}, received ${shard}`)
  }
  return jobs.filter((job) => shardOf(job.job_id, shardCount) === shard)
}

/** Partition a job list into `shardCount` disjoint, exhaustive shards. */
export function partition(jobs, shardCount) {
  const shards = Array.from({ length: shardCount }, () => [])
  for (const job of jobs) shards[shardOf(job.job_id, shardCount)].push(job)
  return shards
}
