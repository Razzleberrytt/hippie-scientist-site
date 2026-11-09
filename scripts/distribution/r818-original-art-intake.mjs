import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'

// Reuse rich, already-authored 1080x1920 PNG compositions without an SVG redraw.
// This is an R8.18 native-FRAME importer only: no semantic object instrumentation,
// release approval, acoustic alignment or R8.19 separated trust/art attestation.
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
const hex = value => /^[a-f0-9]{64}$/.test(String(value ?? ''))
const sig = Buffer.from('89504e470d0a1a0a', 'hex')
const id = value => /^[A-Za-z0-9_-]{1,70}$/.test(String(value ?? ''))
const safeName = value => /^[A-Za-z0-9_.-]{1,100}\.png$/.test(String(value ?? ''))
const fail = message => { throw Error('R8.18 original-art import HOLD: ' + message) }

export function validateR818OriginalArtInputs(sourceRoot, plan) {
  const root = path.resolve(sourceRoot)
  if (plan?.schemaVersion !== 'ths-r818-original-art-input-v1' ||
      plan.publicationApproved === true || plan.mayPublish === true ||
      !hex(plan.reviewedClaimLedgerSha256) || !hex(plan.narrationSha256) ||
      !/^https:\/\//.test(String(plan.sourceUrl ?? '')) ||
      !Array.isArray(plan.claims) || !plan.claims.length ||
      !Array.isArray(plan.beats) || !plan.beats.length || plan.beats.length > 40) {
    fail('requires source/voice ledger and explicitly review-only inputs')
  }
  const claims = new Map()
  for (const claim of plan.claims) {
    if (!id(claim.id) || !hex(claim.verifiedSourceSha256) || claims.has(claim.id)) fail('missing or duplicate reviewed-claim identity')
    claims.set(claim.id, claim)
  }
  const used = new Set()
  let frame = 0
  const beats = plan.beats.map(beat => {
    if (!id(beat.id) || used.has(beat.id) || !safeName(beat.image) ||
        !hex(beat.sha256) || !claims.has(beat.claimId) ||
        !String(beat.factualAuthority ?? '').trim()) fail('invalid beat, art, or claim identity')
    used.add(beat.id)
    const file = path.resolve(root, beat.image)
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) ||
        !fs.statSync(file).isFile() || !fs.realpathSync(file).startsWith(root + path.sep)) fail('source art outside trusted root or missing')
    const bytes = fs.readFileSync(file)
    if (bytes.length < 100 || bytes.length > 16_000_000 ||
        !bytes.subarray(0, 8).equals(sig) ||
        bytes.readUInt32BE(16) !== 1080 || bytes.readUInt32BE(20) !== 1920 ||
        sha(bytes) !== beat.sha256) fail('original PNG pixels/dimensions/SHA differ from approved input')
    const start = Number(beat.start), end = Number(beat.end)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
        end - start > 8.01 || Math.abs(start * 30 - frame) > .51) fail('voice/scene timing discontinuity')
    const next = Math.round(end * 30), count = next - frame
    if (count < 1 || count > 240 || next > 1500) fail('native 30fps frame bounds exceeded')
    const result = { beatId: beat.id, file, image: beat.image, sha256: beat.sha256,
      claimId: beat.claimId, factualAuthority: beat.factualAuthority, start: frame / 30,
      end: next / 30, originalStart: start, originalEnd: end, frames: count }
    frame = next
    return result
  })
  return { beats, frameCount: frame, narrationSha256: plan.narrationSha256,
    reviewedClaimLedgerSha256: plan.reviewedClaimLedgerSha256, sourceUrl: plan.sourceUrl }
}

export function renderR818OriginalArtReview({ sourceRoot, outputDir, plan, ffmpeg = 'ffmpeg' }) {
  const verified = validateR818OriginalArtInputs(sourceRoot, plan)
  const root = path.resolve(outputDir)
  if (fs.existsSync(root) && fs.readdirSync(root).length) fail('output directory must be empty; no overwrite')
  fs.mkdirSync(root, { recursive: true })
  const native = { schemaVersion: 'ths-r818-native-frames-v1', fps: 30,
    width: 1080, height: 1920, beats: [] }
  for (const beat of verified.beats) {
    const folder = path.join(root, 'r818-frames', beat.beatId)
    fs.mkdirSync(folder, { recursive: true })
    const pattern = path.join(folder, 'f%05d.png')
    // Camera-only movement is *not* evidence of semantic-object animation.
    const filter = `zoompan=z='1.04':x='(iw-iw/zoom)/2+8*sin(on/38)':y='(ih-ih/zoom)/2+8*sin(on/47)':d=${beat.frames}:s=1080x1920:fps=30`
    const run = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-threads', '2',
      '-y', '-i', beat.file, '-vf', filter, '-frames:v', String(beat.frames),
      '-c:v', 'png', '-compression_level', '3', pattern], { timeout: 240_000, encoding: 'utf8' })
    if (run.status !== 0) fail('local FFmpeg failed: ' + String(run.stderr || run.error || 'unknown').slice(-500))
    const images = fs.readdirSync(folder).filter(name => /^f\d{5}\.png$/.test(name)).sort()
    if (images.length !== beat.frames) fail('decoded native frame count differs from frozen voice timing')
    const frames = images.map((name, i) => {
      if (name !== 'f' + String(i).padStart(5, '0') + '.png') fail('gapped native frame sequence')
      const bytes = fs.readFileSync(path.join(folder, name))
      if (!bytes.subarray(0, 8).equals(sig) || bytes.readUInt32BE(16) !== 1080 ||
          bytes.readUInt32BE(20) !== 1920) fail('FFmpeg output not native 1080x1920 PNG')
      return { frameIndex: i, file: `r818-frames/${beat.beatId}/${name}`, sha256: sha(bytes) }
    })
    native.beats.push({ beatId: beat.beatId, frames })
  }
  const sequenceBytes = Buffer.from(JSON.stringify(native, null, 2) + '\n')
  fs.writeFileSync(path.join(root, 'r818-native-frames.json'), sequenceBytes, { flag: 'wx' })
  const receipt = { schemaVersion: 'ths-r818-original-art-review-receipt-v1',
    status: 'NATIVE_FRAMES_RENDERED_REVIEW_ONLY',
    originalArtwork: verified.beats.map(({ beatId, image, sha256, claimId, frames }) =>
      ({ beatId, image, sha256, claimId, frames })),
    sourceUrl: verified.sourceUrl, reviewedClaimLedgerSha256: verified.reviewedClaimLedgerSha256,
    narrationSha256: verified.narrationSha256, nativeFrameSequenceSha256: sha(sequenceBytes),
    frameCount: verified.frameCount, width: 1080, height: 1920, fps: 30,
    generatedTelemetry: false, wordAlignmentVerified: false,
    scienceOrCraftApproved: false, canonicalR819Handoff: false, mayPublish: false }
  fs.writeFileSync(path.join(root, 'r818-original-art-review-receipt.json'),
    JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' })
  return receipt
}
