import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import SafetyCautionLevel, { safetyFactorsForRecord } from '../SafetyCautionLevel'

describe('SafetyCautionLevel', () => {
  it('names the active caution tier without asserting a numeric score', () => {
    const { container } = render(<SafetyCautionLevel level="high" />)

    expect(screen.getByText(/high caution/i)).toBeTruthy()
    expect(container.getAttribute('data-safety-level')).toBeNull()
    expect(container.querySelector('[data-safety-level="high"]')).not.toBeNull()
    // The retired gauge published a percentage the three-tier policy cannot
    // support. Nothing in this component may reintroduce one.
    expect(container.textContent).not.toMatch(/\d+\s?%/)
  })

  it('marks exactly one step active and the lower steps as passed', () => {
    const { container } = render(<SafetyCautionLevel level="moderate" />)
    const steps = Array.from(container.querySelectorAll('.hs-caution__step'))

    expect(steps).toHaveLength(3)
    expect(steps.filter((step) => step.getAttribute('data-state') === 'active')).toHaveLength(1)
    expect(steps[0].getAttribute('data-state')).toBe('below')
    expect(steps[1].getAttribute('data-tier')).toBe('moderate')
    expect(steps[2].getAttribute('data-state')).toBe('above')
  })

  it('keeps the tier readable for assistive tech even though the band is decorative', () => {
    const { container } = render(<SafetyCautionLevel level="low" />)

    expect(container.querySelector('.hs-caution__band')?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByText(/caution level: standard/i)).toBeTruthy()
  })

  it('lists the named factors that produced the tier', () => {
    render(
      <SafetyCautionLevel
        level="high"
        factors={[
          { label: 'Interaction-Aware', description: 'Medication context is noted.', tone: 'caution' },
        ]}
      />,
    )

    expect(screen.getByText('Interaction-Aware')).toBeTruthy()
    expect(screen.getByText('Medication context is noted.')).toBeTruthy()
  })

  it('derives factors straight from the record rather than a bespoke mapping', () => {
    const factors = safetyFactorsForRecord({
      safetyNotes: 'Interacts with thyroid medication; monitor liver enzymes.',
    })

    expect(factors.map((factor) => factor.label)).toContain('Interaction-Aware')
    expect(factors.length).toBeLessThanOrEqual(4)
  })
})
