import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GoalTopAffiliatePicks from '../GoalTopAffiliatePicks'

describe('GoalTopAffiliatePicks', () => {
  it('turns a goal shortlist into a small, safety-framed sourcing endpoint', () => {
    render(<GoalTopAffiliatePicks goalSlug='stress' limit={3} />)

    expect(screen.getByRole('heading', { name: 'Sourcing examples for this goal' })).toBeInTheDocument()
    expect(screen.getByText(/not prescriptions/i)).toBeInTheDocument()
    expect(screen.queryByText(/best overall/i)).not.toBeInTheDocument()

    const productLinks = screen.getAllByRole('link', { name: /sourcing on amazon/i })
    expect(productLinks).toHaveLength(3)
    productLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'nofollow sponsored noopener noreferrer')
    })
  })
})
