import fs from 'node:fs'
import path from 'node:path'

type ItemType = 'herb_page' | 'compound_page' | 'collection_page' | 'comparison_page' | 'discovery_surface' | 'recommendation_surface'
type PriorityLabel = 'do_now' | 'next_wave' | 're_review_needed' | 'governance_fix_needed' | 'low_priority' | 'defer'
type TopicType = 'evidence' | 'safety' | 'mechanism' | 'constituent' | 'source_registry' | 'surface_coverage'
type SourceGapType =
  | 'missing_source_coverage_by_topic'
  | 'weak_source_diversity'
  | 'lack_of_safety_sources'
  | 'lack_of_mechanism_sources'
  | 'overreliance_single_source_class'
  | 'missing_modern_human_evidence'
  | 'traditional_or_preclinical_only'
  | 'inactive_registered_sources'

type IntakeTier = 'must_have_publish_blocking' | 'high_value_strengthening' | 'optional_supporting' | 'defer_until_later'
type IntakeStatus = 'queued_for_acquisition' | 'ready_for_registry_review' | 'deferred'

type SourceGapItem = {
  gapId: string
  itemType: ItemType
  entitySlug: string | null
  surfaceId: string | null
  priorityLabel: PriorityLabel
  topicType: TopicType
  sourceGapType: SourceGapType
  currentSourceClasses: string[]
  recommendedSourceClasses: string[]
  safetyCritical: boolean
  publishBlocking: boolean
  relatedWorkpackIds: string[]
  notesForContractor: string
  bucket: string
}

type SourceGapReport = {
  generatedAt: string
  deterministicModelVersion: string
  gapItems: SourceGapItem[]
}

type Workpack = {
  workpackId: string
  requiredGovernanceChecks: string[]
  reviewerNeeded: boolean
  completionCriteria: string[]
  reviewCycleState: string
  blockedReasons: string[]
}

type WorkpackReport = {
  generatedAt: string
  workpacks: Workpack[]
}

type SourceRegistryRow = {
  sourceId: string
  sourceClass: string
  sourceType: string
  evidenceClass: string
  organization?: string
  active: boolean
}

type SourceIntakeTask = {
  intakeTaskId: string
  itemType: ItemType
  entitySlug: string | null
  surfaceId: string | null
  relatedWorkpackIds: string[]
  topicType: TopicType
  sourceGapType: SourceGapType
  priorityLabel: PriorityLabel
  acquisitionTier: IntakeTier
  safetyCritical: boolean
  publishBlocking: boolean
  recommendedSourceClasses: string[]
  recommendedOrganizations: string[]
  recommendedStudyDesigns: string[]
  whyThisSourceMatters: string
  minimumAcceptanceCriteria: string[]
  duplicateRiskNotes: string
  reviewerNeeded: boolean
  requiredGovernanceChecksBeforeRegistryEntry: string[]
  status: IntakeStatus
  notesForContractor: string
}

type SourceIntakeQueueReport = {
  generatedAt: string
  deterministicModelVersion: string
  sources: {
    sourceGaps: string
    enrichmentWorkpacks: string
    sourceRegistry: string
  }
  sourceGapAudit: {
    fieldsPresentInSourceGaps: string[]
    fieldsNeededForActionableIntakeTasks: string[]
    missingFromSourceGapItems: string[]
  }
  summary: {
    totalTasks: number
    byTier: Record<IntakeTier, number>
    publishBlockingCount: number
    safetyCriticalCount: number
    reviewerNeededCount: number
    byTopicType: Record<TopicType, number>
  }
  tasks: SourceIntakeTask[]
}

const ROOT = process.cwd()
const SOURCE_GAPS_PATH = path.join(ROOT, 'ops', 'reports', 'source-gaps.json')
const WORKPACKS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'source-intake-queue.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'source-intake-queue.md')

const SOURCE_CLASS_ORGANIZATIONS: Record<string, string[]> = {
  'randomized-human-trial': ['ClinicalTrials.gov', 'PubMed', 'Cochrane Library'],
  'non-randomized-human-study': ['PubMed', 'WHO ICTRP', 'OpenAlex'],
  'observational-human-evidence': ['PubMed', 'NIH/NCCIH', 'OpenAlex'],
  'systematic-review-meta-analysis': ['Cochrane Library', 'PubMed', 'JBI Evidence Synthesis'],
  'preclinical-mechanistic-study': ['PubMed', 'EMBL-EBI ChEMBL', 'NCBI PubChem'],
  'traditional-use-monograph': ['WHO Monographs', 'EMA HMPC', 'Commission E'],
  'regulatory-agency-monograph-guidance': ['NIH ODS', 'EMA HMPC', 'Health Canada NHP', 'WHO Monographs'],
  'reference-database-authority': ['Natural Medicines', 'Drugs.com Interaction Checker', 'PubChem'],
}

const SOURCE_CLASS_STUDY_DESIGNS: Record<string, string[]> = {
  'randomized-human-trial': ['randomized-controlled-trial'],
  'non-randomized-human-study': ['non-randomized-trial', 'cohort'],
  'observational-human-evidence': ['cohort', 'case-control', 'cross-sectional'],
  'systematic-review-meta-analysis': ['systematic-review', 'meta-analysis'],
  'preclinical-mechanistic-study': ['in-vitro', 'in-vivo-animal'],
  'traditional-use-monograph': ['narrative-monograph'],
  'regulatory-agency-monograph-guidance': ['regulatory-guidance'],
  'reference-database-authority': ['database-reference'],
}

const GAP_WHY_MATTERS: Partial<Record<SourceGapType, string>> = {
  missing_modern_human_evidence:
    'Modern human evidence is needed to support publishable supported-use claims and reduce overreliance on indirect evidence.',
  lack_of_safety_sources:
    'Safety-critical claims require higher-authority references to support contraindications, interactions, and caution language.',
  lack_of_mechanism_sources:
    'Mechanism and constituent sections require specific mechanistic or chemistry references to explain plausibility and limitations.',
  traditional_or_preclinical_only:
    'Current coverage is limited to traditional or preclinical evidence and should be strengthened with modern human evidence before stronger claims.',
  overreliance_single_source_class:
    'Diversity across source classes reduces fragility and helps resolve conflicts across outcomes and populations.',
  missing_source_coverage_by_topic:
    'This topic has no adequate active source coverage and needs baseline references before enrichment can be considered complete.',
  weak_source_diversity: 'Coverage is too narrow and should be widened with complementary source classes.',
  inactive_registered_sources: 'Inactive references cannot support publishable enrichment; replacement active sources are required.',
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function stableId(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase()
}

function dedupe<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

function classifyTier(gap: SourceGapItem): IntakeTier {
  if (gap.publishBlocking) return 'must_have_publish_blocking'
  if (gap.safetyCritical || gap.sourceGapType === 'missing_modern_human_evidence' || gap.priorityLabel === 'do_now') {
    return 'high_value_strengthening'
  }
  if (gap.priorityLabel === 'defer' || gap.bucket === 'defer_until_sources_available') return 'defer_until_later'
  if (gap.sourceGapType === 'weak_source_diversity' || gap.sourceGapType === 'overreliance_single_source_class') {
    return 'optional_supporting'
  }
  return 'high_value_strengthening'
}

function orderedSeverity(tier: IntakeTier): number {
  if (tier === 'must_have_publish_blocking') return 0
  if (tier === 'high_value_strengthening') return 1
  if (tier === 'optional_supporting') return 2
  return 3
}

function governanceChecksForTask(workpackIds: string[], workpackById: Map<string, Workpack>): string[] {
  const checks = new Set<string>(['verify:source-registry'])
  for (const id of workpackIds) {
    const workpack = workpackById.get(id)
    if (!workpack) continue
    for (const check of workpack.requiredGovernanceChecks || []) checks.add(check)
  }
  return Array.from(checks).sort()
}

function minimumCriteriaForTask(args: {
  gap: SourceGapItem
  tier: IntakeTier
  recommendedSourceClasses: string[]
}): string[] {
  const { gap, tier, recommendedSourceClasses } = args
  const criteria = new Set<string>([
    'Capture required source registry metadata: title, sourceType, sourceClass, evidenceClass, language, publicationStatus, reliabilityTier, reviewer, reviewedAt, active.',
    'Include at least one primary identifier: DOI, PMID, canonical URL, or monograph ID before registry review.',
    'Map the source to the target topic and entity/surface in notes so reviewers can trace why it was acquired.',
  ])

  if (tier === 'must_have_publish_blocking' || gap.safetyCritical) {
    criteria.add('Use active published sources only; exclude withdrawn/superseded references for safety-critical decisions.')
    criteria.add('Provide at least one tier-a or tier-b source for safety-critical or publish-blocking tasks.')
  }

  if (recommendedSourceClasses.includes('randomized-human-trial')) {
    criteria.add('For human-claim support, include human-clinical or human-observational evidenceClass with studyDesign matching trial/observational methods.')
  }

  if (recommendedSourceClasses.includes('regulatory-agency-monograph-guidance')) {
    criteria.add('For safety/regulatory context, include jurisdiction and organization metadata (agency/monograph owner).')
  }

  if (recommendedSourceClasses.includes('preclinical-mechanistic-study')) {
    criteria.add('For mechanism/constituent support, include explicit mechanism relevance in notes and a preclinical-mechanistic evidenceClass entry.')
  }

  criteria.add('Reject duplicate candidates that repeat an existing active source with equivalent DOI/PMID/canonical URL and no stronger methodology.')

  return Array.from(criteria)
}

function duplicateRiskNotes(gap: SourceGapItem, registry: SourceRegistryRow[]): string {
  const recommended = new Set(gap.recommendedSourceClasses)
  const matchingActive = registry.filter(source => source.active && recommended.has(source.sourceClass)).length
  if (matchingActive === 0) {
    return 'Low duplicate risk: no active registry sources currently match the recommended source classes.'
  }
  if (matchingActive < 4) {
    return `Moderate duplicate risk: ${matchingActive} active source(s) already match recommended classes; verify DOI/PMID/URL uniqueness before proposing additions.`
  }
  return `High duplicate risk: ${matchingActive} active sources already match recommended classes; prioritize methodologically stronger or newer references only.`
}

function mergeOrganizations(recommendedClasses: string[]): string[] {
  return dedupe(recommendedClasses.flatMap(sourceClass => SOURCE_CLASS_ORGANIZATIONS[sourceClass] || [])).sort()
}

function mergeStudyDesigns(recommendedClasses: string[]): string[] {
  return dedupe(recommendedClasses.flatMap(sourceClass => SOURCE_CLASS_STUDY_DESIGNS[sourceClass] || [])).sort()
}

function statusForTier(tier: IntakeTier): IntakeStatus {
  return tier === 'defer_until_later' ? 'deferred' : 'queued_for_acquisition'
}

function reviewerNeeded(gap: SourceGapItem, workpackIds: string[], workpackById: Map<string, Workpack>): boolean {
  if (gap.safetyCritical || gap.publishBlocking) return true
  for (const id of workpackIds) {
    if (workpackById.get(id)?.reviewerNeeded) return true
  }
  return false
}

function run() {
  const gapReport = readJson<SourceGapReport>(SOURCE_GAPS_PATH)
  const workpackReport = readJson<WorkpackReport>(WORKPACKS_PATH)
  const sourceRegistry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)

  const workpackById = new Map(workpackReport.workpacks.map(workpack => [workpack.workpackId, workpack]))

  const tasks: SourceIntakeTask[] = gapReport.gapItems
    .map(gap => {
      const tier = classifyTier(gap)
      const workpackIds = dedupe(gap.relatedWorkpackIds).sort()
      const recommendedSourceClasses = dedupe(gap.recommendedSourceClasses).sort()
      const target = gap.entitySlug || gap.surfaceId || 'unknown-target'
      const intakeTaskId = `intake_${stableId(gap.gapId)}_${stableId(tier)}`
      const whyThisSourceMatters =
        GAP_WHY_MATTERS[gap.sourceGapType] ||
        `Source coverage should be improved for ${gap.topicType} so this target can pass deterministic governance checks.`

      return {
        intakeTaskId,
        itemType: gap.itemType,
        entitySlug: gap.entitySlug,
        surfaceId: gap.surfaceId,
        relatedWorkpackIds: workpackIds,
        topicType: gap.topicType,
        sourceGapType: gap.sourceGapType,
        priorityLabel: gap.priorityLabel,
        acquisitionTier: tier,
        safetyCritical: gap.safetyCritical,
        publishBlocking: gap.publishBlocking,
        recommendedSourceClasses,
        recommendedOrganizations: mergeOrganizations(recommendedSourceClasses),
        recommendedStudyDesigns: mergeStudyDesigns(recommendedSourceClasses),
        whyThisSourceMatters,
        minimumAcceptanceCriteria: minimumCriteriaForTask({ gap, tier, recommendedSourceClasses }),
        duplicateRiskNotes: duplicateRiskNotes(gap, sourceRegistry),
        reviewerNeeded: reviewerNeeded(gap, workpackIds, workpackById),
        requiredGovernanceChecksBeforeRegistryEntry: governanceChecksForTask(workpackIds, workpackById),
        status: statusForTier(tier),
        notesForContractor: `${gap.notesForContractor} Treat this as an intake-planning task only; registry entry still requires governance review. Target: ${target}.`,
      }
    })
    .sort((a, b) => {
      const tierDiff = orderedSeverity(a.acquisitionTier) - orderedSeverity(b.acquisitionTier)
      if (tierDiff !== 0) return tierDiff
      if (a.safetyCritical !== b.safetyCritical) return a.safetyCritical ? -1 : 1
      if (a.publishBlocking !== b.publishBlocking) return a.publishBlocking ? -1 : 1
      return a.intakeTaskId.localeCompare(b.intakeTaskId)
    })

  const byTopicType: Record<TopicType, number> = {
    evidence: 0,
    safety: 0,
    mechanism: 0,
    constituent: 0,
    source_registry: 0,
    surface_coverage: 0,
  }

  for (const task of tasks) byTopicType[task.topicType] += 1

  const fieldsPresent = tasks.length > 0 ? Object.keys(gapReport.gapItems[0] || {}).sort() : []
  const requiredForIntake = [
    'gapId',
    'itemType',
    'entitySlug/surfaceId',
    'relatedWorkpackIds',
    'topicType',
    'sourceGapType',
    'priorityLabel',
    'safetyCritical',
    'publishBlocking',
    'recommendedSourceClasses',
    'recommendedOrganizations',
    'recommendedStudyDesigns',
    'whyThisSourceMatters',
    'minimumAcceptanceCriteria',
    'duplicateRiskNotes',
    'reviewerNeeded',
    'status',
    'requiredGovernanceChecksBeforeRegistryEntry',
    'notesForContractor',
  ]

  const missingFromGapItems = [
    'recommendedOrganizations',
    'recommendedStudyDesigns',
    'whyThisSourceMatters',
    'minimumAcceptanceCriteria',
    'duplicateRiskNotes',
    'requiredGovernanceChecksBeforeRegistryEntry',
  ]

  const report: SourceIntakeQueueReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-intake-queue-v1',
    sources: {
      sourceGaps: path.relative(ROOT, SOURCE_GAPS_PATH),
      enrichmentWorkpacks: path.relative(ROOT, WORKPACKS_PATH),
      sourceRegistry: path.relative(ROOT, SOURCE_REGISTRY_PATH),
    },
    sourceGapAudit: {
      fieldsPresentInSourceGaps: fieldsPresent,
      fieldsNeededForActionableIntakeTasks: requiredForIntake,
      missingFromSourceGapItems: missingFromGapItems,
    },
    summary: {
      totalTasks: tasks.length,
      byTier: {
        must_have_publish_blocking: tasks.filter(task => task.acquisitionTier === 'must_have_publish_blocking').length,
        high_value_strengthening: tasks.filter(task => task.acquisitionTier === 'high_value_strengthening').length,
        optional_supporting: tasks.filter(task => task.acquisitionTier === 'optional_supporting').length,
        defer_until_later: tasks.filter(task => task.acquisitionTier === 'defer_until_later').length,
      },
      publishBlockingCount: tasks.filter(task => task.publishBlocking).length,
      safetyCriticalCount: tasks.filter(task => task.safetyCritical).length,
      reviewerNeededCount: tasks.filter(task => task.reviewerNeeded).length,
      byTopicType,
    },
    tasks,
  }

  const md: string[] = [
    '# Source Intake Queue',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Intake triage summary',
    `- totalTasks: ${report.summary.totalTasks}`,
    ...Object.entries(report.summary.byTier).map(([tier, count]) => `- ${tier}: ${count}`),
    `- publishBlockingCount: ${report.summary.publishBlockingCount}`,
    `- safetyCriticalCount: ${report.summary.safetyCriticalCount}`,
    `- reviewerNeededCount: ${report.summary.reviewerNeededCount}`,
    '',
    '## Gap-to-intake audit',
    `- fields present in source gaps: ${report.sourceGapAudit.fieldsPresentInSourceGaps.join(', ')}`,
    `- additional intake planning fields generated here: ${report.sourceGapAudit.missingFromSourceGapItems.join(', ')}`,
    '',
    '## Priority handling rules',
    '- must_have_publish_blocking: source must be acquired and pass governance checks before publish progression.',
    '- high_value_strengthening: strong candidate to improve confidence and reduce uncertainty but may not block all publication paths.',
    '- optional_supporting: adds breadth/diversity; pursue after must-have/high-value queues.',
    '- defer_until_later: track only; do not pull forward without explicit reprioritization.',
    '',
    '## Top intake tasks (first 40)',
    '| intakeTaskId | tier | target | topic | gap | source classes | reviewer | governance checks |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const task of report.tasks.slice(0, 40)) {
    md.push(
      `| ${task.intakeTaskId} | ${task.acquisitionTier} | ${task.entitySlug || task.surfaceId || '-'} | ${task.topicType} | ${task.sourceGapType} | ${task.recommendedSourceClasses.join(', ')} | ${task.reviewerNeeded ? 'yes' : 'no'} | ${task.requiredGovernanceChecksBeforeRegistryEntry.join(', ')} |`,
    )
  }

  md.push('', '## Contractor guidance', '')
  md.push('- Do not add candidate sources directly to publishable claims before source-registry + governance checks pass.')
  md.push('- Use minimumAcceptanceCriteria on each intake task to pre-screen candidate sources before reviewer handoff.')
  md.push('- For safety-critical tasks, escalate to reviewer and keep evidence language conservative until approved.')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(
    `Tasks=${report.summary.totalTasks} mustHave=${report.summary.byTier.must_have_publish_blocking} safetyCritical=${report.summary.safetyCriticalCount}`,
  )
}

run()
