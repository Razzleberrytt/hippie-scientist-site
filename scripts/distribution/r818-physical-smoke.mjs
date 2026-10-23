#!/usr/bin/env node
// Independent physical-render smoke: produces a new 1080p review-only silent
// 3D+2D MP4, telemetry, per-beat contact sheet. Not narration or publication QA.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {createR818PhysicalCinemaProvider} from './r818-physical-cinema-provider.mjs'
import {verifyR818NativeFrames} from './r818-native-frame-sequence.mjs'
import {assertR818TelemetryBinding} from './r818-telemetry-qa.mjs'
import {renderR818ContactSheet} from './r818-render-contact-sheet.mjs'
const sha=v=>crypto.createHash('sha256').update(v).digest('hex')
function run(cmd,args,{timeout=150000,maxBuffer=3000000}={}){
 const r=spawnSync(cmd,args,{encoding:'utf8',timeout,maxBuffer})
 if(r.status!==0)throw Error('R8.18 '+cmd+' smoke failed: '+String(r.stderr||r.error||'').slice(-2000))
 return String(r.stdout||'')
}
const destination=path.resolve(process.argv[2]||path.join(os.tmpdir(),'ths-r818-physical-pilot'))
fs.mkdirSync(destination,{recursive:true})
const provider=createR818PhysicalCinemaProvider()
const timing=[3,2,3,1.5],actions=[
 {id:'hook',semanticAction:'reveals-hidden-action',artMethod:'rendered-3d',
  visualObject:{kind:'retail-bottle',name:'generic retail tianeptine packaging',
   assetSha256:provider.sourceCodeSha256},
  telemetryProof:{subjectObjectId:'bottle',primaryObjectId:'bottle',
   targetObjectId:'receptor',beforeLabel:'Generic retail bottle',
   afterLabel:'Symbolic mu-opioid receptor activation'},
  bottleLabel:'Tianeptine',onScreenSourceIds:['PMID:25026323']},
 {id:'receptor',semanticAction:'ligand-enters-pocket',artMethod:'rendered-3d',
  visualObject:{kind:'receptor-binding',name:'symbolic mu-opioid receptor',
   assetSha256:provider.sourceCodeSha256},
  telemetryProof:{subjectObjectId:'receptor',primaryObjectId:'ligand',targetObjectId:'pocket'},
  onScreenSourceIds:['PMID:25026323']},
 {id:'evidence',semanticAction:'count-up-then-settle',artMethod:'cinematic-2.5d',
  visualObject:{kind:'animated-counter',name:'reported cases'},
  numericVisual:{finalDisplay:'892'},
  telemetryProof:{subjectObjectId:'count',primaryObjectId:'count'},
  onScreenSourceIds:['PMID:39724478']},
 {id:'help',semanticAction:'reveal-emergency-guidance',artMethod:'cinematic-2.5d',
  visualObject:{kind:'emergency-sign',name:'emergency response'},
  telemetryProof:{subjectObjectId:'help-sign',primaryObjectId:'help-sign'},
  onScreenSourceIds:[]}
]
let time=0
const scenes=timing.map((length,i)=>{
 const start=time;time+=length
 return {beatId:actions[i].id,start,end:time,role:['hook','mechanism','evidence','cta'][i]}
})
const assets=actions.map((a,i)=>({beatId:a.id,sha256:sha('test-scene-svg:'+a.id)}))
const rendererCodeSha256=sha('r818-video-package-synthetic-factory-exact-source')
const sourceUrl='https://pubmed.ncbi.nlm.nih.gov/39724478/'
const sourceContentHash=sha('V-reviewed-test-reference-PMID-39724478')
const request={outputDir:destination,scenes,assets,canonicalFirstPassPlan:{beats:actions},
  rendererCodeSha256,sourceUrl,sourceContentHash}
provider.nativeFrameRenderer(request)
provider.rendererGeometryRecorder({outputDir:destination,rendererCodeSha256,
 renderedSceneAssetsSha256:sha(assets.map(a=>a.sha256).join('|')),
 sourceManifestSha256:sha(JSON.stringify({sourceUrl,sourceContentHash}))})
const trace=JSON.parse(fs.readFileSync(path.join(destination,'r818-telemetry.json')))
const telemetry=assertR818TelemetryBinding({beats:actions},trace,{
 rendererCodeSha256,renderedSceneAssetsSha256:trace.renderedSceneAssetsSha256})
const sequence=JSON.parse(fs.readFileSync(path.join(destination,'r818-native-frames.json')))
const native=verifyR818NativeFrames(destination,sequence,scenes)
const staging=path.join(destination,'numbered');fs.mkdirSync(staging,{recursive:true})
let i=0
for(const b of native.beats)for(const item of b.frames){
 fs.linkSync(path.join(destination,item.file),path.join(staging,'f'+String(i++).padStart(6,'0')+'.png'))
}
const mp4=path.join(destination,'r818-new-physical-pilot_REVIEW_ONLY_SILENT.mp4')
run('ffmpeg',['-hide_banner','-v','error','-y',
 '-framerate','30','-start_number','0','-i',path.join(staging,'f%06d.png'),
 '-frames:v',String(native.frameCount),'-c:v','libx264','-preset','fast',
 '-crf','19','-profile:v','high','-pix_fmt','yuv420p','-movflags','+faststart','-an',mp4],
 {timeout:15*60*1000})
const probe=JSON.parse(run('ffprobe',['-v','error','-select_streams','v:0','-count_frames',
 '-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_read_frames','-of','json',mp4]))
const video=probe.streams?.[0]
if(video?.codec_name!=='h264'||video.width!==1080||video.height!==1920||
 video.avg_frame_rate!=='30/1'||Number(video.nb_read_frames)!==native.frameCount)
 throw Error('R8.18 physical pilot MP4 has broken frame count or profile')
const contact=await renderR818ContactSheet({masterMp4:mp4,beats:scenes.map(s=>({...s,id:s.beatId})),
 outputDir:destination})
// Execute both new imported-art actions through the SAME physical producer,
// independent native-frame validator and object-telemetry validator, including
// tamper/missing-source negatives. This runs in the existing R8.18 hosted smoke
// workflow; no additional job, pipeline or new PR is required.
run(process.execPath,['--test','scripts/distribution/r818-physical-art-regression.mjs'],
 {timeout:6*60*1000,maxBuffer:6000000})
const result={status:'PHYSICAL_RENDERER_TECHNICAL_SMOKE_PASS; NOT RELEASE-READY',
  sourceCodeSha256:provider.sourceCodeSha256,mp4File:path.basename(mp4),
  mp4Sha256:sha(fs.readFileSync(mp4)),frames:native.frameCount,
  telemetrySha256:sha(fs.readFileSync(path.join(destination,'r818-telemetry.json'))),
  telemetryStatus:telemetry.status,decodedMp4FrameCount:Number(video.nb_read_frames),
  contactSheetFile:path.basename(contact.sheetFile),contactSheetSha256:contact.proof.contactSheetSha256,
  ownerApproval:false,independentVReview:false,wordAlignedVoice:false,publicationApproved:false}
fs.writeFileSync(path.join(destination,'r818-physical-smoke-receipt.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2))
