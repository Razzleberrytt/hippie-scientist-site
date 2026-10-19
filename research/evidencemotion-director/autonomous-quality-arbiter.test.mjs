import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adjudicateFilm} from './autonomous-quality-arbiter.mjs';

const H='a'.repeat(64), V='b'.repeat(64), R='c'.repeat(64), T='d'.repeat(64);
const frame=()=>({actualVideoSha256:H,schemaVersion:'ths-autonomous-film-critic-research-v1',critiqueScope:'AUTONOMOUS_ACTUAL_PIXELS_NEGATIVE_SCREENING_NOT_HUMAN_QUALITY',
  samples:17,decision:'AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE',issues:[],
  reviewCandidates:[],centerHeroStasisPeripheralMotionWindowsSec:[],
  twoStateAlternationWindowsSec:[],interleavedBlankPhaseWindowsSec:[]});
const science=()=>({filmSha256:H,origin:'INDEPENDENT_SOURCE_GRAPH_AUDIT',
 underlyingSourcesVerified:true,claimChecks:[{claimTextSha256:T,exactSourceIds:['PUBCHEM:44301524'],
 supportStatus:'SUPPORTED',humanEvidenceDirectness:'NOT_A_HUMAN_EFFECT_CLAIM',humanEffectAsserted:false}]});
const voice=()=>({filmSha256:H,origin:'INDEPENDENT_AUDIO_ASR_AND_ACOUSTIC',
 originalWavSha256:V,extractedAudioSha256:R,
 exactWavLocked:true,actualAudioVerified:true,hardAudioFailures:[],
 fittedWordAlignment:true,termPronunciationCoverage:true,
 pronunciationConfidence:.97,asrCoverage:.98,verifiedMispronunciations:[]});
const dims=['firstSecond','narrative','artDirection','motionPurpose','typography','cohesion','audioNaturalness'];
const critic=(modelFamily,hash)=>({filmSha256:H,origin:'INDEPENDENT_FULL_VIDEO_MULTIMODAL_CRITIC',
 modelFamily,modelRunSha256:hash,referenceSetSha256:V,
 calibrationPassed:true,anchorFalsePassRate:.02,anchorFalseRejectRate:.07,
 reviewedFullAudioAndVideo:true,scienceJudgeSeparate:true,
 scores:Object.fromEntries(dims.map(x=>[x,9])),
 timecodedFaults:[]});
const full=()=>({videoSha256:H,decodedVisual:frame(),science:science(),voice:voice(),
 critics:[critic('model-family-A',R),critic('model-family-B',T)]});

test('actual decoded repetitive visual layout automatically REJECTS without an owner listener',()=>{
 const r=adjudicateFilm({...full(),decodedVisual:{...frame(),decision:'AUTO_REVISE',
 issues:['REPETITIVE_SOURCE_LAYOUT_REQUIRES_ART_DIRECTION_REPAIR']}});
 assert.equal(r.decision,'AUTO_REVISE');
 assert.equal(r.requiredOwnerTasteVerdict,false);
 assert.equal(r.requiredHumanListener,false);
 assert.equal(r.contentMayPublish,false);
});
test('decoded centered-hero craft advisory survives handoff and requests more machine craft work',()=>{
 const decoded={...frame(),decision:'CRAFT_REVIEW_HOLD',
   reviewCandidates:['CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION'],
   centerHeroStasisPeripheralMotionWindowsSec:[{startSec:0,endSec:16,repeatedPairCount:8}]};
 const x=adjudicateFilm({...full(),decodedVisual:decoded});
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.deepEqual(x.blockers,[]);
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_STATIC_CENTER_HERO'));
 assert.equal(x.qualityAcceptableForResearch,false);
 assert.equal(x.contentMayPublish,false);
 assert.equal(x.requiredOwnerTasteVerdict,false);
});
test('unbound or empty craft warnings cannot pose as verified decoded-screen work',()=>{
 const base={...frame(),decision:'CRAFT_REVIEW_HOLD',
   reviewCandidates:['CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION'],
   centerHeroStasisPeripheralMotionWindowsSec:[{startSec:0,endSec:6,repeatedPairCount:3}]};
 const variants=[
   {...base,reviewCandidates:[]},
   {...base,centerHeroStasisPeripheralMotionWindowsSec:[]},
   {...base,centerHeroStasisPeripheralMotionWindowsSec:[{startSec:0,endSec:2,repeatedPairCount:3}]},
   {...base,centerHeroStasisPeripheralMotionWindowsSec:[{startSec:0,endSec:NaN,repeatedPairCount:3}]},
   {...base,actualVideoSha256:V},
 ];
 for(const decodedVisual of variants){
   const x=adjudicateFilm({...full(),decodedVisual});
   assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
   assert.equal(x.contentMayPublish,false);
 }
});
test('hard decoded-frame defect overrides advisory and stays AUTO_REVISE',()=>{
 const decoded={...frame(),decision:'CRAFT_REVIEW_HOLD',
   issues:['MISSING_RECOGNIZABLE_SUBJECT_OR_NEAR_BLANK_CENTRAL_STAGE'],
   reviewCandidates:['CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION'],
   centerHeroStasisPeripheralMotionWindowsSec:[{startSec:0,endSec:6,repeatedPairCount:3}]};
 const x=adjudicateFilm({...full(),decodedVisual:decoded});
 assert.equal(x.decision,'AUTO_REVISE');
 assert.ok(x.fixes.includes('MISSING_RECOGNIZABLE_SUBJECT_OR_NEAR_BLANK_CENTRAL_STAGE'));
 assert.equal(x.contentMayPublish,false);
});
test('pending visual decision cannot silently erase actual decoded craft warnings',()=>{
 const warnings=[
   {reviewCandidates:['CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION'],
    centerHeroStasisPeripheralMotionWindowsSec:[{startSec:0,endSec:6,repeatedPairCount:3}]},
   {twoStateAlternationWindowsSec:[{startSec:0,endSec:12,lagTwoMatchedPairs:5}]},
   {interleavedBlankPhaseWindowsSec:[{startSec:1,endSec:8,blankSamples:4,blankPhase:1}]},
   {reviewCandidates:'MALFORMED'},
   {reviewCandidates:null},
   {reviewCandidates:undefined},
   {centerHeroStasisPeripheralMotionWindowsSec:undefined},
   {twoStateAlternationWindowsSec:undefined},
   {interleavedBlankPhaseWindowsSec:undefined},
 ];
 for(const fields of warnings){
   const x=adjudicateFilm({...full(),decodedVisual:{...frame(),...fields}});
   assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
   assert.ok(x.blockers.includes('VISUAL_CRAFT_WARNING_SUPPRESSED'));
   assert.equal(x.contentMayPublish,false);
 }
});
test('empty decoded craft warning collections preserve research-only pending state',()=>{
 const decodedVisual={...frame(),reviewCandidates:[],
   centerHeroStasisPeripheralMotionWindowsSec:[],
   twoStateAlternationWindowsSec:[],
   interleavedBlankPhaseWindowsSec:[]};
 const x=adjudicateFilm({...full(),decodedVisual});
 assert.deepEqual(x.blockers,[]);
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.equal(x.contentMayPublish,false);
});
const oneHzCadence=(windows=[])=>({
  probe:'SHA_PINNED_ACTUAL_FRAME_CENTER_HERO_1HZ_RESEARCH_NEGATIVE_ONLY',
  sampleCount:34,centerHeroBoxPixels:[58,86,122,190],
  visibleCenterHeroSamples:34,thresholdSec:3,
  stagnationWindows:windows,
  longestFlaggedStagnationSec:Math.max(0,...windows.map(w=>w.stagnantSecondsAtOneHz)),
  creativeScreenVerdict:windows.length?'CRAFT_HOLD':'NO_NEGATIVE_FOUND_NOT_CRAFT_PASS',
  sceneSpecificHeroAndMeaningVerified:false,
  offCenterAndIntentionalReadingHoldNotAdjudicated:true,
  automaticallyApprovedArt:false,
});
const withOneHz=(cadence=oneHzCadence())=>({
  ...frame(),oneHzOpticalScreenSamples:34,
  actualDurationSeconds:34.366667,oneHzHeroCadence:cadence
});
test('actual decoded 3s/7s center-hero windows remain a separate semantic craft review HOLD',()=>{
 const windows=[
   {startSec:4,endSec:7,stagnantSecondsAtOneHz:3,severity:'CRAFT_HOLD_CANDIDATE'},
   {startSec:10,endSec:17,stagnantSecondsAtOneHz:7,severity:'REVISE_CANDIDATE'},
 ];
 const x=adjudicateFilm({...full(),decodedVisual:withOneHz(oneHzCadence(windows))});
 assert.deepEqual(x.blockers,[]);
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_1HZ_HERO_STAGNATION'));
 assert.equal(x.qualityAcceptableForResearch,false);
 assert.equal(x.contentMayPublish,false);
});
test('no detected 1Hz stagnation does not self-certify craft or release',()=>{
 const x=adjudicateFilm({...full(),decodedVisual:withOneHz()});
 assert.deepEqual(x.blockers,[]);
 assert.ok(!x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_1HZ_HERO_STAGNATION'));
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.equal(x.contentMayPublish,false);
});
test('missing 1Hz decoded evidence is an explicit unfinished review dependency',()=>{
 const x=adjudicateFilm(full());
 assert.ok(x.missingMachineWork.includes('DECODED_1HZ_HERO_CADENCE_EVIDENCE_MISSING'));
 assert.equal(x.contentMayPublish,false);
});
test('forged or internally contradictory 1Hz cadence receipts fail closed',()=>{
 const w={startSec:4,endSec:7,stagnantSecondsAtOneHz:3,severity:'CRAFT_HOLD_CANDIDATE'};
 const good=oneHzCadence([w]);
 const cases=[
   {...good,stagnationWindows:[{...w,endSec:999}]},
   {...good,stagnationWindows:[{...w,stagnantSecondsAtOneHz:2}]},
   {...good,stagnationWindows:[{...w,severity:'REVISE_CANDIDATE'}]},
   {...good,stagnationWindows:[w,w]},
   {...good,stagnationWindows:[]},
   {...good,stagnationWindows:null},
   {...good,sampleCount:35},
   {...good,longestFlaggedStagnationSec:7},
   {...good,creativeScreenVerdict:'NO_NEGATIVE_FOUND_NOT_CRAFT_PASS'},
   {...good,automaticallyApprovedArt:true},
   {...good,centerHeroBoxPixels:[0,0,320,180]},
   // A 3-second flagged window needs four consecutive visible 1Hz frames.
   {...good,visibleCenterHeroSamples:0},
   {...good,visibleCenterHeroSamples:3},
   null,
 ];
 for(const candidate of cases){
   const x=adjudicateFilm({...full(),decodedVisual:withOneHz(candidate)});
   assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
   assert.ok(x.blockers.includes('DECODED_1HZ_HERO_CADENCE_PROOF_INVALID'));
   assert.equal(x.contentMayPublish,false);
 }
});
test('disjoint center-hero freeze windows cannot share fictitious visible samples',()=>{
 const windows=[
   {startSec:4,endSec:7,stagnantSecondsAtOneHz:3,severity:'CRAFT_HOLD_CANDIDATE'},
   {startSec:10,endSec:17,stagnantSecondsAtOneHz:7,severity:'REVISE_CANDIDATE'},
 ];
 // Producer counts visible decoded frames. Disjoint windows need 4+8=12.
 const forged=adjudicateFilm({...full(),decodedVisual:withOneHz({
   ...oneHzCadence(windows),visibleCenterHeroSamples:11
 })});
 assert.equal(forged.decision,'AUTO_HOLD_INVALID_PROOF');
 assert.ok(forged.blockers.includes('DECODED_1HZ_HERO_CADENCE_PROOF_INVALID'));
 const consistent=adjudicateFilm({...full(),decodedVisual:withOneHz({
   ...oneHzCadence(windows),visibleCenterHeroSamples:12
 })});
 assert.equal(consistent.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.ok(consistent.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_1HZ_HERO_STAGNATION'));
 assert.equal(consistent.contentMayPublish,false);
});
test('shortening an otherwise self-consistent one-Hz grid cannot erase the actual film tail',()=>{
 const short={...oneHzCadence(),sampleCount:8,visibleCenterHeroSamples:8};
 const fullLength=adjudicateFilm({...full(),decodedVisual:{
   ...withOneHz(short),samples:4,oneHzOpticalScreenSamples:8,actualDurationSeconds:90
 }});
 assert.equal(fullLength.decision,'AUTO_HOLD_INVALID_PROOF');
 assert.ok(fullLength.blockers.includes('DECODED_1HZ_HERO_CADENCE_PROOF_INVALID'));
 assert.equal(fullLength.contentMayPublish,false);
});
test('one-Hz review requires a credible decoded duration and bounds oversized window inventories',()=>{
 const window={startSec:4,endSec:7,stagnantSecondsAtOneHz:3,severity:'CRAFT_HOLD_CANDIDATE'};
 for(const duration of [undefined,null,NaN,Infinity,4,95]){
   const x=adjudicateFilm({...full(),decodedVisual:{
     ...withOneHz(),actualDurationSeconds:duration
   }});
   assert.ok(x.blockers.includes('DECODED_1HZ_HERO_CADENCE_PROOF_INVALID'));
 }
 const many=Array(150000).fill(window);
 const x=adjudicateFilm({...full(),decodedVisual:withOneHz({
   ...oneHzCadence(),stagnationWindows:many
 })});
 assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
 assert.ok(x.blockers.includes('DECODED_1HZ_HERO_CADENCE_PROOF_INVALID'));
});
test('missing machine reviewers schedules more evidence, never asks an owner to be the judge',()=>{
 const x=adjudicateFilm({...full(),voice:undefined,critics:[]});
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.ok(x.missingMachineWork.includes('INDEPENDENT_ORIGINAL_VOICE_ASR_AND_AUDIO_RECEIPT_REQUIRED'));
 assert.ok(x.missingMachineWork.includes('TWO_DIFFERENT_CALIBRATED_MULTIMODAL_REVIEWERS_MISSING'));
 assert.equal(x.contentMayPublish,false);
});
test('source contradiction vetoes any beautiful video or agreement',()=>{
 const p=full();p.science.claimChecks[0].supportStatus='CONTRADICTED';
 const x=adjudicateFilm(p);assert.equal(x.decision,'AUTO_REVISE');
 assert.ok(x.fixes.includes('CLAIM_UNSUPPORTED_OR_PROMOTED_PRECLINICAL_EFFECT'));
});
test('mechanistic structure cannot be promoted as verified human treatment effect',()=>{
 const p=full();p.science.claimChecks[0].humanEffectAsserted=true;
 const x=adjudicateFilm(p);assert.equal(x.decision,'AUTO_REVISE');
});
test('two votes from one model family cannot fake a second independent taste judge',()=>{
 const p=full();p.critics[1].modelFamily=p.critics[0].modelFamily;
 const x=adjudicateFilm(p);assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
});
test('calibration is required, not simply positive self-reported scores',()=>{
 const p=full();p.critics[0].anchorFalsePassRate=.15;
 const x=adjudicateFilm(p);assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
});
test('strong disagreement causes new autonomous review, not fake majority signoff',()=>{
 const p=full();p.critics[1].scores.motionPurpose=7.4;
 const x=adjudicateFilm(p);assert.equal(x.decision,'AUTO_REVISE');
 assert.ok(x.missingMachineWork.includes('BLIND_CRAFT_JUDGES_DISAGREE:motionPurpose'));
});
test('known AI taste failure produces timecoded autonomous repair decision',()=>{
 const p=full();p.critics[0].scores.narrative=7.8;
 assert.ok(adjudicateFilm(p).fixes.includes('AUTOMATED_CRAFT_BELOW_PREMIUM_BAR:narrative'));
});
test('word alignment and specialist pronunciation uncertainty cannot be hidden',()=>{
 const p=full();p.voice.pronunciationConfidence=.81;
 const x=adjudicateFilm(p);assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.ok(x.missingMachineWork.includes('SPECIALIST_PRONUNCIATION_OR_EXACT_WORD_COVERAGE_UNCERTAIN'));
});
test('verified mispronunciation is a machine-triggered repair',()=>{
 const p=full();p.voice.verifiedMispronunciations=['mitragynine'];
 assert.equal(adjudicateFilm(p).decision,'AUTO_REVISE');
});
test('synthetic high scores do not counterfeit actual model/source tool invocations',()=>{
 const x=adjudicateFilm(full());
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.equal(x.qualityAcceptableForResearch,false);
 assert.ok(x.missingMachineWork.includes('TRUSTED_MULTIMODAL_AND_SOURCE_RUN_ATTESTATION_NOT_IMPLEMENTED'));
 assert.equal(x.contentMayPublish,false);
 assert.equal(x.productionVersionFreezeLifted,false);
 assert.equal(x.humanReviewerImpersonated,false);
});
test('missing evidence directness never counts as an independently supported claim',()=>{
 const p=full();delete p.science.claimChecks[0].humanEvidenceDirectness;
 const x=adjudicateFilm(p);
 assert.ok(x.missingMachineWork.includes('CLAIM_PROVENANCE_OR_EVIDENCE_DIRECTNESS_MISSING'));
 assert.equal(x.qualityAcceptableForResearch,false);
});
test('unknown and invented scientific evidence classes require more source research',()=>{
 for(const directness of ['UNKNOWN','MYSTERY',null]){
  const p=full();p.science.claimChecks[0].humanEvidenceDirectness=directness;
  assert.ok(adjudicateFilm(p).missingMachineWork.includes('CLAIM_PROVENANCE_OR_EVIDENCE_DIRECTNESS_MISSING'));
 }
});
test('missing, null, negative or nonfinite critic calibration rates are never valid reviewer proof',()=>{
 for(const rate of [null,undefined,-.2,NaN,Infinity]){
  const p=full();p.critics[0].anchorFalsePassRate=rate;
  const x=adjudicateFilm(p);
  assert.ok(x.missingMachineWork.includes('TWO_DIFFERENT_CALIBRATED_MULTIMODAL_REVIEWERS_MISSING'));
 }
});
test('unsigned or mismatched video identities reject before any purported film review',()=>{
 const p=full();p.decodedVisual.actualVideoSha256='f'.repeat(64);
 const x=adjudicateFilm(p);
 assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
});

test('two-state layout loops request autonomous source-bound craft review',()=>{
 const decoded={...frame(),decision:'CRAFT_REVIEW_HOLD',
  reviewCandidates:['TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION'],
  twoStateAlternationWindowsSec:[{startSec:0,endSec:16,lagTwoMatchedPairs:7}]};
 const x=adjudicateFilm({...full(),decodedVisual:decoded});
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.deepEqual(x.blockers,[]);
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_TWO_STATE_LAYOUT_LOOP'));
 assert.equal(x.contentMayPublish,false);
});
test('invalid and forged two-state receipts remain a hard HOLD',()=>{
 const valid={...frame(),decision:'CRAFT_REVIEW_HOLD',
  reviewCandidates:['TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION'],
  twoStateAlternationWindowsSec:[{startSec:0,endSec:16,lagTwoMatchedPairs:7}]};
 for(const decodedVisual of [
  {...valid,reviewCandidates:[]},
  {...valid,reviewCandidates:[...valid.reviewCandidates,'INVENTED_PASS']},
  {...valid,twoStateAlternationWindowsSec:[]},
  {...valid,twoStateAlternationWindowsSec:[{startSec:0,endSec:6,lagTwoMatchedPairs:7}]},
  {...valid,twoStateAlternationWindowsSec:[{startSec:0,endSec:16,lagTwoMatchedPairs:NaN}]},
  {...valid,actualVideoSha256:V}
 ]){
  const x=adjudicateFilm({...full(),decodedVisual});
  assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
  assert.equal(x.contentMayPublish,false);
 }
});
test('multiple craft issues remain separately visible without premium credit',()=>{
 const decoded={...frame(),decision:'CRAFT_REVIEW_HOLD',
  reviewCandidates:['TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION',
    'CENTERED_TEACHING_HERO_STASIS_MASKED_BY_PERIPHERAL_MOTION'],
  twoStateAlternationWindowsSec:[{startSec:0,endSec:16,lagTwoMatchedPairs:7}],
  centerHeroStasisPeripheralMotionWindowsSec:[{startSec:0,endSec:16,repeatedPairCount:8}]};
 const x=adjudicateFilm({...full(),decodedVisual:decoded});
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_TWO_STATE_LAYOUT_LOOP'));
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_STATIC_CENTER_HERO'));
 assert.equal(x.contentMayPublish,false);
});


test('real-phase blank warning remains a SHA-bound research hold rather than a publish pass',()=>{
 const d={...frame(),samples:8,actualDurationSeconds:16,
  oneHzOpticalScreenSamples:16,decision:'CRAFT_REVIEW_HOLD',
  reviewCandidates:['INTERLEAVED_NEAR_BLANK_VISUAL_PHASE'],
  interleavedBlankPhaseWindowsSec:[{startSec:1,endSec:16,blankSamples:8,blankPhase:1}]};
 const x=adjudicateFilm({...full(),decodedVisual:d});
 assert.deepEqual(x.blockers,[]);
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_INTERLEAVED_BLANK_INTERVALS'));
 assert.equal(x.contentMayPublish,false);
 assert.equal(x.qualityAcceptableForResearch,false);
});
test('blank-phase proof cannot cite intervals beyond actual decoded movie samples',()=>{
 const good={...frame(),samples:8,actualDurationSeconds:16,
  oneHzOpticalScreenSamples:16,decision:'CRAFT_REVIEW_HOLD',
  reviewCandidates:['INTERLEAVED_NEAR_BLANK_VISUAL_PHASE'],
  interleavedBlankPhaseWindowsSec:[{startSec:1,endSec:16,blankSamples:8,blankPhase:1}]};
 const window={startSec:1,endSec:16,blankSamples:8,blankPhase:1};
 for(const bad of [
  {...good,oneHzOpticalScreenSamples:8},
  {...good,oneHzOpticalScreenSamples:undefined},
  {...good,samples:4},
  {...good,actualDurationSeconds:6},
  {...good,interleavedBlankPhaseWindowsSec:[{...window,endSec:1000,blankSamples:500}]},
  {...good,interleavedBlankPhaseWindowsSec:[{...window,endSec:15}]},
  {...good,interleavedBlankPhaseWindowsSec:[{...window,startSec:0}]},
  {...good,interleavedBlankPhaseWindowsSec:[]},
  {...good,reviewCandidates:['INTERLEAVED_NEAR_BLANK_VISUAL_PHASE','FORGED']}
 ]){
  const x=adjudicateFilm({...full(),decodedVisual:bad});
  assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
  assert.equal(x.contentMayPublish,false);
 }
});
test('two-state and opposite-second blank defects coexist without hiding either',()=>{
 const d={...frame(),samples:8,actualDurationSeconds:16,
  oneHzOpticalScreenSamples:16,decision:'CRAFT_REVIEW_HOLD',
  reviewCandidates:['TWO_STATE_LAYOUT_OSCILLATION_WITHOUT_VISUAL_PROGRESSION','INTERLEAVED_NEAR_BLANK_VISUAL_PHASE'],
  twoStateAlternationWindowsSec:[{startSec:0,endSec:16,lagTwoMatchedPairs:7}],
  interleavedBlankPhaseWindowsSec:[{startSec:1,endSec:16,blankSamples:8,blankPhase:1}]};
 const x=adjudicateFilm({...full(),decodedVisual:d});
 assert.equal(x.decision,'AUTO_RUN_MISSING_REVIEWS');
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_TWO_STATE_LAYOUT_LOOP'));
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_INTERLEAVED_BLANK_INTERVALS'));
 assert.equal(x.contentMayPublish,false);
});


test('audience defects veto a technically valid beautiful science movie independently',()=>{
 const p=full();
 p.audienceBrief={viewerSegment:'Adult harm reduction learners',
   relevanceReason:'Reveal non-obvious dependence risks',
   firstTwoSecondsPromise:'Calming or dependence?',
   viewerPayoff:'Know that sudden withdrawal can be serious'};
 p.audiencePixelReview={origin:'ACTUAL_DECODED_MP4_PIXEL_REVIEW',
   filmSha256:H,sampleFramesSha256:T,
   firstTwoSecondsCovered:true,phoneSizedFramesReviewed:true,sampleCount:8,
   mediaDurationSeconds:30,fullFilmCoverageAttested:true,
   sampleTimesSeconds:[0,1,2,5,10,15,20,29.5],
   faults:[{seconds:0.2,code:'OPENING_TEXT_CLUTTER',
     whatFailed:'Many competing opening banners smother the hook'}]};
 const x=adjudicateFilm(p);
 assert.equal(x.decision,'AUTO_REVISE');
 assert.equal(x.audienceQuality.decision,'REVISE');
 assert.ok(x.fixes.includes('AUDIENCE_REVISE:OPENING_TEXT_CLUTTER'));
 assert.equal(x.postingRecommendationAllowed,false);
});
test('excellent technical receipts without independent audience review cannot receive posting recommendation',()=>{
 const x=adjudicateFilm(full());
 assert.equal(x.audienceQuality.decision,'REVIEW_PENDING');
 assert.equal(x.technicalReviewNotAudienceReview,true);
 assert.equal(x.postingRecommendationAllowed,false);
});
