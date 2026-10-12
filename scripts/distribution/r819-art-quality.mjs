import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const sha = b => crypto.createHash('sha256').update(b).digest('hex')
const hex = v => /^[a-f0-9]{64}$/.test(String(v ?? ''))
const txt = v => String(v ?? '').trim()
const excludes = new Set(['caption','karaoke-word','karaoke-caption','subtitle','pmid-footer','source-footer','progress-bar','decorative-overlay'])
const visible = o => o?.visible !== false && Number(o?.opacity ?? 1) > 0

// Art may provide mood, not facts. Verify bytes from immutable local files; no CDN drift.
export function verifyR819Art(root, manifest, storyboard) {
 if(manifest?.schemaVersion!=='ths-r819-art-v1'||manifest.style!=='dark-cellular-organic'||
   !Array.isArray(manifest.assets)||!manifest.assets.length)
   throw Error('R8.19 canonical art manifest/style missing')
 const assets=new Map(),rootDir=path.resolve(root)
 for(const a of manifest.assets){
  if(!txt(a.id)||assets.has(a.id)||!hex(a.sha256)||a.factsLayer!==false||
    !['static-background','static-texture','static-nonfactual-illustration'].includes(a.purpose))
   throw Error('R8.19 art manifest invalid or facts layer contaminated')
  const name=path.resolve(rootDir,a.file||'')
  if(!name.startsWith(rootDir+path.sep)||!fs.existsSync(name)||!fs.statSync(name).isFile())
   throw Error('R8.19 art missing or escaping root')
  const bytes=fs.readFileSync(name)
  if(sha(bytes)!==a.sha256)throw Error('R8.19 art bytes changed: '+a.id)
  if(name.endsWith('.svg')&&/<(?:text|foreignObject|script)\b|(?:href|xlink:href)\s*=\s*['"]https?:/i.test(bytes.toString('utf8')))
   throw Error('R8.19 art SVG may not contain text, scripts or remote resources')
  assets.set(a.id,a)
 }
 if(JSON.stringify(storyboard?.layerOrder)!==JSON.stringify(['art','mechanism','trust']))
   throw Error('R8.19 compositor order must keep factual trust above art')
 for(const b of storyboard.beats||[]){
  if(!Array.isArray(b.artAssetRefs)||!b.artAssetRefs.length)throw Error('R8.19 beat missing art')
  for(const r of b.artAssetRefs)if(!assets.has(r.id)||assets.get(r.id).sha256!==r.sha256)
   throw Error('R8.19 storyboard asset SHA must match pinned file')
 }
 if(!Array.isArray(storyboard.beats)||!storyboard.beats.length)throw Error('R8.19 no storyboard beats')
 return {status:'HASH_VERIFIED_NONFACTUAL_ART',sha256:sha(JSON.stringify(manifest)),beatCount:storyboard.beats.length}
}

const position = o => [o.bbox[0]+o.bbox[2]/2,o.bbox[1]+o.bbox[3]/2]
function changed(a,b,w,h){
 const before=new Map(a.objects.filter(o=>!excludes.has(o.kind)).map(o=>[o.objectId,o]))
 const result=new Set()
 for(const o of b.objects){
  if(excludes.has(o.kind))continue
  const p=before.get(o.objectId)
  if(!p){if(visible(o))result.add(o.objectId);continue}
  if(visible(p)!==visible(o)){result.add(o.objectId);continue}
  if(!visible(o))continue
  const x=position(p),y=position(o)
  const travel=Math.hypot(x[0]-y[0],x[1]-y[1])/w
  const size=Math.abs(o.bbox[2]-p.bbox[2])/w+Math.abs(o.bbox[3]-p.bbox[3])/h
  const state=['emphasisLevel','activationLevel','visibilityProgress','opacity','rotationDeg']
    .some(k=>Number.isFinite(o[k])&&Number.isFinite(p[k])&&Math.abs(o[k]-p[k])>=(k==='rotationDeg'?5:.2))
  if(travel>=.025||size>=.035||state)result.add(o.objectId)
 }
 return result
}
export function verifyR819Composition(storyboard,telemetry) {
 if(storyboard?.schemaVersion!=='ths-r819-storyboard-v1'||
    !txt(storyboard.heroBeatId)||storyboard.beats?.filter(b=>b.id===storyboard.heroBeatId&&b.hero).length!==1)
   throw Error('R8.19 one named hero visual is mandatory')
 if(telemetry?.schemaVersion!=='ths-r819-object-telemetry-v1'||
   telemetry.origin!=='compositor-object-coordinates'||!hex(telemetry.masterSourceSha256)||
   telemetry.canvas?.width!==1080||telemetry.canvas?.height!==1920||
   telemetry.sampleFps!==5||telemetry.beats?.length!==storyboard.beats.length)
   throw Error('R8.19 original renderer geometry telemetry required')
 const reports=[]
 for(let j=0;j<storyboard.beats.length;j++){
  const b=storyboard.beats[j],t=telemetry.beats[j],f=t?.frames
  if(t?.beatId!==b.id||!Array.isArray(f)||f.length<2||!(b.end>b.start)||
     f[0].time-b.start>.21||b.end-f.at(-1).time>.22)
   throw Error('R8.19 beat/time coverage incomplete: '+b.id)
  for(let i=0;i<f.length;i++){
   const x=f[i]
   if(!Number.isFinite(x.time)||x.time<b.start-.001||x.time>b.end+.001||
     !Array.isArray(x.objects)||x.objects.some(o=>!txt(o.objectId)||!txt(o.kind)||
       !Array.isArray(o.bbox)||o.bbox.length!==4||o.bbox.some(n=>!Number.isFinite(n)))||
     i&&Math.abs(x.time-f[i-1].time-.2)>.016)
    throw Error('R8.19 invalid object samples')
  }
  const motion=[]
  for(let i=5;i<f.length;i++){
   const ids=changed(f[i-5],f[i],1080,1920)
   if(ids.size)motion.push({time:f[i].time,ids})
  }
  const points=[b.start,...motion.map(x=>x.time),b.end]
  const maxDrought=Math.max(...points.slice(1).map((x,i)=>x-points[i]))
  if(maxDrought>6.01)throw Error('R8.19 compositional drought over 6s: '+b.id)
  if(b.hero&&!motion.some(m=>m.ids.has(b.heroObjectId)))
   throw Error('R8.19 hero object does not animate')
  if(b.hook===true&&(!motion.some(m=>m.time<=3&&m.ids.has(b.hookObjectId))||b.start!==0))
   throw Error('R8.19 hook twist does not move in opening 3s')
  if(b.items?.length){
   const ids=new Set(b.items.map(x=>x.objectId))
   if(ids.size!==b.items.length)throw Error('R8.19 duplicate sequenced items')
   for(const item of b.items){
    if(!Number.isFinite(item.cueSeconds)||item.cueSeconds<b.start||item.cueSeconds>=b.end||
       !f.some(v=>Math.abs(v.time-item.cueSeconds)<=.25&&v.objects.some(o=>o.objectId===item.objectId&&o.emphasisLevel>=.8)))
     throw Error('R8.19 item missing narration-timed emphasis: '+item.objectId)
   }
  }
  reports.push({id:b.id,motionChanges:motion.length,longestStaticSeconds:+maxDrought.toFixed(3),items:b.items?.length||0})
 }
 return {status:'OBJECT_MOTION_TECHNICAL_PASS_PIXEL_REVIEW_REQUIRED',reports,telemetrySha256:sha(JSON.stringify(telemetry))}
}
