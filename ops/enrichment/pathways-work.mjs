import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCandidate, writeCandidate } from '../../scripts/enrichment-pipeline/lib/candidates.mjs'
import { claimJobs, listJobs, setStatus } from '../../scripts/enrichment-pipeline/lib/job-store.mjs'

/**
 * canonical_pathways worker.
 *
 * Unlike the latin_name batches, which each hard-coded their own table, this
 * runs every batch from one research file so the five batches share a single
 * code path. The research file is the durable record of what a human-supervised
 * worker actually found; this script only turns it into candidates.
 *
 *   node ops/enrichment/pathways-work.mjs <batch-id>
 *
 * Each entry is either a `set` (pathway labels plus the source that reports
 * them) or a `no-op` with a reason. A no-op is a real answer: it records that
 * the field was researched and nothing of the accepted class supported a label,
 * so a later rescan does not send anyone over the same ground.
 */

const here = path.dirname(fileURLToPath(import.meta.url))
const researchPath = path.join(here, 'pathways-research.json')
const vocabularyPath = path.join(here, '..', '..', 'public', 'data', 'canonical-mechanisms.json')

/**
 * canonical_pathways is not a free-text column: site-export.mjs feeds it,
 * together with mechanism_summary, straight into normalizeMechanisms(). A label
 * the taxonomy cannot resolve contributes nothing to canonical_mechanisms — the
 * exact failure #4189 spent a PR undoing. Every canonical_label is an alias of
 * itself, so restricting proposals to that set guarantees each one maps.
 */
const VOCABULARY = new Set(
  JSON.parse(fs.readFileSync(vocabularyPath, 'utf8')).map((entry) => entry.canonical_label),
)

const batchId = process.argv[2]
if (!batchId) throw new Error('usage: node ops/enrichment/pathways-work.mjs <batch-id>')

const research = JSON.parse(fs.readFileSync(researchPath, 'utf8'))
const batch = research.batches?.[batchId]
if (!batch) {
  throw new Error(`unknown batch "${batchId}". Known: ${Object.keys(research.batches || {}).join(', ')}`)
}

const worker = batch.worker || `pathways-${batchId}`
const clockAt = Date.parse(batch.created_at)
if (!Number.isFinite(clockAt)) throw new Error(`batch "${batchId}" needs a parseable created_at`)
const clock = () => clockAt

const entries = batch.entries || {}
const slugs = Object.keys(entries)
if (!slugs.length) throw new Error(`batch "${batchId}" has no entries`)
if (slugs.length > 25) throw new Error(`batch "${batchId}" has ${slugs.length} entries; the readiness cap is 25`)

const isPathwayJob = (job) => job.requested_fields.length === 1 && job.requested_fields[0] === 'canonical_pathways'

const jobs = listJobs((job) => isPathwayJob(job) && slugs.includes(job.slug))
const found = new Set(jobs.map((job) => job.slug))
const missing = slugs.filter((slug) => !found.has(slug))
if (missing.length) throw new Error(`no canonical_pathways job for: ${missing.join(', ')}`)

// Re-open anything parked at needs_review; the research file is the answer to
// whatever the guard was asking.
for (const job of jobs) {
  if (job.status === 'needs_review') {
    setStatus(job.job_id, 'pending', { note: `re-opened for ${batchId}` })
  }
}

const wanted = new Set(jobs.map((job) => job.job_id))
claimJobs({ worker, limit: wanted.size, filter: (job) => wanted.has(job.job_id) })

let set = 0
let noop = 0

for (const job of listJobs((j) => wanted.has(j.job_id))) {
  const entry = entries[job.slug]
  if (job.status === 'claimed') {
    setStatus(job.job_id, 'researching', { worker, note: `${batchId} research applied` })
  }

  const sources = []
  let change

  if (entry.noop) {
    change = {
      field: 'canonical_pathways',
      operation: 'no-op',
      current_value: '',
      rationale: entry.noop,
    }
    noop += 1
  } else {
    const source = entry.source
    if (!source?.doi) throw new Error(`${job.slug}: canonical_pathways needs a DOI-bearing source`)
    const id = `pmid-${source.pmid}`
    sources.push({
      id,
      class: source.class || 'preclinical-mechanistic-study',
      doi: source.doi,
      pmid: String(source.pmid),
      url: `https://doi.org/${source.doi}`,
      title: source.title,
      journal: source.journal,
      year: source.year,
      authors: source.authors ? [source.authors] : undefined,
    })
    const unknown = entry.pathways.filter((label) => !VOCABULARY.has(label))
    if (unknown.length) {
      throw new Error(
        `${job.slug}: canonical_pathways label(s) outside the mechanism vocabulary: ${unknown.join(', ')}`,
      )
    }
    const value = entry.pathways.join('; ')
    if (value.length > 300) throw new Error(`${job.slug}: canonical_pathways value exceeds 300 chars`)
    change = {
      field: 'canonical_pathways',
      operation: 'set',
      current_value: '',
      proposed_value: value,
      confidence: entry.confidence || 'moderate',
      evidence_level: entry.evidence_level || 'preclinical-mechanistic',
      source_ids: [id],
      rationale: entry.rationale,
      ...(entry.shared_value_acknowledged
        ? { shared_value_acknowledged: entry.shared_value_acknowledged }
        : {}),
      ...(entry.negative_or_null_finding ? { negative_or_null_finding: entry.negative_or_null_finding } : {}),
    }
    set += 1
  }

  const candidate = buildCandidate({
    job,
    worker,
    changes: [change],
    sources,
    attempt: 1,
    provenance: {
      sources_examined: entry.sources_examined ?? (sources.length || 1),
      sources_reused: entry.sources_reused ?? 0,
      sources_new: sources.length,
      external_research_required: true,
      tool: 'pubmed-eutils',
      notes: entry.noop ? 'no supporting source of an accepted class' : `pmid:${entry.source.pmid}`,
    },
    clock,
  })

  writeCandidate(candidate, { job, attempt: 1 })

  const current = listJobs((j) => j.job_id === job.job_id)[0]
  if (current.status === 'researching') {
    setStatus(job.job_id, 'candidate_ready', { worker, note: 'candidate attempt 1' })
  }

  const shown = entry.noop ? '(no-op)' : entry.pathways.join('; ')
  console.log(`  ${job.slug.padEnd(30)} ${shown}`)
}

console.log(`${batchId}: ${set} set, ${noop} no-op, ${slugs.length} job(s)`)
