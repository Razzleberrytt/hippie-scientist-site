import { describe, it, expect } from 'vitest'
import {
  getMechanismOverlap,
  getEffectOverlap,
  getSafetyConflicts,
  scoreRelationshipStrength,
  getRelatedEntities,
  getAlternatives,
} from '../../../lib/semantic-relationship-engine'
import type { GraphRuntime } from '../../types/graph'

describe('semantic-relationship-engine', () => {
  const mockGraph: GraphRuntime = {
    nodes: [
      {
        id: '1',
        slug: 'ashwagandha',
        name: 'Ashwagandha',
        type: 'herb',
        mechanisms: ['GABA Activation', 'Cortisol Reduction'],
        effects: ['Anxiolytic', 'Stress Reduction'],
        safety_flags: ['pregnancy-avoid'],
      },
      {
        id: '2',
        slug: 'rhodiola',
        name: 'Rhodiola',
        type: 'herb',
        mechanisms: ['Cortisol Reduction', 'Monoamine Modulation'],
        effects: ['Stress Reduction', 'Fatigue Reduction'],
        safety_flags: ['pregnancy-avoid'],
      },
      {
        id: '3',
        slug: 'l-theanine',
        name: 'L-Theanine',
        type: 'compound',
        mechanisms: ['GABA Activation'],
        effects: ['Anxiolytic'],
      },
    ],
  }

  it('computes mechanism, effect, and safety overlap', () => {
    const mech = getMechanismOverlap('ashwagandha', 'rhodiola', mockGraph)
    expect(mech).toContain('Cortisol Reduction')

    const eff = getEffectOverlap('ashwagandha', 'rhodiola', mockGraph)
    expect(eff).toContain('Stress Reduction')

    const safety = getSafetyConflicts('ashwagandha', 'rhodiola', mockGraph)
    expect(safety).toContain('pregnancy-avoid')
  })

  it('scores relationship strength and returns reasons', () => {
    const rel = scoreRelationshipStrength('ashwagandha', 'rhodiola', mockGraph)
    expect(rel.score).toBeGreaterThan(0.3)
    expect(rel.reasons.some(r => r.includes('Shared type category'))).toBe(true)
    expect(rel.reasons.some(r => r.includes('Overlapping mechanisms'))).toBe(true)
    expect(rel.reasons.some(r => r.includes('Shared safety'))).toBe(true)
  })

  it('retrieves related entities and alternatives', () => {
    const related = getRelatedEntities('ashwagandha', mockGraph)
    expect(related).toHaveLength(2)
    expect(related[0].relatedSlug).toBe('rhodiola')

    const alts = getAlternatives('ashwagandha', mockGraph)
    expect(alts).toHaveLength(1)
    expect(alts[0].relatedSlug).toBe('rhodiola')
  })
})
