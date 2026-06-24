import { herbProducts, type HerbProduct } from '@/data/herbProducts'

const herbProductsBySlug = new Map(
  herbProducts.map(entry => [entry.herbSlug.trim().toLowerCase(), entry.products]),
)

export function getHerbProducts(herbSlug: string | null | undefined): HerbProduct[] {
  const normalizedSlug = String(herbSlug || '')
    .trim()
    .toLowerCase()

  if (!normalizedSlug) return []

  return herbProductsBySlug.get(normalizedSlug) || []
}
