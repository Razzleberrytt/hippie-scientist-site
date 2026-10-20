import {test} from 'node:test';
import assert from 'node:assert/strict';
import {proposeAudioLockedCuts as plan} from './audio-word-cuts.mjs';
const h='a'.repeat(64);
const sample=()=>({
 approvedWavSha256:h,actualWavSha256:h,scienceManifestSha256:h,
 alignmentOrigin:'independent-original-wav-mfa',durationMs:3600,
 wordAlignment:[
  {word:'What',startMs:20,endMs:200},
  {word:'is',startMs:240,endMs:360},
  {word:'7-OH?',startMs:390,endMs:650},
  {word:'This',startMs:880,endMs:1090},
  {word:'hydroxyl',startMs:1120,endMs:1490},
  {word:'group',startMs:1510,endMs:1720},
  {word:'Computed',startMs:1900,endMs:2260},
  {word:'structure',startMs:2290,endMs:2610},
  {word:'not',startMs:2800,endMs:3050},
  {word:'docking.',startMs:3080,endMs:3370}
 ],
 beats:[
  {id:'hook_1',role:'hook',grammar:'G1',startWordIndex:0,endWordIndex:2,scientificAssetIDs:['chem_7oh']},
  {id:'oh_site',role:'science_site_reveal',grammar:'G2',startWordIndex:3,endWordIndex:5,scientificAssetIDs:['rdkit_hydroxyl']},
  {id:'honesty',role:'honesty_disclosure',grammar:'G3',startWordIndex:6,endWordIndex:9,scientificAssetIDs:['reviewed_source']}
 ]});
test('cuts are derived from original aligned WAV not assigned render seconds',()=>{
 const r=plan(sample());assert.equal(r.status,'PREVIZ_EDL_READY_FOR_INDEPENDENT_MEDIA_QA');
 assert.deepEqual(r.shots.map(s=>[s.startMs,s.endMs]),[[0,880],[880,1900],[1900,3600]]);
 assert.equal(r.finalRenderEligible,false);assert.ok(r.shots.every(s=>s.voiceTimeStretch===false));
});
test('missing real voice and independent aligned audio cannot proceed',()=>{
 const x=sample();x.actualWavSha256='b'.repeat(64);x.alignmentOrigin='script-estimate';
 const r=plan(x);assert.equal(r.status,'HOLD');
 assert.ok(r.errors.includes('WRONG_OR_UNAPPROVED_ORIGINAL_WAV'));
 assert.ok(r.errors.includes('INDEPENDENT_REAL_WAV_ALIGNMENT_REQUIRED'));
});
test('wrong order and unassigned words fail closed',()=>{
 const x=sample();x.beats[1].role='honesty_disclosure';
 assert.ok(plan(x).errors.includes('SCIENTIFIC_NARRATIVE_ORDER_REQUIRED'));
 const y=sample();y.beats[1].startWordIndex=4;
 assert.ok(plan(y).errors.includes('NARRATION_WORDS_UNASSIGNED'));
});
test('fake early hook and overlong words fail closed',()=>{
 const x=sample();x.wordAlignment[0].startMs=2300;
 assert.equal(plan(x).status,'HOLD');
 const y=sample();y.wordAlignment[9].endMs=4000;
 assert.ok(plan(y).errors.includes('WORD_TIMING_INVALID'));
});

test('natural inter-word pauses are assigned to an adjacent visual; no black gaps',()=>{
 const result=plan(sample());
 for(let i=1;i<result.shots.length;i++) assert.equal(result.shots[i-1].endMs,result.shots[i].startMs);
 assert.equal(result.shots[0].startMs,0);
 assert.equal(result.shots.at(-1).endMs,3600);
});

test('reject absent and malformed scientific asset lineage on every shot',()=>{
 for(const scientificAssetIDs of [undefined,[],['BAD SPACE'],['chem_7oh','chem_7oh']]){
  const x=sample();x.beats[1].scientificAssetIDs=scientificAssetIDs;
  const r=plan(x);assert.equal(r.status,'HOLD');
  assert.ok(r.errors.includes('SHOT_ASSET_LINEAGE_MISSING'));
  assert.equal(r.shots.length,0);
 }
});

test('negative word index fails closed without indexing outside alignment',()=>{
 const x=sample();x.beats[0].startWordIndex=-1;
 assert.ok(plan(x).errors.includes('SHOT_WORD_ANCHORS_INVALID'));
});

test('non-text alignment token fails closed rather than throwing',()=>{
 const x=sample();x.wordAlignment[0].word=42;
 assert.ok(plan(x).errors.includes('WORD_TIMING_INVALID'));
});

test('sparse word-alignment entries fail closed instead of skipping validation',()=>{
 const x=sample();
 delete x.wordAlignment[4];
 const r=plan(x);
 assert.equal(r.status,'HOLD');
 assert.ok(r.errors.includes('WORD_TIMING_INVALID'));
 assert.deepEqual(r.shots,[]);
 assert.equal(r.finalRenderEligible,false);
});

test('sparse shot/beat entries fail closed instead of throwing during shot composition',()=>{
 const x=sample();
 delete x.beats[1];
 const r=plan(x);
 assert.equal(r.status,'HOLD');
 assert.ok(r.errors.includes('SHOT_ASSET_LINEAGE_MISSING'));
 assert.ok(r.errors.includes('SHOT_WORD_ANCHORS_INVALID'));
 assert.deepEqual(r.shots,[]);
 assert.equal(r.finalRenderEligible,false);
});

test('sparse scientific-asset lineage fails closed, not silently emitting an undefined asset',()=>{
 const x=sample();
 x.beats[1].scientificAssetIDs.length=2;
 const r=plan(x);
 assert.equal(r.status,'HOLD');
 assert.ok(r.errors.includes('SHOT_ASSET_LINEAGE_MISSING'));
 assert.deepEqual(r.shots,[]);
 assert.equal(r.finalRenderEligible,false);
});

test('duplicate shot identifiers are rejected before generating an edit decision list',()=>{
 const x=sample();
 x.beats[1].id=x.beats[0].id;
 const r=plan(x);
 assert.equal(r.status,'HOLD');
 assert.ok(r.errors.includes('SHOT_IDENTIFIERS_NOT_UNIQUE'));
 assert.deepEqual(r.shots,[]);
 assert.equal(r.finalRenderEligible,false);
});
