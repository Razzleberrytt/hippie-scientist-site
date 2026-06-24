export type ComparisonTopic = {
  slug: string
  title: string
  left: string
  right: string
  intent: string
  pathways: string[]
}

export const comparisonTopics: ComparisonTopic[] = [
  {
    slug: 'ashwagandha-vs-rhodiola',
    title: 'Ashwagandha vs Rhodiola',
    left: 'ashwagandha',
    right: 'rhodiola',
    intent: 'Adaptogen comparison for stress adaptation, resilience, and energy context.',
    pathways: ['stress', 'adaptogens', 'fatigue', 'cognition'],
  },
  {
    slug: 'magnesium-vs-l-theanine',
    title: 'Magnesium vs L-Theanine',
    left: 'magnesium',
    right: 'l-theanine',
    intent: 'Comparison of calming, sleep, and relaxation-related pathways.',
    pathways: ['sleep', 'calm', 'gaba', 'relaxation'],
  },
  {
    slug: 'kava-vs-valerian',
    title: 'Kava vs Valerian',
    left: 'kava',
    right: 'valerian',
    intent: 'Sedation, calming, and sleep-oriented botanical comparison.',
    pathways: ['sleep', 'gaba', 'calm', 'stress'],
  },
]

export function getComparisonTopic(slug: string) {
  return comparisonTopics.find((topic) => topic.slug === slug)
}
