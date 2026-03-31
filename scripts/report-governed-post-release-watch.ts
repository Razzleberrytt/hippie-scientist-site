import fs from 'node:fs'
import path from 'node:path'

type WatchState = 'stable' | 'improving' | 'watch_closely' | 'degraded' | 'critical_follow_up'
type Severity = 'low' | 'medium' | 'high' | 'critical'
type CauseCategory =
  | 'ux_regression_drift'
  | 'analytics_coverage_gap'
  | 'engagement_underperformance'
  | 'governance_leakage_risk'
  | 'enrichment_health_deterioration'
  | 'freshness_review_regression'
  | 'publication_quality_drift'
  | 'homepage_landing_regression'
  | 'browse_filter_regression'
  | 'cta_compliance_regression'
  | 'missing_required_input'

type WatchDimension = {
  dimensionId: string
  watchedSurface: string
  watchState: WatchState
  changeSignalDetected: string
  likelyCauseCategory: CauseCategory
  severity: Severity
  recommendedFollowUpAction: string
  rollbackAttention: boolean
  affectedEntitiesOrSurfaces: string[]
  supportingMetrics: Record<string, number | string | boolean>
}

type InputStatus = {
  path: string
  present: boolean
  modifiedAt: string | null
}

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-post-release-watch.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-post-release-watch.md')

const INPUTS = {
  governedUxRegression: 'ops/reports/governed-ux-regression.json',
  governedAnalytics: 'ops/reports/governed-analytics.json',
  governedScorecard: 'ops/reports/governed-scorecard.json',
  governedRefinement: 'ops/reports/governed-refinement-pass.json',
  governedPatternRollout: 'ops/reports/governed-pattern-rollout.json',
  governedReleaseReadiness: 'ops/reports/governed-release-readiness.json',
  enrichmentHealth: 'ops/reports/enrichment-health.json',
  enrichmentBacklog: 'ops/reports/enrichment-backlog.json',
  enrichmentReviewCycle: 'ops/reports/enrichment-review-cycle.json',
  publicationManifest: 'public/data/publication-manifest.json',
  indexableHerbs: 'public/data/indexable-herbs.json',
  indexableCompounds: 'public/data/indexable-compounds.json',
  governedEnrichment: 'public/data/enrichment-governed.json',
  homepageEnrichmentRefresh: 'ops/reports/homepage-enrichment-refresh.json',
  governedBrowseFilters: 'ops/reports/governed-browse-filters.json',
  governedCollectionFilters: 'ops/reports/governed-collection-filters.json',
  governedReviewFreshness: 'ops/reports/governed-review-freshness.json',
} as const

function readJsonIfExists<T>(relativePath: string): T | null {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return null
  return JSON.parse(fs.readFileSync(fullPath, 'utf8')) as T
}

function inputStatus(relativePath: string): InputStatus {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return { path: relativePath, present: false, modifiedAt: null }
  return {
    path: relativePath,
    present: true,
    modifiedAt: fs.statSync(fullPath).mtime.toISOString(),
  }
}

function asCount(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function addMissingInputDimension(dimensions: WatchDimension[], id: string, watchedSurface: string, inputs: string[]) {
  dimensions.push({
    dimensionId: id,
    watchedSurface,
    watchState: 'watch_closely',
    changeSignalDetected: `Missing required upstream report input(s): ${inputs.join(', ')}`,
    likelyCauseCategory: 'missing_required_input',
    severity: 'medium',
    recommendedFollowUpAction: 'Generate the missing deterministic upstream reports, then rerun post-release watch.',
    rollbackAttention: false,
    affectedEntitiesOrSurfaces: [watchedSurface],
    supportingMetrics: { missingInputCount: inputs.length },
  })
}

function main() {
  const inputStatuses = Object.values(INPUTS).map(inputStatus)

  const uxRegression = readJsonIfExists<{
    pass?: boolean
    totals?: { checks?: number; failed?: number }
    checks?: Array<{ id?: string; status?: string }>
  }>(INPUTS.governedUxRegression)

  const analytics = readJsonIfExists<{
    verification?: {
      supportedSurfaceOnlyEmission?: boolean
      weakOrPartialPagesGraceful?: boolean
      existingCtaToolAffiliateEventsStillPresent?: boolean
      noBroadAnalyticsRegression?: boolean
    }
  }>(INPUTS.governedAnalytics)

  const scorecard = readJsonIfExists<{
    summary?: {
      analyticsEventsAvailable?: boolean
      analyticsEventCount?: number
      surfacesWithVisibilityButNoInteractions?: number
      surfacesWithMeaningfulEngagement?: number
      insufficientDataCases?: number
    }
    surfaces?: Array<{
      surface: string
      baselineVisibilityCount?: number
      trackedVisibilityCount?: number
      interactionCount?: number
      hasMeaningfulEngagement?: boolean
    }>
  }>(INPUTS.governedScorecard)

  const refinement = readJsonIfExists<{
    weakRefinementTargets?: Array<{ surfaceId?: string }>
  }>(INPUTS.governedRefinement)

  const patternRollout = readJsonIfExists<{
    deterministicVerification?: {
      noBlockedRejectedRevisionRequestedInfluence?: boolean
      checks?: {
        failedWaveTargetCount?: number
        sourceVerification?: {
          blockedOrUnapprovedVisibleCount?: number
        }
      }
    }
  }>(INPUTS.governedPatternRollout)

  const releaseReadiness = readJsonIfExists<{
    releaseState?: string
    summary?: {
      blockedDimensions?: number
      failedDimensions?: number
      warnedDimensions?: number
    }
  }>(INPUTS.governedReleaseReadiness)

  const enrichmentHealth = readJsonIfExists<{
    summary?: {
      entitiesEvaluated?: number
      staleEntities?: number
      blockedEntities?: number
      indexableEntitiesWithoutHealthyState?: number
    }
  }>(INPUTS.enrichmentHealth)

  const enrichmentBacklog = readJsonIfExists<{
    summary?: {
      totalItems?: number
      countsByPriority?: Record<string, number>
    }
  }>(INPUTS.enrichmentBacklog)

  const enrichmentReviewCycle = readJsonIfExists<{
    summary?: {
      highRiskQueueSize?: number
      hideRecommendations?: number
      downgradeRecommendations?: number
      urgencyCounts?: Record<string, number>
    }
    items?: Array<{ reviewCycleState?: string; enrichedRenderingRecommendation?: string }>
  }>(INPUTS.enrichmentReviewCycle)

  const publicationManifest = readJsonIfExists<{
    entities?: {
      herbs?: Array<{ slug?: string }>
      compounds?: Array<{ slug?: string }>
    }
  }>(INPUTS.publicationManifest)

  const indexableHerbs = readJsonIfExists<Array<{ slug?: string }>>(INPUTS.indexableHerbs) || []
  const indexableCompounds = readJsonIfExists<Array<{ slug?: string }>>(INPUTS.indexableCompounds) || []
  const governedEnrichment = readJsonIfExists<Array<{ entityType?: string; entitySlug?: string }>>(INPUTS.governedEnrichment) || []

  const homepageRefresh = readJsonIfExists<{
    summary?: {
      homepageRows?: number
      staleRows?: number
      blockedRows?: number
    }
  }>(INPUTS.homepageEnrichmentRefresh)

  const governedBrowse = readJsonIfExists<{
    coverage?: {
      herbs?: { eligibleForGovernedFilters?: number }
      compounds?: { eligibleForGovernedFilters?: number }
    }
  }>(INPUTS.governedBrowseFilters)

  const collectionFilters = readJsonIfExists<{
    pagesGainedControls?: { collectionPages?: string[] }
  }>(INPUTS.governedCollectionFilters)

  const reviewFreshness = readJsonIfExists<{
    verification?: { passed?: boolean; blockedOrRejectedLeaks?: string[] }
    totals?: { pagesGainedVisibility?: number }
  }>(INPUTS.governedReviewFreshness)

  const dimensions: WatchDimension[] = []

  if (!uxRegression) {
    addMissingInputDimension(dimensions, 'ux_regression_drift', 'governed_detail_surfaces', [INPUTS.governedUxRegression])
  } else {
    const failedChecks = asCount(uxRegression.totals?.failed)
    dimensions.push({
      dimensionId: 'ux_regression_drift',
      watchedSurface: 'governed_detail_surfaces',
      watchState: failedChecks > 0 || uxRegression.pass === false ? 'critical_follow_up' : 'stable',
      changeSignalDetected:
        failedChecks > 0 || uxRegression.pass === false
          ? `Governed UX regression checks failing post-release (${failedChecks} failed).`
          : 'No governed UX regression drift detected in deterministic checks.',
      likelyCauseCategory: 'ux_regression_drift',
      severity: failedChecks > 0 ? 'critical' : 'low',
      recommendedFollowUpAction:
        failedChecks > 0
          ? 'Investigate failing UX checks immediately and prepare rollback for affected governed surfaces if regressions are user-visible.'
          : 'Continue routine watch on governed UX verification outputs.',
      rollbackAttention: failedChecks > 0,
      affectedEntitiesOrSurfaces: ['governed_intro_summary', 'governed_faq_related_questions', 'governed_quick_compare', 'governed_review_freshness', 'governed_cta'],
      supportingMetrics: {
        checks: asCount(uxRegression.totals?.checks),
        failedChecks,
      },
    })
  }

  if (!scorecard || !analytics) {
    const missing = [!scorecard ? INPUTS.governedScorecard : null, !analytics ? INPUTS.governedAnalytics : null].filter(Boolean) as string[]
    addMissingInputDimension(dimensions, 'discovery_conversion_engagement', 'governed_discovery_and_conversion_surfaces', missing)
  } else {
    const noInteractionSurfaces = asCount(scorecard.summary?.surfacesWithVisibilityButNoInteractions)
    const meaningfulSurfaces = asCount(scorecard.summary?.surfacesWithMeaningfulEngagement)
    const analyticsAvailable = Boolean(scorecard.summary?.analyticsEventsAvailable)
    const analyticsCoverageOk = Boolean(analytics.verification?.supportedSurfaceOnlyEmission) && Boolean(analytics.verification?.noBroadAnalyticsRegression)

    let watchState: WatchState = 'stable'
    let severity: Severity = 'low'
    if (!analyticsAvailable || !analyticsCoverageOk) {
      watchState = 'watch_closely'
      severity = 'medium'
    }
    if (noInteractionSurfaces >= 3 && meaningfulSurfaces === 0) {
      watchState = 'degraded'
      severity = 'high'
    } else if (meaningfulSurfaces >= 2 && analyticsAvailable) {
      watchState = 'improving'
      severity = 'low'
    }

    dimensions.push({
      dimensionId: 'discovery_conversion_engagement',
      watchedSurface: 'governed_discovery_and_conversion_surfaces',
      watchState,
      changeSignalDetected:
        watchState === 'improving'
          ? 'Multiple governed surfaces now show meaningful engagement with analytics coverage available.'
          : watchState === 'degraded'
            ? `Governed discovery/conversion signals are weak (${noInteractionSurfaces} visibility-without-interaction surfaces).`
            : !analyticsAvailable
              ? 'Analytics event feed is unavailable in the scorecard snapshot.'
              : 'Engagement and analytics checks are stable but sparse.',
      likelyCauseCategory: !analyticsAvailable ? 'analytics_coverage_gap' : 'engagement_underperformance',
      severity,
      recommendedFollowUpAction:
        watchState === 'degraded'
          ? 'Review top zero-interaction surfaces from scorecard and pattern rollout de-emphasis decisions before next release wave.'
          : watchState === 'improving'
            ? 'Capture winning governed patterns and continue deterministic release watch.'
            : 'Keep collecting deterministic scorecard snapshots after each deploy.',
      rollbackAttention: watchState === 'degraded' && analyticsAvailable,
      affectedEntitiesOrSurfaces: ['governed_intro_summary', 'governed_faq_related_questions', 'governed_quick_compare', 'governed_cta', 'tool_affiliate_related_journey'],
      supportingMetrics: {
        analyticsEventsAvailable: analyticsAvailable,
        analyticsEventCount: asCount(scorecard.summary?.analyticsEventCount),
        surfacesWithVisibilityButNoInteractions: noInteractionSurfaces,
        surfacesWithMeaningfulEngagement: meaningfulSurfaces,
      },
    })
  }

  if (!patternRollout) {
    addMissingInputDimension(dimensions, 'blocked_unreviewed_leakage', 'governed_publication_pipeline', [INPUTS.governedPatternRollout])
  } else {
    const leakageCount =
      asCount(patternRollout.deterministicVerification?.checks?.sourceVerification?.blockedOrUnapprovedVisibleCount) ||
      asCount(patternRollout.deterministicVerification?.checks?.failedWaveTargetCount)
    const leakageSafe = patternRollout.deterministicVerification?.noBlockedRejectedRevisionRequestedInfluence === true

    dimensions.push({
      dimensionId: 'blocked_unreviewed_leakage',
      watchedSurface: 'governed_publication_pipeline',
      watchState: leakageSafe ? 'stable' : leakageCount > 0 ? 'critical_follow_up' : 'degraded',
      changeSignalDetected: leakageSafe
        ? 'No blocked/rejected/revision-requested influence detected in governed rollout verification.'
        : 'Pattern rollout verification indicates blocked/unapproved influence risk in publishable governed outputs.',
      likelyCauseCategory: 'governance_leakage_risk',
      severity: leakageSafe ? 'low' : leakageCount > 0 ? 'critical' : 'high',
      recommendedFollowUpAction: leakageSafe
        ? 'Continue enforcing blocked/non-approved exclusion in governed rollups.'
        : 'Audit enrichment submission statuses and governed rollup inputs; block further rollout and evaluate rollback scope.',
      rollbackAttention: !leakageSafe,
      affectedEntitiesOrSurfaces: ['public/data/enrichment-governed.json', 'detail_pages', 'collection_pages'],
      supportingMetrics: {
        noBlockedRejectedRevisionRequestedInfluence: leakageSafe,
        blockedOrUnapprovedVisibleCount: asCount(patternRollout.deterministicVerification?.checks?.sourceVerification?.blockedOrUnapprovedVisibleCount),
        failedWaveTargetCount: asCount(patternRollout.deterministicVerification?.checks?.failedWaveTargetCount),
      },
    })
  }

  if (!enrichmentHealth || !enrichmentBacklog || !enrichmentReviewCycle) {
    const missing = [
      !enrichmentHealth ? INPUTS.enrichmentHealth : null,
      !enrichmentBacklog ? INPUTS.enrichmentBacklog : null,
      !enrichmentReviewCycle ? INPUTS.enrichmentReviewCycle : null,
    ].filter(Boolean) as string[]
    addMissingInputDimension(dimensions, 'enrichment_health_deterioration', 'enrichment_entity_and_surface_health', missing)
  } else {
    const staleEntities = asCount(enrichmentHealth.summary?.staleEntities)
    const blockedEntities = asCount(enrichmentHealth.summary?.blockedEntities)
    const highRiskQueueSize = asCount(enrichmentReviewCycle.summary?.highRiskQueueSize)
    const hideRecommendations = asCount(enrichmentReviewCycle.summary?.hideRecommendations)
    const doNowBacklog = asCount(enrichmentBacklog.summary?.countsByPriority?.do_now)

    let watchState: WatchState = 'stable'
    let severity: Severity = 'low'
    if (blockedEntities > 0 || hideRecommendations > 0) {
      watchState = 'critical_follow_up'
      severity = 'critical'
    } else if (staleEntities > 0 || highRiskQueueSize > 0 || doNowBacklog >= 10) {
      watchState = 'degraded'
      severity = 'high'
    } else if (asCount(enrichmentReviewCycle.summary?.downgradeRecommendations) > 0) {
      watchState = 'watch_closely'
      severity = 'medium'
    }

    dimensions.push({
      dimensionId: 'enrichment_health_deterioration',
      watchedSurface: 'enrichment_entity_and_surface_health',
      watchState,
      changeSignalDetected:
        watchState === 'critical_follow_up'
          ? 'Blocked entities or hide recommendations detected in enrichment review cycle.'
          : watchState === 'degraded'
            ? 'Stale/high-risk enrichment queue increased enough to require active triage.'
            : 'Enrichment health and review-cycle queues remain within governed watch thresholds.',
      likelyCauseCategory: 'enrichment_health_deterioration',
      severity,
      recommendedFollowUpAction:
        watchState === 'stable'
          ? 'Continue routine review-cycle cadence.'
          : 'Prioritize do_now backlog and review-cycle high-risk items before next rollout increment.',
      rollbackAttention: watchState === 'critical_follow_up',
      affectedEntitiesOrSurfaces: ['indexable_entity_details', 'browse_search', 'collection', 'comparison'],
      supportingMetrics: {
        entitiesEvaluated: asCount(enrichmentHealth.summary?.entitiesEvaluated),
        staleEntities,
        blockedEntities,
        highRiskQueueSize,
        hideRecommendations,
        doNowBacklog,
      },
    })
  }

  {
    const hasFreshnessInput = Boolean(reviewFreshness || enrichmentReviewCycle)
    if (!hasFreshnessInput) {
      addMissingInputDimension(dimensions, 'freshness_review_state_regression', 'detail_review_freshness_surfaces', [INPUTS.governedReviewFreshness, INPUTS.enrichmentReviewCycle])
    } else {
      const leakage = asCount(reviewFreshness?.verification?.blockedOrRejectedLeaks?.length)
      const freshnessPassed = reviewFreshness?.verification?.passed !== false
      const urgentCount = asCount(enrichmentReviewCycle?.summary?.urgencyCounts?.urgent) + asCount(enrichmentReviewCycle?.summary?.urgencyCounts?.immediate)

      let watchState: WatchState = 'stable'
      let severity: Severity = 'low'
      if (!freshnessPassed || leakage > 0) {
        watchState = 'critical_follow_up'
        severity = 'critical'
      } else if (urgentCount > 0) {
        watchState = 'degraded'
        severity = 'high'
      }

      dimensions.push({
        dimensionId: 'freshness_review_state_regression',
        watchedSurface: 'detail_review_freshness_surfaces',
        watchState,
        changeSignalDetected:
          watchState === 'stable'
            ? 'Review freshness checks show no blocked/rejected leakage and no urgent escalation signal.'
            : watchState === 'degraded'
              ? 'Urgent review-cycle freshness queue present after release.'
              : 'Review freshness verification failed or blocked/rejected leakage was detected.',
        likelyCauseCategory: 'freshness_review_regression',
        severity,
        recommendedFollowUpAction:
          watchState === 'stable'
            ? 'Maintain current freshness review cadence.'
            : 'Escalate reviewer cycle for freshness-sensitive entities and verify governed freshness rendering.',
        rollbackAttention: watchState === 'critical_follow_up',
        affectedEntitiesOrSurfaces: ['governed_review_freshness', 'herb_detail', 'compound_detail'],
        supportingMetrics: {
          freshnessVerificationPassed: freshnessPassed,
          blockedOrRejectedLeaks: leakage,
          urgentOrImmediateQueue: urgentCount,
          pagesGainedFreshnessVisibility: asCount(reviewFreshness?.totals?.pagesGainedVisibility),
        },
      })
    }
  }

  {
    const browseSurface = scorecard?.surfaces?.find(row => row.surface === 'governed_browse_search_filters')
    const controlsSurface = scorecard?.surfaces?.find(row => row.surface === 'governed_collection_compare_controls')
    const hasInputs = Boolean(scorecard && (governedBrowse || collectionFilters))

    if (!hasInputs) {
      addMissingInputDimension(dimensions, 'browse_search_filter_regression', 'browse_search_and_collection_controls', [INPUTS.governedScorecard, INPUTS.governedBrowseFilters, INPUTS.governedCollectionFilters])
    } else {
      const browseEligible =
        asCount(governedBrowse?.coverage?.herbs?.eligibleForGovernedFilters) + asCount(governedBrowse?.coverage?.compounds?.eligibleForGovernedFilters)
      const collectionPages = asCount(collectionFilters?.pagesGainedControls?.collectionPages?.length)
      const interactions = asCount(browseSurface?.interactionCount) + asCount(controlsSurface?.interactionCount)
      const visibilityBaseline = asCount(browseSurface?.baselineVisibilityCount) + asCount(controlsSurface?.baselineVisibilityCount)

      const watchState: WatchState = visibilityBaseline > 0 && interactions === 0 ? 'degraded' : interactions > 0 ? 'improving' : 'watch_closely'
      dimensions.push({
        dimensionId: 'browse_search_filter_regression',
        watchedSurface: 'browse_search_and_collection_controls',
        watchState,
        changeSignalDetected:
          watchState === 'degraded'
            ? 'Browse/search or collection controls are visible but have no observed interaction in scorecard snapshot.'
            : watchState === 'improving'
              ? 'Browse/search and collection controls show post-release interaction.'
              : 'Control coverage exists but interaction sample is not yet conclusive.',
        likelyCauseCategory: 'browse_filter_regression',
        severity: watchState === 'degraded' ? 'high' : watchState === 'improving' ? 'low' : 'medium',
        recommendedFollowUpAction:
          watchState === 'degraded'
            ? 'Review filter UX copy/order on herbs, compounds, collection, and compare pages before expanding rollout.'
            : 'Keep deterministic filter watch in post-release checklist.',
        rollbackAttention: watchState === 'degraded' && visibilityBaseline >= 5,
        affectedEntitiesOrSurfaces: ['herbs_index', 'compounds_index', 'collection_page', 'compare_page'],
        supportingMetrics: {
          browseEligible,
          collectionPagesWithControls: collectionPages,
          baselineVisibilityCount: visibilityBaseline,
          interactionCount: interactions,
        },
      })
    }
  }

  {
    const ctaSurface = scorecard?.surfaces?.find(row => row.surface === 'governed_cta')
    const journeySurface = scorecard?.surfaces?.find(row => row.surface === 'tool_affiliate_related_journey')
    const hasInputs = Boolean(scorecard && analytics)

    if (!hasInputs) {
      addMissingInputDimension(dimensions, 'cta_commercial_compliance_regression', 'governed_cta_and_affiliate_journey', [INPUTS.governedScorecard, INPUTS.governedAnalytics])
    } else {
      const ctaInteractions = asCount(ctaSurface?.interactionCount) + asCount(journeySurface?.interactionCount)
      const ctaVisibility = asCount(ctaSurface?.baselineVisibilityCount) + asCount(journeySurface?.baselineVisibilityCount)
      const ctaTelemetryHealthy = Boolean(analytics?.verification?.existingCtaToolAffiliateEventsStillPresent)

      const watchState: WatchState = !ctaTelemetryHealthy ? 'critical_follow_up' : ctaVisibility > 0 && ctaInteractions === 0 ? 'watch_closely' : ctaInteractions > 0 ? 'improving' : 'stable'
      dimensions.push({
        dimensionId: 'cta_commercial_compliance_regression',
        watchedSurface: 'governed_cta_and_affiliate_journey',
        watchState,
        changeSignalDetected:
          watchState === 'critical_follow_up'
            ? 'CTA/tool/affiliate telemetry verification failed in governed analytics report.'
            : watchState === 'watch_closely'
              ? 'CTA surfaces are visible but not getting clicks in current scorecard snapshot.'
              : watchState === 'improving'
                ? 'CTA and journey surfaces show governed interaction post-release.'
                : 'CTA telemetry and governed surface state are stable.',
        likelyCauseCategory: 'cta_compliance_regression',
        severity: watchState === 'critical_follow_up' ? 'critical' : watchState === 'watch_closely' ? 'medium' : 'low',
        recommendedFollowUpAction:
          watchState === 'critical_follow_up'
            ? 'Treat as compliance regression: restore CTA/affiliate telemetry before next release.'
            : 'Keep governed CTA ordering and monitor click-through trend in upcoming snapshots.',
        rollbackAttention: watchState === 'critical_follow_up',
        affectedEntitiesOrSurfaces: ['governed_cta', 'tool_affiliate_related_journey', 'collection_page', 'detail_pages'],
        supportingMetrics: {
          existingCtaToolAffiliateEventsStillPresent: ctaTelemetryHealthy,
          baselineVisibilityCount: ctaVisibility,
          interactionCount: ctaInteractions,
        },
      })
    }
  }

  {
    const manifestEntityCount =
      asCount(publicationManifest?.entities?.herbs?.length) + asCount(publicationManifest?.entities?.compounds?.length)
    const indexableEntityCount = indexableHerbs.length + indexableCompounds.length
    const governedEntityCount = governedEnrichment.length
    const withoutGovernedCoverage = Math.max(indexableEntityCount - governedEntityCount, 0)

    let watchState: WatchState = 'stable'
    let severity: Severity = 'low'
    if (withoutGovernedCoverage > 0) {
      watchState = withoutGovernedCoverage >= 10 ? 'critical_follow_up' : 'degraded'
      severity = withoutGovernedCoverage >= 10 ? 'critical' : 'high'
    } else if (manifestEntityCount > 0 && governedEntityCount > indexableEntityCount) {
      watchState = 'watch_closely'
      severity = 'medium'
    }

    dimensions.push({
      dimensionId: 'publication_quality_noindex_drift',
      watchedSurface: 'publication_manifest_and_indexable_entity_set',
      watchState,
      changeSignalDetected:
        watchState === 'stable'
          ? 'Indexable publication set is covered by governed enrichment artifacts.'
          : watchState === 'watch_closely'
            ? 'Governed enrichment rows exceed indexable set; verify publication gating boundaries.'
            : `Indexable/publication entities exceed governed coverage by ${withoutGovernedCoverage}.`,
      likelyCauseCategory: 'publication_quality_drift',
      severity,
      recommendedFollowUpAction:
        watchState === 'stable'
          ? 'Continue normal publication manifest verification.'
          : 'Audit noindex/publication gating and regenerate governed enrichment rollup before additional rollout.',
      rollbackAttention: watchState === 'critical_follow_up',
      affectedEntitiesOrSurfaces: ['public/data/publication-manifest.json', 'public/data/indexable-herbs.json', 'public/data/indexable-compounds.json', 'public/data/enrichment-governed.json'],
      supportingMetrics: {
        manifestEntityCount,
        indexableEntityCount,
        governedEntityCount,
        indexableWithoutGovernedCoverage: withoutGovernedCoverage,
      },
    })
  }

  {
    if (!homepageRefresh) {
      addMissingInputDimension(dimensions, 'homepage_landing_module_regression', 'homepage_and_landing_modules', [INPUTS.homepageEnrichmentRefresh])
    } else {
      const staleRows = asCount(homepageRefresh.summary?.staleRows)
      const blockedRows = asCount(homepageRefresh.summary?.blockedRows)
      const homepageRows = asCount(homepageRefresh.summary?.homepageRows)

      dimensions.push({
        dimensionId: 'homepage_landing_module_regression',
        watchedSurface: 'homepage_and_landing_modules',
        watchState: blockedRows > 0 ? 'critical_follow_up' : staleRows > 0 ? 'degraded' : homepageRows > 0 ? 'stable' : 'watch_closely',
        changeSignalDetected:
          blockedRows > 0
            ? 'Homepage refresh report shows blocked governed rows affecting landing modules.'
            : staleRows > 0
              ? 'Homepage landing modules include stale governed rows.'
              : homepageRows > 0
                ? 'Homepage governed rows are present without stale/blocked flags.'
                : 'Homepage refresh report has no governed rows in current snapshot.',
        likelyCauseCategory: 'homepage_landing_regression',
        severity: blockedRows > 0 ? 'critical' : staleRows > 0 ? 'high' : homepageRows > 0 ? 'low' : 'medium',
        recommendedFollowUpAction:
          blockedRows > 0 || staleRows > 0
            ? 'Regenerate homepage enrichment payload and verify governed module eligibility before next deployment.'
            : 'Keep homepage refresh report in post-release watch checklist.',
        rollbackAttention: blockedRows > 0,
        affectedEntitiesOrSurfaces: ['homepage', 'landing_modules', 'collection_page'],
        supportingMetrics: {
          homepageRows,
          staleRows,
          blockedRows,
        },
      })
    }
  }

  const countsByState = dimensions.reduce<Record<WatchState, number>>(
    (acc, row) => {
      acc[row.watchState] += 1
      return acc
    },
    { stable: 0, improving: 0, watch_closely: 0, degraded: 0, critical_follow_up: 0 },
  )

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-post-release-watch-v1',
    releaseScope: {
      releaseType: 'governed_ux_enrichment_post_release_watch',
      canonicalGovernedPublicArtifactPaths: [
        INPUTS.governedEnrichment,
        INPUTS.publicationManifest,
        INPUTS.indexableHerbs,
        INPUTS.indexableCompounds,
        'public/data/herbs-summary.json',
        'public/data/compounds-summary.json',
        'public/data/herbs-detail/*.json',
        'public/data/compounds-detail/*.json',
      ],
      deterministicSignalSources: Object.values(INPUTS),
    },
    summary: {
      totalWatchedDimensions: dimensions.length,
      countsByState,
      rollbackAttentionDimensions: dimensions.filter(row => row.rollbackAttention).map(row => row.dimensionId),
      criticalFollowUpCount: dimensions.filter(row => row.watchState === 'critical_follow_up').length,
      degradedCount: dimensions.filter(row => row.watchState === 'degraded').length,
    },
    watchedDimensions: dimensions,
    inputStatuses,
  }

  const lines: string[] = []
  lines.push('# Governed post-release watch')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Deterministic model: ${report.deterministicModelVersion}`)
  lines.push('')
  lines.push('## State summary')
  lines.push(`- stable: ${countsByState.stable}`)
  lines.push(`- improving: ${countsByState.improving}`)
  lines.push(`- watch_closely: ${countsByState.watch_closely}`)
  lines.push(`- degraded: ${countsByState.degraded}`)
  lines.push(`- critical_follow_up: ${countsByState.critical_follow_up}`)
  lines.push('')
  lines.push('## Post-merge/post-deploy checklist')
  lines.push('- Re-run governed post-release watch report and confirm no new critical_follow_up dimensions.')
  lines.push('- For any degraded/critical dimension, copy the recommended action into the release triage thread.')
  lines.push('- If rollbackAttention=true appears on any dimension, open rollback-attention review before the next release increment.')
  lines.push('- Verify blocked/unreviewed leakage dimensions stay stable before approving further governed rollout.')
  lines.push('')
  lines.push('## Dimension triage table')
  lines.push('| Dimension | Surface | State | Severity | Rollback attention | Signal |')
  lines.push('| --- | --- | --- | --- | --- | --- |')
  for (const row of dimensions) {
    lines.push(`| ${row.dimensionId} | ${row.watchedSurface} | ${row.watchState} | ${row.severity} | ${row.rollbackAttention ? 'yes' : 'no'} | ${row.changeSignalDetected.replace(/\|/g, '\\|')} |`)
  }

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`[report:governed-post-release-watch] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[report:governed-post-release-watch] wrote ${path.relative(ROOT, OUT_MD)}`)
}

main()
