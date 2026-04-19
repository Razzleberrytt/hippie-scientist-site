import type { ResearchEnrichment } from '@/types/researchEnrichment'
import type { PublishSafeEnrichmentSummary } from '@/types/enrichmentDiscovery'

export type Herb = {
  slug: string
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
  primaryActions?: string[]
  mechanisms?: string[]
  effects?: string[] | string
  effectsSummary?: string | null
  mechanism?: string
  mechanismofaction?: string
  mechanismOfAction?: string
  compounds?: string[]
  active_compounds?: string[]
  confidence?: 'high' | 'medium' | 'low'
  compoundsDetailed?: string[]
  activeconstituents?: string[]
  activeConstituents?: { name: string }[]
  preparations?: string[]
  preparation?: string | null
  traditionalUses?: string[]
  relatedHerbs?: string[]
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
  sideEffects?: string | string[]
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
  commonName?: string
  scientificname?: string
  latinName?: string
  summary?: string
  affiliatelink?: string | null
  productRecommendations?: Array<{
    label: string
    type: string
    url: string
  }>
  compoundClasses?: string[]
  pharmCategories?: string[]
  identity?: string
  categoryUseContext?: string
  evidenceLevel?: string
  relatedEntities?: string[]
  relatedCompounds?: string[]
  researchEnrichmentSummary?: PublishSafeEnrichmentSummary
  researchEnrichment?: ResearchEnrichment
  [key: string]: unknown
}
