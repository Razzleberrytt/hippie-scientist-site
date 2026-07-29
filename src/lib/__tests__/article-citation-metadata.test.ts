import { describe, expect, it } from 'vitest'

import {
  normalizeCitationMetadata,
  resolveRelatedArticles,
} from '../article-citation-metadata'

describe('resolveRelatedArticles', () => {
  const articles = [
    { slug: 'current', category: 'Harm Reduction', relatedSlugs: ['curated-two', 'curated-one'] },
    { slug: 'curated-one', category: 'Neuroscience' },
    { slug: 'curated-two', category: 'History' },
    { slug: 'fallback-one', category: 'Harm Reduction' },
    { slug: 'fallback-two', category: 'Harm Reduction' },
  ]

  it('preserves curated order before category fallbacks', () => {
    expect(resolveRelatedArticles(articles[0], articles).map((article) => article.slug)).toEqual([
      'curated-two',
      'curated-one',
      'fallback-one',
      'fallback-two',
    ])
  })

  it('ignores missing and self-referential slugs', () => {
    const current = {
      slug: 'current',
      category: 'Harm Reduction',
      relatedSlugs: ['missing', 'current', 'curated-one'],
    }

    expect(resolveRelatedArticles(current, articles, 2).map((article) => article.slug)).toEqual([
      'curated-one',
      'fallback-one',
    ])
  })
})

describe('normalizeCitationMetadata', () => {
  it('returns stable empty arrays for optional metadata', () => {
    expect(normalizeCitationMetadata({})).toEqual({
      keyTakeaways: [],
      citationQuestions: [],
      canonicalConcepts: [],
    })
  })
})
