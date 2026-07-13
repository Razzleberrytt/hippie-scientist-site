export type MentalHealthSourceTier =
  | 'Official guidance'
  | 'Government health source'
  | 'Diagnostic manual'
  | 'Systematic review'
  | 'Meta-analysis'
  | 'Peer-reviewed clinical review'
  | 'Randomized trial'
  | 'Professional reference'

export type MentalHealthReference = {
  id: string
  citation: string
  url: string
  tier: MentalHealthSourceTier
  note?: string
}

export type CitedText = {
  text: string
  refs: string[]
}

export type MentalHealthSection = {
  title: string
  paragraphs: CitedText[]
  bullets?: CitedText[]
}

export type MentalHealthFaq = {
  question: string
  answer: string
  refs: string[]
}

export type MentalHealthArticle = {
  slug: string
  title: string
  seoTitle: string
  description: string
  category: 'OCD' | 'Personality disorders'
  cluster?: 'Overview' | 'Cluster A' | 'Cluster B' | 'Cluster C'
  datePublished: string
  dateReviewed: string
  readingTime: string
  deck: string
  keyPoints: CitedText[]
  sections: MentalHealthSection[]
  faq: MentalHealthFaq[]
  references: MentalHealthReference[]
}
