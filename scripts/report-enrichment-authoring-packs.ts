import fs from 'node:fs'
import path from 'node:path'

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

type SourceClass =
  | 'randomized-human-trial'
  | 'non-randomized-human-study'
  | 'observational-human-evidence'
  | 'systematic-review-meta-analysis'
  | 'preclinical-mechanistic-study'
  | 'traditional-use-monograph'
  | 'regulatory-agency-monograph-guidance'
  | 'reference-database-authority'

type EvidenceClass =
  | 'human-clinical'
  | 'human-observational'
  | 'preclinical-mechanistic'
  | 'traditional-use'
  | 'regulatory-monograph'

type BootstrapPack = {
  bootstrapPackId: string
  workpackId: string
  entityType: EntityType
  entitySlug: string | null
  surfaceId: string | null
  sourceId: string
  sourceClass: SourceClass
  evidenceClass: EvidenceClass
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

type BootstrapReport = {
  generatedAt: string
  bootstrapPacks: BootstrapPack[]
}

type SourceRegistryRow = {
  sourceId: string
  sourceClass: SourceClass
  evidenceClass: EvidenceClass
  publicationStatus: 'published' | 'preprint' | 'withdrawn' | 'superseded' | 'archived'
  active: boolean
  reviewer: string
  reviewedAt: string
}

type TopicArea =
  | 'supported_uses'
  | 'unsupported_or_unclear_uses'
  | 'safety_interactions'
  | 'contraindications_adverse_effects'
  | 'population_specific_notes'
  | 'mechanisms_constituents'
  | 'research_gaps_conflict_notes'

type EntryTemplate = {
  templateId: string
  topicArea: TopicArea
  topicType: TopicType
  claimType: ClaimType
  title: string
  scaffoldChecklist: string[]
  blockedClaimFraming: string[]
}

type AuthoringPack = {
  authoringPackId: string
  bootstrapPackId: string
  workpackId: string
  entityType: EntityType
  entitySlug: string | null
  surfaceId: string | null
  sourceId: string
  sourceClass: SourceClass
  evidenceClass: EvidenceClass
  allowedTopicTypes: TopicType[]
  allowedClaimTypes: ClaimType[]
  requiredEntryFields: string[]
  requiredGovernanceChecks: string[]
  blockedTopicTypes: TopicType[]
  blockedFramingNotes: string[]
  entryTemplates: EntryTemplate[]
  completionCriteria: string[]
  reviewerNeeded: boolean
  status: 'ready_for_authoring' | 'blocked_source' | 'blocked_governance' | 'blocked_policy'
  notesForContractor: string
}

const ROOT = process.cwd()
const BOOTSTRAP_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-bootstrap-packs.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-authoring-packs.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-authoring-packs.md')

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

const TOPIC_AREA_BY_TYPE: Record<TopicType, TopicArea> = {
  supported_use: 'supported_uses',
  unsupported_or_unclear_use: 'unsupported_or_unclear_uses',
  interaction: 'safety_interactions',
  contraindication: 'contraindications_adverse_effects',
  adverse_effect: 'contraindications_adverse_effects',
  pregnancy_note: 'population_specific_notes',
  lactation_note: 'population_specific_notes',
  pediatric_note: 'population_specific_notes',
  geriatric_note: 'population_specific_notes',
  condition_caution: 'population_specific_notes',
  surgery_caution: 'population_specific_notes',
  medication_class_caution: 'population_specific_notes',
  population_specific_note: 'population_specific_notes',
  mechanism: 'mechanisms_constituents',
  constituent: 'mechanisms_constituents',
  pathway: 'mechanisms_constituents',
  receptor_activity: 'mechanisms_constituents',
  enzyme_interaction: 'mechanisms_constituents',
  transporter_interaction: 'mechanisms_constituents',
  constituent_relationship: 'mechanisms_constituents',
  herb_compound_link: 'mechanisms_constituents',
  compound_origin_note: 'mechanisms_constituents',
  conflict_note: 'research_gaps_conflict_notes',
  research_gap: 'research_gaps_conflict_notes',
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

function stableId(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase()
}

function sortTopicTypes(values: TopicType[]): TopicType[] {
  return [...values].sort((a, b) => a.localeCompare(b))
}

function sourcePolicyBlocked(source: SourceRegistryRow): string[] {
  const reasons: string[] = []
  if (!source.active) reasons.push('source_not_active')
  if (!source.reviewer || !source.reviewedAt) reasons.push('missing_registry_review_metadata')
  if (['withdrawn', 'superseded', 'archived'].includes(source.publicationStatus)) reasons.push('publication_status_blocked')
  return reasons
}

function buildBlockedFramingNotes(pack: BootstrapPack): string[] {
  const notes = new Set<string>([
    'Do not auto-publish, auto-approve, or present this scaffold as a final public claim.',
    'Do not add unsupported free-text claims outside normalized enrichment entry fields.',
  ])

  if (pack.sourceClass === 'preclinical-mechanistic-study') {
    notes.add('Do not frame preclinical results as strong human efficacy support.')
  }

  if (pack.sourceClass === 'traditional-use-monograph') {
    notes.add('Do not convert traditional-use context into modern clinical efficacy wording.')
  }

  if (pack.candidateTopicTypes.some(topic => SAFETY_TOPICS.has(topic))) {
    notes.add('Safety-critical entries must include uncertainty qualifiers and evidence-grade-aware language.')
  }

  if (pack.sourceClass !== 'regulatory-agency-monograph-guidance' && pack.candidateTopicTypes.some(topic => SAFETY_TOPICS.has(topic))) {
    notes.add('Safety-critical topics should not be finalized without at least one regulatory or authority-class corroborating source.')
  }

  return Array.from(notes)
}

function requiredEntryFields(pack: BootstrapPack): string[] {
  const fields = new Set<string>([
    'entryId',
    'entityType',
    'entitySlug|surfaceId',
    'topicType',
    'claimType',
    'sourceId',
    'evidenceClass',
    'findingTextShort',
    'findingTextNormalized',
    'confidenceLabel',
    'uncertaintyNotes',
    'reviewer',
    'reviewedAt',
    'editorialStatus',
    'active',
  ])

  if (pack.candidateTopicTypes.includes('conflict_note') || pack.candidateTopicTypes.includes('research_gap')) {
    fields.add('conflictState|researchGapTag')
  }

  if (pack.candidateTopicTypes.some(topic => SAFETY_TOPICS.has(topic))) {
    fields.add('severityLabel')
    fields.add('populationScope')
  }

  return Array.from(fields).sort()
}

function templateTitle(topic: TopicType): string {
  const text = topic.replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function templateBlockedFraming(pack: BootstrapPack): string[] {
  const blocked = ['Avoid certainty language ("proves", "cures", "guarantees") without evidence-grade support.']
  if (pack.sourceClass === 'preclinical-mechanistic-study') {
    blocked.push('Avoid human-outcome efficacy framing from preclinical-only evidence.')
  }
  if (pack.sourceClass === 'traditional-use-monograph') {
    blocked.push('Avoid modern efficacy endorsements sourced only from traditional-use references.')
  }
  if (pack.evidenceClass === 'human-observational') {
    blocked.push('Avoid causality wording; observational evidence supports association framing only.')
  }
  return blocked
}

function entryTemplates(pack: BootstrapPack): EntryTemplate[] {
  const byTopic = new Map(pack.suggestedEntrySkeletons.map(item => [item.topicType, item]))
  return sortTopicTypes(pack.candidateTopicTypes).map(topicType => {
    const seed = byTopic.get(topicType)
    return {
      templateId: `tpl_${stableId(pack.bootstrapPackId)}_${stableId(topicType)}`,
      topicArea: TOPIC_AREA_BY_TYPE[topicType],
      topicType,
      claimType: seed?.claimType ?? pack.candidateClaimTypes[0] ?? 'research_gap',
      title: `${templateTitle(topicType)} scaffold`,
      scaffoldChecklist: [
        ...(seed?.skeletonChecklist ?? []),
        'Include only source-grounded language; keep unknowns explicit instead of inferred claims.',
        'Capture review metadata and keep editorialStatus in draft/needs_review until human review.',
      ],
      blockedClaimFraming: templateBlockedFraming(pack),
    }
  })
}

function buildAuthoringPack(pack: BootstrapPack, sourceById: Map<string, SourceRegistryRow>): AuthoringPack {
  const source = sourceById.get(pack.sourceId)
  const policyBlocks = source ? sourcePolicyBlocked(source) : ['missing_source_registry_record']
  const status: AuthoringPack['status'] =
    policyBlocks.length > 0 ? 'blocked_policy' : pack.status === 'ready_for_authoring' ? 'ready_for_authoring' : pack.status

  const allowedTopicTypes = sortTopicTypes(pack.candidateTopicTypes)
  const requiredGovernanceChecks = dedupe([...pack.requiredGovernanceChecks, 'verify:source-registry', 'enrichment:validate:normalized']).sort()

  const completionCriteria = dedupe([
    ...pack.completionCriteria,
    'All requiredEntryFields are complete for each template-derived normalized entry.',
    'Required governance checks pass and reviewer metadata is complete before review handoff.',
    'Public rendering remains blocked until editorial review + publish gating approval is complete.',
  ])

  return {
    authoringPackId: `ap_${stableId(pack.bootstrapPackId)}`,
    bootstrapPackId: pack.bootstrapPackId,
    workpackId: pack.workpackId,
    entityType: pack.entityType,
    entitySlug: pack.entitySlug,
    surfaceId: pack.surfaceId,
    sourceId: pack.sourceId,
    sourceClass: pack.sourceClass,
    evidenceClass: pack.evidenceClass,
    allowedTopicTypes,
    allowedClaimTypes: dedupe(pack.candidateClaimTypes).sort(),
    requiredEntryFields: requiredEntryFields(pack),
    requiredGovernanceChecks,
    blockedTopicTypes: sortTopicTypes(pack.blockedTopicTypes),
    blockedFramingNotes: [...buildBlockedFramingNotes(pack), ...policyBlocks.map(reason => `Policy block: ${reason}`)],
    entryTemplates: entryTemplates(pack),
    completionCriteria,
    reviewerNeeded: pack.reviewerNeeded || allowedTopicTypes.some(topic => SAFETY_TOPICS.has(topic)),
    status,
    notesForContractor:
      `${pack.notesForContractor} Allowed topics and templates are scoped to this source class/evidence class; final public claims remain gated pending review.`,
  }
}

function run() {
  if (!fs.existsSync(BOOTSTRAP_PATH)) {
    throw new Error('Missing ops/reports/enrichment-bootstrap-packs.json. Run npm run report:enrichment-bootstrap-packs first.')
  }

  const bootstrap = readJson<BootstrapReport>(BOOTSTRAP_PATH)
  const registry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)
  const sourceById = new Map(registry.map(source => [source.sourceId, source]))

  const packs = bootstrap.bootstrapPacks.map(pack => buildAuthoringPack(pack, sourceById))

  packs.sort((a, b) => {
    if (a.status !== b.status) return a.status.localeCompare(b.status)
    if (a.workpackId !== b.workpackId) return a.workpackId.localeCompare(b.workpackId)
    return a.authoringPackId.localeCompare(b.authoringPackId)
  })

  const summary = {
    totalAuthoringPacks: packs.length,
    readyForAuthoringCount: packs.filter(pack => pack.status === 'ready_for_authoring').length,
    blockedGovernanceCount: packs.filter(pack => pack.status === 'blocked_governance').length,
    blockedSourceCount: packs.filter(pack => pack.status === 'blocked_source').length,
    blockedPolicyCount: packs.filter(pack => pack.status === 'blocked_policy').length,
    reviewerNeededCount: packs.filter(pack => pack.reviewerNeeded).length,
    byTopicArea: Object.fromEntries(
      (
        [
          'supported_uses',
          'unsupported_or_unclear_uses',
          'safety_interactions',
          'contraindications_adverse_effects',
          'population_specific_notes',
          'mechanisms_constituents',
          'research_gaps_conflict_notes',
        ] as TopicArea[]
      ).map(topicArea => [topicArea, packs.filter(pack => pack.entryTemplates.some(template => template.topicArea === topicArea)).length]),
    ),
  }

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-authoring-packs-v1',
    sources: {
      enrichmentBootstrapPacks: path.relative(ROOT, BOOTSTRAP_PATH),
      sourceRegistry: path.relative(ROOT, SOURCE_REGISTRY_PATH),
    },
    bootstrapAudit: {
      contractorNeedsAddressed: [
        'Deterministic allowedTopicTypes/allowedClaimTypes scope by source class and evidence class.',
        'Required entry field list for normalized enrichment entries, including reviewer metadata and uncertainty scaffolding.',
        'Blocked framing notes that prevent overclaiming (preclinical/traditional constraints and safety-sensitive wording controls).',
        'Completion criteria that define handoff readiness without bypassing editorial review/publish gating.',
      ],
      hardStops: [
        'Blocked/deprecated/unapproved source rows remain policy-blocked in authoring packs.',
        'Authoring packs cannot be treated as publishable claims or auto-approval instructions.',
        'Safety-critical entries still require reviewer metadata and governance checks before rendering.',
      ],
    },
    summary,
    authoringPacks: packs,
  }

  const md: string[] = [
    '# Enrichment Authoring Packs',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    `- totalAuthoringPacks: ${summary.totalAuthoringPacks}`,
    `- readyForAuthoring: ${summary.readyForAuthoringCount}`,
    `- blockedGovernance: ${summary.blockedGovernanceCount}`,
    `- blockedSource: ${summary.blockedSourceCount}`,
    `- blockedPolicy: ${summary.blockedPolicyCount}`,
    `- reviewerNeeded: ${summary.reviewerNeededCount}`,
    '',
    '## Topic area coverage',
    ...Object.entries(summary.byTopicArea).map(([topicArea, count]) => `- ${topicArea}: ${count}`),
    '',
    '## Contractor and reviewer guidance',
    '- Authoring packs are normalized-entry scaffolds only; they do not create publishable claims.',
    '- Respect blocked topic types and blocked framing notes; do not upgrade evidence framing beyond source/evidence class limits.',
    '- Completion means authoring + metadata + governance readiness, not public rendering approval.',
    '',
    '## Top authoring packs (first 40)',
    '| authoringPackId | bootstrapPackId | workpackId | target | sourceClass | status | allowed topics | blocked topics |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const pack of packs.slice(0, 40)) {
    const target = pack.entitySlug || pack.surfaceId || '-'
    md.push(
      `| ${pack.authoringPackId} | ${pack.bootstrapPackId} | ${pack.workpackId} | ${target} | ${pack.sourceClass} | ${pack.status} | ${pack.allowedTopicTypes.join(', ') || '-'} | ${pack.blockedTopicTypes.join(', ') || '-'} |`,
    )
  }

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(
    `Authoring packs: total=${summary.totalAuthoringPacks}, ready=${summary.readyForAuthoringCount}, blocked_policy=${summary.blockedPolicyCount}`,
  )
}

run()
