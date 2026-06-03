import { herbRecommendations } from '@/data/herbRecommendations'
import type { HerbRecommendation } from '@/types/recommendations'

const herbRecommendationBySlug = new Map(
  herbRecommendations.map(recommendation => [recommendation.herbSlug, recommendation]),
)

export function getHerbRecommendation(herbSlug: string | null | undefined): HerbRecommendation | null {
  const normalizedSlug = String(herbSlug || '')
    .trim()
    .toLowerCase()

  if (!normalizedSlug) return null

  return herbRecommendationBySlug.get(normalizedSlug) || null
}
