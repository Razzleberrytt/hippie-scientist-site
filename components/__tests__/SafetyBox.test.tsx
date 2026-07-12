import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SafetyBox from '../SafetyBox'

describe('SafetyBox', () => {
  it('keeps a single note in the normal stacked layout', () => {
    const { container } = render(
      <SafetyBox notes={[{ severity: 'caution', text: 'Review medications before use.' }]} />,
    )

    expect(screen.getByText(/Review medications before use/)).toBeTruthy()
    expect(screen.queryByText(/Swipe or scroll sideways/)).toBeNull()
    expect(container.querySelector('[aria-label="Safety and caution notes"]')).toBeNull()
  })

  it('renders multiple notes as a horizontal snap rail', () => {
    render(
      <SafetyBox
        heading="Safety checks"
        notes={[
          { severity: 'caution', text: 'Review sedative combinations.' },
          { severity: 'warning', text: 'Avoid during pregnancy unless medically directed.' },
        ]}
      />,
    )

    const rail = screen.getByLabelText('Safety and caution notes')
    expect(rail.className).toContain('overflow-x-auto')
    expect(rail.className).toContain('snap-x')
    expect(screen.getByText(/Swipe or scroll sideways/)).toBeTruthy()

    const warningCard = screen.getByText(/Avoid during pregnancy/).closest('div')
    expect(warningCard?.className).toContain('snap-start')
    expect(warningCard?.className).toContain('max-h-52')
  })
})
