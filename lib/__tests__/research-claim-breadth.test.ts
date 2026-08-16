import { describe, expect, it } from 'vitest'

import { analyzeClaimBreadth } from '@/lib/research-claim-breadth'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function analysis(claim: Record<string, unknown>, sources: Array<Record<string, unknown>>, cache: ResearchQualityAnalysis['cache'] = {}): ResearchQualityAnalysis {
  return {
    cache,
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: { slug: 'example', sources, claimMap: [claim] },
    }],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
    profileAnalyses: [],
  }
}

const baseClaim = {
  id: 'claim-1',
  claim: 'Improves symptoms',
  predicate: 'supports_outcome',
  confidence: 0.8,
  reviewStatus: 'approved',
  sourceRefIds: ['s1'],
}

const baseSource = {
  id: 's1',
  pmid: '1',
  studyClass: 'rct',
}

describe('claim evidence breadth calibration', () => {
  it('flags a broad population claim when linked human evidence is explicitly narrow', () => {
    const result = analyzeClaimBreadth(analysis(
      { ...baseClaim, qualifiers: { population: 'adults' } },
      [{ ...baseSource, title: 'Randomized trial in pregnant women with nausea' }],
    ))

    expect(result.findings).toHaveLength(1)
    expect(result.findings[0]).toMatchObject({ populationOverbroad: true })
  })

  it('flags dose and duration scope that extends beyond the linked trial', () => {
    const result = analyzeClaimBreadth(analysis(
      { ...baseClaim, qualifiers: { dose_or_duration: '500-2000 mg/day for 4-28 days' } },
      [{ ...baseSource, title: 'Trial of 1000 mg/day for 7 days' }],
    ))

    expect(result.findings[0]).toMatchObject({ doseOverbroad: true, durationOverbroad: true })
  })

  it('does not invent a breadth mismatch when linked evidence lacks comparable scope metadata', () => {
    const result = analyzeClaimBreadth(analysis(
      { ...baseClaim, qualifiers: { population: 'adults', dose_or_duration: '500-2000 mg/day' } },
      [{ ...baseSource, title: 'Randomized controlled trial' }],
    ))

    expect(result.findings).toHaveLength(0)
  })

  it('uses cached abstracts when the source row itself is sparse', () => {
    const result = analyzeClaimBreadth(analysis(
      { ...baseClaim, qualifiers: { population: 'adults' } },
      [baseSource],
      { '1': { abstract: 'Participants were pregnant women before 17 weeks gestation.' } },
    ))

    expect(result.findings[0].populationOverbroad).toBe(true)
  })
})
