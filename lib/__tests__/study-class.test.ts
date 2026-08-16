import { describe, expect, it } from 'vitest'

import {
  isHumanStudyClass,
  normalizeStudyClass,
  strongestStudyClass,
  studyClassRank,
} from '@/lib/study-class'

/**
 * Every input below appears verbatim in `public/data/claims.json`. The class a
 * study collapses into decides how much weight it carries in an evidence grade,
 * so a regression here silently changes published grades.
 */

describe('normalizeStudyClass', () => {
  it('collapses the three spellings of the same RCT design', () => {
    // 63 + 15 + 5 claims respectively, all one design written three ways.
    expect(normalizeStudyClass('RCT')).toBe('rct')
    expect(normalizeStudyClass('randomized_double_blind_placebo_controlled_trial')).toBe('rct')
    expect(normalizeStudyClass('randomized double-blind placebo-controlled trial')).toBe('rct')
  })

  it('scores a combined design by the strongest design it names', () => {
    // "systematic review and meta-analysis of randomized trials" names three
    // designs; it is a meta-analysis, not an RCT.
    expect(normalizeStudyClass('systematic review and meta-analysis of randomized trials')).toBe('meta-analysis')
    expect(normalizeStudyClass('RCT dose-response meta-analysis')).toBe('meta-analysis')
    expect(normalizeStudyClass('systematic review of RCTs')).toBe('systematic-review')
  })

  it('separates review types that carry very different weight', () => {
    expect(normalizeStudyClass('narrative review')).toBe('narrative-review')
    expect(normalizeStudyClass('umbrella review')).toBe('meta-analysis')
    expect(normalizeStudyClass('cochrane_review_randomized_trials')).toBe('systematic-review')
  })

  it('keeps non-human designs out of the human classes', () => {
    expect(isHumanStudyClass(normalizeStudyClass('animal study'))).toBe(false)
    expect(isHumanStudyClass(normalizeStudyClass('in vitro assay'))).toBe(false)
    expect(isHumanStudyClass(normalizeStudyClass('RCT'))).toBe(true)
  })

  it('recognises official guidance as its own class rather than a trial', () => {
    expect(normalizeStudyClass('FDA regulatory overview')).toBe('regulatory-guidance')
    expect(normalizeStudyClass('official_nutrient_fact_sheet')).toBe('regulatory-guidance')
  })

  it('returns unclassified instead of guessing when no design is recorded', () => {
    // 91 claims say `needs_classification`; inferring a design from that string
    // would manufacture evidence strength out of a to-do marker.
    expect(normalizeStudyClass('needs_classification')).toBe('unclassified')
    expect(normalizeStudyClass('clinical_study_needs_specific_design')).toBe('unclassified')
    expect(normalizeStudyClass('evidence_summary')).toBe('unclassified')
    expect(normalizeStudyClass('')).toBe('unclassified')
    expect(normalizeStudyClass(null)).toBe('unclassified')
    expect(studyClassRank('unclassified')).toBe(0)
  })

  it('treats a governance hold as an absent classification, not a weak study', () => {
    expect(normalizeStudyClass('blocked_until_human_trials')).toBe('unclassified')
    expect(normalizeStudyClass('blocked_low_evidence_safety_risk')).toBe('unclassified')
  })
})

describe('strongestStudyClass', () => {
  it('picks the highest-ranked design backing a claim', () => {
    expect(strongestStudyClass(['animal', 'rct', 'observational'])).toBe('rct')
    expect(strongestStudyClass(['rct', 'meta-analysis'])).toBe('meta-analysis')
  })

  it('returns unclassified for an empty source list', () => {
    expect(strongestStudyClass([])).toBe('unclassified')
  })
})
