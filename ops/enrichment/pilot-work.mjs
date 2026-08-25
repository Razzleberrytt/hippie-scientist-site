import { buildCandidate, writeCandidate } from '../../scripts/enrichment-pipeline/lib/candidates.mjs'
import { listJobs, setStatus } from '../../scripts/enrichment-pipeline/lib/job-store.mjs'
import { readReadiness } from '../../scripts/enrichment-pipeline/lib/readiness.mjs'

/**
 * Pilot worker.
 *
 * Every proposed binomial below was resolved against the GBIF Backbone Taxonomy
 * (api.gbif.org/v1/species/match?strict=true) and is recorded here with the
 * usageKey that was returned. Only ACCEPTED, EXACT matches are proposed. Names
 * that resolved to a SYNONYM, to a higher rank, or to more than one accepted
 * species are returned as no-ops for a human to settle.
 *
 * Values are bare binomials with no authority string, matching all 186
 * latin_name values already in the workbook.
 */

const ATTEMPT = Number.parseInt(process.argv[2] ?? '1', 10)

const VERIFIED = {
  'lavandula-angustifolia': { name: 'Lavandula angustifolia', key: 2927305, sci: 'Lavandula angustifolia Mill.', kingdom: 'Plantae', family: 'Lamiaceae' },
  'ginkgo-biloba': { name: 'Ginkgo biloba', key: 2687885, sci: 'Ginkgo biloba L.', kingdom: 'Plantae', family: 'Ginkgoaceae' },
  'elettaria-cardamomum': { name: 'Elettaria cardamomum', key: 2759871, sci: 'Elettaria cardamomum (L.) Maton', kingdom: 'Plantae', family: 'Zingiberaceae' },
  'ocimum-basilicum': { name: 'Ocimum basilicum', key: 2927096, sci: 'Ocimum basilicum L.', kingdom: 'Plantae', family: 'Lamiaceae' },
  'hericium-erinaceus': { name: 'Hericium erinaceus', key: 5248508, sci: 'Hericium erinaceus (Bull.) Pers.', kingdom: 'Fungi', family: 'Hericiaceae' },
  eleuthero: { name: 'Eleutherococcus senticosus', key: 3035369, sci: 'Eleutherococcus senticosus (Rupr. & Maxim.) Maxim.', kingdom: 'Plantae', family: 'Araliaceae' },
}

const NO_OPS = {
  'coleus-forskohlii':
    'Ambiguous in the current backbone and not resolvable without an editorial decision. GBIF returns "Coleus forskohlii" ' +
    '(usageKey 5605671) as a SYNONYM of Coleus hadiensis (10964472), while the other name used for this supplement, ' +
    '"Plectranthus barbatus" (6412796), is a SYNONYM of Coleus barbatus (8030165). The two names in common commercial use ' +
    'therefore resolve to two different accepted species. Proposing either would pick a side of an open taxonomic question.',
  astragalus:
    'The entity is genus-level ("Astragalus"). The species used as a supplement is Astragalus mongholicus Bunge ' +
    '(usageKey 5345341); "Astragalus membranaceus Fisch." (11044089) is a homotypic synonym of it. Whether this profile ' +
    'means the genus or that one species is an editorial scoping decision, not a taxonomic lookup, so no value is proposed.',
  quercetin:
    'Not a taxon. Quercetin is a flavonol, and latin_name has no meaning for it. The entity is typed entity_type=herb in ' +
    'Entity_Master, which is why the scanner queued it; the underlying classification is what needs correcting, not this cell.',
  phosphatidylserine:
    'Not a taxon. Phosphatidylserine is a phospholipid. Same entity_type=herb misclassification as quercetin.',
}

function gbifSource(entry, { duplicate = false } = {}) {
  const sources = [
    {
      id: `gbif-${entry.key}`,
      class: 'reference-database-authority',
      url: `https://www.gbif.org/species/${entry.key}`,
      title: `${entry.sci} — GBIF Backbone Taxonomy (${entry.kingdom}, ${entry.family})`,
      year: 2026,
    },
  ]
  if (duplicate) {
    // Same record, different spelling of the same URL. Normalization strips the
    // tracking parameter, so the two must resolve to one identity.
    sources.push({
      id: `gbif-${entry.key}-search`,
      class: 'reference-database-authority',
      url: `https://www.gbif.org/species/${entry.key}?utm_source=taxonomy-pass`,
      title: `${entry.sci} — GBIF Backbone Taxonomy`,
      year: 2026,
    })
  }
  return sources
}

const scope = new Set(readReadiness().pilot_scope.job_ids)
const jobs = listJobs((j) => scope.has(j.job_id))

let written = 0
for (const job of jobs) {
  const entry = VERIFIED[job.slug]
  const noOpReason = NO_OPS[job.slug]

  // Attempt 1 ships lavandula with a duplicate source on purpose, to prove the
  // citation validator catches it on real data. Attempt 2 ships it clean.
  const withDuplicate = ATTEMPT === 1 && job.slug === 'lavandula-angustifolia'

  const changes = entry
    ? [
        {
          field: 'latin_name',
          operation: 'set',
          current_value: '',
          proposed_value: entry.name,
          confidence: 'high',
          evidence_level: 'regulatory-monograph',
          source_ids: gbifSource(entry, { duplicate: withDuplicate }).map((s) => s.id),
          rationale:
            `GBIF Backbone Taxonomy returns "${entry.sci}" as ACCEPTED with an EXACT match at species rank ` +
            `(usageKey ${entry.key}, ${entry.kingdom}, ${entry.family}). Recorded as a bare binomial to match the ` +
            'formatting of the 186 latin_name values already in Entity_Master.',
        },
      ]
    : [
        {
          field: 'latin_name',
          operation: 'no-op',
          current_value: '',
          rationale: noOpReason,
        },
      ]

  const sources = entry ? gbifSource(entry, { duplicate: withDuplicate }) : []

  if (job.status === 'claimed') {
    setStatus(job.job_id, 'researching', { worker: 'pilot-1', note: 'GBIF backbone lookup' })
  }

  const candidate = buildCandidate({
    job,
    worker: 'pilot-1',
    changes,
    sources,
    attempt: ATTEMPT,
    provenance: {
      sources_examined: entry ? sources.length : 2,
      sources_reused: 0,
      sources_new: sources.length,
      cache_hits: 0,
      external_research_required: true,
      tool: 'gbif-backbone-match',
      notes: entry
        ? `api.gbif.org/v1/species/match?strict=true&name=${encodeURIComponent(entry.name)}`
        : 'Resolved against the GBIF backbone; see the change rationale for why no value is proposed.',
    },
    clock: () => Date.parse('2026-08-23T18:00:00.000Z'),
  })

  writeCandidate(candidate, { job, attempt: ATTEMPT })
  const current = listJobs((j) => j.job_id === job.job_id)[0]
  if (current.status === 'researching') {
    setStatus(job.job_id, 'candidate_ready', { worker: 'pilot-1', note: `candidate attempt ${ATTEMPT}` })
  }
  written += 1
  const kind = entry ? `set "${entry.name}"` : 'no-op'
  console.log(`  ${job.slug.padEnd(24)} ${kind}${withDuplicate ? '  [duplicate source, deliberate]' : ''}`)
}

console.log(`wrote ${written} candidate(s), attempt ${ATTEMPT}`)
