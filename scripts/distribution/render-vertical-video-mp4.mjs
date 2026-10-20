import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'
import { validateR809CaptionsSrt, renderR809CaptionAss } from './r809-caption-track.mjs'
import { verifyR810PackageGate } from './r810-package-qa.mjs'
import { verifyR819CanonicalHandoff } from './r819-canonical-handoff.mjs'
import { verifyR819LayerInventory, compositeR819Frame } from './r819-native-layer-compositor.mjs'
import { assertMobileOpeningHookSvg } from './mobile-hook-clarity-gate.mjs'
import { assertNativeMobileOpeningPixels } from './mobile-opening-native-pixels.mjs'
import { renderR810AlignedCaptionTracks, renderR817ProgressiveWordCaptions } from './r810-aligned-captions.mjs'
import { measureR817FinalMotion, assertR817FinalMotion, R817_MOTION_LIMITS } from './r817-motion-qa.mjs'
import { measureR817CaptionHighlightPixels, assertR817CaptionPixelQA } from './r817-caption-pixel-qa.mjs'
import { measureR817HookCenterChange } from './r817-rendered-evidence.mjs'
import { assertR818TelemetryBinding } from './r818-telemetry-qa.mjs'
import { verifyR818NativeFrames } from './r818-native-frame-sequence.mjs'
import { parseR812Loudness, assertR812Loudness } from './r812-loudness.mjs'
import { assertR817FirstPass } from './r817-canonical-first-pass.mjs'
import {
  assertNoDecorativeVideoChrome, mobileAacEncodeArgs,
  assertMobileAudioProbe, assertAudibleDecodedAudio,
} from './evidencemotion-delivery-guardrails.mjs'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const clean = (value) => String(value ?? '').trim()
const timingMatches = (a, b) => Number.isFinite(Number(a)) && Number.isFinite(Number(b)) && Math.abs(Number(a) - Number(b)) <= 0.0006

function assertCanonicalChild(dir, file, pattern) {
  const normalized = clean(file)
  if (!pattern.test(normalized) || path.basename(normalized) !== normalized) {
    throw new Error(`non-canonical media asset path: ${normalized}`)
  }
  const resolvedDir = path.resolve(dir)
  const resolved = path.resolve(resolvedDir, normalized)
  if (!resolved.startsWith(`${resolvedDir}${path.sep}`)) throw new Error(`media asset escaped package directory: ${normalized}`)
  return resolved
}

function decodeXmlEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function parseSceneMetadata(svg) {
  const match = svg.match(/<metadata>([\s\S]*?)<\/metadata>/)
  if (!match) throw new Error('video scene is missing embedded provenance metadata')
  return JSON.parse(decodeXmlEntities(match[1]))
}

function verifyScene({ packageDir, asset, sourceUrl, sourceContentHash }) {
  const file = assertCanonicalChild(packageDir, asset.file, /^video-scene-\d{2}\.svg$/)
  const bytes = fs.readFileSync(file)
  if (sha256(bytes) !== clean(asset.sha256)) throw new Error(`video scene hash mismatch: ${asset.file}`)
  assertNoDecorativeVideoChrome(bytes.toString('utf8'))
  // Fail before MP4 production if the first frame repeats the phenibut clutter pattern.
  // Governed sources still belong in their designated proof/source beat.
  if (Number(asset.start) === 0) assertMobileOpeningHookSvg(bytes.toString('utf8'))
  const metadata = parseSceneMetadata(bytes.toString('utf8'))
  if (clean(metadata.sourceUrl) !== sourceUrl) throw new Error(`video scene source URL mismatch: ${asset.file}`)
  if (clean(metadata.contentHash) !== sourceContentHash) throw new Error(`video scene source content hash mismatch: ${asset.file}`)
  if (clean(metadata.renderer) !== 'vertical-video-package-v1') throw new Error(`unexpected parent renderer: ${asset.file}`)
  if (!timingMatches(metadata.start, asset.start) || !timingMatches(metadata.end, asset.end)) {
    throw new Error(`video scene timing mismatch: ${asset.file}`)
  }
  if (clean(metadata.role) !== clean(asset.role) || clean(metadata.factualAuthority) !== clean(asset.factualAuthority)) {
    throw new Error(`video scene governed metadata mismatch: ${asset.file}`)
  }
  if (clean(asset.beatId)) {
    if (clean(metadata.beatId) !== clean(asset.beatId)
        || clean(metadata.beatReceiptSha256) !== clean(asset.beatReceiptSha256)
        || clean(metadata.cutReason) !== clean(asset.cutReason)) {
      throw new Error(`R8.05 semantic beat metadata mismatch: ${asset.file}`)
    }
  }
  for (const field of ['visualMode', 'teachingObject', 'compositionFamily', 'rhythmAction', 'motifId', 'patternInterruptReason']) {
    if (clean(metadata[field]) !== clean(asset[field])) {
      throw new Error(`video scene creative metadata mismatch for ${field}: ${asset.file}`)
    }
  }
  if (Boolean(metadata.patternInterrupt) !== Boolean(asset.patternInterrupt)) {
    throw new Error(`video scene creative metadata mismatch for patternInterrupt: ${asset.file}`)
  }
  return { file, bytes }
}

function verifyMotionVariant({ packageDir, asset, sourceUrl, sourceContentHash }) {
  const motion = asset?.motion
  if (!motion || !['reveal', 'highlight'].includes(clean(motion.type))) {
    throw new Error(`R8.05 narrated beat ${asset?.beatId || '<missing>'} lacks a renderable motion primitive`)
  }
  const file = assertCanonicalChild(packageDir, motion.preFile, /^video-scene-\d{2}-pre\.svg$/)
  const bytes = fs.readFileSync(file)
  if (sha256(bytes) !== clean(motion.preSha256)) throw new Error(`R8.05 pre-motion scene hash mismatch: ${motion.preFile}`)
  assertNoDecorativeVideoChrome(bytes.toString('utf8'))
  const metadata = parseSceneMetadata(bytes.toString('utf8'))
  if (clean(metadata.sourceUrl) !== sourceUrl || clean(metadata.contentHash) !== sourceContentHash) {
    throw new Error(`R8.05 pre-motion provenance mismatch: ${motion.preFile}`)
  }
  if (clean(metadata.beatId) !== clean(asset.beatId)
      || clean(metadata.motionType) !== clean(motion.type)
      || clean(metadata.motionPhase) !== 'pre'
      || !timingMatches(metadata.motionCueOffset, motion.cueOffset)) {
    throw new Error(`R8.05 pre-motion metadata mismatch: ${motion.preFile}`)
  }
  if (clean(motion.postFile) !== clean(asset.file) || clean(motion.postSha256) !== clean(asset.sha256)) {
    throw new Error(`R8.05 post-motion binding mismatch: ${asset.file}`)
  }
  return { file, bytes }
}

function verifyPackage(packageDir) {
  const manifestPath = path.join(packageDir, 'video-asset-manifest.json')
  const manifestBytes = fs.readFileSync(manifestPath)
  const manifest = JSON.parse(manifestBytes.toString('utf8'))
  if (clean(manifest.renderer) !== 'vertical-video-package-v1') throw new Error('MP4 renderer requires vertical-video-package-v1 input')
  const release = clean(manifest.release || manifest.systemRelease) || 'R8.04'
  const durationSeconds = Number(manifest.durationSeconds)
  if (release === 'R8.04' && durationSeconds !== 30) throw new Error('R8.04 MP4 renderer requires an exact 30-second parent package')
  if (release === 'R8.05' && (!Number.isFinite(durationSeconds) || durationSeconds < 5 || durationSeconds > 60)) {
    throw new Error('R8.05 MP4 renderer requires the voice-authored natural duration inside the 5-60s envelope')
  }
  if (!['R8.04', 'R8.05'].includes(release)) throw new Error(`unsupported video release: ${release}`)
  const sourceUrl = clean(manifest.sourceUrl)
  const sourceContentHash = clean(manifest.sourceContentHash)
  if (!sourceUrl || !sourceContentHash) throw new Error('parent package source provenance is required')
  const r817Active = manifest.canonicalFirstPassRelease === 'R8.17'
  if (r817Active !== Boolean(manifest.r817FirstPass)) {
    throw Error('R8.17 canonical plan sidecar mismatch; no legacy-quality downgrade')
  }
  let r817Proof = null
  let r818TelemetryProof = null
  let r818NativeFrames = null
  if (r817Active) {
    const file = assertCanonicalChild(packageDir, manifest.r817FirstPass.file, /^r817-first-pass\.json$/)
    const bytes = fs.readFileSync(file)
    if (sha256(bytes) !== manifest.r817FirstPass.sha256) throw Error('R8.17 immutable first-pass plan hash mismatch')
    const plan=JSON.parse(bytes.toString('utf8'))
    r817Proof = assertR817FirstPass(plan, manifest)
    const meta=manifest.r818Telemetry
    if(!meta||meta.file!=='r818-telemetry.json')throw Error('R8.18 telemetry manifest sidecar missing')
    const telemetryFile=assertCanonicalChild(packageDir,meta.file,/^r818-telemetry\.json$/)
    const telemetryBytes=fs.readFileSync(telemetryFile)
    if(sha256(telemetryBytes)!==meta.sha256)throw Error('R8.18 renderer telemetry changed after package')
    const t=JSON.parse(telemetryBytes.toString('utf8'))
    if(t.sourceManifestSha256!==meta.sourceManifestSha256)
      throw Error('R8.18 telemetry source-manifest changed')
    const checked=assertR818TelemetryBinding(plan,t,{
      rendererCodeSha256:meta.rendererCodeSha256,
      renderedSceneAssetsSha256:meta.renderedSceneAssetsSha256
    })
    r818TelemetryProof={sha256:meta.sha256, ...checked,sourceManifestSha256:t.sourceManifestSha256}

  }

  const timelineFile = assertCanonicalChild(packageDir, manifest.timeline?.file, /^video-timeline\.json$/)
  const timelineBytes = fs.readFileSync(timelineFile)
  if (sha256(timelineBytes) !== clean(manifest.timeline?.sha256)) throw new Error('video timeline hash mismatch')
  const timeline = JSON.parse(timelineBytes.toString('utf8'))
  if (clean(timeline.renderer) !== 'vertical-video-package-v1') throw new Error('timeline renderer identity does not match governed parent renderer')
  if (clean(timeline.packId) !== clean(manifest.packId)) throw new Error('timeline pack identity does not match parent manifest')
  if (clean(timeline.sourceUrl) !== sourceUrl || clean(timeline.sourceContentHash) !== sourceContentHash) {
    throw new Error('timeline provenance does not match parent manifest')
  }
  if (!timingMatches(timeline.durationSeconds, durationSeconds) || Number(timeline.width) !== 1080 || Number(timeline.height) !== 1920 || Number(timeline.fps) !== 30) {
    throw new Error('timeline does not match the governed 1080x1920@30fps natural-duration profile')
  }
  if (release === 'R8.05') {
    if (clean(timeline.systemRelease) !== 'R8.05' || clean(timeline.timingAuthority) !== 'exact-local-narration') {
      throw new Error('R8.05 video timeline must be authored from exact local narration')
    }
    const methodRelease = clean(manifest.creativeMethodRelease) || 'R8.05'
    if (clean(timeline.creativeMethodRelease) !== methodRelease) {
      throw new Error('video timeline creative methodology does not match parent manifest')
    }
    if (methodRelease === 'R8.07') {
      if (clean(manifest.creativeFoundation?.schemaVersion) !== 'ths-r806-creative-receipt-v1'
          || clean(manifest.creativeFoundation?.status) !== 'approved'
          || clean(manifest.creativeDirection?.schemaVersion) !== 'ths-r807-creative-receipt-v1'
          || clean(manifest.creativeDirection?.status) !== 'approved'
          || clean(manifest.creativeDirection?.inheritedR806OverlaySha256) !== clean(manifest.creativeFoundation?.overlaySha256)
          || !/^[a-f0-9]{64}$/i.test(clean(manifest.creativeDirection?.overlaySha256))) {
        throw new Error('R8.07 MP4 render requires bound R8.06 foundation and R8.07 visual-rhythm receipts')
      }
    }
    if (!clean(timeline.semanticBeatMapSha256) || clean(timeline.semanticBeatMapSha256) !== clean(manifest.creativeQuality?.semanticBeatMapSha256)) {
      throw new Error('R8.05 video timeline is not bound to the approved semantic beat map')
    }
  }

  if (['R8.09', 'R8.10'].includes(clean(manifest.creativeMethodRelease))) {
    if (manifest.captions?.burnInRequired !== true
        || clean(manifest.captions?.source) !== 'exact-governed-voice-script'
        || clean(manifest.creativeDirection?.schemaVersion) !== 'ths-r809-creative-receipt-v1'
        || clean(manifest.creativeDirection?.status) !== 'approved'
        || clean(manifest.creativeDirection?.canonicalStyle) !== (manifest.r819?.enabled===true ? 'dark-cellular-organic-v1' : '2p5d-science-explainer-v1')
        || manifest.creativeDirection?.burnInNarrationCaptions !== true
        || clean(manifest.creativeSilentFoundation?.schemaVersion) !== 'ths-r808-creative-receipt-v1'
        || clean(manifest.creativeDirection?.inheritedR808OverlaySha256) !== clean(manifest.creativeSilentFoundation?.overlaySha256)) {
      throw new Error('R8.09 MP4 requires approved 2.5D creative lineage and exact-script burn-in captions')
    }
  }
  const assets = Array.isArray(manifest.assets) ? manifest.assets : []
  if (!assets.length || assets.length !== timeline.scenes?.length) throw new Error('parent video package scene inventory is incomplete')
  let expectedStart = 0
  let totalDuration = 0
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index]
    const scene = timeline.scenes[index]
    if (clean(asset.file) !== clean(scene.file) || clean(asset.sha256) !== clean(scene.sha256)) throw new Error(`timeline/manifest scene mismatch at index ${index}`)
    if (JSON.stringify(asset.motion ?? null) !== JSON.stringify(scene.motion ?? null) || Boolean(asset.spoken) !== Boolean(scene.spoken)) {
      throw new Error(`timeline/manifest motion contract mismatch at index ${index}`)
    }
    if (!timingMatches(asset.start, scene.start) || !timingMatches(asset.end, scene.end) || !timingMatches(asset.duration, scene.duration)) {
      throw new Error(`timeline/manifest timing mismatch at index ${index}`)
    }
    if (!timingMatches(asset.start, expectedStart)) throw new Error(`video scene sequence is not contiguous at index ${index}`)
    const start = Number(asset.start)
    const end = Number(asset.end)
    const duration = Number(asset.duration)
    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(duration) || duration <= 0 || end <= start) {
      throw new Error(`invalid video scene timing at index ${index}`)
    }
    if (!timingMatches(duration, end - start)) throw new Error(`video scene duration does not match start/end at index ${index}`)
    if (clean(asset.role) !== clean(scene.role) || clean(asset.factualAuthority) !== clean(scene.factualAuthority)) {
      throw new Error(`timeline/manifest governed metadata mismatch at index ${index}`)
    }
    if (release === 'R8.05') {
      const motionType = clean(asset.motion?.type)
      if (asset.spoken) {
        if (!['reveal', 'highlight'].includes(motionType)) throw new Error(`R8.05 narrated scene ${index} requires reveal/highlight motion`)
        const cue = Number(asset.motion?.cueOffset)
        if (!Number.isFinite(cue) || cue <= 0 || cue >= duration) throw new Error(`R8.05 scene ${index} has invalid motion cue`)
        if (clean(asset.motion?.cueMethod) !== 'voice-duration-proportional-text-anchor') throw new Error(`R8.05 scene ${index} has ungoverned motion-cue method`)
      } else if (motionType !== 'hold') {
        throw new Error(`R8.05 silent scene ${index} must use hold motion`)
      }
    }
    expectedStart = end
    totalDuration += duration
  }
  if (!timingMatches(expectedStart, durationSeconds) || !timingMatches(totalDuration, durationSeconds)) {
    throw new Error('video scene timing does not cover the exact governed runtime')
  }
  if(r817Active){
    const native=manifest.r818NativeFrames
    if(native?.file!=='r818-native-frames.json'||!/^[a-f0-9]{64}$/.test(String(native.sha256||'')))
      throw Error('R8.18 native frame manifest missing; refusing static SVG delivery')
    const filePath=assertCanonicalChild(packageDir,native.file,/^r818-native-frames\.json$/)
    const frameBytes=fs.readFileSync(filePath)
    if(sha256(frameBytes)!==native.sha256)
      throw Error('R8.18 native frame manifest hash differs from package')
    r818NativeFrames=verifyR818NativeFrames(packageDir,JSON.parse(frameBytes.toString('utf8')),timeline.scenes)
    if(r818NativeFrames.frameCount!==native.nativeFrames)
      throw Error('R8.18 actual frame count mismatches manifest')
  }

  return { manifest, manifestBytes, timeline, sourceUrl, sourceContentHash, assets, release, durationSeconds, r817Proof, r818TelemetryProof, r818NativeFrames }
}

function verifyLocalNarration(packageDir, manifest) {
  const scriptMeta = manifest?.narrationScript
  if (scriptMeta?.localVoiceRequired !== true || scriptMeta?.premiumProviderFallbackAllowed !== false) {
    throw new Error('R8.04 parent package must require local voice and forbid premium-provider fallback')
  }
  const scriptFile = assertCanonicalChild(packageDir, scriptMeta.file, /^narration-script\.json$/)
  const scriptBytes = fs.readFileSync(scriptFile)
  if (sha256(scriptBytes) !== clean(scriptMeta.sha256)) throw new Error('narration script hash mismatch')
  const script = JSON.parse(scriptBytes.toString('utf8'))
  if (clean(script.schemaVersion) !== 'ths-local-narration-script-v1'
      || clean(script.packId) !== clean(manifest.packId)
      || !timingMatches(script.durationSeconds, manifest.durationSeconds)) {
    throw new Error('narration script identity/profile does not match parent manifest')
  }

  const audioFile = assertCanonicalChild(packageDir, 'narration.wav', /^narration\.wav$/)
  const narrationReceiptFile = assertCanonicalChild(packageDir, 'narration.wav.receipt.json', /^narration\.wav\.receipt\.json$/)
  const voiceQaFile = assertCanonicalChild(packageDir, 'voice-qa.receipt.json', /^voice-qa\.receipt\.json$/)
  for (const file of [audioFile, narrationReceiptFile, voiceQaFile]) {
    if (!fs.existsSync(file)) {
      throw new Error(`R8.04 local narration is incomplete: missing ${path.basename(file)}; hosted/credit fallback is forbidden`)
    }
  }

  const audioBytes = fs.readFileSync(audioFile)
  const narrationReceiptBytes = fs.readFileSync(narrationReceiptFile)
  const voiceQaBytes = fs.readFileSync(voiceQaFile)
  const narrationReceipt = JSON.parse(narrationReceiptBytes.toString('utf8'))
  const voiceQa = JSON.parse(voiceQaBytes.toString('utf8'))
  const audioSha256 = sha256(audioBytes)
  const narrationReceiptSha256 = sha256(narrationReceiptBytes)
  const voiceQaSha256 = sha256(voiceQaBytes)

  if (clean(narrationReceipt.schemaVersion) !== 'ths-local-narration-receipt-v1') {
    throw new Error('unexpected local narration receipt schema')
  }
  if (clean(narrationReceipt.engine?.kind) !== 'local-open-source') {
    throw new Error('R8.04 MP4 renderer accepts only local-open-source narration')
  }
  if (narrationReceipt.accountRequired !== false || narrationReceipt.apiKeyRequired !== false || narrationReceipt.meteredCreditsRequired !== false) {
    throw new Error('R8.04 narration receipt indicates an account/API-key/credit dependency')
  }
  const release = clean(manifest.release || manifest.systemRelease) || 'R8.04'
  if (release === 'R8.04') {
    if (clean(narrationReceipt.source?.scriptSha256) !== clean(scriptMeta.sha256) || clean(narrationReceipt.source?.packId) !== clean(manifest.packId)) {
      throw new Error('local narration receipt was produced from a stale R8.04 script/package')
    }
  } else {
    const bindings = manifest.r805Bindings
    if (clean(narrationReceipt.release) !== 'R8.05'
        || clean(narrationReceipt.source?.timingAuthority) !== 'exact-local-narration'
        || clean(narrationReceipt.source?.creativeBriefSha256) !== clean(bindings?.creativeBrief?.sha256)
        || clean(narrationReceipt.source?.beatTimelineSha256) !== clean(bindings?.semanticBeatTimeline?.sha256)
        || clean(bindings?.audioSha256) !== audioSha256) {
      throw new Error('R8.05 narration receipt does not match the voice-authored visual package bindings')
    }
  }
  if (clean(narrationReceipt.output?.file) !== 'narration.wav' || clean(narrationReceipt.output?.sha256) !== audioSha256 || Number(narrationReceipt.output?.bytes) !== audioBytes.length) {
    throw new Error('local narration WAV does not match its provenance receipt')
  }
  if (!timingMatches(narrationReceipt.profile?.durationSeconds, manifest.durationSeconds) || Number(narrationReceipt.profile?.channels) !== 1) {
    throw new Error('local narration receipt does not match the governed audio profile')
  }

  if (clean(voiceQa.schemaVersion) !== 'ths-voice-qa-receipt-v1' || clean(voiceQa.release) !== release) {
    throw new Error(`${release} voice QA receipt is missing or incompatible`)
  }
  if (clean(voiceQa.artifact?.sha256) !== audioSha256 || clean(voiceQa.narrationReceiptSha256) !== narrationReceiptSha256) {
    throw new Error('voice QA receipt does not bind the exact local narration artifact')
  }
  if (release === 'R8.05') {
    if (clean(voiceQa.semanticBeatTimelineSha256) !== clean(manifest.r805Bindings?.semanticBeatTimeline?.sha256)
        || clean(voiceQa.creativeBriefSha256) !== clean(manifest.r805Bindings?.creativeBrief?.sha256)) {
      throw new Error('R8.05 voice QA is not bound to the exact semantic beat timeline and creative brief')
    }
  }
  if (clean(voiceQa.engine?.kind) !== 'local-open-source') throw new Error('voice QA approved a non-local narration engine')
  if (clean(voiceQa.qa?.naturalPresence) !== 'pass' || clean(voiceQa.qa?.pronunciation) !== 'pass' || voiceQa.qa?.exactArtifactReviewed !== true) {
    throw new Error('Natural Presence and pronunciation must pass on the exact narration WAV before MP4 render')
  }

  return {
    file: audioFile,
    audioBytes,
    audioSha256,
    narrationReceipt,
    narrationReceiptSha256,
    voiceQa,
    voiceQaSha256,
    scriptSha256: sha256(scriptBytes),
  }
}

/**
 * Spawn a command, tolerating Windows batch shims without shell:true.
 */
function runCommand(executable, args, options = {}) {
  const isWindowsShim = process.platform === 'win32' && /\.(cmd|bat)$/i.test(executable)
  const [command, commandArgs] = isWindowsShim
    ? [process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', executable, ...args]]
    : [executable, args]

  const result = spawnSync(command, commandArgs, { encoding: 'utf8', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${executable} failed (${result.status}): ${(result.stderr || result.stdout || '').slice(0, 2000)}`)
  return result
}

function ffmpegVersion(ffmpegPath) {
  const result = runCommand(ffmpegPath, ['-version'])
  return clean(String(result.stdout || '').split('\n')[0])
}

export function buildMp4RenderKey({ manifestSha256, ffmpegVersionLine, narrationSha256, voiceQaSha256, release = 'R8.04', durationSeconds = 30, creativeMethodRelease = null, alignmentReceiptSha256 = null, rendererSourceSha256 = null, alignedCaptionSrtSha256 = null }) {
  for (const [label, value] of Object.entries({ manifestSha256, ffmpegVersionLine, narrationSha256, voiceQaSha256 })) {
    if (!clean(value)) throw new Error(`${label} is required for MP4 render identity`)
  }
  const renderer = release === 'R8.05' ? 'vertical-video-mp4-v3-r805' : 'vertical-video-mp4-v2-r804'
  const r810 = creativeMethodRelease === 'R8.10'
  const extraInputs = { alignmentReceiptSha256, rendererSourceSha256, alignedCaptionSrtSha256 }
  if (r810 && Object.entries(extraInputs).some(([, v]) => !/^[a-f0-9]{64}$/.test(String(v || '')))) {
    throw new Error('R8.10 MP4 cache key must bind exact audio alignment, renderer code and final caption track')
  }
  const legacyKeySource = `${renderer}\n${clean(manifestSha256)}\n${clean(ffmpegVersionLine)}\n${clean(narrationSha256)}\n${clean(voiceQaSha256)}\n1080x1920\n30fps\n${Number(durationSeconds).toFixed(4)}s\nlibx264-baseline-level4-crf20-max4M\naac192k-44k1-stereo\nyuv420p\n`
  const r810Suffix = r810 ? Object.entries(extraInputs).map(([name, value]) => name + '=' + value).join('\n') : ''
  return sha256(r810 ? legacyKeySource + r810Suffix : legacyKeySource)
}

export async function renderVerticalVideoMp4({ packageDir, outputFile, ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg', ffprobePath = process.env.FFPROBE_PATH || 'ffprobe' }) {
  const inputDir = path.resolve(packageDir)
  const output = path.resolve(outputFile)
  if (path.extname(output).toLowerCase() !== '.mp4') throw new Error('outputFile must use .mp4 extension')
  fs.mkdirSync(path.dirname(output), { recursive: true })

  const verified = verifyPackage(inputDir)
  const isR810 = clean(verified.manifest.creativeMethodRelease) === 'R8.10'
  const isR817 = Boolean(verified.r817Proof)
  if (isR817 && !isR810) throw Error('R8.17 progressive word captions require reviewed R8.10 acoustic alignment; no phrase-flash fallback')
  const r810Proof = isR810 ? verifyR810PackageGate(inputDir, { requireAlignment: true }) : null
  // R8.19 is strictly opt-in. Fail BEFORE encoding if pinned art, R8.18 geometry,
  // or genuine independently heard R8.10 MFA cue bindings are absent.
  const r819Proof = verified.manifest.r819?.enabled === true
    ? verifyR819CanonicalHandoff(inputDir) : null
  const narration = verifyLocalNarration(inputDir, verified.manifest)
  const isR809 = ['R8.09', 'R8.10'].includes(clean(verified.manifest.creativeMethodRelease))
  let burnInCaptions = null
  let alignedCaptionSrtSha256 = null
  let r817CaptionProof = null
  let r817CaptionCues = null
  if (isR809) {
    const manifest = verified.manifest
    const captionFile = assertCanonicalChild(inputDir, manifest.captions?.file, /^captions\.srt$/)
    const captionBytes = fs.readFileSync(captionFile)
    if (sha256(captionBytes) !== clean(manifest.captions?.sha256)) {
      throw new Error('R8.09 captions.srt hash does not match governed manifest')
    }
    const narrationFile = assertCanonicalChild(inputDir, manifest.narrationScript?.file, /^narration-script\.json$/)
    const script = JSON.parse(fs.readFileSync(narrationFile, 'utf8'))
    validateR809CaptionsSrt(script.scenes, captionBytes.toString('utf8'))
    if (isR810) {
      const aligned = isR817
        ? renderR817ProgressiveWordCaptions(script.scenes, r810Proof.alignment.receipt.words)
        : renderR810AlignedCaptionTracks(script.scenes, r810Proof.alignment.receipt.words)
      burnInCaptions = aligned.ass
      if (isR817) {
        r817CaptionProof = {mode:aligned.mode,wordCount:aligned.wordCount,cueCount:aligned.cueCount,phraseFlashFallback:false}
        r817CaptionCues = aligned.cues
      }
      fs.writeFileSync(path.join(inputDir, 'aligned-captions.srt'), aligned.srt)
      alignedCaptionSrtSha256 = sha256(Buffer.from(aligned.srt))
    } else {
      burnInCaptions = renderR809CaptionAss(script.scenes)
    }
  }
  const version = ffmpegVersion(ffmpegPath)
  const manifestSha256 = sha256(verified.manifestBytes)
  const renderKey = buildMp4RenderKey({
    manifestSha256,
    ffmpegVersionLine: version,
    narrationSha256: narration.audioSha256,
    voiceQaSha256: narration.voiceQaSha256,
    release: verified.release,
    durationSeconds: verified.durationSeconds,
    creativeMethodRelease: isR810 ? 'R8.10' : null,
    alignmentReceiptSha256: isR810 ? r810Proof.alignment.receiptSha256 : null,
    rendererSourceSha256: isR810 ? sha256(fs.readFileSync(new URL(import.meta.url))) : null,
    alignedCaptionSrtSha256: isR810 ? alignedCaptionSrtSha256 : null,
  })
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-video-mp4-'))

  try {
    let filter = 'fps=30,scale=1080:1920:flags=lanczos'
    let captionFileSha256 = null
    if (isR809) {
      const assFile = path.join(tempDir, 'narration-captions.ass')
      fs.writeFileSync(assFile, burnInCaptions)
      captionFileSha256 = sha256(Buffer.from(burnInCaptions))
      // Small continuous camera/object drift keeps locally generated 2.5D
      // teaching illustrations alive without a fake timer or paid video model.
      // Captions are drawn AFTER camera motion so their text never drifts.
      const escapedFile = assFile.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\'")
      filter = isR817 ? `fps=30,scale=1080:1920:flags=lanczos,ass='${escapedFile}'` : `fps=30,scale=1080:1920:flags=lanczos,zoompan=z='min(zoom+0.00018,1.045)':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=1080x1920:fps=30,ass='${escapedFile}'`
    }
    const concatLines = []
    const nativeFrameDir=isR817?path.join(tempDir,'native-frames'):null
    if(nativeFrameDir)fs.mkdirSync(nativeFrameDir)
    let nativeFrameCount=0
    const nativeOpeningPixelSamples=[]
    // R8.19 encoding must consume independently rendered pixels, never silently
    // fall back to the already baked R8.18 frames. The approved R8.18 sequence is
    // retained as a pixel-exact reference for every rebuilt native frame.
    const r819Layers=r819Proof ? verifyR819LayerInventory(inputDir,
      verified.manifest.r819.layerSequence,verified.r818NativeFrames) : null
    const r819FrameProofs=[]
    let finalPng = null
    for (let index = 0; index < verified.assets.length; index += 1) {
      const asset = verified.assets[index]
      // Always validate the science/caption source SVG, but encode actual
      // 30fps owner-authored native frames whenever R8.18 is active.
      const { bytes } = verifyScene({ packageDir: inputDir, asset, sourceUrl: verified.sourceUrl, sourceContentHash: verified.sourceContentHash })
      if (isR817) {
        const nativeBeat=verified.r818NativeFrames.beats[index]
        if(nativeBeat.beatId!==asset.beatId)throw Error('R8.18 scene/native beat identity drift')
        const layerBeat=r819Layers?.sequence.beats[index]
        for(let j=0;j<nativeBeat.frames.length;j++){
          const frame=nativeBeat.frames[j]
          const nativeFile=path.join(inputDir,frame.file)
          const numberedFile=path.join(nativeFrameDir,'f'+String(nativeFrameCount).padStart(6,'0')+'.png')
          if(r819Proof){
            const proof=await compositeR819Frame(inputDir,layerBeat,layerBeat.frames[j],frame,numberedFile)
            r819FrameProofs.push(proof)
            finalPng=numberedFile
          }else{
            fs.linkSync(nativeFile,numberedFile)
            finalPng=nativeFile
          }
          // The R8.18/R8.19 encode consumes THESE actual PNG bytes, never
          // the governed-but-unused source SVG. Sample native/composited
          // opening pixels at 0, .5, 1 and 1.5 seconds of the final sequence.
          if(nativeFrameCount<60&&nativeFrameCount%15===0)
            nativeOpeningPixelSamples.push(fs.readFileSync(numberedFile))
          nativeFrameCount++
        }
        continue
      }
      const suffix = String(index + 1).padStart(2, '0')
      const postPng = path.join(tempDir, `scene-${suffix}-post.png`)
      await sharp(bytes).png({ compressionLevel: 9, adaptiveFiltering: false }).toFile(postPng)

      if (verified.release === 'R8.05' && asset.spoken) {
        const pre = verifyMotionVariant({ packageDir: inputDir, asset, sourceUrl: verified.sourceUrl, sourceContentHash: verified.sourceContentHash })
        const prePng = path.join(tempDir, `scene-${suffix}-pre.png`)
        await sharp(pre.bytes).png({ compressionLevel: 9, adaptiveFiltering: false }).toFile(prePng)
        const cue = Number(asset.motion.cueOffset)
        const postDuration = Number(asset.duration) - cue
        if (!(cue > 0 && postDuration > 0)) throw new Error(`R8.05 motion split is invalid for beat ${asset.beatId}`)
        concatLines.push(`file '${prePng.replace(/'/g, "'\\''")}'`)
        concatLines.push(`duration ${cue.toFixed(4)}`)
        concatLines.push(`file '${postPng.replace(/'/g, "'\\''")}'`)
        concatLines.push(`duration ${postDuration.toFixed(4)}`)
      } else {
        concatLines.push(`file '${postPng.replace(/'/g, "'\\''")}'`)
        concatLines.push(`duration ${Number(asset.duration).toFixed(4)}`)
      }
      finalPng = postPng
    }
    if (!finalPng) throw new Error('video renderer produced no scene frames')
    // Source SVG role lint above is not enough for native mode: reject gross
    // fine-detail overload on the actual frames handed to FFmpeg. This is
    // only a negative pixel screen; it cannot certify text semantics or taste.
    if(isR817)await assertNativeMobileOpeningPixels(nativeOpeningPixelSamples)
    if(!isR817)concatLines.push(`file '${finalPng.replace(/'/g, "'\\''")}'`)
    const concatFile = path.join(tempDir, 'concat.txt')
    fs.writeFileSync(concatFile, `${concatLines.join('\n')}\n`)

    runCommand(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error',
      ...(isR817
        ? ['-framerate','30','-start_number','0','-i',path.join(nativeFrameDir,'f%06d.png')]
        : ['-f', 'concat', '-safe', '0', '-i', concatFile]),
      '-i', narration.file,
      '-vf', filter,
      '-af', isR809
        ? `acompressor=threshold=0.1:ratio=2:attack=10:release=150,apad=pad_dur=${verified.durationSeconds},atrim=duration=${verified.durationSeconds},loudnorm=I=-14:TP=-1:LRA=9`
        : `apad=pad_dur=${verified.durationSeconds},atrim=duration=${verified.durationSeconds},loudnorm=I=-16:TP=-1.5:LRA=11`,
      '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'libx264', '-profile:v', 'baseline', '-level:v', '4.0',
      '-preset', 'slow', '-crf', '20', '-maxrate', '4M', '-bufsize', '8M',
      ...mobileAacEncodeArgs(),
      '-pix_fmt', 'yuv420p',
      ...(isR817?['-frames:v',String(verified.r818NativeFrames.frameCount)]:[]),
      '-t', String(verified.durationSeconds),
      '-movflags', '+faststart', '-map_metadata', '-1', '-metadata', 'creation_time=', '-y', output,
    ])

    if (isR817&&nativeFrameCount!==verified.r818NativeFrames.frameCount)
      throw Error('R8.18 native frame iteration count differs from validated sequence')
    const outputBytes = fs.readFileSync(output)
    if (!outputBytes.length) throw new Error('ffmpeg produced an empty MP4')
    let encodedMobileOpeningProof = null
    if (isR817) {
      const frameProbe=JSON.parse(runCommand(ffprobePath, [
        '-v','error','-select_streams','v:0','-count_frames',
        '-show_entries','stream=nb_read_frames,avg_frame_rate,width,height',
        '-of','json',output
      ]).stdout)
      const stream=frameProbe.streams?.[0]
      if(Number(stream?.nb_read_frames)!==verified.r818NativeFrames.frameCount||
         stream?.avg_frame_rate!=='30/1'||stream.width!==1080||stream.height!==1920)
        throw Error('R8.18 encoded MP4 has missing/duplicated frames or changed 30fps/1080p profile')
      // Source PNGs are BEFORE the ASS caption burn-in. The safety gate must
      // also inspect actual decoded H.264 output AFTER subtitles and final
      // compositing, or caption/art collisions would escape the first screen.
      const encodedFramePattern=path.join(tempDir,'final-caption-composited-%02d.png')
      runCommand(ffmpegPath,[
        '-hide_banner','-loglevel','error','-i',output,
        '-vf','fps=2','-frames:v','4','-start_number','0',encodedFramePattern
      ],{timeout:90000})
      const decodedOpeningFrames=Array.from({length:4},(_,i)=>
        path.join(tempDir,'final-caption-composited-'+String(i).padStart(2,'0')+'.png'))
      if(decodedOpeningFrames.some(file=>!fs.existsSync(file)))
        throw Error('MOBILE_OPENING_HOLD:FINAL_ENCODED_CAPTION_FRAMES_MISSING')
      const finalPixelGate=await assertNativeMobileOpeningPixels(
        decodedOpeningFrames.map(file=>fs.readFileSync(file)))
      encodedMobileOpeningProof={...finalPixelGate,
        exactMp4Sha256:sha256(outputBytes),
        inspectionScope:'FINAL_DECODED_MP4_AFTER_ASS_CAPTION_COMPOSITING',
        approvalGranted:false}
    }
    // Analyze the FINAL AAC/MP4 stream; filter intent is not loudness evidence.
    const r812Loudness = isR810 && verified.manifest.r812?.enabled === true
      ? assertR812Loudness(parseR812Loudness(runCommand(ffmpegPath, [
          '-hide_banner', '-nostats', '-i', output, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-'
        ]).stderr)) : null
    // Check the encoded MP4 itself. Avoid assuming -ar/-ac and a successful
    // encode imply an audible file on phones (Oct 12 playback regression).
    const encodedAudio = assertMobileAudioProbe(JSON.parse(runCommand(ffprobePath, [
      '-v', 'error', '-select_streams', 'a',
      '-show_entries', 'stream=codec_name,sample_rate,channels,channel_layout',
      '-of', 'json', output,
    ]).stdout))
    const decodedAudio = assertAudibleDecodedAudio(runCommand(ffmpegPath, [
      '-hide_banner', '-nostats', '-i', output, '-map', '0:a:0',
      '-af', 'volumedetect', '-f', 'null', '-',
    ]).stderr)
    let r817MotionProof = null
    let r817CaptionPixelProof = null
    let r817HookPixels = null
    if (isR817) {
      const raw = runCommand(ffmpegPath, [
        '-hide_banner','-v','error','-i',output,
        '-vf',`fps=5,${R817_MOTION_LIMITS.crop},scale=160:176:flags=bilinear,format=gray`,
        '-f','rawvideo','-pix_fmt','gray','-'
      ],{encoding:null,maxBuffer:24000000,timeout:120000}).stdout
      if (!Buffer.isBuffer(raw)) throw Error('R8.17 decoded motion evidence not a binary frame stream')
      r817MotionProof = assertR817FinalMotion(measureR817FinalMotion(raw, verified.timeline.scenes))
      const rgb = runCommand(ffmpegPath, [
        '-hide_banner','-v','error','-i',output,
        '-vf','fps=4,crop=840:300:120:1190,scale=210:75:flags=bilinear,format=rgb24',
        '-f','rawvideo','-pix_fmt','rgb24','-'
      ],{encoding:null,maxBuffer:24000000,timeout:120000}).stdout
      r817CaptionPixelProof = assertR817CaptionPixelQA(
        measureR817CaptionHighlightPixels(rgb,r817CaptionCues))
      const frameAt = second => runCommand(ffmpegPath, [
        '-hide_banner','-v','error','-ss',String(second),'-i',output,
        '-frames:v','1','-vf',`${R817_MOTION_LIMITS.crop},scale=160:176:flags=bilinear,format=gray`,
        '-f','rawvideo','-pix_fmt','gray','-'
      ],{encoding:null,maxBuffer:1000000,timeout:30000}).stdout
      const hookPixel = measureR817HookCenterChange(frameAt(.30),frameAt(2.70))
      r817HookPixels = {beforeSha256:hookPixel.beforeSha256,
        afterSha256:hookPixel.afterSha256,afterAtSeconds:2.70,
        outputSha256:sha256(outputBytes),pixelProof:hookPixel}
    }
    const receipt = {
      schemaVersion: verified.release === 'R8.05' ? '3.0.0' : '2.0.0',
      release: verified.release,
      renderer: verified.release === 'R8.05' ? 'vertical-video-mp4-v3-r805' : 'vertical-video-mp4-v2-r804',
      parentRenderer: verified.manifest.renderer,
      packId: verified.manifest.packId,
      sourceUrl: verified.sourceUrl,
      sourceContentHash: verified.sourceContentHash,
      parentManifestSha256: manifestSha256,
      ffmpegVersion: version,
      renderKey,
      profile: {
        width: 1080,
        height: 1920,
        fps: 30,
        durationSeconds: verified.durationSeconds,
        codec: 'libx264',
        codecProfile: 'baseline',
        h264Level: '4.0',
        pixelFormat: 'yuv420p',
        audio: true,
        audioCodec: 'aac',
        audioBitrate: '192k',
        audioSampleRate: encodedAudio.sampleRate,
        audioChannels: encodedAudio.channels,
        audioChannelLayout: encodedAudio.channelLayout,
        mobileAudioVerified: true,
        decodedAudio,
      },
      r810Governance: isR810 ? {
        governedPlanSha256: clean(verified.manifest.creativeR810?.governedPlanSha256),
        approvedSourceLedgerSha256: clean(verified.manifest.sourceLedger?.sha256),
        wordAlignmentReceiptSha256: r810Proof.alignment.receiptSha256,
        alignedCaptionSrtSha256,
        renderAssSha256: captionFileSha256,
        acousticWordAlignment: 'mfa-offline-reviewed',
      } : null,
      r809Captioning: isR809 ? {
        burnIn: true,
        authority: 'exact-governed-voice-script',
        cueTimingPrecision: isR810 ? 'local-acoustic-word-aligned' : 'voice-beat-bounded-phrase-estimate',
        captionsSrtSha256: clean(verified.manifest.captions?.sha256),
        renderAssSha256: captionFileSha256,
        canvasSafeArea: 'platform-intersection',
        style: r819Proof ? 'dark-cellular-organic-v1' : '2p5d-science-explainer-v1',
        audioProfile: 'voice-forward-minus14LUFS',
        exactMasterReview: 'pending',
      } : null,
      r812Audio: r812Loudness,
      r819Canonical: r819Proof ? {...r819Proof,exactMp4Sha256:sha256(outputBytes),
        layeredFrameInventorySha256:r819Layers.sha256,
        exactLayeredFrameCount:r819FrameProofs.length,
        allFramesPixelMatchedR818:r819FrameProofs.length===verified.r818NativeFrames.frameCount,
        layeredFrameProofLedgerSha256:sha256(Buffer.from(JSON.stringify(r819FrameProofs))),
        finalMp4PixelAndCraftApproval:'PENDING_INDEPENDENT_REVIEW',publicationApproved:false} : null,
      r817FirstPass: verified.r817Proof ? { ...verified.r817Proof, intentSha256: clean(verified.manifest.r817FirstPass.sha256), status: 'encoded-review-only', exactMasterVisualApproval: false, progressiveWords:r817CaptionProof, finalMp4Motion:r817MotionProof,captionPixelProof:r817CaptionPixelProof,encodedMobileOpeningProof,hookPixelProof:r817HookPixels,rendererTelemetry:verified.r818TelemetryProof,exactMp4Sha256:sha256(outputBytes),nativeSequenceFrameCount:verified.r818NativeFrames?.frameCount||null } : null,
      creativeQuality: verified.release === 'R8.05' ? {
        semanticBeatMapSha256: clean(verified.manifest.creativeQuality?.semanticBeatMapSha256),
        creativeBriefSha256: clean(verified.manifest.r805Bindings?.creativeBrief?.sha256),
        semanticBeatTimelineSha256: clean(verified.manifest.r805Bindings?.semanticBeatTimeline?.sha256),
        exactMasterCohesion: 'pending',
        internalMotionRendered: true,
        motionCueMethod: 'voice-duration-proportional-text-anchor',
      } : null,
      localNarration: {
        engine: clean(narration.narrationReceipt.engine?.name),
        model: clean(narration.narrationReceipt.engine?.model),
        engineKind: clean(narration.narrationReceipt.engine?.kind),
        voice: clean(narration.narrationReceipt.engine?.voice),
        scriptSha256: narration.scriptSha256,
        audioSha256: narration.audioSha256,
        narrationReceiptSha256: narration.narrationReceiptSha256,
        voiceQaSha256: narration.voiceQaSha256,
        naturalPresence: clean(narration.voiceQa.qa?.naturalPresence),
        pronunciation: clean(narration.voiceQa.qa?.pronunciation),
        meteredCreditsRequired: narration.narrationReceipt.meteredCreditsRequired,
      },
      output: { file: path.basename(output), sha256: sha256(outputBytes), bytes: outputBytes.length },
    }
    fs.writeFileSync(`${output}.receipt.json`, `${JSON.stringify(receipt, null, 2)}\n`)
    return receipt
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}
