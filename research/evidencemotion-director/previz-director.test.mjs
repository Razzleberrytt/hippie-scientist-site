// Run manually: node --test research/evidencemotion-director/previz-director.test.mjs
// Research-only. No production workflow executes these tests automatically.
import test from 'node:test';
import assert from 'node:assert/strict';
import {proposeShots,evaluatePreviz,auditShotRepetition} from './previz-director.mjs';
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
 assert.equal(proposeShots({...beat,spokenAnchorTimes:[1.9,.4,3.5]}).code,'MISSING_AUDIO_ANCHORS');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:[.4,.4,3.5]}).code,'MISSING_AUDIO_ANCHORS');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:[.4,NaN,3.5]}).code,'MISSING_AUDIO_ANCHORS');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:new Array(1)}).code,'MISSING_AUDIO_ANCHORS');
 const sparseMiddle=new Array(3);
 sparseMiddle[0]=.4; sparseMiddle[2]=3.5;
 const sparseLeading=new Array(3);
 sparseLeading[1]=.4; sparseLeading[2]=3.5;
 assert.equal(proposeShots({...beat,spokenAnchorTimes:sparseMiddle}).code,'MISSING_AUDIO_ANCHORS');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:sparseLeading}).code,'MISSING_AUDIO_ANCHORS');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:[.4,1.9,]}).status,'PROPOSED');
 assert.equal(proposeShots({...beat,spokenAnchorTimes:[0,.4,3.5,4]}).status,'PROPOSED');
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
  const {candidateId: _candidateId,...unbound}=receipt;
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

const stagedShot=(i,override={})=>({
  beatId:'shot-'+i,grammarId:'G5',startSec:2*i,endSec:2*(i+1),
  scientificAssetIds:['molecule:verified'],sourceClaimIds:['claim:verified'],primaryCamera:i%2?'LOCKED_HOLD':'FOCUS_TRANSFER',
  transition:i%2?'HARD_CUT':'OCCLUSION_REVEAL',
  viewerLearns:'Distinct explanatory payoff for shot '+i,
  ...override
});

test('three identical-source grammar shots require creative redirection despite camera variation',()=>{
  const r=auditShotRepetition([stagedShot(0),stagedShot(1),stagedShot(2)]);
  assert.equal(r.status,'CRAFT_REDIRECTION_REQUIRED');
  assert.equal(r.craftRemediationRequired,true);
  assert.deepEqual(r.findings[0],{
    reason:'THREE_PLUS_REPEATED_GRAMMAR_AND_SOURCE_SHOTS',
    firstBeatId:'shot-0',lastBeatId:'shot-2',consecutiveCount:3,
    grammarId:'G5',scientificAssetIds:['molecule:verified']
  });
  assert.equal(r.excellentCertified,false);
  assert.equal(r.mayPublish,false);
});

test('extra caption, transition, palette and varying spoken text do not launder template repetition',()=>{
  const x=[stagedShot(0),stagedShot(1,{transition:'SPATIAL_CONTINUITY',palette:'blue'}),
    stagedShot(2,{viewerLearns:'Entirely different caption',palette:'red'})];
  assert.equal(auditShotRepetition(x).findings.length,1);
});

test('repetition counts are deduplicated by maximal adjacent run rather than overlapping windows',()=>{
  const r=auditShotRepetition(Array.from({length:5},(_,i)=>stagedShot(i)));
  assert.equal(r.findings.length,1);
  assert.equal(r.findings[0].consecutiveCount,5);
});

test('a semantically distinct grammar breaks a repetitive source window but never certifies artistry',()=>{
  const r=auditShotRepetition([stagedShot(0),stagedShot(1,{grammarId:'G3'}),stagedShot(2)]);
  assert.equal(r.status,'SEQUENCE_REVIEW_REQUIRED');
  assert.equal(r.craftRemediationRequired,false);
  assert.equal(r.excellentCertified,false);
});

test('an actual different asset breaks the repeated-source pattern; reordering does not',()=>{
  const r1=auditShotRepetition([stagedShot(0),stagedShot(1,{scientificAssetIds:['different:verified']}),stagedShot(2)]);
  assert.equal(r1.findings.length,0);
  const r2=auditShotRepetition([stagedShot(0,{scientificAssetIds:['a','b']}),
    stagedShot(1,{scientificAssetIds:['b','a']}),stagedShot(2,{scientificAssetIds:['a','b']})]);
  assert.equal(r2.findings.length,1);
});

test('missing, duplicated or malformed film-scene inputs fail closed',()=>{
  const cases=[
    [],[stagedShot(0)],
    [stagedShot(0),stagedShot(0)],
    [stagedShot(0),stagedShot(1,{scientificAssetIds:[]})],
    [stagedShot(0),stagedShot(1,{scientificAssetIds:['x','x']})],
    [stagedShot(0),stagedShot(1,{grammarId:'G999'})],
    [stagedShot(0),stagedShot(1,{endSec:1})]
  ];
  for(const sequence of cases){
    const r=auditShotRepetition(sequence);
    assert.equal(r.status,'HOLD');
    assert.equal(r.craftRemediationRequired,true);
    assert.equal(r.excellentCertified,false);
  }
});


test('whitespace aliases cannot hide repeated scientific assets',()=>{
  const r=auditShotRepetition([stagedShot(0,{scientificAssetIds:['asset']}),
    stagedShot(1,{scientificAssetIds:[' asset']}),stagedShot(2,{scientificAssetIds:['asset ']})]);
  assert.equal(r.status,'HOLD');
  assert.equal(r.craftRemediationRequired,true);
});


test('changing cameras and grammars does not mask three identical teaching payoffs',()=>{
  const promise='What the same source actually measures';
  const shots=[
    stagedShot(0,{grammarId:'G1',viewerLearns:promise}),
    stagedShot(1,{grammarId:'G3',viewerLearns:'what THE same source actually measures!'}),
    stagedShot(2,{grammarId:'G5',viewerLearns:promise})
  ];
  const r=auditShotRepetition(shots);
  assert.equal(r.status,'CRAFT_REDIRECTION_REQUIRED');
  assert.equal(r.findings.length,1);
  assert.equal(r.findings[0].reason,
    'THREE_PLUS_IDENTICAL_TEACHING_PAYOFFS_DESPITE_VISUAL_CHURN');
  assert.equal(r.findings[0].consecutiveCount,3);
  assert.equal(r.mayPublish,false);
  assert.equal(r.excellentCertified,false);
});

test('three full alternations of same two source-bound payoffs require review',()=>{
  const shots=Array.from({length:8},(_,i)=>stagedShot(i,{
    grammarId:i%2?'G4':'G2',
    scientificAssetIds:[i%2?'asset:b':'asset:a'],
    sourceClaimIds:[i%2?'claim:b':'claim:a'],
    viewerLearns:i%2?'How B differs':'How A works',
    transition:i%2?'SPATIAL_CONTINUITY':'MATCH_ON_ACTION',
  }));
  const r=auditShotRepetition(shots);
  const loops=r.findings.filter(f=>
    f.reason==='REPEATED_TWO_PAYOFF_TEACHING_CYCLE_REQUIRES_REVIEW');
  assert.equal(loops.length,1); // maximal window, no overlapping spam
  assert.equal(loops[0].consecutiveCount,8);
  assert.equal(loops[0].alternatingPayoffCount,2);
  assert.equal(r.mayPublish,false);
});

test('two A/B cycles and genuinely advancing source-linked lessons are not false blockers',()=>{
  const four=Array.from({length:4},(_,i)=>stagedShot(i,{
    grammarId:i%2?'G4':'G2',viewerLearns:i%2?'Compare B':'Compare A',
    scientificAssetIds:[i%2?'b':'a']
  }));
  assert.equal(auditShotRepetition(four).findings.length,0);
  const progressive=Array.from({length:6},(_,i)=>stagedShot(i,{
    grammarId:i%2?'G4':'G2',
    viewerLearns:'New measurable lesson '+i,
    scientificAssetIds:['same:pinned-source']
  }));
  const r=auditShotRepetition(progressive);
  assert.equal(r.findings.length,0);
  assert.equal(r.status,'SEQUENCE_REVIEW_REQUIRED');
  assert.equal(r.excellentCertified,false);
});

test('same wording with a genuinely different source does not imply identical evidence',()=>{
  const shots=Array.from({length:3},(_,i)=>stagedShot(i,{
    grammarId:['G1','G3','G5'][i],
    viewerLearns:'How this measurement is supported',
    scientificAssetIds:['asset:shared'],
    sourceClaimIds:['claim:independent-'+i]
  }));
  assert.equal(auditShotRepetition(shots).findings.length,0);
});

test('missing scientific claim identity cannot be mistaken for matching teaching evidence',()=>{
  const promise='An identical verbal promise';
  const shots=[0,1,2].map((i)=>stagedShot(i,{
    grammarId:['G1','G3','G5'][i],viewerLearns:promise,
    sourceClaimIds:i===1?undefined:[],
    scientificAssetIds:['asset:source']
  }));
  const r=auditShotRepetition(shots);
  assert.equal(r.status,'HOLD');
  assert.ok(r.errors.includes('UNBOUND_SHOT_LESSON_OR_CLAIM'));
  assert.equal(r.findings.length,0);
  assert.equal(r.excellentCertified,false);
});

test('scene missing a meaningful lesson or valid evidence identity fails closed',()=>{
  for(const change of [
    {viewerLearns:''},{viewerLearns:'   '},{viewerLearns:undefined},
    {viewerLearns:'!!!'},{viewerLearns:'\u200b'},
    {viewerLearns:'\u200d\u2060'},{viewerLearns:'\u0301'},
    {sourceClaimIds:[]},{sourceClaimIds:undefined},
    {sourceClaimIds:['claim:verified','claim:verified']},
    {sourceClaimIds:[' claim:verified']},{sourceClaimIds:['claim:verified ']}
  ]){
    const shots=[stagedShot(0),stagedShot(1,change),stagedShot(2)];
    const r=auditShotRepetition(shots);
    assert.equal(r.status,'HOLD',JSON.stringify(change));
    assert.ok(r.errors.includes('UNBOUND_SHOT_LESSON_OR_CLAIM'));
    assert.equal(r.excellentCertified,false);
    assert.equal(r.productionEligible,false);
    assert.equal(r.mayPublish,false);
  }
});

test('overlapping, shuffled or negative shot timeline cannot masquerade as adjacent visual progress',()=>{
  for(const shots of [
    [stagedShot(0),stagedShot(1,{startSec:1.99}),stagedShot(2)],
    [stagedShot(1),stagedShot(0),stagedShot(2)],
    [stagedShot(0,{startSec:-0.1}),stagedShot(1)],
    [stagedShot(0),stagedShot(1,{startSec:0.5,endSec:1.5})]
  ]){
    const r=auditShotRepetition(shots);
    assert.equal(r.status,'HOLD');
    assert.ok(r.errors.includes('OUT_OF_ORDER_OR_OVERLAPPING_SHOTS'));
    assert.equal(r.craftRemediationRequired,true);
    assert.equal(r.excellentCertified,false);
    assert.equal(r.productionEligible,false);
    assert.equal(r.mayPublish,false);
  }
  // An intentional silent interlude is not falsely categorized as overlap.
  const gap=auditShotRepetition([stagedShot(0),stagedShot(1,{startSec:2.5,endSec:4.5})]);
  assert.equal(gap.status,'SEQUENCE_REVIEW_REQUIRED');
  assert.equal(gap.excellentCertified,false);
});

test('real source-bound teaching survives punctuation and Unicode normalization',()=>{
  const shots=[stagedShot(0,{grammarId:'G1',viewerLearns:'What this study measures'}),
    stagedShot(1,{grammarId:'G3',viewerLearns:' WHAT this study measures! '}),
    stagedShot(2,{grammarId:'G5',viewerLearns:'What this study measures.'})];
  const r=auditShotRepetition(shots);
  assert.equal(r.status,'CRAFT_REDIRECTION_REQUIRED');
  assert.ok(r.findings.some(f=>f.reason==='THREE_PLUS_IDENTICAL_TEACHING_PAYOFFS_DESPITE_VISUAL_CHURN'));
  assert.equal(r.mayPublish,false);
});

// Guard the entire refusal contract independently of individual error reasons.
test('invalid and vacuous source-bound shots never receive render or release eligibility',()=>{
  const malformed=[
    [stagedShot(0),stagedShot(1,{viewerLearns:'\u200d\u2060'})],
    [stagedShot(0),stagedShot(1,{startSec:1.999})],
    [stagedShot(0),stagedShot(1,{sourceClaimIds:['claim:verified','claim:verified']})]
  ];
  for(const shots of malformed){
    const r=auditShotRepetition(shots);
    assert.equal(r.status,'HOLD');
    assert.equal(r.productionEligible,false);
    assert.equal(r.mayPublish,false);
    assert.equal(r.excellentCertified,false);
  }
});
