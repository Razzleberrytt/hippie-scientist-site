import { describe, expect, it } from 'vitest'

import {
  buildCitationIdentifierIdentityMap,
  canonicalCitationIdentifier,
  citationCompleteness,
  citationIdentifiers,
  citationUrl,
  isPlaceholderCitationTitle,
  isValidDoi,
  isValidPmid,
  normalizeDoi,
  normalizePmidList,
} from '@/lib/citation-identifiers.mjs'

describe('normalizePmidList', () => {
  it('splits a cell holding two studies into two identifiers', () => {
    expect(normalizePmidList('15070181; 22167571')).toEqual(['15070181', '22167571'])
    expect(normalizePmidList('33799504; 33034447')).toEqual(['33799504', '33034447'])
  })

  it('tolerates prefixes and URLs', () => {
    expect(normalizePmidList('PMID: 12345678')).toEqual(['12345678'])
    expect(normalizePmidList('https://pubmed.ncbi.nlm.nih.gov/12345678/')).toEqual(['12345678'])
    expect(normalizePmidList('12345678 and 87654321')).toEqual(['12345678', '87654321'])
  })

  it('drops malformed identifiers and de-duplicates repeats', () => {
    expect(normalizePmidList('0123456')).toEqual([])
    expect(normalizePmidList('not-a-pmid')).toEqual([])
    expect(normalizePmidList('12345678; 12345678')).toEqual(['12345678'])
  })
})

describe('identifier validation', () => {
  it('validates PMIDs and DOIs', () => {
    expect(isValidPmid('34559859')).toBe(true)
    expect(isValidPmid('15070181; 22167571')).toBe(false)
    expect(normalizeDoi('https://doi.org/10.1000/xyz123')).toBe('10.1000/xyz123')
    expect(isValidDoi('10.1016/j.jep.2021.114')).toBe(true)
    expect(isValidDoi('11.1000/xyz')).toBe(false)
  })
})

describe('citationIdentifiers', () => {
  it('returns DOI and PMID aliases for one study', () => {
    expect(citationIdentifiers({ doi: 'HTTPS://DOI.ORG/10.1000/XYZ123', pmid: '34559859' })).toEqual([
      'doi:10.1000/xyz123',
      'pmid:34559859',
    ])
  })

  it('keeps packed PMIDs distinct', () => {
    expect(citationIdentifiers({ pmid: '15070181; 22167571' })).toEqual(['pmid:15070181', 'pmid:22167571'])
  })
})

describe('canonical citation identifier aliases', () => {
  it('uses one DOI+PMID bridge to collapse DOI-only and PMID-only representations', () => {
    const sources = [
      { doi: '10.1000/XYZ123' },
      { doi: 'https://doi.org/10.1000/xyz123', pmid: '34559859' },
      { pmid: '34559859' },
    ]
    const identities = buildCitationIdentifierIdentityMap(sources)
    expect(identities.get('doi:10.1000/xyz123')).toBe('doi:10.1000/xyz123')
    expect(identities.get('pmid:34559859')).toBe('doi:10.1000/xyz123')
    expect(sources.map(source => canonicalCitationIdentifier(source, identities))).toEqual([
      'doi:10.1000/xyz123',
      'doi:10.1000/xyz123',
      'doi:10.1000/xyz123',
    ])
  })

  it('never unions multiple PMIDs merely because they share a packed row', () => {
    const identities = buildCitationIdentifierIdentityMap([{ pmid: '15070181; 22167571' }])
    expect(identities.get('pmid:15070181')).toBe('pmid:15070181')
    expect(identities.get('pmid:22167571')).toBe('pmid:22167571')
  })

  it('does not guess which packed PMID an ambiguous DOI belongs to', () => {
    const identities = buildCitationIdentifierIdentityMap([{ doi: '10.1000/ambiguous', pmid: '15070181; 22167571' }])
    expect(identities.get('doi:10.1000/ambiguous')).toBe('doi:10.1000/ambiguous')
    expect(identities.get('pmid:15070181')).toBe('pmid:15070181')
    expect(identities.get('pmid:22167571')).toBe('pmid:22167571')
  })
})

describe('citationUrl', () => {
  it('rebuilds packed PubMed URLs and prefers DOI when available', () => {
    expect(citationUrl({ url: 'https://pubmed.ncbi.nlm.nih.gov/15070181/; https://pubmed.ncbi.nlm.nih.gov/22167571/', pmid: '15070181; 22167571' })).toBe('https://pubmed.ncbi.nlm.nih.gov/15070181/')
    expect(citationUrl({ doi: '10.1000/xyz123', pmid: '34559859' })).toBe('https://doi.org/10.1000/xyz123')
  })
})

describe('citationCompleteness', () => {
  it('reports missing reader-facing fields and preserves preferred DOI identity', () => {
    const result = citationCompleteness({ pmid: '34559859', title: 'Effect of Ashwagandha extract on sleep: a meta-analysis', year: 2021, authors: 'Cheah KL et al.' })
    expect(result.missing).toEqual(['journal'])
    expect(citationCompleteness({ doi: '10.1000/XYZ123', pmid: '34559859' }).identifier).toBe('doi:10.1000/xyz123')
  })

  it('recognises placeholder titles', () => {
    expect(isPlaceholderCitationTitle('PubMed PMID 37818728. Minimal citation row added from existing evidence.')).toBe(true)
  })
})
