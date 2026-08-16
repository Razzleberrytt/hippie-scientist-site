import { describe, expect, it } from 'vitest'

import { analyzeOutcomeMetadata } from '@/lib/research-outcome-metadata'
import { analyzeSelectiveOutcomeReporting } from '@/lib/research-selective-outcome-reporting'
import { analyzeTrialRegistrationIndependence } from '@/lib/research-trial-registration-independence'
import type { ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function analysis(abstracts: string[], confidence = 0.8): ResearchQualityAnalysis {
  const sources = abstracts.map((_, index) => ({
    id: `s${index + 1}`,
    pmid: String(index + 1),
    studyClass: 'rct',
  }))
  const claimMap = [{
    id: 'claim-1',
    claim: 'Improves symptoms',
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

function report(abstracts: string[], confidence = 0.8) {
  const input = analysis(abstracts, confidence)
  const trialRegistrationIndependence = analyzeTrialRegistrationIndependence(input)
  const outcomeMetadata = analyzeOutcomeMetadata({ analysis: input, trialRegistrationIndependence })
  return analyzeSelectiveOutcomeReporting({ analysis: input, outcomeMetadata })
}

describe('selective outcome reporting', () => {
  it('flags favorable secondary evidence when a prespecified primary outcome is explicitly null', () => {
    const result = report([
      'The prespecified primary outcome showed no significant difference. A secondary endpoint significantly improved versus placebo.',
    ])

    expect(result.summary.selectiveOutcomeRisks).toBe(1)
    expect(result.findings[0]).toMatchObject({
      selectiveOutcomeRisk: true,
      explicitOutcomeSwitchRisk: false,
    })
  })

  it('flags explicit outcome switching or non-reporting of registered outcomes', () => {
    const result = report([
      'The primary outcome was changed after trial registration and the registered outcome was not reported.',
    ])

    expect(result.summary.explicitOutcomeSwitchRisks).toBe(1)
    expect(result.findings[0].explicitOutcomeSwitchRisk).toBe(true)
  })

  it('does not call a clean prespecified positive primary outcome selective reporting', () => {
    const result = report([
      'The prespecified primary endpoint significantly improved compared with placebo.',
    ])

    expect(result.summary.assessableClaims).toBe(1)
    expect(result.summary.findings).toBe(0)
  })

  it('leaves studies without explicit registration or outcome-hierarchy language unassessable', () => {
    const result = report([
      'Symptoms improved during the eight-week randomized trial.',
    ])

    expect(result.summary.assessableClaims).toBe(0)
    expect(result.summary.findings).toBe(0)
  })
})
