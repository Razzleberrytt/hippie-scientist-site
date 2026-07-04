import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import RelatedDiscoveryGroups from '../RelatedDiscoveryGroups'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('RelatedDiscoveryGroups', () => {
  it('renders nothing when every group has zero links', () => {
    const { container } = render(
      <RelatedDiscoveryGroups groups={[{ title: 'Empty group', links: [] }]} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when there are no groups at all', () => {
    const { container } = render(<RelatedDiscoveryGroups groups={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('filters out empty groups but keeps groups that have links', () => {
    render(
      <RelatedDiscoveryGroups
        groups={[
          { title: 'Empty group', links: [] },
          { title: 'Populated group', links: [{ href: '/herbs/ashwagandha/', label: 'Ashwagandha' }] },
        ]}
      />,
    )

    expect(screen.queryByText('Empty group')).toBeNull()
    expect(screen.getByText('Populated group')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ashwagandha' })).toHaveAttribute('href', '/herbs/ashwagandha/')
  })

  it('caps rendered links per group at 4', () => {
    const links = Array.from({ length: 6 }, (_, i) => ({ href: `/herbs/herb-${i}/`, label: `Herb ${i}` }))
    render(<RelatedDiscoveryGroups groups={[{ title: 'Many links', links }]} />)

    expect(screen.getAllByRole('link')).toHaveLength(4)
  })

  it('uses default eyebrow/title copy when not overridden', () => {
    render(<RelatedDiscoveryGroups groups={[{ title: 'Group', links: [{ href: '/a/', label: 'A' }] }]} />)
    expect(screen.getByText('Continue exploring')).toBeTruthy()
    expect(screen.getByText('Choose a useful next step')).toBeTruthy()
  })

  it('renders the optional group description when provided', () => {
    render(
      <RelatedDiscoveryGroups
        groups={[{ title: 'Group', description: 'A helpful description.', links: [{ href: '/a/', label: 'A' }] }]}
      />,
    )
    expect(screen.getByText('A helpful description.')).toBeTruthy()
  })
})
