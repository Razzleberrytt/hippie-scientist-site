import { AFFILIATE_TAGS } from '@/config/affiliate'

export type ProductPick = {
  compound_slug: string
  name: string
  brand: string
  type: 'top' | 'budget' | 'premium'
  url: string
  notes: string
}

export const productPicks: ProductPick[] = [
  {
    compound_slug: 'turmeric',
    name: 'Curcumin C3 Complex',
    brand: 'Sports Research',
    type: 'top',
    url: `https://www.amazon.com/dp/B00X4QMZXS?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'High bioavailability with black pepper extract'
  },
  {
    compound_slug: 'turmeric',
    name: 'NatureWise Curcumin',
    brand: 'NatureWise',
    type: 'budget',
    url: `https://www.amazon.com/dp/B00ZAU8F0Y?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Affordable and widely used'
  },
  {
    compound_slug: 'turmeric',
    name: 'Thorne Meriva 500-SF',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/dp/B0797BBP3C?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Clinically studied formulation'
  }
]
