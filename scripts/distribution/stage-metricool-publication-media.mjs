#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

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

export function stageMetricoolPublicationMedia({
  pilot,
  packageData,
  sourceDir,
  publicRoot,
  publicOrigin = 'https://thehippiescientist.net',
  now = new Date().toISOString(),
} = {}) {
  if (pilot?.schemaVersion !== 'bounded-distribution-pilot-v1' || pilot?.status !== 'dry-run-scheduled') {
    throw new Error('Metricool media staging requires the bounded dry-run pilot')
  }
  if (pilot?.lifecycle?.state !== 'scheduled' || pilot?.lifecycle?.dryRun !== true) {
    throw new Error('Metricool media staging requires a dry-run scheduled lifecycle')
  }
  if (pilot?.assets?.exporter !== 'carousel-raster-v1' || !Array.isArray(pilot?.assets?.assets)) {
    throw new Error('Metricool media staging requires a governed carousel raster manifest')
  }
  if (packageData?.mediaPack?.status !== 'validated' || packageData?.mediaPack?.packId !== pilot.assets.packId) {
    throw new Error('Metricool media staging requires the validated package matching the rendered assets')
  }

  const objectId = assertSafeSegment(pilot.selectedOpportunity?.id, 'research object id')
  const identityFingerprint = clean(pilot.lifecycle?.identity?.fingerprint)
  if (!/^[a-f0-9]{64}$/i.test(identityFingerprint)) throw new Error('Metricool media staging requires a lifecycle identity fingerprint')
  const bundleId = identityFingerprint.slice(0, 20)
  const sourceDirectory = path.resolve(sourceDir)
  const root = path.resolve(publicRoot)
  const bundleDir = path.join(root, objectId, bundleId)
  if (!bundleDir.startsWith(`${root}${path.sep}`)) throw new Error('Metricool publication bundle escaped public root')

  const pngAssets = pilot.assets.assets
    .filter((asset) => asset?.format === 'png' && asset?.type === 'carousel-slide-raster')
    .sort((a, b) => clean(a.file).localeCompare(clean(b.file)))
  if (!pngAssets.length) throw new Error('Metricool media staging requires at least one PNG carousel asset')

  fs.rmSync(root, { recursive: true, force: true })
  fs.mkdirSync(bundleDir, { recursive: true })

  const media = []
  for (const asset of pngAssets) {
    const file = assertSafeSegment(asset.file, 'carousel asset filename')
    if (!/^carousel-\d{2,}\.png$/i.test(file)) throw new Error(`unexpected Metricool carousel filename: ${file}`)
    const sourceFile = path.resolve(sourceDirectory, file)
    if (path.dirname(sourceFile) !== sourceDirectory) throw new Error(`Metricool source asset escaped pilot directory: ${file}`)
    const bytes = fs.readFileSync(sourceFile)
    const actualHash = sha256(bytes)
    if (actualHash !== clean(asset.sha256)) throw new Error(`Metricool source asset hash mismatch: ${file}`)
    const targetFile = path.join(bundleDir, file)
    fs.writeFileSync(targetFile, bytes)
    media.push({
      file,
      sha256: actualHash,
      width: asset.width,
      height: asset.height,
      url: `${publicOrigin}/media/distribution/metricool/${objectId}/${bundleId}/${file}`,
    })
  }

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
    format: 'carousel',
    allowedNetworks: ['facebook', 'tiktok'],
    title: clean(packageData.sharedFacts?.title),
    text,
    media,
  }
  fs.writeFileSync(path.join(bundleDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  fs.writeFileSync(path.join(root, 'latest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

export function stageMetricoolPublicationMediaFromArtifacts({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  publicRoot = path.resolve(process.env.METRICOOL_PUBLIC_MEDIA_ROOT || 'public/media/distribution/metricool'),
  publicOrigin = process.env.PUBLIC_ORIGIN || 'https://thehippiescientist.net',
  now = new Date().toISOString(),
} = {}) {
  const selection = readJson(path.join(distributionDir, 'opportunity-selection.json'))
  const objectId = clean(selection?.selected?.id)
  if (!objectId) throw new Error('Metricool media staging requires a selected opportunity')
  const packageData = readJson(path.join(distributionDir, `${objectId}.json`))
  const sourceDir = path.join(distributionDir, 'pilots', objectId)
  const pilot = readJson(path.join(sourceDir, 'bounded-pilot.json'))
  return stageMetricoolPublicationMedia({ pilot, packageData, sourceDir, publicRoot, publicOrigin, now })
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const manifest = stageMetricoolPublicationMediaFromArtifacts()
  console.log(`[distribution] Metricool publication media staged: ${manifest.researchObjectId} -> ${manifest.media.length} PNG asset(s)`)
}
