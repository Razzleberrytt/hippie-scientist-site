/**
 * Semantic Intelligence 1.06 — provenance-guarded instrument relay.
 *
 * An inter-instrument junction is a navigation lead, NEVER an inferred
 * biological relationship, scientific agreement, harm signal, treatment
 * recommendation, or publication approval.
 *
 * Source exactness is validated by the v1.05 case scope. A shared PMID
 * between two work queues does not imply their scientific claims agree.
 */
import type {IntelligenceInstrument,ResearchCaseFile} from './research-intelligence-casefile'
import {buildResearchCaseScope,type ResearchCaseScope} from './research-intelligence-context'
import type {ResearchStudio} from './research-intelligence-studio'
import type {ReviewedContradictionFlag,ReviewedSemanticEdge,SemanticNetwork} from './research-semantic-network'

export type RelayBasis=
  |'source-pmid-membership'
  |'exact-reviewed-citation-identity'
  |'source-year-membership'
  |'source-concept-index'

export type InstrumentRelayJunction={
  id:string
  pmid:string
  from:IntelligenceInstrument
  to:IntelligenceInstrument
  basis:RelayBasis
  reason:string
  limitation:string
  status:'research-navigation-only'
}
export type InstrumentRelay={
  pmid:string
  junctions:InstrumentRelayJunction[]
  independentlyReviewed:{
    edges:ReviewedSemanticEdge[]
    contradictionFlags:ReviewedContradictionFlag[]
  }
  status:'source-bound-no-clinical-synthesis'
}

const CO_MENTION_LIMIT='Bibliographic text or sampled PMID membership does not establish efficacy, mechanism, causation, safety, or absence of evidence.'
const REVIEW_LIMIT='Publication identity does not establish independent trials, comparable endpoints, or a clinical conclusion.'

export function buildInstrumentRelay(
  studio:ResearchStudio,
  graph:SemanticNetwork,
  caseFile:ResearchCaseFile,
  scope:ResearchCaseScope,
):InstrumentRelay {
  // Re-run the canonical exact-ID check so callers cannot provide a forged
  // independently constructed scope with unrelated evidence.
  const verified=buildResearchCaseScope(studio,caseFile)
  if(scope.pmid!==verified.pmid ||
     scope.status!==verified.status ||
     graph.entries[caseFile.pmid]?.sourceSignature!==caseFile.sourceSignature ||
     !studio.dna.some(d=>d.pmid===caseFile.pmid)) {
    throw Error('Cross-instrument relay requires the exact source-bound case and semantic graph')
  }
  const pmid=caseFile.pmid
  const edges:InstrumentRelayJunction[]=[]
  const insert=(from:IntelligenceInstrument,to:IntelligenceInstrument,basis:RelayBasis,reason:string,limitation=CO_MENTION_LIMIT)=>{
    if(edges.some(e=>e.from===from&&e.to===to))return
    edges.push({id:pmid+':'+from+':'+to,pmid,from,to,basis,reason,limitation,status:'research-navigation-only'})
  }
  // Every edge below is grounded in already indexed exact source identifiers.
  // A 0-length sampled list is absence of an indexed lead, not absence of science.
  const timelines=studio.timeline.some(t=>t.pmids.includes(pmid)&&t.sources>0)
  const links=graph.entries[pmid]?.related||[]
  const sourceConcepts=graph.entries[pmid]?.mentions.filter(m=>m.kind!=='method')||[]
  if(timelines)insert('dna','time','source-year-membership','The same PubMed record is indexed in a dated publication bucket.')
  if(sourceConcepts.length>0)insert('dna','ask','source-concept-index','Ask the Evidence can retrieve this exact source using indexed text concepts.')
  if(links.length>0)insert('dna','voyages','source-concept-index','Related source records share literal indexed concepts; each link retains a separate PMID.')
  if(verified.frontiers.length>0)insert('dna','frontier','source-pmid-membership','A limited research-coverage question explicitly samples this PMID.')
  if(verified.safety.length+verified.investigations.length>0)insert('dna','safety','source-pmid-membership','An indexed safety-text or investigation sample explicitly includes this PMID.')
  if(verified.debates.length>0)insert('dna','contradictions','exact-reviewed-citation-identity','A separately reviewed direction-review candidate is joined by an exact published citation identifier.',REVIEW_LIMIT)
  if(verified.briefs.length>0)insert('dna','reactor','source-pmid-membership','A draft editorial work order lists this PMID or its exact published citation identity.')

  // Genuine junctions between non-DNA instruments, never a Cartesian product
  // of unrelated topics. The same PMID (or exact citation ID) must witness
  // both sides and we explicitly explain the limits of that co-membership.
  if(timelines&&verified.debates.length>0){
    insert('time','contradictions','exact-reviewed-citation-identity','The dated source is explicitly cross-referenced to a reviewed citation direction candidate.',REVIEW_LIMIT)
  }
  if(sourceConcepts.length>0&&links.length>0){
    insert('voyages','ask','source-concept-index','Concepts used in a source-witnessed bibliographic route can be explored through source retrieval.')
  }
  if(verified.frontiers.some(f=>f.samplePmids.includes(pmid))&&
     verified.briefs.some(b=>b.pmids.includes(pmid))){
    insert('frontier','reactor','source-pmid-membership','A limited coverage question and a draft review brief both explicitly list this PMID.')
  }
  if(verified.safety.some(s=>s.pmids.includes(pmid))&&
     verified.briefs.some(b=>b.pmids.includes(pmid))){
    insert('safety','reactor','source-pmid-membership','An indexed safety-text sample and a draft review brief both explicitly list this PMID.')
  }
  const reviewedIds=new Set(caseFile.reviewedCitationIds)
  if(verified.debates.some(d=>d.studies.some(s=>reviewedIds.has(s.studyId)))&&
     verified.briefs.some(b=>b.sourceStudyIds.some(id=>reviewedIds.has(id)))){
    insert('contradictions','reactor','exact-reviewed-citation-identity','A direction-review candidate and a draft brief share an exact reviewed citation ID.',REVIEW_LIMIT)
  }

  // Independently reviewed semantic annotations remain a *separate layer*:
  // do not relabel source-text paths or direction candidates as peer-reviewed
  // findings just because reviewed annotations exist for the same paper.
  const reviewedEdges=graph.reviewedEdges.filter(e=>e.sourcePmid===pmid&&e.provenance==='independent-scientific-review')
  const reviewedFlags=graph.contradictions.filter(e=>e.sourcePmid===pmid&&e.provenance==='independent-scientific-review')
  return {
    pmid,junctions:edges,
    independentlyReviewed:{edges:reviewedEdges,contradictionFlags:reviewedFlags},
    status:'source-bound-no-clinical-synthesis',
  }
}
