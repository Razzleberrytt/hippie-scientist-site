#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'
import publicationManifest from '../public/data/publication-manifest.json'
import herbSummaries from '../public/data/herbs-summary.json'
import compoundSummaries from '../public/data/compounds-summary.json'
import submissions from '../ops/enrichment-submissions.json'
import governedRollup from '../public/data/enrichment-governed.json'
import { buildFallbackCompoundIntro, buildFallbackHerbIntro, buildGovernedDetailIntro, countPlaceholderSignals } from '../src/lib/governedIntro'
import { buildGovernedFaqSectionContent } from '../src/lib/governedFaq'
import { buildGovernedRelatedQuestions } from '../src/lib/governedRelatedQuestions'
import { buildGovernedQuickCompareSection } from '../src/lib/governedQuickCompare'
import { buildGovernedReviewFreshness } from '../src/lib/governedReviewFreshness'
import { applyGovernedDiscoveryControls, type GovernedDiscoveryFilter, type GovernedDiscoverySort } from '../src/lib/governedCollectionDiscovery'
import { resolveGovernedCtaDecision } from '../src/lib/governedCta'
import { buildGovernedCollectionIntro, countPlaceholderHeavyCollectionIntro } from '../src/lib/governedCollectionIntro'
import { getGovernedResearchEnrichment, getPublishableGovernedEntries, type GovernedEntityType } from '../src/lib/governedResearch'
import { calculateCompoundConfidence, calculateHerbConfidence } from '../src/utils/calculateConfidence'
import type { ResearchEnrichment } from '../src/types/researchEnrichment'

type EntityType = 'herb' | 'compound'
type CheckStatus = 'pass' | 'fail'

type CheckResult = {
  id: string
  title: string
  status: CheckStatus
  reason: string
  metrics?: Record<string, number | string | boolean>
}

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-ux-regression.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-ux-regression.md')

const BLOCKED_REVIEW_STATUSES = new Set([
  'blocked',
  'rejected',
  'revision_requested',
  'ready_for_review',
  'draft_submission',
  'under_review',
  'needs_validation_fix',
  'partial',
])

function asString(value: unknown) {
  return String(value || '').trim()
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map(item => String(item || '').trim()).filter(Boolean)
}

function keyOf(entityType: EntityType, slug: string) {
  return `${entityType}:${slug}`
}

function readDetailRow(entityType: EntityType, slug: string): Record<string, unknown> | null {
  const filePath = path.join(
    ROOT,
    'public',
    'data',
    entityType === 'herb' ? 'herbs-detail' : 'compounds-detail',
    `${slug}.json`,
  )
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>
}

function check(results: CheckResult[], row: Omit<CheckResult, 'status' | 'reason'> & { ok: boolean; passReason: string; failReason: string }) {
  results.push({
    id: row.id,
    title: row.title,
    status: row.ok ? 'pass' : 'fail',
    reason: row.ok ? row.passReason : row.failReason,
    ...(row.metrics ? { metrics: row.metrics } : {}),
  })
}

function cloneAsPartial(enrichment: ResearchEnrichment): ResearchEnrichment {
  return {
    ...enrichment,
    supportedUses: [],
    unsupportedOrUnclearUses: [],
    interactions: [],
    contraindications: [],
    adverseEffects: [],
    mechanisms: [],
    constituents: [],
    safetyProfile: {
      safetyEntries: [],
      summary: {
        total: 0,
        byTopicType: {},
        bySeverity: {},
      },
    },
  }
}

function run() {
  const checks: CheckResult[] = []
  const publishable = getPublishableGovernedEntries()
  const publishableKeySet = new Set(publishable.map(row => keyOf(row.entityType, row.entitySlug)))
  const blockedKeys = new Set(
    (submissions as Array<{ entityType: GovernedEntityType; entitySlug: string; reviewStatus: string; active?: boolean }>)
      .filter(row => BLOCKED_REVIEW_STATUSES.has(asString(row.reviewStatus)) || row.active !== true)
      .map(row => keyOf(row.entityType, row.entitySlug)),
  )

  check(checks, {
    id: 'approved_governed_coverage_exists',
    title: 'Approved governed enrichment coverage exists',
    ok: publishable.length > 0,
    passReason: 'Publishable governed entries are present and regression checks are meaningful.',
    failReason: 'No publishable governed entries found; cannot verify governed UX surfaces.',
    metrics: { publishableEntries: publishable.length },
  })

  const leakedBlockedInRollup = (governedRollup as Array<{ entityType: EntityType; entitySlug: string }>)
    .map(row => keyOf(row.entityType, row.entitySlug))
    .filter(key => blockedKeys.has(key) && publishableKeySet.has(key))

  check(checks, {
    id: 'blocked_non_influence_runtime',
    title: 'Blocked/rejected/unreviewed enrichment cannot influence runtime governed surfaces',
    ok: leakedBlockedInRollup.length === 0,
    passReason: 'Blocked and non-approved submissions are excluded from publishable governed runtime.',
    failReason: `Blocked or unapproved governed entries leaked into runtime: ${leakedBlockedInRollup.slice(0, 5).join(', ')}`,
    metrics: {
      blockedOrUnapprovedEntries: blockedKeys.size,
      leakedEntries: leakedBlockedInRollup.length,
    },
  })

  let introEligiblePages = 0
  let introGovernedPages = 0
  let placeholderBefore = 0
  let placeholderAfter = 0

  for (const row of publishable) {
    const detail = readDetailRow(row.entityType, row.entitySlug)
    if (!detail) continue
    introEligiblePages += 1

    if (row.entityType === 'herb') {
      const fallback = buildFallbackHerbIntro({
        herbDisplayName: asString(detail.commonName || detail.common || detail.name || row.entitySlug),
        description: asString(detail.description),
        mechanism: asString(detail.mechanism),
        therapeuticUses: asStringArray(detail.therapeuticUses),
        primaryEffects: asStringArray(detail.effects).slice(0, 4),
        confidence: calculateHerbConfidence({
          mechanism: asString(detail.mechanism),
          effects: asStringArray(detail.effects),
          compounds: asStringArray(detail.activeCompounds),
        }),
        sourceCount: Array.isArray(detail.sources) ? detail.sources.length : 0,
        cautionCount:
          asStringArray(detail.contraindications).length +
          asStringArray(detail.interactions).length +
          asStringArray(detail.sideeffects).length,
        contraindications: asStringArray(detail.contraindications),
        interactions: asStringArray(detail.interactions),
        sideEffects: asStringArray(detail.sideeffects),
        introFacts: ['regression-check'],
      })
      const intro = buildGovernedDetailIntro({
        entityName: asString(detail.commonName || detail.common || detail.name || row.entitySlug),
        fallback,
        enrichment: getGovernedResearchEnrichment('herb', row.entitySlug),
        sourceCount: Array.isArray(detail.sources) ? detail.sources.length : 0,
      })
      placeholderBefore += countPlaceholderSignals(fallback)
      placeholderAfter += countPlaceholderSignals(intro)
      if (intro.decision.mode === 'governed') introGovernedPages += 1
    } else {
      const fallback = buildFallbackCompoundIntro({
        compoundName: asString(detail.name || row.entitySlug),
        description: asString(detail.description),
        mechanism: asString(detail.mechanism),
        therapeuticUses: asStringArray(detail.therapeuticUses),
        primaryEffects: asStringArray(detail.effects).slice(0, 4),
        linkedHerbCount: asStringArray(detail.herbs).length,
        confidence: calculateCompoundConfidence({
          mechanism: asString(detail.mechanism),
          effects: asStringArray(detail.effects),
          compounds: asStringArray(detail.herbs),
        }),
        sourceCount: Array.isArray(detail.sources) ? detail.sources.length : 0,
        cautionCount:
          asStringArray(detail.contraindications).length +
          asStringArray(detail.interactions).length +
          asStringArray(detail.sideEffects).length,
        contraindications: asStringArray(detail.contraindications),
        interactions: asStringArray(detail.interactions),
        sideEffects: asStringArray(detail.sideEffects),
        introFacts: ['regression-check'],
      })
      const intro = buildGovernedDetailIntro({
        entityName: asString(detail.name || row.entitySlug),
        fallback,
        enrichment: getGovernedResearchEnrichment('compound', row.entitySlug),
        sourceCount: Array.isArray(detail.sources) ? detail.sources.length : 0,
      })
      placeholderBefore += countPlaceholderSignals(fallback)
      placeholderAfter += countPlaceholderSignals(intro)
      if (intro.decision.mode === 'governed') introGovernedPages += 1
    }
  }

  check(checks, {
    id: 'governed_intro_presence_on_eligible_pages',
    title: 'Governed intro appears on eligible publishable detail pages',
    ok: introEligiblePages > 0 && introGovernedPages === introEligiblePages,
    passReason: 'All eligible publishable detail pages render governed intro output.',
    failReason: `Governed intro coverage drifted (${introGovernedPages}/${introEligiblePages} eligible pages).`,
    metrics: { introEligiblePages, introGovernedPages },
  })

  check(checks, {
    id: 'placeholder_fallback_not_regressed',
    title: 'Placeholder-heavy fallback text does not override governed-safe summaries',
    ok: placeholderAfter <= placeholderBefore,
    passReason: 'Governed intro output stays equal or better than fallback placeholder density.',
    failReason: `Placeholder signals regressed from ${placeholderBefore} to ${placeholderAfter}.`,
    metrics: { placeholderBefore, placeholderAfter },
  })

  let faqSupported = 0
  let faqVisible = 0
  let relatedVisible = 0
  for (const row of publishable) {
    const enrichment = getGovernedResearchEnrichment(row.entityType, row.entitySlug)
    if (!enrichment) continue
    const faq = buildGovernedFaqSectionContent({
      entityType: row.entityType,
      entityName: row.entitySlug,
      enrichment,
    })
    const related = buildGovernedRelatedQuestions({
      entityType: row.entityType,
      entityName: row.entitySlug,
      enrichment,
      governedFaq: faq,
      hasVisibleCompareSection: true,
    })
    const hasFaqContent = faq.faqItems.length > 0
    const hasRelated = related.items.length > 0
    if (hasFaqContent || hasRelated) faqSupported += 1
    if (hasFaqContent) faqVisible += 1
    if (hasRelated) relatedVisible += 1
  }

  check(checks, {
    id: 'faq_related_presence_supported',
    title: 'Governed FAQ and related questions persist where supported',
    ok: faqSupported > 0 && faqVisible > 0 && relatedVisible > 0,
    passReason: 'Supported publishable pages still expose governed FAQ and related-question coverage.',
    failReason: 'Governed FAQ/related coverage disappeared for supported publishable pages.',
    metrics: { faqSupported, faqVisible, relatedVisible },
  })

  let quickCompareVisible = 0
  let invalidQuickCompareTargets = 0
  for (const row of publishable) {
    const section = buildGovernedQuickCompareSection(row.entityType, row.entitySlug)
    if (!section) continue
    quickCompareVisible += 1
    for (const card of section.cards) {
      if (!getGovernedResearchEnrichment(card.targetType, card.targetSlug)) {
        invalidQuickCompareTargets += 1
      }
    }
  }

  check(checks, {
    id: 'quick_compare_supported',
    title: 'Governed quick-compare blocks persist and only target publishable entries',
    ok: quickCompareVisible > 0 && invalidQuickCompareTargets === 0,
    passReason: 'Quick-compare blocks remain present and every compare target is publishable governed content.',
    failReason: `Quick-compare regression detected (visible=${quickCompareVisible}, invalidTargets=${invalidQuickCompareTargets}).`,
    metrics: { quickCompareVisible, invalidQuickCompareTargets },
  })

  const routes = (publicationManifest as Record<string, unknown>).routes as Record<string, string[]> | undefined
  const herbRoutes = (routes?.herbs || []).map(route => asString(route).replace(/^\/herbs\//, ''))
  const compoundRoutes = (routes?.compounds || []).map(route => asString(route).replace(/^\/compounds\//, ''))

  let freshnessVisible = 0
  let freshnessPartial = 0
  for (const slug of herbRoutes) {
    const decision = buildGovernedReviewFreshness(getGovernedResearchEnrichment('herb', slug))
    if (decision.mode === 'governed') freshnessVisible += 1
    if (decision.state === 'partial') freshnessPartial += 1
  }
  for (const slug of compoundRoutes) {
    const decision = buildGovernedReviewFreshness(getGovernedResearchEnrichment('compound', slug))
    if (decision.mode === 'governed') freshnessVisible += 1
    if (decision.state === 'partial') freshnessPartial += 1
  }

  const partialProbe = publishable[0] ? buildGovernedReviewFreshness(cloneAsPartial(publishable[0].researchEnrichment)) : null

  check(checks, {
    id: 'freshness_visibility_and_degradation',
    title: 'Governed freshness visibility persists with graceful partial-state degradation',
    ok:
      freshnessVisible > 0 &&
      partialProbe?.mode === 'governed' &&
      partialProbe?.state === 'partial' &&
      partialProbe.statusLabel !== 'Fresh review',
    passReason: 'Freshness panels still render on governed pages and sparse cases degrade to explicit partial state.',
    failReason: 'Freshness visibility or partial-state degradation behavior regressed.',
    metrics: {
      freshnessVisible,
      freshnessPartial,
      partialProbeState: partialProbe?.state || 'none',
    },
  })

  const cautionDecision = resolveGovernedCtaDecision({
    entityType: 'herb',
    entitySlug: 'regression-harness',
    cautionCount: 2,
    confidence: 'low',
    sourceCount: 1,
    relatedCollectionCount: 1,
    enrichment: publishable[0]?.researchEnrichment || null,
  })
  const toolIndex = cautionDecision.slotOrder.indexOf('tool')
  const affiliateIndex = cautionDecision.slotOrder.indexOf('affiliate')

  check(checks, {
    id: 'cta_hierarchy_safety_sensitive',
    title: 'CTA hierarchy remains safety-first on caution-sensitive pages',
    ok: toolIndex >= 0 && affiliateIndex >= 0 && toolIndex < affiliateIndex,
    passReason: 'Safety-sensitive CTA ordering still prioritizes tool-driven safety checks before affiliate actions.',
    failReason: `CTA hierarchy regressed for caution-sensitive flow: ${cautionDecision.slotOrder.join(' > ')}`,
    metrics: {
      ctaOrder: cautionDecision.slotOrder.join(' > '),
      tone: cautionDecision.tone,
    },
  })

  const summaryRows = [
    ...(herbSummaries as Array<{ slug: string; researchEnrichmentSummary?: unknown }>),
    ...(compoundSummaries as Array<{ slug: string; researchEnrichmentSummary?: unknown }>),
  ]

  const governedOnly = applyGovernedDiscoveryControls({
    items: summaryRows,
    getSummary: row => row.researchEnrichmentSummary as any,
    filter: 'governed_reviewed',
    sort: 'best_covered_first',
  })

  const unsupportedSignalLeak = governedOnly.filteredCandidates.some(candidate => !candidate.meta.eligible)

  check(checks, {
    id: 'browse_collection_controls_supported_signals_only',
    title: 'Browse/search and collection controls do not surface unsupported trust signals',
    ok: !unsupportedSignalLeak,
    passReason: 'Governed-reviewed filters only retain eligible reviewed items; unsupported trust signals stay excluded.',
    failReason: 'Governed-reviewed controls leaked ineligible items via unsupported trust signals.',
    metrics: {
      candidates: governedOnly.candidates.length,
      filtered: governedOnly.filteredCandidates.length,
      governedEligible: governedOnly.eligibility.governedEligible,
    },
  })

  const fallbackCollectionIntro = buildGovernedCollectionIntro({
    fallbackIntro: 'Compare this collection conservatively.',
    summary: null,
    qualityApproved: true,
  })

  const sparseInput = [{ slug: 'sparse-1', researchEnrichmentSummary: undefined }]
  const sparseFiltered = applyGovernedDiscoveryControls({
    items: sparseInput,
    getSummary: row => row.researchEnrichmentSummary,
    filter: 'governed_reviewed' as GovernedDiscoveryFilter,
    sort: 'best_covered_first' as GovernedDiscoverySort,
  })

  check(checks, {
    id: 'graceful_degradation_sparse_partial_pages',
    title: 'Sparse/partial pages degrade gracefully without fake governed confidence',
    ok:
      fallbackCollectionIntro.mode === 'fallback' &&
      countPlaceholderHeavyCollectionIntro(fallbackCollectionIntro.intro) <= 1 &&
      sparseFiltered.items.length === 0,
    passReason: 'Sparse governed contexts fall back cleanly without exposing false confidence states.',
    failReason: 'Sparse/partial degradation regressed and now leaks non-governed confidence cues.',
    metrics: {
      collectionFallbackMode: fallbackCollectionIntro.mode,
      sparseFilteredItems: sparseFiltered.items.length,
    },
  })

  const scorecard = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops/reports/governed-scorecard.json'), 'utf8')) as {
    surfaces?: Array<{ surface?: string }>
  }
  const patternRollout = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops/reports/governed-pattern-rollout.json'), 'utf8')) as {
    standardizedPatterns?: Array<{ surfaces?: string[] }>
  }
  const refinementPass = JSON.parse(fs.readFileSync(path.join(ROOT, 'ops/reports/governed-refinement-pass.json'), 'utf8')) as {
    beforeAfter?: Array<{ targetSurfaceId?: string }>
  }

  const scorecardSurfaces = new Set((scorecard.surfaces || []).map(row => String(row.surface || '')).filter(Boolean))
  const standardizedSurfaces = new Set(
    (patternRollout.standardizedPatterns || []).flatMap(row => row.surfaces || []).map(item => String(item || '')),
  )
  const refinementTargets = new Set((refinementPass.beforeAfter || []).map(row => String(row.targetSurfaceId || '')).filter(Boolean))

  const winnerSurfaceIds = [
    'governed_intro_summary',
    'governed_faq_related_questions',
    'governed_quick_compare',
    'governed_review_freshness',
    'governed_collection_compare_controls',
  ]

  const missingWinnerSurfaces = winnerSurfaceIds.filter(
    surface => !scorecardSurfaces.has(surface) || !standardizedSurfaces.has(surface),
  )
  const missingRefinementTargets = ['governed_intro_summary', 'governed_quick_compare', 'governed_review_freshness'].filter(
    surface => !refinementTargets.has(surface),
  )

  check(checks, {
    id: 'winner_patterns_still_standardized',
    title: 'Standardized winner patterns remain represented in governed scorecard and rollout artifacts',
    ok: missingWinnerSurfaces.length === 0 && missingRefinementTargets.length === 0,
    passReason: 'Winner surfaces remain tracked and standardized across scorecard, refinement, and rollout artifacts.',
    failReason: `Winner-pattern artifact drift detected (missing surfaces=${missingWinnerSurfaces.join(', ') || 'none'}; missing refinement targets=${missingRefinementTargets.join(', ') || 'none'}).`,
    metrics: {
      scorecardSurfaceCount: scorecardSurfaces.size,
      standardizedSurfaceCount: standardizedSurfaces.size,
      refinementTargetCount: refinementTargets.size,
    },
  })

  const failed = checks.filter(checkRow => checkRow.status === 'fail')
  const report = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-ux-regression-v1',
    inputs: {
      governedArtifacts: [
        'public/data/enrichment-governed.json',
        'public/data/herbs-summary.json',
        'public/data/compounds-summary.json',
        'public/data/publication-manifest.json',
        'ops/enrichment-submissions.json',
      ],
      governedReports: [
        'ops/reports/governed-analytics.json',
        'ops/reports/governed-scorecard.json',
        'ops/reports/governed-refinement-pass.json',
        'ops/reports/governed-pattern-rollout.json',
        'ops/reports/governed-browse-filters.json',
      ],
    },
    totals: {
      checks: checks.length,
      passed: checks.length - failed.length,
      failed: failed.length,
    },
    checks,
    pass: failed.length === 0,
  }

  const mdLines: string[] = []
  mdLines.push('# Governed UX regression report')
  mdLines.push('')
  mdLines.push(`Generated: ${report.generatedAt}`)
  mdLines.push(`Model: ${report.deterministicModelVersion}`)
  mdLines.push(`Result: ${report.pass ? 'PASS' : 'FAIL'} (${report.totals.passed}/${report.totals.checks} checks passed)`)
  mdLines.push('')
  mdLines.push('## Check results')
  for (const row of checks) {
    mdLines.push(`- [${row.status === 'pass' ? 'PASS' : 'FAIL'}] ${row.id} — ${row.title}`)
    mdLines.push(`  - ${row.reason}`)
    if (row.metrics) {
      const metrics = Object.entries(row.metrics)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(', ')
      mdLines.push(`  - Metrics: ${metrics}`)
    }
  }

  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${mdLines.join('\n')}\n`, 'utf8')

  console.log(`[verify:governed-ux] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[verify:governed-ux] wrote ${path.relative(ROOT, OUT_MD)}`)

  if (!report.pass) {
    const failingIds = failed.map(row => row.id).join(', ')
    throw new Error(`[verify:governed-ux] FAIL ${failed.length} check(s): ${failingIds}`)
  }

  console.log(`[verify:governed-ux] PASS checks=${report.totals.checks}`)
}

run()
