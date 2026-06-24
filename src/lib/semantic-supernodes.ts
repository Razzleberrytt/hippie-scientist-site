export type SemanticSupernode = {
  slug: string
  title: string
  description: string
  keywords: string[]
  category: 'neurobiology' | 'stress' | 'metabolism' | 'inflammation' | 'sleep'
}

export const semanticSupernodes: SemanticSupernode[] = [
  {
    slug: 'gaba-systems',
    title: 'GABA systems',
    description: 'A semantic authority hub for herbs and compounds connected to calming, relaxation, sleep, and GABA-adjacent pathways.',
    keywords: ['gaba', 'calm', 'relaxation', 'sleep', 'anxiety', 'sedation'],
    category: 'neurobiology',
  },
  {
    slug: 'dopamine-systems',
    title: 'Dopamine systems',
    description: 'A pathway-centered hub for motivation, reward, attention, mood, and dopamine-adjacent research profiles.',
    keywords: ['dopamine', 'focus', 'motivation', 'reward', 'attention', 'mood'],
    category: 'neurobiology',
  },
  {
    slug: 'adaptogen-ecosystems',
    title: 'Adaptogen ecosystems',
    description: 'A stress-response hub for adaptogens, resilience pathways, fatigue context, and HPA-axis-adjacent profiles.',
    keywords: ['adaptogen', 'stress', 'cortisol', 'hpa', 'fatigue', 'resilience'],
    category: 'stress',
  },
  {
    slug: 'mitochondrial-ecosystems',
    title: 'Mitochondrial ecosystems',
    description: 'A metabolic authority hub for energy production, mitochondrial support, oxidative stress, and cellular resilience.',
    keywords: ['mitochondria', 'energy', 'metabolism', 'oxidative', 'cellular', 'atp'],
    category: 'metabolism',
  },
  {
    slug: 'neuroinflammation-ecosystems',
    title: 'Neuroinflammation ecosystems',
    description: 'A semantic research hub connecting inflammatory signaling, oxidative stress, cognition, recovery, and nervous-system context.',
    keywords: ['neuroinflammation', 'inflammation', 'oxidative', 'immune', 'cognition', 'recovery'],
    category: 'inflammation',
  },
  {
    slug: 'sleep-recovery-ecosystems',
    title: 'Sleep recovery ecosystems',
    description: 'A sleep-centered supernode for calming pathways, recovery systems, circadian context, and restoration-oriented profiles.',
    keywords: ['sleep', 'recovery', 'circadian', 'restoration', 'relaxation', 'gaba'],
    category: 'sleep',
  },
]

export function getSemanticSupernode(slug: string) {
  return semanticSupernodes.find((node) => node.slug === slug)
}
