import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound'
type SurfaceType = 'entity_detail' | 'collection' | 'comparison' | 'browse_search' | 'linking'
type HealthState =
  | 'healthy'
  | 'partial'
  | 'stale'
  | 'blocked'
  | 'missing_governed_enrichment'
  | 'surface_out_of_sync'

type BacklogPriority =
  | 'do_now'
  | 'next_wave'
  | 're_review_needed'
  | 'governance_fix_needed'
  | 'low_priority'
  | 'defer'

type ReviewCycleState =
  | 'fresh'
  | 'review_due'
  | 'urgent_review_due'
  | 'downgrade_recommended'
  | 'depublish_or_hide_enriched_section'
  | 'blocked_pending_review'

type WorkpackBucket = 'do_now' | 'next_wave' | 're_review' | 'governance_fix' | 'defer'
type WorkpackTaskType =
  | 'source_gathering'
  | 'normalization_enrichment_entry'
  | 'review_approval'
  | 'governance_remediation'

type WorkpackItemType =
  | 'herb_page'
  | 'compound_page'
  | 'collection_page'
  | 'comparison_page'
  | 'discovery_surface'
  | 'recommendation_surface'

type BacklogItem = {
  itemType: 'entity' | 'surface'
  entityType?: EntityType
  entitySlug?: string
  surfaceType?: SurfaceType
  surfaceId?: string
  currentPublicStatus: string
  currentEnrichmentHealthState: HealthState
  priorityLabel: BacklogPriority
  recommendedAction: string
  missingTopics: string[]
  blockedReasons: string[]
  staleStatus: {
    stale: boolean
    reviewedAt: string | null
  }
  publicPriorityScore: number
}

type BacklogReport = {
  generatedAt: string
  items: BacklogItem[]
}

type ReviewCycleItem = {
  itemType: 'entity' | 'surface'
  entityType?: EntityType
  entitySlug?: string
  surfaceType?: SurfaceType
  surfaceId?: string
  publicStatus: string
  enrichmentHealthState: HealthState
  reviewCycleState: ReviewCycleState
  recommendedAction: string
  affectedTopics: string[]
  reasons: string[]
  suppressEnrichedSectionRecommended: boolean
}

type ReviewCycleReport = {
  generatedAt: string
  items: ReviewCycleItem[]
}

type GovernedRow = {
  entityType: EntityType
  entitySlug: string
  researchEnrichment: {
    sourceRegistryIds?: string[]
    pageEvidenceJudgment?: {
      evidenceLabel?: string
      grading?: { conflictState?: string }
    }
    conflictNotes?: unknown[]
    unsupportedOrUnclearUses?: unknown[]
  }
}

type SourceRegistryRow = {
  sourceId: string
  notes?: string
  active: boolean
}

type SourceWaveTargetsReport = {
  targets: Array<{ entityType: EntityType; entitySlug: string }>
}

type Workpack = {
  workpackId: string
  itemType: WorkpackItemType
  entitySlug: string | null
  surfaceId: string | null
  publicStatus: string
  enrichmentHealthState: HealthState
  reviewCycleState: ReviewCycleState
  priorityLabel: BacklogPriority
  operationalBucket: WorkpackBucket
  taskTypes: WorkpackTaskType[]
  recommendedAction: string
  requiredTopics: string[]
  missingTopics: string[]
  staleTopics: string[]
  blockedReasons: string[]
  availableSourceIds: string[]
  requiredGovernanceChecks: string[]
  completionCriteria: string[]
  reviewerNeeded: boolean
  notesForContractor: string
  publicPriorityScore: number
}

const ROOT = process.cwd()
const BACKLOG_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-backlog.json')
const REVIEW_CYCLE_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-review-cycle.json')
const GOVERNED_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const SOURCE_WAVE_TARGETS_PATH = path.join(ROOT, 'ops', 'reports', 'source-wave-1-targets.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.md')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase()
}

function entityKey(entityType: EntityType, slug: string) {
  return `${entityType}:${normalizeSlug(slug)}`
}

function normalizeIntakeSlug(raw: string) {
  return raw.replace(/_/g, '-').replace(/--+/g, '-')
}

function promotedSourceEntityKey(source: SourceRegistryRow): string | null {
  if (!source.active || !source.notes) return null
  const match = source.notes.match(
    /intakeTaskId=intake_gap_wp_(herb|compound)_([a-z0-9_]+?)_(?:safety|evidence|mechanism|constituent|interaction|contraindication|adverse|population|conflict|research)/,
  )
  if (!match) return null
  const entityType = match[1] as EntityType
  const entitySlug = normalizeIntakeSlug(match[2])
  return entityKey(entityType, entitySlug)
}

function workpackItemType(item: BacklogItem): WorkpackItemType {
  if (item.itemType === 'entity') {
    return item.entityType === 'herb' ? 'herb_page' : 'compound_page'
  }

  if (item.surfaceType === 'collection') return 'collection_page'
  if (item.surfaceType === 'comparison') return 'comparison_page'
  if (item.surfaceType === 'browse_search') return 'discovery_surface'
  if (item.surfaceType === 'linking') return 'recommendation_surface'
  return 'discovery_surface'
}

function bucketFor(item: BacklogItem, reviewState: ReviewCycleState): WorkpackBucket {
  if (
    item.priorityLabel === 'governance_fix_needed' ||
    reviewState === 'blocked_pending_review' ||
    reviewState === 'depublish_or_hide_enriched_section'
  ) {
    return 'governance_fix'
  }

  if (
    item.priorityLabel === 're_review_needed' ||
    reviewState === 'review_due' ||
    reviewState === 'urgent_review_due' ||
    reviewState === 'downgrade_recommended'
  ) {
    return 're_review'
  }

  if (item.priorityLabel === 'do_now') return 'do_now'
  if (item.priorityLabel === 'next_wave') return 'next_wave'
  if (item.priorityLabel === 'low_priority' || item.priorityLabel === 'defer') return 'defer'
  return 'next_wave'
}

function requiredTopicsFor(item: BacklogItem): string[] {
  if (item.itemType === 'entity') {
    return ['evidence', 'safety', 'mechanism', 'constituent', 'source_registry']
  }

  if (item.surfaceType === 'collection' || item.surfaceType === 'comparison') {
    return ['evidence', 'safety', 'mechanism', 'constituent']
  }

  if (item.surfaceType === 'browse_search') {
    return ['discovery_coverage', 'evidence', 'safety']
  }

  return ['recommendation_quality', 'mechanism', 'evidence']
}

function staleTopicsFor(item: BacklogItem, review: ReviewCycleItem): string[] {
  if (!item.staleStatus.stale && review.reviewCycleState === 'fresh') return []

  const topicHints = new Set<string>(review.affectedTopics)
  if (item.staleStatus.stale && topicHints.size === 0) {
    for (const topic of item.missingTopics) topicHints.add(topic)
    if (item.itemType === 'entity' && topicHints.size === 0) {
      topicHints.add('evidence')
      topicHints.add('safety')
    }
  }

  return Array.from(topicHints).sort()
}

function governanceChecksFor(item: BacklogItem): string[] {
  const checks = new Set<string>(['verify:source-registry'])

  if (item.itemType === 'entity') {
    checks.add('verify:research-enrichment')
    checks.add('verify:enrichment-editorial')
  }

  if (item.surfaceType === 'browse_search') checks.add('verify:enrichment-discovery')
  if (item.surfaceType === 'collection' || item.surfaceType === 'comparison') {
    checks.add('verify:enrichment-collections')
  }
  if (item.surfaceType === 'linking') checks.add('verify:enrichment-linking')

  return Array.from(checks).sort()
}

function taskTypesFor(args: {
  missingTopics: string[]
  blockedReasons: string[]
  availableSourceIds: string[]
  reviewState: ReviewCycleState
  bucket: WorkpackBucket
}): WorkpackTaskType[] {
  const { missingTopics, blockedReasons, availableSourceIds, reviewState, bucket } = args
  const tags = new Set<WorkpackTaskType>()

  if (availableSourceIds.length === 0 || missingTopics.includes('source_registry')) {
    tags.add('source_gathering')
  }

  if (missingTopics.length > 0 || reviewState === 'downgrade_recommended') {
    tags.add('normalization_enrichment_entry')
  }

  if (
    reviewState === 'review_due' ||
    reviewState === 'urgent_review_due' ||
    reviewState === 'downgrade_recommended' ||
    reviewState === 'blocked_pending_review'
  ) {
    tags.add('review_approval')
  }

  if (bucket === 'governance_fix' || blockedReasons.length > 0) {
    tags.add('governance_remediation')
  }

  return Array.from(tags).sort()
}

function isGovernanceReason(reason: string): boolean {
  const lowered = reason.toLowerCase()
  return (
    lowered.includes('governance') ||
    lowered.includes('inactive') ||
    lowered.includes('editorial') ||
    lowered.includes('block') ||
    lowered.includes('publish') ||
    lowered.includes('deprecat') ||
    lowered.includes('source_linked_claims_without_publishable_status')
  )
}

function completionCriteriaFor(args: {
  requiredTopics: string[]
  missingTopics: string[]
  staleTopics: string[]
  blockedReasons: string[]
  checks: string[]
  taskTypes: WorkpackTaskType[]
}): string[] {
  const { requiredTopics, missingTopics, staleTopics, blockedReasons, checks, taskTypes } = args
  const criteria: string[] = []

  if (taskTypes.includes('source_gathering')) {
    criteria.push('Register and classify all new/updated sources in source registry before claim updates.')
  }

  if (taskTypes.includes('normalization_enrichment_entry')) {
    criteria.push(
      `Close missing topic coverage for: ${(missingTopics.length ? missingTopics : requiredTopics).join(', ')}.`,
    )
  }

  if (staleTopics.length > 0) {
    criteria.push(`Refresh stale topics and review timestamps for: ${staleTopics.join(', ')}.`)
  }

  if (blockedReasons.length > 0) {
    criteria.push('Resolve governance blockers without weakening publish-gating or safety checks.')
  }

  criteria.push(`Pass governance verification checks: ${checks.join(', ')}.`)

  if (taskTypes.includes('review_approval')) {
    criteria.push('Obtain reviewer sign-off and ensure review-cycle state is no longer due/blocked.')
  }

  return criteria
}

function recommendedActionFor(args: {
  item: BacklogItem
  review: ReviewCycleItem
  missingTopics: string[]
  staleTopics: string[]
  blockedReasons: string[]
}): string {
  const { item, review, missingTopics, staleTopics, blockedReasons } = args

  if (blockedReasons.length > 0 || review.reviewCycleState === 'blocked_pending_review') {
    return 'Governance fix needed before publish: clear blockers, verify source status, then request reviewer approval.'
  }

  if (review.reviewCycleState === 'depublish_or_hide_enriched_section') {
    return 'Keep enriched rendering suppressed until governed enrichment and required source provenance are restored.'
  }

  if (missingTopics.includes('safety')) {
    return 'Safety refresh needed: update interactions, contraindications, and adverse effects with governed provenance.'
  }

  if (missingTopics.includes('evidence') || review.affectedTopics.includes('evidence_conflict')) {
    return 'Evidence/conflict review needed: reconcile conflicting claims and re-grade page evidence judgment.'
  }

  if (missingTopics.includes('mechanism') || missingTopics.includes('constituent')) {
    return 'Mechanism/constituent gap: backfill governed entries to support comparison/recommendation surfaces.'
  }

  if (item.currentEnrichmentHealthState === 'missing_governed_enrichment') {
    return 'New governed enrichment needed: gather approved sources, normalize entries, and complete publish-gating checks.'
  }

  if (item.itemType === 'surface' && item.currentEnrichmentHealthState !== 'healthy') {
    return 'Surface blocked by upstream enrichment gaps: complete linked entity workpacks, then regenerate surface outputs.'
  }

  if (staleTopics.length > 0) {
    return 'Re-review needed: refresh stale topics and update review metadata before next publish cycle.'
  }

  return `${item.recommendedAction} ${review.recommendedAction}`.trim()
}

function notesForContractor(args: {
  item: BacklogItem
  review: ReviewCycleItem
  taskTypes: WorkpackTaskType[]
  availableSourceIds: string[]
}): string {
  const { item, review, taskTypes, availableSourceIds } = args

  const scope =
    item.itemType === 'entity'
      ? `${item.entityType} page ${item.entitySlug}`
      : `${item.surfaceType} surface ${item.surfaceId}`

  const sourceNote =
    availableSourceIds.length > 0
      ? `Reuse registered sources first (${availableSourceIds.length} available).`
      : 'No registered sources attached; start with source gathering and registry classification.'

  return [
    `Scope: ${scope}.`,
    `Primary task types: ${taskTypes.join(', ') || 'none'}.`,
    sourceNote,
    `Review-cycle signal: ${review.reviewCycleState}.`,
  ].join(' ')
}

function run() {
  const backlog = readJson<BacklogReport>(BACKLOG_PATH)
  const reviewCycle = readJson<ReviewCycleReport>(REVIEW_CYCLE_PATH)
  const governed = readJson<GovernedRow[]>(GOVERNED_PATH)
  const sourceRegistry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)
  const sourceWaveTargets = readJson<SourceWaveTargetsReport>(SOURCE_WAVE_TARGETS_PATH)
  const sourceWaveTargetKeys = new Set(
    sourceWaveTargets.targets.map(target => entityKey(target.entityType, target.entitySlug)),
  )

  const reviewByKey = new Map<string, ReviewCycleItem>()
  for (const item of reviewCycle.items) {
    const key =
      item.itemType === 'entity'
        ? `${item.itemType}:${item.entityType}:${item.entitySlug}`
        : `${item.itemType}:${item.surfaceType}:${item.surfaceId}`
    reviewByKey.set(key, item)
  }

  const sourceIdsByEntity = new Map<string, string[]>()
  for (const row of governed) {
    sourceIdsByEntity.set(entityKey(row.entityType, row.entitySlug), (row.researchEnrichment.sourceRegistryIds || []).slice().sort())
  }
  for (const source of sourceRegistry) {
    const key = promotedSourceEntityKey(source)
    if (!key || !sourceWaveTargetKeys.has(key)) continue
    const existing = sourceIdsByEntity.get(key) || []
    if (!existing.includes(source.sourceId)) sourceIdsByEntity.set(key, [...existing, source.sourceId].sort())
  }

  const workpacks: Workpack[] = backlog.items
    .map(item => {
      const key =
        item.itemType === 'entity'
          ? `${item.itemType}:${item.entityType}:${item.entitySlug}`
          : `${item.itemType}:${item.surfaceType}:${item.surfaceId}`

      const review = reviewByKey.get(key)
      if (!review) return null

      const availableSourceIds =
        item.itemType === 'entity' && item.entityType && item.entitySlug
          ? sourceIdsByEntity.get(entityKey(item.entityType, item.entitySlug)) || []
          : []

      const missingTopics = item.missingTopics.slice().sort()
      const staleTopics = staleTopicsFor(item, review)
      const blockedReasons = Array.from(
        new Set([...item.blockedReasons, ...review.reasons.filter(isGovernanceReason)]),
      ).sort()
      const requiredTopics = requiredTopicsFor(item)
      const checks = governanceChecksFor(item)
      const operationalBucket = bucketFor(item, review.reviewCycleState)
      const taskTypes = taskTypesFor({
        missingTopics,
        blockedReasons,
        availableSourceIds,
        reviewState: review.reviewCycleState,
        bucket: operationalBucket,
      })

      const entityOrSurfaceId = item.itemType === 'entity' ? `${item.entityType}:${item.entitySlug}` : `${item.surfaceType}:${item.surfaceId}`

      const workpack: Workpack = {
        workpackId: `wp_${entityOrSurfaceId?.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`,
        itemType: workpackItemType(item),
        entitySlug: item.itemType === 'entity' ? item.entitySlug || null : null,
        surfaceId: item.itemType === 'surface' ? item.surfaceId || null : null,
        publicStatus: item.currentPublicStatus,
        enrichmentHealthState: item.currentEnrichmentHealthState,
        reviewCycleState: review.reviewCycleState,
        priorityLabel: item.priorityLabel,
        operationalBucket,
        taskTypes,
        recommendedAction: recommendedActionFor({ item, review, missingTopics, staleTopics, blockedReasons }),
        requiredTopics,
        missingTopics,
        staleTopics,
        blockedReasons,
        availableSourceIds,
        requiredGovernanceChecks: checks,
        completionCriteria: completionCriteriaFor({
          requiredTopics,
          missingTopics,
          staleTopics,
          blockedReasons,
          checks,
          taskTypes,
        }),
        reviewerNeeded:
          taskTypes.includes('review_approval') ||
          taskTypes.includes('governance_remediation') ||
          review.reviewCycleState !== 'fresh',
        notesForContractor: notesForContractor({ item, review, taskTypes, availableSourceIds }),
        publicPriorityScore: item.publicPriorityScore,
      }

      return workpack
    })
    .filter((workpack): workpack is Workpack => workpack !== null)
    .sort((a, b) => {
      const bucketRank: Record<WorkpackBucket, number> = {
        governance_fix: 0,
        do_now: 1,
        re_review: 2,
        next_wave: 3,
        defer: 4,
      }
      if (bucketRank[a.operationalBucket] !== bucketRank[b.operationalBucket]) {
        return bucketRank[a.operationalBucket] - bucketRank[b.operationalBucket]
      }
      if (b.publicPriorityScore !== a.publicPriorityScore) return b.publicPriorityScore - a.publicPriorityScore
      return a.workpackId.localeCompare(b.workpackId)
    })

  const buckets: Record<WorkpackBucket, Workpack[]> = {
    governance_fix: [],
    do_now: [],
    re_review: [],
    next_wave: [],
    defer: [],
  }

  for (const workpack of workpacks) buckets[workpack.operationalBucket].push(workpack)

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'enrichment-workpacks-v1',
    sources: {
      enrichmentBacklog: path.relative(ROOT, BACKLOG_PATH),
      enrichmentReviewCycle: path.relative(ROOT, REVIEW_CYCLE_PATH),
      enrichmentGoverned: path.relative(ROOT, GOVERNED_PATH),
    },
    summary: {
      totalWorkpacks: workpacks.length,
      bucketCounts: Object.fromEntries(
        Object.entries(buckets).map(([bucket, rows]) => [bucket, rows.length]),
      ) as Record<WorkpackBucket, number>,
      taskTypeCounts: workpacks.reduce<Record<WorkpackTaskType, number>>(
        (acc, workpack) => {
          for (const taskType of workpack.taskTypes) acc[taskType] += 1
          return acc
        },
        {
          source_gathering: 0,
          normalization_enrichment_entry: 0,
          review_approval: 0,
          governance_remediation: 0,
        },
      ),
      reviewerNeededCount: workpacks.filter(workpack => workpack.reviewerNeeded).length,
      topWorkpacks: workpacks.slice(0, 20),
    },
    buckets,
    workpacks,
  }

  const md: string[] = [
    '# Enrichment Workpacks',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Operational buckets',
    ...Object.entries(report.summary.bucketCounts).map(([bucket, count]) => `- ${bucket}: ${count}`),
    '',
    '## Task type split',
    ...Object.entries(report.summary.taskTypeCounts).map(([taskType, count]) => `- ${taskType}: ${count}`),
    '',
    '## Contractor queue (top 30)',
    '| workpackId | itemType | target | bucket | priority | action | missing/stale | sources | review state |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ]

  for (const workpack of workpacks.slice(0, 30)) {
    const target = workpack.entitySlug || workpack.surfaceId || '-'
    const topics = [
      workpack.missingTopics.length ? `missing:${workpack.missingTopics.join(',')}` : null,
      workpack.staleTopics.length ? `stale:${workpack.staleTopics.join(',')}` : null,
    ]
      .filter(Boolean)
      .join(' / ')

    md.push(
      `| ${workpack.workpackId} | ${workpack.itemType} | ${target} | ${workpack.operationalBucket} | ${workpack.priorityLabel} | ${workpack.recommendedAction} | ${topics || '-'} | ${workpack.availableSourceIds.length} | ${workpack.reviewCycleState} |`,
    )
  }

  md.push('', '## Governance-first reminders', '')
  md.push('- Do not publish governed enrichment changes until required checks pass and reviewer-needed workpacks receive sign-off.')
  md.push('- For governance_fix workpacks, clear blockers before starting new coverage expansion.')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(OUTPUT_MD, `${md.join('\n')}\n`)

  console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(
    `Workpacks: total=${report.summary.totalWorkpacks}, governance_fix=${report.summary.bucketCounts.governance_fix}, do_now=${report.summary.bucketCounts.do_now}, re_review=${report.summary.bucketCounts.re_review}, next_wave=${report.summary.bucketCounts.next_wave}, defer=${report.summary.bucketCounts.defer}`,
  )
}

run()
