#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'

type ReadinessState = 'ready' | 'ready_with_known_risks' | 'blocked' | 'needs_follow_up'
type DimensionStatus = 'pass' | 'warn' | 'fail' | 'blocked' | 'missing_input'
type DimensionImpact = 'blocking' | 'risk' | 'follow_up'

type DimensionResult = {
  id: string
  label: string
  status: DimensionStatus
  impact: DimensionImpact
  summary: string
  metrics: Record<string, number | string | boolean>
  blockers: string[]
  knownRisks: string[]
  recommendedFollowUps: string[]
  postReleaseWatch: string[]
  affectedSurfaces: string[]
}

type InputStatus = {
  path: string
  present: boolean
  modifiedAt: string | null
}

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-release-readiness.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-release-readiness.md')

const INPUT_PATHS = {
  governedUxRegression: 'ops/reports/governed-ux-regression.json',
  enrichmentHealth: 'ops/reports/enrichment-health.json',
  enrichmentBacklog: 'ops/reports/enrichment-backlog.json',
  enrichmentReviewCycle: 'ops/reports/enrichment-review-cycle.json',
  governedScorecard: 'ops/reports/governed-scorecard.json',
  governedRefinement: 'ops/reports/governed-refinement-pass.json',
  governedPatternRollout: 'ops/reports/governed-pattern-rollout.json',
  governedAnalytics: 'ops/reports/governed-analytics.json',
  governedReviewFreshness: 'ops/reports/governed-review-freshness.json',
  publicationManifest: 'public/data/publication-manifest.json',
  indexableHerbs: 'public/data/indexable-herbs.json',
  indexableCompounds: 'public/data/indexable-compounds.json',
  governedEnrichment: 'public/data/enrichment-governed.json',
  governedInputJsonl: 'public/data/enrichment-submissions-governed-input.jsonl',
  editorialReadiness: 'ops/reports/enrichment-editorial-readiness.json',
}

function readJsonIfExists<T>(relativePath: string): T | null {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return null
  return JSON.parse(fs.readFileSync(fullPath, 'utf8')) as T
}

function inputStatus(relativePath: string): InputStatus {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) {
    return { path: relativePath, present: false, modifiedAt: null }
  }
  const stat = fs.statSync(fullPath)
  return {
    path: relativePath,
    present: true,
    modifiedAt: stat.mtime.toISOString(),
  }
}

function toCount(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function getReleaseState(dimensions: DimensionResult[]): ReadinessState {
  const hasBlockingFailure = dimensions.some(
    row => row.impact === 'blocking' && (row.status === 'fail' || row.status === 'blocked' || row.status === 'missing_input'),
  )
  if (hasBlockingFailure) return 'blocked'

  const hasFollowUpFailure = dimensions.some(
    row => row.impact === 'follow_up' && (row.status === 'fail' || row.status === 'warn'),
  )
  if (hasFollowUpFailure) return 'needs_follow_up'

  const hasKnownRisk = dimensions.some(row => row.status === 'warn' || row.knownRisks.length > 0)
  if (hasKnownRisk) return 'ready_with_known_risks'

  return 'ready'
}

function main() {
  const reportScope = {
    releaseType: 'governed_ux_and_enrichment_changeset',
    canonicalGovernedPublicArtifacts: [
      INPUT_PATHS.governedEnrichment,
      INPUT_PATHS.governedInputJsonl,
      INPUT_PATHS.publicationManifest,
      'public/data/herbs-summary.json',
      'public/data/compounds-summary.json',
      'public/data/herbs-detail/*.json',
      'public/data/compounds-detail/*.json',
    ],
  }

  const inputStatuses = Object.values(INPUT_PATHS).map(inputStatus)
  const missingRequiredInputs = inputStatuses.filter(row => !row.present).map(row => row.path)

  const governedUxRegression = readJsonIfExists<{
    pass?: boolean
    totals?: { checks?: number; failed?: number }
    checks?: Array<{ id?: string; status?: string; reason?: string }>
  }>(INPUT_PATHS.governedUxRegression)

  const enrichmentHealth = readJsonIfExists<{
    summary?: {
      entitiesEvaluated?: number
      staleEntities?: number
      blockedEntities?: number
      missingGovernedEntities?: number
      indexableEntitiesWithoutHealthyState?: number
      surfaceHealthCounts?: Record<string, number>
    }
    entities?: Array<{ publicStatus?: string; enrichmentHealthState?: string }>
  }>(INPUT_PATHS.enrichmentHealth)

  const enrichmentBacklog = readJsonIfExists<{
    summary?: { countsByPriority?: Record<string, number> }
  }>(INPUT_PATHS.enrichmentBacklog)

  const enrichmentReviewCycle = readJsonIfExists<{
    summary?: {
      reviewCycleCounts?: Record<string, number>
      urgencyCounts?: Record<string, number>
      hideRecommendations?: number
      downgradeRecommendations?: number
      highRiskQueueSize?: number
    }
  }>(INPUT_PATHS.enrichmentReviewCycle)

  const governedScorecard = readJsonIfExists<{
    summary?: {
      analyticsEventsAvailable?: boolean
      analyticsEventCount?: number
      surfaceCount?: number
      surfacesWithVisibilityButNoInteractions?: number
      surfacesWithMeaningfulEngagement?: number
    }
    surfaces?: Array<{ surface?: string; hasMeaningfulEngagement?: boolean }>
  }>(INPUT_PATHS.governedScorecard)

  const governedPatternRollout = readJsonIfExists<{
    standardizationTargets?: Array<{ pageType?: string; componentType?: string }>
    deterministicVerification?: {
      noBlockedRejectedRevisionRequestedInfluence?: boolean
      sparseEnrichmentPagesDegradeGracefully?: boolean
      removedOrDeEmphasizedElementsKeepPageStructure?: boolean
      checks?: { failedWaveTargetCount?: number }
    }
  }>(INPUT_PATHS.governedPatternRollout)

  const governedRefinement = readJsonIfExists<{
    deterministicVerification?: {
      onlyGovernedSignalsInfluenceRefinements?: boolean
      noBlockedRejectedRevisionRequestedInfluence?: boolean
    }
    weakRefinementTargets?: Array<{ surfaceId?: string }>
  }>(INPUT_PATHS.governedRefinement)

  const governedAnalytics = readJsonIfExists<{
    verification?: {
      supportedSurfaceOnlyEmission?: boolean
      weakOrPartialPagesGraceful?: boolean
      existingCtaToolAffiliateEventsStillPresent?: boolean
      noBroadAnalyticsRegression?: boolean
    }
  }>(INPUT_PATHS.governedAnalytics)

  const governedReviewFreshness = readJsonIfExists<{
    totals?: { evaluatedPages?: number; pagesGainedVisibility?: number; pagesIntentionallyUnchanged?: number }
    verification?: { passed?: boolean; blockedOrRejectedLeaks?: string[] }
    usedSignals?: string[]
  }>(INPUT_PATHS.governedReviewFreshness)

  const publicationManifest = readJsonIfExists<{
    entities?: { herbs?: Array<{ slug?: string }>; compounds?: Array<{ slug?: string }> }
    routes?: { herbs?: string[]; compounds?: string[] }
  }>(INPUT_PATHS.publicationManifest)

  const indexableHerbs = readJsonIfExists<Array<{ slug?: string }>>(INPUT_PATHS.indexableHerbs) || []
  const indexableCompounds = readJsonIfExists<Array<{ slug?: string }>>(INPUT_PATHS.indexableCompounds) || []

  const editorialReadiness = readJsonIfExists<{
    summary?: { entitiesBlocked?: number; entitiesPartiallyBlocked?: number; blockedEntries?: number }
  }>(INPUT_PATHS.editorialReadiness)

  const dimensions: DimensionResult[] = []

  if (!governedUxRegression) {
    dimensions.push({
      id: 'governed_ux_regression_status',
      label: 'Governed UX regression status',
      status: 'missing_input',
      impact: 'blocking',
      summary: 'Governed UX regression report is missing.',
      metrics: { missingReport: INPUT_PATHS.governedUxRegression },
      blockers: ['Run `npm run verify:governed-ux` before release readiness evaluation.'],
      knownRisks: [],
      recommendedFollowUps: [],
      postReleaseWatch: [],
      affectedSurfaces: ['herb_detail', 'compound_detail', 'collection_page', 'compare_page'],
    })
  } else {
    const failedChecks = toCount(governedUxRegression.totals?.failed)
    const failedIds = (governedUxRegression.checks || [])
      .filter(row => row.status === 'fail')
      .map(row => String(row.id || 'unknown_check'))

    dimensions.push({
      id: 'governed_ux_regression_status',
      label: 'Governed UX regression status',
      status: governedUxRegression.pass ? 'pass' : 'fail',
      impact: 'blocking',
      summary: governedUxRegression.pass
        ? 'All governed UX regression checks passed for publishable governed surfaces.'
        : 'One or more governed UX regression checks failed.',
      metrics: {
        checks: toCount(governedUxRegression.totals?.checks),
        failedChecks,
      },
      blockers: failedIds.map(id => `Regression check failed: ${id}`),
      knownRisks: [],
      recommendedFollowUps: failedIds.length ? ['Resolve failing governed UX checks and rerun verification.'] : [],
      postReleaseWatch: ['Monitor governed surface rendering parity after deployment.'],
      affectedSurfaces: ['governed_intro_summary', 'governed_faq_related_questions', 'governed_quick_compare', 'governed_review_freshness', 'governed_cta'],
    })
  }

  if (!enrichmentHealth || !enrichmentReviewCycle || !enrichmentBacklog) {
    dimensions.push({
      id: 'enrichment_health_and_backlog_state',
      label: 'Enrichment health + backlog + review cycle status',
      status: 'missing_input',
      impact: 'blocking',
      summary: 'One or more enrichment health/backlog/review-cycle reports are missing.',
      metrics: {
        hasEnrichmentHealth: Boolean(enrichmentHealth),
        hasEnrichmentBacklog: Boolean(enrichmentBacklog),
        hasEnrichmentReviewCycle: Boolean(enrichmentReviewCycle),
      },
      blockers: ['Run `npm run report:enrichment-review-cycle` to refresh deterministic enrichment operations reports.'],
      knownRisks: [],
      recommendedFollowUps: [],
      postReleaseWatch: [],
      affectedSurfaces: ['entity_detail', 'collection', 'comparison', 'browse_search', 'linking'],
    })
  } else {
    const blockedEntities = toCount(enrichmentHealth.summary?.blockedEntities)
    const staleEntities = toCount(enrichmentHealth.summary?.staleEntities)
    const indexableUnhealthy = toCount(enrichmentHealth.summary?.indexableEntitiesWithoutHealthyState)
    const doNowCount = toCount(enrichmentBacklog.summary?.countsByPriority?.do_now)
    const hideRecommendations = toCount(enrichmentReviewCycle.summary?.hideRecommendations)
    const highRiskQueueSize = toCount(enrichmentReviewCycle.summary?.highRiskQueueSize)

    const blockers: string[] = []
    if (blockedEntities > 0) blockers.push(`${blockedEntities} entities remain blocked in enrichment health.`)
    if (hideRecommendations > 0) blockers.push(`${hideRecommendations} review-cycle items recommend hide/suppress actions before release.`)
    if (highRiskQueueSize > 0) blockers.push(`${highRiskQueueSize} high-risk review-cycle items are unresolved.`)

    const hasBlockingRisk = blockedEntities > 0 || hideRecommendations > 0

    dimensions.push({
      id: 'enrichment_health_and_backlog_state',
      label: 'Enrichment health + backlog + review cycle status',
      status: hasBlockingRisk ? 'blocked' : staleEntities > 0 || doNowCount > 0 ? 'warn' : 'pass',
      impact: hasBlockingRisk ? 'blocking' : 'risk',
      summary: hasBlockingRisk
        ? 'Enrichment operations reports show unresolved blocking health/review-cycle items.'
        : staleEntities > 0 || doNowCount > 0
          ? 'No hard enrichment blocker, but stale/do-now backlog pressure remains.'
          : 'Enrichment health, backlog, and review-cycle signals are clear for release.',
      metrics: {
        blockedEntities,
        staleEntities,
        indexableEntitiesWithoutHealthyState: indexableUnhealthy,
        doNowBacklogItems: doNowCount,
        hideRecommendations,
        highRiskQueueSize,
      },
      blockers,
      knownRisks: staleEntities > 0 ? [`${staleEntities} entities are stale and may require accelerated review cadence.`] : [],
      recommendedFollowUps:
        doNowCount > 0
          ? ['Burn down `do_now` backlog items for indexable entities before wider rollout.']
          : ['Re-run review-cycle report after next enrichment review batch.'],
      postReleaseWatch: ['Track urgent_review_due and downgrade_recommended queue size trend.'],
      affectedSurfaces: ['entity_detail', 'collection', 'browse_search'],
    })
  }

  {
    const freshnessVerificationPassed = governedReviewFreshness?.verification?.passed === true
    const blockedLeaks = governedReviewFreshness?.verification?.blockedOrRejectedLeaks || []
    const urgentReviewDue = toCount(enrichmentReviewCycle?.summary?.reviewCycleCounts?.urgent_review_due)

    const missing = !governedReviewFreshness
    dimensions.push({
      id: 'review_freshness_coverage',
      label: 'Review freshness coverage and recency risk',
      status: missing
        ? 'missing_input'
        : !freshnessVerificationPassed || blockedLeaks.length > 0
          ? 'fail'
          : urgentReviewDue > 0
            ? 'warn'
            : 'pass',
      impact: missing ? 'blocking' : urgentReviewDue > 0 ? 'risk' : 'blocking',
      summary: missing
        ? 'Governed review freshness report is missing.'
        : !freshnessVerificationPassed
          ? 'Governed review freshness verification failed.'
          : urgentReviewDue > 0
            ? 'Freshness visibility is intact, but urgent review-due items remain.'
            : 'Freshness visibility and blocked-leak checks passed.',
      metrics: {
        evaluatedPages: toCount(governedReviewFreshness?.totals?.evaluatedPages),
        pagesGainedVisibility: toCount(governedReviewFreshness?.totals?.pagesGainedVisibility),
        pagesIntentionallyUnchanged: toCount(governedReviewFreshness?.totals?.pagesIntentionallyUnchanged),
        blockedLeakCount: blockedLeaks.length,
        urgentReviewDue,
      },
      blockers: missing
        ? ['Run `npm run report:governed-review-freshness` before release readiness evaluation.']
        : blockedLeaks.map(row => `Blocked/unapproved leak in review freshness: ${row}`),
      knownRisks: urgentReviewDue > 0 ? [`${urgentReviewDue} items are urgent_review_due in review-cycle report.`] : [],
      recommendedFollowUps: urgentReviewDue > 0 ? ['Prioritize urgent review refreshes on indexable entities.'] : [],
      postReleaseWatch: ['Watch freshness status labels and partial-state ratio on detail pages.'],
      affectedSurfaces: ['governed_review_freshness', 'herb_detail', 'compound_detail'],
    })
  }

  {
    const leakageGuardOk =
      governedPatternRollout?.deterministicVerification?.noBlockedRejectedRevisionRequestedInfluence === true &&
      governedRefinement?.deterministicVerification?.noBlockedRejectedRevisionRequestedInfluence === true

    dimensions.push({
      id: 'blocked_unreviewed_leakage_checks',
      label: 'Blocked/unreviewed leakage checks',
      status:
        governedPatternRollout && governedRefinement
          ? leakageGuardOk
            ? 'pass'
            : 'fail'
          : 'missing_input',
      impact: 'blocking',
      summary: !governedPatternRollout || !governedRefinement
        ? 'Governed refinement or pattern rollout report is missing.'
        : leakageGuardOk
          ? 'Blocked/rejected/revision-requested submissions remain excluded from governed outputs.'
          : 'Leakage guard assertions failed in governed refinement/rollout reports.',
      metrics: {
        rolloutLeakageGuard: governedPatternRollout?.deterministicVerification?.noBlockedRejectedRevisionRequestedInfluence === true,
        refinementLeakageGuard: governedRefinement?.deterministicVerification?.noBlockedRejectedRevisionRequestedInfluence === true,
      },
      blockers:
        !governedPatternRollout || !governedRefinement
          ? ['Refresh governed refinement and pattern rollout reports.']
          : leakageGuardOk
            ? []
            : ['Blocked/unreviewed leakage guard must pass before release.'],
      knownRisks: [],
      recommendedFollowUps: leakageGuardOk ? [] : ['Investigate source verification and governed artifact filtering.'],
      postReleaseWatch: ['Track leakage checks in every governed rollout run.'],
      affectedSurfaces: ['governed_intro_summary', 'governed_quick_compare', 'governed_faq_related_questions'],
    })
  }

  {
    const scoreSummary = governedScorecard?.summary
    const analyticsVerification = governedAnalytics?.verification
    const noInteractionSurfaces = toCount(scoreSummary?.surfacesWithVisibilityButNoInteractions)
    const meaningfulEngagement = toCount(scoreSummary?.surfacesWithMeaningfulEngagement)

    const analyticsPassed =
      analyticsVerification?.supportedSurfaceOnlyEmission === true &&
      analyticsVerification?.weakOrPartialPagesGraceful === true &&
      analyticsVerification?.existingCtaToolAffiliateEventsStillPresent === true &&
      analyticsVerification?.noBroadAnalyticsRegression === true

    dimensions.push({
      id: 'scorecard_and_analytics_impact_on_key_surfaces',
      label: 'Scorecard + governed analytics impact on key surfaces',
      status: !governedScorecard || !governedAnalytics ? 'missing_input' : !analyticsPassed ? 'fail' : noInteractionSurfaces > 0 ? 'warn' : 'pass',
      impact: !governedScorecard || !governedAnalytics ? 'blocking' : noInteractionSurfaces > 0 ? 'risk' : 'blocking',
      summary: !governedScorecard || !governedAnalytics
        ? 'Governed scorecard or governed analytics report is missing.'
        : !analyticsPassed
          ? 'Governed analytics verification indicates instrumentation regression.'
          : noInteractionSurfaces > 0
            ? 'Governed surfaces are tracked, but some visible surfaces still show zero interactions.'
            : 'Governed scorecard/analytics checks show healthy signal coverage.',
      metrics: {
        analyticsEventsAvailable: Boolean(scoreSummary?.analyticsEventsAvailable),
        analyticsEventCount: toCount(scoreSummary?.analyticsEventCount),
        surfaceCount: toCount(scoreSummary?.surfaceCount),
        surfacesWithVisibilityButNoInteractions: noInteractionSurfaces,
        surfacesWithMeaningfulEngagement: meaningfulEngagement,
      },
      blockers: !analyticsPassed && governedAnalytics ? ['Governed analytics verification checks must pass.'] : [],
      knownRisks: noInteractionSurfaces > 0 ? [`${noInteractionSurfaces} governed surfaces have visibility without interactions in this scorecard snapshot.`] : [],
      recommendedFollowUps: ['Compare next scorecard run after rollout to validate surface-level uplift or regression.'],
      postReleaseWatch: ['Monitor zero-interaction surfaces and CTA engagement trends.'],
      affectedSurfaces: (governedScorecard?.surfaces || []).map(row => String(row.surface || '')).filter(Boolean),
    })
  }

  {
    const indexableTotal = indexableHerbs.length + indexableCompounds.length
    const unhealthyIndexable = toCount(enrichmentHealth?.summary?.indexableEntitiesWithoutHealthyState)
    const blockedFromEditorial = toCount(editorialReadiness?.summary?.entitiesBlocked)
    const partiallyBlockedEditorial = toCount(editorialReadiness?.summary?.entitiesPartiallyBlocked)

    const releaseBlocked = unhealthyIndexable > 0 || blockedFromEditorial > 0

    dimensions.push({
      id: 'public_indexable_critical_gaps',
      label: 'Unresolved critical gaps on public/indexable pages',
      status: !enrichmentHealth || !editorialReadiness ? 'missing_input' : releaseBlocked ? 'blocked' : partiallyBlockedEditorial > 0 ? 'warn' : 'pass',
      impact: !enrichmentHealth || !editorialReadiness ? 'blocking' : releaseBlocked ? 'blocking' : 'risk',
      summary: !enrichmentHealth || !editorialReadiness
        ? 'Enrichment health or editorial readiness report is missing.'
        : releaseBlocked
          ? 'Indexable/public entities still have blocked or unhealthy enrichment states.'
          : partiallyBlockedEditorial > 0
            ? 'No hard blocker, but partially blocked editorial entities remain.'
            : 'Indexable/public entities satisfy current enrichment readiness thresholds.',
      metrics: {
        indexableEntityCount: indexableTotal,
        indexableEntitiesWithoutHealthyState: unhealthyIndexable,
        editorialEntitiesBlocked: blockedFromEditorial,
        editorialEntitiesPartiallyBlocked: partiallyBlockedEditorial,
      },
      blockers: releaseBlocked
        ? [
            ...(unhealthyIndexable > 0 ? [`indexableEntitiesWithoutHealthyState=${unhealthyIndexable}`] : []),
            ...(blockedFromEditorial > 0 ? [`editorialEntitiesBlocked=${blockedFromEditorial}`] : []),
          ]
        : [],
      knownRisks:
        partiallyBlockedEditorial > 0
          ? [`${partiallyBlockedEditorial} entities are partially enriched but still blocked.`]
          : [],
      recommendedFollowUps: ['Close blocked or partial enrichment gaps on indexable entities before broad rollout.'],
      postReleaseWatch: ['Track indexable entities drifting out of healthy state in enrichment health report.'],
      affectedSurfaces: ['herb_detail', 'compound_detail', 'publication_manifest_routes'],
    })
  }

  {
    const manifestHerbs = publicationManifest?.entities?.herbs?.length || 0
    const manifestCompounds = publicationManifest?.entities?.compounds?.length || 0
    const routeHerbs = publicationManifest?.routes?.herbs?.length || 0
    const routeCompounds = publicationManifest?.routes?.compounds?.length || 0

    const countsAligned =
      manifestHerbs === indexableHerbs.length &&
      manifestCompounds === indexableCompounds.length &&
      manifestHerbs === routeHerbs &&
      manifestCompounds === routeCompounds

    dimensions.push({
      id: 'noindex_publication_quality_alignment',
      label: 'Noindex / publication-quality alignment',
      status: publicationManifest ? (countsAligned ? 'pass' : 'warn') : 'missing_input',
      impact: publicationManifest ? 'follow_up' : 'blocking',
      summary: !publicationManifest
        ? 'Publication manifest is missing.'
        : countsAligned
          ? 'Manifest entities/routes align with current indexable entity sets.'
          : 'Manifest and indexable route/entity counts are not fully aligned.',
      metrics: {
        manifestHerbs,
        indexableHerbs: indexableHerbs.length,
        routeHerbs,
        manifestCompounds,
        indexableCompounds: indexableCompounds.length,
        routeCompounds,
      },
      blockers: [],
      knownRisks: countsAligned ? [] : ['Potential noindex/indexable drift between publication manifest and generated indexable lists.'],
      recommendedFollowUps: countsAligned ? [] : ['Re-run publication/indexable generation and verify noindex policy alignment.'],
      postReleaseWatch: ['Watch publication-manifest route/entity drift after data refresh runs.'],
      affectedSurfaces: ['publication_manifest', 'indexable_herbs', 'indexable_compounds'],
    })
  }

  {
    const ctaRegressionCheck = governedUxRegression?.checks?.find(row => row.id === 'cta_hierarchy_safety_sensitive')
    const ctaSurface = (governedScorecard?.surfaces || []).find(row => row.surface === 'governed_cta')
    const ctaInteractions = toCount((ctaSurface as Record<string, unknown> | undefined)?.interactionCount)

    const ctaPass = ctaRegressionCheck?.status === 'pass'
    dimensions.push({
      id: 'cta_commercial_compliance_state',
      label: 'CTA/commercial compliance state (safety-first where relevant)',
      status: !governedUxRegression || !governedScorecard ? 'missing_input' : ctaPass ? ctaInteractions === 0 ? 'warn' : 'pass' : 'fail',
      impact: !governedUxRegression || !governedScorecard ? 'blocking' : ctaPass ? 'risk' : 'blocking',
      summary: !governedUxRegression || !governedScorecard
        ? 'CTA compliance cannot be evaluated because governed UX regression or scorecard input is missing.'
        : !ctaPass
          ? 'Safety-first CTA ordering regression detected.'
          : ctaInteractions === 0
            ? 'Safety-first CTA ordering passes, but governed CTA interactions remain zero in scorecard snapshot.'
            : 'CTA safety/commercial compliance checks pass and engagement is non-zero.',
      metrics: {
        ctaHierarchyCheckPass: ctaPass,
        governedCtaInteractionCount: ctaInteractions,
      },
      blockers: ctaPass ? [] : ['CTA hierarchy must remain tool-first before affiliate action on caution-sensitive pages.'],
      knownRisks: ctaPass && ctaInteractions === 0 ? ['Governed CTA has zero interactions in current scorecard snapshot.'] : [],
      recommendedFollowUps: ['Keep CTA ordering safety-first and monitor engagement by page type.'],
      postReleaseWatch: ['Watch tool-vs-affiliate CTA path mix on caution-heavy pages.'],
      affectedSurfaces: ['governed_cta', 'tool_affiliate_related_journey'],
    })
  }

  if (missingRequiredInputs.length) {
    dimensions.push({
      id: 'required_input_artifact_presence',
      label: 'Required governed release-readiness input artifact presence',
      status: 'missing_input',
      impact: 'blocking',
      summary: 'One or more required input artifacts are missing.',
      metrics: {
        missingArtifactCount: missingRequiredInputs.length,
      },
      blockers: missingRequiredInputs,
      knownRisks: [],
      recommendedFollowUps: ['Regenerate missing inputs before using this report for release decisions.'],
      postReleaseWatch: [],
      affectedSurfaces: ['ops/reports', 'public/data'],
    })
  }

  const blockerReasons = dimensions.flatMap(row => row.blockers)
  const knownRisks = dimensions.flatMap(row => row.knownRisks)
  const followUps = dimensions.flatMap(row => row.recommendedFollowUps)
  const postReleaseWatchItems = dimensions.flatMap(row => row.postReleaseWatch)

  const releaseState = getReleaseState(dimensions)

  const affectedSurfaceSet = new Set<string>()
  for (const row of dimensions) row.affectedSurfaces.forEach(surface => affectedSurfaceSet.add(surface))
  for (const row of governedPatternRollout?.standardizationTargets || []) {
    if (row.pageType) affectedSurfaceSet.add(row.pageType)
    if (row.componentType) affectedSurfaceSet.add(row.componentType)
  }

  const checklist = {
    preMerge: [
      'Confirm all blocking dimensions are pass (or intentionally risk-accepted with reviewer sign-off).',
      'Ensure governed UX regression report is current and passing.',
      'Ensure enrichment health/backlog/review-cycle reports are current and contain no hide/suppress blockers.',
      'Verify blocked/unreviewed leakage guards pass in refinement + rollout artifacts.',
      'Review governed scorecard surface impact, especially zero-interaction surfaces and CTA behavior.',
    ],
    preDeploy: [
      'Re-run governed release-readiness report immediately before deploy cut.',
      'Validate publication/indexable alignment counts for herbs and compounds.',
      'Review blocker reasons and known risks in this report JSON/MD output.',
    ],
    postReleaseWatch: Array.from(new Set(postReleaseWatchItems)),
  }

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-release-readiness-v1',
    reportScope,
    releaseState,
    inputs: {
      requiredArtifacts: inputStatuses,
      missingRequiredInputs,
    },
    dimensions,
    blockerReasons: Array.from(new Set(blockerReasons)),
    knownRisks: Array.from(new Set(knownRisks)),
    recommendedFollowUps: Array.from(new Set(followUps)),
    postReleaseWatchItems: checklist.postReleaseWatch,
    affectedSurfaces: Array.from(affectedSurfaceSet).sort(),
    checklist,
  }

  const md: string[] = []
  md.push('# Governed release readiness checklist')
  md.push('')
  md.push(`Generated: ${report.generatedAt}`)
  md.push(`Deterministic model: ${report.deterministicModelVersion}`)
  md.push(`Release state: **${report.releaseState}**`)
  md.push('')
  md.push('## Dimension results')
  for (const row of report.dimensions) {
    md.push(`- [${row.status.toUpperCase()}][${row.impact}] ${row.id} — ${row.summary}`)
    const metrics = Object.entries(row.metrics)
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(', ')
    if (metrics) md.push(`  - Metrics: ${metrics}`)
    if (row.blockers.length) md.push(`  - Blockers: ${row.blockers.join(' | ')}`)
    if (row.knownRisks.length) md.push(`  - Known risks: ${row.knownRisks.join(' | ')}`)
    if (row.recommendedFollowUps.length) md.push(`  - Follow-ups: ${row.recommendedFollowUps.join(' | ')}`)
  }

  md.push('')
  md.push('## Pre-merge checklist')
  report.checklist.preMerge.forEach(item => md.push(`- [ ] ${item}`))
  md.push('')
  md.push('## Pre-deploy checklist')
  report.checklist.preDeploy.forEach(item => md.push(`- [ ] ${item}`))
  md.push('')
  md.push('## Post-release watch')
  report.checklist.postReleaseWatch.forEach(item => md.push(`- [ ] ${item}`))
  md.push('')
  md.push('## Affected surfaces / page types')
  report.affectedSurfaces.forEach(surface => md.push(`- ${surface}`))

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${md.join('\n')}\n`, 'utf8')

  console.log(`[report:governed-release-readiness] wrote ${path.relative(ROOT, OUT_JSON)} state=${report.releaseState}`)
  console.log(`[report:governed-release-readiness] wrote ${path.relative(ROOT, OUT_MD)}`)
}

main()
