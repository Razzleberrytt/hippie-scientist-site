import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {buildResearchSemanticNetwork} from '../../lib/research-semantic-network'
import {buildPublicationLineageReport} from '../../lib/research-publication-lineage'
import {buildResearchCaseFile} from '../../lib/research-intelligence-casefile'
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

assert.equal(s.systemVersion,'1.04')
const sharedCase=buildResearchCaseFile(s,graph,'10000001')
assert(sharedCase,'Known source must open a shared case file')
assert.equal(sharedCase.pmid,'10000001')
assert.equal(sharedCase.status,'source-discovery-only-no-clinical-adjudication')
assert.equal(sharedCase.instruments.length,8,'All instruments must receive the same governed source identity')
assert.deepEqual(sharedCase.instruments.map(x=>x.instrument),
 ['dna','contradictions','frontier','time','voyages','safety','ask','reactor'])
assert.equal(sharedCase.instruments.find(x=>x.instrument==='dna')?.linkedItems,1)
assert.equal(sharedCase.instruments.find(x=>x.instrument==='contradictions')?.linkedItems,0,
 'Reviewed citations lacking exact publication identity cannot be inferred as matches')
const exactJoined=buildResearchIntelligenceStudio(sources,graph,[{...reviewed[0],pmid:'10000001'}])
const exactCase=buildResearchCaseFile(exactJoined,graph,'10000001')
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
assert.equal(real.systemVersion,'1.04')
const liveCase=buildResearchCaseFile(real,realGraph,real.dna[0].pmid)
assert(liveCase&&liveCase.sourceSignature===realGraph.entries[liveCase.pmid].sourceSignature)
assert.equal(liveCase.instruments.length,8)
assert.equal(liveCase.reviewedCitationIds.length,0,
 'Source-only verified intake must not invent reviewed publication identities')
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
assert(ui.includes('v.systemVersion!==\'1.04\''))
assert(ui.includes('buildResearchCaseFile(')&&ui.includes('openCaseInstrument(')&&
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
