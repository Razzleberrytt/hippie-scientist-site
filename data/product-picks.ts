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
    url: 'https://www.amazon.com/dp/B00X4QMZXS?tag=razzleberry02-20',
    notes: 'High bioavailability with black pepper extract'
  },
  {
    compound_slug: 'turmeric',
    name: 'NatureWise Curcumin',
    brand: 'NatureWise',
    type: 'budget',
    url: 'https://www.amazon.com/dp/B00ZAU8F0Y?tag=razzleberry02-20',
    notes: 'Affordable and widely used'
  },
  {
    compound_slug: 'turmeric',
    name: 'Thorne Meriva 500-SF',
    brand: 'Thorne',
    type: 'premium',
    url: 'https://www.amazon.com/dp/B0797BBP3C?tag=razzleberry02-20',
    notes: 'Clinically studied formulation'
  }
]
