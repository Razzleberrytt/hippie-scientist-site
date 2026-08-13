import { describe, expect, it } from 'vitest'
import { sanitizeProfileSchemaPayload } from '../profile-schema-sanitize'

describe('sanitizeProfileSchemaPayload', () => {
  it('keeps profile entity JSON-LD within declared Schema.org property domains', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['ChemicalSubstance', 'MolecularEntity'],
          '@id': 'https://thehippiescientist.net/compounds/example/#entity',
          name: 'Example',
          category: 'Example class',
          additionalProperty: [{ '@type': 'PropertyValue', name: 'Evidence', value: 'Moderate' }],
          mechanismOfAction: 'Example mechanism',
          molecularFormula: 'C1H2',
        },
      ],
    }

    const result = sanitizeProfileSchemaPayload(payload)
    const entity = (result['@graph'] as Record<string, unknown>[])[0]

    expect(entity.category).toBeUndefined()
    expect(entity.additionalProperty).toBeUndefined()
    expect(entity.mechanismOfAction).toBeUndefined()
    expect(entity.molecularFormula).toBe('C1H2')
  })

  it('uses lastReviewed on WebPage nodes', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['MedicalWebPage', 'WebPage'],
          '@id': 'https://thehippiescientist.net/herbs/example/#webpage',
          dateReviewed: '2026-08-13',
        },
      ],
    }

    const result = sanitizeProfileSchemaPayload(payload)
    const webpage = (result['@graph'] as Record<string, unknown>[])[0]

    expect(webpage.dateReviewed).toBeUndefined()
    expect(webpage.lastReviewed).toBe('2026-08-13')
  })

  it('does not rewrite unrelated graphs', () => {
    const payload = {
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'Product', '@id': 'https://example.com/#entity', category: 'Camera' }],
    }

    expect(sanitizeProfileSchemaPayload(payload)).toEqual(payload)
  })
})
