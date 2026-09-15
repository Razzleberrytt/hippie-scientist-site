import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SafetyBox from '../SafetyBox'

describe('SafetyBox', () => {
  it('keeps a single note in the normal stacked layout', () => {
    const { container } = render(
      <SafetyBox notes={[{ severity: 'caution', text: 'Review medications before use.' }]} />,
    )

    expect(screen.getByText(/Review medications before use/)).toBeTruthy()
    expect(container.querySelector('[aria-label="Safety and caution notes"]')).toBeNull()
    expect(container.querySelector('[data-mobile-safety-stack="true"]')).toBeNull()
  })

  it('renders multiple essential notes as a visible mobile stack instead of a swipe rail', () => {
    render(
      <SafetyBox
        heading="Safety checks"
        notes={[
          { severity: 'caution', text: 'Review sedative combinations.' },
          { severity: 'warning', text: 'Avoid during pregnancy unless medically directed.' },
        ]}
      />,
    )

    const stack = screen.getByLabelText('Safety and caution notes')
    expect(stack.getAttribute('data-mobile-safety-stack')).toBe('true')
    expect(stack.className).toContain('grid')
    expect(stack.className).not.toContain('overflow-x-auto')
    expect(stack.className).not.toContain('snap-x')
    expect(screen.queryByText(/Swipe or scroll sideways/)).toBeNull()

    const warningCard = screen.getByText(/Avoid during pregnancy/).closest('div')
    expect(warningCard?.className).not.toContain('max-h-52')
    expect(warningCard?.className).not.toContain('overflow-y-auto')
  })
})
