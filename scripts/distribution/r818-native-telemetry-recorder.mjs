import fs from 'node:fs'
import path from 'node:path'
import { assertR818TelemetryBinding } from './r818-telemetry-qa.mjs'
const hex=v=>/^[a-f0-9]{64}$/.test(String(v??''))
const MODES=new Set(['native-svg-geometry','native-vtk-projection','native-blender-projection'])
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
 finalize(plan,{outputFile}={}){
  const telemetry={...this.header,beats:(plan?.beats||[]).map(b=>{
    const record=this.beats.get(b.id)
    if(!record)throw Error('R8.18 missing instrumentation for semantic beat '+b.id)
    return {...record,frames:record.frames.slice().sort((a,b)=>a.nativeFrameIndex-b.nativeFrameIndex)}
  })}
  const audit=assertR818TelemetryBinding(plan,telemetry,this.header)
  if(!outputFile)throw Error('R8.18 recorder needs an explicit sidecar output path')
  const target=path.resolve(outputFile)
  if(path.basename(target)!=='r818-telemetry.json')throw Error('R8.18 canonical sidecar filename required')
  fs.writeFileSync(target,JSON.stringify(telemetry,null,2)+'\n',{flag:'wx'})
  return {path:target,telemetry,audit}
 }
}
