import { describe, it, expect } from 'vitest'
import { rankEntitiesForGoal } from '../../../lib/goal-matching-engine'
import type { GraphRuntime } from '../../types/graph'

describe('goal-matching-engine', () => {
  const mockGraph: GraphRuntime = {
    nodes: [
      {
        id: '1',
        slug: 'ashwagandha',
        name: 'Ashwagandha',
        type: 'herb',
        evidence_tier: 'Strong Human Evidence',
        best_for: 'Anxiety, Stress',
        topics: ['Anxiety'],
        summary: 'Ashwagandha is an adaptogen supporting cortisol reduction.',
      },
      {
        id: '2',
        slug: 'valerian',
        name: 'Valerian Root',
        type: 'herb',
        evidence_tier: 'Moderate Human Evidence',
        best_for: 'Sleep, Insomnia',
        topics: ['Sleep'],
        summary: 'Valerian root aids sleep and relaxation.',
      },
      {
        id: '3',
        slug: 'caffeine',
        name: 'Caffeine',
        type: 'compound',
        evidence_tier: 'Strong Human Evidence',
        best_for: 'Energy, Focus',
        topics: ['Stimulation'],
        summary: 'Caffeine improves focus and physical stamina.',
      },
    ],
  }

  it('ranks entities for goal matching synonyms', () => {
    const sleepMatches = rankEntitiesForGoal('sleep', mockGraph)
    expect(sleepMatches).toHaveLength(1)
    expect(sleepMatches[0].slug).toBe('valerian')
    expect(sleepMatches[0].score).toBeGreaterThan(0.3)
    expect(sleepMatches[0].confidence).toBe(0.75)
    expect(sleepMatches[0].reasons.some(r => r.includes('Sleep'))).toBe(true)

    const anxietyMatches = rankEntitiesForGoal('anxiety', mockGraph)
    expect(anxietyMatches.length).toBeGreaterThanOrEqual(1)
    expect(anxietyMatches[0].slug).toBe('ashwagandha')
    expect(anxietyMatches[0].confidence).toBe(0.9)
  })
})
