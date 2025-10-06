export interface Herb {
  id: string
  slug: string
  common: string
  scientific: string
  category: string
  subcategory: string
  category_label?: string
  intensity: string
  intensity_label?: string
  region: string
  regiontags: string[]
  legalstatus: string
  schedule: string
  legalnotes: string
  description: string
  effects: string
  mechanism: string
  compounds: string[]
  preparations: string[]
  interactions: string[]
  contraindications: string[]
  dosage: string
  therapeutic: string
  safety: string
  sideeffects: string[]
  toxicity: string
  toxicity_ld50: string
  is_controlled_substance: boolean
  tags: string[]
  sources: string[]
  image: string
  // Derived/legacy compatibility fields
  name?: string
  nameNorm?: string
  commonnames?: string
  scientificname?: string
  mechanismofaction?: string
  mechanismOfAction?: string
  legalStatus?: string
  therapeuticUses?: string
  sideEffects?: string
  drugInteractions?: string
  toxicityld50?: string
  toxicityLD50?: string
  compoundsDetailed?: string[]
  activeconstituents?: string[]
  activeConstituents?: { name: string }[]
  contraindicationsText?: string
  interactionsText?: string
  tagsRaw?: string
  duration?: string | null
  onset?: string | null
  pharmacokinetics?: string | null
  preparation?: string | null
  regionNotes?: string | null
  safetyrating?: string | null
  dosage_notes?: string | null
  legalstatusClean?: string | null
  intensityClean?: string | null
  effectsSummary?: string | null
  affiliatelink?: string | null
  imageCredit?: string | null
  schedule_text?: string | null
  legalNotes?: string | null
  regionTags?: string[]
  preparationsText?: string | null
  [key: string]: unknown
}
