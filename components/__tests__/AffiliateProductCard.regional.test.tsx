import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AffiliateProductCard from '../AffiliateProductCard'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span aria-label={alt} role="img" />,
}))

describe('AffiliateProductCard regional URLs', () => {
  it('uses an explicitly configured regional URL when preferredRegion is available', () => {
    render(
      <AffiliateProductCard
        product={{
          title: 'Test Magnesium',
          affiliateUrl: 'https://www.amazon.com/test-magnesium',
          preferredRegion: 'UK',
          regionalUrls: {
            US: 'https://www.amazon.com/test-magnesium',
            UK: 'https://www.amazon.co.uk/test-magnesium',
          },
        }}
      />,
    )

    expect(screen.getByRole('link', { name: /check current price/i })).toHaveAttribute(
      'href',
      'https://www.amazon.co.uk/test-magnesium',
    )
  })

  it('falls back to the US URL when the preferred regional URL is missing', () => {
    render(
      <AffiliateProductCard
        product={{
          title: 'Test Theanine',
          affiliateUrl: 'https://retailer.example/default-theanine',
          preferredRegion: 'CA',
          regionalUrls: {
            US: 'https://www.amazon.com/test-theanine',
          },
        }}
      />,
    )

    expect(screen.getByRole('link', { name: /check current price/i })).toHaveAttribute(
      'href',
      'https://www.amazon.com/test-theanine',
    )
  })

  it('keeps sponsored affiliate rel values on outbound links', () => {
    render(
      <AffiliateProductCard
        product={{
          title: 'Test Rhodiola',
          affiliateUrl: 'https://www.amazon.com/test-rhodiola',
        }}
      />,
    )

    expect(screen.getByRole('link', { name: /check current price/i })).toHaveAttribute(
      'rel',
      'sponsored nofollow noopener noreferrer',
    )
  })
})
