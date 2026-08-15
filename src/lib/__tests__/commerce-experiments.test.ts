import { describe, expect, it } from 'vitest'
import { allowedCommercePlacement, commerceCtaLabel, shouldShowCommerceForIntent } from '../commerce-experiments'

describe('commerce experiment guardrails', () => {
  it('never moves affiliate modules ahead of evidence on research-oriented route families', () => {
    expect(allowedCommercePlacement('herb-profile', 'top-commercial-section')).toBe('post-evidence')
    expect(allowedCommercePlacement('compound-profile', 'top-commercial-section')).toBe('post-evidence')
    expect(allowedCommercePlacement('comparison', 'top-commercial-section')).toBe('post-evidence')
    expect(allowedCommercePlacement('best-supplements', 'top-commercial-section')).toBe('post-evidence')
  })

  it('allows the placement experiment only on the dedicated buying guide', () => {
    expect(allowedCommercePlacement('buy-guide', 'top-commercial-section')).toBe('top-commercial-section')
  })

  it('limits commerce-heavy treatment to commercial route families', () => {
    expect(shouldShowCommerceForIntent('buy-guide')).toBe(true)
    expect(shouldShowCommerceForIntent('comparison')).toBe(true)
    expect(shouldShowCommerceForIntent('best-supplements')).toBe(true)
    expect(shouldShowCommerceForIntent('herb-profile')).toBe(false)
  })

  it('uses informative CTA language instead of a generic price-only prompt', () => {
    expect(commerceCtaLabel('view-details')).toBe('View product details')
    expect(commerceCtaLabel('compare-options')).toBe('Compare current sourcing options')
  })
})
