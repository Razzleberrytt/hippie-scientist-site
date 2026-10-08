import test from 'node:test';import assert from 'node:assert/strict';
import {validateManifest,reconcileBaseline} from './github-reservation-controller.mjs';

const record=(pmid,domain)=>({
 pmid:String(pmid),title:'Study '+pmid,source_title:'Study '+pmid,abstract:'A'.repeat(80),
 source_url:'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/',evidence_class:'human',study_design:'RCT',
 study_details:{population:'adults'},uncertainty:'moderate',adverse_effects:'reviewed',
 interactions:'reviewed',limitations:'small sample',provenance:'NCBI',research_domain:domain,
 signals:{safety:.2,evidence_gap:.5,contradiction:.1,novelty:.4,graph_connectivity:.3}
});
test('lane specialization is mandatory',()=>{
 const m={schema_version:1,lane:3,lane_focus:'botanical-pharmacology-safety',research_only:true,records:[record(12345,'botanical-pharmacology-safety')]};
 assert.equal(validateManifest(m),m);
 assert.throws(()=>validateManifest({...m,lane_focus:'sleep-stress-mood'}),/lane_focus/);
 assert.throws(()=>validateManifest({...m,records:[record(12346,'sleep-stress-mood')]}),/research_domain/);
});
test('1-25 records are valid but 26 fail',()=>{
 const base={schema_version:1,lane:1,lane_focus:'sleep-stress-mood',research_only:true};
 assert.doesNotThrow(()=>validateManifest({...base,records:[record(10001,'sleep-stress-mood')]}));
 assert.throws(()=>validateManifest({...base,records:Array.from({length:26},(_,i)=>record(20000+i,'sleep-stress-mood'))}),/1\.\.25/);
});
test('historical placeholder can be upgraded to exact identity',()=>{
 const x=reconcileBaseline([{pmid:'12345',title:'historical PMID 12345',doi:''},{pmid:'12345',title:'Actual study',doi:'10.1/x'}]);
 assert.equal(x.length,1);assert.equal(x[0].title,'Actual study');
});
test('divergent same PMID remains fail closed',()=>{
 assert.throws(()=>reconcileBaseline([{pmid:'12345',title:'Actual study',doi:'10.1/x'},{pmid:'12345',title:'Different study',doi:'10.1/y'}]),/conflicting existing PMID/);
});
