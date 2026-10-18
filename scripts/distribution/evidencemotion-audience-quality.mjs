/**
 * EvidenceMotion audience-quality negative gate for exact rendered films.
 *
 * Deliberately separates "the MP4 decodes" from "a viewer will understand,
 * notice and want to keep watching". It can fail weak work automatically.
 * It CANNOT certify virality, user retention, human taste, or calibrated
 * independent multimodal review from untrusted caller-supplied JSON.
 * Never invent audience behavior from view counts.
 */
const SHA=/^[a-f0-9]{64}$/i
const clean=v=>String(v??'').trim()
const AUDIENCE_DIMENSIONS=Object.freeze([
  'openingClarity','topicAudienceFit','curiosityGap','visualDistinctiveness',
  'narrativeMomentum','soundOffComprehension','payoff'
])
export const AUDIENCE_FAULT_CODES=Object.freeze([
 'MALFORMED_HERO_OBJECT','OPENING_TEXT_CLUTTER','WEAK_OR_DELAYED_HOOK',
 'UNREADABLE_PHONE_COPY','CAPTION_VISUAL_COLLISION','DECORATIVE_ONLY_MOTION',
 'REPEATED_TEMPLATE_WITHOUT_PROGRESS','AUDIENCE_ANGLE_UNJUSTIFIED',
 'NARRATIVE_HAS_NO_PAYOFF','AUDIO_VIDEO_SEMANTIC_MISMATCH',
])
const known=new Set(AUDIENCE_FAULT_CODES)
const sha=v=>typeof v==='string'&&SHA.test(v)
const uniq=a=>[...new Set(a)]
function coversWholeFilm(review){
 const duration=review?.mediaDurationSeconds
 const times=review?.sampleTimesSeconds
 if(!Number.isFinite(duration)||duration<4||duration>600
   ||review?.fullFilmCoverageAttested!==true
   ||!Array.isArray(times)||times.length!==review.sampleCount
   ||times.length<4||times.some(t=>!Number.isFinite(t)||t<0||t>duration)
   ||times.some((t,i)=>i>0&&t<=times[i-1])) return false
 // Both ends plus the middle are indispensable. Widely separated endpoint-only
 // screenshots are not evidence that the narrative between them was inspected.
 if(times[0]>.5||times.at(-1)<duration-1
   ||!times.some(t=>Math.abs(t-duration/2)<=duration/8)) return false
 const maxGap=Math.max(...times.slice(1).map((t,i)=>t-times[i]))
 return maxGap<=Math.max(2,duration/3)
}

export function assessEvidenceMotionAudienceQuality({
  filmSha256, audienceBrief, decodedPixelReview, independentCritics=[], observedPerformance
}={}){
 const invalid=[],missing=[],repair=[]
 if(!sha(filmSha256))invalid.push('EXACT_FILM_SHA_REQUIRED')
 if(!audienceBrief||!clean(audienceBrief.viewerSegment)
   ||!clean(audienceBrief.relevanceReason)
   ||!clean(audienceBrief.firstTwoSecondsPromise)
   ||!clean(audienceBrief.viewerPayoff))
   missing.push('INTENDED_VIEWER_HOOK_AND_PAYOFF_BRIEF_REQUIRED')
 if(!decodedPixelReview
   ||decodedPixelReview.origin!=='ACTUAL_DECODED_MP4_PIXEL_REVIEW'
   ||decodedPixelReview.filmSha256!==filmSha256
   ||!sha(decodedPixelReview.sampleFramesSha256)
   ||decodedPixelReview.firstTwoSecondsCovered!==true
   ||decodedPixelReview.phoneSizedFramesReviewed!==true
   ||!Number.isInteger(decodedPixelReview.sampleCount)
   ||decodedPixelReview.sampleCount<4
   ||!coversWholeFilm(decodedPixelReview)
   ||!Array.isArray(decodedPixelReview.faults))
   missing.push('EXACT_VIDEO_FIRST_SECONDS_PHONE_PIXELS_AND_FULL_FILM_REQUIRED')
 else{
   for(const fault of decodedPixelReview.faults){
     if(!known.has(fault?.code)||!Number.isFinite(fault?.seconds)||fault.seconds<0
       ||fault.seconds>decodedPixelReview.mediaDurationSeconds
       ||!clean(fault?.whatFailed)){
       invalid.push('MALFORMED_TIMECODED_AUDIENCE_FAULT');continue
     }
     repair.push('AUDIENCE_REVISE:'+fault.code)
   }
 }
 if(!Array.isArray(independentCritics))invalid.push('INVALID_INDEPENDENT_REVIEW_COLLECTION')
 const valid=(Array.isArray(independentCritics)?independentCritics:[]).filter(c=>
   c?.origin==='INDEPENDENT_CALIBRATED_FULL_FILM_AUDIENCE_CRITIC'
   &&c.filmSha256===filmSha256&&sha(c.modelRunSha256)
   &&sha(c.referenceSetSha256)&&clean(c.modelFamily)
   &&c.fullOriginalAudioAndVideoReviewed===true
   &&c.actualTargetPlatform==='tiktok'
   &&c.calibratedAgainstExternalGoodBadExamples===true
   &&Number.isFinite(c.falsePositiveApprovalRate)&&c.falsePositiveApprovalRate>=0&&c.falsePositiveApprovalRate<=.05
   &&AUDIENCE_DIMENSIONS.every(dim=>Number.isFinite(c.scores?.[dim])&&c.scores[dim]>=0&&c.scores[dim]<=10)
   &&Array.isArray(c.timecodedProblems))
 if(valid.length<2||new Set(valid.map(c=>c.modelFamily)).size<2
   ||new Set(valid.map(c=>c.modelRunSha256)).size<2
   ||new Set(valid.map(c=>c.referenceSetSha256)).size!==1)
   missing.push('TWO_CALIBRATED_INDEPENDENT_AUDIENCE_REVIEWS_REQUIRED')
 else{
   for(const dim of AUDIENCE_DIMENSIONS){
     if(valid.some(c=>c.scores[dim]<8.3))repair.push('AUDIENCE_REVISE:BELOW_BAR:'+dim)
     if(Math.max(...valid.map(c=>c.scores[dim]))-Math.min(...valid.map(c=>c.scores[dim]))>1.5)
       missing.push('AUDIENCE_REVIEW_DISAGREEMENT:'+dim)
   }
   for(const critic of valid){
     for(const fault of critic.timecodedProblems){
       if(!Number.isFinite(fault?.seconds)||fault.seconds<0
          ||!clean(fault?.problem))invalid.push('INVALID_CRITIC_FAULT_REPORT')
       else if(fault.severity==='MAJOR'||fault.severity==='CRITICAL')
         repair.push('AUDIENCE_REVISE:INDEPENDENT_TIME_CODED_FAULT')
     }
   }
 }
 // Neither independently scored JSON nor aggregate view count is trusted
 // positive review attestation. A real calibrated review runner must verify
 // captured model/tool execution, exact input film bytes and scores.
 missing.push('TRUSTED_ACTUAL_FILM_AUDIENCE_REVIEW_RUNNER_NOT_YET_VERIFIED')
 let performanceInterpretation='NOT_PROVIDED'
 if(observedPerformance!==undefined){
   const v=observedPerformance?.views
   if(!Number.isSafeInteger(v)||v<0)invalid.push('INVALID_PLATFORM_VIEWS')
   else if(v<100 || !Number.isSafeInteger(observedPerformance.impressions)
      ||observedPerformance.impressions<0
      ||!Number.isFinite(observedPerformance.averageWatchSeconds)
      ||observedPerformance.averageWatchSeconds<0)
       performanceInterpretation='INSUFFICIENT_DISTRIBUTION_OR_RETENTION_EVIDENCE'
   else performanceInterpretation='METRICS_PRESENT_NO_CAUSAL_INFERENCE'
 }
 const decision=invalid.length?'HOLD_INVALID_EVIDENCE':repair.length?'REVISE':
   'REVIEW_PENDING'
 return Object.freeze({
  schemaVersion:'ths-evidencemotion-audience-gate-v1',
  filmSha256:sha(filmSha256)?filmSha256:null,decision,
  audienceQualityApproved:false,mayRecommendPosting:false,
  independentPositiveCertification:false,
  failedReasons:uniq(invalid),timecodedRepairTargets:uniq(repair),
  missingReviews:uniq(missing),performanceInterpretation,
  technicalDecodeIsNotAudienceEvidence:true,
  note:'Research negative screen; audience impact and retention remain unknown until genuine viewers encounter this film. No fabricated positive signoff.'
 })
}
