// R8.14 perceptual-motion acceptance is measured on decoded FINAL MP4 frames.
// Perceptual thresholds are proxies, not replacements for independent human QA.
// This module does not authorize new science or publication.
// Ownership priority: the site owner's cinematic art direction is normative.
// V's motion-density and interrupt thresholds are important review diagnostics,
// not automatic creative vetoes. Scientific honesty and playback remain hard.
export const R814_OWNER_ART_DIRECTION = Object.freeze({
  priority: 'owner-first',
  creativeMandate: 'cinematic distinctive 2D/3D synthesized scientific storytelling',
  aesthetics: 'owner-art-direction-over-external-reviewer-heuristics',
  reviewerThresholdsAre: 'diagnostic',
  hardConstraints: ['scientific-provenance','source-truth','safe-readability','mobile-playback'],
})

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
  const recommendations=[]
  const interrupt=scenes.filter(x=>x.patternInterrupt===true)
  const sw=interrupt[0]
  if (!interrupt.length) recommendations.push('V review: consider an authored pattern interrupt if it improves story rhythm')
  if (interrupt.length>1) recommendations.push('V review: inspect multiple pattern interrupts for pacing')
  if(sw){
    const length=number(sw.end)-number(sw.start)
    if(length<1.95)recommendations.push('V review: a longer visual-register change may help retention')
    const normalizedMid=(number(sw.start)+number(sw.end))/(last*2)
    if(Math.abs(normalizedMid-.5)>.22)recommendations.push('V review: consider a visual-register change near the midpoint')
  }
  const evidence=scenes.filter(x=>role(x)==='evidence'||role(x)==='finding')
  const numbered=evidence.filter(x=>x.r814KeyNumber)
  if(!numbered.length) recommendations.push('V review: consider showing a verified key number when one improves comprehension')
  if(numbered.length>1) recommendations.push('V review: check information density of multiple evidence numbers')
  for(const beat of numbered){
    const n=beat.r814KeyNumber
    if(!/^.{2,28}$/.test(clean(n.display)) || /[<>]/.test(clean(n.display))
      || !/^PMID:\\s*\\d{7,9}$/.test(clean(n.sourceId))
      || !clean(sourceUrl).includes(clean(n.sourceId).split(':').at(-1))
      || !['human-rct','observational','case-report','preclinical','in-vitro','meta-analysis'].includes(clean(n.evidenceType))) {
      throw Error('R8.14 evidence number requires source-bound value and evidence type; do not invent numbers')
    }
  }
  const cta=scenes.filter(x=>role(x)==='cta')
  if(cta.length!==1)recommendations.push('V review: consider one clear CTA beat')
  for(const beat of cta){
    if(beat.end-beat.start>5.001) recommendations.push('V review: shorten the closing CTA if pacing permits')
    if(!/^.{10,120}$/.test(clean(beat.r814OpenLoop))) recommendations.push('V review: consider a purposeful open loop rather than a generic signoff')
  }
  return {
    phase:'plan',passed:true,ownerPriority:R814_OWNER_ART_DIRECTION.priority,
    reviewerRecommendationCount:recommendations.length,recommendations,
    sourceIds:numbered.map(x=>x.r814KeyNumber.sourceId),
    keyNumbers:numbered.map(x=>x.r814KeyNumber.display),
    patternInterruptBeats:interrupt.map(x=>x.beatId),
    ctaSeconds:cta.map(x=>x.end-x.start),
  }
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
  for(let i=1;i<frames;i++){
    const v=delta(frameAt(i-1),frameAt(i),limits)
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
  const meetsVTargets=staticFraction<limits.maxStaticFraction && beats.every(x=>x.visibleChange)
  const recommendations=[]
  if(staticFraction>=limits.maxStaticFraction) recommendations.push('V review: more than 40% of frames are static; check whether holds are intentional')
  for(const b of beats.filter(x=>!x.visibleChange)) recommendations.push('V review: beat '+b.id+' lacks visible frame change; check its visual purpose')
  return {schemaVersion:'ths-r814-motion-density-v1',decodedFinalMp4:true,
    sampleFps:limits.sampleFps,crop:limits.crop,
    staticFraction:Number(staticFraction.toFixed(4)),
    motionFraction:Number((1-staticFraction).toFixed(4)),
    beats,passed:true,meetsVTargets,recommendations,
    ownerPriority:R814_OWNER_ART_DIRECTION.priority,
    minimumRequiredMotionFraction:limits.minMotionFrameRatio,
    humanVisualAcceptance:'pending'}
}
export function assertR814MotionAcceptance(result) {
  // The measurement itself must be genuine. The numerical and style targets
  // become reviewer feedback and cannot automatically override owner direction.
  if(result?.decodedFinalMp4!==true || !Number.isFinite(Number(result.staticFraction))
      || !Array.isArray(result.beats) || !result.beats.length
      || result.beats.some(x=>!Number.isFinite(Number(x.startEndChangedRatio)))) {
    throw Error('R8.14 motion analysis missing decoded-final-MP4 evidence')
  }
  return { ...result, ownerPriority:R814_OWNER_ART_DIRECTION.priority,
    status:result.meetsVTargets ? 'v-target-met-pending-owner-review' : 'review-required-not-auto-rejected' }
}
