import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SourcingCta } from '../SourcingCta'

describe('SourcingCta', () => {
  it('does not compete with a curated profile product set', () => {
    render(
      <SourcingCta
        record={{ slug: 'ashwagandha', affiliate_query: 'ashwagandha' }}
        displayName='Ashwagandha'
      />,
    )

    expect(screen.queryByRole('link', { name: /check sourcing options/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/review available sources/i)).not.toBeInTheDocument()
  })

  it('keeps the generic fallback for profiles without a curated product set', () => {
    render(
      <SourcingCta
        record={{ slug: 'unlisted-test-botanical', affiliate_query: 'unlisted test botanical' }}
        displayName='Unlisted Test Botanical'
      />,
    )

    const link = screen.getByRole('link', { name: /check sourcing options/i })
    expect(link).toHaveAttribute('rel', 'nofollow sponsored noopener noreferrer')
    expect(link.getAttribute('href')).toContain('amazon.com')
  })
})
