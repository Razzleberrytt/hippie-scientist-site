/**
 * THS Semantic Intelligence 1.05 — exact-source context retention.
 *
 * A case context filters EXISTING research discovery projections; it cannot
 * infer new trial identities, causal relationships, clinical conclusions,
 * or full-corpus completeness from a sampled source list.
 */
import type {ResearchStudio} from './research-intelligence-studio'
import type {ResearchCaseFile} from './research-intelligence-casefile'
import type {SemanticNetwork,ConceptPathStep} from './research-semantic-network'

export type ResearchCaseScope={
  pmid:string
  debates:ResearchStudio['debates']
  frontiers:ResearchStudio['frontiers']
  safety:ResearchStudio['safety']
  investigations:ResearchStudio['investigations']
  briefs:ResearchStudio['briefs']
  sourceYear:number|null
  status:'exact-source-linked-leads-only'
}

export function buildResearchCaseScope(studio:ResearchStudio,caseFile:ResearchCaseFile):ResearchCaseScope {
  if(studio.systemVersion!=='1.05'||studio.researchOnly!==true||
     studio.metrics.automaticallyPromotedClaims!==0||
     !studio.dna.some(x=>x.pmid===caseFile.pmid && x.title===caseFile.title &&
       x.grade==='ungraded-research-intake')){
    throw Error('Case-scoped research context requires an exact governed source')
  }
  const pmid=caseFile.pmid
  const exactIdentifiers=[...new Set(studio.publicationLineage.crossReferences
    .filter(x=>x.intakePmid===pmid).flatMap(x=>x.reviewedStudyIds))].sort()
  if(caseFile.sourceUrl!==studio.dna.find(x=>x.pmid===pmid)?.sourceUrl||
     JSON.stringify(exactIdentifiers)!==JSON.stringify([...caseFile.reviewedCitationIds].sort())){
    throw Error('Case-scoped source identity conflicts with independently verified publication crosslinks')
  }
  const reviewed=new Set(exactIdentifiers)
  const paper=studio.dna.find(x=>x.pmid===pmid)!
  const year=Number(paper.year)
  return {
    pmid,
    debates:studio.debates.filter(d=>d.studies.some(s=>reviewed.has(s.studyId))),
    frontiers:studio.frontiers.filter(f=>f.samplePmids.includes(pmid)),
    safety:studio.safety.filter(s=>s.pmids.includes(pmid)),
    investigations:studio.investigations.filter(t=>t.pmids.includes(pmid)),
    briefs:studio.briefs.filter(b=>b.pmids.includes(pmid)||b.sourceStudyIds.some(id=>reviewed.has(id))),
    sourceYear:Number.isInteger(year)&&year>=1850&&year<=2100?year:null,
    status:'exact-source-linked-leads-only',
  }
}

/** One-paper concept co-mention trace; never traverse unrelated PMIDs when a
 * reader has scoped the Atlas to a particular source. Same threshold as the
 * global graph: at least one concept phrase must appear in the title.
 */
export function traceCaseConceptPair(
  network:SemanticNetwork, casePmid:string, from:string, to:string,
):ConceptPathStep[]{
  if(!from||!to||from===to)return []
  const e=network.entries[casePmid]
  if(!e)return []
  const first=e.mentions.find(m=>m.id===from&&m.kind!=='method')
  const second=e.mentions.find(m=>m.id===to&&m.kind!=='method')
  if(!first||!second||(first.basis!=='title'&&second.basis!=='title'))return []
  const both=first.basis==='title'&&second.basis==='title'
  return [{
    from,to,pmid:casePmid,
    provenance:both?'both-title':'title-and-abstract',
    explanation:both
      ? 'Both concepts are literally indexed in this source title. Source co-mention only, not causation.'
      : 'One concept is literally indexed in the source title and the other in its abstract. Source co-mention only, not causation.',
  }]
}
