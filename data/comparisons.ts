export type ComparisonConfig = {
  slug: string
  title: string
  summary: string
  a: {
    label: string
    candidates: string[]
  }
  b: {
    label: string
    candidates: string[]
  }
}

export const supplementComparisons: ComparisonConfig[] = [
  {
    slug: 'creatine-vs-whey',
    title: 'Creatine vs Whey Protein',
    summary: 'Creatine is usually the better choice for strength and repeat-output support, while whey is mainly a convenient protein source for hitting daily protein targets.',
    a: { label: 'Creatine', candidates: ['creatine', 'creatine-monohydrate', 'creatine-hcl'] },
    b: { label: 'Whey Protein', candidates: ['whey', 'whey-protein', 'protein-whey-isolate', 'whey-protein-isolate'] },
  },
  {
    slug: 'psyllium-vs-plant-sterols',
    title: 'Psyllium vs Plant Sterols',
    summary: 'Psyllium is a fiber-first option with gut and lipid relevance, while plant sterols are more directly positioned around cholesterol absorption support.',
    a: { label: 'Psyllium', candidates: ['psyllium', 'psyllium-husk'] },
    b: { label: 'Plant Sterols', candidates: ['plant-sterols', 'phytosterols'] },
  },
  {
    slug: 'berberine-vs-inositol',
    title: 'Berberine vs Inositol',
    summary: 'Berberine is usually framed around metabolic markers, while inositol is often compared for insulin signaling and hormone-related metabolic contexts.',
    a: { label: 'Berberine', candidates: ['berberine'] },
    b: { label: 'Inositol', candidates: ['inositol', 'myo-inositol', 'd-chiro-inositol'] },
  },
  {
    slug: 'melatonin-vs-l-theanine',
    title: 'Melatonin vs L-Theanine',
    summary: 'Melatonin is more about sleep timing, while L-theanine is more about calming without necessarily acting as a direct sleep-timing signal.',
    a: { label: 'Melatonin', candidates: ['melatonin'] },
    b: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
  },
  {
    slug: 'caffeine-vs-theanine',
    title: 'Caffeine vs L-Theanine',
    summary: 'Caffeine is the stronger alertness driver, while L-theanine is commonly paired with it to smooth stimulation and support calmer focus.',
    a: { label: 'Caffeine', candidates: ['caffeine'] },
    b: { label: 'L-Theanine', candidates: ['l-theanine', 'theanine'] },
  },
  {
    slug: 'glucosamine-vs-chondroitin',
    title: 'Glucosamine vs Chondroitin',
    summary: 'Glucosamine and chondroitin are usually compared for joint-support routines, with value depending heavily on evidence quality, dose, and user context.',
    a: { label: 'Glucosamine', candidates: ['glucosamine', 'glucosamine-sulfate', 'glucosamine-hcl'] },
    b: { label: 'Chondroitin', candidates: ['chondroitin', 'chondroitin-sulfate'] },
  },
]
