import { describe, it, expect } from 'vitest'
import {
  buildMedicalWebPageSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
} from '../../../lib/structured-data'

describe('buildMedicalWebPageSchema', () => {
  it('builds a MedicalWebPage schema with a herb-specific "about.@type" and canonical URL', () => {
    const schema = buildMedicalWebPageSchema({ slug: 'ashwagandha', name: 'Ashwagandha', summary: 'An adaptogen.' }, 'herb')

    expect(schema['@type']).toBe('MedicalWebPage')
    expect(schema.url).toBe('https://thehippiescientist.net/herbs/ashwagandha/')
    expect(schema.mainEntityOfPage).toBe(schema.url)
    expect((schema.about as Record<string, unknown>)['@type']).toBe('Drug')
  })

  it('uses ChemicalSubstance as the "about.@type" for compounds', () => {
    const schema = buildMedicalWebPageSchema({ slug: 'curcumin', name: 'Curcumin' }, 'compound')

    expect(schema.url).toBe('https://thehippiescientist.net/compounds/curcumin/')
    expect((schema.about as Record<string, unknown>)['@type']).toBe('ChemicalSubstance')
  })

  it('falls back to a generated description when none is provided', () => {
    const schema = buildMedicalWebPageSchema({ slug: 'bare', name: 'Bare Herb' }, 'herb')
    expect(schema.description).toMatch(/^Bare Herb profile/)
  })
})

describe('buildArticleSchema', () => {
  it('formats datePublished/dateModified as ISO strings, falling back to the publish date', () => {
    const schema = buildArticleSchema({ slug: 'my-post', title: 'My Post', date: '2024-01-15' })

    expect(schema.datePublished).toBe(new Date('2024-01-15').toISOString())
    expect(schema.dateModified).toBe(schema.datePublished)
    expect(schema.url).toBe('https://thehippiescientist.net/articles/my-post/')
  })

  it('prefers lastModified over the publish date when present', () => {
    const schema = buildArticleSchema({
      slug: 'my-post',
      title: 'My Post',
      date: '2024-01-15',
      lastModified: '2024-06-01',
    })

    expect(schema.dateModified).toBe(new Date('2024-06-01').toISOString())
    expect(schema.dateModified).not.toBe(schema.datePublished)
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
    expect(schema.itemListElement[1].item).toBe('https://thehippiescientist.net/herbs/')
  })

  it('does not double up a trailing slash that is already present', () => {
    const schema = buildBreadcrumbSchema([{ name: 'Home', url: 'https://thehippiescientist.net/' }])
    expect(schema.itemListElement[0].item).toBe('https://thehippiescientist.net/')
  })
})

describe('buildFAQSchema', () => {
  it('builds a FAQPage schema with one mainEntity Question per FAQ', () => {
    const schema = buildFAQSchema([
      { question: 'Is it safe?', answer: 'Consult a clinician.' },
      { question: 'Does it work?', answer: 'Evidence is mixed.' },
    ])

    expect(schema['@type']).toBe('FAQPage')
    expect(schema.mainEntity).toHaveLength(2)
    expect(schema.mainEntity[0].name).toBe('Is it safe?')
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('Consult a clinician.')
  })
})
