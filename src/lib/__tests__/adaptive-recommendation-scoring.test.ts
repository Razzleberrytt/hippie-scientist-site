import { describe, it, expect } from 'vitest'
import { buildAdaptiveRecommendationScores } from '../adaptive-recommendation-scoring'

describe('adaptive-recommendation-scoring', () => {
  const mockSource = {
    slug: 'ashwagandha',
    clusters: ['anxiolytics'],
  }

  it('calculates recommendation scores with no penalties or boosts', () => {
    const candidates = [
      {
        slug: 'l-theanine',
        evidence_tier: 'Strong Human Evidence',
        clusters: ['anxiolytics'],
      },
    ]
    const results = buildAdaptiveRecommendationScores(mockSource, candidates)
    expect(results).toHaveLength(1)
    expect(results[0].slug).toBe('l-theanine')
    // Should have a valid score
    expect(results[0].adaptiveScore).toBeGreaterThan(0)
  })

  it('applies minor penalty for caution safety levels', () => {
    const candidatesNormal = [
      {
        slug: 'l-theanine-normal',
        evidence_tier: 'Moderate Human Evidence',
        safety_level: 'safe',
      },
    ]
    const candidatesCaution = [
      {
        slug: 'l-theanine-caution',
        evidence_tier: 'Moderate Human Evidence',
        safety_level: 'caution',
      },
    ]

    const scoreNormal = buildAdaptiveRecommendationScores(mockSource, candidatesNormal)[0].adaptiveScore
    const scoreCaution = buildAdaptiveRecommendationScores(mockSource, candidatesCaution)[0].adaptiveScore

    // Should have a difference of 5 points
    expect(scoreNormal - scoreCaution).toBe(5)
  })

  it('applies major penalty for warning safety levels and contraindications', () => {
    const candidatesNormal = [
      {
        slug: 'l-theanine-normal',
        evidence_tier: 'Moderate Human Evidence',
        safety_level: 'safe',
      },
    ]
    const candidatesWarning = [
      {
        slug: 'l-theanine-warning',
        evidence_tier: 'Moderate Human Evidence',
        safety_level: 'warning',
        contraindications: ['takes antidepressants'],
      },
    ]

    const scoreNormal = buildAdaptiveRecommendationScores(mockSource, candidatesNormal)[0].adaptiveScore
    const scoreWarning = buildAdaptiveRecommendationScores(mockSource, candidatesWarning)[0].adaptiveScore

    // Should apply -15 (warning) and -5 (contraindications) -> -20 total difference
    expect(scoreNormal - scoreWarning).toBe(20)
  })

  it('applies boost for high clinical trial count', () => {
    const candidatesNormal = [
      {
        slug: 'l-theanine-normal',
        evidence_tier: 'Moderate Human Evidence',
      },
    ]
    const candidatesBoosted = [
      {
        slug: 'l-theanine-boosted',
        evidence_tier: 'Moderate Human Evidence',
        clinical_trial_count: 3, // +6 points
        meta_analysis_count: 1, // +4 points
      },
    ]

    const scoreNormal = buildAdaptiveRecommendationScores(mockSource, candidatesNormal)[0].adaptiveScore
    const scoreBoosted = buildAdaptiveRecommendationScores(mockSource, candidatesBoosted)[0].adaptiveScore

    // Should have +15 points boost (10 from trialBoost, 5 from evidence confidence)
    expect(scoreBoosted - scoreNormal).toBe(15)
  })
})
