import {test,expect} from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {R818NativeGeometryRecorder} from '../r818-native-telemetry-recorder.mjs'
const h=v=>v.repeat(64)
const plan={beats:[{id:'count',start:0,end:3,
  semanticAction:'count-up-then-settle',visualObject:{name:'Counter',kind:'animated-counter'},
  telemetryProof:{primaryObjectId:'counter',subjectObjectId:'counter'},
  numericVisual:{finalDisplay:'892'}}]}
test('native renderer recorder samples actual 30fps indices into 5fps, writes exact sidecar and self-validates',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'r818-test-'))
 try {
  const r=new R818NativeGeometryRecorder({rendererCodeSha256:h('a'),renderedSceneAssetsSha256:h('b'),
    sourceManifestSha256:h('c'),canvas:{width:100,height:100}})
  for(let i=0;i<15;i++){
    const v=i>=10?892:Math.round(i*892/10)
    r.recordActualFrame({beatId:'count',nativeFrameIndex:i*6,producer:{instrumentation:'native-svg-geometry'},
     objects:[{objectId:'counter',kind:'animated-counter',label:i>=10?'892':String(v),
       bbox:[20,30,50,20],zIndex:1,visible:true,opacity:1,value:v}]})
  }
  const result=r.finalize(plan,{outputFile:path.join(temp,'r818-telemetry.json')})
  expect(result.audit.status).toBe('RENDERER_TELEMETRY_CHECKED_NOT_PIXEL_CERTIFIED')
  expect(result.audit.framesChecked).toBe(15)
  const written=JSON.parse(fs.readFileSync(result.path,'utf8'))
  expect(written.beats[0].frames[14].nativeFrameIndex).toBe(84)
  expect(()=>r.finalize(plan,{outputFile:result.path})).toThrow(/EEXIST/)
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
})
test('instrumentation cannot sample arbitrary frames or invent unsupported geometry source',()=>{
 const r=new R818NativeGeometryRecorder({rendererCodeSha256:h('a'),renderedSceneAssetsSha256:h('b'),sourceManifestSha256:h('c')})
 const obj={objectId:'p',kind:'animated-counter',label:'0',bbox:[0,0,50,50],zIndex:1,value:0}
 expect(()=>r.recordActualFrame({beatId:'beat',nativeFrameIndex:7,
   producer:{instrumentation:'native-svg-geometry'},objects:[obj]})).toThrow(/native renderer geometry/)
 expect(()=>r.recordActualFrame({beatId:'beat',nativeFrameIndex:6,
   producer:{instrumentation:'handwritten-storyboard'},objects:[obj]})).toThrow(/native renderer geometry/)
})


test('recorder counts exactly consecutive native in-pocket frames, not isolated samples',()=>{
 const r=new R818NativeGeometryRecorder({rendererCodeSha256:h('a'),
  renderedSceneAssetsSha256:h('b'),sourceManifestSha256:h('c')})
 for(let index=0;index<14;index++)
  r.recordNativePocketFrame({beatId:'docking',nativeFrameIndex:index,
   ligandBBox:index<4?[0,0,5,5]:[65,45,6,6],pocketBBox:[60,40,20,20]})
 expect(r.nativePocket.get('docking').longest).toBe(10)
 // A missing native frame breaks continuity.
 r.recordNativePocketFrame({beatId:'docking',nativeFrameIndex:20,
  ligandBBox:[65,45,6,6],pocketBBox:[60,40,20,20]})
 expect(r.nativePocket.get('docking').current).toBe(1)
})
