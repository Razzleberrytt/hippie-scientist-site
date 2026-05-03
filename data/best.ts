export type BestPageConfig = {
  slug: string
  title: string
  description: string
  compoundCandidates: string[]
}

export const bestPages: BestPageConfig[] = [
  {
    slug: 'sleep',
    title: 'Best Supplements for Sleep',
    description: 'Start with practical sleep-support options, then compare timing, safety, and fit before choosing.',
    compoundCandidates: ['melatonin', 'magnesium', 'l-theanine', 'theanine', 'glycine'],
  },
  {
    slug: 'stress',
    title: 'Best Supplements for Stress',
    description: 'Compare calming and adaptogen-style options without treating every stress supplement as interchangeable.',
    compoundCandidates: ['ashwagandha', 'l-theanine', 'theanine', 'rhodiola-rosea', 'magnesium'],
  },
  {
    slug: 'focus',
    title: 'Best Supplements for Focus',
    description: 'Use this guide for attention, alertness, and cleaner stimulation decisions.',
    compoundCandidates: ['caffeine', 'l-theanine', 'theanine', 'alpha-gpc', 'citicoline', 'cdp-choline', 'l-tyrosine'],
  },
  {
    slug: 'fat-loss',
    title: 'Best Supplements for Fat Loss',
    description: 'Evidence-aware support for energy, appetite, thermogenesis, and metabolic context.',
    compoundCandidates: ['caffeine', 'green-tea-extract-egcg', 'green-tea-extract', 'capsaicin', 'berberine', 'psyllium-husk'],
  },
  {
    slug: 'energy',
    title: 'Best Supplements for Energy',
    description: 'Compare energy-support options by stimulation level, timing, and practical use.',
    compoundCandidates: ['caffeine', 'creatine', 'l-tyrosine', 'rhodiola-rosea', 'citicoline'],
  },
  {
    slug: 'gut-health',
    title: 'Best Supplements for Gut Health',
    description: 'Start with gut-support options that are practical, simple, and easier to evaluate.',
    compoundCandidates: ['psyllium-husk', 'glycine', 'berberine', 'magnesium'],
  },
]
