export interface Herb {
  id: string
  category: string
  contraindications?: string | null
  description?: string | null
  druginteractions?: string | null
  duration?: string | null
  effects?: string | null
  intensity?: string | null
  legalstatus?: string | null
  mechanismofaction?: string | null
  onset?: string | null
  pharmacokinetics?: string | null
  preparation?: string | null
  region?: string | null
  scientificname?: string | null
  sideeffects?: string | null
  tags?: string | null
  therapeuticuses?: string | null
  toxicity?: string | null
  toxicityld50?: string | null
  activeconstituents?: any
  affiliatelink?: string | null
  slug?: string | null
  compounds?: any
  sources?: any
  needsreview?: boolean | null
  image?: string | null
  safetyrating?: string | null
  dosage?: string | null
  commonnames?: string | null
  activecompounds?: string | null
  traditionaluse?: string | null
  nameNorm?: string | null
  intensityClean?: string | null
  legalstatusClean?: string | null
  compoundsDetailed?: any
}
