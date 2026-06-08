import { productPicks } from '@/data/product-picks'

type RuntimeRecord = Record<string, unknown>

export function getProductPicks(slug: string) {
  return productPicks.filter(p => p.compound_slug === slug)
}

export function groupProductPicks(picks: RuntimeRecord[]) {
  return {
    top: picks.find(p => p.type === 'top'),
    budget: picks.find(p => p.type === 'budget'),
    premium: picks.find(p => p.type === 'premium')
  }
}
