#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { renderVerticalVideoMp4 } from './render-vertical-video-mp4.mjs'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const clean = (value) => String(value ?? '').trim()

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function assertSafeSegment(value, label) {
  const segment = clean(value)
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(segment) || segment === '.' || segment === '..') {
    throw new Error(`invalid ${label}: ${segment || '<missing>'}`)
  }
  return segment
}

function buildAttributedPublicationText(packageData, lifecycle) {
  const text = clean(packageData?.instagram)
  if (!text) throw new Error('THS Publisher publication bundle requires governed caption text')
  const sourceUrl = clean(lifecycle?.identity?.sourceUrl)
  const taggedDestination = clean(lifecycle?.identity?.taggedDestination)
  if (!sourceUrl || !taggedDestination) throw new Error('THS Publisher publication bundle requires canonical and tagged destinations')

  let source
  let tagged
  try {
    source = new URL(sourceUrl)
    tagged = new URL(taggedDestination)
  } catch {
    throw new Error('THS Publisher publication bundle requires valid destination URLs')
  }
  if (source.protocol !== 'https:' || tagged.protocol !== 'https:') throw new Error('THS Publisher destinations must use HTTPS')
  if (source.origin !== tagged.origin || source.pathname !== tagged.pathname) {
    throw new Error('THS Publisher tagged destination must preserve the canonical source origin and path')
  }
  if (!tagged.searchParams.get('utm_campaign')) throw new Error('THS Publisher tagged destination must preserve campaign attribution')
  if (!text.includes(sourceUrl)) throw new Error('governed publication caption must contain the canonical source URL before attribution tagging')
  return text.split(sourceUrl).join(taggedDestination)
}

function assertPilotAndPackage(pilot, packageData) {
  if (pilot?.schemaVersion !== 'bounded-distribution-pilot-v1' || pilot?.status !== 'dry-run-scheduled') {
    throw new Error('THS Publisher media staging requires the bounded dry-run pilot')
  }
  if (pilot?.lifecycle?.state !== 'scheduled' || pilot?.lifecycle?.dryRun !== true) {
    throw new Error('THS Publisher media staging requires a dry-run scheduled lifecycle')
  }
  if (packageData?.mediaPack?.status !== 'validated' || packageData?.mediaPack?.packId !== pilot?.assets?.packId) {
    throw new Error('THS Publisher media staging requires the validated package matching the rendered assets')
  }
}

function stageCarousel({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId }) {
  if (pilot?.assets?.exporter !== 'carousel-raster-v1' || !Array.isArray(pilot?.assets?.assets)) {
    throw new Error('THS Publisher carousel staging requires a governed carousel raster manifest')
  }
  const webpAssets = pilot.assets.assets
    .filter((asset) => asset?.format === 'webp' && asset?.type === 'carousel-slide-raster')
    .sort((a, b) => clean(a.file).localeCompare(clean(b.file)))
  if (!webpAssets.length) throw new Error('THS Publisher media staging requires at least one WebP carousel asset')

  const media = []
  for (const asset of webpAssets) {
    const file = assertSafeSegment(asset.file, 'carousel asset filename')
    if (!/^carousel-\d{2,}\.webp$/i.test(file)) throw new Error(`unexpected governed carousel filename: ${file}`)
    const sourceFile = path.resolve(sourceDirectory, file)
    if (path.dirname(sourceFile) !== sourceDirectory) throw new Error(`THS Publisher source asset escaped pilot directory: ${file}`)
    const bytes = fs.readFileSync(sourceFile)
    const actualHash = sha256(bytes)
    if (actualHash !== clean(asset.sha256)) throw new Error(`THS Publisher source asset hash mismatch: ${file}`)
    fs.writeFileSync(path.join(bundleDir, file), bytes)
    media.push({
      file,
      sha256: actualHash,
      width: asset.width,
      height: asset.height,
      contentType: 'image/webp',
      bytes: bytes.length,
      url: `${publicOrigin}/media/distribution/publisher/${objectId}/${bundleId}/${file}`,
    })
  }
  return { format: 'carousel', mediaType: 'image', allowedNetworks: ['facebook', 'tiktok'], media }
}

function stageVerticalVideo({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId }) {
  const packageRelease = clean(pilot?.assets?.release || pilot?.assets?.systemRelease) || 'R8.04'
  const packageDuration = Number(pilot?.assets?.durationSeconds)
  if (pilot?.assets?.renderer !== 'vertical-video-package-v1') {
    throw new Error('THS Publisher video staging requires the governed vertical-video package')
  }
  if (packageRelease === 'R8.04' && packageDuration !== 30) {
    throw new Error('R8.04 Publisher staging requires the governed 30-second vertical-video package')
  }
  if (packageRelease === 'R8.05' && (!Number.isFinite(packageDuration) || packageDuration < 5 || packageDuration > 60)) {
    throw new Error('R8.05 Publisher staging requires the exact voice-authored natural runtime')
  }
  if (!['R8.04', 'R8.05'].includes(packageRelease)) throw new Error(`unsupported THS video release: ${packageRelease}`)
  const manifestFile = path.join(sourceDirectory, 'video-asset-manifest.json')
  const mp4File = path.join(sourceDirectory, 'short-video.mp4')
  const receiptFile = `${mp4File}.receipt.json`
  if (!fs.existsSync(manifestFile) || !fs.existsSync(mp4File) || !fs.existsSync(receiptFile)) {
    throw new Error('THS Publisher video staging requires the rendered MP4 and its provenance receipt')
  }

  const manifestBytes = fs.readFileSync(manifestFile)
  const mp4Bytes = fs.readFileSync(mp4File)
  const receipt = readJson(receiptFile)
  const expectedRenderer = packageRelease === 'R8.05' ? 'vertical-video-mp4-v3-r805' : 'vertical-video-mp4-v2-r804'
  const expectedSchema = packageRelease === 'R8.05' ? '3.0.0' : '2.0.0'
  if (receipt?.schemaVersion !== expectedSchema || receipt?.renderer !== expectedRenderer || receipt?.release !== packageRelease) {
    throw new Error(`THS Publisher video staging requires the governed ${packageRelease} ${expectedRenderer} receipt`)
  }
  if (clean(receipt.parentRenderer) !== clean(pilot.assets.renderer) || clean(receipt.packId) !== clean(pilot.assets.packId)) {
    throw new Error('THS Publisher MP4 receipt does not match the governed parent package')
  }
  if (clean(receipt.sourceUrl) !== clean(pilot.assets.sourceUrl) || clean(receipt.sourceContentHash) !== clean(pilot.assets.sourceContentHash)) {
    throw new Error('THS Publisher MP4 receipt source provenance is stale')
  }
  if (clean(receipt.parentManifestSha256) !== sha256(manifestBytes)) {
    throw new Error('THS Publisher MP4 receipt parent manifest hash mismatch')
  }
  const actualHash = sha256(mp4Bytes)
  if (clean(receipt.output?.file) !== 'short-video.mp4' || clean(receipt.output?.sha256) !== actualHash || Number(receipt.output?.bytes) !== mp4Bytes.length) {
    throw new Error('THS Publisher MP4 output hash/size does not match its receipt')
  }
  if (Number(receipt.profile?.width) !== 1080 || Number(receipt.profile?.height) !== 1920 || Math.abs(Number(receipt.profile?.durationSeconds) - packageDuration) > 0.001) {
    throw new Error('THS Publisher MP4 receipt does not match the governed vertical-video profile/runtime')
  }
  if (receipt.profile?.audio !== true || clean(receipt.profile?.audioCodec) !== 'aac') {
    throw new Error('R8.04 publication staging rejects silent vertical video')
  }
  if (clean(receipt.localNarration?.engineKind) !== 'local-open-source' || receipt.localNarration?.meteredCreditsRequired !== false) {
    throw new Error('R8.04 publication staging requires zero-credit local narration provenance')
  }
  if (clean(receipt.localNarration?.naturalPresence) !== 'pass' || clean(receipt.localNarration?.pronunciation) !== 'pass') {
    throw new Error(`${packageRelease} publication staging requires passed Natural Presence and pronunciation receipts`)
  }

  let masterQa = null
  if (packageRelease === 'R8.05') {
    const masterQaFile = path.join(sourceDirectory, 'r805-master-qa.receipt.json')
    if (!fs.existsSync(masterQaFile)) {
      throw new Error('R8.05 publication staging requires exact-master cohesion approval; technical sync alone is insufficient')
    }
    const masterQaBytes = fs.readFileSync(masterQaFile)
    masterQa = JSON.parse(masterQaBytes.toString('utf8'))
    if (clean(masterQa.schemaVersion) !== 'ths-r805-master-qa-receipt-v1'
        || clean(masterQa.release) !== 'R8.05'
        || masterQa.exactArtifactReviewed !== true
        || clean(masterQa.artifact?.sha256) !== actualHash
        || Number(masterQa.artifact?.bytes) !== mp4Bytes.length
        || clean(masterQa.mp4ReceiptSha256) !== sha256(fs.readFileSync(receiptFile))
        || clean(masterQa.parentManifestSha256) !== sha256(manifestBytes)) {
      throw new Error('R8.05 master QA receipt does not bind the exact MP4/render/manifest')
    }
    for (const field of ['wholePieceCohesion', 'narrationVisualSync', 'internalMotionSync', 'cognitiveContinuity', 'hookPromiseDelivery']) {
      if (clean(masterQa.qa?.[field]) !== 'pass') throw new Error(`R8.05 master QA requires ${field}=pass`)
    }
    const creativeMethodRelease = clean(pilot.assets?.creativeMethodRelease)
    if (['R8.06', 'R8.07'].includes(creativeMethodRelease)) {
      if (clean(masterQa.creativeMethodRelease) !== creativeMethodRelease) {
        throw new Error(`${creativeMethodRelease} staging requires a matching exact-master QA receipt`)
      }
      for (const field of ['openingScrollStop', 'nativePlatformFeel', 'visualTeachingObject', 'textCardMonotonyRejected']) {
        if (clean(masterQa.qa?.[field]) !== 'pass') throw new Error(`${creativeMethodRelease} master QA requires ${field}=pass`)
      }
    }
    if (creativeMethodRelease === 'R8.07') {
      for (const field of ['visualRhythm', 'motifContinuity', 'semanticPatternInterrupt', 'repetitionDebtRejected']) {
        if (clean(masterQa.qa?.[field]) !== 'pass') throw new Error(`R8.07 master QA requires ${field}=pass`)
      }
      if (clean(pilot.assets?.creativeFoundation?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
          || clean(pilot.assets?.creativeDirection?.schemaVersion) !== 'ths-r807-creative-receipt-v1'
          || clean(pilot.assets?.creativeDirection?.inheritedR806OverlaySha256) !== clean(pilot.assets?.creativeFoundation?.overlaySha256)) {
        throw new Error('R8.07 staging requires bound R8.06 foundation and R8.07 visual-rhythm receipts')
      }
    }
    if (creativeMethodRelease === 'R8.06'
        && clean(masterQa.creativeBindings?.r806OverlaySha256) !== clean(pilot.assets?.creativeDirection?.overlaySha256)) {
      throw new Error('R8.06 master QA creative-direction binding is stale')
    }
    if (creativeMethodRelease === 'R8.07'
        && (clean(masterQa.creativeBindings?.r806OverlaySha256) !== clean(pilot.assets?.creativeFoundation?.overlaySha256)
            || clean(masterQa.creativeBindings?.r807OverlaySha256) !== clean(pilot.assets?.creativeDirection?.overlaySha256))) {
      throw new Error('R8.07 master QA visual-rhythm binding is stale')
    }
    if (clean(masterQa.creativeBindings?.semanticBeatMapSha256) !== clean(pilot.assets?.creativeQuality?.semanticBeatMapSha256)
        || clean(masterQa.creativeBindings?.creativeBriefSha256) !== clean(pilot.assets?.r805Bindings?.creativeBrief?.sha256)
        || clean(masterQa.creativeBindings?.semanticBeatTimelineSha256) !== clean(pilot.assets?.r805Bindings?.semanticBeatTimeline?.sha256)) {
      throw new Error('R8.05 master QA semantic bindings are stale')
    }
  }

  fs.writeFileSync(path.join(bundleDir, 'short-video.mp4'), mp4Bytes)
  return {
    format: 'vertical-video',
    mediaType: 'video',
    allowedNetworks: ['facebook', 'tiktok', 'youtube'],
    media: [{
      file: 'short-video.mp4',
      sha256: actualHash,
      width: 1080,
      height: 1920,
      durationSeconds: packageDuration,
      contentType: 'video/mp4',
      bytes: mp4Bytes.length,
      renderKey: clean(receipt.renderKey),
      parentManifestSha256: clean(receipt.parentManifestSha256),
      masterQa: masterQa ? {
        receiptSha256: sha256(Buffer.from(`${JSON.stringify(masterQa, null, 2)}\n`)),
        wholePieceCohesion: clean(masterQa.qa?.wholePieceCohesion),
        narrationVisualSync: clean(masterQa.qa?.narrationVisualSync),
        internalMotionSync: clean(masterQa.qa?.internalMotionSync),
      } : null,
      audio: {
        codec: clean(receipt.profile?.audioCodec),
        localEngine: clean(receipt.localNarration?.engine),
        localModel: clean(receipt.localNarration?.model),
        voice: clean(receipt.localNarration?.voice),
        naturalPresence: clean(receipt.localNarration?.naturalPresence),
        pronunciation: clean(receipt.localNarration?.pronunciation),
        meteredCreditsRequired: false,
      },
      url: `${publicOrigin}/media/distribution/publisher/${objectId}/${bundleId}/short-video.mp4`,
    }],
  }
}

export function stagePublicationMedia({
  pilot,
  packageData,
  sourceDir,
  publicRoot,
  publicOrigin = 'https://thehippiescientist.net',
  now = new Date().toISOString(),
} = {}) {
  assertPilotAndPackage(pilot, packageData)

  const objectId = assertSafeSegment(pilot.selectedOpportunity?.id, 'research object id')
  const identityFingerprint = clean(pilot.lifecycle?.identity?.fingerprint)
  if (!/^[a-f0-9]{64}$/i.test(identityFingerprint)) throw new Error('THS Publisher media staging requires a lifecycle identity fingerprint')
  const bundleId = identityFingerprint.slice(0, 20)
  const sourceDirectory = path.resolve(sourceDir)
  const root = path.resolve(publicRoot)
  const bundleDir = path.join(root, objectId, bundleId)
  if (!bundleDir.startsWith(`${root}${path.sep}`)) throw new Error('THS Publisher publication bundle escaped public root')

  fs.rmSync(root, { recursive: true, force: true })
  fs.mkdirSync(bundleDir, { recursive: true })

  const pilotFormat = clean(pilot.lifecycle?.identity?.format || pilot.selectedOpportunity?.platform).toLowerCase()
  const staged = pilotFormat === 'carousel'
    ? stageCarousel({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId })
    : pilotFormat === 'short-video'
      ? stageVerticalVideo({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId })
      : (() => { throw new Error(`THS Publisher media staging does not support pilot format: ${pilotFormat || '<missing>'}`) })()

  const text = buildAttributedPublicationText(packageData, pilot.lifecycle)
  const manifest = {
    schemaVersion: 'ths-publication-media-v1',
    status: 'ready-for-provider',
    generatedAt: now,
    researchObjectId: objectId,
    lifecycleId: pilot.lifecycle.lifecycleId,
    identityFingerprint,
    idempotencyKey: pilot.lifecycle.identity.idempotencyKey,
    packId: pilot.assets.packId,
    sourceUrl: pilot.assets.sourceUrl,
    taggedDestination: pilot.lifecycle.identity.taggedDestination,
    sourceContentHash: pilot.assets.sourceContentHash,
    format: staged.format,
    mediaType: staged.mediaType,
    allowedNetworks: staged.allowedNetworks,
    title: clean(packageData.sharedFacts?.title),
    text,
    media: staged.media,
    transportPolicy: ['R8.06', 'R8.07'].includes(clean(packageData?.creativeSpec?.creativeMethodRelease))
      ? {
          preferredConvenienceAdapter: 'metricool-if-available',
          fallback: 'manual-native-upload',
          providerMayMutateArtifact: false,
          retryPolicy: 'one-provider-attempt-then-fallback',
        }
      : null,
  }
  fs.writeFileSync(path.join(bundleDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'latest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

export async function stagePublicationMediaFromArtifacts({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  publicRoot = path.resolve(process.env.THS_PUBLISHER_PUBLIC_MEDIA_ROOT || 'public/media/distribution/publisher'),
  publicOrigin = process.env.PUBLIC_ORIGIN || 'https://thehippiescientist.net',
  ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg',
  now = new Date().toISOString(),
} = {}) {
  const selection = readJson(path.join(distributionDir, 'opportunity-selection.json'))
  const objectId = clean(selection?.selected?.id)
  if (!objectId) throw new Error('THS Publisher media staging requires a selected opportunity')
  const packageData = readJson(path.join(distributionDir, `${objectId}.json`))
  const sourceDir = path.join(distributionDir, 'pilots', objectId)
  const pilot = readJson(path.join(sourceDir, 'bounded-pilot.json'))
  const pilotFormat = clean(pilot.lifecycle?.identity?.format || pilot.selectedOpportunity?.platform).toLowerCase()
  if (pilotFormat === 'short-video') {
    const release = clean(pilot?.assets?.release || pilot?.assets?.systemRelease) || 'R8.04'
    if (release === 'R8.04') {
      await renderVerticalVideoMp4({
        packageDir: sourceDir,
        outputFile: path.join(sourceDir, 'short-video.mp4'),
        ffmpegPath,
      })
    } else if (release === 'R8.05') {
      for (const file of ['short-video.mp4', 'short-video.mp4.receipt.json', 'r805-master-qa.receipt.json']) {
        if (!fs.existsSync(path.join(sourceDir, file))) {
          throw new Error(`R8.05 staging requires the exact already-rendered/reviewed master; missing ${file}`)
        }
      }
    } else {
      throw new Error(`unsupported video release: ${release}`)
    }
  }
  return stagePublicationMedia({ pilot, packageData, sourceDir, publicRoot, publicOrigin, now })
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const manifest = await stagePublicationMediaFromArtifacts()
  console.log(`[distribution] THS Publisher publication media staged: ${manifest.researchObjectId} -> ${manifest.format} (${manifest.media.length} asset(s))`)
}
