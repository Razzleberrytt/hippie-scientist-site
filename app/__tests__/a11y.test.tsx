import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'

import SafetyBadge from '../../components/ui/SafetyBadge'
import { DecisionProfileCard } from '../../components/ui/DecisionPrimitives'
import ProfileEvidenceLens from '../../components/ui/ProfileEvidenceLens'

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

  it('Profile card renders without evidence/safety boxes', async () => {
    const { container } = render(
      <DecisionProfileCard
        href="/herbs/unknown"
        name="Unknown Herb"
        summary="Profile summary."
        bestFor="General"
        mechanisms={[]}
        fallbackSummary="Unknown Herb profile summarizing available evidence, mechanisms, safety context, and practical research notes."
      />
    )
    await checkA11y(container)
  })

  it('ProfileEvidenceLens exposes evidence progress and evidence-type distinctions accessibly', async () => {
    const { container } = render(
      <ProfileEvidenceLens
        record={{
          slug: 'ashwagandha',
          name: 'Ashwagandha',
          evidence_tier: 'moderate',
          mechanisms: ['GABA modulation', 'stress response'],
          primary_effects: ['stress'],
          safetyNotes: 'Review use with sedatives and during pregnancy.',
        }}
        evidenceLevel="Moderate evidence"
        safetySummary="Review use with sedatives and during pregnancy."
        citationsCount={4}
        limitations={['Short trial duration']}
      />
    )

    expect(screen.getByRole('progressbar', { name: /Evidence strength/i })).toBeInTheDocument()
    expect(screen.getByText(/Human clinical evidence/i)).toBeInTheDocument()
    expect(screen.getByText(/Mechanistic/i)).toBeInTheDocument()
    await checkA11y(container)
  })
})
