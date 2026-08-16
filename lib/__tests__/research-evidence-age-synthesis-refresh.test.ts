import { describe, expect, it } from 'vitest'

import { analyzeClaimEvidenceAge, summarizeEvidenceAge } from '@/lib/research-evidence-age'
import type { ClaimQualityAnalysis, ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function claim(
  studyIds: string[],
  designs: ClaimQualityAnalysis['designs'],
  confidence = 0.8,
): ClaimQualityAnalysis {
  return {
    url: '/herbs/example/',
    claimId: 'claim-1',
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence,
    sourceRefCount: studyIds.length,
    validSourceRefCount: studyIds.length,
    danglingSourceRefs: [],
    studyIds,
    studyCount: studyIds.length,
    classifiedStudyCount: designs.length,
    primaryHuman: designs.filter((design) => ['rct', 'controlled-trial', 'uncontrolled-trial'].includes(design)).length,
    synthesis: designs.filter((design) => ['systematic-review', 'meta-analysis'].includes(design)).length,
    narrative: 0,
    designs,
    outcomeClaim: true,
    supportTier: 'human-supported',
    structuredSupportTier: studyIds.length === 1 ? 'single-study' : 'adequate',
    weakStructuredClaim: studyIds.length === 1,
    highConfidenceWeakStructured: false,
    highConfidenceWeakOutcome: false,
    singleStudy: studyIds.length === 1,
    aliasCollapsed: false,
  }
}

function analysis(years: Array<number | undefined>, designs: ClaimQualityAnalysis['designs']): ResearchQualityAnalysis {
  const sources = years.map((year, index) => ({
    id: `s${index + 1}`,
    ...(year ? { year } : {}),
    studyClass: designs[index],
  }))
  const studyIds = sources.map((source) => `source-ref:${source.id}`)
  const qualityClaim = claim(studyIds, designs)
  return {
    cache: {},
    profiles: [{
      kind: 'herbs',
      url: '/herbs/example/',
      file: 'example.json',
      record: { slug: 'example', sources, claimMap: [] },
    }],
    claimAnalyses: [qualityClaim],
    structuredClaimAnalyses: [qualityClaim],
    profileAnalyses: [],
  }
}

describe('design-aware synthesis freshness', () => {
  it('flags a synthesis that is at least five years older than newer primary-human evidence', () => {
    const [result] = analyzeClaimEvidenceAge(
      analysis([2018, 2023], ['systematic-review', 'rct']),
      2026,
    )

    expect(result).toMatchObject({
      newestSynthesisYear: 2018,
      newestPrimaryHumanYear: 2023,
      synthesisLagYears: 5,
      synthesisOutpacedByNewerPrimaryEvidence: true,
      highConfidenceSynthesisRefreshGap: true,
    })
    expect(summarizeEvidenceAge([result]).synthesisOutpacedClaims).toBe(1)
  })

  it('does not flag a four-year synthesis lag', () => {
    const [result] = analyzeClaimEvidenceAge(
      analysis([2019, 2023], ['meta-analysis', 'controlled-trial']),
      2026,
    )

    expect(result.synthesisLagYears).toBe(4)
    expect(result.synthesisOutpacedByNewerPrimaryEvidence).toBe(false)
  })

  it('does not invent a refresh gap when either side lacks a known year', () => {
    const [missingSynthesisYear] = analyzeClaimEvidenceAge(
      analysis([undefined, 2024], ['systematic-review', 'rct']),
      2026,
    )
    const [noSynthesis] = analyzeClaimEvidenceAge(
      analysis([2020, 2024], ['rct', 'controlled-trial']),
      2026,
    )

    expect(missingSynthesisYear.synthesisLagYears).toBeNull()
    expect(missingSynthesisYear.synthesisOutpacedByNewerPrimaryEvidence).toBe(false)
    expect(noSynthesis.synthesisLagYears).toBeNull()
    expect(noSynthesis.synthesisOutpacedByNewerPrimaryEvidence).toBe(false)
  })
})
