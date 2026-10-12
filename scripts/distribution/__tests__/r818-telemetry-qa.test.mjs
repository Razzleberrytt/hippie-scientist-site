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
 {beatId:'docking',producer:{instrumentation:'native-vtk-projection'},metrics:{longestNativePocketDwellFrames:12},
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

test('five-frame sample approximation alone cannot satisfy ten native frames',()=>{
 const {p,t}=fixture()
 t.beats[0].metrics.longestNativePocketDwellFrames=8
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/ten consecutive native/)
})


test('first-three-second product-to-receptor reveal binds actual visibility and labels',()=>{
 const {p,t}=fixture()
 p.beats=[{id:'hook',start:0,end:3,semanticAction:'reveals-hidden-action',
  visualObject:{kind:'retail-bottle',name:'Generic retail bottle'},
  telemetryProof:{primaryObjectId:'bottle',subjectObjectId:'bottle',
   targetObjectId:'receptor',beforeLabel:'Generic retail bottle',
   afterLabel:'Symbolic mu-opioid receptor activation'}}]
 t.beats=[{beatId:'hook',producer:{instrumentation:'native-vtk-projection'},
  frames:Array.from({length:15},(_,i)=>({time:i*.2,objects:[
    object('bottle','retail-bottle','Generic retail bottle',[20,15,35,65],null,
     {visible:i<11,opacity:i<11?1:0}),
    object('receptor','receptor-binding','Symbolic mu-opioid receptor activation',
     [48,20,45,60],null,{visible:i>3,opacity:i>3?1:0})
   ]}))}]
 expect(assertR818TelemetryBinding(p,t).actionReports[0].semanticAction).toBe('reveals-hidden-action')
 for(const f of t.beats[0].frames){const receptor=f.objects.find(o=>o.objectId==='receptor');receptor.visible=true;receptor.opacity=1}
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/hidden target/)
})

function longUserReports(highlightCards){
 const {p,t}=fixture()
 p.beats=[{id:'user-reports',start:0,end:13,semanticAction:'activates',
   visualObject:{kind:'experience-card',name:'Qualitative reports'},
   telemetryProof:{primaryObjectId:'card0',subjectObjectId:'card0',targetObjectId:'card0'}}]
 t.beats=[{beatId:'user-reports',producer:{instrumentation:'native-2d-canvas-geometry'},
   frames:Array.from({length:65},(_,i)=>({
     time:i*.2,objects:[
       ...Array.from({length:6},(_,card)=>object('card'+card,'experience-card',
         'Report '+card,[10+(card%2)*43,10+Math.floor(card/2)*28,36,23],null,{
           activationLevel:i/64,
           emphasisLevel:highlightCards ? Number(Math.floor(i/10)%6===card) : 0
         })),
       object('caption','karaoke-word','Spoken word '+i,[i%20,91,20,5])
     ]
   }))}]
 return {p,t}
}
test('13-second static user report cards fail despite changing word-level karaoke captions',()=>{
 const {p,t}=longUserReports(false)
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/caption-only or insufficient compositional activity/)
})
test('sequential narration-timed emphasis of six user report cards passes long-beat composition QA',()=>{
 const {p,t}=longUserReports(true)
 const report=assertR818TelemetryBinding(p,t).actionReports[0].compositionalActivity
 expect(report.changedThreeSecondWindows).toBeGreaterThanOrEqual(3)
 expect(report.changedArtObjectCount).toBeGreaterThanOrEqual(3)
 expect(report.assessment).toMatch(/not-caption/)
})
test('a single early highlight does not excuse the rest of a 13-second static card beat',()=>{
 const {p,t}=longUserReports(true)
 for(let i=0;i<t.beats[0].frames.length;i++){
   for(const card of t.beats[0].frames[i].objects.filter(o=>o.kind==='experience-card')){
     card.emphasisLevel=Number(card.objectId==='card0'&&i>=10)
   }
 }
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/insufficient compositional activity/)
})

test('moving PMID and brand overlays cannot masquerade as scene compositional activity',()=>{
 const {p,t}=longUserReports(false)
 for(let i=0;i<t.beats[0].frames.length;i++){
  t.beats[0].frames[i].objects.push(
   object('pmid','pmid-footer','PMID: verified',[i%20,4,24,7]),
   object('brand','brand-label','The Hippie Scientist',[i%20,14,24,7])
  )
 }
 expect(()=>assertR818TelemetryBinding(p,t)).toThrow(/caption-only or insufficient compositional activity/)
})
