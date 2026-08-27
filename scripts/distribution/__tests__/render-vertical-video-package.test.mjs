import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'
import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { buildLosslessCreativeSpec } from '../creative-spec-lossless.mjs'
import { renderVerticalVideoPackage } from '../render-vertical-video-package.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const researchObjects = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../data/distribution/research-objects.json'), 'utf8'))
const researchObject = researchObjects[0]
const mediaPack = buildDistributionPackFromResearchObject(researchObject, { researchObjects })
const creativeSpec = { ...buildLosslessCreativeSpec(researchObject), claimSafetyStatus: 'validated-lossless' }
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex')
const normalized = (value) => String(value).trim().replace(/\s+/g, ' ')

test('renders a deterministic exact-30-second vertical video package with provenance-bound scene assets', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-video-'))
  try {
    const first = renderVerticalVideoPackage({ mediaPack, creativeSpec, outputDir: dir })
    const second = renderVerticalVideoPackage({ mediaPack, creativeSpec, outputDir: dir })
    expect(first).toEqual(second)
    expect(first.renderer).toBe('vertical-video-package-v1')
    expect(first.durationSeconds).toBe(30)
    expect(first.sourceContentHash).toBe(mediaPack.source.contentHash)
    expect(first.assets.length).toBeGreaterThanOrEqual(6)

    const timelineBytes = fs.readFileSync(path.join(dir, first.timeline.file), 'utf8')
    const timeline = JSON.parse(timelineBytes)
    expect(first.timeline.sha256).toBe(digest(timelineBytes))
    expect(timeline.durationSeconds).toBe(30)
    expect(timeline.width).toBe(1080)
    expect(timeline.height).toBe(1920)
    expect(timeline.scenes[0].start).toBe(0)
    expect(timeline.scenes.at(-1).end).toBe(30)
    for (let index = 1; index < timeline.scenes.length; index += 1) {
      expect(timeline.scenes[index - 1].end).toBe(timeline.scenes[index].start)
    }

    for (const asset of first.assets) {
      const bytes = fs.readFileSync(path.join(dir, asset.file), 'utf8')
      expect(asset.sha256).toBe(digest(bytes))
      expect(asset.sourceContentHash).toBe(mediaPack.source.contentHash)
      expect(asset.sourceUrl).toBe(mediaPack.source.url)
      expect(bytes).toContain(mediaPack.source.contentHash)
      expect(bytes).toContain('vertical-video-package-v1')
      expect(bytes).toContain('Educational content')
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('preserves governed finding and limitation text losslessly in the caption package', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-video-'))
  try {
    const manifest = renderVerticalVideoPackage({ mediaPack, creativeSpec, outputDir: dir })
    const captions = fs.readFileSync(path.join(dir, manifest.captions.file), 'utf8')
    expect(manifest.captions.lossless).toBe(true)
    expect(manifest.captions.sha256).toBe(digest(captions))
    expect(normalized(captions)).toContain(normalized(researchObject.finding))
    expect(normalized(captions)).toContain(normalized(researchObject.limitation))
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})

test('fails closed on unsafe creative state, mismatched source identity, or missing lossless continuation pages', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-video-'))
  try {
    expect(() => renderVerticalVideoPackage({
      mediaPack,
      creativeSpec: { ...creativeSpec, claimSafetyStatus: 'blocked-unsafe-truncation' },
      outputDir: dir,
    })).toThrow(/validated-lossless/)

    expect(() => renderVerticalVideoPackage({
      mediaPack,
      creativeSpec: { ...creativeSpec, sourceIdentity: { ...creativeSpec.sourceIdentity, id: 'different-object' } },
      outputDir: dir,
    })).toThrow(/source identity must match/)

    expect(() => renderVerticalVideoPackage({
      mediaPack,
      creativeSpec: {
        ...creativeSpec,
        verticalVideo: {
          ...creativeSpec.verticalVideo,
          losslessCopy: {
            ...creativeSpec.verticalVideo.losslessCopy,
            finding: { ...creativeSpec.verticalVideo.losslessCopy.finding, pages: [] },
          },
        },
      },
      outputDir: dir,
    })).toThrow(/finding\.pages is required/)
  } finally { fs.rmSync(dir, { recursive: true, force: true }) }
})
