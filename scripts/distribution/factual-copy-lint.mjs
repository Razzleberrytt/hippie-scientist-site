const COMPLETE_ASSET_TYPES = new Set(['caption', 'description', 'narration', 'script'])
const DISPLAY_ASSET_TYPES = new Set(['infographic', 'carousel', 'overlay', ...COMPLETE_ASSET_TYPES])

const CONSUMER_DOSE_RE = /\b(?:take|use|consume|swallow|dose|start with|increase to)\b[^.!?\n]{0,48}\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|capsules?|tablets?|drops?|scoops?)\b/i
const BENEFIT_WORD = '(?:improve|improves|boost|boosts|reduce|reduces|relieve|relieves|prevent|prevents|treat|treats|heal|heals|help|helps|work|works|benefit|benefits)'
const SECOND_PERSON_BENEFIT_RE = new RegExp(`(?:\\b(?:you|your)\\b[^.!?\\n]{0,80}\\b${BENEFIT_WORD}\\b|\\b${BENEFIT_WORD}\\b[^.!?\\n]{0,80}\\b(?:you|your)\\b)`, 'i')
const ABSOLUTE_SAFETY_RE = /\b(?:completely safe|totally safe|perfectly safe|100% safe|risk[- ]?free|no side effects?|harmless)\b/i
const HUMAN_BENEFIT_RE = /\b(?:people|humans?|patients?|adults?|children|users?)\b[^.!?\n]{0,80}\b(?:improve|improves|boost|boosts|reduce|reduces|relieve|relieves|prevent|prevents|treat|treats|heal|heals|benefit|benefits)\b/i

function clean(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ')
}

function ensurePack(pack) {
  if (!pack || typeof pack !== 'object' || Array.isArray(pack)) throw new Error('validated distribution pack is required')
  if (!Array.isArray(pack.claims) || !pack.claims.length) throw new Error('distribution pack must contain claims')
  if (!Array.isArray(pack.uncertainties) || !pack.uncertainties.length) throw new Error('distribution pack must contain uncertainty')
  return pack
}

function allowedClaimMap(pack) {
  return new Map(pack.claims.map((claim) => [String(claim.id), clean(claim.publicSafeStatement)]))
}

function allowedUncertaintyMap(pack) {
  return new Map(pack.uncertainties.map((item) => [String(item.id), clean(item.statement)]))
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
  const seenClaims = new Set()
  const seenUncertainties = new Set()

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
    } else if (role === 'cta') {
      if (text !== clean(pack.cta?.label)) errors.push(`line ${index + 1} CTA must equal the governed CTA label`)
    } else if (role === 'label') {
      if (line.factual === true) errors.push(`line ${index + 1} factual labels must be represented as governed claim or uncertainty lines`)
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

  return [...new Set(errors)]
}

export function assertFactualAssetCopy(pack, asset) {
  const errors = validateFactualAssetCopy(pack, asset)
  if (errors.length) throw new Error(`Unsafe distribution asset copy:\n- ${errors.join('\n- ')}`)
  return asset
}
