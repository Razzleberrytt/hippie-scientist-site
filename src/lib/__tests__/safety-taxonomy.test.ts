import { describe, expect, it } from 'vitest'
import {
  matchSafetySignals,
  normalizeSafetySignal,
  normalizeSafetySignals,
} from '../safety-taxonomy'

describe('safety taxonomy', () => {
  it('maps overlapping safety language through one canonical vocabulary', () => {
    expect(matchSafetySignals('May increase bleeding risk with anticoagulants and has liver toxicity concerns.')).toEqual([
      'Bleeding',
      'Liver',
      'Toxicity concern',
    ])
  })

  it('recognizes the signal vocabulary used by both research and safety surfaces', () => {
    expect(normalizeSafetySignals('Possible serotonergic interaction with SSRIs; CYP enzyme inhibition is also reported.')).toEqual([
      'Serotonergic',
      'Drug metabolism',
    ])
    expect(normalizeSafetySignal('pregnancy and lactation caution')).toBe('Pregnancy / breastfeeding')
  })

  it('preserves unknown text instead of converting missing knowledge into a safety conclusion', () => {
    expect(normalizeSafetySignals('unclassified safety observation')).toEqual(['unclassified safety observation'])
  })
})
