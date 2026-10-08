import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildResearchIntelligenceSuite,
  askSourceInventory,
  findIntelligenceVoyage,
} from '../../lib/research-intelligence-suite'
import { buildResearchSemanticNetwork } from '../../lib/research-semantic-network'

const papers=[
  {pmid:'10000001',title:'Passiflora incarnata improves anxiety in healthy adults',abstract:'A preliminary exploratory report.',year:'2022',journal:'Example',category:'stress_anxiety',pubType:'Journal Article'},
  {pmid:'10000002',title:'Passiflora incarnata does not improve anxiety in older adults',abstract:'No clinical conclusion is inferred.',year:'2024',journal:'Example',category:'stress_anxiety',pubType:'Journal Article'},
  {pmid:'10000003',title:'Passiflora incarnata and adverse events: systematic review',abstract:'This paper includes several contextual citations.',year:'2023',journal:'Example',category:'safety_interactions',pubType:'Systematic Review'},
  {pmid:'10000004',title:'Rhodiola and oxidative stress',abstract:'No direct medical conclusion may be drawn.',year:'2021',journal:'Example',category:'botanicals_mushrooms',pubType:'Journal Article'},
  {pmid:'10000005',title:'Unrelated review of lunar geology',abstract:'Completely unrelated geological science.',year:'',journal:'Example',category:'unrelated',pubType:'Journal Article'},
]
const network=buildResearchSemanticNetwork(papers)
const data=buildResearchIntelligenceSuite(papers,network)
assert.equal(data.research_only,true)
assert.equal(data.admission,'none')
assert.equal(data.summary.inspected,5)
assert.equal(data.summary.automaticallyApprovedClaims,0)
assert.equal(new Set(data.studies.map(x=>x.pmid)).size,5)
assert.equal(data.years.reduce((sum,y)=>sum+y.count,0),5)
assert(data.years.some(x=>x.year==='Unknown'&&x.count===1))
assert(data.coverage.some(c=>c.id==='passionflower'&&c.safetyContext.some(x=>x.id==='adverse-events')))
const wording=data.wordingCandidates
assert(wording.some(x=>x.pmids.includes('10000001')&&x.pmids.includes('10000002')&&x.status==='requires-human-examination'))
assert(wording.every(x=>x.reason.includes('Check population')))
assert(!wording.some(x=>x.pmids.includes('10000004')&&x.pmids.includes('10000001')))
assert(!data.studies.find(s=>s.pmid==='10000004')!.outcomeSignals.includes('Psychological stress'),'Never conflate oxidative and psychological stress')
assert(data.opportunities.every(x=>x.workflow==='human-editorial-review-required'&&x.pmids.every(p=>network.entries[p])))
assert(data.coverage.every(c=>c.note.includes('not global research coverage')))
const query=askSourceInventory('passionflower anxiety',data,12)
assert(query.matches.some(x=>x.pmid==='10000001'))
assert(query.matches.every(x=>x.concepts.some(c=>c.id==='passionflower') &&
  x.concepts.some(c=>c.id==='anxiety')),
  'Conjunctive concept retrieval must not mix papers on different topics into one synthesized answer')
assert(!query.matches.some(x=>x.pmid==='10000004'), 'Oxidative stress article must not leak into passionflower/anxiety intersection')
assert(query.matches.every(x=>network.entries[x.pmid]))
assert(query.message.includes('not an answer'))
const noHit=askSourceInventory('qzxvf lunar unicorn unrelated', {studies:[papers[4]].map(x=>data.studies.find(y=>y.pmid===x.pmid)!)})
assert(noHit.matches.length===0 || noHit.matches.every(x=>x.pmid==='10000005'))
assert(noHit.message.includes('not proof')||noHit.message.includes('not an answer'))
assert.deepEqual(findIntelligenceVoyage(data,'randomized','sleep'),[], 'Do not path through method concepts')
assert.throws(()=>buildResearchIntelligenceSuite(papers.slice(0,3),network),/complete unique/)
assert.throws(()=>buildResearchIntelligenceSuite([papers[0],papers[0],...papers.slice(2)],network),/complete unique/)

// Immutable 500-paper real source-batch audit; this MUST NOT infer claims or
// import unmerged candidate research, historical PMID-only records or other grades.
const prefix='ops/enrichment-submissions/reconciliation/2026-10-07-enrichment-waves-7001-7500-efetch-verified-part-'
const raw=Array.from({length:5},(_,i)=>{
 const f=JSON.parse(readFileSync(prefix+'0'+(i+1)+'.json','utf8'))
 return f.rows as Array<{pmid:string,title:string,abstract:string,category:string,pub_type?:string,verified_pub_date?:string,pub_date?:string,verified_journal?:string,journal?:string}>
}).flat()
assert.equal(raw.length,500)
const records=raw.map(row=>({
 pmid:String(row.pmid),title:row.title,abstract:row.abstract,category:row.category,
 pubType:row.pub_type||'',year:(row.verified_pub_date||row.pub_date||'').match(/(?:19|20)\d{2}/)?.[0]||'',
 journal:row.verified_journal||row.journal||'',
}))
const complete=buildResearchSemanticNetwork(records)
const suite=buildResearchIntelligenceSuite(records,complete)
assert.equal(suite.summary.inspected,500)
assert.equal(suite.summary.fingerprinted,500)
assert.equal(suite.years.reduce((n,x)=>n+x.count,0),500)
assert.equal(suite.summary.automaticallyApprovedClaims,0)
assert(suite.summary.conceptCount>12)
assert(suite.studies.every(s=>/^https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/\d+\/$/.test(s.sourceHref)))
assert(suite.studies.every(s=>s.reviewedSourceOverlap===0),'No graded dataset identities supplied; never invent overlap')
assert(suite.opportunities.every(x=>x.workflow==='human-editorial-review-required'))
assert(suite.wordingCandidates.every(x=>x.status==='requires-human-examination'&&x.pmids.every(id=>complete.entries[id])))
const file=readFileSync('app/research/intelligence/dataset.json/route.ts','utf8')
const ui=readFileSync('app/research/intelligence/IntelligenceLab.tsx','utf8')
const page=readFileSync('app/research/intelligence/page.tsx','utf8')
assert(file.includes("export const dynamic = 'force-static'"))
assert(file.includes('getResearchSourceRegister()'))
assert(file.includes("suite.admission !== 'none'"))
assert(ui.includes('Activate the eight instruments') && ui.includes('askSourceInventory('))
for(const id of ['dna','contradictions','frontier','timeline','voyages','safety','ask','reactor']) assert(ui.includes("id:'"+id+"'"),'Missing navigation: '+id)
assert(page.includes("robots:{index:false,follow:true}"))
assert(page.includes('totalIndexedPmids={source.totalIndexedPmids}'))
assert(!file.includes('recommendations: true'))
// Regression: every copied editorial source must actually mention the named angle.
// A generic same-substance list was previously misrepresented as supporting both
// Vitamin D × Mood and Vitamin D / Children, despite zero matching angle terms.
for(const idea of suite.opportunities){
  assert(idea.pmids.length>0,'Every review brief must carry source receipts')
  const [kind,substance]=idea.id.split(':')
  if(!['context','population','safety'].includes(kind))continue
  const row=suite.coverage.find(x=>x.id===substance)!
  const facet=kind==='context'?row.outcomes[0]:kind==='population'?row.populations[0]:row.safetyContext[0]
  const facetKind=kind==='context'?'outcome':kind
  for(const pmid of idea.pmids){
    const src=suite.studies.find(x=>x.pmid===pmid)!
    assert(src.concepts.some(m=>m.kind==='substance'&&m.id===substance),
      'Brief witness must mention source substance: '+idea.id+' / '+pmid)
    assert(src.concepts.some(m=>m.kind===(facetKind==='safety'?'safety':facetKind)&&m.id===facet.id),
      'Brief witness must mention exact editorial facet: '+idea.id+' / '+pmid)
  }
}
console.log(JSON.stringify({
 passed:true,verifiedRecords:500,
 activeConcepts:suite.summary.conceptCount,coverageSubstances:suite.coverage.length,
 wordingReviewCandidates:suite.wordingCandidates.length,
 safetyContextRows:suite.summary.safetyContextRows,
 editorialReviewIdeas:suite.summary.editorialIdeas,
 publicationYears:suite.summary.yearsCovered,
 automaticClinicalApprovals:0,
 instruments:8,
 staticExport:true,
},null,2))
