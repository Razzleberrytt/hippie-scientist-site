import {
  DISCOVERY_SUPERNODES,
  type DiscoverySupernode,
} from '@/lib/runtime/discovery-supernodes'

import type { DiscoveryContext } from '@/lib/runtime/get-discovery-items'

const CATEGORY_PRIORITIES: Record<DiscoveryContext, string[]> = {
  stress: ['Stress Physiology', 'Recovery Neuroscience'],
  focus: ['Focus Systems', 'Cognition Systems'],
  recovery: ['Recovery Protocols', 'Recovery Neuroscience'],
  adaptogen: ['Adaptogen Comparisons', 'Stress Physiology'],
  cognition: ['Cognition Systems', 'Comparison Systems'],
  psychoactive: ['Neuroscience Philosophy', 'Comparison Systems'],
  sleep: ['Recovery Protocols', 'Recovery Neuroscience'],
  default: [],
}

export function getDiverseDiscoveryItems(
  context: DiscoveryContext = 'default',
  limit = 5
): DiscoverySupernode[] {
  const priorities = CATEGORY_PRIORITIES[context] || []

  const prioritized = DISCOVERY_SUPERNODES.filter(node =>
    priorities.includes(node.category)
  )

  const remaining = DISCOVERY_SUPERNODES.filter(
    node => !prioritized.find(item => item.href === node.href)
  )

  const interleaved: DiscoverySupernode[] = []

  prioritized.forEach((item, index) => {
    interleaved.push(item)

    const secondary = remaining[index]

    if (
      secondary &&
      !interleaved.find(existing => existing.href === secondary.href)
    ) {
      interleaved.push(secondary)
    }
  })

  const fallback = [...interleaved]

  remaining.forEach(item => {
    if (!fallback.find(existing => existing.href === item.href)) {
      fallback.push(item)
    }
  })

  return fallback.slice(0, limit)
}
