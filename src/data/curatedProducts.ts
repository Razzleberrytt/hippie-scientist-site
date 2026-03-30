import type { ConfidenceLevel } from '@/utils/calculateConfidence'

export type CuratedProductEntityType = 'herb' | 'compound'

export type AffiliateTagStrategy = 'already_tagged' | 'append_default_tag'

export type CuratedResearchStatus = 'pending' | 'in_review' | 'approved' | 'rejected'

export type CuratedProductRecommendation = {
  entityType: CuratedProductEntityType
  entitySlug: string
  productId: string
  productTitle: string
  brand: string
  amazonUrl: string
  affiliateTagStrategy: AffiliateTagStrategy
  imageUrl?: string
  assetKey?: string
  productType: string
  rationaleShort: string
  rationaleLong: string
  researchStatus: CuratedResearchStatus
  reviewedBy: string
  reviewedAt: string
  confidenceTierRequired: ConfidenceLevel
  cautionNotes: string[]
  bestFor: string[]
  avoidIf: string[]
  featured: boolean
  active: boolean
  sortOrder: number
}

export const DEFAULT_AMAZON_AFFILIATE_TAG = 'razzleberry02-20'

export const curatedProductRecommendations: CuratedProductRecommendation[] = [
  {
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    productId: 'ashwagandha-ksm66-capsules',
    productTitle: 'KSM-66 Ashwagandha Root Extract Capsules',
    brand: 'Sports Research',
    amazonUrl: 'https://www.amazon.com/dp/B07N7S35N5',
    affiliateTagStrategy: 'append_default_tag',
    productType: 'standardized extract capsules',
    rationaleShort: 'Standardized extract format aligned with common study protocols.',
    rationaleLong:
      'Selected for standardized root-only extract labeling, transparent dosage per serving, and consistency for users who want repeatable intake rather than variable loose-powder measurements.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-03-25',
    confidenceTierRequired: 'medium',
    cautionNotes: ['May increase sedation with CNS depressants.', 'Avoid during pregnancy unless clinician-directed.'],
    bestFor: ['People prioritizing consistent daily dosing', 'Users comparing routines across weeks'],
    avoidIf: ['You are pregnant or breastfeeding without medical guidance', 'You take sedating medications'],
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    entityType: 'herb',
    entitySlug: 'chamomile',
    productId: 'chamomile-organic-tea-bags',
    productTitle: 'Organic Chamomile Herbal Tea Bags',
    brand: 'Traditional Medicinals',
    amazonUrl: 'https://www.amazon.com/dp/B0009F3POO',
    affiliateTagStrategy: 'append_default_tag',
    productType: 'tea bags',
    rationaleShort: 'Simple single-herb preparation with low-friction entry format.',
    rationaleLong:
      'Chosen for transparent ingredient labeling and routine-friendly preparation. Tea-bag format supports gradual introduction and easier stop/start observation during self-tracking.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-03-24',
    confidenceTierRequired: 'medium',
    cautionNotes: ['Potential ragweed-family cross-reactivity in sensitive users.'],
    bestFor: ['Evening wind-down routines', 'New users starting low and tracking tolerance'],
    avoidIf: ['You have known Asteraceae allergy sensitivity'],
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    entityType: 'compound',
    entitySlug: 'luteolin',
    productId: 'luteolin-phytosome-capsules',
    productTitle: 'Luteolin Phytosome Supplement Capsules',
    brand: 'Double Wood Supplements',
    amazonUrl: 'https://www.amazon.com/dp/B0B5VQYQQY',
    affiliateTagStrategy: 'append_default_tag',
    productType: 'compound-focused capsules',
    rationaleShort: 'Formulation emphasizes labeled luteolin delivery per serving.',
    rationaleLong:
      'Included because the product discloses a clear luteolin amount and standardized delivery format, helping reduce ambiguity common in blended polyphenol products.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-03-26',
    confidenceTierRequired: 'high',
    cautionNotes: ['Polyphenol supplements can interact with anticoagulants in some users.'],
    bestFor: ['Users comparing compound-specific formulations', 'People logging dose-response in detail'],
    avoidIf: ['You take anticoagulant or antiplatelet medications without clinician review'],
    featured: true,
    active: true,
    sortOrder: 1,
  },
]
