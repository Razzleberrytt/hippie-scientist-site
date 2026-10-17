import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adjudicateFilm} from './autonomous-quality-arbiter.mjs';

const H='a'.repeat(64), V='b'.repeat(64), R='c'.repeat(64), T='d'.repeat(64);
const frame=()=>({actualVideoSha256:H,schemaVersion:'ths-autonomous-film-critic-research-v1',critiqueScope:'AUTONOMOUS_ACTUAL_PIXELS_NEGATIVE_SCREENING_NOT_HUMAN_QUALITY',
  samples:17,decision:'AWAIT_MULTIMODAL_SCIENCE_VOICE_CRAFT_EVIDENCE',issues:[]});
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
test('one-second phase-aliased actual-pixel craft warning survives without quality approval',()=>{
 const d={...frame(),decision:'CRAFT_REVIEW_HOLD',
  reviewCandidates:['INTERLEAVED_NEAR_BLANK_VISUAL_PHASE'],
  interleavedBlankPhaseWindowsSec:[{startSec:1,endSec:16,blankSamples:8,blankPhase:1}]};
 const x=adjudicateFilm({...full(),decodedVisual:d});
 assert.deepEqual(x.blockers,[]);
 assert.ok(x.missingMachineWork.includes('SOURCE_BOUND_CRAFT_REVIEW_FOR_INTERLEAVED_BLANK_INTERVALS'));
 assert.equal(x.contentMayPublish,false);
 assert.equal(x.qualityAcceptableForResearch,false);
 for(const bad of [
  {...d,interleavedBlankPhaseWindowsSec:[]},
  {...d,interleavedBlankPhaseWindowsSec:[{startSec:1,endSec:15,blankSamples:8,blankPhase:1}]},
  {...d,interleavedBlankPhaseWindowsSec:[{startSec:0,endSec:15,blankSamples:8,blankPhase:1}]},
  {...d,reviewCandidates:['INTERLEAVED_NEAR_BLANK_VISUAL_PHASE','FORGED']}
 ]){
  assert.equal(adjudicateFilm({...full(),decodedVisual:bad}).decision,'AUTO_HOLD_INVALID_PROOF');
 }
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
