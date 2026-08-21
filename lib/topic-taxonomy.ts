export type TopicCluster = {
  slug: string
  label: string
  href: string
  description: string
  systems: string[]
  keywords: string[]
  profileIntent?: {
    ifYouWant: string
    goTo: string
    href: string
  }
}

/**
 * Canonical topic/goal vocabulary for navigation and ecosystem relationships.
 *
 * These are routing/organization labels only. A keyword match must never be
 * presented as evidence that an ingredient treats the corresponding condition.
 */
export const topicClusters: readonly TopicCluster[] = [
  {
    slug: 'inflammation',
    label: 'Inflammation',
    href: '/learn/inflammation',
    description: 'Immune signaling, cytokine language, recovery, mobility, and oxidative-stress relationships.',
    systems: ['Immune tone', 'Cytokines', 'Recovery'],
    keywords: ['inflammation', 'inflammatory', 'cytokine', 'immune', 'joint', 'recovery'],
  },
  {
    slug: 'cognition',
    label: 'Cognition',
    href: '/guides/focus',
    description: 'Attention, memory, mental clarity, fatigue resistance, and neurotransmitter-adjacent research.',
    systems: ['Attention', 'Memory', 'Neurotransmitters'],
    keywords: ['cognition', 'cognitive', 'focus', 'memory', 'attention', 'nootropic', 'clarity', 'adhd', 'concentration'],
    profileIntent: { ifYouWant: 'sharper focus', goTo: 'Focus guides', href: '/guides/focus/' },
  },
  {
    slug: 'metabolism',
    label: 'Metabolism',
    href: '/guides/best/supplements-for-fat-loss',
    description: 'Energy balance, glucose context, body-composition research, and metabolic resilience signals.',
    systems: ['Energy balance', 'Glucose context', 'Body composition'],
    keywords: ['metabolism', 'metabolic', 'glucose', 'insulin', 'fat', 'weight'],
  },
  {
    slug: 'stress-response',
    label: 'Stress response',
    href: '/guides/best/supplements-for-stress',
    description: 'HPA-axis language, adaptation, calm, sleep overlap, and nervous-system resilience.',
    systems: ['HPA axis', 'Adaptation', 'Calm'],
    keywords: ['stress', 'cortisol', 'adaptogen', 'anxiety', 'calm', 'relaxation', 'relax', 'anxiolytic', 'gaba'],
    profileIntent: { ifYouWant: 'help with anxiety or stress', goTo: 'Anxiety & stress guides', href: '/guides/anxiety/' },
  },
  {
    slug: 'longevity',
    label: 'Longevity',
    href: '/guides/sleep',
    description: 'Aging-adjacent research themes including repair, oxidative stress, metabolism, and resilience.',
    systems: ['Repair', 'Resilience', 'Healthy aging'],
    keywords: ['longevity', 'aging', 'cellular', 'repair', 'resilience'],
  },
  {
    slug: 'mitochondrial-function',
    label: 'Mitochondrial function',
    href: '/guides/other/supplements-for-brain-fog-and-fatigue',
    description: 'Cellular energy, fatigue, exercise performance, and recovery-adjacent mechanism context.',
    systems: ['Cellular energy', 'Fatigue', 'Performance'],
    keywords: ['mitochondria', 'mitochondrial', 'atp', 'energy', 'fatigue', 'performance'],
  },
  {
    slug: 'oxidative-stress',
    label: 'Oxidative stress',
    href: '/learn/inflammation',
    description: 'Antioxidant response, redox balance, inflammation overlap, and tissue-stress research language.',
    systems: ['Redox balance', 'Antioxidant response', 'Tissue stress'],
    keywords: ['oxidative', 'antioxidant', 'redox', 'ros', 'free radical'],
  },
  {
    slug: 'sleep',
    label: 'Sleep',
    href: '/guides/sleep',
    description: 'Latency, sleep quality, relaxation, circadian context, and nighttime recovery overlap.',
    systems: ['Sleep quality', 'Circadian context', 'Relaxation'],
    keywords: ['sleep', 'circadian', 'melatonin', 'night', 'insomnia', 'sedative', 'rest'],
    profileIntent: { ifYouWant: 'help sleeping', goTo: 'Sleep guides', href: '/guides/sleep/' },
  },
  {
    slug: 'neurobiology',
    label: 'Neurobiology',
    href: '/learn/dopamine',
    description: 'Neurotransmitter systems, mood-adjacent signals, cognition, calm, and arousal regulation.',
    systems: ['Dopamine', 'GABA', 'Arousal'],
    keywords: ['neuro', 'dopamine', 'gaba', 'serotonin', 'brain', 'mood'],
  },
  {
    slug: 'cardiovascular-function',
    label: 'Cardiovascular function',
    href: '/guides/best/supplements-for-blood-pressure',
    description: 'Blood-pressure context, vascular tone, circulation, metabolic overlap, and endothelial themes.',
    systems: ['Vascular tone', 'Circulation', 'Blood pressure'],
    keywords: ['cardio', 'vascular', 'blood pressure', 'circulation', 'heart', 'endothelial'],
  },
]

function normalizeSignals(signals: string[]): string {
  return signals.join(' ').toLowerCase().replace(/\s+/g, ' ').trim()
}

export function matchTopicClusters(signals: string[]): TopicCluster[] {
  const haystack = normalizeSignals(signals)
  if (!haystack) return []
  return topicClusters.filter((cluster) =>
    cluster.keywords.some((keyword) => haystack.includes(keyword)) ||
    haystack.includes(cluster.label.toLowerCase())
  )
}

export function getProfileIntentRoutes(signals: string[]) {
  const seen = new Set<string>()
  return matchTopicClusters(signals)
    .flatMap((cluster) => cluster.profileIntent ? [cluster.profileIntent] : [])
    .filter((route) => {
      if (seen.has(route.href)) return false
      seen.add(route.href)
      return true
    })
}
