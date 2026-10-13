// Run manually: node --test research/evidencemotion-director/previz-director.test.mjs
// Research-only. No production workflow executes these tests automatically.
import test from 'node:test';
import assert from 'node:assert/strict';
import {proposeShots,evaluatePreviz} from './previz-director.mjs';
const hex='a'.repeat(64);
const beat={
 id:'b1',durationSec:4,spokenAnchorTimes:[0.4,1.9,3.5],
 visualIntent:'everyday-to-mechanism',claimIds:['pmid:25026323'],
 scientificAssetIds:['approved-illustrative-receptor-v1']
};
const receipt={
 origin:'decoded-preview',previewSha256:hex,decodedFrameCount:120,
 voiceTimeStretched:false,factualGeometryGenerated:false,heroAbsent:false,
 stockClipArtDetected:false,maxCaptionExcludedStaticSec:1.5,sourceLocked:true,
 narrationSha256:hex,approvedNarrationSha256:hex
};
test('purposeful candidate selection produces two phone-first research proposals',()=>{
 const result=proposeShots(beat);
 assert.equal(result.status,'PROPOSED');
 assert.equal(result.productionEligible,false);
 assert.equal(result.candidates.length,2);
 assert.deepEqual(result.candidates.map(x=>x.grammarId),['G1','G1']);
 assert.notEqual(result.candidates[0].camera,result.candidates[1].camera);
 assert.equal(result.candidates[0].budgetClass,'REMOTE_CPU_PREVIZ_ONLY');
 assert.deepEqual(result.candidates[0].sourceClaimIds,beat.claimIds);
});
test('scientific ID and locked audio timing requirements fail closed',()=>{
 assert.equal(proposeShots({...beat,claimIds:['one','one']}).code,'SOURCE_BOUND_IDS_REQUIRED');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:[]}).code,'MISSING_AUDIO_ANCHORS');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:[8]}).code,'MISSING_AUDIO_ANCHORS');
});
test('source-bound comparison and process constraints prevent arbitrary animations',()=>{
 assert.equal(proposeShots({...beat,visualIntent:'fair-comparison'}).code,'COMPARISON_OR_SCALE_REVIEW_REQUIRED');
 assert.equal(proposeShots({...beat,visualIntent:'process-sequence'}).code,'PROCESS_REVIEW_REQUIRED');
 assert.equal(proposeShots({...beat,visualIntent:'fair-comparison',comparisonOrScaleReviewed:true}).candidates[0].grammarId,'G4');
});
test('preview cannot self-approve visual excellence',()=>{
 const candidate=proposeShots(beat).candidates[0];
 const evaluation=evaluatePreviz(candidate,receipt);
 assert.equal(evaluation.status,'PERCEPTUAL_REVIEW_REQUIRED');
 assert.equal(evaluation.mayRenderFinal,false);
 assert.equal(evaluation.excellentCertified,false);
});
test('caption-excluded static streak and undeclared documentary B-roll are killed',()=>{
 const candidate=proposeShots(beat).candidates[0];
 for(const violation of [
  {maxCaptionExcludedStaticSec:6.01},
  {photorealSyntheticBroll:true,prominentSyntheticDisclosure:false},
  {voiceTimeStretched:true},
  {factualGeometryGenerated:true},
  {heroAbsent:true},
  {stockClipArtDetected:true}
 ]){
   const result=evaluatePreviz(candidate,{...receipt,...violation});
   assert.equal(result.status,'KILL');
   assert.equal(result.mayRenderFinal,false);
 }
});
test('missing decoded footage or metrics holds without claiming quality',()=>{
 const candidate=proposeShots(beat).candidates[0];
 assert.equal(evaluatePreviz(candidate,{...receipt,origin:'storyboard'}).status,'HOLD');
 assert.equal(evaluatePreviz(candidate,{...receipt,maxCaptionExcludedStaticSec:null}).status,'HOLD');
 assert.equal(evaluatePreviz(candidate,{...receipt,approvedNarrationSha256:'b'.repeat(64)}).status,'HOLD');
});
