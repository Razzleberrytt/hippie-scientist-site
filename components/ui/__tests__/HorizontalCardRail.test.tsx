import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import HorizontalCardRail from '../HorizontalCardRail'

describe('HorizontalCardRail', () => {
  it('makes multiple mobile cards a labeled, keyboard-reachable snap rail', () => {
    render(
      <HorizontalCardRail label="Product recommendation options">
        <article>Budget option</article>
        <article>Premium option</article>
      </HorizontalCardRail>,
    )

    const rail = screen.getByRole('list', { name: 'Product recommendation options' })

    expect(rail).toHaveAttribute('tabindex', '0')
    expect(rail.className).toContain('overflow-x-auto')
    expect(rail.className).toContain('snap-x')
    expect(within(rail).getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Swipe to compare')).toBeVisible()
  })

  it('omits the swipe cue when there is only one card', () => {
    render(
      <HorizontalCardRail label="Single recommendation">
        <article>Only option</article>
      </HorizontalCardRail>,
    )

    expect(screen.queryByText('Swipe to compare')).not.toBeInTheDocument()
  })
})
