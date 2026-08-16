import { describe, expect, it } from 'vitest'

import {
  citationCompleteness,
  citationIdentifiers,
  citationUrl,
  isPlaceholderCitationTitle,
  isValidDoi,
  isValidPmid,
  normalizeDoi,
  normalizePmidList,
} from '@/lib/citation-identifiers.mjs'

/**
 * These identifiers become the href a reader clicks to check a claim. A
 * malformed one is a dead citation on a page that presents itself as
 * evidence-based, so the packed-cell cases below are the ones that matter.
 */

describe('normalizePmidList', () => {
  it('splits a cell holding two studies into two identifiers', () => {
    expect(normalizePmidList('15070181; 22167571')).toEqual(['15070181', '22167571'])
    expect(normalizePmidList('33799504; 33034447')).toEqual(['33799504', '33034447'])
  })

  it('tolerates the prefixes and URLs a packed cell arrives with', () => {
    expect(normalizePmidList('PMID: 12345678')).toEqual(['12345678'])
    expect(normalizePmidList('https://pubmed.ncbi.nlm.nih.gov/12345678/')).toEqual(['12345678'])
    expect(normalizePmidList('12345678 and 87654321')).toEqual(['12345678', '87654321'])
  })

  it('drops malformed identifiers rather than passing them through', () => {
    expect(normalizePmidList('0123456')).toEqual([])
    expect(normalizePmidList('not-a-pmid')).toEqual([])
    expect(normalizePmidList('')).toEqual([])
    expect(normalizePmidList(null)).toEqual([])
  })

  it('de-duplicates a repeated identifier', () => {
    expect(normalizePmidList('12345678; 12345678')).toEqual(['12345678'])
  })
})

describe('isValidPmid', () => {
  it('accepts real PubMed IDs and rejects impossible ones', () => {
    expect(isValidPmid('34559859')).toBe(true)
    expect(isValidPmid('1')).toBe(true)
    expect(isValidPmid('0123')).toBe(false)
    expect(isValidPmid('12345678901')).toBe(false)
    expect(isValidPmid('15070181; 22167571')).toBe(false)
  })
})

describe('normalizeDoi / isValidDoi', () => {
  it('strips resolver prefixes', () => {
    expect(normalizeDoi('https://doi.org/10.1000/xyz123')).toBe('10.1000/xyz123')
    expect(normalizeDoi('doi: 10.1000/xyz123')).toBe('10.1000/xyz123')
  })

  it('validates the registrant prefix', () => {
    expect(isValidDoi('10.1016/j.jep.2021.114')).toBe(true)
    expect(isValidDoi('11.1000/xyz')).toBe(false)
    expect(isValidDoi('10.1000')).toBe(false)
    expect(isValidDoi('')).toBe(false)
  })
})

describe('citationIdentifiers', () => {
  it('returns DOI and PMID aliases for the same study', () => {
    expect(citationIdentifiers({ doi: 'HTTPS://DOI.ORG/10.1000/XYZ123', pmid: '34559859' })).toEqual([
      'doi:10.1000/xyz123',
      'pmid:34559859',
    ])
  })

  it('keeps every valid PMID alias from a packed source cell', () => {
    expect(citationIdentifiers({ pmid: '15070181; 22167571' })).toEqual(['pmid:15070181', 'pmid:22167571'])
  })
})

describe('citationUrl', () => {
  it('rebuilds the link when the stored URL packs two identifiers', () => {
    expect(
      citationUrl({
        url: 'https://pubmed.ncbi.nlm.nih.gov/15070181/; https://pubmed.ncbi.nlm.nih.gov/22167571/',
        pmid: '15070181; 22167571',
      }),
    ).toBe('https://pubmed.ncbi.nlm.nih.gov/15070181/')
  })

  it('keeps a well-formed stored URL', () => {
    expect(citationUrl({ url: 'https://pubmed.ncbi.nlm.nih.gov/34559859/' })).toBe(
      'https://pubmed.ncbi.nlm.nih.gov/34559859/',
    )
  })

  it('prefers a DOI over a PMID', () => {
    expect(citationUrl({ doi: '10.1000/xyz123', pmid: '34559859' })).toBe('https://doi.org/10.1000/xyz123')
  })

  it('returns empty rather than a broken link when nothing resolves', () => {
    expect(citationUrl({ pmid: 'not-a-pmid' })).toBe('')
    expect(citationUrl({})).toBe('')
  })
})

describe('isPlaceholderCitationTitle', () => {
  it('recognises a metadata note published as a study title', () => {
    expect(isPlaceholderCitationTitle('PubMed PMID 37818728. Minimal citation row added from existing evidence.')).toBe(true)
    expect(isPlaceholderCitationTitle('Systematic review metadata; abstract unavailable in fetch')).toBe(true)
    expect(isPlaceholderCitationTitle('')).toBe(true)
  })

  it('leaves a real study title alone', () => {
    expect(
      isPlaceholderCitationTitle(
        'Effect of Ashwagandha (Withania somnifera) extract on sleep: A systematic review and meta-analysis',
      ),
    ).toBe(false)
  })
})

describe('citationCompleteness', () => {
  it('reports exactly which reader-facing fields are absent', () => {
    const result = citationCompleteness({
      pmid: '34559859',
      title: 'Effect of Ashwagandha extract on sleep: a meta-analysis',
      year: 2021,
      authors: 'Cheah KL et al.',
    })
    expect(result.complete).toBe(false)
    expect(result.missing).toEqual(['journal'])
    expect(result.identifier).toBe('pmid:34559859')
  })

  it('uses the DOI as the preferred identifier while preserving PMID as an alias', () => {
    const source = { doi: '10.1000/XYZ123', pmid: '34559859' }
    expect(citationCompleteness(source).identifier).toBe('doi:10.1000/xyz123')
    expect(citationIdentifiers(source)).toContain('pmid:34559859')
  })

  it('counts a placeholder title as a missing title', () => {
    const result = citationCompleteness({ pmid: '37818728', title: 'PubMed PMID 37818728.' })
    expect(result.missing).toContain('title')
  })
})
