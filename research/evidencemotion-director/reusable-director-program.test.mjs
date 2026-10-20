import test from 'node:test';
import assert from 'node:assert/strict';
import {compileReusableDirector,DIRECTOR_SCHEMAS} from './reusable-director-program.mjs';
const A='a'.repeat(64),B='b'.repeat(64);
const intents=['everyday-to-mechanism','process-sequence','study-measurement',
               'fair-comparison','uncertainty','source-bound-scale'];
const source=topic=>({
 schema:'ths-source-locked-director-research-v1',researchOnly:true,
 mayPublish:false,topicId:topic,sourceManifestSha256:A,
 originalNarrationSha256:B,totalNarrationDurationSec:12,
 claimLedger:[{id:'claim:known',sourceId:'source:published',class:'STRUCTURE',
               assertsHumanEffect:false}],
 beats:intents.map((visualIntent,i)=>({
   id:'beat:'+i,visualIntent,startSec:2*i,endSec:2*(i+1),
   spokenAnchorTimes:[.25,1.3],claimIds:['claim:known'],
   scientificAssetIds:['asset:source-graphic'],
   visualPurposeId:'explanation:'+i,
   cameraTeachingPlan:{visualPurposeId:'explanation:'+i,
     camera:['MACRO_PUSH','LATERAL_TRACK','FOCUS_TRANSFER','LATERAL_TRACK','LOCKED_HOLD','PULLBACK_SCALE'][i],
     action:[
      'Reveal the object and then its evidence-limited mechanism',
      'Track each reviewed step without skipping source-established order',
      'Focus from a study instrument onto exactly what it measured',
      'Compare the two source-defined quantities on the same declared scale',
      'Hold uncertainty while showing what the source did not establish',
      'Pull back to expose the source-defined scale boundary'
     ][i],
     claimId:'claim:known',assetId:'asset:source-graphic',narrationAnchorSec:.25},
   viewerLearns:'Beat '+i+': a different evidence-backed teaching outcome',
   sequenceReviewed:true,comparisonOrScaleReviewed:true,
   audioStretched:false,generatesScientificGeometry:false,
   claimsUnmeasuredEffect:false
 }))
});
test('all SIX original EvidenceMotion grammars actually compile as shared code',()=>{
 const p=source('compound:verified-source');
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED',JSON.stringify(r.errors));
 assert.deepEqual(r.grammarCoverage,['G1','G2','G3','G4','G5','G6']);
 assert.equal(r.shots.length,6);
 assert.deepEqual(r.shots.map(x=>x.grammarId),['G1','G2','G3','G4','G5','G6']);
 assert.ok(r.shots.every(x=>x.originalNarrationSha256===B));
 assert.ok(r.shots.every(x=>x.sourceClaimIds.join() === 'claim:known'));
 assert.ok(r.shots.every(x=>x.status==='SOURCE_LOCKED_DIRECTOR_PREVIZ_ONLY'));
 assert.equal(r.mayPublish,false);assert.equal(r.excellentCertified,false);
 assert.equal(DIRECTOR_SCHEMAS.length,6);
});
test('same director works on a DIFFERENT scientific subject without hardcoded 7-OH',()=>{
 const m=compileReusableDirector(source('nutrient:independent-topic'));
 const c=compileReusableDirector(source('compound:verified-source'));
 assert.equal(m.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.equal(m.shots[2].topicId,'nutrient:independent-topic');
 assert.deepEqual(m.shots.map(x=>x.grammarId),c.shots.map(x=>x.grammarId));
 assert.notEqual(m.topicId,c.topicId);
});
test('source detail and evidence class are not generated or promoted to human effects',()=>{
 const p=source('science:test');
 p.claimLedger[0].class='PRECLINICAL';p.claimLedger[0].assertsHumanEffect=true;
 const r=compileReusableDirector(p);
 assert.equal(r.status,'HOLD');
 assert.ok(r.errors.includes('UNVERIFIED_OR_MISMATCHED_CLAIMS'));
});
test('unreviewed process/comparison/scale causes strict HOLD',()=>{
 for(const [i,flag] of [[1,'sequenceReviewed'],[3,'comparisonOrScaleReviewed'],
                         [5,'comparisonOrScaleReviewed']]){
  const p=source('science:study');p.beats[i][flag]=false;
  const result=compileReusableDirector(p);
  assert.equal(result.status,'HOLD');
  assert.ok(result.errors.includes(i===1?'PROCESS_REVIEW_REQUIRED':'COMPARISON_OR_SCALE_REVIEW_REQUIRED'));
 }
});
test('factual asset IDs, source identity and narration times are preserved',()=>{
 for(const bad of [
  p=>{p.originalNarrationSha256='invalid'},
  p=>{p.beats[0].scientificAssetIds=[]},
  p=>{p.beats[0].claimIds=['invented']},
  p=>{p.beats[2].audioStretched=true},
  p=>{p.beats[4].claimsUnmeasuredEffect=true},
  p=>{p.beats[0].endSec=99},
  p=>{p.mayPublish=true},
 ]){
  const p=source('science:another');bad(p);
  const r=compileReusableDirector(p);
  assert.equal(r.status,'HOLD',JSON.stringify(r));
  assert.equal(r.productionEligible,false);
 }
});
test('proposal is NEVER a substitute for complete film science or art approval',()=>{
 const r=compileReusableDirector(source('compound:episode'));
 assert.equal(r.productionEligible,false);
 assert.equal(r.excellentCertified,false);
 assert.equal(r.generatedScience,false);
 assert.equal(r.mayPublish,false);
});

test('non-array external claim ledgers fail closed without throwing or creating shots',()=>{
 for(const malformed of [{id:'claim:known'},'claim:known',17,true,null]){
   const p=source('science:malformed-ledger');
   p.claimLedger=malformed;
   const result=compileReusableDirector(p);
   assert.equal(result.status,'HOLD',JSON.stringify(malformed));
   assert.ok(result.errors.includes('UNVERIFIED_OR_MISMATCHED_CLAIMS'));
   assert.deepEqual(result.shots,[]);
   assert.equal(result.productionEligible,false);
   assert.equal(result.excellentCertified,false);
 }
});

test('malformed episode shape or missing total timing causes HOLD, never crash/approve',()=>{
 for(const mutate of [
  p=>{p.beats={invalid:true}},
  p=>{delete p.totalNarrationDurationSec},
  p=>{p.totalNarrationDurationSec=NaN}
 ]){
  const p=source('science:bad-fixture');mutate(p);
  const result=compileReusableDirector(p);
  assert.equal(result.status,'HOLD');
  assert.equal(result.productionEligible,false);
  assert.equal(result.excellentCertified,false);
 }
});

test('adjacent repeated same-asset uncertainty shots are detected even when cameras alternate',()=>{
 const p=source('science:visual-repeat');
 p.beats[0].visualIntent='uncertainty';p.beats[0].cameraTeachingPlan.camera='FOCUS_TRANSFER';
 p.beats[1].visualIntent='uncertainty';p.beats[1].cameraTeachingPlan.camera='LOCKED_HOLD';
 p.beats[2].visualIntent='uncertainty';p.beats[2].cameraTeachingPlan.camera='FOCUS_TRANSFER';
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.equal(r.shots[0].grammarId,'G5');
 assert.equal(r.shots[1].grammarId,'G5');
 assert.notEqual(r.shots[0].primaryCamera,r.shots[1].primaryCamera);
 assert.equal(r.compositionRedirectionRequired,true);
 assert.equal(r.sequenceCraftReview.status,'CRAFT_REDIRECTION_REQUIRED');
 assert.equal(r.sequenceCraftReview.findings[0].consecutiveCount,3);
 assert.equal(r.excellentCertified,false);
 assert.equal(r.productionEligible,false);
 assert.equal(r.mayPublish,false);
});

test('a purposeful grammar change breaks immediate triple repetition but never certifies craft',()=>{
 const p=source('science:distinct');
 p.beats[0].visualIntent='uncertainty';p.beats[0].cameraTeachingPlan.camera='FOCUS_TRANSFER';
 p.beats[1].visualIntent='study-measurement';p.beats[1].cameraTeachingPlan.camera='MACRO_PUSH';
 p.beats[2].visualIntent='uncertainty';p.beats[2].cameraTeachingPlan.camera='LOCKED_HOLD';
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.equal(r.compositionRedirectionRequired,false);
 assert.equal(r.sequenceCraftReview.status,'SEQUENCE_REVIEW_REQUIRED');
 assert.equal(r.excellentCertified,false);
});

test('grammar rotation cannot launder three shots repeating one educational payoff',()=>{
 const p=source('science:lesson-stasis');
 for(let i=0;i<3;i++)p.beats[i].viewerLearns='What the same study measured';
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.equal(r.compositionRedirectionRequired,true);
 assert.ok(r.sequenceCraftReview.findings.some(f=>
   f.reason==='THREE_PLUS_IDENTICAL_TEACHING_PAYOFFS_DESPITE_VISUAL_CHURN'));
 assert.equal(r.productionEligible,false);
 assert.equal(r.excellentCertified,false);
 assert.equal(r.mayPublish,false);
});


test('chosen camera is bound to declared learning action, source and exact narration anchor',()=>{
 const p=source('science:camera-motivation');
 p.beats[0].cameraTeachingPlan.camera='ORBIT_REVEAL';
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED',JSON.stringify(r.errors));
 assert.equal(r.shots[0].primaryCamera,'ORBIT_REVEAL');
 assert.equal(r.shots[0].cameraTeachingPlan.narrationAnchorSec,.25);
 assert.equal(r.shots[0].cameraTeachingPlan.claimId,'claim:known');
 assert.equal(r.shots[0].cameraPurposeStatus,'AUTHOR_DECLARED_REQUIRES_DECODED_FILM_REVIEW');
 assert.equal(r.productionEligible,false);assert.equal(r.excellentCertified,false);
});
test('cosmetic, missing and source-mismatched camera plans fail closed',()=>{
 const flaws=[
  b=>{delete b.cameraTeachingPlan},
  b=>{b.cameraTeachingPlan.action='!!!'},
  b=>{b.cameraTeachingPlan.action='\u200b'},
  b=>{b.cameraTeachingPlan.visualPurposeId='explanation:other'},
  b=>{b.cameraTeachingPlan.claimId='claim:unknown'},
  b=>{b.cameraTeachingPlan.assetId='asset:unknown'},
  b=>{b.cameraTeachingPlan.narrationAnchorSec=.47},
  b=>{b.cameraTeachingPlan.narrationAnchorSec=NaN}
 ];
 for(const flaw of flaws){
  const p=source('science:unjustified-camera');flaw(p.beats[0]);
  const r=compileReusableDirector(p);
  assert.equal(r.status,'HOLD');
  assert.ok(r.errors.includes('SOURCE_BOUND_CAMERA_TEACHING_PLAN_REQUIRED'));
  assert.deepEqual(r.shots,[]);assert.equal(r.productionEligible,false);
 }
});
test('author rationale cannot authorize a camera outside its source-reviewed grammar',()=>{
 const p=source('science:wrong-camera');
 p.beats[0].cameraTeachingPlan.camera='PULLBACK_SCALE';
 const r=compileReusableDirector(p);
 assert.equal(r.status,'HOLD');
 assert.ok(r.errors.includes('CAMERA_NOT_ALLOWED_FOR_VISUAL_INTENT'));
 assert.deepEqual(r.shots,[]);assert.equal(r.excellentCertified,false);
});


test('three copied camera explanations across different lessons prompt craft redirection',()=>{
 const p=source('science:generic-camera-excuse');
 for(let i=0;i<4;i++)
  p.beats[i].cameraTeachingPlan.action=i===1?'SHOW  the same diagram!':'Show the same diagram';
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.equal(r.compositionRedirectionRequired,true);
 const findings=r.sequenceCraftReview.findings.filter(x=>
  x.reason==='THREE_PLUS_RECYCLED_CAMERA_ACTIONS_ACROSS_DISTINCT_LESSONS');
 assert.deepEqual(findings,[{
   reason:'THREE_PLUS_RECYCLED_CAMERA_ACTIONS_ACROSS_DISTINCT_LESSONS',
   firstBeatId:'beat:0',lastBeatId:'beat:3',consecutiveCount:4
 }]);
 assert.equal(r.sequenceCraftReview.status,'CRAFT_REDIRECTION_REQUIRED');
 assert.equal(r.productionEligible,false);assert.equal(r.excellentCertified,false);
 assert.equal(r.mayPublish,false);
});
test('six specific camera actions are not mislabeled a copied teaching rationale',()=>{
 const p=source('science:specific-camera-actions');
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.deepEqual(r.sequenceCraftReview.findings,[]);
 assert.equal(r.compositionRedirectionRequired,false);
 assert.equal(r.excellentCertified,false);assert.equal(r.mayPublish,false);
});
test('two repeated actions do not meet the three-beat review trigger',()=>{
 const p=source('science:two-camera-actions');
 p.beats[1].cameraTeachingPlan.action=p.beats[0].cameraTeachingPlan.action;
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.ok(!r.sequenceCraftReview.findings.some(x=>
  x.reason==='THREE_PLUS_RECYCLED_CAMERA_ACTIONS_ACROSS_DISTINCT_LESSONS'));
 assert.equal(r.mayPublish,false);
});
