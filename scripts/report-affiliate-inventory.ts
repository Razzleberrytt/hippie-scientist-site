import fs from 'node:fs'
import path from 'node:path'
import { curatedProductRecommendations } from '../src/data/curatedProducts'
import { assessCuratedProductReadiness, resolveAffiliateUrl, type CuratedProductReadiness } from '../src/lib/curatedProducts'
import type { ConfidenceLevel } from '../src/utils/calculateConfidence'

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
  timestamp?: number
}

type InventoryRow = {
  entityType: 'herb' | 'compound'
  entitySlug: string
  pageTitle: string
  productId: string
  productTitle: string
  active: boolean
  renderEligible: boolean
  reviewedAt: string
  reviewAgeDays: number | null
  reviewRecencyState: CuratedProductReadiness['reviewRecencyState']
  readinessState: 'healthy' | 'warning' | 'fail'
  failureReasons: string[]
  warningReasons: string[]
  disclosureReady: boolean
  rationaleReady: boolean
  confidenceTierRequired: ConfidenceLevel
  pageConfidenceTier: ConfidenceLevel
  confidenceTierMet: boolean
  clickCount: number
  impressionCount: number
  clickThroughRate: number | null
  affiliateUrl: string
}

type AnalyticsMetrics = {
  available: boolean
  sourcePath: string | null
  totalEvents: number
  clickByProductId: Map<string, number>
  impressionByProductId: Map<string, number>
  clickByPageKey: Map<string, number>
  impressionByPageKey: Map<string, number>
}

const ROOT = process.cwd()
const OUT_JSON = path.join(ROOT, 'ops', 'reports', 'affiliate-inventory.json')
const OUT_MD = path.join(ROOT, 'ops', 'reports', 'affiliate-inventory.md')
const HEALTH_REPORT = path.join(ROOT, 'ops', 'reports', 'affiliate-product-health.json')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function hasFile(filePath: string): boolean {
  return fs.existsSync(filePath)
}

function toConfidence(value: unknown): ConfidenceLevel {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  if (normalized === 'high' || normalized === 'medium') return normalized
  return 'low'
}

function confidenceRank(value: ConfidenceLevel): number {
  if (value === 'high') return 3
  if (value === 'medium') return 2
  return 1
}

function pct(numerator: number, denominator: number): number | null {
  if (!denominator) return null
  return Number((numerator / denominator).toFixed(4))
}

function buildEntityMaps() {
  const herbs = readJson<SummaryRow[]>(path.join(ROOT, 'public', 'data', 'herbs-summary.json'))
  const compounds = readJson<SummaryRow[]>(path.join(ROOT, 'public', 'data', 'compounds-summary.json'))

  const herbConfidence = new Map<string, ConfidenceLevel>()
  const compoundConfidence = new Map<string, ConfidenceLevel>()
  const herbNames = new Map<string, string>()
  const compoundNames = new Map<string, string>()

  herbs.forEach(row => {
    const slug = String(row.slug || '').trim().toLowerCase()
    if (!slug) return
    herbConfidence.set(slug, toConfidence(row.confidence))
    herbNames.set(slug, String(row.common || row.name || slug).trim() || slug)
  })

  compounds.forEach(row => {
    const slug = String(row.slug || '').trim().toLowerCase()
    if (!slug) return
    compoundConfidence.set(slug, toConfidence(row.confidence))
    compoundNames.set(slug, String(row.name || row.common || slug).trim() || slug)
  })

  return {
    herbs,
    compounds,
    herbConfidence,
    compoundConfidence,
    herbNames,
    compoundNames,
  }
}

function readAnalyticsMetrics(): AnalyticsMetrics {
  const candidates = [
    path.join(ROOT, 'ops', 'reports', 'affiliate-product-events.json'),
    path.join(ROOT, 'public', 'data', 'affiliate-product-events.json'),
  ]

  const sourcePath = candidates.find(hasFile) ?? null
  if (!sourcePath) {
    return {
      available: false,
      sourcePath: null,
      totalEvents: 0,
      clickByProductId: new Map(),
      impressionByProductId: new Map(),
      clickByPageKey: new Map(),
      impressionByPageKey: new Map(),
    }
  }

  const payload = readJson<StoredAnalyticsEvent[] | { events?: StoredAnalyticsEvent[] }>(sourcePath)
  const events = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : []

  const clickByProductId = new Map<string, number>()
  const impressionByProductId = new Map<string, number>()
  const clickByPageKey = new Map<string, number>()
  const impressionByPageKey = new Map<string, number>()

  for (const event of events) {
    const type = String(event.type || '').trim()
    const productId = String(event.item || '').trim()
    const pageKey = String(event.slug || '').trim()
    if (!type) continue

    if (type === 'curated_product_click') {
      if (productId) clickByProductId.set(productId, (clickByProductId.get(productId) || 0) + 1)
      if (pageKey) clickByPageKey.set(pageKey, (clickByPageKey.get(pageKey) || 0) + 1)
    }
    if (type === 'curated_product_impression') {
      if (productId) impressionByProductId.set(productId, (impressionByProductId.get(productId) || 0) + 1)
      if (pageKey) impressionByPageKey.set(pageKey, (impressionByPageKey.get(pageKey) || 0) + 1)
    }
  }

  return {
    available: true,
    sourcePath: path.relative(ROOT, sourcePath),
    totalEvents: events.length,
    clickByProductId,
    impressionByProductId,
    clickByPageKey,
    impressionByPageKey,
  }
}

function resolveReadinessState(readiness: CuratedProductReadiness): 'healthy' | 'warning' | 'fail' {
  if (!readiness.renderEligible) return 'fail'
  if (readiness.warningReasons.length > 0 || readiness.staleWithinGracePeriod) return 'warning'
  return 'healthy'
}

function buildInventoryRows() {
  const { herbConfidence, compoundConfidence, herbNames, compoundNames } = buildEntityMaps()
  const analytics = readAnalyticsMetrics()

  const duplicateKeys = new Set<string>()
  const duplicatePairs = new Set<string>()
  curatedProductRecommendations.forEach(product => {
    const normalizedUrl = resolveAffiliateUrl(product).trim().toLowerCase()
    const key = [product.entityType, product.entitySlug, normalizedUrl || product.productId].join('|')
    if (duplicateKeys.has(key)) duplicatePairs.add(key)
    duplicateKeys.add(key)
  })

  const rows: InventoryRow[] = curatedProductRecommendations.map(product => {
    const pageConfidenceTier =
      product.entityType === 'herb'
        ? (herbConfidence.get(product.entitySlug) ?? 'low')
        : (compoundConfidence.get(product.entitySlug) ?? 'low')

    const readiness = assessCuratedProductReadiness({
      product,
      pageContext: {
        entityType: product.entityType,
        entitySlug: product.entitySlug,
        confidence: pageConfidenceTier,
        sourceCount: 1,
      },
      duplicateProductMappingDetected: duplicatePairs.has(
        [product.entityType, product.entitySlug, resolveAffiliateUrl(product).trim().toLowerCase() || product.productId].join(
          '|'
        )
      ),
    })

    const impressionCount = analytics.impressionByProductId.get(product.productId) || 0
    const clickCount = analytics.clickByProductId.get(product.productId) || 0

    return {
      entityType: product.entityType,
      entitySlug: product.entitySlug,
      pageTitle:
        product.entityType === 'herb'
          ? (herbNames.get(product.entitySlug) ?? product.entitySlug)
          : (compoundNames.get(product.entitySlug) ?? product.entitySlug),
      productId: product.productId,
      productTitle: product.productTitle,
      active: readiness.active,
      renderEligible: readiness.renderEligible,
      reviewedAt: readiness.reviewedAt,
      reviewAgeDays: readiness.reviewAgeDays,
      reviewRecencyState: readiness.reviewRecencyState,
      readinessState: resolveReadinessState(readiness),
      failureReasons: readiness.failureReasons,
      warningReasons: readiness.warningReasons,
      disclosureReady: readiness.disclosurePresent,
      rationaleReady: readiness.rationalePresent,
      confidenceTierRequired: readiness.confidenceTierRequired,
      pageConfidenceTier: readiness.pageConfidenceTier,
      confidenceTierMet:
        confidenceRank(readiness.pageConfidenceTier) >= confidenceRank(readiness.confidenceTierRequired),
      clickCount,
      impressionCount,
      clickThroughRate: pct(clickCount, impressionCount),
      affiliateUrl: resolveAffiliateUrl(product),
    }
  })

  return { rows, analytics }
}

function mdList(items: string[]): string {
  if (items.length === 0) return '- none'
  return items.map(item => `- ${item}`).join('\n')
}

function topRowsBy<T>(rows: T[], score: (row: T) => number, limit = 10): T[] {
  return [...rows].sort((a, b) => score(b) - score(a)).slice(0, limit)
}

function writeReport() {
  const { rows, analytics } = buildInventoryRows()
  const { herbs, compounds } = buildEntityMaps()

  const liveHealthy = rows.filter(row => row.active && row.renderEligible && row.readinessState === 'healthy')
  const staleRenderable = rows.filter(
    row => row.renderEligible && row.readinessState !== 'fail' && row.reviewRecencyState === 'stale_grace'
  )
  const blocked = rows.filter(row => row.readinessState === 'fail' || !row.renderEligible || !row.active)

  const mappedPageKeys = new Set(rows.map(row => `${row.entityType}:${row.entitySlug}`))
  const missingHerbPages = herbs.filter(row => row.slug && !mappedPageKeys.has(`herb:${row.slug}`))
  const missingCompoundPages = compounds.filter(row => row.slug && !mappedPageKeys.has(`compound:${row.slug}`))

  const byProductId = new Map<string, InventoryRow[]>()
  rows.forEach(row => {
    if (!byProductId.has(row.productId)) byProductId.set(row.productId, [])
    byProductId.get(row.productId)?.push(row)
  })
  const multiMappedProducts = Array.from(byProductId.entries())
    .filter(([, mapped]) => mapped.length > 1)
    .map(([productId, mapped]) => ({
      productId,
      productTitle: mapped[0].productTitle,
      pages: mapped.map(item => `${item.entityType}:${item.entitySlug}`),
    }))

  const topClickedProducts = topRowsBy(rows, row => row.clickCount).filter(row => row.clickCount > 0)
  const pageMetrics = Array.from(new Set(rows.map(row => `${row.entityType}:${row.entitySlug}`))).map(pageKey => ({
    pageKey,
    clicks: analytics.clickByPageKey.get(pageKey) || 0,
    impressions: analytics.impressionByPageKey.get(pageKey) || 0,
  }))
  const topPages = topRowsBy(pageMetrics, row => row.clicks).filter(row => row.clicks > 0)

  const output = {
    generatedAt: new Date().toISOString(),
    dataSources: {
      curatedProducts: 'src/data/curatedProducts.ts',
      readinessRules: 'src/lib/curatedProducts.ts',
      pageSummaries: ['public/data/herbs-summary.json', 'public/data/compounds-summary.json'],
      healthReport: hasFile(HEALTH_REPORT) ? 'ops/reports/affiliate-product-health.json' : null,
      affiliateAnalyticsEvents: analytics.sourcePath,
      analyticsNotes:
        analytics.available
          ? 'Metrics calculated from local curated_product_impression/click events.'
          : 'No local affiliate-product event export found; metric fields default to zero.',
    },
    summary: {
      totalRecommendations: rows.length,
      liveHealthy: liveHealthy.length,
      staleRenderable: staleRenderable.length,
      blocked: blocked.length,
      pagesMissingCuratedProducts: {
        herbs: missingHerbPages.length,
        compounds: missingCompoundPages.length,
        total: missingHerbPages.length + missingCompoundPages.length,
      },
      productsMappedToMultiplePages: multiMappedProducts.length,
      analyticsAvailable: analytics.available,
      analyticsEventCount: analytics.totalEvents,
    },
    groupedViews: {
      liveHealthy,
      staleRenderable,
      blocked,
      pagesMissingCuratedProducts: {
        herbs: missingHerbPages.map(row => ({ slug: row.slug, name: row.common || row.name || row.slug })),
        compounds: missingCompoundPages.map(row => ({ slug: row.slug, name: row.name || row.common || row.slug })),
      },
      productsMappedToMultiplePages: multiMappedProducts,
      topClickedProducts: topClickedProducts.map(row => ({
        productId: row.productId,
        productTitle: row.productTitle,
        entityType: row.entityType,
        entitySlug: row.entitySlug,
        clickCount: row.clickCount,
        impressionCount: row.impressionCount,
        clickThroughRate: row.clickThroughRate,
      })),
      topClickedPages: topPages,
    },
    entries: rows,
  }

  const blockedReasons = blocked.map(row => `${row.entityType}:${row.entitySlug}:${row.productId} => ${row.failureReasons.join(', ') || 'inactive'}`)
  const topProductLines = topClickedProducts.slice(0, 10).map(
    row => `${row.productTitle} (${row.productId}) — clicks=${row.clickCount}, impressions=${row.impressionCount}, ctr=${row.clickThroughRate ?? 'n/a'}`
  )
  const topPageLines = topPages.slice(0, 10).map(
    row => `${row.pageKey} — clicks=${row.clicks}, impressions=${row.impressions}, ctr=${pct(row.clicks, row.impressions) ?? 'n/a'}`
  )

  const md = [
    '# Affiliate Inventory Operations Report',
    '',
    `Generated: ${output.generatedAt}`,
    '',
    '## Snapshot',
    `- Total recommendations: **${output.summary.totalRecommendations}**`,
    `- Live and healthy: **${output.summary.liveHealthy}**`,
    `- Stale but renderable (grace state): **${output.summary.staleRenderable}**`,
    `- Blocked recommendations: **${output.summary.blocked}**`,
    `- Pages missing curated products: **${output.summary.pagesMissingCuratedProducts.total}** (herbs=${output.summary.pagesMissingCuratedProducts.herbs}, compounds=${output.summary.pagesMissingCuratedProducts.compounds})`,
    `- Products mapped to multiple pages: **${output.summary.productsMappedToMultiplePages}**`,
    `- Analytics available: **${output.summary.analyticsAvailable ? 'yes' : 'no'}**`,
    analytics.available
      ? `- Analytics source: \`${analytics.sourcePath}\` (${analytics.totalEvents} events)`
      : '- Analytics source: none (click/impression metrics default to zero)',
    '',
    '## Data Sources',
    `- Curated product mappings: \`${output.dataSources.curatedProducts}\``,
    `- Readiness logic: \`${output.dataSources.readinessRules}\``,
    `- Page confidence/name inputs: ${output.dataSources.pageSummaries.map(item => `\`${item}\``).join(', ')}`,
    hasFile(HEALTH_REPORT) ? `- Existing health output: \`${output.dataSources.healthReport}\`` : '- Existing health output: not present',
    output.dataSources.analyticsNotes,
    '',
    '## Live and Healthy Recommendations',
    liveHealthy.length
      ? liveHealthy
          .map(
            row =>
              `- ${row.entityType}:${row.entitySlug} → ${row.productTitle} (${row.productId}) [reviewedAt=${row.reviewedAt}, confidence=${row.pageConfidenceTier}/${row.confidenceTierRequired}]`
          )
          .join('\n')
      : '- none',
    '',
    '## Stale but Renderable Recommendations',
    staleRenderable.length
      ? staleRenderable
          .map(
            row =>
              `- ${row.entityType}:${row.entitySlug} → ${row.productTitle} (${row.productId}) [reviewAgeDays=${row.reviewAgeDays ?? 'n/a'}, warnings=${row.warningReasons.join(', ') || 'none'}]`
          )
          .join('\n')
      : '- none',
    '',
    '## Blocked Recommendations with Reasons',
    mdList(blockedReasons),
    '',
    '## Pages Missing Curated Products (sample)',
    `- Herbs missing: ${missingHerbPages.length}`,
    ...missingHerbPages.slice(0, 20).map(row => `  - herb:${row.slug} (${row.common || row.name || row.slug})`),
    `- Compounds missing: ${missingCompoundPages.length}`,
    ...missingCompoundPages.slice(0, 20).map(row => `  - compound:${row.slug} (${row.name || row.common || row.slug})`),
    '',
    '## Products Mapped to Multiple Pages',
    multiMappedProducts.length
      ? multiMappedProducts
          .map(row => `- ${row.productTitle} (${row.productId}) → ${row.pages.join(', ')}`)
          .join('\n')
      : '- none',
    '',
    '## Top Clicked Products',
    mdList(topProductLines),
    '',
    '## Top Clicked Pages',
    mdList(topPageLines),
    '',
    '## Operator Notes',
    '- `readinessState=healthy` means active + renderEligible + no warning flags.',
    '- `readinessState=warning` means renderable but stale in grace period or warning reasons present.',
    '- `readinessState=fail` means blocked from rendering by policy checks.',
  ].join('\n')

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
  fs.writeFileSync(OUT_MD, `${md}\n`, 'utf8')

  console.log(`[report:affiliate-inventory] wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`[report:affiliate-inventory] wrote ${path.relative(ROOT, OUT_MD)}`)
  console.log(
    `[report:affiliate-inventory] summary total=${output.summary.totalRecommendations} healthy=${output.summary.liveHealthy} staleRenderable=${output.summary.staleRenderable} blocked=${output.summary.blocked} missingPages=${output.summary.pagesMissingCuratedProducts.total}`
  )
}

writeReport()
