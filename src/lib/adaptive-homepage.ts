import { calculateSemanticConfidence } from './semantic-confidence'
import { calculateSemanticFreshness } from './semantic-freshness'
import { evaluateSemanticAuthority } from './semantic-authority'

export type HomepageCluster = {
  slug: string
  title: string
  routingWeight: number
  authorityWeight: number
  freshnessWeight: number
  confidence: number
  category:
    | 'foundational'
    | 'emerging'
    | 'recovery'
    | 'comparison'
    | 'pathway'
    | 'exploration'
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildAdaptiveHomepageClusters(records: any[]): HomepageCluster[] {
  return records
    .map((record) => {
      const confidence = calculateSemanticConfidence(record)
      const freshness = calculateSemanticFreshness(record)
      const authority = evaluateSemanticAuthority(record)

      const pathways = normalizeList(record?.pathways)
      const ecosystems = normalizeList(record?.ecosystem_taxonomy)

      const recoveryIntent = normalizeText(record?.recovery_intent)
      const comparisonIntent = normalizeText(record?.comparison_intent)
      const educationalIntent = normalizeText(record?.educational_intent)

      let category: HomepageCluster['category'] = 'exploration'

      if (educationalIntent.includes('foundational')) {
        category = 'foundational'
      }

      if (recoveryIntent.includes('recovery')) {
        category = 'recovery'
      }

      if (comparisonIntent.includes('compare')) {
        category = 'comparison'
      }

      if (pathways.length >= 2 || ecosystems.length >= 2) {
        category = 'pathway'
      }

      if (freshness.confidence === 'strong') {
        category = 'emerging'
      }

      const authorityWeight =
        confidence.score * 0.45 +
        freshness.authorityFreshness * 0.25 +
        (authority.confidence === 'strong' ? 20 : 10)

      const routingWeight =
        confidence.routingConfidence * 0.6 +
        freshness.freshnessScore * 0.4

      return {
        slug: normalizeText(record?.slug || 'discovery'),
        title:
          normalizeText(record?.name) ||
          normalizeText(record?.title) ||
          'Semantic Discovery',
        routingWeight: Math.round(routingWeight),
        authorityWeight: Math.round(authorityWeight),
        freshnessWeight: freshness.freshnessScore,
        confidence: confidence.score,
        category,
      }
    })
    .sort((a, b) => {
      const combinedA = a.routingWeight + a.authorityWeight
      const combinedB = b.routingWeight + b.authorityWeight

      return combinedB - combinedA
    })
    .slice(0, 24)
}
