import { describe, expect, it } from 'vitest'
import {
  firstAuthorSurname,
  normalizeBinomialName,
  normalizeDoi,
  normalizeEvidenceGradeForComparison,
  normalizePmcid,
  normalizePmid,
  normalizeSemicolonList,
  normalizeStudyType,
  normalizeText,
  normalizeUrl,
  normalizeYear,
  studyTypeIsHuman,
  studyTypeIsPreclinical,
} from '../lib/normalize.mjs'
import { dedupeSources, sourceIdentity } from '../lib/source-identity.mjs'

describe('identifier normalization', () => {
  it('resolves every spelling of the same DOI to one value', () => {
    const forms = [
      '10.1055/S-2002-36338',
      'https://doi.org/10.1055/s-2002-36338',
      'http://dx.doi.org/10.1055/s-2002-36338',
      'doi:10.1055/s-2002-36338',
      '10.1055/s-2002-36338.',
    ]
    const normalized = new Set(forms.map(normalizeDoi))
    expect(normalized).toEqual(new Set(['10.1055/s-2002-36338']))
  })

  it('rejects values that are not DOIs', () => {
    expect(normalizeDoi('not-a-doi')).toBe('')
    expect(normalizeDoi('11.1234/abc')).toBe('')
    expect(normalizeDoi('')).toBe('')
  })

  it('extracts PMIDs and PMCIDs from decorated values', () => {
    expect(normalizePmid('PMID: 19773644')).toBe('19773644')
    expect(normalizePmid('pmid19773644')).toBe('19773644')
    expect(normalizePmcid('pmc 123456')).toBe('PMC123456')
    expect(normalizePmid('nope')).toBe('')
  })

  it('strips tracking parameters and normalizes hosts', () => {
    expect(normalizeUrl('https://WWW.Example.com/path/?utm_source=x&b=2&a=1#frag')).toBe(
      'https://example.com/path?a=1&b=2',
    )
    expect(normalizeUrl('http://example.com/x/')).toBe('https://example.com/x')
    expect(normalizeUrl('not a url')).toBe('')
  })

  it('is idempotent', () => {
    const samples = ['https://doi.org/10.1234/A', 'PMID: 12345', 'https://x.com/a/?utm_a=1']
    for (const sample of samples) {
      expect(normalizeDoi(normalizeDoi(sample))).toBe(normalizeDoi(sample))
      expect(normalizePmid(normalizePmid(sample))).toBe(normalizePmid(sample))
      expect(normalizeUrl(normalizeUrl(sample))).toBe(normalizeUrl(sample))
    }
  })

  it('normalizes years and rejects implausible ones', () => {
    expect(normalizeYear('Published 2013.')).toBe(2013)
    expect(normalizeYear('n/a')).toBeNull()
  })
})

describe('value normalization', () => {
  it('collapses whitespace and curly punctuation', () => {
    expect(normalizeText('  a  “b”   ’c’  ')).toBe('a "b" \'c\'')
  })

  it('de-duplicates semicolon lists case-insensitively while preserving order', () => {
    expect(normalizeSemicolonList('Sleep ; anxiety;SLEEP;  ; stress')).toBe('Sleep; anxiety; stress')
  })

  it('normalizes binomial names', () => {
    expect(normalizeBinomialName('  withania   SOMNIFERA ')).toBe('Withania somnifera')
    expect(normalizeBinomialName('withania somnifera VAR. foo')).toBe('Withania somnifera var. foo')
  })

  it('is idempotent for every field normalizer', () => {
    const samples = ['a;  B ;a', ' Withania  somnifera ', '  “x”  ']
    for (const sample of samples) {
      expect(normalizeSemicolonList(normalizeSemicolonList(sample))).toBe(normalizeSemicolonList(sample))
      expect(normalizeBinomialName(normalizeBinomialName(sample))).toBe(normalizeBinomialName(sample))
      expect(normalizeText(normalizeText(sample))).toBe(normalizeText(sample))
    }
  })
})

describe('study vocabulary', () => {
  it('maps the workbook spellings onto canonical study types', () => {
    expect(normalizeStudyType('randomized_double_blind_placebo_controlled_trial')).toBe(
      'randomized-controlled-trial',
    )
    expect(normalizeStudyType('RCT')).toBe('randomized-controlled-trial')
    expect(normalizeStudyType('systematic_review_meta_analysis')).toBe('systematic-review-meta-analysis')
    expect(normalizeStudyType('in vitro')).toBe('in-vitro')
    expect(normalizeStudyType('something odd')).toBe('unclassified')
  })

  it('separates human from preclinical designs', () => {
    expect(studyTypeIsHuman('RCT')).toBe(true)
    expect(studyTypeIsPreclinical('RCT')).toBe(false)
    expect(studyTypeIsPreclinical('in vivo animal study')).toBe(true)
    expect(studyTypeIsHuman('in vitro')).toBe(false)
  })

  it('collapses the workbook evidence-grade spellings for comparison only', () => {
    expect(normalizeEvidenceGradeForComparison('B')).toBe('b')
    expect(normalizeEvidenceGradeForComparison('moderate')).toBe('b')
    expect(normalizeEvidenceGradeForComparison('Strong')).toBe('a')
    expect(normalizeEvidenceGradeForComparison('insufficient')).toBe('d')
  })
})

describe('source identity', () => {
  it('prefers DOI, then PMID, then URL, then title+year+author', () => {
    expect(sourceIdentity({ doi: '10.1234/a', pmid: '123456' }).kind).toBe('doi')
    expect(sourceIdentity({ pmid: '123456', url: 'https://x.com' }).kind).toBe('pmid')
    expect(sourceIdentity({ url: 'https://example.org/paper' }).kind).toBe('url')
    expect(sourceIdentity({ title: 'A study of things', year: 2010, authors: 'Smith J' }).kind).toBe(
      'title-year-author',
    )
  })

  it('recovers a PMID embedded in a PubMed URL', () => {
    const identity = sourceIdentity({ url: 'https://pubmed.ncbi.nlm.nih.gov/19773644/' })
    expect(identity).toMatchObject({ kind: 'pmid', value: '19773644' })
  })

  it('refuses to identify a source from a title alone', () => {
    expect(sourceIdentity({ title: 'Only a title' }).kind).toBe('none')
    expect(sourceIdentity({ title: 'Title', year: 2010 }).kind).toBe('none')
  })

  it('merges duplicates across identifier spellings and fills gaps from the later record', () => {
    const { sources, duplicatesRemoved } = dedupeSources([
      { id: 'a', doi: '10.1055/s-2002-36338', title: 'Kavalactones' },
      { id: 'b', doi: 'https://doi.org/10.1055/S-2002-36338', year: 2002, journal: 'Planta Med' },
      { id: 'c', pmid: '19773644' },
    ])
    expect(duplicatesRemoved).toBe(1)
    expect(sources).toHaveLength(2)
    const merged = sources.find((s) => s.id === 'a')
    expect(merged.year).toBe(2002)
    expect(merged.title).toBe('Kavalactones')
  })

  it('keeps unidentified sources separate instead of guessing', () => {
    const { sources, unidentified } = dedupeSources([
      { id: 'x', title: 'Some title' },
      { id: 'y', title: 'Some title' },
    ])
    expect(sources).toHaveLength(0)
    expect(unidentified).toHaveLength(2)
  })

  it('extracts a first-author surname from the workbook label form', () => {
    expect(firstAuthorSurname('Ferracioli-Oda 2013')).toBe('ferracioli-oda')
    expect(firstAuthorSurname('Smith J; Jones A')).toBe('smith')
  })
})
