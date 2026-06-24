import fs from 'node:fs'
import path from 'node:path'
import { CTA_EXPERIMENT_CONFIG, type CtaPageType } from '../src/config/ctaExperiments'
import { SEO_COLLECTIONS } from '../src/data/seoCollections'
import { curatedProductRecommendations } from '../src/data/curatedProducts'

type SummaryRow = {
  slug?: string
  name?: string
  common?: string
  confidence?: string
}

type StoredAnalyticsEvent = {
  type?: string
  slug?: string
  item?: string
  pageType?: string
  entitySlug?: string
  ctaType?: string
  ctaPosition?: string
  variantId?: string
  timestamp?: number
}

type PageEntityType = 'herb' | 'compound' | 'collection'
type ScoreStatus =
  | 'strong performer'
  | 'tool-first opportunity'
  | 'affiliate opportunity'
  | 'trust-friction suspected'
  | 'insufficient data'

type PageScoreRow = {
  pageType: CtaPageType
  entityType: PageEntityType
  slug: string
  pageTitle: string
  confidenceTier: 'high' | 'medium' | 'low' | null
  activeCtaVariant: string
  sampleSizeLabel: 'high' | 'medium' | 'low' | 'insufficient'
  pageViews: number
  ctaSlotImpressions: number
  toolClicks: number
  builderClicks: number
  affiliateImpressions: number
  affiliateClicks: number
  relatedLinkClicks: number
  toolClickThroughRate: number | null
  affiliateClickThroughRate: number | null
  productImpressionToClickRate: number | null
  relatedLinkEngagementRate: number | null
  hasTrafficWeakCtaEngagement: boolean
  hasAffiliateClicksWeakToolUsage: boolean
  status: ScoreStatus
  statusReasons: string[]
  observedCtaPositions: string[]
  observedVariantIds: string[]
}

type EventInput = {
  available: boolean
  sourcePath: string | null
  totalEvents: number
  events: StoredAnalyticsEvent[]
}

type MutablePageStats = {
  pageType: CtaPageType
  entityType: PageEntityType
  slug: string
  pageTitle: string
  confidenceTier: 'high' | 'medium' | 'low' | null
  fallbackVariant: string
  pageViews: number
  ctaSlotImpressions: number
  toolClicks: number
  builderClicks: number
  affiliateImpressions: number
  affiliateClicks: number
  relatedLinkClicks: number
  observedCtaPositions: Set<string>
  observedVariantIds: Set<string>
}

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'conversion-scorecard.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'conversion-scorecard.md')
const MIN_SAMPLE_MEDIUM = 10
const MIN_SAMPLE_HIGH = 30
const WEAK_TOOL_CTR = 0.05
const WEAK_AFFILIATE_CTR = 0.03
const STRONG_TOOL_CTR = 0.12
const STRONG_AFFILIATE_CTR = 0.06

function hasFile(filePath: string): boolean {
  return fs.existsSync(filePath)
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function roundRate(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null
  return Number(value.toFixed(4))
}

function pct(numerator: number, denominator: number): number | null {
  if (!denominator) return null
  return roundRate(numerator / denominator)
}

function toConfidence(value: unknown): 'high' | 'medium' | 'low' {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  if (normalized === 'high' || normalized === 'medium') return normalized
  return 'low'
}

function readEvents(): EventInput {
  const candidates = [
    path.join(ROOT, 'ops', 'reports', 'content-journey-events.json'),
    path.join(ROOT, 'ops', 'reports', 'analytics-events.json'),
    path.join(ROOT, 'ops', 'reports', 'affiliate-product-events.json'),
    path.join(ROOT, 'public', 'data', 'analytics-events.json'),
    path.join(ROOT, 'public', 'data', 'affiliate-product-events.json'),
  ]

  const sourcePath = candidates.find(hasFile) ?? null
  if (!sourcePath) {
    return { available: false, sourcePath: null, totalEvents: 0, events: [] }
  }

  const payload = readJson<StoredAnalyticsEvent[] | { events?: StoredAnalyticsEvent[] }>(sourcePath)
  const events = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : []

  return {
    available: true,
    sourcePath: path.relative(ROOT, sourcePath),
    totalEvents: events.length,
    events,
  }
}

function buildEntityMaps() {
  const herbs = readJson<SummaryRow[]>(path.join(ROOT, 'public', 'data', 'herbs-summary.json'))
  const compounds = readJson<SummaryRow[]>(path.join(ROOT, 'public', 'data', 'compounds-summary.json'))

  const herbNames = new Map<string, string>()
  const herbConfidence = new Map<string, 'high' | 'medium' | 'low'>()
  const compoundNames = new Map<string, string>()
  const compoundConfidence = new Map<string, 'high' | 'medium' | 'low'>()
  const collectionNames = new Map<string, string>()

  herbs.forEach(row => {
    const slug = String(row.slug || '').trim().toLowerCase()
    if (!slug) return
    herbNames.set(slug, String(row.common || row.name || slug).trim() || slug)
    herbConfidence.set(slug, toConfidence(row.confidence))
  })

  compounds.forEach(row => {
    const slug = String(row.slug || '').trim().toLowerCase()
    if (!slug) return
    compoundNames.set(slug, String(row.name || row.common || slug).trim() || slug)
    compoundConfidence.set(slug, toConfidence(row.confidence))
  })

  SEO_COLLECTIONS.forEach(collection => {
    collectionNames.set(collection.slug, collection.title)
  })

  return {
    herbNames,
    herbConfidence,
    compoundNames,
    compoundConfidence,
    collectionNames,
  }
}

function parsePageIdentity(event: StoredAnalyticsEvent): {
  pageType: CtaPageType
  entityType: PageEntityType
  slug: string
} | null {
  const rawSlug = String(event.slug || '').trim()
  const sourcePageType = String(event.pageType || '').trim() as CtaPageType

  if (rawSlug.includes(':')) {
    const [entityTypeRaw, entitySlugRaw] = rawSlug.split(':')
    const entityType = entityTypeRaw === 'herb' || entityTypeRaw === 'compound' ? entityTypeRaw : null
    const slug = String(entitySlugRaw || '').trim().toLowerCase()
    if (!entityType || !slug) return null
    const pageType = sourcePageType || (entityType === 'herb' ? 'herb_detail' : 'compound_detail')
    return { pageType, entityType, slug }
  }

  if (rawSlug) {
    return {
      pageType: sourcePageType || 'collection_page',
      entityType: 'collection',
      slug: rawSlug.toLowerCase(),
    }
  }

  const entitySlug = String(event.entitySlug || '').trim().toLowerCase()
  if (!entitySlug) return null
  if (sourcePageType === 'herb_detail') return { pageType: sourcePageType, entityType: 'herb', slug: entitySlug }
  if (sourcePageType === 'compound_detail') return { pageType: sourcePageType, entityType: 'compound', slug: entitySlug }
  if (sourcePageType === 'collection_page') return { pageType: sourcePageType, entityType: 'collection', slug: entitySlug }

  return null
}

function defaultVariantFor(pageType: CtaPageType): string {
  return CTA_EXPERIMENT_CONFIG.defaultVariantByPageType[pageType]
}

function keyFor(entityType: PageEntityType, slug: string): string {
  return `${entityType}:${slug}`
}

function compareRows(a: PageScoreRow, b: PageScoreRow): number {
  return (
    b.pageViews - a.pageViews ||
    b.toolClicks - a.toolClicks ||
    b.affiliateClicks - a.affiliateClicks ||
    a.slug.localeCompare(b.slug)
  )
}

function buildScoreRows(): { rows: PageScoreRow[]; eventInput: EventInput } {
  const eventInput = readEvents()
  const { herbNames, herbConfidence, compoundNames, compoundConfidence, collectionNames } = buildEntityMaps()
  const map = new Map<string, MutablePageStats>()

  function ensureStat(pageType: CtaPageType, entityType: PageEntityType, slug: string): MutablePageStats {
    const key = keyFor(entityType, slug)
    const existing = map.get(key)
    if (existing) return existing

    const pageTitle =
      entityType === 'herb'
        ? (herbNames.get(slug) ?? slug)
        : entityType === 'compound'
          ? (compoundNames.get(slug) ?? slug)
          : (collectionNames.get(slug) ?? slug)

    const confidenceTier =
      entityType === 'herb'
        ? (herbConfidence.get(slug) ?? null)
        : entityType === 'compound'
          ? (compoundConfidence.get(slug) ?? null)
          : null

    const created: MutablePageStats = {
      pageType,
      entityType,
      slug,
      pageTitle,
      confidenceTier,
      fallbackVariant: defaultVariantFor(pageType),
      pageViews: 0,
      ctaSlotImpressions: 0,
      toolClicks: 0,
      builderClicks: 0,
      affiliateImpressions: 0,
      affiliateClicks: 0,
      relatedLinkClicks: 0,
      observedCtaPositions: new Set<string>(),
      observedVariantIds: new Set<string>(),
    }

    map.set(key, created)
    return created
  }

  // Seed high-value pages so the report still identifies optimization opportunities
  // even when local event exports are missing or sparse.
  curatedProductRecommendations.forEach(product => {
    const pageType = product.entityType === 'herb' ? 'herb_detail' : 'compound_detail'
    ensureStat(pageType, product.entityType, product.entitySlug)
  })
  SEO_COLLECTIONS.forEach(collection => {
    ensureStat('collection_page', 'collection', collection.slug)
  })

  for (const event of eventInput.events) {
    const type = String(event.type || '').trim()
    if (!type) continue

    const identity = parsePageIdentity(event)
    if (!identity) continue

    const stat = ensureStat(identity.pageType, identity.entityType, identity.slug)

    if (event.ctaPosition) stat.observedCtaPositions.add(event.ctaPosition)
    if (event.variantId) stat.observedVariantIds.add(event.variantId)

    if (type === 'collection_page_view') {
      stat.pageViews += 1
      continue
    }

    if (type === 'cta_slot_impression') {
      stat.ctaSlotImpressions += 1
      continue
    }

    if (type === 'detail_interaction_checker_click' || type === 'collection_cta_click') {
      stat.toolClicks += 1
      continue
    }

    if (type === 'detail_builder_click') {
      stat.builderClicks += 1
      continue
    }

    if (type === 'curated_product_impression') {
      stat.affiliateImpressions += 1
      continue
    }

    if (type === 'curated_product_click') {
      stat.affiliateClicks += 1
      continue
    }

    if (type === 'detail_related_entity_click' || type === 'collection_detail_click') {
      stat.relatedLinkClicks += 1
      continue
    }
  }

  const rows: PageScoreRow[] = Array.from(map.values())
    .map(stat => {
      const trafficBase = stat.pageViews || stat.ctaSlotImpressions
      const toolCtr = pct(stat.toolClicks, trafficBase)
      const affiliateCtr = pct(stat.affiliateClicks, trafficBase)
      const productImpToClick = pct(stat.affiliateClicks, stat.affiliateImpressions)
      const relatedEngagement = pct(stat.relatedLinkClicks, trafficBase)
      const totalSignals =
        stat.pageViews +
        stat.ctaSlotImpressions +
        stat.toolClicks +
        stat.builderClicks +
        stat.affiliateImpressions +
        stat.affiliateClicks +
        stat.relatedLinkClicks

      let sampleSizeLabel: PageScoreRow['sampleSizeLabel']
      if (totalSignals >= MIN_SAMPLE_HIGH) sampleSizeLabel = 'high'
      else if (totalSignals >= MIN_SAMPLE_MEDIUM) sampleSizeLabel = 'medium'
      else if (totalSignals > 0) sampleSizeLabel = 'low'
      else sampleSizeLabel = 'insufficient'

      const hasTrafficWeakCtaEngagement = trafficBase >= MIN_SAMPLE_MEDIUM && (toolCtr ?? 0) < WEAK_TOOL_CTR
      const hasAffiliateClicksWeakToolUsage = stat.affiliateClicks > 0 && stat.toolClicks === 0

      const reasons: string[] = []
      let status: ScoreStatus = 'insufficient data'

      if (sampleSizeLabel === 'insufficient' || trafficBase < 3) {
        reasons.push('Not enough tracked impressions/visits yet to score reliably.')
      } else if ((toolCtr ?? 0) >= STRONG_TOOL_CTR && ((affiliateCtr ?? 0) >= STRONG_AFFILIATE_CTR || stat.affiliateClicks >= 3)) {
        status = 'strong performer'
        reasons.push('Tool and affiliate engagement are both above baseline thresholds.')
      } else if ((toolCtr ?? 0) < WEAK_TOOL_CTR && stat.affiliateClicks > 0) {
        status = 'tool-first opportunity'
        reasons.push('Affiliate activity exists but tool CTA usage is low relative to traffic.')
      } else if ((affiliateCtr ?? 0) < WEAK_AFFILIATE_CTR && (toolCtr ?? 0) >= WEAK_TOOL_CTR && trafficBase >= MIN_SAMPLE_MEDIUM) {
        status = 'affiliate opportunity'
        reasons.push('Tool usage is present, but affiliate click-through is weak for current traffic.')
      } else if (
        stat.confidenceTier === 'low' &&
        trafficBase >= MIN_SAMPLE_MEDIUM &&
        (toolCtr ?? 0) < WEAK_TOOL_CTR &&
        (affiliateCtr ?? 0) < WEAK_AFFILIATE_CTR
      ) {
        status = 'trust-friction suspected'
        reasons.push('Low confidence pages with traffic are not converting across tool or affiliate CTAs.')
      } else {
        status = 'insufficient data'
        reasons.push('Signals are mixed or below reliable threshold bands.')
      }

      if (hasTrafficWeakCtaEngagement) {
        reasons.push('Traffic is present but tool CTA engagement is below weak threshold.')
      }
      if (hasAffiliateClicksWeakToolUsage) {
        reasons.push('Affiliate clicks occurred while tool clicks remained at zero.')
      }

      return {
        pageType: stat.pageType,
        entityType: stat.entityType,
        slug: stat.slug,
        pageTitle: stat.pageTitle,
        confidenceTier: stat.confidenceTier,
        activeCtaVariant: Array.from(stat.observedVariantIds)[0] || stat.fallbackVariant,
        sampleSizeLabel,
        pageViews: stat.pageViews,
        ctaSlotImpressions: stat.ctaSlotImpressions,
        toolClicks: stat.toolClicks,
        builderClicks: stat.builderClicks,
        affiliateImpressions: stat.affiliateImpressions,
        affiliateClicks: stat.affiliateClicks,
        relatedLinkClicks: stat.relatedLinkClicks,
        toolClickThroughRate: toolCtr,
        affiliateClickThroughRate: affiliateCtr,
        productImpressionToClickRate: productImpToClick,
        relatedLinkEngagementRate: relatedEngagement,
        hasTrafficWeakCtaEngagement,
        hasAffiliateClicksWeakToolUsage,
        status,
        statusReasons: reasons,
        observedCtaPositions: Array.from(stat.observedCtaPositions).sort(),
        observedVariantIds: Array.from(stat.observedVariantIds).sort(),
      }
    })
    .sort(compareRows)

  return { rows, eventInput }
}

function topBy(rows: PageScoreRow[], score: (row: PageScoreRow) => number, limit = 10): PageScoreRow[] {
  return [...rows].sort((a, b) => score(b) - score(a)).slice(0, limit)
}

function writeReports() {
  const { rows, eventInput } = buildScoreRows()

  const byPageType = {
    herb_detail: rows.filter(row => row.pageType === 'herb_detail'),
    compound_detail: rows.filter(row => row.pageType === 'compound_detail'),
    collection_page: rows.filter(row => row.pageType === 'collection_page'),
  }

  const topPerformers = rows.filter(row => row.status === 'strong performer')
  const underperformers = rows.filter(
    row =>
      row.status === 'tool-first opportunity' ||
      row.status === 'affiliate opportunity' ||
      row.status === 'trust-friction suspected'
  )
  const insufficientData = rows.filter(row => row.status === 'insufficient data')

  const highOpportunityPages = topBy(
    underperformers,
    row =>
      (row.pageViews + row.ctaSlotImpressions) * 2 +
      row.affiliateClicks * 4 +
      row.toolClicks * 3 +
      row.affiliateImpressions,
    15
  )

  const output = {
    generatedAt: new Date().toISOString(),
    dataSources: {
      events: eventInput.sourcePath,
      eventNotes: eventInput.available
        ? 'Conversion metrics are computed from local analytics event exports only.'
        : 'No local analytics event export found; metrics default to empty and pages are marked insufficient data.',
      confidenceInputs: ['public/data/herbs-summary.json', 'public/data/compounds-summary.json'],
      ctaVariants: 'public/data/cta-variants.json',
      collections: 'src/data/seoCollections.ts',
    },
    summary: {
      totalPagesWithSignals: rows.length,
      analyticsAvailable: eventInput.available,
      analyticsEventCount: eventInput.totalEvents,
      statuses: {
        strongPerformer: topPerformers.length,
        toolFirstOpportunity: rows.filter(row => row.status === 'tool-first opportunity').length,
        affiliateOpportunity: rows.filter(row => row.status === 'affiliate opportunity').length,
        trustFrictionSuspected: rows.filter(row => row.status === 'trust-friction suspected').length,
        insufficientData: insufficientData.length,
      },
      pagesWithTrafficWeakCtaEngagement: rows.filter(row => row.hasTrafficWeakCtaEngagement).length,
      pagesWithAffiliateClicksWeakToolUsage: rows.filter(row => row.hasAffiliateClicksWeakToolUsage).length,
    },
    groupedByPageType: byPageType,
    topPerformers: topBy(topPerformers, row => (row.toolClickThroughRate || 0) + (row.affiliateClickThroughRate || 0)),
    underperformers: topBy(
      underperformers,
      row => row.pageViews + row.ctaSlotImpressions + row.affiliateImpressions + row.affiliateClicks
    ),
    insufficientData,
    highestOpportunityPages: highOpportunityPages,
    pages: rows,
  }

  const topPerformerLines = output.topPerformers.slice(0, 10).map(
    row =>
      `- ${row.entityType}:${row.slug} (${row.pageType}, variant=${row.activeCtaVariant}) — toolCTR=${row.toolClickThroughRate ?? 'n/a'}, affiliateCTR=${row.affiliateClickThroughRate ?? 'n/a'}, productCTR=${row.productImpressionToClickRate ?? 'n/a'}`
  )
  const underperformerLines = output.underperformers.slice(0, 12).map(
    row =>
      `- ${row.entityType}:${row.slug} [${row.status}] — traffic=${row.pageViews + row.ctaSlotImpressions}, toolCTR=${row.toolClickThroughRate ?? 'n/a'}, affiliateCTR=${row.affiliateClickThroughRate ?? 'n/a'}`
  )
  const insufficientLines = output.insufficientData.slice(0, 12).map(
    row => `- ${row.entityType}:${row.slug} (${row.pageType}) — signals too low (${row.sampleSizeLabel})`
  )
  const opportunityLines = output.highestOpportunityPages.slice(0, 12).map(
    row =>
      `- ${row.entityType}:${row.slug} [${row.status}] — opportunityScore inputs: traffic=${row.pageViews + row.ctaSlotImpressions}, tool=${row.toolClicks}, affiliateClicks=${row.affiliateClicks}`
  )

  const md = [
    '# Conversion Scorecard & Optimization Report',
    '',
    `Generated: ${output.generatedAt}`,
    '',
    '## Snapshot',
    `- Analytics source available: **${output.summary.analyticsAvailable ? 'yes' : 'no'}**`,
    `- Analytics events processed: **${output.summary.analyticsEventCount}**`,
    `- Pages with any conversion signals: **${output.summary.totalPagesWithSignals}**`,
    `- Strong performer: **${output.summary.statuses.strongPerformer}**`,
    `- Tool-first opportunity: **${output.summary.statuses.toolFirstOpportunity}**`,
    `- Affiliate opportunity: **${output.summary.statuses.affiliateOpportunity}**`,
    `- Trust-friction suspected: **${output.summary.statuses.trustFrictionSuspected}**`,
    `- Insufficient data: **${output.summary.statuses.insufficientData}**`,
    '',
    '## Data Inputs Used',
    `- Event source: ${output.dataSources.events ? `\`${output.dataSources.events}\`` : 'none'}`,
    `- Confidence inputs: ${output.dataSources.confidenceInputs.map(item => `\`${item}\``).join(', ')}`,
    `- CTA variants: \`${output.dataSources.ctaVariants}\``,
    `- Collections source: \`${output.dataSources.collections}\``,
    `- Notes: ${output.dataSources.eventNotes}`,
    '',
    '## Top Performing Pages',
    topPerformerLines.length ? topPerformerLines.join('\n') : '- none',
    '',
    '## Underperforming Pages',
    underperformerLines.length ? underperformerLines.join('\n') : '- none',
    '',
    '## Pages Missing Enough Data',
    insufficientLines.length ? insufficientLines.join('\n') : '- none',
    '',
    '## Highest-Opportunity Pages for Next Optimization',
    opportunityLines.length ? opportunityLines.join('\n') : '- none',
    '',
    '## Prioritization Legend',
    '- **strong performer**: tool and affiliate engagement above threshold.',
    '- **tool-first opportunity**: affiliate usage exists but tool engagement is weak.',
    '- **affiliate opportunity**: tool engagement is present but affiliate conversion is weak.',
    '- **trust-friction suspected**: low-confidence pages with traffic and weak CTA engagement.',
    '- **insufficient data**: not enough local event volume to score confidently.',
  ].join('\n')

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${md}\n`, 'utf8')

  console.log(`[report:conversion-scorecard] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[report:conversion-scorecard] wrote ${path.relative(ROOT, OUT_MD)}`)
  console.log(
    `[report:conversion-scorecard] summary pages=${output.summary.totalPagesWithSignals} strong=${output.summary.statuses.strongPerformer} tool-first=${output.summary.statuses.toolFirstOpportunity} affiliate-op=${output.summary.statuses.affiliateOpportunity} trust-friction=${output.summary.statuses.trustFrictionSuspected} insufficient=${output.summary.statuses.insufficientData}`
  )
}

writeReports()
