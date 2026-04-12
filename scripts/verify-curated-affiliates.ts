import fs from 'node:fs'
import path from 'node:path'
import {
  curatedProductRecommendations,
  CURATED_PRODUCT_STALE_REVIEW_DAYS,
} from '../src/data/curatedProducts'
import {
  assessCuratedProductReadiness,
  resolveAffiliateUrl,
  type CuratedProductReadiness,
} from '../src/lib/curatedProducts'
import type { ConfidenceLevel } from '../src/utils/calculateConfidence'

type SummaryRow = {
  slug?: string
  confidence?: string
}

type SlugAliases = {
  herbs?: Record<string, string>
  compounds?: Record<string, string>
}
type EntityRecord = {
  slug?: string
  name?: string
  aliases?: string[] | string
}

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'affiliate-product-health.json')

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

function toConfidence(value: unknown): ConfidenceLevel {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
  if (normalized === 'high' || normalized === 'medium') return normalized
  return 'low'
}

function toSlug(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildConfidenceMap(filePath: string): Map<string, ConfidenceLevel> {
  const rows = readJson<SummaryRow[]>(filePath)
  const map = new Map<string, ConfidenceLevel>()
  rows.forEach(row => {
    const slug = String(row.slug || '')
      .trim()
      .toLowerCase()
    if (!slug) return
    map.set(slug, toConfidence(row.confidence))
  })
  return map
}

function buildReadinessRows(): CuratedProductReadiness[] {
  const herbConfidence = buildConfidenceMap(path.join(ROOT, 'public', 'data', 'herbs-summary.json'))
  const compoundConfidence = buildConfidenceMap(path.join(ROOT, 'public', 'data', 'compounds-summary.json'))
  const slugAliases = readJson<SlugAliases>(path.join(ROOT, 'public', 'data', 'entity-slug-aliases.json'))

  const herbAliasLookup = new Map<string, string>()
  const compoundAliasLookup = new Map<string, string>()
  const herbSlugLookup = new Map<string, string>()
  const compoundSlugLookup = new Map<string, string>()

  const indexSlugLookup = (records: EntityRecord[], target: Map<string, string>) => {
    records.forEach(record => {
      const canonicalSlug = toSlug(record.slug)
      if (!canonicalSlug) return
      target.set(canonicalSlug, canonicalSlug)
      target.set(toSlug(record.name), canonicalSlug)

      const aliases = Array.isArray(record.aliases)
        ? record.aliases
        : typeof record.aliases === 'string'
          ? record.aliases.split(/[;,|]/)
          : []
      aliases.forEach(alias => target.set(toSlug(alias), canonicalSlug))
    })
  }

  indexSlugLookup(readJson<EntityRecord[]>(path.join(ROOT, 'public', 'data', 'herbs.json')), herbSlugLookup)
  indexSlugLookup(
    readJson<EntityRecord[]>(path.join(ROOT, 'public', 'data', 'compounds.json')),
    compoundSlugLookup,
  )

  Object.entries(slugAliases.herbs || {}).forEach(([aliasPath, canonicalPath]) => {
    const aliasSlug = aliasPath.split('/').filter(Boolean).at(-1)
    const canonicalSlug = canonicalPath.split('/').filter(Boolean).at(-1)
    if (!aliasSlug || !canonicalSlug) return
    herbAliasLookup.set(aliasSlug, canonicalSlug)
  })
  Object.entries(slugAliases.compounds || {}).forEach(([aliasPath, canonicalPath]) => {
    const aliasSlug = aliasPath.split('/').filter(Boolean).at(-1)
    const canonicalSlug = canonicalPath.split('/').filter(Boolean).at(-1)
    if (!aliasSlug || !canonicalSlug) return
    compoundAliasLookup.set(aliasSlug, canonicalSlug)
  })

  const duplicateKeys = new Set<string>()
  const duplicatePairs = new Set<string>()

  curatedProductRecommendations.forEach(product => {
    const normalizedUrl = resolveAffiliateUrl(product).trim().toLowerCase()
    const key = [product.entityType, product.entitySlug, normalizedUrl || product.productId].join('|')
    if (duplicateKeys.has(key)) duplicatePairs.add(key)
    duplicateKeys.add(key)
  })

  return curatedProductRecommendations.map(product => {
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

    const entityExists =
      product.entityType === 'herb'
        ? herbConfidence.has(product.entitySlug) ||
          herbConfidence.has(herbAliasLookup.get(product.entitySlug) || '') ||
          herbSlugLookup.has(toSlug(product.entitySlug))
        : compoundConfidence.has(product.entitySlug) ||
          compoundConfidence.has(compoundAliasLookup.get(product.entitySlug) || '') ||
          compoundSlugLookup.has(toSlug(product.entitySlug))

    const failureReasons = [...readiness.failureReasons]
    if (!entityExists && !failureReasons.includes('entity_page_mismatch')) {
      failureReasons.push('entity_page_mismatch')
    }

    return {
      ...readiness,
      failureReasons,
      renderEligible: failureReasons.length === 0,
      genericLinkDetected: readiness.genericLinkDetected || !resolveAffiliateUrl(product),
    }
  })
}

function main() {
  const rows = buildReadinessRows()
  const failures = rows.filter(row => !row.renderEligible)
  const warnings = rows.filter(row => row.renderEligible && row.warningReasons.length > 0)
  const manualReview = rows.filter(row => row.requiresManualReview)

  const report = {
    generatedAt: new Date().toISOString(),
    policy: {
      reviewedAtRequired: true,
      staleReviewDays: CURATED_PRODUCT_STALE_REVIEW_DAYS,
      staleGraceDays: 30,
      staleGraceRendersWithWarning: true,
      invalidProductsRender: false,
      urlChecks: {
        malformedAmazonUrl: 'strict_dp_or_gp_product_only',
        genericCategoryOrSearchLinksBlocked: true,
        networkChecks: 'disabled_for_deterministic_ci',
      },
    },
    total: rows.length,
    pass: rows.length - failures.length,
    warn: warnings.length,
    fail: failures.length,
    requiresManualReview: manualReview.length,
    entries: rows,
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  if (failures.length > 0) {
    console.error(`[verify-curated-affiliates] FAIL ${failures.length}/${rows.length} entries not render-eligible.`)
    failures.forEach(row => {
      console.error(
        ` - ${row.entityType}:${row.entitySlug}:${row.productId} => ${row.failureReasons.join(', ')}`
      )
    })
    console.error(`[verify-curated-affiliates] report: ${path.relative(ROOT, REPORT_PATH)}`)
    process.exit(1)
  }

  console.log(
    `[verify-curated-affiliates] OK ${rows.length} checked | pass=${report.pass} warn=${warnings.length} fail=${report.fail} manual_review=${manualReview.length}`
  )
  console.log(`[verify-curated-affiliates] report: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
