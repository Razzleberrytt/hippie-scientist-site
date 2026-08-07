import { describe, expect, it } from 'vitest'
import { buildComparisonShortlist, evidenceTier, isAliasPair, scoreComparisonIntent } from '@/lib/comparison-shortlist'
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

  it('filters scientific-name aliases and common-name to Latin-name duplicates', () => {
    const astragalus = herb('astragalus', { name: 'Astragalus', scientificName: 'Astragalus membranaceus' })
    const astragalusLatin = herb('astragalus-membranaceus', { name: 'Astragalus Membranaceus' })
    const phellodendron = herb('phellodendron', { name: 'Phellodendron', scientificName: 'Phellodendron amurense' })
    const phellodendronLatin = herb('phellodendron-amurense', { name: 'Phellodendron Amurense' })

    expect(isAliasPair(astragalus, astragalusLatin)).toBe(true)
    expect(isAliasPair(phellodendron, phellodendronLatin)).toBe(true)
  })

  it('filters genus-only rows against species rows even when scientific metadata is missing', () => {
    expect(isAliasPair(
      herb('berberis', { name: 'Berberis' }),
      herb('berberis-vulgaris', { name: 'Berberis Vulgaris' }),
    )).toBe(true)
    expect(isAliasPair(
      herb('boswellia', { name: 'Boswellia' }),
      herb('boswellia-carterii', { name: 'Boswellia Carterii' }),
    )).toBe(true)
    expect(isAliasPair(
      herb('coffee', { name: 'Coffee' }),
      herb('coffee-cherry', { name: 'Coffee Cherry' }),
    )).toBe(true)
  })

  it('does not collapse distinct multi-word botanicals just because they share a genus-like word', () => {
    expect(isAliasPair(
      herb('american-ginseng', { name: 'American Ginseng' }),
      herb('asian-ginseng', { name: 'Asian Ginseng' }),
    )).toBe(false)
    expect(isAliasPair(
      herb('lemon-balm', { name: 'Lemon Balm' }),
      herb('lemon-verbena', { name: 'Lemon Verbena' }),
    )).toBe(false)
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

  it('boosts shared user goals and penalizes chemistry-only editorial candidates', () => {
    const goalA = herb('goal-a', { explicitEffects: ['energy', 'focus'] })
    const goalB = herb('goal-b', { explicitEffects: ['energy', 'focus'] })
    const chemistryA = herb('chem-a', { explicitEffects: ['digestion'], compoundClasses: ['alkaloid'] })
    const chemistryB = herb('chem-b', { explicitEffects: ['circulation'], compoundClasses: ['alkaloid'] })

    const goalIntent = scoreComparisonIntent(goalA, goalB, false, ['energy', 'focus'])
    const chemistryIntent = scoreComparisonIntent(chemistryA, chemistryB, true, [])

    expect(goalIntent.score).toBeGreaterThan(0)
    expect(chemistryIntent.score).toBeLessThan(0)
    expect(goalIntent.signals.some((signal) => signal.label.startsWith('Shared user goal'))).toBe(true)
    expect(chemistryIntent.signals.some((signal) => signal.label === 'Chemistry-only editorial penalty')).toBe(true)
  })

  it('recognizes familiar shared compounds as useful comparison anchors', () => {
    const guarana = herb('guarana', { compounds: ['Caffeine', 'theobromine'], explicitEffects: ['energy'] })
    const guayusa = herb('guayusa', { compounds: ['caffeine'], explicitEffects: ['energy'] })

    const intent = scoreComparisonIntent(guarana, guayusa, true, ['energy'])

    expect(intent.score).toBeGreaterThan(0)
    expect(intent.signals.some((signal) => signal.label.includes('Recognizable shared compound'))).toBe(true)
  })
})
