#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'
import {verifyR818NativeFrames} from './r818-native-frame-sequence.mjs'
import {authorR819LayerInventory} from './r819-layer-inventory-writer.mjs'
import {compositeR819Frame,verifyR819LayerInventory} from './r819-native-layer-compositor.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
function fail(m){throw Error('R8.18/R8.19 same-pass separated artist HOLD: '+m)}
function bytes(root,ref){
 const file=path.resolve(root,ref?.file||'')
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||
    !fs.statSync(file).isFile()||!fs.realpathSync(file).startsWith(root+path.sep))
   fail('illegal or absent staged artwork source')
 const b=fs.readFileSync(file)
 if(sha(b)!==ref.sha256)fail('original ART/TRUST source SHA differs from rendering job')
 return b
}
async function alphaChecked(b,label){
 const meta=await sharp(b,{failOn:'error'}).metadata()
 if(meta.format!=='png'||meta.width!==1080||meta.height!==1920||!meta.hasAlpha)
  fail(label+' must be 1080x1920 RGBA')
 if(label!=='art'){
  const stats=await sharp(b).extractChannel('alpha').stats()
  if(stats.channels[0].max===0||stats.channels[0].min!==0)
   fail(label+' must be partly transparent, not a baked screenshot')
 }
}
export async function assembleSamePassNative(packageDir){
 const root=path.resolve(packageDir)
 const job=JSON.parse(fs.readFileSync(path.join(root,'r818-physical-job.json'),'utf8'))
 const roles=job.physicalArt||{}
 const withLayers=Object.values(roles).filter(r=>r?.art||r?.trust)
 if(!withLayers.length)return {separated:false}
 const plan=job.plan?.beats,scenes=job.scenes
 if(!Array.isArray(plan)||!Array.isArray(scenes)||withLayers.length!==plan.length||
    scenes.length!==plan.length||fs.existsSync(path.join(root,'r819-layer-sequence.json')))
  fail('every canonical beat must have unambiguous native artist layers')
 const file=path.join(root,'r818-native-frames.json')
 const native=JSON.parse(fs.readFileSync(file,'utf8'))
 if(native.beats?.length!==plan.length)fail('physical native sequence count drift')
 let total=0
 for(let i=0;i<plan.length;i++){
  const beat=plan[i],rendered=native.beats[i],role=roles[beat.id]
  if(!role?.art||!role?.trust||role.plate||rendered?.beatId!==beat.id||
     beat.semanticAction!=='source-bound-scaffold-assembles'||
     role.art.r819Role!=='nonfactual-art'||role.art.containsFactualText!==false||
     role.trust.r819Role!=='factual-trust'||
     role.trust.sourceClaimId!==beat.telemetryProof?.sourceClaimId)
   fail('claim-bound independent artist roles/physical beat do not match')
  const art=bytes(root,role.art),trust=bytes(root,role.trust)
  await alphaChecked(art,'art');await alphaChecked(trust,'trust')
  const dir=path.join(root,'r819-layers',beat.id)
  fs.mkdirSync(dir,{recursive:true})
  fs.writeFileSync(path.join(dir,'art-base.png'),art,{flag:'wx'})
  for(const frame of rendered.frames){
   if(!Number.isInteger(frame.frameIndex)||frame.sha256!==null)fail('native render was not an unfinished separate mechanism frame')
   const idx='f'+String(frame.frameIndex).padStart(5,'0')
   const mechanismPath=path.join(dir,idx+'-mechanism.png')
   if(!fs.existsSync(mechanismPath))fail('physical mechanism pixels missing')
   const mechanism=fs.readFileSync(mechanismPath)
   await alphaChecked(mechanism,'mechanism')
   fs.writeFileSync(path.join(dir,idx+'-trust.png'),trust,{flag:'wx'})
   const composite=await sharp(art,{failOn:'error'}).ensureAlpha().composite([
    {input:mechanism,blend:'over'},{input:trust,blend:'over'}])
    .png({compressionLevel:9,adaptiveFiltering:false}).toBuffer()
   const expected='r818-frames/'+beat.id+'/'+idx+'.png'
   if(frame.file!==expected)fail('physical native frame path was replaced')
   const out=path.join(root,expected)
   fs.writeFileSync(out,composite,{flag:'wx'})
   frame.sha256=sha(composite);total++
  }
 }
 native.frameCount=total
 fs.writeFileSync(file,JSON.stringify(native,null,2)+'\n')
 verifyR818NativeFrames(root,native,scenes)
 const inventory=authorR819LayerInventory(root,native)
 const layers=verifyR819LayerInventory(root,inventory,native)
 if(layers.totalFrames!==total)fail('independent compositor missing a rendered frame')
 const proofs=[]
 const scratch=path.join(root,'r819-native-pixel-recheck.png')
 for(let i=0;i<layers.sequence.beats.length;i++){
  const b=layers.sequence.beats[i]
  for(let n=0;n<b.frames.length;n++){
   const proof=await compositeR819Frame(root,b,b.frames[n],native.beats[i].frames[n],scratch)
   proofs.push([proof.beatId,proof.frameIndex,proof.outputSha256])
   fs.unlinkSync(scratch)
  }
 }
 const receipt={schemaVersion:'ths-r818-r819-same-pass-native-v1',
  status:'REAL_PHYSICAL_OBJECT_PIXELS_SOURCE_SEPARATED_PIXEL_MATCH_REVIEW_ONLY',
  frameCount:total,beatCount:plan.length,
  rendererAssemblyCodeSha256:sha(fs.readFileSync(fileURLToPath(import.meta.url))),
  artSequenceSha256:inventory.sha256,
  physicalRenderJobSha256:sha(fs.readFileSync(path.join(root,'r818-physical-job.json'))),
  physicalNativeSequenceSha256:sha(fs.readFileSync(file)),
  pixelProofSha256:sha(JSON.stringify(proofs)),samePassMechanicalIntegrity:true,
  scienceApproved:false,wordAlignmentApproved:false,craftApproved:false,
  publicationApproved:false,canonicalFirstFilm:false}
 fs.writeFileSync(path.join(root,'r818-r819-native-separation-receipt.json'),
  JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
 return receipt
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assembleSamePassNative(process.argv[2]).then(x=>console.log(JSON.stringify(x)))
  .catch(e=>{console.error(e.stack||e.message);process.exitCode=1})
}
