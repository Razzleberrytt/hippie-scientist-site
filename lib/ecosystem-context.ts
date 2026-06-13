import type { EcosystemPanel, GraphLink } from '@/components/semantic-hubs/semantic-hub-sections'

export type TopicCluster = {
  slug: string
  label: string
  href: string
  description: string
  systems: string[]
  keywords: string[]
}

export const topicClusters: TopicCluster[] = [
  {
    slug: 'inflammation',
    label: 'Inflammation',
    href: '/education/inflammation',
    description: 'Immune signaling, cytokine language, recovery, mobility, and oxidative-stress relationships.',
    systems: ['Immune tone', 'Cytokines', 'Recovery'],
    keywords: ['inflammation', 'inflammatory', 'cytokine', 'immune', 'joint', 'recovery'],
  },
  {
    slug: 'cognition',
    label: 'Cognition',
    href: '/goals/focus',
    description: 'Attention, memory, mental clarity, fatigue resistance, and neurotransmitter-adjacent research.',
    systems: ['Attention', 'Memory', 'Neurotransmitters'],
    keywords: ['cognition', 'focus', 'memory', 'attention', 'nootropic', 'clarity'],
  },
  {
    slug: 'metabolism',
    label: 'Metabolism',
    href: '/best-supplements-for-fat-loss',
    description: 'Energy balance, glucose context, body-composition research, and metabolic resilience signals.',
    systems: ['Energy balance', 'Glucose context', 'Body composition'],
    keywords: ['metabolism', 'metabolic', 'glucose', 'insulin', 'fat', 'weight'],
  },
  {
    slug: 'stress-response',
    label: 'Stress response',
    href: '/best-supplements-for-stress',
    description: 'HPA-axis language, adaptation, calm, sleep overlap, and nervous-system resilience.',
    systems: ['HPA axis', 'Adaptation', 'Calm'],
    keywords: ['stress', 'cortisol', 'adaptogen', 'anxiety', 'calm', 'relaxation'],
  },
  {
    slug: 'longevity',
    label: 'Longevity',
    href: '/goals/recovery',
    description: 'Aging-adjacent research themes including repair, oxidative stress, metabolism, and resilience.',
    systems: ['Repair', 'Resilience', 'Healthy aging'],
    keywords: ['longevity', 'aging', 'cellular', 'repair', 'resilience'],
  },
  {
    slug: 'mitochondrial-function',
    label: 'Mitochondrial function',
    href: '/performance-supplements',
    description: 'Cellular energy, fatigue, exercise performance, and recovery-adjacent mechanism context.',
    systems: ['Cellular energy', 'Fatigue', 'Performance'],
    keywords: ['mitochondria', 'mitochondrial', 'atp', 'energy', 'fatigue', 'performance'],
  },
  {
    slug: 'oxidative-stress',
    label: 'Oxidative stress',
    href: '/education/inflammation',
    description: 'Antioxidant response, redox balance, inflammation overlap, and tissue-stress research language.',
    systems: ['Redox balance', 'Antioxidant response', 'Tissue stress'],
    keywords: ['oxidative', 'antioxidant', 'redox', 'ros', 'free radical'],
  },
  {
    slug: 'sleep',
    label: 'Sleep',
    href: '/goals/sleep',
    description: 'Latency, sleep quality, relaxation, circadian context, and nighttime recovery overlap.',
    systems: ['Sleep quality', 'Circadian context', 'Relaxation'],
    keywords: ['sleep', 'circadian', 'melatonin', 'night', 'insomnia'],
  },
  {
    slug: 'neurobiology',
    label: 'Neurobiology',
    href: '/education/dopamine',
    description: 'Neurotransmitter systems, mood-adjacent signals, cognition, calm, and arousal regulation.',
    systems: ['Dopamine', 'GABA', 'Arousal'],
    keywords: ['neuro', 'dopamine', 'gaba', 'serotonin', 'brain', 'mood'],
  },
  {
    slug: 'cardiovascular-function',
    label: 'Cardiovascular function',
    href: '/best-supplements-for-blood-pressure',
    description: 'Blood-pressure context, vascular tone, circulation, metabolic overlap, and endothelial themes.',
    systems: ['Vascular tone', 'Circulation', 'Blood pressure'],
    keywords: ['cardio', 'vascular', 'blood pressure', 'circulation', 'heart', 'endothelial'],
  },
]

export function getTopicClusterLinks(limit = 10): GraphLink[] {
  return topicClusters.slice(0, limit).map((cluster) => ({
    label: cluster.label,
    href: cluster.href,
    description: cluster.description,
  }))
}

export function getEcosystemPanels(signals: string[], limit = 6): EcosystemPanel[] {
  const haystack = signals.join(' ').toLowerCase()
  const matches = topicClusters.filter((cluster) =>
    cluster.keywords.some((keyword) => haystack.includes(keyword)) ||
    haystack.includes(cluster.label.toLowerCase())
  )

  const selected = (matches.length ? matches : topicClusters).slice(0, limit)

  return selected.map((cluster) => ({
    eyebrow: 'Related scientific theme',
    title: cluster.label,
    body: cluster.description,
    href: cluster.href,
    signals: cluster.systems,
  }))
}

export function getAdjacentEcosystemPanels(signals: string[], limit = 4): EcosystemPanel[] {
  return getEcosystemPanels(signals, limit).map((panel) => ({
    ...panel,
    eyebrow: 'Research adjacency',
  }))
}
