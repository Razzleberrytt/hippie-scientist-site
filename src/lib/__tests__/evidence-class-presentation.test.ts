import { describe, expect, it } from 'vitest'

import { normalizeDecisionEvidence } from '../../../lib/decision-primitives'
import { getSemanticOrchestrationSignals } from '../semantic-orchestration'

describe('evidence presentation respects translational boundaries', () => {
  it('does not render a preclinical systematic review as strong evidence', () => {
    expect(normalizeDecisionEvidence('preclinical systematic review of animal studies'))
      .toBe('Preliminary evidence')
  })

  it('keeps explicit absence of human evidence insufficient even when review words are present', () => {
    expect(normalizeDecisionEvidence('No reliable human evidence; systematic review of animal studies'))
      .toBe('Insufficient evidence')
  })
})

describe('semantic discovery scoring does not promote preclinical-only records', () => {
  it('keeps a preclinical systematic review at weak evidence with a translational penalty', () => {
    const signals = getSemanticOrchestrationSignals({
      slug: 'preclinical-example',
      summary: 'Preclinical systematic review in rats and cell models.',
      evidence_tier: 'preclinical systematic review',
    })

    expect(signals.evidenceScore).toBe(0.25)
    expect(signals.translationalPenalty).toBe(0.22)
  })

  it('does not let “no reliable human evidence” create a human/strong boost', () => {
    const signals = getSemanticOrchestrationSignals({
      slug: 'no-human-example',
      summary: 'No reliable human evidence; findings are preclinical and mechanistic.',
      evidence_tier: 'systematic review of animal evidence',
    })

    expect(signals.evidenceScore).toBe(0.25)
    expect(signals.translationalPenalty).toBe(0.22)
  })

  it('still recognizes independently human randomized evidence', () => {
    const signals = getSemanticOrchestrationSignals({
      slug: 'human-rct-example',
      evidence_tier: 'Strong evidence from a randomized clinical trial in adults',
    })

    expect(signals.evidenceScore).toBe(1)
    expect(signals.translationalPenalty).toBe(0)
  })
})
