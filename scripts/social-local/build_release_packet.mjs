#!/usr/bin/env node
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

function fail(message) {
  console.error('[ths-release-packet] ' + message)
  process.exit(1)
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]
    const value = argv[i + 1]
    if (!key?.startsWith('--') || value == null) fail('arguments must be --key value pairs')
    out[key.slice(2)] = value
  }
  return out
}

function digest(file) {
  const h = crypto.createHash('sha256')
  h.update(fs.readFileSync(file))
  return h.digest('hex')
}

function mustFile(value, label) {
  if (!value) fail('--' + label + ' is required')
  if (/^https?:\/\//i.test(value)) fail(label + ' must be a local file')
  const p = path.resolve(value)
  if (!fs.existsSync(p)) fail(label + ' not found: ' + p)
  return p
}

function probe(file) {
  const r = spawnSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,sample_rate,channels',
    '-of', 'json',
    file,
  ], { encoding: 'utf8' })
  if (r.error || r.status !== 0) fail('ffprobe failed: ' + (r.stderr || r.error))
  return JSON.parse(r.stdout)
}

const args = parseArgs(process.argv.slice(2))
const video = mustFile(args.video, 'video')
const cover = mustFile(args.cover, 'cover')
const caption = mustFile(args.caption, 'caption')
const evidence = mustFile(args.evidence, 'evidence')
const out = path.resolve(args.out ?? 'release.json')

const media = probe(video)
const videoStream = (media.streams ?? []).find((s) => s.codec_type === 'video')
const audioStream = (media.streams ?? []).find((s) => s.codec_type === 'audio')
if (!videoStream) fail('final artifact has no video stream')
if (!audioStream) fail('final artifact has no audio stream; silent-by-failure is blocked')
if (videoStream.width !== 1080 || videoStream.height !== 1920) fail('final artifact must be 1080x1920')
if (videoStream.codec_name !== 'h264') fail('final video codec must be h264')

const packet = {
  schema: 'ths.social.release.v1',
  release: 'R8.04',
  transport: 'manual_native_upload',
  created_at: new Date().toISOString(),
  artifact: {
    path: video,
    sha256: digest(video),
    probe: media,
  },
  cover: { path: cover, sha256: digest(cover) },
  caption: { path: caption, sha256: digest(caption) },
  evidence: { path: evidence, sha256: digest(evidence) },
  provider_dependency: false,
  paid_credit_dependency: false,
  natural_presence_receipt_required: true,
  perceptual_qa_required: true,
}

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(packet, null, 2) + '\n')
console.log(out)
