import type { CuratedData } from '@/lib/semanticCompression'

export type ResearchEnrichment = unknown
export type PublishSafeEnrichmentSummary = unknown

export interface Herb {
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
  safetyNotes?: string | null
  safety_notes?: string | null
  safetyLevel?: string | null
  safety_level?: string | null
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
  curatedData?: CuratedData
  [key: string]: unknown
}

export interface Compound {
  slug?: string
  name: string
  displayName?: string
  description?: string
  mechanism?: string
  mechanisms?: string[]
  effects?: string[] | string
  curatedData?: {
    summary?: string
    keyEffects?: string[]
  }
  rawData?: Record<string, unknown>
  [key: string]: unknown
}

export interface Claim {
  slug: string
  claim: string
  effect?: string
  evidenceLevel?: string
  pubmedId?: string
  citation?: string
}

export interface ComparisonCandidate {
  candidates: string[]
}

export interface ComparisonPage {
  slug: string
  title: string
  summary: string
  a: ComparisonCandidate
  b: ComparisonCandidate
}

export interface ConditionPage {
  slug: string
  title: string
  description: string
  seoTitle?: string
  seoDescription?: string
}

export interface GuidePage {
  slug: string
  title: string
  summary: string
  content?: string
}

export interface FeaturedItem {
  slug: string
  title: string
  type: 'herb' | 'compound' | 'stack'
  imageUrl?: string
  description?: string
}

export interface HomepageData {
  heroTitle: string
  heroSubtitle: string
  featured: FeaturedItem[]
}

export interface NavigationItem {
  label: string
  href: string
  children?: NavigationItem[]
}

export interface NewsletterEntry {
  email: string
  subscribedAt: string
}

export interface Author {
  id: string
  name: string
  bio?: string
  imageUrl?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

export interface Tag {
  name: string
  slug: string
}

export interface RuntimeRecord {
  slug: string
  name?: string
  displayName?: string
  entityType?: 'herb' | 'compound' | 'supernode' | 'stack' | 'compare' | 'ecosystem' | string
  primary_effects?: string[] | string
  effects?: string[] | string
  mechanisms?: string[] | string
  pathways?: string[] | string
  evidence_tier?: string
  evidenceTier?: string
  evidence_grade?: string
  summary_quality?: string
  tier_level?: string
  summary?: string
  description?: string
  safety_flags?: string[]
  safetyNotes?: string[] | string | null
  safety?: { cautionSignals?: string[]; evidenceTier?: string; confidence?: string; notes?: string } | null
  contraindications?: string[] | string
  time_to_effect?: string
  onset?: string
  duration?: string
  cost?: string
  interactions?: string[] | string
  sourceCount?: number | string
  review_status?: string
  source_status?: string
  traditionalUses?: string[] | string
  preparation?: string
  region?: string
  activeCompounds?: string[] | string
  foundIn?: string[] | string
  relatedHerbs?: string[] | string
  relatedCompounds?: string[] | string
  compoundClass?: string
  class?: string
  bioavailability?: string
  minimum_effective_dose?: string
  population_tags?: string[] | string
  interaction_type?: string
  [key: string]: unknown
}
