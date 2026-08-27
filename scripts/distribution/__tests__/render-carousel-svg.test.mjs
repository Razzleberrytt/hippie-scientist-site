import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { renderCarouselAssets, renderCarouselSlideSvg } from '../render-carousel-svg.mjs'

const mediaPack = {
  packId: 'ashwagandha-media-v1',
  source: { url: 'https://thehippiescientist.net/herbs/ashwagandha/', contentHash: 'abc123canonicalhash' },
}
const creativeSpec = {
  claimSafetyStatus: 'validated-lossless',
  carousel: { slides: [
    { role: 'finding', eyebrow: 'What the evidence says', headline: 'A governed finding remains unchanged.', body: 'Evidence context remains visible.', colorTreatment: 'evidence' },
    { role: 'limitation', eyebrow: 'What to keep in mind', headline: 'A governed limitation remains unchanged.', body: null, colorTreatment: 'primaryLight' },
  ] },
}

test('renders deterministic SVG assets tied to canonical source hash', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-svg-'))
  try {
    const first = renderCarouselAssets({ mediaPack, creativeSpec, outputDir: dir })
    const second = renderCarouselAssets({ mediaPack, creativeSpec, outputDir: dir })
    assert.deepEqual(first, second)
    assert.equal(first.sourceContentHash, mediaPack.source.contentHash)
    assert.equal(first.assets.length, 2)
    for (const asset of first.assets) {
      assert.equal(asset.sourceContentHash, mediaPack.source.contentHash)
      assert.match(fs.readFileSync(path.join(dir, asset.file), 'utf8'), /validated-distribution-pack/)
      assert.match(fs.readFileSync(path.join(dir, asset.file), 'utf8'), /abc123canonicalhash/)
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('refuses unsafe or unproven creative state', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-svg-'))
  try {
    assert.throws(() => renderCarouselAssets({ mediaPack, creativeSpec: { ...creativeSpec, claimSafetyStatus: 'blocked-unsafe-truncation' }, outputDir: dir }), /validated-lossless/)
    assert.throws(() => renderCarouselAssets({ mediaPack: { packId: 'x', source: {} }, creativeSpec, outputDir: dir }), /provenance/)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('refuses renderer-level factual truncation', () => {
  assert.throws(() => renderCarouselSlideSvg({ role: 'finding', eyebrow: 'Evidence', headline: 'x'.repeat(40), colorTreatment: 'evidence' }, { sourceUrl: mediaPack.source.url, contentHash: mediaPack.source.contentHash }), /losslessly wrap token/)
})
