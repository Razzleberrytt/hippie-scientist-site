import { productPicks } from '@/data/product-picks'
import { isRestrictedIngredient } from '@/src/lib/restricted-ingredients'

type RuntimeRecord = Record<string, unknown>

export function getProductPicks(slug: string) {
  if (isRestrictedIngredient(slug)) return []
  return productPicks.filter(p => p.compound_slug === slug)
}

export function groupProductPicks(picks: RuntimeRecord[]) {
  return {
    top: picks.find(p => p.type === 'top'),
    budget: picks.find(p => p.type === 'budget'),
    premium: picks.find(p => p.type === 'premium')
  }
}
