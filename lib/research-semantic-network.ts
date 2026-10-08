/**
 * Evidence-safe semantic discovery graph for the research-intake register.
 *
 * These are EXPLORATORY BIBLIOGRAPHIC / TEXT CO-OCCURRENCE links:
 * a concept mention is not an intervention, outcome, support, causality,
 * mechanistic proof, evidence grade, or publication approval.
 *
 * Separates three levels of relationship:
 * 1. exact title/abstract concept mentions (with explicit text provenance);
 * 2. paper-to-paper similarity with shared named concepts (with reasons);
 * 3. title-exact mentions of already-published profiles (navigation only).
 * Historical PMID-only entries never receive guessed semantic metadata.
 */
export type SemanticKind = 'substance' | 'outcome' | 'method' | 'population' | 'safety'
export type SemanticConcept = {
  id: string
  label: string
  kind: SemanticKind
  aliases: readonly string[]
  href?: string
}
export type SemanticMention = {
  id: string
  label: string
  kind: SemanticKind
  basis: 'title' | 'abstract'
  matched: string
}
export type SemanticProfileLink = {
  name: string
  href: string
  basis: 'title'
}
export type PublishedCitationCrossref = {
  studyId: string
  href: string
  basis: 'exact-pmid'
}
export type SemanticRelatedPaper = {
  pmid: string
  score: number
  sharedConcepts: string[]
  crossTopic: boolean
  explanation: string
}
export type SemanticRecord = {
  pmid: string
  title: string
  abstract: string
  category: string
  pubType: string
}
export type SemanticGraphEntry = {
  pmid: string
  mentions: SemanticMention[]
  profiles: SemanticProfileLink[]
  reviewedCitations: PublishedCitationCrossref[]
  methodTag: string
  related: SemanticRelatedPaper[]
}
export type SemanticNetwork = {
  entries: Record<string, SemanticGraphEntry>
  concepts: Array<{ id: string; label: string; kind: SemanticKind; papers: number; titleMentions: number; href?: string }>
  summary: {
    sourcePapers: number
    linkedPapers: number
    explainableEdges: number
    crossTopicEdges: number
    linkedProfiles: number
    reviewedSourceOverlap: number
    activeConcepts: number
    metadataOnlyPapers: number
  }
  bridges: Array<{ pmid: string; neighborPmid: string; sharedConcepts: string[]; categories: [string, string] }>
}

/** Controlled vocabulary for discovery ONLY. Avoid ambiguous short aliases. */
export const RESEARCH_CONCEPTS: readonly SemanticConcept[] = [
  { id:'magnesium', label:'Magnesium', kind:'substance', aliases:['magnesium','magnesium glycinate','magnesium citrate'] },
  { id:'melatonin', label:'Melatonin', kind:'substance', aliases:['melatonin','6-sulfatoxymelatonin'] },
  { id:'ashwagandha', label:'Ashwagandha', kind:'substance', aliases:['ashwagandha','withania somnifera'] },
  { id:'passionflower', label:'Passionflower', kind:'substance', aliases:['passionflower','passiflora incarnata'] },
  { id:'lavender', label:'Lavender extract', kind:'substance', aliases:['silexan','lavender oil','lavandula angustifolia'] },
  { id:'l-theanine', label:'L-theanine', kind:'substance', aliases:['l-theanine','theanine'] },
  { id:'rhodiola', label:'Rhodiola', kind:'substance', aliases:['rhodiola rosea','rhodiola'] },
  { id:'saffron', label:'Saffron', kind:'substance', aliases:['saffron','crocus sativus'] },
  { id:'kava', label:'Kava', kind:'substance', aliases:['kava','piper methysticum'] },
  { id:'ginseng', label:'Ginseng', kind:'substance', aliases:['panax ginseng','panax quinquefolius','ginseng'] },
  { id:'creatine', label:'Creatine', kind:'substance', aliases:['creatine','creatine monohydrate'] },
  { id:'caffeine', label:'Caffeine', kind:'substance', aliases:['caffeine'] },
  { id:'berberine', label:'Berberine', kind:'substance', aliases:['berberine'] },
  { id:'curcumin', label:'Curcumin', kind:'substance', aliases:['curcumin','turmeric extract'] },
  { id:'omega-3', label:'Omega-3 fatty acids', kind:'substance', aliases:['omega-3','omega 3','eicosapentaenoic acid','docosahexaenoic acid'] },
  { id:'vitamin-d', label:'Vitamin D', kind:'substance', aliases:['vitamin d','cholecalciferol','ergocalciferol'] },
  { id:'vitamin-b12', label:'Vitamin B12', kind:'substance', aliases:['vitamin b12','cobalamin'] },
  { id:'zinc', label:'Zinc', kind:'substance', aliases:['zinc','zinc gluconate'] },
  { id:'probiotics', label:'Probiotics', kind:'substance', aliases:['probiotic','lactobacillus','bifidobacterium'] },
  { id:'cannabinoids', label:'Cannabinoids', kind:'substance', aliases:['cannabidiol','cannabinoid','tetrahydrocannabinol','cannabis'] },
  { id:'kratom', label:'Kratom alkaloids', kind:'substance', aliases:['kratom','mitragynine','7-hydroxymitragynine'] },
  { id:'bacopa', label:'Bacopa', kind:'substance', aliases:['bacopa monnieri','bacopa'] },
  { id:'lion-mane', label:"Lion's mane", kind:'substance', aliases:['hericium erinaceus',"lion's mane"] },
  { id:'cordyceps', label:'Cordyceps', kind:'substance', aliases:['cordyceps','ophiocordyceps','dongchongxiacao'] },
  { id:'nac', label:'N-acetylcysteine', kind:'substance', aliases:['n-acetylcysteine','acetylcysteine'] },
  { id:'sleep', label:'Sleep / insomnia', kind:'outcome', aliases:['sleep','insomnia','sleep quality','sleep duration'], href:'/goals/sleep/' },
  { id:'stress', label:'Psychological stress', kind:'outcome', aliases:['psychological stress','perceived stress','psychosocial stress','mental stress','workplace stress','emotional stress','stress symptoms','stress management'], href:'/goals/stress/' },
  { id:'oxidative-stress', label:'Oxidative stress', kind:'outcome', aliases:['oxidative stress','oxidative damage','oxidative injury'] },
  { id:'cortisol', label:'Cortisol biomarker', kind:'outcome', aliases:['cortisol'] },
  { id:'anxiety', label:'Anxiety', kind:'outcome', aliases:['anxiety','anxious','anxiolytic'], href:'/goals/anxiety/' },
  { id:'cognition', label:'Cognition / focus', kind:'outcome', aliases:['cognitive','cognition','attention','memory','executive function'], href:'/goals/focus/' },
  { id:'mood', label:'Mood', kind:'outcome', aliases:['depression','depressive symptoms','mood'] },
  { id:'pain', label:'Pain', kind:'outcome', aliases:['pain','analgesia','osteoarthritis'] },
  { id:'inflammation', label:'Inflammation', kind:'outcome', aliases:['inflammation','inflammatory','cytokines'] },
  { id:'metabolic', label:'Metabolic markers', kind:'outcome', aliases:['glucose','glycemic','glycaemic','insulin resistance','diabetes','hemoglobin a1c'] },
  { id:'exercise', label:'Exercise / performance', kind:'outcome', aliases:['muscle strength','exercise performance','physical performance','muscle mass','sarcopenia'] },
  { id:'blood-pressure', label:'Blood pressure', kind:'outcome', aliases:['hypertension','blood pressure'] },
  { id:'liver', label:'Liver', kind:'safety', aliases:['hepatotoxicity','liver injury','liver toxicity'] },
  { id:'drug-interactions', label:'Drug interactions', kind:'safety', aliases:['drug interaction','herb-drug interaction','cytochrome p450','cyp3a4'], href:'/safety-checker/interactions/' },
  { id:'withdrawal', label:'Dependence / withdrawal', kind:'safety', aliases:['withdrawal','substance dependence','opioid use disorder'], href:'/guides/substance-use/' },
  { id:'adverse-events', label:'Adverse events', kind:'safety', aliases:['adverse events','adverse effects','serious adverse event','toxicity'] },
  { id:'randomized', label:'Randomized trial', kind:'method', aliases:['randomized controlled','randomised controlled','randomized trial','randomised trial','randomized crossover'] },
  { id:'systematic', label:'Systematic review', kind:'method', aliases:['systematic review','meta-analysis','meta analysis','umbrella review'] },
  { id:'observational', label:'Observational study', kind:'method', aliases:['cohort study','case-control','cross-sectional study','observational study'] },
  { id:'older-adults', label:'Older adults', kind:'population', aliases:['older adults','elderly','older people','geriatric'] },
  { id:'children', label:'Children / adolescents', kind:'population', aliases:['children','childhood','adolescents','pediatric','paediatric'] },
  { id:'pregnancy', label:'Pregnancy / prenatal', kind:'population', aliases:['pregnancy','pregnant','maternal','prenatal','preconception'] },
] as const

export function normalizeSemanticText(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim()
}

function matchingAlias(text: string, aliases: readonly string[]) {
  // Unicode punctuation already normalized; pad spaces to enforce token boundaries.
  const padded = ' '+text+' '
  const matches = aliases.map(a=>normalizeSemanticText(a)).filter(a=>a.length>=4)
    .sort((a,b)=>b.length-a.length)
  return matches.find(alias=>padded.includes(' '+alias+' '))
}

export function extractSemanticMentions(title: string, abstract: string): SemanticMention[] {
  const normalizedTitle=normalizeSemanticText(title)
  const normalizedAbstract=normalizeSemanticText(abstract)
  const result:SemanticMention[]=[]
  for(const concept of RESEARCH_CONCEPTS){
    const titleAlias=matchingAlias(normalizedTitle,concept.aliases)
    const abstractAlias=titleAlias?undefined:matchingAlias(normalizedAbstract,concept.aliases)
    if(!titleAlias&&!abstractAlias)continue
    result.push({id:concept.id,label:concept.label,kind:concept.kind,basis:titleAlias?'title':'abstract',matched:titleAlias||abstractAlias||''})
  }
  return result
}

function methodFromPublicationType(pubType: string): string {
  if(/meta.analysis/i.test(pubType))return 'Meta-analysis (PubMed type)'
  if(/systematic review/i.test(pubType))return 'Systematic review (PubMed type)'
  if(/randomi[sz]ed controlled/i.test(pubType))return 'Randomized trial (PubMed type)'
  if(/clinical trial/i.test(pubType))return 'Clinical trial (PubMed type)'
  if(/observational/i.test(pubType))return 'Observational study (PubMed type)'
  return 'Method not classified'
}

export function buildResearchSemanticNetwork(
  records:readonly SemanticRecord[],
  publishedProfiles:readonly {name:string;href:string}[]=[],
  publishedCitations:readonly {pmid?:string;id:string}[]=[],
): SemanticNetwork {
  const known=new Set(records.map(r=>r.pmid))
  if(known.size!==records.length)throw new Error('Semantic graph cannot index duplicate PMIDs')
  // Exact-identity join only. No clinical outcomes, grades or interpretations
  // are imported into this source-only graph. PMID is the entire join key.
  const citationIds=new Map<string,Set<string>>()
  for(const item of publishedCitations){
    const pmid=String(item.pmid||'').trim()
    const id=String(item.id||'').trim()
    if(!/^\d{5,10}$/.test(pmid)||!id)continue
    if(!citationIds.has(pmid))citationIds.set(pmid,new Set())
    citationIds.get(pmid)!.add(id)
  }
  const entries:Record<string,SemanticGraphEntry>={}
  const titleIndex=new Map<string,Set<string>>()
  const conceptIndex=new Map<string,Set<string>>()
  const conceptTitleIndex=new Map<string,Set<string>>()
  const validProfiles=publishedProfiles.filter(p=>/^(\/herbs\/|\/compounds\/)[a-z0-9/-]+\/?$/.test(p.href))
    .filter(p=>normalizeSemanticText(p.name).length>=6)
  for(const record of records){
    const mentions=extractSemanticMentions(record.title,record.abstract)
    for(const m of mentions){
      if(!conceptIndex.has(m.id))conceptIndex.set(m.id,new Set())
      conceptIndex.get(m.id)!.add(record.pmid)
      if(m.basis==='title'){
        if(!conceptTitleIndex.has(m.id))conceptTitleIndex.set(m.id,new Set())
        conceptTitleIndex.get(m.id)!.add(record.pmid)
      }
    }
    const normalizedTitle=normalizeSemanticText(record.title)
    const profiles:SemanticProfileLink[]=[]
    for(const p of validProfiles){
      const name=normalizeSemanticText(p.name)
      if((' '+normalizedTitle+' ').includes(' '+name+' ')){
        profiles.push({name:p.name,href:p.href,basis:'title'})
      }
    }
    // Multiple aliases may point to the same canonical profile; stable dedup.
    entries[record.pmid]={
      pmid:record.pmid,
      mentions,
      profiles:[...new Map(profiles.map(p=>[p.href,p])).values()].slice(0,8),
      reviewedCitations:[...(citationIds.get(record.pmid)||[])].slice(0,6).map(studyId=>({
        studyId,
        href:'/learn/citation-explorer/#study-'+studyId.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
        basis:'exact-pmid' as const,
      })),
      methodTag:methodFromPublicationType(record.pubType),
      related:[],
    }
    titleIndex.set(record.pmid,new Set(mentions.filter(m=>m.basis==='title').map(m=>m.id)))
  }

  const edgePairs=new Set<string>()
  const bridgePairs=new Set<string>()
  const bridges:SemanticNetwork['bridges']=[]
  const categories=new Map(records.map(r=>[r.pmid,r.category]))
  const edges=new Map<string,Array<SemanticRelatedPaper>>()
  const rarity=(id:string)=>Math.max(1, Math.round(12/(1+Math.log2(conceptIndex.get(id)?.size||1))))
  for(const record of records){
    const source=entries[record.pmid]
    const candidates=new Set<string>()
    for(const mention of source.mentions){
      // Never bridge on method words, safety endpoints or generic symptoms alone.
      if(mention.kind!=='substance' && mention.kind!=='outcome')continue
      for(const candidate of conceptIndex.get(mention.id)||[])if(candidate!==record.pmid)candidates.add(candidate)
    }
    const ranked:SemanticRelatedPaper[]=[]
    for(const otherPmid of candidates){
      const other=entries[otherPmid]
      const shared=source.mentions.filter(a=>(a.kind==='substance'||a.kind==='outcome')&&
        other.mentions.some(b=>b.id===a.id))
      if(!shared.length)continue
      // Content overlap weighted by rare named substances + title exact matches.
      const named=shared.filter(x=>x.kind==='substance')
      const strong=shared.filter(x=>x.basis==='title'&&titleIndex.get(otherPmid)?.has(x.id))
      if(!named.length&&!strong.length)continue
      const score=shared.reduce((n,x)=>n+rarity(x.id)+(x.kind==='substance'?4:0),0)+strong.length*5
      const crossTopic=categories.get(record.pmid)!==categories.get(otherPmid)
      const sharedConcepts=shared.slice(0,4).map(m=>m.label)
      ranked.push({pmid:otherPmid,score,sharedConcepts,crossTopic,
        explanation:(named.length?'Shared named substance: ':'Shared title-level research subject: ')+sharedConcepts.join(', ')+
          (crossTopic?'; cataloged under different discovery topics':'')+'. Text overlap only—not study agreement or causation.'})
    }
    ranked.sort((a,b)=>b.score-a.score||a.pmid.localeCompare(b.pmid))
    edges.set(record.pmid,ranked.slice(0,5))
    source.related=ranked.slice(0,5)
    for(const rel of ranked.slice(0,5)){
      const key=[record.pmid,rel.pmid].sort().join(':')
      edgePairs.add(key)
      if(rel.crossTopic&&!bridgePairs.has(key)){
        bridgePairs.add(key)
        bridges.push({pmid:record.pmid,neighborPmid:rel.pmid,
          sharedConcepts:rel.sharedConcepts,categories:[record.category,categories.get(rel.pmid)||'']})
      }
    }
  }
  const concepts=RESEARCH_CONCEPTS.map(c=>({
    id:c.id,label:c.label,kind:c.kind,papers:conceptIndex.get(c.id)?.size||0,
    titleMentions:conceptTitleIndex.get(c.id)?.size||0,href:c.href,
  })).filter(c=>c.papers>0).sort((a,b)=>b.papers-a.papers||a.id.localeCompare(b.id))
  bridges.sort((a,b)=>a.pmid.localeCompare(b.pmid)||a.neighborPmid.localeCompare(b.neighborPmid))
  return {entries,concepts,bridges:bridges.slice(0,40),
    summary:{
      sourcePapers:records.length,
      linkedPapers:records.filter(r=>entries[r.pmid].related.length>0).length,
      explainableEdges:edgePairs.size,
      crossTopicEdges:bridgePairs.size,
      linkedProfiles:records.reduce((n,r)=>n+entries[r.pmid].profiles.length,0),
      reviewedSourceOverlap:records.filter(r=>entries[r.pmid].reviewedCitations.length>0).length,
      activeConcepts:concepts.length,
      metadataOnlyPapers:records.filter(r=>entries[r.pmid].mentions.length===0).length,
    }}
}


export type ConceptPathStep = {
  from: string
  to: string
  pmid: string
  provenance: 'both-title' | 'title-and-abstract'
  explanation: string
}

/**
 * Bounded semantic traversal through witnesses actually found within a paper.
 * A path represents a sequence of TEXT CO-MENTIONS, not mechanistic causality
 * or clinical evidence that concept A affects concept B.
 */
export function findExplainableConceptPath(
  network: SemanticNetwork,
  from: string,
  to: string,
  maxHops=3,
): ConceptPathStep[] {
  if(!from||!to||from===to)return []
  const accepted=new Set(network.concepts.filter(c=>c.kind!=='method').map(c=>c.id))
  if(!accepted.has(from)||!accepted.has(to))return []
  const adjacency=new Map<string,ConceptPathStep[]>()
  for(const entry of Object.values(network.entries)){
    // Require at least one title phrase in each co-mention link.
    const ms=entry.mentions.filter(m=>accepted.has(m.id))
    for(let i=0;i<ms.length;i++)for(let j=i+1;j<ms.length;j++){
      const a=ms[i],b=ms[j]
      if(a.basis!=='title'&&b.basis!=='title')continue
      const provenance=a.basis==='title'&&b.basis==='title'?'both-title':'title-and-abstract'
      const explanation=(provenance==='both-title'
        ? 'Both phrases appear in this paper title'
        : 'One phrase appears in the title and one in the abstract')+
        '. This is co-mention, not an evidence-supported causal link.'
      const forward={from:a.id,to:b.id,pmid:entry.pmid,provenance,explanation} as ConceptPathStep
      const backward={...forward,from:b.id,to:a.id}
      adjacency.set(a.id,[...(adjacency.get(a.id)||[]),forward])
      adjacency.set(b.id,[...(adjacency.get(b.id)||[]),backward])
    }
  }
  for(const paths of adjacency.values())paths.sort((a,b)=>
    Number(b.provenance==='both-title')-Number(a.provenance==='both-title')||
    a.pmid.localeCompare(b.pmid)||a.to.localeCompare(b.to))
  const depthLimit=Math.max(1,Math.min(3,Math.floor(maxHops)))
  const q:Array<{id:string,path:ConceptPathStep[]}>=[{id:from,path:[]}]
  const visited=new Set([from])
  while(q.length){
    const curr=q.shift()!
    if(curr.path.length>=depthLimit)continue
    for(const edge of adjacency.get(curr.id)||[]){
      if(visited.has(edge.to))continue
      const path=[...curr.path,edge]
      if(edge.to===to)return path
      visited.add(edge.to)
      q.push({id:edge.to,path})
    }
  }
  return []
}
