import { buildCandidate, writeCandidate } from '../../scripts/enrichment-pipeline/lib/candidates.mjs'
import { claimJobs, listJobs, setStatus } from '../../scripts/enrichment-pipeline/lib/job-store.mjs'

/**
 * Batch 4 — the final latin_name batch. Every remaining pending job is worked,
 * so the field is either filled or has a recorded reason it cannot be.
 */

const VERIFIED = {
  agarikon: { name: 'Fomitopsis officinalis', key: 2543474, kingdom: 'Fungi' },
  'anise-hyssop': { name: 'Agastache foeniculum', key: 2926406, kingdom: 'Plantae' },
  cissus: { name: 'Cissus quadrangularis', key: 7130673, kingdom: 'Plantae' },
  cistanche: { name: 'Cistanche deserticola', key: 3730700, kingdom: 'Plantae' },
  'evening-primrose': { name: 'Oenothera biennis', key: 3188924, kingdom: 'Plantae' },
  'horse-chestnut': { name: 'Aesculus hippocastanum', key: 3189815, kingdom: 'Plantae' },
  isatis: { name: 'Isatis tinctoria', key: 5374118, kingdom: 'Plantae' },
  jatamansi: { name: 'Nardostachys jatamansi', key: 4095989, kingdom: 'Plantae' },
  jujube: { name: 'Ziziphus jujuba', key: 3039423, kingdom: 'Plantae' },
  'lemon-verbena': { name: 'Aloysia citrodora', key: 5667503, kingdom: 'Plantae' },
  lemongrass: { name: 'Cymbopogon citratus', key: 2705275, kingdom: 'Plantae' },
  'maitake-d-fraction': { name: 'Grifola frondosa', key: 2540800, kingdom: 'Fungi', note: 'D-fraction is an extract of this fungus; latin_name records the source organism.' },
  marshmallow: { name: 'Althaea officinalis', key: 3152520, kingdom: 'Plantae' },
  'milk-oats': { name: 'Avena sativa', key: 2705290, kingdom: 'Plantae', note: 'Milky oat seed; latin_name records the source plant.' },
  mugwort: { name: 'Artemisia vulgaris', key: 3120946, kingdom: 'Plantae' },
  'muira-puama': { name: 'Ptychopetalum olacoides', key: 3685538, kingdom: 'Plantae' },
  'mulberry-leaf': { name: 'Morus alba', key: 5361889, kingdom: 'Plantae' },
  'nettle-root': { name: 'Urtica dioica', key: 7960979, kingdom: 'Plantae' },
  ophiopogon: { name: 'Ophiopogon japonicus', key: 2774158, kingdom: 'Plantae' },
  'papaya-leaf': { name: 'Carica papaya', key: 2874484, kingdom: 'Plantae' },
  'pau-d-arco': { name: 'Handroanthus impetiginosum', key: 4092242, kingdom: 'Plantae', note: 'Formerly Tabebuia impetiginosa. GBIF spells the epithet impetiginosum.' },
  perilla: { name: 'Perilla frutescens', key: 5341394, kingdom: 'Plantae' },
  'raspberry-leaf': { name: 'Rubus idaeus', key: 2993094, kingdom: 'Plantae' },

  // Expected to hit the shared-value guard and route to review: both are plant
  // parts whose source species another entity already claims. That is the guard
  // asking a human to confirm a legitimate split rather than a duplicate.
  oatstraw: { name: 'Avena sativa', key: 2705290, kingdom: 'Plantae', note: 'Oat straw (aerial stem); shares its source plant with milk-oats.' },
  'holy-basil-seed': { name: 'Ocimum tenuiflorum', key: 2927100, kingdom: 'Plantae', note: 'Seed of holy basil; shares its source plant with holy-basil.' },
}

const GENUS = [
  'atractylodes', 'berberis', 'bupleurum', 'coptis', 'corydalis', 'dendrobium',
  'epimedium', 'eucalyptus', 'juniper', 'myrtle', 'phellodendron', 'polygala',
]

const NO_OPS = {
  ...Object.fromEntries(
    GENUS.map((slug) => [
      slug,
      `The entity is named for a bare genus. No latin_name in the workbook is a single word (0 of 232), so ` +
        `writing "${slug[0].toUpperCase()}${slug.slice(1)}" would invent a convention, and choosing a species ` +
        'would invent a scope decision the entity never made. Needs an editorial decision: adopt a genus ' +
        'convention, or narrow the entity to the species it actually describes.',
    ]),
  ),
  'maral-root':
    'GBIF returns "Rhaponticum carthamoides" (3142238) as a SYNONYM whose accepted target (9713621) is ' +
    '"Leuzea carthamoides carthamoides" at SUBSPECIES rank. The taxonomy policy refuses sub-species targets ' +
    'because every latin_name in the workbook is a binomial.',
  galangal:
    'Ambiguous between two accepted species. "Galangal" is Alpinia galanga (greater, 5302225) or ' +
    'Alpinia officinarum (lesser, 5302199) depending on the preparation, and the entity gives no context. ' +
    'Both are ACCEPTED at species rank, so this is a scope decision, not a lookup.',
  'angelica-root':
    'Ambiguous. The workbook already carries angelica-archangelica, angelica-dahurica, angelica-pubescens, and ' +
    'angelica-sinensis as separate entities with their own binomials, so an unqualified "angelica-root" cannot ' +
    'be assigned to one of them without deciding which profile it duplicates.',
  'orange-peel':
    'Ambiguous, and a collision risk. Orange peel is Citrus sinensis (sweet) or C. reticulata (mandarin/chen pi); ' +
    'citrus-sinensis already exists as its own entity holding "Citrus sinensis".',
  shankhpushpi:
    'Ambiguous across four unrelated plants. Shankhpushpi is sourced from Convolvulus prostratus, ' +
    'Clitoria ternatea, Evolvulus alsinoides, or Canscora decussata depending on region.',
  catuba:
    'Ambiguous. "Catuaba" is applied to several unrelated Brazilian species, most often Trichilia catigua or ' +
    'Erythroxylum vacciniifolium, and the entity gives no context.',
  'ocotea-odorifera':
    'GBIF returns "Ocotea odorifera" (4177566) as a SYNONYM of Mespilodaphne quixos (11020082). The specific ' +
    'epithet changes (odorifera -> quixos), so the taxonomy policy classifies it as a lumping into a broader ' +
    'taxon rather than a generic transfer, and refuses it.',
  citicoline: 'Not a taxon. Citicoline (CDP-choline) is a nucleotide compound, typed entity_type=herb in error.',
  resveratrol: 'Not a taxon. Resveratrol is a stilbenoid with many plant sources, typed entity_type=herb in error.',
  tyrosine:
    'Not a taxon. Tyrosine is an amino acid, typed entity_type=herb in error. The route /herbs/tyrosine/ already ' +
    '301s to /compounds/l-tyrosine/, so the herb-typed row is itself the defect.',
}

const SLUGS = [...Object.keys(VERIFIED), ...Object.keys(NO_OPS)]

const jobs = listJobs(
  (j) => j.mode === 'automatic' && j.requested_fields.join() === 'latin_name' && SLUGS.includes(j.slug),
)
if (jobs.length !== SLUGS.length) {
  const found = new Set(jobs.map((j) => j.slug))
  throw new Error(`missing jobs for: ${SLUGS.filter((s) => !found.has(s)).join(', ')}`)
}

const wanted = new Set(jobs.map((j) => j.job_id))
claimJobs({ worker: 'batch-4', limit: SLUGS.length, filter: (j) => wanted.has(j.job_id) })

let fills = 0
let noops = 0
for (const job of listJobs((j) => wanted.has(j.job_id))) {
  const entry = VERIFIED[job.slug]
  const reason = NO_OPS[job.slug]

  if (job.status === 'claimed') {
    setStatus(job.job_id, 'researching', { worker: 'batch-4', note: 'GBIF backbone lookup' })
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

  const candidate = buildCandidate({
    job,
    worker: 'batch-4',
    changes: entry
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
      : [{ field: 'latin_name', operation: 'no-op', current_value: '', rationale: reason }],
    sources,
    attempt: 1,
    provenance: {
      sources_examined: entry ? 1 : 2,
      sources_reused: 0,
      sources_new: sources.length,
      external_research_required: true,
      tool: 'gbif-backbone-match',
      notes: entry ? `api.gbif.org/v1/species/${entry.key}` : 'see rationale',
    },
    clock: () => Date.parse('2026-08-24T00:00:00.000Z'),
  })

  writeCandidate(candidate, { job, attempt: 1 })
  const now = listJobs((j) => j.job_id === job.job_id)[0]
  if (now.status === 'researching') {
    setStatus(job.job_id, 'candidate_ready', { worker: 'batch-4', note: 'candidate attempt 1' })
  }

  if (entry) fills += 1
  else noops += 1
}

console.log(`batch 4: ${fills} proposed fill(s), ${noops} no-op(s), ${fills + noops} job(s)`)
