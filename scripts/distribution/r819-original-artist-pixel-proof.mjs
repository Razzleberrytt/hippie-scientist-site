import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import {authorR819LayerInventory} from './r819-layer-inventory-writer.mjs'
import {compositeR819Frame} from './r819-native-layer-compositor.mjs'
import {assertR819NoBakedFactualPlate} from './r819-canonical-handoff.mjs'
import {verifyR819RealR818ProductionHandoff} from './r819-r818-physical-origin.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const hex=s=>/^[a-f0-9]{64}$/.test(String(s??''))
const safe=s=>/^[a-zA-Z0-9_-]{1,70}$/.test(String(s??''))
function hold(why){throw Error('R8.19 separated original artist HOLD: '+why)}
function read(root,ref,expected){
 if(ref?.file!==expected||!hex(ref.sha256))hold('exact role/file/SHA binding missing: '+expected)
 const file=path.resolve(root,ref.file)
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()||
    !fs.realpathSync(file).startsWith(root+path.sep))hold('source path escape/symlink/missing')
 const bytes=fs.readFileSync(file)
 if(bytes.length<100||bytes.length>16_000_000||sha(bytes)!==ref.sha256)
  hold('source layer SHA or size changed: '+expected)
 return bytes
}
async function checkPng(bytes,kind){
 const meta=await sharp(bytes,{failOn:'error'}).metadata()
 if(meta.format!=='png'||meta.width!==1080||meta.height!==1920||
    (kind!=='art'&&!meta.hasAlpha))
  hold('source role is not authentic native RGBA PNG: '+kind)
 if(kind!=='art'){
  const a=await sharp(bytes).extractChannel('alpha').stats()
  if(a.channels[0].max===0||a.channels[0].min!==0)
   hold('mechanism/trust must be visible but genuinely transparent: '+kind)
 }
}
// This stage PROVES only pixel-level separation of SOURCE assets from a caller
// supplied native-frame sequence. It never forges R8.18 render instrumentation,
// R8.10 word timing, scientific/creative review, or a publication approval.
export async function authorR819OriginalArtistPixelProof(packageDir,{nativeSequence,plan,source,scenes,requireSamePassR818=false}={}){
 const root=path.resolve(packageDir||'')
 if(!Array.isArray(nativeSequence?.beats)||!nativeSequence.beats.length||
    !Number.isInteger(nativeSequence.frameCount)||
    nativeSequence.frameCount!==nativeSequence.beats.reduce((n,b)=>n+(b.frames?.length||0),0))
  hold('caller must supply contiguous native 30fps frame inventory')
 assertR819NoBakedFactualPlate(plan)
 const realOrigin=requireSamePassR818?
  verifyR819RealR818ProductionHandoff(root,{nativeSequence,plan,scenes}):null
 if(source?.schemaVersion!=='ths-r819-original-artist-role-ledger-v1'||
    !hex(source.artistGeneratorSha256)||!hex(source.sourceContentSha256)||
    !/^https:\/\//.test(source.sourceUrl||'')||
    source.status!=='REVIEW_ONLY'||
    !Array.isArray(source.beats)||source.beats.length!==nativeSequence.beats.length)
  hold('original artist source/evidence lineage missing')
 if(realOrigin){
  // The same-pass physical job is only meaningful for THIS source snapshot
  // and THESE claim IDs, not an unrelated video with visually matching pixels.
  const job=JSON.parse(fs.readFileSync(path.join(root,'r818-physical-job.json'),'utf8'))
  const expectedSource=sha(JSON.stringify({
   sourceUrl:source.sourceUrl,sourceContentHash:source.sourceContentSha256
  }))
  if(job.sourceManifestSha256!==expectedSource)
   hold('source-ledger snapshot is not the actual physical rendering source')
  for(let i=0;i<source.beats.length;i++){
   const b=source.beats[i],p=plan.beats[i]
   if(b.beatId!==p.id||!p.claimIds?.includes(b.claimId)||
      !Array.isArray(p.onScreenSourceIds)||!p.onScreenSourceIds.length)
    hold('source-layer claim is not authenticated in original physical storyboard')
  }
 }

 if(fs.existsSync(path.join(root,'r819-original-artist-pixel-proof.json'))||
    fs.existsSync(path.join(root,'r819-layer-sequence.json')))
  hold('create-only proof/inventory already exists; never silently re-sign')
 const previews=[]
 for(let i=0;i<source.beats.length;i++){
  const beat=source.beats[i],native=nativeSequence.beats[i]
  if(beat.beatId!==native.beatId||!safe(beat.beatId)||
     !String(beat.claimId||'').trim()||beat.factualTextLocation!=='trust-only'||
     beat.r819BackgroundEligible!==true||
     !Array.isArray(beat.frames)||beat.frames.length!==native.frames.length)
   hold('source-separated beat identity, claim or factual roles invalid')
  const prefix='r819-layers/'+beat.beatId+'/'
  await checkPng(read(root,beat.art,prefix+'art-base.png'),'art')
  for(let j=0;j<beat.frames.length;j++){
   const frame=beat.frames[j]
   if(frame.frameIndex!==j||native.frames[j]?.frameIndex!==j)hold('native/source frame order drift')
   const stem=prefix+'f'+String(j).padStart(5,'0')
   await checkPng(read(root,frame.mechanism,stem+'-mechanism.png'),'mechanism')
   await checkPng(read(root,frame.trust,stem+'-trust.png'),'trust')
  }
  previews.push({beatId:beat.beatId,claimId:beat.claimId,frameCount:beat.frames.length})
 }
 // Reuse *existing* inventory author and strict native compositor. This is NOT
 // an alternate R8.19 encoder and any pixel mismatch aborts before a success
 // receipt, even if the layer hashes were manually re-signed.
 const inventory=authorR819LayerInventory(root,nativeSequence)
 const doc=JSON.parse(fs.readFileSync(path.join(root,inventory.file),'utf8'))
 const proofDir=path.join(root,'r819-artist-pixel-proofs')
 fs.mkdirSync(proofDir,{recursive:true})
 const frameHashes=[]
 for(let i=0;i<doc.beats.length;i++){
  const beat=doc.beats[i],native=nativeSequence.beats[i]
  for(let j=0;j<beat.frames.length;j++){
   const output=path.join(proofDir,beat.beatId+'-f'+String(j).padStart(5,'0')+'.png')
   const result=await compositeR819Frame(root,beat,beat.frames[j],native.frames[j],output)
   frameHashes.push(result.outputSha256)
  }
 }
 const receipt={schemaVersion:'ths-r819-original-artist-pixel-proof-v1',
  status:'SOURCE_SEPARATED_PIXEL_MATCH_REVIEW_ONLY',beatCount:doc.beats.length,
  frameCount:frameHashes.length,inventorySha256:inventory.sha256,
  sourceArtistGeneratorSha256:source.artistGeneratorSha256,
  sourceLedgerSha256:sha(Buffer.from(JSON.stringify(source))),
  completeDecodedFrameLedgerSha256:sha(Buffer.from(JSON.stringify(frameHashes))),
  claims:previews,
  originalR818RendererTelemetryIndependentlyVerified:Boolean(realOrigin),
  r818SamePassMechanicalReceipt:realOrigin,
  authenticR810WordAlignmentVerified:false,independentScienceReview:false,
  humanArtCraftReview:false,publicationApproved:false,canonicalFirstRender:false}
 fs.writeFileSync(path.join(root,'r819-original-artist-pixel-proof.json'),
  JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
 return receipt
}
