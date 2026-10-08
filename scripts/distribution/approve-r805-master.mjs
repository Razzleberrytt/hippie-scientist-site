#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const clean = (value) => String(value ?? '').trim()

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) args[key] = true
    else {
      args[key] = next
      i += 1
    }
  }
  return args
}

function requiredFile(dir, name) {
  const file = path.join(dir, name)
  if (!fs.existsSync(file)) throw new Error(`R8.05 master QA requires ${name}`)
  return file
}

export function approveR805Master({
  packageDir,
  reviewer,
  wholePieceCohesion,
  narrationVisualSync,
  internalMotionSync,
  cognitiveContinuity,
  hookPromiseDelivery,
  openingScrollStop,
  nativePlatformFeel,
  visualTeachingObject,
  textCardMonotonyRejected,
  notes = '',
  now = new Date().toISOString(),
} = {}) {
  const dir = path.resolve(packageDir || '')
  const mp4File = requiredFile(dir, 'short-video.mp4')
  const mp4ReceiptFile = requiredFile(dir, 'short-video.mp4.receipt.json')
  const manifestFile = requiredFile(dir, 'video-asset-manifest.json')

  const mp4Bytes = fs.readFileSync(mp4File)
  const mp4ReceiptBytes = fs.readFileSync(mp4ReceiptFile)
  const manifestBytes = fs.readFileSync(manifestFile)
  const mp4Receipt = JSON.parse(mp4ReceiptBytes.toString('utf8'))
  const manifest = JSON.parse(manifestBytes.toString('utf8'))
  const mp4Sha = sha256(mp4Bytes)

  if (clean(mp4Receipt.release) !== 'R8.05' || clean(mp4Receipt.renderer) !== 'vertical-video-mp4-v3-r805') {
    throw new Error('R8.05 master QA accepts only the governed R8.05 MP4 renderer')
  }
  if (clean(manifest.release || manifest.systemRelease) !== 'R8.05') {
    throw new Error('R8.05 master QA requires an R8.05 parent package')
  }
  if (clean(mp4Receipt.output?.sha256) !== mp4Sha || Number(mp4Receipt.output?.bytes) !== mp4Bytes.length) {
    throw new Error('R8.05 master QA MP4 does not match its render receipt')
  }
  if (clean(mp4Receipt.parentManifestSha256) !== sha256(manifestBytes)) {
    throw new Error('R8.05 master QA MP4 receipt does not bind the exact parent manifest')
  }
  if (!clean(manifest.creativeQuality?.semanticBeatMapSha256)
      || clean(mp4Receipt.creativeQuality?.semanticBeatMapSha256) !== clean(manifest.creativeQuality.semanticBeatMapSha256)
      || clean(mp4Receipt.creativeQuality?.semanticBeatTimelineSha256) !== clean(manifest.r805Bindings?.semanticBeatTimeline?.sha256)
      || clean(mp4Receipt.creativeQuality?.creativeBriefSha256) !== clean(manifest.r805Bindings?.creativeBrief?.sha256)) {
    throw new Error('R8.05 master QA creative binding is stale')
  }

  const creativeMethodRelease = clean(manifest?.creativeMethodRelease) || 'R8.05'
  const requiredPasses = {
    wholePieceCohesion,
    narrationVisualSync,
    internalMotionSync,
    cognitiveContinuity,
    hookPromiseDelivery,
  }
  if (creativeMethodRelease === 'R8.06') {
    requiredPasses.openingScrollStop = openingScrollStop
    requiredPasses.nativePlatformFeel = nativePlatformFeel
    requiredPasses.visualTeachingObject = visualTeachingObject
    requiredPasses.textCardMonotonyRejected = textCardMonotonyRejected
    if (clean(manifest?.creativeDirection?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
        || clean(manifest?.creativeDirection?.status) !== 'approved') {
      throw new Error('R8.06 exact-master QA requires the approved R8.06 creative-direction receipt')
    }
  }
  for (const [name, value] of Object.entries(requiredPasses)) {
    if (value !== 'pass') throw new Error(`R8.05 exact master requires ${name}=pass; weak masters fail closed`)
  }
  if (!clean(reviewer)) throw new Error('R8.05 master QA reviewer is required')

  const receipt = {
    schemaVersion: 'ths-r805-master-qa-receipt-v1',
    release: 'R8.05',
    creativeMethodRelease,
    reviewedAt: now,
    reviewer: clean(reviewer),
    exactArtifactReviewed: true,
    artifact: {
      file: 'short-video.mp4',
      sha256: mp4Sha,
      bytes: mp4Bytes.length,
      durationSeconds: Number(mp4Receipt.profile?.durationSeconds),
    },
    mp4ReceiptSha256: sha256(mp4ReceiptBytes),
    parentManifestSha256: sha256(manifestBytes),
    creativeBindings: {
      semanticBeatMapSha256: clean(manifest.creativeQuality?.semanticBeatMapSha256),
      creativeBriefSha256: clean(manifest.r805Bindings?.creativeBrief?.sha256),
      semanticBeatTimelineSha256: clean(manifest.r805Bindings?.semanticBeatTimeline?.sha256),
    },
    qa: {
      wholePieceCohesion: 'pass',
      narrationVisualSync: 'pass',
      internalMotionSync: 'pass',
      cognitiveContinuity: 'pass',
      hookPromiseDelivery: 'pass',
      openingScrollStop: creativeMethodRelease === 'R8.06' ? 'pass' : null,
      nativePlatformFeel: creativeMethodRelease === 'R8.06' ? 'pass' : null,
      visualTeachingObject: creativeMethodRelease === 'R8.06' ? 'pass' : null,
      textCardMonotonyRejected: creativeMethodRelease === 'R8.06' ? 'pass' : null,
      pastedNarrationFeel: 'reject-if-present',
      notes: clean(notes),
    },
  }
  fs.writeFileSync(path.join(dir, 'r805-master-qa.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
  return receipt
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = parseArgs(process.argv.slice(2))
  const receipt = approveR805Master({
    packageDir: args['package-dir'],
    reviewer: args.reviewer,
    wholePieceCohesion: args['whole-piece-cohesion'],
    narrationVisualSync: args['narration-visual-sync'],
    internalMotionSync: args['internal-motion-sync'],
    cognitiveContinuity: args['cognitive-continuity'],
    hookPromiseDelivery: args['hook-promise-delivery'],
    openingScrollStop: args['opening-scroll-stop'],
    nativePlatformFeel: args['native-platform-feel'],
    visualTeachingObject: args['visual-teaching-object'],
    textCardMonotonyRejected: args['text-card-monotony-rejected'],
    notes: args.notes || '',
  })
  console.log(`[perceptual-qa] exact R8.05 master approved: ${receipt.artifact.sha256}`)
}
