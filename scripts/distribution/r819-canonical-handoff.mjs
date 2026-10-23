import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import {verifyR810WordAlignment} from './r810-package-qa.mjs'
import {assertR818TelemetryBinding} from './r818-telemetry-qa.mjs'
import {verifyR819ArtAssets,verifyR819WowGates} from './r819-art-verifier.mjs'
import {verifyR819CueBinding} from './r819-acoustic-cue-binding.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const hex=v=>/^[a-f0-9]{64}$/.test(String(v??''))
function boundJson(dir, meta, name){
 if(!meta||meta.file!==name||!hex(meta.sha256))throw Error('R8.19 '+name+' missing pinned receipt')
 const bytes=fs.readFileSync(path.join(dir,name))
 if(sha(bytes)!==meta.sha256)throw Error('R8.19 '+name+' bytes differ from manifest SHA')
 return JSON.parse(bytes.toString('utf8'))
}
// Flat original artist cards containing factual words, dates or citations
// cannot become the R8.19 nonfactual art base simply because their PNG SHA
// and final recomposed pixels match. The artist must export separate
// factual TRUST and nonfactual ART source layers and rebuild the plan.
export function assertR819NoBakedFactualPlate(plan){
 if(!Array.isArray(plan?.beats))throw Error('R8.19 canonical source-beat inventory missing')
 for(const beat of plan.beats){
  if(beat?.physicalArt?.plate)
   throw Error('R8.19 HOLD: original teaching plate contains source/factual text; rebuild independent ART and TRUST before canonical handoff: '+beat.id)
 }
 return true
}
export function verifyR819CanonicalHandoff(packageDir){
 const dir=path.resolve(packageDir)
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'video-asset-manifest.json'),'utf8'))
 if(manifest?.r819?.enabled!==true||manifest.creativeMethodRelease!=='R8.10'||
    manifest.r819.compositorRelease!=='R8.19'||
    manifest.r819.renderMode!=='native-separated-art-mechanism-trust'||
    manifest.r812?.enabled!==true)
  throw Error('R8.19 requires native separate layers, R8.10 acoustic lineage and mandatory final -14 LUFS QA')
 // R8.10 checks actual WAV/script/raw MFA+dictionary/acoustic hashes and exact human
 // listening receipt. A made-up JSON array of approximate card cue times cannot pass.
 const alignment=verifyR810WordAlignment(dir)
 const board=boundJson(dir,manifest.r819.storyboard,'r819-storyboard.json')
 const geometry=boundJson(dir,manifest.r819.telemetry,'r819-object-telemetry.json')
 const plan=boundJson(dir,manifest.r817FirstPass,'r817-first-pass.json')
 assertR819NoBakedFactualPlate(plan)
 const r818=boundJson(dir,manifest.r818Telemetry,'r818-telemetry.json')
 const verifiedR818=assertR818TelemetryBinding(plan,r818,{
   rendererCodeSha256:manifest.r818Telemetry.rendererCodeSha256,
   renderedSceneAssetsSha256:manifest.r818Telemetry.renderedSceneAssetsSha256
 })
 if(geometry.rendererSha256!==verifiedR818.rendererCodeSha256||
    geometry.sourceSha256!==r818.sourceManifestSha256)
  throw Error('R8.19 semantic geometry is not tied to the R8.18 physical renderer/source')
 if(board.beats?.length!==plan.beats?.length||
   board.beats.some((b,i)=>b.id!==plan.beats[i].id||
     Math.abs(b.start-plan.beats[i].start)>.001||Math.abs(b.end-plan.beats[i].end)>.001))
  throw Error('R8.19 storyboard attempts to remap the approved R8.18 beat identities/timing')
 const artRoot=path.dirname(new URL(import.meta.url).pathname)
 const artBytes=fs.readFileSync(path.join(artRoot,'assets/r819/art-manifest.json'))
 if(manifest.r819.artManifestSha256!==sha(artBytes))
  throw Error('R8.19 canonical art manifest changed since approved package')
 const artManifest=JSON.parse(artBytes.toString('utf8'))
 const art=verifyR819ArtAssets(artRoot,artManifest,board)
 const cues=verifyR819CueBinding(board,alignment)
 const wow=verifyR819WowGates(board,geometry)
 return {schemaVersion:'ths-r819-canonical-pre-encode-v1',
  status:'INTEGRITY_CHECKED_AWAITING_ENCODED_PIXEL_AND_HUMAN_CRAFT_REVIEW',
  storyboardSha256:art.storyboardSha256,sourceSha256:r818.sourceManifestSha256,
  alignmentReceiptSha256:cues.alignmentReceiptSha256,artManifestSha256:sha(artBytes),
  rendererSha256:verifiedR818.rendererCodeSha256,
  acousticItemCount:cues.itemCount,compositionBeats:wow.perBeat.length,
  composition:wow.perBeat,publicationApproved:false}
}
