export const AMAZON_AFFILIATE_TRACKING_ID = 'razzleberry02-20'

export type ProductForm = 'capsule' | 'powder' | 'tea' | 'tincture'

export type ReviewedHerbProduct = {
  herbSlug: string
  herbName: string
  label: string
  form: ProductForm
  asin: string
  note?: string
}

// Manual-only list of reviewed products. Add entries here after ASIN review.
export const reviewedHerbProducts: ReviewedHerbProduct[] = [
  // Example entry shape:
  // {
  //   herbSlug: 'ashwagandha',
  //   herbName: 'Ashwagandha',
  //   label: 'Product label',
  //   form: 'capsule',
  //   asin: 'B000000000',
  //   note: 'Optional short note.',
  // },
]

export function getReviewedProductsForHerb(herbSlug: string): ReviewedHerbProduct[] {
  const normalizedSlug = herbSlug.trim().toLowerCase()
  return reviewedHerbProducts.filter(product => product.herbSlug === normalizedSlug).slice(0, 2)
}
