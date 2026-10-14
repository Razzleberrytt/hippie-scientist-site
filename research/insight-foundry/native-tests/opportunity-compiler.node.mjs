import {test} from 'node:test'
import assert from 'node:assert/strict'
import {compileOpportunityReport,renderOpportunityMarkdown,verifyOpportunityReport} from '../src/opportunity-compiler.mjs'
const S='2-f00baaaa-1234abcd', H='a'.repeat(64), G='b'.repeat(64), F='c'.repeat(64)
const instrumentNames=['dna','contradictions','frontier','time','voyages','safety','ask','reactor']
const source=(pmid,sig=S)=>({pmid,sourceId:`studio-pmid:${pmid}`,sourceSignature:sig,snapshotId:H,
  authority:'research-only',sourceUrl:`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`})
function scene(pmid='12345',extra={}){
  const base={pmid,sourceSignature:S,status:'source-discovery-only-no-clinical-adjudication',reviewedCitationIds:[],
    relatedPapers:[{pmid:'23456',sharedConcepts:['magnesium'],explanation:'shared metadata only'}],
    instruments:instrumentNames.map(name=>({instrument:name,linkedItems:name==='safety'?1:0}))}
  return {sourceSignature:S,status:'source-bound-human-review-only',publicationAllowed:false,mutationAllowed:false,clinicalPromotions:0,
    caseFile:{...base,...extra},scientific:{capabilities:Array.from({length:12},(_,i)=>({id:String(i)})),
      calibrationPassed:true,clinicalPromotions:0,autopublished:0},
    fabric:{sourceSignature:S,sourcePmid:pmid,sourceDoi:'10.1000/sample',status:'exact-publication-trace-review-only',
      evidenceAuthority:'research-intake-not-clinical-evidence',publicationAllowed:false,mutationAllowed:false,
      distributionReviewTargets:[{targetPage:'/guides/sleep/magnesium/',status:'publication-matched-editorial-review-required',
      matchingDoi:'10.1000/sample',sourceClaimId:'claim1',citationId:'src1',objectId:'object1'}]}}
}
const inputs=()=>({opportunity:{opportunityId:'ifopp_'+ 'a'.repeat(32),question:'Does magnesium glycinate improve sleep?',scientificGate:'research-only',
  researchState:'candidate',priorArtState:'unchecked',commercialState:'demand-unknown',intakeSnapshotId:H,
  pico:{population:'adults',intervention:'magnesium glycinate',comparator:'magnesium citrate',outcomes:['sleep duration','sleep quality'],timeframe:'as reported in trial'},
  originSignals:[{kind:'source-index-lead',referenceId:'fixture-12345',limitation:'title co-mention only'}]},
 inspection:{evidenceAuthority:'research-only',publicationAuthorized:false,snapshotId:H,localGraphDigest:G,studioWaveMayBeStale:false,
 sourceAuthority:{'studio-pmid:12345':source('12345'),'studio-pmid:23456':source('23456')}},
 cases:[scene()],sections:[{page:'/guides/sleep/magnesium/',findingClaimId:'claim1',primarySourceId:'src1',
 anchor:'#evidence',contentFingerprint:F,verified:true}],trialLineage:{}})
const deep=x=>JSON.parse(JSON.stringify(x))
test('single report joins exact signed case with registered section and routes all three review channels',()=>{
 const r=compileOpportunityReport(inputs());assert.equal(r.publicationAllowed,false);assert.equal(r.sources.length,1);
 assert.equal(r.relatedResearch[0].toPmid,'23456');assert.equal(r.exactArticleSections[0].anchor,'#evidence');
 assert.deepEqual(r.reviewRequests.map(x=>x.channel),['editorial','safety','media']);assert.equal(r.independentTrialCount,null);
 assert.ok(renderOpportunityMarkdown(r).includes('Independent underlying trials: Unknown'))
})
test('deterministic reporting and readable decision trace',()=>{
 const x=inputs(); const a=compileOpportunityReport(x),b=compileOpportunityReport(deep(x));
 assert.deepEqual(a,b);assert.equal(a.reportDigest,b.reportDigest);assert.equal(a.decisions.length,5)
})
test('duplicates same PMID without doubling source count',()=>{const x=inputs();x.cases.push(deep(x.cases[0])); const r=compileOpportunityReport(x);assert.equal(r.publicationCount,1);assert.ok(r.decisions.some(d=>d.action==='deduplicate-publication'))})
test('reject conflicting duplicate PMID',()=>{const x=inputs();const c=deep(x.cases[0]);c.caseFile.reviewedCitationIds=['injected'];x.cases.push(c);assert.throws(()=>compileOpportunityReport(x),/conflicting/)})
test('reject stale source snapshot',()=>{const x=inputs();x.inspection.snapshotId=F;assert.throws(()=>compileOpportunityReport(x),/snapshot/)})
test('reject stale source signature',()=>{const x=inputs();x.cases[0].sourceSignature='2-aaaaaaaa-bbbbbbbb';assert.throws(()=>compileOpportunityReport(x),/stale/)})
test('reject unauthorized clinical promotion',()=>{const x=inputs();x.cases[0].clinicalPromotions=1;assert.throws(()=>compileOpportunityReport(x),/authority/)})
test('reject injected publication or content mutation permission',()=>{const x=inputs();x.cases[0].publicationAllowed=true;assert.throws(()=>compileOpportunityReport(x),/authority/)})
test('reject fabricated article section',()=>{const x=inputs();x.sections[0].anchor='#anchor%0a';assert.throws(()=>compileOpportunityReport(x),/section/)})
test('unknown sections remain unresolved, not guessed from topic or page',()=>{const x=inputs();x.sections=[];const r=compileOpportunityReport(x);assert.equal(r.exactArticleSections.length,0);assert.ok(r.unresolved.some(x=>x.kind==='section-identity-missing'))})
test('independent-trial count requires separate approved lineage for every source',()=>{
 const x=inputs(); x.trialLineage['12345']={status:'verified',sourceSignature:S,underlyingStudyId:'trial-1',approvedIndependently:true,studyType:'primary-trial'};
 const r=compileOpportunityReport(x);assert.equal(r.independentTrialCount,1)
})
test('reject self-attested or stale trial identity',()=>{
 const x=inputs(); x.trialLineage['12345']={status:'verified',sourceSignature:S,underlyingStudyId:'trial-1',approvedIndependently:false,studyType:'primary-trial'};
 assert.throws(()=>compileOpportunityReport(x),/trial-lineage/)
})
test('research neighbor outside governed snapshot is not promoted',()=>{
 const x=inputs();delete x.inspection.sourceAuthority['studio-pmid:23456'];const r=compileOpportunityReport(x);
 assert.equal(r.relatedResearch.length,0);assert.equal(r.unresolved.find(x=>x.kind==='unregistered-neighbor').pmid,'23456')
})
test('report renderer rejects post-generation tampering',()=>{const r=compileOpportunityReport(inputs());r.question='This proves efficacy!';assert.throws(()=>renderOpportunityMarkdown(r),/altered report/)})
test('DOI cannot hijack a target from a different publication',()=>{const x=inputs();x.cases[0].fabric.distributionReviewTargets[0].matchingDoi='10.1000/wrong';assert.throws(()=>compileOpportunityReport(x),/editorial target/)})
test('two publications sharing verified underlying trial count as one independent trial',()=>{
 const x=inputs();x.cases.push(scene('23456',{relatedPapers:[]}));
 x.trialLineage['12345']={status:'verified',sourceSignature:S,underlyingStudyId:'same-trial',approvedIndependently:true,studyType:'primary-trial'};
 x.trialLineage['23456']={status:'verified',sourceSignature:S,underlyingStudyId:'same-trial',approvedIndependently:true,studyType:'primary-trial'};
 const r=compileOpportunityReport(x);assert.equal(r.publicationCount,2);assert.equal(r.independentTrialCount,1);
 assert.equal(r.unresolved.find(y=>y.kind==='doi-alias-review').doi,'10.1000/sample');
})
test('one missing verified trial receipt makes the entire trial count unknown',()=>{
 const x=inputs();x.cases.push(scene('23456',{relatedPapers:[]}));
 x.trialLineage['12345']={status:'verified',sourceSignature:S,underlyingStudyId:'same-trial',approvedIndependently:true,studyType:'primary-trial'};
 const r=compileOpportunityReport(x);assert.equal(r.independentTrialCount,null)
})
test('review target cannot specify a foreign web domain or disguised traversal route',()=>{
 const x=inputs(); x.cases[0].fabric.distributionReviewTargets[0].targetPage='/../../evil/';
 assert.throws(()=>compileOpportunityReport(x),/editorial target/)
})

// Comparison destinations cannot be inferred from study topic or URL keywords.
test('no comparison is invented without an exact verified comparison registry',()=>{
 const r=compileOpportunityReport(inputs());assert.equal(r.comparisonsAffected.length,0);
 assert.equal(r.unresolved.some(x=>x.kind==='comparison-identity-unavailable'),true);
})
test('exact source/claim/DOI maps to current verified comparison for human review only',()=>{
 const x=inputs();x.comparisons=[{kind:'comparison',verified:true,comparisonId:'cmp_magnesium_forms',
   page:'/guides/sleep/magnesium/',findingClaimId:'claim1',primarySourceId:'src1',doi:'10.1000/sample',contentFingerprint:F}];
 const r=compileOpportunityReport(x);assert.equal(r.comparisonsAffected.length,1);
 assert.equal(r.comparisonsAffected[0].disposition,'human-editorial-review-only');
 assert.ok(renderOpportunityMarkdown(r).includes('cmp_magnesium_forms'));
})
test('DOI or source mismatch never creates a comparison recommendation',()=>{
 const x=inputs();x.comparisons=[{kind:'comparison',verified:true,comparisonId:'cmp_magnesium_forms',
   page:'/guides/sleep/magnesium/',findingClaimId:'claim1',primarySourceId:'src1',doi:'10.1000/other',contentFingerprint:F}];
 const r=compileOpportunityReport(x);assert.equal(r.comparisonsAffected.length,0);
})
test('rejects comparison registry self-attested unverified content',()=>{
 const x=inputs();x.comparisons=[{kind:'comparison',verified:false,comparisonId:'cmp_magnesium_forms',
   page:'/guides/sleep/magnesium/',findingClaimId:'claim1',primarySourceId:'src1',doi:'10.1000/sample',contentFingerprint:F}];
 assert.throws(()=>compileOpportunityReport(x),/comparison requires independent verified/);
})
test('conflicting exact article section revisions are rejected',()=>{
 const x=inputs();x.sections.push({...x.sections[0],contentFingerprint:'d'.repeat(64)});
 assert.throws(()=>compileOpportunityReport(x),/conflicting section identity/);
})
test('conflicting exact comparison revisions are rejected',()=>{
 const x=inputs();x.comparisons=[{kind:'comparison',verified:true,comparisonId:'cmp_magnesium_forms',
   page:'/guides/sleep/magnesium/',findingClaimId:'claim1',primarySourceId:'src1',doi:'10.1000/sample',contentFingerprint:F}];
 x.comparisons.push({...x.comparisons[0],contentFingerprint:'d'.repeat(64)});
 assert.throws(()=>compileOpportunityReport(x),/conflicting comparison revision/);
})

test('every review channel cites exact signed source URL and provenance',()=>{
 const r=compileOpportunityReport(inputs());
 assert.ok(r.reviewRequests.every(x=>x.sourceUrl==='https://pubmed.ncbi.nlm.nih.gov/12345/'&&x.sourceSignature===S));
 assert.ok(renderOpportunityMarkdown(r).includes('media / PMID 12345: scientific-and-creative-review-required — https://pubmed.ncbi.nlm.nih.gov/12345/'));
})
test('rejects forged PubMed hostname in source authority',()=>{
 const x=inputs();x.inspection.sourceAuthority['studio-pmid:12345'].sourceUrl='https://pubmed.ncbi.nlm.nih.gov.evil.com/12345/';
 assert.throws(()=>compileOpportunityReport(x),/forged, stale or foreign source/);
})

test('fresh report rederivation accepts exact same authoritative inputs',()=>{
 const x=inputs(),r=compileOpportunityReport(x)
 assert.deepEqual(verifyOpportunityReport(r,x),r)
})
test('validly hashed report is rejected after source graph snapshot changes',()=>{
 const x=inputs(),r=compileOpportunityReport(x)
 const next=deep(x);next.inspection.localGraphDigest='d'.repeat(64)
 assert.throws(()=>verifyOpportunityReport(r,next),/stale, modified/)
})
test('report is rejected after a verified article section is revised',()=>{
 const x=inputs(),r=compileOpportunityReport(x)
 const next=deep(x);next.sections[0].contentFingerprint='d'.repeat(64)
 assert.throws(()=>verifyOpportunityReport(r,next),/stale, modified/)
})
test('report is rejected after a previously verified comparison changes',()=>{
 const x=inputs();x.comparisons=[{kind:'comparison',verified:true,comparisonId:'cmp_magnesium_forms',
  page:'/guides/sleep/magnesium/',findingClaimId:'claim1',primarySourceId:'src1',doi:'10.1000/sample',contentFingerprint:F}]
 const r=compileOpportunityReport(x),next=deep(x);next.comparisons[0].contentFingerprint='d'.repeat(64)
 assert.throws(()=>verifyOpportunityReport(r,next),/stale, modified/)
})
test('case ordering does not change resolved report or digest',()=>{
 const x=inputs();x.cases.push(scene('23456',{relatedPapers:[]}))
 const y=deep(x);y.cases.reverse()
 const a=compileOpportunityReport(x),b=compileOpportunityReport(y)
 assert.deepEqual(a,b)
})
test('DOI alias review is complete and independent of discovery order',()=>{
 const x=inputs();x.cases.push(scene('23456',{relatedPapers:[]}));x.cases.push(scene('34567',{relatedPapers:[]}))
 x.inspection.sourceAuthority['studio-pmid:34567']=source('34567')
 const r=compileOpportunityReport(x)
 assert.deepEqual(r.unresolved.find(x=>x.kind==='doi-alias-review').pmids,['12345','23456','34567'])
 const y=deep(x);y.cases.reverse()
 assert.deepEqual(compileOpportunityReport(y).unresolved,r.unresolved)
})
test('literature reviews cannot masquerade as independent primary trials',()=>{
 const x=inputs();x.trialLineage['12345']={status:'verified',sourceSignature:S,
   underlyingStudyId:'trial-1',approvedIndependently:true,studyType:'not-primary-trial'}
 const r=compileOpportunityReport(x)
 assert.equal(r.independentTrialCount,null)
})
test('trial receipts missing study type fail closed',()=>{
 const x=inputs();x.trialLineage['12345']={status:'verified',sourceSignature:S,
   underlyingStudyId:'trial-1',approvedIndependently:true}
 assert.throws(()=>compileOpportunityReport(x),/trial-lineage/)
})
test('report can display source-bound section and investigational neighbor in Markdown',()=>{
 const r=compileOpportunityReport(inputs()),m=renderOpportunityMarkdown(r)
 assert.ok(m.includes('## Article-section review targets'))
 assert.ok(m.includes('/guides/sleep/magnesium/#evidence'))
 assert.ok(m.includes('## Related research leads (not clinical conclusions)'))
 assert.ok(m.includes('fingerprint'))
})
test('current-source verifier rejects forged publication permission even with recomputed digest',()=>{
 const x=inputs(),r=compileOpportunityReport(x)
 r.publicationAllowed=true
 assert.throws(()=>verifyOpportunityReport(r,x),/stale, modified/)
})
test('current-source verifier rejects extra forged approved scientific claims',()=>{
 const x=inputs(),r=compileOpportunityReport(x)
 r.approvedClaim={effect:'improves sleep'}
 assert.throws(()=>verifyOpportunityReport(r,x),/stale, modified/)
})
test('rejects unbounded research and article-section input rather than silently truncating',()=>{
 const x=inputs();x.cases=Array.from({length:17},()=>scene())
 assert.throws(()=>compileOpportunityReport(x),/require 1–16/)
 const y=inputs();y.sections=Array.from({length:101},()=>deep(y.sections[0]))
 assert.throws(()=>compileOpportunityReport(y),/unbounded/)
})


test('report includes full PICO scope and actual investigation-origin limitations',()=>{
 const r=compileOpportunityReport(inputs());
 assert.equal(r.pico.comparator,'magnesium citrate');
 assert.equal(r.originSignals[0].limitation,'title co-mention only');
 const m=renderOpportunityMarkdown(r);
 assert.ok(m.includes('## Study question scope (PICO)'));
 assert.ok(m.includes('## Why this investigation was proposed'));
})
test('refuses missing PICO and source-origin provenance even with valid-looking identity',()=>{
 const a=inputs();delete a.opportunity.pico;
 assert.throws(()=>compileOpportunityReport(a),/question scope/);
 const b=inputs();b.opportunity.originSignals=[];
 assert.throws(()=>compileOpportunityReport(b),/discovery provenance/);
})
test('report renderer neutralizes markdown heading and link injection in question',()=>{
 const x=inputs();x.opportunity.question='Study question\n## CLAIM APPROVED\n[click](https://evil.example)';
 const m=renderOpportunityMarkdown(compileOpportunityReport(x));
 assert.ok(!m.includes('\n## CLAIM APPROVED\n'));
 assert.ok(!m.includes('[click](https://evil.example)'));
 assert.ok(m.includes('\\n\\#\\# CLAIM APPROVED'));
})
test('review handoff always offers all three channels without inventing source claim links',()=>{
 const x=inputs();x.cases[0].fabric.distributionReviewTargets=[];
 x.cases[0].caseFile.instruments.find(i=>i.instrument==='safety').linkedItems=0;
 const r=compileOpportunityReport(x);
 assert.deepEqual(r.reviewRequests.map(x=>x.channel),['editorial','safety','media']);
 assert.equal(r.reviewRequests[0].page,undefined);
 assert.equal(r.exactArticleSections.length,0);
 assert.equal(r.unresolved.some(x=>x.kind==='editorial-identity-unavailable'),true);
 assert.ok(r.reviewRequests[1].reason.includes('Routine safety'));
})
test('identical repeated distribution target creates just one editorial review request',()=>{
 const x=inputs();x.cases[0].fabric.distributionReviewTargets.push(deep(x.cases[0].fabric.distributionReviewTargets[0]));
 const r=compileOpportunityReport(x);
 assert.equal(r.reviewRequests.filter(x=>x.channel==='editorial').length,1);
 assert.equal(r.exactArticleSections.length,1);
})
test('duplicate related graph neighbor is counted only once and retains source provenance',()=>{
 const x=inputs();x.cases[0].caseFile.relatedPapers.push(deep(x.cases[0].caseFile.relatedPapers[0]));
 const r=compileOpportunityReport(x);
 assert.equal(r.relatedResearch.length,1);
 assert.equal(r.relatedResearch[0].sourceUrl,'https://pubmed.ncbi.nlm.nih.gov/23456/');
})
test('stored report becomes stale when question scope or discovery provenance changes',()=>{
 const x=inputs();const r=compileOpportunityReport(x),changed=deep(x);
 changed.opportunity.pico.comparator='placebo';
 assert.throws(()=>verifyOpportunityReport(r,changed),/stale, modified/);
 const another=deep(x);another.opportunity.originSignals[0].limitation='changed origin';
 assert.throws(()=>verifyOpportunityReport(r,another),/stale, modified/);
})

// v4: source/content revision diagnostics. Every output is review-only.
test('freshness audit confirms same current source-bound report without widening authority',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i),a=auditOpportunityReportFreshness(old,deep(i))
 assert.equal(a.status,'current-source-bound');assert.deepEqual(a.changes,[])
 assert.equal(a.publicationAllowed,false);assert.equal(a.mutationAllowed,false)
 assert.equal(a.currentReportDigest,old.reportDigest)
})
test('freshness audit distinguishes source snapshot and graph revision',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i),next=deep(i)
 next.inspection.localGraphDigest=F;next.inspection.snapshotId=F;next.opportunity.intakeSnapshotId=F
 for(const receipt of Object.values(next.inspection.sourceAuthority))receipt.snapshotId=F
 const a=auditOpportunityReportFreshness(old,next)
 assert.equal(a.status,'stale-human-review-required')
 assert.deepEqual(a.changes.map(x=>x.code).filter(x=>x.includes('changed')).sort(),['semantic-graph-changed','source-snapshot-changed'])
})
test('freshness audit identifies changed verified section fingerprints',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i),next=deep(i);next.sections[0].contentFingerprint='d'.repeat(64)
 const a=auditOpportunityReportFreshness(old,next)
 assert.ok(a.changes.some(x=>x.code==='article-section-identity-or-revision-changed'))
 assert.equal(a.status,'stale-human-review-required')
})
test('freshness audit identifies verified comparison revisions',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs();i.comparisons=[{kind:'comparison',verified:true,comparisonId:'cmp_magnesium_forms',
 page:'/guides/sleep/magnesium/',findingClaimId:'claim1',primarySourceId:'src1',doi:'10.1000/sample',contentFingerprint:F}]
 const old=compileOpportunityReport(i),next=deep(i);next.comparisons[0].contentFingerprint='d'.repeat(64)
 const a=auditOpportunityReportFreshness(old,next)
 assert.ok(a.changes.some(x=>x.code==='comparison-identity-or-revision-changed'))
})
test('freshness audit identifies changed question or investigator rationale',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i),next=deep(i);next.opportunity.originSignals[0].limitation='A revised limitation'
 const a=auditOpportunityReportFreshness(old,next)
 assert.ok(a.changes.some(x=>x.code==='investigation-scope-changed'))
})
test('freshness audit records added source without claiming a new independent trial',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i),next=deep(i);next.cases.push(scene('23456',{relatedPapers:[]}))
 const a=auditOpportunityReportFreshness(old,next)
 assert.ok(a.changes.some(x=>x.code==='source-records-changed'))
 assert.equal(a.status,'stale-human-review-required')
 assert.equal(compileOpportunityReport(next).independentTrialCount,null)
})
test('freshness audit records changed current trial authority and refuses automatic promotion',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i),next=deep(i)
 next.trialLineage['12345']={status:'verified',sourceSignature:S,underlyingStudyId:'trial-1',approvedIndependently:true,studyType:'primary-trial'}
 const a=auditOpportunityReportFreshness(old,next)
 assert.ok(a.changes.some(x=>x.code==='study-lineage-changed'))
 assert.equal(a.publicationAllowed,false)
})
test('freshness audit refuses old report with a corrupted digest',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i);old.question='Approved study finding!'
 assert.throws(()=>auditOpportunityReportFreshness(old,i),/invalid content digest/)
})
test('freshness audit rejects forged old publishing privileges',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i);old.publicationAllowed=true
 assert.throws(()=>auditOpportunityReportFreshness(old,i),/invalid or promoted prior report/)
})
test('compiler rejects editorial claim ID with Markdown heading injection',()=>{
 const i=inputs();i.cases[0].fabric.distributionReviewTargets[0].sourceClaimId='clm1\n# APPROVED'
 assert.throws(()=>compileOpportunityReport(i),/unsupported editorial target/)
})
test('compiler rejects malformed citation ID and object ID before report rendering',()=>{
 const i=inputs();i.cases[0].fabric.distributionReviewTargets[0].citationId='src1](https://fake.example)'
 assert.throws(()=>compileOpportunityReport(i),/unsupported editorial target/)
 const x=inputs();x.cases[0].fabric.distributionReviewTargets[0].objectId='a<iframe>'
 assert.throws(()=>compileOpportunityReport(x),/unsupported editorial target/)
})
test('freshness audit catches research neighbor changes even with the same source revision',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const i=inputs(),old=compileOpportunityReport(i),next=deep(i);next.cases[0].caseFile.relatedPapers=[]
 const a=auditOpportunityReportFreshness(old,next)
 assert.ok(a.changes.some(x=>x.code==='related-research-changed'))
 assert.equal(a.status,'stale-human-review-required')
})

test('freshness audit names exact PMID whose source signature was revised',async()=>{
 const {auditOpportunityReportFreshness}=await import('../src/opportunity-compiler.mjs')
 const original=inputs(),old=compileOpportunityReport(original),next=deep(original)
 const signature='2-aaccbbdd-56789abc'
 next.inspection.sourceAuthority['studio-pmid:12345'].sourceSignature=signature
 next.cases[0].sourceSignature=signature
 next.cases[0].caseFile.sourceSignature=signature
 next.cases[0].fabric.sourceSignature=signature
 const a=auditOpportunityReportFreshness(old,next)
 assert.equal(a.status,'stale-human-review-required')
 const changed=a.changes.find(x=>x.code==='source-signature-changed')
 assert.ok(changed);assert.match(changed.detail,/12345/)
 assert.equal(a.publicationAllowed,false)
})
