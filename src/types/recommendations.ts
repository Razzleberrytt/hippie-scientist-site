export type HerbRecommendationForm =
  | 'capsule'
  | 'tincture'
  | 'powder'
  | 'tea'
  | 'extract'
  | 'loose herb'
  | 'softgel'

export type RecommendationConfidence = 'low' | 'medium' | 'high'

export type HerbRecommendation = {
  herbSlug: string
  recommendedForms: HerbRecommendationForm[]
  preferredAttributes: string[]
  avoidFlags: string[]
  shoppingNotes: string
  recommendationConfidence: RecommendationConfidence
}
