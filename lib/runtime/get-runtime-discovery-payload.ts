import {
  getContextFromRecord,
} from '@/lib/runtime/get-context-from-record'

import {
  getDiverseDiscoveryItems,
} from '@/lib/runtime/get-diverse-discovery-items'

import {
  buildAdaptiveRecommendationScores,
} from '@/src/lib/adaptive-recommendation-scoring'

export function getRuntimeDiscoveryPayload(record: any) {
  const context = getContextFromRecord(record)

  const recommendations = getDiverseDiscoveryItems(context, 5)

  const adaptiveScores = buildAdaptiveRecommendationScores(
    record,
    recommendations,
  )

  const rankedRecommendations = recommendations
    .map((item: any) => {
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
      }
    })
    .filter(
      (item: any) =>
        item.recommendationTier !== 'suppressed' &&
        item.evidenceScore >= 42 &&
        item.authorityScore >= 44,
    )
    .sort(
      (a: any, b: any) =>
        (b.adaptiveScore || 0) -
        (a.adaptiveScore || 0),
    )

  return {
    context,
    recommendations: rankedRecommendations,
  }
}
