import { describe, expect, it } from 'vitest'
import {
  serializeJsonLd,
  buildHerbArticleSchema,
} from '../schema-injector'
import {
  AUTHOR_SCHEMA_ID,
  AUTHOR_URL,
  ORGANIZATION_SCHEMA_ID,
} from '../schema-identities'

describe('serializeJsonLd', () => {
  it('produces valid JSON', () => {
    const result = serializeJsonLd({ '@type': 'Article', name: 'Ashwagandha' })
    expect(() => JSON.parse(result)).not.toThrow()
  })

  it('escapes < to prevent </script> injection', () => {
    const malicious = '</script><script>alert(1)</script>'
    const result = serializeJsonLd({ name: malicious })
    expect(result).not.toContain('</script>')
    expect(result).toContain('\\u003c')
  })

  it('escapes > to close script-injection vectors', () => {
    const result = serializeJsonLd({ value: '<img src=x onerror=alert(1)>' })
    expect(result).not.toContain('>')
    expect(result).toContain('\\u003e')
  })

  it('escapes & to prevent entity injection', () => {
    const result = serializeJsonLd({ url: 'https://example.com/?a=1&b=2' })
    expect(result).not.toContain('&b')
    expect(result).toContain('\\u0026')
  })

  it('sanitizes known invalid schema properties at the serialization boundary', () => {
    const result = serializeJsonLd({
      '@type': 'MedicalSubstance',
      name: 'Example',
      evidenceLevel: 'Strong',
      safetyWarnings: 'Example warning',
    })
    const parsed = JSON.parse(result)

    expect(parsed.name).toBe('Example')
    expect(parsed.evidenceLevel).toBeUndefined()
    expect(parsed.safetyWarnings).toBeUndefined()
  })

  it('canonicalizes the first-party organization identity without touching publisher role', () => {
    const parsed = JSON.parse(serializeJsonLd({
      '@type': 'Article',
      publisher: {
        '@type': 'Organization',
        name: 'The Hippie Scientist',
        url: 'https://thehippiescientist.net',
      },
    }))

    expect(parsed.publisher['@type']).toBe('Organization')
    expect(parsed.publisher['@id']).toBe(ORGANIZATION_SCHEMA_ID)
    expect(parsed.publisher.url).toBe('https://thehippiescientist.net')
  })

  it('converts a legacy first-party Organization author into the canonical Person', () => {
    const parsed = JSON.parse(serializeJsonLd({
      '@type': 'Article',
      author: {
        '@type': 'Organization',
        name: 'The Hippie Scientist',
        url: 'https://thehippiescientist.net',
      },
    }))

    expect(parsed.author['@type']).toBe('Person')
    expect(parsed.author['@id']).toBe(AUTHOR_SCHEMA_ID)
    expect(parsed.author.url).toBe(AUTHOR_URL)
    expect(parsed.author.affiliation['@id']).toBe(ORGANIZATION_SCHEMA_ID)
  })

  it('canonicalizes the first-party author identity recursively', () => {
    const parsed = JSON.parse(serializeJsonLd({
      '@type': 'Article',
      author: {
        '@type': 'Person',
        name: 'Willie B. Randolph III',
      },
    }))

    expect(parsed.author['@id']).toBe(AUTHOR_SCHEMA_ID)
    expect(parsed.author.url).toBe(AUTHOR_URL)
    expect(parsed.author.affiliation['@id']).toBe(ORGANIZATION_SCHEMA_ID)
  })

  it('normalizes historical ADHD guide authority shapes in one graph', () => {
    const parsed = JSON.parse(serializeJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': 'https://thehippiescientist.net/guides/adhd/example/#article',
          headline: 'ADHD supplement guide',
          author: {
            '@type': 'Organization',
            name: 'The Hippie Scientist',
            url: 'https://thehippiescientist.net',
          },
          publisher: {
            '@type': 'Organization',
            name: 'The Hippie Scientist',
            url: 'https://thehippiescientist.net',
          },
        },
        {
          '@type': 'Person',
          name: 'Willie B. Randolph III',
        },
      ],
    }))
    const [article, person] = parsed['@graph']

    expect(article.author['@type']).toBe('Person')
    expect(article.author['@id']).toBe(AUTHOR_SCHEMA_ID)
    expect(article.author.url).toBe(AUTHOR_URL)
    expect(article.author.affiliation['@id']).toBe(ORGANIZATION_SCHEMA_ID)
    expect(article.publisher['@type']).toBe('Organization')
    expect(article.publisher['@id']).toBe(ORGANIZATION_SCHEMA_ID)
    expect(article.publisher.url).toBe('https://thehippiescientist.net')
    expect(person['@id']).toBe(AUTHOR_SCHEMA_ID)
    expect(person.url).toBe(AUTHOR_URL)
    expect(person.affiliation['@id']).toBe(ORGANIZATION_SCHEMA_ID)
  })

  it('does not rewrite third-party medical reviewers on ADHD guides', () => {
    const parsed = JSON.parse(serializeJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      reviewedBy: {
        '@type': 'Person',
        name: 'External Reviewer',
        url: 'https://example.org/reviewer',
      },
    }))

    expect(parsed.reviewedBy.name).toBe('External Reviewer')
    expect(parsed.reviewedBy.url).toBe('https://example.org/reviewer')
    expect(parsed.reviewedBy['@id']).toBeUndefined()
  })

  it('does not rewrite third-party people or organizations', () => {
    const parsed = JSON.parse(serializeJsonLd({
      author: { '@type': 'Person', name: 'External Reviewer', url: 'https://example.org/reviewer' },
      publisher: { '@type': 'Organization', name: 'Example Journal', url: 'https://example.org' },
    }))

    expect(parsed.author['@id']).toBeUndefined()
    expect(parsed.publisher['@id']).toBeUndefined()
    expect(parsed.author.url).toBe('https://example.org/reviewer')
  })

  it('round-trips cleanly through JSON.parse', () => {
    const node = { '@type': 'Article', headline: 'A & B < C > D', url: 'https://example.com/' }
    const serialized = serializeJsonLd(node)
    const parsed = JSON.parse(serialized)
    expect(parsed['@type']).toBe('Article')
    expect(parsed.headline).toBe('A & B < C > D')
  })
})

describe('buildHerbArticleSchema', () => {
  const base = {
    headline: 'Ashwagandha Benefits, Dosage & Safety',
    description: 'Evidence-based review of ashwagandha: stress, sleep, and safety data.',
    url: 'https://thehippiescientist.net/herbs/ashwagandha/',
    image: 'https://thehippiescientist.net/og-ashwagandha.jpg',
    datePublished: '2026-01-15',
    dateModified: '2026-06-14',
  }

  it('emits required @context and @type', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toEqual(expect.arrayContaining(['ScholarlyArticle', 'Article']))
  })

  it('includes headline and image', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.headline).toBe(base.headline)
    expect(schema.image).toBe(base.image)
  })

  it('includes publication and modification dates when supplied', () => {
    const schema = buildHerbArticleSchema(base)
    expect(schema.datePublished).toBe('2026-01-15')
    expect(schema.dateModified).toBe('2026-06-14')
  })

  it('omits dateModified when not provided', () => {
    const { dateModified: _, ...noModified } = base
    const schema = buildHerbArticleSchema(noModified)
    expect(schema.dateModified).toBeUndefined()
  })

  it('uses the canonical Person as the default author', () => {
    const schema = buildHerbArticleSchema(base)
    const author = schema.author as Record<string, unknown>
    expect(author['@type']).toBe('Person')
    expect(author.name).toBe('Willie B. Randolph III')
    expect(author['@id']).toBe(AUTHOR_SCHEMA_ID)
    expect(author.url).toBe(AUTHOR_URL)
  })

  it('keeps a genuinely custom author distinct from the canonical author ID', () => {
    const schema = buildHerbArticleSchema({
      ...base,
      authorName: 'Custom Author',
      authorUrl: 'https://example.org/custom-author',
    })
    const author = schema.author as Record<string, unknown>
    expect(author.name).toBe('Custom Author')
    expect(author.url).toBe('https://example.org/custom-author')
    expect(author['@id']).toBeUndefined()
  })

  it('uses the canonical Organization as publisher rather than duplicating the author', () => {
    const schema = buildHerbArticleSchema(base)
    const publisher = schema.publisher as Record<string, unknown>
    expect(publisher['@type']).toBe('Organization')
    expect(publisher['@id']).toBe(ORGANIZATION_SCHEMA_ID)
    expect(publisher.name).toBe('The Hippie Scientist')
    expect(schema.author).not.toEqual(schema.publisher)
  })

  it('includes mainEntityOfPage linking back to the URL', () => {
    const schema = buildHerbArticleSchema(base)
    const mep = schema.mainEntityOfPage as Record<string, unknown>
    expect(mep['@type']).toBe('WebPage')
    expect(mep['@id']).toBe(base.url)
  })

  it('omits image when not provided', () => {
    const { image: _, ...noImage } = base
    const schema = buildHerbArticleSchema(noImage)
    expect(schema.image).toBeUndefined()
  })

  it('keeps evidenceGrade out of Article additionalProperty', () => {
    const schema = buildHerbArticleSchema({ ...base, evidenceGrade: 'B — Moderate' })
    expect(schema.additionalProperty).toBeUndefined()
  })

  it('serializes without XSS vectors', () => {
    const schema = buildHerbArticleSchema({
      ...base,
      headline: '\"><script>alert(1)</script>',
    })
    const serialized = serializeJsonLd(schema)
    expect(serialized).not.toContain('<script>')
    expect(serialized).not.toContain('\">')
  })
})
