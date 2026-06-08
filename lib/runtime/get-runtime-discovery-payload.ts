import {
  getContextFromRecord,
} from '@/lib/runtime/get-context-from-record'

import {
  getDiverseDiscoveryItems,
} from '@/lib/runtime/get-diverse-discovery-items'

import {
  buildAdaptiveRecommendationScores,
} from '@/src/lib/adaptive-recommendation-scoring'

type ScoredItem = Record<string, unknown> & {
  href: string
  title: string
  description?: string
  category?: string
  adaptiveScore: number
  recommendationTier: string
  evidenceScore: number
  authorityScore: number
  continuityScore: number
  ecosystemScore: number
}

export function getRuntimeDiscoveryPayload(record: Record<string, unknown>) {
  const context = getContextFromRecord(record)

  const recommendations = getDiverseDiscoveryItems(context, 5)

  const adaptiveScores = buildAdaptiveRecommendationScores(
    record,
    recommendations,
  )

  const rankedRecommendations = recommendations
    .map((item: Record<string, unknown>): ScoredItem => {
      const score = adaptiveScores.find(
        (entry) => entry.slug === item.slug,
      )

      return {
        ...item,
        adaptiveScore: score?.adaptiveScore || 0,
        recommendationTier:
          score?.recommendationTier || 'supporting',
        evidenceScore: score?.evidenceScore || 0,
        authorityScore: score?.authorityScore || 0,
        continuityScore: score?.continuityScore || 0,
        ecosystemScore: score?.ecosystemScore || 0,
      }
    })
    .filter(
      (item: ScoredItem) =>
        item.recommendationTier !== 'suppressed' &&
        item.evidenceScore >= 42 &&
        item.authorityScore >= 44,
    )
    .sort((a: ScoredItem, b: ScoredItem) => {
      const continuityDelta =
        (b.continuityScore || 0) -
        (a.continuityScore || 0)

      if (Math.abs(continuityDelta) >= 10) {
        return continuityDelta
      }

      const ecosystemDelta =
        (b.ecosystemScore || 0) -
        (a.ecosystemScore || 0)

      if (Math.abs(ecosystemDelta) >= 8) {
        return ecosystemDelta
      }

      return (
        (b.adaptiveScore || 0) -
        (a.adaptiveScore || 0)
      )
    })

  return {
    context,
    recommendations: rankedRecommendations,
  }
}
