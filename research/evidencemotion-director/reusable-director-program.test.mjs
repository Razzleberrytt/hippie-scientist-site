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
   viewerLearns:'How this specific source is supported and what remains unknown',
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
 p.beats[0].visualIntent='uncertainty';
 p.beats[1].visualIntent='uncertainty';
 p.beats[2].visualIntent='uncertainty';
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
 p.beats[0].visualIntent='uncertainty';
 p.beats[1].visualIntent='study-measurement';
 p.beats[2].visualIntent='uncertainty';
 const r=compileReusableDirector(p);
 assert.equal(r.status,'REUSABLE_G1_G6_PROGRAM_PROPOSED');
 assert.equal(r.compositionRedirectionRequired,false);
 assert.equal(r.sequenceCraftReview.status,'SEQUENCE_REVIEW_REQUIRED');
 assert.equal(r.excellentCertified,false);
});
