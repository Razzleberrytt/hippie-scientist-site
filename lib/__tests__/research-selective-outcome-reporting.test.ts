import { describe, expect, it } from 'vitest'

import { analyzeSelectiveOutcomeReporting } from '@/lib/research-selective-outcome-reporting'
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

describe('selective outcome reporting', () => {
  it('flags favorable secondary evidence when a prespecified primary outcome is explicitly null', () => {
    const report = analyzeSelectiveOutcomeReporting(analysis([
      'The prespecified primary outcome showed no significant difference. A secondary endpoint significantly improved versus placebo.',
    ]))

    expect(report.summary.selectiveOutcomeRisks).toBe(1)
    expect(report.findings[0]).toMatchObject({
      selectiveOutcomeRisk: true,
      explicitOutcomeSwitchRisk: false,
    })
  })

  it('flags explicit outcome switching or non-reporting of registered outcomes', () => {
    const report = analyzeSelectiveOutcomeReporting(analysis([
      'The primary outcome was changed after trial registration and the registered outcome was not reported.',
    ]))

    expect(report.summary.explicitOutcomeSwitchRisks).toBe(1)
    expect(report.findings[0].explicitOutcomeSwitchRisk).toBe(true)
  })

  it('does not call a clean prespecified positive primary outcome selective reporting', () => {
    const report = analyzeSelectiveOutcomeReporting(analysis([
      'The prespecified primary endpoint significantly improved compared with placebo.',
    ]))

    expect(report.summary.assessableClaims).toBe(1)
    expect(report.summary.findings).toBe(0)
  })

  it('leaves studies without explicit registration or outcome-hierarchy language unassessable', () => {
    const report = analyzeSelectiveOutcomeReporting(analysis([
      'Symptoms improved during the eight-week randomized trial.',
    ]))

    expect(report.summary.assessableClaims).toBe(0)
    expect(report.summary.findings).toBe(0)
  })
})
