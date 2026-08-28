import { assertValidDistributionPack, hashCanonicalField, hashResearchObject } from './distribution-pack-contract.mjs'
import { assertDistributionCitationBinding } from './distribution-citation-binding.mjs'
import { assertDistributionEvidenceGradeBinding } from './distribution-evidence-grade-binding.mjs'

const SITE_ORIGIN = 'https://thehippiescientist.net'
const HUMAN_EVIDENCE_TYPES = new Set(['meta-analysis', 'systematic-review', 'RCT', 'controlled-trial', 'observational', 'case-report'])
const MIXED_EVIDENCE_TYPES = new Set(['mixed', 'narrative-review'])
const EVIDENCE_GRADES = new Set(['A', 'B', 'C', 'D', 'Avoid/Insufficient'])
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

function normalizedSafetyWarnings(researchObject) {
  if (researchObject.safetyWarnings === undefined) return []
  if (!Array.isArray(researchObject.safetyWarnings) || researchObject.safetyWarnings.length === 0) {
    throw new Error('research object safetyWarnings must be a non-empty array when provided')
  }
  return researchObject.safetyWarnings.map((warning, index) => {
    if (!warning || typeof warning !== 'object' || Array.isArray(warning)) {
      throw new Error(`research object safetyWarnings[${index}] must be an object`)
    }
    const claimId = clean(warning.claimId)
    const statement = clean(warning.statement)
    if (!/^clm_[a-f0-9]+$/.test(claimId) || !statement) {
      throw new Error(`research object safetyWarnings[${index}] must include canonical claimId and statement`)
    }
    return { claimId, statement }
  })
}

export function buildDistributionPackFromResearchObject(researchObject, options = {}) {
  if (!researchObject || typeof researchObject !== 'object' || Array.isArray(researchObject)) {
    throw new Error('research object must be an object')
  }

  const id = clean(researchObject.id)
  const title = clean(researchObject.title)
  const finding = clean(researchObject.finding)
  const limitation = clean(researchObject.limitation)
  const evidenceGrade = clean(researchObject.evidenceGrade)
  if (!id || !title || !finding || !limitation) {
    throw new Error('research object must include id, title, finding, and limitation')
  }
  if (!EVIDENCE_GRADES.has(evidenceGrade)) {
    throw new Error(`unsupported evidenceGrade for distribution pack: ${evidenceGrade || '(empty)'}`)
  }

  const findingClaimId = clean(researchObject.findingClaimId) || null
  const primarySourceId = clean(researchObject.primarySourceId) || null
  const primarySourceUrl = clean(researchObject.primarySourceUrl) || null
  const citationValues = [findingClaimId, primarySourceId, primarySourceUrl]
  const citationCount = citationValues.filter((value) => value !== null).length
  if (citationCount !== 0 && citationCount !== citationValues.length) {
    throw new Error('research object findingClaimId, primarySourceId, and primarySourceUrl must be provided together')
  }
  const hasCitationBinding = citationCount === citationValues.length

  const sourceUrl = canonicalPageUrl(researchObject.sourceUrl)
  const context = evidenceContext(researchObject.evidenceType)
  const population = clean(researchObject.populationContext) || null
  const formulation = clean(researchObject.formulationContext) || null
  const dose = clean(researchObject.doseContext) || null
  const duration = clean(researchObject.durationContext) || null
  const safetyWarnings = normalizedSafetyWarnings(researchObject)

  const provenanceReceipts = [
    provenanceReceipt('$.claims[0].sourceStatement', 'finding', finding),
    provenanceReceipt('$.claims[0].publicSafeStatement', 'finding', finding),
    provenanceReceipt('$.claims[0].evidenceGrade', 'evidenceGrade', evidenceGrade),
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
  for (const [index, warning] of safetyWarnings.entries()) {
    provenanceReceipts.push(provenanceReceipt(
      `$.safety[${index}].statement`,
      `safetyWarnings[${index}].statement`,
      warning.statement,
    ))
  }

  const source = {
    url: sourceUrl,
    title,
    contentHash: hashResearchObject(researchObject),
  }
  if (hasCitationBinding) {
    source.findingClaimId = findingClaimId
    source.primarySourceId = primarySourceId
    source.primarySourceUrl = primarySourceUrl
  }

  const pack = {
    schemaVersion: '1.0.0',
    packId: packIdFromResearchObjectId(id),
    researchObjectIds: [id],
    source,
    audience: 'General educational audience',
    angle: 'What the evidence actually says',
    claims: [{
      id: 'CLAIM_001',
      sourceStatement: finding,
      publicSafeStatement: finding,
      strengthDelta: 'none',
      evidenceContext: context,
      evidenceGrade,
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
    safety: safetyWarnings.map((warning, index) => ({
      id: `SAFETY_${String(index + 1).padStart(3, '0')}`,
      canonicalClaimId: warning.claimId,
      statement: warning.statement,
      sourceRefs: ['RESEARCH_OBJECT_001'],
    })),
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

  const validated = assertValidDistributionPack(pack, {
    researchObjects: options.researchObjects ?? [researchObject],
  })
  const citationValidated = hasCitationBinding ? assertDistributionCitationBinding(validated, researchObject) : validated
  return assertDistributionEvidenceGradeBinding(citationValidated, researchObject)
}
