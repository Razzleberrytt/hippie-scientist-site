import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import GoalTopAffiliatePicks from '../GoalTopAffiliatePicks'

describe('goal affiliate tracking context', () => {
  it('labels product links with ingredient, slot, and module context for ClickTracker', () => {
    render(<GoalTopAffiliatePicks goalSlug='stress' limit={3} />)

    const links = screen.getAllByRole('link', { name: /sourcing on amazon/i })
    expect(links).toHaveLength(3)

    expect(links[0]).toHaveAttribute('data-ingredient', 'ashwagandha')
    expect(links[1]).toHaveAttribute('data-ingredient', 'rhodiola')
    expect(links[2]).toHaveAttribute('data-ingredient', 'l-theanine')

    links.forEach((link) => {
      expect(link).toHaveAttribute('data-product-slot', 'overall')
      expect(link).toHaveAttribute('data-tracking-location', 'goal-top-picks')
    })
  })
})
