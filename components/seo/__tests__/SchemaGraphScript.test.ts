import { describe, expect, it } from 'vitest'
import {
  attachEntityDataset,
  getEntityArtifact,
  normalizeProfileEntitySemantics,
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

  it('ignores non-profile schema graphs', () => {
    const collectionGraph = {
      '@context': 'https://schema.org',
      '@graph': [{ '@type': 'CollectionPage', url: 'https://thehippiescientist.net/guides/' }],
    }
    expect(getEntityArtifact(collectionGraph)).toBeNull()
    expect(attachEntityDataset(collectionGraph, null)).toBe(collectionGraph)
  })
})
