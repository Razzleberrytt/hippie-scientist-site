import { createHash } from 'node:crypto'

export const DISTRIBUTION_PACK_VERSION = 1
export const DISTRIBUTION_QUEUE_STATES = Object.freeze([
  'generated',
  'validated',
  'ready',
  'scheduled',
  'published',
  'measured',
])

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]))
  }
  return value
}

export function canonicalJson(value) {
  return JSON.stringify(stable(value))
}

export function contentHash(value) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex')
}

export function buildDistributionPack({ source, claims, campaign = {}, assets = [] }) {
  if (!source?.url || !source?.contentHash) throw new Error('source.url and source.contentHash are required')
  if (!Array.isArray(claims) || claims.length === 0) throw new Error('at least one governed claim is required')

  const governedClaims = claims.map((claim, index) => {
    if (!claim?.text || !claim?.provenance?.sourceUrl) {
      throw new Error(`claim ${index} must include text and provenance.sourceUrl`)
    }
    return {
      id: claim.id ?? `claim-${index + 1}`,
      text: claim.text,
      qualification: claim.qualification ?? null,
      provenance: claim.provenance,
    }
  })

  const factualPayload = {
    source: {
      url: source.url,
      canonicalId: source.canonicalId ?? source.url,
      contentHash: source.contentHash,
      reviewedAt: source.reviewedAt ?? null,
    },
    claims: governedClaims,
  }

  const packId = contentHash(factualPayload).slice(0, 20)
  const campaignId = campaign.id ?? `dist-${packId}`

  return {
    schemaVersion: DISTRIBUTION_PACK_VERSION,
    packId,
    campaign: {
      id: campaignId,
      source: campaign.source ?? 'organic-social',
      medium: campaign.medium ?? 'social',
      name: campaign.name ?? campaignId,
    },
    factualPayload,
    factualHash: contentHash(factualPayload),
    assets: assets.map((asset) => ({
      ...asset,
      factualHash: contentHash(factualPayload),
    })),
    queue: { state: 'generated' },
  }
}

export function validateDistributionPack(pack) {
  const errors = []
  if (pack?.schemaVersion !== DISTRIBUTION_PACK_VERSION) errors.push('unsupported schemaVersion')
  if (!DISTRIBUTION_QUEUE_STATES.includes(pack?.queue?.state)) errors.push('invalid queue state')
  if (!pack?.factualPayload?.source?.contentHash) errors.push('missing source content hash')
  if (!Array.isArray(pack?.factualPayload?.claims) || pack.factualPayload.claims.length === 0) errors.push('missing governed claims')

  const expectedHash = pack?.factualPayload ? contentHash(pack.factualPayload) : null
  if (pack?.factualHash !== expectedHash) errors.push('factual payload hash mismatch')

  for (const claim of pack?.factualPayload?.claims ?? []) {
    if (!claim?.text || !claim?.provenance?.sourceUrl) errors.push(`claim ${claim?.id ?? 'unknown'} lacks provenance`)
  }
  for (const asset of pack?.assets ?? []) {
    if (asset?.factualHash !== expectedHash) errors.push(`asset ${asset?.id ?? 'unknown'} is stale`)
  }

  return { valid: errors.length === 0, errors }
}

export function advanceQueue(pack, nextState) {
  const current = DISTRIBUTION_QUEUE_STATES.indexOf(pack?.queue?.state)
  const next = DISTRIBUTION_QUEUE_STATES.indexOf(nextState)
  if (current < 0 || next !== current + 1) {
    throw new Error(`invalid queue transition ${pack?.queue?.state} -> ${nextState}`)
  }
  return { ...pack, queue: { ...pack.queue, state: nextState } }
}
