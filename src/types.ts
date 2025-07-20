export interface Herb {
  id: string
  name: string
  scientificName?: string
  category: string
  effects: string[]
  preparation: string
  dosage?: string
  intensity: string
  onset: string
  duration?: string
  legalStatus: string
  region: string
  tags: string[]
  /**
   * Normalized high-level categories derived from the raw category field.
   * At most 3 values ordered by relevance.
   */
  normalizedCategories?: string[]
  mechanismOfAction?: string
  pharmacokinetics?: string
  therapeuticUses?: string
  sideEffects?: string
  contraindications?: string
  drugInteractions?: string
  toxicity?: string
  toxicityLD50?: string
  description?: string
  safetyRating?: number
  sourceRefs?: string[]
  image?: string
  activeConstituents?: {
    name: string
    type: 'alkaloid' | 'terpenoid' | 'phenethylamine' | 'tryptamine' | string
    effect: string
  }[]
  affiliateLink?: string
}
