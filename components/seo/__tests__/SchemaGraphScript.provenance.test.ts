import { describe, expect, it } from 'vitest'

import { attachEntityDataset, getEntityArtifact } from '../SchemaGraphScript'

describe('SchemaGraphScript dataset provenance', () => {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['ChemicalSubstance', 'Thing'],
        '@id': 'https://thehippiescientist.net/compounds/magnesium/#entity',
        name: 'Magnesium',
        url: 'https://thehippiescientist.net/compounds/magnesium/',
      },
    ],
  }

  it('publishes canonical creator, usage policy, and direct JSON-LD download metadata', () => {
    const artifact = getEntityArtifact(graph)
    const enriched = attachEntityDataset(graph, artifact)
    const nodes = enriched['@graph'] as Record<string, unknown>[]
    const dataset = nodes.find((node) => node['@id'] === 'https://thehippiescientist.net/compounds/magnesium/#ai-entity-dataset') as Record<string, unknown>

    expect(dataset.creator).toEqual({ '@id': 'https://thehippiescientist.net/#organization' })
    expect(dataset.publisher).toEqual({ '@id': 'https://thehippiescientist.net/#organization' })
    expect(dataset.creditText).toBe('The Hippie Scientist')
    expect(dataset.usageInfo).toBe('https://thehippiescientist.net/info/content-licensing/')
    expect(dataset.isBasedOn).toBe('https://thehippiescientist.net/compounds/magnesium/')
    expect(dataset.distribution).toEqual({
      '@type': 'DataDownload',
      contentUrl: 'https://thehippiescientist.net/data/ai-entities/compound/magnesium.json',
      encodingFormat: 'application/ld+json',
    })
  })

  it('does not duplicate the entity subjectOf link or Dataset node when enrichment runs twice', () => {
    const artifact = getEntityArtifact(graph)
    const once = attachEntityDataset(graph, artifact)
    const twice = attachEntityDataset(once, artifact)
    const nodes = twice['@graph'] as Record<string, unknown>[]

    expect(nodes.filter((node) => node['@id'] === 'https://thehippiescientist.net/compounds/magnesium/#ai-entity-dataset')).toHaveLength(1)
    const entity = nodes.find((node) => node['@id'] === artifact?.entityId)
    expect(entity?.subjectOf).toEqual({ '@id': 'https://thehippiescientist.net/compounds/magnesium/#ai-entity-dataset' })
  })
})
