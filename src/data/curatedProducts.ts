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
  affiliateDisclosure: string
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
export const CURATED_PRODUCT_STALE_REVIEW_DAYS = 120

const STANDARD_AFFILIATE_DISCLOSURE =
  'Affiliate disclosure: The Hippie Scientist may earn from qualifying purchases. Recommendations are manually researched and reviewed for evidence-fit.'

export const curatedProductRecommendations: CuratedProductRecommendation[] = [
  {
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    productId: 'ashwagandha-ksm66-capsules',
    productTitle: 'KSM-66 Ashwagandha Root Extract Capsules',
    brand: 'Sports Research',
    amazonUrl: 'https://www.amazon.com/dp/B07N7S35N5',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'standardized extract capsules',
    rationaleShort: 'Standardized extract format aligned with common study protocols.',
    rationaleLong:
      'Selected for standardized root-only extract labeling, transparent dosage per serving, and consistency for users who want repeatable intake rather than variable loose-powder measurements.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-03-25',
    confidenceTierRequired: 'low',
    cautionNotes: ['May increase sedation with CNS depressants.', 'Avoid during pregnancy unless clinician-directed.'],
    bestFor: ['daily use', 'beginners'],
    avoidIf: ['pregnant', 'on sedatives'],
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    productId: 'ashwagandha-organic-root-powder',
    productTitle: 'Organic Ashwagandha Root Powder',
    brand: 'Organic India',
    amazonUrl: 'https://www.amazon.com/dp/B003PGE9KY',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'root powder',
    rationaleShort: 'Whole-root powder option for users who prefer flexible serving sizes.',
    rationaleLong:
      'Added as a lower-processing alternative to extracts for users who prefer mixing into smoothies or warm beverages while adjusting serving size gradually.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['May increase sedation with CNS depressants.', 'Avoid during pregnancy unless clinician-directed.'],
    bestFor: ['daily use', 'mix-ins'],
    avoidIf: ['pregnant', 'need fixed dose'],
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    entityType: 'herb',
    entitySlug: 'ashwagandha',
    productId: 'ashwagandha-herbal-tea',
    productTitle: 'Organic Ashwagandha Herbal Tea',
    brand: 'Buddha Teas',
    amazonUrl: 'https://www.amazon.com/dp/B01N2W31ZI',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'tea bags',
    rationaleShort: 'Tea form supports low-intensity evening use and routine adherence.',
    rationaleLong:
      'Included to provide a non-capsule format that can fit bedtime wind-down routines and users who prefer gentler beverage-based onboarding before concentrated extracts.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['May increase sedation with CNS depressants.', 'Avoid during pregnancy unless clinician-directed.'],
    bestFor: ['tea ritual', 'sleep support'],
    avoidIf: ['need standardized potency', 'on sedatives'],
    featured: false,
    active: true,
    sortOrder: 3,
  },
  {
    entityType: 'herb',
    entitySlug: 'reishi-mushroom',
    productId: 'reishi-fruiting-body-capsules',
    productTitle: 'Organic Reishi Mushroom Fruiting Body Capsules',
    brand: 'Real Mushrooms',
    amazonUrl: 'https://www.amazon.com/dp/B00TX9N2GM',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'mushroom capsules',
    rationaleShort: 'Fruiting-body capsule format offers convenient daily consistency.',
    rationaleLong:
      'Selected as the primary option for users seeking standardized, easy-to-track capsule intake without preparing decoctions or powders.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['May increase bleeding risk with anticoagulant therapy.', 'Pause before surgery unless clinician-cleared.'],
    bestFor: ['daily use', 'beginners'],
    avoidIf: ['on blood thinners'],
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    entityType: 'herb',
    entitySlug: 'reishi-mushroom',
    productId: 'reishi-liquid-dual-extract',
    productTitle: 'Reishi Mushroom Liquid Dual Extract',
    brand: 'Hawaii Pharm',
    amazonUrl: 'https://www.amazon.com/dp/B08BR9K1NJ',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'liquid extract',
    rationaleShort: 'Fast-mixing extract alternative for users avoiding capsules.',
    rationaleLong:
      'Added as an alternative delivery form for users who prefer dropper-based dosing and quick mixing into water, tea, or evening tonics.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['May increase bleeding risk with anticoagulant therapy.', 'Pause before surgery unless clinician-cleared.'],
    bestFor: ['fast-acting', 'no capsules'],
    avoidIf: ['need pre-measured servings', 'on blood thinners'],
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    entityType: 'herb',
    entitySlug: 'reishi-mushroom',
    productId: 'reishi-tea-bags',
    productTitle: 'Organic Reishi Mushroom Tea Bags',
    brand: 'FGO',
    amazonUrl: 'https://www.amazon.com/dp/B07NQ9W4L7',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'tea bags',
    rationaleShort: 'Tea format supports lower-friction trial and habit consistency.',
    rationaleLong:
      'Included as a beverage-first option for users who want a gradual, ritual-based approach rather than concentrated capsule or tincture formats.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['May increase bleeding risk with anticoagulant therapy.', 'Pause before surgery unless clinician-cleared.'],
    bestFor: ['tea ritual', 'beginners'],
    avoidIf: ['need concentrated potency'],
    featured: false,
    active: true,
    sortOrder: 3,
  },
  {
    entityType: 'herb',
    entitySlug: 'turmeric',
    productId: 'turmeric-curcumin-piperine-capsules',
    productTitle: 'Turmeric Curcumin with BioPerine Capsules',
    brand: 'Qunol',
    amazonUrl: 'https://www.amazon.com/dp/B004RRJ3B0',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'standardized curcumin capsules',
    rationaleShort: 'Primary standardized capsule option for convenient daily use.',
    rationaleLong:
      'Chosen as the primary product due to labeled curcuminoid delivery and piperine inclusion for users prioritizing practical capsule compliance.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['Can interact with anticoagulants and antiplatelet medications.', 'May aggravate reflux in sensitive users.'],
    bestFor: ['daily use', 'joint support'],
    avoidIf: ['on blood thinners', 'pre-surgery'],
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    entityType: 'herb',
    entitySlug: 'turmeric',
    productId: 'turmeric-liquid-extract-drops',
    productTitle: 'Turmeric Root Liquid Extract',
    brand: 'Herb Pharm',
    amazonUrl: 'https://www.amazon.com/dp/B00014DZQY',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'liquid extract',
    rationaleShort: 'Dropper-based extract format for non-capsule users.',
    rationaleLong:
      'Added as an alternative for users who want flexible serving control in beverages and prefer a tincture-like format over capsules.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['Can interact with anticoagulants and antiplatelet medications.', 'May aggravate reflux in sensitive users.'],
    bestFor: ['fast-acting', 'flexible dosing'],
    avoidIf: ['sensitive to alcohol extracts'],
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    entityType: 'herb',
    entitySlug: 'turmeric',
    productId: 'turmeric-ginger-herbal-tea',
    productTitle: 'Turmeric Ginger Herbal Tea',
    brand: 'Traditional Medicinals',
    amazonUrl: 'https://www.amazon.com/dp/B00GZ9Q0Q2',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'tea bags',
    rationaleShort: 'Tea option for gentle routine integration and taste-forward adherence.',
    rationaleLong:
      'Included as a beverage-based alternative for users who want culinary-style turmeric exposure and easier daily ritual adherence without capsules.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-04-03',
    confidenceTierRequired: 'low',
    cautionNotes: ['Can interact with anticoagulants and antiplatelet medications.', 'May aggravate reflux in sensitive users.'],
    bestFor: ['tea ritual', 'daily use'],
    avoidIf: ['need concentrated curcumin dose'],
    featured: false,
    active: true,
    sortOrder: 3,
  },
  {
    entityType: 'herb',
    entitySlug: 'chamomile',
    productId: 'chamomile-organic-tea-bags',
    productTitle: 'Organic Chamomile Herbal Tea Bags',
    brand: 'Traditional Medicinals',
    amazonUrl: 'https://www.amazon.com/dp/B0009F3POO',
    affiliateTagStrategy: 'append_default_tag',
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'tea bags',
    rationaleShort: 'Simple single-herb preparation with low-friction entry format.',
    rationaleLong:
      'Chosen for transparent ingredient labeling and routine-friendly preparation. Tea-bag format supports gradual introduction and easier stop/start observation during self-tracking.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-03-24',
    confidenceTierRequired: 'low',
    cautionNotes: ['Potential ragweed-family cross-reactivity in sensitive users.'],
    bestFor: ['sleep support', 'tea ritual'],
    avoidIf: ['ragweed allergy'],
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
    affiliateDisclosure: STANDARD_AFFILIATE_DISCLOSURE,
    productType: 'compound-focused capsules',
    rationaleShort: 'Formulation emphasizes labeled luteolin delivery per serving.',
    rationaleLong:
      'Included because the product discloses a clear luteolin amount and standardized delivery format, helping reduce ambiguity common in blended polyphenol products.',
    researchStatus: 'approved',
    reviewedBy: 'THS Editorial Review Desk',
    reviewedAt: '2026-03-26',
    confidenceTierRequired: 'low',
    cautionNotes: ['Polyphenol supplements can interact with anticoagulants in some users.'],
    bestFor: ['daily use', 'compound-focused'],
    avoidIf: ['on blood thinners'],
    featured: true,
    active: true,
    sortOrder: 1,
  },
]
