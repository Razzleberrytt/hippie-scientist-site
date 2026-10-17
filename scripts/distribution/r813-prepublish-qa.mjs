#!/usr/bin/env node
// R8.13 exact-master pre-publish inspection. Does not grant publication permission.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { verifyR810PackageGate } from './r810-package-qa.mjs'
import { parseR812Loudness, assertR812Loudness } from './r812-loudness.mjs'

export const HOUSE_VOICE = Object.freeze({
  release: 'ths-kokoro-onnx-am-michael-int8-v1',
  engine: 'kokoro-onnx',
  version: '0.6.1',
  voice: 'am_michael',
  files: Object.freeze({
    'kokoro-v1.0.int8.onnx': 'ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c',
    'voices-v1.0.bin': 'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d',
  }),
})
const hash = data => crypto.createHash('sha256').update(data).digest('hex')
const isSha = value => /^[a-f0-9]{64}$/i.test(String(value || ''))
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const ensureFile = file => {
  const stat = fs.lstatSync(file)
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size === 0) throw Error('R8.13 requires nonempty non-symlink file: ' + file)
  return file
}
const exactFile = (root, name) => {
  if (typeof name !== 'string' || name !== path.basename(name) || !/^[a-zA-Z0-9._-]+$/.test(name) || name === '..') {
    throw Error('R8.13 rejected noncanonical asset name')
  }
  return ensureFile(path.join(root, name))
}
const command = (exe, args) => {
  if (!exe || /^https?:/i.test(exe)) throw Error('R8.13 only supports local tools')
  const result = spawnSync(exe, args, {encoding:'utf8', maxBuffer:8*1024*1024, timeout:180000})
  if (result.error || result.status !== 0) throw Error('R8.13 local command failed: ' + String(result.error?.message || result.stderr || result.stdout || '').slice(0,500))
  return result
}

export function assertR813MasterIdentity(manifest, receipt, mp4Bytes, manifestBytes, alignmentProof) {
  if (manifest?.creativeMethodRelease !== 'R8.10' || manifest.r812?.enabled !== true) {
    throw Error('R8.13 requires R8.10 governed methodology with R8.12 audio enabled')
  }
  if (receipt?.r810Governance?.acousticWordAlignment !== 'mfa-offline-reviewed'
      || receipt.r810Governance.wordAlignmentReceiptSha256 !== alignmentProof.receiptSha256
      || receipt.r810Governance.approvedSourceLedgerSha256 !== manifest.sourceLedger?.sha256
      || receipt.r810Governance.alignedCaptionSrtSha256 !== alignmentProof.alignedSrtSha256) {
    throw Error('R8.13 master is not bound to exact reviewed MFA word timing, sources and captions')
  }
  if (receipt.parentManifestSha256 !== hash(manifestBytes)
      || receipt.packId !== manifest.packId || receipt.sourceUrl !== manifest.sourceUrl
      || receipt.sourceContentHash !== manifest.sourceContentHash
      || receipt.output?.sha256 !== hash(mp4Bytes)
      || receipt.output?.bytes !== mp4Bytes.length
      || !receipt.output?.file || receipt.output.file !== path.basename(receipt.output.file)) {
    throw Error('R8.13 MP4 receipt does not match actual final artifact and parent')
  }
  const p = receipt.profile || {}
  if (p.width !== 1080 || p.height !== 1920 || p.fps !== 30 || p.audio !== true || p.audioCodec !== 'aac'
      || Math.abs(Number(p.durationSeconds) - Number(manifest.durationSeconds)) > 0.01) {
    throw Error('R8.13 final export profile differs from approved vertical-video profile')
  }
  return {videoSha256:hash(mp4Bytes),manifestSha256:hash(manifestBytes),wordAlignmentReceiptSha256:alignmentProof.receiptSha256}
}

export function verifyR813VoiceVault(vault) {
  if (!vault) throw Error('R8.13 voice model missing, re-fetch original THS release; --vault or THS_VOICE_VAULT is required')
  const root = path.resolve(vault)
  const manifest = readJson(exactFile(root, 'voice-vault.json'))
  if (manifest.schemaVersion !== 'ths-original-house-voice-vault-v1'
      || manifest.tag !== HOUSE_VOICE.release || manifest.engine !== HOUSE_VOICE.engine
      || manifest.engineVersion !== HOUSE_VOICE.version || manifest.voice !== HOUSE_VOICE.voice
      || JSON.stringify(manifest.assets) !== JSON.stringify(HOUSE_VOICE.files)) {
    throw Error('R8.13 original house-voice identity does not match the pinned vault')
  }
  const hashes = {}
  for (const [name, expected] of Object.entries(HOUSE_VOICE.files)) {
    const file = exactFile(root, name)
    const stat = fs.statSync(file)
    if (stat.size < 1_000_000) throw Error('R8.13 house voice model unexpectedly small')
    hashes[name] = hash(fs.readFileSync(file))
    if (hashes[name] !== expected) throw Error('R8.13 house-voice checksum mismatch: ' + name)
  }
  return {release:HOUSE_VOICE.release, voice:HOUSE_VOICE.voice, assetSha256:hashes}
}

export function verifyR813HookDrafts(pkg, planSha256) {
  const receipt = readJson(exactFile(pkg, 'r811-silent-preview.receipt.json'))
  if (receipt.schemaVersion !== 'ths-evidencemotion-r811-silent-preview-v1'
      || receipt.planSha256 !== planSha256 || receipt.realABPublicationEvidence !== false
      || !Array.isArray(receipt.videos) || receipt.videos.length !== 3) {
    throw Error('R8.13 missing source-bound, non-publishable A/B/C hook-preview receipt')
  }
  const result = []
  for (const arm of ['a','b','c']) {
    const row = receipt.videos.find(x => x.arm === arm)
    if (!row || receipt.videos.filter(x=>x.arm===arm).length !== 1 || row.sound !== false
        || row.publishable !== false || row.watermarkedDraft !== true
        || row.durationSeconds !== 3 || row.meteredCreditsRequired === true) {
      throw Error('R8.13 unsafe or missing silent draft hook ' + arm)
    }
    const video = exactFile(pkg, 'r811-hook-' + arm + '-silent-draft.mp4')
    const svg = exactFile(pkg, 'r811-hook-' + arm + '-preview.svg')
    if (hash(fs.readFileSync(video)) !== row.draftVideoSha256
        || hash(fs.readFileSync(svg)) !== row.sourceSvgSha256) {
      throw Error('R8.13 A/B/C hook bytes differ from original signed receipt: ' + arm)
    }
    result.push({arm,videoSha256:row.draftVideoSha256,sourceSvgSha256:row.sourceSvgSha256})
  }
  return {receiptSha256:hash(fs.readFileSync(path.join(pkg,'r811-silent-preview.receipt.json'))),drafts:result}
}

export function inspectR813ExternalReview(review, expectedVideoSha) {
  if (!review) return {status:'REVIEW_REQUIRED',reason:'Human encoded-master, science, mobile visual and auditory acceptance have not been supplied'}
  if (review.videoSha256 !== expectedVideoSha || review.status !== 'approved'
      || !String(review.reviewerId || '').trim()
      || !['pass'].every(v => review.science === v && review.perceptualMotion === v
          && review.mobileSafeArea === v && review.captionsAndPacing === v
          && review.voiceAuditory === v && review.sourceVisibility === v)) {
    throw Error('R8.13 independent exact-master review is incomplete or applies to another MP4')
  }
  return {status:'REVIEW_ATTESTED',reviewerId:review.reviewerId}
}

export function verifyR813MediaStreams(probe, expectedDuration) {
  const streams = probe?.streams || []
  const video = streams.filter(s=>s.codec_type==='video')
  const audio = streams.filter(s=>s.codec_type==='audio')
  const duration = Number(probe?.format?.duration)
  if (video.length !== 1 || audio.length !== 1 || video[0].codec_name !== 'h264' || audio[0].codec_name !== 'aac'
      || video[0].width !== 1080 || video[0].height !== 1920
      || !Number.isFinite(duration) || Math.abs(duration-expectedDuration) > 0.5) {
    throw Error('R8.13 decoded MP4 stream/audio/duration do not match vertical release')
  }
  return {videoCodec:'h264',audioCodec:'aac',durationSeconds:duration,width:1080,height:1920}
}

export function verifyR813DraftMedia(probe) {
  const streams = probe?.streams || []
  const video = streams.filter(s => s.codec_type === 'video')
  const audio = streams.filter(s => s.codec_type === 'audio')
  const duration = Number(probe?.format?.duration)
  if (video.length !== 1 || audio.length !== 0 || video[0].codec_name !== 'h264'
      || video[0].width !== 1080 || video[0].height !== 1920
      || !Number.isFinite(duration) || Math.abs(duration-3) > 0.25) {
    throw Error('R8.13 hook draft must be exactly one silent 1080x1920 H.264 ~3s video stream')
  }
  return {draftDurationSeconds:duration,hasAudio:false}
}

export function verifyR813CaptionExport(srtBytes, expectedSha, videoReceipt) {
  if (!isSha(expectedSha) || hash(srtBytes) !== expectedSha
      || videoReceipt.r810Governance?.alignedCaptionSrtSha256 !== expectedSha
      || !String(srtBytes).includes(' --> ')) {
    throw Error('R8.13 caption export is not the actual governed MFA-aligned SRT')
  }
  return {sha256:expectedSha,cueCount:(String(srtBytes).match(/ --> /g)||[]).length}
}

export function runR813PrepublishQa({packageDir,mp4Path,vaultDir,reviewPath,ffmpeg='ffmpeg',ffprobe='ffprobe',exportDir}){
  const pkg=path.resolve(packageDir)
  const mp4=ensureFile(path.resolve(mp4Path))
  if (path.extname(mp4).toLowerCase() !== '.mp4') throw Error('R8.13 final master must be MP4')
  const manifestBytes=fs.readFileSync(exactFile(pkg,'video-asset-manifest.json'))
  const manifest=JSON.parse(manifestBytes.toString('utf8'))
  const videoBytes=fs.readFileSync(mp4)
  const receipt=readJson(ensureFile(mp4+'.receipt.json'))
  const governed=verifyR810PackageGate(pkg,{requireAlignment:true})
  const alignedSrt=fs.readFileSync(exactFile(pkg,'aligned-captions.srt'))
  const alignedSrtSha256=hash(alignedSrt)
  const alignmentProof={...governed.alignment,alignedSrtSha256}
  const master=assertR813MasterIdentity(manifest,receipt,videoBytes,manifestBytes,alignmentProof)
  const captions=verifyR813CaptionExport(alignedSrt,alignedSrtSha256,receipt)
  const voice=verifyR813VoiceVault(vaultDir || process.env.THS_VOICE_VAULT)
  const narrationReceipt=readJson(exactFile(pkg,'narration.wav.receipt.json'))
  if (!/kokoro/i.test(String(narrationReceipt.engine?.name || '')+' '+String(narrationReceipt.engine?.model || ''))
      || narrationReceipt.engine?.voice !== HOUSE_VOICE.voice
      || receipt.localNarration?.voice !== HOUSE_VOICE.voice) {
    throw Error('R8.13 master voice is not identified as original Kokoro am_michael')
  }
  // Vault checksum proves available originals; it does not itself prove how a WAV was synthesized.
  // A future signed producer receipt must link exact model binaries to the rendered narration.
  const voiceProvenance = {
    modelVaultVerified:true,outputWavBoundByR810Alignment:true,
    originalVoiceSynthesisBinaryAttestation:'NOT_YET_AVAILABLE',
  }
  const hooks=verifyR813HookDrafts(pkg,manifest.r811Experiment?.planSha256)
  hooks.inspectedDraftStreams=hooks.drafts.map(draft=>{
    const file=path.join(pkg,'r811-hook-'+draft.arm+'-silent-draft.mp4')
    const probe=JSON.parse(command(ffprobe,['-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height','-of','json',file]).stdout)
    return {arm:draft.arm,...verifyR813DraftMedia(probe)}
  })
  const stream=verifyR813MediaStreams(JSON.parse(command(ffprobe,['-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height','-of','json',mp4]).stdout),Number(manifest.durationSeconds))
  const loudness=assertR812Loudness(parseR812Loudness(command(ffmpeg,['-hide_banner','-nostats','-i',mp4,'-map','0:a:0','-af','ebur128=peak=true','-f','null','-']).stderr))
  if (!Number.isFinite(receipt.r812Audio?.integratedLufs)
      || !Number.isFinite(receipt.r812Audio?.truePeakDbfs)
      || Math.abs(receipt.r812Audio.integratedLufs-loudness.integratedLufs)>0.25
      || Math.abs(receipt.r812Audio.truePeakDbfs-loudness.truePeakDbfs)>0.25) {
    throw Error('R8.13 final AAC loudness disagrees with original renderer receipt')
  }
  const lines=manifest.creativeR810?.sourceLedgerLines || []
  const citationLines=lines.filter(x=>/\bPMID\b|\bdoi\b|pubmed\.ncbi/i.test(String(x)))
  if (!citationLines.length) throw Error('R8.13 approved visible source ledger lacks traceable PMID/DOI')
  const review = inspectR813ExternalReview(reviewPath?readJson(ensureFile(path.resolve(reviewPath))):null,master.videoSha256)
  const out=path.resolve(exportDir || path.join(pkg,'r813-review'))
  fs.mkdirSync(out,{recursive:true})
  const stamps=[0,Math.max(0.01,Number(manifest.durationSeconds)*0.25),Math.max(0.01,Number(manifest.durationSeconds)*0.5),Math.max(0.01,Number(manifest.durationSeconds)*0.75)]
  const frames=[]
  for(let i=0;i<stamps.length;i++){
    const name=i===0?'cover-frame.png':'inspection-'+i+'.png'
    const file=path.join(out,name)
    command(ffmpeg,['-hide_banner','-loglevel','error','-ss',String(stamps[i]),'-i',mp4,'-frames:v','1','-y',file])
    frames.push({file:name,timeSeconds:stamps[i],sha256:hash(fs.readFileSync(ensureFile(file)))})
  }
  fs.writeFileSync(path.join(out,'aligned-captions.srt'),alignedSrt)
  const evidence={
    schemaVersion:'ths-evidencemotion-r813-prepublish-qa-v1',status:'MECHANICAL_PASS_HUMAN_GATE_REMAINS',
    video:master,streams:stream,voice,voiceProvenance,loudness,captions,hooks,sourceLedgerLineCount:lines.length,
    traceableCitationLines:citationLines.length,review,inspectionFrames:frames,
    mechanicalChecksDoNotProveOnscreenReadability:true,publicationPermission:false,
    needsIndependentVisualAuditoryScientificApproval:true,
  }
  fs.writeFileSync(path.join(out,'r813-prepublish-report.json'),JSON.stringify(evidence,null,2)+'\n')
  return evidence
}
if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try {
    const argv=process.argv.slice(2),opts={}
    if (argv.length%2) throw Error('Usage: --package DIR --mp4 MASTER.mp4 --vault DIR [--review APPROVAL.json] [--out DIR]')
    for(let i=0;i<argv.length;i+=2){
      if(!['--package','--mp4','--vault','--review','--out','--ffmpeg','--ffprobe'].includes(argv[i]))throw Error('Unknown R8.13 argument '+argv[i])
      opts[argv[i].slice(2)]=argv[i+1]
    }
    if(!opts.package||!opts.mp4)throw Error('Usage: --package DIR --mp4 MASTER.mp4 --vault DIR')
    console.log(JSON.stringify(runR813PrepublishQa({
      packageDir:opts.package,mp4Path:opts.mp4,vaultDir:opts.vault,reviewPath:opts.review,
      exportDir:opts.out,ffmpeg:opts.ffmpeg,ffprobe:opts.ffprobe
    }),null,2))
  } catch(error){console.error('R8.13 FAIL CLOSED: '+error.message);process.exitCode=1}
}
