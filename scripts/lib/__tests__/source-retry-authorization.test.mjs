import { describe, expect, it } from 'vitest'
import { resolveSourceClassAuthorization } from '../source-retry-authorization.mjs'

const task = {
  recommendedSourceClasses: ['regulatory-agency-monograph-guidance'],
  adaptiveRetryAttempts: [
    {
      pass: 'pass_1_strict_high_confidence',
      allowedSourceClasses: ['regulatory-agency-monograph-guidance'],
    },
    {
      pass: 'pass_2_expand_high_quality_classes',
      allowedSourceClasses: [
        'regulatory-agency-monograph-guidance',
        'systematic-review-meta-analysis',
      ],
    },
    {
      pass: 'pass_3_broader_approved_classes',
      allowedSourceClasses: [
        'regulatory-agency-monograph-guidance',
        'systematic-review-meta-analysis',
        'non-randomized-human-study',
      ],
    },
    {
      pass: 'pass_4_stop_manual_review',
      allowedSourceClasses: ['observational-human-evidence'],
    },
  ],
}

describe('resolveSourceClassAuthorization', () => {
  it('accepts an initially recommended source class', () => {
    expect(resolveSourceClassAuthorization(task, 'regulatory-agency-monograph-guidance')).toEqual({
      authorized: true,
      source: 'initial',
      pass: 'initial_recommended',
    })
  })

  it('accepts a class explicitly authorized by a recorded retry pass', () => {
    expect(resolveSourceClassAuthorization(task, 'non-randomized-human-study')).toEqual({
      authorized: true,
      source: 'adaptive_retry',
      pass: 'pass_3_broader_approved_classes',
    })
  })

  it('rejects a class absent from every executed authorization pass', () => {
    expect(resolveSourceClassAuthorization(task, 'traditional-use-monograph')).toEqual({
      authorized: false,
      source: 'none',
      pass: null,
    })
  })

  it('does not treat the manual-stop pass as source authorization', () => {
    expect(resolveSourceClassAuthorization(task, 'observational-human-evidence')).toEqual({
      authorized: false,
      source: 'none',
      pass: null,
    })
  })
})
