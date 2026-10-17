import {describe,it,expect} from 'vitest'
import crypto from 'node:crypto'
import {
  assertR813MasterIdentity, verifyR813MediaStreams,
  verifyR813CaptionExport, inspectR813ExternalReview, verifyR813VoiceVault, verifyR813DraftMedia,
} from '../r813-prepublish-qa.mjs'

const sha = x => crypto.createHash('sha256').update(x).digest('hex')
const payload=Buffer.from('synthetic mp4 bytes, not a real video')
const parent=Buffer.from('{"source":"fixture"}')
const srt=Buffer.from('1\n00:00:00,000 --> 00:00:01,000\nTest\n')
const align='a'.repeat(64), ledger='b'.repeat(64)
function valid(){
  const manifest={packId:'synthetic',sourceUrl:'https://example.com/synthetic',
    sourceContentHash:'test-hash',durationSeconds:30,creativeMethodRelease:'R8.10',
    r812:{enabled:true},sourceLedger:{sha256:ledger}}
  const receipt={packId:manifest.packId,sourceUrl:manifest.sourceUrl,
    sourceContentHash:manifest.sourceContentHash,parentManifestSha256:sha(parent),
    output:{file:'master.mp4',sha256:sha(payload),bytes:payload.length},
    profile:{width:1080,height:1920,fps:30,durationSeconds:30,audio:true,audioCodec:'aac'},
    r810Governance:{acousticWordAlignment:'mfa-offline-reviewed',
      wordAlignmentReceiptSha256:align,approvedSourceLedgerSha256:ledger,
      alignedCaptionSrtSha256:sha(srt)}}
  return {manifest,receipt,proof:{receiptSha256:align,alignedSrtSha256:sha(srt)}}
}
describe('R8.13 exact encoded master release hold',()=>{
  it('accepts a matched synthetic manifest/receipt only as a component check',()=>{
    const {manifest,receipt,proof}=valid()
    expect(assertR813MasterIdentity(manifest,receipt,payload,parent,proof).videoSha256).toBe(sha(payload))
  })
  it('rejects stale MP4 and unreviewed/phrase caption substitution',()=>{
    const {manifest,receipt,proof}=valid()
    expect(()=>assertR813MasterIdentity(manifest,receipt,Buffer.from('altered'),parent,proof)).toThrow(/MP4 receipt/)
    receipt.r810Governance.acousticWordAlignment='voice-beat-bounded-phrase-estimate'
    expect(()=>assertR813MasterIdentity(manifest,receipt,payload,parent,proof)).toThrow(/MFA/)
  })
  it('rejects a skipped R8.12 audio stage or substituted source ledger',()=>{
    const {manifest,receipt,proof}=valid()
    manifest.r812.enabled=false
    expect(()=>assertR813MasterIdentity(manifest,receipt,payload,parent,proof)).toThrow(/R8.12/)
    manifest.r812.enabled=true
    receipt.r810Governance.approvedSourceLedgerSha256='another'
    expect(()=>assertR813MasterIdentity(manifest,receipt,payload,parent,proof)).toThrow(/sources/)
  })
  it('refuses non-exact caption exports',()=>{
    const {receipt}=valid()
    expect(verifyR813CaptionExport(srt,sha(srt),receipt).cueCount).toBe(1)
    expect(()=>verifyR813CaptionExport(Buffer.from('estimated phrase timing'),sha(srt),receipt)).toThrow(/caption export/)
  })
  it('refuses missing AAC/video and fake duration',()=>{
    const good={format:{duration:'30.1'},streams:[
      {codec_type:'video',codec_name:'h264',width:1080,height:1920},
      {codec_type:'audio',codec_name:'aac'}]}
    expect(verifyR813MediaStreams(good,30).audioCodec).toBe('aac')
    expect(()=>verifyR813MediaStreams({...good,streams:good.streams.slice(0,1)},30)).toThrow(/stream/)
    expect(()=>verifyR813MediaStreams({...good,format:{duration:'40'}},30)).toThrow(/stream/)
  })
  it('inspects hook drafts as truly silent three-second MP4s',()=>{
    const valid={format:{duration:'3.0'},streams:[{codec_type:'video',codec_name:'h264',width:1080,height:1920}]}
    expect(verifyR813DraftMedia(valid).hasAudio).toBe(false)
    expect(()=>verifyR813DraftMedia({...valid,streams:[...valid.streams,{codec_type:'audio',codec_name:'aac'}]})).toThrow(/silent/)
    expect(()=>verifyR813DraftMedia({...valid,format:{duration:'6.0'}})).toThrow(/silent/)
  })
  it('never turns absent review into publish approval',()=>{
    const videoSha=sha(payload)
    expect(inspectR813ExternalReview(null,videoSha).status).toBe('REVIEW_REQUIRED')
    expect(()=>inspectR813ExternalReview({status:'approved',videoSha256:videoSha},videoSha)).toThrow(/review/)
    const reviewed={videoSha256:videoSha,status:'approved',reviewerId:'external-reviewer',
      science:'pass',perceptualMotion:'pass',mobileSafeArea:'pass',captionsAndPacing:'pass',
      voiceAuditory:'pass',sourceVisibility:'pass'}
    expect(inspectR813ExternalReview(reviewed,videoSha).status).toBe('REVIEW_ATTESTED')
    expect(()=>inspectR813ExternalReview({...reviewed,videoSha256:'stale'},videoSha)).toThrow(/another/)
  })
  it('fails closed if the canonical voice vault is missing',()=>{
    expect(()=>verifyR813VoiceVault('')).toThrow(/voice model missing/)
  })
})
