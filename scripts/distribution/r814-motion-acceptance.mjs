// R8.14 perceptual-motion acceptance is measured on decoded FINAL MP4 frames.
// Perceptual thresholds are proxies, not replacements for independent human QA.
// This module does not authorize new science or publication.
export const R814_VISUAL_LIMITS = Object.freeze({
  sampleFps: 5,
  sampleWidth: 160,
  sampleHeight: 176,
  // Motion is measured in the graphic region, away from heading/ASS captions.
  crop: 'crop=760:880:150:430',
  minChangedPixelFraction: 0.012,
  minChangedPixelDelta: 11,
  minMotionFrameRatio: 0.60,
  maxStaticFraction: 0.40,
  minBeatChangeRatio: 0.015,
  minBeatDuration: 0.65,
})
const clean = v => String(v ?? '').trim()
function number(n) { return Number.isFinite(Number(n)) ? Number(n) : NaN }
function role(b) { return clean(b?.role) }
export function validateR814Plan(scenes, sourceUrl) {
  if (!Array.isArray(scenes) || scenes.length<4) throw Error('R8.14 needs at least four narrated science scenes')
  if (!/^https:\/\//.test(clean(sourceUrl))) throw Error('R8.14 needs a reviewed canonical science source')
  const first=number(scenes[0]?.start), last=number(scenes.at(-1)?.end)
  if (first!==0 || !(last>5 && last<=60)) throw Error('R8.14 requires contiguous reasonable runtime')
  let cursor=0
  for(const scene of scenes) {
    if(number(scene.start)!==cursor || !(number(scene.end)>cursor)) throw Error('R8.14 scenes must be contiguous')
    cursor=number(scene.end)
  }
  const interrupt=scenes.filter(x=>x.patternInterrupt===true)
  if(interrupt.length!==1)throw Error('R8.14 requires exactly one authored visual-register pattern interrupt')
  const sw=interrupt[0]
  if(number(sw.end)-number(sw.start)<1.95)throw Error('R8.14 pattern interrupt must occupy at least two seconds')
  const normalizedMid=(number(sw.start)+number(sw.end))/(last*2)
  if(Math.abs(normalizedMid-.5)>.22)throw Error('R8.14 pattern interrupt must land near the video midpoint')
  const evidence=scenes.filter(x=>role(x)==='evidence'||role(x)==='finding')
  const numbered=evidence.filter(x=>x.r814KeyNumber)
  if(numbered.length!==1)throw Error('R8.14 requires exactly one source-bound key number in an evidence/finding beat')
  const n=numbered[0].r814KeyNumber
  if(!/^.{2,28}$/.test(clean(n.display)) || /[<>]/.test(clean(n.display))
    || !/^PMID:\s*\d{7,9}$/.test(clean(n.sourceId))
    || !clean(sourceUrl).includes(clean(n.sourceId).split(':').at(-1))
    || !['human-rct','observational','case-report','preclinical','in-vitro','meta-analysis'].includes(clean(n.evidenceType))) {
    throw Error('R8.14 key number must have visible value, matching PMID and evidence type; never invent numbers')
  }
  const cta=scenes.filter(x=>role(x)==='cta')
  if(cta.length!==1 || cta[0].end-cta[0].start>5.001 || !/^.{10,120}$/.test(clean(cta[0].r814OpenLoop))) {
    throw Error('R8.14 CTA must be <=5 seconds and include a reviewed open-loop prompt')
  }
  return {phase:'plan',passed:true,sourceId:n.sourceId,keyNumber:n.display,
    patternInterruptBeat:sw.beatId,ctaSeconds:cta[0].end-cta[0].start,openLoop:cta[0].r814OpenLoop}
}
function delta(a,b,limits) {
  let changed=0,sum=0
  for(let i=0;i<a.length;i++){
    const difference=Math.abs(a[i]-b[i]);sum+=difference
    if(difference>=limits.minChangedPixelDelta)changed++
  }
  return {changedRatio:changed/a.length,meanDelta:sum/a.length,
    moving:changed/a.length>=limits.minChangedPixelFraction}
}
export function measureR814Motion(rawFrames, scenes, opts={}) {
  const limits={...R814_VISUAL_LIMITS,...opts}
  const frameBytes=limits.sampleWidth*limits.sampleHeight
  if(!Buffer.isBuffer(rawFrames) || rawFrames.length<frameBytes*5 || rawFrames.length%frameBytes!==0) {
    throw Error('R8.14 motion QA needs correctly decoded grayscale frame samples')
  }
  if(!Array.isArray(scenes)||!scenes.length) throw Error('R8.14 motion QA needs timed scenes')
  const frames=rawFrames.length/frameBytes
  const frameAt=i=>rawFrames.subarray(i*frameBytes,(i+1)*frameBytes)
  let staticCount=0, transitions=0
  const changes=[]
  for(let i=1;i<frames;i++){
    const v=delta(frameAt(i-1),frameAt(i),limits)
    changes.push(v)
    // Do not allow hard cuts to falsely count as meaningful continuous motion.
    const seconds=(i-.5)/limits.sampleFps
    const scene=scenes.find(s=>seconds>=number(s.start)+.05 && seconds<number(s.end)-.05)
    if(!scene) continue
    transitions++
    if(!v.moving) staticCount++
  }
  const staticFraction=transitions ? staticCount/transitions:1
  const beats=scenes.map(s=>{
    // Compare time-near-start to time-near-end, inside the SAME beat.
    const startIndex=Math.max(0,Math.ceil((number(s.start)+.15)*limits.sampleFps))
    const endIndex=Math.min(frames-1,Math.floor((number(s.end)-.15)*limits.sampleFps))
    if(endIndex<=startIndex)throw Error('R8.14 insufficient in-beat samples for '+clean(s.beatId))
    const v=delta(frameAt(startIndex),frameAt(endIndex),limits)
    return {id:clean(s.beatId),role:role(s),start:s.start,end:s.end,
      startEndChangedRatio:v.changedRatio,meanPixelDifference:v.meanDelta,
      visibleChange:v.changedRatio>=limits.minBeatChangeRatio}
  })
  const passed=staticFraction<limits.maxStaticFraction && beats.every(x=>x.visibleChange)
  return {schemaVersion:'ths-r814-motion-density-v1',decodedFinalMp4:true,
    sampleFps:limits.sampleFps,crop:limits.crop,
    staticFraction:Number(staticFraction.toFixed(4)),
    motionFraction:Number((1-staticFraction).toFixed(4)),
    beats,passed,minimumRequiredMotionFraction:limits.minMotionFrameRatio,
    humanVisualAcceptance:'pending'}
}
export function assertR814MotionAcceptance(result) {
  if(result?.decodedFinalMp4!==true || result.passed!==true ||
      Number(result.staticFraction)>=R814_VISUAL_LIMITS.maxStaticFraction ||
      !Array.isArray(result.beats) || result.beats.some(x=>x.visibleChange!==true)) {
    throw Error('R8.14 motion-density QA blocked: >=40% static or beat lacks visible frame change')
  }
  return result
}
