import type { Herb } from '@/types'

type ProductRecommendation = {
  label: string
  type: string
  url: string
}

const PRODUCT_TYPE_EXPLANATIONS: Record<string, string> = {
  powder:
    'Powder is flexible for teas and smoothies, and works well when you want adjustable serving sizes.',
  capsule: 'Capsules are simple for consistent routines and avoid taste-related friction.',
  tincture:
    'Tinctures are concentrated liquid extracts that are convenient for smaller-volume use.',
  tea: 'Tea formats are easy to dose gently and fit calming, ritual-style use.',
  extract:
    'Extracts concentrate target constituents and can be useful when lower volume is preferred.',
}

const DEFAULT_PRODUCT_TYPES = ['powder', 'capsule']

function parseTypesFromHerb(herb: Herb): string[] {
  const rawPreparations = [
    ...(Array.isArray(herb.preparations) ? herb.preparations : []),
    String(herb.preparation || ''),
  ]
    .join(' ')
    .toLowerCase()

  const normalized: string[] = []
  if (rawPreparations.includes('tincture')) normalized.push('tincture')
  if (rawPreparations.includes('capsule')) normalized.push('capsule')
  if (rawPreparations.includes('powder')) normalized.push('powder')
  if (rawPreparations.includes('tea')) normalized.push('tea')
  if (rawPreparations.includes('extract')) normalized.push('extract')

  return normalized.length > 0 ? normalized.slice(0, 2) : DEFAULT_PRODUCT_TYPES
}

export function getProductTypeExplanation(type: string): string {
  return (
    PRODUCT_TYPE_EXPLANATIONS[type.toLowerCase()] ||
    'This form can be practical depending on your routine, dose strategy, and sensory preferences.'
  )
}

export function getHerbProductRecommendations(herb: Herb): ProductRecommendation[] {
  const explicitRecommendations = Array.isArray(herb.productRecommendations)
    ? herb.productRecommendations
    : []

  if (explicitRecommendations.length > 0) {
    return explicitRecommendations
      .map(item => ({
        label: String(item.label || '').trim(),
        type: String(item.type || '')
          .trim()
          .toLowerCase(),
        url: String(item.url || '').trim(),
      }))
      .filter(item => item.label && item.type)
      .slice(0, 2)
  }

  const herbName = herb.common || herb.name || 'this herb'
  return parseTypesFromHerb(herb).map(type => ({
    label: `${herbName} ${type}`,
    type,
    url: '',
  }))
}
