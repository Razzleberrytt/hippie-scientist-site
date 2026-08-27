import { assertValidDistributionPack, hashCanonicalField, hashResearchObject } from './distribution-pack-contract.mjs'

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

function provenanceReceipt(targetPath, canonicalField, value) {
  return {
    targetPath,
    canonicalField,
    sourceRef: 'RESEARCH_OBJECT_001',
    fieldHash: hashCanonicalField(value),
  }
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
  const population = clean(researchObject.populationContext) || null
  const formulation = clean(researchObject.formulationContext) || null
  const dose = clean(researchObject.doseContext) || null
  const duration = clean(researchObject.durationContext) || null
  const provenanceReceipts = [
    provenanceReceipt('$.claims[0].sourceStatement', 'finding', finding),
    provenanceReceipt('$.claims[0].publicSafeStatement', 'finding', finding),
    provenanceReceipt('$.uncertainties[0].statement', 'limitation', limitation),
  ]
  for (const [field, value] of Object.entries({
    populationContext: population,
    formulationContext: formulation,
    doseContext: dose,
    durationContext: duration,
  })) {
    if (value !== null) {
      const target = field.replace('Context', '')
      provenanceReceipts.push(provenanceReceipt(`$.claims[0].studyContext.${target}`, field, value))
    }
  }

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
        population,
        formulation,
        dose,
        duration,
      },
    }],
    sources: [{
      id: 'RESEARCH_OBJECT_001',
      kind: 'research-object',
      identifier: id,
      url: sourceUrl,
    }],
    provenanceReceipts,
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
