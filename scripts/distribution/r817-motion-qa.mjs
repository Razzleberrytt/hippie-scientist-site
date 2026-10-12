import crypto from 'node:crypto'
import { R814_VISUAL_LIMITS, measureR814Motion } from './r814-motion-acceptance.mjs'
export const R817_MOTION_LIMITS=Object.freeze({
 staticFractionMaximum:0.40,maximumUnchangedBeatSeconds:6.0,
 sampleFps:5,pixelDelta:11,minChangedFraction:0.012,
 crop:R814_VISUAL_LIMITS.crop,sampleWidth:160,sampleHeight:176
})
// Sample the science-image center, not the subtitles. Motion is a QA proxy, not an artistic rating.
export function measureR817FinalMotion(rawFrames,scenes,opts={}){
 const limits={...R817_MOTION_LIMITS,...opts}
 const base=measureR814Motion(rawFrames,scenes,{sampleFps:limits.sampleFps,
   sampleWidth:limits.sampleWidth,sampleHeight:limits.sampleHeight,crop:limits.crop,
   minChangedPixelDelta:limits.pixelDelta,minChangedPixelFraction:limits.minChangedFraction})
 const stride=limits.sampleWidth*limits.sampleHeight,n=rawFrames.length/stride
 let max=0
 const perBeat=scenes.map(b=>{
   let streak=0,longest=0,changes=0
   const a=Math.max(1,Math.ceil((Number(b.start)+0.04)*limits.sampleFps))
   const z=Math.min(n-1,Math.floor((Number(b.end)-0.04)*limits.sampleFps))
   for(let i=a;i<=z;i++){
     let changed=0
     const prev=(i-1)*stride,cur=i*stride
     for(let p=0;p<stride;p++){
       if(Math.abs(rawFrames[cur+p]-rawFrames[prev+p])>=limits.pixelDelta)changed++
     }
     if(changed/stride>=limits.minChangedFraction){changes++;streak=0}
     else {streak++;longest=Math.max(longest,streak)}
   }
   const longestSeconds=Number((longest/limits.sampleFps).toFixed(3))
   max=Math.max(max,longestSeconds)
   return {id:String(b.beatId||b.id||''),longestStaticStreakSeconds:longestSeconds,
     measuredMeaningfulMotionEvents:changes}
 })
 return {...base,schemaVersion:'ths-r817-exact-master-motion-v1',
   sampledRawFramesSha256:crypto.createHash('sha256').update(rawFrames).digest('hex'),
   longestBeatStaticStreakSeconds:Number(max.toFixed(3)),perBeat,
   passesHardMotionThreshold:base.staticFraction<limits.staticFractionMaximum&&max<limits.maximumUnchangedBeatSeconds,
   limitStaticFraction:limits.staticFractionMaximum,limitBeatStaticSeconds:limits.maximumUnchangedBeatSeconds,
   publicationApproved:false}
}
export function assertR817FinalMotion(measurement){
 const m=measurement??{}
 if(m.schemaVersion!=='ths-r817-exact-master-motion-v1'||m.decodedFinalMp4!==true||
   !/^[a-f0-9]{64}$/.test(String(m.sampledRawFramesSha256||'')))
   throw Error('R8.17 needs decoded final-MP4 frame measurement')
 if(!(Number(m.staticFraction)<m.limitStaticFraction))
   throw Error('R8.17 motion blocked: >=40% science-image frames static')
 if(!(Number(m.longestBeatStaticStreakSeconds)<m.limitBeatStaticSeconds))
   throw Error('R8.17 motion blocked: >=6 continuous static seconds in a beat')
 return {status:'MOTION_TECHNICAL_PASS',staticFraction:m.staticFraction,
  motionFraction:m.motionFraction,longestBeatStaticStreakSeconds:m.longestBeatStaticStreakSeconds,
  sampledRawFramesSha256:m.sampledRawFramesSha256,ownerVisualReview:'pending'}
}
