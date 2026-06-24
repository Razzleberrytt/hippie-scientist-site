import { render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { getGoal } from '@/data/goals'
import type { EvidenceEnginePayload } from '@/src/lib/evidence-engine'
import GoalDecisionExperience from '@/app/goals/[goal]/GoalDecisionExperience'
import GoalTopAffiliatePicks from '../GoalTopAffiliatePicks'
import ProductTrustAffiliate from '../ProductTrustAffiliate'
import RecommendationSection from '@/components/RecommendationSection'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const evidence: EvidenceEnginePayload = {
  goal: 'anxiety',
  updatedAt: '2026-06-24',
  problemLabels: {},
  claims: [],
  safetyNotes: [],
  sourcesByClaim: {},
}

function enrichedOptionsForGoal(slug: string) {
  const goal = getGoal(slug)
  if (!goal) throw new Error(`Missing goal fixture: ${slug}`)

  return goal.options.map((option) => ({
    option,
    profileHref: `/compounds/${option.slug}`,
    evidenceLabel: option.evidence,
    safetyLabel: option.risk,
  }))
}

describe('goal education-only monetization boundary', () => {
  it('suppresses goal-page affiliate and recommendation UI for anxiety', () => {
    const anxiety = getGoal('anxiety')
    if (!anxiety) throw new Error('Missing anxiety goal')

    render(
      <GoalDecisionExperience
        goal={anxiety}
        enrichedOptions={enrichedOptionsForGoal('anxiety')}
        evidence={evidence}
        isEducationOnly
      />
    )

    expect(screen.queryByText(/Sourcing picks for this goal/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Why we recommend it/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Affiliate-ready sourcing/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Amazon/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/before buying/i)).not.toBeInTheDocument()
  })

  it('suppresses individual monetization components when parent gating is enabled', () => {
    const products = [
      {
        slot: 'overall' as const,
        title: 'Example product',
        brand: 'Example',
        rationale: 'Example rationale',
        affiliateUrl: 'https://www.amazon.com/dp/example?tag=test',
      },
    ]

    const { rerender } = render(<GoalTopAffiliatePicks goalSlug="sleep" suppressMonetization />)
    expect(screen.queryByText(/Sourcing picks for this goal/i)).not.toBeInTheDocument()

    rerender(
      <ProductTrustAffiliate
        productName="Example product"
        href="https://www.amazon.com/dp/example?tag=test"
        rationale="Example rationale"
        suppressMonetization
      />
    )
    expect(screen.queryByRole('link', { name: /Amazon/i })).not.toBeInTheDocument()

    rerender(<RecommendationSection products={products} suppressMonetization />)
    expect(screen.queryByText(/Affiliate-ready sourcing/i)).not.toBeInTheDocument()
  })

  it('keeps sleep, stress, and focus monetization visible when not education-only', () => {
    for (const slug of ['sleep', 'stress', 'focus']) {
      const { unmount } = render(<GoalTopAffiliatePicks goalSlug={slug} />)

      expect(screen.getByText(/Sourcing picks for this goal/i)).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: /Amazon/i }).length).toBeGreaterThan(0)

      unmount()
    }
  })
})
