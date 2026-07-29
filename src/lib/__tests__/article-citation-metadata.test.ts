import { describe, expect, it } from 'vitest'

import {
  normalizeCitationMetadata,
  resolveRelatedArticles,
} from '../article-citation-metadata'

function page(
  slug: string,
  category: string,
  relatedSlugs?: string[]
) {
  return {
    slug,
    title: slug,
    category,
    url: `/articles/${slug}/`,
    relatedSlugs,
  }
}

describe('resolveRelatedArticles', () => {
  const articles = [
    page('current', 'Harm Reduction', ['curated-two', 'curated-one']),
    page('curated-one', 'Neuroscience'),
    page('curated-two', 'History'),
    page('fallback-one', 'Harm Reduction'),
    page('fallback-two', 'Harm Reduction'),
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
    const current = page('current', 'Harm Reduction', [
      'missing',
      'current',
      'curated-one',
    ])

    expect(resolveRelatedArticles(current, articles, 2).map((article) => article.slug)).toEqual([
      'curated-one',
      'fallback-one',
    ])
  })

  it('uses registry relationships when frontmatter has not been migrated', () => {
    const failureChainPages = [
      page('failure-chains-25b-nbome-blotter', 'Harm Reduction'),
      page('failure-chains-oklahoma-bromo-dragonfly', 'Harm Reduction'),
    ]

    const related = resolveRelatedArticles(failureChainPages[0], failureChainPages)

    expect(related.map((article) => article.slug)).toEqual([
      'rhabdomyolysis',
      'failure-chains-oklahoma-bromo-dragonfly',
    ])
    expect(related[0].url).toBe('/learn/rhabdomyolysis/')
  })

  it('honors an explicit empty related-slug list', () => {
    const current = page(
      'failure-chains-25b-nbome-blotter',
      'Harm Reduction',
      []
    )
    const pages = [
      current,
      page('rhabdomyolysis', 'Foundations'),
      page('fallback-one', 'Harm Reduction'),
    ]

    expect(resolveRelatedArticles(current, pages).map((article) => article.slug)).toEqual([
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

  it('honors explicit empty frontmatter arrays', () => {
    expect(
      normalizeCitationMetadata({
        slug: 'failure-chains-25b-nbome-blotter',
        keyTakeaways: [],
        citationQuestions: [],
        canonicalConcepts: [],
      })
    ).toEqual({
      keyTakeaways: [],
      citationQuestions: [],
      canonicalConcepts: [],
    })
  })
})
