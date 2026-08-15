import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import LastUpdatedBadge from '../LastUpdatedBadge'

describe('LastUpdatedBadge', () => {
  it('renders a correction link beside a real review date by default', () => {
    render(<LastUpdatedBadge date="2026-08-15" citationCount={12} />)

    expect(screen.getByText(/Last reviewed:/)).toBeTruthy()
    expect(screen.getByText(/12 sources cited/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Report a correction' })).toHaveAttribute('href', '/info/corrections/')
  })

  it('allows contexts to suppress the correction link explicitly', () => {
    render(<LastUpdatedBadge date="2026-08-15" showCorrectionLink={false} />)
    expect(screen.queryByRole('link', { name: 'Report a correction' })).toBeNull()
  })

  it('does not render review UI when no real review date exists', () => {
    const { container } = render(<LastUpdatedBadge date="" />)
    expect(container).toBeEmptyDOMElement()
  })
})
