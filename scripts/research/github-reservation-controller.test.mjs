import test from 'node:test';import assert from 'node:assert/strict';
import {validateManifest,reconcileBaseline,decodeRegistryBlob,readGithubContent} from './github-reservation-controller.mjs';

const record=(pmid,domain)=>({
 pmid:String(pmid),title:'Study '+pmid,source_title:'Study '+pmid,
 abstract:'Verified source abstract long enough to represent an exact PubMed research record for controller validation and testing.',
 source_url:'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/',
 category:'stress_anxiety',relevance_reason:'Directly relevant to the lane research question and semantic evidence map.',
 evidence_class:'human',study_design:'RCT',study_details:{n:60,duration:'6 weeks'},population:'Adults',
 intervention:'Compound X',comparator:'Placebo',outcomes:['validated outcome score'],conclusion_direction:'positive',
 interaction_evidence_level:'none',uncertainty:'moderate',adverse_effects:'reviewed',
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


test('oversized GitHub content encoding none resolves exact blob SHA',async()=>{
  const registry={schema_version:1,active_batch_counter:1,active_batch_id:'rolling-0001',reservations:[],batches:[],incidents:[]};
  const encoded=Buffer.from(JSON.stringify(registry)).toString('base64');
  const requests=[];
  const resolved=await decodeRegistryBlob({sha:'blob-sha',encoding:'none',content:'',size:2832050},async sha=>{
    requests.push(sha);
    return {encoding:'base64',content:encoded};
  });
  assert.deepEqual(resolved,registry);
  assert.deepEqual(requests,['blob-sha']);
  let called=false;
  const small=await decodeRegistryBlob({sha:'small-sha',encoding:'base64',content:encoded},async()=>{
    called=true;
    throw Error('small registry should not load a second blob');
  });
  assert.deepEqual(small,registry);
  assert.equal(called,false);
});
test('invalid, absent or empty registry blobs fail closed instead of becoming an empty ledger',async()=>{
  const base={sha:'known-sha',encoding:'none',content:''};
  await assert.rejects(decodeRegistryBlob(base,async()=>({encoding:'base64',content:''})),/missing base64/);
  await assert.rejects(decodeRegistryBlob(base,async()=>({encoding:'base64',content:Buffer.from('').toString('base64')})),/missing base64/);
  await assert.rejects(decodeRegistryBlob(base,async()=>({encoding:'base64',content:Buffer.from('{').toString('base64')})),/registry JSON invalid/);
  await assert.rejects(decodeRegistryBlob(base,async()=>({encoding:'base64',content:Buffer.from('{}').toString('base64')})),/registry structure invalid/);
  await assert.rejects(decodeRegistryBlob({encoding:'none'},async()=>({encoding:'base64',content:'e30='})),/metadata missing SHA/);
});

test('oversized evidence part reads from immutable GitHub blob without losing PMID identity',async()=>{
  const part={rows:[{pmid:'40698027',title:'Verified source identity',doi:'10.1234/example'}]};
  const data=JSON.stringify(part);
  const seen=[];
  const decoded=await readGithubContent({sha:'verified-head-blob',encoding:'none',content:'',size:1900000},async sha=>{
    seen.push(sha);
    return {encoding:'base64',content:Buffer.from(data).toString('base64')};
  });
  assert.deepEqual(JSON.parse(decoded),part);
  assert.deepEqual(seen,['verified-head-blob']);
  await assert.rejects(readGithubContent({sha:'bad',encoding:'none',content:''},async()=>({encoding:'none',content:''})),/missing base64 content/);
});
