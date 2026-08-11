import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SafetyBadge from '../SafetyBadge'

describe('SafetyBadge', () => {
  it('keeps pending-review workflow state out of reader-facing copy', () => {
    render(<SafetyBadge />)

    expect(screen.getByText('Safety data limited')).toBeInTheDocument()
    expect(screen.queryByText('Safety review pending')).not.toBeInTheDocument()
    expect(screen.getByText('Safety data limited')).toHaveAttribute(
      'aria-label',
      'Safety data are limited; use caution and review the full profile before choosing.',
    )
  })

  it('preserves substantive safety labels', () => {
    render(<SafetyBadge level='Interaction risk' />)
    expect(screen.getByText('Interaction risk')).toBeInTheDocument()
  })
})
