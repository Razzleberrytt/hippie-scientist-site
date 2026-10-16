/**
 * Insight Foundry IF-02: isolated research-only contract prototype.
 * Never imports or writes THS canonical data, changes evidence grades,
 * upgrades a title co-mention to a finding, or authorizes publication.
 *
 * Upstream source signatures MUST come from THS's existing signed Studio;
 * local hashes are document integrity receipts, not verification of science.
 */
import {createHash} from 'node:crypto'

const SHA256=/^[a-f0-9]{64}$/
// THS semanticSourceSignature(): length-8hex-FNV-8hex-DJB; *not* a crypto signature.
const THS_SOURCE_SIGNATURE=/^[a-f0-9]+-[a-f0-9]{8}-[a-f0-9]{8}$/
const PMID=/^[0-9]{5,10}$/
const SCHEMA_VERSION=1
const STATES=new Set(['candidate','protocol-frozen','evidence-screening','draft','review-requested','rejected','quarantined'])
const NOVELTY=new Set(['unchecked','new-to-ths','underexplored-in-search-scope','existing-review-needs-update','uncertain'])
const DIRECTIONS=new Set(['supporting','null','contradictory','unclear','not-extracted'])
const INDEPENDENCE=new Set(['verified','unknown','possible-duplicate'])
const SOURCE_ROLES=new Set(['research-only','reviewed'])
const CLAIM_TYPES=new Set(['research-question','source-coverage','evidence-map','hypothesis'])
const SEARCH_DATABASES=new Set(['pubmed','clinicaltrials','cochrane','europe-pmc','other'])
const DATES=/^\d{4}-\d{2}-\d{2}$/

function reject(message){throw new Error(`Insight Foundry contract: ${message}`)}
function obj(value,label){if(!value||typeof value!=='object'||Array.isArray(value))reject(`${label} must be an object`);return value}
function required(value,label){if(typeof value!=='string'||!value.trim())reject(`${label} is required`);return value.trim()}
function allowed(value,set,label){if(!set.has(value))reject(`${label} has invalid value`);return value}
function array(value,label){if(!Array.isArray(value))reject(`${label} must be an array`);return value}
function studioSignature(value,label){if(typeof value!=='string'||!THS_SOURCE_SIGNATURE.test(value))reject(`${label} must be an existing THS semanticSourceSignature fingerprint`);return value}
function hex(value,label){if(typeof value!=='string'||!SHA256.test(value))reject(`${label} must be an exact sha256 digest`);return value}
function knownFields(input, keys, label){for(const key of Object.keys(input))if(!keys.includes(key))reject(`${label}.${key} is not permitted`)}
function ensureVersion(v){if(v!==SCHEMA_VERSION)reject('schemaVersion must equal 1')}
function unique(values,label){if(new Set(values).size!==values.length)reject(`${label} contains duplicates`)}
function date(value,label){required(value,label);if(!DATES.test(value)||Number.isNaN(Date.parse(`${value}T00:00:00Z`))||new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)!==value)reject(`${label} invalid date`)}

export function canonicalJson(value){
  if(value===null||typeof value==='string'||typeof value==='boolean')return JSON.stringify(value)
  if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value)
  if(Array.isArray(value))return `[${value.map(v=>canonicalJson(v)).join(',')}]`
  if(value&&typeof value==='object'&&Object.getPrototypeOf(value)===Object.prototype){
    const keys=Object.keys(value).sort()
    return `{${keys.map(k=>`${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`
  }
  reject('non-JSON or nonfinite value')
}
export function digest(value){return createHash('sha256').update(canonicalJson(value)).digest('hex')}
const scopeNormalized=(value)=>required(value,'text').replace(/\s+/g,' ').toLowerCase()
function pico(value){
  obj(value,'pico')
  knownFields(value,['population','intervention','comparator','outcomes','timeframe'],'pico')
  for(const key of ['population','intervention','comparator','timeframe'])required(value[key],`pico.${key}`)
  const outcomes=array(value.outcomes,'pico.outcomes');if(!outcomes.length)reject('pico.outcomes empty')
  outcomes.forEach((x,i)=>required(x,`pico.outcomes[${i}]`));unique(outcomes.map(scopeNormalized),'pico.outcomes')
}
export function opportunityId({question,pico:scope}){
  required(question,'question');pico(scope)
  return 'ifopp_'+digest({v:SCHEMA_VERSION,question:scopeNormalized(question),pico:{
    population:scopeNormalized(scope.population),intervention:scopeNormalized(scope.intervention),
    comparator:scopeNormalized(scope.comparator),outcomes:scope.outcomes.map(scopeNormalized).sort(),
    timeframe:scopeNormalized(scope.timeframe),
  }}).slice(0,32)
}
export function validateOpportunity(input){
  obj(input,'opportunity');
  knownFields(input,['schemaVersion','opportunityId','question','pico','intakeSnapshotId','originSignals','researchState','priorArtState','scientificGate','commercialState'],'opportunity')
  ensureVersion(input.schemaVersion);required(input.question,'question');pico(input.pico)
  if(input.opportunityId!==opportunityId(input))reject('opportunityId does not match normalized question/PICO')
  hex(input.intakeSnapshotId,'intakeSnapshotId');
  const signals=array(input.originSignals,'originSignals');if(!signals.length)reject('originSignals empty')
  signals.forEach((s,i)=>{obj(s,`originSignals[${i}]`);knownFields(s,['kind','referenceId','limitation'],`originSignals[${i}]`);for(const k of ['kind','referenceId','limitation'])required(s[k],`originSignals[${i}].${k}`)})
  if(input.researchState!=='candidate')reject('opportunity must remain a candidate')
  if(input.priorArtState!=='unchecked')reject('no global prior-art claim at source intake')
  if(input.scientificGate!=='research-only')reject('cannot promote scientific authority')
  if(input.commercialState!=='demand-unknown')reject('commercial demand must remain unknown')
  return input
}
export function createOpportunity({question,pico:scope,intakeSnapshotId,originSignals}){
  const result={schemaVersion:SCHEMA_VERSION,opportunityId:opportunityId({question,pico:scope}),question,pico:scope,intakeSnapshotId,originSignals,researchState:'candidate',priorArtState:'unchecked',scientificGate:'research-only',commercialState:'demand-unknown'}
  return validateOpportunity(result)
}
export function protocolIdentity(input){
  // A protocol ID names the exact frozen method, not merely an opportunity/date.
  // A same-day change to queries, eligibility or extraction becomes a new identity.
  const body={...input};delete body.protocolId;delete body.protocolDigest
  return `ifproto_${input.opportunityId.slice(6,18)}_${input.frozenOn.replaceAll('-','')}_${digest(body).slice(0,16)}`
}
export function frozenProtocolDigest(input){const rest={...input};delete rest.protocolDigest;return digest(rest)}
export function validateProtocol(input, opportunity){
  obj(input,'protocol');validateOpportunity(opportunity)
  knownFields(input,['schemaVersion','protocolId','opportunityId','snapshotId','pico','reviewQuestion','frozenOn','databases','eligibilityCriteria','extractionPlan','priorArtScope','amendments','protocolDigest'],'protocol')
  ensureVersion(input.schemaVersion)
  if(input.opportunityId!==opportunity.opportunityId)reject('protocol opportunity mismatch')
  if(input.snapshotId!==opportunity.intakeSnapshotId)reject('protocol is not pinned to opportunity snapshot')
  pico(input.pico); if(canonicalJson(input.pico)!==canonicalJson(opportunity.pico))reject('protocol PICO has diverged')
  if(scopeNormalized(input.reviewQuestion)!==scopeNormalized(opportunity.question))reject('protocol question mismatch')
  date(input.frozenOn,'frozenOn')
  for(const name of ['include','exclude']){
    const xs=array(obj(input.eligibilityCriteria,'eligibilityCriteria')[name],`eligibilityCriteria.${name}`)
    if(!xs.length)reject(`eligibilityCriteria.${name} empty`)
    xs.forEach((v,i)=>required(v,`eligibilityCriteria.${name}[${i}]`))
  }
  const dbs=array(input.databases,'databases');if(!dbs.length)reject('at least one planned database required')
  dbs.forEach((d,i)=>{obj(d,`databases[${i}]`);knownFields(d,['database','query','limits'],`databases[${i}]`);allowed(d.database,SEARCH_DATABASES,'database');required(d.query,'database.query');required(d.limits,'database.limits')})
  const plannedSearches=new Set()
  for(const item of dbs){
    const key=JSON.stringify([item.database,item.query.trim()])
    if(plannedSearches.has(key))reject('frozen protocol contains duplicate database queries')
    plannedSearches.add(key)
  }
  const extraction=array(input.extractionPlan,'extractionPlan');if(!extraction.length)reject('extractionPlan missing');extraction.forEach(x=>required(x,'extraction field'))
  required(input.priorArtScope,'priorArtScope')
  if(array(input.amendments,'amendments').length)reject('freeze baseline must have zero amendments; amendments become a new protocol version')
  hex(input.protocolDigest,'protocolDigest');if(input.protocolDigest!==frozenProtocolDigest(input))reject('frozen protocol mutated or hash incorrect')
  if(input.protocolId!==protocolIdentity(input))reject('invalid protocol id')
  return input
}
const cloneJson=(value)=>JSON.parse(canonicalJson(value))
export function freezeProtocol(opportunity,{frozenOn,databases,eligibilityCriteria,extractionPlan,priorArtScope}){
  validateOpportunity(opportunity)
  const result={schemaVersion:1,opportunityId:opportunity.opportunityId,
    snapshotId:opportunity.intakeSnapshotId,pico:cloneJson(opportunity.pico),reviewQuestion:opportunity.question,frozenOn,databases:cloneJson(databases),eligibilityCriteria:cloneJson(eligibilityCriteria),extractionPlan:cloneJson(extractionPlan),priorArtScope,amendments:[]}
  result.protocolId=protocolIdentity(result)
  result.protocolDigest=frozenProtocolDigest(result)
  return validateProtocol(result,opportunity)
}
function validateSearchLog(caseFile,protocol,searchReceiptAuthority){
  obj(searchReceiptAuthority,'searchReceiptAuthority')
  const log=array(caseFile.searchLog,'searchLog')
  const planned=new Map(protocol.databases.map(d=>[`${d.database}\0${d.query.trim()}`,d]))
  if(planned.size!==protocol.databases.length)reject('frozen protocol contains duplicate database queries')
  const executed=new Set()
  log.forEach((l,i)=>{
    obj(l,`searchLog[${i}]`)
    knownFields(l,['database','query','searchedOn','resultCount','scopeLimits','receiptId'],`searchLog[${i}]`)
    allowed(l.database,SEARCH_DATABASES,'searchLog.database')
    required(l.query,'searchLog.query')
    date(l.searchedOn,'searchLog.searchedOn')
    if(l.searchedOn<protocol.frozenOn)reject('search execution cannot predate frozen protocol')
    if(!Number.isInteger(l.resultCount)||l.resultCount<0)reject('searchLog.resultCount invalid')
    required(l.scopeLimits,'searchLog.scopeLimits')
    const key=`${l.database}\0${l.query.trim()}`
    if(!planned.has(key))reject('searchLog query is not in frozen protocol')
    if(l.scopeLimits!==planned.get(key).limits)reject('searchLog limits diverge from frozen protocol')
    // A captured result count alone cannot attest that the database search ran.
    // Upstream search-receipt authority is separate and must be independently loaded.
    // The local contract only compares it; it does not authenticate that authority.
    if(caseFile.screeningStatus==='completed'){
      required(l.receiptId,'searchLog.receiptId')
      if(!/^[a-zA-Z0-9:_-]{6,128}$/.test(l.receiptId))reject('search receipt identity invalid')
      const receipt=Object.hasOwn(searchReceiptAuthority,l.receiptId)?searchReceiptAuthority[l.receiptId]:null
      if(!receipt||receipt.status!=='externally-verified-search-receipt'||
         receipt.protocolDigest!==protocol.protocolDigest||receipt.database!==l.database||
         receipt.query!==l.query||receipt.scopeLimits!==l.scopeLimits||
         receipt.searchedOn!==l.searchedOn||receipt.resultCount!==l.resultCount)
        reject('completed screening requires exact externally verified search receipt')
    } else if(l.receiptId!==undefined && l.receiptId!==null){
      reject('incomplete screening cannot assert verified receipt status')
    }
    if(executed.has(key))reject('duplicate searchLog execution requires protocol amendment')
    executed.add(key)
  })
  if(caseFile.novelty!=='unchecked'&&caseFile.novelty!=='new-to-ths'&&!log.length)
    reject('prior-art novelty requires an externally documented search')
  if(caseFile.screeningStatus==='completed'){
    if(!log.length)reject('completed screening requires a search log')
    if(executed.size!==planned.size)reject('completed screening must cover all protocol searches')
  }
  if(caseFile.novelty==='underexplored-in-search-scope'&&caseFile.screeningStatus!=='completed')
    reject('underexplored requires completed documented screening')
}
function verifySources(items,sourceAuthority,reviewedClaimAuthority,snapshotId,trialLineageAuthority){
  obj(sourceAuthority,'sourceAuthority');obj(reviewedClaimAuthority,'reviewedClaimAuthority');obj(trialLineageAuthority,'trialLineageAuthority')
  const sourceIds=[],identifiers=[]
  for(const [i,x] of items.entries()){
    obj(x,`evidence[${i}]`)
    knownFields(x,['evidenceId','pmid','sourceId','sourceSignature','sourceRole','reviewedClaimId','direction','underlyingStudyId','studyIndependence','context','limitations'],`evidence[${i}]`)
    if(!PMID.test(x.pmid))reject('evidence PMID invalid')
    required(x.sourceId,'evidence.sourceId'); studioSignature(x.sourceSignature,'evidence.sourceSignature')
    const receipt=sourceAuthority[x.sourceId]
    if(!receipt||receipt.pmid!==x.pmid||receipt.sourceSignature!==x.sourceSignature||receipt.snapshotId!==snapshotId)reject('source authority witness missing/mismatched or from another snapshot')
    if(receipt.authority!=='research-only'&&receipt.authority!=='reviewed')reject('invalid upstream authority')
    allowed(x.sourceRole,SOURCE_ROLES,'evidence.sourceRole')
    if(x.sourceRole==='reviewed'){
      if(receipt.authority!=='reviewed')reject('source-only paper cannot self-promote to reviewed')
      const approved=reviewedClaimAuthority[x.reviewedClaimId]
      if(!approved||approved.approved!==true||approved.independentlyReviewed!==true||
        approved.sourceId!==x.sourceId||approved.pmid!==x.pmid||
        approved.sourceSignature!==x.sourceSignature||approved.snapshotId!==snapshotId||
        approved.direction!==x.direction||x.direction==='not-extracted')
        reject('reviewed claim lacks exact independent source, snapshot and direction receipt')
    } else {
      if(x.reviewedClaimId!==null)reject('unreviewed evidence cannot carry reviewed claim id')
      if(x.direction!=='not-extracted')reject('research-only source cannot assert an unreviewed effect direction')
    }
    allowed(x.direction,DIRECTIONS,'evidence.direction')
    allowed(x.studyIndependence,INDEPENDENCE,'evidence.studyIndependence')
    if(x.studyIndependence==='verified'){
      required(x.underlyingStudyId,'underlyingStudyId')
      const lineage=trialLineageAuthority[x.pmid]
      if(!lineage||lineage.status!=='verified'||lineage.underlyingStudyId!==x.underlyingStudyId||lineage.sourceSignature!==x.sourceSignature)reject('verified trial independence needs separate upstream lineage authority')
    }
    else if(x.underlyingStudyId!==null)reject('unverified trial independence cannot provide a verified underlyingStudyId')
    required(x.context,'evidence.context');required(x.limitations,'evidence.limitations')
    if(x.evidenceId!==`ifev_${digest({pmid:x.pmid,sourceId:x.sourceId}).slice(0,20)}`)reject('evidenceId not source-bound')
    sourceIds.push(x.sourceId);identifiers.push(x.evidenceId)
  }
  unique(sourceIds,'source identities');unique(identifiers,'evidence ids')
}
export function independentTrialCount(evidence){
  const seen=new Set()
  for(const e of evidence){if(e.studyIndependence!=='verified'||!e.underlyingStudyId)return null;seen.add(e.underlyingStudyId)}
  return seen.size
}
export function validateCaseFile(caseFile,{opportunity,protocol,sourceAuthority,reviewedClaimAuthority={},trialLineageAuthority={},searchReceiptAuthority={}}){
  obj(caseFile,'caseFile');validateOpportunity(opportunity);validateProtocol(protocol,opportunity)
  knownFields(caseFile,['schemaVersion','caseId','opportunityId','protocolDigest','snapshotId','state','novelty','screeningStatus','searchLog','evidence','claims','scientificGate','publicationStatus','independentTrialCount','caseDigest'],'caseFile')
  ensureVersion(caseFile.schemaVersion)
  if(caseFile.opportunityId!==opportunity.opportunityId||caseFile.protocolDigest!==protocol.protocolDigest||caseFile.snapshotId!==opportunity.intakeSnapshotId)reject('case file source snapshot/protocol mismatch')
  if(caseFile.caseId!==`ifcase_${digest({opp:caseFile.opportunityId,protocol:caseFile.protocolDigest,snapshot:caseFile.snapshotId}).slice(0,32)}`)reject('caseId mismatch')
  allowed(caseFile.state,STATES,'case state');allowed(caseFile.novelty,NOVELTY,'case novelty')
  if(!['not-started','in-progress','completed'].includes(caseFile.screeningStatus))reject('invalid screeningStatus')
  if(caseFile.scientificGate!=='research-only'||caseFile.publicationStatus!=='not-authorized')reject('case cannot self-authorize scientific findings or publication')
  validateSearchLog(caseFile,protocol,searchReceiptAuthority)
  const evidence=array(caseFile.evidence,'evidence');verifySources(evidence,sourceAuthority,reviewedClaimAuthority,caseFile.snapshotId,trialLineageAuthority)
  const count=independentTrialCount(evidence)
  if(caseFile.independentTrialCount!==count)reject('independent trials unverified or miscounted')
  const ids=new Set(evidence.map(x=>x.evidenceId))
  for(const x of array(caseFile.claims,'claims')){
    obj(x,'claim');knownFields(x,['claimType','sentence','evidenceIds','status','limitations'],'claim')
    allowed(x.claimType,CLAIM_TYPES,'claimType')
    required(x.sentence,'claim.sentence');required(x.limitations,'claim.limitations')
    if(x.status!=='unreviewed-proposal')reject('case claims must remain unreviewed proposals')
    const refs=array(x.evidenceIds,'claim.evidenceIds')
    if(x.claimType!=='research-question'&&!refs.length)reject('non-question claim must cite evidence')
    refs.forEach(id=>{if(!ids.has(id))reject('claim references unknown evidence item')})
    unique(refs,'claim references')
  }
  hex(caseFile.caseDigest,'caseDigest');const body={...caseFile};delete body.caseDigest
  if(caseFile.caseDigest!==digest(body))reject('case content integrity mismatch')
  return caseFile
}
export function createCaseFile(opportunity,protocol,{novelty='unchecked',screeningStatus='not-started',searchLog=[],evidence=[],claims=[],state='candidate'}={}){
  const caseFile={schemaVersion:1,caseId:`ifcase_${digest({opp:opportunity.opportunityId,protocol:protocol.protocolDigest,snapshot:opportunity.intakeSnapshotId}).slice(0,32)}`,
    opportunityId:opportunity.opportunityId,protocolDigest:protocol.protocolDigest,snapshotId:opportunity.intakeSnapshotId,
    state,novelty,screeningStatus,searchLog,evidence,claims,scientificGate:'research-only',publicationStatus:'not-authorized',independentTrialCount:independentTrialCount(evidence)}
  caseFile.caseDigest=digest(caseFile);return caseFile
}
export function evidenceFromSignedSource({pmid,sourceId,sourceSignature,sourceRole='research-only',reviewedClaimId=null,direction='not-extracted',studyIndependence='unknown',underlyingStudyId=null,context,limitations}){
  if(!PMID.test(pmid))reject('PMID invalid');studioSignature(sourceSignature,'sourceSignature');return {evidenceId:`ifev_${digest({pmid,sourceId}).slice(0,20)}`,pmid,sourceId,sourceSignature,sourceRole,reviewedClaimId,direction,studyIndependence,underlyingStudyId,context,limitations}
}
