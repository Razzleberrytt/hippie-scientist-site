import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import {createR818PhysicalCinemaProvider} from './r818-physical-cinema-provider.mjs'
import {stageR818PhysicalArt} from './r818-physical-art-loader.mjs'
import {verifyR818NativeFrames} from './r818-native-frame-sequence.mjs'
import {assertR818TelemetryBinding} from './r818-telemetry-qa.mjs'

const hash=b=>crypto.createHash('sha256').update(b).digest('hex')
const clone=x=>structuredClone(x)
const makeRoot=()=>fs.mkdtempSync(path.join(os.tmpdir(),'ths-r818-physical-art-'))
async function png(root,name,color){
 const file=path.join(root,name)
 // Isolated illustration object, not an opaque postcard or caption screenshot.
 const svg='<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">'+
  '<path d="M120 32 C260 24 280 180 155 360 C30 190 12 68 120 32 Z" fill="'+color+'"/>'+
  '<ellipse cx="145" cy="170" rx="48" ry="115" fill="#ffffff" fill-opacity=".22"/></svg>'
 const bytes=await sharp(Buffer.from(svg)).ensureAlpha().png().toBuffer()
 fs.writeFileSync(file,bytes)
 return {file:name,sha256:hash(bytes)}
}
function beats(primary,target){
 const common={artMethod:'cinematic-2.5d',claimIds:['CLAIM-1'],onScreenSourceIds:['PMID:25026323']}
 return [
  {...common,id:'boundary',semanticAction:'evidence-boundary-panel-settles',
   start:0,end:2.2,role:'limitation',
   visualObject:{name:'source-verified illustrated caution card',kind:'evidence-boundary-card'},
   telemetryProof:{sourceClaimId:'CLAIM-1',primaryObjectId:'card',subjectObjectId:'card',
    beforeLabel:'NOT A HUMAN DOSE'},physicalArt:{primary}},
  {...common,id:'comparison',semanticAction:'botanical-versus-concentrate-reveal',
   start:2.2,end:4.4,role:'mechanism',
   visualObject:{name:'botanical original illustration',kind:'botanical-illustration'},
   telemetryProof:{sourceClaimId:'CLAIM-1',primaryObjectId:'plant',subjectObjectId:'plant',
    targetObjectId:'bottle',targetKind:'product-container',beforeLabel:'Leaf (illustration)',
    afterLabel:'Product container (illustration)'},physicalArt:{primary,target}}
 ]
}
test('pinned isolated original artwork rejects source tampering and wrong authority',async()=>{
 const root=makeRoot()
 try{
  const source=path.join(root,'source'),out=path.join(root,'package');fs.mkdirSync(source);fs.mkdirSync(out)
  const a=await png(source,'plant.png','#45a87d'),b=await png(source,'container.png','#b88265')
  const plans=beats(a,b)
  const staged=stageR818PhysicalArt({artRoot:source,outputDir:out,beats:plans})
  assert.equal(staged.boundary.primary.sha256,a.sha256)
  assert.equal(staged.comparison.target.sha256,b.sha256)
  assert.match(staged.comparison.target.file,/r818-physical-assets/)
  let bad=clone(plans);bad[0].physicalArt.primary.sha256='0'.repeat(64)
  assert.throws(()=>stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'bad'),beats:bad}),/physical PNG is not bounded RGBA source with matching SHA/)
  bad=clone(plans);bad[0].claimIds=[]
  assert.throws(()=>stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'bad2'),beats:bad}),/source-claim/)
  bad=clone(plans);bad[0].physicalArt.primary.file='../plant.png'
  assert.throws(()=>stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'bad3'),beats:bad}),/object missing/)
  bad=clone(plans);bad[0].artMethod='rendered-3d'
  assert.throws(()=>stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'bad4'),beats:bad}),/art method/)
  assert.throws(()=>stageR818PhysicalArt({artRoot:null,outputDir:path.join(root,'bad5'),beats:plans}),/explicit trusted/)
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})
// The full physical render requires VTK/Pillow and belongs to the dedicated
// R8.18 hosted smoke, not generic Node-only CI. Contract negatives run everywhere.
test('true renderer produces two independently moving source-bound art beats and R8.18 proof',
 {skip:process.env.R818_PHYSICAL_TEST!=='1'},async()=>{
 const root=makeRoot()
 try{
  const source=path.join(root,'source'),out=path.join(root,'video');fs.mkdirSync(source);fs.mkdirSync(out)
  const a=await png(source,'plant.png','#45a87d'),b=await png(source,'container.png','#b88265')
  const plan=beats(a,b)
  const scenes=plan.map(({id,start,end,role})=>({beatId:id,start,end,role}))
  const assets=plan.map(x=>({id:x.id,sha256:hash('approved-scene:'+x.id)}))
  const provider=createR818PhysicalCinemaProvider({artRoot:source,timeoutMs:240_000})
  const rendererCodeSha256=hash('actual-voice-timed-preview-scene-source')
  const sourceUrl='https://pubmed.ncbi.nlm.nih.gov/25026323/'
  const sourceContentHash=hash('review-only source snapshot')
  const request={outputDir:out,scenes,assets,canonicalFirstPassPlan:{beats:plan},
   rendererCodeSha256,sourceUrl,sourceContentHash}
  const result=provider.nativeFrameRenderer(request)
  assert.ok(fs.existsSync(result.path))
  provider.rendererGeometryRecorder({outputDir:out,rendererCodeSha256,
   renderedSceneAssetsSha256:hash(assets.map(x=>x.sha256).join('|')),
   sourceManifestSha256:hash(JSON.stringify({sourceUrl,sourceContentHash}))})
  const sequence=JSON.parse(fs.readFileSync(path.join(out,'r818-native-frames.json'),'utf8'))
  const trace=JSON.parse(fs.readFileSync(path.join(out,'r818-telemetry.json'),'utf8'))
  assert.equal(trace.physicalArtManifestSha256,
   JSON.parse(fs.readFileSync(path.join(out,'r818-physical-job.json'))).physicalArtManifestSha256)
  const native=verifyR818NativeFrames(out,sequence,scenes)
  assert.equal(native.frameCount,132)
  const geometry=assertR818TelemetryBinding({beats:plan},trace,{rendererCodeSha256,
   renderedSceneAssetsSha256:trace.renderedSceneAssetsSha256})
  assert.equal(geometry.actionReports.length,2)
  assert.ok(geometry.actionReports[0].movementPixels>=76)
  assert.ok(geometry.actionReports[1].botanicalTravelPixels>=54)
  assert.ok(geometry.actionReports[1].productWidthGrowthPixels>=37)
  assert.ok(geometry.actionReports[1].productHeightGrowthPixels>=48)
  // Negative control: a source-pinned but now-tampered actual frame is rejected.
  const frame=sequence.beats[1].frames[20]
  fs.appendFileSync(path.join(out,frame.file),Buffer.from('tamper'))
  assert.throws(()=>verifyR818NativeFrames(out,sequence,scenes),/mutated frame pixels/)
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})
