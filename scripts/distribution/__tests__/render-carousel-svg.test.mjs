import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { CREATIVE_BRAND_TOKENS } from '../creative-spec.mjs'
import { renderCarouselAssets, renderCarouselSlideSvg } from '../render-carousel-svg.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const researchObjects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../data/distribution/research-objects.json'), 'utf8'))
const researchObject = researchObjects[0]
const mediaPack = buildDistributionPackFromResearchObject(researchObject, { researchObjects })
const disclosure = CREATIVE_BRAND_TOKENS.treatment.disclosure
const creativeSpec = {
  claimSafetyStatus: 'validated-lossless',
  sourceIdentity: { id: researchObject.id, sourceUrl: researchObject.sourceUrl },
  delivery: { landingUrl: researchObject.sourceUrl, disclosure },
  carousel: { slides: [
    { role: 'finding', eyebrow: 'What the evidence says', headline: 'A governed finding remains unchanged.', body: 'Evidence context remains visible.', colorTreatment: 'evidence' },
    { role: 'limitation', eyebrow: 'What to keep in mind', headline: 'A governed limitation remains unchanged.', body: null, colorTreatment: 'primaryLight' },
    { role: 'source', eyebrow: 'Source trail', headline: 'Read the evidence', body: researchObject.sourceUrl, colorTreatment: 'source' },
  ] },
}

const digest = (value) => crypto.createHash('sha256').update(value).digest('hex')

test('renders deterministic SVG assets tied to canonical source hash and exact file bytes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-svg-'))
  try {
    const first = renderCarouselAssets({ mediaPack, creativeSpec, outputDir: dir })
    const second = renderCarouselAssets({ mediaPack, creativeSpec, outputDir: dir })
    assert.deepEqual(first, second)
    assert.equal(first.sourceContentHash, mediaPack.source.contentHash)
    assert.equal(first.assets.length, 3)
    for (const asset of first.assets) {
      assert.equal(asset.sourceContentHash, mediaPack.source.contentHash)
      const bytes = fs.readFileSync(path.join(dir, asset.file), 'utf8')
      assert.match(bytes, /validated-distribution-pack/)
      assert.match(bytes, new RegExp(mediaPack.source.contentHash))
      assert.match(bytes, /Educational content/)
      assert.equal(asset.sha256, digest(bytes))
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('losslessly wraps a canonical source URL instead of rejecting the real source card', () => {
  const rendered = renderCarouselSlideSvg(creativeSpec.carousel.slides[2], {
    sourceUrl: mediaPack.source.url,
    contentHash: mediaPack.source.contentHash,
    disclosure,
  })
  assert.match(rendered.svg, /thehippiescientist\.net\/herbs\/ashwagandha\//)
})

test('keeps disclosure and provenance text inside the portrait safe-area bottom edge', () => {
  const rendered = renderCarouselSlideSvg(creativeSpec.carousel.slides[0], {
    sourceUrl: mediaPack.source.url,
    contentHash: mediaPack.source.contentHash,
    disclosure,
  })
  const safeBottomY = CREATIVE_BRAND_TOKENS.canvas.portrait.height - CREATIVE_BRAND_TOKENS.canvas.portrait.safeBottom
  const yValues = [...rendered.svg.matchAll(/<text x="80" y="(\d+)"[^>]*>(?:Educational content|The Hippie Scientist)/g)].map((match) => Number(match[1]))
  assert.equal(yValues.length, 2)
  assert.ok(yValues.every((value) => value <= safeBottomY))
})

test('refuses unsafe, unproven, or mismatched provenance state', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-svg-'))
  try {
    assert.throws(() => renderCarouselAssets({ mediaPack, creativeSpec: { ...creativeSpec, claimSafetyStatus: 'blocked-unsafe-truncation' }, outputDir: dir }), /validated-lossless/)
    assert.throws(() => renderCarouselAssets({ mediaPack: { packId: 'x', source: {} }, creativeSpec, outputDir: dir }), /Invalid distribution pack|schema|researchObjectIds/i)
    assert.throws(() => renderCarouselAssets({ mediaPack, creativeSpec: { ...creativeSpec, sourceIdentity: { ...creativeSpec.sourceIdentity, id: 'different-object' } }, outputDir: dir }), /source identity must match/)
    assert.throws(() => renderCarouselAssets({ mediaPack, creativeSpec: { ...creativeSpec, sourceIdentity: { ...creativeSpec.sourceIdentity, sourceUrl: 'https://thehippiescientist.net/herbs/other/' } }, outputDir: dir }), /source URL must match/)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('refuses renderer-level factual truncation for non-URL tokens', () => {
  assert.throws(() => renderCarouselSlideSvg(
    { role: 'finding', eyebrow: 'Evidence', headline: 'x'.repeat(40), colorTreatment: 'evidence' },
    { sourceUrl: mediaPack.source.url, contentHash: mediaPack.source.contentHash, disclosure },
  ), /losslessly wrap token/)
})
