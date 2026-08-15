import { describe, expect, it } from 'vitest'
import {
  evidenceStudyClassDefinition,
  filterEvidenceStudiesByClass,
  rankEvidenceStudyClasses,
  validateEvidenceEffectContext,
} from '../evidence-study'

describe('canonical evidence study context', () => {
  it('labels and ranks study classes in one shared hierarchy', () => {
    expect(
      rankEvidenceStudyClasses([
        'case_report',
        'randomized_controlled_trial',
        'meta_analysis',
        'in_vitro',
      ]),
    ).toEqual(['meta_analysis', 'randomized_controlled_trial', 'case_report', 'in_vitro'])
    expect(evidenceStudyClassDefinition('randomized_controlled_trial').label).toBe(
      'Randomized controlled trial',
    )
    expect(evidenceStudyClassDefinition('in_vitro').humanEvidence).toBe(false)
  })

  it('filters evidence rows by study class without changing source order', () => {
    const studies = [
      { id: 'a', evidenceClass: 'randomized_controlled_trial' as const },
      { id: 'b', evidenceClass: 'observational' as const },
      { id: 'c', evidenceClass: 'randomized_controlled_trial' as const },
    ]

    expect(
      filterEvidenceStudiesByClass(studies, ['randomized_controlled_trial']).map((study) => study.id),
    ).toEqual(['a', 'c'])
  })

  it('prevents p-values from becoming the whole evidence story', () => {
    const issues = validateEvidenceEffectContext({
      statisticalSignificance: 'p = 0.03',
      duration: '8 weeks',
      population: 'Adults with elevated stress',
      replication: 'Not independently replicated',
    })

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['p-value-without-effect-size', 'p-value-without-magnitude-context']),
    )
  })

  it('requires uncertainty, duration, population, and replication context', () => {
    const issues = validateEvidenceEffectContext({
      effectSize: 'SMD -0.35',
      clinicalMagnitude: 'Small average reduction',
    })

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'effect-size-without-uncertainty',
        'missing-duration-context',
        'missing-population-context',
        'missing-replication-context',
      ]),
    )
  })

  it('accepts a fully contextualized effect summary', () => {
    expect(
      validateEvidenceEffectContext({
        effectSize: 'SMD -0.35',
        confidenceInterval: '95% CI -0.52 to -0.18',
        statisticalSignificance: 'p < 0.01',
        absoluteDifference: 'About 3 points on the measured scale',
        clinicalMagnitude: 'Small-to-moderate average difference',
        duration: '8 weeks',
        population: 'Adults with elevated stress',
        replication: 'Observed across three independent trials',
      }),
    ).toEqual([])
  })
})
