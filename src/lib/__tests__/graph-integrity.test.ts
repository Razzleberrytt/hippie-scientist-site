import { describe, it, expect } from 'vitest'
import { validateGraphIntegrity } from '../../../lib/graph-integrity'
import type { GraphRuntime } from '../../types/graph'

describe('validateGraphIntegrity', () => {
  it('identifies a perfectly valid graph', () => {
    const mockGraph: GraphRuntime = {
      nodes: [
        { id: '1', slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb', evidence_tier: 'Strong Human Evidence' },
        { id: '2', slug: 'l-theanine', name: 'L-Theanine', type: 'compound', evidence_tier: 'Moderate Human Evidence' },
      ],
      relationships: [
        { id: 'rel1', source: 'ashwagandha', target: 'l-theanine', type: 'pathway-overlap', weight: 5, rationale: 'Test' },
      ],
    }

    const report = validateGraphIntegrity(mockGraph)
    expect(report.valid).toBe(true)
    expect(report.errors).toHaveLength(0)
    expect(report.stats.nodeCount).toBe(2)
    expect(report.stats.relationshipCount).toBe(1)
  })

  it('detects missing node fields and duplicate slugs', () => {
    const mockGraph: GraphRuntime = {
      nodes: [
        { id: '', slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb' },
        { id: '2', slug: 'ashwagandha', name: 'Duplicate Slug', type: 'herb' },
        { id: '3', slug: 'l-theanine', name: '', type: 'compound' },
      ] as any,
    }

    const report = validateGraphIntegrity(mockGraph)
    expect(report.valid).toBe(false)
    expect(report.errors.some(e => e.code === 'MISSING_NODE_ID')).toBe(true)
    expect(report.errors.some(e => e.code === 'DUPLICATE_NODE_SLUG')).toBe(true)
    expect(report.errors.some(e => e.code === 'MISSING_NODE_NAME')).toBe(true)
  })

  it('detects dangling relationship sources and targets', () => {
    const mockGraph: GraphRuntime = {
      nodes: [
        { id: '1', slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb' },
      ],
      relationships: [
        { id: 'rel1', source: 'ashwagandha', target: 'nonexistent', type: 'pathway-overlap', weight: 5, rationale: 'Test' },
        { id: 'rel2', source: 'nonexistent-source', target: 'ashwagandha', type: 'pathway-overlap', weight: 5, rationale: 'Test' },
      ],
    }

    const report = validateGraphIntegrity(mockGraph)
    expect(report.valid).toBe(false)
    expect(report.errors.some(e => e.code === 'DANGLING_RELATIONSHIP_TARGET')).toBe(true)
    expect(report.errors.some(e => e.code === 'DANGLING_RELATIONSHIP_SOURCE')).toBe(true)
  })

  it('flags self-referential relationships', () => {
    const mockGraph: GraphRuntime = {
      nodes: [
        { id: '1', slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb' },
      ],
      relationships: [
        { id: 'rel1', source: 'ashwagandha', target: 'ashwagandha', type: 'pathway-overlap', weight: 5, rationale: 'Test' },
      ],
    }

    const report = validateGraphIntegrity(mockGraph)
    expect(report.valid).toBe(true)
    expect(report.warnings.some(e => e.code === 'SELF_REFERENTIAL_RELATIONSHIP')).toBe(true)
  })
})
