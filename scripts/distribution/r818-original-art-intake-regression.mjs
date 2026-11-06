import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { validateR818OriginalArtInputs, renderR818OriginalArtReview } from './r818-original-art-intake.mjs'
import { verifyR818NativeFrames } from './r818-native-frame-sequence.mjs'

const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const copy=x=>structuredClone(x)
function fixture(run){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'em-r818-original-art-'))
 try{
  const art=path.join(root,'art'),out=path.join(root,'out')
  fs.mkdirSync(art)
  const png=path.join(art,'a.png')
  const command=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',
    '-f','lavfi','-i','color=c=0x183048:s=1080x1920:r=1','-frames:v','1',
    '-threads','1','-c:v','png',png],{encoding:'utf8',timeout:30000})
  assert.equal(command.status,0,String(command.stderr||command.error))
  const plan={schemaVersion:'ths-r818-original-art-input-v1',publicationApproved:false,
   mayPublish:false,sourceUrl:'https://ods.od.nih.gov/factsheets/VitaminA-HealthProfessional/',
   reviewedClaimLedgerSha256:'a'.repeat(64),narrationSha256:'b'.repeat(64),
   claims:[{id:'ods-vit-a',verifiedSourceSha256:'c'.repeat(64)}],
   beats:[{id:'a',image:'a.png',sha256:sha(fs.readFileSync(png)),claimId:'ods-vit-a',
     factualAuthority:'NIH-ODS',start:0,end:.1}]}
  return run({art,out,png,plan})
 }finally{fs.rmSync(root,{force:true,recursive:true})}
}
test('original 1080p pixels are pinned; native frames pass the unchanged R8.18 validator',()=>{
 fixture(({art,out,plan})=>{
  const r=renderR818OriginalArtReview({sourceRoot:art,outputDir:out,plan})
  assert.equal(r.status,'NATIVE_FRAMES_RENDERED_REVIEW_ONLY')
  assert.equal(r.frameCount,3)
  assert.equal(r.mayPublish,false)
  assert.equal(r.generatedTelemetry,false)
  assert.equal(r.canonicalR819Handoff,false)
  assert.equal(fs.existsSync(path.join(out,'r818-telemetry.json')),false)
  const seq=JSON.parse(fs.readFileSync(path.join(out,'r818-native-frames.json'),'utf8'))
  const scenes=[{id:'a',beatId:'a',start:0,end:.1}]
  const proof=verifyR818NativeFrames(out,seq,scenes)
  assert.equal(proof.frameCount,3)
  assert.equal(proof.status,'NATIVE_30FPS_PIXELS_VERIFIED')
  assert.throws(()=>renderR818OriginalArtReview({sourceRoot:art,outputDir:out,plan}),/output directory must be empty/)
 })
})
test('source asset mutations fail closed even when file dimensions are plausible',()=>{
 fixture(({art,plan,png})=>{
  const copyPlan=copy(plan)
  copyPlan.beats[0].sha256='d'.repeat(64)
  assert.throws(()=>validateR818OriginalArtInputs(art,copyPlan),/SHA/)
  fs.appendFileSync(png,Buffer.from('tampered'))
  assert.throws(()=>validateR818OriginalArtInputs(art,plan),/SHA/)
 })
})
test('reject wrong scene, source claim and invented release approval',()=>{
 fixture(({art,plan})=>{
  const bad=copy(plan);bad.beats[0].claimId='invented'
  assert.throws(()=>validateR818OriginalArtInputs(art,bad),/claim identity/)
  const fake=copy(plan);fake.mayPublish=true
  assert.throws(()=>validateR818OriginalArtInputs(art,fake),/review-only inputs/)
  const voice=copy(plan);voice.narrationSha256='unverified'
  assert.throws(()=>validateR818OriginalArtInputs(art,voice),/voice ledger/)
  const gap=copy(plan);gap.beats[0].start=1
  assert.throws(()=>validateR818OriginalArtInputs(art,gap),/timing discontinuity/)
 })
})
test('reject traversal, malformed input and duplicate beat identities',()=>{
 fixture(({art,plan})=>{
  const escape=copy(plan);escape.beats[0].image='../a.png'
  assert.throws(()=>validateR818OriginalArtInputs(art,escape),/beat, art, or claim identity/)
  const duplicate=copy(plan);duplicate.beats.push({...duplicate.beats[0],start:.1,end:.2})
  assert.throws(()=>validateR818OriginalArtInputs(art,duplicate),/beat, art, or claim identity/)
  const invalid=copy(plan);invalid.claims[0].verifiedSourceSha256='unverified'
  assert.throws(()=>validateR818OriginalArtInputs(art,invalid),/reviewed-claim identity/)
 })
})
