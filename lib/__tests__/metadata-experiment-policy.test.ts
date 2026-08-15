import { describe, expect, it } from 'vitest'
import {
  classifyMetadataIntent,
  compactExperimentTitle,
  evaluateMetadataExperimentEligibility,
  expectedCtrForPosition,
} from '@/lib/metadata-experiment-policy'

describe('metadata experiment policy', () => {
  it('targets high-impression CTR underperformers rather than winning pages', () => {
    const weak = evaluateMetadataExperimentEligibility({ impressions: 1000, clicks: 10, position: 5 })
    const winner = evaluateMetadataExperimentEligibility({ impressions: 1000, clicks: 80, position: 5 })
    expect(weak.eligible).toBe(true)
    expect(winner.eligible).toBe(false)
    expect(winner.reason).toBe('ctr-performing-at-or-above-threshold')
  })

  it('does not experiment on tiny samples or pages outside the near-page-one window', () => {
    expect(evaluateMetadataExperimentEligibility({ impressions: 50, clicks: 0, position: 7 }).eligible).toBe(false)
    expect(evaluateMetadataExperimentEligibility({ impressions: 500, clicks: 0, position: 22 }).eligible).toBe(false)
  })

  it('classifies query intent before constructing candidate metadata', () => {
    expect(classifyMetadataIntent('magnesium glycinate dosage')).toBe('dose')
    expect(classifyMetadataIntent('ashwagandha side effects')).toBe('safety')
    expect(classifyMetadataIntent('melatonin vs valerian')).toBe('comparison')
  })

  it('keeps primary query early and title width controlled', () => {
    const title = compactExperimentTitle('magnesium glycinate for sleep', 'general')
    expect(title.startsWith('magnesium glycinate for sleep')).toBe(true)
    expect(title.length).toBeLessThanOrEqual(60)
  })

  it('has a decreasing expected CTR baseline across lower positions', () => {
    expect(expectedCtrForPosition(1)).toBeGreaterThan(expectedCtrForPosition(5))
    expect(expectedCtrForPosition(5)).toBeGreaterThan(expectedCtrForPosition(10))
  })
})
