import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'

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
    if (!clean(timeline.semanticBeatMapSha256) || clean(timeline.semanticBeatMapSha256) !== clean(manifest.creativeQuality?.semanticBeatMapSha256)) {
      throw new Error('R8.05 video timeline is not bound to the approved semantic beat map')
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

  return { manifest, manifestBytes, timeline, sourceUrl, sourceContentHash, assets, release, durationSeconds }
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

export function buildMp4RenderKey({ manifestSha256, ffmpegVersionLine, narrationSha256, voiceQaSha256, release = 'R8.04', durationSeconds = 30 }) {
  for (const [label, value] of Object.entries({ manifestSha256, ffmpegVersionLine, narrationSha256, voiceQaSha256 })) {
    if (!clean(value)) throw new Error(`${label} is required for MP4 render identity`)
  }
  const renderer = release === 'R8.05' ? 'vertical-video-mp4-v3-r805' : 'vertical-video-mp4-v2-r804'
  return sha256(`${renderer}\n${clean(manifestSha256)}\n${clean(ffmpegVersionLine)}\n${clean(narrationSha256)}\n${clean(voiceQaSha256)}\n1080x1920\n30fps\n${Number(durationSeconds).toFixed(4)}s\nlibx264\naac192k\nyuv420p\n`)
}

export async function renderVerticalVideoMp4({ packageDir, outputFile, ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg' }) {
  const inputDir = path.resolve(packageDir)
  const output = path.resolve(outputFile)
  if (path.extname(output).toLowerCase() !== '.mp4') throw new Error('outputFile must use .mp4 extension')
  fs.mkdirSync(path.dirname(output), { recursive: true })

  const verified = verifyPackage(inputDir)
  const narration = verifyLocalNarration(inputDir, verified.manifest)
  const version = ffmpegVersion(ffmpegPath)
  const manifestSha256 = sha256(verified.manifestBytes)
  const renderKey = buildMp4RenderKey({
    manifestSha256,
    ffmpegVersionLine: version,
    narrationSha256: narration.audioSha256,
    voiceQaSha256: narration.voiceQaSha256,
    release: verified.release,
    durationSeconds: verified.durationSeconds,
  })
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-video-mp4-'))

  try {
    const concatLines = []
    let finalPng = null
    for (let index = 0; index < verified.assets.length; index += 1) {
      const asset = verified.assets[index]
      const { bytes } = verifyScene({ packageDir: inputDir, asset, sourceUrl: verified.sourceUrl, sourceContentHash: verified.sourceContentHash })
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
    concatLines.push(`file '${finalPng.replace(/'/g, "'\\''")}'`)
    const concatFile = path.join(tempDir, 'concat.txt')
    fs.writeFileSync(concatFile, `${concatLines.join('\n')}\n`)

    runCommand(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error',
      '-f', 'concat', '-safe', '0', '-i', concatFile,
      '-i', narration.file,
      '-vf', 'fps=30,scale=1080:1920:flags=lanczos',
      '-af', `loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=${verified.durationSeconds},atrim=duration=${verified.durationSeconds}`,
      '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
      '-c:a', 'aac', '-b:a', '192k',
      '-pix_fmt', 'yuv420p', '-t', String(verified.durationSeconds),
      '-movflags', '+faststart', '-map_metadata', '-1', '-metadata', 'creation_time=', '-y', output,
    ])

    const outputBytes = fs.readFileSync(output)
    if (!outputBytes.length) throw new Error('ffmpeg produced an empty MP4')
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
        pixelFormat: 'yuv420p',
        audio: true,
        audioCodec: 'aac',
        audioBitrate: '192k',
      },
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
