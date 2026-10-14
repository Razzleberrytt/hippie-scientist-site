import {test} from 'node:test';
import assert from 'node:assert/strict';
import {adjudicateFilm} from './autonomous-quality-arbiter.mjs';

const H='a'.repeat(64), V='b'.repeat(64), R='c'.repeat(64), T='d'.repeat(64);
const frame=()=>({actualVideoSha256:H,scope:'DECODED_LAYOUT_NEGATIVE_FILTER_NOT_AESTHETIC_CERTIFICATION',
  samples:17,decision:'CONTINUE_TO_INDEPENDENT_SCIENCE_VOICE_AND_CRAFT_CHECKS',issues:[]});
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
test('unsigned or mismatched video identities reject before any purported film review',()=>{
 const p=full();p.decodedVisual.actualVideoSha256='f'.repeat(64);
 const x=adjudicateFilm(p);
 assert.equal(x.decision,'AUTO_HOLD_INVALID_PROOF');
});
