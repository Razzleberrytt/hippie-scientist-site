import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareLaneIntake} from './prepare-lane-intake.mjs';

test('v1.01 rejects missing candidate arrays without writing reservations', () => {
  assert.throws(() => prepareLaneIntake({lane:3}), /records array/);
});

test('v1.01 quarantines invalid candidates independently', () => {
  const result = prepareLaneIntake({
    schema_version:1, lane:3, lane_focus:'botanical-pharmacology-safety',
    research_only:true,
    records:[null, {pmid:'bad',title:'Invalid record'}]
  });
  assert.equal(result.candidate_count,2);
  assert.equal(result.accepted_count,0);
  assert.equal(result.rejected.length,2);
  assert.equal(result.manifests.length,0);
});

test('v1.01 never exceeds 25 records in a manifest', () => {
  const result = prepareLaneIntake({
    schema_version:1,lane:3,lane_focus:'botanical-pharmacology-safety',
    research_only:true,records:Array.from({length:26},(_,i)=>({pmid:String(43000000+i),title:'Candidate '+i}))
  });
  assert.equal(result.accepted_count,0);
  assert.equal(result.manifests.length,0);
});

const validRecord=(pmid)=>({
 pmid:String(pmid),title:'Study '+pmid,source_title:'Study '+pmid,
 abstract:'Verified source abstract long enough to represent an exact PubMed research record for controller validation and testing.',
 source_url:'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/',
 category:'stress_anxiety',relevance_reason:'Directly relevant to the lane research question and semantic evidence map.',
 evidence_class:'human',study_design:'RCT',study_details:{n:60,duration:'6 weeks'},population:'Adults',
 intervention:'Compound X',comparator:'Placebo',outcomes:['validated outcome score'],conclusion_direction:'positive',
 interaction_evidence_level:'none',uncertainty:'moderate',adverse_effects:'reviewed',
 interactions:'reviewed',limitations:'small sample',provenance:'NCBI',
 research_domain:'botanical-pharmacology-safety',
 signals:{safety:.2,evidence_gap:.5,contradiction:.1,novelty:.4,graph_connectivity:.3}
});

test('v1.01 accepts valid source records in bounded manifests and independently rejects invalid ones',()=>{
 const rows=Array.from({length:26},(_,i)=>validRecord(43000000+i));
 const result=prepareLaneIntake({
  schema_version:1,lane:3,lane_focus:'botanical-pharmacology-safety',research_only:true,
  records:[null,...rows,{...rows[1]}, {...validRecord(43999999),doi:'10.1234/unique'}, {...validRecord(43999998),doi:'10.1234/unique'}],
 });
 assert.equal(result.candidate_count,30);
 assert.equal(result.accepted_count,27);
 assert.deepEqual(result.manifests.map(m=>m.records.length),[25,2]);
 assert.equal(result.rejected.length,3);
 assert(result.rejected.some(x=>x.index===0&&x.pmid===null));
 assert(result.rejected.some(x=>x.reason==='duplicate within candidate pool'));
 assert(result.manifests.every(x=>x.research_only===true&&x.records.length<=25));
 assert.equal(new Set(result.manifests.flatMap(m=>m.records.map(r=>r.pmid))).size,27);
});
