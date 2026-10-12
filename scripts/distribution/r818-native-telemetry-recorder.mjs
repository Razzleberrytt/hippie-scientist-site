import fs from 'node:fs'
import path from 'node:path'
import { assertR818TelemetryBinding } from './r818-telemetry-qa.mjs'
const hex=v=>/^[a-f0-9]{64}$/.test(String(v??''))
const MODES=new Set(['native-svg-geometry','native-2d-canvas-geometry','native-vtk-projection','native-blender-projection'])
// A *recording interface*, not an SVG parser and NOT synthetic storyboard data.
// Rendering engines must call recordActualFrame with their physical projected
// object bounds during composition; snapshots are rejected if not tied to the
// recorded scene source. Never infer bboxes from narrative text.
export class R818NativeGeometryRecorder {
 constructor({rendererCodeSha256,renderedSceneAssetsSha256,sourceManifestSha256,
   canvas={width:1080,height:1920},sampleFps=5,nativeFps=30}={}){
  if(![rendererCodeSha256,renderedSceneAssetsSha256,sourceManifestSha256].every(hex)||
     !(canvas.width>0&&canvas.height>0)||sampleFps!==5||nativeFps!==30)
   throw Error('R8.18 requires exact renderer/source SHA and 30fps/5fps geometry sampling')
  this.header={schemaVersion:'ths-r818-renderer-telemetry-v1',
   origin:'render-instrumentation',rendererCodeSha256,
   renderedSceneAssetsSha256,sourceManifestSha256,canvas,sampleFps,nativeFps}
  this.beats=new Map()
  this.nativePocket=new Map()
 }
 recordActualFrame({beatId,producer,nativeFrameIndex,objects}){
  if(!String(beatId||'').trim()||!MODES.has(producer?.instrumentation)||
    !Number.isInteger(nativeFrameIndex)||nativeFrameIndex<0||
    nativeFrameIndex%(this.header.nativeFps/this.header.sampleFps)!==0||
    !Array.isArray(objects)||!objects.length)
    throw Error('R8.18 recordActualFrame needs native renderer geometry at 5fps sample')
  if(!this.beats.has(beatId))this.beats.set(beatId,{beatId,producer,frames:[]})
  const entry=this.beats.get(beatId)
  if(entry.producer.instrumentation!==producer.instrumentation||
      entry.frames.some(f=>f.nativeFrameIndex===nativeFrameIndex))
    throw Error('R8.18 mixed, duplicate or spoofable frame source')
  const copied=objects.map(o=>({...o,bbox:[...o.bbox]}))
  entry.frames.push({time:nativeFrameIndex/this.header.nativeFps,
    nativeFrameIndex,objects:copied})
 }
 // Called by the compositing engine for EVERY native 30fps frame in a docking
 // shot, unlike the sparse 5fps visual telemetry snapshots.
 recordNativePocketFrame({beatId,nativeFrameIndex,ligandBBox,pocketBBox}){
  const valid=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[2]>0&&b[3]>0
  if(!String(beatId||'').trim()||!Number.isInteger(nativeFrameIndex)||nativeFrameIndex<0||
    !valid(ligandBBox)||!valid(pocketBBox))
    throw Error('R8.18 native pocket dwell requires projected 30fps ligand/pocket bounds')
  const inside=ligandBBox[0]+ligandBBox[2]/2>=pocketBBox[0]&&
    ligandBBox[0]+ligandBBox[2]/2<=pocketBBox[0]+pocketBBox[2]&&
    ligandBBox[1]+ligandBBox[3]/2>=pocketBBox[1]&&
    ligandBBox[1]+ligandBBox[3]/2<=pocketBBox[1]+pocketBBox[3]
  const prev=this.nativePocket.get(beatId)||{lastFrameIndex:-1,current:0,longest:0}
  if(nativeFrameIndex<=prev.lastFrameIndex)throw Error('R8.18 native pocket observations must be strictly chronological')
  const continuous=nativeFrameIndex===prev.lastFrameIndex+1
  const current=inside?(continuous?prev.current+1:1):0
  this.nativePocket.set(beatId,{lastFrameIndex:nativeFrameIndex,current,
    longest:Math.max(prev.longest,current)})
 }
 finalize(plan,{outputFile}={}){
  const telemetry={...this.header,beats:(plan?.beats||[]).map(b=>{
    const record=this.beats.get(b.id)
    if(!record)throw Error('R8.18 missing instrumentation for semantic beat '+b.id)
    return {...record,
      metrics:{longestNativePocketDwellFrames:this.nativePocket.get(b.id)?.longest??null},
      frames:record.frames.slice().sort((a,b)=>a.nativeFrameIndex-b.nativeFrameIndex)}
  })}
  const audit=assertR818TelemetryBinding(plan,telemetry,this.header)
  if(!outputFile)throw Error('R8.18 recorder needs an explicit sidecar output path')
  const target=path.resolve(outputFile)
  if(path.basename(target)!=='r818-telemetry.json')throw Error('R8.18 canonical sidecar filename required')
  fs.writeFileSync(target,JSON.stringify(telemetry,null,2)+'\n',{flag:'wx'})
  return {path:target,telemetry,audit}
 }
}
