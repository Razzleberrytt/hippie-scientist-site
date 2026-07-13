import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AffiliateLink } from '../AffiliateLink'
import { getLeadMagnet } from '@/content/emailCapture'
import { getRecommendationsForGoal } from '@/content/recommendations'

describe('monetization infrastructure', () => {
  it('renders affiliate external links with sponsored disclosure attributes', () => {
    render(
      <AffiliateLink href='https://example.com/product' affiliate merchant='Example Merchant'>
        Compare products
      </AffiliateLink>
    )

    const link = screen.getByRole('link', { name: /compare products/i })

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'sponsored nofollow noopener noreferrer')
    expect(screen.getByText(/affiliate link/i)).toBeInTheDocument()
    expect(screen.getByText(/example merchant/i)).toBeInTheDocument()
  })

  it('renders non-affiliate external links without sponsored rel', () => {
    render(<AffiliateLink href='https://example.com/learn'>Read source</AffiliateLink>)

    const link = screen.getByRole('link', { name: /read source/i })

    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders internal links without external rel attributes', () => {
    render(<AffiliateLink href='/info/methodology/'>Methodology</AffiliateLink>)

    const link = screen.getByRole('link', { name: /methodology/i })

    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveAttribute('rel')
  })

  it('provides goal-specific lead magnet copy with default fallback', () => {
    expect(getLeadMagnet('sleep').title).toMatch(/sleep/i)
    expect(getLeadMagnet('not-a-goal').goal).toBe('default')
  })

  it('returns recommendations filtered by goal and limit', () => {
    const recommendations = getRecommendationsForGoal('brain-fog', 2)

    expect(recommendations).toHaveLength(2)
    expect(recommendations.every((item) => item.goal === 'brain-fog')).toBe(true)
  })
})
