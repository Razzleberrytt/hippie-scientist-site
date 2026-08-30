import { describe, expect, it } from 'vitest'
import { hashCanonicalField, hashResearchObject, validateDistributionPack } from '../distribution-pack-contract.mjs'

const researchObject = {
  id: 'fixture-grade-binding',
  title: 'Fixture human evidence',
  finding: 'The recorded human trial reported a mixed outcome versus control.',
  evidenceType: 'RCT',
  evidenceGrade: 'B',
  limitation: 'This fixture does not establish a universal effect.',
  sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
  findingClaimId: 'clm_abcdef123456',
  primarySourceId: 'src_abcdef123456',
  primarySourceUrl: 'https://example.org/study/fixture-grade-binding',
  publicationStatus: 'published',
  publicationStatusCheckedAt: '2026-08-29',
  publicationStatusAuthorityUrl: 'https://example.org/study/fixture-grade-binding/status',
}

function pack(grade = researchObject.evidenceGrade) {
  const sourceUrl = researchObject.sourceUrl
  return {
    schemaVersion: '1.0.0',
    packId: 'fixture-grade-binding-media-v1',
    researchObjectIds: [researchObject.id],
    source: {
      url: sourceUrl,
      title: researchObject.title,
      contentHash: hashResearchObject(researchObject),
      findingClaimId: researchObject.findingClaimId,
      primarySourceId: researchObject.primarySourceId,
      primarySourceUrl: researchObject.primarySourceUrl,
      publicationStatus: researchObject.publicationStatus,
      publicationStatusCheckedAt: researchObject.publicationStatusCheckedAt,
      publicationStatusAuthorityUrl: researchObject.publicationStatusAuthorityUrl,
    },
    audience: 'General educational audience',
    angle: 'What the evidence actually says',
    claims: [{
      id: 'CLAIM_001',
      sourceStatement: researchObject.finding,
      publicSafeStatement: researchObject.finding,
      strengthDelta: 'none',
      evidenceContext: 'human',
      evidenceGrade: grade,
      sourceRefs: ['RESEARCH_OBJECT_001'],
      consumerInstruction: false,
      studyContext: { population: null, formulation: null, dose: null, duration: null },
    }],
    sources: [{
      id: 'RESEARCH_OBJECT_001',
      kind: 'research-object',
      identifier: researchObject.id,
      url: sourceUrl,
    }],
    provenanceReceipts: [
      { targetPath: '$.claims[0].sourceStatement', canonicalField: 'finding', sourceRef: 'RESEARCH_OBJECT_001', fieldHash: hashCanonicalField(researchObject.finding) },
      { targetPath: '$.claims[0].publicSafeStatement', canonicalField: 'finding', sourceRef: 'RESEARCH_OBJECT_001', fieldHash: hashCanonicalField(researchObject.finding) },
      { targetPath: '$.uncertainties[0].statement', canonicalField: 'limitation', sourceRef: 'RESEARCH_OBJECT_001', fieldHash: hashCanonicalField(researchObject.limitation) },
    ],
    safety: [],
    uncertainties: [{ id: 'UNCERTAINTY_001', statement: researchObject.limitation, sourceRefs: ['RESEARCH_OBJECT_001'] }],
    forbiddenExtrapolations: [
      'Do not strengthen the canonical research finding.',
      'Do not convert dose/form context into consumer instructions.',
      'Do not project preclinical evidence as human efficacy or benefit.',
    ],
    cta: { label: 'Read the evidence', destinationUrl: sourceUrl },
    assetIntents: [{
      type: 'carousel',
      objective: 'Render the canonical finding without factual rewriting.',
      claimIds: ['CLAIM_001'],
    }],
  }
}

function errorsFor(candidate) {
  return validateDistributionPack(candidate, { researchObjects: [researchObject] })
}

describe('primary distribution validator evidence-grade binding', () => {
  it('accepts the exact canonical evidence grade', () => {
    expect(errorsFor(pack())).toEqual([])
  })

  it.each(['A', 'C', 'D', 'Avoid/Insufficient'])('rejects schema-valid grade drift to %s', (grade) => {
    const errors = errorsFor(pack(grade))
    expect(errors.some(({ path, message }) => (
      path === '$.claims[0].evidenceGrade'
      && message.includes('must exactly equal canonical research-object evidenceGrade B')
    ))).toBe(true)
  })
})
