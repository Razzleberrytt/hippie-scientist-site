#!/usr/bin/env tsx
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

type TrendClass = 'improving' | 'stable' | 'mixed' | 'degrading' | 'critical_regression'
type ReleaseState = 'ready' | 'ready_with_known_risks' | 'needs_follow_up' | 'blocked' | 'unknown'
type Status = 'pass' | 'warn' | 'fail' | 'blocked' | 'missing_input' | 'unknown'

type ReadinessReport = {
  generatedAt?: string
  releaseState?: ReleaseState
  dimensions?: Array<{ id?: string; status?: Status; metrics?: Record<string, unknown>; summary?: string }>
  blockerReasons?: string[]
  knownRisks?: string[]
}

type PostReleaseWatchReport = {
  generatedAt?: string
  watchedDimensions?: Array<{ watchState?: string; severity?: string; rollbackAttention?: boolean }>
  summary?: {
    byWatchState?: Record<string, number>
    bySeverity?: Record<string, number>
    rollbackAttentionCount?: number
  }
}

type FollowUpQueueReport = {
  generatedAt?: string
  summary?: {
    totalItems?: number
    countsByResponseClass?: Record<string, number>
    rollbackAttentionCount?: number
    urgentDoNowCount?: number
  }
}

type EnrichmentHealthReport = {
  generatedAt?: string
  summary?: {
    entitiesEvaluated?: number
    staleEntities?: number
    blockedEntities?: number
    missingGovernedEntities?: number
    indexableEntitiesWithoutHealthyState?: number
  }
}

type ReviewFreshnessReport = {
  generatedAt?: string
  totals?: {
    evaluatedPages?: number
    pagesGainedVisibility?: number
    pagesIntentionallyUnchanged?: number
  }
  verification?: {
    passed?: boolean
    blockedOrRejectedLeaks?: string[]
  }
}

type ScorecardReport = {
  generatedAt?: string
  summary?: {
    surfacesWithVisibilityButNoInteractions?: number
    surfacesWithMeaningfulEngagement?: number
    insufficientDataCases?: number
    analyticsEventCount?: number
  }
}

type DimensionSnapshot = {
  id: string
  label: string
  score: number
  status: string
  metrics: Record<string, number | string | boolean>
}

type Snapshot = {
  snapshotId: string
  releaseId: string
  createdAt: string
  generatedFrom: Record<string, string | null>
  readinessState: ReleaseState
  watchSummary: Record<string, unknown>
  followUpSummary: Record<string, unknown>
  regressionStatus: Record<string, unknown>
  leakageStatus: Record<string, unknown>
  enrichmentHealthSummary: Record<string, unknown>
  freshnessCoverageSummary: Record<string, unknown>
  scorecardSummary: Record<string, unknown>
  publicCriticalGapSummary: Record<string, unknown>
  ctaComplianceSummary: Record<string, unknown>
  noindexPublicationSummary: Record<string, unknown>
  dimensions: DimensionSnapshot[]
  overallRiskScore: number
  notes: string[]
  sourceFingerprint: string
}

type HistoryFile = {
  generatedAt: string
  deterministicModelVersion: string
  snapshots: Snapshot[]
  latestSnapshotId: string
  comparison: {
    currentSnapshotId: string
    comparedAgainstSnapshotIds: string[]
    trend: TrendClass
    dimensionTrends: Array<{
      id: string
      label: string
      trend: TrendClass
      currentScore: number
      priorScore: number | null
      delta: number | null
      reason: string
    }>
    biggestImprovements: Array<{ id: string; label: string; delta: number }>
    biggestRegressions: Array<{ id: string; label: string; delta: number }>
    noMeaningfulChange: Array<{ id: string; label: string; delta: number | null }>
    followUpQueuePressure: {
      current: number
      prior: number | null
      delta: number | null
      trend: TrendClass
    }
  }
  trendClassificationExamples: Array<{
    trend: TrendClass
    deterministicExample: string
  }>
}

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-release-history.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-release-history.md')
const SNAPSHOT_STORE = path.join(ROOT, 'ops', 'reports', 'governed-release-history-snapshots.json')

const INPUTS = {
  readiness: 'ops/reports/governed-release-readiness.json',
  postReleaseWatch: 'ops/reports/governed-post-release-watch.json',
  followUpQueue: 'ops/reports/governed-followup-queue.json',
  uxRegression: 'ops/reports/governed-ux-regression.json',
  enrichmentHealth: 'ops/reports/enrichment-health.json',
  reviewFreshness: 'ops/reports/governed-review-freshness.json',
  scorecard: 'ops/reports/governed-scorecard.json',
} as const

function readJsonIfExists<T>(relPath: string): T | null {
  const full = path.join(ROOT, relPath)
  if (!fs.existsSync(full)) return null
  return JSON.parse(fs.readFileSync(full, 'utf8')) as T
}

function asCount(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function findReadinessDimension(report: ReadinessReport | null, id: string) {
  return report?.dimensions?.find(row => String(row.id || '') === id)
}

function statusToRisk(status: string): number {
  if (status === 'pass') return 0
  if (status === 'warn') return 50
  if (status === 'fail') return 80
  if (status === 'blocked' || status === 'missing_input') return 100
  return 30
}

function trendFromDelta(args: { current: number; prior: number | null; criticalThreshold?: number }): { trend: TrendClass; delta: number | null } {
  const { current, prior, criticalThreshold = 90 } = args
  if (prior === null) return { trend: 'stable', delta: null }
  const delta = current - prior
  if (current >= criticalThreshold && prior < criticalThreshold && delta >= 8) return { trend: 'critical_regression', delta }
  if (delta >= 8) return { trend: 'degrading', delta }
  if (delta <= -8) return { trend: 'improving', delta }
  return { trend: 'stable', delta }
}

function buildSnapshot(): Snapshot {
  const readiness = readJsonIfExists<ReadinessReport>(INPUTS.readiness)
  const watch = readJsonIfExists<PostReleaseWatchReport>(INPUTS.postReleaseWatch)
  const followup = readJsonIfExists<FollowUpQueueReport>(INPUTS.followUpQueue)
  const uxRegression = readJsonIfExists<{ pass?: boolean; totals?: { failed?: number; checks?: number } }>(INPUTS.uxRegression)
  const health = readJsonIfExists<EnrichmentHealthReport>(INPUTS.enrichmentHealth)
  const freshness = readJsonIfExists<ReviewFreshnessReport>(INPUTS.reviewFreshness)
  const scorecard = readJsonIfExists<ScorecardReport>(INPUTS.scorecard)

  const generatedFrom: Record<string, string | null> = {
    readiness: readiness?.generatedAt || null,
    postReleaseWatch: watch?.generatedAt || null,
    followUpQueue: followup?.generatedAt || null,
    uxRegression: readJsonIfExists<{ generatedAt?: string }>(INPUTS.uxRegression)?.generatedAt || null,
    enrichmentHealth: health?.generatedAt || null,
    reviewFreshness: freshness?.generatedAt || null,
    scorecard: scorecard?.generatedAt || null,
  }

  const readinessState = (readiness?.releaseState || 'unknown') as ReleaseState
  const readinessScore = clamp({ ready: 0, ready_with_known_risks: 30, needs_follow_up: 65, blocked: 100, unknown: 50 }[readinessState] ?? 50)

  const failedUxChecks = asCount(uxRegression?.totals?.failed)
  const regressionScore = uxRegression?.pass === true ? 0 : clamp(failedUxChecks * 20 + (uxRegression ? 15 : 40))

  const leakageDimension = findReadinessDimension(readiness, 'blocked_unreviewed_leakage_checks')
  const leakageLeaks = asCount((leakageDimension?.metrics || {}).blockedOrRejectedVisibleCount)
  const freshnessLeaks = freshness?.verification?.blockedOrRejectedLeaks?.length || 0
  const leakageScore = clamp(Math.max(statusToRisk(String(leakageDimension?.status || 'unknown')), leakageLeaks * 40, freshnessLeaks * 60))

  const entitiesEvaluated = asCount(health?.summary?.entitiesEvaluated)
  const blockedEntities = asCount(health?.summary?.blockedEntities)
  const staleEntities = asCount(health?.summary?.staleEntities)
  const missingGovernedEntities = asCount(health?.summary?.missingGovernedEntities)
  const indexableWithoutHealthy = asCount(health?.summary?.indexableEntitiesWithoutHealthyState)
  const enrichmentBurden = blockedEntities * 2 + staleEntities + missingGovernedEntities + indexableWithoutHealthy * 2
  const enrichmentScore = clamp(entitiesEvaluated > 0 ? (enrichmentBurden / entitiesEvaluated) * 100 : 50)

  const freshnessEvaluated = asCount(freshness?.totals?.evaluatedPages)
  const gainedVisibility = asCount(freshness?.totals?.pagesGainedVisibility)
  const unchangedPages = asCount(freshness?.totals?.pagesIntentionallyUnchanged)
  const unchangedRatio = freshnessEvaluated > 0 ? unchangedPages / freshnessEvaluated : 0
  const freshnessScore = clamp((freshnessLeaks > 0 ? 100 : 0) + (gainedVisibility === 0 ? 25 : 0) + unchangedRatio * 30)

  const noInteractions = asCount(scorecard?.summary?.surfacesWithVisibilityButNoInteractions)
  const meaningful = asCount(scorecard?.summary?.surfacesWithMeaningfulEngagement)
  const insufficientDataCases = asCount(scorecard?.summary?.insufficientDataCases)
  const scorecardScore = clamp(noInteractions * 15 + insufficientDataCases * 8 - meaningful * 6)

  const publicGapDimension = findReadinessDimension(readiness, 'public_indexable_critical_gaps')
  const publicGapScore = clamp(
    Math.max(
      statusToRisk(String(publicGapDimension?.status || 'unknown')),
      asCount((publicGapDimension?.metrics || {}).criticalGapCount) * 35,
    ),
  )

  const ctaDimension = findReadinessDimension(readiness, 'cta_commercial_compliance_state')
  const ctaScore = clamp(
    Math.max(
      statusToRisk(String(ctaDimension?.status || 'unknown')),
      asCount((ctaDimension?.metrics || {}).governedCtaRowsWithoutToolFirst) * 50,
    ),
  )

  const noindexDimension = findReadinessDimension(readiness, 'noindex_publication_quality_alignment')
  const noindexScore = clamp(
    Math.max(
      statusToRisk(String(noindexDimension?.status || 'unknown')),
      asCount((noindexDimension?.metrics || {}).noindexRouteMissingCount) * 50 +
        asCount((noindexDimension?.metrics || {}).indexableRouteMisalignmentCount) * 50,
    ),
  )

  const watchByState: Record<string, number> = {}
  const watchBySeverity: Record<string, number> = {}
  let rollbackAttentionCount = asCount(watch?.summary?.rollbackAttentionCount)
  for (const row of watch?.watchedDimensions || []) {
    const state = String(row.watchState || 'unknown')
    const severity = String(row.severity || 'unknown')
    watchByState[state] = (watchByState[state] || 0) + 1
    watchBySeverity[severity] = (watchBySeverity[severity] || 0) + 1
    if (row.rollbackAttention) rollbackAttentionCount += 1
  }
  const watchScore = clamp(
    asCount(watchByState.critical_follow_up) * 30 + asCount(watchByState.degraded) * 12 + asCount(watchByState.watch_closely) * 4 + rollbackAttentionCount * 20,
  )

  const byResponse = followup?.summary?.countsByResponseClass || {}
  const followUpPressure = clamp(
    asCount(byResponse.rollback_attention) * 30 +
      asCount(byResponse.do_now) * 15 +
      asCount(byResponse.next_sprint) * 6 +
      asCount(byResponse.watch_closely) * 2,
  )

  const dimensionRows: DimensionSnapshot[] = [
    {
      id: 'release_readiness_state',
      label: 'Release readiness state',
      score: readinessScore,
      status: readinessState,
      metrics: {
        releaseState: readinessState,
        blockers: readiness?.blockerReasons?.length || 0,
        knownRisks: readiness?.knownRisks?.length || 0,
      },
    },
    {
      id: 'governed_ux_regression_status',
      label: 'Governed UX regression status',
      score: regressionScore,
      status: uxRegression?.pass ? 'pass' : 'fail_or_missing',
      metrics: {
        failedChecks: failedUxChecks,
        totalChecks: asCount(uxRegression?.totals?.checks),
      },
    },
    {
      id: 'blocked_unreviewed_leakage_status',
      label: 'Blocked/unreviewed leakage status',
      score: leakageScore,
      status: String(leakageDimension?.status || 'unknown'),
      metrics: {
        blockedOrRejectedVisibleCount: leakageLeaks,
        freshnessBlockedLeakCount: freshnessLeaks,
      },
    },
    {
      id: 'enrichment_health_state',
      label: 'Enrichment health state',
      score: enrichmentScore,
      status: 'computed',
      metrics: {
        entitiesEvaluated,
        blockedEntities,
        staleEntities,
        missingGovernedEntities,
        indexableWithoutHealthy,
      },
    },
    {
      id: 'freshness_review_coverage',
      label: 'Freshness and review coverage',
      score: freshnessScore,
      status: freshness?.verification?.passed === false ? 'fail' : 'pass_or_missing',
      metrics: {
        freshnessEvaluated,
        pagesGainedVisibility: gainedVisibility,
        pagesIntentionallyUnchanged: unchangedPages,
        blockedLeakCount: freshnessLeaks,
      },
    },
    {
      id: 'discovery_conversion_scorecard',
      label: 'Governed discovery/conversion scorecard',
      score: scorecardScore,
      status: 'computed',
      metrics: {
        surfacesWithVisibilityButNoInteractions: noInteractions,
        surfacesWithMeaningfulEngagement: meaningful,
        insufficientDataCases,
        analyticsEventCount: asCount(scorecard?.summary?.analyticsEventCount),
      },
    },
    {
      id: 'public_indexable_critical_gaps',
      label: 'Public/indexable critical gap counts',
      score: publicGapScore,
      status: String(publicGapDimension?.status || 'unknown'),
      metrics: {
        criticalGapCount: asCount((publicGapDimension?.metrics || {}).criticalGapCount),
      },
    },
    {
      id: 'cta_commercial_compliance',
      label: 'CTA/commercial compliance state',
      score: ctaScore,
      status: String(ctaDimension?.status || 'unknown'),
      metrics: {
        governedCtaRowsWithoutToolFirst: asCount((ctaDimension?.metrics || {}).governedCtaRowsWithoutToolFirst),
      },
    },
    {
      id: 'noindex_publication_alignment',
      label: 'Noindex/publication alignment',
      score: noindexScore,
      status: String(noindexDimension?.status || 'unknown'),
      metrics: {
        noindexRouteMissingCount: asCount((noindexDimension?.metrics || {}).noindexRouteMissingCount),
        indexableRouteMisalignmentCount: asCount((noindexDimension?.metrics || {}).indexableRouteMisalignmentCount),
      },
    },
    {
      id: 'post_release_watch_summary',
      label: 'Post-release watch summary',
      score: watchScore,
      status: 'computed',
      metrics: {
        criticalFollowUpCount: asCount(watchByState.critical_follow_up),
        degradedCount: asCount(watchByState.degraded),
        watchCloselyCount: asCount(watchByState.watch_closely),
        rollbackAttentionCount,
      },
    },
    {
      id: 'followup_queue_pressure',
      label: 'Follow-up queue pressure',
      score: followUpPressure,
      status: 'computed',
      metrics: {
        rollbackAttention: asCount(byResponse.rollback_attention),
        doNow: asCount(byResponse.do_now),
        nextSprint: asCount(byResponse.next_sprint),
        watchClosely: asCount(byResponse.watch_closely),
      },
    },
  ]

  const overallRiskScore = clamp(dimensionRows.reduce((sum, row) => sum + row.score, 0) / dimensionRows.length)

  const createdAt = new Date().toISOString()
  const sourceFingerprint = crypto
    .createHash('sha1')
    .update(
      JSON.stringify({
        generatedFrom,
        readinessState,
        dimensions: dimensionRows.map(row => ({ id: row.id, score: row.score, status: row.status, metrics: row.metrics })),
      }),
    )
    .digest('hex')

  const snapshotId = process.env.RELEASE_SNAPSHOT_ID || `snapshot-${sourceFingerprint.slice(0, 12)}`
  const releaseId = readiness?.generatedAt ? `release-${readiness.generatedAt.slice(0, 10)}` : snapshotId

  return {
    snapshotId,
    releaseId,
    createdAt,
    generatedFrom,
    readinessState,
    watchSummary: {
      byWatchState: watchByState,
      bySeverity: watchBySeverity,
      rollbackAttentionCount,
    },
    followUpSummary: {
      ...(followup?.summary || {}),
      pressureScore: followUpPressure,
    },
    regressionStatus: {
      pass: uxRegression?.pass === true,
      failedChecks: failedUxChecks,
      totalChecks: asCount(uxRegression?.totals?.checks),
    },
    leakageStatus: {
      status: String(leakageDimension?.status || 'unknown'),
      blockedOrRejectedVisibleCount: leakageLeaks,
      freshnessBlockedLeakCount: freshnessLeaks,
    },
    enrichmentHealthSummary: {
      entitiesEvaluated,
      blockedEntities,
      staleEntities,
      missingGovernedEntities,
      indexableWithoutHealthy,
    },
    freshnessCoverageSummary: {
      freshnessEvaluated,
      pagesGainedVisibility: gainedVisibility,
      pagesIntentionallyUnchanged: unchangedPages,
      blockedLeakCount: freshnessLeaks,
    },
    scorecardSummary: {
      surfacesWithVisibilityButNoInteractions: noInteractions,
      surfacesWithMeaningfulEngagement: meaningful,
      insufficientDataCases,
      analyticsEventCount: asCount(scorecard?.summary?.analyticsEventCount),
    },
    publicCriticalGapSummary: {
      status: String(publicGapDimension?.status || 'unknown'),
      criticalGapCount: asCount((publicGapDimension?.metrics || {}).criticalGapCount),
    },
    ctaComplianceSummary: {
      status: String(ctaDimension?.status || 'unknown'),
      governedCtaRowsWithoutToolFirst: asCount((ctaDimension?.metrics || {}).governedCtaRowsWithoutToolFirst),
    },
    noindexPublicationSummary: {
      status: String(noindexDimension?.status || 'unknown'),
      noindexRouteMissingCount: asCount((noindexDimension?.metrics || {}).noindexRouteMissingCount),
      indexableRouteMisalignmentCount: asCount((noindexDimension?.metrics || {}).indexableRouteMisalignmentCount),
    },
    dimensions: dimensionRows,
    overallRiskScore,
    notes: [
      'Deterministic comparison: lower score is healthier for every dimension.',
      'Only governed reports/artifacts are used; no live dashboard dependencies.',
    ],
    sourceFingerprint,
  }
}

function compareSnapshots(current: Snapshot, prior: Snapshot | null, comparedAgainst: Snapshot[]): HistoryFile['comparison'] {
  const dimensionTrends = current.dimensions.map(row => {
    const priorRow = prior?.dimensions.find(candidate => candidate.id === row.id) || null
    const result = trendFromDelta({ current: row.score, prior: priorRow?.score ?? null })
    const reason =
      result.delta === null
        ? 'No prior snapshot available for this dimension; baseline initialized.'
        : result.delta === 0
          ? 'No score change.'
          : result.delta < 0
            ? `Score improved by ${Math.abs(result.delta)}.`
            : `Score regressed by ${result.delta}.`

    return {
      id: row.id,
      label: row.label,
      trend: result.trend,
      currentScore: row.score,
      priorScore: priorRow?.score ?? null,
      delta: result.delta,
      reason,
    }
  })

  const degradations = dimensionTrends.filter(row => row.delta !== null && row.delta > 0).sort((a, b) => (b.delta || 0) - (a.delta || 0))
  const improvements = dimensionTrends.filter(row => row.delta !== null && row.delta < 0).sort((a, b) => (a.delta || 0) - (b.delta || 0))
  const stableRows = dimensionTrends.filter(row => row.delta === null || Math.abs(row.delta) < 8)

  const hasCritical = dimensionTrends.some(row => row.trend === 'critical_regression')
  const degradingCount = dimensionTrends.filter(row => row.trend === 'degrading').length
  const improvingCount = dimensionTrends.filter(row => row.trend === 'improving').length

  let trend: TrendClass = 'stable'
  if (hasCritical) trend = 'critical_regression'
  else if (degradingCount > 0 && improvingCount > 0) trend = 'mixed'
  else if (degradingCount >= 2) trend = 'degrading'
  else if (improvingCount >= 1 && degradingCount === 0) trend = 'improving'

  const currentPressure = current.dimensions.find(row => row.id === 'followup_queue_pressure')?.score || 0
  const priorPressure = prior?.dimensions.find(row => row.id === 'followup_queue_pressure')?.score ?? null
  const pressureDelta = priorPressure === null ? null : currentPressure - priorPressure
  const pressureTrendResult = trendFromDelta({ current: currentPressure, prior: priorPressure, criticalThreshold: 95 })

  return {
    currentSnapshotId: current.snapshotId,
    comparedAgainstSnapshotIds: comparedAgainst.map(row => row.snapshotId),
    trend,
    dimensionTrends,
    biggestImprovements: improvements.slice(0, 5).map(row => ({ id: row.id, label: row.label, delta: row.delta || 0 })),
    biggestRegressions: degradations.slice(0, 5).map(row => ({ id: row.id, label: row.label, delta: row.delta || 0 })),
    noMeaningfulChange: stableRows.slice(0, 8).map(row => ({ id: row.id, label: row.label, delta: row.delta })),
    followUpQueuePressure: {
      current: currentPressure,
      prior: priorPressure,
      delta: pressureDelta,
      trend: pressureTrendResult.trend,
    },
  }
}

function writeMarkdown(history: HistoryFile, current: Snapshot) {
  const lines: string[] = []
  lines.push('# Governed release history and trend comparison')
  lines.push('')
  lines.push(`Generated: ${history.generatedAt}`)
  lines.push(`Deterministic model: ${history.deterministicModelVersion}`)
  lines.push(`Latest snapshot: ${current.snapshotId}`)
  lines.push(`Overall trend classification: **${history.comparison.trend}**`)
  lines.push('')
  lines.push('## Latest release snapshot')
  lines.push(`- releaseId: ${current.releaseId}`)
  lines.push(`- createdAt: ${current.createdAt}`)
  lines.push(`- readinessState: ${current.readinessState}`)
  lines.push(`- overallRiskScore: ${current.overallRiskScore}`)
  lines.push('')
  lines.push('## Prior snapshot(s) used for comparison')
  if (!history.comparison.comparedAgainstSnapshotIds.length) {
    lines.push('- none (baseline initialization)')
  } else {
    history.comparison.comparedAgainstSnapshotIds.forEach(id => lines.push(`- ${id}`))
  }
  lines.push('')
  lines.push('## Dimension-by-dimension trends')
  lines.push('| dimension | current | prior | delta | trend |')
  lines.push('| --- | ---: | ---: | ---: | --- |')
  history.comparison.dimensionTrends.forEach(row => {
    lines.push(`| ${row.label} | ${row.currentScore} | ${row.priorScore ?? 'n/a'} | ${row.delta ?? 'n/a'} | ${row.trend} |`)
  })
  lines.push('')
  lines.push('## Biggest improvements')
  if (!history.comparison.biggestImprovements.length) lines.push('- none')
  history.comparison.biggestImprovements.forEach(row => lines.push(`- ${row.label}: ${row.delta}`))
  lines.push('')
  lines.push('## Biggest regressions')
  if (!history.comparison.biggestRegressions.length) lines.push('- none')
  history.comparison.biggestRegressions.forEach(row => lines.push(`- ${row.label}: +${row.delta}`))
  lines.push('')
  lines.push('## No meaningful change')
  if (!history.comparison.noMeaningfulChange.length) lines.push('- none')
  history.comparison.noMeaningfulChange.forEach(row => lines.push(`- ${row.label}: ${row.delta ?? 'n/a'}`))
  lines.push('')
  lines.push('## Follow-up queue pressure')
  lines.push(`- current score: ${history.comparison.followUpQueuePressure.current}`)
  lines.push(`- prior score: ${history.comparison.followUpQueuePressure.prior ?? 'n/a'}`)
  lines.push(`- delta: ${history.comparison.followUpQueuePressure.delta ?? 'n/a'}`)
  lines.push(`- trend: ${history.comparison.followUpQueuePressure.trend}`)
  lines.push('')
  lines.push('## Trend classification examples')
  history.trendClassificationExamples.forEach(row => lines.push(`- ${row.trend}: ${row.deterministicExample}`))

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8')
}

function main() {
  const current = buildSnapshot()

  const existing = readJsonIfExists<{ snapshots?: Snapshot[] }>(path.relative(ROOT, SNAPSHOT_STORE))
  const existingSnapshots = Array.isArray(existing?.snapshots) ? existing.snapshots : []

  const withoutDuplicate = existingSnapshots.filter(row => row.sourceFingerprint !== current.sourceFingerprint)
  const snapshots = [...withoutDuplicate, current].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const prior = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null
  const comparedAgainst = prior ? [prior, ...snapshots.slice(Math.max(0, snapshots.length - 4), snapshots.length - 2)] : []
  const comparison = compareSnapshots(current, prior, comparedAgainst)

  const history: HistoryFile = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-release-history-v1',
    snapshots,
    latestSnapshotId: current.snapshotId,
    comparison,
    trendClassificationExamples: [
      {
        trend: 'improving',
        deterministicExample:
          'Current dimension score decreases by at least 8 points vs prior snapshot with no offsetting degradations.',
      },
      {
        trend: 'degrading',
        deterministicExample:
          'Two or more dimensions increase by at least 8 points vs prior snapshot, with no critical threshold crossing.',
      },
      {
        trend: 'critical_regression',
        deterministicExample:
          'Any dimension crosses from below 90 to >=90 risk score with at least +8 delta (for example blocked readiness or leakage failure).',
      },
    ],
  }

  fs.writeFileSync(SNAPSHOT_STORE, `${JSON.stringify({ snapshots }, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(history, null, 2)}\n`, 'utf8')
  writeMarkdown(history, current)

  console.log(`[report:governed-release-history] wrote ${path.relative(ROOT, SNAPSHOT_STORE)} snapshots=${snapshots.length}`)
  console.log(`[report:governed-release-history] wrote ${path.relative(ROOT, OUT_JSON)} trend=${comparison.trend}`)
  console.log(`[report:governed-release-history] wrote ${path.relative(ROOT, OUT_MD)}`)
}

main()
