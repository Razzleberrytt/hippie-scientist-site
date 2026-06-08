import { getRevenueProductSet } from '@/config/revenue-products'
import type { RecommendationProduct } from '@/components/RecommendationSection'

export interface StackRecommendation {
  product: RecommendationProduct
  reason: string
  targetSlug: string
}

const STACKS: Record<string, Array<{ slug: string; reason: string }>> = {
  ashwagandha: [
    { slug: 'l-theanine', reason: 'Dual cortisol + alpha-wave calm pathway' },
    { slug: 'magnesium', reason: 'Supports the stress-to-sleep transition' },
    { slug: 'rhodiola', reason: 'Complete adaptogen stack for stress resilience' },
  ],
  magnesium: [
    { slug: 'l-theanine', reason: 'Alpha-wave relaxation synergy for sleep' },
    { slug: 'glycine', reason: 'Combined sleep-onset support' },
    { slug: 'melatonin', reason: 'Circadian rhythm + sleep quality combo' },
  ],
  'l-theanine': [
    { slug: 'ashwagandha', reason: 'Cortisol + alpha-wave calm — paired adaptogen' },
    { slug: 'magnesium', reason: 'Relaxation mineral plus amino acid pairing' },
    { slug: 'glycine', reason: 'Sleep support amino acid stack' },
  ],
  rhodiola: [
    { slug: 'ashwagandha', reason: 'Yin-yang adaptogen pairing (energy vs. grounding)' },
    { slug: 'vitamin-b12', reason: 'Energy metabolism support from both angles' },
    { slug: 'coenzyme-q10', reason: 'Mitochondrial energy enhancement stack' },
  ],
  'lions-mane': [
    { slug: 'omega-3', reason: 'NGF + DHA brain health dual approach' },
    { slug: 'bacopa', reason: 'Neurogenesis + memory formation pairing' },
    { slug: 'coenzyme-q10', reason: 'Mitochondrial + neural energy combination' },
  ],
  valerian: [
    { slug: 'magnesium', reason: 'Relaxation mineral + herb for deeper sleep' },
    { slug: 'passionflower', reason: 'Complementary GABA-pathway herbs' },
    { slug: 'melatonin', reason: 'Sleep timing + relaxation depth combination' },
  ],
  passionflower: [
    { slug: 'magnesium', reason: 'GABA pathway + relaxation mineral' },
    { slug: 'l-theanine', reason: 'Anxiety reduction from two pathways' },
    { slug: 'valerian', reason: 'Complementary calming herb stack' },
  ],
  melatonin: [
    { slug: 'magnesium', reason: 'Sleep quality + circadian timing together' },
    { slug: 'glycine', reason: 'Body temperature + sleep onset support' },
    { slug: 'l-theanine', reason: 'Wind-down + timing combination' },
  ],
  bacopa: [
    { slug: 'lions-mane', reason: 'Memory formation + neurogenesis stack' },
    { slug: 'omega-3', reason: 'DHA + bacosides cognitive pairing' },
    { slug: 'ginkgo-biloba', reason: 'Cerebral circulation + neurotransmitter support' },
  ],
  'ginkgo-biloba': [
    { slug: 'bacopa', reason: 'Cerebral blood flow + memory encoding stack' },
    { slug: 'omega-3', reason: 'Vascular + structural brain support' },
    { slug: 'vitamin-b12', reason: 'Nerve function + circulation combination' },
  ],
  'omega-3': [
    { slug: 'vitamin-d', reason: 'Fat-soluble nutrient absorption co-factor' },
    { slug: 'coenzyme-q10', reason: 'Mitochondrial + structural brain health' },
    { slug: 'vitamin-k2', reason: 'Cardiovascular health synergy' },
  ],
  'vitamin-d': [
    { slug: 'vitamin-k2', reason: 'K2 directs calcium where D3 raises it' },
    { slug: 'magnesium', reason: 'Magnesium is required to activate vitamin D' },
    { slug: 'omega-3', reason: 'Fat-soluble absorption + anti-inflammatory pairing' },
  ],
  'coenzyme-q10': [
    { slug: 'omega-3', reason: 'Cardiovascular + mitochondrial dual support' },
    { slug: 'vitamin-d', reason: 'Fat-soluble co-absorption pair' },
    { slug: 'vitamin-b12', reason: 'Energy metabolism from both pathways' },
  ],
  turmeric: [
    { slug: 'omega-3', reason: 'Anti-inflammatory synergy across pathways' },
    { slug: 'quercetin', reason: 'Polyphenol anti-inflammatory stack' },
    { slug: 'vitamin-c', reason: 'Antioxidant combination for inflammation' },
  ],
  'milk-thistle': [
    { slug: 'nac', reason: 'Glutathione + silymarin liver support stack' },
    { slug: 'alpha-lipoic-acid', reason: 'Regenerates antioxidants alongside silymarin' },
    { slug: 'vitamin-c', reason: 'Water-soluble antioxidant complement' },
  ],
  nac: [
    { slug: 'milk-thistle', reason: 'Dual liver + glutathione support' },
    { slug: 'alpha-lipoic-acid', reason: 'Master antioxidant recycling stack' },
    { slug: 'glycine', reason: 'Precursors for glutathione synthesis' },
  ],
  elderberry: [
    { slug: 'vitamin-c', reason: 'Immune activation from two directions' },
    { slug: 'zinc', reason: 'Classic immune support triple combination' },
    { slug: 'vitamin-d', reason: 'Innate + adaptive immune support pairing' },
  ],
  zinc: [
    { slug: 'vitamin-c', reason: 'Classic immune duo for acute support' },
    { slug: 'vitamin-d', reason: 'Immune regulation combination' },
    { slug: 'vitamin-b12', reason: 'Cell formation and immune function pair' },
  ],
  'vitamin-c': [
    { slug: 'zinc', reason: 'Classic immune support combination' },
    { slug: 'quercetin', reason: 'Polyphenol absorption enhancer + antioxidant' },
    { slug: 'elderberry', reason: 'Immune activation triple stack' },
  ],
  '5-htp': [
    { slug: 'sam-e', reason: 'Serotonin + methylation mood support' },
    { slug: 'vitamin-b6', reason: 'B6 is the cofactor to convert 5-HTP to serotonin' },
    { slug: 'magnesium', reason: 'Mood-mineral baseline to support 5-HTP' },
  ],
  'sam-e': [
    { slug: '5-htp', reason: 'Methylation + serotonin precursor pairing' },
    { slug: 'vitamin-b6', reason: 'Methylation cycle cofactor support' },
    { slug: 'vitamin-b12', reason: 'SAMe recycling and methylation stack' },
  ],
  resveratrol: [
    { slug: 'coenzyme-q10', reason: 'Sirtuin activation + mitochondrial function' },
    { slug: 'quercetin', reason: 'Polyphenol longevity synergy stack' },
    { slug: 'omega-3', reason: 'Anti-inflammatory longevity combination' },
  ],
  berberine: [
    { slug: 'alpha-lipoic-acid', reason: 'Metabolic glucose support stack' },
    { slug: 'quercetin', reason: 'AMPK activation + anti-inflammatory pair' },
    { slug: 'vitamin-d', reason: 'Insulin sensitivity support combination' },
  ],
  creatine: [
    { slug: 'vitamin-b12', reason: 'Cell energy metabolism on two fronts' },
    { slug: 'glutamine', reason: 'Muscle recovery and synthesis stack' },
    { slug: 'omega-3', reason: 'Anti-inflammatory recovery combination' },
  ],
  maca: [
    { slug: 'ashwagandha', reason: 'Complementary adaptogen energy stack' },
    { slug: 'zinc', reason: 'Reproductive and hormonal support pairing' },
    { slug: 'vitamin-d', reason: 'Hormonal production foundational pair' },
  ],
  'vitamin-k2': [
    { slug: 'vitamin-d', reason: 'D3 raises calcium; K2 directs it correctly' },
    { slug: 'magnesium', reason: 'Three-way bone and cardiovascular stack' },
    { slug: 'omega-3', reason: 'Vascular calcification protection pairing' },
  ],
  probiotics: [
    { slug: 'glutamine', reason: 'Gut lining + microbiome combination' },
    { slug: 'inositol', reason: 'Gut-brain axis support stack' },
    { slug: 'ginger', reason: 'Digestive motility + microbiome pairing' },
  ],
  glycine: [
    { slug: 'magnesium', reason: 'Sleep amino acid + relaxation mineral' },
    { slug: 'melatonin', reason: 'Body temperature + circadian timing stack' },
    { slug: 'nac', reason: 'Glutathione precursor combination' },
  ],
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

export function getStackRecommendations(slug: string, limit = 3): StackRecommendation[] {
  const stackDefs = STACKS[slug] || []
  const result: StackRecommendation[] = []

  for (const def of stackDefs) {
    if (result.length >= limit) break
    const productSet = getRevenueProductSet(def.slug)
    if (!productSet) continue
    const product = productSet.products.find(p => p.slot === 'overall') ?? productSet.products[0]
    if (product) {
      result.push({
        product: { ...product, notes: def.reason, trackingLocation: 'stack-recommendation' },
        reason: def.reason,
        targetSlug: def.slug,
      })
    }
  }

  return result
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
