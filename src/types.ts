export interface Herb {
  id: string
  name: string
  slug?: string
  scientificName?: string
  category: string
  effects?: string[]
  description?: string
  mechanismOfAction?: string
  pharmacokinetics?: string
  therapeuticUses?: string
  sideEffects?: string
  contraindications?: string
  drugInteractions?: string
  toxicity?: string
  toxicityLD50?: string
  preparation?: string
  dosage?: string
  onset?: string
  intensity?: string
  duration?: string
  legalStatus?: string
  region?: string
  tags?: string[]
  sources?: string[]
  needsReview?: boolean
  /** Normalized high-level categories derived from the raw category field. */
  normalizedCategories?: string[]
  sourceRefs?: string[]
  image?: string
  activeConstituents?: {
    name: string
    type?: string
    effect?: string
  }[]
  affiliateLink?: string
}
