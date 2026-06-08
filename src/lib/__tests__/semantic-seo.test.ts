import { describe, it, expect } from 'vitest'
import {
  getRelatedPageSuggestions,
  getInternalLinkCandidates,
  getMechanismHubCandidates,
  getEffectHubCandidates,
  getGoalHubCandidates,
} from '../../../lib/semantic-seo'
import type { GraphRuntime } from '../../types/graph'

describe('semantic-seo', () => {
  const mockGraph: GraphRuntime = {
    nodes: [
      {
        id: '1',
        slug: 'ashwagandha',
        name: 'Ashwagandha',
        type: 'herb',
        mechanisms: ['Cortisol Reduction'],
        effects: ['Anxiolytic'],
        topics: ['Anxiety'],
        aliases: ['Withania Somnifera'],
      },
      {
        id: '2',
        slug: 'rhodiola',
        name: 'Rhodiola',
        type: 'herb',
        mechanisms: ['Cortisol Reduction'],
        effects: ['Adaptogen'],
        topics: ['Anxiety'],
      },
    ],
  }

  it('suggests related pages and comparison pages', () => {
    const pages = getRelatedPageSuggestions('ashwagandha', mockGraph)
    expect(pages.some(p => p.type === 'profile')).toBe(true)
    expect(pages.some(p => p.type === 'comparison')).toBe(true)
    expect(pages.some(p => p.type === 'goal-hub')).toBe(true)
  })

  it('finds internal link candidates in text context', () => {
    const text = 'I am taking some Ashwagandha for my stress levels.'
    const links = getInternalLinkCandidates(text, mockGraph)
    expect(links).toHaveLength(1)
    expect(links[0].targetSlug).toBe('ashwagandha')
    expect(links[0].href).toBe('/herbs/ashwagandha')
  })

  it('identifies mechanism, effect, and goal hub candidates', () => {
    const mechs = getMechanismHubCandidates(mockGraph)
    expect(mechs).toHaveLength(1)
    expect(mechs[0].name).toBe('Cortisol Reduction')
    expect(mechs[0].count).toBe(2)

    const goals = getGoalHubCandidates(mockGraph)
    expect(goals).toHaveLength(1)
    expect(goals[0].name).toBe('Anxiety')
    expect(goals[0].count).toBe(2)
  })
})
