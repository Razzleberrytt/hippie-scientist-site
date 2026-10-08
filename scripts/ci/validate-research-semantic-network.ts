import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildResearchSemanticNetwork,extractSemanticMentions,RESEARCH_CONCEPTS,findExplainableConceptPath } from '../../lib/research-semantic-network'

function synthetic(pmid:string,title:string,category:string,abstract='No clinical conclusions have been evaluated.') {
  return {pmid,title,category,abstract,pubType:'Journal Article'}
}
const corpus=[
  synthetic('10000001','Randomized study of Passiflora incarnata and anxiety','stress_anxiety'),
  synthetic('10000002','Passionflower and sleep quality review','sleep'),
  synthetic('10000003','Randomized study of a generic surgical technique','stress_anxiety'),
  synthetic('10000004','Meta-analysis of education intervention','cognition_focus'),
  synthetic('10000005','Unrelated sociological analysis','mood'),
  synthetic('10000006','Randomized trial assessing magnesium for insomnia','sleep'),
]
const network=buildResearchSemanticNetwork(
  corpus,
  [{name:'Passiflora incarnata',href:'/herbs/passiflora-incarnata/'}],
  [{pmid:'10000001',id:'pub-studY-1'},{pmid:'10000099',id:'unrelated'}],
)
assert.equal(network.summary.sourcePapers,6)
assert.equal(network.summary.activeConcepts>3,true)
const a=network.entries['10000001']
assert(a.mentions.some(m=>m.id==='passionflower'&&m.basis==='title'))
assert(a.profiles.some(m=>m.href==='/herbs/passiflora-incarnata/'&&m.basis==='title'))
assert.equal(network.summary.reviewedSourceOverlap,1,'One precise source identity should be cross-referenced')
assert.deepEqual(a.reviewedCitations,[{studyId:'pub-studY-1',href:'/learn/citation-explorer/#study-pub-study-1',basis:'exact-pmid'}])
assert.equal(network.entries['10000002'].reviewedCitations.length,0,'No inference across related papers')
assert(a.related.some(m=>m.pmid==='10000002'&&m.crossTopic&&m.sharedConcepts.includes('Passionflower')))
assert(!a.related.some(m=>m.pmid==='10000003'),'method overlap alone must not connect studies')
assert(!network.entries['10000002'].profiles.some(m=>m.name==='Passiflora incarnata'),'profile link requires exact title string')
assert.equal(network.entries['10000005'].related.length,0,'isolated papers must remain isolated')
const witnessPath=findExplainableConceptPath(network,'anxiety','sleep')
assert.equal(witnessPath.length,2,'Expected direct source-verified two-hop concept path')
assert(witnessPath.every(step=>network.entries[step.pmid]&&step.explanation.includes('co-mention')))
assert.equal(findExplainableConceptPath(network,'randomized','sleep').length,0,'Method-only hops forbidden')
assert.equal(findExplainableConceptPath(network,'anxiety','sleep',1).length,0,'Respect bounded depth')
assert(!extractSemanticMentions('The sleeping algorithm','No relevant data').some(m=>m.id==='sleep'),
  'token boundaries should prevent accidental substring relations')
assert(!extractSemanticMentions('Oxidative stress during exercise','').some(m=>m.id==='stress'),
  'Oxidative stress must never map to psychological stress')
assert(extractSemanticMentions('Oxidative stress during exercise','').some(m=>m.id==='oxidative-stress'),
  'Oxidative stress must have a distinct concept')
assert(extractSemanticMentions('Perceived stress and sleep','').some(m=>m.id==='stress'),
  'Explicit perceived stress should match psychological stress')
assert(extractSemanticMentions('Cortisol and physical performance','').some(m=>m.id==='cortisol') &&
 !extractSemanticMentions('Cortisol and physical performance','').some(m=>m.id==='stress'),
 'Cortisol biomarker must not silently imply psychological stress')
const abstractOnly=buildResearchSemanticNetwork([
  synthetic('10000007','An unclassified trial','metabolic','Magnesium was referenced as context.'),
])
assert(abstractOnly.entries['10000007'].mentions.some(m=>m.id==='magnesium'&&m.basis==='abstract'))
assert(!abstractOnly.entries['10000007'].related.length)
assert.throws(()=>buildResearchSemanticNetwork([corpus[0],corpus[0]]),/duplicate PMIDs/)
assert(RESEARCH_CONCEPTS.every(c=>c.aliases.every(a=>a.length>=4)),'Reject ambiguous very-short concept aliases')

// Exercise the exact SHA-pinned production-research corpus through the same semantic builder.
const prefix='ops/enrichment-submissions/reconciliation/2026-10-07-enrichment-waves-7001-7500-efetch-verified-part-'
const rows=Array.from({length:5},(_,i)=>{
  const part=JSON.parse(readFileSync(prefix+'0'+(i+1)+'.json','utf8'))
  return part.rows as Array<{pmid:string,title:string,abstract:string,category:string,pub_type?:string}>
}).flat()
assert.equal(rows.length,500)
const full=buildResearchSemanticNetwork(rows.map(r=>({
  pmid:String(r.pmid),title:r.title,abstract:r.abstract,category:r.category,pubType:r.pub_type||'',
})))
assert.equal(Object.keys(full.entries).length,500)
assert(full.summary.activeConcepts>=15,'Controlled concept coverage unexpectedly low')
assert(full.summary.explainableEdges>0,'Expected explainable semantic edges')
assert(full.summary.crossTopicEdges>0,'Expected cross-topic links')
assert.equal(new Set(Object.keys(full.entries)).size,500)
assert.equal(full.summary.linkedProfiles,0,'No unverified profile identities were passed in test')
assert.equal(full.summary.reviewedSourceOverlap,0,'No public citation identities were passed in the full-corpus test')
for(const entry of Object.values(full.entries)){
  for(const rel of entry.related){
    assert(full.entries[rel.pmid],'All edges must target included exact-source PMIDs')
    assert(rel.sharedConcepts.length>0&&rel.score>0)
    assert(rel.explanation.includes('Text overlap only'),'Every edge must disclose non-clinical meaning')
  }
  for(const m of entry.mentions){
    assert(m.basis==='title'||m.basis==='abstract')
    assert(RESEARCH_CONCEPTS.some(c=>c.id===m.id))
  }
}
console.log(JSON.stringify({
  passed:true,controlledVocabulary:RESEARCH_CONCEPTS.length,verifiedSourceRecords:rows.length,
  activeConcepts:full.summary.activeConcepts,explainableEdges:full.summary.explainableEdges,
  crossTopicEdges:full.summary.crossTopicEdges,connectedPapers:full.summary.linkedPapers,
  unmatchedConceptPapers:full.summary.metadataOnlyPapers,
  evidencePromotions:0,syntheticEdgeProvenanceTests:'PASS'
},null,2))
