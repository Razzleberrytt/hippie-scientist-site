import { getRevenueProductSet } from '@/config/revenue-products'
import type { RecommendationProduct } from '@/components/RecommendationSection'

export interface StackRecommendation {
  product: RecommendationProduct
  reason: string
  targetSlug: string
}

// Product-backed stack recommendations are intentionally withheld.
// The previous implementation mixed editorial pairing claims with affiliate
// availability and included pairings that had not been systematically checked
// for interaction risk or direct combination evidence. Keep this function as a
// stable API for profile pages while the stack layer is rebuilt around an
// evidence + interaction review that is independent of monetization.
export function getStackRecommendations(_slug: string, _limit = 3): StackRecommendation[] {
  return []
}

const ALTERNATIVES: Record<string, Array<{ slug: string; reason: string }>> = {
  ashwagandha: [
    { slug: 'rhodiola', reason: 'Energy-forward adaptogen — less sedating' },
    { slug: 'holy-basil', reason: 'Gentler stress adaptogen, broader traditional use' },
    { slug: 'maca', reason: 'Hormone-focused adaptogen alternative' },
  ],
  rhodiola: [
    { slug: 'ashwagandha', reason: 'Calming adaptogen — more sedation-friendly' },
    { slug: 'maca', reason: 'Stamina-focused alternative' },
  ],
  'l-theanine': [
    { slug: 'glycine', reason: 'Sleep-focused amino acid alternative' },
    { slug: 'inositol', reason: 'Mood-calming alternative with different mechanisms' },
  ],
  magnesium: [
    { slug: 'taurine', reason: 'Cardiovascular + nerve alternative mineral support' },
    { slug: 'glycine', reason: 'Sleep-support amino acid alternative' },
  ],
  'lions-mane': [
    { slug: 'bacopa', reason: 'Ayurvedic memory herb alternative' },
    { slug: 'ginkgo-biloba', reason: 'Circulation-focused cognitive alternative' },
  ],
  valerian: [
    { slug: 'passionflower', reason: 'Anxiolytic herb with GABA mechanism' },
    { slug: 'melatonin', reason: 'Hormone-based sleep timing alternative' },
  ],
  melatonin: [
    { slug: 'glycine', reason: 'Non-hormonal sleep quality alternative' },
    { slug: 'valerian', reason: 'Herbal relaxation alternative' },
  ],
  '5-htp': [
    { slug: 'sam-e', reason: 'Methylation-based mood support alternative' },
    { slug: 'inositol', reason: 'Second messenger mood support alternative' },
  ],
  'coenzyme-q10': [
    { slug: 'alpha-lipoic-acid', reason: 'Mitochondrial antioxidant alternative' },
  ],
  bacopa: [
    { slug: 'lions-mane', reason: 'Neurogenesis-focused cognitive alternative' },
    { slug: 'ginkgo-biloba', reason: 'Circulation-based cognitive alternative' },
  ],
  inositol: [
    { slug: '5-htp', reason: 'Serotonin-pathway mood support alternative' },
    { slug: 'magnesium', reason: 'Broadly calming mineral alternative' },
  ],
  taurine: [
    { slug: 'magnesium', reason: 'Relaxation and cardiovascular mineral alternative' },
    { slug: 'glycine', reason: 'Sleep-focused amino acid alternative' },
  ],
}

export function getAlternativeRecommendations(slug: string, limit = 2): StackRecommendation[] {
  const altDefs = ALTERNATIVES[slug] || []
  const result: StackRecommendation[] = []

  for (const def of altDefs) {
    if (result.length >= limit) break
    const productSet = getRevenueProductSet(def.slug)
    if (!productSet) continue
    const product = productSet.products.find(p => p.slot === 'overall') ?? productSet.products[0]
    if (product) {
      result.push({
        product: { ...product, notes: def.reason, trackingLocation: 'alternative-recommendation' },
        reason: def.reason,
        targetSlug: def.slug,
      })
    }
  }

  return result
}
