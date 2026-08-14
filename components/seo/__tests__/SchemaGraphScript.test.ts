import { describe, expect, it } from 'vitest'
import {
  attachEntityDataset,
  getEntityArtifact,
  normalizeProfileEntitySemantics,
  normalizeProfileReviewSemantics,
} from '../SchemaGraphScript'

describe('SchemaGraphScript AI entity data discovery', () => {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['ChemicalSubstance', 'Thing'],
        '@id': 'https://thehippiescientist.net/compounds/magnesium/#entity',
        name: 'Magnesium',
        url: 'https://thehippiescientist.net/compounds/magnesium/',
      },
      {
        '@type': 'Article',
        '@id': 'https://thehippiescientist.net/compounds/magnesium/#evidence-review',
      },
    ],
  }

  it('derives the sharded JSON-LD artifact from a canonical profile entity', () => {
    expect(getEntityArtifact(graph)).toEqual({
      href: '/data/ai-entities/compound/magnesium.json',
      absoluteUrl: 'https://thehippiescientist.net/data/ai-entities/compound/magnesium.json',
      canonicalUrl: 'https://thehippiescientist.net/compounds/magnesium/',
      entityId: 'https://thehippiescientist.net/compounds/magnesium/#entity',
      name: 'Magnesium',
    })
  })

  it('adds a Dataset node and links it from the entity', () => {
    const artifact = getEntityArtifact(graph)
    const enriched = attachEntityDataset(graph, artifact)
    const nodes = enriched['@graph'] as Record<string, unknown>[]
    const entity = nodes.find((node) => node['@id'] === artifact?.entityId)
    const dataset = nodes.find((node) => node['@id'] === 'https://thehippiescientist.net/compounds/magnesium/#ai-entity-dataset')

    expect(entity?.subjectOf).toEqual({
      '@id': 'https://thehippiescientist.net/compounds/magnesium/#ai-entity-dataset',
    })
    expect(dataset?.url).toBe('https://thehippiescientist.net/data/ai-entities/compound/magnesium.json')
    expect(dataset?.encodingFormat).toBe('application/ld+json')
  })

  it('normalizes herb entities to Substance and removes duplicate MedicalTherapy about nodes', () => {
    const herbGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['MedicalWebPage', 'WebPage'],
          '@id': 'https://thehippiescientist.net/herbs/ashwagandha/#webpage',
          url: 'https://thehippiescientist.net/herbs/ashwagandha/',
          mainEntity: { '@id': 'https://thehippiescientist.net/herbs/ashwagandha/#entity' },
          about: { '@type': 'MedicalTherapy', name: 'Ashwagandha' },
        },
        {
          '@type': ['MedicalSubstance', 'Thing'],
          '@id': 'https://thehippiescientist.net/herbs/ashwagandha/#entity',
          name: 'Ashwagandha',
          url: 'https://thehippiescientist.net/herbs/ashwagandha/',
        },
      ],
    }

    const artifact = getEntityArtifact(herbGraph)
    const normalized = normalizeProfileEntitySemantics(herbGraph, artifact)
    const nodes = normalized['@graph'] as Record<string, unknown>[]
    const webpage = nodes.find((node) => node['@id'] === 'https://thehippiescientist.net/herbs/ashwagandha/#webpage')
    const entity = nodes.find((node) => node['@id'] === artifact?.entityId)

    expect(entity?.['@type']).toBe('Substance')
    expect(webpage?.about).toEqual({ '@id': artifact?.entityId })
    expect(JSON.stringify(normalized)).not.toContain('MedicalSubstance')
    expect(JSON.stringify(normalized)).not.toContain('MedicalTherapy')
  })

  it('does not rewrite compound entity semantics', () => {
    const artifact = getEntityArtifact(graph)
    expect(normalizeProfileEntitySemantics(graph, artifact)).toEqual(graph)
  })

  it('removes reviewedBy when a profile has no actual review date', () => {
    const reviewGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['MedicalWebPage', 'WebPage'],
          '@id': 'https://thehippiescientist.net/compounds/magnesium/#webpage',
          url: 'https://thehippiescientist.net/compounds/magnesium/',
          reviewedBy: { '@type': 'Organization', name: 'The Hippie Scientist' },
        },
        {
          '@type': ['ChemicalSubstance', 'Thing'],
          '@id': 'https://thehippiescientist.net/compounds/magnesium/#entity',
          name: 'Magnesium',
          url: 'https://thehippiescientist.net/compounds/magnesium/',
        },
      ],
    }

    const artifact = getEntityArtifact(reviewGraph)
    const normalized = normalizeProfileReviewSemantics(reviewGraph, artifact)
    const nodes = normalized['@graph'] as Record<string, unknown>[]
    const webpage = nodes.find((node) => node['@id'] === 'https://thehippiescientist.net/compounds/magnesium/#webpage')

    expect(webpage?.reviewedBy).toBeUndefined()
  })

  it('keeps reviewedBy when a profile has an explicit review date', () => {
    const reviewGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['MedicalWebPage', 'WebPage'],
          '@id': 'https://thehippiescientist.net/compounds/magnesium/#webpage',
          url: 'https://thehippiescientist.net/compounds/magnesium/',
          dateReviewed: '2026-08-01',
          reviewedBy: { '@type': 'Organization', name: 'The Hippie Scientist' },
        },
        {
          '@type': ['ChemicalSubstance', 'Thing'],
          '@id': 'https://thehippiescientist.net/compounds/magnesium/#entity',
          name: 'Magnesium',
          url: 'https://thehippiescientist.net/compounds/magnesium/',
        },
      ],
    }

    const artifact = getEntityArtifact(reviewGraph)
    const normalized = normalizeProfileReviewSemantics(reviewGraph, artifact)
    const nodes = normalized['@graph'] as Record<string, unknown>[]
    const webpage = nodes.find((node) => node['@id'] === 'https://thehippiescientist.net/compounds/magnesium/#webpage')

    expect(webpage?.reviewedBy).toEqual({ '@type': 'Organization', name: 'The Hippie Scientist' })
  })

  it('does not mislabel a review date as an evidence article publication date', () => {
    const reviewGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['ChemicalSubstance', 'Thing'],
          '@id': 'https://thehippiescientist.net/compounds/magnesium/#entity',
          name: 'Magnesium',
          url: 'https://thehippiescientist.net/compounds/magnesium/',
        },
        {
          '@type': 'Article',
          '@id': 'https://thehippiescientist.net/compounds/magnesium/#evidence-review',
          datePublished: '2026-08-01',
          dateModified: '2026-08-01',
        },
      ],
    }

    const artifact = getEntityArtifact(reviewGraph)
    const normalized = normalizeProfileReviewSemantics(reviewGraph, artifact)
    const nodes = normalized['@graph'] as Record<string, unknown>[]
    const evidenceArticle = nodes.find((node) => node['@id'] === 'https://thehippiescientist.net/compounds/magnesium/#evidence-review')

    expect(evidenceArticle?.datePublished).toBeUndefined()
    expect(evidenceArticle?.dateModified).toBe('2026-08-01')
  })

  it('ignores non-profile schema graphs', () => {
    const collectionGraph = {
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'CollectionPage', url: 'https://thehippiescientist.net/guides/' }],
    }
    expect(getEntityArtifact(collectionGraph)).toBeNull()
    expect(attachEntityDataset(collectionGraph, null)).toBe(collectionGraph)
    expect(normalizeProfileReviewSemantics(collectionGraph, null)).toBe(collectionGraph)
  })
})
