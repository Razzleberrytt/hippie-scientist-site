import test from 'node:test'
import assert from 'node:assert/strict'
import {
 createOpportunity, validateOpportunity, opportunityId, freezeProtocol, validateProtocol,
 digest, canonicalJson, evidenceFromSignedSource, createCaseFile, validateCaseFile, protocolIdentity,
} from '../src/contracts.mjs'
const copy=(value)=>JSON.parse(JSON.stringify(value))
const snapshot='a'.repeat(64)
const sign1='b7-11223344-90abcdef'
const sign2='c3-11224455-9900abcd'
const pico={population:'adults with sleep complaints', intervention:'magnesium glycinate', comparator:'magnesium citrate', outcomes:['validated sleep quality'],timeframe:'per included study'}
const opportunity=()=>createOpportunity({question:'Do magnesium glycinate and citrate compare for sleep outcomes?',pico:copy(pico),intakeSnapshotId:snapshot,originSignals:[{kind:'source-coverage-lead',referenceId:'synthetic-source-1',limitation:'mock bounded snapshot only'}]})
const makeProtocol=(o=opportunity())=>freezeProtocol(o,{
 frozenOn:'2026-10-13',databases:[{database:'pubmed',query:'("magnesium glycinate" OR "magnesium citrate") AND sleep',limits:'No language restriction, database date bounds to be recorded'}],
 eligibilityCriteria:{include:['Human study and measured sleep outcome'],exclude:['Animal or cell-only study']},
 extractionPlan:['study design','population','comparator','sleep outcome','null findings','limitations'],priorArtScope:'Not a global negative evidence conclusion',
})
const sourceAuthority={synthetic1:{pmid:'99999999',sourceSignature:sign1,snapshotId:snapshot,authority:'research-only'},synthetic2:{pmid:'99999998',sourceSignature:sign2,snapshotId:snapshot,authority:'reviewed'}}
const evidence1=()=>evidenceFromSignedSource({pmid:'99999999',sourceId:'synthetic1',sourceSignature:sign1,context:'synthetic source metadata, no empirical outcome extraction',limitations:'synthetic fixture only'})
const evidence2=()=>evidenceFromSignedSource({pmid:'99999998',sourceId:'synthetic2',sourceSignature:sign2,context:'synthetic reviewed source metadata, no empirical outcome extraction',limitations:'synthetic fixture only',sourceRole:'reviewed',reviewedClaimId:'review_fixture_1',direction:'null'})
const approved={review_fixture_1:{sourceId:'synthetic2',pmid:'99999998',sourceSignature:sign2,snapshotId:snapshot,direction:'null',approved:true,independentlyReviewed:true}}
function context(overrides={}){const o=opportunity(),p=makeProtocol(o);return {opportunity:o,protocol:p,sourceAuthority:copy(sourceAuthority),reviewedClaimAuthority:copy(approved),trialLineageAuthority:{},searchReceiptAuthority:{},...overrides}}
function sampleCase(ctx=context(),options={}){const c=createCaseFile(ctx.opportunity,ctx.protocol,options);return c}
function signCase(c){const {caseDigest:_,...rest}=c;c.caseDigest=digest(rest);return c}
const ensureBad=(name,mutation,contextChange)=>test(name,()=>{const ctx=context();const c=sampleCase(ctx,{evidence:[evidence1()],claims:[]});mutation(c,ctx);if(contextChange)contextChange(ctx);assert.throws(()=>validateCaseFile(c,ctx),/Insight Foundry contract/)})

test('canonical serialization is deterministic regardless of object key order',()=>assert.equal(digest({b:2,a:{z:1,y:0}}),digest({a:{y:0,z:1},b:2})))
test('canonical serialization rejects undefined, NaN and mutable class instances',()=>{assert.throws(()=>canonicalJson({a:undefined}));assert.throws(()=>canonicalJson(Number.NaN));assert.throws(()=>canonicalJson(new Date()))})
test('same normalized question and PICO have same opportunity id',()=>{
 const o=opportunity();const p=copy(o);p.question='  Do   magnesium glycinate and citrate compare for sleep outcomes?  ';assert.equal(opportunityId(o),opportunityId(p))
})
test('candidate forbids elevated review state and invented demand',()=>{const o=opportunity();assert.equal(validateOpportunity(o),o);o.scientificGate='approved';assert.throws(()=>validateOpportunity(o),/authority/)})
test('candidate rejects fabricated global prior-art claim',()=>{const o=opportunity();o.priorArtState='never-studied';assert.throws(()=>validateOpportunity(o),/prior-art/)})
test('candidate rejects incorrect source snapshot digest',()=>{const o=opportunity();o.intakeSnapshotId='x';assert.throws(()=>validateOpportunity(o),/sha256/)})
test('frozen protocol validates and is reproducible',()=>{const o=opportunity();const a=makeProtocol(o),b=makeProtocol(o);assert.equal(a.protocolDigest,b.protocolDigest);assert.equal(validateProtocol(a,o),a)})
test('different same-day protocol freezes receive distinct IDs and digests',()=>{
 const o=opportunity(),a=makeProtocol(o)
 const b=freezeProtocol(o,{frozenOn:'2026-10-13',databases:[{database:'pubmed',query:'different bounded search',limits:'same limits'}],eligibilityCriteria:{include:['Human trials'],exclude:['Animal only']},extractionPlan:['human outcomes'],priorArtScope:'bounded search only'})
 assert.notEqual(a.protocolId,b.protocolId);assert.notEqual(a.protocolDigest,b.protocolDigest)
 assert.equal(a.protocolId,protocolIdentity(a));assert.equal(b.protocolId,protocolIdentity(b))
})
test('re-signing altered search under an old same-day protocol ID fails',()=>{
 const o=opportunity(),p=makeProtocol(o);p.databases[0].query='altered query'
 const {protocolDigest:_,...body}=p;p.protocolDigest=digest(body)
 assert.throws(()=>validateProtocol(p,o),/invalid protocol id/)
})
test('frozen protocol cannot be edited after signing',()=>{const o=opportunity();const p=makeProtocol(o);p.databases[0].query='select all!';assert.throws(()=>validateProtocol(p,o),/mutated/)})
test('protocol cannot silently mutate PICO',()=>{const o=opportunity();const p=makeProtocol(o);p.pico.comparator='placebo';assert.throws(()=>validateProtocol(p,o),/diverged/)})
test('protocol refuses invalid calendar date',()=>{assert.throws(()=>makeProtocolWithBadDate(),/invalid date/);function makeProtocolWithBadDate(){const o=opportunity();return freezeProtocol(o,{frozenOn:'2026-02-30',databases:[{database:'pubmed',query:'test',limits:'no limits'}],eligibilityCriteria:{include:['yes'],exclude:['no']},extractionPlan:['x'],priorArtScope:'test'})}})
test('empty research case cannot be auto-published',()=>{const ctx=context();const c=sampleCase(ctx);assert.equal(validateCaseFile(c,ctx),c);assert.equal(c.independentTrialCount,0);assert.equal(c.publicationStatus,'not-authorized')})
test('signed synthetic source case passes while remaining research-only',()=>{const ctx=context();const c=sampleCase(ctx,{evidence:[evidence1()],claims:[{claimType:'evidence-map',sentence:'Synthetic record indexed, no outcome inference',evidenceIds:[evidence1().evidenceId],status:'unreviewed-proposal',limitations:'synthetic-only evidence'}]});assert.equal(validateCaseFile(c,ctx),c);assert.equal(c.independentTrialCount,null)})
ensureBad('rejects altered evidence record without integrity digest',c=>{c.evidence[0].direction='supporting'})
ensureBad('rejects forged/missing PMID through source authority', (c)=>{c.evidence[0].pmid='77777777';signCase(c)})
test('ungraded research-only source cannot assert a clinical effect direction even with a valid case digest',()=>{
 const ctx=context(), c=sampleCase(ctx,{evidence:[evidence1()]})
 c.evidence[0].direction='supporting'
 signCase(c)
 assert.throws(()=>validateCaseFile(c,ctx),/research-only source cannot assert an unreviewed effect direction/)
})
test('research-only source cannot claim a null result without independent review',()=>{
 const ctx=context(), c=sampleCase(ctx,{evidence:[evidence1()]})
 c.evidence[0].direction='null'
 signCase(c)
 assert.throws(()=>validateCaseFile(c,ctx),/research-only source cannot assert an unreviewed effect direction/)
})
ensureBad('rejects mismatched source signature',c=>{c.evidence[0].sourceSignature='e3-00000000-11111111';signCase(c)})
ensureBad('rejects cross-snapshot source authority substitution', (c,ctx)=>{ctx.sourceAuthority.synthetic1.snapshotId='f'.repeat(64)})
ensureBad('rejects source-only to reviewed laundering', c=>{c.evidence[0].sourceRole='reviewed';c.evidence[0].reviewedClaimId='review_fixture_1';signCase(c)})
ensureBad('rejects even a reviewed source without approved exact claim',c=>{c.evidence=[evidence2()];c.evidence[0].reviewedClaimId='fabricated';signCase(c)})
ensureBad('rejects reviewer spoofing (approved flag without independent marker)',(c,ctx)=>{c.evidence=[evidence2()];ctx.reviewedClaimAuthority.review_fixture_1.independentlyReviewed=false;signCase(c)})
test('approved reviewed receipt must exactly bind direction, source signature and snapshot',()=>{
 const ctx=context(),c=sampleCase(ctx,{evidence:[evidence2()]})
 assert.equal(validateCaseFile(c,ctx),c);assert.equal(c.publicationStatus,'not-authorized')
})
ensureBad('rejects laundering reviewed null result as supporting',c=>{c.evidence=[evidence2()];c.evidence[0].direction='supporting';signCase(c)})
ensureBad('rejects reviewed approval bound to another snapshot',(c,ctx)=>{c.evidence=[evidence2()];ctx.reviewedClaimAuthority.review_fixture_1.snapshotId='b'.repeat(64);signCase(c)})
ensureBad('rejects reviewed approval bound to another source fingerprint',(c,ctx)=>{c.evidence=[evidence2()];ctx.reviewedClaimAuthority.review_fixture_1.sourceSignature=sign1;signCase(c)})
ensureBad('rejects reviewed approval with no extracted direction',c=>{c.evidence=[evidence2()];c.evidence[0].direction='not-extracted';signCase(c)})
ensureBad('rejects duplicate publication counted as two evidence items',c=>{c.evidence.push(evidence1());signCase(c)})
ensureBad('rejects invented independent trial count',c=>{c.independentTrialCount=1;signCase(c)})
ensureBad('rejects asserted independent cohort without independent lineage receipt',c=>{c.evidence[0].studyIndependence='verified';c.evidence[0].underlyingStudyId='trial_fixture';c.independentTrialCount=1;signCase(c)})
test('verified independent trial lineage is counted as trial not PMID',()=>{
 const ctx=context();const a=evidence1(),b=evidence2();a.studyIndependence=b.studyIndependence='verified';a.underlyingStudyId=b.underlyingStudyId='same-trial';ctx.trialLineageAuthority={'99999999':{status:'verified',underlyingStudyId:'same-trial',sourceSignature:sign1},'99999998':{status:'verified',underlyingStudyId:'same-trial',sourceSignature:sign2}};
 const c=sampleCase(ctx,{evidence:[a,b]});assert.equal(c.independentTrialCount,1);assert.equal(validateCaseFile(c,ctx),c)
})
ensureBad('rejects fabricated source citation attached to a case claim',c=>{c.claims=[{claimType:'evidence-map',sentence:'Synthetic statement',evidenceIds:['ifev_fake'],status:'unreviewed-proposal',limitations:'synthetic'}];signCase(c)})
ensureBad('rejects clinical assertions presented as approved claim',c=>{c.claims=[{claimType:'evidence-map',sentence:'synthetic',evidenceIds:[c.evidence[0].evidenceId],status:'approved-efficacy',limitations:'synthetic'}];signCase(c)})
ensureBad('rejects global novelty assertion',c=>{c.novelty='never-studied';signCase(c)})
ensureBad('rejects underexplored finding before external prior art screening',c=>{c.novelty='underexplored-in-search-scope';signCase(c)})
function makeSearchLog(ctx,index=0,opts={}){
 const d=ctx.protocol.databases[index]
 const log={database:d.database,query:d.query,searchedOn:'2026-10-13',resultCount:0,scopeLimits:d.limits,...opts}
 if(!('receiptId' in opts)) log.receiptId=`verified-fixture-${index}`
 ctx.searchReceiptAuthority[log.receiptId]={status:'externally-verified-search-receipt',protocolDigest:ctx.protocol.protocolDigest,database:log.database,query:log.query,searchedOn:log.searchedOn,resultCount:log.resultCount,scopeLimits:log.scopeLimits}
 return log
}
test('bounded novelty requires a matching upstream search receipt for completed screening',()=>{
 const ctx=context(), log=makeSearchLog(ctx)
 const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[log]});assert.equal(validateCaseFile(c,ctx),c)
})
test('rejects claimed completed screening without separate upstream search receipt',()=>{
 const ctx=context(),log=makeSearchLog(ctx)
 delete ctx.searchReceiptAuthority[log.receiptId]
 const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[log]});assert.throws(()=>validateCaseFile(c,ctx),/exact externally verified search receipt/)
})
test('rejects changed result count when external verified receipt disagrees',()=>{
 const ctx=context(),log=makeSearchLog(ctx)
 log.resultCount=100
 const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[log]});assert.throws(()=>validateCaseFile(c,ctx),/exact externally verified search receipt/)
})
test('rejects search limits that differ from the frozen protocol',()=>{
 const ctx=context(),log=makeSearchLog(ctx)
 log.scopeLimits='changed eligibility scope'
 const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[log]});assert.throws(()=>validateCaseFile(c,ctx),/limits diverge/)
})
test('rejects search receipt signed against a different frozen protocol',()=>{
 const ctx=context(),log=makeSearchLog(ctx)
 ctx.searchReceiptAuthority[log.receiptId].protocolDigest='f'.repeat(64)
 const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[log]});assert.throws(()=>validateCaseFile(c,ctx),/exact externally verified search receipt/)
})
test('identical planned searches cannot inflate protocol screening coverage',()=>{
 const ctx=context();const p=ctx.protocol
 assert.throws(()=>freezeProtocol(ctx.opportunity,{frozenOn:p.frozenOn,databases:[...p.databases,copy(p.databases[0])],eligibilityCriteria:p.eligibilityCriteria,extractionPlan:p.extractionPlan,priorArtScope:p.priorArtScope}),/duplicate database queries/)
})
test('a second identical query with changed limits cannot create a new signed protocol',()=>{
 const ctx=context();const p=ctx.protocol
 const duplicate={...p.databases[0],limits:'new limit'}
 assert.throws(()=>freezeProtocol(ctx.opportunity,{frozenOn:p.frozenOn,databases:[...p.databases,duplicate],eligibilityCriteria:p.eligibilityCriteria,extractionPlan:p.extractionPlan,priorArtScope:p.priorArtScope}),/duplicate database queries/)
})
test('screening cannot cite an unplanned search as completed',()=>{
 const ctx=context();const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[{database:'pubmed',query:'unrelated sleep science',searchedOn:'2026-10-13',resultCount:0,scopeLimits:ctx.protocol.databases[0].limits}]})
 assert.throws(()=>validateCaseFile(c,ctx),/not in frozen protocol/)
})
test('completed screen must execute every frozen database query',()=>{
 const ctx=context();const p=ctx.protocol
 ctx.protocol=freezeProtocol(ctx.opportunity,{frozenOn:p.frozenOn,databases:[...p.databases,{database:'clinicaltrials',query:'magnesium sleep',limits:'synthetic'}],eligibilityCriteria:p.eligibilityCriteria,extractionPlan:p.extractionPlan,priorArtScope:p.priorArtScope})
 const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[makeSearchLog(ctx)]})
 assert.throws(()=>validateCaseFile(c,ctx),/cover all protocol searches/)
})
test('a pre-registration literature search cannot satisfy frozen protocol',()=>{
 const ctx=context();const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[{database:'pubmed',query:ctx.protocol.databases[0].query,searchedOn:'2026-10-12',resultCount:0,scopeLimits:ctx.protocol.databases[0].limits}]})
 assert.throws(()=>validateCaseFile(c,ctx),/predate frozen protocol/)
})
test('one search cannot be counted twice under a single frozen protocol',()=>{
 const ctx=context();const item=makeSearchLog(ctx)
 const c=sampleCase(ctx,{novelty:'underexplored-in-search-scope',screeningStatus:'completed',searchLog:[item,item]})
 assert.throws(()=>validateCaseFile(c,ctx),/duplicate searchLog/)
})
ensureBad('rejects case self-authorizing scientific conclusion',c=>{c.scientificGate='clinically-approved';signCase(c)})
ensureBad('rejects case self-authorizing publishing',c=>{c.publicationStatus='published';signCase(c)})
ensureBad('rejects altered protocol hash pinned to case',c=>{c.protocolDigest='f'.repeat(64);signCase(c)})
ensureBad('rejects unrecognized injected field',c=>{c.monetizationReady=true;signCase(c)})
test('all fixture ids are explicitly fake and never clinical observations',()=>{const e=evidence1();assert.equal(e.pmid,'99999999');assert.equal(e.direction,'not-extracted');assert.equal(e.sourceRole,'research-only')})
