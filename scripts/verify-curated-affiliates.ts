import fs from 'node:fs'
import path from 'node:path'
import { curatedProductRecommendations } from '../src/data/curatedProducts'
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

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'public', 'data', 'affiliate-recommendation-readiness.json')

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
    })

    const entityExists =
      product.entityType === 'herb'
        ? herbConfidence.has(product.entitySlug)
        : compoundConfidence.has(product.entitySlug)

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

  const report = {
    generatedAt: new Date().toISOString(),
    total: rows.length,
    pass: rows.length - failures.length,
    fail: failures.length,
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

  console.log(`[verify-curated-affiliates] OK ${rows.length} entries render-eligible.`)
  console.log(`[verify-curated-affiliates] report: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
