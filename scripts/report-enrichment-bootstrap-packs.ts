import fs from 'node:fs'
import path from 'node:path'

type Workpack = {
  workpackId: string
  itemType: 'herb_page' | 'compound_page' | 'collection_page' | 'comparison_page' | 'discovery_surface' | 'recommendation_surface'
  entitySlug: string | null
  surfaceId: string | null
  missingTopics: string[]
  requiredTopics: string[]
  blockedReasons: string[]
  availableSourceIds: string[]
  requiredGovernanceChecks: string[]
  completionCriteria: string[]
  reviewerNeeded: boolean
  reviewCycleState: string
  operationalBucket: 'governance_fix' | 'do_now' | 're_review' | 'next_wave' | 'defer'
}

type WorkpackReport = {
  generatedAt: string
  deterministicModelVersion: string
  workpacks: Workpack[]
}

type SourceRegistryRow = {
  sourceId: string
  sourceClass:
    | 'randomized-human-trial'
    | 'non-randomized-human-study'
    | 'observational-human-evidence'
    | 'systematic-review-meta-analysis'
    | 'preclinical-mechanistic-study'
    | 'traditional-use-monograph'
    | 'regulatory-agency-monograph-guidance'
    | 'reference-database-authority'
  evidenceClass:
    | 'human-clinical'
    | 'human-observational'
    | 'preclinical-mechanistic'
    | 'traditional-use'
    | 'regulatory-monograph'
  publicationStatus: 'published' | 'preprint' | 'withdrawn' | 'superseded' | 'archived'
  sourceType: string
  title: string
  active: boolean
  reviewer: string
  reviewedAt: string
  reliabilityTier: 'tier-a' | 'tier-b' | 'tier-c' | 'tier-d'
  organization?: string
  jurisdiction?: string
  monographId?: string
  isbn?: string
  doi?: string
  pmid?: string
  canonicalUrl?: string
}

type EntityType = 'herb' | 'compound' | 'surface'
type TopicType =
  | 'supported_use'
  | 'unsupported_or_unclear_use'
  | 'mechanism'
  | 'constituent'
  | 'interaction'
  | 'contraindication'
  | 'adverse_effect'
  | 'pregnancy_note'
  | 'lactation_note'
  | 'pediatric_note'
  | 'geriatric_note'
  | 'condition_caution'
  | 'surgery_caution'
  | 'medication_class_caution'
  | 'population_specific_note'
  | 'conflict_note'
  | 'research_gap'
  | 'constituent_relationship'
  | 'pathway'
  | 'receptor_activity'
  | 'enzyme_interaction'
  | 'transporter_interaction'
  | 'herb_compound_link'
  | 'compound_origin_note'

type ClaimType =
  | 'efficacy_signal'
  | 'efficacy_null_or_mixed'
  | 'mechanistic_signal'
  | 'constituent_profile'
  | 'safety_risk'
  | 'population_note'
  | 'evidence_conflict'
  | 'research_gap'
  | 'relationship_signal'
  | 'origin_note'

type BootstrapPack = {
  bootstrapPackId: string
  workpackId: string
  entityType: EntityType
  entitySlug: string | null
  surfaceId: string | null
  sourceId: string
  sourceClass: SourceRegistryRow['sourceClass']
  evidenceClass: SourceRegistryRow['evidenceClass']
  candidateTopicTypes: TopicType[]
  candidateClaimTypes: ClaimType[]
  sourceUseNotes: string
  requiredMetadataChecks: string[]
  requiredGovernanceChecks: string[]
  suggestedEntrySkeletons: Array<{
    topicType: TopicType
    claimType: ClaimType
    skeletonChecklist: string[]
  }>
  blockedTopicTypes: TopicType[]
  completionCriteria: string[]
  reviewerNeeded: boolean
  status: 'ready_for_authoring' | 'blocked_source' | 'blocked_governance'
  notesForContractor: string
}

const ROOT = process.cwd()
const WORKPACKS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-bootstrap-packs.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-bootstrap-packs.md')

const SOURCE_CLASS_TOPIC_ALLOWLIST: Record<SourceRegistryRow['sourceClass'], TopicType[]> = {
  'randomized-human-trial': ['supported_use', 'unsupported_or_unclear_use', 'population_specific_note', 'conflict_note', 'research_gap'],
  'non-randomized-human-study': ['supported_use', 'unsupported_or_unclear_use', 'population_specific_note', 'conflict_note', 'research_gap'],
  'observational-human-evidence': ['supported_use', 'unsupported_or_unclear_use', 'population_specific_note', 'conflict_note', 'research_gap'],
  'systematic-review-meta-analysis': [
    'supported_use',
    'unsupported_or_unclear_use',
    'interaction',
    'contraindication',
    'adverse_effect',
    'pregnancy_note',
    'lactation_note',
    'pediatric_note',
    'geriatric_note',
    'condition_caution',
    'surgery_caution',
    'medication_class_caution',
    'population_specific_note',
    'conflict_note',
    'research_gap',
  ],
  'preclinical-mechanistic-study': [
    'mechanism',
    'pathway',
    'receptor_activity',
    'enzyme_interaction',
    'transporter_interaction',
    'constituent',
    'constituent_relationship',
    'herb_compound_link',
    'compound_origin_note',
    'research_gap',
    'unsupported_or_unclear_use',
  ],
  'traditional-use-monograph': ['unsupported_or_unclear_use', 'population_specific_note', 'research_gap'],
  'regulatory-agency-monograph-guidance': [
    'interaction',
    'contraindication',
    'adverse_effect',
    'pregnancy_note',
    'lactation_note',
    'pediatric_note',
    'geriatric_note',
    'condition_caution',
    'surgery_caution',
    'medication_class_caution',
    'population_specific_note',
    'unsupported_or_unclear_use',
    'research_gap',
  ],
  'reference-database-authority': [
    'interaction',
    'contraindication',
    'adverse_effect',
    'pregnancy_note',
    'lactation_note',
    'pediatric_note',
    'geriatric_note',
    'condition_caution',
    'surgery_caution',
    'medication_class_caution',
    'mechanism',
    'constituent',
    'constituent_relationship',
    'herb_compound_link',
    'compound_origin_note',
    'population_specific_note',
    'research_gap',
  ],
}

const TOPIC_TO_CLAIM: Record<TopicType, ClaimType> = {
  supported_use: 'efficacy_signal',
  unsupported_or_unclear_use: 'efficacy_null_or_mixed',
  mechanism: 'mechanistic_signal',
  constituent: 'constituent_profile',
  interaction: 'safety_risk',
  contraindication: 'safety_risk',
  adverse_effect: 'safety_risk',
  pregnancy_note: 'population_note',
  lactation_note: 'population_note',
  pediatric_note: 'population_note',
  geriatric_note: 'population_note',
  condition_caution: 'population_note',
  surgery_caution: 'population_note',
  medication_class_caution: 'population_note',
  population_specific_note: 'population_note',
  conflict_note: 'evidence_conflict',
  research_gap: 'research_gap',
  constituent_relationship: 'relationship_signal',
  pathway: 'mechanistic_signal',
  receptor_activity: 'mechanistic_signal',
  enzyme_interaction: 'mechanistic_signal',
  transporter_interaction: 'mechanistic_signal',
  herb_compound_link: 'relationship_signal',
  compound_origin_note: 'origin_note',
}

const SAFETY_TOPICS = new Set<TopicType>([
  'interaction',
  'contraindication',
  'adverse_effect',
  'pregnancy_note',
  'lactation_note',
  'pediatric_note',
  'geriatric_note',
  'condition_caution',
  'surgery_caution',
  'medication_class_caution',
])

const GOVERNANCE_BASELINES = [
  'Create normalized enrichment entries only; do not auto-publish or treat scaffolds as claims.',
  'Set reviewer, reviewedAt, and editorialStatus before any publish consideration.',
  'Run evidence/conflict grading and preserve uncertainty/conflict notes where applicable.',
  'Keep publish gating active; publication requires governance checks and human sign-off.',
]

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function dedupe<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

function stableId(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase()
}

function topicsFromWorkpack(workpack: Workpack): TopicType[] {
  const seed = new Set<string>(workpack.missingTopics.length > 0 ? workpack.missingTopics : workpack.requiredTopics)
  const topics = new Set<TopicType>(['research_gap'])

  if (seed.has('evidence')) {
    topics.add('supported_use')
    topics.add('unsupported_or_unclear_use')
    topics.add('conflict_note')
  }

  if (seed.has('safety')) {
    topics.add('interaction')
    topics.add('contraindication')
    topics.add('adverse_effect')
    topics.add('pregnancy_note')
    topics.add('lactation_note')
    topics.add('pediatric_note')
    topics.add('geriatric_note')
    topics.add('condition_caution')
    topics.add('surgery_caution')
    topics.add('medication_class_caution')
    topics.add('population_specific_note')
  }

  if (seed.has('mechanism')) {
    topics.add('mechanism')
    topics.add('pathway')
    topics.add('receptor_activity')
    topics.add('enzyme_interaction')
    topics.add('transporter_interaction')
  }

  if (seed.has('constituent')) {
    topics.add('constituent')
    topics.add('constituent_relationship')
    topics.add('herb_compound_link')
    topics.add('compound_origin_note')
  }

  return Array.from(topics).sort()
}

function sourceMetadataChecks(source: SourceRegistryRow, candidateTopicTypes: TopicType[]): string[] {
  const checks = new Set<string>([
    'sourceId/title/sourceType/sourceClass/evidenceClass are present and internally consistent.',
    'reviewer + reviewedAt are populated and source is active in registry.',
    'publicationStatus is not withdrawn/superseded/archived.',
    'At least one citation anchor exists (doi|pmid|canonicalUrl|monographId|isbn).',
  ])

  if (source.sourceClass === 'regulatory-agency-monograph-guidance' || source.sourceClass === 'traditional-use-monograph') {
    checks.add('organization and jurisdiction/region metadata are set for monograph-style source usage.')
    checks.add('monographId or isbn is present for monograph/regulatory source classes.')
  }

  if (candidateTopicTypes.some(topic => SAFETY_TOPICS.has(topic))) {
    checks.add('Safety-topic authoring requires explicit safety context linkage in findingTextNormalized + uncertainty notes when needed.')
  }

  return Array.from(checks)
}

function blockedTopicsForSource(source: SourceRegistryRow): TopicType[] {
  const blocked = new Set<TopicType>()

  if (source.sourceClass === 'preclinical-mechanistic-study') {
    blocked.add('supported_use')
  }

  if (source.sourceClass === 'traditional-use-monograph') {
    blocked.add('supported_use')
    blocked.add('mechanism')
    blocked.add('pathway')
    blocked.add('receptor_activity')
    blocked.add('enzyme_interaction')
    blocked.add('transporter_interaction')
  }

  if (
    source.sourceClass !== 'regulatory-agency-monograph-guidance' &&
    source.sourceClass !== 'reference-database-authority' &&
    source.sourceClass !== 'systematic-review-meta-analysis'
  ) {
    for (const topic of SAFETY_TOPICS) blocked.add(topic)
  }

  return Array.from(blocked).sort()
}

function sourceIsEligible(source: SourceRegistryRow): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = []
  if (!source.active) reasons.push('source_not_active')
  if (!source.reviewer || !source.reviewedAt) reasons.push('missing_registry_review_metadata')
  if (source.publicationStatus === 'withdrawn' || source.publicationStatus === 'superseded' || source.publicationStatus === 'archived') {
    reasons.push('publication_status_blocked')
  }
  return { eligible: reasons.length === 0, reasons }
}

function sourceUseNotes(source: SourceRegistryRow): string {
  if (source.sourceClass === 'preclinical-mechanistic-study') {
    return 'Preclinical-only source: use for mechanism/constituent plausibility or uncertainty notes; do not bootstrap strong human-support framing.'
  }
  if (source.sourceClass === 'traditional-use-monograph') {
    return 'Traditional-use source: frame as historical/traditional context only; do not draft modern clinical efficacy wording from this source alone.'
  }
  if (source.sourceClass === 'regulatory-agency-monograph-guidance' || source.sourceClass === 'reference-database-authority') {
    return 'Safety/regulatory authority source: prioritize contraindications/interactions/population cautions and include jurisdiction/organization context.'
  }
  return 'Human-evidence-capable source: use measured claim wording and keep uncertainty/conflict framing explicit.'
}

function entityTypeFor(workpack: Workpack): EntityType {
  if (workpack.itemType === 'herb_page') return 'herb'
  if (workpack.itemType === 'compound_page') return 'compound'
  return 'surface'
}

function buildSkeleton(topicType: TopicType, claimType: ClaimType): { topicType: TopicType; claimType: ClaimType; skeletonChecklist: string[] } {
  return {
    topicType,
    claimType,
    skeletonChecklist: [
      `Set topicType=${topicType} and claimType=${claimType} with evidenceClass matching the selected source registry entry.`,
      'Write findingTextShort/findingTextNormalized with source-grounded language and explicit uncertainty limits.',
      'Attach reviewer, reviewedAt, editorialStatus (draft/needs_review), and active flags per normalized schema.',
      'Do not mark publishable until evidence/conflict grading and governance checks pass.',
    ],
  }
}

function run() {
  const workpacks = readJson<WorkpackReport>(WORKPACKS_PATH)
  const sourceRegistry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)
  const sourceById = new Map(sourceRegistry.map(source => [source.sourceId, source]))

  const packs: BootstrapPack[] = []
  const skippedSources: Array<{ workpackId: string; sourceId: string; reasons: string[] }> = []

  for (const workpack of workpacks.workpacks) {
    const targetTopics = topicsFromWorkpack(workpack)

    for (const sourceId of workpack.availableSourceIds) {
      const source = sourceById.get(sourceId)
      if (!source) {
        skippedSources.push({ workpackId: workpack.workpackId, sourceId, reasons: ['missing_source_registry_record'] })
        continue
      }

      const eligibility = sourceIsEligible(source)
      if (!eligibility.eligible) {
        skippedSources.push({ workpackId: workpack.workpackId, sourceId, reasons: eligibility.reasons })
        continue
      }

      const allowedByClass = new Set(SOURCE_CLASS_TOPIC_ALLOWLIST[source.sourceClass] || [])
      const blockedTopics = new Set(blockedTopicsForSource(source))

      const candidateTopicTypes = targetTopics.filter(topic => allowedByClass.has(topic) && !blockedTopics.has(topic))
      const candidateClaimTypes = dedupe(candidateTopicTypes.map(topic => TOPIC_TO_CLAIM[topic])).sort()

      const requiredGovernanceChecks = dedupe([...workpack.requiredGovernanceChecks, 'enrichment:validate:normalized']).sort()

      const status: BootstrapPack['status'] =
        candidateTopicTypes.length === 0
          ? 'blocked_source'
          : workpack.operationalBucket === 'governance_fix' && workpack.availableSourceIds.length === 0
            ? 'blocked_governance'
            : 'ready_for_authoring'

      const bootstrapPackId = `bp_${stableId(workpack.workpackId)}_${stableId(source.sourceId)}`
      const suggestedEntrySkeletons = candidateTopicTypes.map(topic => buildSkeleton(topic, TOPIC_TO_CLAIM[topic]))

      const metadataChecks = sourceMetadataChecks(source, candidateTopicTypes)
      const reviewerNeeded =
        workpack.reviewerNeeded ||
        candidateTopicTypes.some(topic => topic === 'supported_use' || topic === 'interaction' || topic === 'contraindication')

      packs.push({
        bootstrapPackId,
        workpackId: workpack.workpackId,
        entityType: entityTypeFor(workpack),
        entitySlug: workpack.entitySlug,
        surfaceId: workpack.surfaceId,
        sourceId: source.sourceId,
        sourceClass: source.sourceClass,
        evidenceClass: source.evidenceClass,
        candidateTopicTypes,
        candidateClaimTypes,
        sourceUseNotes: sourceUseNotes(source),
        requiredMetadataChecks: metadataChecks,
        requiredGovernanceChecks,
        suggestedEntrySkeletons,
        blockedTopicTypes: Array.from(blockedTopics).sort(),
        completionCriteria: dedupe([
          ...workpack.completionCriteria,
          ...GOVERNANCE_BASELINES,
          'Normalize entries via enrichment:normalize and validate with enrichment:validate:normalized before review handoff.',
        ]),
        reviewerNeeded,
        status,
        notesForContractor: `${workpack.reviewCycleState} workpack context. Bootstrap pack is scaffolding only and cannot be treated as publish-ready claims.`,
      })
    }
  }

  packs.sort((a, b) => {
    if (a.status !== b.status) return a.status.localeCompare(b.status)
    if (a.workpackId !== b.workpackId) return a.workpackId.localeCompare(b.workpackId)
    return a.sourceId.localeCompare(b.sourceId)
  })

  const summary = {
    totalBootstrapPacks: packs.length,
    readyForAuthoringCount: packs.filter(pack => pack.status === 'ready_for_authoring').length,
    blockedGovernanceCount: packs.filter(pack => pack.status === 'blocked_governance').length,
    blockedSourceCount: packs.filter(pack => pack.status === 'blocked_source').length,
    reviewerNeededCount: packs.filter(pack => pack.reviewerNeeded).length,
    bySourceClass: Object.fromEntries(
      dedupe(packs.map(pack => pack.sourceClass))
        .sort()
        .map(sourceClass => [sourceClass, packs.filter(pack => pack.sourceClass === sourceClass).length]),
    ),
    byEvidenceClass: Object.fromEntries(
      dedupe(packs.map(pack => pack.evidenceClass))
        .sort()
        .map(evidenceClass => [evidenceClass, packs.filter(pack => pack.evidenceClass === evidenceClass).length]),
    ),
  }

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-bootstrap-packs-v1',
    sources: {
      enrichmentWorkpacks: path.relative(ROOT, WORKPACKS_PATH),
      sourceRegistry: path.relative(ROOT, SOURCE_REGISTRY_PATH),
    },
    sourceToEnrichmentAudit: {
      requiredAuthoringInputs: [
        'approved active source registry row (sourceId/sourceClass/evidenceClass + reviewer metadata)',
        'workpack scope (entity/surface + missing topics + completion criteria)',
        'topic-to-claim normalization map for normalized enrichment entries',
        'governance constraints (editorial status, evidence/conflict grading, publish gating)',
      ],
      hardStops: [
        'Do not generate publishable claims from bootstrap output.',
        'Do not use blocked/deprecated/inactive source registry rows.',
        'Do not bypass reviewer/reviewedAt/editorialStatus requirements.',
      ],
    },
    summary,
    skippedSources,
    bootstrapPacks: packs,
  }

  const md: string[] = [
    '# Enrichment Authoring Bootstrap Packs',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    `- totalBootstrapPacks: ${summary.totalBootstrapPacks}`,
    `- readyForAuthoring: ${summary.readyForAuthoringCount}`,
    `- blockedGovernance: ${summary.blockedGovernanceCount}`,
    `- blockedSource: ${summary.blockedSourceCount}`,
    `- reviewerNeeded: ${summary.reviewerNeededCount}`,
    '',
    '## Contractor workflow reminders',
    '- Bootstrap packs are scaffolds only; they do not create publishable claims.',
    '- Every entry still needs normalized enrichment drafting, reviewer metadata, evidence/conflict grading, and publish gating checks.',
    '- Preclinical/traditional sources cannot be rewritten into strong modern clinical claim framing.',
    '',
    '## Top bootstrap packs (first 30)',
    '| bootstrapPackId | workpackId | target | sourceId | sourceClass | status | candidate topics | blocked topics |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const pack of packs.slice(0, 30)) {
    const target = pack.entitySlug || pack.surfaceId || '-'
    md.push(
      `| ${pack.bootstrapPackId} | ${pack.workpackId} | ${target} | ${pack.sourceId} | ${pack.sourceClass} | ${pack.status} | ${pack.candidateTopicTypes.join(', ') || '-'} | ${pack.blockedTopicTypes.join(', ') || '-'} |`,
    )
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(
    `Bootstrap packs: total=${summary.totalBootstrapPacks}, ready=${summary.readyForAuthoringCount}, blocked_governance=${summary.blockedGovernanceCount}, blocked_source=${summary.blockedSourceCount}`,
  )
}

run()
