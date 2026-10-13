/**
 * IF-03 read-only adapter: the existing THS Research Intelligence Studio is
 * a bounded *source discovery* system, not a scientific findings authority.
 *
 * This module has no writes, network calls, graded efficacy claims, or release
 * permissions. The caller must supply the canonical getResearchSourceRegister()
 * result, which already verifies pinned Git blob receipts, and the existing
 * semanticSourceSignature() calculator. Raw objects supplied from elsewhere
 * are not authenticated merely by passing these shape checks.
 */
import {createOpportunity, digest} from './contracts.mjs'
const PMID=/^\d{5,10}$/
const SIGNATURE=/^[a-f0-9]+-[a-f0-9]{8}-[a-f0-9]{8}$/
const FRONTIER_BASIS='batch-title-cooccurrence'
const FRONTIER_STATUS='catalog-coverage-question-not-global-research-gap'
const fail=(message)=>{throw new Error(`Insight Foundry THS adapter: ${message}`)}
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)
const nonEmpty=x=>typeof x==='string'&&x.trim().length>0

/**
 * Construct an immutable manifest of exact research-only identities in an
 * already loaded THS 1.05 studio/semantic graph. The source register caller
 * must have enforced git-blob receipt verification first. Our SHA-256 snapshot
 * is a deterministic hash of registered metadata, not a new PubMed verification.
 */
export function inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature){
  if(!isObject(studio)||studio.systemVersion!=='1.05'||studio.researchOnly!==true||
    studio.metrics?.automaticallyPromotedClaims!==0)fail('requires strictly ungraded THS 1.05 research-only Studio')
  if(!isObject(network?.entries)||!Array.isArray(studio.dna))fail('missing Studio DNA or matching semantic network')
  if(typeof semanticSourceSignature!=='function')fail('requires existing THS source-signature calculator')
  if(!isObject(sourceRegister)||!Array.isArray(sourceRegister.records)||
    sourceRegister.latestSourceVerified!==studio.sourceCount||
    sourceRegister.records.length!==studio.sourceCount||
    !Number.isInteger(sourceRegister.throughWave)||sourceRegister.throughWave<studio.sourceWave)
    fail('requires matching governed source register')
  // The register itself must be returned by getResearchSourceRegister(), whose
  // gitBlobSha/manifest validation happens before this adapter executes. The
  // adapter cannot authenticate an arbitrary caller-supplied object.
  const registered=new Map()
  for(const record of sourceRegister.records){
    if(!PMID.test(record?.pmid||'')||registered.has(record.pmid)||
      !['title','abstract','category','pubType'].every(k=>typeof record[k]==='string'))
      fail('invalid or duplicate governed source register identity')
    registered.set(record.pmid,record)
  }
  const snapshotId=digest({version:1,wave:sourceRegister.throughWave,sources:[...registered.values()].
    map(r=>({pmid:r.pmid,title:r.title,abstract:r.abstract,category:r.category,pubType:r.pubType,doi:r.doi||'',year:r.year||'',journal:r.journal||''})).
    sort((a,b)=>a.pmid.localeCompare(b.pmid))})
  if(!Number.isInteger(studio.sourceWave)||studio.sourceWave<=0)fail('invalid source wave')
  if(!Number.isInteger(studio.sourceCount)||studio.sourceCount!==studio.dna.length)fail('source count mismatch')
  const seen=new Set(),sources=[]
  for(const record of studio.dna){
    if(!PMID.test(record?.pmid||'')||seen.has(record.pmid))fail('duplicate or invalid PMID')
    seen.add(record.pmid)
    if(record.grade!=='ungraded-research-intake')fail('cannot use clinical or reviewed grading from Studio intake')
    const registeredSource=registered.get(record.pmid)
    if(!registeredSource)fail(`missing governed source record for PMID ${record.pmid}`)
    if(record.title!==registeredSource.title || (record.doi||'')!==(registeredSource.doi||'') ||
      (record.year||'')!==(registeredSource.year||'') || record.category!==registeredSource.category)
      fail(`Studio fingerprint differs from governed source metadata for PMID ${record.pmid}`)
    const graphRecord=network.entries[record.pmid]
    if(!isObject(graphRecord)||graphRecord.pmid!==record.pmid||!SIGNATURE.test(graphRecord.sourceSignature||''))
      fail(`missing exact semantic graph identity for PMID ${record.pmid}`)
    if(semanticSourceSignature(registeredSource)!==graphRecord.sourceSignature)
      fail(`governed register does not reproduce source signature for PMID ${record.pmid}`)
    if(!Array.isArray(record.sourceWitnesses)||record.sourceWitnesses.some(w=>
        w.pmid!==record.pmid||w.sourceSignature!==graphRecord.sourceSignature||
        w.status!=='unreviewed-verbatim-source-text'))fail(`source witness mismatch for PMID ${record.pmid}`)
    // Require a source URL for inspection, but never assume the URL has been fetched.
    if(!nonEmpty(record.sourceUrl)||!record.sourceUrl.startsWith('https://pubmed.ncbi.nlm.nih.gov/'))
      fail(`missing inspectable PubMed destination for PMID ${record.pmid}`)
    sources.push(Object.freeze({sourceId:`studio-pmid:${record.pmid}`,pmid:record.pmid,
      sourceSignature:graphRecord.sourceSignature,snapshotId,
      authority:'research-only',sourceUrl:record.sourceUrl}))
  }
  for(const id of Object.keys(network.entries))if(!seen.has(id))fail(`graph includes unregistered PMID ${id}`)
  sources.sort((a,b)=>a.pmid.localeCompare(b.pmid))
  const sourceAuthority=Object.fromEntries(sources.map(x=>[x.sourceId,x]))
  const localGraphDigest=digest({version:1,wave:sourceRegister.throughWave,sources:sources.map(x=>[x.pmid,x.sourceSignature])})
  return {snapshotId,sourceWave:sourceRegister.throughWave,studioDeclaredWave:studio.sourceWave,
    studioWaveMayBeStale:sourceRegister.throughWave!==studio.sourceWave,localGraphDigest,
    sourceCount:sources.length,sourceAuthority,
    evidenceAuthority:'research-only',upstreamReceiptVerification:'performed-by-governed-register-caller-not-by-adapter',
    publicationAuthorized:false}
}

/**
 * Convert an EXISTING Knowledge Frontier question into an opportunity proposal,
 * never into a declared evidence gap. The PICO and question are supplied by the
 * investigator; a title co-mention cannot define the review's clinical scope.
 */
export function opportunityFromFrontier({studio,network,sourceRegister,semanticSourceSignature,frontierId,question,pico}){
  const inspection=inspectResearchStudio(studio,network,sourceRegister,semanticSourceSignature)
  const f=studio.frontiers?.find(x=>x.id===frontierId)
  if(!f||f.basis!==FRONTIER_BASIS||f.status!==FRONTIER_STATUS)fail('frontier must be existing batch title-only coverage question')
  if(!Array.isArray(f.samplePmids)||f.samplePmids.some(p=>!inspection.sourceAuthority[`studio-pmid:${p}`]))
    fail('frontier refers outside pinned source intake')
  if(!nonEmpty(f.substance)||!nonEmpty(f.outcome)||
    !Number.isInteger(f.togetherInBatch)||f.togetherInBatch<0||
    !Number.isInteger(f.subjectPapers)||f.subjectPapers<0||
    !Number.isInteger(f.outcomePapers)||f.outcomePapers<0)fail('invalid frontier coverage metadata')
  const originSignals=[{kind:'bounded-source-title-coverage',referenceId:`ths-frontier:${f.id}`,
    limitation:`Only co-mentions within a ${inspection.sourceCount}-publication THS intake snapshot (wave ${inspection.sourceWave}); counts do not establish clinical effects, global prior art, or an absence of published research.`}]
  return {opportunity:createOpportunity({question,pico,intakeSnapshotId:inspection.snapshotId,originSignals}),inspection,
    scopeReceipt:{frontierId:f.id,substance:f.substance,outcome:f.outcome,subjectPapers:f.subjectPapers,
      outcomePapers:f.outcomePapers,togetherInBatch:f.togetherInBatch,samplePmids:[...f.samplePmids],
      observedOnly:'batch-title-cooccurrence',localGraphDigest:inspection.localGraphDigest}}
}
