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

function readRequiredJson(file, label) {
  if (!fs.existsSync(file)) throw new Error(`missing ${label}: ${path.basename(file)}`)
  const bytes = fs.readFileSync(file)
  return { bytes, value: JSON.parse(bytes.toString('utf8')), sha256: sha256(bytes) }
}

function verifyR805Source(dir, narrationReceipt, audioSha) {
  const briefName = clean(narrationReceipt?.source?.creativeBriefFile)
  const timelineName = clean(narrationReceipt?.source?.beatTimelineFile)
  if (briefName !== 'r805-creative-brief.json' || timelineName !== 'semantic-beat-timeline.json') {
    throw new Error('R8.05 narration receipt must bind canonical creative brief and semantic beat timeline')
  }
  const brief = readRequiredJson(path.join(dir, briefName), 'R8.05 creative brief')
  const timeline = readRequiredJson(path.join(dir, timelineName), 'R8.05 semantic beat timeline')
  if (clean(narrationReceipt.source?.creativeBriefSha256) !== brief.sha256) {
    throw new Error('R8.05 narration receipt creative brief hash is stale')
  }
  if (clean(narrationReceipt.source?.beatTimelineSha256) !== timeline.sha256) {
    throw new Error('R8.05 narration receipt semantic timeline hash is stale')
  }
  if (clean(timeline.value?.schemaVersion) !== 'ths-r805-semantic-beat-timeline-v1'
      || clean(timeline.value?.release) !== 'R8.05'
      || clean(timeline.value?.timingAuthority) !== 'exact-local-narration') {
    throw new Error('R8.05 semantic beat timeline has incompatible identity')
  }
  if (clean(timeline.value?.creativeBriefSha256) !== brief.sha256 || clean(timeline.value?.audioSha256) !== audioSha) {
    throw new Error('R8.05 semantic beat timeline is not bound to the exact brief/audio')
  }
  if (Number(timeline.value?.durationSeconds) !== Number(narrationReceipt?.profile?.durationSeconds)) {
    throw new Error('R8.05 narration duration does not match semantic beat timeline')
  }
  return { brief, timeline }
}

export function approveLocalNarration({
  packageDir,
  reviewer,
  naturalPresence,
  pronunciation,
  notes = '',
  now = new Date().toISOString(),
} = {}) {
  const dir = path.resolve(packageDir || '')
  const audioPath = path.join(dir, 'narration.wav')
  const narrationReceiptPath = path.join(dir, 'narration.wav.receipt.json')
  for (const file of [audioPath, narrationReceiptPath]) {
    if (!fs.existsSync(file)) throw new Error(`missing local voice artifact: ${path.basename(file)}`)
  }

  const audioBytes = fs.readFileSync(audioPath)
  const narrationReceiptBytes = fs.readFileSync(narrationReceiptPath)
  const narrationReceipt = JSON.parse(narrationReceiptBytes.toString('utf8'))
  const audioSha = sha256(audioBytes)
  const release = clean(narrationReceipt?.release) || 'R8.04'

  if (narrationReceipt?.schemaVersion !== 'ths-local-narration-receipt-v1') {
    throw new Error('unexpected local narration receipt schema')
  }
  if (narrationReceipt?.engine?.kind !== 'local-open-source') {
    throw new Error(`${release} approval accepts only local-open-source narration`)
  }
  if (narrationReceipt?.accountRequired !== false || narrationReceipt?.apiKeyRequired !== false || narrationReceipt?.meteredCreditsRequired !== false) {
    throw new Error(`${release} narration may not depend on an account, API key, or metered credits`)
  }
  if (clean(narrationReceipt?.output?.sha256) !== audioSha || Number(narrationReceipt?.output?.bytes) !== audioBytes.length) {
    throw new Error('local narration WAV does not match its provenance receipt')
  }

  let sourceBinding = null
  if (release === 'R8.05') {
    sourceBinding = verifyR805Source(dir, narrationReceipt, audioSha)
  } else if (release === 'R8.04') {
    const manifest = readRequiredJson(path.join(dir, 'video-asset-manifest.json'), 'R8.04 parent manifest')
    if (clean(narrationReceipt?.source?.scriptSha256) !== clean(manifest.value?.narrationScript?.sha256)) {
      throw new Error('local narration was synthesized from a stale R8.04 narration script')
    }
  } else {
    throw new Error(`unsupported narration release: ${release}`)
  }

  if (naturalPresence !== 'pass' || pronunciation !== 'pass') {
    throw new Error('Natural Presence and pronunciation must both explicitly pass; poor voice quality fails closed')
  }
  if (!clean(reviewer)) throw new Error('reviewer is required for exact-audio perceptual approval')

  const receipt = {
    schemaVersion: 'ths-voice-qa-receipt-v1',
    release,
    reviewedAt: now,
    reviewer: clean(reviewer),
    artifact: { file: 'narration.wav', sha256: audioSha, bytes: audioBytes.length },
    narrationReceiptSha256: sha256(narrationReceiptBytes),
    semanticBeatTimelineSha256: sourceBinding?.timeline?.sha256 ?? null,
    creativeBriefSha256: sourceBinding?.brief?.sha256 ?? null,
    engine: {
      name: clean(narrationReceipt.engine?.name),
      model: clean(narrationReceipt.engine?.model),
      kind: clean(narrationReceipt.engine?.kind),
      voice: clean(narrationReceipt.engine?.voice),
    },
    qa: {
      naturalPresence: 'pass',
      pronunciation: 'pass',
      roboticCadence: 'reject-if-present',
      qualifierEmphasis: 'pass',
      exactArtifactReviewed: true,
      notes: clean(notes),
    },
  }
  fs.writeFileSync(path.join(dir, 'voice-qa.receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`)
  return receipt
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = parseArgs(process.argv.slice(2))
  const receipt = approveLocalNarration({
    packageDir: args['package-dir'],
    reviewer: args.reviewer,
    naturalPresence: args['natural-presence'],
    pronunciation: args.pronunciation,
    notes: args.notes || '',
  })
  console.log(`[voice-engine] exact narration approved for ${receipt.release}: ${receipt.artifact.sha256}`)
}
