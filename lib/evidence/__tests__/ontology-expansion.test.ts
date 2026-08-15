import { describe, expect, it } from 'vitest'
import {
  isObjectiveCognitionOutcome,
  isSubjectiveCognitionOutcome,
  normalizeOutcome,
} from '../outcomes'
import {
  conditionAncestors,
  contentClusterFor,
  internalLinkTargets,
  normalizeCondition,
} from '../condition-ontology'

describe('expanded cognition outcomes', () => {
  it('separates working memory from generic memory', () => {
    expect(normalizeOutcome('working memory')).toMatchObject({
      canonicalOutcomeId: 'cognition-working-memory',
      instrumentId: 'WORKING-MEMORY-OBJECTIVE',
    })
  })

  it('separates attention, processing speed, and executive function', () => {
    expect(normalizeOutcome('sustained attention').canonicalOutcomeId).toBe('cognition-attention')
    expect(normalizeOutcome('processing speed').canonicalOutcomeId).toBe('cognition-processing-speed')
    expect(normalizeOutcome('executive function').canonicalOutcomeId).toBe('cognition-executive-function')
  })

  it('keeps subjective cognition distinct from objective cognition', () => {
    const subjective = normalizeOutcome('brain fog')
    expect(subjective.canonicalOutcomeId).toBe('cognition-subjective')
    expect(isSubjectiveCognitionOutcome('cognition-subjective')).toBe(true)
    expect(isObjectiveCognitionOutcome('cognition-attention')).toBe(true)
    expect(isObjectiveCognitionOutcome('cognition-subjective')).toBe(false)
  })
})

describe('condition ontology', () => {
  it('normalizes aliases into canonical hierarchical nodes', () => {
    expect(normalizeCondition('blood sugar')?.id).toBe('metabolic-glucose')
    expect(conditionAncestors('metabolic-glucose').map((node) => node.id)).toEqual([
      'metabolic',
      'metabolic-glucose',
    ])
  })

  it('provides deterministic internal-link targets', () => {
    const targets = internalLinkTargets('sleep-quality')
    expect(targets.some((target) => target.id === 'sleep')).toBe(true)
    expect(targets.some((target) => target.id === 'sleep-latency')).toBe(true)
  })

  it('builds content clusters with pillar and search terms', () => {
    const cluster = contentClusterFor('exercise-recovery')
    expect(cluster?.pillar).toBe('/conditions/exercise')
    expect(cluster?.current).toBe('/conditions/recovery')
    expect(cluster?.searchTerms.length).toBeGreaterThan(0)
  })
})
