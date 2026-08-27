import { describe, expect, it } from 'vitest'

import { angleKey, applyDistributionFeedback, assessDistributionFeedback } from '../opportunity-feedback.mjs'

const NOW = new Date('2026-08-27T00:00:00Z')

function candidate(overrides = {}) {
  return {
    id: 'ashwagandha-human-evidence',
    eligible: true,
    score: 104,
    platform: 'carousel',
    angle: 'Ashwagandha: finding → evidence grade → key limitation → source trail',
    ...overrides,
  }
}

describe('distribution opportunity feedback', () => {
  it('preserves the base score when no history exists', () => {
    const result = applyDistributionFeedback(candidate(), [], { now: NOW })

    expect(result.feedback.adjustment).toBe(0)
    expect(result.feedbackAdjustedScore).toBe(104)
    expect(result.feedback.reasons).toEqual([])
  })

  it('deterministically suppresses a recently repeated angle/platform combination', () => {
    const subject = candidate()
    const history = [{
      candidateId: subject.id,
      platform: subject.platform,
      angleKey: angleKey(subject),
      publishedAt: '2026-08-20T12:00:00Z',
      assetViews: 400,
      qualifiedVisits: 8,
      completionRate: 0.5,
      saveRate: 0.02,
    }]

    const first = applyDistributionFeedback(subject, history, { now: NOW })
    const second = applyDistributionFeedback(subject, history, { now: NOW })

    expect(first).toEqual(second)
    expect(first.feedback.duplicateAngleCount).toBe(1)
    expect(first.feedback.duplicatePenalty).toBe(6)
    expect(first.feedbackAdjustedScore).toBeLessThan(subject.score)
    expect(first.feedback.reasons.join('\n')).toMatch(/matching angle\/platform/i)
  })

  it('withholds positive reward from high-rate but underexposed telemetry', () => {
    const subject = candidate({ platform: 'short-video' })
    const feedback = assessDistributionFeedback(subject, [{
      candidateId: subject.id,
      platform: subject.platform,
      angleKey: 'different-angle',
      publishedAt: '2026-08-24T12:00:00Z',
      assetViews: 24,
      qualifiedVisits: 12,
      completionRate: 1,
      saveRate: 0.5,
    }], { now: NOW })

    expect(feedback.measured.assetViews).toBe(24)
    expect(feedback.measured.rewardSampleSufficient).toBe(false)
    expect(feedback.measured.minimumRewardViews).toBe(250)
    expect(feedback.performanceReward).toBe(0)
    expect(feedback.reasons.join('\n')).toMatch(/reward withheld until at least 250 measured views/i)
  })

  it('rewards sufficiently measured performance only within a bounded adjustment', () => {
    const subject = candidate({ platform: 'short-video' })
    const history = [{
      candidateId: subject.id,
      platform: subject.platform,
      angleKey: 'different-angle',
      publishedAt: '2026-08-24T12:00:00Z',
      assetViews: 1000,
      qualifiedVisits: 60,
      completionRate: 0.8,
      saveRate: 0.08,
    }]

    const feedback = assessDistributionFeedback(subject, history, { now: NOW })

    expect(feedback.measured.rewardSampleSufficient).toBe(true)
    expect(feedback.performanceReward).toBeGreaterThan(0)
    expect(feedback.adjustment).toBeLessThanOrEqual(8)
    expect(feedback.measured.qualifiedVisitRate).toBeCloseTo(0.06)
  })

  it('penalizes adequately measured weak outcomes', () => {
    const subject = candidate({ platform: 'infographic' })
    const feedback = assessDistributionFeedback(subject, [{
      candidateId: subject.id,
      platform: subject.platform,
      angleKey: 'different-angle',
      publishedAt: '2026-08-26T12:00:00Z',
      assetViews: 1000,
      qualifiedVisits: 1,
      completionRate: 0.1,
      saveRate: 0,
    }], { now: NOW })

    expect(feedback.poorPerformancePenalty).toBe(4)
    expect(feedback.adjustment).toBeLessThan(0)
  })

  it('never lets feedback change scientific eligibility', () => {
    const subject = candidate({ eligible: false, score: 150 })
    const result = applyDistributionFeedback(subject, [{
      candidateId: subject.id,
      platform: subject.platform,
      angleKey: 'different-angle',
      publishedAt: '2026-08-26T12:00:00Z',
      assetViews: 1000,
      qualifiedVisits: 100,
      completionRate: 1,
      saveRate: 0.5,
    }], { now: NOW })

    expect(result.eligible).toBe(false)
    expect(result.feedback.performanceReward).toBe(8)
    expect(result.feedbackAdjustedScore).toBe(150)
    expect(result.feedback.policy).toMatch(/cannot.*make an ineligible scientific candidate eligible/i)
  })
})
