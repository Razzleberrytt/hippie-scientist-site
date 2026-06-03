export type SeoCollection = {
  slug: string
  title: string
  description: string
  itemType: 'herb' | 'compound'
  filters: {
    effectsAny?: string[]
  }
}

export const seoCollections: SeoCollection[] = [
  {
    slug: 'stress-support-herbs',
    title: 'Stress Support Herbs',
    description: 'Herbs with workbook-linked summaries related to stress, calm, relaxation, and adaptive resilience.',
    itemType: 'herb',
    filters: {
      effectsAny: ['stress', 'calm', 'relax', 'anxiety', 'adaptogen']
    }
  },
  {
    slug: 'sleep-support-herbs',
    title: 'Sleep Support Herbs',
    description: 'Herbs with workbook-linked summaries related to sleep quality, relaxation, and nighttime support.',
    itemType: 'herb',
    filters: {
      effectsAny: ['sleep', 'sedative', 'relax', 'gaba']
    }
  },
  {
    slug: 'cognition-compounds',
    title: 'Cognition Compounds',
    description: 'Compounds with workbook-linked summaries related to cognition, focus, memory, and attention.',
    itemType: 'compound',
    filters: {
      effectsAny: ['cognition', 'focus', 'memory', 'attention', 'cholinergic']
    }
  }
]
