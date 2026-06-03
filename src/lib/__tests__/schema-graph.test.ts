import { describe, expect, it } from 'vitest'
import { buildGoalSchemaGraph, buildProfileSchemaGraph, buildSchemaGraph } from '@/lib/schema-graph'

describe('schema-graph', () => {
  it('builds a single @context graph without nested contexts', () => {
    const graph = buildProfileSchemaGraph({
      kind: 'herb',
      slug: 'ashwagandha',
      herb: {
        name: 'Ashwagandha',
        slug: 'ashwagandha',
        description: 'Test herb profile.',
        breadcrumbId: 'https://www.thehippiescientist.net/herbs/ashwagandha/#breadcrumb',
      },
      breadcrumbs: [
        { name: 'Herbs', url: 'https://www.thehippiescientist.net/herbs/' },
        { name: 'Ashwagandha', url: 'https://www.thehippiescientist.net/herbs/ashwagandha/' },
      ],
      product: null,
    })

    expect(graph['@context']).toBe('https://schema.org')
    expect(Array.isArray(graph['@graph'])).toBe(true)
    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.length).toBeGreaterThanOrEqual(2)
    for (const node of nodes) {
      expect(node['@context']).toBeUndefined()
    }
    const webpage = nodes.find(node => node['@id'] === 'https://www.thehippiescientist.net/herbs/ashwagandha/#webpage')
    expect(webpage?.url).toBe('https://www.thehippiescientist.net/herbs/ashwagandha/')
    expect(webpage?.mainEntityOfPage).toBe('https://www.thehippiescientist.net/herbs/ashwagandha/')
  })

  it('includes FAQ node when questions exist', () => {
    const graph = buildGoalSchemaGraph({
      goalPath: '/goals/sleep',
      title: 'Sleep | The Hippie Scientist',
      description: 'Sleep goal guide.',
      breadcrumbs: [
        { name: 'Goals', url: 'https://www.thehippiescientist.net/goals/' },
        { name: 'Sleep', url: 'https://www.thehippiescientist.net/goals/sleep/' },
      ],
      faqQuestions: [{ question: 'Does it work?', answer: 'It varies.' }],
      itemList: { name: 'Sleep Options', items: [{ name: 'Magnesium', url: '/compounds/magnesium' }] },
    })

    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.some(node => node['@id'] === 'https://www.thehippiescientist.net/goals/sleep/#faq')).toBe(true)
  })

  it('returns empty-safe graph wrapper', () => {
    const graph = buildSchemaGraph([])
    expect(graph['@graph']).toEqual([])
  })
})
