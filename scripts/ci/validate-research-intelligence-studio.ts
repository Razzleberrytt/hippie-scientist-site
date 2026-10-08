import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {buildResearchSemanticNetwork} from '../../lib/research-semantic-network'
import {buildResearchIntelligenceStudio,askResearchSources,explainSemanticVoyage} from '../../lib/research-intelligence-studio'

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
assert.equal(real.metrics.fingerprints,500)
assert.equal(new Set(real.dna.map(x=>x.pmid)).size,500)
assert.equal(real.debates.length,0,'Ungraded intake alone cannot produce directional contradictions')
assert.equal(real.metrics.automaticallyPromotedClaims,0)
assert(real.briefs.every(x=>x.allowAutopublish===false))
assert(real.frontiers.every(x=>x.status==='catalog-coverage-question-not-global-research-gap'))
assert(real.safety.every(x=>x.status==='not-an-established-interaction-or-risk-assessment'))
assert(real.dna.every(x=>x.grade==='ungraded-research-intake'&&x.sourceUrl.endsWith(x.pmid+'/')))
const page=readFileSync('app/research/intelligence/page.tsx','utf8')
const route=readFileSync('app/research/intelligence/dataset.json/route.ts','utf8')
const ui=readFileSync('app/research/intelligence/ResearchIntelligenceClient.tsx','utf8')
assert(page.includes("robots:{index:false,follow:true}"))
assert(route.includes("export const dynamic = 'force-static'"))
assert(route.includes('getResearchSourceRegister()')&&route.includes('getPublicEvidenceDataset()'))
assert(route.includes('buildResearchIntelligenceStudio('))
assert(route.includes('getEvidenceChangeUpdates(40)'),'Use actual editorial grade-change receipts')
assert(ui.includes('data.recordedChanges'),'Time machine must show recorded grade events')
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
 preparedNonPublishingDrafts:real.briefs.length},null,2))
