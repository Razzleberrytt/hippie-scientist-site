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
  const narrationScript = {
    schemaVersion: 'ths-local-narration-script-v1',
    release: 'R8.04',
    packId: 'pack-1',
    sourceContentHash,
    sourceUrl,
    durationSeconds: 30,
    sampleRate: 24000,
    scenes: [{ role: 'hook', start: 0, end: 30, text: 'Ashwagandha', factualAuthority: 'canonical-input' }],
  }
  const narrationScriptBytes = `${JSON.stringify(narrationScript, null, 2)}\n`
  fs.writeFileSync(path.join(dir, 'narration-script.json'), narrationScriptBytes)
  const manifest = {
    schemaVersion: '1.0.0', packId: 'pack-1', sourceContentHash, sourceUrl, renderer: 'vertical-video-package-v1', durationSeconds: 30,
    timeline: { file: 'video-timeline.json', sha256: sha256(timelineBytes) },
    captions: { file: 'captions.srt', sha256: sha256(captions), format: 'srt', lossless: true },
    narrationScript: {
      file: 'narration-script.json',
      sha256: sha256(narrationScriptBytes),
      schemaVersion: 'ths-local-narration-script-v1',
      localVoiceRequired: true,
      premiumProviderFallbackAllowed: false,
    },
    assets: [asset],
  }
  fs.writeFileSync(path.join(dir, 'video-asset-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  const audioBytes = Buffer.from('RIFF-local-narration-fixture')
  fs.writeFileSync(path.join(dir, 'narration.wav'), audioBytes)
  const narrationReceipt = {
    schemaVersion: 'ths-local-narration-receipt-v1',
    engine: { name: 'kokoro', model: 'Kokoro-82M', packageVersion: 'test', kind: 'local-open-source', language: 'a', voice: 'am_michael' },
    accountRequired: false,
    apiKeyRequired: false,
    meteredCreditsRequired: false,
    source: { scriptFile: 'narration-script.json', scriptSha256: sha256(narrationScriptBytes), packId: 'pack-1' },
    profile: { sampleRate: 24000, channels: 1, durationSeconds: 30, format: 'wav-pcm16' },
    output: { file: 'narration.wav', sha256: sha256(audioBytes), bytes: audioBytes.length },
  }
  const narrationReceiptBytes = Buffer.from(`${JSON.stringify(narrationReceipt, null, 2)}\n`)
  fs.writeFileSync(path.join(dir, 'narration.wav.receipt.json'), narrationReceiptBytes)
  const voiceQa = {
    schemaVersion: 'ths-voice-qa-receipt-v1',
    release: 'R8.04',
    reviewer: 'test',
    artifact: { file: 'narration.wav', sha256: sha256(audioBytes), bytes: audioBytes.length },
    narrationReceiptSha256: sha256(narrationReceiptBytes),
    engine: { name: 'kokoro', model: 'Kokoro-82M', kind: 'local-open-source', voice: 'am_michael' },
    qa: { naturalPresence: 'pass', pronunciation: 'pass', exactArtifactReviewed: true },
  }
  fs.writeFileSync(path.join(dir, 'voice-qa.receipt.json'), `${JSON.stringify(voiceQa, null, 2)}\n`)

  // The stand-in behaviour lives in one Node script so both platforms exercise
  // identical logic; only the wrapper that makes it executable differs. A bare
  // .sh cannot be spawned on Windows (EFTYPE), which is why this test failed
  // there while passing in CI.
  const fakeLogic = path.join(dir, 'fake-ffmpeg.mjs')
  fs.writeFileSync(fakeLogic, [
    "import fs from 'node:fs'",
    'const args = process.argv.slice(2)',
    "if (args[0] === '-version') {",
    "  console.log('ffmpeg version test-1.0')",
    '  process.exit(0)',
    '}',
    "fs.writeFileSync(args[args.length - 1], 'mp4-fixture-bytes')",
    '',
  ].join('\n'))

  const isWindows = process.platform === 'win32'
  const fakeFfmpeg = path.join(dir, isWindows ? 'fake-ffmpeg.cmd' : 'fake-ffmpeg.sh')
  if (isWindows) {
    fs.writeFileSync(fakeFfmpeg, ['@echo off', `"${process.execPath}" "${fakeLogic}" %*`, ''].join('\r\n'))
  } else {
    fs.writeFileSync(fakeFfmpeg, ['#!/bin/sh', `exec "${process.execPath}" "${fakeLogic}" "$@"`, ''].join('\n'))
    fs.chmodSync(fakeFfmpeg, 0o755)
  }
  return { dir, fakeFfmpeg, sourceUrl, sourceContentHash }
}

describe('vertical video MP4 renderer', () => {
  it('binds cache identity to both parent manifest and encoder version', () => {
    const common = { narrationSha256: 'c'.repeat(64), voiceQaSha256: 'd'.repeat(64) }
    const a = buildMp4RenderKey({ manifestSha256: 'a'.repeat(64), ffmpegVersionLine: 'ffmpeg version 7.0', ...common })
    const b = buildMp4RenderKey({ manifestSha256: 'a'.repeat(64), ffmpegVersionLine: 'ffmpeg version 7.1', ...common })
    const c = buildMp4RenderKey({ manifestSha256: 'b'.repeat(64), ffmpegVersionLine: 'ffmpeg version 7.0', ...common })
    expect(a).toMatch(/^[a-f0-9]{64}$/)
    expect(a).not.toBe(b)
    expect(a).not.toBe(c)
  })

  it('renders an MP4 receipt only after verifying the governed parent package', async () => {
    const { dir, fakeFfmpeg, sourceUrl, sourceContentHash } = fixture()
    const output = path.join(dir, 'vertical-video.mp4')
    const receipt = await renderVerticalVideoMp4({ packageDir: dir, outputFile: output, ffmpegPath: fakeFfmpeg })
    expect(fs.readFileSync(output, 'utf8')).toBe('mp4-fixture-bytes')
    expect(receipt.renderer).toBe('vertical-video-mp4-v2-r804')
    expect(receipt.parentRenderer).toBe('vertical-video-package-v1')
    expect(receipt.sourceUrl).toBe(sourceUrl)
    expect(receipt.sourceContentHash).toBe(sourceContentHash)
    expect(receipt.ffmpegVersion).toBe('ffmpeg version test-1.0')
    expect(receipt.profile).toMatchObject({ width: 1080, height: 1920, fps: 30, durationSeconds: 30, codec: 'libx264', audio: true, audioCodec: 'aac' })
    expect(receipt.localNarration).toMatchObject({
      engine: 'kokoro',
      engineKind: 'local-open-source',
      naturalPresence: 'pass',
      pronunciation: 'pass',
      meteredCreditsRequired: false,
    })
    expect(receipt.output.sha256).toBe(sha256('mp4-fixture-bytes'))
    expect(readReceipt(`${output}.receipt.json`)).toEqual(receipt)
  })

  it('fails closed rather than emitting a silent MP4 when voice QA is missing', async () => {
    const { dir, fakeFfmpeg } = fixture()
    fs.rmSync(path.join(dir, 'voice-qa.receipt.json'))
    await expect(renderVerticalVideoMp4({ packageDir: dir, outputFile: path.join(dir, 'silent.mp4'), ffmpegPath: fakeFfmpeg }))
      .rejects.toThrow(/missing voice-qa\.receipt\.json/i)
  })

  it('fails closed when exact narration has not passed Natural Presence', async () => {
    const { dir, fakeFfmpeg } = fixture()
    const qaPath = path.join(dir, 'voice-qa.receipt.json')
    const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'))
    qa.qa.naturalPresence = 'fail'
    fs.writeFileSync(qaPath, `${JSON.stringify(qa, null, 2)}\n`)
    await expect(renderVerticalVideoMp4({ packageDir: dir, outputFile: path.join(dir, 'robotic.mp4'), ffmpegPath: fakeFfmpeg }))
      .rejects.toThrow(/Natural Presence and pronunciation must pass/i)
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

  it('rejects manifest duration drift before ffmpeg can encode a false 30-second receipt', async () => {
    const { dir, fakeFfmpeg } = fixture()
    const manifestPath = path.join(dir, 'video-asset-manifest.json')
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    manifest.assets[0].duration = 1
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    await expect(renderVerticalVideoMp4({ packageDir: dir, outputFile: path.join(dir, 'bad.mp4'), ffmpegPath: fakeFfmpeg }))
      .rejects.toThrow('timeline/manifest timing mismatch')
  })
})

function readReceipt(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}
