// Pure receipt-contract fixtures. These tests do NOT represent real rendered video.
import test from 'node:test'
import assert from 'node:assert/strict'
import { assertR818VoicedReviewHandoff } from '../r818-voiced-review-qa.mjs'
import { R817_CANONICAL } from '../r817-canonical-first-pass.mjs'
const h='a'.repeat(64),v=R817_CANONICAL.voice
function fixture(){return {
 master:{output:{sha256:h},profile:{width:1080,height:1920,fps:30,codec:'libx264',pixelFormat:'yuv420p',audioCodec:'aac',audioSampleRate:44100,audioChannels:2,mobileAudioVerified:true,decodedAudio:{verification:'decoded-final-mp4-volumedetect',meanVolumeDb:-22,maxVolumeDb:-5}},localNarration:{engine:v.engine,voice:v.name,audioSha256:h},r810Governance:{wordAlignmentReceiptSha256:h,acousticWordAlignment:'mfa-offline-reviewed'},r817FirstPass:{exactMp4Sha256:h,status:'encoded-review-only',progressiveWords:{mode:'mfa-acoustic-progressive-word',phraseFlashFallback:false,wordCount:5},captionPixelProof:{status:'CAPTION_PIXEL_MEASUREMENT_PASS'},finalMp4Motion:{status:'MOTION_TECHNICAL_PASS'},hookPixelProof:{outputSha256:h},rendererTelemetry:{status:'RENDERER_TELEMETRY_CHECKED_NOT_PIXEL_CERTIFIED'},nativeSequenceFrameCount:285,exactMasterVisualApproval:false}},
 narration:{schemaVersion:'ths-local-narration-receipt-v1',engine:{name:v.engine,model:'Kokoro-82M',packageVersion:v.engineVersion,voice:v.name,modelWeightsSha256:v.modelSha256,voiceWeightsSha256:v.voicebankSha256,voiceVaultTag:'ths-kokoro-onnx-am-michael-int8-v1'},output:{sha256:h},meteredCreditsRequired:false,accountRequired:false},
 alignment:{schemaVersion:'ths-r810-local-word-alignment-v1',engine:'mfa-offline',timingSource:'acoustic-forced-alignment',audioSha256:h,words:[1,2,3,4,5],humanAuditoryReview:{status:'pass',exactAudioSha256:h}},
 contact:{schemaVersion:'ths-r818-exact-master-contact-sheet-v1',sourceMp4Sha256:h,contactSheetSha256:h,allBeatsThreeFrames:true,samples:Array(9).fill({}),reviewerJudgment:'PENDING_INDEPENDENT_HUMAN_VISUAL_REVIEW',pixelSemanticsCertified:false}
}}
test('receipt-complete technical fixture must STILL be review-only',()=>{
 const result=assertR818VoicedReviewHandoff(fixture())
 assert.equal(result.status,'TECHNICAL_HANDOFF_REVIEW_HOLD')
 assert.equal(result.publicationApproved,false)
 assert.equal(result.independentVVerified,false)
})
for(const [name,modify,pattern] of [
 ['robot narrator',r=>{r.narration.engine.voice='flite'},/Kokoro/],
 ['model swap',r=>{r.narration.engine.modelWeightsSha256='b'.repeat(64)},/Kokoro/],
 ['inaudible AAC',r=>{r.master.profile.decodedAudio.meanVolumeDb=-70},/AAC/],
 ['phrase flashes',r=>{r.master.r817FirstPass.progressiveWords.mode='phrases'},/word-highlight/],
 ['synthetic alignment',r=>{r.alignment.engine='duration-proportional'},/acoustic/],
 ['stale final MP4 sheet',r=>{r.contact.sourceMp4Sha256='b'.repeat(64)},/contact sheet/],
 ['silent smoke reused',r=>{r.master.profile.audioCodec=null},/AAC/],
 ['missing physical telemetry',r=>{r.master.r817FirstPass.rendererTelemetry.status='UNKNOWN'},/physical/],
 ['falsely accepted human review',r=>{r.master.r817FirstPass.exactMasterVisualApproval=true},/human/]
]) test('fail closed on '+name,()=>{const r=fixture();modify(r);assert.throws(()=>assertR818VoicedReviewHandoff(r),pattern)})
