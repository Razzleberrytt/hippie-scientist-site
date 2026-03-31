#!/usr/bin/env tsx
import fs from 'node:fs'
import path from 'node:path'

type EntityType = 'herb' | 'compound' | 'collection' | 'compare' | 'mixed'
type PageType =
  | 'herb_detail'
  | 'compound_detail'
  | 'collection_page'
  | 'compare_page'
  | 'herbs_index'
  | 'compounds_index'

type StoredAnalyticsEvent = {
  type?: string
  pageType?: string
  entityType?: string
  entitySlug?: string
  surfaceId?: string
  componentType?: string
  eventAction?: string
  evidenceLabel?: string
  safetySignalPresent?: boolean
  reviewedStatus?: string
  freshnessState?: string
  slug?: string
}

type SurfaceKey =
  | 'governed_intro_summary'
  | 'governed_faq_related_questions'
  | 'governed_quick_compare'
  | 'governed_review_freshness'
  | 'governed_browse_search_filters'
  | 'governed_collection_compare_controls'
  | 'governed_cta'
  | 'tool_affiliate_related_journey'

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'governed-scorecard.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'governed-scorecard.md')

const SURFACE_META: Record<SurfaceKey, { label: string; visibilityTypes: string[]; interactionTypes: string[] }> = {
  governed_intro_summary: {
    label: 'Governed intro summaries',
    visibilityTypes: ['governed_intro_visible'],
    interactionTypes: ['governed_intro_step_click'],
  },
  governed_faq_related_questions: {
    label: 'FAQ / related questions',
    visibilityTypes: ['governed_faq_visible'],
    interactionTypes: ['governed_related_question_click'],
  },
  governed_quick_compare: {
    label: 'Quick compare blocks',
    visibilityTypes: ['governed_quick_compare_visible'],
    interactionTypes: ['governed_quick_compare_click'],
  },
  governed_review_freshness: {
    label: 'Review freshness visibility',
    visibilityTypes: ['governed_review_freshness_visible'],
    interactionTypes: ['governed_review_freshness_toggle'],
  },
  governed_browse_search_filters: {
    label: 'Browse/search filters',
    visibilityTypes: ['governed_card_summary_visible'],
    interactionTypes: ['governed_browse_filter_change'],
  },
  governed_collection_compare_controls: {
    label: 'Collection/comparison controls',
    visibilityTypes: ['governed_card_summary_visible'],
    interactionTypes: ['governed_collection_filter_change'],
  },
  governed_cta: {
    label: 'Governed CTA clicks',
    visibilityTypes: ['cta_slot_impression'],
    interactionTypes: ['governed_cta_click'],
  },
  tool_affiliate_related_journey: {
    label: 'Tool / affiliate / related-link journey',
    visibilityTypes: ['cta_slot_impression', 'curated_product_impression'],
    interactionTypes: [
      'detail_interaction_checker_click',
      'detail_builder_click',
      'collection_cta_click',
      'curated_product_click',
      'detail_related_entity_click',
      'collection_detail_click',
    ],
  },
}

function readJson<T>(relativePath: string): T | null {
  const filePath = path.join(ROOT, relativePath)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function pct(numerator: number, denominator: number) {
  if (!denominator) return null
  return Number((numerator / denominator).toFixed(4))
}

function eventMatchesSurface(event: StoredAnalyticsEvent, surface: SurfaceKey) {
  const type = String(event.type || '')
  if (!type) return false
  const meta = SURFACE_META[surface]

  if (surface === 'governed_browse_search_filters') {
    return (
      type === 'governed_browse_filter_change' ||
      (type === 'governed_card_summary_visible' && ['herbs_index', 'compounds_index'].includes(String(event.pageType || '')))
    )
  }
  if (surface === 'governed_collection_compare_controls') {
    return (
      type === 'governed_collection_filter_change' ||
      (type === 'governed_card_summary_visible' && ['collection_page', 'compare_page'].includes(String(event.pageType || '')))
    )
  }
  if (surface === 'governed_cta') {
    return type === 'governed_cta_click' || (type === 'cta_slot_impression' && ['herb_detail', 'compound_detail', 'collection_page'].includes(String(event.pageType || '')))
  }

  return [...meta.visibilityTypes, ...meta.interactionTypes].includes(type)
}

function parseEvents() {
  const candidates = [
    'ops/reports/content-journey-events.json',
    'ops/reports/analytics-events.json',
    'ops/reports/affiliate-product-events.json',
    'public/data/analytics-events.json',
    'public/data/affiliate-product-events.json',
  ]
  const sourcePath = candidates.find(item => fs.existsSync(path.join(ROOT, item))) || null
  if (!sourcePath) return { sourcePath: null as string | null, events: [] as StoredAnalyticsEvent[] }
  const payload = readJson<StoredAnalyticsEvent[] | { events?: StoredAnalyticsEvent[] }>(sourcePath)
  const events = Array.isArray(payload) ? payload : Array.isArray(payload?.events) ? payload.events : []
  return { sourcePath, events }
}

function buildVisibilityBaselines() {
  const intro = readJson<{ gainedGovernedIntroPages?: Array<{ entityType: EntityType; entitySlug: string }> }>('ops/reports/governed-intro-refresh.json')
  const faq = readJson<{ gainedFaqPages?: Array<{ entityType: EntityType; entitySlug: string }> }>('ops/reports/governed-faq-refresh.json')
  const related = readJson<{ gainedPages?: Array<{ entityType: EntityType; entitySlug: string }> }>('ops/reports/governed-related-questions.json')
  const quickCompare = readJson<{ gainedPages?: Array<{ entityType: EntityType; entitySlug: string }> }>('ops/reports/governed-quick-compare.json')
  const freshness = readJson<{ pagesGainedVisibility?: Array<{ entityType: EntityType; entitySlug: string }> }>('ops/reports/governed-review-freshness.json')
  const cta = readJson<{ changedRows?: Array<{ entityType: EntityType; entitySlug: string }> }>('ops/reports/governed-cta-refresh.json')
  const browse = readJson<{ coverage?: { herbs?: { eligibleForGovernedFilters?: number }; compounds?: { eligibleForGovernedFilters?: number } } }>('ops/reports/governed-browse-filters.json')
  const collection = readJson<{ pagesGainedControls?: { collectionPages?: string[] } }>('ops/reports/governed-collection-filters.json')

  return {
    governed_intro_summary: intro?.gainedGovernedIntroPages?.length || 0,
    governed_faq_related_questions: Math.max(faq?.gainedFaqPages?.length || 0, related?.gainedPages?.length || 0),
    governed_quick_compare: quickCompare?.gainedPages?.length || 0,
    governed_review_freshness: freshness?.pagesGainedVisibility?.length || 0,
    governed_browse_search_filters:
      (browse?.coverage?.herbs?.eligibleForGovernedFilters || 0) + (browse?.coverage?.compounds?.eligibleForGovernedFilters || 0),
    governed_collection_compare_controls: (collection?.pagesGainedControls?.collectionPages?.length || 0) + 1,
    governed_cta: cta?.changedRows?.length || 0,
    tool_affiliate_related_journey: cta?.changedRows?.length || 0,
  } satisfies Record<SurfaceKey, number>
}

function main() {
  const { sourcePath, events } = parseEvents()
  const visibilityBaselines = buildVisibilityBaselines()

  const surfaceRows = (Object.keys(SURFACE_META) as SurfaceKey[]).map(surface => {
    const matched = events.filter(event => eventMatchesSurface(event, surface))
    const visibilityCount = matched.filter(event => SURFACE_META[surface].visibilityTypes.includes(String(event.type || ''))).length
    const interactionCount = matched.filter(event => SURFACE_META[surface].interactionTypes.includes(String(event.type || ''))).length
    const ctr = pct(interactionCount, visibilityCount)

    return {
      surface,
      label: SURFACE_META[surface].label,
      baselineVisibilityCount: visibilityBaselines[surface],
      trackedVisibilityCount: visibilityCount,
      interactionCount,
      clickThroughRate: ctr,
      filterUsageCount:
        surface === 'governed_browse_search_filters' || surface === 'governed_collection_compare_controls'
          ? interactionCount
          : 0,
      faqOrCompareEngagementCount:
        surface === 'governed_faq_related_questions' || surface === 'governed_quick_compare' ? interactionCount : 0,
      ctaClickCount: surface === 'governed_cta' ? interactionCount : 0,
      toolFirstInteractions:
        surface === 'tool_affiliate_related_journey'
          ? matched.filter(event => ['detail_interaction_checker_click', 'detail_builder_click', 'collection_cta_click'].includes(String(event.type || ''))).length
          : 0,
      affiliatePathInteractions:
        surface === 'tool_affiliate_related_journey'
          ? matched.filter(event => String(event.type || '') === 'curated_product_click').length
          : 0,
      hasMeaningfulEngagement: interactionCount >= 3 || (ctr ?? 0) >= 0.1,
    }
  })

  const strongestGovernedDiscoverySurfaces = surfaceRows
    .filter(row => ['governed_intro_summary', 'governed_faq_related_questions', 'governed_quick_compare', 'governed_browse_search_filters', 'governed_collection_compare_controls'].includes(row.surface))
    .sort((a, b) => (b.interactionCount + b.baselineVisibilityCount) - (a.interactionCount + a.baselineVisibilityCount))
    .slice(0, 5)

  const strongestGovernedCtaSurfaces = surfaceRows
    .filter(row => row.surface === 'governed_cta' || row.surface === 'tool_affiliate_related_journey')
    .sort((a, b) => b.interactionCount - a.interactionCount)

  const visibilityButWeakInteraction = surfaceRows.filter(row => row.baselineVisibilityCount > 0 && row.interactionCount === 0)

  const trustStrongConversionWeak = surfaceRows.filter(
    row => row.surface === 'governed_review_freshness' && row.baselineVisibilityCount > 0 && row.interactionCount === 0,
  )

  const weakEngagementLowValueUi = surfaceRows.filter(
    row => row.baselineVisibilityCount > 0 && !row.hasMeaningfulEngagement,
  )

  const insufficientDataCases = surfaceRows.filter(
    row => row.trackedVisibilityCount === 0 && row.interactionCount === 0,
  )

  const scorecard = {
    generatedAt: new Date().toISOString(),
    deterministicModelVersion: 'governed-scorecard-v1',
    constraints: {
      deterministicOnly: true,
      noInventedMetrics: true,
      approvedUserSafeContextOnly: true,
      liveDashboardRequired: false,
    },
    dataSources: {
      analyticsEvents: sourcePath,
      governedReports: [
        'ops/reports/governed-analytics.json',
        'ops/reports/governed-intro-refresh.json',
        'ops/reports/governed-faq-refresh.json',
        'ops/reports/governed-related-questions.json',
        'ops/reports/governed-quick-compare.json',
        'ops/reports/governed-review-freshness.json',
        'ops/reports/governed-browse-filters.json',
        'ops/reports/governed-collection-filters.json',
        'ops/reports/governed-cta-refresh.json',
      ],
      enrichmentHealthBacklogArtifacts: [
        'ops/reports/enrichment-health.json (optional)',
        'ops/reports/enrichment-backlog.json (optional)',
        'ops/reports/enrichment-review-cycle.json (optional)',
        'ops/reports/enrichment-workpacks.json',
      ],
    },
    dimensions: [
      'pageType',
      'entityType',
      'entitySlug|surfaceId',
      'componentType',
      'evidenceLabel',
      'safetySignalPresent',
      'reviewedStatus',
      'freshnessState',
    ],
    metrics: [
      'baselineVisibilityCount',
      'trackedVisibilityCount',
      'interactionCount',
      'clickThroughRate',
      'filterUsageCount',
      'faqOrCompareEngagementCount',
      'ctaClickCount',
      'toolFirstInteractions',
      'affiliatePathInteractions',
    ],
    summary: {
      analyticsEventsAvailable: Boolean(sourcePath),
      analyticsEventCount: events.length,
      surfaceCount: surfaceRows.length,
      surfacesWithVisibilityButNoInteractions: visibilityButWeakInteraction.length,
      surfacesWithMeaningfulEngagement: surfaceRows.filter(row => row.hasMeaningfulEngagement).length,
      insufficientDataCases: insufficientDataCases.length,
    },
    surfaces: surfaceRows,
    buckets: {
      strongestGovernedDiscoverySurfaces,
      strongestGovernedCtaSurfaces,
      surfacesWithVisibilityButWeakInteraction: visibilityButWeakInteraction,
      pagesOrEntitiesWithStrongTrustButWeakConversion: trustStrongConversionWeak,
      weakEngagementLikelyLowValueGovernedUi: weakEngagementLowValueUi,
      insufficientDataCases,
    },
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(scorecard, null, 2)}\n`, 'utf8')

  const md = [
    '# Governed discovery + conversion scorecard',
    '',
    `Generated: ${scorecard.generatedAt}`,
    `Deterministic model: ${scorecard.deterministicModelVersion}`,
    '',
    '## Snapshot',
    `- Analytics events source: ${scorecard.dataSources.analyticsEvents ? `\`${scorecard.dataSources.analyticsEvents}\`` : 'none found (deterministic structural scorecard only)'}`,
    `- Analytics events processed: ${scorecard.summary.analyticsEventCount}`,
    `- Surfaces scored: ${scorecard.summary.surfaceCount}`,
    `- Surfaces with visibility but weak interaction: ${scorecard.summary.surfacesWithVisibilityButNoInteractions}`,
    `- Surfaces with meaningful engagement: ${scorecard.summary.surfacesWithMeaningfulEngagement}`,
    `- Insufficient-data cases: ${scorecard.summary.insufficientDataCases}`,
    '',
    '## Strongest governed discovery surfaces',
    ...(scorecard.buckets.strongestGovernedDiscoverySurfaces.map(row => `- ${row.label}: baselineVisibility=${row.baselineVisibilityCount}, interactions=${row.interactionCount}, ctr=${row.clickThroughRate ?? 'n/a'}`) || ['- none']),
    '',
    '## Strongest governed CTA surfaces',
    ...(scorecard.buckets.strongestGovernedCtaSurfaces.map(row => `- ${row.label}: ctaClicks=${row.ctaClickCount}, toolFirst=${row.toolFirstInteractions}, affiliatePath=${row.affiliatePathInteractions}`) || ['- none']),
    '',
    '## Surfaces with visibility but weak interaction',
    ...(scorecard.buckets.surfacesWithVisibilityButWeakInteraction.map(row => `- ${row.label}: baselineVisibility=${row.baselineVisibilityCount}, trackedVisibility=${row.trackedVisibilityCount}, interactions=${row.interactionCount}`) || ['- none']),
    '',
    '## Trust engagement strong but conversion weak',
    ...(scorecard.buckets.pagesOrEntitiesWithStrongTrustButWeakConversion.map(row => `- ${row.label}: baselineVisibility=${row.baselineVisibilityCount}, interactions=${row.interactionCount}`) || ['- none']),
    '',
    '## Weak engagement / likely low-value governed UI candidates',
    ...(scorecard.buckets.weakEngagementLikelyLowValueGovernedUi.map(row => `- ${row.label}: baselineVisibility=${row.baselineVisibilityCount}, interactions=${row.interactionCount}, meaningful=${row.hasMeaningfulEngagement ? 'yes' : 'no'}`) || ['- none']),
    '',
    '## Insufficient-data cases',
    ...(scorecard.buckets.insufficientDataCases.map(row => `- ${row.label}`) || ['- none']),
    '',
    '## Surface metrics',
    '| Surface | Baseline visibility | Tracked visibility | Interactions | CTR |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...surfaceRows.map(row => `| ${row.label} | ${row.baselineVisibilityCount} | ${row.trackedVisibilityCount} | ${row.interactionCount} | ${row.clickThroughRate ?? 'n/a'} |`),
  ].join('\n')

  fs.writeFileSync(OUT_MD, `${md}\n`, 'utf8')

  console.log(`[report:governed-scorecard] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[report:governed-scorecard] wrote ${path.relative(ROOT, OUT_MD)}`)
}

main()
