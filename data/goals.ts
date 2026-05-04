export type GoalConfig = {
  slug: string
  title: string
  summary: string
  stackSlugs: string[]
  compoundCandidates: string[]
  comparisonSlugs: string[]
  safetyNote: string
}

export const goalConfigs: GoalConfig[] = [
  {
    slug: 'sleep',
    title: 'Sleep Support',
    summary: 'Wind down faster and improve sleep quality with evidence-aware options.',
    stackSlugs: ['sleep'],
    compoundCandidates: ['melatonin','l-theanine','magnesium','glycine','apigenin','valerian-root','lemon-balm'],
    comparisonSlugs: ['melatonin-vs-l-theanine'],
    safetyNote: 'Watch for grogginess and sedative interactions.'
  },
  {
    slug: 'anxiety',
    title: 'Anxiety & Calm',
    summary: 'Calming compounds with safety and interaction context.',
    stackSlugs: ['stress','sleep'],
    compoundCandidates: ['l-theanine','magnesium','glycine','ashwagandha','lemon-balm','passionflower','kava'],
    comparisonSlugs: ['caffeine-vs-theanine'],
    safetyNote: 'Avoid mixing with sedatives or alcohol.'
  },
  {
    slug: 'focus',
    title: 'Focus & Energy',
    summary: 'Attention and performance optimization with clean stimulation.',
    stackSlugs: ['cognition'],
    compoundCandidates: ['caffeine','l-theanine','alpha-gpc','citicoline','tyrosine','rhodiola','creatine'],
    comparisonSlugs: ['caffeine-vs-theanine'],
    safetyNote: 'Stimulants can affect sleep and anxiety.'
  },
  {
    slug: 'fat-loss',
    title: 'Fat Loss',
    summary: 'Support metabolism, appetite, and energy safely.',
    stackSlugs: ['fat-loss'],
    compoundCandidates: ['caffeine','green-tea-extract','capsaicin','berberine','psyllium'],
    comparisonSlugs: [],
    safetyNote: 'Avoid stimulant-heavy stacks if sensitive.'
  },
  {
    slug: 'recovery',
    title: 'Recovery',
    summary: 'Muscle recovery and performance support.',
    stackSlugs: ['recovery'],
    compoundCandidates: ['creatine','protein','collagen','omega-3','magnesium'],
    comparisonSlugs: ['creatine-vs-whey'],
    safetyNote: 'Consider kidney and hydration status.'
  }
]
