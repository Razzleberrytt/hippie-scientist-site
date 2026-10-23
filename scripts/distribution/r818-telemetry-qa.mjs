import crypto from 'node:crypto'
const hex=v=>/^[a-f0-9]{64}$/.test(String(v??''))
const txt=v=>String(v??'').trim()
const sha=v=>crypto.createHash('sha256').update(v).digest('hex')
const MAX_FRAMES=1500, EPS=.03
const dist=(a,b)=>Math.hypot(a[0]+a[2]/2-b[0]-b[2]/2,a[1]+a[3]/2-b[1]-b[3]/2)
const inside=(a,b)=>a[0]+a[2]/2>=b[0]&&a[0]+a[2]/2<=b[0]+b[2]&&a[1]+a[3]/2>=b[1]&&a[1]+a[3]/2<=b[1]+b[3]
const find=(f,id)=>f.objects.find(o=>o.objectId===id&&o.visible!==false&&o.opacity!==0)
const thirds=(frames)=>[frames.slice(0,Math.max(1,Math.ceil(frames.length/3))),frames.slice(Math.floor(frames.length*2/3))]
function assertFrameContract(frame,canvas){
 if(!Number.isFinite(frame.time)||!Array.isArray(frame.objects))throw Error('R8.18 telemetry frame or objects missing')
 const ids=new Set()
 for(const o of frame.objects){
  if(!txt(o.objectId)||ids.has(o.objectId)||!txt(o.kind)||!txt(o.label)||
    !Array.isArray(o.bbox)||o.bbox.length!==4||
    o.bbox.some(v=>!Number.isFinite(v))||o.bbox[2]<=0||o.bbox[3]<=0||
    o.bbox[0]<0||o.bbox[1]<0||o.bbox[0]+o.bbox[2]>canvas.width+1||
    o.bbox[1]+o.bbox[3]>canvas.height+1||
    !Number.isFinite(o.zIndex))
   throw Error('R8.18 malformed renderer object geometry/ID/label')
  ids.add(o.objectId)
 }
}

const CAPTION_ONLY_KINDS = new Set(['caption','karaoke-caption','karaoke-word','subtitle','source-footer','pmid-footer','brand-label','progress-bar','decorative-overlay'])
const inView = o => o && o.visible !== false && o.opacity !== 0
// Geometry/state are sampled from the renderer, never inferred from changing subtitle pixels.
// A focus/emphasis change is meaningful only on an actual named scene object (e.g. a user-report card).
function changedArtObjects(before,after,canvas){
 const prior=new Map(before.objects.map(o=>[o.objectId,o]))
 const changed=new Set()
 for(const item of after.objects){
  if(CAPTION_ONLY_KINDS.has(item.kind))continue
  const old=prior.get(item.objectId)
  if(!old){
   if(inView(item))changed.add(item.objectId)
   continue
  }
  if(inView(old)!==inView(item)){changed.add(item.objectId);continue}
  if(!inView(item))continue
  const centerMotion=dist(item.bbox,old.bbox)
  const resizing=Math.abs(item.bbox[2]-old.bbox[2])/canvas.width+
    Math.abs(item.bbox[3]-old.bbox[3])/canvas.height
  const stateDelta=['opacity','emphasisLevel','activationLevel','visibilityProgress']
    .some(key=>Number.isFinite(item[key])&&Number.isFinite(old[key])&&
      Math.abs(item[key]-old[key])>=.24)
  if(centerMotion>=.025*canvas.width||resizing>=.05||stateDelta)
   changed.add(item.objectId)
 }
 return changed
}
// Long static card layouts cannot pass because the captions change. Require
// several independently timed semantic-art changes instead of any pixel difference.
// These are evidence/retention QA signals, not proof of artistic merit.
function checkLongBeatComposition(beat,frames,canvas){
 const duration=beat.end-beat.start
 if(duration<8)return null
 const activeSeconds=new Set(),activeObjects=new Set()
 for(let i=5;i<frames.length;i+=5){
  const changed=changedArtObjects(frames[i-5],frames[i],canvas)
  if(!changed.size)continue
  const window=Math.floor((frames[i].time-beat.start)/3)
  activeSeconds.add(window)
  for(const id of changed)activeObjects.add(id)
 }
 const minimumWindows=Math.max(2,Math.floor(duration/4))
 if(activeSeconds.size<minimumWindows)
  throw Error('R8.18 long beat has caption-only or insufficient compositional activity: '+beat.id)
 return {durationSeconds:duration,changedThreeSecondWindows:activeSeconds.size,
   requiredChangedWindows:minimumWindows,changedArtObjectCount:activeObjects.size,
   assessment:'renderer-object-motion-not-caption-pixel-difference'}
}


/* Bounded, source-linked illustration motion. This is a geometric negative
 * screen, NOT review of claim meaning, art craft, or publication. The existing
 * R8.17 source-ledger, R8.10 human alignment, and release gates stay separate.
 */
function checkGroundedIllustrationAction(beat,frames,canvas){
 const p=beat.telemetryProof||{},action=beat.semanticAction
 if(!txt(p.sourceClaimId)||!Array.isArray(beat.claimIds)||
    !beat.claimIds.includes(p.sourceClaimId)||
    !Array.isArray(beat.onScreenSourceIds)||!beat.onScreenSourceIds.length)
  throw Error('R8.18 grounded motion must bind an upstream sourced scene claim')
 const center=o=>[o.bbox[0]+o.bbox[2]/2,o.bbox[1]+o.bbox[3]/2]
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])
 const steady=(numbers,tolerance)=>numbers.length>=5&&
   numbers.slice(-5).every(n=>Math.abs(n-numbers.at(-1))<=tolerance)
 const ascending=(a,t)=>a.every((v,i)=>!i||v>=a[i-1]-t)
 const descending=(a,t)=>a.every((v,i)=>!i||v<=a[i-1]+t)
 const steps=(a,t)=>a.slice(1).filter((v,i)=>Math.abs(v-a[i])>t).length
 const series=(id,kind,label)=>{
   if(!txt(id)||!txt(kind)||!txt(label)||CAPTION_ONLY_KINDS.has(kind))
    throw Error('R8.18 grounded motion needs named noncaption physical art')
   return frames.map(f=>{
     const hits=f.objects.filter(o=>o.objectId===id&&o.visible!==false&&o.opacity!==0)
     if(hits.length!==1||hits[0].kind!==kind||hits[0].label!==label)
      throw Error('R8.18 grounded motion object changed identity, kind or sourced label')
     return hits[0]
   })
 }
 if(action==='evidence-boundary-panel-settles'){
   if(p.primaryObjectId!==p.subjectObjectId)
    throw Error('R8.18 caution panel must be actual primary art object')
   const cards=series(p.primaryObjectId,beat.visualObject?.kind,p.beforeLabel)
   const xy=cards.map(o=>center(o)),last=xy.at(-1)
   const ds=xy.map(c=>distance(c,last)),tol=.007*canvas.width
   if(ds[0]<.07*canvas.width||!descending(ds,tol)||steps(ds,tol)<3||!steady(ds,tol))
    throw Error('R8.18 evidence boundary panel did not genuinely move and settle')
   return {movementPixels:ds[0],settledSamples:5,sourceClaimId:p.sourceClaimId,
    proofClass:'geometry-only-not-science-or-publication-approval'}
 }
 if(action!=='botanical-versus-concentrate-reveal')
  throw Error('R8.18 unsupported grounded illustration action')
 if(p.primaryObjectId===p.targetObjectId)
  throw Error('R8.18 comparison must have two distinct art objects')
 const left=series(p.primaryObjectId,beat.visualObject?.kind,p.beforeLabel)
 const right=series(p.targetObjectId,p.targetKind,p.afterLabel)
 const xs=left.map(o=>center(o)[0]),ws=right.map(o=>o.bbox[2]),hs=right.map(o=>o.bbox[3])
 const tol=.003*canvas.width,ht=.003*canvas.height
 const dx=xs.at(-1)-xs[0],dw=ws.at(-1)-ws[0],dh=hs.at(-1)-hs[0]
 const lb=left.at(-1).bbox,rb=right.at(-1).bbox
 if(dx<.05*canvas.width||dw<.035*canvas.width||dh<.025*canvas.height||
    !ascending(xs,tol)||!ascending(ws,tol)||!ascending(hs,ht)||
    steps(xs,tol)<3||steps(ws,tol)<3||
    !steady(xs,tol)||!steady(ws,tol)||!steady(hs,ht)||
    center(left.at(-1))[0]>=center(right.at(-1))[0]||lb[0]+lb[2]>=rb[0])
  throw Error('R8.18 comparison requires two distinct settled physical art reveals')
 return {botanicalTravelPixels:dx,productWidthGrowthPixels:dw,productHeightGrowthPixels:dh,
  settledSamples:5,sourceClaimId:p.sourceClaimId,
  proofClass:'geometry-only-not-science-or-publication-approval'}
}

function checkBeat(beat,frames,ctx,record){
 const action=txt(beat.semanticAction),proof=beat.telemetryProof||{}
 if(!txt(proof.primaryObjectId)||!frames.some(f=>find(f,proof.primaryObjectId)))
  throw Error('R8.18 missing named primary rendered object: '+beat.id)
 const report={beatId:beat.id,semanticAction:action,frameSamples:frames.length}
 const subject=proof.subjectObjectId
 if(!txt(subject)||!frames.some(f=>find(f,subject)?.kind===beat.visualObject?.kind))
   throw Error('R8.18 declared rendered visualObject.kind has no matching physical source object')
 const left=thirds(frames)[0],right=thirds(frames)[1]
 if(['ligand-enters-pocket','binds-to'].includes(action)){
  if(!txt(proof.targetObjectId))throw Error('R8.18 ligand binding target ID missing')
  const series=frames.map(f=>[find(f,proof.primaryObjectId),find(f,proof.targetObjectId)])
  if(series.some(pair=>!pair[0]||!pair[1]||pair[0].kind!=='ligand'||pair[1].kind!=='binding-pocket'))
   throw Error('R8.18 ligand and binding-pocket must exist and be visible throughout')
  const d=series.map(([a,b])=>dist(a.bbox,b.bbox))
  const w=ctx.canvas.width
  if(!(d[0]>d.at(-1)+.10*w)||d.at(-1)>=.15*w||
     d.some((n,i)=>i>0&&n>d[i-1]+EPS*w))
   throw Error('R8.18 ligand must approach pocket and end within 15% of frame width')
  let dwells=0,contiguous=0
  for(const [a,b] of series){contiguous=inside(a.bbox,b.bbox)?contiguous+1:0;dwells=Math.max(dwells,contiguous)}
  // At 5 samples/second there are 6 native (30fps) frames per telemetry sample.
  // >=10 native-frame dwell needs >=ceil(10/6)=2 in-pocket samples.
  const nativeFrameSamples=Math.ceil(10/(ctx.nativeFps/ctx.sampleFps))
  if(dwells<nativeFrameSamples)throw Error('R8.18 no sampled evidence of sustained ligand pocket entry')
  if(!Number.isInteger(record.metrics?.longestNativePocketDwellFrames)||
    record.metrics.longestNativePocketDwellFrames<10)
    throw Error('R8.18 renderer failed to measure ten consecutive native 30fps in-pocket frames')
  report.finalDistanceFraction=d.at(-1)/w;report.dwellSamples=dwells;report.longestNativePocketDwellFrames=record.metrics.longestNativePocketDwellFrames
 }else if(['count-up-then-settle','counter-rolls-then-settles'].includes(action)){
  if(!beat.numericVisual||!txt(proof.primaryObjectId))throw Error('R8.18 count-up missing exact bound claim')
  const values=frames.map(f=>find(f,proof.primaryObjectId)?.value)
  const displayed=frames.map(f=>find(f,proof.primaryObjectId)?.label)
  const finalDisplay=String(beat.numericVisual.finalDisplay)
  const cleanNumber=v=>Number(String(v??'').replace(/[,+%]/g,''))
  const numbers=values.map(cleanNumber),finish=cleanNumber(finalDisplay)
  if(!Number.isFinite(finish)||numbers.some(v=>!Number.isFinite(v))||
     numbers.some((v,i)=>i&&v<numbers[i-1]-1e-7)||
     numbers.at(-1)!==finish)
    throw Error('R8.18 count-up is nonmonotonic or settles on wrong canonical value')
  let terminal=0
  for(let i=numbers.length-1;i>=0&&numbers[i]===finish&&displayed[i]===finalDisplay;i--)terminal++
  if(terminal<ctx.sampleFps)throw Error('R8.18 final canonical claim display must remain for one second')
  report.settledSamples=terminal;report.exactValue=finalDisplay
 }else if(['transforms-into','converts-to','reveals-hidden-action'].includes(action)){
  const from=proof.primaryObjectId,to=proof.targetObjectId
  if(!txt(to))throw Error('R8.18 transformation target object missing')
  if(!left.some(f=>find(f,from))||!right.some(f=>find(f,to)))
   throw Error('R8.18 transformation missing actual first/last semantic subjects')
  const fromLabel=txt(proof.beforeLabel||beat.retention?.beforeName||beat.visualObject?.name)
  const afterLabel=txt(proof.afterLabel||beat.retention?.afterName)
  if(!fromLabel||!afterLabel||!left.some(f=>find(f,from)?.label===fromLabel)||
     !right.some(f=>find(f,to)?.label===afterLabel))
    throw Error('R8.18 transformation renderer labels do not match planned subjects')
  if(action==='reveals-hidden-action'){
   const initial=left[0].objects.find(o=>o.objectId===to)
   const final=right.at(-1).objects.find(o=>o.objectId===to)
   if(!(initial&&(initial.visible===false||initial.opacity===0))||
     !final||final.visible===false||!(final.opacity>.5))
    throw Error('R8.18 hidden target did not actually become visible')
  }
 }else if(['evidence-boundary-panel-settles','botanical-versus-concentrate-reveal'].includes(action)){
  Object.assign(report,checkGroundedIllustrationAction(beat,frames,ctx.canvas))
 }else if(action==='activates'){
  const targetId=txt(proof.targetObjectId)
  if(!targetId)throw Error('R8.18 activation target missing')
  const obj=frames.map(f=>find(f,targetId))
  if(obj.some(x=>!x))throw Error('R8.18 activation target absent in frame')
  const first=obj[0],last=obj.at(-1)
  const before=Number(first.activationLevel),after=Number(last.activationLevel)
  if(!Number.isFinite(before)||!Number.isFinite(after)||after-before<.25)
    throw Error('R8.18 activation target did not visibly change state')
  report.activationDelta=after-before
 }else if(['bottle-rotates-to-reveal-label','reveal-emergency-guidance'].includes(action)){
  const start=find(left[0],proof.primaryObjectId),end=find(right.at(-1),proof.primaryObjectId)
  if(!start||!end||!(Number(end.visibilityProgress)-Number(start.visibilityProgress)>=.5))
   throw Error('R8.18 visual reveal not manifested in renderer frames')
 }else throw Error('R8.18 uninstrumented semantic action cannot silently pass: '+action)
 const composition=checkLongBeatComposition(beat,frames,ctx.canvas)
 if(composition)report.compositionalActivity=composition
 return report
}
// Renderer-authored frames, not inferred from plan. The producer must supply
// objects from actual SVG node geometry or actual VTK camera-projected meshes.
// This module cannot attest that the instrumentation itself is honest.
export function assertR818TelemetryBinding(plan,telemetry,receipt={}){
 const p=plan??{},t=telemetry??{},errors=[]
 if(t.schemaVersion!=='ths-r818-renderer-telemetry-v1'||t.origin!=='render-instrumentation'||
   !hex(t.rendererCodeSha256)||!hex(t.renderedSceneAssetsSha256)||
   !hex(t.sourceManifestSha256)||!Number.isFinite(t.canvas?.width)||
   !Number.isFinite(t.canvas?.height)||t.sampleFps!==5||t.nativeFps!==30)
   throw Error('R8.18 exact renderer provenance/canvas/5fps telemetry absent')
 if(receipt?.rendererCodeSha256&&receipt.rendererCodeSha256!==t.rendererCodeSha256)
   throw Error('R8.18 renderer source identity mismatch')
 if(receipt?.renderedSceneAssetsSha256&&receipt.renderedSceneAssetsSha256!==t.renderedSceneAssetsSha256)
   throw Error('R8.18 scene asset identity mismatch')
 if(!Array.isArray(p.beats)||!Array.isArray(t.beats)||p.beats.length!==t.beats.length)
   throw Error('R8.18 telemetry beat coverage incomplete')
 let total=0
 const reports=[]
 for(let i=0;i<p.beats.length;i++){
  const beat=p.beats[i],record=t.beats[i]
  if(beat.id!==record?.beatId||!Array.isArray(record.frames)||!record.frames.length)
   throw Error('R8.18 telemetry/plan beat identity mismatch')
  const frames=record.frames
  if(record.producer?.instrumentation!=='native-svg-geometry'&&
     record.producer?.instrumentation!=='native-2d-canvas-geometry'&&
     record.producer?.instrumentation!=='native-vtk-projection'&&
     record.producer?.instrumentation!=='native-blender-projection')
    throw Error('R8.18 beat lacks actual geometry-derived producer instrumentation')
  if((total+=frames.length)>MAX_FRAMES)throw Error('R8.18 telemetry exceeds bounded sample count')
  for(let k=0;k<frames.length;k++){
   const f=frames[k];assertFrameContract(f,t.canvas)
   if(f.time<beat.start-.001||f.time>beat.end+.001||
      k>0&&(f.time<=frames[k-1].time||Math.abs(f.time-frames[k-1].time-.2)>.015))
    throw Error('R8.18 invalid 5fps telemetry spacing or wrong beat time')
  }
  if(frames[0].time-beat.start>.21||beat.end-frames.at(-1).time>.27)
   throw Error('R8.18 per-beat telemetry missing initial/final moments')
  reports.push(checkBeat(beat,frames,t,record))
 }
 return {status:'RENDERER_TELEMETRY_CHECKED_NOT_PIXEL_CERTIFIED',
   beatCount:reports.length,framesChecked:total,actionReports:reports,
   telemetrySha256:sha(JSON.stringify(t)),rendererCodeSha256:t.rendererCodeSha256,
   renderedSceneAssetsSha256:t.renderedSceneAssetsSha256,
   limitation:'Renderer instrumentation proves reported geometry/state, not decoded pixel truth. Separate human frame review is required.'}
}
