#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

function fail(message) {
  console.error('[ths-local-render] ' + message)
  process.exit(1)
}

function assertExecutable(name) {
  const result = spawnSync(name, ['-version'], { encoding: 'utf8' })
  if (result.error || result.status !== 0) fail(name + ' is required and was not executable')
}

function localFile(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(label + ' must be a local file path')
  if (/^https?:\/\//i.test(value)) fail(label + ' may not be a remote URL under R8.04')
  const resolved = path.resolve(value)
  if (!fs.existsSync(resolved)) fail(label + ' not found: ' + resolved)
  return resolved
}

function probe(file) {
  const result = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=index,codec_type,width,height,r_frame_rate',
    '-of', 'json',
    file,
  ], { encoding: 'utf8' })
  if (result.status !== 0) fail('ffprobe failed for ' + file + ': ' + result.stderr)
  return JSON.parse(result.stdout)
}

const workOrderPath = process.argv[2]
if (!workOrderPath) fail('usage: node render_local.mjs <work-order.json>')

assertExecutable('ffmpeg')
assertExecutable('ffprobe')

const workOrder = JSON.parse(fs.readFileSync(path.resolve(workOrderPath), 'utf8'))
if (workOrder.release !== 'R8.04') fail('work order must pin release R8.04')
if (workOrder.provider || workOrder.remote_media || workOrder.premium_service) {
  fail('provider/remote/premium execution fields are forbidden in the local render path')
}

const width = Number(workOrder.width ?? 1080)
const height = Number(workOrder.height ?? 1920)
const fps = Number(workOrder.fps ?? 30)
if (width !== 1080 || height !== 1920) fail('TikTok canonical master must be 1080x1920')
if (!Number.isFinite(fps) || fps < 24 || fps > 60) fail('fps must be between 24 and 60')

const scenes = Array.isArray(workOrder.scenes) ? workOrder.scenes : []
if (!scenes.length) fail('at least one scene is required')

const narration = localFile(workOrder.narration, 'narration')
const output = path.resolve(workOrder.output ?? 'artifacts/social/final.mp4')
fs.mkdirSync(path.dirname(output), { recursive: true })

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-r804-'))
const normalized = []

try {
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    const src = localFile(scene.file, 'scene[' + i + '].file')
    const duration = Number(scene.duration_seconds)
    if (!Number.isFinite(duration) || duration <= 0) fail('scene[' + i + '] duration_seconds must be > 0')

    const info = probe(src)
    const hasVideo = (info.streams ?? []).some((s) => s.codec_type === 'video')
    if (!hasVideo) fail('scene[' + i + '] has no visual stream')

    const ext = path.extname(src).toLowerCase()
    const out = path.join(tmp, 'scene-' + String(i).padStart(3, '0') + '.mp4')
    const image = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext)

    const args = ['-y', '-hide_banner', '-loglevel', 'error']
    if (image) args.push('-loop', '1', '-t', String(duration), '-i', src)
    else args.push('-i', src, '-t', String(duration))

    args.push(
      '-vf',
      `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,fps=${fps},format=yuv420p`,
      '-an',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      out,
    )

    const rendered = spawnSync('ffmpeg', args, { encoding: 'utf8' })
    if (rendered.status !== 0) fail('scene normalization failed: ' + rendered.stderr)
    normalized.push(out)
  }

  const concatFile = path.join(tmp, 'concat.txt')
  fs.writeFileSync(concatFile, normalized.map((p) => `file '${p.replaceAll("'", "'\\''")}'`).join('\n') + '\n')

  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', concatFile,
    '-i', narration,
    '-map', '0:v:0', '-map', '1:a:0',
    '-shortest',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-ar', '48000',
    '-movflags', '+faststart',
    output,
  ]

  const result = spawnSync('ffmpeg', args, { encoding: 'utf8' })
  if (result.status !== 0) fail('final local composition failed: ' + result.stderr)

  console.log(output)
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}
