#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertAssetManifestFresh, hashStableValue } from './asset-provenance.mjs'
import { createDistributionLifecycle, transitionDistributionLifecycle } from './distribution-lifecycle.mjs'
import { renderCarouselAssets } from './render-carousel-svg.mjs'
import { renderCarouselRasterAssets } from './render-carousel-raster.mjs'

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

export function createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest, now }) {
  const selected = selection?.selected
  if (selection?.status !== 'selected' || !selected) throw new Error('bounded pilot requires one selected governed opportunity')
  if (selected.id !== mediaPack?.researchObjectIds?.[0]) throw new Error('selected opportunity must match the validated media pack')
  if (selected.sourceUrl !== mediaPack?.source?.url) throw new Error('selected opportunity must retain the canonical source URL')
  if (selected.platform !== 'carousel') throw new Error('first bounded pilot supports the governed carousel format only')
  if (packageData?.mediaPack?.status !== 'validated' || packageData?.mediaPack?.packId !== mediaPack.packId) {
    throw new Error('bounded pilot requires the validated generated package')
  }
  assertAssetManifestFresh(assetManifest, mediaPack)

  const identity = {
    researchObjectId: selected.id,
    researchObjectHash: mediaPack.source.contentHash,
    packId: mediaPack.packId,
    packContentHash: hashStableValue(mediaPack),
    creativeSpecHash: assetManifest.creativeSpecHash,
    assetManifestHash: hashStableValue(assetManifest),
    sourceUrl: mediaPack.source.url,
    taggedDestination: selected.destination.taggedUrl,
    platform: selected.platform,
    format: selected.platform,
    campaignId: selected.destination.attribution.campaign,
  }
  let lifecycle = createDistributionLifecycle(identity, { now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'validated', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'ready', { currentIdentity: identity, now })
  lifecycle = transitionDistributionLifecycle(lifecycle, 'scheduled', { currentIdentity: identity, now })

  return {
    schemaVersion: 'bounded-distribution-pilot-v1',
    status: 'dry-run-scheduled',
    generatedAt: now,
    selectedOpportunity: selected,
    signalEvidence: selection.signalEvidence,
    publication: {
      mode: 'dry-run',
      livePublicationAuthorized: false,
      externalBlocker: 'Live scheduling requires an explicit Metricool Publication workflow invocation and server-side Metricool credentials; this pilot never posts by itself.',
    },
    measurementPlan: {
      primaryMetric: selected.successCriteria.primaryMetric,
      secondaryMetrics: selected.successCriteria.secondaryMetrics,
      windowDays: selected.successCriteria.measurementWindowDays,
      startsAfterConfirmedPublication: true,
      observedFrom: null,
      observedTo: null,
      currentValue: 'Unknown',
    },
    lifecycle,
    assets: assetManifest,
  }
}

export async function buildBoundedPilot({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  now = new Date().toISOString(),
} = {}) {
  const selection = readJson(path.join(distributionDir, 'opportunity-selection.json'))
  const selectedId = selection?.selected?.id
  if (!selectedId) throw new Error('bounded pilot requires a selected opportunity artifact')
  const packageData = readJson(path.join(distributionDir, `${selectedId}.json`))
  const mediaPack = readJson(path.join(distributionDir, `${selectedId}.media-pack.json`))
  const outputDir = path.join(distributionDir, 'pilots', selectedId)
  const svgManifest = renderCarouselAssets({ mediaPack, creativeSpec: packageData.creativeSpec, outputDir })
  const assetManifest = await renderCarouselRasterAssets({ manifest: svgManifest, outputDir })
  const pilot = createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest, now })
  fs.writeFileSync(path.join(outputDir, 'bounded-pilot.json'), `${JSON.stringify(pilot, null, 2)}\n`)
  return pilot
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const pilot = await buildBoundedPilot()
  console.log(`[distribution] bounded pilot: ${pilot.status} -> ${pilot.selectedOpportunity.id} (${pilot.selectedOpportunity.platform})`)
}
