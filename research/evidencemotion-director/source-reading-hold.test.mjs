import test from 'node:test';
import assert from 'node:assert/strict';
import { assessSourceReadingHold } from './source-reading-hold.mjs';

const good=()=>({
 beat:{id:'source_hold',role:'source',spoken:false,start:27.89,end:31.09},
 citation:{cid:44301524,url:'https://pubchem.ncbi.nlm.nih.gov/compound/44301524',visibleCidText:'44301524',visibleSourceHost:'pubchem.ncbi.nlm.nih.gov'},
 decodedSample:{origin:'independent-full-decode',sampleSecond:29.5,
  finalMasterSha256:'9259b639d607baf131c26cd8d0f09935e03cbd7c9107f8e6d8d4747565ad9c22',
  samplePngSha256:'2949511637f1296fbabd67002c75192e3e96bd6cc4ecce77c0b4b28f65ae3017',
  width:1080,height:1920}
});

test('actual full-HD sourced citation card receives only a narrow motion exemption',()=>{
 const r=assessSourceReadingHold(good());
 assert.equal(r.status,'SOURCE_READING_HOLD_EXEMPT_FROM_MOVING_POSTER_ONLY');
 assert.equal(r.excludeOnlySourceWindowFromMotionKill,true);
 assert.equal(r.separatePhoneReadabilityReviewRequired,true);
 assert.equal(r.citationLegibilityMachineCertified,false);
 assert.equal(r.releaseApproved,false);
});
test('static hero, unknown beat or narrated scene never receives citation privilege',()=>{
 for(const replacement of [{id:'hero'},{role:'hook'},{spoken:true}]) {
  const p=good();Object.assign(p.beat,replacement);
  assert.equal(assessSourceReadingHold(p).status,'HOLD');
 }
});
test('too-short or stretched source hold is rejected',()=>{
 for(const duration of [2.99,5.1]) {
  const p=good();p.beat.end=p.beat.start+duration;
  assert.equal(assessSourceReadingHold(p).status,'HOLD');
 }
});
test('unverified PubChem record, missing/altered decoded frame are rejected',()=>{
 const p=good();p.citation.cid=3034396;
 assert.ok(assessSourceReadingHold(p).errors.includes('UNVERIFIED_OR_UNREADABLE_SOURCE_IDENTITY'));
 for(const val of ['not-decoded',undefined]){
  const x=good();x.decodedSample.origin=val;
  assert.ok(assessSourceReadingHold(x).errors.includes('ACTUAL_FULL_HD_FRAME_SAMPLE_REQUIRED'));
 }
});
test('fake host and off-window sample cannot earn source-card exemption',()=>{
 const a=good();a.citation.visibleSourceHost='made-up.example';
 assert.equal(assessSourceReadingHold(a).status,'HOLD');
 const b=good();b.decodedSample.sampleSecond=25;
 assert.equal(assessSourceReadingHold(b).status,'HOLD');
});
