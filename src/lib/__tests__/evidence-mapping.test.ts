import { describe, expect, it } from 'vitest'
import { normalizeEvidence } from '../evidence-mapping'

describe('evidence-mapping', () => {
  it('delegates an ungraded record to the shared evidence contract', () => {
    const result = normalizeEvidence({})
    expect(result.grade).toBe('C')
    expect(result.score).toBe(50)
    expect(result.label).toBe('Limited evidence')
  })

  it('uses canonical strong evidence without adding a second study-count grade calculation', () => {
    const result = normalizeEvidence({
      evidence_tier: 'Strong Human Evidence',
      clinical_trial_count: 2,
      meta_analysis_count: 1,
    })

    expect(result.grade).toBe('A')
    expect(result.score).toBe(90)
    expect(result.metrics.clinicalTrialCount).toBe(2)
    expect(result.metrics.metaAnalysisCount).toBe(1)
  })

  it('keeps moderate evidence at B even when the study count is small', () => {
    const result = normalizeEvidence({
      evidence_tier: 'Moderate Human Evidence',
      human_studies_count: 1,
    })

    expect(result.grade).toBe('B')
    expect(result.score).toBe(70)
    expect(result.metrics.humanStudiesCount).toBe(1)
  })

  it('does not upgrade a canonical moderate grade because a count is high', () => {
    const result = normalizeEvidence({
      evidence_grade: 'B',
      evidence_tier: 'Moderate Human Evidence',
      human_studies_count: 30,
      meta_analysis_count: 10,
    })

    expect(result.grade).toBe('B')
    expect(result.score).toBe(70)
  })

  it('keeps mechanistic context at canonical grade D', () => {
    const result = normalizeEvidence({
      evidence_tier: 'Mechanistic Evidence',
      animal_studies_count: 3,
    })

    expect(result.grade).toBe('D')
    expect(result.score).toBe(30)
    expect(result.label).toBe('Limited evidence')
  })

  it('never reintroduces legacy F as an evidence grade', () => {
    const result = normalizeEvidence({ evidence_grade: 'F' })
    expect(result.grade).toBe('Avoid/Insufficient')
    expect(result.score).toBe(5)
  })
})
