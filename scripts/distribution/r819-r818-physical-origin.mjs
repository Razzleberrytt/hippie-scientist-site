import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {verifyR818NativeFrames} from './r818-native-frame-sequence.mjs'
import {assertR818TelemetryBinding} from './r818-telemetry-qa.mjs'
import {fileURLToPath} from 'node:url'

const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const codePath=fileURLToPath(new URL('./r818-physical-cinema.py',import.meta.url))
const hex=s=>/^[0-9a-f]{64}$/.test(String(s??''))
function hold(message){throw Error('R8.19 exact R8.18 production handoff HOLD: '+message)}
function read(root,file){
 const abs=path.resolve(root,file)
 if(!abs.startsWith(root+path.sep)||!fs.existsSync(abs)||
    !fs.statSync(abs).isFile()||!fs.realpathSync(abs).startsWith(root+path.sep))
  hold('missing/escaping same-pass producer file '+file)
 return fs.readFileSync(abs)
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}

/** Independent check of actual native PNG bytes, same-pass job identity and
 * physical renderer generated 5fps semantic telemetry.
 *
 * A source-layer pixel match without this producer lineage stays an ordinary
 * PREPRODUCTION review proof. This function is NOT publication approval:
 * caller-produced receipts are evidence of local consistency, not signatures.
 */
export function verifyR819RealR818ProductionHandoff(packageDir,{plan,scenes,nativeSequence}={}){
 const root=path.resolve(packageDir||'')
 if(!Array.isArray(plan?.beats)||!plan.beats.length||
    !Array.isArray(scenes)||scenes.length!==plan.beats.length||
    !Array.isArray(nativeSequence?.beats)||nativeSequence.beats.length!==plan.beats.length)
  hold('actual source plan, timed scenes and native 30fps sequence required')
 const jobBytes=read(root,'r818-physical-job.json')
 const job=JSON.parse(jobBytes.toString('utf8'))
 const traceBytes=read(root,'r818-telemetry.json')
 const t=JSON.parse(traceBytes.toString('utf8'))
 const doc=JSON.parse(read(root,'r818-native-frames.json').toString('utf8'))
 if(!same(job.plan?.beats,plan.beats)||!same(job.scenes,scenes)||
    !same(doc.beats,nativeSequence.beats)||
    doc.schemaVersion!==nativeSequence.schemaVersion||
    doc.fps!==nativeSequence.fps||doc.width!==nativeSequence.width||
    doc.height!==nativeSequence.height)
  hold('caller-supplied native sequence or beat plan differs from real producer job/files')
 if(!hex(job.physicalRendererSha256)||
    job.physicalRendererSha256!==sha(fs.readFileSync(codePath))||
    !hex(job.rendererCodeSha256)||
    t.rendererCodeSha256!==job.rendererCodeSha256||
    t.renderedSceneAssetsSha256!==job.renderedSceneAssetsSha256||
    t.sourceManifestSha256!==job.sourceManifestSha256||
    t.physicalArtManifestSha256!==job.physicalArtManifestSha256||
    job.physicalArtManifestSha256!==sha(JSON.stringify(job.physicalArt)))
  hold('physical renderer source, scene, or original-art identity mismatch')
 for(const roles of Object.values(job.physicalArt||{})){
  for(const asset of Object.values(roles||{})){
   if(!asset?.file?.startsWith('r818-physical-assets/')||!hex(asset.sha256)||
      sha(read(root,asset.file))!==asset.sha256)
    hold('staged artwork bytes no longer match real native renderer')
  }
 }
 const separated=Object.values(job.physicalArt||{}).some(r=>r.art||r.trust)
 if(separated){
  const proof=JSON.parse(read(root,'r818-r819-native-separation-receipt.json'))
  const sourceFile=fileURLToPath(new URL('./r818-r819-separated-assembly.mjs',import.meta.url))
  if(proof?.samePassMechanicalIntegrity!==true||
     proof.rendererAssemblyCodeSha256!==sha(fs.readFileSync(sourceFile))||
     proof.physicalRenderJobSha256!==sha(jobBytes)||
     proof.physicalNativeSequenceSha256!==sha(read(root,'r818-native-frames.json'))||
     proof.publicationApproved!==false)
   hold('same-pass R8.19 original-art assembly identity or fail-closed receipt differs')
 }
 const native=verifyR818NativeFrames(root,doc,scenes)
 if(nativeSequence.frameCount!==undefined&&nativeSequence.frameCount!==native.frameCount)
  hold('native frame count was re-declared')
 const geometry=assertR818TelemetryBinding(plan,t,{
   rendererCodeSha256:job.rendererCodeSha256,
   renderedSceneAssetsSha256:job.renderedSceneAssetsSha256
 })
 return {
  status:'R818_NATIVE_PHYSICAL_RENDER_AND_GEOMETRY_LINK_VERIFIED_NOT_APPROVED',
  frameCount:native.frameCount,beatCount:geometry.beatCount,
  physicalRendererSha256:job.physicalRendererSha256,
  jobSha256:sha(jobBytes),nativeFrameInventorySha256:sha(read(root,'r818-native-frames.json')),
  telemetrySha256:sha(traceBytes),
  actualOriginalArtStagedCount:Object.values(job.physicalArt||{})
    .reduce((count,roles)=>count+Object.keys(roles||{}).length,0),
  verifiedScientificClaims:false,verifiedHumanCraft:false,wordAlignedVoice:false,
  publicationApproved:false
 }
}
