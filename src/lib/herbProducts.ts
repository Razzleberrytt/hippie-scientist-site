import type { Herb } from '@/types'
import {
  AMAZON_AFFILIATE_TRACKING_ID,
  herbProductCatalog,
  type ProductForm,
} from '@/data/herbProducts'

export type ProductRecommendation = {
  label: string
  form: ProductForm
  asin: string
  note: string
  url: string
}

const ASIN_PATTERN = /^[A-Z0-9]{10}$/

const PRODUCT_FORM_EXPLANATIONS: Record<ProductForm, string> = {
  capsule: 'Capsules are easy to use and help keep routines consistent.',
  powder: 'Powders are flexible for mixing into drinks and custom serving sizes.',
  tea: 'Tea preparations offer a gentle, ritual-friendly format.',
  'loose herb': 'Loose herbs are ideal for traditional tea and decoction preparation.',
}

function normalizeHerbName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function buildAmazonLink(asin: string): string {
  const normalizedAsin = asin.trim().toUpperCase()
  if (!ASIN_PATTERN.test(normalizedAsin)) return ''
  return `https://www.amazon.com/dp/${normalizedAsin}?tag=${AMAZON_AFFILIATE_TRACKING_ID}`
}

export function getProductFormExplanation(form: ProductForm): string {
  return (
    PRODUCT_FORM_EXPLANATIONS[form] ||
    'Choose the format that best matches your routine and tolerance.'
  )
}

export function getHerbProductRecommendations(herb: Herb): ProductRecommendation[] {
  const candidates = [herb.slug, herb.common, herb.name]
    .map(value => normalizeHerbName(String(value || '')))
    .filter(Boolean)

  if (!candidates.length) return []

  const match = herbProductCatalog.find(entry => {
    const normalized = normalizeHerbName(entry.herb)
    return candidates.includes(normalized)
  })

  if (!match) return []

  return match.products
    .map(product => ({
      label: product.label,
      form: product.form,
      asin: product.asin,
      note: product.note || getProductFormExplanation(product.form),
      url: buildAmazonLink(product.asin),
    }))
    .filter(item => item.label && item.form && item.url)
    .slice(0, 2)
}
