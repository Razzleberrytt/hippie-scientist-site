import { productPicks } from '@/data/product-picks'

export function getProductPicks(slug: string) {
  return productPicks.filter(p => p.compound_slug === slug)
}

export function groupProductPicks(picks: any[]) {
  return {
    top: picks.find(p => p.type === 'top'),
    budget: picks.find(p => p.type === 'budget'),
    premium: picks.find(p => p.type === 'premium')
  }
}
