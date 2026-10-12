import { test,expect } from 'vitest'
import { assertR818TelemetryBinding } from '../r818-telemetry-qa.mjs'
const h=n=>n.repeat(64)
const object=(id,kind,label,bbox,value,extra={})=>({objectId:id,kind,label,bbox,zIndex:1,visible:true,opacity:1,value,...extra})
const plan=()=>({beats:[
 {id:'docking',start:0,end:3,semanticAction:'ligand-enters-pocket',
  visualObject:{kind:'receptor-binding',name:'μ receptor'},
  telemetryProof:{primaryObjectId:'ligand',subjectObjectId:'receptor',targetObjectId:'pocket'}},
 {id:'count',start:3,end:6,semanticAction:'count-up-then-settle',
  visualObject:{kind:'animated-counter',name:'stat'},
  telemetryProof:{primaryObjectId:'number',subjectObjectId:'number'},
  numericVisual:{finalDisplay:'892'}}
]})
function fixture(){
 const p=plan()
 const t={schemaVersion:'ths-r818-renderer-telemetry-v1',origin:'render-instrumentation',
 rendererCodeSha256:h('a'),renderedSceneAssetsSha256:h('b'),sourceManifestSha256:h('c'),
 canvas:{width:100,height:100},sampleFps:5,nativeFps:30,beats:[
 {beatId:'docking',producer:{instrumentation:'native-vtk-projection'},
  frames:Array.from({length:15},(_,i)=>({time:i*.2,objects:[
    object('receptor','receptor-binding','μ receptor',[55,30,30,40]),
    object('pocket','binding-pocket','Pocket',[60,40,20,20]),
    object('ligand','ligand','Tianeptine',[i*4.45,46,6,6])]}))},
 {beatId:'count',producer:{instrumentation:'native-svg-geometry'},
  frames:Array.from({length:15},(_,i)=>{
    const value=i>=10?892:Math.round(i*892/10)
    return {time:3+i*.2,objects:[
      object('number','animated-counter',i>=10?'892':String(value),[35,40,25,16],value)
    ]}
  })}
 ]}
 return {p,t}
}
test('telemetry verifies real projected ligand movement and exact one-second count-up settle',()=>{
 const {p,t}=fixture()
 const proof=assertR818TelemetryBinding(p,t,{
 rendererCodeSha256:h('a'),renderedSceneAssetsSha256:h('b')})
 expect(proof.status).toBe('RENDERER_TELEMETRY_CHECKED_NOT_PIXEL_CERTIFIED')
 expect(proof.beatCount).toBe(2)
 expect(proof.actionReports[0].dwellSamples).toBeGreaterThanOrEqual(2)
 expect(proof.actionReports[1].settledSamples).toBeGreaterThanOrEqual(5)
})
test('a fake renderer report cannot pass if ligand never enters pocket',()=>{
 const {p,t}=fixture()
 for(const f of t.beats[0].frames)f.objects.find(o=>o.objectId==='ligand').bbox[0]=5
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/ligand must approach/)
})
test('telemetry cannot certify a bad graphic 21.1% or +574% in place of the claim',()=>{
 const {p,t}=fixture()
 for(const f of t.beats[1].frames.slice(10)){f.objects[0].value=574;f.objects[0].label='+574%'}
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/wrong canonical value/)
})
test('reported object kinds must match scene subject rather than a planned name',()=>{
 const {p,t}=fixture()
 for(const f of t.beats[0].frames)f.objects.find(o=>o.objectId==='receptor').kind='floating-spheres'
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/visualObject.kind/)
})
test('missing telemetry for a beat or uninstrumented arbitrary action fails closed',()=>{
 const {p,t}=fixture()
 t.beats.pop()
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/coverage/)
 const other=fixture()
 other.p.beats[0].semanticAction='stare-at-bottle'
 expect(()=>assertR818TelemetryBinding(other.p,other.t)).toThrow(/uninstrumented semantic action/)
})
test('stable shared telemetry must be SHA-bound to actual scene source assets',()=>{
 const {p,t}=fixture()
 expect(()=>assertR818TelemetryBinding(p,t,{rendererCodeSha256:h('d')})).toThrow(/source identity/)
 expect(()=>assertR818TelemetryBinding(p,t,{renderedSceneAssetsSha256:h('e')})).toThrow(/asset identity/)
})
