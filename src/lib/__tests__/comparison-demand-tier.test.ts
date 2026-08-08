import { describe, expect, it } from 'vitest'
import { classifyObservedDemand, observedDemandRank, recommendEditorialAction } from '@/lib/comparison-demand-tier'

describe('comparison observed demand tiers', () => {
  it('requires both sample size and meaningful demand for high confidence', () => {
    expect(classifyObservedDemand({ impressions: 24, clicks: 7, ctr: 7 / 24, observedBehaviorScore: 6.2 })).toBe('high-confidence')
    expect(classifyObservedDemand({ impressions: 4, clicks: 4, ctr: 1, observedBehaviorScore: 6.2 })).not.toBe('high-confidence')
  })

  it('separates promising, emerging, and insufficient signals', () => {
    expect(classifyObservedDemand({ impressions: 14, clicks: 3, ctr: 3 / 14, observedBehaviorScore: 3.4 })).toBe('promising')
    expect(classifyObservedDemand({ impressions: 8, clicks: 1, ctr: 0.125, observedBehaviorScore: 1.4 })).toBe('emerging')
    expect(classifyObservedDemand({ impressions: 3, clicks: 1, ctr: 1 / 3, observedBehaviorScore: 1.2 })).toBe('insufficient')
  })

  it('orders tiers for editorial queue sorting', () => {
    expect(observedDemandRank('high-confidence')).toBeGreaterThan(observedDemandRank('promising'))
    expect(observedDemandRank('promising')).toBeGreaterThan(observedDemandRank('emerging'))
    expect(observedDemandRank('emerging')).toBeGreaterThan(observedDemandRank('insufficient'))
  })

  it('does not recommend building a high-demand comparison until evidence is adequate', () => {
    expect(recommendEditorialAction('high-confidence', 2)).toBe('build-next')
    expect(recommendEditorialAction('high-confidence', 1)).toBe('research-first')
    expect(recommendEditorialAction('promising', 2)).toBe('validate-and-outline')
    expect(recommendEditorialAction('promising', 1)).toBe('research-first')
    expect(recommendEditorialAction('emerging', 3)).toBe('keep-observing')
    expect(recommendEditorialAction('insufficient', 3)).toBe('no-action')
  })
})
