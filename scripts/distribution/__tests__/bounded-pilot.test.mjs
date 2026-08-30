import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildAssetProvenance, hashStableValue } from '../asset-provenance.mjs'
import { buildDistributionPackFromResearchObject } from '../build-distribution-pack.mjs'
import { buildLosslessCreativeSpec } from '../creative-spec-lossless.mjs'
import { createBoundedPilotPackage } from '../build-bounded-pilot.mjs'

const [researchObject] = JSON.parse(fs.readFileSync('data/distribution/research-objects.json', 'utf8'))
const mediaPack = buildDistributionPackFromResearchObject(researchObject)
const creativeSpec = { ...buildLosslessCreativeSpec(researchObject), claimSafetyStatus: 'validated-lossless' }
const assetManifest = {
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

describe('first bounded distribution pilot', () => {
  it('stops at a deterministic dry-run schedule with an unobserved future window', () => {
    const now = '2026-08-30T00:00:00.000Z'
    const pilot = createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest, now })
    const again = createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest, now })
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
      lifecycle: { state: 'scheduled', dryRun: true },
    })
    expect(pilot.lifecycle.receipts).toHaveLength(1)
    expect(pilot.lifecycle.receipts[0]).toMatchObject({ state: 'scheduled', provider: 'dry-run', dryRun: true })
    expect(pilot.lifecycle.receipts.some((receipt) => receipt.state === 'published')).toBe(false)
  })

  it('fails closed when selection and governed pack identity differ', () => {
    expect(() => createBoundedPilotPackage({
      selection: { ...selection, selected: { ...selected, id: 'different-object' } },
      packageData,
      mediaPack,
      assetManifest,
      now: '2026-08-30T00:00:00.000Z',
    })).toThrow(/must match the validated media pack/i)
  })
})
