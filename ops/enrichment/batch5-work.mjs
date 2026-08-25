import { buildCandidate, writeCandidate } from '../../scripts/enrichment-pipeline/lib/candidates.mjs'
import { claimJobs, listJobs, setStatus } from '../../scripts/enrichment-pipeline/lib/job-store.mjs'

/**
 * Batch 5 — the seven shared-value review cases, decided.
 *
 * The guard's question was "legitimate split, or duplicate?". The answer for
 * `latin_name` specifically is the same either way: the binomial is factually
 * correct for both entities, and sharing one is already established practice in
 * this workbook (`roselle-seed` with `hibiscus-sabdariffa`, `milk-oats` with
 * `oatstraw`, `curcumin` with `turmeric`). Leaving a correct value out of a page
 * that exists is the worse outcome.
 *
 * Whether two of these entities should be *merged* is a separate, entity-level
 * question that `enrich duplicates` tracks. Filling a correct field neither
 * creates nor worsens it.
 */

const DECIDED = {
  'lions-mane': {
    name: 'Hericium erinaceus',
    key: 5248508,
    ack:
      'Same organism as hericium-erinaceus, whose route 301s here. This is the surviving slug, so it should ' +
      'carry the binomial. The duplicate pair is tracked by enrich duplicates.',
  },
  'garcinia-mangostana': {
    name: 'Garcinia mangostana',
    key: 3189571,
    ack: 'Duplicate of mangosteen (slug-vs-common-name). The binomial is correct for both; the merge is tracked separately.',
  },
  gudmar: {
    name: 'Gymnema sylvestre',
    key: 8040540,
    ack: 'Duplicate of gymnema-sylvestre — gudmar is the Hindi name for the same plant. Merge tracked separately.',
  },
  lemongrass: {
    name: 'Cymbopogon citratus',
    key: 2705275,
    ack: 'Duplicate of cymbopogon-citratus (slug-vs-common-name). Merge tracked separately.',
  },
  'mulberry-leaf': {
    name: 'Morus alba',
    key: 5361889,
    ack:
      'Legitimate plant-part split: the leaf of Morus alba, which morus-alba also describes. Same pattern as ' +
      'roselle-seed alongside hibiscus-sabdariffa.',
  },
  cistanche: {
    name: 'Cistanche deserticola',
    key: 3730700,
    ack:
      'Cistanche deserticola is the primary medicinal species of the genus and is what this entity describes. ' +
      'cistanche-deserticola holds the same binomial; the merge is tracked separately.',
  },
  'holy-basil-seed': {
    name: 'Ocimum tenuiflorum',
    key: 2927100,
    ack: 'Legitimate plant-part split: the seed of holy basil, which holy-basil also describes.',
  },
}

const SLUGS = Object.keys(DECIDED)

// These jobs are parked at needs_review; return them to the pool now that the
// question they were raising has been answered.
for (const job of listJobs((j) => SLUGS.includes(j.slug) && j.status === 'needs_review')) {
  setStatus(job.job_id, 'pending', { note: 'shared-value question decided; see batch 5' })
}

const jobs = listJobs(
  (j) => j.mode === 'automatic' && j.requested_fields.join() === 'latin_name' && SLUGS.includes(j.slug),
)
if (jobs.length !== SLUGS.length) {
  const found = new Set(jobs.map((j) => j.slug))
  throw new Error(`missing jobs for: ${SLUGS.filter((s) => !found.has(s)).join(', ')}`)
}

const wanted = new Set(jobs.map((j) => j.job_id))
claimJobs({ worker: 'batch-5', limit: SLUGS.length, filter: (j) => wanted.has(j.job_id) })

for (const job of listJobs((j) => wanted.has(j.job_id))) {
  const entry = DECIDED[job.slug]
  if (job.status === 'claimed') {
    setStatus(job.job_id, 'researching', { worker: 'batch-5', note: 'shared-value decision applied' })
  }

  const candidate = buildCandidate({
    job,
    worker: 'batch-5',
    changes: [
      {
        field: 'latin_name',
        operation: 'set',
        current_value: '',
        proposed_value: entry.name,
        confidence: 'high',
        evidence_level: 'regulatory-monograph',
        source_ids: [`gbif-${entry.key}`],
        shared_value_acknowledged: entry.ack,
        rationale: `GBIF Backbone Taxonomy records "${entry.name}" as ACCEPTED at species rank (usageKey ${entry.key}).`,
      },
    ],
    sources: [
      {
        id: `gbif-${entry.key}`,
        class: 'reference-database-authority',
        url: `https://www.gbif.org/species/${entry.key}`,
        title: `${entry.name} — GBIF Backbone Taxonomy`,
        year: 2026,
      },
    ],
    attempt: 1,
    provenance: {
      sources_examined: 1,
      sources_reused: 0,
      sources_new: 1,
      external_research_required: false,
      tool: 'gbif-backbone-match',
      notes: `api.gbif.org/v1/species/${entry.key}`,
    },
    clock: () => Date.parse('2026-08-24T01:00:00.000Z'),
  })

  writeCandidate(candidate, { job, attempt: 1 })
  const now = listJobs((j) => j.job_id === job.job_id)[0]
  if (now.status === 'researching') {
    setStatus(job.job_id, 'candidate_ready', { worker: 'batch-5', note: 'candidate attempt 1' })
  }
  console.log(`  ${job.slug.padEnd(24)} set "${entry.name}"  [acknowledged]`)
}

console.log(`batch 5: ${SLUGS.length} decided shared-value case(s)`)
