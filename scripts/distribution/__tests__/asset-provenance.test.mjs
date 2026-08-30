import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import {
  assertAssetManifestFresh,
  buildAssetProvenance,
  factualProvenanceFingerprint,
  hashStableValue,
} from '../asset-provenance.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const researchObjects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../data/distribution/research-objects.json'), 'utf8'))
const mediaPack = buildDistributionPackFromResearchObject(researchObjects[0], { researchObjects })

function manifestFor(pack, creativeSpecHash = 'creative-a') {
  return {
    schemaVersion: '1.1.0',
    ...buildAssetProvenance({
      mediaPack: pack,
      renderer: 'carousel-svg-v1',
      templateVersion: 'carousel-portrait-v1',
      creativeSpecHash,
    }),
    assets: [],
  }
}

test('factual provenance fingerprint is deterministic and key-order independent', () => {
  const first = factualProvenanceFingerprint(mediaPack)
  const second = factualProvenanceFingerprint(mediaPack)
  expect(first).toBe(second)
  expect(first).toMatch(/^[a-f0-9]{64}$/)
  expect(hashStableValue({ b: 2, a: 1 })).toBe(hashStableValue({ a: 1, b: 2 }))
})

test('asset provenance carries the canonical pack identity required by freshness validation', () => {
  const provenance = buildAssetProvenance({
    mediaPack,
    renderer: 'carousel-svg-v1',
    templateVersion: 'carousel-portrait-v1',
    creativeSpecHash: 'creative-a',
  })
  expect(provenance.packId).toBe(mediaPack.packId)
  expect(assertAssetManifestFresh(provenance, mediaPack)).toBe(true)
  expect(() => assertAssetManifestFresh({ ...provenance, packId: 'different-media-pack-v1' }, mediaPack))
    .toThrow(/STALE\/INVALID/)
})

test('creative-only changes alter presentation identity without changing factual authority', () => {
  const first = manifestFor(mediaPack, 'creative-a')
  const second = manifestFor(mediaPack, 'creative-b')
  expect(first.factualProvenanceFingerprint).toBe(second.factualProvenanceFingerprint)
  expect(first.presentationFingerprint).not.toBe(second.presentationFingerprint)
})

test('freshness fails closed when governed factual/provenance identity is stale', () => {
  const current = manifestFor(mediaPack)
  expect(assertAssetManifestFresh(current, mediaPack)).toBe(true)

  expect(() => assertAssetManifestFresh({ ...current, factualProvenanceFingerprint: '0'.repeat(64) }, mediaPack))
    .toThrow(/STALE\/INVALID/)
  expect(() => assertAssetManifestFresh({ ...current, sourceContentHash: '0'.repeat(64) }, mediaPack))
    .toThrow(/STALE\/INVALID/)
  expect(() => assertAssetManifestFresh({ ...current, sourceUrl: 'https://thehippiescientist.net/herbs/stale/' }, mediaPack))
    .toThrow(/STALE\/INVALID/)
  expect(() => assertAssetManifestFresh({ ...current, packId: 'stale-media-pack-v1' }, mediaPack))
    .toThrow(/STALE\/INVALID/)
})

test('renderer and template versions are part of presentation identity', () => {
  const first = buildAssetProvenance({ mediaPack, renderer: 'carousel-svg-v1', templateVersion: 'carousel-portrait-v1', creativeSpecHash: 'creative-a' })
  const rendererChanged = buildAssetProvenance({ mediaPack, renderer: 'carousel-svg-v2', templateVersion: 'carousel-portrait-v1', creativeSpecHash: 'creative-a' })
  const templateChanged = buildAssetProvenance({ mediaPack, renderer: 'carousel-svg-v1', templateVersion: 'carousel-portrait-v2', creativeSpecHash: 'creative-a' })
  expect(rendererChanged.factualProvenanceFingerprint).toBe(first.factualProvenanceFingerprint)
  expect(templateChanged.factualProvenanceFingerprint).toBe(first.factualProvenanceFingerprint)
  expect(rendererChanged.presentationFingerprint).not.toBe(first.presentationFingerprint)
  expect(templateChanged.presentationFingerprint).not.toBe(first.presentationFingerprint)
})
