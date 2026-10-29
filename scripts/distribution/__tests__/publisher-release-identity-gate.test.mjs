import test from 'node:test'
import assert from 'node:assert/strict'
import { hashStableValue } from '../asset-provenance.mjs'
import { buildDistributionIdentity } from '../distribution-lifecycle.mjs'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
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

function preservedPublisherFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-publisher-late-failure-'))
  const sourceDir = path.join(dir, 'source')
  const publicRoot = path.join(dir, 'published')
  fs.mkdirSync(sourceDir)
  fs.mkdirSync(path.join(publicRoot, 'old-bundle'), { recursive: true })
  const oldLatest = '{"known":"good","release":"previous"}\n'
  const oldMedia = Buffer.from([0, 1, 2, 3, 4, 255])
  fs.writeFileSync(path.join(publicRoot, 'latest.json'), oldLatest)
  fs.writeFileSync(path.join(publicRoot, 'old-bundle', 'keep.bin'), oldMedia)
  const assertPreserved = () => {
    assert.equal(fs.readFileSync(path.join(publicRoot, 'latest.json'), 'utf8'), oldLatest)
    assert.deepEqual(fs.readFileSync(path.join(publicRoot, 'old-bundle', 'keep.bin')), oldMedia)
  }
  return { dir, sourceDir, publicRoot, assertPreserved }
}
function carouselPilot() {
  const { pilot } = fixture('R8.04', 'R8.04')
  pilot.selectedOpportunity.platform = 'carousel'
  const raster = Buffer.from('synthetic-webp-bytes-for-hash-flow-not-an-image')
  pilot.assets = {
    exporter: 'carousel-raster-v1', renderer: 'carousel-raster-v1',
    packId: pilot.assets.packId, sourceUrl: pilot.assets.sourceUrl,
    sourceContentHash: pilot.assets.sourceContentHash, creativeSpecHash: pilot.assets.creativeSpecHash,
    assets: [{
      file: 'carousel-01.webp', type: 'carousel-slide-raster', format: 'webp',
      sha256: hashStableValue('not-actual-file-hash'), width: 1080, height: 1350,
    }],
  }
  const identity = buildDistributionIdentity({
    ...pilot.lifecycle.identity, platform: 'carousel', format: 'carousel',
    assetManifestHash: hashStableValue(pilot.assets),
  })
  pilot.lifecycle.identity = identity
  pilot.lifecycle.lifecycleId = identity.idempotencyKey
  pilot.lifecycle.receipts = [{
    state: 'scheduled', dryRun: true,
    idempotencyKey: identity.idempotencyKey, identityFingerprint: identity.fingerprint,
  }]
  return { pilot, raster }
}

test('late R8.05 missing MP4/receipt never deletes previously staged publisher content', () => {
  const f = preservedPublisherFixture()
  try {
    const { pilot } = fixture('R8.05', 'R8.05')
    pilot.assets.durationSeconds = 8
    refreshIdentity(pilot)
    fs.writeFileSync(path.join(f.sourceDir, 'video-asset-manifest.json'), JSON.stringify(pilot.assets))
    assert.throws(() => stagePublicationMedia({
      pilot, packageData: { mediaPack: { status: 'validated', packId: pilot.assets.packId } },
      sourceDir: f.sourceDir, publicRoot: f.publicRoot,
    }), /requires the rendered MP4 and its provenance receipt/)
    f.assertPreserved()
  } finally { fs.rmSync(f.dir, { recursive: true, force: true }) }
})
test('late missing carousel WebP never deletes previous publisher latest/bundle', () => {
  const f = preservedPublisherFixture()
  try {
    const { pilot } = carouselPilot()
    assert.throws(() => stagePublicationMedia({
      pilot, packageData: { mediaPack: { status: 'validated', packId: pilot.assets.packId } },
      sourceDir: f.sourceDir, publicRoot: f.publicRoot,
    }), /ENOENT/)
    f.assertPreserved()
  } finally { fs.rmSync(f.dir, { recursive: true, force: true }) }
})
test('late missing governed caption never deletes previous publisher latest/bundle', () => {
  const f = preservedPublisherFixture()
  try {
    const { pilot, raster } = carouselPilot()
    pilot.assets.assets[0].sha256 = crypto.createHash('sha256').update(raster).digest('hex')
    refreshIdentity(pilot)
    fs.writeFileSync(path.join(f.sourceDir, 'carousel-01.webp'), raster)
    assert.throws(() => stagePublicationMedia({
      pilot, packageData: { mediaPack: { status: 'validated', packId: pilot.assets.packId } },
      sourceDir: f.sourceDir, publicRoot: f.publicRoot,
    }), /requires governed caption text/)
    f.assertPreserved()
  } finally { fs.rmSync(f.dir, { recursive: true, force: true }) }
})
test('successful fully validated carousel promotion replaces old publisher bundle only after staging', () => {
  const f = preservedPublisherFixture()
  try {
    const { pilot, raster } = carouselPilot()
    pilot.assets.assets[0].sha256 = crypto.createHash('sha256').update(raster).digest('hex')
    refreshIdentity(pilot)
    fs.writeFileSync(path.join(f.sourceDir, 'carousel-01.webp'), raster)
    const packageData = {
      mediaPack: { status: 'validated', packId: pilot.assets.packId },
      instagram: 'Science summary: https://thehippiescientist.net/learn/example',
      sharedFacts: { title: 'A bounded science example' },
    }
    const result = stagePublicationMedia({
      pilot, packageData, sourceDir: f.sourceDir, publicRoot: f.publicRoot,
    })
    assert.equal(result.status, 'ready-for-provider')
    assert.equal(result.media[0].sha256, pilot.assets.assets[0].sha256)
    assert.equal(fs.existsSync(path.join(f.publicRoot, 'old-bundle')), false)
    assert.deepEqual(fs.readFileSync(path.join(f.publicRoot, 'study-x', result.identityFingerprint.slice(0, 20), 'carousel-01.webp')), raster)
    assert.equal(JSON.parse(fs.readFileSync(path.join(f.publicRoot, 'latest.json'), 'utf8')).identityFingerprint,
      pilot.lifecycle.identity.fingerprint)
  } finally { fs.rmSync(f.dir, { recursive: true, force: true }) }
})
