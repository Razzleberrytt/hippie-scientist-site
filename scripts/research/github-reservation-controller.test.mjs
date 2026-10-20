import test from 'node:test';import assert from 'node:assert/strict';
import {validateManifest,reconcileBaseline,decodeRegistryBlob,readGithubContent,resolveRegistryContents,reconcileTerminalReservations,reserveInto} from './github-reservation-controller.mjs';

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


test('exact registry blob 404 never recreates an empty research ledger',async()=>{
  const contents={sha:'existing-blob',encoding:'none',content:'',size:2800000};
  const blobError=Object.assign(Error('GitHub blob not found'),{status:404});
  await assert.rejects(
    resolveRegistryContents(async()=>contents,async()=>{throw blobError}),
    /GitHub blob not found/
  );
  const notFound=Object.assign(Error('GitHub registry contents missing'),{status:404});
  let fetchedBlob=false;
  const initial=await resolveRegistryContents(async()=>{throw notFound},async()=>{fetchedBlob=true});
  assert.equal(initial.sha,null);
  assert.deepEqual(initial.value.reservations,[]);
  assert.equal(fetchedBlob,false);
  const forbidden=Object.assign(Error('GitHub forbidden'),{status:403});
  await assert.rejects(resolveRegistryContents(async()=>{throw forbidden},async()=>{}),/GitHub forbidden/);
});


test('terminal reservation reconciliation releases abandoned and marks merged in one registry mutation',()=>{
 const registry={
  batches:[
   {id:'rolling-0001',state:'ABANDONED'},
   {id:'rolling-0002',state:'MERGED'},
   {id:'rolling-0003',state:'ACTIVE'},
   {id:'rolling-0004',state:'DRAFT_PR'},
  ],
  reservations:[
   {batch_id:'rolling-0001',state:'SOURCE_VERIFIED'},
   {batch_id:'rolling-0002',state:'SOURCE_VERIFIED'},
   {batch_id:'rolling-0003',state:'SOURCE_VERIFIED'},
   {batch_id:'rolling-0004',state:'SOURCE_VERIFIED'},
   {batch_id:'rolling-unknown',state:'SOURCE_VERIFIED'},
  ],
 };
 assert.equal(reconcileTerminalReservations(registry),registry);
 assert.deepEqual(registry.reservations.map(r=>r.state),[
  'RELEASED','MERGED','SOURCE_VERIFIED','SOURCE_VERIFIED','SOURCE_VERIFIED',
 ]);
 // Replaying the same serialized mutation never re-reserves terminal records.
 reconcileTerminalReservations(registry);
 assert.deepEqual(registry.reservations.map(r=>r.state),[
  'RELEASED','MERGED','SOURCE_VERIFIED','SOURCE_VERIFIED','SOURCE_VERIFIED',
 ]);
});

test('legacy terminal reservations repair without altering active batches',()=>{
 const registry={
  batches:[{id:'old-abandoned',state:'ABANDONED'},{id:'old-merged',state:'MERGED'},{id:'current',state:'FREEZE_PENDING'}],
  reservations:[
   {batch_id:'old-abandoned',state:'MERGED'},
   {batch_id:'old-merged',state:'RELEASED'},
   {batch_id:'current',state:'SOURCE_VERIFIED'},
  ],
 };
 reconcileTerminalReservations(registry);
 assert.deepEqual(registry.reservations.map(r=>r.state),['RELEASED','MERGED','SOURCE_VERIFIED']);
});

test('legacy abandoned PMID cannot block a fresh reservation after preflight reconciliation', () => {
 const original=record(902101,'sleep-stress-mood');
 const registry={
  active_batch_id:'rolling-live',batches:[{id:'rolling-old',state:'ABANDONED'},{id:'rolling-live',state:'ACTIVE'}],
  reservations:[{...original,batch_id:'rolling-old',state:'SOURCE_VERIFIED'}],
 };
 const manifest={lane:1,records:[original]};
 assert.throws(()=>reserveInto(registry,manifest,[]),/collision/);
 assert.equal(registry.reservations.length,1,'failed attempt must not reserve anything');
 reconcileTerminalReservations(registry); // commitRegistryMutation now performs this BEFORE the mutator.
 assert.equal(registry.reservations[0].state,'RELEASED');
 const newlyReserved=reserveInto(registry,manifest,[]);
 assert.equal(newlyReserved.length,1);
 assert.equal(registry.reservations[1].state,'SOURCE_VERIFIED');
 assert.equal(registry.reservations[1].batch_id,'rolling-live');
});
