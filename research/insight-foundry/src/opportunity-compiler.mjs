/**
 * Semantic Opportunity Compiler — proposal for #6769.
 * Pure read-only projection over Insight Foundry's source-bound opportunity and
 * the *existing* THS integrated case. Never authorizes a scientific finding,
 * claim, article update, recommendation, video, or publication.
 *
 * A trusted application adapter must invoke validateOpportunity(opportunity),
 * inspectResearchStudio(...) from the existing Insight Foundry module, and
 * buildIntegratedResearchCase(...) against the CURRENT canonical authorities.
 * This function rechecks identifying invariants, but cannot authenticate its caller.
 */
import { createHash } from 'node:crypto'

const PMID=/^\d{5,10}$/
const SHA=/^[a-f0-9]{64}$/
const SIG=/^[a-f0-9]+-[a-f0-9]{8}-[a-f0-9]{8}$/
const SOURCE_REFERENCE_ID=/^[a-z][a-z0-9_-]*$/i
const fail=(s)=>{throw Error('Semantic Opportunity Compiler: '+s)}
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)
const jsonObject=x=>object(x)&&Object.getPrototypeOf(x)===Object.prototype
const text=x=>typeof x==='string'&&x.trim()!==''
function stable(x){
  if(x===null||typeof x==='string'||typeof x==='boolean'||typeof x==='number'&&Number.isFinite(x))return JSON.stringify(x)
  if(Array.isArray(x))return `[${x.map(stable).join(',')}]`
  if(jsonObject(x))return `{${Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')}}`
  fail('non-JSON value in identity')
}
const hash=x=>createHash('sha256').update(stable(x)).digest('hex')
function doi(x){
  if(!text(x))return null
  const t=x.trim().toLowerCase().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/,'').replace(/[.\s]+$/,'')
  return /^10\.\d{4,9}\/[^\s?#]+$/.test(t)?t:null
}
function canonicalPath(path){
  if(typeof path!=='string'||!/^\/[a-z0-9][a-z0-9/_-]*\/$/i.test(path)||path.includes('//')||path.includes('/../'))return false
  return true
}
const uniqueSorted=xs=>[...new Set(xs)].sort()
// Text supplied by investigators is always rendered as plain text, never as Markdown instructions.
const markdownText=x=>String(x).replace(/[\\`*_{}[\]()#+.!|><&~-]/g,'\\$&').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/\t/g,'\\t')

/**
 * Inputs:
 * opportunity: returned and validated by Insight Foundry contracts.
 * inspection: returned by inspectResearchStudio() using governed register.
 * cases: array of buildIntegratedResearchCase() results for selected PMIDs.
 * sections: *authoritatively resolved* section registry records (not guessed).
 * comparisons: *authoritatively resolved* exact citation-linked comparison records.
 * trialLineage: independently verified upstream trial identity receipts; if
 *   absent, independent trial count MUST remain null.
 * All passed authorities must be rebuilt from current source on every run.
 */
export function compileOpportunityReport({opportunity,inspection,cases,sections=[],comparisons=[],trialLineage={}}){
  if(!object(opportunity)||!/^ifopp_[a-f0-9]{32}$/.test(opportunity.opportunityId||'')||
     opportunity.scientificGate!=='research-only'||opportunity.researchState!=='candidate'||
     opportunity.priorArtState!=='unchecked'||opportunity.commercialState!=='demand-unknown'||
     !text(opportunity.question)||!SHA.test(opportunity.intakeSnapshotId||''))fail('invalid or promoted Insight Foundry opportunity')
  const pico=opportunity.pico
  if(!object(pico)||!['population','intervention','comparator','timeframe'].every(k=>text(pico[k]))||
     !Array.isArray(pico.outcomes)||pico.outcomes.length<1||pico.outcomes.length>40||
     !pico.outcomes.every(text)||!Array.isArray(opportunity.originSignals)||
     opportunity.originSignals.length<1||opportunity.originSignals.length>50||
     !opportunity.originSignals.every(s=>object(s)&&text(s.kind)&&text(s.referenceId)&&text(s.limitation)))
    fail('missing complete Insight Foundry question scope or discovery provenance')
  if(!object(inspection)||inspection.evidenceAuthority!=='research-only'||inspection.publicationAuthorized!==false||
     !SHA.test(inspection.snapshotId||'')||!SHA.test(inspection.localGraphDigest||'')||
     !object(inspection.sourceAuthority)||inspection.studioWaveMayBeStale!==false||
     opportunity.intakeSnapshotId!==inspection.snapshotId)fail('unverified or stale canonical snapshot')
  if(!Array.isArray(cases)||cases.length<1||cases.length>16)fail('require 1–16 current source-bound integrated cases')
  if(!Array.isArray(sections)||!Array.isArray(comparisons)||sections.length>100||comparisons.length>100||!object(trialLineage))fail('invalid or unbounded section, comparison or lineage authority input')
  const caseByPmid=new Map(), resolved=[],reviewTargets=[], related=[],unresolved=[],decisions=[]
  const doiPublications=new Map()
  for(const item of cases){
    const cf=item?.caseFile,pmid=cf?.pmid
    if(!PMID.test(pmid||''))fail('case without exact PMID')
    const source=inspection.sourceAuthority[`studio-pmid:${pmid}`]
    if(!source||source.authority!=='research-only'||source.snapshotId!==inspection.snapshotId||
       source.pmid!==pmid||source.sourceId!==`studio-pmid:${pmid}`||
       source.sourceUrl!==`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`||
       !SIG.test(source.sourceSignature||'')||source.sourceSignature!==item.sourceSignature||
       cf.sourceSignature!==source.sourceSignature||item.fabric?.sourceSignature!==source.sourceSignature||
       item.fabric?.sourcePmid!==pmid)fail(`forged, stale or foreign source ${pmid}`)
    if(item.status!=='source-bound-human-review-only'||item.clinicalPromotions!==0||
       item.publicationAllowed!==false||item.mutationAllowed!==false||
       cf.status!=='source-discovery-only-no-clinical-adjudication'||
       !Array.isArray(cf.instruments)||new Set(cf.instruments.map(x=>x.instrument)).size!==8||
       !Array.isArray(item.scientific?.capabilities)||item.scientific.capabilities.length!==12||
       new Set(item.scientific.capabilities.map(x=>x.id)).size!==12||
       item.scientific.calibrationPassed!==true||item.scientific.clinicalPromotions!==0||
       item.scientific.autopublished!==0||item.fabric?.publicationAllowed!==false||
       item.fabric?.mutationAllowed!==false||
       item.fabric?.evidenceAuthority!=='research-intake-not-clinical-evidence'||
       item.fabric?.status!=='exact-publication-trace-review-only')fail(`case ${pmid} widened evidence or publishing authority`)
    if(caseByPmid.has(pmid)){
      if(stable(caseByPmid.get(pmid))!==stable(item))fail('duplicate PMID with conflicting exact case')
      decisions.push({action:'deduplicate-publication',pmid,basis:'identical PMID and current source identity'})
      continue
    }
    caseByPmid.set(pmid,item)
    const sourceDoi=doi(item.fabric.sourceDoi)
    if(item.fabric.sourceDoi!==null&&!sourceDoi)fail('malformed source DOI')
    if(sourceDoi){
      const pmids=doiPublications.get(sourceDoi)||new Set()
      pmids.add(pmid)
      doiPublications.set(sourceDoi,pmids)
    }
    resolved.push({pmid,sourceId:source.sourceId,sourceSignature:source.sourceSignature,sourceUrl:source.sourceUrl,
      doi:sourceDoi,status:'research-only-not-extracted',reviewedCitationIds:uniqueSorted(cf.reviewedCitationIds||[]),
      limitation:'An indexed paper is not a clinical claim or independent trial'})
    for(const t of item.fabric.distributionReviewTargets||[]){
      if(t.status!=='publication-matched-editorial-review-required'||!sourceDoi||t.matchingDoi!==sourceDoi||
         !canonicalPath(t.targetPage)||!SOURCE_REFERENCE_ID.test(t.sourceClaimId||'')||
         !SOURCE_REFERENCE_ID.test(t.citationId||'')||!SOURCE_REFERENCE_ID.test(t.objectId||''))fail('invalid or unsupported editorial target')
      reviewTargets.push({pmid,page:t.targetPage,sourceClaimId:t.sourceClaimId,sourceId:t.citationId,
        targetObjectId:t.objectId,doi:sourceDoi})
    }
    for(const neighbor of cf.relatedPapers||[]){
      if(!PMID.test(neighbor.pmid||''))fail('invalid related-paper PMID')
      const other=inspection.sourceAuthority[`studio-pmid:${neighbor.pmid}`]
      if(!other){unresolved.push({kind:'unregistered-neighbor',pmid:neighbor.pmid,reason:'Outside current exact source snapshot'});continue}
      related.push({fromPmid:pmid,toPmid:neighbor.pmid,sourceId:other.sourceId,
        sourceUrl:other.sourceUrl,sourceSignature:other.sourceSignature,
        basis:'indexed-shared-concepts-only',status:'investigation-candidate-not-clinical-evidence'})
    }
  }
  for(const [sharedDoi,ids] of [...doiPublications].sort(([a],[b])=>a.localeCompare(b))){
    if(ids.size>1)unresolved.push({kind:'doi-alias-review',pmids:uniqueSorted([...ids]),doi:sharedDoi,
      reason:'Multiple exact PMIDs share a DOI; publication identity and underlying trial independence require separate review'})
  }
  // Repeated identical source targets are one request, not multiple scientific conclusions.
  const uniqueTargets=new Map()
  for(const target of reviewTargets){
    const identity=stable([target.pmid,target.page,target.sourceClaimId,target.sourceId,target.doi])
    if(!uniqueTargets.has(identity))uniqueTargets.set(identity,target)
  }
  const targets=[...uniqueTargets.values()].sort((a,b)=>a.page.localeCompare(b.page)||a.pmid.localeCompare(b.pmid)||a.sourceClaimId.localeCompare(b.sourceClaimId))
  const exactSections=[]
  const seenSections=new Map()
  for(const t of targets){
    const matched=sections.filter(s=>s.page===t.page&&s.findingClaimId===t.sourceClaimId&&s.primarySourceId===t.sourceId)
    if(matched.length===0){unresolved.push({kind:'section-identity-missing',pmid:t.pmid,page:t.page,
      reason:'Exact page section/anchor not present in separately validated section registry'});continue}
    for(const s of matched){
      if(!canonicalPath(s.page)||!/^#[a-z0-9][a-z0-9_-]*$/.test(s.anchor||'')||
         !SHA.test(s.contentFingerprint||'')||s.verified!==true)fail('unverified or invalid content section mapping')
      const sectionKey=JSON.stringify([s.page,s.anchor,s.findingClaimId,s.primarySourceId])
      if(seenSections.has(sectionKey)&&seenSections.get(sectionKey)!==s.contentFingerprint)fail('conflicting section identity or stale section revision')
      seenSections.set(sectionKey,s.contentFingerprint)
      if(exactSections.some(x=>x.pmid===t.pmid&&x.page===s.page&&x.anchor===s.anchor&&x.claimId===t.sourceClaimId))continue
      exactSections.push({pmid:t.pmid,page:s.page,anchor:s.anchor,claimId:t.sourceClaimId,
        sectionContentFingerprint:s.contentFingerprint,disposition:'human-editorial-review-only'})
    }
  }
  // A comparison is affected ONLY through an existing exact-DOI/source/claim
  // handoff and a separately verified current comparison-content identity.
  // Semantic or topic similarity cannot create a comparison destination.
  const comparisonsAffected=[]
  const comparisonKeys=new Map()
  for(const c of comparisons){
    if(!object(c)||c.kind!=='comparison'||c.verified!==true||
       !/^cmp_[a-z0-9_-]{3,80}$/.test(c.comparisonId||'')||
       !canonicalPath(c.page)||!SHA.test(c.contentFingerprint||'')||
       !text(c.findingClaimId)||!text(c.primarySourceId)||!doi(c.doi))
      fail('comparison requires independent verified exact content and claim/source identity')
    const key=JSON.stringify([c.comparisonId,c.page,c.findingClaimId,c.primarySourceId,doi(c.doi)])
    if(comparisonKeys.has(key)&&comparisonKeys.get(key)!==c.contentFingerprint)
      fail('conflicting comparison revision for the same identity')
    comparisonKeys.set(key,c.contentFingerprint)
    const matching=targets.filter(t=>t.page===c.page&&t.sourceClaimId===c.findingClaimId&&
      t.sourceId===c.primarySourceId&&t.doi===doi(c.doi))
    for(const target of matching){
      if(!comparisonsAffected.some(x=>x.pmid===target.pmid&&x.comparisonId===c.comparisonId))
        comparisonsAffected.push({pmid:target.pmid,page:c.page,comparisonId:c.comparisonId,
          claimId:c.findingClaimId,contentFingerprint:c.contentFingerprint,
          disposition:'human-editorial-review-only'})
    }
  }
  if(comparisonsAffected.length===0)unresolved.push({kind:'comparison-identity-unavailable',
    reason:'No exact DOI + reviewed claim/source + verified current comparison identity; topical similarity is insufficient'})
  const pmids=uniqueSorted(resolved.map(x=>x.pmid))
  const verifiedTrialIds=[];let allTrialsVerified=true
  for(const r of resolved){
    const receipt=trialLineage[r.pmid]
    if(!receipt){allTrialsVerified=false;continue}
    if(receipt.status!=='verified'||receipt.sourceSignature!==r.sourceSignature||
       !text(receipt.underlyingStudyId)||receipt.approvedIndependently!==true||
       !['primary-trial','not-primary-trial'].includes(receipt.studyType))
      fail(`unverified trial-lineage assertion for PMID ${r.pmid}`)
    // Reviews, editorials and summaries can reference multiple trials. They do
    // NOT become one independent trial just because publication IDs are known.
    if(receipt.studyType!=='primary-trial'){allTrialsVerified=false;continue}
    verifiedTrialIds.push(receipt.underlyingStudyId)
  }
  const independentTrialCount=allTrialsVerified?new Set(verifiedTrialIds).size:null
  const candidateNeighbors=uniqueSorted(related.map(r=>r.toPmid))
  const safetyPmids=uniqueSorted([...caseByPmid].filter(([,c])=>c.caseFile.instruments.some(x=>x.instrument==='safety'&&x.linkedItems>0)).map(([p])=>p))
  const citation=(pmid)=>{const x=inspection.sourceAuthority[`studio-pmid:${pmid}`];return {sourceId:x.sourceId,sourceUrl:x.sourceUrl,sourceSignature:x.sourceSignature}}
  const targetedPmids=new Set(targets.map(t=>t.pmid))
  const sourceLevelEditorial=pmids.filter(pmid=>!targetedPmids.has(pmid))
  for(const pmid of sourceLevelEditorial)unresolved.push({kind:'editorial-identity-unavailable',pmid,
    reason:'No current exact DOI + reviewed source/claim page target; research-only editorial screening is required'})
  const requests=[...targets.map(t=>({channel:'editorial',pmid:t.pmid,...citation(t.pmid),
    page:t.page,claimId:t.sourceClaimId,status:'human-review-required',
    reason:'Existing source/claim/DOI publication-identity association; NOT claim support'})),
    ...sourceLevelEditorial.map(pmid=>({channel:'editorial',pmid,...citation(pmid),
      status:'human-review-required',reason:'Source-level evidence screening only; no exact approved claim or page association'})),
    ...pmids.map(pmid=>({channel:'safety',pmid,...citation(pmid),status:'qualified-safety-review-required',
      reason:safetyPmids.includes(pmid)?'Indexed safety *mention* merits investigation; NOT a confirmed risk or interaction':
        'Routine safety and limitations screen; NO indexed adverse-effect or interaction finding inferred'})),
    ...pmids.map(pmid=>({channel:'media',pmid,...citation(pmid),status:'scientific-and-creative-review-required',
      reason:'Research topic candidate only; no approved claims, narration, video or publication'}))]
  // Canonicalize report sequence so independent source selection order cannot
  // mutate IDs, hashes or review queue output. Same inputs == same artifact.
  // Repeated identical graph edges must not inflate apparent discovery breadth.
  const uniqueRelated=[...new Map(related.map(r=>[stable([r.fromPmid,r.toPmid,r.sourceId]),r])).values()]
  const uniqueUnresolved=[...new Map(unresolved.map(u=>[stable(u),u])).values()]
  uniqueUnresolved.sort((a,b)=>stable(a).localeCompare(stable(b)))
  const channelOrder={editorial:0,safety:1,media:2}
  requests.sort((a,b)=>channelOrder[a.channel]-channelOrder[b.channel]||a.pmid.localeCompare(b.pmid)||
    String(a.page||'').localeCompare(String(b.page||''))||String(a.claimId||'').localeCompare(String(b.claimId||'')))
  decisions.push({action:'source-bound-discovery',pmids,basis:'exact current Studio/graph signed PMID identities; no source-text effect inference'})
  decisions.push({action:'article-section-linking',linked:exactSections.length,unresolved:unresolved.filter(x=>x.kind==='section-identity-missing').length,basis:'exact page+claim+source ID with verified section fingerprint only'})
  decisions.push({action:'comparison-linking',linked:comparisonsAffected.length,basis:'exact DOI + claim/source IDs + separately verified current comparison-content identity; no topic inference'})
  decisions.push({action:'study-lineage',verified:allTrialsVerified,independentTrialCount,basis:'independent verified same-trial identity or Unknown; publication counts are not trial counts'})
  decisions.push({action:'review-routing',channels:uniqueSorted(requests.map(x=>x.channel)),basis:'review requests only; cannot edit or publish'})
  const report={schemaVersion:1,kind:'semantic-opportunity-review-report',opportunityId:opportunity.opportunityId,
    question:opportunity.question,pico:JSON.parse(stable(pico)),
    originSignals:opportunity.originSignals.map(x=>JSON.parse(stable(x))).sort((a,b)=>stable(a).localeCompare(stable(b))),
    sourceSnapshotId:inspection.snapshotId,graphDigest:inspection.localGraphDigest,
    sources:resolved.sort((a,b)=>a.pmid.localeCompare(b.pmid)),relatedResearch:uniqueRelated.sort((a,b)=>a.fromPmid.localeCompare(b.fromPmid)||a.toPmid.localeCompare(b.toPmid)),
    candidateNeighborPmids:candidateNeighbors,publicationCount:resolved.length,independentTrialCount,
    exactArticleSections:exactSections.sort((a,b)=>a.page.localeCompare(b.page)||a.anchor.localeCompare(b.anchor)),
    comparisonsAffected:comparisonsAffected.sort((a,b)=>a.page.localeCompare(b.page)||a.comparisonId.localeCompare(b.comparisonId)),
    reviewRequests:requests,unresolved:uniqueUnresolved,decisions,
    scientificGate:'research-only',claimApproval:'separate-independent-review-required',
    publicationAllowed:false,mutationAllowed:false,contentChangeAllowed:false,businessImpact:'unknown'}
  report.reportDigest=hash(report)
  return report
}

export function renderOpportunityMarkdown(report){
  if(report?.kind!=='semantic-opportunity-review-report'||report.publicationAllowed!==false||report.mutationAllowed!==false||report.contentChangeAllowed!==false||!SHA.test(report.reportDigest||'')||hash(Object.fromEntries(Object.entries(report).filter(([k])=>k!=='reportDigest')))!==report.reportDigest)fail('untrusted or altered report')
  return `# Semantic Opportunity Compiler — review only\n\nQuestion: ${markdownText(report.question)}\n\n## Study question scope (PICO)\n- Population: ${markdownText(report.pico.population)}\n- Intervention: ${markdownText(report.pico.intervention)}\n- Comparator: ${markdownText(report.pico.comparator)}\n- Outcomes: ${report.pico.outcomes.map(markdownText).join(', ')}\n- Timeframe: ${markdownText(report.pico.timeframe)}\n\n## Why this investigation was proposed\n${report.originSignals.map(x=>`- ${markdownText(x.kind)} / ${markdownText(x.referenceId)}: ${markdownText(x.limitation)}`).join('\n')}\n\nOpportunity: ${report.opportunityId}\nSnapshot: ${report.sourceSnapshotId}\nReport SHA-256: ${report.reportDigest}\n\n${report.publicationCount} distinct PMID records. Independent underlying trials: ${report.independentTrialCount??'Unknown (verification required)'}.\n\n## Investigational sources\n${report.sources.map(s=>`- PMID ${s.pmid}: ${s.sourceUrl} (research-only; no efficacy inferred)`).join('\n')}\n\n## Decisions\n${report.decisions.map(d=>`- ${markdownText(d.action)}: ${markdownText(d.basis)}${d.linked!==undefined?` (linked: ${d.linked})`:''}${d.unresolved!==undefined?` (unresolved: ${d.unresolved})`:''}`).join('\n')}\n\n## Article-section review targets\n${report.exactArticleSections.map(s=>`- ${s.page}${s.anchor} (PMID ${s.pmid}, claim ${markdownText(s.claimId)}; fingerprint ${s.sectionContentFingerprint}; requires human review)`).join('\n')||'None: no independently verified exact article sections'}\n\n## Verified comparison review targets\n${report.comparisonsAffected.map(c=>`- ${c.page} (${c.comparisonId}; fingerprint ${c.contentFingerprint}; requires human review)`).join('\n')||'None: no independently validated exact comparison identity'}\n\n## Related research leads (not clinical conclusions)\n${report.relatedResearch.map(r=>`- PMID ${r.fromPmid} → PMID ${r.toPmid}: ${r.basis}`).join('\n')||'None in current bounded source cohort'}\n\n## Review requests\n${report.reviewRequests.map(r=>`- ${r.channel} / PMID ${r.pmid}: ${r.status} — ${r.sourceUrl}`).join('\n')}\n\n## Unresolved\n${report.unresolved.map(u=>`- ${markdownText(u.kind)}: ${markdownText(u.reason)}`).join('\n')||'None recorded'}\n\n**Publishing, clinical promotion, and automatic mutation prohibited.**\n`
}

/**
 * A previously prepared report is never perpetual authorization: rederive
 * against a fresh trusted source register, Insight Foundry snapshot, integrated
 * cases and all content/lineage authority receipts before displaying or acting.
 * Merely passing a structurally valid SHA hash is not current-source proof.
 */
export function verifyOpportunityReport(candidate,currentInputs){
  if(!object(candidate)||!SHA.test(candidate.reportDigest||''))fail('candidate report digest missing')
  const current=compileOpportunityReport(currentInputs)
  if(stable(candidate)!==stable(current))fail('opportunity report stale, modified, or not current-source-bound')
  return current
}

/**
 * Diagnose a stored report against newly re-derived CURRENT authorities.
 * This is a non-authorizing, digest-checked review diagnostic. A stale report
 * always stays blocked; a diff is NOT approval to edit a source or article.
 *
 * Unlike a simple hash mismatch, the reason codes are stable and make a
 * source graph revision, report question change, or article fingerprint
 * change inspectable for a qualified human reviewer.
 */
export function auditOpportunityReportFreshness(candidate,currentInputs){
  if(!object(candidate)||candidate.kind!=='semantic-opportunity-review-report'||
     candidate.publicationAllowed!==false||candidate.mutationAllowed!==false||
     candidate.contentChangeAllowed!==false||!SHA.test(candidate.reportDigest||''))
    fail('invalid or promoted prior report for freshness audit')
  const previous={...candidate};delete previous.reportDigest
  if(hash(previous)!==candidate.reportDigest)
    fail('prior report is modified or has an invalid content digest')
  const current=compileOpportunityReport(currentInputs)
  const reasons=[]
  const add=(code,detail)=>reasons.push({code,detail})
  if(candidate.opportunityId!==current.opportunityId||candidate.question!==current.question||
     stable(candidate.pico)!==stable(current.pico)||stable(candidate.originSignals)!==stable(current.originSignals))
    add('investigation-scope-changed','Question, PICO, investigator-origin rationale or opportunity identity changed')
  if(candidate.sourceSnapshotId!==current.sourceSnapshotId)
    add('source-snapshot-changed','The governed source snapshot fingerprint changed; recheck source receipt authority')
  if(candidate.graphDigest!==current.graphDigest)
    add('semantic-graph-changed','The indexed source graph fingerprint changed; previous related-paper links may be stale')
  for(const [property,key,code] of [
    ['sources',x=>x.pmid,'source-records-changed'],
    ['exactArticleSections',x=>stable([x.pmid,x.page,x.anchor,x.claimId]),'article-section-identity-or-revision-changed'],
    ['comparisonsAffected',x=>stable([x.pmid,x.page,x.comparisonId,x.claimId]),'comparison-identity-or-revision-changed'],
  ]){
    if(!Array.isArray(candidate[property]))fail('malformed prior report content: '+property)
    const old=new Map(candidate[property].map(x=>[key(x),x]))
    const fresh=new Map(current[property].map(x=>[key(x),x]))
    if(old.size!==candidate[property].length||fresh.size!==current[property].length)
      fail('duplicate prior/current report identities in '+property)
    if(old.size!==fresh.size||[...new Set([...old.keys(),...fresh.keys()])].some(k=>stable(old.get(k)??null)!==stable(fresh.get(k)??null)))
      add(code,'Exact identity, source signature, content fingerprint or selected record set changed')
  }
  // A change to the precise source signature is important enough to name.
  // The original and fresh source lists are already compared above, but the
  // generic count/selection reason alone is not actionable for an editor.
  const oldSources=new Map(candidate.sources.map(x=>[x.pmid,x]))
  const freshSources=new Map(current.sources.map(x=>[x.pmid,x]))
  const revisedPmids=uniqueSorted([...oldSources.keys()].filter(pmid=>
    freshSources.has(pmid)&&oldSources.get(pmid).sourceSignature!==freshSources.get(pmid).sourceSignature))
  if(revisedPmids.length)add('source-signature-changed',
    `Exact source-fingerprint revisions for PMID ${revisedPmids.join(', ')}; discard prior review requests`)
  for(const [property,code,detail] of [
    ['relatedResearch','related-research-changed','Source-linked discovery leads changed'],
    ['reviewRequests','review-queue-changed','Qualified review targets or source signatures changed'],
    ['unresolved','unresolved-decisions-changed','The missingness or held-decision set changed'],
    ['independentTrialCount','study-lineage-changed','Underlying-trial identity or verified independence changed'],
    ['decisions','decision-trace-changed','One or more documented routing decisions changed'],
  ])if(stable(candidate[property])!==stable(current[property]))add(code,detail)
  if(candidate.reportDigest!==current.reportDigest&&!reasons.length)
    add('other-report-content-changed','An inspectable report field changed outside the named categories')
  const result={schemaVersion:1,kind:'semantic-opportunity-freshness-diagnostic',
    status:reasons.length?'stale-human-review-required':'current-source-bound',
    previousReportDigest:candidate.reportDigest,currentReportDigest:current.reportDigest,
    changes:reasons.sort((a,b)=>a.code.localeCompare(b.code)),
    publicationAllowed:false,mutationAllowed:false,claimApprovalAllowed:false}
  return result
}
