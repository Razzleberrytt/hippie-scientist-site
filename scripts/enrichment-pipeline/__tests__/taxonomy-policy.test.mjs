import { describe, expect, it } from 'vitest'
import { SYNONYM_VERDICTS, classifySynonym, existingLatinNameIndex } from '../lib/taxonomy-policy.mjs'
import { makeCanonical, publishedHerb } from './fixtures.mjs'

describe('synonym resolution policy', () => {
  it('resolves a generic transfer — same epithet, new genus', () => {
    const result = classifySynonym({
      searchedName: 'Cordyceps sinensis',
      acceptedName: 'Ophiocordyceps sinensis',
      acceptedRank: 'SPECIES',
    })
    expect(result.verdict).toBe(SYNONYM_VERDICTS.RESOLVE)
    expect(result.resolve).toBe(true)
    expect(result.value).toBe('Ophiocordyceps sinensis')
  })

  it('refuses a lumping — the epithet changes, so it is a different organism', () => {
    // The grapefruit case: Citrus paradisi -> Citrus aurantium is bitter orange,
    // a different supplement with different safety cautions.
    const result = classifySynonym({
      searchedName: 'Citrus paradisi',
      acceptedName: 'Citrus aurantium',
      acceptedRank: 'SPECIES',
    })
    expect(result.verdict).toBe(SYNONYM_VERDICTS.LUMPING)
    expect(result.resolve).toBe(false)
    expect(result.reason).toMatch(/lumping/)
  })

  it('refuses an accepted target below species rank', () => {
    const result = classifySynonym({
      searchedName: 'Fraxinus rhynchophylla',
      acceptedName: 'Fraxinus chinensis rhynchophylla',
      acceptedRank: 'SUBSPECIES',
    })
    expect(result.verdict).toBe(SYNONYM_VERDICTS.NOT_SPECIES)
    expect(result.resolve).toBe(false)
  })

  it('refuses a target already claimed by another entity', () => {
    const canonical = makeCanonical([
      publishedHerb({ slug: 'existing-one', latin_name: 'Ophiocordyceps sinensis' }),
      publishedHerb({ slug: 'cordyceps-sinensis', latin_name: '' }),
    ])
    const result = classifySynonym({
      searchedName: 'Cordyceps sinensis',
      acceptedName: 'Ophiocordyceps sinensis',
      acceptedRank: 'SPECIES',
      existingLatinNames: existingLatinNameIndex(canonical),
      slug: 'cordyceps-sinensis',
    })
    expect(result.verdict).toBe(SYNONYM_VERDICTS.COLLISION)
    expect(result.resolve).toBe(false)
    expect(result.reason).toMatch(/existing-one/)
  })

  it('does not treat an entity re-claiming its own value as a collision', () => {
    const canonical = makeCanonical([publishedHerb({ slug: 'mine', latin_name: 'Ophiocordyceps sinensis' })])
    const result = classifySynonym({
      searchedName: 'Cordyceps sinensis',
      acceptedName: 'Ophiocordyceps sinensis',
      acceptedRank: 'SPECIES',
      existingLatinNames: existingLatinNameIndex(canonical),
      slug: 'mine',
    })
    expect(result.resolve).toBe(true)
  })

  it('reports no-op when there is no distinct accepted target', () => {
    expect(
      classifySynonym({ searchedName: 'Ginkgo biloba', acceptedName: 'Ginkgo biloba', acceptedRank: 'SPECIES' })
        .verdict,
    ).toBe(SYNONYM_VERDICTS.NOT_SYNONYM)
    expect(
      classifySynonym({ searchedName: 'Ginkgo biloba', acceptedName: '', acceptedRank: 'SPECIES' }).verdict,
    ).toBe(SYNONYM_VERDICTS.NOT_SYNONYM)
  })

  it('is case- and spacing-insensitive', () => {
    const result = classifySynonym({
      searchedName: '  cordyceps   SINENSIS ',
      acceptedName: 'ophiocordyceps sinensis',
      acceptedRank: 'species',
    })
    expect(result.resolve).toBe(true)
    expect(result.value).toBe('Ophiocordyceps sinensis')
  })

  it('indexes existing latin names by lowercase value', () => {
    const canonical = makeCanonical([
      publishedHerb({ slug: 'a', latin_name: 'Withania somnifera' }),
      publishedHerb({ slug: 'b', latin_name: '' }),
    ])
    const index = existingLatinNameIndex(canonical)
    expect(index.get('withania somnifera')).toBe('a')
    expect(index.size).toBe(1)
  })
})
