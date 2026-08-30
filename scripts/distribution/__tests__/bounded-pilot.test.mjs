import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildAssetProvenance, hashStableValue } from '../asset-provenance.mjs'
import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { buildLosslessCreativeSpec } from '../creative-spec-lossless.mjs'
import { createBoundedPilotPackage } from '../build-bounded-pilot.mjs'

const [researchObject] = JSON.parse(fs.readFileSync('data/distribution/research-objects.json', 'utf8'))
const mediaPack = buildDistributionPackFromResearchObject(researchObject)
const creativeSpec = { ...buildLosslessCreativeSpec(researchObject), claimSafetyStatus: 'validated-lossless' }
const carouselAssetManifest = {
  schemaVersion: '1.1.0',
  packId: mediaPack.packId,
  ...buildAssetProvenance({
    mediaPack,
    renderer: 'carousel-raster-v1',
    templateVersion: 'carousel-portrait-v1',
    creativeSpecHash: hashStableValue(creativeSpec),
  }),
  assets: [],
}
const shortVideoAssetManifest = {
  schemaVersion: '1.0.0',
  packId: mediaPack.packId,
  durationSeconds: 30,
  ...buildAssetProvenance({
    mediaPack,
    renderer: 'vertical-video-package-v1',
    templateVersion: 'vertical-video-30s-v1',
    creativeSpecHash: hashStableValue(creativeSpec),
  }),
  assets: [],
}
const selected = {
  id: researchObject.id,
  sourceUrl: researchObject.sourceUrl,
  platform: 'carousel',
  destination: {
    taggedUrl: `${researchObject.sourceUrl}?utm_source=distribution-engine&utm_medium=organic&utm_campaign=evidence-to-distribution&utm_content=pilot`,
    attribution: { campaign: 'evidence-to-distribution' },
  },
  successCriteria: {
    primaryMetric: 'qualified visits to canonical evidence page from tagged distribution links',
    secondaryMetrics: ['asset completion/save rate'],
    measurementWindowDays: 28,
  },
}
const selection = { status: 'selected', selected, signalEvidence: { mode: 'fallback-defaults' } }
const packageData = { mediaPack: { status: 'validated', packId: mediaPack.packId } }

describe('bounded distribution pilot', () => {
  it('stops at a deterministic dry-run schedule with an unobserved future window', () => {
    const now = '2026-08-30T00:00:00.000Z'
    const pilot = createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest: carouselAssetManifest, now })
    const again = createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest: carouselAssetManifest, now })
    expect(pilot).toEqual(again)
    expect(pilot).toMatchObject({
      status: 'dry-run-scheduled',
      publication: { mode: 'dry-run', livePublicationAuthorized: false },
      measurementPlan: {
        windowDays: 28,
        startsAfterConfirmedPublication: true,
        observedFrom: null,
        observedTo: null,
        currentValue: 'Unknown',
      },
      lifecycle: { state: 'scheduled', dryRun: true, identity: { platform: 'carousel', format: 'carousel' } },
    })
    expect(pilot.lifecycle.receipts).toHaveLength(1)
    expect(pilot.lifecycle.receipts[0]).toMatchObject({ state: 'scheduled', provider: 'dry-run', dryRun: true })
    expect(pilot.lifecycle.receipts.some((receipt) => receipt.state === 'published')).toBe(false)
  })

  it('admits a governed short-video package without changing publication authority', () => {
    const videoSelection = {
      ...selection,
      selected: { ...selected, platform: 'short-video' },
    }
    const pilot = createBoundedPilotPackage({
      selection: videoSelection,
      packageData,
      mediaPack,
      assetManifest: shortVideoAssetManifest,
      now: '2026-08-30T00:00:00.000Z',
    })
    expect(pilot).toMatchObject({
      status: 'dry-run-scheduled',
      publication: { mode: 'dry-run', livePublicationAuthorized: false },
      lifecycle: { state: 'scheduled', dryRun: true, identity: { platform: 'short-video', format: 'short-video' } },
      assets: { renderer: 'vertical-video-package-v1', durationSeconds: 30 },
    })
  })

  it('fails closed for unsupported formats', () => {
    expect(() => createBoundedPilotPackage({
      selection: { ...selection, selected: { ...selected, platform: 'story' } },
      packageData,
      mediaPack,
      assetManifest: carouselAssetManifest,
      now: '2026-08-30T00:00:00.000Z',
    })).toThrow(/supports governed carousel or short-video formats only/i)
  })

  it('fails closed when selection and governed pack identity differ', () => {
    expect(() => createBoundedPilotPackage({
      selection: { ...selection, selected: { ...selected, id: 'different-object' } },
      packageData,
      mediaPack,
      assetManifest: carouselAssetManifest,
      now: '2026-08-30T00:00:00.000Z',
    })).toThrow(/must match the validated media pack/i)
  })
})
