import { describe, expect, it } from 'vitest'
import { buildGoalSchemaGraph, buildProfileSchemaGraph, buildSchemaGraph, buildSeoEntrySchemaGraph, buildCompareHubSchemaGraph, buildCompareDetailSchemaGraph } from '../schema-graph'

describe('schema-graph', () => {
  it('builds a single @context graph without nested contexts', () => {
    const graph = buildProfileSchemaGraph({
      kind: 'herb',
      slug: 'ashwagandha',
      herb: {
        name: 'Ashwagandha',
        slug: 'ashwagandha',
        description: 'Test herb profile.',
        breadcrumbId: 'https://thehippiescientist.net/herbs/ashwagandha/#breadcrumb',
      },
      breadcrumbs: [
        { name: 'Herbs', url: 'https://thehippiescientist.net/herbs/' },
        { name: 'Ashwagandha', url: 'https://thehippiescientist.net/herbs/ashwagandha/' },
      ],
    })

    expect(graph['@context']).toBe('https://schema.org')
    expect(Array.isArray(graph['@graph'])).toBe(true)
    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.length).toBeGreaterThanOrEqual(2)
    for (const node of nodes) {
      expect(node['@context']).toBeUndefined()
    }
    const webpage = nodes.find(node => node['@id'] === 'https://thehippiescientist.net/herbs/ashwagandha/#webpage')
    expect(webpage?.url).toBe('https://thehippiescientist.net/herbs/ashwagandha/')
    expect(webpage?.mainEntityOfPage).toBe('https://thehippiescientist.net/herbs/ashwagandha/')
  })

  it('includes FAQ node when questions exist', () => {
    const graph = buildGoalSchemaGraph({
      goalPath: '/guides/sleep',
      title: 'Sleep | The Hippie Scientist',
      description: 'Sleep goal guide.',
      breadcrumbs: [
        { name: 'Goals', url: 'https://thehippiescientist.net/goals/' },
        { name: 'Sleep', url: 'https://thehippiescientist.net/guides/sleep/' },
      ],
      faqQuestions: [{ question: 'Does it work?', answer: 'It varies.' }],
      itemList: { name: 'Sleep Options', items: [{ name: 'Magnesium', url: '/compounds/magnesium' }] },
    })

    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.some(node => node['@id'] === 'https://thehippiescientist.net/guides/sleep/#faq')).toBe(true)
  })

  it('returns empty-safe graph wrapper', () => {
    const graph = buildSchemaGraph([])
    expect(graph['@graph']).toEqual([])
  })

  it('builds a consolidated SEO entry page schema graph', () => {
    const graph = buildSeoEntrySchemaGraph({
      route: 'best-supplements-for-sleep',
      title: 'Best Supplements for Sleep | The Hippie Scientist',
      description: 'Find the best sleep options.',
      h1: 'Best Supplements for Sleep',
      faqs: [
        { question: 'What is the best supplement for sleep?', answer: 'Magnesium and Apigenin.' }
      ]
    })

    expect(graph['@context']).toBe('https://schema.org')
    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.length).toBe(3) // Article, BreadcrumbList, FAQPage

    const article = nodes.find(n => n['@type'] === 'Article')
    expect(article?.headline).toBe('Best Supplements for Sleep | The Hippie Scientist')
    expect(article?.url).toBe('https://thehippiescientist.net/best-supplements-for-sleep/')
    expect(article?.breadcrumb).toBeUndefined()
    expect(article?.hasPart).toEqual({ '@id': 'https://thehippiescientist.net/best-supplements-for-sleep/#faq' })

    const breadcrumb = nodes.find(n => n['@type'] === 'BreadcrumbList')
    expect(breadcrumb?.['@id']).toBe('https://thehippiescientist.net/best-supplements-for-sleep/#breadcrumb')

    const faq = nodes.find(n => n['@type'] === 'FAQPage')
    expect(faq?.['@id']).toBe('https://thehippiescientist.net/best-supplements-for-sleep/#faq')
  })

  it('builds a consolidated Compare Hub page schema graph', () => {
    const graph = buildCompareHubSchemaGraph({
      path: '/guides/compare/',
      title: 'Compare Supplements | The Hippie Scientist',
      description: 'Compare side by side.',
      breadcrumbs: [
        { name: 'Home', url: 'https://thehippiescientist.net/' },
        { name: 'Compare', url: 'https://thehippiescientist.net/guides/compare/' }
      ],
      comparisonPairs: [
        { name: 'Ashwagandha vs Rhodiola', url: '/guides/compare/ashwagandha-vs-rhodiola' }
      ]
    })

    expect(graph['@context']).toBe('https://schema.org')
    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.length).toBe(3) // CollectionPage, BreadcrumbList, ItemList

    const collection = nodes.find(n => n['@type'] === 'CollectionPage')
    expect(collection?.name).toBe('Compare Supplements | The Hippie Scientist')
    expect(collection?.url).toBe('https://thehippiescientist.net/guides/compare/')

    const itemList = nodes.find(n => n['@type'] === 'ItemList')
    expect(itemList?.numberOfItems).toBe(1)
  })

  it('builds a consolidated Compare Detail page schema graph', () => {
    const graph = buildCompareDetailSchemaGraph({
      path: '/guides/compare/ashwagandha-vs-rhodiola',
      title: 'Ashwagandha vs Rhodiola | The Hippie Scientist',
      description: 'Ashwagandha vs Rhodiola details.',
      breadcrumbs: [
        { name: 'Home', url: 'https://thehippiescientist.net/' },
        { name: 'Compare', url: 'https://thehippiescientist.net/guides/compare/' },
        { name: 'Ashwagandha vs Rhodiola', url: 'https://thehippiescientist.net/guides/compare/ashwagandha-vs-rhodiola/' }
      ],
      entities: [
        { name: 'Ashwagandha', url: '/herbs/ashwagandha', type: 'herb' },
        { name: 'Rhodiola', url: '/herbs/rhodiola', type: 'herb' }
      ]
    })

    expect(graph['@context']).toBe('https://schema.org')
    const nodes = graph['@graph'] as Record<string, unknown>[]
    expect(nodes.length).toBe(2) // MedicalWebPage, BreadcrumbList

    const webpage = nodes.find(n => Array.isArray(n['@type']) && n['@type'].includes('MedicalWebPage'))
    expect(webpage?.name).toBe('Ashwagandha vs Rhodiola | The Hippie Scientist')
    expect(webpage?.about).toEqual([
      { '@type': 'MedicalTherapy', name: 'Ashwagandha', url: 'https://thehippiescientist.net/herbs/ashwagandha/' },
      { '@type': 'MedicalTherapy', name: 'Rhodiola', url: 'https://thehippiescientist.net/herbs/rhodiola/' }
    ])
  })
})
