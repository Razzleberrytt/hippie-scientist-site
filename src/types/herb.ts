import type { ConfidenceLevel } from './confidence'

export type CanonicalHerb = {
  name: string
  class: string
  activeCompounds: string[]
  mechanism: string
  effects: string[]
  contraindications: string[]
  description?: string
  confidence?: ConfidenceLevel
}

export type Herb = {
  slug?: string
  id?: string
  common?: string
  scientific?: string
  og?: string
  category?: string
  subcategory?: string
  category_label?: string
  categories?: string[]
  benefits?: string
  intensity?: string
  intensityLabel?: 'Mild' | 'Moderate' | 'Strong' | 'Variable' | 'Unknown' | null
  intensityLevel?: 'mild' | 'moderate' | 'strong' | 'variable' | 'unknown' | null
  intensityClean?: string | null
  region?: string
  regionNotes?: string | null
  regiontags?: string[]
  legal?: string
  legalstatus?: string
  legalStatus?: string
  legalnotes?: string
  legalstatusClean?: string | null
  schedule?: string
  description?: string
  effects?: string[] | string
  effectsSummary?: string | null
  mechanism?: string
  mechanismofaction?: string
  mechanismOfAction?: string
  compounds?: string[]
  active_compounds?: string[]
  confidence?: ConfidenceLevel
  compoundsDetailed?: string[]
  activeconstituents?: string[]
  activeConstituents?: { name: string }[]
  preparations?: string[]
  preparation?: string | null
  preparationsText?: string
  interactions?: string[] | string
  interactionsText?: string
  drugInteractions?: string
  interactionTags?: string[]
  interactionNotes?: string[]
  contraindications?: string[] | string
  contraindicationsText?: string
  dosage?: string
  dosage_notes?: string | null
  therapeutic?: string
  therapeuticUses?: string | string[]
  sideeffects?: string[] | string
  sideEffects?: string
  safety?: string
  safetyrating?: string | null
  toxicity?: string
  toxicity_ld50?: string
  toxicityld50?: string
  toxicityLD50?: string
  tags?: string[]
  tagsRaw?: string
  activeconstituentsText?: string
  sources?: Array<string | { title: string; url?: string; note?: string }>
  image?: string
  imageCredit?: string | null
  duration?: string | null
  onset?: string | null
  pharmacokinetics?: string | null
  pharmacology?: string | null
  dosageNotes?: string | null
  name?: string
  nameNorm?: string
  commonnames?: string
  scientificname?: string
  affiliatelink?: string | null
  compoundClasses?: string[]
  pharmCategories?: string[]
  class?: string
  activeCompounds?: string[]
  contraindications_raw?: string
  [key: string]: unknown
}
