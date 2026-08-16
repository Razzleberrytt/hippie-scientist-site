import { describe, expect, it } from 'vitest'

import { validateScientificName } from '@/lib/scientific-name.mjs'

/**
 * These names render in italics under the common name and ship as `latinName`
 * in structured data. A false positive here would flag correct botany as an
 * error, which is worse than missing a typo — the exceptions are the point.
 */

describe('validateScientificName', () => {
  it('accepts ordinary binomials from the dataset', () => {
    for (const name of [
      'Withania somnifera',
      'Malpighia emarginata',
      'Trachyspermum ammi',
      'Andrographis paniculata',
      'Panax quinquefolius',
      'Aloe vera',
    ]) {
      expect(validateScientificName(name).valid, name).toBe(true)
    }
  })

  it('accepts the hybrid marker, which peppermint requires', () => {
    // A naive capital-then-lowercase check rejects this, and it is the correct
    // way to write the name.
    expect(validateScientificName('Mentha × piperita').valid).toBe(true)
    expect(validateScientificName('Mentha x piperita').valid).toBe(true)
  })

  it('accepts infraspecific ranks', () => {
    expect(validateScientificName('Panax ginseng var. coreensis').valid).toBe(true)
    expect(validateScientificName('Salvia officinalis subsp. lavandulifolia').valid).toBe(true)
  })

  it('accepts a genus on its own', () => {
    expect(validateScientificName('Echinacea').valid).toBe(true)
  })

  it('accepts an author citation after the binomial', () => {
    // "(L.) Wettst." is not part of the name and must not be validated as one.
    expect(validateScientificName('Bacopa monnieri (L.) Wettst.').valid).toBe(true)
    expect(validateScientificName('Ginkgo biloba L.').valid).toBe(true)
  })

  it('catches a lowercase genus', () => {
    expect(validateScientificName('withania somnifera').issues).toContain('genus-not-capitalized')
  })

  it('catches a capitalised species epithet', () => {
    expect(validateScientificName('Withania Somnifera').issues).toContain('species-epithet-not-lowercase')
  })

  it('catches shouting', () => {
    const result = validateScientificName('WITHANIA SOMNIFERA')
    expect(result.valid).toBe(false)
    expect(result.issues).toContain('all-caps')
  })

  it('catches stray whitespace and trailing punctuation', () => {
    expect(validateScientificName('Withania  somnifera').issues).toContain('irregular-whitespace')
    expect(validateScientificName(' Withania somnifera').issues).toContain('irregular-whitespace')
    expect(validateScientificName('Withania somnifera,').issues).toContain('trailing-punctuation')
    // A rank or author abbreviation legitimately ends in a period.
    expect(validateScientificName('Ginkgo biloba L.').issues).not.toContain('trailing-punctuation')
  })

  it('reports an empty name rather than passing it', () => {
    expect(validateScientificName('').issues).toContain('empty')
    expect(validateScientificName(null).valid).toBe(false)
  })
})
