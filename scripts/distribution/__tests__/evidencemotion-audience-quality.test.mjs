import test from 'node:test'
import assert from 'node:assert/strict'
import {assessEvidenceMotionAudienceQuality} from '../evidencemotion-audience-quality.mjs'
const F='a'.repeat(64), H='b'.repeat(64), R='c'.repeat(64), S='d'.repeat(64)
const brief={viewerSegment:'Adults seeking substance science and harm reduction',
  relevanceReason:'Evidence on dependency and withdrawal',
  firstTwoSecondsPromise:'What hidden risk follows a calming pitch?',
  viewerPayoff:'Recognize withdrawal danger and seek medical advice'}
const pixel=(faults=[])=>({origin:'ACTUAL_DECODED_MP4_PIXEL_REVIEW',filmSha256:F,
  sampleFramesSha256:H,firstTwoSecondsCovered:true,phoneSizedFramesReviewed:true,
  sampleCount:12,mediaDurationSeconds:30,fullFilmCoverageAttested:true,
  sampleTimesSeconds:[0,.5,1.5,3,6,9,12,15,18,21,24,29.5],faults})
const dims=['openingClarity','topicAudienceFit','curiosityGap','visualDistinctiveness','narrativeMomentum','soundOffComprehension','payoff']
const critic=(modelFamily,runHash)=>({origin:'INDEPENDENT_CALIBRATED_FULL_FILM_AUDIENCE_CRITIC',
 filmSha256:F,modelFamily,modelRunSha256:runHash,referenceSetSha256:S,
 fullOriginalAudioAndVideoReviewed:true,actualTargetPlatform:'tiktok',
 calibratedAgainstExternalGoodBadExamples:true,falsePositiveApprovalRate:.02,
 scores:Object.fromEntries(dims.map(x=>[x,9.1])),timecodedProblems:[]})
const full=()=>({filmSha256:F,audienceBrief:brief,decodedPixelReview:pixel(),
 independentCritics:[critic('family-A',H),critic('family-B',R)]})
test('a technically correct or full-score film is NOT automatically audience approved',()=>{
 const x=assessEvidenceMotionAudienceQuality(full())
 assert.equal(x.decision,'REVIEW_PENDING');assert.equal(x.mayRecommendPosting,false)
 assert.ok(x.missingReviews.includes('TRUSTED_ACTUAL_FILM_AUDIENCE_REVIEW_RUNNER_NOT_YET_VERIFIED'))
})
test('real phenibut opening-frame complaint forces REVISE despite flawless encode',()=>{
 const x=assessEvidenceMotionAudienceQuality({...full(),decodedPixelReview:pixel([
  {seconds:0,code:'MALFORMED_HERO_OBJECT',whatFailed:'capsule partly obscured and geometrically broken'},
  {seconds:.1,code:'OPENING_TEXT_CLUTTER',whatFailed:'10 competing text panels at once'}
 ])})
 assert.equal(x.decision,'REVISE');assert.equal(x.mayRecommendPosting,false)
 assert.ok(x.timecodedRepairTargets.includes('AUDIENCE_REVISE:OPENING_TEXT_CLUTTER'))
})
test('14 views alone cannot prove poor video quality, hook or audience rejection',()=>{
 const x=assessEvidenceMotionAudienceQuality({...full(),observedPerformance:{views:14}})
 assert.equal(x.performanceInterpretation,'INSUFFICIENT_DISTRIBUTION_OR_RETENTION_EVIDENCE')
 assert.equal(x.decision,'REVIEW_PENDING')
})
test('low opening strength from two calibrated reviewers triggers repair',()=>{
 const p=full();p.independentCritics[1].scores.curiosityGap=6.8
 const x=assessEvidenceMotionAudienceQuality(p)
 assert.equal(x.decision,'REVISE')
 assert.ok(x.timecodedRepairTargets.includes('AUDIENCE_REVISE:BELOW_BAR:curiosityGap'))
})
test('independent reviewer family or model-run cannot be duplicated for approval',()=>{
 const p=full();p.independentCritics[1].modelFamily='family-A'
 const x=assessEvidenceMotionAudienceQuality(p)
 assert.equal(x.decision,'REVIEW_PENDING')
 assert.ok(x.missingReviews.includes('TWO_CALIBRATED_INDEPENDENT_AUDIENCE_REVIEWS_REQUIRED'))
})
test('missing decoded first seconds cannot be replaced with storyboard praise',()=>{
 const p=full();p.decodedPixelReview.firstTwoSecondsCovered=false
 const x=assessEvidenceMotionAudienceQuality(p)
 assert.ok(x.missingReviews.includes('EXACT_VIDEO_FIRST_SECONDS_PHONE_PIXELS_AND_FULL_FILM_REQUIRED'))
 assert.equal(x.mayRecommendPosting,false)
})
test('forged high scores cannot overcome mismatched film SHA',()=>{
 const p=full();p.decodedPixelReview.filmSha256=R
 const x=assessEvidenceMotionAudienceQuality(p)
 assert.ok(x.missingReviews.includes('EXACT_VIDEO_FIRST_SECONDS_PHONE_PIXELS_AND_FULL_FILM_REQUIRED'))
})
test('audience metadata never becomes a basis for invented predictions or virality',()=>{
 const x=assessEvidenceMotionAudienceQuality({...full(),observedPerformance:{views:750,impressions:800,averageWatchSeconds:19}})
 assert.equal(x.performanceInterpretation,'METRICS_PRESENT_NO_CAUSAL_INFERENCE')
 assert.equal(x.audienceQualityApproved,false)
 assert.equal(x.mayRecommendPosting,false)
})
test('unknown timecoded issues are rejected as invalid evidence',()=>{
 const x=assessEvidenceMotionAudienceQuality({...full(),decodedPixelReview:pixel([{code:'I_DO_NOT_EXIST',seconds:1,whatFailed:'x'}])})
 assert.equal(x.decision,'HOLD_INVALID_EVIDENCE')
})


test('rejects nonarray critic collections with an explainable HOLD instead of crashing',()=>{
 for(const critics of [null,{},'two independent reviewers',42]){
   const x=assessEvidenceMotionAudienceQuality({...full(),independentCritics:critics})
   assert.equal(x.decision,'HOLD_INVALID_EVIDENCE')
   assert.ok(x.failedReasons.includes('INVALID_INDEPENDENT_REVIEW_COLLECTION'))
   assert.ok(x.missingReviews.includes('TWO_CALIBRATED_INDEPENDENT_AUDIENCE_REVIEWS_REQUIRED'))
   assert.equal(x.mayRecommendPosting,false)
 }
})
test('missing independent critic collection remains review pending, never approved',()=>{
 const x=assessEvidenceMotionAudienceQuality({...full(),independentCritics:undefined})
 assert.equal(x.decision,'REVIEW_PENDING')
 assert.equal(x.audienceQualityApproved,false)
 assert.equal(x.mayRecommendPosting,false)
})

test('opening-only phone pixels are not misrepresented as whole-film coverage',()=>{
 const p=full()
 p.decodedPixelReview.sampleTimesSeconds=[0,.1,.2,.3,.4,.5,.6,.7,.8,1,1.5,2]
 const x=assessEvidenceMotionAudienceQuality(p)
 assert.ok(x.missingReviews.includes('EXACT_VIDEO_FIRST_SECONDS_PHONE_PIXELS_AND_FULL_FILM_REQUIRED'))
 assert.equal(x.mayRecommendPosting,false)
})
test('endpoint-only images do not prove visual coverage between them',()=>{
 const p=full()
 p.decodedPixelReview.sampleTimesSeconds=[0,.1,.2,.3,.4,.5,.6,.7,.8,1,1.5,29.5]
 assert.ok(assessEvidenceMotionAudienceQuality(p).missingReviews.includes('EXACT_VIDEO_FIRST_SECONDS_PHONE_PIXELS_AND_FULL_FILM_REQUIRED'))
})
test('fabricated nonmonotone and out-of-video sample times do not count',()=>{
 for(const samples of [undefined,[],[0,2,1,3,6,9,12,15,18,21,24,29.5],
 [0,.5,1.5,3,6,9,12,15,18,21,24,999]]){
  const p=full();p.decodedPixelReview.sampleTimesSeconds=samples
  assert.ok(assessEvidenceMotionAudienceQuality(p).missingReviews.includes('EXACT_VIDEO_FIRST_SECONDS_PHONE_PIXELS_AND_FULL_FILM_REQUIRED'))
 }
})
test('timecoded faults after the film duration cannot become repair evidence',()=>{
 const x=assessEvidenceMotionAudienceQuality({...full(),decodedPixelReview:pixel([{seconds:40,
 code:'OPENING_TEXT_CLUTTER',whatFailed:'Not a time on this film'}])})
 assert.equal(x.decision,'HOLD_INVALID_EVIDENCE')
 assert.ok(x.failedReasons.includes('MALFORMED_TIMECODED_AUDIENCE_FAULT'))
})
