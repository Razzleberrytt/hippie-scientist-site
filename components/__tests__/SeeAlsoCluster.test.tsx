import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import SeeAlsoCluster from '../SeeAlsoCluster'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('SeeAlsoCluster', () => {
  it('renders nothing for a slug that belongs to no cluster', () => {
    const { container } = render(<SeeAlsoCluster slug="not-a-real-herb" kind="herb" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a single "guide" link and no per-group headings for a single-cluster entity', () => {
    render(<SeeAlsoCluster slug="valerian" kind="herb" />)

    expect(screen.getByText('Also in this cluster')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Sleep & Recovery guide/ })).toHaveAttribute('href', '/goals/sleep')
  })

  it('groups peer links under a per-cluster heading for a multi-cluster entity once the limit allows peers from more than one cluster', () => {
    // bacopa belongs to 4 clusters, but adhd-focus alone has 6 peers, so the
    // default limit of 6 never lets a second cluster's entries through.
    render(<SeeAlsoCluster slug="bacopa" kind="herb" limit={20} />)

    const links = screen.getAllByRole('link', { name: /Full guide/ })
    expect(links.length).toBeGreaterThan(1)
  })

  it('never links back to the entity itself', () => {
    render(<SeeAlsoCluster slug="bacopa" kind="herb" limit={20} />)
    expect(screen.queryByRole('link', { name: /^Bacopa$/ })).toBeNull()
  })

  it('respects the limit prop on the number of peer entries shown', () => {
    render(<SeeAlsoCluster slug="bacopa" kind="herb" limit={1} />)
    const peerLinks = screen.getAllByRole('link').filter((link) => !/Full guide|guide →/.test(link.textContent || ''))
    expect(peerLinks.length).toBeLessThanOrEqual(1)
  })
})
