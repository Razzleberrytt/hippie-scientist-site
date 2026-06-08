import { calculateSemanticConfidence } from './semantic-confidence'
import { calculateSemanticFreshness } from './semantic-freshness'

export type AuthoritySupernode = {
  slug: string
  title: string
  authorityTier: 'foundational' | 'canonical' | 'emerging'
  traversalWeight: number
  ecosystemCount: number
  pathwayCount: number
  confidence: number
  reasons: string[]
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

export function buildAuthoritySupernodes(records: any[]): AuthoritySupernode[] {
  return records
    .map((record) => {
      const confidence = calculateSemanticConfidence(record)
      const freshness = calculateSemanticFreshness(record)

      const ecosystems = normalizeList(record?.ecosystem_taxonomy)
      const pathways = normalizeList(record?.pathways)
      const compareGroups = normalizeList(record?.compare_groups)

      const reasons: string[] = []

      let authorityTier: AuthoritySupernode['authorityTier'] = 'emerging'

      if (
        confidence.confidence === 'strong' &&
        ecosystems.length >= 2
      ) {
        authorityTier = 'canonical'
        reasons.push('canonical-ecosystem-anchor')
      }

      if (
        pathways.length >= 2 &&
        compareGroups.length >= 1
      ) {
        authorityTier = 'foundational'
        reasons.push('foundational-knowledge-hub')
      }

      const traversalWeight = Math.min(
        Math.round(
          confidence.routingConfidence * 0.45 +
          freshness.authorityFreshness * 0.3 +
          ecosystems.length * 5 +
          pathways.length * 4 +
          compareGroups.length * 3,
        ),
        100,
      )

      return {
        slug: normalizeText(record?.slug || 'discovery'),
        title:
          normalizeText(record?.name) ||
          normalizeText(record?.title) ||
          'Semantic Authority Hub',
        authorityTier,
        traversalWeight,
        ecosystemCount: ecosystems.length,
        pathwayCount: pathways.length,
        confidence: confidence.score,
        reasons,
      }
    })
    .sort((a, b) => b.traversalWeight - a.traversalWeight)
    .slice(0, 40)
}
