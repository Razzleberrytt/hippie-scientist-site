import { describe, it, expect } from 'vitest'
import { getEntityLinks } from '../../../lib/graph-links'
import type { GraphRuntime } from '../../types/graph'

describe('getEntityLinks', () => {
  const mockGraph: GraphRuntime = {
    nodes: [
      { id: '1', slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb' },
      { id: '2', slug: 'l-theanine', name: 'L-Theanine', type: 'compound' },
    ],
    relationships: [
      { id: 'rel1', source: 'ashwagandha', target: 'l-theanine', type: 'pathway-overlap', weight: 5, rationale: 'Test' },
    ],
    topics: [],
    pathways: [],
    comparisons: [],
    stacks: [],
    supernodes: [],
  }

  it('returns empty lists if node does not exist', () => {
    const links = getEntityLinks('nonexistent', mockGraph)
    expect(links.node).toBeNull()
    expect(links.relationships).toHaveLength(0)
  })

  it('resolves links for a valid node', () => {
    const links = getEntityLinks('ashwagandha', mockGraph)
    expect(links.node).not.toBeNull()
    expect(links.node?.slug).toBe('ashwagandha')
    expect(links.relationships).toHaveLength(1)
  })
})
