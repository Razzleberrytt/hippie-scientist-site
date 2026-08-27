import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const SITE_ORIGIN = 'https://thehippiescientist.net'
const DOSE_UNIT = '(?:mcg|mg|g|ml|iu|units?)'
const DOSAGE_FORM = '(?:capsule|capsules|tablet|tablets|pill|pills|gummy|gummies|softgel|softgels|scoop|scoops|drop|drops|dose|doses|serving|servings|packet|packets|chew|chews|chewable|chewables|teaspoon|teaspoons|tablespoon|tablespoons)'
const QUANTITY = '(?:\\d+(?:\\.\\d+)?|\\d+\\s*\\/\\s*\\d+|[a-z]+(?:-[a-z]+)?(?:\\s+(?:a|an))?)'
const FREQUENCY = '(?:daily|per day|each day|nightly|before bed|once daily|twice daily)'
const DIRECTIVE_VERB = '(?:take|consume|try|use(?!\\s+of\\b)|administer|swallow|ingest)'
const DIRECTIVE_DOSE_PATTERNS = [
  new RegExp(`(?:^|[.!?;]\\s*)(?:${DIRECTIVE_VERB}|start with|begin with|increase to|decrease to)\\b[^.!?;\\n]{0,120}\\b(?:${DOSE_UNIT}|${DOSAGE_FORM})\\b`, 'i'),
  new RegExp(`\\b${DIRECTIVE_VERB}\\s+(?:${QUANTITY}\\s+)?\\d+(?:\\.\\d+)?\\s*${DOSE_UNIT}(?:\\s+${DOSAGE_FORM})?(?:\\s+${FREQUENCY})?\\b`, 'i'),
  new RegExp(`\\b${DIRECTIVE_VERB}\\s+${QUANTITY}\\s+${DOSAGE_FORM}(?:\\s+${FREQUENCY})?\\b`, 'i'),
  new RegExp(`\\b(?:start with|begin with|increase to|decrease to)\\s+${QUANTITY}(?:\\s*${DOSE_UNIT}|\\s+${DOSAGE_FORM})\\b`, 'i'),
  new RegExp(`\\byou should\\s+${DIRECTIVE_VERB}\\b`, 'i'),
  new RegExp(`\\b${DIRECTIVE_VERB}\\s+(?:this|the|your|a|an)\\s+(?:supplement|product|extract|${DOSAGE_FORM})\\b`, 'i'),
]
const HUMAN_DIRECTED_RE = /\b(?:humans?|people|persons?|patients?|participants?|volunteers?|subjects?|individuals?|adults?|adolescents?|teens?|teenagers?|children|youth|seniors?|elderly|men|women|users?|consumers?|you|your|yours)\b/i
const HUMAN_EVIDENCE_TYPES = new Set(['meta-analysis', 'systematic-review', 'RCT', 'controlled-trial', 'observational', 'case-report'])
const MIXED_EVIDENCE_TYPES = new Set(['mixed', 'narrative-review'])
const REQUIRED_FORBIDDEN_EXTRAPOLATIONS = Object.freeze([
  'Do not strengthen the canonical research finding.',
  'Do not convert dose/form context into consumer instructions.',
  'Do not project preclinical evidence as human efficacy or benefit.',
])

const __filename = fileURLToPath(import.meta.url)
const moduleDir = path.dirname(__filename)
const schemaPath = path.resolve(moduleDir, '../../schemas/distribution-pack-v1.schema.json')
const canonicalResearchObjectsPath = path.resolve(moduleDir, '../../data/distribution/research-objects.json')
const distributionPackSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
const validateSchema = ajv.compile(distributionPackSchema)

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]))
  }
  return value
}

export function hashResearchObject(object) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(object))).digest('hex')
}

export function hashCanonicalField(value) {
  return crypto.createHash('sha256').update(clean(value)).digest('hex')
}

function loadCanonicalResearchObjects() {
  const value = JSON.parse(fs.readFileSync(canonicalResearchObjectsPath, 'utf8'))
  if (!Array.isArray(value)) throw new Error('canonical research-object registry must be an array')
  return value
}

function canonicalSitePageUrl(value) {
  try {
    const url = new URL(String(value ?? ''))
    if (url.origin !== SITE_ORIGIN || url.pathname === '/' || url.search || url.hash) return null
    const pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
    return `${SITE_ORIGIN}${pathname}`
  } catch {
    return null
  }
}

function expectedPackId(researchObjectId) {
  return `${researchObjectId.replace(/[._]+/g, '-').replace(/-+/g, '-')}-media-v1`
}

function expectedEvidenceContext(researchObject) {
  const evidenceType = String(researchObject?.evidenceType ?? '')
  if (evidenceType === 'preclinical') return 'preclinical'
  if (MIXED_EVIDENCE_TYPES.has(evidenceType)) return 'mixed'
  if (HUMAN_EVIDENCE_TYPES.has(evidenceType)) return 'human'
  return null
}

function expectedContext(value) {
  const normalized = clean(value)
  return normalized || null
}

function expectedProvenanceReceipts(researchObject) {
  const receipts = [
    ['$.claims[0].sourceStatement', 'finding', researchObject.finding],
    ['$.claims[0].publicSafeStatement', 'finding', researchObject.finding],
    ['$.uncertainties[0].statement', 'limitation', researchObject.limitation],
  ]
  for (const [field, targetPath] of [
    ['populationContext', '$.claims[0].studyContext.population'],
    ['formulationContext', '$.claims[0].studyContext.formulation'],
    ['doseContext', '$.claims[0].studyContext.dose'],
    ['durationContext', '$.claims[0].studyContext.duration'],
  ]) {
    if (expectedContext(researchObject[field]) !== null) {
      receipts.push([targetPath, field, researchObject[field]])
    }
  }
  if (expectedContext(researchObject.safetyStatement) !== null) {
    receipts.push(['$.safety[0].statement', 'safetyStatement', researchObject.safetyStatement])
  }
  return receipts.map(([targetPath, canonicalField, value]) => ({
    targetPath,
    canonicalField,
    sourceRef: 'RESEARCH_OBJECT_001',
    fieldHash: hashCanonicalField(value),
  }))
}

function addError(errors, path, message) {
  errors.push({ path, message })
}

function schemaErrorPath(error) {
  return error.instancePath ? `$${error.instancePath}` : '$'
}

function arraysEqualAsSets(left, right) {
  if (left.length !== right.length) return false
  const expected = new Set(right)
  return left.every((value) => expected.has(value))
}

function receiptsEqual(left, right) {
  if (left.length !== right.length) return false
  const key = (receipt) => `${receipt.targetPath}\u0000${receipt.canonicalField}\u0000${receipt.sourceRef}\u0000${receipt.fieldHash}`
  const expected = new Set(right.map(key))
  return left.every((receipt) => expected.has(key(receipt)))
}

function buildCanonicalRegistry(objects, errors) {
  if (!Array.isArray(objects)) {
    addError(errors, '$.researchObjectIds', 'canonical research-object registry must be an array')
    return new Map()
  }

  const registry = new Map()
  for (const [index, object] of objects.entries()) {
    if (!object || typeof object !== 'object' || Array.isArray(object)) {
      addError(errors, '$.researchObjectIds', `canonical research object at index ${index} is invalid`)
      continue
    }
    const id = clean(object.id)
    if (!id || !clean(object.title) || !clean(object.finding) || !clean(object.limitation) || !canonicalSitePageUrl(object.sourceUrl)) {
      addError(errors, '$.researchObjectIds', `canonical research object ${id || index} is missing required trusted fields`)
      continue
    }
    if (!expectedEvidenceContext(object)) {
      addError(errors, '$.researchObjectIds', `canonical research object ${id} has unsupported evidenceType ${clean(object.evidenceType)}`)
      continue
    }
    const safetyClaimId = expectedContext(object.safetyClaimId)
    const safetyStatement = expectedContext(object.safetyStatement)
    if ((safetyClaimId === null) !== (safetyStatement === null)) {
      addError(errors, '$.researchObjectIds', `canonical research object ${id} must provide safetyClaimId and safetyStatement together`)
      continue
    }
    if (safetyClaimId !== null && !/^clm_[a-f0-9]+$/.test(safetyClaimId)) {
      addError(errors, '$.researchObjectIds', `canonical research object ${id} has invalid safetyClaimId`)
      continue
    }
    if (registry.has(id)) {
      addError(errors, '$.researchObjectIds', `canonical research-object registry contains duplicate id ${id}`)
      continue
    }
    registry.set(id, object)
  }
  return registry
}

export function validateDistributionPack(pack, options = {}) {
  const errors = []
  if (!pack || typeof pack !== 'object' || Array.isArray(pack)) {
    return [{ path: '$', message: 'distribution pack must be an object' }]
  }

  if (!validateSchema(pack)) {
    for (const error of validateSchema.errors ?? []) {
      addError(errors, schemaErrorPath(error), `schema: ${error.message ?? 'validation failed'}`)
    }
    return errors
  }

  let researchObjects
  try {
    researchObjects = options.researchObjects ?? loadCanonicalResearchObjects()
  } catch (error) {
    addError(errors, '$.researchObjectIds', `canonical research-object registry unavailable: ${error instanceof Error ? error.message : String(error)}`)
    return errors
  }

  const registry = buildCanonicalRegistry(researchObjects, errors)
  if (errors.length) return errors

  const researchObjectId = pack.researchObjectIds[0]
  const researchObject = registry.get(researchObjectId)
  if (!researchObject) {
    addError(errors, '$.researchObjectIds[0]', `does not resolve to canonical research object ${researchObjectId}`)
    return errors
  }

  const canonicalSourceUrl = canonicalSitePageUrl(researchObject.sourceUrl)
  const canonicalFinding = clean(researchObject.finding)
  const canonicalLimitation = clean(researchObject.limitation)
  const canonicalTitle = clean(researchObject.title)
  const canonicalHash = hashResearchObject(researchObject)
  const evidenceContext = expectedEvidenceContext(researchObject)
  const expectedSourceId = 'RESEARCH_OBJECT_001'
  const expectedClaimId = 'CLAIM_001'

  if (pack.packId !== expectedPackId(researchObjectId)) {
    addError(errors, '$.packId', `must be derived from canonical research object ${researchObjectId}`)
  }
  if (pack.source.url !== canonicalSourceUrl) addError(errors, '$.source.url', 'must equal the canonical research-object sourceUrl')
  if (clean(pack.source.title) !== canonicalTitle) addError(errors, '$.source.title', 'must equal the canonical research-object title')
  if (pack.source.contentHash !== canonicalHash) addError(errors, '$.source.contentHash', 'must equal the deterministic hash of the canonical research object')

  const source = pack.sources[0]
  if (source.id !== expectedSourceId || source.kind !== 'research-object') addError(errors, '$.sources[0]', 'must be the canonical research-object source binding')
  if (source.identifier !== researchObjectId) addError(errors, '$.sources[0].identifier', `must resolve to canonical research object ${researchObjectId}`)
  if (source.url !== canonicalSourceUrl) addError(errors, '$.sources[0].url', 'must equal the canonical research-object sourceUrl')

  const expectedReceipts = expectedProvenanceReceipts(researchObject)
  if (!receiptsEqual(pack.provenanceReceipts, expectedReceipts)) {
    addError(errors, '$.provenanceReceipts', 'must exactly bind each factual payload to its canonical research-object field and deterministic field hash')
  }

  const claim = pack.claims[0]
  if (claim.id !== expectedClaimId) addError(errors, '$.claims[0].id', `must equal ${expectedClaimId}`)
  if (clean(claim.sourceStatement) !== canonicalFinding) addError(errors, '$.claims[0].sourceStatement', 'must equal the canonical research-object finding')
  if (clean(claim.publicSafeStatement) !== canonicalFinding) addError(errors, '$.claims[0].publicSafeStatement', 'v1 forbids free-form factual rewriting; statement must equal the canonical research-object finding')
  if (claim.strengthDelta !== 'none') addError(errors, '$.claims[0].strengthDelta', 'v1 permits no self-attested claim transformation')
  if (claim.evidenceContext !== evidenceContext) addError(errors, '$.claims[0].evidenceContext', `must be derived from canonical evidenceType ${clean(researchObject.evidenceType)}`)
  if (claim.sourceRefs.length !== 1 || claim.sourceRefs[0] !== expectedSourceId) addError(errors, '$.claims[0].sourceRefs', 'must reference only the canonical research object')
  if (claim.consumerInstruction !== false) addError(errors, '$.claims[0].consumerInstruction', 'distribution packs never authorize consumer instructions')

  const expectedPopulation = expectedContext(researchObject.populationContext)
  const expectedFormulation = expectedContext(researchObject.formulationContext)
  const expectedDose = expectedContext(researchObject.doseContext)
  const expectedDuration = expectedContext(researchObject.durationContext)
  if (claim.studyContext.population !== expectedPopulation) addError(errors, '$.claims[0].studyContext.population', 'must equal canonical populationContext or null')
  if (claim.studyContext.formulation !== expectedFormulation) addError(errors, '$.claims[0].studyContext.formulation', 'must equal canonical formulationContext or null')
  if (claim.studyContext.dose !== expectedDose) addError(errors, '$.claims[0].studyContext.dose', 'must equal canonical doseContext or null')
  if (claim.studyContext.duration !== expectedDuration) addError(errors, '$.claims[0].studyContext.duration', 'must equal canonical durationContext or null')

  for (const pattern of DIRECTIVE_DOSE_PATTERNS) {
    if (pattern.test(claim.publicSafeStatement)) {
      addError(errors, '$.claims[0].publicSafeStatement', 'canonical finding contains directive consumer-dose language and cannot enter a distribution pack')
      break
    }
  }

  if (claim.evidenceContext === 'preclinical') {
    const explicitlyPreclinical = /\b(?:preclinical|animal|animals|cell|cells|laboratory|lab)\b/i.test(claim.publicSafeStatement)
    if (!explicitlyPreclinical) addError(errors, '$.claims[0].publicSafeStatement', 'preclinical finding must remain explicitly labeled as preclinical/animal/cell evidence')
    if (HUMAN_DIRECTED_RE.test(claim.publicSafeStatement)) addError(errors, '$.claims[0].publicSafeStatement', 'v1 preclinical findings may not contain human- or second-person-directed language; keep human inference boundaries outside the canonical finding')
  }

  const expectedSafetyStatement = expectedContext(researchObject.safetyStatement)
  const expectedSafetyClaimId = expectedContext(researchObject.safetyClaimId)
  if (expectedSafetyStatement === null) {
    if (pack.safety.length !== 0) addError(errors, '$.safety', 'must remain empty when the canonical research object owns no safety statement')
  } else {
    if (pack.safety.length !== 1) {
      addError(errors, '$.safety', 'must contain exactly one canonical safety statement when the research object owns one')
    } else {
      const safety = pack.safety[0]
      if (safety.id !== 'SAFETY_001') addError(errors, '$.safety[0].id', 'must equal SAFETY_001')
      if (safety.canonicalClaimId !== expectedSafetyClaimId) addError(errors, '$.safety[0].canonicalClaimId', 'must equal canonical research-object safetyClaimId')
      if (clean(safety.statement) !== expectedSafetyStatement) addError(errors, '$.safety[0].statement', 'must equal the canonical research-object safetyStatement without rewriting')
      if (safety.sourceRefs.length !== 1 || safety.sourceRefs[0] !== expectedSourceId) addError(errors, '$.safety[0].sourceRefs', 'must reference only the canonical research object')
    }
  }

  const uncertainty = pack.uncertainties[0]
  if (uncertainty.id !== 'UNCERTAINTY_001') addError(errors, '$.uncertainties[0].id', 'must equal UNCERTAINTY_001')
  if (clean(uncertainty.statement) !== canonicalLimitation) addError(errors, '$.uncertainties[0].statement', 'must equal the canonical research-object limitation')
  if (uncertainty.sourceRefs.length !== 1 || uncertainty.sourceRefs[0] !== expectedSourceId) addError(errors, '$.uncertainties[0].sourceRefs', 'must reference only the canonical research object')

  if (!arraysEqualAsSets(pack.forbiddenExtrapolations, REQUIRED_FORBIDDEN_EXTRAPOLATIONS)) {
    addError(errors, '$.forbiddenExtrapolations', 'must contain the complete fixed v1 no-strengthening, no-consumer-dose, and no-preclinical-human-projection boundaries')
  }

  if (pack.cta.label !== 'Read the evidence') addError(errors, '$.cta.label', 'must use the fixed evidence CTA')
  if (pack.cta.destinationUrl !== canonicalSourceUrl) addError(errors, '$.cta.destinationUrl', 'must equal the canonical research-object sourceUrl')

  for (const [index, intent] of pack.assetIntents.entries()) {
    if (intent.objective !== 'Render the canonical finding without factual rewriting.') addError(errors, `$.assetIntents[${index}].objective`, 'must use the fixed non-rewriting objective')
    if (intent.claimIds.length !== 1 || intent.claimIds[0] !== expectedClaimId) addError(errors, `$.assetIntents[${index}].claimIds`, `must reference only ${expectedClaimId}`)
  }

  return errors
}

export function assertValidDistributionPack(pack, options = {}) {
  const errors = validateDistributionPack(pack, options)
  if (errors.length) {
    const detail = errors.map(({ path, message }) => `${path}: ${message}`).join('\n')
    throw new Error(`Invalid distribution pack:\n${detail}`)
  }
  return pack
}
