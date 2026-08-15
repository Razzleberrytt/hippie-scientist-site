import { describe, expect, it } from 'vitest'

import {
  assessSourceSupport,
  auditParagraphCitationScope,
  lintClaimLanguage,
  strongestAllowedClaimStrength,
  validateClaimCitationDistance,
} from '@/lib/evidence/claim-language'

describe('claim strength taxonomy', () => {
  it('maps grades to conservative maximum wording strength', () => {
    expect(strongestAllowedClaimStrength('A')).toBe('shown-to-improve')
    expect(strongestAllowedClaimStrength('B')).toBe('probably-improves')
    expect(strongestAllowedClaimStrength('C')).toBe('may-improve')
    expect(strongestAllowedClaimStrength('D')).toBe('insufficient-evidence')
    expect(strongestAllowedClaimStrength('Avoid/Insufficient')).toBe('insufficient-evidence')
  })

  it('rejects claim strength stronger than the grade permits', () => {
    const findings = lintClaimLanguage('This ingredient has been shown to improve sleep.', {
      grade: 'C',
      strength: 'shown-to-improve',
      studyDesigns: ['randomized-trial'],
      independentHumanTrialCount: 2,
    })

    expect(findings.some((finding) => finding.code === 'strength-exceeds-grade')).toBe(true)
  })
})

describe('claim language linting', () => {
  it('flags overclaim words and disease-treatment wording', () => {
    const findings = lintClaimLanguage('This proven supplement treats insomnia and works quickly.', {
      grade: 'C',
      strength: 'may-improve',
      studyDesigns: ['randomized-trial'],
      independentHumanTrialCount: 2,
    })

    expect(findings.some((finding) => finding.code === 'overclaim-word')).toBe(true)
    expect(findings.some((finding) => finding.code === 'disease-treatment-wording')).toBe(true)
  })

  it('flags causal wording when evidence is observational only', () => {
    const findings = lintClaimLanguage('Higher intake reduces stress.', {
      grade: 'C',
      strength: 'may-improve',
      studyDesigns: ['observational'],
    })

    expect(findings.some((finding) => finding.code === 'observational-causality')).toBe(true)
  })

  it('flags human-benefit language when evidence is preclinical only', () => {
    const findings = lintClaimLanguage('Adults may benefit and improve attention.', {
      grade: 'D',
      strength: 'insufficient-evidence',
      studyDesigns: ['animal', 'in-vitro'],
    })

    expect(findings.some((finding) => finding.code === 'preclinical-human-benefit')).toBe(true)
  })

  it('flags broad generalization from one small trial', () => {
    const findings = lintClaimLanguage('Adults generally experience better sleep.', {
      grade: 'C',
      strength: 'may-improve',
      studyDesigns: ['randomized-trial'],
      independentHumanTrialCount: 1,
      largestHumanTrialSize: 24,
    })

    expect(findings.some((finding) => finding.code === 'single-small-trial-generalization')).toBe(true)
  })
})

describe('citation proximity', () => {
  it('requires important claims to have nearby supporting citations', () => {
    const findings = validateClaimCitationDistance(
      [
        { id: 'claim-near', position: 100, importance: 'medical' },
        { id: 'claim-far', position: 1000, importance: 'high' },
      ],
      [
        { id: 'citation-near', position: 150, supportsClaimIds: ['claim-near'] },
        { id: 'citation-far', position: 1500, supportsClaimIds: ['claim-far'] },
      ],
      260,
    )

    expect(findings.some((finding) => finding.claimId === 'claim-near')).toBe(false)
    expect(findings).toContainEqual(expect.objectContaining({ claimId: 'claim-far', code: 'citation-too-distant' }))
  })

  it('allows genuine citation reuse while flagging decorative citations', () => {
    const findings = validateClaimCitationDistance(
      [
        { id: 'claim-a', position: 100, importance: 'normal' },
        { id: 'claim-b', position: 120, importance: 'normal' },
      ],
      [
        { id: 'shared', position: 140, supportsClaimIds: ['claim-a', 'claim-b'] },
        { id: 'decorative', position: 160, supportsClaimIds: [] },
      ],
    )

    expect(findings.filter((finding) => finding.code === 'missing-citation')).toHaveLength(0)
    expect(findings).toContainEqual(expect.objectContaining({ citationId: 'decorative', code: 'decorative-citation' }))
  })

  it('flags ambiguous single citation clusters across multiple propositions', () => {
    expect(auditParagraphCitationScope(
      [
        { id: 'c1', propositionId: 'sleep' },
        { id: 'c2', propositionId: 'stress' },
      ],
      [{ citationIds: ['s1'], supportsClaimIds: ['c1'] }],
    )).toHaveLength(1)
  })
})

describe('source extraction confidence', () => {
  it('caps abstract-only evidence confidence until full text is verified', () => {
    const assessment = assessSourceSupport({
      claimId: 'claim-1',
      studyId: 'study-1',
      location: 'abstract',
      fullTextVerified: false,
      snippet: 'Abstract extraction for reviewer context only.',
    })

    expect(assessment.confidenceCeiling).toBe('low')
    expect(assessment.needsFullTextReview).toBe(true)
  })
})
