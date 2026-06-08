export type EvidenceLevel = 'strong' | 'moderate' | 'limited' | 'preliminary' | 'traditional'

export type SafetySeverity = 'info' | 'caution' | 'warning'

export type InternalLinkType = 'herb' | 'compound' | 'guide' | 'goal' | 'compare'

export interface GuideSectionBlock {
  type: 'paragraph' | 'tip' | 'warning'
  text: string
}

export interface GuideSubsection {
  title: string
  body: string
  blocks?: GuideSectionBlock[]
}

export interface GuideSection {
  id: string
  title: string
  body: string
  subsections?: GuideSubsection[]
  blocks?: GuideSectionBlock[]
}

export interface EvidenceHighlight {
  claim: string
  level: EvidenceLevel
  context?: string
}

export interface DosageGuideline {
  form: string
  range: string
  notes?: string
  bioavailabilityNote?: string
}

export interface SafetyNote {
  severity: SafetySeverity
  text: string
}

export interface GuideInternalLink {
  href: string
  label: string
  type: InternalLinkType
  description?: string
}

export interface GuideSeo {
  title: string
  description: string
  canonical: string
}

export interface GuideProductOption {
  name: string
  description: string
  form: 'capsule' | 'powder' | 'liquid' | 'extract'
  dosage: string
  amazonAsin: string
  amazonUrl: string
  affiliateTag: string
  approxPrice: string
  rating: string
  whyChosen: string
  pros: string[]
  cons: string[]
}

export interface GuideData {
  slug: string
  title: string
  subtitle?: string
  category: string
  heroImage: string
  lastUpdated: string
  readingTime?: number
  intro: string
  sections: GuideSection[]
  evidenceHighlights: EvidenceHighlight[]
  dosageGuidelines?: DosageGuideline[]
  options?: GuideProductOption[]
  safetyNotes?: SafetyNote[]
  relatedLinks: GuideInternalLink[]
  seo: GuideSeo
}
