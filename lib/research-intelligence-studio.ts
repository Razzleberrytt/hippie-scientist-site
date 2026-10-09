/**
 * The Hippie Scientist · Research Intelligence Studio
 *
 * Eight projections over TWO independent authorities:
 *   (1) research-only, SHA-pinned PubMed source receipts (discovery), and
 *   (2) separately reviewed public citation records (directional evidence).
 *
 * Source co-occurrence is NEVER promoted into a clinical finding, interaction,
 * relationship, treatment recommendation, or evidence grade. Every derived
 * output retains IDs, a precise basis, and visible missingness.
 * All algorithms are deterministic, local, bounded, and static-export friendly.
 */
import {buildPublicationLineageReport,type PublicationLineageReport} from './research-publication-lineage'
import {buildResearchSourceWitnesses,type ResearchSourceWitness} from './research-semantic-provenance'
import {validateResearchAdjudicationLedger,type ResearchAdjudicationEvent,type ResearchAdjudicationLedger} from './research-semantic-adjudication'
import {
  extractSemanticMentions, findExplainableConceptPath, RESEARCH_CONCEPTS,
  normalizeSemanticText, semanticSourceSignature, type SemanticNetwork, type SemanticMention,
} from './research-semantic-network'

export type StudioSource = {
  pmid: string
  title: string
  abstract: string
  journal: string
  year: string
  category: string
  pubType: string
  doi?: string
}
export type ReviewedStudyInput = {
  id: string
  pmid?: string
  doi?: string
  title: string
  year?: string | number
  evidenceClass: string
  relationships: Array<{
    ingredientSlug: string
    ingredientName: string
    ingredientPath: string
    relationship: 'supports' | 'mixed' | 'contradicts' | 'no_clear_effect' | 'background'
    outcome?: string
    population?: string
    duration?: string
    limitation?: string
  }>
}
export type ResearchDNA = {
  pmid: string
  doi: string
  title: string
  year: string
  category: string
  method: string
  methodBasis: 'pubmed-publication-type' | 'title-phrase' | 'unknown'
  comparator: string
  comparatorBasis: 'title-phrase' | 'abstract-phrase' | 'unknown'
  concepts: SemanticMention[]
  sourceWitnesses: ResearchSourceWitness[]
  populationMentions: string[]
  outcomeMentions: string[]
  substancesMentioned: string[]
  safetyMentions: string[]
  missing: string[]
  sourceUrl: string
  grade: 'ungraded-research-intake'
}
export type DebateCandidate = {
  id: string
  ingredient: string
  ingredientPath: string
  outcome: string
  studies: Array<{
    studyId: string
    pmid: string
    year: string
    relationship: 'supports' | 'mixed' | 'contradicts' | 'no_clear_effect'
    population: string
    duration: string
    evidenceClass: string
    href: string
  }>
  directions: string[]
  populationComparable: boolean
  underlyingTrialIndependence: 'unknown-until-validated-registration-or-cohort-lineage'
  basis: 'separately-reviewed-citation-relationships'
  status: 'editorial-comparability-review-required'
}
export type FrontierSignal = {
  id: string
  substance: string
  outcome: string
  substanceId: string
  outcomeId: string
  subjectPapers: number
  outcomePapers: number
  togetherInBatch: number
  samplePmids: string[]
  basis: 'batch-title-cooccurrence'
  status: 'catalog-coverage-question-not-global-research-gap'
}
export type SafetyMention = {
  id: string
  substance: string
  topic: string
  count: number
  pmids: string[]
  titleWitnesses: number
  basis: 'source-text-co-mention'
  status: 'not-an-established-interaction-or-risk-assessment'
}
export type SemanticInvestigationThread = {
  id: string
  substance: string
  outcome: string
  safetyTopic: string
  pmids: string[]
  titleTripleWitnesses: number
  basis: 'same-source-text-triple-mention'
  status: 'review-only-no-efficacy-or-interaction-inference'
}
export type PublicationTimeline = {
  year: number
  sources: number
  reviewedCitations: number
  pmids: string[]
}
export type DraftBrief = {
  id: string
  title: string
  mode: 'research-gap-brief' | 'evidence-divergence-review' | 'safety-literature-map' | 'cross-instrument-review'
  rationale: string
  pmids: string[]
  sourceStudyIds: string[]
  destination: '/research/intelligence/'
  status: 'draft-requires-qualified-editorial-review'
  allowAutopublish: false
}
export type RecordedEvidenceChange = {
  id: string
  title: string
  path: string
  occurredAt: string
  summary: string
  basis: 'explicit-editorial-grade-change-log'
}
export type ResearchStudio = {
  systemVersion: '1.05'
  recordedChanges: RecordedEvidenceChange[]
  adjudication: ResearchAdjudicationLedger
  publicationLineage: PublicationLineageReport
  schemaVersion: 1
  sourceWave: 7500
  sourceCount: number
  researchOnly: true
  dna: ResearchDNA[]
  debates: DebateCandidate[]
  frontiers: FrontierSignal[]
  safety: SafetyMention[]
  investigations: SemanticInvestigationThread[]
  timeline: PublicationTimeline[]
  briefs: DraftBrief[]
  metrics: {
    fingerprints: number
    classifiedMethods: number
    populationTagged: number
    reviewedDirectionalCandidates: number
    exactPublicationCrosslinks: number
    duplicatedCitationGroups: number
    publicationIdentityConflicts: number
    catalogCoverageQuestions: number
    safetyCoMentions: number
    sameSourceInvestigationThreads: number
    quotedTextWitnesses: number
    reviewedSourceMentions: number
    datedPublications: number
    preparedDrafts: number
    automaticallyPromotedClaims: 0
  }
}
const clip=(x:unknown,n=90)=>String(x??'').replace(/\s+/g,' ').trim().slice(0,n)
const safeYear=(y:unknown):number|null=>{
  const n=Number(String(y??'').trim())
  return Number.isInteger(n)&&n>=1850&&n<=2100?n:null
}
const pubmed=(pmid:string)=>'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/'
const evidenceHref=(id:string)=>'/learn/citation-explorer/#study-'+id.toLowerCase().replace(/[^a-z0-9]+/g,'-')
const publicationMethod=(text:string)=>{
  if(/meta.analysis/i.test(text))return 'Meta-analysis'
  if(/systematic review/i.test(text))return 'Systematic review'
  if(/randomi[sz]ed controlled/i.test(text))return 'Randomized controlled trial'
  if(/clinical trial/i.test(text))return 'Clinical trial'
  if(/cohort/i.test(text))return 'Cohort study'
  if(/observational/i.test(text))return 'Observational study'
  if(/case.control/i.test(text))return 'Case-control study'
  if(/case report/i.test(text))return 'Case report'
  return ''
}
const detectComparator=(value:string):string=>{
  const s=normalizeSemanticText(value)
  const tests:Array<[string,RegExp]>=[
    ['Placebo',/\bplacebo\b/],['Active comparator',/\bversus\b|\bcompared with\b|\bcompared to\b/],
    ['Control group',/\bcontrol group\b|\bcontrolled study\b/],
  ]
  return tests.find(([,p])=>p.test(s))?.[0]||''
}
function fingerprint(s:StudioSource,network:SemanticNetwork):ResearchDNA {
  const mentions=network.entries[s.pmid]?.mentions||extractSemanticMentions(s.title,s.abstract)
  const type=publicationMethod(s.pubType)
  const titleMethod=type?'':publicationMethod(s.title)
  const titleComparator=detectComparator(s.title)
  const abstractComparator=titleComparator?'':detectComparator(s.abstract)
  const kind=(k:string)=>mentions.filter(m=>m.kind===k).map(m=>m.label)
  const missing=[
    ...(type||titleMethod?[]:['Study design not explicitly identified']),
    ...(kind('population').length?[]:['Population not indexed by controlled vocabulary']),
    ...(titleComparator||abstractComparator?[]:['Comparator not identified by controlled phrases']),
    ...(kind('outcome').length?[]:['Outcome concept not indexed']),
  ]
  return {
    pmid:s.pmid,doi:s.doi||'',title:s.title,year:s.year,category:s.category,
    method:type||titleMethod||'Unclassified',
    methodBasis:type?'pubmed-publication-type':titleMethod?'title-phrase':'unknown',
    comparator:titleComparator||abstractComparator||'Not identified',
    comparatorBasis:titleComparator?'title-phrase':abstractComparator?'abstract-phrase':'unknown',
    concepts:mentions,sourceWitnesses:buildResearchSourceWitnesses(s,mentions),
    populationMentions:kind('population'),outcomeMentions:kind('outcome'),
    substancesMentioned:kind('substance'),safetyMentions:kind('safety'),
    missing,sourceUrl:pubmed(s.pmid),grade:'ungraded-research-intake',
  }
}
function debatesFromReviewed(studies:readonly ReviewedStudyInput[]):DebateCandidate[]{
  const groups=new Map<string,Array<{
    studyId:string;pmid:string;year:string;relationship:'supports'|'mixed'|'contradicts'|'no_clear_effect'
    population:string;duration:string;evidenceClass:string;href:string;ingredientName:string;ingredientPath:string;outcome:string
  }>>()
  for(const study of studies){
    if(!study.id)continue
    for(const rel of study.relationships){
      if(rel.relationship==='background'||rel.relationship==='mixed')continue
      const normalizedOutcome=normalizeSemanticText(rel.outcome||'')
      // Don't conflate glucose, anxiety, sleep and distinct endpoint measures.
      if(!normalizedOutcome||normalizedOutcome.length<6||normalizedOutcome.length>120||
         !rel.ingredientSlug||!/^\/(herbs|compounds)\/[a-z0-9/-]+\/?$/.test(rel.ingredientPath))continue
      const key=rel.ingredientSlug+'::'+normalizedOutcome
      const row={studyId:study.id,pmid:clip(study.pmid,12),
        year:String(safeYear(study.year)||''),relationship:rel.relationship,
        population:clip(rel.population),duration:clip(rel.duration),
        evidenceClass:study.evidenceClass,href:evidenceHref(study.id),
        ingredientName:rel.ingredientName,ingredientPath:rel.ingredientPath,outcome:clip(rel.outcome,120)}
      if(!groups.has(key))groups.set(key,[])
      if(!groups.get(key)!.some(x=>x.studyId===study.id))groups.get(key)!.push(row)
    }
  }
  const candidates:DebateCandidate[]=[]
  for(const [id,rows] of groups){
    // Different runtime citation IDs can reference the SAME PubMed publication.
    // Require distinct, valid PMIDs and fail closed when the same PMID has
    // conflicting editorial relationship descriptors. Distinct publications
    // still do not prove independent underlying trial cohorts.
    const byPmid=new Map<string,typeof rows>()
    for(const row of rows){
      if(!/^\d{5,10}$/.test(row.pmid))continue
      if(!byPmid.has(row.pmid))byPmid.set(row.pmid,[])
      byPmid.get(row.pmid)!.push(row)
    }
    const uniqueRows=[...byPmid.values()].filter(items=>
      new Set(items.map(row=>row.relationship)).size===1).map(items=>items[0])
    const direct=new Set(uniqueRows.map(r=>r.relationship))
    // "No clear effect" vs "supports" is a DIFFERENCE IN REPORTED RELATIONSHIP,
    // not automatically a contradiction; must be editorially adjudicated.
    if(uniqueRows.length<2||direct.size<2)continue
    const sorted=uniqueRows.slice().sort((a,b)=>b.year.localeCompare(a.year)||a.studyId.localeCompare(b.studyId))
    const populations=new Set(uniqueRows.map(r=>normalizeSemanticText(r.population)).filter(Boolean))
    candidates.push({id,ingredient:uniqueRows[0].ingredientName,ingredientPath:uniqueRows[0].ingredientPath,
      outcome:uniqueRows[0].outcome,
      studies:sorted.slice(0,12).map(({studyId,pmid,year,relationship,population,duration,evidenceClass,href})=>({
        studyId,pmid,year,relationship,population,duration,evidenceClass,href,
      })),
      directions:[...direct].sort(),
      populationComparable:populations.size===1 && uniqueRows.every(r=>r.population.length>0),
      underlyingTrialIndependence:'unknown-until-validated-registration-or-cohort-lineage',
      basis:'separately-reviewed-citation-relationships',
      status:'editorial-comparability-review-required'})
  }
  return candidates.sort((a,b)=>b.studies.length-a.studies.length||a.id.localeCompare(b.id)).slice(0,35)
}
function frontierFromDna(dna:readonly ResearchDNA[]):FrontierSignal[]{
  const substances=RESEARCH_CONCEPTS.filter(c=>c.kind==='substance')
  const outcomes=RESEARCH_CONCEPTS.filter(c=>c.kind==='outcome')
  const titleMentions=(id:string,p:ResearchDNA)=>p.concepts.some(m=>m.id===id&&m.basis==='title')
  const output:FrontierSignal[]=[]
  for(const sub of substances){
    const sps=dna.filter(p=>titleMentions(sub.id,p))
    if(sps.length<2)continue
    for(const out of outcomes){
      const ops=dna.filter(p=>titleMentions(out.id,p))
      if(ops.length<2)continue
      const together=sps.filter(p=>titleMentions(out.id,p))
      if(together.length>1)continue
      output.push({id:sub.id+':'+out.id,substance:sub.label,outcome:out.label,substanceId:sub.id,outcomeId:out.id,
        subjectPapers:sps.length,outcomePapers:ops.length,togetherInBatch:together.length,
        samplePmids:[...sps.slice(0,2).map(p=>p.pmid),...ops.slice(0,2).map(p=>p.pmid),...together.map(p=>p.pmid)]
          .filter((x,i,a)=>a.indexOf(x)===i),
        basis:'batch-title-cooccurrence',status:'catalog-coverage-question-not-global-research-gap'})
    }
  }
  return output.sort((a,b)=>(a.togetherInBatch-b.togetherInBatch)||
      (b.subjectPapers+b.outcomePapers-a.subjectPapers-a.outcomePapers)||a.id.localeCompare(b.id)).slice(0,40)
}
function safetyFromDna(dna:readonly ResearchDNA[]):SafetyMention[]{
  const grouped=new Map<string,SafetyMention>()
  for(const p of dna){
    const sm=p.concepts.filter(m=>m.kind==='substance')
    const sf=p.concepts.filter(m=>m.kind==='safety')
    for(const x of sm)for(const y of sf){
      const key=x.id+':'+y.id
      const current=grouped.get(key)||{
        id:key,substance:x.label,topic:y.label,count:0,pmids:[],titleWitnesses:0,
        basis:'source-text-co-mention' as const,
        status:'not-an-established-interaction-or-risk-assessment' as const,
      }
      current.count++
      if(current.pmids.length<6)current.pmids.push(p.pmid)
      if(x.basis==='title'&&y.basis==='title')current.titleWitnesses++
      grouped.set(key,current)
    }
  }
  return [...grouped.values()].sort((a,b)=>b.titleWitnesses-a.titleWitnesses||
    b.count-a.count||a.id.localeCompare(b.id)).slice(0,70)
}
function investigationsFromDna(dna:readonly ResearchDNA[]):SemanticInvestigationThread[]{
  const threads=new Map<string,SemanticInvestigationThread>()
  for(const paper of dna){
    const substances=paper.concepts.filter(m=>m.kind==='substance'&&m.basis==='title')
    const outcomes=paper.concepts.filter(m=>m.kind==='outcome')
    const safety=paper.concepts.filter(m=>m.kind==='safety')
    for(const substance of substances)for(const outcome of outcomes)for(const topic of safety){
      const id=substance.id+':'+outcome.id+':'+topic.id
      const row=threads.get(id)||{
        id,substance:substance.label,outcome:outcome.label,safetyTopic:topic.label,
        pmids:[],titleTripleWitnesses:0,
        basis:'same-source-text-triple-mention' as const,
        status:'review-only-no-efficacy-or-interaction-inference' as const,
      }
      // A witness must contain all three literal concepts in the SAME PMID.
      if(!row.pmids.includes(paper.pmid))row.pmids.push(paper.pmid)
      if(outcome.basis==='title'&&topic.basis==='title')row.titleTripleWitnesses++
      threads.set(id,row)
    }
  }
  return [...threads.values()]
    .sort((a,b)=>b.titleTripleWitnesses-a.titleTripleWitnesses||
      b.pmids.length-a.pmids.length||a.id.localeCompare(b.id))
    .slice(0,24).map(row=>({...row,pmids:row.pmids.slice(0,8)}))
}
function timelineFromSources(dna:readonly ResearchDNA[],reviewed:readonly ReviewedStudyInput[]):PublicationTimeline[]{
  const byYear=new Map<number,PublicationTimeline>()
  const get=(year:number)=>{if(!byYear.has(year))byYear.set(year,{year,sources:0,reviewedCitations:0,pmids:[]});return byYear.get(year)!}
  for(const s of dna){
    const year=safeYear(s.year)
    if(year===null)continue
    const item=get(year);item.sources++;if(item.pmids.length<12)item.pmids.push(s.pmid)
  }
  const seen=new Set<string>()
  for(const study of reviewed){
    if(seen.has(study.id))continue
    seen.add(study.id)
    const year=safeYear(study.year)
    if(year!==null)get(year).reviewedCitations++
  }
  return [...byYear.values()].sort((a,b)=>a.year-b.year)
}
function briefsFromSignals(
  frontier:readonly FrontierSignal[],debates:readonly DebateCandidate[],safety:readonly SafetyMention[],
  investigations:readonly SemanticInvestigationThread[],
):DraftBrief[]{
  const drafts:DraftBrief[]=[]
  for(const d of debates.slice(0,6)){
    drafts.push({id:'divergence:'+d.id,
      title:'Review differing published source directions: '+d.ingredient+' / '+d.outcome,
      mode:'evidence-divergence-review',
      rationale:'Separately published citation relationships differ; check populations, endpoints, trial dependence and the underlying papers before interpreting.',
      pmids:[...new Set(d.studies.map(s=>s.pmid).filter(Boolean))],
      sourceStudyIds:d.studies.map(s=>s.studyId),
      destination:'/research/intelligence/',status:'draft-requires-qualified-editorial-review',allowAutopublish:false})
  }
  for(const f of frontier.slice(0,10)){
    drafts.push({id:'frontier:'+f.id,
      title:'Scope research coverage: '+f.substance+' × '+f.outcome,
      mode:'research-gap-brief',
      rationale:'Sparse title co-occurrence within the exact-verified intake batch; perform a broad primary-literature search before calling this a research gap.',
      pmids:f.samplePmids,sourceStudyIds:[],destination:'/research/intelligence/',
      status:'draft-requires-qualified-editorial-review',allowAutopublish:false})
  }
  for(const s of safety.filter(x=>x.titleWitnesses>0).slice(0,6)){
    drafts.push({id:'safety:'+s.id,
      title:'Map source context: '+s.substance+' / '+s.topic,
      mode:'safety-literature-map',
      rationale:'Bibliographic co-mention warrants source inspection, not an interaction, adverse effect or risk conclusion.',
      pmids:s.pmids,sourceStudyIds:[],destination:'/research/intelligence/',
      status:'draft-requires-qualified-editorial-review',allowAutopublish:false})
  }
  for(const thread of investigations.slice(0,4)){
    drafts.push({id:'cross-instrument:'+thread.id,
      title:'Audit same-source concept triad: '+thread.substance+' / '+thread.outcome+' / '+thread.safetyTopic,
      mode:'cross-instrument-review',
      rationale:'One or more verified bibliographic sources name all three concepts. Confirm relevance, endpoints and limitations in the full studies; co-mention implies neither effectiveness nor an adverse interaction.',
      pmids:thread.pmids,sourceStudyIds:[],destination:'/research/intelligence/',
      status:'draft-requires-qualified-editorial-review',allowAutopublish:false})
  }
  return drafts
}
export function buildResearchIntelligenceStudio(
  sources:readonly StudioSource[],network:SemanticNetwork,reviewedStudies:readonly ReviewedStudyInput[],
  changeHistory:readonly {id:string;title:string;path:string;occurredAt:string;summary:string}[]=[],
  reviewEvents:readonly ResearchAdjudicationEvent[]=[],
):ResearchStudio {
  if(sources.length!==Object.keys(network.entries).length ||
     new Set(sources.map(s=>s.pmid)).size!==sources.length ||
     sources.some(s=>!network.entries[s.pmid]))throw new Error('Study DNA sources must exactly match graph PMIDs')
  if(network.summary.sourcePapers!==sources.length||sources.some(s=>
    network.entries[s.pmid]?.sourceSignature!==semanticSourceSignature(s) ||
    JSON.stringify(network.entries[s.pmid]?.mentions)!==
    JSON.stringify(extractSemanticMentions(s.title,s.abstract)))) {
    throw new Error('Study DNA semantic witnesses are stale or inconsistent with source text')
  }
  const dna=sources.map(s=>fingerprint(s,network))
  const publicationLineage=buildPublicationLineageReport(sources,reviewedStudies)
  const adjudication=validateResearchAdjudicationLedger({version:1,events:reviewEvents},
    dna.flatMap(d=>d.sourceWitnesses))
  const debates=debatesFromReviewed(reviewedStudies)
  const frontiers=frontierFromDna(dna)
  const safety=safetyFromDna(dna)
  const investigations=investigationsFromDna(dna)
  const timeline=timelineFromSources(dna,reviewedStudies)
  const briefs=briefsFromSignals(frontiers,debates,safety,investigations)
  const recordedChanges=changeHistory.filter(c=>
    Boolean(c.id&&c.title&&/^\/(herbs|compounds)\/[a-z0-9/-]+\/?$/.test(c.path)) &&
    Number.isFinite(Date.parse(c.occurredAt)) &&
    /^\d{4}-\d{2}-\d{2}/.test(c.occurredAt))
    .map(c=>({id:c.id,title:clip(c.title,140),path:c.path,
      occurredAt:c.occurredAt,summary:clip(c.summary,400),
      basis:'explicit-editorial-grade-change-log' as const}))
    .sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt))
    .slice(0,40)
  return {
    systemVersion:'1.05',schemaVersion:1,sourceWave:7500,sourceCount:sources.length,researchOnly:true,
    dna,debates,frontiers,safety,investigations,timeline,briefs,recordedChanges,adjudication,publicationLineage,
    metrics:{fingerprints:dna.length,
      classifiedMethods:dna.filter(x=>x.methodBasis!=='unknown').length,
      populationTagged:dna.filter(x=>x.populationMentions.length>0).length,
      reviewedDirectionalCandidates:debates.length,
      exactPublicationCrosslinks:publicationLineage.matchedIntakePmids,
      duplicatedCitationGroups:publicationLineage.duplicateCitationGroups.length,
      publicationIdentityConflicts:publicationLineage.identityConflicts.length,
      catalogCoverageQuestions:frontiers.length,
      safetyCoMentions:safety.length,
      sameSourceInvestigationThreads:investigations.length,
      quotedTextWitnesses:dna.reduce((n,x)=>n+x.sourceWitnesses.length,0),
      reviewedSourceMentions:adjudication.reviewCount,
      datedPublications:dna.filter(x=>safeYear(x.year)!==null).length,
      preparedDrafts:briefs.length,automaticallyPromotedClaims:0,
    },
  }
}
export type StudioQueryResult = {
  understoodConcepts: string[]
  unresolvedTerms: string[]
  matchMode: 'all-concepts' | 'partial-concepts' | 'no-concepts'
  retrievalNote: string
  matches: Array<{pmid:string;title:string;year:string;reason:string;url:string;witnesses:ResearchSourceWitness[]}>
  warning: string
}
/**
 * Return tokens the controlled vocabulary could not interpret. This is
 * deliberately conservative: study populations, comparators, dates, doses,
 * negations and other modifiers may NEVER silently disappear from a question.
 */
function unresolvedQuestionTerms(input:string,mentions:readonly SemanticMention[]):string[]{
  const words=normalizeSemanticText(input).split(' ').filter(Boolean)
  const covered=new Array<boolean>(words.length).fill(false)
  for(const mention of mentions){
    const phrase=normalizeSemanticText(mention.matched).split(' ')
    for(let i=0;i<=words.length-phrase.length;i++){
      if(phrase.every((word,j)=>words[i+j]===word)){
        for(let j=0;j<phrase.length;j++)covered[i+j]=true
      }
    }
  }
  const scaffolding=new Set([
    'what','which','who','where','how','is','are','was','were','do','does','did',
    'can','could','would','may','might','i','we','me','us','find','show','list',
    'studies','study','papers','paper','publications','sources','source',
    'mention','mentions','mentioning','about','regarding','on','in','of','for',
    'a','an','the','and','with','to','that','there','any','please','research',
    'look','at','related','relate','which','into','literature',
  ])
  const fragments:string[]=[]
  let pending:string[]=[]
  const flush=()=>{if(pending.length){fragments.push(pending.join(' '));pending=[]}}
  for(let i=0;i<words.length;i++){
    if(covered[i]||scaffolding.has(words[i]))flush()
    else pending.push(words[i])
  }
  flush()
  return fragments.slice(0,10)
}
/**
 * Deterministic evidence SOURCE FINDER, not generated clinical Q&A.
 * Never produces treatment advice, synthesizes results, or invents citations.
 */
export function askResearchSources(question:string,studio:ResearchStudio,focusPmid?:string):StudioQueryResult {
  const input=clip(question,300)
  const mentions=extractSemanticMentions(input,'')
  const names=[...new Set(mentions.map(m=>m.id))]
  const unresolvedTerms=unresolvedQuestionTerms(input,mentions)
  const ranked=studio.dna.filter(d=>!focusPmid||d.pmid===focusPmid).map(d=>{
    const hits=d.concepts.filter(m=>names.includes(m.id))
    const inTitle=hits.filter(x=>x.basis==='title').length
    return {d,hits,score:inTitle*5+(hits.length-inTitle)*2}
  }).filter(row=>names.length?row.hits.length>0:false)
    .sort((a,b)=>b.hits.length-a.hits.length||b.score-a.score||a.d.pmid.localeCompare(b.d.pmid))
  // Multiple concepts represent an AND inquiry. An OR fallback is never presented
  // as answering that narrower research question.
  const conjunctive=ranked.filter(({hits})=>new Set(hits.map(h=>h.id)).size===names.length)
  const conjunctiveMatches=names.length>0 && conjunctive.length>0
  const exact=conjunctiveMatches && unresolvedTerms.length===0
  const matchMode:StudioQueryResult['matchMode']=!names.length?'no-concepts':
    exact?'all-concepts':'partial-concepts'
  // If every indexed concept matches, retain those same-paper witnesses
  // even when additional question qualifiers are unindexed.
  const results=conjunctiveMatches?conjunctive:ranked
  return {
    understoodConcepts:names.map(id=>RESEARCH_CONCEPTS.find(c=>c.id===id)?.label||id),
    unresolvedTerms,
    matchMode,
    retrievalNote:(focusPmid?'Only selected PMID '+focusPmid+' is searched. ':'')+(!names.length
      ? 'No controlled vocabulary concept matched this question. The source finder cannot answer it.'
      : unresolvedTerms.length
        ? 'Unindexed question terms ('+unresolvedTerms.join(', ')+') were NOT verified. Displayed papers match indexed concepts only, NOT the full question.'
        : exact
          ? 'These sources mention every recognized concept in the question; co-mention does not establish a relationship.'
          : 'No single source in this batch mentions every recognized concept. Showing individually related sources only, NOT matches to the full question.'),
    matches:results.slice(0,12).map(({d,hits})=>({
      pmid:d.pmid,title:d.title,year:d.year,
      reason:'Title/abstract concept matches: '+hits.map(h=>h.label+' ('+h.basis+')').join(', '),
      url:d.sourceUrl,
      witnesses:d.sourceWitnesses.filter(w=>hits.some(h=>h.id===w.conceptId)).slice(0,2),
    })),
    warning:'Source discovery only. A text match does not establish efficacy, safety, study comparability or a treatment recommendation. Consult linked original papers and the separately reviewed Citation Explorer.',
  }
}
export function explainSemanticVoyage(network:SemanticNetwork,from:string,to:string){
  return findExplainableConceptPath(network,from,to,3)
}


/**
 * Reuse the already-published, independently reviewed evidence-report JSON
 * in the user's browser, rather than rebuilding it in a second Next.js
 * static-page-generation worker (which previously timed out).
 *
 * The precomputed research-only fingerprints, safety co-mentions, and frontiers
 * remain untouched. Only the explicitly reviewed direction/time context
 * and resulting DRAFT editorial queue are added.
 */
export function hydrateResearchStudioWithPublishedEvidence(
  studio:ResearchStudio,
  published:readonly ReviewedStudyInput[],
):ResearchStudio {
  const debates=debatesFromReviewed(published)
  const publicationLineage=buildPublicationLineageReport(studio.dna,published)
  const timeline=new Map<number,PublicationTimeline>(
    studio.timeline.map(t=>[t.year,{...t,pmids:[...t.pmids],reviewedCitations:0}]),
  )
  const seen=new Set<string>()
  for(const study of published){
    if(!study.id||seen.has(study.id))continue
    seen.add(study.id)
    const y=safeYear(study.year)
    if(y===null)continue
    const bucket=timeline.get(y)||{year:y,sources:0,reviewedCitations:0,pmids:[]}
    bucket.reviewedCitations++
    timeline.set(y,bucket)
  }
  const briefs=briefsFromSignals(studio.frontiers,debates,studio.safety,studio.investigations)
  return {
    ...studio,
    debates,publicationLineage,
    timeline:[...timeline.values()].sort((a,b)=>a.year-b.year),
    briefs,
    metrics:{
      ...studio.metrics,
      reviewedDirectionalCandidates:debates.length,
      exactPublicationCrosslinks:publicationLineage.matchedIntakePmids,
      duplicatedCitationGroups:publicationLineage.duplicateCitationGroups.length,
      publicationIdentityConflicts:publicationLineage.identityConflicts.length,
      preparedDrafts:briefs.length,
      automaticallyPromotedClaims:0,
    },
  }
}
