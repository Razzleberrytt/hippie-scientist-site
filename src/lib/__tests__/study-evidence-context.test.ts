import { describe, expect, it } from 'vitest'
import {
  filterByStudyClass,
  getStudyClassDefinition,
  rankStudyClasses,
  validateEffectContext,
} from '../study-evidence-context'

describe('study evidence context', () => {
  it('labels the canonical source classes in a stable hierarchy', () => {
    expect(rankStudyClasses(['case-report', 'rct', 'meta-analysis', 'preclinical'])).toEqual([
      'meta-analysis',
      'rct',
      'preclinical',
      'case-report',
    ])
    expect(getStudyClassDefinition('rct').label).toBe('Randomized controlled trial')
    expect(getStudyClassDefinition('preclinical').humanEvidence).toBe(false)
  })

  it('filters evidence tables by study class without changing source order', () => {
    const studies = [
      { id: 'a', studyClass: 'rct' as const },
      { id: 'b', studyClass: 'observational' as const },
      { id: 'c', studyClass: 'rct' as const },
    ]

    expect(filterByStudyClass(studies, ['rct']).map((study) => study.id)).toEqual(['a', 'c'])
  })

  it('prevents p-values from becoming the whole evidence story', () => {
    const issues = validateEffectContext({
      statisticalSignificance: 'p = 0.03',
      duration: '8 weeks',
      population: 'Adults with elevated stress',
      replication: 'Not independently replicated',
    })

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['p-value-without-effect-size', 'p-value-without-magnitude-context']),
    )
  })

  it('requires duration, population, replication and uncertainty context', () => {
    const issues = validateEffectContext({
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
      validateEffectContext({
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
