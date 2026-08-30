import { describe, expect, it } from 'vitest'

import { applyFeedbackToSelection } from '../apply-feedback-selection.mjs'
import { angleKey } from '../opportunity-feedback.mjs'

const NOW = new Date('2026-08-30T18:00:00Z')

function candidate(overrides = {}) {
  return {
    id: 'candidate-a',
    eligible: true,
    selectable: true,
    score: 100,
    platform: 'carousel',
    platformScore: 70,
    angle: 'Evidence snapshot angle A',
    ...overrides,
  }
}

function observation(forCandidate, overrides = {}) {
  return {
    candidateId: forCandidate.id,
    platform: forCandidate.platform,
    angleKey: `${forCandidate.id}:${forCandidate.platform}:prior-winning-angle`,
    publishedAt: '2026-08-28T12:00:00.000Z',
    assetViews: 1000,
    qualifiedVisits: 60,
    completionRate: 0.8,
    saveRate: 0.1,
    ...overrides,
  }
}

function selection(candidates) {
  return {
    schemaVersion: '1.2.0',
    status: 'selected',
    selected: candidates[0] || null,
    candidates,
  }
}

describe('feedback-aware distribution selection', () => {
  it('lets sufficiently exposed qualified performance rerank an eligible topic/platform while requiring a fresh angle', () => {
    const leader = candidate({ id: 'leader', score: 100, angle: 'Leader angle' })
    const challenger = candidate({ id: 'challenger', score: 95, angle: 'Fresh challenger angle' })
    const result = applyFeedbackToSelection(selection([leader, challenger]), [observation(challenger)], { now: NOW })

    expect(result.selected.id).toBe('challenger')
    const learned = result.candidates.find((entry) => entry.id === 'challenger')
    expect(learned.feedback.angleKey).toBe(angleKey(challenger))
    expect(learned.feedback.duplicateAngleCount).toBe(0)
    expect(learned.feedback.measured.rewardSampleSufficient).toBe(true)
    expect(learned.feedback.performanceReward).toBeGreaterThan(0)
    expect(learned.feedback.saturationPenalty).toBeGreaterThan(0)
    expect(learned.feedbackAdjustedScore).toBeGreaterThan(leader.score)
  })

  it('withholds positive reward from underpowered observations while preserving the normal saturation penalty', () => {
    const item = candidate()
    const result = applyFeedbackToSelection(selection([item]), [observation(item, { assetViews: 100, qualifiedVisits: 20 })], { now: NOW })

    expect(result.selected.id).toBe(item.id)
    expect(result.selected.feedback.duplicateAngleCount).toBe(0)
    expect(result.selected.feedback.measured.rewardSampleSufficient).toBe(false)
    expect(result.selected.feedback.performanceReward).toBe(0)
    expect(result.selected.feedback.saturationPenalty).toBeGreaterThan(0)
    expect(result.selected.feedbackAdjustedScore).toBeLessThan(item.score)
  })

  it('keeps exact-angle repetition penalized even when the prior asset performed strongly', () => {
    const item = candidate({ score: 100 })
    const exactRepeat = observation(item, { angleKey: angleKey(item) })
    const result = applyFeedbackToSelection(selection([item]), [exactRepeat], { now: NOW })

    expect(result.selected.feedback.duplicateAngleCount).toBe(1)
    expect(result.selected.feedback.duplicatePenalty).toBeGreaterThan(0)
    expect(result.selected.feedbackAdjustedScore).toBeLessThan(item.score + result.selected.feedback.performanceReward)
  })

  it('cannot promote a scientifically ineligible candidate even with strong metrics', () => {
    const safe = candidate({ id: 'safe', score: 80, angle: 'Safe angle' })
    const ineligible = candidate({
      id: 'ineligible',
      eligible: false,
      selectable: false,
      score: 200,
      platform: 'carousel',
      angle: 'Ineligible angle',
    })
    const result = applyFeedbackToSelection(selection([safe, ineligible]), [observation(ineligible)], { now: NOW })

    expect(result.selected.id).toBe('safe')
    expect(result.candidates.find((entry) => entry.id === 'ineligible').eligible).toBe(false)
  })

  it('preserves deterministic base ordering when feedback history is empty', () => {
    const a = candidate({ id: 'a', score: 101, angle: 'A angle' })
    const b = candidate({ id: 'b', score: 100, angle: 'B angle' })
    const result = applyFeedbackToSelection(selection([a, b]), [], { now: NOW })

    expect(result.selected.id).toBe('a')
    expect(result.candidates.map((entry) => entry.feedbackAdjustedScore)).toEqual([101, 100])
  })
})
