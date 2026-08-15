import { describe, expect, it } from 'vitest'
import {
  countHumanTrials,
  getHumanParticipantMetric,
  isHumanTrialSource,
} from '../evidence-source-metrics'
import type { EvidenceEngineSource } from '../evidence-engine'

function source(
  source_type: string,
  source_id: string,
  sample_size?: number
): EvidenceEngineSource {
  return {
    source_id,
    claim_id: 'claim-1',
    citation_label: source_id,
    source_type,
    title: source_id,
    year: 2026,
    url: 'https://example.com',
    sample_size,
    published: true,
  }
}

describe('evidence source metrics', () => {
  it('counts only explicit human trial source types', () => {
    const sources = [
      source('RCT', 'rct'),
      source('randomized controlled trial', 'randomized'),
      source('systematic review', 'review'),
      source('animal study', 'animal'),
    ]

    expect(countHumanTrials(sources)).toBe(2)
  })

  it('does not infer a human trial from generic human evidence wording', () => {
    expect(isHumanTrialSource(source('human evidence', 'human'))).toBe(false)
    expect(isHumanTrialSource(source('meta-analysis', 'meta'))).toBe(false)
  })

  it('returns a complete approximate total when every human trial has N metadata', () => {
    expect(getHumanParticipantMetric([
      source('RCT', 'one', 120),
      source('clinical trial', 'two', 80),
      source('systematic review', 'review'),
    ])).toEqual({
      total: 200,
      trialsWithSampleSize: 2,
      humanTrials: 2,
      complete: true,
    })
  })

  it('marks participant totals partial when a human trial is missing N metadata', () => {
    expect(getHumanParticipantMetric([
      source('RCT', 'one', 120),
      source('controlled trial', 'two'),
    ])).toEqual({
      total: 120,
      trialsWithSampleSize: 1,
      humanTrials: 2,
      complete: false,
    })
  })
})
