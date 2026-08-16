import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

import EvidenceSummary from '@/components/EvidenceSummary'
import ProfileEvidenceLens from '@/components/ProfileEvidenceLens'
import ProfileHero from '@/components/ProfileHero'

async function checkA11y(container: HTMLElement) {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

describe('a11y (axe-core)', () => {
  it('EvidenceSummary exposes evidence details accessibly', async () => {
    const { container } = render(
      <EvidenceSummary
        record={{
          slug: 'ashwagandha',
          name: 'Ashwagandha',
          evidence_tier: 'moderate',
          evidence_grade: 'B',
          evidence_summary: 'Moderate human evidence for stress-related outcomes.',
          evidence_notes: 'Trials are short and use different extracts.',
        }}
      />
    )
    await checkA11y(container)
  })

  it('ProfileHero remains accessible with practical profile content', async () => {
    const { container } = render(
      <ProfileHero
        name="Ashwagandha"
        summary="A botanical studied for stress and sleep."
        bestFor="Stress"
        mechanisms={['GABA modulation', 'stress response']}
        fallbackSummary="Ashwagandha profile summarizing available evidence, mechanisms, safety context, and practical research notes."
      />
    )
    await checkA11y(container)
  })

  it('ProfileHero remains accessible when optional profile details are absent', async () => {
    const { container } = render(
      <ProfileHero
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
    expect(screen.getByText(/^Mechanistic \/ preclinical:/i)).toBeInTheDocument()
    await checkA11y(container)
  })
})
