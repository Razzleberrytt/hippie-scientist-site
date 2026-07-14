import { describe, expect, it } from 'vitest'
import { isKnownGovernanceHold } from './verify-curated-indexable.mjs'

describe('isKnownGovernanceHold', () => {
  it('recognizes a hidden_until_grounded noindex decision as a known hold', () => {
    expect(
      isKnownGovernanceHold({
        indexability_status: 'NOINDEX',
        robots: 'noindex,follow',
        sitemap_included: false,
        indexability_reasons: ['noindex-decision:hidden_until_grounded'],
      }),
    ).toBe(true)
  })

  it('recognizes a research_only profile status as a known hold', () => {
    expect(
      isKnownGovernanceHold({
        indexability_status: 'NEEDS_REVIEW',
        robots: 'noindex,follow',
        sitemap_included: false,
        indexability_reasons: ['profile-status:research_only', 'non-publishable-profile-status'],
      }),
    ).toBe(true)
  })

  it('does not treat a plain content-quality regression as a known hold', () => {
    expect(
      isKnownGovernanceHold({
        indexability_status: 'NEEDS_REVIEW',
        robots: 'noindex,follow',
        sitemap_included: false,
        indexability_reasons: ['profile-status:partial', 'summary-too-thin', 'summary-quality-missing'],
      }),
    ).toBe(false)
  })

  it('does not treat a governance-shaped reason as a hold if robots/sitemap are inconsistent with it', () => {
    // A stray reason string alone isn't enough — the robots/sitemap_included
    // state must actually match what a real hold produces, otherwise this
    // would mask a genuine data inconsistency instead of a real editorial hold.
    expect(
      isKnownGovernanceHold({
        indexability_status: 'PUBLISH',
        robots: 'index,follow',
        sitemap_included: true,
        indexability_reasons: ['noindex-decision:hidden_until_grounded'],
      }),
    ).toBe(false)
  })

  it('returns false for a missing record', () => {
    expect(isKnownGovernanceHold(null)).toBe(false)
    expect(isKnownGovernanceHold(undefined)).toBe(false)
  })
})
