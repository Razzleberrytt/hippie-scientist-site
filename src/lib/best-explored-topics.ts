export type BestExploredTopic = {
  slug: string
  title: string
  description: string
  keywords: string[]
  intent: 'sleep' | 'focus' | 'stress' | 'inflammation' | 'recovery'
}

export const bestExploredTopics: BestExploredTopic[] = [
  {
    slug: 'sleep',
    title: 'Best explored for sleep support',
    description: 'Evidence-informed exploration of calming, circadian, and recovery-oriented profiles connected to sleep quality pathways.',
    keywords: ['sleep', 'gaba', 'relaxation', 'calm', 'circadian', 'recovery'],
    intent: 'sleep',
  },
  {
    slug: 'focus',
    title: 'Best explored for cognitive support',
    description: 'Profiles connected to focus, memory, neuroplasticity, and cognitive performance ecosystems.',
    keywords: ['focus', 'cognition', 'memory', 'dopamine', 'attention', 'neuroplasticity'],
    intent: 'focus',
  },
  {
    slug: 'stress',
    title: 'Best explored for stress adaptation',
    description: 'Adaptogenic, calming, and resilience-oriented profiles connected to stress response ecosystems.',
    keywords: ['stress', 'adaptogen', 'cortisol', 'resilience', 'calm'],
    intent: 'stress',
  },
  {
    slug: 'inflammation',
    title: 'Best explored for inflammation pathways',
    description: 'Evidence-informed exploration of oxidative stress, inflammatory signaling, and recovery-oriented ecosystems.',
    keywords: ['inflammation', 'oxidative', 'immune', 'recovery', 'pain'],
    intent: 'inflammation',
  },
]

export function getBestExploredTopic(slug: string) {
  return bestExploredTopics.find((topic) => topic.slug === slug)
}
