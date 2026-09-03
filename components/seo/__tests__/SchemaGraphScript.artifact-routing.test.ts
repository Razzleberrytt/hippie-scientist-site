import { describe, expect, it } from 'vitest'

import { getEntityArtifact } from '../SchemaGraphScript'

function graph(kind: 'herbs' | 'compounds', slug: string) {
  const canonicalUrl = `https://thehippiescientist.net/${kind}/${slug}/`
  return {
    '@context': 'https://schema.org',
    '@graph': [{
      '@type': 'Thing',
      '@id': `${canonicalUrl}#entity`,
      name: slug,
      url: canonicalUrl,
    }],
  }
}

describe('SchemaGraphScript artifact routing', () => {
  it('points alias-served herb pages at their existing botanical-record artifact', () => {
    expect(getEntityArtifact(graph('herbs', 'passionflower'))?.href)
      .toBe('/data/ai-entities/herb/passiflora-incarnata.json')
    expect(getEntityArtifact(graph('herbs', 'kava'))?.href)
      .toBe('/data/ai-entities/herb/piper-methysticum.json')
  })

  it('does not advertise a compound artifact for whole-botanical cross-taxonomy aliases', () => {
    expect(getEntityArtifact(graph('compounds', 'garlic'))?.href)
      .toBe('/data/ai-entities/herb/allium-sativum.json')
    expect(getEntityArtifact(graph('compounds', 'valerian'))?.href)
      .toBe('/data/ai-entities/herb/valeriana-officinalis.json')
    expect(getEntityArtifact(graph('compounds', 'reishi'))?.href)
      .toBe('/data/ai-entities/herb/ganoderma-lucidum.json')
  })

  it('keeps ordinary profile artifact routes unchanged', () => {
    expect(getEntityArtifact(graph('compounds', 'magnesium'))?.href)
      .toBe('/data/ai-entities/compound/magnesium.json')
  })
})
