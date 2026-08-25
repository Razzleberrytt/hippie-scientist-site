import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from '../schema-injector'
import {
  AUTHOR_SCHEMA_ID,
  AUTHOR_URL,
  ORGANIZATION_SCHEMA_ID,
} from '../schema-identities'

describe('ADHD guide first-party schema identity regression', () => {
  it('normalizes historical page-local authority shapes at the serialization boundary', () => {
    const historicalAdhdGuidePayload = {
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
    }

    const parsed = JSON.parse(serializeJsonLd(historicalAdhdGuidePayload))
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
})
