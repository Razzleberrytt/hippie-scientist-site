import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import {approveOfflineAlignment, renderOfflineAlignmentDraft} from '../r810-local-aligner.mjs'
import {verifyR810WordAlignment} from '../r810-package-qa.mjs'
const sha=(b)=>crypto.createHash('sha256').update(b).digest('hex')
const originalWords='Vitamin C helps build collagen the scaffold of connective tissue'.split(' ')
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ths-r810-review-trust-'))
 const wav=Buffer.from('synthetic-not-a-real-voice')
 const scene={start:0,speechEnd:5,end:5,text:originalWords.join(' ')}
 const script=Buffer.from(JSON.stringify({scenes:[scene]}))
 const manifest={creativeMethodRelease:'R8.10',narrationAudio:{sha256:sha(wav),file:'narration.wav'},narrationScript:{sha256:sha(script),file:'narration-script.json'}}
 const words=originalWords.map((word,i)=>({word,start:0.1+i*0.45,end:0.4+i*0.45}))
 const raw=Buffer.from(JSON.stringify({tiers:{words:{entries:words.map(w=>[w.start,w.end,w.word])}}}))
 for(const [name,buf] of Object.entries({'narration.wav':wav,'narration-script.json':script,'video-asset-manifest.json':Buffer.from(JSON.stringify(manifest)),'r810-mfa-output.json':raw}))fs.writeFileSync(path.join(dir,name),buf)
 const aligner=fs.readFileSync(new URL('../r810-local-aligner.mjs',import.meta.url))
 const receipt={schemaVersion:'ths-r810-local-word-alignment-v1',engine:'mfa-offline',timingSource:'acoustic-forced-alignment',wordLevelAccuracyClaimed:true,audioSha256:sha(wav),scriptSha256:sha(script),acousticModelSha256:'a'.repeat(64),dictionarySha256:'b'.repeat(64),alignerCodeSha256:sha(aligner),meteredCreditsRequired:false,accountRequired:false,rawAlignmentSha256:sha(raw),words,humanAuditoryReview:{status:'pass',reviewerId:'unverified',exactAudioSha256:sha(wav)}}
 fs.writeFileSync(path.join(dir,'word-alignment.receipt.json'),JSON.stringify(receipt))
 // Model/source/reviewer data below are fabricated and self-consistent; this is a security-negative only.
 fs.writeFileSync(path.join(dir,'word-alignment.draft.json'),JSON.stringify({...receipt,
   wordLevelAccuracyClaimed:false,releaseStatus:'awaiting-human-review',
   humanAuditoryReview:null}))
 return {dir,receipt}
}
test('self-attested local approval API cannot mint a human-approved receipt',()=>{
 const {dir}=fixture();try{
  assert.throws(()=>approveOfflineAlignment({packageDir:dir,reviewerId:'claimed',reviewedAt:new Date().toISOString(),observedExactAudioSha256:sha(fs.readFileSync(path.join(dir,'narration.wav')))}),/local approval disabled/)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
test('release verifier rejects fabricated full transcript, unverified reviewer and fake MFA model hashes',()=>{
 const {dir}=fixture();try{
  assert.throws(()=>verifyR810WordAlignment(dir),/no authenticated independent reviewer authority/)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
test('byte-mutated original WAV is rejected before MFA/model lookup or positive draft creation',()=>{
 const {dir}=fixture();try{
  fs.unlinkSync(path.join(dir,'word-alignment.draft.json'))
  fs.appendFileSync(path.join(dir,'narration.wav'),Buffer.from([0]))
  assert.throws(()=>renderOfflineAlignmentDraft({packageDir:dir,mfaBinary:'/not-installed',dictionaryPath:'/not-installed',acousticModelPath:'/not-installed',expectedMfaVersion:'3.3.8'}),/source WAV differs from manifest-approved original audio/)
  assert.equal(fs.existsSync(path.join(dir,'word-alignment.draft.json')),false)
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
})
