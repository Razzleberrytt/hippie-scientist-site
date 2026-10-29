import test from 'node:test'
import assert from 'node:assert/strict'
import { hashStableValue } from '../asset-provenance.mjs'
import { buildDistributionIdentity } from '../distribution-lifecycle.mjs'
import { assertPublisherPilotIdentity, assertPublisherVideoManifestParity } from '../publisher-release-identity-gate.mjs'

function fixture(method = 'R8.10', runtime = 'R8.05') {
  const assets = {
    renderer: 'vertical-video-package-v1', packId: 'pack-x',
    sourceUrl: 'https://thehippiescientist.net/learn/example',
    sourceContentHash: 'a'.repeat(64), creativeSpecHash: 'b'.repeat(64),
    release: runtime, creativeMethodRelease: method,
  }
  const selectedOpportunity = {
    id: 'study-x', platform: 'short-video',
    destination: {
      taggedUrl: 'https://thehippiescientist.net/learn/example?utm_campaign=test',
      attribution: { campaign: 'test' },
    },
  }
  const identity = buildDistributionIdentity({
    researchObjectId: selectedOpportunity.id, researchObjectHash: assets.sourceContentHash,
    packId: assets.packId, packContentHash: 'c'.repeat(64),
    creativeSpecHash: assets.creativeSpecHash, assetManifestHash: hashStableValue(assets),
    sourceUrl: assets.sourceUrl, taggedDestination: selectedOpportunity.destination.taggedUrl,
    platform: 'short-video', format: 'short-video', campaignId: 'test',
  })
  const pilot = {
    selectedOpportunity, assets,
    lifecycle: {
      schemaVersion: 'distribution-lifecycle-v1', identity, lifecycleId: identity.idempotencyKey,
      state: 'scheduled', dryRun: true, paused: false,
      receipts: [{ state: 'scheduled', dryRun: true, idempotencyKey: identity.idempotencyKey,
        identityFingerprint: identity.fingerprint }],
    },
  }
  return { pilot, manifest: structuredClone(assets) }
}
function refreshIdentity(pilot) {
  const identity = buildDistributionIdentity({
    ...pilot.lifecycle.identity, assetManifestHash: hashStableValue(pilot.assets),
  })
  pilot.lifecycle.identity = identity
  pilot.lifecycle.lifecycleId = identity.idempotencyKey
  pilot.lifecycle.receipts = [{ state: 'scheduled', dryRun: true,
    idempotencyKey: identity.idempotencyKey, identityFingerprint: identity.fingerprint }]
}

test('legitimate R8.04 and legacy R8.05 remain eligible for their original gates', () => {
  for (const [method, runtime] of [['R8.04', 'R8.04'], ['R8.05', 'R8.05']]) {
    const { pilot, manifest } = fixture(method, runtime)
    assert.equal(assertPublisherPilotIdentity(pilot), true)
    assert.equal(assertPublisherVideoManifestParity(pilot, manifest, { masterQa: {} }), true)
  }
})
test('honest R8.10 remains routed to downstream alignment quarantine, not approved', () => {
  const { pilot, manifest } = fixture()
  assert.equal(assertPublisherPilotIdentity(pilot), true)
  assert.equal(assertPublisherVideoManifestParity(pilot, manifest,
    { masterQa: { creativeMethodRelease: 'R8.10' } }), true)
})
test('relabeling only pilot method R8.10 to R8.05 fails scheduled asset hash', () => {
  const { pilot } = fixture()
  pilot.assets.creativeMethodRelease = 'R8.05'
  assert.throws(() => assertPublisherPilotIdentity(pilot), /asset manifest hash/)
})
test('rekeying forged pilot cannot mismatch its unchanged rendered R8.10 manifest', () => {
  const { pilot, manifest } = fixture()
  pilot.assets.creativeMethodRelease = 'R8.05'
  refreshIdentity(pilot)
  assert.equal(assertPublisherPilotIdentity(pilot), true)
  assert.throws(() => assertPublisherVideoManifestParity(pilot, manifest),
    /rendered video manifest differs/)
})
test('relabeling pilot and rendered manifest cannot retain R8.10 master QA', () => {
  const { pilot, manifest } = fixture()
  pilot.assets.creativeMethodRelease = 'R8.05'
  manifest.creativeMethodRelease = 'R8.05'
  refreshIdentity(pilot)
  assert.throws(() => assertPublisherVideoManifestParity(pilot, manifest,
    { masterQa: { creativeMethodRelease: 'R8.10' } }), /QA creative release disagrees/)
})
test('forged fingerprint, idempotency key, lifecycle ID or scheduled receipt fail closed', () => {
  for (const mutate of [
    p => { p.lifecycle.identity.fingerprint = '0'.repeat(64) },
    p => { p.lifecycle.identity.idempotencyKey = 'dist_fake' },
    p => { p.lifecycle.lifecycleId = 'dist_fake' },
    p => { p.lifecycle.receipts[0].identityFingerprint = '0'.repeat(64) },
  ]) {
    const { pilot } = fixture()
    mutate(pilot)
    assert.throws(() => assertPublisherPilotIdentity(pilot))
  }
})
test('unsupported creative method/runtime combinations fail closed', () => {
  for (const [method, runtime] of [['R8.10', 'R8.04'], ['R8.11', 'R8.05']]) {
    const { pilot, manifest } = fixture(method, runtime)
    assert.throws(() => assertPublisherVideoManifestParity(pilot, manifest),
      /unsupported creative release/)
  }
})
