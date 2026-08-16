import { describe, expect, it } from 'vitest'

import {
  buildArticleReferenceSchema,
  buildCitationReadySummary,
  normalizeArticleReferences,
  normalizeCitationMetadata,
  normalizeDoi,
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

function sentenceCount(value: string) {
  return value
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length
}

describe('buildCitationReadySummary', () => {
  it('keeps authored summaries between two and four sentences', () => {
    const summary = buildCitationReadySummary({
      description: 'The first authored sentence states the direct conclusion.',
      keyTakeaways: [
        'The second authored sentence preserves an important qualification.',
        'The third authored sentence adds population context.',
        'The fourth authored sentence adds formulation context.',
        'A fifth sentence should not appear in the concise summary.',
      ],
      sourceCount: 12,
      evidenceGrade: 'B',
    })

    expect(sentenceCount(summary)).toBe(4)
    expect(summary).not.toContain('A fifth sentence')
  })

  it('adds only verifiable page metadata when one authored sentence is available', () => {
    const summary = buildCitationReadySummary({
      description: 'The authored description supplies the scientific conclusion.',
      sourceCount: 7,
      evidenceGrade: 'B',
    })

    expect(sentenceCount(summary)).toBe(2)
    expect(summary).toContain('7 cited sources')
    expect(summary).toContain('overall evidence as B')
  })

  it('deduplicates identical authored sentences', () => {
    const summary = buildCitationReadySummary({
      description: 'Keep this conclusion.',
      keyTakeaways: ['Keep this conclusion.', 'Preserve this limitation.'],
      sourceCount: 3,
    })

    expect(summary.match(/Keep this conclusion\./g)).toHaveLength(1)
    expect(sentenceCount(summary)).toBe(2)
  })
})

describe('article reference normalization', () => {
  it('normalizes DOI URLs and keeps ordinal anchors independent of source identity', () => {
    const refs = normalizeArticleReferences([
      {
        title: 'Trial one',
        authors: 'Example A, Example B',
        journal: 'Example Journal',
        year: 2025,
        doi: 'https://doi.org/10.1000/ABC.123',
      },
      {
        title: 'Trial two',
        pmid: '12345678',
      },
    ])

    expect(refs[0]).toMatchObject({
      n: 1,
      doi: '10.1000/ABC.123',
      url: 'https://doi.org/10.1000/ABC.123',
      sourceId: 'doi:10.1000/abc.123',
    })
    expect(refs[1]).toMatchObject({
      n: 2,
      pmid: '12345678',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
      sourceId: 'pmid:12345678',
    })
  })

  it('prefers an explicit source URL while preserving PMID/DOI identifiers', () => {
    const [ref] = normalizeArticleReferences([
      {
        title: 'Trial',
        pmid: '12345678',
        doi: 'doi:10.1000/test',
        url: 'https://example.org/full-text',
      },
    ])

    expect(ref.url).toBe('https://example.org/full-text')
    expect(ref.pmid).toBe('12345678')
    expect(ref.doi).toBe('10.1000/test')
  })

  it('keeps free-form author strings out of structured scholarly author nodes', () => {
    const [ref] = normalizeArticleReferences([
      { title: 'Trial', authors: 'Smith J, Doe R', pmid: '12345678', year: '2025' },
    ])
    const schema = buildArticleReferenceSchema(ref)

    expect(schema['@type']).toBe('ScholarlyArticle')
    expect(schema['@id']).toBe('https://pubmed.ncbi.nlm.nih.gov/12345678/')
    expect(schema).not.toHaveProperty('author')
    expect(schema.identifier).toEqual([
      { '@type': 'PropertyValue', propertyID: 'PMID', value: '12345678' },
    ])
  })

  it('does not invent a URL or structured identity when only title metadata exists', () => {
    const [ref] = normalizeArticleReferences([{ title: 'Narrative source' }])
    const schema = buildArticleReferenceSchema(ref)

    expect(ref.n).toBe(1)
    expect(ref.sourceId).toBe('title:narrative-source')
    expect(ref.url).toBeUndefined()
    expect(schema).not.toHaveProperty('@id')
    expect(schema).not.toHaveProperty('url')
  })

  it('normalizes common DOI prefixes without lowercasing the visible DOI value', () => {
    expect(normalizeDoi(' DOI: 10.1000/ABC.XYZ ')).toBe('10.1000/ABC.XYZ')
    expect(normalizeDoi('https://dx.doi.org/10.1000/ABC.XYZ')).toBe('10.1000/ABC.XYZ')
  })
})

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

  it('rotates category fallbacks around the current article', () => {
    const pages = [
      page('one', 'Research'),
      page('two', 'Research'),
      page('three', 'Research'),
      page('four', 'Research'),
    ]

    expect(resolveRelatedArticles(pages[2], pages, 3).map((article) => article.slug)).toEqual([
      'four',
      'one',
      'two',
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
