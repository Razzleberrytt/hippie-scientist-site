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

type ReviewCycleState =
  | 'fresh'
  | 'review_due'
  | 'urgent_review_due'
  | 'downgrade_recommended'
  | 'depublish_or_hide_enriched_section'
  | 'blocked_pending_review'

type RefreshUrgency = 'routine' | 'scheduled' | 'high' | 'urgent' | 'immediate'

type HealthReport = {
  generatedAt: string
  entities: Array<{
    entityType: EntityType
    entitySlug: string
    publicStatus: 'indexable' | 'non_indexable' | 'missing'
    enrichmentHealthState: Exclude<HealthState, 'surface_out_of_sync'>
    reviewedAt: string | null
    stale: boolean
    coverageByTopic: Record<string, boolean>
    blockedReasons: string[]
    missingTopics: string[]
    surfaceUsage: string[]
    outOfSyncSignals: string[]
  }>
  surfaces: Array<{
    surfaceType: SurfaceType
    surfaceSlug: string
    entityType?: EntityType | 'mixed'
    enrichmentHealthState: HealthState
    blockedReasons: string[]
    outOfSyncSignals: string[]
    usageCount: number
    governedCoverageCount: number
    staleCoverageCount: number
  }>
}

type BacklogReport = {
  items: Array<{
    itemType: 'entity' | 'surface'
    entityType?: EntityType
    entitySlug?: string
    surfaceType?: SurfaceType
    surfaceId?: string
    publicPriorityScore: number
  }>
}

type GovernedRow = {
  entityType: EntityType
  entitySlug: string
  researchEnrichment: {
    interactions: unknown[]
    contraindications: unknown[]
    adverseEffects: unknown[]
    mechanisms: unknown[]
    constituents: unknown[]
    unsupportedOrUnclearUses: unknown[]
    conflictNotes: unknown[]
    sourceRegistryIds?: string[]
    pageEvidenceJudgment?: {
      evidenceLabel?: string
      grading?: { conflictState?: string }
      uncertaintyNotes?: string[]
      conflictNotes?: string[]
    }
    editorialStatus?: string
    editorialReadiness?: {
      publishable?: boolean
      hasConflictOrWeakEvidence?: boolean
    }
    lastReviewedAt?: string
  }
}

type SourceRegistryRow = {
  sourceId: string
  active?: boolean
}

type ReviewCycleRecord = {
  itemType: 'entity' | 'surface'
  entityType?: EntityType
  entitySlug?: string
  surfaceType?: SurfaceType
  surfaceId?: string
  publicStatus: string
  enrichmentHealthState: HealthState | Exclude<HealthState, 'surface_out_of_sync'>
  reviewCycleState: ReviewCycleState
  reviewedAt: string | null
  reviewAgeDays: number | null
  refreshUrgency: RefreshUrgency
  recommendedAction: string
  affectedTopics: string[]
  affectedSurfaces: string[]
  downgradeRecommended: boolean
  suppressEnrichedSectionRecommended: boolean
  enrichedRenderingRecommendation: 'remain' | 'downgrade' | 'hide'
  reasons: string[]
}

const ROOT = process.cwd()
const HEALTH_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-health.json')
const BACKLOG_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-backlog.json')
const GOVERNED_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'enrichment-review-cycle.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'enrichment-review-cycle.md')

const POLICY = {
  defaultReviewDueDays: 270,
  defaultUrgentReviewDays: 365,
  safetyReviewDueDays: 120,
  safetyUrgentReviewDays: 180,
  weakEvidenceReviewDueDays: 90,
  weakEvidenceUrgentReviewDays: 150,
  highPriorityAccelerationDays: 30,
  staleSurfaceUrgentThreshold: 3,
}

const WEAK_OR_CONFLICTING_LABELS = new Set([
  'preclinical_only',
  'traditional_use_only',
  'insufficient_evidence',
  'mixed_or_uncertain',
  'conflicting_evidence',
])

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function maybeReadJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  return readJson<T>(filePath)
}

function entityKey(entityType: EntityType, slug: string) {
  return `${entityType}:${String(slug || '').trim().toLowerCase()}`
}

function ageInDays(date: string | null): number | null {
  if (!date) return null
  const ms = Date.parse(date)
  if (!Number.isFinite(ms)) return null
  return Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000))
}

function classifyEntityReviewCycle(args: {
  health: HealthReport['entities'][number]
  governed: GovernedRow['researchEnrichment'] | null
  inactiveSourceRefs: string[]
  publicPriorityScore: number
}) {
  const { health, governed, inactiveSourceRefs, publicPriorityScore } = args
  const reasons: string[] = []
  const affectedTopics = new Set<string>()

  const reviewedAt = health.reviewedAt || governed?.lastReviewedAt || null
  const reviewAgeDays = ageInDays(reviewedAt)
  const hasSafetyContent =
    (governed?.interactions.length || 0) > 0 ||
    (governed?.contraindications.length || 0) > 0 ||
    (governed?.adverseEffects.length || 0) > 0

  const evidenceLabel = governed?.pageEvidenceJudgment?.evidenceLabel || null
  const hasWeakOrConflictingEvidence = evidenceLabel ? WEAK_OR_CONFLICTING_LABELS.has(evidenceLabel) : false
  const hasConflictSignals =
    hasWeakOrConflictingEvidence ||
    (governed?.conflictNotes.length || 0) > 0 ||
    (governed?.unsupportedOrUnclearUses.length || 0) > 0 ||
    governed?.pageEvidenceJudgment?.grading?.conflictState === 'conflicting_evidence' ||
    governed?.pageEvidenceJudgment?.grading?.conflictState === 'mixed_or_uncertain'

  const highPriority = health.publicStatus === 'indexable' || publicPriorityScore >= 70

  let reviewDueDays = POLICY.defaultReviewDueDays
  let urgentReviewDays = POLICY.defaultUrgentReviewDays

  if (hasSafetyContent) {
    reviewDueDays = Math.min(reviewDueDays, POLICY.safetyReviewDueDays)
    urgentReviewDays = Math.min(urgentReviewDays, POLICY.safetyUrgentReviewDays)
    affectedTopics.add('safety')
  }

  if (hasWeakOrConflictingEvidence || hasConflictSignals) {
    reviewDueDays = Math.min(reviewDueDays, POLICY.weakEvidenceReviewDueDays)
    urgentReviewDays = Math.min(urgentReviewDays, POLICY.weakEvidenceUrgentReviewDays)
    affectedTopics.add('evidence_conflict')
  }

  if (highPriority) {
    reviewDueDays = Math.max(30, reviewDueDays - POLICY.highPriorityAccelerationDays)
    urgentReviewDays = Math.max(reviewDueDays + 30, urgentReviewDays - POLICY.highPriorityAccelerationDays)
    reasons.push('high-priority public entity uses accelerated review cadence')
  }

  for (const topic of health.missingTopics) affectedTopics.add(topic)

  const inactiveSourceReason = inactiveSourceRefs.length
    ? `inactive/deprecated source refs linked: ${inactiveSourceRefs.join(',')}`
    : null

  if (inactiveSourceReason) reasons.push(inactiveSourceReason)
  if (health.stale) reasons.push('entity already marked stale in enrichment health report')
  if (hasSafetyContent && reviewAgeDays !== null) reasons.push('safety topics require shorter review window')
  if (hasConflictSignals) reasons.push('weak/conflicting evidence requires faster re-review')
  if (health.outOfSyncSignals.length) reasons.push(...health.outOfSyncSignals)

  let state: ReviewCycleState = 'fresh'
  let refreshUrgency: RefreshUrgency = 'routine'
  let recommendedAction = 'Keep enriched section visible; continue routine monitoring cadence.'
  let downgradeRecommended = false
  let suppress = false

  const blockedByGovernance =
    health.enrichmentHealthState === 'blocked' ||
    health.blockedReasons.length > 0 ||
    governed?.editorialReadiness?.publishable === false ||
    (governed?.editorialStatus && !['approved', 'published'].includes(governed.editorialStatus))

  if (blockedByGovernance) {
    state = 'blocked_pending_review'
    refreshUrgency = 'immediate'
    suppress = true
    recommendedAction =
      'Hold or hide enriched section until governance/editorial blockers are resolved and reviewer approval is restored.'
    reasons.push('governance block prevents safe publication of enrichment content')
  } else if (health.enrichmentHealthState === 'missing_governed_enrichment') {
    state = 'depublish_or_hide_enriched_section'
    refreshUrgency = 'immediate'
    suppress = true
    recommendedAction =
      'Hide enriched section until governed enrichment is available and publish-gated checks pass.'
    reasons.push('no governed enrichment available for this entity')
  } else if (inactiveSourceRefs.length > 0) {
    state = 'depublish_or_hide_enriched_section'
    refreshUrgency = 'immediate'
    suppress = true
    recommendedAction =
      'Temporarily suppress enriched rendering until claims linked to inactive/deprecated sources are reviewed and replaced.'
  } else if (health.enrichmentHealthState === 'partial') {
    state = 'downgrade_recommended'
    refreshUrgency = 'high'
    downgradeRecommended = true
    recommendedAction =
      'Downgrade enriched highlights to conservative summary mode while missing topics are backfilled and reviewed.'
    reasons.push('partial coverage can mislead public comparison/discovery surfaces')
  } else if (reviewAgeDays === null) {
    state = 'urgent_review_due'
    refreshUrgency = 'urgent'
    downgradeRecommended = true
    recommendedAction =
      'Run expedited re-review to restore valid review metadata before continuing enriched rendering.'
    reasons.push('missing or invalid reviewedAt metadata')
  } else if (reviewAgeDays >= urgentReviewDays) {
    state = 'urgent_review_due'
    refreshUrgency = 'urgent'
    downgradeRecommended = hasSafetyContent || hasConflictSignals
    recommendedAction =
      'Schedule urgent refresh of evidence/safety/provenance and re-run governed publish checks before next release.'
    reasons.push(`review age ${reviewAgeDays}d exceeds urgent threshold ${urgentReviewDays}d`)
  } else if (reviewAgeDays >= reviewDueDays) {
    state = 'review_due'
    refreshUrgency = 'scheduled'
    recommendedAction =
      'Queue for next review cycle; refresh safety/evidence notes and confirm source registry activity status.'
    reasons.push(`review age ${reviewAgeDays}d exceeds review-due threshold ${reviewDueDays}d`)
  }

  if (health.publicStatus === 'indexable' && (state === 'review_due' || state === 'urgent_review_due')) {
    refreshUrgency = state === 'urgent_review_due' ? 'urgent' : 'high'
    reasons.push('indexable entity: stale enrichment impacts public SEO/discovery surfaces')
  }

  return {
    reviewCycleState: state,
    refreshUrgency,
    recommendedAction,
    reasons: Array.from(new Set(reasons)).sort(),
    affectedTopics: Array.from(affectedTopics).sort(),
    affectedSurfaces: health.surfaceUsage.slice().sort(),
    reviewedAt,
    reviewAgeDays,
    downgradeRecommended,
    suppressEnrichedSectionRecommended: suppress,
    enrichedRenderingRecommendation: suppress ? 'hide' : downgradeRecommended ? 'downgrade' : 'remain',
  }
}

function classifySurfaceReviewCycle(args: {
  surface: HealthReport['surfaces'][number]
  publicPriorityScore: number
}) {
  const { surface, publicPriorityScore } = args
  const reasons: string[] = []
  const affectedTopics = new Set<string>()

  if (surface.staleCoverageCount > 0) {
    affectedTopics.add('stale_upstream_entities')
    reasons.push(`surface depends on ${surface.staleCoverageCount} stale governed entities`)
  }

  if (surface.outOfSyncSignals.length > 0) {
    reasons.push(...surface.outOfSyncSignals)
  }

  if (surface.surfaceType === 'browse_search' || surface.surfaceType === 'collection') {
    affectedTopics.add('discovery_quality')
  }
  if (surface.surfaceType === 'linking' || surface.surfaceType === 'comparison') {
    affectedTopics.add('recommendation_quality')
  }

  if (publicPriorityScore >= 80) {
    reasons.push('high public-impact surface based on backlog priority score')
  }

  let state: ReviewCycleState = 'fresh'
  let refreshUrgency: RefreshUrgency = 'routine'
  let recommendedAction = 'No immediate changes; monitor as part of routine report cadence.'
  let downgradeRecommended = false
  let suppress = false

  if (surface.enrichmentHealthState === 'blocked') {
    state = 'blocked_pending_review'
    refreshUrgency = 'immediate'
    suppress = true
    recommendedAction =
      'Block enriched surface modules until upstream governance blockers are resolved and verified.'
    reasons.push('surface is blocked by governance health state')
  } else if (surface.enrichmentHealthState === 'missing_governed_enrichment') {
    state = 'depublish_or_hide_enriched_section'
    refreshUrgency = 'immediate'
    suppress = true
    recommendedAction =
      'Hide enriched blocks for this surface until sufficient governed coverage is available.'
    reasons.push('surface lacks sufficient governed enrichment coverage')
  } else if (surface.enrichmentHealthState === 'surface_out_of_sync') {
    state = 'downgrade_recommended'
    refreshUrgency = publicPriorityScore >= 70 ? 'urgent' : 'high'
    downgradeRecommended = true
    recommendedAction =
      'Downgrade to non-enriched fallback and regenerate summaries/links to remove out-of-sync governed signals.'
  } else if (surface.staleCoverageCount >= POLICY.staleSurfaceUrgentThreshold) {
    state = 'urgent_review_due'
    refreshUrgency = 'urgent'
    downgradeRecommended = true
    recommendedAction =
      'Urgently refresh stale upstream entities feeding this surface before continuing full enriched presentation.'
  } else if (surface.staleCoverageCount > 0 || surface.enrichmentHealthState === 'partial') {
    state = 'review_due'
    refreshUrgency = publicPriorityScore >= 70 ? 'high' : 'scheduled'
    recommendedAction =
      'Schedule next-cycle refresh for stale or partial upstream enrichment dependencies.'
  }

  return {
    reviewCycleState: state,
    refreshUrgency,
    recommendedAction,
    reasons: Array.from(new Set(reasons)).sort(),
    affectedTopics: Array.from(affectedTopics).sort(),
    affectedSurfaces: [`${surface.surfaceType}:${surface.surfaceSlug}`],
    reviewedAt: null,
    reviewAgeDays: null,
    downgradeRecommended,
    suppressEnrichedSectionRecommended: suppress,
    enrichedRenderingRecommendation: suppress ? 'hide' : downgradeRecommended ? 'downgrade' : 'remain',
  }
}

function run() {
  const health = readJson<HealthReport>(HEALTH_REPORT_PATH)
  const backlog = maybeReadJson<BacklogReport>(BACKLOG_REPORT_PATH)
  const governedRows = readJson<GovernedRow[]>(GOVERNED_PATH)
  const sourceRegistry = readJson<SourceRegistryRow[]>(SOURCE_REGISTRY_PATH)

  const inactiveSourceIds = new Set(
    sourceRegistry.filter(source => source.active === false).map(source => source.sourceId),
  )

  const governedByEntity = new Map(
    governedRows.map(row => [entityKey(row.entityType, row.entitySlug), row.researchEnrichment]),
  )

  const priorityByEntity = new Map(
    (backlog?.items || [])
      .filter(item => item.itemType === 'entity' && item.entityType && item.entitySlug)
      .map(item => [entityKey(item.entityType as EntityType, item.entitySlug as string), item.publicPriorityScore]),
  )

  const priorityBySurface = new Map(
    (backlog?.items || [])
      .filter(item => item.itemType === 'surface' && item.surfaceType && item.surfaceId)
      .map(item => [`${item.surfaceType}:${item.surfaceId}`, item.publicPriorityScore]),
  )

  const entityRows: ReviewCycleRecord[] = health.entities
    .map(entity => {
      const key = entityKey(entity.entityType, entity.entitySlug)
      const governed = governedByEntity.get(key) || null
      const sourceIds = governed?.sourceRegistryIds || []
      const inactiveRefs = sourceIds.filter(sourceId => inactiveSourceIds.has(sourceId))
      const classified = classifyEntityReviewCycle({
        health: entity,
        governed,
        inactiveSourceRefs: inactiveRefs,
        publicPriorityScore: priorityByEntity.get(key) || 0,
      })

      return {
        itemType: 'entity',
        entityType: entity.entityType,
        entitySlug: entity.entitySlug,
        publicStatus: entity.publicStatus,
        enrichmentHealthState: entity.enrichmentHealthState,
        ...classified,
      }
    })
    .sort((a, b) => `${a.entityType}:${a.entitySlug}`.localeCompare(`${b.entityType}:${b.entitySlug}`))

  const surfaceRows: ReviewCycleRecord[] = health.surfaces
    .map(surface => {
      const key = `${surface.surfaceType}:${surface.surfaceSlug}`
      const classified = classifySurfaceReviewCycle({
        surface,
        publicPriorityScore: priorityBySurface.get(key) || 0,
      })

      return {
        itemType: 'surface',
        surfaceType: surface.surfaceType,
        surfaceId: surface.surfaceSlug,
        publicStatus:
          surface.surfaceType === 'collection' || surface.surfaceType === 'comparison'
            ? 'indexable_surface'
            : 'public_surface',
        enrichmentHealthState: surface.enrichmentHealthState,
        ...classified,
      }
    })
    .sort((a, b) => `${a.surfaceType}:${a.surfaceId}`.localeCompare(`${b.surfaceType}:${b.surfaceId}`))

  const items = [...entityRows, ...surfaceRows]
  const reviewCycleCounts = items.reduce<Record<ReviewCycleState, number>>(
    (acc, item) => {
      acc[item.reviewCycleState] += 1
      return acc
    },
    {
      fresh: 0,
      review_due: 0,
      urgent_review_due: 0,
      downgrade_recommended: 0,
      depublish_or_hide_enriched_section: 0,
      blocked_pending_review: 0,
    },
  )

  const urgencyCounts = items.reduce<Record<RefreshUrgency, number>>(
    (acc, item) => {
      acc[item.refreshUrgency] += 1
      return acc
    },
    { routine: 0, scheduled: 0, high: 0, urgent: 0, immediate: 0 },
  )

  const highRisk = items
    .filter(
      item =>
        item.reviewCycleState === 'urgent_review_due' ||
        item.reviewCycleState === 'depublish_or_hide_enriched_section' ||
        item.reviewCycleState === 'blocked_pending_review' ||
        item.reviewCycleState === 'downgrade_recommended',
    )
    .sort((a, b) => {
      const urgencyRank = { immediate: 5, urgent: 4, high: 3, scheduled: 2, routine: 1 }
      if (urgencyRank[b.refreshUrgency] !== urgencyRank[a.refreshUrgency]) {
        return urgencyRank[b.refreshUrgency] - urgencyRank[a.refreshUrgency]
      }
      const aKey = a.itemType === 'entity' ? `${a.entityType}:${a.entitySlug}` : `${a.surfaceType}:${a.surfaceId}`
      const bKey = b.itemType === 'entity' ? `${b.entityType}:${b.entitySlug}` : `${b.surfaceType}:${b.surfaceId}`
      return aKey.localeCompare(bKey)
    })

  const report = {
    generatedAt: new Date().toISOString(),
    sources: {
      enrichmentHealth: path.relative(ROOT, HEALTH_REPORT_PATH),
      enrichmentBacklog: backlog ? path.relative(ROOT, BACKLOG_REPORT_PATH) : null,
      governedRollup: path.relative(ROOT, GOVERNED_PATH),
      sourceRegistry: path.relative(ROOT, SOURCE_REGISTRY_PATH),
    },
    policy: {
      deterministic: true,
      reviewCycleStates: [
        'fresh',
        'review_due',
        'urgent_review_due',
        'downgrade_recommended',
        'depublish_or_hide_enriched_section',
        'blocked_pending_review',
      ],
      cadences: {
        default: {
          reviewDueDays: POLICY.defaultReviewDueDays,
          urgentReviewDays: POLICY.defaultUrgentReviewDays,
        },
        safetyOrInteractions: {
          reviewDueDays: POLICY.safetyReviewDueDays,
          urgentReviewDays: POLICY.safetyUrgentReviewDays,
        },
        weakOrConflictingEvidence: {
          reviewDueDays: POLICY.weakEvidenceReviewDueDays,
          urgentReviewDays: POLICY.weakEvidenceUrgentReviewDays,
        },
        highPriorityAccelerationDays: POLICY.highPriorityAccelerationDays,
      },
      staleSurfaceUrgentThreshold: POLICY.staleSurfaceUrgentThreshold,
      governanceRule: 'Never weaken publish gating; stale/risky content may be downgraded or hidden until review.',
    },
    summary: {
      totalItems: items.length,
      entitiesEvaluated: entityRows.length,
      surfacesEvaluated: surfaceRows.length,
      reviewCycleCounts,
      urgencyCounts,
      hideRecommendations: items.filter(item => item.suppressEnrichedSectionRecommended).length,
      downgradeRecommendations: items.filter(item => item.downgradeRecommended).length,
      highRiskQueueSize: highRisk.length,
      highRiskPreview: highRisk.slice(0, 20),
    },
    items,
  }

  const md = [
    '# Enrichment Review-Cycle Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Review-cycle state counts',
    ...Object.entries(reviewCycleCounts).map(([state, count]) => `- ${state}: ${count}`),
    '',
    '## Refresh urgency counts',
    ...Object.entries(urgencyCounts).map(([state, count]) => `- ${state}: ${count}`),
    '',
    '## Immediate hide/suppress recommendations',
    ...items
      .filter(item => item.suppressEnrichedSectionRecommended)
      .slice(0, 20)
      .map(item => {
        const id = item.itemType === 'entity' ? `${item.entityType}:${item.entitySlug}` : `${item.surfaceType}:${item.surfaceId}`
        return `- ${id} -> ${item.reviewCycleState} :: ${item.recommendedAction}`
      }),
    '',
    '## High priority urgent/downgrade items (top 20)',
    ...highRisk.slice(0, 20).map(item => {
      const id = item.itemType === 'entity' ? `${item.entityType}:${item.entitySlug}` : `${item.surfaceType}:${item.surfaceId}`
      const reasons = item.reasons.slice(0, 3).join('; ') || 'no explicit reason listed'
      return `- ${id} [${item.refreshUrgency}] state=${item.reviewCycleState} reasons=${reasons}`
    }),
    '',
    '## Contractor next steps',
    '- 1) Handle all `depublish_or_hide_enriched_section` and `blocked_pending_review` items first.',
    '- 2) Resolve `urgent_review_due` for indexable entities and discovery surfaces in the next cycle.',
    '- 3) Apply `downgrade_recommended` fallbacks where refresh cannot complete before publish deadlines.',
    '- 4) Re-run `npm run report:enrichment-review-cycle` after each review batch to confirm risk burn-down.',
    '',
  ].join('\n')

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUTPUT_MD, md, 'utf8')

  console.log(
    `[report-enrichment-review-cycle] wrote ${path.relative(ROOT, OUTPUT_JSON)} items=${items.length} highRisk=${highRisk.length}`,
  )
  console.log(`[report-enrichment-review-cycle] wrote ${path.relative(ROOT, OUTPUT_MD)}`)
}

run()
