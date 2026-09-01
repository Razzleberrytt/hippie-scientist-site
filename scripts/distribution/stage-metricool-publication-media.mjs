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

function buildAttributedProviderText(packageData, lifecycle) {
  const text = clean(packageData?.instagram)
  if (!text) throw new Error('Metricool publication bundle requires governed caption text')
  const sourceUrl = clean(lifecycle?.identity?.sourceUrl)
  const taggedDestination = clean(lifecycle?.identity?.taggedDestination)
  if (!sourceUrl || !taggedDestination) throw new Error('Metricool publication bundle requires canonical and tagged destinations')

  let source
  let tagged
  try {
    source = new URL(sourceUrl)
    tagged = new URL(taggedDestination)
  } catch {
    throw new Error('Metricool publication bundle requires valid destination URLs')
  }
  if (source.protocol !== 'https:' || tagged.protocol !== 'https:') throw new Error('Metricool destinations must use HTTPS')
  if (source.origin !== tagged.origin || source.pathname !== tagged.pathname) {
    throw new Error('Metricool tagged destination must preserve the canonical source origin and path')
  }
  if (!tagged.searchParams.get('utm_campaign')) throw new Error('Metricool tagged destination must preserve campaign attribution')
  if (!text.includes(sourceUrl)) throw new Error('governed Metricool caption must contain the canonical source URL before attribution tagging')
  return text.split(sourceUrl).join(taggedDestination)
}

function assertPilotAndPackage(pilot, packageData) {
  if (pilot?.schemaVersion !== 'bounded-distribution-pilot-v1' || pilot?.status !== 'dry-run-scheduled') {
    throw new Error('Metricool media staging requires the bounded dry-run pilot')
  }
  if (pilot?.lifecycle?.state !== 'scheduled' || pilot?.lifecycle?.dryRun !== true) {
    throw new Error('Metricool media staging requires a dry-run scheduled lifecycle')
  }
  if (packageData?.mediaPack?.status !== 'validated' || packageData?.mediaPack?.packId !== pilot?.assets?.packId) {
    throw new Error('Metricool media staging requires the validated package matching the rendered assets')
  }
}

function stageCarousel({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId }) {
  if (pilot?.assets?.exporter !== 'carousel-raster-v1' || !Array.isArray(pilot?.assets?.assets)) {
    throw new Error('Metricool carousel staging requires a governed carousel raster manifest')
  }
  const webpAssets = pilot.assets.assets
    .filter((asset) => asset?.format === 'webp' && asset?.type === 'carousel-slide-raster')
    .sort((a, b) => clean(a.file).localeCompare(clean(b.file)))
  if (!webpAssets.length) throw new Error('Metricool media staging requires at least one WebP carousel asset')

  const media = []
  for (const asset of webpAssets) {
    const file = assertSafeSegment(asset.file, 'carousel asset filename')
    if (!/^carousel-\d{2,}\.webp$/i.test(file)) throw new Error(`unexpected Metricool carousel filename: ${file}`)
    const sourceFile = path.resolve(sourceDirectory, file)
    if (path.dirname(sourceFile) !== sourceDirectory) throw new Error(`Metricool source asset escaped pilot directory: ${file}`)
    const bytes = fs.readFileSync(sourceFile)
    const actualHash = sha256(bytes)
    if (actualHash !== clean(asset.sha256)) throw new Error(`Metricool source asset hash mismatch: ${file}`)
    fs.writeFileSync(path.join(bundleDir, file), bytes)
    media.push({
      file,
      sha256: actualHash,
      width: asset.width,
      height: asset.height,
      contentType: 'image/webp',
      bytes: bytes.length,
      url: `${publicOrigin}/media/distribution/metricool/${objectId}/${bundleId}/${file}`,
    })
  }
  return { format: 'carousel', mediaType: 'image', allowedNetworks: ['facebook', 'tiktok'], media }
}

function stageVerticalVideo({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId }) {
  if (pilot?.assets?.renderer !== 'vertical-video-package-v1' || Number(pilot?.assets?.durationSeconds) !== 30) {
    throw new Error('Metricool video staging requires the governed 30-second vertical-video package')
  }
  const manifestFile = path.join(sourceDirectory, 'video-asset-manifest.json')
  const mp4File = path.join(sourceDirectory, 'short-video.mp4')
  const receiptFile = `${mp4File}.receipt.json`
  if (!fs.existsSync(manifestFile) || !fs.existsSync(mp4File) || !fs.existsSync(receiptFile)) {
    throw new Error('Metricool video staging requires the rendered MP4 and its provenance receipt')
  }

  const manifestBytes = fs.readFileSync(manifestFile)
  const mp4Bytes = fs.readFileSync(mp4File)
  const receipt = readJson(receiptFile)
  if (receipt?.schemaVersion !== '1.0.0' || receipt?.renderer !== 'vertical-video-mp4-v1') {
    throw new Error('Metricool video staging requires a governed vertical-video-mp4-v1 receipt')
  }
  if (clean(receipt.parentRenderer) !== clean(pilot.assets.renderer) || clean(receipt.packId) !== clean(pilot.assets.packId)) {
    throw new Error('Metricool MP4 receipt does not match the governed parent package')
  }
  if (clean(receipt.sourceUrl) !== clean(pilot.assets.sourceUrl) || clean(receipt.sourceContentHash) !== clean(pilot.assets.sourceContentHash)) {
    throw new Error('Metricool MP4 receipt source provenance is stale')
  }
  if (clean(receipt.parentManifestSha256) !== sha256(manifestBytes)) {
    throw new Error('Metricool MP4 receipt parent manifest hash mismatch')
  }
  const actualHash = sha256(mp4Bytes)
  if (clean(receipt.output?.file) !== 'short-video.mp4' || clean(receipt.output?.sha256) !== actualHash || Number(receipt.output?.bytes) !== mp4Bytes.length) {
    throw new Error('Metricool MP4 output hash/size does not match its receipt')
  }
  if (Number(receipt.profile?.width) !== 1080 || Number(receipt.profile?.height) !== 1920 || Number(receipt.profile?.durationSeconds) !== 30) {
    throw new Error('Metricool MP4 receipt does not match the governed vertical-video profile')
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
      durationSeconds: 30,
      contentType: 'video/mp4',
      bytes: mp4Bytes.length,
      renderKey: clean(receipt.renderKey),
      parentManifestSha256: clean(receipt.parentManifestSha256),
      url: `${publicOrigin}/media/distribution/metricool/${objectId}/${bundleId}/short-video.mp4`,
    }],
  }
}

export function stageMetricoolPublicationMedia({
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
  if (!/^[a-f0-9]{64}$/i.test(identityFingerprint)) throw new Error('Metricool media staging requires a lifecycle identity fingerprint')
  const bundleId = identityFingerprint.slice(0, 20)
  const sourceDirectory = path.resolve(sourceDir)
  const root = path.resolve(publicRoot)
  const bundleDir = path.join(root, objectId, bundleId)
  if (!bundleDir.startsWith(`${root}${path.sep}`)) throw new Error('Metricool publication bundle escaped public root')

  fs.rmSync(root, { recursive: true, force: true })
  fs.mkdirSync(bundleDir, { recursive: true })

  const pilotFormat = clean(pilot.lifecycle?.identity?.format || pilot.selectedOpportunity?.platform).toLowerCase()
  const staged = pilotFormat === 'carousel'
    ? stageCarousel({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId })
    : pilotFormat === 'short-video'
      ? stageVerticalVideo({ pilot, sourceDirectory, bundleDir, publicOrigin, objectId, bundleId })
      : (() => { throw new Error(`Metricool media staging does not support pilot format: ${pilotFormat || '<missing>'}`) })()

  const text = buildAttributedProviderText(packageData, pilot.lifecycle)
  const manifest = {
    schemaVersion: 'metricool-publication-media-v1',
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
  }
  fs.writeFileSync(path.join(bundleDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'latest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

export async function stageMetricoolPublicationMediaFromArtifacts({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  publicRoot = path.resolve(process.env.METRICOOL_PUBLIC_MEDIA_ROOT || 'public/media/distribution/metricool'),
  publicOrigin = process.env.PUBLIC_ORIGIN || 'https://thehippiescientist.net',
  ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg',
  now = new Date().toISOString(),
} = {}) {
  const selection = readJson(path.join(distributionDir, 'opportunity-selection.json'))
  const objectId = clean(selection?.selected?.id)
  if (!objectId) throw new Error('Metricool media staging requires a selected opportunity')
  const packageData = readJson(path.join(distributionDir, `${objectId}.json`))
  const sourceDir = path.join(distributionDir, 'pilots', objectId)
  const pilot = readJson(path.join(sourceDir, 'bounded-pilot.json'))
  const pilotFormat = clean(pilot.lifecycle?.identity?.format || pilot.selectedOpportunity?.platform).toLowerCase()
  if (pilotFormat === 'short-video') {
    await renderVerticalVideoMp4({
      packageDir: sourceDir,
      outputFile: path.join(sourceDir, 'short-video.mp4'),
      ffmpegPath,
    })
  }
  return stageMetricoolPublicationMedia({ pilot, packageData, sourceDir, publicRoot, publicOrigin, now })
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const manifest = await stageMetricoolPublicationMediaFromArtifacts()
  console.log(`[distribution] Metricool publication media staged: ${manifest.researchObjectId} -> ${manifest.format} (${manifest.media.length} asset(s))`)
}
