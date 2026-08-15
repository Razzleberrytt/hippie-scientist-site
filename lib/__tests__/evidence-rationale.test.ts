import { describe, expect, it } from 'vitest'

import { buildEvidenceRationale, gradeIsBackedByEvidence } from '@/lib/evidence-rationale'

/**
 * These three fields drive the evidence rationale card readers see beside a
 * grade. Overstating any of them tells a reader the evidence is better vetted
 * than it is, so the null cases matter as much as the populated ones.
 */

const claim = (source: string) => ({ study_class_source: source })

describe('buildEvidenceRationale', () => {
  it('reports the strongest recorded design as the design match', () => {
    const rationale = buildEvidenceRationale([
      claim('RCT'),
      claim('systematic review and meta-analysis of randomized trials'),
      claim('animal study'),
    ])
    expect(rationale.designMatch).toBe('Meta-analysis')
    expect(rationale.strongestClass).toBe('meta-analysis')
    expect(rationale.classifiedStudyCount).toBe(3)
  })

  it('counts only designs that measured an outcome in people as human studies', () => {
    const rationale = buildEvidenceRationale([claim('RCT'), claim('animal study'), claim('in vitro assay')])
    expect(rationale.humanStudyCount).toBe(1)
    expect(rationale.totalClaimCount).toBe(3)
  })

  it('grades risk of bias from the strongest design', () => {
    expect(buildEvidenceRationale([claim('RCT')]).riskOfBias).toBe('Low')
    expect(buildEvidenceRationale([claim('small human intervention trial')]).riskOfBias).toBe('Medium')
    expect(buildEvidenceRationale([claim('animal study')]).riskOfBias).toBe('High')
  })

  it('honours a study that flags its own bias problem', () => {
    // Real value: `systematic_review_meta_analysis_high_bias`. Without this the
    // design alone would score Low.
    const rationale = buildEvidenceRationale([claim('systematic_review_meta_analysis_high_bias')])
    expect(rationale.riskOfBias).toBe('High')
  })

  it('leaves risk of bias unassessed when no design was recorded', () => {
    // 91 claims say `needs_classification`; scoring those High would report a
    // missing record as a badly designed study.
    const rationale = buildEvidenceRationale([claim('needs_classification')])
    expect(rationale.riskOfBias).toBeNull()
    expect(rationale.designMatch).toBeNull()
    expect(rationale.summary).toContain('No study design has been recorded')
  })

  it('calls the evidence mixed when the record says findings disagree', () => {
    expect(buildEvidenceRationale([claim('meta_analysis_mixed_result')]).consistency).toBe('Mixed')
    expect(buildEvidenceRationale([claim('small_randomized_trials_inconsistent')]).consistency).toBe('Mixed')
  })

  it('calls the evidence mixed when some but not all findings were negative', () => {
    const rationale = buildEvidenceRationale([claim('RCT'), claim('negative_randomized_trial')])
    expect(rationale.consistency).toBe('Mixed')
  })

  it('will not call thin evidence consistent', () => {
    // Two agreeing trials is not a consistent literature; "nothing disagreed"
    // mostly means there was little to disagree with.
    expect(buildEvidenceRationale([claim('RCT'), claim('RCT')]).consistency).toBeNull()
    expect(buildEvidenceRationale([claim('RCT'), claim('RCT'), claim('RCT')]).consistency).toBe('Consistent')
  })

  it('returns an all-null rationale for a profile with no claims', () => {
    // The common case: 303 of 445 indexable profiles have no claim at all.
    const rationale = buildEvidenceRationale([])
    expect(rationale).toMatchObject({
      designMatch: null,
      riskOfBias: null,
      consistency: null,
      humanStudyCount: 0,
      totalClaimCount: 0,
    })
  })
})

describe('gradeIsBackedByEvidence', () => {
  const human = [claim('RCT'), claim('RCT')]

  it('accepts a strong grade backed by human studies', () => {
    expect(gradeIsBackedByEvidence('A', buildEvidenceRationale(human)).backed).toBe(true)
    expect(gradeIsBackedByEvidence('B', buildEvidenceRationale(human)).backed).toBe(true)
  })

  it('flags a strong grade with no human study on the record', () => {
    const rationale = buildEvidenceRationale([claim('animal study'), claim('in vitro assay')])
    expect(gradeIsBackedByEvidence('A', rationale)).toMatchObject({
      backed: false,
      reason: 'no-human-study-recorded',
    })
  })

  it('flags Grade A resting on a single human study', () => {
    const rationale = buildEvidenceRationale([claim('RCT')])
    expect(gradeIsBackedByEvidence('A', rationale).reason).toBe('single-human-study-for-grade-a')
    // The same evidence is enough for a B.
    expect(gradeIsBackedByEvidence('B', rationale).backed).toBe(true)
  })

  it('flags a strong grade with no claims recorded at all', () => {
    expect(gradeIsBackedByEvidence('A', buildEvidenceRationale([])).reason).toBe('no-claims-recorded')
  })

  it('does not police grades that make no strong claim', () => {
    for (const grade of ['C', 'D', 'Avoid/Insufficient', null]) {
      expect(gradeIsBackedByEvidence(grade, buildEvidenceRationale([])).backed).toBe(true)
    }
  })
})
