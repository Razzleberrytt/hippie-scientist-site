import { AFFILIATE_TAGS } from './affiliate'
import type { RecommendationProduct } from '@/components/RecommendationSection'

export type RevenueProductSet = {
  slug: string
  title: string
  products: RecommendationProduct[]
}

function amazonUrl(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAGS.amazon}`
}

function amazonAsinUrl(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAGS.amazon}`
}

function amazonProductUrl({ asin, query }: { asin?: string; query: string }) {
  return asin ? amazonAsinUrl(asin) : amazonUrl(query)
}

export const revenueProductSets: Record<string, RevenueProductSet> = {
  ashwagandha: {
    slug: 'ashwagandha',
    title: 'Ashwagandha product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Ashwagandha 450 mg',
        rationale: 'Budget pick for a simple ashwagandha capsule from a widely available supplement brand.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Ashwagandha 450 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow KSM-66 Ashwagandha',
        rationale: 'Best overall pick for users who want a clearly standardized KSM-66 ashwagandha extract.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas KSM-66 Ashwagandha' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Stress Balance',
        rationale: 'Premium pick for users who prioritize practitioner-style branding and broader stress-support context.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne ashwagandha stress balance' }),
      },
    ],
  },
  magnesium: {
    slug: 'magnesium',
    title: 'Magnesium product picks',
    products: [
      {
        slot: 'budget',
        brand: "Doctor's Best",
        title: "Doctor's Best High Absorption Magnesium",
        rationale: 'Budget pick for chelated magnesium with clear elemental magnesium labeling.',
        affiliateUrl: amazonProductUrl({ query: "Doctor's Best High Absorption Magnesium lysinate glycinate" }),
      },
      {
        slot: 'overall',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Magnesium Glycinate',
        rationale: 'Best overall pick for a cleaner glycinate-style magnesium product.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Magnesium Glycinate' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Magnesium Bisglycinate',
        rationale: 'Premium pick for users who prefer powder format and a practitioner-oriented brand.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Magnesium Bisglycinate powder' }),
      },
    ],
  },
  'l-theanine': {
    slug: 'l-theanine',
    title: 'L-Theanine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW L-Theanine 200 mg',
        rationale: 'Budget pick for plain L-theanine capsules without a complex calming blend.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods L-Theanine 200 mg' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Theanine 200 mg',
        rationale: 'Best overall pick for a simple 200 mg L-theanine capsule format.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Theanine 200 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Sports Research',
        title: 'Sports Research Suntheanine L-Theanine',
        rationale: 'Premium pick for users who want a Suntheanine-labeled theanine product.',
        affiliateUrl: amazonProductUrl({ query: 'Sports Research Suntheanine L-Theanine 200 mg' }),
      },
    ],
  },
  rhodiola: {
    slug: 'rhodiola',
    title: 'Rhodiola product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Rhodiola 500 mg',
        rationale: 'Budget pick for a common Rhodiola rosea capsule from a mainstream brand.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Rhodiola 500 mg' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Rhodiola Rosea',
        rationale: 'Best overall pick for users who want a recognizable botanical brand and liquid phyto-caps format.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Rhodiola Rosea' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Rhodiola',
        rationale: 'Premium pick for users prioritizing brand quality signals and transparent standardized extract positioning.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Rhodiola' }),
      },
    ],
  },
  'lions-mane': {
    slug: 'lions-mane',
    title: "Lion's Mane product picks",
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: "NOW Lion's Mane",
        rationale: "Budget pick for a widely available lion's mane capsule.",
        affiliateUrl: amazonProductUrl({ query: "NOW Lion's Mane mushroom supplement" }),
      },
      {
        slot: 'overall',
        brand: 'Real Mushrooms',
        title: "Real Mushrooms Lion's Mane",
        rationale: 'Best overall pick for fruiting-body-forward labeling and mushroom-category transparency.',
        affiliateUrl: amazonProductUrl({ query: "Real Mushrooms Lion's Mane" }),
      },
      {
        slot: 'premium',
        brand: 'Host Defense',
        title: "Host Defense Lion's Mane",
        rationale: 'Premium pick for users who prefer a well-known mushroom-specialist brand.',
        affiliateUrl: amazonProductUrl({ query: "Host Defense Lion's Mane capsules" }),
      },
    ],
  },
}

const revenueProductAliases: Record<string, string> = {
  'ashwagandha-root': 'ashwagandha',
  'ashwagandha-root-extract': 'ashwagandha',
  'ashwagandha-extract-ksm-66': 'ashwagandha',
  'magnesium-glycinate': 'magnesium',
  'magnesium-citrate': 'magnesium',
  'magnesium-threonate': 'magnesium',
  theanine: 'l-theanine',
  'l-theanine-sleep': 'l-theanine',
  rhodiola: 'rhodiola',
  'rhodiola-rosea': 'rhodiola',
  'rhodiola-extract-shr5': 'rhodiola',
  'lions-mane': 'lions-mane',
  'lion-s-mane': 'lions-mane',
  lionmane: 'lions-mane',
}

export function getRevenueProductSet(slug: string): RevenueProductSet | null {
  const normalized = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  const key = revenueProductAliases[normalized] || normalized
  return revenueProductSets[key] ?? null
}

export const revenueProductPlaceholders = revenueProductSets
export const getRevenueProductPlaceholders = getRevenueProductSet
