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

// Source-claim-bound illustration actions: positive renderer fixtures and negative attacks.
{
const hex=c=>c.repeat(64)
const obj=(id,kind,label,bbox)=>({objectId:id,kind,label,bbox,zIndex:1,visible:true,opacity:1})
const ease=v=>v*v*(3-2*v)
function fixture(which='limitation'){
 const w=1080,h=1920,n=which==='limitation'?15:19
 const action=which==='limitation'?'evidence-boundary-panel-settles':'botanical-versus-concentrate-reveal'
 const beat={id:which,start:0,end:n/5,semanticAction:action,
   claimIds:['reviewed-limit'],onScreenSourceIds:['PMID:source-id'],
   visualObject:{kind:which==='limitation'?'evidence-boundary-card':'botanical-illustration'},
   telemetryProof:{sourceClaimId:'reviewed-limit',
     primaryObjectId:which==='limitation'?'card':'leaf',
     subjectObjectId:which==='limitation'?'card':'leaf',
     beforeLabel:which==='limitation'?'NOT A HUMAN DOSE':'Leaf (illustration)',
     ...(which==='comparison'?{targetObjectId:'product',targetKind:'product-container',
       afterLabel:'Product container (illustration)'}:{})}}
 const frames=Array.from({length:n},(_,i)=>{
   const v=ease(Math.min(1,i/5))
   return {time:i*.2,objects:which==='limitation'?[
     obj('card','evidence-boundary-card','NOT A HUMAN DOSE',[160,580+105*v,760,515]),
     obj('karaoke','karaoke-caption','spoken word',[20+i,1300,300,80])]:[
     obj('leaf','botanical-illustration','Leaf (illustration)',[180+78*v,750,240,220]),
     obj('product','product-container','Product container (illustration)',[620,770,302+53*v,425+75*v])
   ]}
 })
 const report={schemaVersion:'ths-r818-renderer-telemetry-v1',origin:'render-instrumentation',
   rendererCodeSha256:hex('a'),renderedSceneAssetsSha256:hex('b'),
   sourceManifestSha256:hex('c'),canvas:{width:w,height:h},sampleFps:5,nativeFps:30,
   beats:[{beatId:which,producer:{instrumentation:'native-2d-canvas-geometry'},frames}]}
 return {plan:{beats:[beat]},report}
}
const copy=x=>structuredClone(x)
const check=x=>assertR818TelemetryBinding(x.plan,x.report,{
 rendererCodeSha256:hex('a'),renderedSceneAssetsSha256:hex('b')})
test('measured 105px caution panel settles with geometry-only classification',()=>{
 const x=fixture(),r=check(x).actionReports[0]
 expect(r.movementPixels).toBeGreaterThanOrEqual(104)
 expect(r.settledSamples).toBe(5)
 expect(r.proofClass).toMatch(/not-science-or-publication/)
})
test('moving botanical and expanding container both settle separately',()=>{
 const x=fixture('comparison'),r=check(x).actionReports[0]
 expect(r.botanicalTravelPixels).toBeGreaterThanOrEqual(77)
 expect(r.productWidthGrowthPixels).toBeGreaterThanOrEqual(52)
 expect(r.productHeightGrowthPixels).toBeGreaterThanOrEqual(74)
})
test('cannot use a caption, footer or decorative object as limitation panel',()=>{
 const x=fixture()
 x.plan.beats[0].visualObject.kind='karaoke-caption'
 x.report.beats[0].frames.forEach(f=>f.objects[0].kind='karaoke-caption')
 expect(()=>check(x)).toThrow(/noncaption physical art/)
})
test('cannot invent a source claim or omit its on-screen source identity',()=>{
 let x=fixture();x.plan.beats[0].claimIds=[]
 expect(()=>check(x)).toThrow(/upstream sourced scene claim/)
 x=fixture('comparison');x.plan.beats[0].onScreenSourceIds=[]
 expect(()=>check(x)).toThrow(/upstream sourced scene claim/)
})
test('static warning card cannot pass merely because captions move',()=>{
 const x=fixture()
 x.report.beats[0].frames.forEach(f=>f.objects[0].bbox[1]=685)
 expect(()=>check(x)).toThrow(/did not genuinely move/)
})
test('warning cannot jitter backward or keep moving after its settle',()=>{
 let x=fixture();x.report.beats[0].frames[6].objects[0].bbox[1]=500
 expect(()=>check(x)).toThrow(/did not genuinely move/)
 x=fixture();x.report.beats[0].frames[13].objects[0].bbox[1]=660
 expect(()=>check(x)).toThrow(/did not genuinely move/)
})
test('changing scientific warning label mid-animation is rejected',()=>{
 const x=fixture();x.report.beats[0].frames[8].objects[0].label='SAFE HUMAN DOSE'
 expect(()=>check(x)).toThrow(/sourced label/)
})
test('comparison cannot pass with only leaf or only bottle motion',()=>{
 let x=fixture('comparison')
 x.report.beats[0].frames.forEach(f=>{f.objects[1].bbox[2]=355;f.objects[1].bbox[3]=500})
 expect(()=>check(x)).toThrow(/two distinct settled/)
 x=fixture('comparison')
 x.report.beats[0].frames.forEach(f=>f.objects[0].bbox[0]=258)
 expect(()=>check(x)).toThrow(/two distinct settled/)
})
test('comparison cannot overlap its two different semantic objects',()=>{
 const x=fixture('comparison')
 x.report.beats[0].frames.forEach(f=>f.objects[1].bbox[0]=280)
 expect(()=>check(x)).toThrow(/two distinct settled/)
})
test('comparison cannot swap product label to fabricated numeric claim',()=>{
 const x=fixture('comparison')
 x.report.beats[0].frames[7].objects[1].label='100 times clinically proven'
 expect(()=>check(x)).toThrow(/sourced label/)
})
test('unsupported alternative action still fails closed',()=>{
 const x=fixture()
 x.plan.beats[0].semanticAction='arbitrary-card-pan'
 expect(()=>check(x)).toThrow(/uninstrumented semantic action/)
})
test('renderer provenance still rejects unrelated art source SHA',()=>{
 const x=fixture('comparison')
 x.report.renderedSceneAssetsSha256=hex('d')
 expect(()=>check(x)).toThrow(/asset identity/)
})
test('original source scene kind remains mandatory',()=>{
 const x=fixture('comparison')
 x.report.beats[0].frames.forEach(f=>f.objects[0].kind='generic-shape')
 expect(()=>check(x)).toThrow(/visualObject.kind/)
})

}
