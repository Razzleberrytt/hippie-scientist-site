import test from 'node:test'
import assert from 'node:assert/strict'
import { hashStableValue } from '../asset-provenance.mjs'
import { buildDistributionIdentity } from '../distribution-lifecycle.mjs'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { stagePublicationMedia } from '../stage-publication-media.mjs'
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
    schemaVersion: 'bounded-distribution-pilot-v1', status: 'dry-run-scheduled',
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
    // The R8.04 route has no master-QA receipt; legacy R8.05 does.
    assert.equal(assertPublisherVideoManifestParity(pilot, manifest,
      runtime === 'R8.04' ? {} : { masterQa: {} }), true)
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

test('real staging entrypoint rejects changed pilot before clearing existing public output', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-publisher-stage-negative-'))
  try {
    const sourceDir = path.join(dir, 'source')
    const publicRoot = path.join(dir, 'published')
    fs.mkdirSync(sourceDir)
    fs.mkdirSync(publicRoot)
    fs.writeFileSync(path.join(publicRoot, 'retain.txt'), 'must not delete')
    const { pilot } = fixture()
    pilot.assets.creativeMethodRelease = 'R8.05'
    const packageData = { mediaPack: { status: 'validated', packId: pilot.assets.packId } }
    assert.throws(() => stagePublicationMedia({
      pilot, packageData, sourceDir, publicRoot,
    }), /asset manifest hash/)
    assert.equal(fs.readFileSync(path.join(publicRoot, 'retain.txt'), 'utf8'), 'must not delete')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
test('real staging entrypoint rejects rekeyed R8.05 pilot with unchanged R8.10 render before reset', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-publisher-staging-parity-'))
  try {
    const sourceDir = path.join(dir, 'source')
    const publicRoot = path.join(dir, 'published')
    fs.mkdirSync(sourceDir)
    fs.mkdirSync(publicRoot)
    fs.writeFileSync(path.join(publicRoot, 'retain.txt'), 'must not delete')
    const { pilot, manifest } = fixture()
    pilot.assets.creativeMethodRelease = 'R8.05'
    refreshIdentity(pilot)
    fs.writeFileSync(path.join(sourceDir, 'video-asset-manifest.json'), JSON.stringify(manifest))
    const packageData = { mediaPack: { status: 'validated', packId: pilot.assets.packId } }
    assert.throws(() => stagePublicationMedia({
      pilot, packageData, sourceDir, publicRoot,
    }), /rendered video manifest differs/)
    assert.equal(fs.readFileSync(path.join(publicRoot, 'retain.txt'), 'utf8'), 'must not delete')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})
