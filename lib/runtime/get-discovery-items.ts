import {
  DISCOVERY_SUPERNODES,
  type DiscoverySupernode,
} from '@/lib/runtime/discovery-supernodes'

export type DiscoveryContext =
  | 'stress'
  | 'focus'
  | 'recovery'
  | 'adaptogen'
  | 'cognition'
  | 'psychoactive'
  | 'sleep'
  | 'default'

const CONTEXT_MAP: Record<DiscoveryContext, string[]> = {
  stress: [
    'Stress Physiology',
    'Recovery Neuroscience',
    'Recovery Protocols',
  ],
  focus: [
    'Focus Systems',
    'Cognition Systems',
    'Comparison Systems',
  ],
  recovery: [
    'Recovery Neuroscience',
    'Recovery Protocols',
    'Stress Physiology',
  ],
  adaptogen: [
    'Adaptogen Comparisons',
    'Stress Physiology',
    'Recovery Neuroscience',
  ],
  cognition: [
    'Cognition Systems',
    'Comparison Systems',
    'Focus Systems',
  ],
  psychoactive: [
    'Neuroscience Philosophy',
    'Comparison Systems',
  ],
  sleep: [
    'Recovery Protocols',
    'Recovery Neuroscience',
  ],
  default: [],
}

export function getDiscoveryItems(
  context: DiscoveryContext = 'default',
  limit = 4
): DiscoverySupernode[] {
  const categories = CONTEXT_MAP[context] || []

  const prioritized = DISCOVERY_SUPERNODES.filter(node =>
    categories.includes(node.category)
  )

  const fallback = DISCOVERY_SUPERNODES.filter(
    node => !prioritized.includes(node)
  )

  return [...prioritized, ...fallback].slice(0, limit)
}
