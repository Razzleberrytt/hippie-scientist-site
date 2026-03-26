import type { Herb } from '@/types'
import {
  AMAZON_AFFILIATE_TRACKING_ID,
  getReviewedProductsForHerb,
  type ProductForm,
} from '@/data/herbProducts'

export type ProductRecommendation = {
  label: string
  form: ProductForm
  asin: string
  note?: string
  url: string
}

const AMAZON_BASE_URL = 'https://www.amazon.com/dp'
const ASIN_PATTERN = /^[A-Z0-9]{10}$/

const PRODUCT_FORM_EXPLANATIONS: Record<ProductForm, string> = {
  capsule: 'Capsules are easy to use and help keep routines consistent.',
  powder: 'Powders are flexible for mixing into drinks and custom serving sizes.',
  tea: 'Tea preparations offer a gentle, ritual-friendly format.',
  tincture: 'Tinctures are concentrated liquid extracts in small-volume servings.',
}

export function buildAmazonAffiliateUrl(asin: string): string {
  const normalizedAsin = asin.trim().toUpperCase()
  if (!ASIN_PATTERN.test(normalizedAsin)) return ''
  return `${AMAZON_BASE_URL}/${normalizedAsin}?tag=${AMAZON_AFFILIATE_TRACKING_ID}`
}

export function getProductFormExplanation(form: ProductForm): string {
  return (
    PRODUCT_FORM_EXPLANATIONS[form] ||
    'Choose the format that best matches your routine and tolerance.'
  )
}

export function getHerbProductRecommendations(herb: Herb): ProductRecommendation[] {
  const slug = String(herb.slug || '')
    .trim()
    .toLowerCase()
  if (!slug) return []

  return getReviewedProductsForHerb(slug)
    .map(product => ({
      label: product.label,
      form: product.form,
      asin: product.asin,
      note: product.note,
      url: buildAmazonAffiliateUrl(product.asin),
    }))
    .filter(item => item.label && item.form && item.url)
    .slice(0, 2)
}
