import { describe, expect, it } from 'vitest'
import { deriveInteractionData } from './build-interaction-data.mjs'

describe('deriveInteractionData', () => {
  it('produces no tags or edges when no rows have contraindication flags', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: '' },
      { slug: 'herb-b', name: 'Herb B' },
    ])

    expect(data.tags).toEqual([])
    expect(data.edges).toEqual([])
    expect(data.edgesBySlug).toEqual({})
    expect(data.tagsBySlug).toEqual({})
  })

  it('tags an additive mechanism (e.g. serotonergic) from matching keyword text', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'May interact with SSRIs' },
    ])

    expect(data.tags).toHaveLength(1)
    expect(data.tags[0]).toMatchObject({
      entity_slug: 'herb-a',
      risk_mechanism: 'serotonergic',
      pair_behavior: 'additive',
      confidence: 'high',
    })
  })

  it('tags a non-additive mechanism (e.g. renal) as single_only and excludes it from edge generation', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'Kidney disease caution' },
      { slug: 'herb-b', name: 'Herb B', contraindications_or_flags: 'Kidney disease caution' },
    ])

    expect(data.tags).toHaveLength(2)
    expect(data.tags.every((t) => t.pair_behavior === 'single_only')).toBe(true)
    expect(data.edges).toEqual([])
  })

  it('matches keywords case-insensitively', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'MAY CAUSE SEDATION' },
    ])

    expect(data.tags[0].risk_mechanism).toBe('cns_sedation')
  })

  it('splits multiple semicolon/comma-separated flags into separate matched phrases', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'may interact with SSRIs; kidney disease caution' },
    ])

    expect(data.tags).toHaveLength(2)
    expect(data.tags.map((t) => t.risk_mechanism).sort()).toEqual(['renal', 'serotonergic'])
  })

  it('creates a bidirectional additive-risk edge between two entities sharing the same mechanism', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'interacts with SSRIs' },
      { slug: 'herb-b', name: 'Herb B', contraindications_or_flags: 'serotonin syndrome risk' },
    ])

    expect(data.edges).toHaveLength(1)
    const edge = data.edges[0]
    expect(edge.source_slug).toBe('herb-a')
    expect(edge.target_slug).toBe('herb-b')
    expect(edge.risk_mechanism).toBe('serotonergic')
    expect(edge.severity).toBe('severe')
    expect(edge.weight_or_strength).toBe(90)
    expect(edge.claim_language).toContain('Herb A')
    expect(edge.claim_language).toContain('Herb B')

    expect(data.edgesBySlug['herb-a']).toHaveLength(1)
    expect(data.edgesBySlug['herb-a'][0].partner_slug).toBe('herb-b')
    expect(data.edgesBySlug['herb-b']).toHaveLength(1)
    expect(data.edgesBySlug['herb-b'][0].partner_slug).toBe('herb-a')
  })

  it('does not create an edge between entities that share only a single_only mechanism', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'kidney disease caution' },
      { slug: 'herb-b', name: 'Herb B', contraindications_or_flags: 'kidney disease caution' },
    ])

    expect(data.edges).toEqual([])
    expect(data.edgesBySlug).toEqual({})
  })

  it('generates one edge per pair when three or more entities share an additive mechanism', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'interacts with SSRIs' },
      { slug: 'herb-b', name: 'Herb B', contraindications_or_flags: 'serotonin syndrome risk' },
      { slug: 'herb-c', name: 'Herb C', contraindications_or_flags: 'MAOI interaction risk' },
    ])

    expect(data.edges).toHaveLength(3)
    const pairs = data.edges.map((e) => `${e.source_slug}-${e.target_slug}`).sort()
    expect(pairs).toEqual(['herb-a-herb-b', 'herb-a-herb-c', 'herb-b-herb-c'])
  })

  it('notes a shared second mechanism between two entities that overlap on more than one additive flag', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'interacts with SSRIs; may cause sedation' },
      { slug: 'herb-b', name: 'Herb B', contraindications_or_flags: 'serotonin syndrome risk; CNS depression risk' },
    ])

    expect(data.edges).toHaveLength(2)
    for (const edge of data.edges) {
      expect(edge.notes).toMatch(/pair also shares:/)
    }
  })

  it('deduplicates an identical (slug, mechanism, behavior, phrase) tuple', () => {
    const data = deriveInteractionData([
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'interacts with SSRIs, interacts with SSRIs' },
    ])

    expect(data.tags).toHaveLength(1)
  })

  it('ignores rows with no contraindications_or_flags field at all', () => {
    const data = deriveInteractionData([{ slug: 'herb-a', name: 'Herb A' }])
    expect(data.tags).toEqual([])
  })

  it('sorts edges by source slug, then target slug, then mechanism', () => {
    const data = deriveInteractionData([
      { slug: 'herb-c', name: 'Herb C', contraindications_or_flags: 'interacts with SSRIs' },
      { slug: 'herb-a', name: 'Herb A', contraindications_or_flags: 'serotonin syndrome risk' },
      { slug: 'herb-b', name: 'Herb B', contraindications_or_flags: 'MAOI interaction risk' },
    ])

    const pairs = data.edges.map((e) => `${e.source_slug}-${e.target_slug}`)
    expect(pairs).toEqual(['herb-a-herb-b', 'herb-a-herb-c', 'herb-b-herb-c'])
  })
})
