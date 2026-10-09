import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {buildResearchSemanticNetwork} from '../../lib/research-semantic-network'
import {buildPublicationLineageReport} from '../../lib/research-publication-lineage'
import {buildResearchCaseFile} from '../../lib/research-intelligence-casefile'
import {buildResearchCaseScope,traceCaseConceptPair,createResearchInstrumentHandoff,resolveResearchInstrumentHandoff} from '../../lib/research-intelligence-context'
import {buildInstrumentRelay,pickTraceableConceptPair} from '../../lib/research-intelligence-relay'
import {planResearchSemanticFabric} from '../../lib/research-semantic-fabric'
import {buildIntegratedResearchCase,validateResearchEditorialReviewRequest} from '../../lib/research-intelligence-integration'
import {SCIENCE_CAPABILITIES,buildScientificIntelligenceCase} from '../../lib/scientific-intelligence-suite'
import {compileReviewedClaimFacets} from '../../lib/scientific-intelligence-reviewed'
import {compileClaimDNA,detectTrialLineage,compareStudyContexts,scanResearchIntegrity} from '../../lib/scientific-intelligence-foundations'
import {forgeSourceHypotheses,simulateSourceRemoval,runBoundedInvestigation} from '../../lib/scientific-intelligence-discovery'
import {calibrateIntelligenceCase,compileLivingReview} from '../../lib/scientific-intelligence-review'
import {verifyResearchSourceWitness} from '../../lib/research-semantic-provenance'
import {validateResearchAdjudicationLedger,type ResearchAdjudicationEvent} from '../../lib/research-semantic-adjudication'
import {buildResearchIntelligenceStudio,hydrateResearchStudioWithPublishedEvidence,askResearchSources,explainSemanticVoyage} from '../../lib/research-intelligence-studio'

function source(pmid:string,title:string,year:string,abstract='An unreviewed source text with no clinical conclusions.',category='sleep'){
 return {pmid,title,year,abstract,category,journal:'Test journal',pubType:'Journal Article'}
}
const sources=[
 source('10000001','Magnesium and sleep quality: randomized controlled trial','2023','Healthy adults were compared with placebo.'),
 source('10000002','Creatine and cognition in older adults','2022','Randomized controlled trial with placebo.','cognition_focus'),
 source('10000003','Passiflora incarnata and anxiety','2020','No dosage or efficacy inference.','stress_anxiety'),
 source('10000004','Sleep duration among children','2018','Observational research only.'),
 source('10000005','Magnesium and stress response','2017','Data do not establish safety.','stress_anxiety'),
 source('10000006','Vitamin D and insomnia','2024','Meta-analysis of literature.'),
]
const reviewed=[
 {id:'study-a',pmid:'20000001',title:'Trial A',year:2023,evidenceClass:'randomized_controlled_trial',relationships:[
  {ingredientSlug:'magnesium',ingredientName:'Magnesium',ingredientPath:'/compounds/magnesium/',relationship:'supports' as const,outcome:'sleep quality',population:'Adults'}]},
 {id:'study-b',pmid:'20000002',title:'Trial B',year:2021,evidenceClass:'randomized_controlled_trial',relationships:[
  {ingredientSlug:'magnesium',ingredientName:'Magnesium',ingredientPath:'/compounds/magnesium/',relationship:'no_clear_effect' as const,outcome:'sleep quality',population:'Older adults'}]},
 {id:'study-c',pmid:'20000003',title:'Trial C',year:2020,evidenceClass:'observational',relationships:[
  {ingredientSlug:'magnesium',ingredientName:'Magnesium',ingredientPath:'/compounds/magnesium/',relationship:'supports' as const,outcome:'blood pressure',population:'Adults'}]},
]
const graph=buildResearchSemanticNetwork(sources)
const s=buildResearchIntelligenceStudio(sources,graph,reviewed)

// The source-only asset must be fast to build. Browser-side enrichment restores
// only separately reviewed directional candidates and chronology.
const precomputed=buildResearchIntelligenceStudio(sources,graph,[])
assert.equal(precomputed.debates.length,0,'No published directions in source-only build')
const browserJoined=hydrateResearchStudioWithPublishedEvidence(precomputed,reviewed)
assert.equal(browserJoined.debates.length,s.debates.length)
assert.equal(browserJoined.timeline.find(x=>x.year===2023)?.reviewedCitations,1)
assert.equal(browserJoined.metrics.automaticallyPromotedClaims,0)
assert.equal(browserJoined.dna,precomputed.dna,'No research intake mutation during reviewed client join')
assert(browserJoined.briefs.every(x=>x.allowAutopublish===false))

assert.equal(s.systemVersion,'1.05')
const sharedCase=buildResearchCaseFile(s,graph,'10000001')
assert(sharedCase,'Known source must open a shared case file')
assert.equal(sharedCase.pmid,'10000001')
const science=buildScientificIntelligenceCase(s,graph,sharedCase)
assert.equal(SCIENCE_CAPABILITIES.length,12,'The complete scientific capability registry is mandatory')
assert.equal(science.capabilities.length,12)
assert.equal(science.version,'1.14')
assert.equal(science.calibrationPassed,true,'The active review-only case must pass foundational calibration')
assert.equal(science.calibrationChecks,13,'All source identity, evidence and release guards must run')
assert.equal(science.clinicalPromotions,0)
assert.equal(science.autopublished,0)
assert(science.capabilities.every(x=>x.releaseApproved===false))
assert.equal(compileClaimDNA(s,graph,sharedCase).effectDirection,null)
assert.equal(compileClaimDNA(s,graph,sharedCase).dose,null)
assert.equal(detectTrialLineage(s,graph,sharedCase).underlyingTrialIndependence,'unknown')
assert.equal(forgeSourceHypotheses(s,graph,sharedCase).every(x=>
  x.pmid===sharedCase.pmid&&x.status==='hypothesis-unverified'),true)
assert.equal(simulateSourceRemoval(s,graph,sharedCase).changedScientificConclusion,false)
assert(runBoundedInvestigation(s,graph,sharedCase).every(x=>
  !x.automaticallyPublished&&x.pmid===sharedCase.pmid))
assert.equal(compileLivingReview(s,graph,sharedCase).publicationAllowed,false)
assert.equal(compileLivingReview(s,graph,sharedCase).revisionKey,
  compileLivingReview(s,graph,sharedCase).revisionKey,'Review snapshots must be reproducible')
assert.equal(calibrateIntelligenceCase(s,graph,sharedCase).failures,0)
const otherCase=buildResearchCaseFile(s,graph,'10000002')!
const comparison=compareStudyContexts(s,graph,sharedCase,otherCase)
assert.equal(comparison.compatibleForEvidenceSynthesis,false,
  'Similar abstracts may never automatically imply evidence comparability')
const wrongCase={...sharedCase,sourceSignature:'forged-source-signature'}
assert.throws(()=>buildScientificIntelligenceCase(s,graph,wrongCase),
  /source identity mismatch|Source signature conflict/,
  'All twelve capability receipts reject stale or forged source signatures')
assert.throws(()=>buildScientificIntelligenceCase(s,graph,
  {...sharedCase,reviewedCitationIds:['forged-reviewed-citation']}),
  /source identity mismatch/, 'Forged reviewed citation identity must fail closed')
assert.throws(()=>buildScientificIntelligenceCase(s,graph,
  {...sharedCase,relatedPapers:[{pmid:'99999999',sharedConcepts:[],explanation:'fake'}]}),
  /source identity mismatch/, 'Fabricated semantic neighbor must fail closed')
assert.throws(()=>compileClaimDNA(s,graph,{...sharedCase,pmid:'90000001'}),
  /source identity mismatch/,
  'Unknown PMIDs must fail closed')
for(const source of sources){
  const file=buildResearchCaseFile(s,graph,source.pmid)!
  const result=buildScientificIntelligenceCase(s,graph,file)
  assert.equal(result.capabilities.length,12)
  assert.equal(result.calibrationFailures,0)
  assert.equal(result.clinicalPromotions,0)
  assert.equal(result.autopublished,0)
}

assert.equal(sharedCase.status,'source-discovery-only-no-clinical-adjudication')
assert.equal(sharedCase.instruments.length,8,'All instruments must receive the same governed source identity')
assert.deepEqual(sharedCase.instruments.map(x=>x.instrument),
 ['dna','contradictions','frontier','time','voyages','safety','ask','reactor'])
assert.equal(sharedCase.instruments.find(x=>x.instrument==='dna')?.linkedItems,1)
assert.equal(sharedCase.instruments.find(x=>x.instrument==='contradictions')?.linkedItems,0,
 'Reviewed citations lacking exact publication identity cannot be inferred as matches')
const exactJoined=buildResearchIntelligenceStudio(sources,graph,[{...reviewed[0],pmid:'10000001'}])
const reviewedExample={...reviewed[0],pmid:'10000001',relationships:[
 {...reviewed[0].relationships[0],dose:'400 mg experimental exposure',duration:'6 weeks',
  result:'Reviewed directional descriptor remains subject to editorial policy'}]}
const reviewedCase=buildResearchCaseFile(
 buildResearchIntelligenceStudio(sources,graph,[reviewedExample]),graph,'10000001')!
const claimsWithReviewed=compileReviewedClaimFacets(
 buildResearchIntelligenceStudio(sources,graph,[reviewedExample]),graph,reviewedCase,
 [reviewedExample,reviewed[1]])
assert.equal(claimsWithReviewed.length,1,'Only exact-PMID reviewed evidence can enrich Claim DNA')
assert.equal(claimsWithReviewed[0].citationId,'study-a')
assert.equal(claimsWithReviewed[0].studiedDose,'400 mg experimental exposure')
assert.equal(claimsWithReviewed[0].isClinicalPublicationApproved,false)
assert.throws(()=>compileReviewedClaimFacets(
 buildResearchIntelligenceStudio(sources,graph,[reviewedExample]),graph,reviewedCase,
 [{...reviewedExample,pmid:'10000002'}]),/conflicts with exact source/,
 'A forged reviewed citation ID with the wrong source must fail closed')
assert.throws(()=>compileReviewedClaimFacets(
 buildResearchIntelligenceStudio(sources,graph,[reviewedExample]),graph,reviewedCase,
 [reviewedExample,reviewedExample]),/Duplicate exact reviewed citation/,
 'Duplicate citation IDs cannot double-count one reviewed source')
const priorQuarantined=source('41461240','Omega 3 retracted study','2025')
const knownBad={...priorQuarantined,doi:'10.1016/j.jad.2025.121055'}
const quarantineGraph=buildResearchSemanticNetwork([knownBad])
const quarantineStudio=buildResearchIntelligenceStudio([knownBad],quarantineGraph,[])
const quarantineCase=buildResearchCaseFile(quarantineStudio,quarantineGraph,knownBad.pmid)!
assert(scanResearchIntegrity(quarantineStudio,quarantineGraph,quarantineCase)
 .some(x=>x.id==='curated-retraction'&&x.severity==='hold'),
 'Exact audited retractions must be flagged in the source-linked Integrity Radar')
const quarantinedCalibration=calibrateIntelligenceCase(quarantineStudio,quarantineGraph,quarantineCase)
assert(quarantinedCalibration.failures>0,'Audited retractions must never display passing calibration')
assert(quarantinedCalibration.checks.some(x=>x.code==='integrity-release-hold'&&!x.passed))
assert.equal(quarantinedCalibration.publicationAllowed,false)
const exactCase=buildResearchCaseFile(exactJoined,graph,'10000001')
const sourceScope=buildResearchCaseScope(s,sharedCase)
assert.equal(sourceScope.status,'exact-source-linked-leads-only')
const allInstruments=['dna','contradictions','frontier','time','voyages','safety','ask','reactor'] as const
let transitions=0
for(const from of allInstruments)for(const to of allInstruments){
 const handoff=createResearchInstrumentHandoff(s,graph,sharedCase,from,to)
 const resolved=resolveResearchInstrumentHandoff(s,graph,handoff)
 assert.equal(resolved.scope.pmid,'10000001')
 assert.equal(resolved.caseFile.sourceSignature,sharedCase.sourceSignature)
 assert.deepEqual(resolved.caseFile.reviewedCitationIds,sharedCase.reviewedCitationIds)
 assert.equal(resolved.scope.status,'exact-source-linked-leads-only')
 transitions++
}
assert.equal(transitions,64,'All eight instruments must be able to exchange governed source context')
const validHandoff=createResearchInstrumentHandoff(s,graph,sharedCase,'dna','reactor')
assert.throws(()=>resolveResearchInstrumentHandoff(s,graph,{...validHandoff,pmid:'10000002'}),/cannot be verified/,
 'A source from another case must not be silently substituted')
assert.throws(()=>resolveResearchInstrumentHandoff(s,graph,{...validHandoff,sourceSignature:'forged'}),/cannot be verified/,
 'Source identity signatures must remain tamper-evident')
assert.throws(()=>resolveResearchInstrumentHandoff(s,graph,{...validHandoff,reviewedCitationIds:['unreviewed-test']}),/cannot be verified/,
 'Source navigation cannot manufacture reviewed citation identities')
assert.throws(()=>resolveResearchInstrumentHandoff(s,graph,{...validHandoff,conceptIds:['foreign-controlled-term']}),/cannot be verified/,
 'Source navigation cannot manufacture semantic concept membership')
assert.equal(sourceScope.pmid,'10000001')
assert.equal(sourceScope.debates.length,0,'Unlinked reviewed studies must stay outside source focus')
assert.equal(sourceScope.sourceYear,2023)
assert(sourceScope.frontiers.every(f=>f.samplePmids.includes('10000001')))
assert(sourceScope.safety.every(f=>f.pmids.includes('10000001')))
assert(sourceScope.investigations.every(f=>f.pmids.includes('10000001')))
assert(sourceScope.briefs.every(b=>b.pmids.includes('10000001')))
assert.deepEqual(traceCaseConceptPair(graph,'10000001','magnesium','sleep').map(x=>x.pmid),['10000001'])
assert.deepEqual(traceCaseConceptPair(graph,'10000001','magnesium','cognition'),[],
 'A source-scoped voyage must not import a remote PMID')
assert.deepEqual(traceCaseConceptPair(graph,'10000001','randomized','sleep'),[],
 'Method words cannot create a navigable clinical concept path')
const exactDebateStudio=buildResearchIntelligenceStudio(sources,graph,[{...reviewed[0],pmid:'10000001'},reviewed[1]])
const exactDebateCase=buildResearchCaseFile(exactDebateStudio,graph,'10000001')!
const exactDebateScope=buildResearchCaseScope(exactDebateStudio,exactDebateCase)
assert.equal(exactDebateScope.debates.length,1,
 'Only the exactly linked citation may connect a source to an editorial difference review')
assert.throws(()=>buildResearchCaseScope(exactDebateStudio,{...exactDebateCase,reviewedCitationIds:['study-b']}),/identity conflicts/,
 'A stale or fabricated citation ID must never silently contaminate the case context')
assert.deepEqual(exactCase?.reviewedCitationIds,['study-a'],
 'Exact verified publication identities must be traceable in case files')
assert.deepEqual(exactCase?.publicationIdentityBasis,['exact-pmid'])
assert(sharedCase.sourceWitnessCount>0)
assert(sharedCase.unresolvedFields.some(x=>x.includes('Population')))
assert.equal(buildResearchCaseFile(s,graph,'99999999'),null,
 'Unknown PMID cannot silently route to an unrelated paper')
const corruptedGraph={...graph,entries:{...graph.entries,
 ['10000001']:{...graph.entries['10000001'],sourceSignature:'stale'}}}
assert.throws(()=>buildResearchCaseFile(s,corruptedGraph,'10000001'),/does not match/,
 'Stale provenance must fail closed for cross-instrument case files')
assert.equal(s.publicationLineage.scope,'exact-publication-identifiers-only')
assert.equal(s.publicationLineage.independentlyVerifiedTrialUnits,null)
assert.equal(s.publicationLineage.matchedIntakePmids,0)
assert(s.debates.every(d=>d.underlyingTrialIndependence==='unknown-until-validated-registration-or-cohort-lineage'))
const identityCase=buildPublicationLineageReport(
 [{pmid:'10000001',doi:'10.1000/one'},{pmid:'10000002',doi:'10.1000/two'}],
 [
 {id:'citation-a',pmid:'10000001',doi:'https://doi.org/10.1000/one'},
 {id:'citation-alias',pmid:'10000001',doi:'doi:10.1000/one'},
 {id:'citation-review',doi:'10.1000/two'},
 {id:'citation-unrelated',pmid:'30000001',doi:'10.1000/other'},
 ])
assert.equal(identityCase.matchedIntakePmids,2)
assert.equal(identityCase.duplicateCitationGroups.length,1)
assert.deepEqual(identityCase.duplicateCitationGroups[0].studyIds,['citation-a','citation-alias'])
assert.equal(identityCase.reviewedRecordCount,4)
assert.equal(identityCase.unknownUnderlyingStudyIndependence,4)
assert.equal(identityCase.independentlyVerifiedTrialUnits,null)
assert.equal(identityCase.crossReferences.find(x=>x.intakePmid==='10000002')?.evidence,'exact-doi')
const conflicting=buildPublicationLineageReport(
 [{pmid:'10000001',doi:'10.1000/one'},{pmid:'10000002',doi:'10.1000/two'}],
 [{id:'conflicted-intake',pmid:'10000001',doi:'10.1000/two'},
  {id:'conflicted-citations-a',pmid:'40000001',doi:'10.1000/delta'},
  {id:'conflicted-citations-b',pmid:'40000001',doi:'10.1000/epsilon'}])
assert.equal(conflicting.matchedIntakePmids,0)
assert.equal(conflicting.duplicateCitationGroups.length,0)
assert(conflicting.identityConflicts.length>=2)
// A bad DOI on the same PMID must quarantine BOTH referenced citation IDs
// when the source DOI is unknown, rather than silently linking them both.
const quarantined=buildPublicationLineageReport(
 [{pmid:'10000001'}],
 [{id:'alias-one',pmid:'10000001',doi:'10.1000/one'},
  {id:'alias-two',pmid:'10000001',doi:'10.1000/two'}])
assert.equal(quarantined.identityConflicts.length,1)
assert.equal(quarantined.matchedIntakePmids,0)
assert.equal(quarantined.duplicateCitationGroups.length,0)
assert.throws(()=>buildPublicationLineageReport([{pmid:'10000001',doi:'10.1000/one'},
 {pmid:'10000002',doi:'10.1000/one'}],[]),/Duplicate DOI/)
assert.throws(()=>buildPublicationLineageReport([],[{id:'same',pmid:'10000001'},
 {id:'same',pmid:'20000001'}]),/conflicting source metadata/)
assert.equal(s.adjudication.reviewCount,0)
assert.equal(s.adjudication.autoPublished,false)
assert(s.dna.some(d=>d.sourceWitnesses.length>0),'Study DNA needs exact title/source anchors')
for(const d of s.dna){
 const original=sources.find(x=>x.pmid===d.pmid)!
 for(const w of d.sourceWitnesses){
   assert(verifyResearchSourceWitness(original,w),'Verbatim evidence must match title or abstract character offsets')
   assert(w.quote.length<=320)
   assert.equal(w.status,'unreviewed-verbatim-source-text')
 }
}
const sampleWitness=s.dna[0].sourceWitnesses[0]
assert(sampleWitness)
const reviewedEvent:ResearchAdjudicationEvent={
 eventId:'review-event-0001',witnessId:sampleWitness.id,
 sourceSignature:sampleWitness.sourceSignature,reviewerCode:'editor-test',
 recordedAt:'2026-10-08T14:00:00.000Z',priorEventId:null,
 decision:'needs-full-text',inspected:'bibliographic-title-or-abstract',
 rationale:'Source-text mention noted; full source inspection still required.'
}
const witnessList=s.dna.flatMap(d=>d.sourceWitnesses)
const ledger=validateResearchAdjudicationLedger({version:1,events:[reviewedEvent]},witnessList)
assert.equal(ledger.reviewCount,1)
assert.equal(ledger.autoPublished,false)
assert.throws(()=>validateResearchAdjudicationLedger({version:1,
  events:[{...reviewedEvent,sourceSignature:'stale-source'}]},witnessList),/stale or unknown/)
assert.throws(()=>validateResearchAdjudicationLedger({version:1,
  events:[reviewedEvent,{...reviewedEvent,eventId:'review-event-0002',
    recordedAt:'2026-10-08T14:01:00.000Z'}]},witnessList),/extend the prior/)
const replay=validateResearchAdjudicationLedger({version:1,events:[
  reviewedEvent,{...reviewedEvent,eventId:'review-event-0002',
    recordedAt:'2026-10-08T14:01:00.000Z',priorEventId:reviewedEvent.eventId,
    decision:'false-positive',rationale:'Second reviewer found this matched expression misleading.'}
]},witnessList)
assert.equal(replay.reviewCount,1)
assert.equal(replay.events.length,2)
assert.equal(replay.currentDecisions[0].decision,'false-positive')
assert.equal(s.sourceCount,6)
assert.equal(s.metrics.automaticallyPromotedClaims,0)
assert.equal(s.dna.length,6)
assert(s.dna[0].substancesMentioned.includes('Magnesium'))
assert(s.dna[0].outcomeMentions.includes('Sleep / insomnia'))
assert.equal(s.dna[0].grade,'ungraded-research-intake')
assert(s.dna[0].method==='Randomized controlled trial')
assert(s.dna[0].missing.some(x=>x.includes('Population')))
assert(s.debates.length===1,'Only documented same-ingredient same-outcome differing reviewed labels')
assert.equal(s.debates[0].status,'editorial-comparability-review-required')
assert.equal(s.debates[0].populationComparable,false)
assert(s.debates[0].directions.includes('supports')&&s.debates[0].directions.includes('no_clear_effect'))
assert.equal(s.debates[0].studies.length,2)
const samePublicationDifferentRecord={
 ...reviewed[0],id:'study-duplicate-record',
 relationships:[{...reviewed[0].relationships[0],relationship:'no_clear_effect' as const}],
}
const samePmid=buildResearchIntelligenceStudio(sources,graph,[reviewed[0],samePublicationDifferentRecord])
assert.equal(samePmid.debates.length,0,'Conflicting citation records with the same PMID cannot become an independent-study disagreement')
const unidentifiedPublication={
 ...reviewed[1],id:'study-unidentifiable',pmid:undefined,
}
const missingPmid=buildResearchIntelligenceStudio(sources,graph,[reviewed[0],unidentifiedPublication])
assert.equal(missingPmid.debates.length,0,'A missing identifier cannot prove a distinct publication')

assert.equal(s.safety.length,0,'Do not invent interactions from no evidence')
assert.equal(s.investigations.length,0,'No three-way source record; never stitch unrelated PMIDs into a clinical claim')
const triadSources=[source('10000007','Magnesium, sleep and adverse events','2025','This is merely a bibliographic phrase.')]
const triad=buildResearchIntelligenceStudio(triadSources,buildResearchSemanticNetwork(triadSources),[])
assert.equal(triad.investigations.length,1)
assert.deepEqual(triad.investigations[0].pmids,['10000007'])
assert.equal(triad.investigations[0].basis,'same-source-text-triple-mention')
assert(triad.briefs.some(b=>b.mode==='cross-instrument-review'&&
  b.pmids.length===1&&b.pmids[0]==='10000007'&&b.allowAutopublish===false))
const revisedSources=sources.map((r,i)=>i===0?{...r,title:r.title+' and adverse events'}:r)
assert.throws(()=>buildResearchIntelligenceStudio(revisedSources,graph,reviewed),/semantic witnesses are stale/,
  'Same PMIDs with altered source text must not inherit stale semantic concepts')
assert(s.timeline.some(x=>x.year===2023 && x.sources===1))
assert(s.timeline.some(x=>x.year===2023 && x.reviewedCitations===1))
assert(s.briefs.every(x=>x.allowAutopublish===false&&x.status==='draft-requires-qualified-editorial-review'))
const actualEvents=buildResearchIntelligenceStudio(sources,graph,reviewed,[
 {id:'grade-1',title:'Magnesium: C → B',path:'/compounds/magnesium/',occurredAt:'2026-09-30',summary:'Reviewed new source.'},
 {id:'bad',title:'Invalid',path:'https://example.com/',occurredAt:'2026-09-30',summary:'Not a site grade change.'},
])
assert(actualEvents.recordedChanges.length===1,'Only actual canonical editorial-grade-change events may enter time machine')
assert.equal(actualEvents.recordedChanges[0].basis,'explicit-editorial-grade-change-log')
assert(!s.recordedChanges.length,'No invented grade events without an authoritative log')
const narrowed=askResearchSources('magnesium',s,'10000001')
assert.deepEqual(narrowed.matches.map(m=>m.pmid),['10000001'])
assert(narrowed.retrievalNote.includes('Only selected PMID 10000001'))
assert.equal(askResearchSources('creatine',s,'10000001').matches.length,0,
 'A scoped query cannot return a stronger-looking match from another source')
const scopedOther=askResearchSources('creatine',s,'10000002')
assert.deepEqual(scopedOther.matches.map(m=>m.pmid),['10000002'])
const found=askResearchSources('magnesium sleep',s)
assert(found.understoodConcepts.includes('Magnesium'))
assert(found.matches.every(x=>s.dna.some(d=>d.pmid===x.pmid)))
assert.equal(found.matchMode,'all-concepts','Two-subject queries must prioritize papers matching BOTH concepts')
assert.deepEqual(found.unresolvedTerms,[])
const ambiguous=askResearchSources('magnesium sleep in kidney disease patients',s)
assert.equal(ambiguous.matchMode,'partial-concepts','Unindexed clinical population must prevent full-question claim')
assert(ambiguous.unresolvedTerms.some(x=>x.includes('kidney disease')))
assert(ambiguous.matches.every(m=>m.pmid==='10000001'),
  'Incomplete question still needs same-paper witnesses for known concepts')
assert(ambiguous.retrievalNote.includes('NOT the full question'))
const negated=askResearchSources('magnesium sleep without pregnancy',s)
assert.equal(negated.matchMode,'partial-concepts','Negation must never disappear')
assert(negated.unresolvedTerms.includes('without'))
const scaffold=askResearchSources('Which studies mention magnesium and sleep?',s)
assert.equal(scaffold.matchMode,'all-concepts')
assert.deepEqual(scaffold.unresolvedTerms,[])
assert(found.matches.every(m=>m.pmid==='10000001'),'No unrelated single-concept sources inside full-match results')
const partial=askResearchSources('creatine anxiety',s)
assert.equal(partial.matchMode,'partial-concepts','Disjoint subjects must never masquerade as full query results')
assert(partial.retrievalNote.includes('NOT matches to the full question'))
assert(!partial.matches.some(m=>m.pmid==='10000001'),'Only explicitly overlapping individual concepts allowed on fallback')
const unknown=askResearchSources('total unrelated nonsense',s)
assert.equal(unknown.matchMode,'no-concepts')
assert.equal(unknown.matches.length,0)
assert(found.warning.toLowerCase().includes('text match'))
assert(!askResearchSources('total unrelated nonsense',s).matches.length)
assert.deepEqual(explainSemanticVoyage(graph,'randomized','sleep'),[],'Method concept cannot witness semantic path')
assert.throws(()=>buildResearchIntelligenceStudio(sources.concat(sources[0]),graph,reviewed),/match graph PMIDs/)

// Exact pinned receipt corpus: every fingerprint and interactive link is grounded in a unique PMID.
const prefix='ops/enrichment-submissions/reconciliation/2026-10-07-enrichment-waves-7001-7500-efetch-verified-part-'
const rows=Array.from({length:5},(_,i)=>{
 const part=JSON.parse(readFileSync(prefix+'0'+(i+1)+'.json','utf8'))
 return part.rows as Array<{pmid:string,title:string,abstract:string,category:string,pub_type?:string,verified_journal?:string,verified_pub_date?:string,doi?:string}>
}).flat()
assert.equal(rows.length,500)
const inputs=rows.map(r=>({pmid:String(r.pmid),title:r.title,abstract:r.abstract,
 category:r.category,pubType:r.pub_type||'',journal:r.verified_journal||'',
 year:r.verified_pub_date?.match(/(?:19|20)\d{2}/)?.[0]||''}))
const realGraph=buildResearchSemanticNetwork(inputs)
const real=buildResearchIntelligenceStudio(inputs,realGraph,[])
assert.equal(real.systemVersion,'1.05')
const realScopeCase=buildResearchCaseFile(real,realGraph,real.dna[0].pmid)!
const realScope=buildResearchCaseScope(real,realScopeCase)
assert.equal(realScope.pmid,real.dna[0].pmid)
assert.deepEqual(realScope.debates,[],'Research-only 500-PMID corpus cannot invent clinical disagreements')
assert(realScope.frontiers.every(f=>f.samplePmids.includes(realScope.pmid)))
assert(realScope.safety.every(f=>f.pmids.includes(realScope.pmid)))
const liveCase=buildResearchCaseFile(real,realGraph,real.dna[0].pmid)
assert(liveCase&&liveCase.sourceSignature===realGraph.entries[liveCase.pmid].sourceSignature)
assert.equal(liveCase.instruments.length,8)
assert.equal(liveCase.reviewedCitationIds.length,0,
 'Source-only verified intake must not invent reviewed publication identities')
// Every admitted source—not merely the fixture PMIDs—must be reachable in
// every instrument through the same source-verified read-only handoff contract.
let fullyReachable=0
for(const record of real.dna){
 const caseFile=buildResearchCaseFile(real,realGraph,record.pmid)
 assert(caseFile,'Every exact-verified PMID must have an eight-instrument case')
 const scope=buildResearchCaseScope(real,caseFile)
 assert.equal(caseFile.instruments.length,8)
 assert.equal(scope.pmid,record.pmid)
 assert(scope.frontiers.every(x=>x.samplePmids.includes(record.pmid)))
 assert(scope.safety.every(x=>x.pmids.includes(record.pmid)))
 assert(scope.investigations.every(x=>x.pmids.includes(record.pmid)))
 assert(scope.briefs.every(x=>x.pmids.includes(record.pmid)))
 const handoff=createResearchInstrumentHandoff(real,realGraph,caseFile,'dna','reactor')
 const received=resolveResearchInstrumentHandoff(real,realGraph,handoff)
 assert.equal(received.caseFile.pmid,record.pmid)
 assert.equal(received.caseFile.sourceSignature,realGraph.entries[record.pmid].sourceSignature)
 assert.equal(received.scope.pmid,record.pmid)
 assert.deepEqual(received.caseFile.reviewedCitationIds,[])
 const scienceCase=buildScientificIntelligenceCase(real,realGraph,caseFile)
 assert.equal(scienceCase.pmid,record.pmid)
 assert.equal(scienceCase.capabilities.length,12)
 assert.equal(scienceCase.calibrationChecks,13)
 assert.equal(scienceCase.calibrationFailures,0)
 assert.equal(scienceCase.autopublished,0)
 fullyReachable++
}
assert.equal(fullyReachable,500,'All 500 exact verified sources must share the same instrument identity contract')
assert.equal(real.metrics.quotedTextWitnesses,real.dna.reduce((sum,d)=>sum+d.sourceWitnesses.length,0))
assert.equal(real.adjudication.reviewCount,0)
assert(real.dna.flatMap(d=>d.sourceWitnesses).every(w=>w.quote.length<=320))
for(const d of real.dna){
 const source=inputs.find(x=>x.pmid===d.pmid)!
 assert(d.sourceWitnesses.every(w=>verifyResearchSourceWitness(source,w)))
}
assert.equal(real.metrics.fingerprints,500)
assert.equal(new Set(real.dna.map(x=>x.pmid)).size,500)
assert.equal(real.debates.length,0,'Ungraded intake alone cannot produce directional contradictions')
assert.equal(real.metrics.automaticallyPromotedClaims,0)
assert(real.briefs.every(x=>x.allowAutopublish===false))
assert(real.frontiers.every(x=>x.status==='catalog-coverage-question-not-global-research-gap'))
assert(real.safety.every(x=>x.status==='not-an-established-interaction-or-risk-assessment'))
assert(real.investigations.every(t=>t.status==='review-only-no-efficacy-or-interaction-inference'&&t.pmids.every(p=>real.dna.some(d=>d.pmid===p))))
assert(real.dna.every(x=>x.grade==='ungraded-research-intake'&&x.sourceUrl.endsWith(x.pmid+'/')))
const page=readFileSync('app/research/intelligence/page.tsx','utf8')
const route=readFileSync('app/research/intelligence/dataset.json/route.ts','utf8')
const ui=readFileSync('app/research/intelligence/ResearchIntelligenceClient.tsx','utf8')
assert(page.includes("robots:{index:false,follow:true}"))
assert(route.includes("export const dynamic = 'force-static'"))
assert(route.includes('research-semantic-adjudications.json'),'Adjudications must come from governed local ledger')
assert(ui.includes('Inspect verbatim evidence trail')&&ui.includes('Prepare an editorial review packet'))
assert(ui.includes('Why this paper matched'),'Questions must expose original text witnesses')
assert(ui.includes('Publication identity ≠ independent study'))
assert(ui.includes('v.systemVersion!==\'1.05\''))
assert(ui.includes('buildIntegratedResearchCase(')&&ui.includes('traceCaseConceptPair(')&&
 ui.includes('createResearchInstrumentHandoff(')&&ui.includes('resolveResearchInstrumentHandoff(')&&
 ui.includes('caseFile?openCaseInstrument(s.id):navigate(s.id)')&&
 ui.includes('Semantically neighboring publications')&&ui.includes('inspectPmid(link.pmid)')&&
 ui.includes('Clear focus · explore all sources')&&ui.includes('visibleFrontiers.slice')&&
 ui.includes('visibleSafety.slice')&&ui.includes('visibleBriefs.slice')&&
 ui.includes('visibleDebates.slice')&&ui.includes('visibleInvestigations.slice')&&
 ui.includes('askResearchSources(query,data,focusPmid||undefined)')&&
 ui.includes("filter(d=>d.sources>0&&(!focusPmid||d.pmids.includes(focusPmid)))"),
 'All eight research instruments must actually respect the source focus and allow clearing it')
assert(ui.includes('integratedCase?.caseFile')&&ui.includes('openCaseInstrument(')&&
 ui.includes('Trace through eight instruments')&&ui.includes('Trace source')&&
 ui.includes('scrollIntoView')&&ui.includes("aria-live='polite'"),
 'All eight research instruments must share the PMID case-file workbench')
assert(ui.includes('Source-indexing review history'),'Review events must be inspectable and not just counted')
assert(route.includes('getResearchSourceRegister()')&&!route.includes('getPublicEvidenceDataset()'),
 'Second full evidence hydration in a static worker must be forbidden')
assert(route.includes('buildResearchIntelligenceStudio('))
assert(route.includes('getEvidenceChangeUpdates(40)'),'Use actual editorial grade-change receipts')
assert(ui.includes("fetch('/evidence/evidence-report/dataset.json'") &&
       ui.includes('hydrateResearchStudioWithPublishedEvidence('),
 'Use the existing static published evidence export for reviewed directions')
assert(ui.includes('data.recordedChanges'),'Time machine must show recorded grade events')
assert(ui.includes('filtered.slice(0,dnaVisible)') && ui.includes('setDnaVisible(n=>n+30)') &&
  ui.includes('filtered.length>dnaVisible'),
  'All 500 verified source fingerprints must be reachable through progressive pagination')
assert(!ui.includes('data.dna.slice(0,more?40:9)') && !ui.includes('data.dna.filter(d=>!search.trim()).slice(0,more?40:9)'),
  'Do not silently cap the source DNA catalog at 40 records')
assert(ui.includes("fetch('/research/intelligence/dataset.json'"))
assert(ui.includes('value')||ui.includes('data'))
for(const name of ['Study DNA','Contradiction Observatory','Knowledge Frontier','Evidence Time Machine',
'Semantic Voyages','Interaction Matrix','Ask the Evidence','Content Reactor']){
 assert(ui.includes(name),'UI missing instrument '+name)
}
assert(readFileSync('app/research/source-register/page.tsx','utf8').includes("href='/research/intelligence/'"))
assert(readFileSync('app/research/page.tsx','utf8').includes("href='/research/intelligence/'"))
// Relay 1.06: actual cross-instrument join logic must stay source-bound.
const titlePair=pickTraceableConceptPair(graph,sharedCase.pmid)
assert(titlePair&&traceCaseConceptPair(graph,sharedCase.pmid,titlePair[0],titlePair[1]).length===1,
 'A Voyages link must open a real PMID-local title-backed concept pair')
const nonTraceableReal=real.dna.find(d=>realGraph.entries[d.pmid].related.length>0&&
  !pickTraceableConceptPair(realGraph,d.pmid))
assert(nonTraceableReal,'Real 500 PMID snapshot should exercise nontraceable neighbors')
const nonTraceableCase=buildResearchCaseFile(real,realGraph,nonTraceableReal.pmid)!
const nonTraceableScope=buildResearchCaseScope(real,nonTraceableCase)
const blockedVoyageRelay=buildInstrumentRelay(real,realGraph,nonTraceableCase,nonTraceableScope)
assert(!blockedVoyageRelay.junctions.some(j=>j.to==='voyages'||j.from==='voyages'),
 'A neighbor alone cannot advertise a nonfunctional Voyages junction')
assert(ui.includes('pickTraceableConceptPair('),
 'The source-focused user interface must select the same traceable pair as the relay')
const sciencePanel=readFileSync('app/research/intelligence/ScientificIntelligencePanel.tsx','utf8')
const researchPrimitives=readFileSync('app/research/intelligence/ResearchIntelligencePrimitives.tsx','utf8')
assert(ui.includes('scienceTarget(id,data.graph,scientific.pmid)')&&
 ui.includes("target==='voyages'&&!pickTraceableConceptPair(graph,pmid)?'dna':target")&&
 sciencePanel.includes('onOpenCapability(cap.id)')&&
 sciencePanel.includes('Twelve connected research capabilities'),
 'Scientific capability handoffs must preserve identity and avoid untraceable Voyages destinations')
assert(ui.includes('ScientificIntelligencePanel')&&ui.includes('ResearchIntelligencePrimitives')&&
 researchPrimitives.includes('export function WitnessPanel')&&
 researchPrimitives.includes('export function Brief'),
 'Split client components must preserve scientific receipts and original editorial controls')
assert(Buffer.byteLength(ui,'utf8')<45*1024,
 'Research intelligence client entry must remain below hard 45KB source boundary')
const relay=buildInstrumentRelay(s,graph,sharedCase,sourceScope)
assert.equal(relay.pmid,sharedCase.pmid)
assert.equal(relay.status,'source-bound-no-clinical-synthesis')
assert(relay.junctions.length>=2,'DNA, chronology and Ask must interoperate for a known source')
assert(relay.junctions.some(x=>x.from==='dna'&&x.to==='time'&&x.basis==='source-year-membership'))
assert(relay.junctions.some(x=>x.from==='dna'&&x.to==='ask'&&x.basis==='source-concept-index'))
assert(relay.junctions.every(x=>x.pmid===sharedCase.pmid&&x.status==='research-navigation-only'))
assert.equal(new Set(relay.junctions.map(x=>x.id)).size,relay.junctions.length)
assert(!relay.junctions.some(x=>x.to==='contradictions'),
 'No auto joining an unrelated reviewed study by ingredient text alone')
assert.throws(()=>buildInstrumentRelay(s,graph,
 {...sharedCase,reviewedCitationIds:['fabricated-id']},sourceScope),
 /conflicts|identity|verified|exact/, 'Forged citation IDs must fail closed')
assert.throws(()=>buildInstrumentRelay(s,graph,sharedCase,{...sourceScope,pmid:'99999999'}),
 /exact source-bound/, 'Incompatible source handoff must fail closed')
assert.throws(()=>buildInstrumentRelay(s,{
 ...graph, entries:{...graph.entries,[sharedCase.pmid]:{
  ...graph.entries[sharedCase.pmid],sourceSignature:'forged-snapshot'}},
},sharedCase,sourceScope),/exact source-bound/, 'An altered semantic source signature must fail closed')
const reviewedNetwork={...graph,
 reviewedEdges:[...graph.reviewedEdges,{
  id:'reviewed:known',sourcePmid:sharedCase.pmid,subject:'magnesium',predicate:'mentions',object:'sleep',
  context:'Independently reviewed index description',evidenceType:'bibliographic',
  uncertainty:'not a treatment inference',reviewer:'test-reviewer',
  reviewedAt:'2026-10-08',batchId:'test-batch',provenance:'independent-scientific-review' as const,
 },{
  id:'reviewed:unrelated',sourcePmid:'10000002',subject:'creatine',predicate:'mentions',object:'cognition',
  context:'Another source',evidenceType:'bibliographic',uncertainty:'',
  reviewer:'test-reviewer',reviewedAt:'2026-10-08',batchId:'test-batch',
  provenance:'independent-scientific-review' as const,
 }],
 contradictions:[...graph.contradictions,{
  sourcePmid:sharedCase.pmid,flag:'Needs interpretation',
  reviewer:'test-reviewer',reviewedAt:'2026-10-08',batchId:'test-batch',
  provenance:'independent-scientific-review' as const,
 }],
}
const reviewedRelay=buildInstrumentRelay(s,reviewedNetwork,sharedCase,sourceScope)
assert.deepEqual(reviewedRelay.independentlyReviewed.edges.map(x=>x.id),['reviewed:known'])
assert.equal(reviewedRelay.independentlyReviewed.contradictionFlags.length,1)
assert.deepEqual(reviewedRelay.junctions,relay.junctions,
 'Independent review annotations cannot silently promote source-text paths into new navigational clinical claims')
assert(ui.includes('integratedCase?.relay')&&ui.includes('Cross-instrument source relay')&&
 ui.includes('Independent semantic review')&&ui.includes('Continue into '),
 'UI must render and navigate the exact-source relay and keep reviewed annotations distinct')
assert(!ui.includes('allowAutopublish: true'),'Relay must not authorize publishing')

// Semantic Fabric 1.07: strict downstream identity matching, no social/claim promotion.
const doiSources=sources.map(x=>({...x,doi:x.pmid==='10000001'?'10.5555/exact-synthetic-source':''}))
const doiGraph=buildResearchSemanticNetwork(doiSources)
const doiStudio=buildResearchIntelligenceStudio(doiSources,doiGraph,[])
const doiCase=buildResearchCaseFile(doiStudio,doiGraph,'10000001')!
const publisherObject={
 id:'social-exact-1',sourceUrl:'https://thehippiescientist.net/herbs/magnesium/',
 primarySourceUrl:'https://doi.org/10.5555/exact-synthetic-source',
 findingClaimId:'clm_exact001',primarySourceId:'src_exact001',
}
const linkedFabric=planResearchSemanticFabric(doiStudio,doiGraph,doiCase,[
 publisherObject,{...publisherObject,id:'unrelated-topic',primarySourceUrl:'https://doi.org/10.5555/other'},
 {...publisherObject,id:'lookalike-only',primarySourceUrl:'',sourceUrl:'https://thehippiescientist.net/herbs/magnesium/'},
])
assert.equal(linkedFabric.systemCapability,'semantic-fabric-1.07')
assert.equal(linkedFabric.sourcePmid,doiCase.pmid)
assert.equal(linkedFabric.sourceDoi,'10.5555/exact-synthetic-source')
assert.deepEqual(linkedFabric.distributionReviewTargets.map(x=>x.objectId),['social-exact-1'])
assert.equal(linkedFabric.distributionReviewTargets[0].sourceClaimId,'clm_exact001')
assert.equal(linkedFabric.distributionReviewTargets[0].status,'publication-matched-editorial-review-required')
assert.equal(linkedFabric.distributionReviewTargets[0].limitation,
 'same-publication-identity-does-not-prove-claim-support-or-independence')
assert.equal(linkedFabric.publicationAllowed,false)
assert.equal(linkedFabric.mutationAllowed,false)
assert(linkedFabric.instrumentHandoffs.length>=2)
assert.equal(linkedFabric.unresolvedChannels.some(x=>x.channel==='social'),false)
assert.equal(planResearchSemanticFabric(doiStudio,doiGraph,doiCase,[
 {...publisherObject,primarySourceUrl:'https://doi.org/10.5555/not-exact'},
]).distributionReviewTargets.length,0,'Theme and page overlap cannot bypass exact DOI')
assert.equal(planResearchSemanticFabric(doiStudio,doiGraph,doiCase,[
 {...publisherObject,findingClaimId:undefined},
]).distributionReviewTargets.length,0,'Unlinked claim identity must not be filled in by guessing')
assert.throws(()=>planResearchSemanticFabric(doiStudio,doiGraph,
 {...doiCase,sourceSignature:'forged'},[publisherObject]),/exact canonical source case/)
assert.throws(()=>planResearchSemanticFabric(doiStudio,doiGraph,doiCase,[
 publisherObject,{...publisherObject,id:'social-exact-1',primarySourceUrl:'https://doi.org/10.5555/other'}
]),/conflicting DOI identity/)
assert.equal(planResearchSemanticFabric(doiStudio,doiGraph,
 buildResearchCaseFile(doiStudio,doiGraph,'10000002')!,[publisherObject])
 .distributionReviewTargets.length,0,'No same-PMID or unrelated-paper cross-talk')
// P0 review handoff: the already integrated eight + twelve instruments and
// Semantic Fabric must agree on a single source, never a clinical or
// publication authority. This is a synthesized exact-DOI *review* fixture.
const handoffObject={
 ...publisherObject,
}
const integratedReview=buildIntegratedResearchCase(doiStudio,doiGraph,'10000001',[
 handoffObject,{...publisherObject,id:'other',primarySourceUrl:'https://doi.org/10.5555/unrelated'},
])
assert(integratedReview,'Known exact PMID must produce integrated review-only case')
assert.equal(integratedReview.caseFile.instruments.length,8)
assert.equal(integratedReview.scientific.capabilities.length,12)
const packet=integratedReview.reviewRequest
assert.equal(packet.schemaVersion,1)
assert.equal(packet.kind,'research-editorial-review-request')
assert.equal(packet.source.pmid,'10000001')
assert.equal(packet.source.sourceSignature,doiGraph.entries['10000001'].sourceSignature)
assert.equal(packet.source.exactDoi,'10.5555/exact-synthetic-source')
assert.deepEqual(packet.reviewTargets.map(t=>t.objectId),['social-exact-1'])
assert.equal(packet.reviewTargets[0].existingClaimId,'clm_exact001')
assert.equal(packet.reviewTargets[0].existingCitationId,'src_exact001')
assert.equal(packet.reviewTargets[0].joinBasis,'exact-primary-doi-identity-only')
assert.equal(packet.reviewTargets[0].claimAdjudication,'not-established-by-this-envelope')
assert.equal(packet.reviewTargets[0].disposition,'qualified-human-editorial-review-required')
assert.equal(packet.status,'qualified-human-review-required')
assert.equal(packet.approvalAuthority,'not-provided')
assert.equal(packet.evidenceAuthority,'research-source-identity-only')
assert.equal(packet.underlyingTrialIndependence,'unknown')
assert.equal(packet.clinicalPromotions,0)
assert.equal(packet.publicationAllowed,false)
assert.equal(packet.mutationAllowed,false)
assert.deepEqual(packet.scientificCapabilityIds,SCIENCE_CAPABILITIES.map(x=>x.id))
assert.equal(packet.instrumentIds.length,8)
const approvedPacket=validateResearchEditorialReviewRequest(
 doiStudio,doiGraph,'10000001',[handoffObject],packet)
assert.deepEqual(approvedPacket,packet,'Consumer must reconstruct governed exact-source packet')
assert.deepEqual(buildIntegratedResearchCase(doiStudio,doiGraph,'10000001',
 [{...handoffObject,id:'social-exact-1'}])!.reviewRequest,packet,
 'Identical source, DOI and target identity must produce deterministic packets')
const tamper=(changes:Record<string,unknown>)=>({...packet,...changes})
for(const invalid of [
 tamper({schemaVersion:2}),
 tamper({source:{...packet.source,pmid:'10000002'}}),
 tamper({source:{...packet.source,sourceSignature:'forged'}}),
 tamper({source:{...packet.source,exactDoi:'10.5555/other'}}),
 tamper({source:{...packet.source,witnessIds:['forged-witness']}}),
 tamper({reviewTargets:[{...packet.reviewTargets[0],existingClaimId:'clm_other'}]}),
 tamper({reviewTargets:[{...packet.reviewTargets[0],existingCitationId:'src_other'}]}),
 tamper({reviewTargets:[{...packet.reviewTargets[0],exactPublicationDoi:'10.5555/other'}]}),
 tamper({reviewTargets:[{...packet.reviewTargets[0],claimAdjudication:'approved'}]}),
 tamper({status:'approved'}),
 tamper({approvalAuthority:'independently-reviewed'}),
 tamper({publicationAllowed:true}),
 tamper({mutationAllowed:true}),
 tamper({clinicalPromotions:1}),
 tamper({underlyingTrialIndependence:'yes'}),
 {...packet,approveForPublishing:true},
 ])assert.throws(()=>validateResearchEditorialReviewRequest(
 doiStudio,doiGraph,'10000001',[handoffObject],invalid),
 /packet source, version, target or permissions/,
 'A different source, claim, signature, DOI or permission must fail closed')
const packetWithoutClaim=buildIntegratedResearchCase(doiStudio,doiGraph,'10000001',[
 {...handoffObject,findingClaimId:undefined},
])!.reviewRequest
assert.equal(packetWithoutClaim.status,'held-no-exact-review-target')
assert.deepEqual(packetWithoutClaim.reviewTargets,[])
assert(packetWithoutClaim.heldReasons.length>0)
const wrongSource=buildIntegratedResearchCase(doiStudio,doiGraph,'10000002',[handoffObject])!.reviewRequest
assert.equal(wrongSource.status,'held-no-exact-review-target')
assert.deepEqual(wrongSource.reviewTargets,[])
assert.throws(()=>validateResearchEditorialReviewRequest(
 doiStudio,doiGraph,'10000002',[handoffObject],packet),
 /packet source, version, target or permissions/,
 'Cross-paper DOI/topic borrowing must fail closed')
const replacedSource=doiSources.map(x=>x.pmid==='10000001'
 ?{...x,abstract:x.abstract+' Corrected source text.'}:x)
const revisedGraph=buildResearchSemanticNetwork(replacedSource)
const revisedStudio=buildResearchIntelligenceStudio(replacedSource,revisedGraph,[])
assert.throws(()=>validateResearchEditorialReviewRequest(
 revisedStudio,revisedGraph,'10000001',[handoffObject],packet),
 /packet source, version, target or permissions/,
 'Changing source text invalidates a prior review packet even if DOI and target remain equal')

const manifestObjects=JSON.parse(readFileSync('data/distribution/research-objects.json','utf8')) as Array<{
 id:string;sourceUrl:string;primarySourceUrl?:string;findingClaimId?:string;primarySourceId?:string}>
const realFabric=planResearchSemanticFabric(real,realGraph,liveCase!,manifestObjects)
assert(realFabric.distributionReviewTargets.every(t=>
 real.dna.some(d=>d.pmid===realFabric.sourcePmid&&d.doi.trim().toLowerCase()===t.matchingDoi)))
assert.equal(realFabric.publicationAllowed,false)
assert(ui.includes('integratedCase?.fabric')&&ui.includes('Distribution review targets'),
 'Existing distribution objects must be joined in the visitor-facing source case')

console.log(JSON.stringify({pass:true,syntheticSources:6,syntheticReviewedDirectionCandidates:s.debates.length,
 exactVerifiedSources:500,allFingerprintPmidsUnique:true,coveredInstruments:8,
 sourceOnly:true,autoClinicalPromotions:0,autoPublications:0,
 staticExportRoute:true,observatoryLinked:true,
 measuredBibliographicTimelinePoints:real.timeline.length,
 localCatalogFrontierSignals:real.frontiers.length,
 sourceSafetyCoMentions:real.safety.length,
 exactPublicationCrosslinks:real.publicationLineage.matchedIntakePmids,
 observedDuplicateCitationGroups:real.publicationLineage.duplicateCitationGroups.length,
 preparedNonPublishingDrafts:real.briefs.length},null,2))
