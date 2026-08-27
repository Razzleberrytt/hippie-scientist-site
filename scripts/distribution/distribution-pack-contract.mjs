const SITE_ORIGIN = 'https://thehippiescientist.net'
const SHA256_RE = /^[a-f0-9]{64}$/
const ID_RE = /^[A-Z0-9][A-Z0-9_-]{2,79}$/
const PACK_ID_RE = /^[a-z0-9][a-z0-9-]{2,79}$/
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
const SOURCE_KINDS = new Set(['pmid', 'doi', 'regulatory', 'site-citation', 'site-evidence-record'])
const DIRECTIVE_DOSE_PATTERNS = [
  /\b(?:take|consume|start with|increase to|decrease to)\s+\d+(?:\.\d+)?\s*(?:mcg|mg|g|ml)\b/i,
  /\byou should\s+(?:take|use|consume)\b/i,
  /\b(?:take|consume)\s+\d+(?:\.\d+)?\s*(?:mcg|mg|g|ml)\s+(?:daily|per day|each day|nightly|before bed)\b/i,
]

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

export function validateDistributionPack(pack) {
  const errors = []
  if (!isPlainObject(pack)) return [{ path: '$', message: 'distribution pack must be an object' }]

  if (pack.schemaVersion !== '1.0.0') addError(errors, '$.schemaVersion', 'must equal 1.0.0')
  if (!PACK_ID_RE.test(pack.packId ?? '')) addError(errors, '$.packId', 'must be a stable lowercase pack ID')

  if (!isPlainObject(pack.source)) {
    addError(errors, '$.source', 'must be an object')
  } else {
    if (!isCanonicalSitePageUrl(pack.source.url)) addError(errors, '$.source.url', 'must be a canonical TheHippieScientist page URL with trailing slash and no query/hash')
    if (!isNonEmptyString(pack.source.title)) addError(errors, '$.source.title', 'must be non-empty')
    if (!SHA256_RE.test(pack.source.contentHash ?? '')) addError(errors, '$.source.contentHash', 'must be a lowercase SHA-256 hex digest')
  }

  if (!isNonEmptyString(pack.audience)) addError(errors, '$.audience', 'must be non-empty')
  if (!isNonEmptyString(pack.angle)) addError(errors, '$.angle', 'must be non-empty')
  if (!Array.isArray(pack.sources) || pack.sources.length === 0) addError(errors, '$.sources', 'must contain at least one source reference')

  const knownSourceIds = new Set()
  const globalIds = new Set()
  for (const [index, source] of (Array.isArray(pack.sources) ? pack.sources : []).entries()) {
    const path = `$.sources[${index}]`
    if (!isPlainObject(source)) {
      addError(errors, path, 'must be an object')
      continue
    }
    if (!ID_RE.test(source.id ?? '')) addError(errors, `${path}.id`, 'must be a stable uppercase ID')
    if (knownSourceIds.has(source.id)) addError(errors, `${path}.id`, 'must be unique')
    if (globalIds.has(source.id)) addError(errors, `${path}.id`, 'must be globally unique within the pack')
    if (ID_RE.test(source.id ?? '')) {
      knownSourceIds.add(source.id)
      globalIds.add(source.id)
    }
    if (!SOURCE_KINDS.has(source.kind)) addError(errors, `${path}.kind`, 'uses an unsupported source kind')
    if (!isNonEmptyString(source.identifier)) addError(errors, `${path}.identifier`, 'must be non-empty')
  }

  if (!Array.isArray(pack.claims) || pack.claims.length === 0) addError(errors, '$.claims', 'must contain at least one governed claim')

  const claimIds = new Set()
  for (const [index, claim] of (Array.isArray(pack.claims) ? pack.claims : []).entries()) {
    const path = `$.claims[${index}]`
    if (!isPlainObject(claim)) {
      addError(errors, path, 'must be an object')
      continue
    }
    if (!ID_RE.test(claim.id ?? '')) addError(errors, `${path}.id`, 'must be a stable uppercase ID')
    if (claimIds.has(claim.id)) addError(errors, `${path}.id`, 'must be unique')
    if (globalIds.has(claim.id)) addError(errors, `${path}.id`, 'must be globally unique within the pack')
    if (ID_RE.test(claim.id ?? '')) {
      claimIds.add(claim.id)
      globalIds.add(claim.id)
    }
    if (!isNonEmptyString(claim.sourceStatement)) addError(errors, `${path}.sourceStatement`, 'must be non-empty')
    if (!isNonEmptyString(claim.publicSafeStatement)) addError(errors, `${path}.publicSafeStatement`, 'must be non-empty')
    if (!['none', 'weaker'].includes(claim.strengthDelta)) addError(errors, `${path}.strengthDelta`, 'must be none or weaker; strengthening is never allowed')
    if (!EVIDENCE_CONTEXTS.has(claim.evidenceContext)) addError(errors, `${path}.evidenceContext`, 'uses an unsupported evidence context')
    if (claim.consumerInstruction !== false) addError(errors, `${path}.consumerInstruction`, 'must be false; distribution packs do not authorize consumer instructions')
    validateRefList(errors, `${path}.sourceRefs`, claim.sourceRefs, knownSourceIds)

    if (isNonEmptyString(claim.publicSafeStatement)) {
      for (const pattern of DIRECTIVE_DOSE_PATTERNS) {
        if (pattern.test(claim.publicSafeStatement)) {
          addError(errors, `${path}.publicSafeStatement`, 'contains directive consumer-dose language')
          break
        }
      }
    }

    if (claim.evidenceContext === 'preclinical' && isNonEmptyString(claim.publicSafeStatement)) {
      const explicitlyPreclinical = /\b(?:preclinical|animal|animals|cell|cells|laboratory|lab)\b/i.test(claim.publicSafeStatement)
      if (!explicitlyPreclinical) addError(errors, `${path}.publicSafeStatement`, 'preclinical claims must remain explicitly labeled as preclinical/animal/cell evidence')
      if (/\b(?:in|for)\s+(?:humans|people|patients)\b/i.test(claim.publicSafeStatement)) addError(errors, `${path}.publicSafeStatement`, 'preclinical-only evidence cannot be projected as human efficacy')
    }
  }

  for (const field of ['safety', 'uncertainties']) {
    if (!Array.isArray(pack[field])) {
      addError(errors, `$.${field}`, 'must be an array')
      continue
    }
    for (const [index, boundary] of pack[field].entries()) {
      const path = `$.${field}[${index}]`
      if (!isPlainObject(boundary)) {
        addError(errors, path, 'must be an object')
        continue
      }
      if (!ID_RE.test(boundary.id ?? '')) addError(errors, `${path}.id`, 'must be a stable uppercase ID')
      if (globalIds.has(boundary.id)) addError(errors, `${path}.id`, 'must be globally unique within the pack')
      if (ID_RE.test(boundary.id ?? '')) globalIds.add(boundary.id)
      if (!isNonEmptyString(boundary.statement)) addError(errors, `${path}.statement`, 'must be non-empty')
      validateRefList(errors, `${path}.sourceRefs`, boundary.sourceRefs, knownSourceIds)
    }
  }

  if (!Array.isArray(pack.forbiddenExtrapolations) || pack.forbiddenExtrapolations.length === 0) {
    addError(errors, '$.forbiddenExtrapolations', 'must explicitly contain at least one forbidden extrapolation')
  } else {
    for (const [index, statement] of pack.forbiddenExtrapolations.entries()) {
      if (!isNonEmptyString(statement)) addError(errors, `$.forbiddenExtrapolations[${index}]`, 'must be non-empty')
    }
  }

  if (pack.cta != null) {
    if (!isPlainObject(pack.cta)) {
      addError(errors, '$.cta', 'must be an object or null')
    } else {
      if (!isNonEmptyString(pack.cta.label)) addError(errors, '$.cta.label', 'must be non-empty')
      if (!isCanonicalSitePageUrl(pack.cta.destinationUrl)) addError(errors, '$.cta.destinationUrl', 'must be a canonical TheHippieScientist page URL')
    }
  }

  if (!Array.isArray(pack.assetIntents) || pack.assetIntents.length === 0) {
    addError(errors, '$.assetIntents', 'must contain at least one asset intent')
  } else {
    for (const [index, intent] of pack.assetIntents.entries()) {
      const path = `$.assetIntents[${index}]`
      if (!isPlainObject(intent)) {
        addError(errors, path, 'must be an object')
        continue
      }
      if (!ASSET_TYPES.has(intent.type)) addError(errors, `${path}.type`, 'uses an unsupported asset type')
      if (!isNonEmptyString(intent.objective)) addError(errors, `${path}.objective`, 'must be non-empty')
      if (!Array.isArray(intent.claimIds) || intent.claimIds.length === 0) {
        addError(errors, `${path}.claimIds`, 'must contain at least one claim ID')
      } else {
        const seen = new Set()
        for (const [claimIndex, claimId] of intent.claimIds.entries()) {
          if (seen.has(claimId)) addError(errors, `${path}.claimIds[${claimIndex}]`, 'must not duplicate a claim ID')
          seen.add(claimId)
          if (!claimIds.has(claimId)) addError(errors, `${path}.claimIds[${claimIndex}]`, `references unknown claim ${claimId}`)
        }
      }
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
