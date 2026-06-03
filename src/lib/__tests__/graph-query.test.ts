import { describe, it, expect } from 'vitest'
import {
  getNodesByPathway,
  getNodesByMechanism,
  getNodesByTopic,
  getCompareGroup,
  getNHopNeighbors,
} from '../../../lib/graph-query'
import type { GraphRuntime } from '../../types/graph'

describe('graph-query', () => {
  const mockGraph: GraphRuntime = {
    nodes: [
      { id: '1', slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb', pathways: ['GABA'], mechanisms: ['NF-kB Modulation'], topics: ['Anxiety'] },
      { id: '2', slug: 'l-theanine', name: 'L-Theanine', type: 'compound', pathways: ['GABA', 'Glutamate'], mechanisms: ['NF-kB Modulation'], topics: ['Anxiety', 'Sleep'] },
      { id: '3', slug: 'caffeine', name: 'Caffeine', type: 'compound', pathways: ['Adenosine'], mechanisms: ['CNS Stimulation'], topics: ['Energy'] },
    ],
    relationships: [
      { id: 'rel1', source: 'ashwagandha', target: 'l-theanine', type: 'pathway-overlap', weight: 5, rationale: 'Test' },
      { id: 'rel2', source: 'l-theanine', target: 'caffeine', type: 'semantic-comparison', weight: 3, rationale: 'Test' },
    ],
  }

  it('filters nodes by pathway, mechanism, or topic', () => {
    const byPathway = getNodesByPathway('GABA', mockGraph)
    expect(byPathway).toHaveLength(2)

    const byMech = getNodesByMechanism('NF-kB Modulation', mockGraph)
    expect(byMech).toHaveLength(2)

    const byTopic = getNodesByTopic('Sleep', mockGraph)
    expect(byTopic).toHaveLength(1)
    expect(byTopic[0].slug).toBe('l-theanine')
  })

  it('generates a compare group with shared overlaps', () => {
    const group = getCompareGroup(['ashwagandha', 'l-theanine'], mockGraph)
    expect(group.nodes).toHaveLength(2)
    expect(group.sharedPathways).toContain('GABA')
    expect(group.sharedMechanisms).toContain('NF-kB Modulation')
    expect(group.sharedTopics).toContain('Anxiety')
  })

  it('computes N-hop neighbors correctly', () => {
    // 1-hop neighbors of ashwagandha is l-theanine
    const hop1 = getNHopNeighbors('ashwagandha', 1, mockGraph)
    expect(hop1).toHaveLength(1)
    expect(hop1[0].slug).toBe('l-theanine')

    // 2-hop neighbors of ashwagandha should contain l-theanine and caffeine
    const hop2 = getNHopNeighbors('ashwagandha', 2, mockGraph)
    expect(hop2).toHaveLength(2)
    expect(hop2.map(n => n.slug)).toContain('caffeine')
  })
})
