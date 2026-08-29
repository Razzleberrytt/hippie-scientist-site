const COMPLETE_ASSET_TYPES = new Set(['caption', 'description', 'narration', 'script'])
const DISPLAY_ASSET_TYPES = new Set(['infographic', 'carousel', 'overlay', ...COMPLETE_ASSET_TYPES])
const SAFETY_REQUIRED_ASSET_TYPES = new Set(['infographic', 'carousel', ...COMPLETE_ASSET_TYPES])

const CONSUMER_DOSE_RE = /\b(?:take|use|consume|swallow|dose|start with|increase to)\b[^.!?\n]{0,48}\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|capsules?|tablets?|drops?|scoops?)\b/i
const BENEFIT_WORD = '(?:improv(?:e|es|ed|ing)|boost(?:s|ed|ing)?|reduc(?:e|es|ed|ing)|reliev(?:e|es|ed|ing)|prevent(?:s|ed|ing)?|treat(?:s|ed|ing)?|heal(?:s|ed|ing)?|help(?:s|ed|ing)?|work(?:s|ed|ing)?|benefit(?:s|ed|ing)?)'
const BENEFIT_OUTCOME = '(?:sleep|stress|anxiety|focus|pain|symptoms?|outcomes?|health|risk)'
const SECOND_PERSON_BENEFIT_RE = new RegExp(`(?:\\b(?:you|your)\\b[^.!?\\n]{0,80}\\b${BENEFIT_WORD}\\b|\\b${BENEFIT_WORD}\\b[^.!?\\n]{0,80}\\b(?:you|your)\\b)`, 'i')
const ABSOLUTE_SAFETY_RE = /\b(?:completely safe|totally safe|perfectly safe|100% safe|risk[- ]?free|no side effects?|harmless)\b/i
const HUMAN_BENEFIT_RE = new RegExp(`\\b(?:people|humans?|patients?|adults?|children|users?)\\b[^.!?\\n]{0,80}\\b${BENEFIT_WORD}\\b`, 'i')
const UNBOUND_FACTUAL_LABEL_RE = new RegExp(`(?:\\b(?:clinically|scientifically)\\s+proven\\b|\\bproven\\s+(?:safe|effective|efficacious)\\b|\\b(?:evidence|research)\\s+(?:shows?|suggests?|proves?|supports?|demonstrates?)\\b|\\bstud(?:y|ies)\\s+(?:shows?|suggests?|proves?|supports?|found|finds?|demonstrates?)\\b|\\b${BENEFIT_WORD}\\b[^.!?\\n]{0,80}\\b${BENEFIT_OUTCOME}\\b|\\b${BENEFIT_OUTCOME}\\b[^.!?\\n]{0,80}\\b${BENEFIT_WORD}\\b|\\b(?:safe|effective|efficacious)\\s+(?:for|in)\\b)`, 'i')

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function ensurePack(pack) {
  if (!pack || typeof pack !== 'object' || Array.isArray(pack)) throw new Error('validated distribution pack is required')
  if (!Array.isArray(pack.claims) || !pack.claims.length) throw new Error('distribution pack must contain claims')
  if (!Array.isArray(pack.uncertainties) || !pack.uncertainties.length) throw new Error('distribution pack must contain uncertainty')
  if (!Array.isArray(pack.safety)) throw new Error('distribution pack must contain a safety array')
  return pack
}

function allowedClaimMap(pack) {
  return new Map(pack.claims.map((claim) => [String(claim.id), clean(claim.publicSafeStatement)]))
}

function allowedUncertaintyMap(pack) {
  return new Map(pack.uncertainties.map((item) => [String(item.id), clean(item.statement)]))
}

function allowedSafetyMap(pack) {
  return new Map(pack.safety.map((item) => [String(item.id), clean(item.statement)]))
}

export function validateFactualAssetCopy(packInput, asset) {
  const pack = ensurePack(packInput)
  const errors = []
  if (!asset || typeof asset !== 'object' || Array.isArray(asset)) return ['asset copy payload must be an object']

  const assetType = clean(asset.assetType)
  if (!DISPLAY_ASSET_TYPES.has(assetType)) errors.push(`unsupported assetType: ${assetType || '(empty)'}`)

  const lines = Array.isArray(asset.lines) ? asset.lines : []
  if (!lines.length) errors.push('asset copy payload must contain lines')

  const claims = allowedClaimMap(pack)
  const uncertainties = allowedUncertaintyMap(pack)
  const safetyStatements = allowedSafetyMap(pack)
  const seenClaims = new Set()
  const seenUncertainties = new Set()
  const seenSafety = new Set()

  for (const [index, line] of lines.entries()) {
    if (!line || typeof line !== 'object' || Array.isArray(line)) {
      errors.push(`line ${index + 1} must be an object`)
      continue
    }
    const role = clean(line.role)
    const text = clean(line.text)
    if (!text) {
      errors.push(`line ${index + 1} text is required`)
      continue
    }

    if (CONSUMER_DOSE_RE.test(text)) errors.push(`line ${index + 1} converts study context into consumer dosing advice`)
    if (SECOND_PERSON_BENEFIT_RE.test(text)) errors.push(`line ${index + 1} projects an efficacy/benefit claim onto the consumer`)
    if (ABSOLUTE_SAFETY_RE.test(text)) errors.push(`line ${index + 1} uses prohibited absolute-safety language`)

    if (role === 'claim') {
      const claimId = clean(line.claimId)
      const allowed = claims.get(claimId)
      if (!allowed) errors.push(`line ${index + 1} references unknown claimId: ${claimId || '(empty)'}`)
      else if (text !== allowed) errors.push(`line ${index + 1} claim text must equal the governed publicSafeStatement`)
      else seenClaims.add(claimId)

      const claim = pack.claims.find((candidate) => String(candidate.id) === claimId)
      if (claim?.evidenceContext === 'preclinical' && HUMAN_BENEFIT_RE.test(text)) {
        errors.push(`line ${index + 1} projects preclinical evidence into human benefit language`)
      }
    } else if (role === 'uncertainty') {
      const uncertaintyId = clean(line.uncertaintyId)
      const allowed = uncertainties.get(uncertaintyId)
      if (!allowed) errors.push(`line ${index + 1} references unknown uncertaintyId: ${uncertaintyId || '(empty)'}`)
      else if (text !== allowed) errors.push(`line ${index + 1} uncertainty text must equal the governed limitation`)
      else seenUncertainties.add(uncertaintyId)
    } else if (role === 'safety') {
      const safetyId = clean(line.safetyId)
      const allowed = safetyStatements.get(safetyId)
      if (!allowed) errors.push(`line ${index + 1} references unknown safetyId: ${safetyId || '(empty)'}`)
      else if (text !== allowed) errors.push(`line ${index + 1} safety text must equal the governed safety statement`)
      else seenSafety.add(safetyId)
    } else if (role === 'cta') {
      if (text !== clean(pack.cta?.label)) errors.push(`line ${index + 1} CTA must equal the governed CTA label`)
    } else if (role === 'label') {
      if (line.factual === true || UNBOUND_FACTUAL_LABEL_RE.test(text)) {
        errors.push(`line ${index + 1} factual labels must be represented as governed claim, uncertainty, or safety lines`)
      }
    } else {
      errors.push(`line ${index + 1} has unsupported role: ${role || '(empty)'}`)
    }
  }

  if (COMPLETE_ASSET_TYPES.has(assetType)) {
    for (const claimId of claims.keys()) {
      if (!seenClaims.has(claimId)) errors.push(`complete ${assetType} is missing governed claim ${claimId}`)
    }
    for (const uncertaintyId of uncertainties.keys()) {
      if (!seenUncertainties.has(uncertaintyId)) errors.push(`complete ${assetType} is missing governed uncertainty ${uncertaintyId}`)
    }
  }

  if (SAFETY_REQUIRED_ASSET_TYPES.has(assetType)) {
    for (const safetyId of safetyStatements.keys()) {
      if (!seenSafety.has(safetyId)) errors.push(`${assetType} is missing governed safety statement ${safetyId}`)
    }
  }

  return [...new Set(errors)]
}

export function assertFactualAssetCopy(pack, asset) {
  const errors = validateFactualAssetCopy(pack, asset)
  if (errors.length) throw new Error(`Unsafe distribution asset copy:\n- ${errors.join('\n- ')}`)
  return asset
}
