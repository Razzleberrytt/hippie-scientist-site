import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildMp4RenderKey, renderVerticalVideoMp4 } from '../render-vertical-video-mp4.mjs'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const cleanup = []
afterEach(() => {
  while (cleanup.length) fs.rmSync(cleanup.pop(), { recursive: true, force: true })
})

function fixture({ embeddedSourceUrl = 'https://thehippiescientist.net/herbs/ashwagandha/' } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-mp4-test-'))
  cleanup.push(dir)
  const sourceUrl = 'https://thehippiescientist.net/herbs/ashwagandha/'
  const sourceContentHash = 'a'.repeat(64)
  const metadata = JSON.stringify({
    sourceUrl: embeddedSourceUrl,
    contentHash: sourceContentHash,
    factualAuthority: 'canonical-input',
    renderer: 'vertical-video-package-v1',
    role: 'hook',
    start: 0,
    end: 30,
  }).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#fff"/><metadata>${metadata}</metadata></svg>\n`
  fs.writeFileSync(path.join(dir, 'video-scene-01.svg'), svg)
  const asset = {
    id: 'video-scene-1', type: 'vertical-video-scene', format: 'svg', file: 'video-scene-01.svg', sha256: sha256(svg),
    width: 1080, height: 1920, start: 0, end: 30, duration: 30, role: 'hook', factualAuthority: 'canonical-input', sourceContentHash, sourceUrl,
  }
  const timeline = {
    schemaVersion: '1.0.0', renderer: 'vertical-video-package-v1', packId: 'pack-1', sourceContentHash, sourceUrl,
    width: 1080, height: 1920, fps: 30, durationSeconds: 30,
    scenes: [{ id: asset.id, file: asset.file, sha256: asset.sha256, start: 0, end: 30, duration: 30, role: 'hook', factualAuthority: 'canonical-input' }],
  }
  const timelineBytes = `${JSON.stringify(timeline, null, 2)}\n`
  fs.writeFileSync(path.join(dir, 'video-timeline.json'), timelineBytes)
  const captions = '1\n00:00:00,000 --> 00:00:30,000\nAshwagandha\n'
  fs.writeFileSync(path.join(dir, 'captions.srt'), captions)
  const manifest = {
    schemaVersion: '1.0.0', packId: 'pack-1', sourceContentHash, sourceUrl, renderer: 'vertical-video-package-v1', durationSeconds: 30,
    timeline: { file: 'video-timeline.json', sha256: sha256(timelineBytes) },
    captions: { file: 'captions.srt', sha256: sha256(captions), format: 'srt', lossless: true },
    assets: [asset],
  }
  fs.writeFileSync(path.join(dir, 'video-asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const fakeFfmpeg = path.join(dir, 'fake-ffmpeg.sh')
  fs.writeFileSync(fakeFfmpeg, `#!/bin/sh\nif [ "$1" = "-version" ]; then\n  echo "ffmpeg version test-1.0"\n  exit 0\nfi\nout=""\nfor arg in "$@"; do out="$arg"; done\nprintf 'mp4-fixture-bytes' > "$out"\n`)
  fs.chmodSync(fakeFfmpeg, 0o755)
  return { dir, fakeFfmpeg, sourceUrl, sourceContentHash }
}

describe('vertical video MP4 renderer', () => {
  it('binds cache identity to both parent manifest and encoder version', () => {
    const a = buildMp4RenderKey({ manifestSha256: 'a'.repeat(64), ffmpegVersionLine: 'ffmpeg version 7.0' })
    const b = buildMp4RenderKey({ manifestSha256: 'a'.repeat(64), ffmpegVersionLine: 'ffmpeg version 7.1' })
    const c = buildMp4RenderKey({ manifestSha256: 'b'.repeat(64), ffmpegVersionLine: 'ffmpeg version 7.0' })
    expect(a).toMatch(/^[a-f0-9]{64}$/)
    expect(a).not.toBe(b)
    expect(a).not.toBe(c)
  })

  it('renders an MP4 receipt only after verifying the governed parent package', async () => {
    const { dir, fakeFfmpeg, sourceUrl, sourceContentHash } = fixture()
    const output = path.join(dir, 'vertical-video.mp4')
    const receipt = await renderVerticalVideoMp4({ packageDir: dir, outputFile: output, ffmpegPath: fakeFfmpeg })
    expect(fs.readFileSync(output, 'utf8')).toBe('mp4-fixture-bytes')
    expect(receipt.renderer).toBe('vertical-video-mp4-v1')
    expect(receipt.parentRenderer).toBe('vertical-video-package-v1')
    expect(receipt.sourceUrl).toBe(sourceUrl)
    expect(receipt.sourceContentHash).toBe(sourceContentHash)
    expect(receipt.ffmpegVersion).toBe('ffmpeg version test-1.0')
    expect(receipt.profile).toMatchObject({ width: 1080, height: 1920, fps: 30, durationSeconds: 30, codec: 'libx264', audio: false })
    expect(receipt.output.sha256).toBe(sha256('mp4-fixture-bytes'))
    expect(readReceipt(`${output}.receipt.json`)).toEqual(receipt)
  })

  it('fails closed when embedded scene provenance disagrees with the hashed manifest', async () => {
    const { dir, fakeFfmpeg } = fixture({ embeddedSourceUrl: 'https://example.com/substituted/' })
    await expect(renderVerticalVideoMp4({ packageDir: dir, outputFile: path.join(dir, 'bad.mp4'), ffmpegPath: fakeFfmpeg }))
      .rejects.toThrow('video scene source URL mismatch')
  })

  it('rejects path traversal before reading a scene', async () => {
    const { dir, fakeFfmpeg } = fixture()
    const manifestPath = path.join(dir, 'video-asset-manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    manifest.assets[0].file = '../video-scene-01.svg'
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    await expect(renderVerticalVideoMp4({ packageDir: dir, outputFile: path.join(dir, 'bad.mp4'), ffmpegPath: fakeFfmpeg }))
      .rejects.toThrow('timeline/manifest scene mismatch')
  })
})

function readReceipt(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
