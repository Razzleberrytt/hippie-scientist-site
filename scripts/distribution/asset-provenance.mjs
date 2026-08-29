import crypto from 'node:crypto'
import { assertValidDistributionPack } from './distribution-pack-contract.mjs'

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]))
  }
  return value
}

export function hashStableValue(value) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(value))).digest('hex')
}

export function governedFactualPayload(mediaPack) {
  assertValidDistributionPack(mediaPack)
  return {
    schemaVersion: mediaPack.schemaVersion,
    packId: mediaPack.packId,
    researchObjectIds: mediaPack.researchObjectIds,
    source: {
      url: mediaPack.source.url,
      contentHash: mediaPack.source.contentHash,
    },
    sources: mediaPack.sources,
    claims: mediaPack.claims,
    uncertainties: mediaPack.uncertainties,
    safety: mediaPack.safety,
    provenanceReceipts: mediaPack.provenanceReceipts,
    forbiddenExtrapolations: mediaPack.forbiddenExtrapolations,
  }
}

export function factualProvenanceFingerprint(mediaPack) {
  return hashStableValue(governedFactualPayload(mediaPack))
}

export function buildAssetProvenance({ mediaPack, renderer, templateVersion, creativeSpecHash = null }) {
  const rendererId = clean(renderer)
  const templateId = clean(templateVersion)
  if (!rendererId || !templateId) throw new Error('renderer and templateVersion are required for asset provenance')
  const factualFingerprint = factualProvenanceFingerprint(mediaPack)
  const presentationFingerprint = hashStableValue({
    factualFingerprint,
    renderer: rendererId,
    templateVersion: templateId,
    creativeSpecHash: clean(creativeSpecHash) || null,
  })
  return {
    sourceUrl: mediaPack.source.url,
    sourceContentHash: mediaPack.source.contentHash,
    factualProvenanceFingerprint: factualFingerprint,
    renderer: rendererId,
    templateVersion: templateId,
    creativeSpecHash: clean(creativeSpecHash) || null,
    presentationFingerprint,
  }
}

export function assertAssetManifestFresh(manifest, mediaPack) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('asset manifest is required')
  }
  const expected = factualProvenanceFingerprint(mediaPack)
  if (!clean(manifest.factualProvenanceFingerprint) || manifest.factualProvenanceFingerprint !== expected) {
    throw new Error('asset manifest is STALE/INVALID: governed factual or provenance fingerprint changed')
  }
  if (manifest.sourceContentHash !== mediaPack.source.contentHash || manifest.sourceUrl !== mediaPack.source.url || manifest.packId !== mediaPack.packId) {
    throw new Error('asset manifest is STALE/INVALID: canonical source identity changed')
  }
  return true
}
