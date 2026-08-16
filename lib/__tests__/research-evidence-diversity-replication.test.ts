import { describe, expect, it } from 'vitest'

import { analyzeClaimEvidenceDiversity } from '@/lib/research-claim-evidence-diversity'
import type { ClaimQualityAnalysis, ResearchQualityAnalysis } from '@/lib/research-quality-analysis'

function claim(claimId: string, designs: ClaimQualityAnalysis['designs'], confidence = 0.8): ClaimQualityAnalysis {
  const studyIds = designs.map((_, index) => `${claimId}-${index}`)
  return {
    url: '/herbs/example/',
    claimId,
    reviewStatus: 'approved',
    approved: true,
    predicate: 'supports_outcome',
    confidence,
    sourceRefCount: studyIds.length,
    validSourceRefCount: studyIds.length,
    danglingSourceRefs: [],
    studyIds,
    studyCount: studyIds.length,
    classifiedStudyCount: designs.filter((design) => design !== 'unclassified').length,
    primaryHuman: designs.filter((design) => ['rct', 'controlled-trial', 'uncontrolled-trial'].includes(design)).length,
    synthesis: designs.filter((design) => ['systematic-review', 'meta-analysis'].includes(design)).length,
    narrative: designs.filter((design) => design === 'narrative-review').length,
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

function analysis(claims: ClaimQualityAnalysis[]): ResearchQualityAnalysis {
  return { cache: {}, profiles: [], profileAnalyses: [], claimAnalyses: claims, structuredClaimAnalyses: claims }
}

describe('claim evidence diversity replication semantics', () => {
  it('treats multiple primary-human trials as replication, not a homogeneity gap', () => {
    const [result] = analyzeClaimEvidenceDiversity(analysis([
      claim('replicated', ['rct', 'controlled-trial', 'rct']),
    ]))

    expect(result).toMatchObject({
      sameFamilyMultiStudySupport: true,
      replicatedPrimaryHumanSupport: true,
      homogeneousMultiStudySupport: false,
      highConfidenceHomogeneousMultiStudySupport: false,
      evidenceFamilies: ['primary-human'],
    })
  })

  it('keeps narrative-only multi-study support as a homogeneity gap', () => {
    const [result] = analyzeClaimEvidenceDiversity(analysis([
      claim('reviews', ['narrative-review', 'narrative-review']),
    ]))

    expect(result).toMatchObject({
      sameFamilyMultiStudySupport: true,
      replicatedPrimaryHumanSupport: false,
      homogeneousMultiStudySupport: true,
      highConfidenceHomogeneousMultiStudySupport: true,
      evidenceFamilies: ['narrative'],
    })
  })

  it('does not call mixed-family support homogeneous', () => {
    const [result] = analyzeClaimEvidenceDiversity(analysis([
      claim('mixed', ['rct', 'systematic-review']),
    ]))

    expect(result.sameFamilyMultiStudySupport).toBe(false)
    expect(result.homogeneousMultiStudySupport).toBe(false)
    expect(result.replicatedPrimaryHumanSupport).toBe(false)
  })
})
