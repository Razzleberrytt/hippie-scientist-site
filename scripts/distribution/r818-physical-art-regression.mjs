import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import {spawnSync} from 'node:child_process'
import {renderR818ContactSheet} from './r818-render-contact-sheet.mjs'
import {createR818PhysicalCinemaProvider} from './r818-physical-cinema-provider.mjs'
import {stageR818PhysicalArt} from './r818-physical-art-loader.mjs'
import {verifyR818NativeFrames} from './r818-native-frame-sequence.mjs'
import {assertR818TelemetryBinding} from './r818-telemetry-qa.mjs'
import {verifyR819RealR818ProductionHandoff} from './r819-r818-physical-origin.mjs'
import {verifyR819LayerInventory} from './r819-native-layer-compositor.mjs'
import {assertR819NoBakedFactualPlate} from './r819-canonical-handoff.mjs'

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
test('physical artwork on unsupported semantic action is rejected, not silently discarded',()=>{
 const unrecognized={id:'unsupported',semanticAction:'unreviewed-unknown-action',
  physicalArt:{primary:{file:'art.png',sha256:'0'.repeat(64)}}}
 assert.throws(()=>stageR818PhysicalArt({artRoot:null,outputDir:'unused',beats:[unrecognized]}),
  /physical artwork supplied for unsupported semantic action/)
 assert.throws(()=>stageR818PhysicalArt({artRoot:null,outputDir:'unused',beats:[
  {id:'plain',semanticAction:'still-photo'},unrecognized,
  {id:'known',semanticAction:'source-bound-scaffold-assembles'}]}),
  /physical artwork supplied for unsupported semantic action/)
 assert.deepEqual(stageR818PhysicalArt({artRoot:null,outputDir:'unused',beats:[
  {id:'plain',semanticAction:'still-photo'}]}),{})
})

test('native 1080x1920 isolated original-art pixels admit only exact pinned separated source roles',async()=>{
 const root=makeRoot()
 try{
  const artRoot=path.join(root,'artist')
  fs.mkdirSync(artRoot)
  const b=await sharp({create:{width:1080,height:1920,channels:4,
   background:{r:30,g:70,b:90,alpha:1}}}).png().toBuffer()
  for(const n of ['strands.png','links.png','art.png','trust.png'])
   fs.writeFileSync(path.join(artRoot,n),b)
  const r=n=>({file:n+'.png',sha256:hash(b)})
  const beat={id:'nativefull',artMethod:'cinematic-2.5d',
   semanticAction:'source-bound-scaffold-assembles',
   claimIds:['claim-1'],onScreenSourceIds:['NIH-ODS'],
   visualObject:{kind:'collagen',name:'Original artist pixels'},
   telemetryProof:{sourceClaimId:'claim-1',primaryObjectId:'strands',
    subjectObjectId:'strands',targetObjectId:'links',targetKind:'crosslinks',
    beforeLabel:'Strands',afterLabel:'Crosslinks'},
   physicalArt:{primary:{...r('strands'),targetBox:[371,614,339,725]},
    target:{...r('links'),targetBox:[415,702,250,564]},
    art:{...r('art'),r819Role:'nonfactual-art',containsFactualText:false},
    trust:{...r('trust'),r819Role:'factual-trust',
     factualAuthority:'NIH-ODS',sourceClaimId:'claim-1'}}}
  const staged=stageR818PhysicalArt({artRoot,outputDir:path.join(root,'pass'),beats:[beat]})
  assert.equal(Object.keys(staged.nativefull).length,4)
  assert.equal(staged.nativefull.primary.sha256,hash(b))
  const wrong=clone(beat);wrong.physicalArt.trust.sourceClaimId='unregistered'
  assert.throws(()=>stageR818PhysicalArt({
   artRoot,outputDir:path.join(root,'reject'),beats:[wrong]}),/source authority/)
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})
test('source-authored resting boxes fail closed on altered layout',async()=>{
 const root=makeRoot()
 try{
  const src=path.join(root,'source');fs.mkdirSync(src)
  const a=await png(src,'strands.png','#45a87d'),b=await png(src,'rungs.png','#b88265')
  const beat={id:'assembly',artMethod:'cinematic-2.5d',semanticAction:'source-bound-scaffold-assembles',
   claimIds:['CLAIM-1'],onScreenSourceIds:['NIH ODS'],visualObject:{kind:'fibers'},
   telemetryProof:{sourceClaimId:'CLAIM-1',subjectObjectId:'strands',primaryObjectId:'strands',
    targetObjectId:'rungs',targetKind:'crosslinks',beforeLabel:'Illustrative fibres',
    afterLabel:'Illustrative rungs'},
   physicalArt:{primary:{...a,targetBox:[371,614,339,725]},
    target:{...b,targetBox:[415,702,250,564]}}}
  const staged=stageR818PhysicalArt({artRoot:src,outputDir:path.join(root,'pass'),beats:[beat]})
  assert.deepEqual(staged.assembly.primary.targetBox,[371,614,339,725])
  assert.deepEqual(staged.assembly.target.targetBox,[415,702,250,564])
  const shifted=clone(beat);shifted.physicalArt.target.targetBox=[1000,702,250,564]
  assert.throws(()=>stageR818PhysicalArt({artRoot:src,outputDir:path.join(root,'bad'),beats:[shifted]}),/bounded authored resting boxes/)
  const missing=clone(beat);delete missing.physicalArt.primary.targetBox
  assert.throws(()=>stageR818PhysicalArt({artRoot:src,outputDir:path.join(root,'bad2'),beats:[missing]}),/bounded authored resting boxes/)
 }finally{fs.rmSync(root,{force:true,recursive:true})}
})
test('baked factual plates always fail R8.19 independent art/trust claim',()=>{
 assert.equal(assertR819NoBakedFactualPlate({beats:[{id:'clean',physicalArt:{primary:{}}}]}),true)
 assert.throws(()=>assertR819NoBakedFactualPlate({beats:[{id:'C',physicalArt:{
   primary:{},target:{},plate:{factualAuthority:'NIH ODS',r819BackgroundEligible:false}}}]}),
   /original teaching plate contains source\/factual text/)
 assert.throws(()=>assertR819NoBakedFactualPlate({beats:null}),/source-beat inventory missing/)
})
test('full original factual plate is SHA-pinned and explicitly excluded from R8.19 art',async()=>{
 const root=makeRoot()
 try {
  const source=path.join(root,'source');fs.mkdirSync(source)
  const strand=await png(source,'strand.png','#44a88f'),link=await png(source,'link.png','#b88455')
  const bytes=await sharp({create:{width:1080,height:1920,channels:4,
   background:{r:10,g:17,b:32,alpha:1}}}).png().toBuffer()
  fs.writeFileSync(path.join(source,'plate.png'),bytes)
  const beat={id:'assembly',semanticAction:'source-bound-scaffold-assembles',
   artMethod:'cinematic-2.5d',claimIds:['claim-1'],onScreenSourceIds:['NIH-ODS'],
   visualObject:{kind:'fibers',name:'Original collagen drawing'},
   telemetryProof:{sourceClaimId:'claim-1',primaryObjectId:'fibers',subjectObjectId:'fibers',
    targetObjectId:'rungs',targetKind:'crosslinks',
    beforeLabel:'Fibers',afterLabel:'Rungs'},
   physicalArt:{primary:{...strand,targetBox:[371,614,339,725]},
    target:{...link,targetBox:[415,702,250,564]},plate:{
     file:'plate.png',sha256:hash(bytes),factualAuthority:'Source-bound label',
     sourceClaimId:'claim-1',r819BackgroundEligible:false}}}
  const staged=stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'good'),beats:[beat]})
  assert.equal(staged.assembly.plate.sha256,hash(bytes))
  assert.equal(staged.assembly.plate.r819BackgroundEligible,false)
  const mislabeled=clone(beat);mislabeled.physicalArt.plate.r819BackgroundEligible=true
  assert.throws(()=>stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'mislabel'),beats:[mislabeled]}),
   /factual plate cannot masquerade/)
  const stale=clone(beat);stale.physicalArt.plate.sha256='0'.repeat(64)
  assert.throws(()=>stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'stale'),beats:[stale]}),
   /matching SHA/)
  const unsourced=clone(beat);unsourced.physicalArt.plate.sourceClaimId='unknown-claim'
  assert.throws(()=>stageR818PhysicalArt({artRoot:source,outputDir:path.join(root,'unknown'),beats:[unsourced]}),
   /factual plate cannot masquerade/)
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})
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
  const plateBytes=await sharp({create:{width:1080,height:1920,channels:4,
    background:{r:11,g:22,b:35,alpha:1}}}).png().toBuffer()
  fs.writeFileSync(path.join(source,'plate.png'),plateBytes)
  const plate={file:'plate.png',sha256:hash(plateBytes),factualAuthority:'Source fixture',
    sourceClaimId:'CLAIM-1',r819BackgroundEligible:false}
  const plan=beats(a,b)
  plan.push({id:'assembly',artMethod:'cinematic-2.5d',semanticAction:'source-bound-scaffold-assembles',
   start:4.4,end:7.4,role:'mechanism',claimIds:['CLAIM-1'],onScreenSourceIds:['PMID:25026323'],
   visualObject:{kind:'fibers',name:'Source-drawn biological fibres'},
   telemetryProof:{sourceClaimId:'CLAIM-1',subjectObjectId:'strands',primaryObjectId:'strands',
    targetObjectId:'rungs',targetKind:'crosslinks',beforeLabel:'Illustrative fibres',
    afterLabel:'Illustrative rungs'},
   physicalArt:{primary:{...a,targetBox:[371,614,339,725]},
    target:{...b,targetBox:[415,702,250,564]},plate}})
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
  assert.equal(native.frameCount,222)
  const geometry=assertR818TelemetryBinding({beats:plan},trace,{rendererCodeSha256,
   renderedSceneAssetsSha256:trace.renderedSceneAssetsSha256})
  assert.equal(geometry.actionReports.length,3)
  assert.ok(geometry.actionReports[0].movementPixels>=76)
  assert.ok(geometry.actionReports[1].botanicalTravelPixels>=54)
  assert.ok(geometry.actionReports[1].productWidthGrowthPixels>=37)
  assert.ok(geometry.actionReports[1].productHeightGrowthPixels>=48)
  assert.ok(geometry.actionReports[2].movementPixels>=76)
  assert.ok(geometry.actionReports[2].connectorActivationDelta>=.75)
  const attested=verifyR819RealR818ProductionHandoff(out,{nativeSequence:sequence,
   plan:{beats:plan},scenes})
  assert.equal(attested.frameCount,222)
  assert.equal(attested.beatCount,3)
  assert.equal(attested.publicationApproved,false)
  assert.equal(attested.actualOriginalArtStagedCount,6)
  assert.throws(()=>verifyR819RealR818ProductionHandoff(out,{nativeSequence:sequence,
   plan:{beats:plan},scenes:[...scenes].reverse()}),/differs from real producer job/)
  const jobFile=path.join(out,'r818-physical-job.json')
  const originalJob=fs.readFileSync(jobFile)
  const tamperedJob=JSON.parse(originalJob)
  tamperedJob.physicalRendererSha256='0'.repeat(64)
  fs.writeFileSync(jobFile,JSON.stringify(tamperedJob))
  assert.throws(()=>verifyR819RealR818ProductionHandoff(out,{nativeSequence:sequence,
   plan:{beats:plan},scenes}),/physical renderer source, scene, or original-art identity mismatch/)
  fs.writeFileSync(jobFile,originalJob)
  assert.ok(trace.beats[2].frames.every(f=>f.objects.some(o=>
   o.objectId==='source-plate'&&o.artSourceSha256===plate.sha256)))
  // Optional CI-only decoded visual receipt: reviewers must see the actual new
  // art-motion pixels, not infer visual quality from a telemetry assertion.
  // Synthetic fixture art and silent movie remain REVIEW ONLY.
  if(process.env.R818_ART_PROOF_OUTPUT){
   const proofDir=path.resolve(process.env.R818_ART_PROOF_OUTPUT)
   if(fs.existsSync(proofDir)&&fs.readdirSync(proofDir).length)
    throw Error('R8.18 original-art visual proof output must be empty')
   fs.mkdirSync(proofDir,{recursive:true})
   const framesDir=path.join(proofDir,'numbered')
   fs.mkdirSync(framesDir)
   let counter=0
   for(const scene of native.beats)for(const frame of scene.frames){
    fs.copyFileSync(path.join(out,frame.file),
     path.join(framesDir,'f'+String(counter++).padStart(5,'0')+'.png'))
   }
   const mp4=path.join(proofDir,'original-art-object-motion_TECHNICAL_REVIEW_ONLY_SILENT.mp4')
   const encode=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',
     '-framerate','30','-start_number','0','-i',path.join(framesDir,'f%05d.png'),
     '-frames:v',String(native.frameCount),'-c:v','libx264','-preset','fast',
     '-crf','19','-profile:v','high','-pix_fmt','yuv420p','-movflags','+faststart',
     '-an',mp4],{encoding:'utf8',timeout:150000,maxBuffer:1000000})
   assert.equal(encode.status,0,'FFmpeg original-art video encoding failed: '+String(encode.stderr||encode.error))
   const ffprobe=spawnSync('ffprobe',['-v','error','-select_streams','v:0',
     '-count_frames','-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_read_frames',
     '-of','json',mp4],{encoding:'utf8',timeout:30000,maxBuffer:100000})
   assert.equal(ffprobe.status,0,String(ffprobe.stderr||ffprobe.error))
   const probed=JSON.parse(ffprobe.stdout).streams?.[0]
   assert.equal(probed.codec_name,'h264')
   assert.equal(probed.width,1080)
   assert.equal(probed.height,1920)
   assert.equal(probed.avg_frame_rate,'30/1')
   assert.equal(Number(probed.nb_read_frames),222)
   const sheet=await renderR818ContactSheet({masterMp4:mp4,beats:scenes,outputDir:proofDir})
   const media=fs.readFileSync(mp4)
   const receipt={schemaVersion:'ths-r818-original-object-motion-visual-review-v1',
    status:'ACTUAL_222_NATIVE_FRAMES_ENCODED_TECHNICAL_TEST_ONLY',
    mp4File:path.basename(mp4),mp4Sha256:hash(media),frameCount:222,
    width:1080,height:1920,fps:30,audio:false,
    contactSheetFile:path.basename(sheet.sheetFile),
    contactSheetSha256:sheet.proof.contactSheetSha256,
    sourceArtSha256:[a.sha256,b.sha256],
    rendererCodeSha256:provider.sourceCodeSha256,
    telemetrySha256:hash(fs.readFileSync(path.join(out,'r818-telemetry.json'))),
    testFixtureArtwork:true,notPremiumProductionArtwork:true,
    actualVideoScienceReviewed:false,actualVoiceWordAligned:false,
    independentVisualCraftReviewed:false,mayPublish:false,
    canonicalMilestone:false}
   fs.writeFileSync(path.join(proofDir,'original-art-object-motion-review-receipt.json'),
     JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
   console.log('R8.18 original-art source-pinned visual evidence:',JSON.stringify({
     path:proofDir,mp4Sha256:receipt.mp4Sha256,contactSheetSha256:receipt.contactSheetSha256,
     status:receipt.status}))
  }
  // Negative control: a source-pinned but now-tampered actual frame is rejected.
  const frame=sequence.beats[1].frames[20]
  fs.appendFileSync(path.join(out,frame.file),Buffer.from('tamper'))
  assert.throws(()=>verifyR818NativeFrames(out,sequence,scenes),/mutated frame pixels/)
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})

test('native physical collagen movement and separately composed R8.19 artist pixels match in the SAME production pass',
 {skip:process.env.R818_PHYSICAL_TEST!=='1'},async()=>{
 const root=makeRoot()
 try {
  const source=path.join(root,'source'),out=path.join(root,'output')
  fs.mkdirSync(source);fs.mkdirSync(out)
  const draw=async(name,svg)=>{
   const b=await sharp({create:{width:1080,height:1920,channels:4,
    background:'#00000000'}}).composite([{input:Buffer.from(svg)}]).png().toBuffer()
   fs.writeFileSync(path.join(source,name),b)
   return {file:name,sha256:hash(b)}
  }
  const strands=await draw('strands.png',
   '<svg width="1080" height="1920"><ellipse cx="540" cy="920" rx="140" ry="290" fill="#2cae9d"/></svg>')
  const crosslinks=await draw('links.png',
   '<svg width="1080" height="1920"><rect x="460" y="820" width="175" height="200" fill="#ef9d51"/></svg>')
  const trust=await draw('trust.png',
   '<svg width="1080" height="1920"><rect x="90" y="1650" width="640" height="48" fill="#e5f8ff"/></svg>')
  const art=await sharp({create:{width:1080,height:1920,channels:4,
    background:{r:10,g:26,b:42,alpha:1}}}).png().toBuffer()
  fs.writeFileSync(path.join(source,'art.png'),art)
  const beat={id:'nativeart',artMethod:'cinematic-2.5d',
   semanticAction:'source-bound-scaffold-assembles',
   start:0,end:3.0,role:'mechanism',claimIds:['vitc-claim'],
   onScreenSourceIds:['NIH-ODS'],visualObject:{kind:'collagen-strands',
    name:'Source-authored collagen fibers'},
   telemetryProof:{sourceClaimId:'vitc-claim',subjectObjectId:'strands',
    primaryObjectId:'strands',targetObjectId:'links',targetKind:'collagen-crosslinks',
    beforeLabel:'Collagen strands',afterLabel:'Cross-links'},
   physicalArt:{primary:{...strands,targetBox:[371,614,339,725]},
    target:{...crosslinks,targetBox:[415,702,250,564]},
    art:{file:'art.png',sha256:hash(art),r819Role:'nonfactual-art',containsFactualText:false},
    trust:{...trust,r819Role:'factual-trust',factualAuthority:'NIH ODS',
     sourceClaimId:'vitc-claim'}}}
  const scenes=[{beatId:beat.id,start:0,end:3.0,role:'mechanism'}]
  const assets=[{id:beat.id,sha256:hash('pinned physical artwork assets')}]
  const rendererCodeSha256=hash('canonical original art rendering')
  const sourceUrl='https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/'
  const sourceContentHash=hash('upstream claim source snapshot')
  const producer=createR818PhysicalCinemaProvider({artRoot:source,timeoutMs:450000})
  producer.nativeFrameRenderer({outputDir:out,scenes,assets,
   canonicalFirstPassPlan:{beats:[beat]},rendererCodeSha256,sourceUrl,sourceContentHash})
  const seq=JSON.parse(fs.readFileSync(path.join(out,'r818-native-frames.json'),'utf8'))
  const trace=JSON.parse(fs.readFileSync(path.join(out,'r818-telemetry.json'),'utf8'))
  assert.equal(verifyR818NativeFrames(out,seq,scenes).frameCount,90)
  assert.equal(assertR818TelemetryBinding({beats:[beat]},trace,{
    rendererCodeSha256,renderedSceneAssetsSha256:hash(assets.map(a=>a.sha256).join('|'))
   }).beatCount,1)
  const receipt=JSON.parse(fs.readFileSync(
    path.join(out,'r818-r819-native-separation-receipt.json'),'utf8'))
  assert.equal(receipt.status,'REAL_PHYSICAL_OBJECT_PIXELS_SOURCE_SEPARATED_PIXEL_MATCH_REVIEW_ONLY')
  assert.equal(receipt.frameCount,90)
  assert.equal(receipt.publicationApproved,false)
  const layerDoc=JSON.parse(fs.readFileSync(path.join(out,'r819-layer-sequence.json'),'utf8'))
  assert.equal(layerDoc.beats[0].frames.length,90)
  const origin=verifyR819RealR818ProductionHandoff(out,{plan:{beats:[beat]},scenes,
   nativeSequence:seq})
  assert.equal(origin.frameCount,90)
  fs.appendFileSync(path.join(out,layerDoc.beats[0].frames[0].layers.trust.file),
    Buffer.from('tampered'))
  assert.throws(()=>verifyR819LayerInventory(out,{
   file:'r819-layer-sequence.json',
   sha256:hash(fs.readFileSync(path.join(out,'r819-layer-sequence.json')))
  },seq),/mutated\/incorrect/)
 }finally{fs.rmSync(root,{recursive:true,force:true})}
})
