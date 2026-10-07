#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { approveLocalNarration } from './approve-local-narration.mjs'
import { stagePublicationMediaFromArtifacts } from './stage-publication-media.mjs'

const root = process.cwd()
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const clean = (value) => String(value ?? '').trim()

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }
    const key = token.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith('--')) flags[key] = true
    else {
      flags[key] = next
      index += 1
    }
  }
  return { positional, flags }
}

function run(executable, args, { env = process.env } = {}) {
  const result = spawnSync(executable, args, {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${executable} failed with exit code ${result.status}`)
  }
}

function runNode(relativeScript, env) {
  run(process.execPath, [path.resolve(root, relativeScript)], { env })
}

function selectedContext(distributionDir) {
  const selectionFile = path.join(distributionDir, 'opportunity-selection.json')
  if (!fs.existsSync(selectionFile)) throw new Error('missing opportunity-selection.json; run prepare first')
  const selection = readJson(selectionFile)
  const selected = selection?.selected
  if (!selected?.id || !selected?.platform) throw new Error('no governed distribution opportunity is selected')
  const pilotDir = path.join(distributionDir, 'pilots', selected.id)
  const pilotFile = path.join(pilotDir, 'bounded-pilot.json')
  if (!fs.existsSync(pilotFile)) throw new Error('missing bounded-pilot.json; run prepare first')
  const pilot = readJson(pilotFile)
  return { selection, selected, pilotDir, pilot }
}

function stateFile(distributionDir) {
  return path.join(distributionDir, 'local-production-state.json')
}

export function buildManualUploadPacket({
  stagedManifest,
  stagedRoot,
  releaseRoot,
  generatedAt = new Date().toISOString(),
} = {}) {
  if (stagedManifest?.schemaVersion !== 'ths-publication-media-v1' || stagedManifest?.status !== 'ready-for-provider') {
    throw new Error('manual upload packet requires a validated THS publication-media manifest')
  }
  const objectId = clean(stagedManifest.researchObjectId)
  const fingerprint = clean(stagedManifest.identityFingerprint)
  if (!objectId || !/^[a-f0-9]{64}$/i.test(fingerprint)) {
    throw new Error('manual upload packet requires canonical publication identity')
  }
  if (!Array.isArray(stagedManifest.media) || stagedManifest.media.length === 0) {
    throw new Error('manual upload packet requires governed media')
  }

  const bundleId = fingerprint.slice(0, 20)
  const sourceBundle = path.join(path.resolve(stagedRoot), objectId, bundleId)
  const destination = path.join(path.resolve(releaseRoot), objectId, bundleId)
  fs.rmSync(destination, { recursive: true, force: true })
  fs.mkdirSync(destination, { recursive: true })

  const media = []
  for (const item of stagedManifest.media) {
    const file = path.basename(clean(item.file))
    if (!file || file !== clean(item.file)) throw new Error('manual upload media filename is not canonical')
    const source = path.join(sourceBundle, file)
    if (!fs.existsSync(source)) throw new Error(`staged media missing: ${file}`)
    const bytes = fs.readFileSync(source)
    if (sha256(bytes) !== clean(item.sha256) || bytes.length !== Number(item.bytes)) {
      throw new Error(`staged media integrity mismatch: ${file}`)
    }
    fs.writeFileSync(path.join(destination, file), bytes)
    media.push({
      file,
      sha256: sha256(bytes),
      bytes: bytes.length,
      contentType: item.contentType,
      width: item.width ?? null,
      height: item.height ?? null,
      durationSeconds: item.durationSeconds ?? null,
      audio: item.audio ?? null,
    })
  }

  const caption = clean(stagedManifest.text)
  if (!caption) throw new Error('manual upload packet requires governed caption text')
  fs.writeFileSync(path.join(destination, 'caption.txt'), `${caption}\n`)

  const uploadInstructions = [
    'THS R8.04 MANUAL UPLOAD PACKET',
    '',
    'This folder is the canonical zero-credit handoff. Do not regenerate the media in a premium editor.',
    '',
    '1. Upload the included media file directly in the native platform app/site.',
    '2. Paste caption.txt without rewriting scientific claims or qualifiers.',
    '3. Choose the cover/frame natively if the platform requires one.',
    '4. After publication, record the final public URL as a THS Publisher manual receipt.',
    '5. Keep this folder unchanged so artifact hashes remain auditable.',
    '',
    `Research object: ${objectId}`,
    `Source: ${stagedManifest.sourceUrl}`,
    `Format: ${stagedManifest.format}`,
    `Identity fingerprint: ${fingerprint}`,
    '',
  ].join('\n')
  fs.writeFileSync(path.join(destination, 'UPLOAD.txt'), uploadInstructions)

  const release = {
    schemaVersion: 'ths-manual-upload-packet-v1',
    release: 'R8.04',
    generatedAt,
    transport: 'manual_native_upload',
    paidMembershipRequired: false,
    meteredGenerationCreditsRequired: false,
    thirdPartySchedulerRequired: false,
    researchObjectId: objectId,
    lifecycleId: stagedManifest.lifecycleId,
    identityFingerprint: fingerprint,
    idempotencyKey: stagedManifest.idempotencyKey,
    packId: stagedManifest.packId,
    sourceUrl: stagedManifest.sourceUrl,
    taggedDestination: stagedManifest.taggedDestination,
    sourceContentHash: stagedManifest.sourceContentHash,
    format: stagedManifest.format,
    mediaType: stagedManifest.mediaType,
    caption: { file: 'caption.txt', sha256: sha256(Buffer.from(`${caption}\n`)) },
    instructions: { file: 'UPLOAD.txt', sha256: sha256(Buffer.from(uploadInstructions)) },
    media,
  }
  writeJson(path.join(destination, 'release-manifest.json'), release)
  return { destination, release }
}

export function nextActionMessage({ platform, pilotDir, distributionDir }) {
  if (platform === 'short-video') {
    return [
      'Local narration is ready for exact-audio review.',
      `Listen to: ${path.join(pilotDir, 'narration.wav')}`,
      'If Natural Presence or pronunciation is weak, regenerate locally; do not approve it.',
      'When it passes, run:',
      'npm run social:local:finalize -- --reviewer perceptual-qa --natural-presence pass --pronunciation pass',
    ].join('\n')
  }
  return [
    'Governed carousel assets are ready.',
    'Run:',
    'npm run social:local:finalize',
    `Distribution workspace: ${distributionDir}`,
  ].join('\n')
}

export async function prepareLocalProduction({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  python = process.env.THS_PYTHON || (process.platform === 'win32' ? 'python' : 'python3'),
  voice = process.env.THS_LOCAL_VOICE || 'am_michael',
} = {}) {
  const env = { ...process.env, DISTRIBUTION_OUTPUT: distributionDir }
  runNode('scripts/distribution/build-research-distribution.mjs', env)
  runNode('scripts/distribution/build-opportunity-selection.mjs', env)
  runNode('scripts/distribution/build-bounded-pilot.mjs', env)

  const context = selectedContext(distributionDir)
  let status = 'ready-to-finalize'
  if (context.selected.platform === 'short-video') {
    run(python, [
      path.resolve(root, 'scripts/distribution/render-local-narration.py'),
      '--package-dir', context.pilotDir,
      '--voice', voice,
    ], { env })
    status = 'awaiting-voice-qa'
  }

  const state = {
    schemaVersion: 'ths-local-production-state-v1',
    release: 'R8.04',
    status,
    researchObjectId: context.selected.id,
    platform: context.selected.platform,
    distributionDir,
    pilotDir: context.pilotDir,
    voice: context.selected.platform === 'short-video'
      ? { engine: 'kokoro', mode: 'local-open-source', voice, qa: 'pending' }
      : null,
    premiumProviderFallbackAllowed: false,
    nextAction: nextActionMessage({
      platform: context.selected.platform,
      pilotDir: context.pilotDir,
      distributionDir,
    }),
  }
  writeJson(stateFile(distributionDir), state)
  return state
}

export async function finalizeLocalProduction({
  distributionDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution'),
  releaseRoot = path.resolve(process.env.THS_MANUAL_UPLOAD_ROOT || 'artifacts/distribution/manual-upload'),
  reviewer,
  naturalPresence,
  pronunciation,
  notes = '',
  ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg',
} = {}) {
  const context = selectedContext(distributionDir)

  if (context.selected.platform === 'short-video') {
    approveLocalNarration({
      packageDir: context.pilotDir,
      reviewer,
      naturalPresence,
      pronunciation,
      notes,
    })
  }

  const stagedRoot = path.join(distributionDir, '.manual-upload-stage')
  const stagedManifest = await stagePublicationMediaFromArtifacts({
    distributionDir,
    publicRoot: stagedRoot,
    publicOrigin: 'https://thehippiescientist.net',
    ffmpegPath,
  })
  const packet = buildManualUploadPacket({
    stagedManifest,
    stagedRoot,
    releaseRoot,
  })
  fs.rmSync(stagedRoot, { recursive: true, force: true })

  const state = {
    schemaVersion: 'ths-local-production-state-v1',
    release: 'R8.04',
    status: 'manual-upload-ready',
    researchObjectId: context.selected.id,
    platform: context.selected.platform,
    distributionDir,
    pilotDir: context.pilotDir,
    manualUploadDir: packet.destination,
    artifact: packet.release.media[0] ?? null,
    voice: context.selected.platform === 'short-video'
      ? {
          qa: 'passed',
          naturalPresence: 'pass',
          pronunciation: 'pass',
          premiumProviderFallbackAllowed: false,
        }
      : null,
    nextAction: `Upload the exact packet from ${packet.destination} using the native platform UI.`,
  }
  writeJson(stateFile(distributionDir), state)
  return state
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2))
  const command = positional[0]
  const distributionDir = path.resolve(clean(flags.output) || process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution')

  if (command === 'prepare') {
    const state = await prepareLocalProduction({
      distributionDir,
      python: clean(flags.python) || undefined,
      voice: clean(flags.voice) || undefined,
    })
    console.log('\n[ths-social] PREPARED')
    console.log(state.nextAction)
    return
  }

  if (command === 'finalize') {
    const state = await finalizeLocalProduction({
      distributionDir,
      releaseRoot: clean(flags['release-root']) || undefined,
      reviewer: clean(flags.reviewer),
      naturalPresence: clean(flags['natural-presence']),
      pronunciation: clean(flags.pronunciation),
      notes: clean(flags.notes),
      ffmpegPath: clean(flags.ffmpeg) || undefined,
    })
    console.log('\n[ths-social] MANUAL UPLOAD READY')
    console.log(state.nextAction)
    return
  }

  if (command === 'status') {
    const file = stateFile(distributionDir)
    if (!fs.existsSync(file)) throw new Error('no local production state exists; run prepare first')
    const state = readJson(file)
    console.log(JSON.stringify(state, null, 2))
    return
  }

  throw new Error('usage: local-social-production.mjs <prepare|finalize|status> [--output DIR] [--voice VOICE] [--reviewer NAME --natural-presence pass --pronunciation pass]')
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`[ths-social] FAIL: ${error.message}`)
    process.exitCode = 1
  })
}
