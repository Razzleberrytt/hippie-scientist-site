import test from 'node:test'
import assert from 'node:assert/strict'
import {inspectResearchStudio, opportunityFromFrontier} from '../src/ths-studio-adapter.mjs'
import {freezeProtocol,evidenceFromSignedSource,createCaseFile,validateCaseFile} from '../src/contracts.mjs'
const registeredRecord={pmid:'99999999',title:'Fixture title',abstract:'Fixture abstract about a made-up substance and outcome; not real data.',category:'fixture',pubType:'fixture-method',doi:'10.1234/synthetic',year:'2026',journal:'Fixture Journal'}
const semanticSourceSignature=()=> 'b7-11223344-90abcdef' // synthetic calculator, NOT THS live receipt
const front={id:'frontier-fixture',basis:'batch-title-cooccurrence',status:'catalog-coverage-question-not-global-research-gap',substance:'synthetic supplement',outcome:'synthetic sleep outcome',subjectPapers:1,outcomePapers:1,togetherInBatch:1,samplePmids:['99999999']}
const record={pmid:'99999999',title:'Fixture title',doi:'10.1234/synthetic',year:'2026',category:'fixture',grade:'ungraded-research-intake',sourceUrl:'https://pubmed.ncbi.nlm.nih.gov/99999999/',sourceWitnesses:[{pmid:'99999999',sourceSignature:'b7-11223344-90abcdef',status:'unreviewed-verbatim-source-text'}]}
const copy=(value)=>JSON.parse(JSON.stringify(value))
const make=()=>({studio:{systemVersion:'1.05',researchOnly:true,metrics:{automaticallyPromotedClaims:0},sourceWave:7500,sourceCount:1,dna:[copy(record)],frontiers:[copy(front)]},network:{entries:{99999999:{pmid:'99999999',sourceSignature:'b7-11223344-90abcdef'}}},sourceRegister:{throughWave:7500,latestSourceVerified:1,records:[copy(registeredRecord)]},semanticSourceSignature})
const pico={population:'synthetic adult sample',intervention:'synthetic supplement A',comparator:'synthetic supplement B',outcomes:['synthetic validated sleep quality'],timeframe:'per included study'}
const preview=(objects=make())=>opportunityFromFrontier({...objects,frontierId:'frontier-fixture',question:'Does synthetic supplement A compare with B for sleep quality?',pico})
test('THS signed-source identity is research only and never a scientific review receipt',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();const r=inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature);assert.equal(r.sourceAuthority['studio-pmid:99999999'].authority,'research-only');assert.equal(r.sourceCount,1);assert.equal(r.publicationAuthorized,false);assert.equal(r.upstreamReceiptVerification,'performed-by-governed-register-caller-not-by-adapter')})
test('frontier becomes an honest opportunity only, not a study finding',()=>{const {opportunity,scopeReceipt}=preview();assert.equal(opportunity.priorArtState,'unchecked');assert.equal(opportunity.scientificGate,'research-only');assert.equal(opportunity.commercialState,'demand-unknown');assert.equal(scopeReceipt.observedOnly,'batch-title-cooccurrence')})
test('real standalone contracts accept studio-source adapter without elevating source authority',()=>{
  const {opportunity,inspection}=preview();const p=freezeProtocol(opportunity,{frozenOn:'2026-10-13',databases:[{database:'pubmed',query:'synthetic query',limits:'not executed'}],eligibilityCriteria:{include:['human trials'],exclude:['animal only']},extractionPlan:['design','population','null findings'],priorArtScope:'bounded planning only'});
  const receipt=inspection.sourceAuthority['studio-pmid:99999999'];const evidence=evidenceFromSignedSource({pmid:receipt.pmid,sourceId:receipt.sourceId,sourceSignature:receipt.sourceSignature,context:'synthetic intake only',limitations:'not a scientific finding'});
  const c=createCaseFile(opportunity,p,{evidence:[evidence]});assert.equal(validateCaseFile(c,{opportunity,protocol:p,sourceAuthority:inspection.sourceAuthority}),c);assert.equal(c.independentTrialCount,null);
})
test('snapshot and result ordering create repeatable source graph digest',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();const a=inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature);const b=inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature);assert.equal(a.localGraphDigest,b.localGraphDigest)})
test('refuses source-grading escalation',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();studio.dna[0].grade='human-efficacy';assert.throws(()=>inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature),/cannot use clinical/)})
test('refuses missing governed register',()=>{const {studio,network,semanticSourceSignature}=make();assert.throws(()=>inspectResearchStudio(studio,network,null,semanticSourceSignature),/matching governed source register/)})
test('refuses graph signature mismatch',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();network.entries['99999999'].sourceSignature='b7-ffffffff-ffffffff';assert.throws(()=>inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature),/governed register does not reproduce source signature/)})
test('refuses missing source identity',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();delete network.entries['99999999'];assert.throws(()=>inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature),/missing exact/)})
test('refuses source-only graph overclaim',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();studio.metrics.automaticallyPromotedClaims=1;assert.throws(()=>inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature),/research-only Studio/)})
test('refuses extraneous ghost PMID',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();network.entries['99999998']={pmid:'99999998',sourceSignature:'a1-11223344-aabbccdd'};assert.throws(()=>inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature),/unregistered PMID/)})
test('refuses frontier outside current intake',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();studio.frontiers[0].samplePmids.push('99999997');assert.throws(()=>preview({studio,network,sourceRegister,semanticSourceSignature}),/outside pinned source intake/)})
test('refuses to repurpose an arbitrary frontier record as authoritative science',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();studio.frontiers[0].basis='reviewed-human-trial';assert.throws(()=>preview({studio,network,sourceRegister,semanticSourceSignature}),/title-only coverage question/)})
test('refuses fake sources even if PMIDs exist but inspectable PubMed URL missing',()=>{const {studio,network,sourceRegister,semanticSourceSignature}=make();studio.dna[0].sourceUrl='https://example.org/foo';assert.throws(()=>inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature),/PubMed destination/)})

test('refuses mismatched canonical register SHA identity even when graph witnesses agree',()=>{const objects=make();assert.throws(()=>inspectResearchStudio(objects.studio,objects.network,objects.sourceRegister,()=> 'b7-ffffffff-ffffffff'),/does not reproduce source signature/)})
test('refuses a forged register record missing a publication',()=>{const objects=make();objects.sourceRegister.records=[];assert.throws(()=>inspectResearchStudio(objects.studio,objects.network,objects.sourceRegister,objects.semanticSourceSignature),/matching governed source register/)})
test('source snapshot changes on governed-register text changes',()=>{const a=make(),b=make();b.sourceRegister.records[0].abstract+=' Changed.';const ra=inspectResearchStudio(a.studio,a.network,a.sourceRegister,a.semanticSourceSignature);const rb=inspectResearchStudio(b.studio,b.network,b.sourceRegister,b.semanticSourceSignature);assert.notEqual(ra.snapshotId,rb.snapshotId)})

test('adapts newer governed register waves even when Studio pins legacy display wave 7500',()=>{const x=make();x.sourceRegister.throughWave=8500;const r=inspectResearchStudio(x.studio,x.network,x.sourceRegister,x.semanticSourceSignature);assert.equal(r.sourceWave,8500);assert.equal(r.studioDeclaredWave,7500);assert.equal(r.studioWaveMayBeStale,true)})
test('refuses governed source register older than Studio declared source wave',()=>{const x=make();x.sourceRegister.throughWave=7000;assert.throws(()=>inspectResearchStudio(x.studio,x.network,x.sourceRegister,x.semanticSourceSignature),/matching governed source register/)})

test('source snapshot changes when DOI changes even with identical semantic text',()=>{
  const a=make(),b=make();b.sourceRegister.records[0].doi='10.5678/changed'
  b.studio.dna[0].doi='10.5678/changed'
  const ra=inspectResearchStudio(a.studio,a.network,a.sourceRegister,a.semanticSourceSignature)
  const rb=inspectResearchStudio(b.studio,b.network,b.sourceRegister,b.semanticSourceSignature)
  assert.notEqual(ra.snapshotId,rb.snapshotId)
})
test('rejects stale Studio citation metadata despite matching graph signature',()=>{
  const x=make();x.studio.dna[0].doi='10.5678/stale'
  assert.throws(()=>inspectResearchStudio(x.studio,x.network,x.sourceRegister,x.semanticSourceSignature),/governed source metadata/)
})
