import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { CREATIVE_BRAND_TOKENS } from '../creative-spec.mjs'
import { renderCarouselAssets } from '../render-carousel-svg.mjs'
import { renderCarouselRasterAssets } from '../render-carousel-raster.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const researchObjects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../data/distribution/research-objects.json'), 'utf8'))
const researchObject = researchObjects[0]
const mediaPack = buildDistributionPackFromResearchObject(researchObject, { researchObjects })
const creativeSpec = {
  claimSafetyStatus: 'validated-lossless',
  sourceIdentity: { id: researchObject.id, sourceUrl: researchObject.sourceUrl },
  delivery: { landingUrl: researchObject.sourceUrl, disclosure: CREATIVE_BRAND_TOKENS.treatment.disclosure },
  carousel: { slides: [
    { role: 'finding', eyebrow: 'What the evidence says', headline: 'A governed finding remains unchanged.', body: 'Evidence context remains visible.', colorTreatment: 'evidence' },
    { role: 'source', eyebrow: 'Source trail', headline: 'Read the evidence', body: researchObject.sourceUrl, colorTreatment: 'source' },
  ] },
}
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex')

async function withRenderedAssets(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-raster-'))
  try {
    const svgManifest = renderCarouselAssets({ mediaPack, creativeSpec, outputDir: dir })
    return await run({ dir, svgManifest })
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

test('deterministically derives PNG and WebP assets from canonical SVG bytes', async () => {
  await withRenderedAssets(async ({ dir, svgManifest }) => {
    const first = await renderCarouselRasterAssets({ manifest: svgManifest, outputDir: dir })
    const firstBytes = new Map(first.assets.map((asset) => [asset.file, fs.readFileSync(path.join(dir, asset.file))]))
    const second = await renderCarouselRasterAssets({ manifest: svgManifest, outputDir: dir })
    expect(second).toEqual(first)
    expect(first.assets).toHaveLength(svgManifest.assets.length * 2)
    for (const asset of first.assets) {
      const bytes = fs.readFileSync(path.join(dir, asset.file))
      expect(bytes.equals(firstBytes.get(asset.file))).toBe(true)
      expect(asset.sha256).toBe(digest(bytes))
      expect(asset.sourceContentHash).toBe(svgManifest.sourceContentHash)
      const parent = svgManifest.assets.find((candidate) => candidate.file === asset.parentSvgFile)
      expect(asset.parentSvgSha256).toBe(parent.sha256)
      expect(asset.sourceUrl).toBe(parent.sourceUrl)
      expect(asset.exporter).toBe('carousel-raster-v1')
    }
  })
})

test('fails closed when an SVG parent is tampered after manifest creation', async () => {
  await withRenderedAssets(async ({ dir, svgManifest }) => {
    fs.appendFileSync(path.join(dir, svgManifest.assets[0].file), '<!-- tampered -->')
    await expect(renderCarouselRasterAssets({ manifest: svgManifest, outputDir: dir })).rejects.toThrow(/hash mismatch/)
  })
})

test('rejects noncanonical manifests and unsupported formats', async () => {
  await withRenderedAssets(async ({ dir, svgManifest }) => {
    await expect(renderCarouselRasterAssets({ manifest: { ...svgManifest, renderer: 'other' }, outputDir: dir })).rejects.toThrow(/carousel-svg-v1/)
    await expect(renderCarouselRasterAssets({ manifest: svgManifest, outputDir: dir, formats: ['jpg'] })).rejects.toThrow(/png and\/or webp/)
  })
})
