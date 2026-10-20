import crypto from 'node:crypto'
const sha=b=>crypto.createHash('sha256').update(b).digest('hex')
// Inspect decoded FINAL MP4 4fps RGB pixels inside the reserved caption area.
// This is a measurement of white progressive-highlight ink, not merely an ASS tag count.
export function measureR817CaptionHighlightPixels(raw,cues,{width=210,height=75,fps=4}={}){
 const stride=width*height*3
 if(!Buffer.isBuffer(raw)||!raw.length||raw.length%stride!==0)
  throw Error('R8.17 4fps final master RGB caption region unavailable')
 const n=raw.length/stride,brightness=[]
 for(let f=0;f<n;f++){
  let white=0
  for(let p=f*stride;p<(f+1)*stride;p+=3){
   if(raw[p]>230&&raw[p+1]>230&&raw[p+2]>230)white++
  }
  brightness.push(white)
 }
 const checked=[]
 for(const cue of cues||[]){
  if(!Array.isArray(cue.words)||cue.words.length<3||cue.end-cue.start<.95)continue
  const a=Math.max(0,Math.ceil((cue.start+.13)*fps))
  const z=Math.min(n-1,Math.floor((cue.end-.08)*fps))
  if(z-a<3)continue
  const samples=brightness.slice(a,z+1),first=samples[0],last=samples.at(-1)
  let steps=0,previous=first
  for(const v of samples.slice(1)){if(v-previous>=4){steps++;previous=v}}
  const net=last-first
  const success=steps>=2&&net>=6
  checked.push({beatId:cue.beatId,start:cue.start,end:cue.end,words:cue.words.length,
    progressiveSteps:steps,netHighlightPixels:net,pass:success})
 }
 const evaluatedBeats=new Set(checked.map(c=>c.beatId))
 const failing=checked.filter(c=>!c.pass)
 const result={schemaVersion:'ths-r817-caption-pixel-qa-v1',
   source:'decoded-final-mp4',fps,width,height,sampledRgbSha256:sha(raw),
   inspectedCueCount:checked.length,inspectedBeatCount:evaluatedBeats.size,
   checked,passed:checked.length>0&&failing.length===0,
   limitations:'Samples long word cues; does not prove every sub-250ms word was visually perceived. Independent 4fps visual QA remains required.'}
 return result
}
export function assertR817CaptionPixelQA(x){
 if(x?.schemaVersion!=='ths-r817-caption-pixel-qa-v1'||x.source!=='decoded-final-mp4'||
   x.fps!==4||!/^[a-f0-9]{64}$/.test(String(x.sampledRgbSha256||''))||
   x.inspectedCueCount<1||x.passed!==true||x.checked.some(c=>c.progressiveSteps<2))
  throw Error('R8.17 actual 4fps progressive-highlight pixel proof missing or phrase-flash')
 return {status:'CAPTION_PIXEL_MEASUREMENT_PASS',inspectedCueCount:x.inspectedCueCount,
  inspectedBeatCount:x.inspectedBeatCount,sampledRgbSha256:x.sampledRgbSha256,
  independentVisualApproval:false}
}
