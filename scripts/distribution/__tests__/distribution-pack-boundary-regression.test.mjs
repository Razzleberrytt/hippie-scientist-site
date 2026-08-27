import { describe, expect, it } from 'vitest'
import { hashResearchObject, validateDistributionPack } from '../distribution-pack-contract.mjs'

const FIXED_BOUNDARIES = [
  'Do not strengthen the canonical research finding.',
  'Do not convert dose/form context into consumer instructions.',
  'Do not project preclinical evidence as human efficacy or benefit.',
]

function packFor(object) {
  const sourceUrl = object.sourceUrl.endsWith('/') ? object.sourceUrl : `${object.sourceUrl}/`
  return {
    schemaVersion: '1.0.0',
    packId: `${object.id.replace(/[._]+/g, '-').replace(/-+/g, '-')}-media-v1`,
    researchObjectIds: [object.id],
    source: { url: sourceUrl, title: object.title, contentHash: hashResearchObject(object) },
    audience: 'General educational audience',
    angle: 'What the evidence actually says',
    claims: [{
      id: 'CLAIM_001',
      sourceStatement: object.finding,
      publicSafeStatement: object.finding,
      strengthDelta: 'none',
      evidenceContext: object.evidenceType === 'preclinical' ? 'preclinical' : 'human',
      sourceRefs: ['RESEARCH_OBJECT_001'],
      consumerInstruction: false,
      studyContext: {
        population: object.populationContext ?? null,
        formulation: null,
        dose: object.doseContext ?? null,
        duration: null,
      },
    }],
    sources: [{ id: 'RESEARCH_OBJECT_001', kind: 'research-object', identifier: object.id, url: sourceUrl }],
    safety: [],
    uncertainties: [{ id: 'UNCERTAINTY_001', statement: object.limitation, sourceRefs: ['RESEARCH_OBJECT_001'] }],
    forbiddenExtrapolations: [...FIXED_BOUNDARIES],
    cta: { label: 'Read the evidence', destinationUrl: sourceUrl },
    assetIntents: [{ type: 'infographic', objective: 'Render the canonical finding without factual rewriting.', claimIds: ['CLAIM_001'] }],
  }
}

function objectFor(finding, evidenceType = 'RCT') {
  return {
    id: 'boundary-regression',
    title: 'Boundary regression fixture',
    finding,
    evidenceType,
    evidenceGrade: 'B',
    limitation: 'Fixture limitation.',
    sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
    primarySourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31517876/',
    trialCount: 1,
    participants: 10,
    doseContext: null,
    populationContext: null,
    lastVerified: '2026-08-26',
  }
}

function errorsFor(object) {
  return validateDistributionPack(packFor(object), { researchObjects: [object] })
}

describe('distribution pack boundary regressions', () => {
  it('rejects imperative dosage verbs beyond take/use', () => {
    for (const finding of ['Administer 2 capsules daily.', 'Swallow two capsules daily.', 'Ingest one tablet nightly.']) {
      expect(errorsFor(objectFor(finding)).some(({ message }) => message.includes('directive consumer-dose language')), finding).toBe(true)
    }
  })

  it('rejects common human-population terms in preclinical findings', () => {
    for (const population of ['volunteers', 'participants', 'subjects', 'individuals', 'adolescents']) {
      const finding = `Animal studies suggest ${population} may experience better sleep.`
      expect(errorsFor(objectFor(finding, 'preclinical')).some(({ message }) => message.includes('human- or second-person-directed language')), finding).toBe(true)
    }
  })
})
