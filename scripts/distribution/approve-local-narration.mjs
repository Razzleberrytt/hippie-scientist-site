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

export function approveLocalNarration({
  packageDir,
  reviewer,
  naturalPresence,
  pronunciation,
  notes = '',
  now = new Date().toISOString(),
} = {}) {
  const dir = path.resolve(packageDir || '')
  const manifestPath = path.join(dir, 'video-asset-manifest.json')
  const audioPath = path.join(dir, 'narration.wav')
  const narrationReceiptPath = path.join(dir, 'narration.wav.receipt.json')
  for (const file of [manifestPath, audioPath, narrationReceiptPath]) {
    if (!fs.existsSync(file)) throw new Error(`missing local voice artifact: ${path.basename(file)}`)
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const audioBytes = fs.readFileSync(audioPath)
  const narrationReceiptBytes = fs.readFileSync(narrationReceiptPath)
  const narrationReceipt = JSON.parse(narrationReceiptBytes.toString('utf8'))
  const audioSha = sha256(audioBytes)

  if (narrationReceipt?.schemaVersion !== 'ths-local-narration-receipt-v1') {
    throw new Error('unexpected local narration receipt schema')
  }
  if (narrationReceipt?.engine?.kind !== 'local-open-source') {
    throw new Error('R8.04 approval accepts only local-open-source narration')
  }
  if (narrationReceipt?.accountRequired !== false || narrationReceipt?.apiKeyRequired !== false || narrationReceipt?.meteredCreditsRequired !== false) {
    throw new Error('R8.04 narration may not depend on an account, API key, or metered credits')
  }
  if (clean(narrationReceipt?.output?.sha256) !== audioSha || Number(narrationReceipt?.output?.bytes) !== audioBytes.length) {
    throw new Error('local narration WAV does not match its provenance receipt')
  }
  if (clean(narrationReceipt?.source?.scriptSha256) !== clean(manifest?.narrationScript?.sha256)) {
    throw new Error('local narration was synthesized from a stale narration script')
  }
  if (naturalPresence !== 'pass' || pronunciation !== 'pass') {
    throw new Error('Natural Presence and pronunciation must both explicitly pass; poor voice quality fails closed')
  }
  if (!clean(reviewer)) throw new Error('reviewer is required for exact-audio perceptual approval')

  const receipt = {
    schemaVersion: 'ths-voice-qa-receipt-v1',
    release: 'R8.04',
    reviewedAt: now,
    reviewer: clean(reviewer),
    artifact: { file: 'narration.wav', sha256: audioSha, bytes: audioBytes.length },
    narrationReceiptSha256: sha256(narrationReceiptBytes),
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
  console.log(`[voice-engine] exact narration approved for R8.04: ${receipt.artifact.sha256}`)
}
