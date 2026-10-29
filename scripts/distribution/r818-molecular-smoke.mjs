#!/usr/bin/env node
// One exact 3.4-second native R8.18 source-locked molecule camera preview.
// Unlike the old ad-hoc 7-OH experiment, invokes canonical provider, actual
// RDKit/VTK pixels, same-pass telemetry, native PNG SHA checks, and contact sheet.
// REVIEW ONLY: this does not claim science, narration or publication approval.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {createR818PhysicalCinemaProvider} from './r818-physical-cinema-provider.mjs'
import {verifyR818NativeFrames} from './r818-native-frame-sequence.mjs'
import {assertR818TelemetryBinding} from './r818-telemetry-qa.mjs'
import {renderR818ContactSheet} from './r818-render-contact-sheet.mjs'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
const run=(cmd,args,timeout=420000)=>{
 const r=spawnSync(cmd,args,{encoding:'utf8',timeout,maxBuffer:1500000})
 if(r.status!==0)throw Error('R8.18 molecular preview '+cmd+' failed: '+String(r.stderr||r.error||'').slice(-1300))
 return String(r.stdout||'')
}
const outputDir=path.resolve(process.argv[2]||path.join(os.tmpdir(),'ths-r818-molecular-proof'))
fs.mkdirSync(outputDir,{recursive:true})
const codeSha=sha(fs.readFileSync(fileURLToPath(new URL('./r818_source_molecule.py',import.meta.url))))
const provider=createR818PhysicalCinemaProvider({timeoutMs:8*60*1000})
const sourceUrl='https://pubchem.ncbi.nlm.nih.gov/compound/44301524'
const beat={id:'7oh-hydroxyl-source-focus',semanticAction:'source-locked-molecular-focus',
 artMethod:'rendered-3d',molecularRuntimeSha256:codeSha,
 molecularIdentity:{pubchemCid:44301524,formula:'C23H30N2O5',
  inchiKey:'RYENLSMHLCNXJT-CYXFISRXSA-N',url:sourceUrl},
 visualObject:{kind:'source-verified-molecule',name:'Computed PubChem 7-OH structure',
  assetSha256:provider.sourceCodeSha256},
 telemetryProof:{sourceClaimId:'STRUCTURE-PUBCHEM-44301524',
  subjectObjectId:'molecule',primaryObjectId:'molecule',targetObjectId:'hydroxyl',
  beforeLabel:'Computed 7-OH conformer',afterLabel:'Source-verified hydroxyl oxygen'},
 claimIds:['STRUCTURE-PUBCHEM-44301524'],onScreenSourceIds:['PubChem:44301524']}
const scenes=[{beatId:beat.id,start:0,end:3.4,role:'mechanism'}]
const assets=[{beatId:beat.id,sha256:sha('source-locked-7oh-molecular-native-shot')}]
const rendererCodeSha256=sha('source-verified-original-molecule-native-geometry-review')
const sourceContentHash=sha('source-record-identity-verified-with-rdkit-not-publication-approval')
provider.nativeFrameRenderer({outputDir,scenes,assets,
 canonicalFirstPassPlan:{beats:[beat]},rendererCodeSha256,sourceUrl,sourceContentHash})
provider.rendererGeometryRecorder({outputDir,rendererCodeSha256,
 renderedSceneAssetsSha256:sha(assets.map(a=>a.sha256).join('|')),
 sourceManifestSha256:sha(JSON.stringify({sourceUrl,sourceContentHash}))})
const seq=JSON.parse(fs.readFileSync(path.join(outputDir,'r818-native-frames.json'),'utf8'))
const native=verifyR818NativeFrames(outputDir,seq,scenes)
if(native.frameCount!==102)throw Error('R8.18 native molecular footage did not produce 102 30fps frames')
const trace=JSON.parse(fs.readFileSync(path.join(outputDir,'r818-telemetry.json'),'utf8'))
const checked=assertR818TelemetryBinding({beats:[beat]},trace,{
 rendererCodeSha256,renderedSceneAssetsSha256:trace.renderedSceneAssetsSha256})
if(checked.actionReports[0].cameraTravelDistance<12)
 throw Error('R8.18 source-locked molecule camera did not change focal composition')
const numbered=path.join(outputDir,'numbered');fs.mkdirSync(numbered,{recursive:true})
let i=0
for(const part of native.beats)for(const f of part.frames)
 fs.linkSync(path.join(outputDir,f.file),path.join(numbered,'f'+String(i++).padStart(5,'0')+'.png'))
const file=path.join(outputDir,'r818-molecular-camera_REVIEW_ONLY_SILENT.mp4')
run('ffmpeg',['-hide_banner','-v','error','-y','-framerate','30','-start_number','0',
 '-i',path.join(numbered,'f%05d.png'),'-frames:v','102','-c:v','libx264',
 '-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',
 '-an',file],9*60*1000)
const decoded=JSON.parse(run('ffprobe',['-v','error','-select_streams','v:0',
 '-count_frames','-show_entries','stream=codec_name,width,height,avg_frame_rate,nb_read_frames',
 '-of','json',file]))
const stream=decoded.streams?.[0]
if(stream?.codec_name!=='h264'||stream.width!==1080||stream.height!==1920||
 stream.avg_frame_rate!=='30/1'||Number(stream.nb_read_frames)!==102)
 throw Error('R8.18 molecular preview actual decoded frame dimensions are incorrect')
const sheet=await renderR818ContactSheet({masterMp4:file,
 beats:scenes.map(s=>({...s,id:s.beatId})),outputDir})
const receipt={status:'SOURCE_BOUND_NATIVE_CAMERA_MOTION_TECHNICAL_PASS_REVIEW_ONLY',
 file:path.basename(file),mp4Sha256:sha(fs.readFileSync(file)),frameCount:102,
 sourceRecord:sourceUrl,identity:beat.molecularIdentity,
 molecularRuntimeSha256:codeSha,physicalRendererSha256:provider.sourceCodeSha256,
 telemetrySha256:sha(fs.readFileSync(path.join(outputDir,'r818-telemetry.json'))),
 contactSheet:path.basename(sheet.sheetFile),contactSheetSha256:sheet.proof.contactSheetSha256,
 qualifiedScienceReview:false,independentCraftReview:false,narrationAttached:false,
 firstRenderMilestone:false,mayPublish:false}
fs.writeFileSync(path.join(outputDir,'r818-molecular-proof-review-receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt))
