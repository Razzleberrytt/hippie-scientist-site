import { describe, expect, it } from 'vitest'
import { normalizePlaceholderPublicationDates } from '../SchemaGraphScript'

describe('SEO entry schema publication dates', () => {
  it('removes the legacy placeholder publication date from generated entry articles', () => {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': 'https://thehippiescientist.net/guides/example/#webpage',
          datePublished: '2026-01-01',
        },
      ],
    }

    const normalized = normalizePlaceholderPublicationDates(graph)
    const article = (normalized['@graph'] as Record<string, unknown>[])[0]

    expect(article.datePublished).toBeUndefined()
  })

  it('removes the legacy placeholder even when a real modification date exists', () => {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': 'https://thehippiescientist.net/guides/example/#webpage',
          datePublished: '2026-01-01',
          dateModified: '2026-08-14',
        },
      ],
    }

    const normalized = normalizePlaceholderPublicationDates(graph)
    const article = (normalized['@graph'] as Record<string, unknown>[])[0]

    expect(article.datePublished).toBeUndefined()
    expect(article.dateModified).toBe('2026-08-14')
  })

  it('preserves a non-placeholder publication date', () => {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          '@id': 'https://thehippiescientist.net/guides/example/#webpage',
          datePublished: '2026-07-10',
          dateModified: '2026-08-14',
        },
      ],
    }

    const normalized = normalizePlaceholderPublicationDates(graph)
    const article = (normalized['@graph'] as Record<string, unknown>[])[0]

    expect(article.datePublished).toBe('2026-07-10')
  })
})
