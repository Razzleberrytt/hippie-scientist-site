import { describe, expect, it } from 'vitest'
import { scoreResearchObject } from '../score-distribution-opportunities.mjs'

const base = {
  id: 'test-human-evidence',
  title: 'Test intervention in randomized human trials',
  finding: 'Randomized human evidence suggests a limited effect, with important uncertainty.',
  evidenceType: 'meta-analysis',
  evidenceGrade: 'B',
  limitation: 'Trials are heterogeneous and results should not be generalized.',
  sourceUrl: 'https://thehippiescientist.net/herbs/test/',
  doseContext: 'Study context only.',
  formulationContext: 'Formulations varied.',
  populationContext: 'Adults in randomized trials.',
  tags: ['human-evidence', 'meta-analysis', 'test'],
  lastVerified: new Date().toISOString().slice(0, 10),
}

describe('distribution opportunity scorer', () => {
  it('selects a deterministic low-cost visual format for governed human evidence', () => {
    const result = scoreResearchObject(base)
    expect(result.eligible).toBe(true)
    expect(result.recommendedFormat).toBe('carousel')
    expect(result.destinationUrl).toBe(base.sourceUrl)
    expect(result.angle).toBe(base.finding)
    expect(result.guardrail).toBe(base.limitation)
    expect(result.successCriteria.scientific).toContain('0 unsupported')
  })

  it('fails eligibility for external/noncanonical destinations', () => {
    const result = scoreResearchObject({ ...base, sourceUrl: 'https://example.com/test/' })
    expect(result.eligible).toBe(false)
    expect(result.score).toBe(0)
  })

  it('does not promote insufficient evidence into an eligible opportunity', () => {
    const result = scoreResearchObject({ ...base, evidenceGrade: 'Avoid/Insufficient' })
    expect(result.eligible).toBe(false)
  })

  it('penalizes preclinical/weak evidence relative to governed human evidence', () => {
    const human = scoreResearchObject(base)
    const preclinical = scoreResearchObject({
      ...base,
      id: 'test-preclinical',
      title: 'Test intervention in animal models',
      evidenceType: 'animal',
      evidenceGrade: 'D',
      tags: ['preclinical'],
    })
    expect(preclinical.score).toBeLessThan(human.score)
    expect(preclinical.signals.claimRisk).toBeGreaterThan(human.signals.claimRisk)
  })
})
