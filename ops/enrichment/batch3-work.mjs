import { buildCandidate, writeCandidate } from '../../scripts/enrichment-pipeline/lib/candidates.mjs'
import { claimJobs, listJobs, setStatus } from '../../scripts/enrichment-pipeline/lib/job-store.mjs'

/**
 * Batch 3 — latin_name, 25 jobs, G14 standing scope.
 *
 * New this round: synonym resolution, under the policy in
 * scripts/enrichment-pipeline/lib/taxonomy-policy.mjs. Two entries below are
 * resolved generic transfers (same specific epithet, species rank, no
 * collision); everything else is a direct ACCEPTED/EXACT/SPECIES match.
 *
 * `lions-mane` is included deliberately: it is the same organism as
 * `hericium-erinaceus`, which was filled in pilot 1, so it should trip the new
 * shared-value guard and route to review instead of importing.
 */

const VERIFIED = {
  'harpagophytum-procumbens': { name: 'Harpagophytum procumbens', key: 3585335 },
  'huperzia-serrata': { name: 'Huperzia serrata', key: 2688470 },
  'garcinia-mangostana': { name: 'Garcinia mangostana', key: 3189571 },
  'lagerstroemia-speciosa': { name: 'Lagerstroemia speciosa', key: 3188724 },
  'nicotiana-tabacum': { name: 'Nicotiana tabacum', key: 2928774 },
  'elephantopus-scaber': { name: 'Elephantopus scaber', key: 5395925 },
  'myristica-fragrans': { name: 'Myristica fragrans', key: 5406817 },
  'embelia-ribes': { name: 'Embelia ribes', key: 7330952 },
  'lawsonia-inermis': { name: 'Lawsonia inermis', key: 5420912 },
  'lithospermum-erythrorhizon': { name: 'Lithospermum erythrorhizon', key: 2926087 },
  'lobelia-inflata': { name: 'Lobelia inflata', key: 5408737 },
  'echinacea-purpurea': { name: 'Echinacea purpurea', key: 3150935 },
  'eschscholzia-californica': { name: 'Eschscholzia californica', key: 2888380 },
  goldenseal: { name: 'Hydrastis canadensis', key: 3033110 },
  neem: { name: 'Azadirachta indica', key: 3190474 },
  guarana: { name: 'Paullinia cupana', key: 3189949 },
  gastrodia: { name: 'Gastrodia elata', key: 2813351 },
  eucommia: { name: 'Eucommia ulmoides', key: 3723584 },
  longan: { name: 'Dimocarpus longan', key: 3190008 },
  gudmar: { name: 'Gymnema sylvestre', key: 8040540 },
  houttuynia: { name: 'Houttuynia cordata', key: 5384931 },
  punarnava: { name: 'Boerhavia diffusa', key: 3086282 },
  notoginseng: { name: 'Panax notoginseng', key: 8877811 },
  'cordyceps-sinensis': {
    name: 'Ophiocordyceps sinensis',
    key: 2560562,
    synonym:
      'GBIF returns the searched name "Cordyceps sinensis" (2560564) as a SYNONYM. Resolved under the ' +
      'taxonomy policy: the accepted target is at SPECIES rank, the specific epithet "sinensis" is unchanged ' +
      '(a generic transfer of the same organism, not a lumping), and no other entity holds the accepted name.',
  },
  kanna: {
    name: 'Mesembryanthemum tortuosum',
    key: 7750120,
    synonym:
      'GBIF returns the searched name "Sceletium tortuosum" (3707372) as a SYNONYM. Resolved under the ' +
      'taxonomy policy: SPECIES rank, epithet "tortuosum" unchanged, no collision. The kanna literature still ' +
      'uses Sceletium tortuosum, so expect that name to appear in sources.',
  },
  // Same organism as hericium-erinaceus (filled in pilot 1). Expected to route
  // to review via the shared-value guard rather than import.
  'lions-mane': { name: 'Hericium erinaceus', key: 5248508 },
}

const SLUGS = Object.keys(VERIFIED)

// cordyceps-sinensis was a no-op in batch 2 and is now `rejected`; the policy
// change makes it workable, so return it to the pool first.
for (const job of listJobs((j) => SLUGS.includes(j.slug) && j.status === 'rejected')) {
  setStatus(job.job_id, 'pending', { note: 'synonym-resolution policy adopted; job is workable again' })
}

const jobs = listJobs(
  (j) => j.mode === 'automatic' && j.requested_fields.join() === 'latin_name' && SLUGS.includes(j.slug),
)
if (jobs.length !== SLUGS.length) {
  const found = new Set(jobs.map((j) => j.slug))
  throw new Error(`missing jobs for: ${SLUGS.filter((s) => !found.has(s)).join(', ')}`)
}

const wanted = new Set(jobs.map((j) => j.job_id))
claimJobs({ worker: 'batch-3', limit: SLUGS.length, filter: (j) => wanted.has(j.job_id) })

let count = 0
for (const job of listJobs((j) => wanted.has(j.job_id))) {
  const entry = VERIFIED[job.slug]
  if (job.status === 'claimed') {
    setStatus(job.job_id, 'researching', { worker: 'batch-3', note: 'GBIF backbone lookup' })
  }

  const candidate = buildCandidate({
    job,
    worker: 'batch-3',
    changes: [
      {
        field: 'latin_name',
        operation: 'set',
        current_value: '',
        proposed_value: entry.name,
        confidence: 'high',
        evidence_level: 'regulatory-monograph',
        source_ids: [`gbif-${entry.key}`],
        rationale:
          `GBIF Backbone Taxonomy records "${entry.name}" as ACCEPTED at species rank (usageKey ${entry.key}).` +
          (entry.synonym ? ` ${entry.synonym}` : ''),
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
      sources_examined: entry.synonym ? 2 : 1,
      sources_reused: 0,
      sources_new: 1,
      external_research_required: true,
      tool: 'gbif-backbone-match',
      notes: `api.gbif.org/v1/species/${entry.key}`,
    },
    clock: () => Date.parse('2026-08-23T20:00:00.000Z'),
  })

  writeCandidate(candidate, { job, attempt: 1 })
  const now = listJobs((j) => j.job_id === job.job_id)[0]
  if (now.status === 'researching') {
    setStatus(job.job_id, 'candidate_ready', { worker: 'batch-3', note: 'candidate attempt 1' })
  }
  count += 1
  console.log(`  ${job.slug.padEnd(28)} set "${entry.name}"${entry.synonym ? '  [synonym-resolved]' : ''}`)
}

console.log(`batch 3: ${count} candidate(s)`)
