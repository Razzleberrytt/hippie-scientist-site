import { describe, expect, it } from 'vitest'
import { attachSharedClusterContext, type InternalLinkGroup } from '../runtime-related-maps'
import { getDiscoveryLinkContext } from '../../../components/ui/RelatedDiscoveryGroups'

describe('related discovery context', () => {
  it('attaches only clusters present on both the source and target', () => {
    const groups: InternalLinkGroup[] = [
      {
        title: 'Related Compounds',
        links: [
          {
            href: '/compounds/l-theanine',
            label: 'L-Theanine',
            score: 24,
            type: 'compound',
            clusters: ['anxiety', 'sleep', 'focus'],
          },
        ],
      },
    ]

    const [group] = attachSharedClusterContext(groups, ['sleep', 'stress'])
    expect(group.links[0].sharedClusters).toEqual(['sleep'])
  })

  it('does not invent shared-topic context for a fallback target with no overlap', () => {
    const groups: InternalLinkGroup[] = [
      {
        title: 'Related Guides',
        links: [
          {
            href: '/guides/focus',
            label: 'Focus guides',
            score: 1,
            type: 'guide',
            clusters: ['focus'],
          },
        ],
      },
    ]

    const [group] = attachSharedClusterContext(groups, ['sleep'])
    expect(group.links[0].sharedClusters).toEqual([])
    expect(getDiscoveryLinkContext(group.links[0])).toBeNull()
  })

  it('renders human-readable shared-topic context when overlap is proven', () => {
    expect(getDiscoveryLinkContext({
      href: '/herbs/ashwagandha',
      label: 'Ashwagandha',
      sharedClusters: ['metabolic-health', 'stress'],
    })).toBe('Shared topic: Metabolic Health + Stress')
  })

  it('uses useful route context for comparisons even without shared-cluster metadata', () => {
    expect(getDiscoveryLinkContext({
      href: '/compare/ashwagandha-vs-rhodiola',
      label: 'Ashwagandha vs Rhodiola',
    })).toBe('Side-by-side comparison')
  })

  it('uses safety context without claiming a topical overlap', () => {
    expect(getDiscoveryLinkContext({
      href: '/safety-checker',
      label: 'Safety Checker',
      type: 'safety',
    })).toBe('Safety context')
  })
})
