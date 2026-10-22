import {test,expect} from 'vitest'
import {assertR818TelemetryBinding} from '../r818-telemetry-qa.mjs'
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
