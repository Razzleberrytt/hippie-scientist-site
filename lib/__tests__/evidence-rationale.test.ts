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

  it('leaves bias unassessed when only study designs are known', () => {
    expect(buildEvidenceRationale([claim('RCT')]).riskOfBias).toBeNull()
    expect(buildEvidenceRationale([claim('small human intervention trial')]).riskOfBias).toBeNull()
    expect(buildEvidenceRationale([claim('animal study')]).riskOfBias).toBeNull()
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

  it('uses directional negative findings to flag mixed evidence, even if other designs are not classified', () => {
    const rationale = buildEvidenceRationale([claim('RCT'), claim('negative_randomized_trial')])
    expect(rationale.consistency).toBe('Mixed')
  })

  it('will not call thin evidence consistent', () => {
    // Two agreeing trials is not a consistent literature; "nothing disagreed"
    // mostly means there was little to disagree with.
    expect(buildEvidenceRationale([claim('RCT'), claim('RCT')]).consistency).toBeNull()
    expect(buildEvidenceRationale([claim('RCT'), claim('RCT'), claim('RCT')]).consistency).toBeNull()
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
  const human = [
    { ...claim('RCT'), pmid: '12345678' },
    { ...claim('RCT'), pmid: '23456789' },
  ]

  it('does not infer Grade A certainty from study identity and design alone', () => {
    expect(gradeIsBackedByEvidence('A', buildEvidenceRationale(human))).toMatchObject({ backed: false, reason: 'grade-a-certainty-not-assessed' })
    expect(gradeIsBackedByEvidence('B', buildEvidenceRationale(human)).backed).toBe(true)
  })

  it('supports an explicitly assessed Grade A while retaining independent publication identities', () => {
    const rationale = { ...buildEvidenceRationale(human), riskOfBias: 'Low' as const, consistency: 'Consistent' as const }
    expect(gradeIsBackedByEvidence('A', rationale).backed).toBe(true)
  })

  it('withholds a strong grade when authored evidence plainly conflicts with it', () => {
    const rationale = { ...buildEvidenceRationale(human), riskOfBias: 'Low' as const, consistency: 'Consistent' as const }
    expect(gradeIsBackedByEvidence('A', rationale, 'Limited/modest evidence for memory; no two studies showed the same significant changes.')).toMatchObject({ backed: false, reason: 'conflicting-editorial-evidence-signals' })
    expect(gradeIsBackedByEvidence('A', rationale, 'Long-term safety data are limited.').backed).toBe(true)
  })

  it('does not count the same PMID twice across claim and detail sources', () => {
    const rationale = buildEvidenceRationale([
      { ...claim('meta-analysis'), pmid: '26875640' },
      { ...claim('meta-analysis'), pubmedId: '26875640' },
      { ...claim('animal study'), pmid: '34073784' },
    ])
    expect(rationale.totalClaimCount).toBe(3)
    expect(rationale.classifiedStudyCount).toBe(2)
    expect(rationale.humanStudyCount).toBe(1)
    expect(rationale.identifiedHumanStudyCount).toBe(1)
    expect(gradeIsBackedByEvidence('A', rationale)).toMatchObject({
      backed: false,
      reason: 'single-human-study-for-grade-a',
    })
  })

  it('does not turn two unidentifiable claims into two independent publications', () => {
    const rationale = buildEvidenceRationale([claim('RCT'), claim('RCT')])
    expect(rationale.humanStudyCount).toBe(2)
    expect(rationale.identifiedHumanStudyCount).toBe(0)
    expect(gradeIsBackedByEvidence('A', rationale)).toMatchObject({
      backed: false,
      reason: 'no-identifiable-human-publications-for-grade-a',
    })
  })

  it('deduplicates a PMID found in a PubMed source URL as well', () => {
    const rationale = buildEvidenceRationale([
      { ...claim('meta-analysis'), pmid: '24780090' },
      { ...claim('meta-analysis'), source_url: 'https://pubmed.ncbi.nlm.nih.gov/24780090/' },
    ])
    expect(rationale.humanStudyCount).toBe(1)
    expect(gradeIsBackedByEvidence('A', rationale).backed).toBe(false)
  })

  it('flags a strong grade with no human study on the record', () => {
    const rationale = buildEvidenceRationale([claim('animal study'), claim('in vitro assay')])
    expect(gradeIsBackedByEvidence('A', rationale)).toMatchObject({
      backed: false,
      reason: 'no-human-study-recorded',
    })
  })

  it('flags Grade A resting on a single human study', () => {
    const rationale = buildEvidenceRationale([{ ...claim('RCT'), pmid: '12345678' }])
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
