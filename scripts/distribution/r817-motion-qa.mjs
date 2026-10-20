import crypto from 'node:crypto'
import { R814_VISUAL_LIMITS } from './r814-motion-acceptance.mjs'
// Central artwork crop only. Spatially connected changes defeat dust, particles,
// noise, repeated fades and caption-only motion. Two consecutive qualifying
// samples are required to reset a static streak (5fps => 0.4s).
export const R817_MOTION_LIMITS=Object.freeze({
 staticFractionMaximum:0.40,maximumUnchangedBeatSeconds:6,
 sampleFps:5,pixelDelta:17,minChangedFraction:0.035,
 minConnectedAreaFraction:0.009,consecutiveSamplesForMotion:2,
 crop:R814_VISUAL_LIMITS.crop,sampleWidth:160,sampleHeight:176
})
const sha=v=>crypto.createHash('sha256').update(v).digest('hex')
function connectedLargest(mask,w,h){
 let largest=0;const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length)
 for(let pos=0;pos<mask.length;pos++){
  if(!mask[pos]||seen[pos])continue
  let head=0,tail=1;queue[0]=pos;seen[pos]=1
  while(head<tail){
   const p=queue[head++],x=p%w,y=Math.floor(p/w)
   for(const n of [x>0?p-1:-1,x<w-1?p+1:-1,y>0?p-w:-1,y<h-1?p+w:-1]){
    if(n>=0&&mask[n]&&!seen[n]){seen[n]=1;queue[tail++]=n}
   }
  }
  largest=Math.max(largest,tail)
 }
 return largest
}
export function measureR817FinalMotion(rawFrames,scenes,opts={}){
 const l={...R817_MOTION_LIMITS,...opts},stride=l.sampleWidth*l.sampleHeight
 if(!Buffer.isBuffer(rawFrames)||rawFrames.length%stride!==0||rawFrames.length<stride*5)
   throw Error('R8.17 decoded master needs nonempty 5fps gray video frames')
 const n=rawFrames.length/stride,mask=new Uint8Array(stride),changes=[]
 for(let i=1;i<n;i++){
  const prev=(i-1)*stride,cur=i*stride;let changed=0
  for(let p=0;p<stride;p++){const active=Math.abs(rawFrames[cur+p]-rawFrames[prev+p])>=l.pixelDelta
    mask[p]=active?1:0;if(active)changed++}
  const connected=connectedLargest(mask,l.sampleWidth,l.sampleHeight)
  const meaningful=changed/stride>=l.minChangedFraction&&connected/stride>=l.minConnectedAreaFraction
  changes[i]={atSeconds:i/l.sampleFps,changedFraction:changed/stride,connectedFraction:connected/stride,meaningful}
 }
 let staticCount=0,total=0,longestOverall=0
 const perBeat=(scenes||[]).map(b=>{
  const a=Math.max(1,Math.ceil((Number(b.start)+.04)*l.sampleFps))
  const z=Math.min(n-1,Math.floor((Number(b.end)-.04)*l.sampleFps))
  if(!Number.isFinite(a)||!Number.isFinite(z)||z<a)throw Error('R8.17 missing beat samples')
  const lastStable=Math.max(Number(b.start),a/l.sampleFps-.2)
  let streak=0,pending=0,meaningfulPairs=0,previousQualified=false,peak=0,staticSamples=0,eligibleSamples=0
  for(let i=a;i<=z;i++){
    const good=changes[i]?.meaningful===true
    if(good){pending++;if(pending>=l.consecutiveSamplesForMotion){
      meaningfulPairs++;streak=0;pending=0;previousQualified=true
    }}
    else {if(pending){streak+=pending;staticSamples+=pending;pending=0}streak++;staticSamples++;previousQualified=false}
    eligibleSamples++;peak=Math.max(peak,streak)
  }
  // Pending one-frame flicker is NOT evidence of motion.
  streak+=pending;staticSamples+=pending;peak=Math.max(peak,streak)
  staticCount+=staticSamples;total+=eligibleSamples
  const longest=Number((peak/l.sampleFps).toFixed(3))
  longestOverall=Math.max(longestOverall,longest)
  return {id:String(b.beatId||b.id||''),start:b.start,end:b.end,
    meaningfulMotionPairs:meaningfulPairs,longestStaticStreakSeconds:longest,
    staticSamples,eligibleSamples}
 })
 const staticFraction=total?staticCount/total:1
 return {schemaVersion:'ths-r817-exact-master-motion-v2',
  decodedFinalMp4:true,sampleFps:l.sampleFps,crop:l.crop,
  sampledRawFramesSha256:sha(rawFrames),
  staticFraction:Number(staticFraction.toFixed(4)),
  motionFraction:Number((1-staticFraction).toFixed(4)),
  longestBeatStaticStreakSeconds:Number(longestOverall.toFixed(3)),
  perBeat,minimumSpatialConnectedAreaFraction:l.minConnectedAreaFraction,
  twoSampleConfirmation:true,limitStaticFraction:l.staticFractionMaximum,
  limitBeatStaticSeconds:l.maximumUnchangedBeatSeconds,
  publicationApproved:false}
}
export function assertR817FinalMotion(m){
 if(m?.schemaVersion!=='ths-r817-exact-master-motion-v2'||m?.decodedFinalMp4!==true||
   !/^[a-f0-9]{64}$/.test(String(m?.sampledRawFramesSha256||''))||
   m.twoSampleConfirmation!==true||!Number.isFinite(m.minimumSpatialConnectedAreaFraction))
   throw Error('R8.17 meaningful-motion receipt lacks connected-component two-frame proof')
 if(!(m.staticFraction<m.limitStaticFraction))throw Error('R8.17 motion blocked: >=40% central artwork static')
 if(!(m.longestBeatStaticStreakSeconds<m.limitBeatStaticSeconds))
   throw Error('R8.17 motion blocked: >=6 continuous static seconds in a beat')
 return {status:'MOTION_TECHNICAL_PASS',sampledRawFramesSha256:m.sampledRawFramesSha256,
  staticFraction:m.staticFraction,motionFraction:m.motionFraction,
  longestBeatStaticStreakSeconds:m.longestBeatStaticStreakSeconds,
  spatialComponentProof:true,ownerVisualReview:'pending'}
}
