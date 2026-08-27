import { assertValidDistributionPack, hashResearchObject } from './distribution-pack-contract.mjs'

const SITE_ORIGIN = 'https://thehippiescientist.net'
const HUMAN_EVIDENCE_TYPES = new Set(['meta-analysis', 'systematic-review', 'RCT', 'controlled-trial', 'observational', 'case-report'])
const MIXED_EVIDENCE_TYPES = new Set(['mixed', 'narrative-review'])
const FORBIDDEN_EXTRAPOLATIONS = Object.freeze([
  'Do not strengthen the canonical research finding.',
  'Do not convert dose/form context into consumer instructions.',
  'Do not project preclinical evidence as human efficacy or benefit.',
])

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function canonicalPageUrl(value) {
  const url = new URL(String(value ?? ''))
  if (url.origin !== SITE_ORIGIN || url.pathname === '/' || url.search || url.hash) {
    throw new Error('sourceUrl must be a canonical Hippie Scientist evidence page')
  }
  return `${SITE_ORIGIN}${url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`}`
}

function evidenceContext(evidenceType) {
  const value = clean(evidenceType)
  if (value === 'preclinical') return 'preclinical'
  if (MIXED_EVIDENCE_TYPES.has(value)) return 'mixed'
  if (HUMAN_EVIDENCE_TYPES.has(value)) return 'human'
  throw new Error(`unsupported evidenceType for distribution pack: ${value || '(empty)'}`)
}

function packIdFromResearchObjectId(id) {
  return `${id.replace(/[._]+/g, '-').replace(/-+/g, '-')}-media-v1`
}

export function buildDistributionPackFromResearchObject(researchObject, options = {}) {
  if (!researchObject || typeof researchObject !== 'object' || Array.isArray(researchObject)) {
    throw new Error('research object must be an object')
  }

  const id = clean(researchObject.id)
  const title = clean(researchObject.title)
  const finding = clean(researchObject.finding)
  const limitation = clean(researchObject.limitation)
  if (!id || !title || !finding || !limitation) {
    throw new Error('research object must include id, title, finding, and limitation')
  }

  const sourceUrl = canonicalPageUrl(researchObject.sourceUrl)
  const context = evidenceContext(researchObject.evidenceType)
  const pack = {
    schemaVersion: '1.0.0',
    packId: packIdFromResearchObjectId(id),
    researchObjectIds: [id],
    source: {
      url: sourceUrl,
      title,
      contentHash: hashResearchObject(researchObject),
    },
    audience: 'General educational audience',
    angle: 'What the evidence actually says',
    claims: [{
      id: 'CLAIM_001',
      sourceStatement: finding,
      publicSafeStatement: finding,
      strengthDelta: 'none',
      evidenceContext: context,
      sourceRefs: ['RESEARCH_OBJECT_001'],
      consumerInstruction: false,
      studyContext: {
        population: clean(researchObject.populationContext) || null,
        formulation: clean(researchObject.formulationContext) || null,
        dose: clean(researchObject.doseContext) || null,
        duration: clean(researchObject.durationContext) || null,
      },
    }],
    sources: [{
      id: 'RESEARCH_OBJECT_001',
      kind: 'research-object',
      identifier: id,
      url: sourceUrl,
    }],
    safety: [],
    uncertainties: [{
      id: 'UNCERTAINTY_001',
      statement: limitation,
      sourceRefs: ['RESEARCH_OBJECT_001'],
    }],
    forbiddenExtrapolations: [...FORBIDDEN_EXTRAPOLATIONS],
    cta: {
      label: 'Read the evidence',
      destinationUrl: sourceUrl,
    },
    assetIntents: [
      {
        type: 'carousel',
        objective: 'Render the canonical finding without factual rewriting.',
        claimIds: ['CLAIM_001'],
      },
      {
        type: 'short-video',
        objective: 'Render the canonical finding without factual rewriting.',
        claimIds: ['CLAIM_001'],
      },
    ],
  }

  return assertValidDistributionPack(pack, {
    researchObjects: options.researchObjects ?? [researchObject],
  })
}
