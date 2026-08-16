import { describe, expect, it } from 'vitest'

import { analyzeDirectionalConsistency } from '@/lib/research-directional-consistency'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function analysis(
  claimText: string,
  abstracts: string[],
  confidence = 0.8,
): ResearchQualityAnalysis {
  const sources = abstracts.map((_, index) => ({
    id: `s${index + 1}`,
    pmid: String(index + 1),
    studyClass: 'rct',
  }))
  const claimMap = [{
    id: 'claim-1',
    claim: claimText,
    predicate: 'supports_outcome',
    confidence,
    reviewStatus: 'approved',
    qualifiers: { direction: '+' },
    sourceRefIds: sources.map((source) => source.id),
  }]
  const cache = Object.fromEntries(abstracts.map((abstract, index) => [String(index + 1), { abstract }]))
  return {
    cache,
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: { slug: 'example', sources, claimMap },
    }],
    claimAnalyses: [],
    structuredClaimAnalyses: [],
    profileAnalyses: [],
  } as unknown as ResearchQualityAnalysis
}

describe('directional consistency and endpoint multiplicity', () => {
  it('flags favorable secondary/subgroup evidence when the primary endpoint is explicitly null', () => {
    const report = analyzeDirectionalConsistency(analysis(
      'Improves symptoms',
      ['The primary outcome showed no significant difference versus placebo. A secondary outcome significantly improved, and a post-hoc subgroup favored treatment.'],
    ))

    expect(report.summary.endpointCherryPickRisks).toBe(1)
    expect(report.findings[0]).toMatchObject({
      endpointCherryPickRisk: true,
      directionalHeterogeneity: false,
    })
  })

  it('flags directional heterogeneity when linked human trials explicitly disagree', () => {
    const report = analyzeDirectionalConsistency(analysis(
      'Consistently improves symptoms',
      [
        'Symptoms significantly improved compared with placebo.',
        'There was no significant difference in symptoms compared with placebo.',
      ],
    ))

    expect(report.summary.directionalHeterogeneityClaims).toBe(1)
    expect(report.summary.uniformlyPositiveOverstatements).toBe(1)
    expect(report.findings[0]).toMatchObject({
      positiveSourceCount: 1,
      nullSourceCount: 1,
      uniformlyPositiveOverstatement: true,
    })
  })

  it('keeps explicitly directional positive evidence assessable without manufacturing a finding', () => {
    const report = analyzeDirectionalConsistency(analysis(
      'Improves symptoms',
      ['Symptoms significantly improved compared with placebo.'],
    ))

    expect(report.summary.assessableClaims).toBe(1)
    expect(report.summary.findings).toBe(0)
    expect(report.claims).toHaveLength(1)
    expect(report.findings).toHaveLength(0)
  })

  it('does not invent directionality when source text is not explicit', () => {
    const report = analyzeDirectionalConsistency(analysis(
      'Supports symptom improvement',
      ['Participants completed a randomized trial and outcomes were measured after eight weeks.'],
    ))

    expect(report.summary.assessableClaims).toBe(0)
    expect(report.summary.findings).toBe(0)
    expect(report.claims).toHaveLength(0)
  })
})
