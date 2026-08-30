import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import RelatedDiscoveryGroups from '../RelatedDiscoveryGroups'

describe('RelatedDiscoveryGroups responsive contract', () => {
  const groups = [
    {
      title: 'Related Herbs',
      links: [
        {
          href: '/herbs/ashwagandha',
          label: 'Ashwagandha',
          sharedClusters: ['stress'],
        },
      ],
    },
    {
      title: 'Safety',
      links: [
        {
          href: '/safety-checker',
          label: 'Safety Checker',
          type: 'safety',
        },
      ],
    },
  ]

  it('stacks groups on small screens instead of requiring a horizontal rail', () => {
    const html = renderToStaticMarkup(<RelatedDiscoveryGroups groups={groups} />)

    expect(html).toContain('grid-cols-1')
    expect(html).toContain('md:grid-cols-2')
    expect(html).toContain('lg:grid-cols-4')
    expect(html).not.toContain('overflow-x-auto')
    expect(html).not.toContain('w-[15rem]')
  })

  it('uses the shared link-list primitive while preserving contextual copy', () => {
    const html = renderToStaticMarkup(<RelatedDiscoveryGroups groups={groups} />)

    expect(html).toContain('hs-linklist')
    expect(html).toContain('hs-linklist__note')
    expect(html).toContain('hs-linklist__arrow')
    expect(html).toContain('Shared topic: Stress')
    expect(html).toContain('Safety context')
    expect(html).toContain('Botanicals connected by the same goals, effects, or research topics.')
  })
})
