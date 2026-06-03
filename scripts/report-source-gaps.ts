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

type GapBucket =
  | 'source_needed_now'
  | 'safety_source_needed'
  | 'human_evidence_gap'
  | 'mechanism_source_gap'
  | 'traditional_only_gap'
  | 'defer_until_sources_available'

type SourceRegistryRow = {
  sourceId: string
  sourceClass: string
  evidenceClass: string
  sourceType: string
  active: boolean
}

type Workpack = {
  workpackId: string
  itemType: ItemType
  entitySlug: string | null
  surfaceId: string | null
  priorityLabel: PriorityLabel
  operationalBucket: 'governance_fix' | 'do_now' | 're_review' | 'next_wave' | 'defer'
  reviewCycleState: string
  missingTopics: string[]
  blockedReasons: string[]
  availableSourceIds: string[]
}

type WorkpackReport = {
  generatedAt: string
  workpacks: Workpack[]
}

type GapItem = {
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
  bucket: GapBucket
}

type SourceGapReport = {
  generatedAt: string
  deterministicModelVersion: string
  sources: {
    sourceRegistry: string
    enrichmentWorkpacks: string
    publicationManifest: string
  }
  summary: {
    totalGapItems: number
    byBucket: Record<GapBucket, number>
    bySourceGapType: Record<SourceGapType, number>
    publishBlockingCount: number
    safetyCriticalCount: number
  }
  buckets: Record<GapBucket, GapItem[]>
  gapItems: GapItem[]
}

type Manifest = {
  entities?: {
    herbs?: Array<{ slug: string }>
    compounds?: Array<{ slug: string }>
  }
}

const ROOT = process.cwd()
const WORKPACKS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const PUBLICATION_MANIFEST_PATH = path.join(ROOT, 'public', 'data', 'publication-manifest.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'source-gaps.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'source-gaps.md')

const HUMAN_EVIDENCE_CLASSES = new Set(['human-clinical', 'human-observational'])
const HUMAN_SOURCE_CLASSES = new Set([
  'randomized-human-trial',
  'non-randomized-human-study',
  'observational-human-evidence',
  'systematic-review-meta-analysis',
])
const SAFETY_SOURCE_CLASSES = new Set([
  'regulatory-agency-monograph-guidance',
  'reference-database-authority',
  'systematic-review-meta-analysis',
])
const MECHANISM_SOURCE_CLASSES = new Set(['preclinical-mechanistic-study'])
const TRADITIONAL_SOURCE_CLASSES = new Set(['traditional-use-monograph'])

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function stableId(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase()
}

function normalizeTopic(topic: string): TopicType {
  if (topic === 'evidence' || topic === 'safety' || topic === 'mechanism' || topic === 'constituent' || topic === 'source_registry') {
    return topic
  }
  return 'surface_coverage'
}

function recommendedClassesFor(topic: TopicType, gapType: SourceGapType): string[] {
  if (topic === 'safety' || gapType === 'lack_of_safety_sources') {
    return ['regulatory-agency-monograph-guidance', 'systematic-review-meta-analysis']
  }

  if (topic === 'mechanism' || topic === 'constituent' || gapType === 'lack_of_mechanism_sources') {
    return ['preclinical-mechanistic-study', 'reference-database-authority']
  }

  if (gapType === 'missing_modern_human_evidence' || gapType === 'traditional_or_preclinical_only') {
    return ['randomized-human-trial', 'systematic-review-meta-analysis']
  }

  return ['systematic-review-meta-analysis', 'randomized-human-trial', 'regulatory-agency-monograph-guidance']
}

function bucketForGap(args: {
  gapType: SourceGapType
  topicType: TopicType
  priorityLabel: PriorityLabel
  publishBlocking: boolean
  safetyCritical: boolean
}): GapBucket {
  const { gapType, topicType, priorityLabel, publishBlocking, safetyCritical } = args

  if (safetyCritical || topicType === 'safety' || gapType === 'lack_of_safety_sources') return 'safety_source_needed'
  if (gapType === 'missing_modern_human_evidence') return 'human_evidence_gap'
  if (gapType === 'traditional_or_preclinical_only') return 'traditional_only_gap'
  if (topicType === 'mechanism' || topicType === 'constituent' || gapType === 'lack_of_mechanism_sources') {
    return 'mechanism_source_gap'
  }
  if (priorityLabel === 'defer' && !publishBlocking) return 'defer_until_sources_available'
  return 'source_needed_now'
}

function dedupe<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

function run() {
  const workpacks = readJson<WorkpackReport>(WORKPACKS_PATH)
  const sourceRegistry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)
  const manifest = readJson<Manifest>(PUBLICATION_MANIFEST_PATH)

  const sourceById = new Map(sourceRegistry.map(source => [source.sourceId, source]))
  const indexableEntities = new Set<string>([
    ...(manifest.entities?.herbs || []).map(row => `herb:${row.slug.toLowerCase()}`),
    ...(manifest.entities?.compounds || []).map(row => `compound:${row.slug.toLowerCase()}`),
  ])

  const gapItems: GapItem[] = []

  for (const workpack of workpacks.workpacks) {
    const referencedSources = workpack.availableSourceIds
      .map(sourceId => sourceById.get(sourceId))
      .filter((row): row is SourceRegistryRow => Boolean(row))

    const activeSources = referencedSources.filter(source => source.active)
    const currentSourceClasses = dedupe(referencedSources.map(source => source.sourceClass)).sort()
    const activeSourceClasses = dedupe(activeSources.map(source => source.sourceClass)).sort()
    const activeEvidenceClasses = dedupe(activeSources.map(source => source.evidenceClass)).sort()

    const hasHumanEvidence =
      activeSources.some(source => HUMAN_SOURCE_CLASSES.has(source.sourceClass)) ||
      activeSources.some(source => HUMAN_EVIDENCE_CLASSES.has(source.evidenceClass))

    const hasSafetySources =
      activeSources.some(source => SAFETY_SOURCE_CLASSES.has(source.sourceClass)) ||
      activeSources.some(source => source.evidenceClass === 'regulatory-monograph')

    const hasMechanismSources = activeSources.some(source => MECHANISM_SOURCE_CLASSES.has(source.sourceClass))
    const hasTraditionalOnly =
      activeSources.length > 0 &&
      activeSources.every(source => TRADITIONAL_SOURCE_CLASSES.has(source.sourceClass) || source.evidenceClass === 'traditional-use')

    const hasPreclinicalOnly =
      activeSources.length > 0 &&
      activeSources.every(source => source.evidenceClass === 'preclinical-mechanistic')

    const sourceDiversityWeak = activeSourceClasses.length > 0 && activeSourceClasses.length < 2
    const overrelianceSingleClass = activeSourceClasses.length === 1 && activeSources.length >= 2

    const targetId = workpack.entitySlug || workpack.surfaceId || 'unknown'
    const indexableKey =
      workpack.itemType === 'herb_page'
        ? `herb:${String(workpack.entitySlug || '').toLowerCase()}`
        : workpack.itemType === 'compound_page'
          ? `compound:${String(workpack.entitySlug || '').toLowerCase()}`
          : null
    const indexableEntity = indexableKey ? indexableEntities.has(indexableKey) : false

    const missingTopics = workpack.missingTopics.length > 0 ? workpack.missingTopics : ['source_registry']
    for (const topic of missingTopics) {
      const topicType = normalizeTopic(topic)

      let sourceGapType: SourceGapType = 'missing_source_coverage_by_topic'
      if (topicType === 'safety' && !hasSafetySources) sourceGapType = 'lack_of_safety_sources'
      else if ((topicType === 'mechanism' || topicType === 'constituent') && !hasMechanismSources) {
        sourceGapType = 'lack_of_mechanism_sources'
      } else if (topicType === 'evidence' && !hasHumanEvidence) {
        sourceGapType = hasTraditionalOnly || hasPreclinicalOnly ? 'traditional_or_preclinical_only' : 'missing_modern_human_evidence'
      } else if (sourceDiversityWeak) {
        sourceGapType = 'weak_source_diversity'
      }

      const safetyCritical = topicType === 'safety' || sourceGapType === 'lack_of_safety_sources'
      const publishBlocking =
        workpack.operationalBucket === 'governance_fix' ||
        workpack.reviewCycleState === 'depublish_or_hide_enriched_section' ||
        workpack.blockedReasons.length > 0 ||
        (indexableEntity && !hasHumanEvidence && topicType === 'evidence') ||
        (indexableEntity && safetyCritical)

      const gapId = `gap_${stableId(workpack.workpackId)}_${stableId(topicType)}_${stableId(sourceGapType)}`

      gapItems.push({
        gapId,
        itemType: workpack.itemType,
        entitySlug: workpack.entitySlug,
        surfaceId: workpack.surfaceId,
        priorityLabel: workpack.priorityLabel,
        topicType,
        sourceGapType,
        currentSourceClasses: currentSourceClasses.length > 0 ? currentSourceClasses : ['none_registered_or_active'],
        recommendedSourceClasses: recommendedClassesFor(topicType, sourceGapType),
        safetyCritical,
        publishBlocking,
        relatedWorkpackIds: [workpack.workpackId],
        notesForContractor: [
          `Target ${targetId} has topic gap in ${topicType}.`,
          `Current active evidence classes: ${activeEvidenceClasses.join(', ') || 'none'}.`,
          `Focus next sourcing on: ${recommendedClassesFor(topicType, sourceGapType).join(', ')}.`,
          publishBlocking
            ? 'This gap is publish-blocking under current governance and should be resolved before release.'
            : 'Partial enrichment is acceptable, but mark uncertainty and schedule follow-up sourcing.',
        ].join(' '),
        bucket: bucketForGap({
          gapType: sourceGapType,
          topicType,
          priorityLabel: workpack.priorityLabel,
          publishBlocking,
          safetyCritical,
        }),
      })
    }

    if (overrelianceSingleClass) {
      const topicType: TopicType = 'evidence'
      const sourceGapType: SourceGapType = 'overreliance_single_source_class'
      const publishBlocking = workpack.operationalBucket === 'governance_fix' || workpack.blockedReasons.length > 0
      const gapId = `gap_${stableId(workpack.workpackId)}_${stableId(sourceGapType)}`

      gapItems.push({
        gapId,
        itemType: workpack.itemType,
        entitySlug: workpack.entitySlug,
        surfaceId: workpack.surfaceId,
        priorityLabel: workpack.priorityLabel,
        topicType,
        sourceGapType,
        currentSourceClasses: activeSourceClasses,
        recommendedSourceClasses: ['systematic-review-meta-analysis', 'regulatory-agency-monograph-guidance'],
        safetyCritical: false,
        publishBlocking,
        relatedWorkpackIds: [workpack.workpackId],
        notesForContractor:
          'Coverage relies on a single source class. Add at least one independent complementary class to reduce uncertainty and conflict fragility.',
        bucket: bucketForGap({
          gapType: sourceGapType,
          topicType,
          priorityLabel: workpack.priorityLabel,
          publishBlocking,
          safetyCritical: false,
        }),
      })
    }

    if (referencedSources.length > 0 && activeSources.length === 0) {
      const topicType: TopicType = 'source_registry'
      const sourceGapType: SourceGapType = 'inactive_registered_sources'
      const publishBlocking = true
      const gapId = `gap_${stableId(workpack.workpackId)}_${stableId(sourceGapType)}`

      gapItems.push({
        gapId,
        itemType: workpack.itemType,
        entitySlug: workpack.entitySlug,
        surfaceId: workpack.surfaceId,
        priorityLabel: workpack.priorityLabel,
        topicType,
        sourceGapType,
        currentSourceClasses,
        recommendedSourceClasses: ['randomized-human-trial', 'systematic-review-meta-analysis'],
        safetyCritical: workpack.missingTopics.includes('safety'),
        publishBlocking,
        relatedWorkpackIds: [workpack.workpackId],
        notesForContractor:
          'Workpack references only inactive sources. Replace with active registry entries before updating claims or advancing publish review.',
        bucket: 'source_needed_now',
      })
    }
  }

  const dedupedGaps = dedupe(gapItems.map(item => item.gapId))
    .map(gapId => gapItems.find(item => item.gapId === gapId) as GapItem)
    .sort((a, b) => a.gapId.localeCompare(b.gapId))

  const buckets: Record<GapBucket, GapItem[]> = {
    source_needed_now: [],
    safety_source_needed: [],
    human_evidence_gap: [],
    mechanism_source_gap: [],
    traditional_only_gap: [],
    defer_until_sources_available: [],
  }

  for (const item of dedupedGaps) buckets[item.bucket].push(item)

  const bySourceGapType = dedupedGaps.reduce<Record<SourceGapType, number>>(
    (acc, item) => {
      acc[item.sourceGapType] += 1
      return acc
    },
    {
      missing_source_coverage_by_topic: 0,
      weak_source_diversity: 0,
      lack_of_safety_sources: 0,
      lack_of_mechanism_sources: 0,
      overreliance_single_source_class: 0,
      missing_modern_human_evidence: 0,
      traditional_or_preclinical_only: 0,
      inactive_registered_sources: 0,
    },
  )

  const report: SourceGapReport = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'source-gap-discovery-v1',
    sources: {
      sourceRegistry: path.relative(ROOT, SOURCE_REGISTRY_PATH),
      enrichmentWorkpacks: path.relative(ROOT, WORKPACKS_PATH),
      publicationManifest: path.relative(ROOT, PUBLICATION_MANIFEST_PATH),
    },
    summary: {
      totalGapItems: dedupedGaps.length,
      byBucket: {
        source_needed_now: buckets.source_needed_now.length,
        safety_source_needed: buckets.safety_source_needed.length,
        human_evidence_gap: buckets.human_evidence_gap.length,
        mechanism_source_gap: buckets.mechanism_source_gap.length,
        traditional_only_gap: buckets.traditional_only_gap.length,
        defer_until_sources_available: buckets.defer_until_sources_available.length,
      },
      bySourceGapType,
      publishBlockingCount: dedupedGaps.filter(item => item.publishBlocking).length,
      safetyCriticalCount: dedupedGaps.filter(item => item.safetyCritical).length,
    },
    buckets,
    gapItems: dedupedGaps,
  }

  const md: string[] = [
    '# Source Gap Discovery Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Bucket counts',
    ...Object.entries(report.summary.byBucket).map(([bucket, count]) => `- ${bucket}: ${count}`),
    '',
    '## Gap type counts',
    ...Object.entries(report.summary.bySourceGapType).map(([gapType, count]) => `- ${gapType}: ${count}`),
    '',
    `- publishBlocking: ${report.summary.publishBlockingCount}`,
    `- safetyCritical: ${report.summary.safetyCriticalCount}`,
    '',
    '## Top actionable items (first 40)',
    '| gapId | itemType | target | topic | sourceGapType | bucket | publishBlocking | safetyCritical | recommendedSourceClasses |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const item of report.gapItems.slice(0, 40)) {
    md.push(
      `| ${item.gapId} | ${item.itemType} | ${item.entitySlug || item.surfaceId || '-'} | ${item.topicType} | ${item.sourceGapType} | ${item.bucket} | ${item.publishBlocking ? 'yes' : 'no'} | ${item.safetyCritical ? 'yes' : 'no'} | ${item.recommendedSourceClasses.join(', ')} |`,
    )
  }

  md.push('', '## Contractor notes', '')
  md.push('- Use this report for targeted source acquisition only; do not add claims before registry + governance checks pass.')
  md.push('- Prioritize safety_source_needed and publish-blocking gaps for indexable entities.')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(
    `Gap items=${report.summary.totalGapItems} publishBlocking=${report.summary.publishBlockingCount} safetyCritical=${report.summary.safetyCriticalCount}`,
  )
}

run()
