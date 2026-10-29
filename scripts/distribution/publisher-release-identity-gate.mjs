// Reject mutable pilot labels that would select weaker publication release gates.
import { hashStableValue } from './asset-provenance.mjs'
import { buildDistributionIdentity } from './distribution-lifecycle.mjs'

const clean = (value) => String(value ?? '').trim()
const allowedMethods = new Set(['R8.05', 'R8.06', 'R8.07', 'R8.08', 'R8.09', 'R8.10'])

export function assertPublisherPilotIdentity(pilot) {
  const lifecycle = pilot?.lifecycle
  const identity = lifecycle?.identity
  const assets = pilot?.assets
  if (!identity || !assets || !pilot?.selectedOpportunity) {
    throw Error('THS Publisher pilot missing governed identity, opportunity or assets')
  }
  const expected = buildDistributionIdentity(identity)
  if (clean(identity.fingerprint) !== expected.fingerprint ||
      clean(identity.idempotencyKey) !== expected.idempotencyKey ||
      clean(lifecycle.lifecycleId) !== expected.idempotencyKey) {
    throw Error('THS Publisher lifecycle fingerprint, idempotency key or ID is stale')
  }
  if (clean(identity.assetManifestHash) !== hashStableValue(assets)) {
    throw Error('THS Publisher pilot asset manifest hash differs from scheduled lifecycle')
  }
  if (clean(identity.packId) !== clean(assets.packId) ||
      clean(identity.sourceUrl) !== clean(assets.sourceUrl) ||
      clean(identity.researchObjectHash) !== clean(assets.sourceContentHash) ||
      clean(identity.creativeSpecHash) !== clean(assets.creativeSpecHash) ||
      clean(identity.researchObjectId) !== clean(pilot.selectedOpportunity.id) ||
      clean(identity.platform) !== clean(pilot.selectedOpportunity.platform) ||
      clean(identity.format) !== clean(pilot.selectedOpportunity.platform) ||
      clean(identity.taggedDestination) !== clean(pilot.selectedOpportunity.destination?.taggedUrl) ||
      clean(identity.campaignId) !== clean(pilot.selectedOpportunity.destination?.attribution?.campaign)) {
    throw Error('THS Publisher scheduled identity differs from source, assets or opportunity')
  }
  if (lifecycle.state !== 'scheduled' || lifecycle.dryRun !== true || lifecycle.paused === true ||
      !Array.isArray(lifecycle.receipts) ||
      !lifecycle.receipts.some((receipt) => receipt?.state === 'scheduled' &&
        receipt.dryRun === true && receipt.idempotencyKey === expected.idempotencyKey &&
        receipt.identityFingerprint === expected.fingerprint)) {
    throw Error('THS Publisher lacks exact-identity dry-run scheduled lifecycle receipt')
  }
  return true
}

export function assertPublisherVideoManifestParity(pilot, renderedManifest, { masterQa = null } = {}) {
  const assets = pilot?.assets
  if (!assets || !renderedManifest || typeof renderedManifest !== 'object' ||
      Array.isArray(renderedManifest) || hashStableValue(renderedManifest) !== hashStableValue(assets)) {
    throw Error('THS Publisher rendered video manifest differs from scheduled pilot assets')
  }
  const runtime = clean(assets.release || assets.systemRelease) || 'R8.04'
  const method = clean(assets.creativeMethodRelease) || runtime
  const renderedRuntime = clean(renderedManifest.release || renderedManifest.systemRelease) || 'R8.04'
  const renderedMethod = clean(renderedManifest.creativeMethodRelease) || renderedRuntime
  if (runtime !== renderedRuntime || method !== renderedMethod) {
    throw Error('THS Publisher creative release identity differs between pilot and render manifest')
  }
  if ((runtime === 'R8.04' && method !== 'R8.04') ||
      (runtime === 'R8.05' && !allowedMethods.has(method)) ||
      !['R8.04', 'R8.05'].includes(runtime)) {
    throw Error('THS Publisher unsupported creative release/runtime identity')
  }
  if (masterQa !== null) {
    const qaMethod = clean(masterQa?.creativeMethodRelease)
    // Legacy R8.05 QA can predate explicit creative-method labels.
    if ((qaMethod && qaMethod !== method) || (method !== 'R8.05' && qaMethod !== method)) {
      throw Error('THS Publisher exact-master QA creative release disagrees with rendered video')
    }
  }
  return true
}
