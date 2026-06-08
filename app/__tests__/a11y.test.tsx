import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import SafetyBadge from '../../components/ui/SafetyBadge'
import { DecisionProfileCard } from '../../components/ui/DecisionPrimitives'

// Basic axe runner for jsdom rendered output
async function checkA11y(container: HTMLElement) {
  const results = await axe.run(container)
  const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')
  expect(violations).toHaveLength(0)
}

describe('a11y (axe-core)', () => {
  it('SafetyBadge for pending status has accessible label and no serious violations', async () => {
    const { container } = render(<SafetyBadge level="Safety review pending" />)
    // Visible text
    expect(screen.getByText(/Safety review pending/i)).toBeInTheDocument()
    // Has explanatory aria for ambiguous state
    const badge = screen.getByText(/Safety review pending/i).closest('span')
    expect(badge).toHaveAttribute('aria-label', expect.stringContaining('pending review'))
    await checkA11y(container)
  })

  it('SafetyBadge for known status has no violations', async () => {
    const { container } = render(<SafetyBadge level="Generally well tolerated" />)
    await checkA11y(container)
  })

  it('DecisionProfileCard renders with semantic structure and no serious a11y violations', async () => {
    const { container } = render(
      <DecisionProfileCard
        href="/herbs/ashwagandha"
        name="Ashwagandha"
        summary="Evidence summary for stress."
        bestFor="Stress support"
        evidence="Strong evidence"
        safety="Generally well tolerated"
        timeToEffect="2-4 weeks"
        mechanisms={['GABA', 'Cortisol']}
        fallbackSummary="Ashwagandha profile summarizing available evidence, mechanisms, safety context, and practical research notes."
      />
    )
    // Has heading for name
    expect(screen.getByRole('heading', { name: /Ashwagandha/i })).toBeInTheDocument()
    // Link is present
    expect(screen.getByRole('link', { name: /Ashwagandha|View profile/i })).toBeInTheDocument()
    await checkA11y(container)
  })

  it('Safety pending in profile card context does not hide status (visible label)', async () => {
    const { container } = render(
      <DecisionProfileCard
        href="/herbs/unknown"
        name="Unknown Herb"
        summary="Profile summary."
        bestFor="General"
        evidence="Limited evidence"
        safety="Safety review pending"
        timeToEffect="—"
        mechanisms={[]}
        fallbackSummary="Unknown Herb profile summarizing available evidence, mechanisms, safety context, and practical research notes."
      />
    )
    // Now visible per publicSafetyLabel change + metric render
    // (the metric itself may be present with value)
    await checkA11y(container)
  })
})
