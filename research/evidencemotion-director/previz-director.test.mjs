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
 origin:'independent-full-decode',schemaVersion:'ths-director-decoded-pixels-v1',previewSha256:hex,decodedFrameCount:120,
 candidateId:'b1:G1:1',beatId:'b1',grammarId:'G1',camera:'MACRO_PUSH',
 originalBeatDurationSec:4,sourceClaimIds:[...beat.claimIds],
 scientificAssetIds:[...beat.scientificAssetIds],anchorTimes:[...beat.spokenAnchorTimes],
 width:360,height:640,fps:12,roiPixels:[40,115,320,486],medianChangedFraction:0.18,medianBroadStructureChangedFraction:0.08,
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

test('moving-poster warning must hold even when no 6-second freeze exists',()=>{
 const candidate=proposeShots(beat).candidates[0];
 const result=evaluatePreviz(candidate,{...receipt,medianChangedFraction:0.0,maxCaptionExcludedStaticSec:0.33});
 assert.equal(result.status,'HOLD');
 assert.ok(result.reasons.includes('MOVING_POSTER_CONCEPT_REVIEW_HOLD'));
});

test('moving pixels do not establish hero motion',()=>{
 const candidate=proposeShots(beat).candidates[0];
 const result=evaluatePreviz(candidate,{...receipt,medianChangedFraction:0.2,medianBroadStructureChangedFraction:0});
 assert.equal(result.status,'HOLD');
 assert.ok(result.reasons.includes('HERO_STATIC_CONCEPT_REVIEW_HOLD'));
});

test('missing claim or asset lineage cannot produce a preview proposal',()=>{
  assert.equal(proposeShots({...beat,claimIds:[]}).status,'HOLD');
  assert.equal(proposeShots({...beat,scientificAssetIds:[]}).status,'HOLD');
  assert.equal(proposeShots({...beat,scientificAssetIds:['asset','asset']}).status,'HOLD');
});

test('receipt cannot be recycled for another independently authored treatment',()=>{
  const candidates=proposeShots(beat).candidates;
  const result=evaluatePreviz(candidates[1],receipt);
  assert.equal(result.status,'HOLD');
  assert.ok(result.reasons.includes('SHOT_REVIEW_SOURCE_OR_TIMING_IDENTITY_MISMATCH'));
  assert.equal(result.excellentCertified,false);
});

test('shot/source/camera/voice-anchor swaps hold despite otherwise plausible decoded motion',()=>{
  const candidate=proposeShots(beat).candidates[0];
  const faults=[
    {candidateId:'unrelated-shot'},
    {beatId:'unrelated-beat'},
    {grammarId:'G5'},
    {camera:'ORBIT_REVEAL'},
    {originalBeatDurationSec:4.1},
    {sourceClaimIds:['pmid:987654']},
    {sourceClaimIds:[]},
    {scientificAssetIds:['another-molecule']},
    {scientificAssetIds:[]},
    {anchorTimes:[.4,1.9,3.4]},
    {anchorTimes:[]}
  ];
  for(const fault of faults){
    const result=evaluatePreviz(candidate,{...receipt,...fault});
    assert.equal(result.status,'HOLD',JSON.stringify(fault));
    assert.ok(result.reasons.includes('SHOT_REVIEW_SOURCE_OR_TIMING_IDENTITY_MISMATCH'),
      JSON.stringify(fault));
    assert.equal(result.mayRenderFinal,false);
    assert.equal(result.excellentCertified,false);
  }
});

test('missing shot linkage is held even with green synthetic pixel measurements',()=>{
  const candidate=proposeShots(beat).candidates[0];
  const {candidateId,...unbound}=receipt;
  const result=evaluatePreviz(candidate,unbound);
  assert.equal(result.status,'HOLD');
  assert.ok(result.reasons.includes('SHOT_REVIEW_SOURCE_OR_TIMING_IDENTITY_MISMATCH'));
});

test('valid source-bound metadata still requires independent perceptual evaluation',()=>{
  const candidate=proposeShots(beat).candidates[0];
  const result=evaluatePreviz(candidate,receipt);
  assert.equal(result.status,'PERCEPTUAL_REVIEW_REQUIRED');
  assert.equal(result.mayRenderFinal,false);
  assert.equal(result.excellentCertified,false);
});
