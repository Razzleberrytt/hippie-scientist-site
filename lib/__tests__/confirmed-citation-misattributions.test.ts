import { describe, expect, it } from 'vitest'
import { isConfirmedMisattribution } from '../confirmed-citation-misattributions.mjs'

describe('verified source-assignment quarantine', () => {
  it('rejects the rasagiline paper on maca through each recorded identifier shape', () => {
    for (const row of [
      { pmid: '18072817' }, { PMID: '18072817' }, { pubmedId: '18072817' },
      { source_url: 'https://pubmed.ncbi.nlm.nih.gov/18072817/' },
      { source_url: 'https://pubmed.ncbi.nlm.nih.gov/18072817?format=pubmed' },
      { url_or_source: 'https://pubmed.ncbi.nlm.nih.gov/23674952/ | https://pubmed.ncbi.nlm.nih.gov/18072817/' },
      { doi: '10.2165/00023210-200822010-00007' },
      { url: 'https://doi.org/10.2165/00023210-200822010-00007' },
    ]) expect(isConfirmedMisattribution(row, 'maca')).toBe(true)
  })
  it('does not reject legitimate maca references or apply a global paper ban', () => {
    expect(isConfirmedMisattribution({ pmid: '23674952' }, 'maca')).toBe(false)
    expect(isConfirmedMisattribution({ pmid: '31951246' }, 'maca')).toBe(false)
    expect(isConfirmedMisattribution({ pmid: '18072817' }, 'rasagiline')).toBe(false)
    expect(isConfirmedMisattribution({ url: 'https://example.com/18072817/' }, 'maca')).toBe(false)
  })
  it('retains the previously verified curcumin and potassium quarantines', () => {
    expect(isConfirmedMisattribution({ pmid: '27403209' }, 'curcumin')).toBe(true)
    expect(isConfirmedMisattribution({ pmid: '25059961' }, 'potassium')).toBe(true)
  })
})
