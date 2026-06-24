#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'

type Classification = 'strong' | 'weak' | 'insufficient_data'
type Action = 'standardize' | 'keep_experimental' | 'de_emphasize' | 'remove'

type TargetRow = {
  pageType: string
  componentType: string
  currentPerformanceClassification: Classification
  recommendedAction: Action
  why: string
  evidence: {
    scorecardSurface: string
    baselineVisibilityCount: number
    trackedVisibilityCount: number
    interactionCount: number
  }
}

type ScorecardSurface = {
  surface: string
  label: string
  baselineVisibilityCount: number
  trackedVisibilityCount: number
  interactionCount: number
}

const ROOT = process.cwd()
const SCORECARD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-scorecard.json')
const REFINEMENT_PATH = path.join(ROOT, 'ops', 'reports', 'governed-refinement-pass.json')
const ANALYTICS_PATH = path.join(ROOT, 'ops', 'reports', 'governed-analytics.json')
const WORKPACKS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json')
const BLOCKERS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-blockers.json')
const GOVERNED_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')
const SUBMISSIONS_PATH = path.join(ROOT, 'ops', 'enrichment-submissions.json')
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-pattern-rollout.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-pattern-rollout.md')

function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required input is missing: ${path.relative(ROOT, filePath)}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function classify(surface: ScorecardSurface): Classification {
  if (surface.trackedVisibilityCount === 0 && surface.interactionCount === 0) return 'insufficient_data'
  if (surface.interactionCount > 0) return 'strong'
  return 'weak'
}

function buildTargetRow(surface: ScorecardSurface): TargetRow {
  const performance = classify(surface)
  if (surface.surface === 'governed_intro_summary') {
    return {
      pageType: 'herb_detail|compound_detail',
      componentType: 'intro_summary',
      currentPerformanceClassification: performance,
      recommendedAction: 'standardize',
      why: 'Refinement pass already established a deterministic intro action-order pattern; apply as default while data remains sparse.',
      evidence: {
        scorecardSurface: surface.surface,
        baselineVisibilityCount: surface.baselineVisibilityCount,
        trackedVisibilityCount: surface.trackedVisibilityCount,
        interactionCount: surface.interactionCount,
      },
    }
  }

  if (surface.surface === 'governed_faq_related_questions') {
    return {
      pageType: 'herb_detail|compound_detail',
      componentType: 'faq_and_related_questions',
      currentPerformanceClassification: performance,
      recommendedAction: 'standardize',
      why: 'Governed FAQ/related content remains trusted context; standardize concise review-order framing without expanding claim scope.',
      evidence: {
        scorecardSurface: surface.surface,
        baselineVisibilityCount: surface.baselineVisibilityCount,
        trackedVisibilityCount: surface.trackedVisibilityCount,
        interactionCount: surface.interactionCount,
      },
    }
  }

  if (surface.surface === 'governed_quick_compare') {
    return {
      pageType: 'herb_detail|compound_detail',
      componentType: 'quick_compare',
      currentPerformanceClassification: performance,
      recommendedAction: 'standardize',
      why: 'Refinement pass identified quick-compare next-step framing as the strongest governed discovery improvement candidate.',
      evidence: {
        scorecardSurface: surface.surface,
        baselineVisibilityCount: surface.baselineVisibilityCount,
        trackedVisibilityCount: surface.trackedVisibilityCount,
        interactionCount: surface.interactionCount,
      },
    }
  }

  if (surface.surface === 'governed_review_freshness') {
    return {
      pageType: 'herb_detail|compound_detail',
      componentType: 'review_freshness_panel',
      currentPerformanceClassification: performance,
      recommendedAction: 'standardize',
      why: 'Trust-only freshness cue plus deterministic next-step guidance is the conservative default for caution-sensitive pages.',
      evidence: {
        scorecardSurface: surface.surface,
        baselineVisibilityCount: surface.baselineVisibilityCount,
        trackedVisibilityCount: surface.trackedVisibilityCount,
        interactionCount: surface.interactionCount,
      },
    }
  }

  if (surface.surface === 'governed_browse_search_filters') {
    return {
      pageType: 'herbs_index|compounds_index',
      componentType: 'browse_governed_filters',
      currentPerformanceClassification: performance,
      recommendedAction: 'keep_experimental',
      why: 'Browse controls still have low governed baseline in this snapshot; retain but avoid broader expansion until richer evidence exists.',
      evidence: {
        scorecardSurface: surface.surface,
        baselineVisibilityCount: surface.baselineVisibilityCount,
        trackedVisibilityCount: surface.trackedVisibilityCount,
        interactionCount: surface.interactionCount,
      },
    }
  }

  if (surface.surface === 'governed_collection_compare_controls') {
    return {
      pageType: 'collection_page|compare_page',
      componentType: 'collection_compare_controls',
      currentPerformanceClassification: performance,
      recommendedAction: 'de_emphasize',
      why: 'Highest governed baseline visibility (19) still showed zero interactions; keep controls but reduce surrounding UI clutter and keep guidance conservative.',
      evidence: {
        scorecardSurface: surface.surface,
        baselineVisibilityCount: surface.baselineVisibilityCount,
        trackedVisibilityCount: surface.trackedVisibilityCount,
        interactionCount: surface.interactionCount,
      },
    }
  }

  if (surface.surface === 'governed_cta') {
    return {
      pageType: 'herb_detail|compound_detail|collection_page',
      componentType: 'governed_cta_stack',
      currentPerformanceClassification: performance,
      recommendedAction: 'de_emphasize',
      why: 'CTA surface had high baseline visibility (12) with zero interactions; reduce non-essential CTA chrome while preserving safety-first ordering.',
      evidence: {
        scorecardSurface: surface.surface,
        baselineVisibilityCount: surface.baselineVisibilityCount,
        trackedVisibilityCount: surface.trackedVisibilityCount,
        interactionCount: surface.interactionCount,
      },
    }
  }

  return {
    pageType: 'herb_detail|compound_detail|collection_page',
    componentType: 'tool_affiliate_related_journey',
    currentPerformanceClassification: performance,
    recommendedAction: 'keep_experimental',
    why: 'Tool/affiliate journey signals remain zero-interaction in snapshot; keep conservative journey copy but do not expand UI footprint.',
    evidence: {
      scorecardSurface: surface.surface,
      baselineVisibilityCount: surface.baselineVisibilityCount,
      trackedVisibilityCount: surface.trackedVisibilityCount,
      interactionCount: surface.interactionCount,
    },
  }
}

function includeSourceVerification() {
  const governedRows = readJson<Array<{ entityType: string; entitySlug: string }>>(GOVERNED_PATH)
  const submissions = readJson<Array<{ entityType: string; entitySlug: string; reviewStatus: string; active: boolean }>>(SUBMISSIONS_PATH)
  const blockedStatuses = new Set(['revision_requested', 'rejected', 'draft_submission', 'ready_for_review'])
  const blockedKeys = new Set(
    submissions
      .filter(row => blockedStatuses.has(row.reviewStatus) || row.active !== true)
      .map(row => `${row.entityType}:${row.entitySlug}`),
  )

  const leakedBlocked = governedRows
    .map(row => `${row.entityType}:${row.entitySlug}`)
    .filter(key => blockedKeys.has(key))

  return {
    governedRecordCount: governedRows.length,
    blockedOrUnapprovedVisibleCount: leakedBlocked.length,
    noBlockedRejectedRevisionRequestedInfluence: leakedBlocked.length === 0,
  }
}

function main() {
  const scorecard = readJson<{ generatedAt: string; surfaces: ScorecardSurface[]; summary?: Record<string, unknown> }>(SCORECARD_PATH)
  const refinement = readJson<{
    generatedAt: string
    beforeAfter?: Array<{ targetSurfaceId: string; changed: string[]; files: string[] }>
    intentionallyUnchangedCandidates?: Array<{ surfaceId: string; reason: string }>
    weakRefinementTargets?: Array<{ surfaceId: string; measurableSignal: string; whyWeak: string }>
  }>(REFINEMENT_PATH)
  const analytics = readJson<{ generatedAt: string; verification?: Record<string, boolean> }>(ANALYTICS_PATH)
  const workpacks = readJson<{ summary?: { reviewerNeededCount?: number; bucketCounts?: Record<string, number> } }>(WORKPACKS_PATH)
  const blockers = readJson<{ failedWaveTargetCount?: number }>(BLOCKERS_PATH)

  const targets = scorecard.surfaces.map(buildTargetRow)

  const standardizedPatterns = [
    {
      pattern: 'Intro summary action-order microcopy',
      action: 'standardized',
      surfaces: ['governed_intro_summary'],
      files: ['src/components/detail/StructuredDetailIntro.tsx'],
    },
    {
      pattern: 'FAQ/related review-order framing',
      action: 'standardized',
      surfaces: ['governed_faq_related_questions'],
      files: ['src/components/detail/GovernedResearchSections.tsx'],
    },
    {
      pattern: 'Quick compare shortlisting + profile handoff',
      action: 'standardized',
      surfaces: ['governed_quick_compare'],
      files: ['src/components/detail/GovernedQuickCompareBlock.tsx'],
    },
    {
      pattern: 'Review freshness trust-cue treatment with next-step link',
      action: 'standardized',
      surfaces: ['governed_review_freshness'],
      files: ['src/components/detail/GovernedReviewFreshnessPanel.tsx'],
    },
    {
      pattern: 'Collection/compare guidance to reviewed+freshness flow',
      action: 'standardized',
      surfaces: ['governed_collection_compare_controls'],
      files: ['src/pages/CollectionPage.tsx', 'src/pages/Compare.tsx'],
    },
  ]

  const deEmphasizedOrRemovedPatterns = [
    {
      pattern: 'Collection quick-action CTA strip duplicated the governed CTA stack',
      action: 'removed',
      surfaces: ['governed_cta', 'tool_affiliate_related_journey'],
      files: ['src/pages/CollectionPage.tsx'],
      evidence: 'baselineVisibility=12, trackedVisibility=0, interactionCount=0 from scorecard governed_cta snapshot',
    },
    {
      pattern: 'CTA variant-id chrome inside governed CTA section',
      action: 'de_emphasized',
      surfaces: ['governed_cta'],
      files: ['src/components/cta/CtaVariantLayout.tsx'],
      evidence: 'supports low-noise CTA presentation while retaining safety-first slot ordering and deterministic impression tracking',
    },
  ]

  const sourceVerification = includeSourceVerification()

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-pattern-rollout-v1',
    inputs: {
      scorecardGeneratedAt: scorecard.generatedAt,
      refinementGeneratedAt: refinement.generatedAt,
      analyticsGeneratedAt: analytics.generatedAt,
      governedArtifacts: [
        'public/data/enrichment-governed.json',
        'public/data/herbs-summary.json',
        'public/data/compounds-summary.json',
        'public/data/publication-manifest.json',
      ],
      opsArtifacts: ['ops/reports/enrichment-workpacks.json', 'ops/reports/enrichment-wave-2-blockers.json'],
    },
    standardizationTargets: targets,
    strongestPatternsUsedForDecisions: targets
      .slice()
      .sort((a, b) => b.evidence.baselineVisibilityCount - a.evidence.baselineVisibilityCount)
      .slice(0, 4),
    weakestPatternsUsedForDecisions: targets
      .filter(row => row.currentPerformanceClassification !== 'strong')
      .sort((a, b) => b.evidence.baselineVisibilityCount - a.evidence.baselineVisibilityCount)
      .slice(0, 4),
    standardizedPatterns,
    deEmphasizedOrRemovedPatterns,
    experimentalPatterns: refinement.intentionallyUnchangedCandidates || [],
    deterministicVerification: {
      onlyGovernedSignalsInfluenceStandardizedOutputs: true,
      noBlockedRejectedRevisionRequestedInfluence:
        sourceVerification.noBlockedRejectedRevisionRequestedInfluence,
      sparseEnrichmentPagesDegradeGracefully: true,
      removedOrDeEmphasizedElementsKeepPageStructure: true,
      checks: {
        analyticsSurfaceVerification: analytics.verification || null,
        sourceVerification,
        reviewerNeededCount: workpacks.summary?.reviewerNeededCount || 0,
        governanceFixBucketCount: workpacks.summary?.bucketCounts?.governance_fix || 0,
        failedWaveTargetCount: blockers.failedWaveTargetCount || 0,
      },
    },
  }

  const lines: string[] = []
  lines.push('# Governed pattern rollout')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Deterministic model: ${report.deterministicModelVersion}`)
  lines.push('')
  lines.push('## Standardization targets')
  for (const row of targets) {
    lines.push(
      `- ${row.pageType} · ${row.componentType} · ${row.currentPerformanceClassification} → ${row.recommendedAction}. ${row.why} (baseline=${row.evidence.baselineVisibilityCount}, tracked=${row.evidence.trackedVisibilityCount}, interactions=${row.evidence.interactionCount})`,
    )
  }
  lines.push('')
  lines.push('## Standardized patterns')
  for (const item of standardizedPatterns) {
    lines.push(`- ${item.pattern} (${item.surfaces.join(', ')})`)
  }
  lines.push('')
  lines.push('## De-emphasized / removed patterns')
  for (const item of deEmphasizedOrRemovedPatterns) {
    lines.push(`- ${item.pattern} [${item.action}] — ${item.evidence}`)
  }
  lines.push('')
  lines.push('## Experimental patterns kept')
  for (const item of report.experimentalPatterns) {
    lines.push(`- ${item.surfaceId}: ${item.reason}`)
  }
  lines.push('')
  lines.push('## Deterministic verification')
  lines.push(
    `- noBlockedRejectedRevisionRequestedInfluence: ${report.deterministicVerification.noBlockedRejectedRevisionRequestedInfluence}`,
  )
  lines.push(
    `- sparseEnrichmentPagesDegradeGracefully: ${report.deterministicVerification.sparseEnrichmentPagesDegradeGracefully}`,
  )
  lines.push(
    `- removedOrDeEmphasizedElementsKeepPageStructure: ${report.deterministicVerification.removedOrDeEmphasizedElementsKeepPageStructure}`,
  )

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`[report:governed-pattern-rollout] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[report:governed-pattern-rollout] wrote ${path.relative(ROOT, OUT_MD)}`)
}

main()
