import { describe, expect, it } from 'vitest'
import { sanitizeJsonLdPayload } from '../json-ld-sanitize'

describe('profile JSON-LD property domains', () => {
  it('removes profile-only editorial fields from chemical entity schema', () => {
    const result = sanitizeJsonLdPayload({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['ChemicalSubstance', 'MolecularEntity'],
          '@id': 'https://thehippiescientist.net/compounds/example/#entity',
          name: 'Example',
          category: 'Example class',
          additionalProperty: [{ '@type': 'PropertyValue', name: 'Evidence', value: 'Moderate' }],
          mechanismOfAction: 'Example pathway',
          molecularFormula: 'C1H2',
        },
      ],
    }) as Record<string, unknown>

    const entity = (result['@graph'] as Record<string, unknown>[])[0]
    expect(entity.category).toBeUndefined()
    expect(entity.additionalProperty).toBeUndefined()
    expect(entity.mechanismOfAction).toBeUndefined()
    expect(entity.molecularFormula).toBe('C1H2')
  })

  it('normalizes the legacy review-date field on webpage nodes', () => {
    const result = sanitizeJsonLdPayload({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['MedicalWebPage', 'WebPage'],
          '@id': 'https://thehippiescientist.net/herbs/example/#webpage',
          dateReviewed: '2026-08-13',
        },
      ],
    }) as Record<string, unknown>

    const page = (result['@graph'] as Record<string, unknown>[])[0]
    expect(page.dateReviewed).toBeUndefined()
    expect(page.lastReviewed).toBe('2026-08-13')
  })

  it('does not strip category from unrelated schema types', () => {
    const result = sanitizeJsonLdPayload({
      '@type': 'Service',
      '@id': 'https://example.com/#service',
      category: 'Research',
    }) as Record<string, unknown>

    expect(result.category).toBe('Research')
  })
})
