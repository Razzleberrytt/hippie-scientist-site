/**
 * Research Intelligence Suite — provenance-preserving READ-ONLY semantic projections.
 *
 * Scientific interpretation requires separately reviewed claim/outcome records.
 * These projections intentionally only report literal PubMed text mentions,
 * publication metadata, coverage INSIDE this pinned intake batch, and candidate
 * questions for human research review.
 *
 * Nothing in this file changes or derives efficacy/safety evidence grades.
 */
import {
  RESEARCH_CONCEPTS,
  normalizeSemanticText,
  findExplainableConceptPath,
  type SemanticMention,
  type SemanticNetwork,
  type SemanticRecord,
  type ConceptPathStep,
} from './research-semantic-network'

export type StudyDNA = {
  pmid: string
  title: string
  year: string
  journal: string
  category: string
  method: string
  concepts: SemanticMention[]
  populationSignals: string[]
  substanceSignals: string[]
  outcomeSignals: string[]
  safetySignals: string[]
  sourceHref: string
  reviewedSourceOverlap: number
  /** Scientific polarity is NOT determined. Title words are only a triage hint. */
  titleLanguage: 'positive-wording' | 'null-wording' | 'unclassified'
}
export type ResearchCoverage = {
  id: string
  label: string
  sourceMentions: number
  titleMentions: number
  outcomes: Array<{ id: string; label: string; count: number; sample: string[] }>
  populations: Array<{ id: string; label: string; count: number }>
  methods: Array<{ id: string; label: string; count: number }>
  safetyContext: Array<{ id: string; label: string; count: number; sample: string[] }>
  note: string
}
export type TitleWordingReviewCandidate = {
  concept: string
  outcome: string
  pmids: [string,string]
  titles: [string,string]
  reason: string
  /** Never named 'contradiction' because an actual comparable outcome was not examined. */
  status: 'requires-human-examination'
}
export type PublicationYearBin = { year: string; count: number; pmids: string[] }
export type SemanticEditorialOpportunity = {
  id: string
  angle: 'evidence-context' | 'safety-context' | 'population-context' | 'cross-topic'
  headline: string
  rationale: string
  pmids: string[]
  workflow: 'human-editorial-review-required'
}
export type ResearchIntelligenceData = {
  schema_version: 1
  research_only: true
  admission: 'none'
  scope: string
  limitation: string
  studies: StudyDNA[]
  coverage: ResearchCoverage[]
  wordingCandidates: TitleWordingReviewCandidate[]
  years: PublicationYearBin[]
  opportunities: SemanticEditorialOpportunity[]
  graph: SemanticNetwork
  summary: {
    inspected: number
    fingerprinted: number
    conceptCount: number
    yearsCovered: number
    sourceWordingCandidates: number
    safetyContextRows: number
    editorialIdeas: number
    automaticallyApprovedClaims: 0
  }
}

function titleWording(title:string): StudyDNA['titleLanguage'] {
  // Conservative local patterning. This is NOT a finding extractor.
  const t=normalizeSemanticText(title)
  const nullTerms=[
    /\bno statistically significant\b/,
    /\bno significant (?:effect|difference|association|improvement|change)\b/,
    /\bno (?:effect|difference|association|improvement|benefit)\b/,
    /\b(?:does not|did not|do not|failed to|not associated with)\b/,
  ]
  const positiveTerms=[
    /\b(?:improves?|improved|increases?|increased|reduces?|reduced|decreases?|decreased)\b/,
    /\b(?:benefits?|beneficial|enhances?|enhanced)\b/,
  ]
  if(nullTerms.some(p=>p.test(t)))return 'null-wording'
  if(positiveTerms.some(p=>p.test(t)))return 'positive-wording'
  return 'unclassified'
}
function conceptLabel(id:string){return RESEARCH_CONCEPTS.find(c=>c.id===id)?.label||id}
function countMentions(studies: StudyDNA[],kind:SemanticMention['kind']) {
  const counts=new Map<string,number>()
  for(const study of studies){
    for(const mention of study.concepts.filter(x=>x.kind===kind))
      counts.set(mention.id,(counts.get(mention.id)||0)+1)
  }
  return [...counts.entries()].map(([id,count])=>({id,label:conceptLabel(id),count}))
    .sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id))
}
function groups(studies:StudyDNA[],substance:string,kind:SemanticMention['kind']) {
  const counts=new Map<string,{count:number;sample:string[]}>()
  for(const paper of studies){
    const has=paper.concepts.some(m=>m.id===substance&&m.kind==='substance')
    if(!has)continue
    for(const mention of paper.concepts.filter(m=>m.kind===kind)){
      const entry=counts.get(mention.id)||{count:0,sample:[]}
      entry.count++
      if(entry.sample.length<4)entry.sample.push(paper.pmid)
      counts.set(mention.id,entry)
    }
  }
  return [...counts.entries()].map(([id,value])=>({id,label:conceptLabel(id),...value}))
    .sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id))
}
/** The only kind of safety matrix allowed here is TEXT CO-MENTION, never a suspected interaction. */
export function buildResearchIntelligenceSuite(
  records: readonly (SemanticRecord & {year?:string;journal?:string})[],
  graph: SemanticNetwork,
): ResearchIntelligenceData {
  const unique=new Set(records.map(r=>r.pmid))
  if(unique.size!==records.length ||
    graph.summary.sourcePapers!==records.length ||
    Object.keys(graph.entries).length!==records.length ||
    records.some(r=>graph.entries[r.pmid]?.pmid!==r.pmid)) {
    throw new Error('Research intelligence must bind to a complete unique source-verified graph')
  }
  const studies:StudyDNA[]=records.map(record=>{
    const e=graph.entries[record.pmid]
    const signal=(kind:SemanticMention['kind'])=>e.mentions.filter(m=>m.kind===kind).map(m=>m.label)
    return {
      pmid:record.pmid,
      title:record.title,
      year:record.year||'',
      journal:record.journal||'',
      category:record.category,
      method:e.methodTag,
      concepts:e.mentions,
      populationSignals:signal('population'),
      substanceSignals:signal('substance'),
      outcomeSignals:signal('outcome'),
      safetySignals:signal('safety'),
      reviewedSourceOverlap:e.reviewedCitations.length,
      titleLanguage:titleWording(record.title),
      sourceHref:'https://pubmed.ncbi.nlm.nih.gov/'+record.pmid+'/',
    }
  })

  const substanceCounts=countMentions(studies,'substance')
  const coverage:ResearchCoverage[]=substanceCounts.map(item=>{
    const papers=studies.filter(st=>st.concepts.some(m=>m.kind==='substance'&&m.id===item.id))
    const outcomes=groups(papers,item.id,'outcome')
    const populations=groups(papers,item.id,'population').map(({id,label,count})=>({id,label,count}))
    const methods=groups(papers,item.id,'method').map(({id,label,count})=>({id,label,count}))
    const safetyContext=groups(papers,item.id,'safety')
    return {
      id:item.id,label:item.label,sourceMentions:item.count,
      titleMentions:papers.filter(x=>x.concepts.some(m=>m.id===item.id&&m.basis==='title')).length,
      outcomes,populations,methods,safetyContext,
      note:'These are title/abstract mentions in this selected intake batch, not global research coverage or verified clinical associations.',
    }
  })

  // Pair only papers with identical title-mentioned SUBSTANCE + OUTCOME.
  // Even then, opposite *wording* does NOT establish a scientific contradiction.
  const wordingCandidates:TitleWordingReviewCandidate[]=[]
  const seenPairs=new Set<string>()
  const positive=studies.filter(s=>s.titleLanguage==='positive-wording')
  const negative=studies.filter(s=>s.titleLanguage==='null-wording')
  for(const pos of positive){
    const titleConcepts=new Set(pos.concepts.filter(m=>m.basis==='title').map(m=>m.id))
    for(const neg of negative){
      const negIds=new Set(neg.concepts.filter(m=>m.basis==='title').map(m=>m.id))
      const substance=pos.concepts.find(m=>m.kind==='substance'&&titleConcepts.has(m.id)&&negIds.has(m.id))
      const outcome=pos.concepts.find(m=>m.kind==='outcome'&&titleConcepts.has(m.id)&&negIds.has(m.id))
      if(!substance||!outcome)continue
      const key=[pos.pmid,neg.pmid].sort().join(':')+':'+substance.id+':'+outcome.id
      if(seenPairs.has(key))continue
      seenPairs.add(key)
      wordingCandidates.push({
        concept:substance.label,outcome:outcome.label,
        pmids:[pos.pmid,neg.pmid],titles:[pos.title,neg.title],
        reason:'Different title wording about a shared explicitly named substance and outcome. Check population, comparator, dose, statistical reporting and full results before considering contradiction.',
        status:'requires-human-examination',
      })
    }
  }
  wordingCandidates.sort((a,b)=>a.concept.localeCompare(b.concept)||a.pmids[0].localeCompare(b.pmids[0]))
  // Avoid manufacturing a contradiction from weak metadata: none is a valid answer.
  const yearMap=new Map<string,string[]>()
  for(const s of studies) {
    const y=/^(?:19|20)\d{2}$/.test(s.year)?s.year:'Unknown'
    yearMap.set(y,[...(yearMap.get(y)||[]),s.pmid])
  }
  const years=[...yearMap.entries()].map(([year,pmids])=>({year,count:pmids.length,pmids}))
    .sort((a,b)=>a.year==='Unknown'?1:b.year==='Unknown'?-1:Number(a.year)-Number(b.year))

  const opportunities:SemanticEditorialOpportunity[]=[]
  for(const c of coverage) {
    if(c.sourceMentions<2)continue
    const support=studies.filter(s=>s.concepts.some(m=>m.kind==='substance'&&m.id===c.id))
    const sample=support.slice(0,5).map(s=>s.pmid)
    if(c.outcomes.length>0){
      const goal=c.outcomes[0]
      opportunities.push({
        id:'context:'+c.id,angle:'evidence-context',
        headline:c.label+' × '+goal.label+': what was actually investigated?',
        rationale:c.sourceMentions+' papers mention '+c.label+'; '+goal.count+' co-mention '+goal.label+'. Verify study details before discussing any outcome.',
        pmids:sample,workflow:'human-editorial-review-required',
      })
    }
    if(c.safetyContext.length){
      const safety=c.safetyContext[0]
      const target=support.filter(s=>s.concepts.some(m=>m.kind==='safety'&&m.id===safety.id)).slice(0,5)
      opportunities.push({
        id:'safety:'+c.id,angle:'safety-context',
        headline:'Safety context watch: '+c.label+' / '+safety.label,
        rationale:safety.count+' source text mentions co-occur. Do not infer a confirmed risk or interaction.',
        pmids:target.map(s=>s.pmid),workflow:'human-editorial-review-required',
      })
    }
    if(c.populations.length) {
      const group=c.populations[0]
      opportunities.push({
        id:'population:'+c.id,angle:'population-context',
        headline:c.label+' in '+group.label.toLowerCase()+': evidence scope audit',
        rationale:'Check whether the named population was actually enrolled, analyzed or only cited as background.',
        pmids:sample,workflow:'human-editorial-review-required',
      })
    }
  }
  for(const bridge of graph.bridges.slice(0,12)) {
    opportunities.push({
      id:'bridge:'+bridge.pmid+':'+bridge.neighborPmid,angle:'cross-topic',
      headline:'Cross-topic reading path: '+bridge.sharedConcepts.join(' & '),
      rationale:'Catalog categories differ. This is a research navigation suggestion, not a cross-domain clinical inference.',
      pmids:[bridge.pmid,bridge.neighborPmid],workflow:'human-editorial-review-required',
    })
  }

  return {
    schema_version:1,research_only:true,admission:'none',
    scope:'SHA-pinned waves 7001–7500, 500 verified papers; not all scientific literature.',
    limitation:'A concept is a phrase match in source title/abstract. Wording, method and population labels are discovery cues only. No study result, scientific contradiction, drug interaction, causation, efficacy, safety, or treatment recommendation is inferred.',
    studies,coverage,wordingCandidates,years,opportunities,graph,
    summary:{
      inspected:records.length,fingerprinted:studies.length,
      conceptCount:graph.summary.activeConcepts,
      yearsCovered:years.filter(x=>x.year!=='Unknown').length,
      sourceWordingCandidates:wordingCandidates.length,
      safetyContextRows:coverage.reduce((n,c)=>n+c.safetyContext.length,0),
      editorialIdeas:opportunities.length,
      automaticallyApprovedClaims:0,
    },
  }
}

export type EvidenceInquiry = {
  query: string
  recognizedConcepts:string[]
  matches:StudyDNA[]
  message:string
  directReviewedOverlaps:number
}
/**
 * Deterministic "Ask the Evidence" intake search.
 * This intentionally NEVER generates a personalized clinical or effect claim.
 */
export function askSourceInventory(question:string,data:Pick<ResearchIntelligenceData,'studies'>,limit=8):EvidenceInquiry {
  const text=normalizeSemanticText(question).slice(0,240)
  if(!text)return {query:question,recognizedConcepts:[],matches:[],directReviewedOverlaps:0,message:'Enter a specific research question or a substance/outcome name.'}
  const tokens=new Set(text.split(' ').filter(x=>x.length>=4))
  const matchedConcepts=RESEARCH_CONCEPTS.filter(c=>
    c.aliases.some(alias=>{
      const n=normalizeSemanticText(alias)
      return n.length>=4 && (' '+text+' ').includes(' '+n+' ')
    })
  ).map(c=>c.id)
  const scores=data.studies.map(s=>{
    const ids=new Set(s.concepts.map(m=>m.id))
    const title=normalizeSemanticText(s.title)
    const overlap=matchedConcepts.filter(id=>ids.has(id))
    const titleWords=title.split(' ')
    const words=titleWords.filter(w=>tokens.has(w))
    const score=overlap.length*8+overlap.filter(id=>s.concepts.some(m=>m.id===id&&m.basis==='title')).length*5+words.length
    const coversAll=matchedConcepts.length===0||matchedConcepts.every(id=>ids.has(id))
    return {s,score,coversAll}
  }).filter(x=>x.score>0&&x.coversAll).sort((a,b)=>b.score-a.score||b.s.year.localeCompare(a.s.year)||a.s.pmid.localeCompare(b.s.pmid))
  const matches=scores.slice(0,Math.max(1,Math.min(20,limit))).map(x=>x.s)
  return {query:question,recognizedConcepts:matchedConcepts.map(conceptLabel),matches,
    directReviewedOverlaps:matches.reduce((n,s)=>n+s.reviewedSourceOverlap,0),
    message:matches.length
      ?'These research-source records mention all recognized concepts in the question (AND matching). A mention is not an answer about whether anything works or is safe. Inspect the primary papers and the separately reviewed Citation Explorer before drawing conclusions.'
      :'No records satisfy the recognized concept intersection in these 500 research-source entries. This is a search coverage result, not proof that research is absent or the concepts are unrelated.'}
}
export function findIntelligenceVoyage(data:ResearchIntelligenceData,from:string,to:string,maxHops=3):ConceptPathStep[] {
  return findExplainableConceptPath(data.graph,from,to,maxHops)
}
