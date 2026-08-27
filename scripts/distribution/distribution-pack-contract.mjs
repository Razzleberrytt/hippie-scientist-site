import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'

const SITE_ORIGIN = 'https://thehippiescientist.net'
const SHA256_RE = /^[a-f0-9]{64}$/
const ID_RE = /^[A-Z0-9][A-Z0-9_-]{2,79}$/
const PACK_ID_RE = /^[a-z0-9][a-z0-9-]{2,79}$/
const RESEARCH_OBJECT_ID_RE = /^[a-z0-9][a-z0-9._-]+$/
const ASSET_TYPES = new Set(['infographic', 'carousel', 'short-video', 'social-card', 'pinterest'])
const EVIDENCE_CONTEXTS = new Set([
  'human',
  'preclinical',
  'mixed',
  'mechanistic',
  'regulatory',
  'safety',
  'editorial',
])
const SOURCE_KINDS = new Set(['research-object', 'pmid', 'doi', 'regulatory', 'site-citation', 'site-evidence-record'])
const DOSE_UNIT = '(?:mcg|mg|g|ml)'
const DOSAGE_FORM = '(?:capsule|capsules|tablet|tablets|scoop|scoops|drop|drops|dose|doses)'
const FREQUENCY = '(?:daily|per day|each day|nightly|before bed|once daily|twice daily)'
const DIRECTIVE_DOSE_PATTERNS = [
  new RegExp(`\\b(?:take|use|consume|try)\\s+(?:(?:one|two|three|a|an)\\s+)?\\d+(?:\\.\\d+)?\\s*${DOSE_UNIT}(?:\\s+${DOSAGE_FORM})?(?:\\s+${FREQUENCY})?\\b`, 'i'),
  new RegExp(`\\b(?:take|use|consume|try)\\s+(?:one|two|three|a|an)\\s+${DOSAGE_FORM}(?:\\s+${FREQUENCY})?\\b`, 'i'),
  new RegExp(`\\b(?:start with|begin with|increase to|decrease to)\\s+(?:(?:one|two|three|a|an)\\s+)?\\d+(?:\\.\\d+)?\\s*${DOSE_UNIT}\\b`, 'i'),
  /\byou should\s+(?:take|use|consume|try)\b/i,
]
const HUMAN_POPULATION_RE = /\b(?:humans?|people|patients?|adults?|children|men|women|users?)\b/i
const EXPLICIT_NO_HUMAN_INFERENCE_RE = /\b(?:does not|do not|cannot|can't|doesn't|not enough to)\b[^.!?\n]{0,100}\b(?:establish|show|demonstrate|prove|support|predict|mean|translate)\b[^.!?\n]{0,80}\b(?:effects?|benefits?|efficacy|outcomes?|results?)?(?:\s+(?:in|for|to))?\s+(?:humans?|people|patients?|adults?|children|men|women)\b/i

const __filename = fileURLToPath(import.meta.url)
const schemaPath = path.resolve(path.dirname(__filename), '../../schemas/distribution-pack-v1.schema.json')
const distributionPackSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
const ajv = new Ajv2020({ allErrors: true, strict: true })
const validateSchema = ajv.compile(distributionPackSchema)

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isCanonicalSitePageUrl(value) {
  if (!isNonEmptyString(value)) return false
  try {
    const url = new URL(value)
    return url.origin === SITE_ORIGIN && url.pathname !== '/' && url.pathname.endsWith('/') && !url.search && !url.hash
  } catch {
    return false
  }
}

function addError(errors, path, message) {
  errors.push({ path, message })
}

function schemaErrorPath(error) {
  return error.instancePath ? `$${error.instancePath}` : '$'
}

function validateRefList(errors, path, refs, knownSourceIds) {
  if (!Array.isArray(refs) || refs.length === 0) {
    addError(errors, path, 'must contain at least one source reference')
    return
  }
  const seen = new Set()
  for (const [index, ref] of refs.entries()) {
    if (!ID_RE.test(ref ?? '')) {
      addError(errors, `${path}[${index}]`, 'must be a stable uppercase source ID')
      continue
    }
    if (seen.has(ref)) addError(errors, `${path}[${index}]`, 'must not duplicate a source reference')
    seen.add(ref)
    if (!knownSourceIds.has(ref)) addError(errors, `${path}[${index}]`, `references unknown source ${ref}`)
  }
}

function preclinicalProjectsToHumans(statement) {
  if (!HUMAN_POPULATION_RE.test(statement)) return false
  return !EXPLICIT_NO_HUMAN_INFERENCE_RE.test(statement)
}

export function validateDistributionPack(pack) {
  const errors = []
  if (!isPlainObject(pack)) return [{ path: '$', message: 'distribution pack must be an object' }]

  if (!validateSchema(pack)) {
    for (const error of validateSchema.errors ?? []) {
      addError(errors, schemaErrorPath(error), `schema: ${error.message ?? 'validation failed'}`)
    }
    return errors
  }

  if (pack.schemaVersion !== '1.0.0') addError(errors, '$.schemaVersion', 'must equal 1.0.0')
  if (!PACK_ID_RE.test(pack.packId ?? '')) addError(errors, '$.packId', 'must be a stable lowercase pack ID')

  const researchObjectIds = new Set()
  for (const [index, researchObjectId] of pack.researchObjectIds.entries()) {
    if (!RESEARCH_OBJECT_ID_RE.test(researchObjectId ?? '')) {
      addError(errors, `$.researchObjectIds[${index}]`, 'must match the existing research-object ID contract')
      continue
    }
    if (researchObjectIds.has(researchObjectId)) addError(errors, `$.researchObjectIds[${index}]`, 'must not duplicate a research-object ID')
    researchObjectIds.add(researchObjectId)
  }

  if (!isCanonicalSitePageUrl(pack.source.url)) addError(errors, '$.source.url', 'must be a canonical TheHippieScientist page URL with trailing slash and no query/hash')
  if (!SHA256_RE.test(pack.source.contentHash ?? '')) addError(errors, '$.source.contentHash', 'must be a lowercase SHA-256 hex digest')

  const knownSourceIds = new Set()
  const sourceById = new Map()
  const linkedResearchObjectIds = new Set()
  const globalIds = new Set()
  for (const [index, source] of pack.sources.entries()) {
    const sourcePath = `$.sources[${index}]`
    if (knownSourceIds.has(source.id)) addError(errors, `${sourcePath}.id`, 'must be unique')
    if (globalIds.has(source.id)) addError(errors, `${sourcePath}.id`, 'must be globally unique within the pack')
    knownSourceIds.add(source.id)
    sourceById.set(source.id, source)
    globalIds.add(source.id)
    if (!SOURCE_KINDS.has(source.kind)) addError(errors, `${sourcePath}.kind`, 'uses an unsupported source kind')
    if (source.kind === 'research-object') {
      if (!RESEARCH_OBJECT_ID_RE.test(source.identifier ?? '')) {
        addError(errors, `${sourcePath}.identifier`, 'must match the existing research-object ID contract')
      } else {
        linkedResearchObjectIds.add(source.identifier)
      }
    }
  }

  for (const researchObjectId of researchObjectIds) {
    if (!linkedResearchObjectIds.has(researchObjectId)) addError(errors, '$.sources', `must declare a research-object source for ${researchObjectId}`)
  }
  for (const linkedResearchObjectId of linkedResearchObjectIds) {
    if (!researchObjectIds.has(linkedResearchObjectId)) addError(errors, '$.sources', `research-object source ${linkedResearchObjectId} is not declared in researchObjectIds`)
  }

  const claimIds = new Set()
  for (const [index, claim] of pack.claims.entries()) {
    const claimPath = `$.claims[${index}]`
    if (claimIds.has(claim.id)) addError(errors, `${claimPath}.id`, 'must be unique')
    if (globalIds.has(claim.id)) addError(errors, `${claimPath}.id`, 'must be globally unique within the pack')
    claimIds.add(claim.id)
    globalIds.add(claim.id)
    if (!['none', 'weaker'].includes(claim.strengthDelta)) addError(errors, `${claimPath}.strengthDelta`, 'must be none or weaker; strengthening is never allowed')
    if (!EVIDENCE_CONTEXTS.has(claim.evidenceContext)) addError(errors, `${claimPath}.evidenceContext`, 'uses an unsupported evidence context')
    if (claim.consumerInstruction !== false) addError(errors, `${claimPath}.consumerInstruction`, 'must be false; distribution packs do not authorize consumer instructions')
    validateRefList(errors, `${claimPath}.sourceRefs`, claim.sourceRefs, knownSourceIds)

    if (!claim.sourceRefs.some((sourceId) => sourceById.get(sourceId)?.kind === 'research-object')) {
      addError(errors, `${claimPath}.sourceRefs`, 'must retain lineage to at least one canonical research distribution object')
    }

    for (const pattern of DIRECTIVE_DOSE_PATTERNS) {
      if (pattern.test(claim.publicSafeStatement)) {
        addError(errors, `${claimPath}.publicSafeStatement`, 'contains directive consumer-dose language')
        break
      }
    }

    if (claim.evidenceContext === 'preclinical') {
      const explicitlyPreclinical = /\b(?:preclinical|animal|animals|cell|cells|laboratory|lab)\b/i.test(claim.publicSafeStatement)
      if (!explicitlyPreclinical) addError(errors, `${claimPath}.publicSafeStatement`, 'preclinical claims must remain explicitly labeled as preclinical/animal/cell evidence')
      if (preclinicalProjectsToHumans(claim.publicSafeStatement)) addError(errors, `${claimPath}.publicSafeStatement`, 'preclinical-only evidence cannot be projected as a human benefit or efficacy claim')
    }
  }

  for (const field of ['safety', 'uncertainties']) {
    for (const [index, boundary] of pack[field].entries()) {
      const boundaryPath = `$.${field}[${index}]`
      if (globalIds.has(boundary.id)) addError(errors, `${boundaryPath}.id`, 'must be globally unique within the pack')
      globalIds.add(boundary.id)
      validateRefList(errors, `${boundaryPath}.sourceRefs`, boundary.sourceRefs, knownSourceIds)
    }
  }

  if (pack.cta != null && !isCanonicalSitePageUrl(pack.cta.destinationUrl)) addError(errors, '$.cta.destinationUrl', 'must be a canonical TheHippieScientist page URL')

  for (const [index, intent] of pack.assetIntents.entries()) {
    const intentPath = `$.assetIntents[${index}]`
    if (!ASSET_TYPES.has(intent.type)) addError(errors, `${intentPath}.type`, 'uses an unsupported asset type')
    const seen = new Set()
    for (const [claimIndex, claimId] of intent.claimIds.entries()) {
      if (seen.has(claimId)) addError(errors, `${intentPath}.claimIds[${claimIndex}]`, 'must not duplicate a claim ID')
      seen.add(claimId)
      if (!claimIds.has(claimId)) addError(errors, `${intentPath}.claimIds[${claimIndex}]`, `references unknown claim ${claimId}`)
    }
  }

  return errors
}

export function assertValidDistributionPack(pack) {
  const errors = validateDistributionPack(pack)
  if (errors.length) {
    const detail = errors.map(({ path, message }) => `${path}: ${message}`).join('\n')
    throw new Error(`Invalid distribution pack:\n${detail}`)
  }
  return pack
}
