import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import SeeAlsoCluster from '../SeeAlsoCluster'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

async function renderCluster(props: Parameters<typeof SeeAlsoCluster>[0]) {
  const element = await SeeAlsoCluster(props)
  return render(element)
}

describe('SeeAlsoCluster', () => {
  it('renders nothing for a slug that belongs to no cluster', async () => {
    const { container } = await renderCluster({ slug: 'not-a-real-herb', kind: 'herb' })
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a single "guide" link and no per-group headings for a single-cluster entity', async () => {
    await renderCluster({ slug: 'valerian', kind: 'herb' })
    expect(screen.getByText('Also in this cluster')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Sleep & Recovery guide/ })).toHaveAttribute('href', '/goals/sleep')
  })

  it('groups peer links under a per-cluster heading for a multi-cluster entity once the limit allows peers from more than one cluster', async () => {
    await renderCluster({ slug: 'bacopa', kind: 'herb', limit: 20 })
    const links = screen.getAllByRole('link', { name: /Full guide/ })
    expect(links.length).toBeGreaterThan(1)
  })

  it('never links back to the entity itself', async () => {
    await renderCluster({ slug: 'bacopa', kind: 'herb', limit: 20 })
    expect(screen.queryByRole('link', { name: /^Bacopa$/ })).toBeNull()
  })

  it('respects the limit prop on the number of semantic-cluster peer entries shown', async () => {
    await renderCluster({ slug: 'bacopa', kind: 'herb', limit: 1 })
    const clusterRegion = screen.getByRole('region', { name: 'Also in this cluster' })
    const peerLinks = within(clusterRegion)
      .getAllByRole('link')
      .filter((link) => !/Full guide|guide →/.test(link.textContent || ''))
    expect(peerLinks.length).toBeLessThanOrEqual(1)
  })
  it('renders deduped continuation groups even when no semantic cluster exists', async () => {
    await renderCluster({
      slug: 'not-a-real-herb',
      kind: 'herb',
      continuationGroups: [
        {
          title: 'Related Guides',
          links: [
            { href: '/goals/example/', label: 'Example goal' },
            { href: '/goals/example', label: 'Duplicate example goal' },
            { href: '/guides/unique/', label: 'Unique guide' },
          ],
        },
      ],
    })

    const exampleLinks = screen
      .getAllByRole('link')
      .filter((link) => (link.getAttribute('href') || '').replace(/\/+$/, '') === '/goals/example')

    expect(exampleLinks).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Unique guide' })).toHaveAttribute('href', '/guides/unique/')
  })

  it('does not repeat continuation hrefs already owned by semantic-cluster navigation', async () => {
    await renderCluster({
      slug: 'valerian',
      kind: 'herb',
      continuationGroups: [
        {
          title: 'Related Guides',
          links: [
            { href: '/goals/sleep/', label: 'Duplicate sleep goal' },
            { href: '/guides/sleep/unique/', label: 'Unique sleep guide' },
          ],
        },
      ],
    })

    expect(screen.queryByRole('link', { name: 'Duplicate sleep goal' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Unique sleep guide' })).toHaveAttribute('href', '/guides/sleep/unique/')
  })

})
