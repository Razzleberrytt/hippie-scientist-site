import { describe, it, expect } from 'vitest'
import { normalizeEvidence } from '../evidence-mapping'

describe('evidence-mapping', () => {
  it('correctly defaults with no evidence indicators', () => {
    const result = normalizeEvidence({})
    expect(result.score).toBe(5)
    expect(result.grade).toBe('F')
    expect(result.label).toBe('Evidence-Limited / Theoretical')
  })

  it('calculates robust human clinical trial boosts', () => {
    const result = normalizeEvidence({
      evidence_tier: 'Strong Human Evidence',
      clinical_trial_count: 2,
      meta_analysis_count: 1,
    })
    // baseline = 80, trials = 2 * 8 = 16, meta = 1 * 12 = 12. raw = 108, capped at 100.
    expect(result.score).toBe(100)
    expect(result.grade).toBe('A')
  })

  it('correctly maps moderate human evidence', () => {
    const result = normalizeEvidence({
      evidence_tier: 'Moderate Human Evidence',
      human_studies_count: 1,
    })
    // baseline = 60, human studies = 4. total = 64
    expect(result.score).toBe(64)
    expect(result.grade).toBe('C')
  })

  it('upgrades grade when count is high enough', () => {
    const result = normalizeEvidence({
      evidence_tier: 'Moderate Human Evidence',
      human_studies_count: 3, // +12 -> 72
    })
    expect(result.score).toBe(72)
    expect(result.grade).toBe('B')
  })

  it('correctly categorizes mechanistic context', () => {
    const result = normalizeEvidence({
      evidence_tier: 'Mechanistic Evidence',
      animal_studies_count: 3,
    })
    // baseline = 20, animal = 6 -> 26
    expect(result.score).toBe(26)
    expect(result.grade).toBe('D')
    expect(result.label).toBe('Preclinical Context')
  })
})
