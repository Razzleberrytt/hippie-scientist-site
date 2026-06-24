import { describe, it, expect } from 'vitest'
import { getEvidenceConfidence } from '../../../lib/evidence-confidence'
import type { GraphNode } from '../../types/graph'

describe('evidence-confidence', () => {
  it('correctly scores Strong Human Evidence', () => {
    const node: GraphNode = {
      id: '1',
      slug: 'ashwagandha',
      name: 'Ashwagandha',
      type: 'herb',
      evidence_tier: 'Strong Human Evidence',
    }

    const conf = getEvidenceConfidence(node)
    expect(conf.evidenceWeight).toBe(0.95)
    expect(conf.confidenceLabel).toBe('High Confidence')
    expect(conf.humanEvidenceFlag).toBe(true)
    expect(conf.downgradeReasons).toHaveLength(0)
  })

  it('correctly scores and downgrades Mechanistic Evidence', () => {
    const node: GraphNode = {
      id: '2',
      slug: 'resveratrol',
      name: 'Resveratrol',
      type: 'compound',
      evidence_tier: 'Mechanistic Evidence',
    }

    const conf = getEvidenceConfidence(node)
    expect(conf.evidenceWeight).toBe(0.4)
    expect(conf.confidenceLabel).toBe('Preclinical/Mechanistic')
    expect(conf.humanEvidenceFlag).toBe(false)
    expect(conf.downgradeReasons).toContain('Lacks direct human clinical validation.')
  })

  it('applies sparse profile penalty', () => {
    const node: GraphNode = {
      id: '3',
      slug: 'rare-herb',
      name: 'Rare Herb',
      type: 'herb',
      evidence_tier: 'Moderate Human Evidence',
      sparse_profile: true,
    }

    const conf = getEvidenceConfidence(node)
    expect(conf.evidenceWeight).toBe(0.6) // 0.8 - 0.2
    expect(conf.downgradeReasons).toContain('Sparse data profile restricts comprehensive assessment.')
  })
})
