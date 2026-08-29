import { describe, expect, it } from 'vitest'
import {
  buildComparisonShortlist,
  evidenceTier,
  isAliasPair,
  scoreComparisonIntent,
  scoreObservedComparisonBehavior,
} from '@/lib/comparison-shortlist'
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

  it('filters known same-entity records through canonical identity groups', () => {
    expect(isAliasPair(herb('coptis'), herb('coptis-chinensis'))).toBe(true)
    expect(isAliasPair(herb('phellodendron'), herb('phellodendron-amurense'))).toBe(true)
    expect(isAliasPair(herb('hypericum-perforatum'), herb('st-johns-wort'))).toBe(true)
    expect(isAliasPair(herb('citrus-sinensis'), herb('orange-peel'))).toBe(true)
    expect(isAliasPair(herb('holy-basil'), herb('holy-basil-purple'))).toBe(true)
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

  it('turns related-card demand into a confidence-weighted observed behavior score', () => {
    const sparse = scoreObservedComparisonBehavior('alpha', 'beta', [
      { sourceSlug: 'alpha', targetSlug: 'beta', position: 1, impressions: 1, clicks: 1, ctr: 1, averageClickDepth: 3, deepExplorationRate: 1 },
    ])
    const established = scoreObservedComparisonBehavior('alpha', 'beta', [
      { sourceSlug: 'alpha', targetSlug: 'beta', position: 1, impressions: 20, clicks: 8, ctr: 0.4, averageClickDepth: 3.2, deepExplorationRate: 0.75 },
    ])

    expect(sparse.score).toBeGreaterThan(0)
    expect(established.score).toBeGreaterThan(sparse.score)
    expect(established.signals.some((signal) => signal.label.startsWith('Observed related-card demand'))).toBe(true)
  })

  it('uses observed behavior to break otherwise similar shortlist candidates', () => {
    const source = herb('behavior-source', { explicitEffects: ['calming', 'sleep'] })
    const demanded = herb('behavior-demanded', { explicitEffects: ['calming', 'sleep'] })
    const quiet = herb('behavior-quiet', { explicitEffects: ['calming', 'sleep'] })

    const rows = buildComparisonShortlist([source, demanded, quiet], 20, [
      { sourceSlug: 'behavior-source', targetSlug: 'behavior-demanded', position: 1, impressions: 24, clicks: 9, ctr: 0.375, averageClickDepth: 3.1, deepExplorationRate: 0.78 },
      { sourceSlug: 'behavior-demanded', targetSlug: 'behavior-source', position: 2, impressions: 12, clicks: 4, ctr: 0.333, averageClickDepth: 2.8, deepExplorationRate: 0.5 },
      { sourceSlug: 'behavior-source', targetSlug: 'behavior-quiet', position: 1, impressions: 24, clicks: 1, ctr: 0.042, averageClickDepth: 2, deepExplorationRate: 0 },
    ])

    const demandedPair = rows.find((row) => [row.a.slug, row.b.slug].includes('behavior-source') && [row.a.slug, row.b.slug].includes('behavior-demanded'))
    const quietPair = rows.find((row) => [row.a.slug, row.b.slug].includes('behavior-source') && [row.a.slug, row.b.slug].includes('behavior-quiet'))

    expect(demandedPair).toBeTruthy()
    expect(quietPair).toBeTruthy()
    expect(demandedPair!.observedBehaviorScore).toBeGreaterThan(quietPair!.observedBehaviorScore)
    expect(demandedPair!.priorityScore).toBeGreaterThan(quietPair!.priorityScore)
  })
})
