import { describe, it, expect } from 'vitest'
import {
  buildMedicalWebPageSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  buildDatasetSchema,
} from '../../../lib/structured-data'

describe('structured identities', () => {
  it('connects the author to the site without claiming a medical profession', () => {
    const org = buildOrganizationSchema()
    const person = buildPersonSchema()
    expect(org['@type']).toBe('Organization')
    expect(person['@type']).toBe('Person')
    expect(person.affiliation).toEqual({ '@id': 'https://thehippiescientist.net/#organization' })
    expect(person).not.toHaveProperty('jobTitle')
  })
})

describe('buildMedicalWebPageSchema', () => {
  it('builds an educational MedicalWebPage without patient/clinical-role claims', () => {
    const schema = buildMedicalWebPageSchema({ slug: 'ashwagandha', name: 'Ashwagandha', summary: 'An adaptogen.' }, 'herb')
    expect(schema['@type']).toBe('MedicalWebPage')
    expect(schema.url).toBe('https://thehippiescientist.net/herbs/ashwagandha/')
    expect(schema.mainEntityOfPage).toBe(schema.url)
    expect((schema.about as Record<string, unknown>)['@type']).toBe('Substance')
    expect(schema).not.toHaveProperty('medicalAudience')
  })
})

describe('buildArticleSchema', () => {
  it('formats real dates and falls modified back to the supplied publish date', () => {
    const schema = buildArticleSchema({ slug: 'my-post', title: 'My Post', date: '2024-01-15' })
    expect(schema.datePublished).toBe(new Date('2024-01-15').toISOString())
    expect(schema.dateModified).toBe(schema.datePublished)
    expect(schema.url).toBe('https://thehippiescientist.net/articles/my-post/')
  })

  it('does not invent a publication date when source data has none', () => {
    const schema = buildArticleSchema({ slug: 'undated', title: 'Undated' })
    expect(schema).not.toHaveProperty('datePublished')
    expect(schema).not.toHaveProperty('dateModified')
  })

  it('prefers lastModified over the publish date when present', () => {
    const schema = buildArticleSchema({ slug: 'my-post', title: 'My Post', date: '2024-01-15', lastModified: '2024-06-01' })
    expect(schema.dateModified).toBe(new Date('2024-06-01').toISOString())
  })
})

describe('buildDatasetSchema', () => {
  it('connects genuine datasets to the organization and preserves distribution metadata', () => {
    const schema = buildDatasetSchema({
      name: 'Evidence dataset',
      description: 'Aggregated evidence data.',
      url: 'https://thehippiescientist.net/evidence/data/',
      distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: 'https://thehippiescientist.net/data/evidence.csv' }],
    })
    expect(schema['@type']).toBe('Dataset')
    expect(schema.creator).toEqual({ '@id': 'https://thehippiescientist.net/#organization' })
    expect(schema.distribution).toHaveLength(1)
  })
})

describe('buildBreadcrumbSchema', () => {
  it('numbers items starting at 1 and appends a trailing slash to bare URLs', () => {
    const schema = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://thehippiescientist.net' },
      { name: 'Herbs', url: 'https://thehippiescientist.net/herbs' },
    ])
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[0].item).toBe('https://thehippiescientist.net/')
    expect(schema.itemListElement[1].position).toBe(2)
  })
})

describe('buildFAQSchema', () => {
  it('builds a FAQPage only from supplied visible FAQ content', () => {
    const schema = buildFAQSchema([
      { question: 'Is it safe?', answer: 'Consult a clinician.' },
      { question: 'Does it work?', answer: 'Evidence is mixed.' },
    ])
    expect(schema['@type']).toBe('FAQPage')
    expect(schema.mainEntity).toHaveLength(2)
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('Consult a clinician.')
  })
})
