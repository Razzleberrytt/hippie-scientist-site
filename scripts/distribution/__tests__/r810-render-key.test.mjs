import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { buildMp4RenderKey } from '../render-vertical-video-mp4.mjs'

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')
const inputs = { manifestSha256: 'a'.repeat(64), ffmpegVersionLine: 'ffmpeg version pinned',
  narrationSha256: 'b'.repeat(64), voiceQaSha256: 'c'.repeat(64),
  release: 'R8.05', durationSeconds: 35.25 }

describe('R8.10 MP4 cache provenance without legacy regression', () => {
  it('invalidates old R8.05/R8.09 render cache after changing delivery encode profile', () => {
    const raw = `vertical-video-mp4-v3-r805\n${inputs.manifestSha256}\n${inputs.ffmpegVersionLine}\n${inputs.narrationSha256}\n${inputs.voiceQaSha256}\n1080x1920\n30fps\n35.2500s\nlibx264\naac192k\nyuv420p\n`
    const modern = raw.replace('libx264', 'libx264-baseline-level4-crf20-max4M').replace('aac192k', 'aac192k-44k1-stereo')
    expect(buildMp4RenderKey(inputs)).toBe(sha256(modern))
    expect(buildMp4RenderKey(inputs)).not.toBe(sha256(raw))
  })
  it('requires real SHA-256 lineage for all R8.10 final-caption inputs', () => {
    expect(() => buildMp4RenderKey({ ...inputs, creativeMethodRelease: 'R8.10' })).toThrow(/exact audio alignment/)
  })
  it('invalidates the MP4 key when word alignment, final captions, or render code change', () => {
    const base = { ...inputs, creativeMethodRelease: 'R8.10',
      alignmentReceiptSha256: 'd'.repeat(64), rendererSourceSha256: 'e'.repeat(64), alignedCaptionSrtSha256: 'f'.repeat(64) }
    const current = buildMp4RenderKey(base)
    expect(current).not.toBe(buildMp4RenderKey(inputs))
    expect(buildMp4RenderKey({ ...base, alignmentReceiptSha256: '1'.repeat(64) })).not.toBe(current)
    expect(buildMp4RenderKey({ ...base, alignedCaptionSrtSha256: '2'.repeat(64) })).not.toBe(current)
    expect(buildMp4RenderKey({ ...base, rendererSourceSha256: '3'.repeat(64) })).not.toBe(current)
  })
})
