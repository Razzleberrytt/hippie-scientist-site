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
    summary: 'Start here if you want practical help with winding down, sleep timing, and nighttime supplement decisions.',
    stackSlugs: ['sleep'],
    compoundCandidates: ['melatonin','l-theanine','magnesium','glycine','apigenin','valerian-root','lemon-balm'],
    comparisonSlugs: ['melatonin-vs-l-theanine'],
    safetyNote: 'Sleep supplements can cause next-day grogginess and interactions. Review safety notes before use.'
  },
  {
    slug: 'anxiety',
    title: 'Anxiety & Calm',
    summary: 'Compare calming compounds with safety and interaction context.',
    stackSlugs: ['stress','sleep'],
    compoundCandidates: ['l-theanine','magnesium','glycine','ashwagandha','lemon-balm','passionflower','kava'],
    comparisonSlugs: ['caffeine-vs-theanine'],
    safetyNote: 'Calming supplements can interact with medications and alcohol.'
  },
  {
    slug: 'focus',
    title: 'Focus & Energy',
    summary: 'Use this path for attention and performance decisions.',
    stackSlugs: ['cognition'],
    compoundCandidates: ['caffeine','l-theanine','alpha-gpc','citicoline','tyrosine','rhodiola','creatine'],
    comparisonSlugs: ['caffeine-vs-theanine'],
    safetyNote: 'Stimulants can worsen anxiety and sleep issues.'
  }
]
