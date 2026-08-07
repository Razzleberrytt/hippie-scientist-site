import { describe, expect, it } from 'vitest'
import { buildComparisonShortlist, evidenceTier } from '@/lib/comparison-shortlist'
import type { RelatedBotanicalRecord } from '@/lib/related-botanicals'

const herb = (slug: string, overrides: Partial<RelatedBotanicalRecord> = {}): RelatedBotanicalRecord => ({
  slug,
  name: slug,
  effects: ['calming'],
  explicitEffects: ['calming'],
  compounds: [],
  compoundClasses: [],
  evidence: 'Moderate',
  intensity: 'Mild',
  safety: [],
  ...overrides,
})

describe('comparison shortlist', () => {
  it('normalizes evidence tiers', () => {
    expect(evidenceTier('Strong')).toBe(3)
    expect(evidenceTier('Moderate')).toBe(2)
    expect(evidenceTier('Limited')).toBe(1)
    expect(evidenceTier('Unclassified')).toBe(0)
  })

  it('excludes already-built comparisons and deduplicates reversed pairs', () => {
    const rows = buildComparisonShortlist([
      herb('ashwagandha'),
      herb('rhodiola'),
      herb('lemon-balm'),
    ], 20)

    expect(rows.some((row) => new Set([row.a.slug, row.b.slug]).has('ashwagandha') && new Set([row.a.slug, row.b.slug]).has('rhodiola'))).toBe(false)
    const lemonPairs = rows.filter((row) => row.a.slug === 'lemon-balm' || row.b.slug === 'lemon-balm')
    const keys = lemonPairs.map((row) => [row.a.slug, row.b.slug].sort().join('::'))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('prioritizes chemistry-supported, better-evidenced candidates', () => {
    const source = herb('source', { evidence: 'Strong', compoundClasses: ['alkaloid'] })
    const chemistry = herb('chemistry', { evidence: 'Strong', compoundClasses: ['alkaloid'] })
    const effectOnly = herb('effect-only', { evidence: 'Limited' })

    const rows = buildComparisonShortlist([source, chemistry, effectOnly], 20)
    const chemistryPair = rows.find((row) => [row.a.slug, row.b.slug].includes('source') && [row.a.slug, row.b.slug].includes('chemistry'))
    const effectPair = rows.find((row) => [row.a.slug, row.b.slug].includes('source') && [row.a.slug, row.b.slug].includes('effect-only'))

    expect(chemistryPair).toBeTruthy()
    expect(effectPair).toBeTruthy()
    expect(chemistryPair!.chemistrySupported).toBe(true)
    expect(chemistryPair!.priorityScore).toBeGreaterThan(effectPair!.priorityScore)
  })
})
