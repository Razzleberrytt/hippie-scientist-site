import fs from 'node:fs'
import path from 'node:path'
import {sha256} from './r819-brutal-bar.mjs'
const sha = s => /^[a-f0-9]{64}$/.test(String(s ?? ''))
const nonfactual = new Set(['nonfactual-static-background','nonfactual-static-texture','nonfactual-static-illustration'])
const overlay = new Set(['caption','karaoke-caption','karaoke-word','subtitle','source-footer','pmid-footer','progress-bar','decorative-overlay','brand-label'])
const visible = o => o?.visible !== false && Number(o?.opacity ?? 1)>0

export function verifyR819ArtAssets(root, manifest, storyboard) {
 if(manifest?.schemaVersion!=='ths-evidencemotion-r819-art-v1'||manifest.style!=='dark-cellular-organic'||
    !Array.isArray(manifest.assets)||manifest.assets.length<1)
    throw Error('R819 pinned cellular/organic art manifest missing')
 const ids=new Map(),dir=path.resolve(root)
 for(const a of manifest.assets){
  if(typeof a.id!=='string'||!a.id||ids.has(a.id)||!sha(a.sha256)||
     !nonfactual.has(a.purpose)||a.factsLayer!==false||typeof a.file!=='string')
   throw Error('R819 invalid art identity, hash, or factual payload')
  const p=path.resolve(dir,a.file)
  if(!p.startsWith(dir+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile())
   throw Error('R819 art asset path invalid or missing')
  const bytes=fs.readFileSync(p)
  if(sha256(bytes)!==a.sha256)throw Error('R819 pinned art SHA mismatch: '+a.id)
  if(path.extname(p)==='.svg' && (/<\s*(?:text|foreignObject|script|image|use)\b/i.test(bytes.toString('utf8')) || /\b(?:href|xlink:href)\s*=\s*['"](?:https?:|\/\/|file:)/i.test(bytes.toString('utf8'))))
   throw Error('R819 static art SVG cannot carry text, embedded HTML, or scripts')
  ids.set(a.id,a.sha256)
 }
 if(!Array.isArray(storyboard?.beats)||!storyboard.beats.length||
    JSON.stringify(storyboard.compositingOrder)!==JSON.stringify(['art','mechanism','trust']))
  throw Error('R819 storyboard must specify art → mechanism → trust compositing order')
 for(const beat of storyboard.beats)
  if(!Array.isArray(beat.artAssetRefs)||!beat.artAssetRefs.length||
    beat.artAssetRefs.some(ref=>!ids.has(ref.id)||ids.get(ref.id)!==ref.sha256))
   throw Error('R819 storyboard beat lacks exact art ID and SHA binding')
 return {status:'PINNED_ART_VERIFIED_NOT_VIDEO_PIXELS',
   assets:manifest.assets.map(a=>({id:a.id,sha256:a.sha256})),
   storyboardSha256:sha256(Buffer.from(JSON.stringify(storyboard)))}
}
function center(o){return [o.bbox[0]+o.bbox[2]/2,o.bbox[1]+o.bbox[3]/2]}
function changes(a,b,width){
 const old=new Map(a.objects.filter(o=>!overlay.has(o.kind)).map(o=>[o.objectId,o]))
 const seen=new Set()
 for(const o of b.objects){
  if(overlay.has(o.kind))continue
  const p=old.get(o.objectId)
  if(!p){if(visible(o))seen.add(o.objectId);continue}
  if(visible(o)!==visible(p)){seen.add(o.objectId);continue}
  if(!visible(o))continue
  const c=center(o),d=center(p)
  const translation=Math.hypot(c[0]-d[0],c[1]-d[1])/width
  const sizing=(Math.abs(o.bbox[2]-p.bbox[2])+Math.abs(o.bbox[3]-p.bbox[3]))/width
  const emphasis=['emphasisLevel','activationLevel','visibilityProgress','opacity'].some(k=>
    Number.isFinite(o[k])&&Number.isFinite(p[k])&&Math.abs(o[k]-p[k])>=.25)
  const rotation=Number.isFinite(o.rotationDeg)&&Number.isFinite(p.rotationDeg)&&Math.abs(o.rotationDeg-p.rotationDeg)>=5
  if(translation>=.025||sizing>=.05||emphasis||rotation)seen.add(o.objectId)
 }
 return seen
}
export function verifyR819WowGates(board,t){
 if(board?.schemaVersion!=='ths-r819-storyboard-v1'||!Array.isArray(board.beats)||!board.beats.length||
    typeof board.heroBeatId!=='string'||!board.heroBeatId||board.beats.filter(b=>b.hero).length!==1||
    board.beats.find(b=>b.hero)?.id!==board.heroBeatId)
  throw Error('R819 exactly one declared hero visual required')
 if(t?.schemaVersion!=='ths-r819-object-telemetry-v1'||t.origin!=='renderer-object-geometry'||
    !sha(t.rendererSha256)||!sha(t.sourceSha256)||t.canvas?.width!==1080||t.canvas?.height!==1920||
    t.sampleFps!==5||!Array.isArray(t.beats)||t.beats.length!==board.beats.length)
  throw Error('R819 exact native compositor telemetry required')
 const results=[]
 for(let i=0;i<board.beats.length;i++){
  const beat=board.beats[i],record=t.beats[i],frames=record?.frames
  if(record?.beatId!==beat.id||!Array.isArray(frames)||frames.length<2||!(beat.end>beat.start))
   throw Error('R819 incomplete scene '+beat.id)
  for(let j=0;j<frames.length;j++){
   const frame=frames[j]
   if(!Number.isFinite(frame.time)||frame.time<beat.start-.01||frame.time>beat.end+.01||
      !Array.isArray(frame.objects)||frame.objects.some(o=>
        !o.objectId||!o.kind||!Array.isArray(o.bbox)||o.bbox.length!==4||
        o.bbox.some(n=>!Number.isFinite(n))))
    throw Error('R819 malformed native-frame object geometry')
   if(j>0 && Math.abs(frame.time-frames[j-1].time-.2)>.025)
    throw Error('R819 5fps geometry samples not continuous')
  }
  if(frames[0].time-beat.start>.205||beat.end-frames.at(-1).time>.215)
   throw Error('R819 unobserved scene boundary')
  const events=[]
  for(let j=5;j<frames.length;j++){
   const moved=changes(frames[j-5],frames[j],1080)
   if(moved.size)events.push({time:frames[j].time,ids:[...moved]})
  }
  const points=[beat.start,...events.map(e=>e.time),beat.end]
  const maxHold=Math.max(...points.slice(1).map((value,j)=>value-points[j]))
  if(maxHold>6.0001)throw Error('R819 >6s without actual compositional change: '+beat.id)
  if(beat.hero && !events.some(e=>e.ids.includes(beat.heroObjectId)))
   throw Error('R819 hero visual must animate the named hero object')
  if(beat.hook && (beat.start!==0 || !events.some(e=>e.time<=3 && e.ids.includes(beat.hookObjectId))))
   throw Error('R819 opening twist must move itself by second 3')
  if(beat.items?.length){
   if(!sha(beat.alignmentReceiptSha256)||new Set(beat.items.map(x=>x.objectId)).size!==beat.items.length)
    throw Error('R819 multi-item cue identities must bind authentic alignment SHA')
   for(const item of beat.items){
    if(!Number.isFinite(item.cueSeconds)||!item.wordId||
       !frames.some(f=>Math.abs(f.time-item.cueSeconds)<=.22 &&
         f.objects.some(o=>o.objectId===item.objectId&&o.emphasisLevel>=.8)))
     throw Error('R819 named item lacks aligned emphasis: '+item.objectId)
   }
  }
  results.push({beatId:beat.id,longestCompositionalHoldSeconds:Number(maxHold.toFixed(3)),
    semanticChangeEvents:events.length,narrationCuedItems:beat.items?.length||0})
 }
 return {status:'OBJECT_TELEMETRY_VALIDATED_PIXELS_STILL_REQUIRED',perBeat:results,
   warning:'Geometry instrumentation alone is not decoded-pixel truth or independent craft approval.'}
}
