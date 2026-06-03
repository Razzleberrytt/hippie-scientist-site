import { calculateSemanticConfidence } from './semantic-confidence'
import { buildSemanticRouteDecision } from './semantic-routing'

export type SemanticMemoryState = {
  slug: string
  continuityWeight: number
  revisitPriority: number
  ecosystemAffinity: number
  pathwayAffinity: number
  confidence: number
  memoryTier: 'volatile' | 'stable' | 'anchor'
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

export function buildSemanticMemoryStates(records: any[]): SemanticMemoryState[] {
  return records
    .map((record) => {
      const confidence = calculateSemanticConfidence(record)
      const routing = buildSemanticRouteDecision(record)

      const ecosystems = normalizeList(record?.ecosystem_taxonomy)
      const pathways = normalizeList(record?.pathways)

      const reasons: string[] = []

      let memoryTier: SemanticMemoryState['memoryTier'] = 'volatile'

      if (
        confidence.confidence === 'moderate' ||
        routing.routingMode === 'continuity-first'
      ) {
        memoryTier = 'stable'
        reasons.push('continuity-capable')
      }

      if (
        confidence.confidence === 'strong' &&
        ecosystems.length >= 2 &&
        pathways.length >= 2
      ) {
        memoryTier = 'anchor'
        reasons.push('semantic-anchor')
      }

      const ecosystemAffinity = Math.min(
        ecosystems.length * 18,
        100,
      )

      const pathwayAffinity = Math.min(
        pathways.length * 18,
        100,
      )

      const continuityWeight = Math.min(
        Math.round(
          confidence.routingConfidence * 0.45 +
          ecosystemAffinity * 0.3 +
          pathwayAffinity * 0.25,
        ),
        100,
      )

      const revisitPriority = Math.min(
        Math.round(
          continuityWeight * 0.7 +
          confidence.recommendationConfidence * 0.3,
        ),
        100,
      )

      return {
        slug: normalizeText(record?.slug || 'discovery'),
        continuityWeight,
        revisitPriority,
        ecosystemAffinity,
        pathwayAffinity,
        confidence: confidence.score,
        memoryTier,
        reasons,
      }
    })
    .sort((a, b) => b.revisitPriority - a.revisitPriority)
}
