import { describe, expect, it } from 'vitest'

import { generatePathwayDiagram } from '@/lib/generate-pathway'

const malformedSummaryPattern = /\s{2,}|\(\)|,\s*\./

describe('generatePathwayDiagram', () => {
  it('uses a non-empty fallback target when mechanisms exist without target systems', () => {
    const diagram = generatePathwayDiagram({
      slug: 'x',
      name: 'X',
      mechanisms: ['antioxidant'],
    })

    expect(diagram).not.toBeNull()
    expect(diagram?.summary).toContain('acts on biological target pathways via antioxidant')
    expect(diagram?.summary).not.toMatch(malformedSummaryPattern)
    expect(diagram?.summary).not.toContain('on  pathways')
  })

  it.each([
    {
      slug: 'missing-target',
      name: 'Missing Target',
      mechanisms: ['antioxidant'],
    },
    {
      slug: 'known-target',
      name: 'Known Target',
      mechanisms: ['antioxidant'],
      mechanism_target_systems: ['metabolic'],
      primary_effects: ['energy'],
    },
    {
      slug: 'freeform-target',
      name: 'Freeform Target',
      canonical_mechanisms: ['AMPK signaling'],
      mechanism_target_systems: ['cell signaling'],
    },
  ])('never emits malformed generated summary punctuation or spacing for $slug', (record) => {
    const diagram = generatePathwayDiagram(record)

    expect(diagram).not.toBeNull()
    expect(diagram?.summary).not.toMatch(malformedSummaryPattern)
  })
})
