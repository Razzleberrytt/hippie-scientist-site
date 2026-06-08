import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LibraryEmptyState from '../LibraryEmptyState'

describe('LibraryEmptyState', () => {
  it('renders default title and description', () => {
    render(<LibraryEmptyState />)
    expect(screen.getByText('Nothing found')).toBeTruthy()
    expect(screen.getByText(/Try adjusting your search/)).toBeTruthy()
  })

  it('renders custom title and description', () => {
    render(
      <LibraryEmptyState
        title="No herbs matched"
        description="Broaden your search or browse by goal."
      />
    )
    expect(screen.getByText('No herbs matched')).toBeTruthy()
    expect(screen.getByText(/Broaden your search/)).toBeTruthy()
  })

  it('renders recovery links with arrow', () => {
    render(
      <LibraryEmptyState
        recoveryLinks={[
          { label: 'Browse herbs', href: '/herbs' },
          { label: 'Browse goals', href: '/goals' },
        ]}
      />
    )
    expect(screen.getByText('Browse herbs →')).toBeTruthy()
    expect(screen.getByText('Browse goals →')).toBeTruthy()
  })

  it('renders suggested search chips with correct links', () => {
    render(
      <LibraryEmptyState
        suggestedSearches={['ashwagandha', 'rhodiola']}
      />
    )
    const ashLink = screen.getByText('ashwagandha')
    expect(ashLink.closest('a')?.getAttribute('href')).toContain('/search?q=ashwagandha')

    const rhodLink = screen.getByText('rhodiola')
    expect(rhodLink.closest('a')?.getAttribute('href')).toContain('/search?q=rhodiola')
  })

  it('renders without error when no recovery links or suggested searches', () => {
    const { container } = render(<LibraryEmptyState />)
    expect(container).toBeTruthy()
  })
})
