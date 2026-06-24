#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'

type ResponseClass = 'do_now' | 'rollback_attention' | 'next_sprint' | 'watch_closely' | 'defer' | 'no_action'
type Severity = 'low' | 'medium' | 'high' | 'critical'
type WatchState = 'stable' | 'improving' | 'watch_closely' | 'degraded' | 'critical_follow_up' | 'unknown'
type OwnerType = 'engineering' | 'content_ops' | 'review_ops' | 'analytics_ops' | 'seo_ops' | 'compliance_ops' | 'release_owner' | 'unknown'

type FollowUpItem = {
  itemType: string
  pageType?: string
  surfaceType?: string
  entitySlug?: string
  surfaceId?: string
  currentWatchState: WatchState
  severity: Severity
  recommendedResponseClass: ResponseClass
  likelyCauseCategory: string
  rollbackAttention: boolean
  blockerReason: string | null
  anomalyReason: string | null
  recommendedNextAction: string
  affectedSurfacesOrEntities: string[]
  followUpOwnerType: OwnerType
  notes: string
}

type PostReleaseWatch = {
  generatedAt?: string
  deterministicModelVersion?: string
  releaseScope?: {
    canonicalGovernedPublicArtifactPaths?: string[]
    deterministicSignalSources?: string[]
  }
  watchedDimensions?: Array<{
    dimensionId?: string
    watchedSurface?: string
    watchState?: WatchState
    severity?: Severity
    likelyCauseCategory?: string
    rollbackAttention?: boolean
    changeSignalDetected?: string
    recommendedFollowUpAction?: string
    affectedEntitiesOrSurfaces?: string[]
    supportingMetrics?: Record<string, unknown>
  }>
}

type ReleaseReadiness = {
  generatedAt?: string
  releaseState?: string
  summary?: { blockedDimensions?: number; failedDimensions?: number; warnedDimensions?: number }
}

type Scorecard = {
  generatedAt?: string
  summary?: {
    surfacesWithVisibilityButNoInteractions?: number
    surfacesWithMeaningfulEngagement?: number
  }
  surfaces?: Array<{
    surface?: string
    baselineVisibilityCount?: number
    interactionCount?: number
    hasMeaningfulEngagement?: boolean
  }>
}

type ReviewCycle = {
  generatedAt?: string
  items?: Array<{
    itemType?: 'entity' | 'surface'
    entityType?: 'herb' | 'compound'
    entitySlug?: string
    surfaceType?: string
    surfaceId?: string
    reviewCycleState?: string
    refreshUrgency?: string
    enrichedRenderingRecommendation?: 'remain' | 'downgrade' | 'hide'
    reasons?: string[]
    recommendedAction?: string
    affectedSurfaces?: string[]
  }>
}

const ROOT = process.cwd()
const INPUTS = {
  postReleaseWatch: path.join(ROOT, 'ops', 'reports', 'governed-post-release-watch.json'),
  releaseReadiness: path.join(ROOT, 'ops', 'reports', 'governed-release-readiness.json'),
  scorecard: path.join(ROOT, 'ops', 'reports', 'governed-scorecard.json'),
  reviewCycle: path.join(ROOT, 'ops', 'reports', 'enrichment-review-cycle.json'),
  publicationManifest: path.join(ROOT, 'public', 'data', 'publication-manifest.json'),
  indexableHerbs: path.join(ROOT, 'public', 'data', 'indexable-herbs.json'),
  indexableCompounds: path.join(ROOT, 'public', 'data', 'indexable-compounds.json'),
  governedArtifact: path.join(ROOT, 'public', 'data', 'enrichment-governed.json'),
} as const

const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-followup-queue.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-followup-queue.md')

function readJsonIfExists<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function count(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function ownerForCategory(category: string): OwnerType {
  if (category.includes('analytics')) return 'analytics_ops'
  if (category.includes('compliance') || category.includes('cta')) return 'compliance_ops'
  if (category.includes('publication') || category.includes('noindex')) return 'seo_ops'
  if (category.includes('freshness') || category.includes('review')) return 'review_ops'
  if (category.includes('enrichment')) return 'content_ops'
  if (category.includes('release') || category.includes('regression') || category.includes('governance')) return 'engineering'
  return 'unknown'
}

function classifyDimensionResponse(args: {
  watchState: WatchState
  severity: Severity
  rollbackAttention: boolean
  category: string
}): ResponseClass {
  const { watchState, severity, rollbackAttention, category } = args
  if (rollbackAttention) return 'rollback_attention'
  if (watchState === 'critical_follow_up') return 'do_now'
  if (watchState === 'degraded' && (severity === 'critical' || severity === 'high')) {
    if (category === 'low_severity_watch_only') return 'watch_closely'
    return 'do_now'
  }
  if (watchState === 'degraded') return 'next_sprint'
  if (watchState === 'watch_closely') return 'watch_closely'
  if (watchState === 'improving') return 'no_action'
  return 'no_action'
}

function mapDimensionCategory(dimensionId: string): string {
  if (dimensionId.includes('ux_regression')) return 'immediate_regression_fix_needed'
  if (dimensionId.includes('release_readiness')) return 'rollback_attention_needed'
  if (dimensionId.includes('blocked_unreviewed_leakage')) return 'governed_leakage_follow_up'
  if (dimensionId.includes('browse_search_filter') || dimensionId.includes('homepage_landing')) return 'weak_ux_surface_follow_up'
  if (dimensionId.includes('discovery_conversion_engagement')) return 'scorecard_underperformance_follow_up'
  if (dimensionId.includes('freshness_review') || dimensionId.includes('enrichment_health')) return 'freshness_review_cycle_follow_up'
  if (dimensionId.includes('publication_quality_noindex')) return 'noindex_publication_drift_follow_up'
  if (dimensionId.includes('cta_commercial')) return 'cta_commercial_compliance_follow_up'
  return 'low_severity_watch_only'
}

function dimensionToItem(row: NonNullable<PostReleaseWatch['watchedDimensions']>[number]): FollowUpItem {
  const dimensionId = String(row.dimensionId || 'unknown_dimension')
  const category = mapDimensionCategory(dimensionId)
  const watchState = row.watchState || 'unknown'
  const severity = row.severity || 'medium'
  const rollbackAttention = row.rollbackAttention === true

  return {
    itemType: category,
    pageType: undefined,
    surfaceType: row.watchedSurface || 'unknown_surface',
    entitySlug: undefined,
    surfaceId: dimensionId,
    currentWatchState: watchState,
    severity,
    recommendedResponseClass: classifyDimensionResponse({ watchState, severity, rollbackAttention, category }),
    likelyCauseCategory: row.likelyCauseCategory || 'unknown',
    rollbackAttention,
    blockerReason: watchState === 'critical_follow_up' ? row.changeSignalDetected || null : null,
    anomalyReason: watchState === 'degraded' || watchState === 'watch_closely' ? row.changeSignalDetected || null : null,
    recommendedNextAction: row.recommendedFollowUpAction || 'Review upstream report and determine deterministic follow-up owner.',
    affectedSurfacesOrEntities: row.affectedEntitiesOrSurfaces || [],
    followUpOwnerType: ownerForCategory(category),
    notes: `watch_dimension:${dimensionId}`,
  }
}

function reviewCycleToItems(reviewCycle: ReviewCycle | null): FollowUpItem[] {
  if (!reviewCycle?.items) return []

  return reviewCycle.items.slice(0, 40).map(item => {
    const state = String(item.reviewCycleState || 'unknown')
    const urgency = String(item.refreshUrgency || 'routine')
    const recommendation = item.enrichedRenderingRecommendation || 'remain'

    let responseClass: ResponseClass = 'watch_closely'
    let severity: Severity = 'medium'
    let rollbackAttention = false

    if (recommendation === 'hide') {
      responseClass = state === 'blocked_pending_review' ? 'rollback_attention' : 'do_now'
      severity = 'critical'
      rollbackAttention = state === 'blocked_pending_review'
    } else if (urgency === 'immediate' || urgency === 'urgent_review_due' || urgency === 'urgent') {
      responseClass = 'do_now'
      severity = 'high'
    } else if (recommendation === 'downgrade' || state === 'downgrade_recommended') {
      responseClass = 'next_sprint'
      severity = 'medium'
    } else if (state === 'fresh') {
      responseClass = 'no_action'
      severity = 'low'
    }

    return {
      itemType: 'freshness_review_cycle_follow_up',
      pageType: item.itemType === 'entity' ? `${item.entityType || 'entity'}_detail` : undefined,
      surfaceType: item.itemType === 'surface' ? item.surfaceType || 'surface' : 'entity_detail',
      entitySlug: item.entitySlug,
      surfaceId: item.surfaceId,
      currentWatchState: responseClass === 'no_action' ? 'stable' : responseClass === 'watch_closely' ? 'watch_closely' : 'degraded',
      severity,
      recommendedResponseClass: responseClass,
      likelyCauseCategory: 'freshness_review_regression',
      rollbackAttention,
      blockerReason: rollbackAttention ? (item.reasons || []).join('; ') || null : null,
      anomalyReason: !rollbackAttention ? (item.reasons || []).join('; ') || null : null,
      recommendedNextAction: item.recommendedAction || 'Follow review-cycle recommendation.',
      affectedSurfacesOrEntities: item.affectedSurfaces || (item.entitySlug ? [item.entitySlug] : []),
      followUpOwnerType: 'review_ops',
      notes: `review_cycle_state:${state};urgency:${urgency};rendering:${recommendation}`,
    }
  })
}

function buildScorecardItems(scorecard: Scorecard | null): FollowUpItem[] {
  if (!scorecard?.surfaces) return []
  return scorecard.surfaces
    .filter(row => count(row.baselineVisibilityCount) > 0 && count(row.interactionCount) === 0)
    .map(row => ({
      itemType: 'scorecard_underperformance_follow_up',
      surfaceType: row.surface || 'unknown_surface',
      surfaceId: row.surface || 'unknown_surface',
      currentWatchState: 'degraded' as WatchState,
      severity: count(row.baselineVisibilityCount) >= 10 ? ('high' as Severity) : ('medium' as Severity),
      recommendedResponseClass: count(row.baselineVisibilityCount) >= 10 ? ('next_sprint' as ResponseClass) : ('watch_closely' as ResponseClass),
      likelyCauseCategory: 'engagement_underperformance',
      rollbackAttention: false,
      blockerReason: null,
      anomalyReason: 'Surface has deterministic visibility but zero interactions in current scorecard snapshot.',
      recommendedNextAction:
        count(row.baselineVisibilityCount) >= 10
          ? 'Open targeted UX/content refinement ticket for next sprint and verify in next scorecard snapshot.'
          : 'Keep in watch list until additional post-release samples are available.',
      affectedSurfacesOrEntities: [row.surface || 'unknown_surface'],
      followUpOwnerType: 'analytics_ops' as OwnerType,
      notes: `baseline=${count(row.baselineVisibilityCount)};interactions=0;meaningful=${Boolean(row.hasMeaningfulEngagement)}`,
    }))
}

function summarizeByResponse(items: FollowUpItem[]): Record<ResponseClass, number> {
  const seed: Record<ResponseClass, number> = {
    do_now: 0,
    rollback_attention: 0,
    next_sprint: 0,
    watch_closely: 0,
    defer: 0,
    no_action: 0,
  }
  for (const item of items) seed[item.recommendedResponseClass] += 1
  return seed
}

function main() {
  const postReleaseWatch = readJsonIfExists<PostReleaseWatch>(INPUTS.postReleaseWatch)
  const releaseReadiness = readJsonIfExists<ReleaseReadiness>(INPUTS.releaseReadiness)
  const scorecard = readJsonIfExists<Scorecard>(INPUTS.scorecard)
  const reviewCycle = readJsonIfExists<ReviewCycle>(INPUTS.reviewCycle)

  const publicationManifest = readJsonIfExists<{ entities?: { herbs?: unknown[]; compounds?: unknown[] } }>(INPUTS.publicationManifest)
  const indexableHerbs = readJsonIfExists<unknown[]>(INPUTS.indexableHerbs) || []
  const indexableCompounds = readJsonIfExists<unknown[]>(INPUTS.indexableCompounds) || []
  const governedArtifact = readJsonIfExists<unknown[]>(INPUTS.governedArtifact) || []

  const queueItems: FollowUpItem[] = []

  if (postReleaseWatch?.watchedDimensions?.length) {
    queueItems.push(...postReleaseWatch.watchedDimensions.map(dimensionToItem))
  } else {
    queueItems.push({
      itemType: 'low_severity_watch_only',
      surfaceType: 'governed_post_release_watch',
      surfaceId: 'missing_post_release_watch_input',
      currentWatchState: 'watch_closely',
      severity: 'medium',
      recommendedResponseClass: 'watch_closely',
      likelyCauseCategory: 'missing_required_input',
      rollbackAttention: false,
      blockerReason: null,
      anomalyReason: 'Missing ops/reports/governed-post-release-watch.json input.',
      recommendedNextAction: 'Run npm run report:governed-post-release-watch before generating follow-up queue.',
      affectedSurfacesOrEntities: ['ops/reports/governed-post-release-watch.json'],
      followUpOwnerType: 'release_owner',
      notes: 'upstream_input_missing',
    })
  }

  queueItems.push(...reviewCycleToItems(reviewCycle))
  queueItems.push(...buildScorecardItems(scorecard))

  const responseCounts = summarizeByResponse(queueItems)

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-followup-queue-v1',
    queueModel: {
      responseClasses: ['do_now', 'rollback_attention', 'next_sprint', 'watch_closely', 'defer', 'no_action'],
      priorityLogic:
        'rollback_attention if rollback flag or hide/suppress signal; do_now for critical/degraded urgent signals; next_sprint for non-blocking degraded underperformance; watch_closely for sparse/early signals; no_action for stable/improving/fresh states.',
    },
    sourceSnapshots: {
      postReleaseWatchGeneratedAt: postReleaseWatch?.generatedAt || null,
      releaseReadinessGeneratedAt: releaseReadiness?.generatedAt || null,
      scorecardGeneratedAt: scorecard?.generatedAt || null,
      reviewCycleGeneratedAt: reviewCycle?.generatedAt || null,
    },
    publicationContext: {
      manifestEntities: count(publicationManifest?.entities?.herbs?.length) + count(publicationManifest?.entities?.compounds?.length),
      indexableEntities: indexableHerbs.length + indexableCompounds.length,
      governedArtifactEntities: governedArtifact.length,
      canonicalGovernedArtifactPaths:
        postReleaseWatch?.releaseScope?.canonicalGovernedPublicArtifactPaths || [
          'public/data/enrichment-governed.json',
          'public/data/publication-manifest.json',
          'public/data/indexable-herbs.json',
          'public/data/indexable-compounds.json',
        ],
    },
    summary: {
      totalItems: queueItems.length,
      countsByResponseClass: responseCounts,
      rollbackAttentionCount: responseCounts.rollback_attention,
      urgentDoNowCount: responseCounts.do_now,
    },
    items: queueItems,
  }

  const byClass = (klass: ResponseClass) => queueItems.filter(row => row.recommendedResponseClass === klass)
  const top = (klass: ResponseClass, n = 5) => byClass(klass).slice(0, n)

  const lines: string[] = []
  lines.push('# Governed follow-up queue')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Deterministic model: ${report.deterministicModelVersion}`)
  lines.push('')
  lines.push('## Queue summary')
  lines.push(`- do_now: ${responseCounts.do_now}`)
  lines.push(`- rollback_attention: ${responseCounts.rollback_attention}`)
  lines.push(`- next_sprint: ${responseCounts.next_sprint}`)
  lines.push(`- watch_closely: ${responseCounts.watch_closely}`)
  lines.push(`- defer: ${responseCounts.defer}`)
  lines.push(`- no_action: ${responseCounts.no_action}`)
  lines.push('')
  lines.push('## Contractor checklist')
  lines.push('1. Execute all rollback_attention items first; open rollback triage thread with blocker/anomaly evidence.')
  lines.push('2. Address do_now items in the current response window and attach verification rerun output.')
  lines.push('3. Convert next_sprint items into scoped tickets linked to owning surface/entity.')
  lines.push('4. Keep watch_closely items in the next post-release snapshot review; do not overreact to low-sample noise.')
  lines.push('5. Leave no_action items untouched unless a new regression signal appears.')
  lines.push('')
  lines.push('## Example triage rows')
  for (const row of [
    ...top('do_now', 1),
    ...top('rollback_attention', 1),
    ...top('watch_closely', 1),
  ]) {
    lines.push(`- ${row.recommendedResponseClass}: ${row.itemType} (${row.surfaceId || row.entitySlug || row.surfaceType || 'n/a'}) → ${row.recommendedNextAction}`)
  }
  lines.push('')
  lines.push('## Queue table')
  lines.push('| response | itemType | surface/entity | severity | rollback | next action |')
  lines.push('| --- | --- | --- | --- | --- | --- |')
  for (const row of queueItems) {
    const target = row.entitySlug || row.surfaceId || row.surfaceType || row.pageType || 'n/a'
    lines.push(
      `| ${row.recommendedResponseClass} | ${row.itemType} | ${target} | ${row.severity} | ${row.rollbackAttention ? 'yes' : 'no'} | ${row.recommendedNextAction.replace(/\|/g, '\\|')} |`,
    )
  }

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`[report:governed-followup-queue] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[report:governed-followup-queue] wrote ${path.relative(ROOT, OUT_MD)}`)
}

main()
