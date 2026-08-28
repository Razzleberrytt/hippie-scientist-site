import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const clean = (value) => String(value ?? '').trim()

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

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
  if (Number(metadata.start) !== Number(asset.start) || Number(metadata.end) !== Number(asset.end)) {
    throw new Error(`video scene timing mismatch: ${asset.file}`)
  }
  return { file, bytes }
}

function verifyPackage(packageDir) {
  const manifestPath = path.join(packageDir, 'video-asset-manifest.json')
  const manifestBytes = fs.readFileSync(manifestPath)
  const manifest = JSON.parse(manifestBytes.toString('utf8'))
  if (clean(manifest.renderer) !== 'vertical-video-package-v1') throw new Error('MP4 renderer requires vertical-video-package-v1 input')
  if (Number(manifest.durationSeconds) !== 30) throw new Error('MP4 renderer requires an exact 30-second parent package')
  const sourceUrl = clean(manifest.sourceUrl)
  const sourceContentHash = clean(manifest.sourceContentHash)
  if (!sourceUrl || !sourceContentHash) throw new Error('parent package source provenance is required')

  const timelineFile = assertCanonicalChild(packageDir, manifest.timeline?.file, /^video-timeline\.json$/)
  const timelineBytes = fs.readFileSync(timelineFile)
  if (sha256(timelineBytes) !== clean(manifest.timeline?.sha256)) throw new Error('video timeline hash mismatch')
  const timeline = JSON.parse(timelineBytes.toString('utf8'))
  if (clean(timeline.sourceUrl) !== sourceUrl || clean(timeline.sourceContentHash) !== sourceContentHash) {
    throw new Error('timeline provenance does not match parent manifest')
  }
  if (Number(timeline.durationSeconds) !== 30 || Number(timeline.width) !== 1080 || Number(timeline.height) !== 1920 || Number(timeline.fps) !== 30) {
    throw new Error('timeline does not match canonical 1080x1920@30fps 30-second profile')
  }

  const assets = Array.isArray(manifest.assets) ? manifest.assets : []
  if (!assets.length || assets.length !== timeline.scenes?.length) throw new Error('parent video package scene inventory is incomplete')
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index]
    const scene = timeline.scenes[index]
    if (clean(asset.file) !== clean(scene.file) || clean(asset.sha256) !== clean(scene.sha256)) throw new Error(`timeline/manifest scene mismatch at index ${index}`)
    if (Number(asset.start) !== Number(scene.start) || Number(asset.end) !== Number(scene.end)) throw new Error(`timeline/manifest timing mismatch at index ${index}`)
  }

  return { manifest, manifestBytes, timeline, sourceUrl, sourceContentHash, assets }
}

function runCommand(executable, args, options = {}) {
  const result = spawnSync(executable, args, { encoding: 'utf8', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${executable} failed (${result.status}): ${(result.stderr || result.stdout || '').slice(0, 2000)}`)
  return result
}

function ffmpegVersion(ffmpegPath) {
  const result = runCommand(ffmpegPath, ['-version'])
  return clean(String(result.stdout || '').split('\n')[0])
}

export function buildMp4RenderKey({ manifestSha256, ffmpegVersionLine }) {
  if (!clean(manifestSha256) || !clean(ffmpegVersionLine)) throw new Error('manifest hash and ffmpeg version are required for MP4 render identity')
  return sha256(`vertical-video-mp4-v1\n${clean(manifestSha256)}\n${clean(ffmpegVersionLine)}\n1080x1920\n30fps\nlibx264\nyuv420p\n`)
}

export async function renderVerticalVideoMp4({ packageDir, outputFile, ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg' }) {
  const inputDir = path.resolve(packageDir)
  const output = path.resolve(outputFile)
  if (path.extname(output).toLowerCase() !== '.mp4') throw new Error('outputFile must use .mp4 extension')
  fs.mkdirSync(path.dirname(output), { recursive: true })

  const verified = verifyPackage(inputDir)
  const version = ffmpegVersion(ffmpegPath)
  const manifestSha256 = sha256(verified.manifestBytes)
  const renderKey = buildMp4RenderKey({ manifestSha256, ffmpegVersionLine: version })
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-video-mp4-'))

  try {
    const concatLines = []
    for (let index = 0; index < verified.assets.length; index += 1) {
      const asset = verified.assets[index]
      const { bytes } = verifyScene({ packageDir: inputDir, asset, sourceUrl: verified.sourceUrl, sourceContentHash: verified.sourceContentHash })
      const pngFile = path.join(tempDir, `scene-${String(index + 1).padStart(2, '0')}.png`)
      await sharp(bytes).png({ compressionLevel: 9, adaptiveFiltering: false }).toFile(pngFile)
      concatLines.push(`file '${pngFile.replace(/'/g, "'\\''")}'`)
      concatLines.push(`duration ${Number(asset.duration).toFixed(3)}`)
    }
    const finalPng = path.join(tempDir, `scene-${String(verified.assets.length).padStart(2, '0')}.png`)
    concatLines.push(`file '${finalPng.replace(/'/g, "'\\''")}'`)
    const concatFile = path.join(tempDir, 'concat.txt')
    fs.writeFileSync(concatFile, `${concatLines.join('\n')}\n`)

    runCommand(ffmpegPath, [
      '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', concatFile,
      '-vf', 'fps=30,scale=1080:1920:flags=lanczos', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-map_metadata', '-1', '-metadata', 'creation_time=', '-y', output,
    ])

    const outputBytes = fs.readFileSync(output)
    if (!outputBytes.length) throw new Error('ffmpeg produced an empty MP4')
    const receipt = {
      schemaVersion: '1.0.0',
      renderer: 'vertical-video-mp4-v1',
      parentRenderer: verified.manifest.renderer,
      packId: verified.manifest.packId,
      sourceUrl: verified.sourceUrl,
      sourceContentHash: verified.sourceContentHash,
      parentManifestSha256: manifestSha256,
      ffmpegVersion: version,
      renderKey,
      profile: { width: 1080, height: 1920, fps: 30, durationSeconds: 30, codec: 'libx264', pixelFormat: 'yuv420p', audio: false },
      output: { file: path.basename(output), sha256: sha256(outputBytes), bytes: outputBytes.length },
    }
    fs.writeFileSync(`${output}.receipt.json`, `${JSON.stringify(receipt, null, 2)}\n`)
    return receipt
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}
