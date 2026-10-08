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
  visualRhythm,
  motifContinuity,
  semanticPatternInterrupt,
  repetitionDebtRejected,
  audioOffComprehension,
  qualifierVisibility,
  mobileSafeArea,
  readableClaimDwell,
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
  if (['R8.06', 'R8.07', 'R8.08'].includes(creativeMethodRelease)) {
    requiredPasses.openingScrollStop = openingScrollStop
    requiredPasses.nativePlatformFeel = nativePlatformFeel
    requiredPasses.visualTeachingObject = visualTeachingObject
    requiredPasses.textCardMonotonyRejected = textCardMonotonyRejected
  }
  if (creativeMethodRelease === 'R8.06') {
    if (clean(manifest?.creativeDirection?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
        || clean(manifest?.creativeDirection?.status) !== 'approved') {
      throw new Error('R8.06 exact-master QA requires the approved R8.06 creative-direction receipt')
    }
  } else if (['R8.07', 'R8.08'].includes(creativeMethodRelease)) {
    requiredPasses.visualRhythm = visualRhythm
    requiredPasses.motifContinuity = motifContinuity
    requiredPasses.semanticPatternInterrupt = semanticPatternInterrupt
    requiredPasses.repetitionDebtRejected = repetitionDebtRejected
    if (creativeMethodRelease === 'R8.07') {
      if (clean(manifest?.creativeFoundation?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
          || clean(manifest?.creativeFoundation?.status) !== 'approved'
          || clean(manifest?.creativeDirection?.schemaVersion) !== 'ths-r807-creative-receipt-v1'
          || clean(manifest?.creativeDirection?.status) !== 'approved'
          || clean(manifest?.creativeDirection?.inheritedR806OverlaySha256) !== clean(manifest?.creativeFoundation?.overlaySha256)) {
        throw new Error('R8.07 exact-master QA requires hash-bound visual-rhythm receipts')
      }
    } else {
      requiredPasses.audioOffComprehension = audioOffComprehension
      requiredPasses.qualifierVisibility = qualifierVisibility
      requiredPasses.mobileSafeArea = mobileSafeArea
      requiredPasses.readableClaimDwell = readableClaimDwell
      if (clean(manifest?.creativeFoundation?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
          || clean(manifest?.creativeFoundation?.status) !== 'approved'
          || clean(manifest?.creativeVisualFoundation?.schemaVersion) !== 'ths-r807-creative-receipt-v1'
          || clean(manifest?.creativeVisualFoundation?.status) !== 'approved'
          || clean(manifest?.creativeVisualFoundation?.inheritedR806OverlaySha256) !== clean(manifest?.creativeFoundation?.overlaySha256)
          || clean(manifest?.creativeDirection?.schemaVersion) !== 'ths-r808-creative-receipt-v1'
          || clean(manifest?.creativeDirection?.status) !== 'approved'
          || clean(manifest?.creativeDirection?.inheritedR807OverlaySha256) !== clean(manifest?.creativeVisualFoundation?.overlaySha256)) {
        throw new Error('R8.08 exact-master QA requires hash-bound R8.06/R8.07/R8.08 creative receipts')
      }
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
      r806OverlaySha256: creativeMethodRelease === 'R8.06'
        ? clean(manifest.creativeDirection?.overlaySha256)
        : ['R8.07', 'R8.08'].includes(creativeMethodRelease)
          ? clean(manifest.creativeFoundation?.overlaySha256)
          : null,
      r807OverlaySha256: creativeMethodRelease === 'R8.07'
        ? clean(manifest.creativeDirection?.overlaySha256)
        : creativeMethodRelease === 'R8.08' ? clean(manifest.creativeVisualFoundation?.overlaySha256) : null,
      r808OverlaySha256: creativeMethodRelease === 'R8.08'
        ? clean(manifest.creativeDirection?.overlaySha256) : null,
    },
    qa: {
      wholePieceCohesion: 'pass',
      narrationVisualSync: 'pass',
      internalMotionSync: 'pass',
      cognitiveContinuity: 'pass',
      hookPromiseDelivery: 'pass',
      openingScrollStop: ['R8.06', 'R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      nativePlatformFeel: ['R8.06', 'R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      visualTeachingObject: ['R8.06', 'R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      textCardMonotonyRejected: ['R8.06', 'R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      visualRhythm: ['R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      motifContinuity: ['R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      semanticPatternInterrupt: ['R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      repetitionDebtRejected: ['R8.07', 'R8.08'].includes(creativeMethodRelease) ? 'pass' : null,
      audioOffComprehension: creativeMethodRelease === 'R8.08' ? 'pass' : null,
      qualifierVisibility: creativeMethodRelease === 'R8.08' ? 'pass' : null,
      mobileSafeArea: creativeMethodRelease === 'R8.08' ? 'pass' : null,
      readableClaimDwell: creativeMethodRelease === 'R8.08' ? 'pass' : null,
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
    visualRhythm: args['visual-rhythm'],
    motifContinuity: args['motif-continuity'],
    semanticPatternInterrupt: args['semantic-pattern-interrupt'],
    repetitionDebtRejected: args['repetition-debt-rejected'],
    audioOffComprehension: args['audio-off-comprehension'],
    qualifierVisibility: args['qualifier-visibility'],
    mobileSafeArea: args['mobile-safe-area'],
    readableClaimDwell: args['readable-claim-dwell'],
    notes: args.notes || '',
  })
  console.log(`[perceptual-qa] exact R8.05 master approved: ${receipt.artifact.sha256}`)
}
