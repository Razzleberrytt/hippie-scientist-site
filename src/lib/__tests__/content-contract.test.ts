import { describe, expect, it } from 'vitest'
import {
  formatCanonicalCitation,
  getCanonicalAliases,
  getCanonicalContentPolicy,
  getCanonicalDisplayName,
  getCanonicalEntityPath,
  normalizeRuntimeContentRecord,
  normalizeRuntimeContentRecords,
} from '../content-contract'

describe('runtime content contract', () => {
  it('fails closed on malformed slugs before records reach components', () => {
    expect(normalizeRuntimeContentRecord({ slug: '../unsafe', name: 'Unsafe' }, 'herb')).toBeNull()

    const result = normalizeRuntimeContentRecords([
      { slug: 'ashwagandha', name: 'Ashwagandha' },
      { slug: '../unsafe', name: 'Unsafe' },
    ], 'herb', 'fixture')

    expect(result.records).toHaveLength(1)
    expect(result.records[0].slug).toBe('ashwagandha')
    expect(result.issues).toHaveLength(1)
    expect(result.issues[0].source).toBe('fixture')
  })

  it('normalizes display names and aliases through one path', () => {
    const record = {
      slug: 'ashwagandha',
      name: '  Ashwagandha  ',
      aliases: 'Indian ginseng; Winter cherry',
      commonnames: ['Winter cherry', 'Withania'],
      scientificName: 'Withania somnifera',
    }

    expect(getCanonicalDisplayName(record)).toBe('Ashwagandha')
    expect(getCanonicalAliases(record)).toEqual([
      'Indian ginseng',
      'Winter cherry',
      'Withania',
      'Withania somnifera',
    ])
  })

  it('centralizes canonical entity paths and publication policy', () => {
    const record = normalizeRuntimeContentRecord({
      slug: 'magnesium',
      name: 'Magnesium',
      evidence_grade: 'B',
      indexability_status: 'PUBLISH',
      robots: 'index,follow',
      sitemap_included: true,
      affiliate_ready: true,
    }, 'compound')

    expect(record).not.toBeNull()
    expect(getCanonicalEntityPath(record!, 'compound')).toBe('/compounds/magnesium/')

    const policy = getCanonicalContentPolicy(record!, 'compound')
    expect(policy.path).toBe('/compounds/magnesium/')
    expect(policy.url).toContain('/compounds/magnesium/')
    expect(policy.visibility.canIndex).toBe(true)
    expect(policy.evidenceGrade).toBe('B')
  })

  it('formats PubMed citations deterministically', () => {
    expect(formatCanonicalCitation({
      authors: 'Smith J',
      title: 'A controlled trial',
      journal: 'Example Journal',
      year: 2026,
      pmid: '12345678',
    })).toEqual({
      text: 'Smith J. A controlled trial. Example Journal. 2026. PMID 12345678',
      href: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
      identifier: 'PMID 12345678',
    })
  })
})
