import { describe, expect, it } from 'vitest'

import { runScoringAgent } from './scoring-agent.js'
import { runValidationAgent } from './validation-agent.js'

describe('agent evidence validation', () => {
  it('accepts relevant human evidence without treating integrative as a rat study', async () => {
    const result = await runValidationAgent({
      slug: 'berberine',
      evidence: [{
        compound_slug: 'berberine',
        study_type: 'systematic_review',
        population: 'humans (PubMed-indexed)',
        pmid_or_source: '42356246',
        title: 'The Integrative Role of Berberine in Human Outcomes',
      }],
    })

    expect(result.data.validation_status).toBe('approved')
    expect(result.data.entries).toHaveLength(1)
  })

  it('rejects evidence whose study type is unknown', async () => {
    const result = await runValidationAgent({
      slug: 'berberine',
      evidence: [{
        compound_slug: 'berberine',
        study_type: 'unknown',
        population: 'humans (PubMed-indexed)',
        pmid_or_source: '42356246',
      }],
    })

    expect(result.data.validation_status).toBe('rejected')
    expect(result.data.rejection_reasons).toContain('unsupported_study_type')
  })
})

describe('agent evidence scoring', () => {
  it('recognizes normalized RCT and systematic-review study types', () => {
    const score = runScoringAgent([
      { study_type: 'rct', sample_size: '80', pmid_or_source: '12345678' },
      { study_type: 'systematic_review', pmid_or_source: '23456789' },
    ])

    expect(score.confidence_score).toBeGreaterThanOrEqual(0.75)
    expect(score.confidence_reasoning).toContain('randomized_trial_detected')
    expect(score.confidence_reasoning).toContain('systematic_review_detected')
  })
})
