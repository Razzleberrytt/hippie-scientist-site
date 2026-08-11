import { describe, expect, it } from 'vitest'
import { buildCompareSchema } from '../CompareSchema'
import type { CompareItem } from '@/lib/compare'

function item(overrides: Partial<CompareItem>): CompareItem {
  return {
    slug: 'example',
    name: 'Example',
    type: 'compound',
    description: '',
    primaryBenefits: [],
    mechanisms: [],
    canonicalMechanisms: [],
    mechanismCategories: [],
    evidenceLevel: 'unknown',
    doNotMonetize: false,
    isHarmReduction: false,
    pageUrl: '/compounds/example',
    ...overrides,
  }
}

describe('buildCompareSchema', () => {
  it('describes herbs as substances rather than medical therapies', () => {
    const schema = buildCompareSchema({
      item1: item({ slug: 'ashwagandha', name: 'Ashwagandha', type: 'herb', pageUrl: '/herbs/ashwagandha' }),
      item2: item({ slug: 'l-theanine', name: 'L-theanine' }),
      slug: 'ashwagandha-vs-l-theanine',
      faqs: [],
    })

    const article = schema['@graph'][0] as { description: string; about: Array<{ '@type': string }> }
    expect(article.about[0]['@type']).toBe('Substance')
    expect(article.about[1]['@type']).toBe('ChemicalSubstance')
    expect(article.description).toMatch(/source-reported dosing context/i)
    expect(JSON.stringify(schema)).not.toContain('MedicalTherapy')
    expect(JSON.stringify(schema)).not.toContain('best-fit use cases')
  })
})
