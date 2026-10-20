/**
 * Isolated candidate-only compatibility harness.
 * Executes TypeScript adapter after transpilation with synthetic replacement
 * modules; it does NOT replace the real-repository Vitest source-register smoke.
 * Validates input limits, source discovery selection and read-only routing.
 */
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {runInNewContext} from 'node:vm'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {resolve,dirname} from 'node:path'
import {compileOpportunityReport,verifyOpportunityReport} from '../src/opportunity-compiler.mjs'
const require=createRequire(import.meta.url)
const ts=require('typescript')
const S='2-f00baaaa-1234abcd',H='a'.repeat(64),G='b'.repeat(64)
const instrumentNames=['dna','contradictions','frontier','time','voyages','safety','ask','reactor']
const pmids=['12345','23456']
const source=pmid=>({sourceId:`studio-pmid:${pmid}`,pmid,sourceSignature:S,snapshotId:H,sourceUrl:`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,authority:'research-only'})
const sources=Object.fromEntries(pmids.map(p=>[`studio-pmid:${p}`,source(p)]))
const pico={population:'adults',intervention:'synthetic magnesium',comparator:'synthetic comparator',outcomes:['sleep quality'],timeframe:'as described by the paper'}
const args=()=>({question:'What magnesium publications mention sleep?',pico:JSON.parse(JSON.stringify(pico)),originSignals:[{kind:'user-question',referenceId:'synthetic-local-test',limitation:'Only a research question, no finding'}],discoveryQuery:'magnesium'})
const scene=pmid=>({sourceSignature:S,status:'source-bound-human-review-only',clinicalPromotions:0,publicationAllowed:false,mutationAllowed:false,
  caseFile:{pmid,sourceSignature:S,status:'source-discovery-only-no-clinical-adjudication',reviewedCitationIds:[],relatedPapers:[],instruments:instrumentNames.map(instrument=>({instrument,linkedItems:0}))},
  scientific:{capabilities:Array.from({length:12},(_,n)=>({id:String(n)})),calibrationPassed:true,clinicalPromotions:0,autopublished:0},
  fabric:{sourceSignature:S,sourcePmid:pmid,sourceDoi:null,status:'exact-publication-trace-review-only',evidenceAuthority:'research-intake-not-clinical-evidence',publicationAllowed:false,mutationAllowed:false,distributionReviewTargets:[]}})
const compiledFile=resolve(dirname(fileURLToPath(import.meta.url)),'../../../lib/research-semantic-opportunity-compiler.ts')
const compiled=ts.transpileModule(readFileSync(compiledFile,'utf8'),{fileName:compiledFile,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}})
assert.equal(compiled.diagnostics.length,0,'Candidate adapter has TS syntax transpilation diagnostics')
const stamp=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
function harness(){
  const called={registered:0,discovery:0,selected:[],query:null}
  const modules={
    'server-only':{},
    './research-source-register':{getResearchSourceRegister:()=>{called.registered++;return {throughWave:7500,records:pmids.map(p=>({pmid:p,title:'synthetic magnesium study'}))}}},
    './research-semantic-network':{buildResearchSemanticNetwork:()=>({entries:Object.fromEntries(pmids.map(p=>[p,{pmid:p,sourceSignature:S}]))}),semanticSourceSignature:()=>S},
    './research-intelligence-studio':{buildResearchIntelligenceStudio:()=>({dna:pmids.map(p=>({pmid:p})),sourceCount:2})},
    './research-intelligence-discovery':{discoverResearchIntake:(dna,graph,query,maxResults)=>{called.discovery++;called.query=query;assert.equal(maxResults,6);return {matches:query==='magnesium'?[dna[1],dna[0]]:[],sourceCount:2}}},
    './research-intelligence-integration':{buildIntegratedResearchCase:(studio,graph,pmid,objects,studies)=>{called.selected.push(pmid);assert.equal(studies.length,0);return pmids.includes(pmid)?scene(pmid):null}},
    '../data/distribution/research-objects.json':{default:[]},
    '../research/insight-foundry/src/contracts.mjs':{
      createOpportunity:({question,pico,originSignals,intakeSnapshotId})=>JSON.parse(JSON.stringify({opportunityId:`ifopp_${stamp({question,pico}).slice(0,32)}`,question,pico,originSignals,intakeSnapshotId,scientificGate:'research-only',researchState:'candidate',priorArtState:'unchecked',commercialState:'demand-unknown'})),
      validateOpportunity:x=>x,digest:stamp},
    '../research/insight-foundry/src/ths-studio-adapter.mjs':{inspectResearchStudio:()=>({evidenceAuthority:'research-only',publicationAuthorized:false,studioWaveMayBeStale:false,snapshotId:H,localGraphDigest:G,sourceAuthority:sources,sourceCount:2,sourceWave:7500})},
    '../research/insight-foundry/src/opportunity-compiler.mjs':{compileOpportunityReport,verifyOpportunityReport},
  }
  const context={exports:{},module:{exports:{}},require:(id)=>{if(!(id in modules))throw Error('Unmocked dependency '+id);return modules[id]}}
  context.exports=context.module.exports
  runInNewContext(compiled.outputText,context,{filename:compiledFile})
  return {adapter:context.module.exports,called}
}

test('source-index discovery routes signed exact PMIDs to all three review-only queues',()=>{
 const {adapter,called}=harness(),r=adapter.compileCurrentResearchOpportunity(args())
 assert.deepEqual(called.selected,['12345','23456'])
 assert.equal(called.discovery,1);assert.equal(called.query,'magnesium')
 assert.equal(r.publicationCount,2)
 assert.equal(r.independentTrialCount,null)
 assert.deepEqual([...new Set(r.reviewRequests.map(x=>x.channel))],['editorial','safety','media'])
 assert.ok(r.originSignals.some(x=>x.kind==='bounded-current-studio-index-match'&&/NOT been established/.test(x.limitation)))
 assert.equal(r.publicationAllowed,false);assert.equal(r.mutationAllowed,false)
})
test('no source-index matches fail closed rather than fabricating a PubMed study',()=>{
 const {adapter}=harness();assert.throws(()=>adapter.compileCurrentResearchOpportunity({...args(),discoveryQuery:'fictional-absent-topic'}),/no exact source matches/)
})
test('manual PMID selection stays separate and reveals unverified topic relevance',()=>{
 const {adapter,called}=harness(),inp=args();delete inp.discoveryQuery;inp.selectedPmids=['23456','12345','23456']
 const r=adapter.compileCurrentResearchOpportunity(inp)
 assert.equal(called.discovery,0);assert.deepEqual(called.selected,['12345','23456'])
 assert.ok(r.originSignals.some(x=>x.kind==='investigator-selected-source-identities'&&/NOT been verified/.test(x.limitation)))
})
test('invalid authority keys fail before expensive register acquisition',()=>{
 const {adapter,called}=harness();assert.throws(()=>adapter.compileCurrentResearchOpportunity({...args(),sections:[{verified:true}]}),/untrusted external authority/)
 assert.equal(called.registered,0)
})
test('user cannot supply local discovery and manual PMIDs in same request',()=>{
 const {adapter,called}=harness();assert.throws(()=>adapter.compileCurrentResearchOpportunity({...args(),selectedPmids:['12345']}),/exactly one source selection mode/)
 assert.equal(called.registered,0)
})
test('manual request with 17 source records, even duplicates, fails before loader',()=>{
 const {adapter,called}=harness(),x=args();delete x.discoveryQuery;x.selectedPmids=Array(17).fill('12345')
 assert.throws(()=>adapter.compileCurrentResearchOpportunity(x),/unbounded exact PMID/)
 assert.equal(called.registered,0)
})
test('unbounded query and questions fail without loading source register',()=>{
 const {adapter,called}=harness()
 assert.throws(()=>adapter.compileCurrentResearchOpportunity({...args(),discoveryQuery:'m'.repeat(241)}),/unbounded local research discovery query/)
 assert.throws(()=>adapter.compileCurrentResearchOpportunity({...args(),question:'a'.repeat(501)}),/unbounded research question/)
 assert.equal(called.registered,0)
})
test('unbounded origin signals and PICO are rejected before loading source register',()=>{
 const {adapter,called}=harness()
 assert.throws(()=>adapter.compileCurrentResearchOpportunity({...args(),originSignals:Array(13).fill(args().originSignals[0])}),/unbounded investigator rationale/)
 assert.throws(()=>adapter.compileCurrentResearchOpportunity({...args(),pico:{...pico,population:'X'.repeat(251)}}),/unbounded PICO/)
 assert.equal(called.registered,0)
})
test('current-source adapter verification rejects forged/stale report and keeps publishing blocked',()=>{
 const {adapter}=harness(),inp=args(),r=adapter.compileCurrentResearchOpportunity(inp)
 assert.equal(adapter.verifyCurrentResearchOpportunityReport(r,inp).reportDigest,r.reportDigest)
 assert.throws(()=>adapter.verifyCurrentResearchOpportunityReport({...r,publicationAllowed:true},inp),/stale, modified/)
})
test('selecting nonexistent PMID cannot be silently mapped to another paper',()=>{
 const {adapter}=harness(),x=args();delete x.discoveryQuery;x.selectedPmids=['99999']
 assert.throws(()=>adapter.compileCurrentResearchOpportunity(x),/selected PMID missing/)
})

test('source-selection receipt changes report digest even when exact PMID and review queues are identical',()=>{
 const {adapter}=harness(),inp=args();delete inp.discoveryQuery;inp.selectedPmids=['12345']
 const canonical=adapter.compileCurrentResearchOpportunity(inp)
 const withoutSelectionReceipt=compileOpportunityReport({
   opportunity:{opportunityId:canonical.opportunityId,question:inp.question,pico:inp.pico,
     originSignals:inp.originSignals,intakeSnapshotId:H,scientificGate:'research-only',
     researchState:'candidate',priorArtState:'unchecked',commercialState:'demand-unknown'},
   inspection:{evidenceAuthority:'research-only',publicationAuthorized:false,studioWaveMayBeStale:false,
     snapshotId:H,localGraphDigest:G,sourceAuthority:sources},
   cases:[scene('12345')],sections:[],comparisons:[],trialLineage:{},
 })
 assert.notEqual(canonical.reportDigest,withoutSelectionReceipt.reportDigest)
 assert.deepEqual(canonical.sources,withoutSelectionReceipt.sources)
 assert.deepEqual(canonical.reviewRequests,withoutSelectionReceipt.reviewRequests)
 assert.ok(canonical.originSignals.some(x=>x.kind==='investigator-selected-source-identities'))
 assert.throws(()=>adapter.verifyCurrentResearchOpportunityReport(withoutSelectionReceipt,inp),/stale, modified/)
 assert.equal(adapter.verifyCurrentResearchOpportunityReport(canonical,inp).reportDigest,canonical.reportDigest)
})
