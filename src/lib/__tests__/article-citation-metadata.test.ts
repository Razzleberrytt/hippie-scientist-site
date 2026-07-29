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

  it('uses registry relationships when frontmatter has not been migrated', () => {
    const failureChainPages = [
      { slug: 'failure-chains-25b-nbome-blotter', category: 'Harm Reduction' },
      { slug: 'rhabdomyolysis', category: 'Foundations' },
      { slug: 'failure-chains-oklahoma-bromo-dragonfly', category: 'Harm Reduction' },
    ]

    expect(resolveRelatedArticles(failureChainPages[0], failureChainPages).map((article) => article.slug)).toEqual([
      'rhabdomyolysis',
      'failure-chains-oklahoma-bromo-dragonfly',
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

  it('loads registry metadata by article slug', () => {
    const metadata = normalizeCitationMetadata({ slug: 'failure-chains-25b-nbome-blotter' })

    expect(metadata.keyTakeaways).toContain('Blotter paper is a delivery format, not proof that a sample contains LSD.')
    expect(metadata.citationQuestions).toContain('How can seizures lead to rhabdomyolysis and acute kidney injury?')
    expect(metadata.canonicalConcepts).toContain('rhabdomyolysis')
  })

  it('prefers explicit frontmatter over registry values', () => {
    expect(
      normalizeCitationMetadata({
        slug: 'failure-chains-25b-nbome-blotter',
        keyTakeaways: ['Explicit claim'],
      }).keyTakeaways
    ).toEqual(['Explicit claim'])
  })
})
