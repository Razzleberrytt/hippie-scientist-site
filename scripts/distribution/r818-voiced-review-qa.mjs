// Fail-closed, receipt-based bridge from R8.18's real 3D frames to a REVIEW-ONLY
// final MP4. The canonical renderer must first decode and inspect the media.
import { R817_CANONICAL } from './r817-canonical-first-pass.mjs'

const hex = value => /^[a-f0-9]{64}$/.test(String(value ?? ''))
const fail = why => { throw Error('R8.18 voiced pilot HOLD: ' + why) }

export function assertR818VoicedReviewHandoff({ master, narration, alignment, contact }) {
  const m = master ?? {}, voice = narration ?? {}, a = alignment ?? {}, sheet = contact ?? {}
  const profile = m.profile ?? {}, proof = m.r817FirstPass ?? {}, recorded = m.localNarration ?? {}
  const approved = R817_CANONICAL.voice
  if (!hex(m.output?.sha256) || !hex(proof.exactMp4Sha256) || m.output.sha256 !== proof.exactMp4Sha256)
    fail('finished MP4 SHA must match actual rendered R8.17 master')
  if (profile.width !== 1080 || profile.height !== 1920 || profile.fps !== 30 ||
      profile.codec !== 'libx264' || profile.pixelFormat !== 'yuv420p' ||
      profile.audioCodec !== 'aac' || profile.audioSampleRate !== 44100 ||
      profile.audioChannels !== 2 || profile.mobileAudioVerified !== true ||
      profile.decodedAudio?.verification !== 'decoded-final-mp4-volumedetect' ||
      !(profile.decodedAudio?.meanVolumeDb > -50) || !(profile.decodedAudio?.maxVolumeDb > -30))
    fail('1080x1920/30fps H264 with audible decoded 44.1 kHz stereo AAC not proven')
  if (voice.schemaVersion !== 'ths-local-narration-receipt-v1' ||
      voice.engine?.name !== approved.engine || voice.engine?.model !== 'Kokoro-82M' ||
      voice.engine?.packageVersion !== approved.engineVersion ||
      voice.engine?.voice !== approved.name || voice.engine?.modelWeightsSha256 !== approved.modelSha256 ||
      voice.engine?.voiceWeightsSha256 !== approved.voicebankSha256 ||
      voice.engine?.voiceVaultTag !== 'ths-kokoro-onnx-am-michael-int8-v1' ||
      voice.meteredCreditsRequired !== false || voice.accountRequired !== false ||
      recorded.engine !== approved.engine || recorded.voice !== approved.name ||
      !hex(recorded.audioSha256) || recorded.audioSha256 !== voice.output?.sha256)
    fail('archived, original Kokoro ONNX am_michael narrator and exact audio hash not established')
  if (a.schemaVersion !== 'ths-r810-local-word-alignment-v1' ||
      a.engine !== 'mfa-offline' || a.timingSource !== 'acoustic-forced-alignment' ||
      a.audioSha256 !== recorded.audioSha256 || !Array.isArray(a.words) || !a.words.length ||
      a.humanAuditoryReview?.status !== 'pass' ||
      a.humanAuditoryReview.exactAudioSha256 !== recorded.audioSha256 ||
      !hex(m.r810Governance?.wordAlignmentReceiptSha256) ||
      m.r810Governance.acousticWordAlignment !== 'mfa-offline-reviewed')
    fail('independently reviewed real-WAV acoustic word timing missing')
  if (proof.status !== 'encoded-review-only' ||
      proof.progressiveWords?.mode !== 'mfa-acoustic-progressive-word' ||
      proof.progressiveWords.phraseFlashFallback !== false ||
      proof.progressiveWords.wordCount !== a.words.length ||
      proof.captionPixelProof?.status !== 'CAPTION_PIXEL_MEASUREMENT_PASS' ||
      proof.finalMp4Motion?.status !== 'MOTION_TECHNICAL_PASS' ||
      !hex(proof.hookPixelProof?.outputSha256) || proof.hookPixelProof.outputSha256 !== m.output.sha256 ||
      proof.rendererTelemetry?.status !== 'RENDERER_TELEMETRY_CHECKED_NOT_PIXEL_CERTIFIED' ||
      !(proof.nativeSequenceFrameCount > 0))
    fail('final decoded MP4 lacks word-highlight, motion, hook or physical geometry proof')
  if (sheet.schemaVersion !== 'ths-r818-exact-master-contact-sheet-v1' ||
      sheet.sourceMp4Sha256 !== m.output.sha256 ||
      !hex(sheet.contactSheetSha256) || sheet.allBeatsThreeFrames !== true ||
      !Array.isArray(sheet.samples) || sheet.samples.length < 9 ||
      sheet.reviewerJudgment !== 'PENDING_INDEPENDENT_HUMAN_VISUAL_REVIEW' ||
      sheet.pixelSemanticsCertified !== false)
    fail('contact sheet is absent, mismatched or falsely self-approved')
  if (proof.exactMasterVisualApproval !== false)
    fail('machine-generated review receipt cannot grant human visual approval')
  return Object.freeze({
    schemaVersion: 'ths-r818-voiced-review-handoff-v1',
    status: 'TECHNICAL_HANDOFF_REVIEW_HOLD',
    masterSha256: m.output.sha256,
    narrationWavSha256: recorded.audioSha256,
    alignmentReceiptSha256: m.r810Governance.wordAlignmentReceiptSha256,
    contactSheetSha256: sheet.contactSheetSha256,
    voiced: true, progressiveWordCaptions: true, native1080p: true,
    publicationApproved: false, ownerDeviceReview: 'pending',
    independentScientificReview: 'pending', independentVVerified: false,
    next: 'Inspect exact MP4 on iPhone with sound, check scientific claims/CTA/caption synchrony and ask independent reviewer; do not auto-publish.'
  })
}
