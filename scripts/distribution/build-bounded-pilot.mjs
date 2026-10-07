#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { assertAssetManifestFresh, buildAssetProvenance, hashStableValue } from './asset-provenance.mjs'
import { createDistributionLifecycle, transitionDistributionLifecycle } from './distribution-lifecycle.mjs'
import { renderCarouselAssets } from './render-carousel-svg.mjs'
import { renderCarouselRasterAssets } from './render-carousel-raster.mjs'
import { renderVerticalVideoPackage } from './render-vertical-video-package.mjs'
import { buildLosslessCreativeSpec } from './creative-spec-lossless.mjs'

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

const SUPPORTED_PILOT_FORMATS = new Set(['carousel', 'short-video'])

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')

function joinedRoleCopy(brief, role, field) {
  return clean((brief?.beats || [])
    .filter((beat) => clean(beat?.role) === role)
    .map((beat) => clean(beat?.[field]))
    .filter(Boolean)
    .join(' '))
}

function exactRoleBeats(brief, role) {
  return (brief?.beats || []).filter((beat) => clean(beat?.role) === role)
}

function validateR805BriefCopyAgainstCanonical(brief, canonicalSpec) {
  const errors = []
  const video = canonicalSpec?.verticalVideo
  const canonicalHook = clean(video?.firstTwoSecondHook)
  const canonicalFinding = clean(video?.losslessCopy?.finding?.sourceText)
  const canonicalLimitation = clean(video?.losslessCopy?.limitation?.sourceText)
  const sourceUrl = clean(canonicalSpec?.sourceIdentity?.sourceUrl)
  const canonicalByRole = new Map(
    (video?.scenes || []).map((scene) => [clean(scene?.role), {
      narration: clean(scene?.voiceover),
      onScreenText: clean(scene?.onScreenText),
    }]),
  )

  for (const [role, expected] of [['finding', canonicalFinding], ['limitation', canonicalLimitation]]) {
    const beats = exactRoleBeats(brief, role)
    if (!beats.length) {
      errors.push(`R8.05 requires at least one ${role} beat so governed claim/qualifier copy cannot disappear`)
      continue
    }
    if (joinedRoleCopy(brief, role, 'narration') !== expected) {
      errors.push(`R8.05 ${role} narration must reconstruct the canonical governed ${role} exactly`)
    }
    if (joinedRoleCopy(brief, role, 'onScreenText') !== expected) {
      errors.push(`R8.05 ${role} on-screen copy must reconstruct the canonical governed ${role} exactly`)
    }
  }

  for (const beat of exactRoleBeats(brief, 'hook')) {
    if (!canonicalHook || clean(beat.narration) !== canonicalHook || clean(beat.onScreenText) !== canonicalHook) {
      errors.push('R8.05 hook copy must use the evidence-safe canonical hook; arbitrary factual reframing requires a new EvidenceBridge-authorized hook')
    }
  }

  for (const role of ['evidence', 'context', 'cta']) {
    const expected = canonicalByRole.get(role)
    for (const beat of exactRoleBeats(brief, role)) {
      if (!expected || clean(beat.narration) !== expected.narration || clean(beat.onScreenText) !== expected.onScreenText) {
        errors.push(`R8.05 ${role} beat must match the canonical governed ${role} copy exactly`)
      }
    }
  }

  const sourceBeats = exactRoleBeats(brief, 'source')
  if (sourceBeats.length !== 1 || clean(sourceBeats[0]?.onScreenText) !== sourceUrl || clean(sourceBeats[0]?.narration)) {
    errors.push('R8.05 source beat must be the exact canonical source URL with no invented narration')
  }

  for (const beat of brief?.beats || []) {
    const role = clean(beat?.role)
    if (clean(beat?.factualAuthority) === 'creative-framing' && role !== 'hook') {
      errors.push(`R8.05 creative-framing authority is allowed only on the evidence-safe hook, not ${role || '<missing>'}`)
    }
  }

  if (errors.length) {
    throw new Error(`R8.05 EvidenceBridge copy gate failed:\n- ${[...new Set(errors)].join('\n- ')}`)
  }
  return 'validated-lossless'
}

function withVerticalVideoProvenance({ manifest, mediaPack, creativeSpec }) {
  return {
    ...manifest,
    ...buildAssetProvenance({
      mediaPack,
      renderer: manifest.renderer,
      templateVersion: 'vertical-video-30s-v1',
      creativeSpecHash: hashStableValue(creativeSpec),
    }),
  }
}

export function createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest, now }) {
  const selected = selection?.selected
  if (selection?.status !== 'selected' || !selected) throw new Error('bounded pilot requires one selected governed opportunity')
  if (selected.id !== mediaPack?.researchObjectIds?.[0]) throw new Error('selected opportunity must match the validated media pack')
  if (selected.sourceUrl !== mediaPack?.source?.url) throw new Error('selected opportunity must retain the canonical source URL')
  if (!SUPPORTED_PILOT_FORMATS.has(selected.platform)) throw new Error('bounded pilot supports governed carousel or short-video formats only')
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
      externalBlocker: 'Live dispatch requires an authorized THS Publisher platform adapter and provider/account authorization; this governed pilot never posts by itself.',
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

  let assetManifest
  if (selection.selected.platform === 'carousel') {
    const svgManifest = renderCarouselAssets({ mediaPack, creativeSpec: packageData.creativeSpec, outputDir })
    assetManifest = await renderCarouselRasterAssets({ manifest: svgManifest, outputDir })
  } else if (selection.selected.platform === 'short-video') {
    const briefFile = path.join(outputDir, 'r805-creative-brief.json')
    const requiredVoiceFiles = [
      briefFile,
      path.join(outputDir, 'narration.wav'),
      path.join(outputDir, 'narration.wav.receipt.json'),
      path.join(outputDir, 'semantic-beat-timeline.json'),
      path.join(outputDir, 'voice-qa.receipt.json'),
    ]
    for (const file of requiredVoiceFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`R8.05 short-video pilot is not render-ready: missing ${path.basename(file)}. Create/approve the local voice-first work order before bounded-pilot rendering.`)
      }
    }
    const researchObjects = readJson(path.resolve(process.env.DISTRIBUTION_RESEARCH_OBJECTS || 'data/distribution/research-objects.json'))
    const sourceObject = researchObjects.find((object) => object?.id === selectedId)
    if (!sourceObject) throw new Error(`R8.05 short-video pilot cannot resolve canonical research object ${selectedId}`)
    const creativeBrief = readJson(briefFile)
    const candidateSpec = buildLosslessCreativeSpec({ ...sourceObject, systemRelease: 'R8.05', creativeBrief })
    const claimSafetyStatus = validateR805BriefCopyAgainstCanonical(creativeBrief, candidateSpec)
    const renderCreativeSpec = { ...candidateSpec, claimSafetyStatus }
    if (renderCreativeSpec.claimSafetyStatus !== 'validated-lossless') {
      throw new Error('R8.05 short-video pilot requires fresh lossless evidence-safety validation of the exact brief copy')
    }
    const videoManifest = renderVerticalVideoPackage({ mediaPack, creativeSpec: renderCreativeSpec, outputDir })
    assetManifest = withVerticalVideoProvenance({ manifest: videoManifest, mediaPack, creativeSpec: renderCreativeSpec })
    fs.writeFileSync(path.join(outputDir, 'video-asset-manifest.json'), `${JSON.stringify(assetManifest, null, 2)}\n`)
  } else {
    throw new Error('bounded pilot supports governed carousel or short-video formats only')
  }

  const pilot = createBoundedPilotPackage({ selection, packageData, mediaPack, assetManifest, now })
  fs.writeFileSync(path.join(outputDir, 'bounded-pilot.json'), `${JSON.stringify(pilot, null, 2)}\n`)
  return pilot
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const pilot = await buildBoundedPilot()
  console.log(`[distribution] bounded pilot: ${pilot.status} -> ${pilot.selectedOpportunity.id} (${pilot.selectedOpportunity.platform})`)
}
