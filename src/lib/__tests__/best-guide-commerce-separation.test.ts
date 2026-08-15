import { describe, expect, it } from 'vitest'
import {
  getBestGuideBuckets,
  rankBestGuideIngredients,
  validateBestGuideCandidates,
  type BestGuideCandidate,
} from '../best-guide-framework'
import { scoreProductQuality, type ProductQualitySignals } from '../product-quality-score'

const candidate = (overrides: Partial<BestGuideCandidate>): BestGuideCandidate => ({
  slug: 'example',
  name: 'Example',
  type: 'supplement',
  evidenceGrade: 'B',
  outcomeHumanStudyCount: 3,
  outcomeEvidenceDirectness: 'direct',
  safetyCompleteness: 'complete',
  cautionCount: 1,
  disposition: 'included',
  rationale: 'Direct human evidence.',
  ...overrides,
})

const quality: ProductQualitySignals = {
  transparentActiveDose: true,
  studiedFormDisclosed: true,
  standardizedExtractOrForm: true,
  activeMarkerDeclared: true,
  thirdPartyTesting: true,
  coaAvailable: true,
  contaminantTesting: true,
  adulterationControls: true,
  proprietaryBlend: false,
  currentFormulationVerified: true,
}

describe('best-guide evidence and commerce separation', () => {
  it('ranks ingredient evidence without prescription drugs, mechanism-only candidates, or insufficient evidence', () => {
    const ranked = rankBestGuideIngredients([
      candidate({ slug: 'strong', name: 'Strong', evidenceGrade: 'A', outcomeHumanStudyCount: 5 }),
      candidate({ slug: 'rx', name: 'Prescription', type: 'prescription-drug', evidenceGrade: 'A' }),
      candidate({ slug: 'mechanism', name: 'Mechanism only', outcomeEvidenceDirectness: 'mechanistic-only' }),
      candidate({ slug: 'insufficient', name: 'Insufficient', evidenceGrade: 'Avoid/Insufficient', disposition: 'insufficient-evidence' }),
    ])

    expect(ranked.map((item) => item.slug)).toEqual(['strong'])
  })

  it('rejects prescription drugs and mechanism-only evidence from included rankings', () => {
    expect(() => validateBestGuideCandidates([candidate({ type: 'prescription-drug' })])).toThrow(/prescription drugs/i)
    expect(() => validateBestGuideCandidates([candidate({ outcomeEvidenceDirectness: 'mechanistic-only' })])).toThrow(/mechanism-only/i)
  })

  it('keeps insufficient and safety-excluded options visible in separate buckets', () => {
    const buckets = getBestGuideBuckets([
      candidate({ slug: 'included' }),
      candidate({ slug: 'weak', evidenceGrade: 'Avoid/Insufficient', disposition: 'insufficient-evidence' }),
      candidate({ slug: 'safety', disposition: 'excluded-safety' }),
    ])
    expect(buckets.insufficient.map((item) => item.slug)).toEqual(['weak'])
    expect(buckets.excludedForSafety.map((item) => item.slug)).toEqual(['safety'])
  })

  it('does not let affiliate payout or evidence grade influence product quality', () => {
    const baseline = scoreProductQuality(quality)
    const commerciallyDecorated = scoreProductQuality({ ...quality, affiliatePayout: 999, evidenceGrade: 'A' } as ProductQualitySignals & { affiliatePayout: number; evidenceGrade: string })
    expect(commerciallyDecorated).toEqual(baseline)
  })

  it('penalizes hidden-dose proprietary blends independently of efficacy', () => {
    const transparent = scoreProductQuality(quality)
    const hidden = scoreProductQuality({ ...quality, proprietaryBlend: true, transparentActiveDose: false })
    expect(hidden.score).toBeLessThan(transparent.score)
    expect(hidden.cautions.join(' ')).toMatch(/proprietary blend/i)
  })
})
