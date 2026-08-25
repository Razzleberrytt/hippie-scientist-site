import { buildCandidate, writeCandidate } from '../../scripts/enrichment-pipeline/lib/candidates.mjs'
import { claimJobs, listJobs, setStatus } from '../../scripts/enrichment-pipeline/lib/job-store.mjs'

/**
 * Batch 2 — latin_name, 25 jobs, under the G14 standing scope.
 *
 * Same rule as pilot 1: a value is proposed only when
 * api.gbif.org/v1/species/match?strict=true returns
 * status=ACCEPTED, matchType=EXACT, rank=SPECIES for a name that unambiguously
 * identifies this entity. Everything else is a no-op with the reason recorded.
 *
 * Synonym resolution is deliberately NOT applied here — see the `grapefruit`
 * entry for why following the backbone's accepted target can be actively wrong.
 */

const VERIFIED = {
  'ficus-carica': { name: 'Ficus carica', key: 5361909, kingdom: 'Plantae' },
  'nicotiana-glauca': { name: 'Nicotiana glauca', key: 2928783, kingdom: 'Plantae' },
  'mangifera-indica': { name: 'Mangifera indica', key: 3190638, kingdom: 'Plantae' },
  'garcinia-indica': { name: 'Garcinia indica', key: 3189566, kingdom: 'Plantae' },
  arjuna: { name: 'Terminalia arjuna', key: 3699548, kingdom: 'Plantae', note: 'Arjuna is Terminalia arjuna in every herbal and clinical source.' },
  artichoke: { name: 'Cynara scolymus', key: 3112361, kingdom: 'Plantae', note: 'Globe artichoke.' },
  oregano: { name: 'Origanum vulgare', key: 2926612, kingdom: 'Plantae' },
  kudzu: { name: 'Pueraria montana', key: 2977636, kingdom: 'Plantae', note: 'Recorded at species rank; the supplement is usually the var. lobata variety of this species.' },
  'japanese-knotweed': { name: 'Reynoutria japonica', key: 2889173, kingdom: 'Plantae', note: 'Also published as Fallopia japonica and Polygonum cuspidatum; Reynoutria japonica is the accepted name.' },
  'luo-han-guo': { name: 'Siraitia grosvenorii', key: 3623059, kingdom: 'Plantae', note: 'Monk fruit.' },
  guayusa: { name: 'Ilex guayusa', key: 5534620, kingdom: 'Plantae' },
  fingerroot: { name: 'Boesenbergia rotunda', key: 2758480, kingdom: 'Plantae' },
  'american-yellow-lotus': { name: 'Nelumbo lutea', key: 7503234, kingdom: 'Plantae' },
  'roselle-seed': { name: 'Hibiscus sabdariffa', key: 3152582, kingdom: 'Plantae', note: 'The entity is the seed; latin_name records the source plant.' },
  'holy-basil-purple': { name: 'Ocimum tenuiflorum', key: 2927100, kingdom: 'Plantae', note: 'Holy basil / tulsi. "Purple" is a cultivar (Krishna tulsi), so the value is recorded at species rank.' },
  'rice-bran': { name: 'Oryza sativa', key: 2703459, kingdom: 'Plantae', note: 'The entity is the bran; latin_name records the source plant.' },
  honeysuckle: { name: 'Lonicera japonica', key: 5334240, kingdom: 'Plantae', note: 'Lonicera has ~180 species, but "honeysuckle" as a botanical ingredient is Lonicera japonica (Jin Yin Hua), and chlorogenic acid — listed on this entity — is its marker compound.' },
}

const NO_OPS = {
  grapefruit:
    'GBIF returns "Citrus paradisi" (7469645) as a SYNONYM of Citrus aurantium (8077391). Citrus aurantium is ' +
    'bitter orange — a different supplement with its own synephrine-related cardiovascular cautions — so writing ' +
    'the backbone accepted name here would conflate two ingredients. The workbook also keeps citrus segregates ' +
    'apart already (citrus-bergamia = "Citrus bergamia", citrus-sinensis = "Citrus sinensis"), so following the ' +
    'lumping would contradict its own convention. Needs a human decision on whether to record "Citrus paradisi".',
  'fraxinus-rhynchophylla':
    'GBIF returns "Fraxinus rhynchophylla" (7326154) as a SYNONYM whose accepted target (3684429) is ' +
    '"Fraxinus chinensis rhynchophylla" at SUBSPECIES rank. All 192 latin_name values in the workbook are ' +
    'binomials, so writing a subspecies trinomial would break the format convention. Needs a human decision.',
  'epimedium-brevicornum':
    'Not present in the GBIF backbone — a strict match returns matchType=NONE and a species search returns no ' +
    'results. The name is used widely in the horny-goat-weed literature, so it likely needs a different ' +
    'nomenclatural authority (IPNI or POWO) rather than the GBIF backbone.',
  blueberry:
    'Ambiguous. "Blueberry" covers several Vaccinium species (V. corymbosum, V. angustifolium, and others), and ' +
    'the entity carries no context that identifies one. Picking a species would be a guess.',
  'coffee-cherry':
    'Ambiguous. Coffee cherry (cascara) is produced from both Coffea arabica and C. canephora, and the marker ' +
    'compounds listed on the entity (caffeine, trigonelline, cafestol) occur in both. No context identifies one.',
  'rose-hips':
    'Ambiguous. Rose hips are harvested from several Rosa species; Rosa canina is the most common but the entity ' +
    'describes generic "fruit material" without naming one.',
  'kuding-tea':
    'Ambiguous, and across families. Kuding tea is made from either Ilex kaushue (Aquifoliaceae) or ' +
    'Ligustrum robustum (Oleaceae) depending on region. Choosing one would misidentify the other.',
  'cordyceps-sinensis':
    'GBIF returns "Cordyceps sinensis" (2560564) as a SYNONYM of Ophiocordyceps sinensis (2560562), a clean ' +
    'species-to-species transfer. Resolving synonyms to their accepted target is probably the right long-term ' +
    'rule, but this batch does not apply it: the grapefruit entry in the same batch shows the same mechanism ' +
    'producing a harmful result. Synonym resolution needs its own policy decision before it is used.',
}

const SLUGS = [...Object.keys(VERIFIED), ...Object.keys(NO_OPS)]

const pending = listJobs(
  (j) => j.mode === 'automatic' && j.requested_fields.join() === 'latin_name' && SLUGS.includes(j.slug),
)
const wanted = new Set(pending.map((j) => j.job_id))
if (pending.length !== SLUGS.length) {
  const found = new Set(pending.map((j) => j.slug))
  throw new Error(`missing jobs for: ${SLUGS.filter((s) => !found.has(s)).join(', ')}`)
}

claimJobs({ worker: 'batch-2', limit: SLUGS.length, filter: (j) => wanted.has(j.job_id) })

let fills = 0
let noops = 0
for (const job of listJobs((j) => wanted.has(j.job_id))) {
  const entry = VERIFIED[job.slug]
  const reason = NO_OPS[job.slug]

  if (job.status === 'claimed') {
    setStatus(job.job_id, 'researching', { worker: 'batch-2', note: 'GBIF backbone lookup' })
  }

  const sources = entry
    ? [
        {
          id: `gbif-${entry.key}`,
          class: 'reference-database-authority',
          url: `https://www.gbif.org/species/${entry.key}`,
          title: `${entry.name} — GBIF Backbone Taxonomy (${entry.kingdom})`,
          year: 2026,
        },
      ]
    : []

  const changes = entry
    ? [
        {
          field: 'latin_name',
          operation: 'set',
          current_value: '',
          proposed_value: entry.name,
          confidence: 'high',
          evidence_level: 'regulatory-monograph',
          source_ids: [`gbif-${entry.key}`],
          rationale:
            `GBIF Backbone Taxonomy returns "${entry.name}" as ACCEPTED with an EXACT match at species rank ` +
            `(usageKey ${entry.key}, ${entry.kingdom}).${entry.note ? ` ${entry.note}` : ''}`,
        },
      ]
    : [{ field: 'latin_name', operation: 'no-op', current_value: '', rationale: reason }]

  const candidate = buildCandidate({
    job,
    worker: 'batch-2',
    changes,
    sources,
    attempt: 1,
    provenance: {
      sources_examined: entry ? 1 : 2,
      sources_reused: 0,
      sources_new: sources.length,
      external_research_required: true,
      tool: 'gbif-backbone-match',
      notes: entry ? `api.gbif.org/v1/species/match?strict=true&name=${encodeURIComponent(entry.name)}` : 'see rationale',
    },
    clock: () => Date.parse('2026-08-23T19:00:00.000Z'),
  })

  writeCandidate(candidate, { job, attempt: 1 })
  const now = listJobs((j) => j.job_id === job.job_id)[0]
  if (now.status === 'researching') {
    setStatus(job.job_id, 'candidate_ready', { worker: 'batch-2', note: 'candidate attempt 1' })
  }

  if (entry) fills += 1
  else noops += 1
  console.log(`  ${job.slug.padEnd(24)} ${entry ? `set "${entry.name}"` : 'no-op'}`)
}

console.log(`batch 2: ${fills} fill(s), ${noops} no-op(s), ${fills + noops} job(s)`)
