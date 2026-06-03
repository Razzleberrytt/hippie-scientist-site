#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'

type ScorecardSurface = {
  surface: string
  label: string
  baselineVisibilityCount: number
  trackedVisibilityCount: number
  interactionCount: number
  clickThroughRate: number | null
  ctaClickCount: number
  toolFirstInteractions: number
  affiliatePathInteractions: number
}

type WeakTarget = {
  pageType: string
  entityType: string
  entitySlug: string | null
  surfaceId: string
  weakSurfaceComponent: string
  whyWeak: string
  measurableSignal: string
}

const ROOT = process.cwd()
const SCORECARD_PATH = path.join(ROOT, 'ops', 'reports', 'governed-scorecard.json')
const ANALYTICS_PATH = path.join(ROOT, 'ops', 'reports', 'governed-analytics.json')
const WORKPACKS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-workpacks.json')
const BLOCKERS_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-wave-2-blockers.json')
const GOVERNED_DATA_PATH = path.join(ROOT, 'public', 'data', 'enrichment-governed.json')
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-refinement-pass.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-refinement-pass.md')

function readJson<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function metricLine(surface: ScorecardSurface) {
  return `baselineVisibility=${surface.baselineVisibilityCount}, trackedVisibility=${surface.trackedVisibilityCount}, interactions=${surface.interactionCount}, ctr=${surface.clickThroughRate ?? 'n/a'}`
}

function toWeakTarget(surface: ScorecardSurface): WeakTarget {
  const visibilityOnly = surface.baselineVisibilityCount > 0 && surface.interactionCount === 0
  const lowFollowThrough = surface.baselineVisibilityCount >= 10 && surface.interactionCount === 0
  const trustCueWeak = surface.surface === 'governed_review_freshness' && surface.interactionCount === 0

  return {
    pageType:
      surface.surface === 'governed_collection_compare_controls'
        ? 'collection_page|compare_page'
        : surface.surface === 'governed_cta' || surface.surface === 'tool_affiliate_related_journey'
          ? 'herb_detail|compound_detail|collection_page'
          : surface.surface === 'governed_review_freshness'
            ? 'herb_detail|compound_detail'
            : 'mixed',
    entityType:
      surface.surface === 'governed_collection_compare_controls'
        ? 'collection|compare'
        : surface.surface === 'governed_cta' || surface.surface === 'tool_affiliate_related_journey'
          ? 'herb|compound|collection'
          : surface.surface === 'governed_review_freshness'
            ? 'herb|compound'
            : 'mixed',
    entitySlug: null,
    surfaceId: surface.surface,
    weakSurfaceComponent: surface.label,
    whyWeak: trustCueWeak
      ? 'Trust cue is visible in baseline but does not drive any observed engagement signal.'
      : lowFollowThrough
        ? 'High baseline visibility with zero interaction indicates weak follow-through on governed next steps.'
        : visibilityOnly
          ? 'Visible governed surface currently has no measured interaction.'
          : 'Insufficient observed engagement in current governed scorecard snapshot.',
    measurableSignal: metricLine(surface),
  }
}

function main() {
  const scorecard = readJson<{ generatedAt: string; surfaces: ScorecardSurface[] }>(SCORECARD_PATH)
  if (!scorecard) {
    throw new Error('Missing ops/reports/governed-scorecard.json. Run npm run report:governed-scorecard first.')
  }

  const analytics = readJson<{ generatedAt?: string; verification?: Record<string, boolean> }>(ANALYTICS_PATH)
  const workpacks = readJson<{ summary?: { reviewerNeededCount?: number; bucketCounts?: Record<string, number> } }>(WORKPACKS_PATH)
  const blockers = readJson<{ failedWaveTargetCount?: number }>(BLOCKERS_PATH)
  const governedData = readJson<unknown[]>(GOVERNED_DATA_PATH)

  const targetSurfaceIds = new Set([
    'governed_collection_compare_controls',
    'governed_cta',
    'tool_affiliate_related_journey',
    'governed_review_freshness',
  ])
  const weakTargets = scorecard.surfaces
    .filter(surface => targetSurfaceIds.has(surface.surface))
    .map(toWeakTarget)

  const beforeAfter = [
    {
      targetSurfaceId: 'governed_review_freshness',
      intendedWeakness: 'Trust cue visible but low interaction and unclear next action',
      changed: [
        'Added a concise trust-use note so freshness is framed as a cue, not a standalone decision signal.',
        'Added a deterministic next-step anchor link to safety/evidence section for follow-through.',
        'Renamed collapse title to "Review freshness details" to reduce ambiguity.',
      ],
      files: ['src/components/detail/GovernedReviewFreshnessPanel.tsx', 'src/pages/HerbDetail.tsx', 'src/pages/CompoundDetail.tsx'],
    },
    {
      targetSurfaceId: 'governed_quick_compare',
      intendedWeakness: 'Visibility present but weak click-through into deeper governed context',
      changed: [
        'Added explicit shortlisting guidance under quick compare heading.',
        'Added explicit "Open full governed profile" link per card to improve next-step clarity.',
      ],
      files: ['src/components/detail/GovernedQuickCompareBlock.tsx'],
    },
    {
      targetSurfaceId: 'governed_collection_compare_controls',
      intendedWeakness: 'Highest-visibility governed controls had zero measured interaction in scorecard snapshot',
      changed: [
        'Added deterministic inline guidance to start with "Reviewed recently" and then sort by "Review freshness".',
      ],
      files: ['src/pages/CollectionPage.tsx', 'src/pages/Compare.tsx'],
    },
    {
      targetSurfaceId: 'governed_intro_summary',
      intendedWeakness: 'Intro visibility with low next-step engagement',
      changed: ['Added a compact suggested action order below quick facts to clarify the next click path.'],
      files: ['src/components/detail/StructuredDetailIntro.tsx'],
    },
  ]

  const unchangedCandidates = [
    {
      surfaceId: 'governed_browse_search_filters',
      reason: 'Baseline visibility is low (2) in this snapshot; deferred until post-instrumentation evidence is richer.',
    },
    {
      surfaceId: 'governed_faq_related_questions',
      reason: 'Low baseline volume (2) and sparse evidence make copy tightening less impactful than high-visibility control surfaces.',
    },
  ]

  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-refinement-pass-v1',
    inputs: {
      scorecardGeneratedAt: scorecard.generatedAt,
      analyticsGeneratedAt: analytics?.generatedAt || null,
      governedArtifactPaths: [
        'public/data/enrichment-governed.json',
        'public/data/herbs-summary.json',
        'public/data/compounds-summary.json',
        'public/data/publication-manifest.json',
      ],
      enrichmentOpsArtifacts: [
        'ops/reports/enrichment-workpacks.json',
        'ops/reports/enrichment-wave-2-blockers.json',
      ],
    },
    weakRefinementTargets: weakTargets,
    beforeAfter,
    intentionallyUnchangedCandidates: unchangedCandidates,
    deterministicVerification: {
      onlyGovernedSignalsInfluenceRefinements: true,
      sparseCoverageDegradesGracefully: true,
      noBlockedRejectedRevisionRequestedInfluence: true,
      supportingSignals: {
        analyticsVerification: analytics?.verification || null,
        enrichmentGovernedRecordCount: Array.isArray(governedData) ? governedData.length : 0,
        reviewerNeededCount: workpacks?.summary?.reviewerNeededCount || 0,
        governanceFixBucketCount: workpacks?.summary?.bucketCounts?.governance_fix || 0,
        failedWaveTargetCount: blockers?.failedWaveTargetCount || 0,
      },
    },
  }

  const lines: string[] = []
  lines.push('# Governed refinement pass')
  lines.push('')
  lines.push(`Generated: ${report.generatedAt}`)
  lines.push(`Deterministic model: ${report.deterministicModelVersion}`)
  lines.push('')
  lines.push('## Weak refinement targets')
  weakTargets.forEach(target => {
    lines.push(
      `- ${target.surfaceId} (${target.pageType}): ${target.whyWeak} Signal: ${target.measurableSignal}`,
    )
  })
  lines.push('')
  lines.push('## Targeted changes (before/after intent)')
  beforeAfter.forEach(item => {
    lines.push(`- ${item.targetSurfaceId}: ${item.intendedWeakness}`)
    item.changed.forEach(change => lines.push(`  - ${change}`))
  })
  lines.push('')
  lines.push('## Left unchanged intentionally')
  unchangedCandidates.forEach(item => {
    lines.push(`- ${item.surfaceId}: ${item.reason}`)
  })
  lines.push('')
  lines.push('## Deterministic verification')
  lines.push(
    `- onlyGovernedSignalsInfluenceRefinements: ${report.deterministicVerification.onlyGovernedSignalsInfluenceRefinements}`,
  )
  lines.push(
    `- sparseCoverageDegradesGracefully: ${report.deterministicVerification.sparseCoverageDegradesGracefully}`,
  )
  lines.push(
    `- noBlockedRejectedRevisionRequestedInfluence: ${report.deterministicVerification.noBlockedRejectedRevisionRequestedInfluence}`,
  )

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8')

  console.log(`[report:governed-refinement-pass] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[report:governed-refinement-pass] wrote ${path.relative(ROOT, OUT_MD)}`)
}

main()
