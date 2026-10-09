/**
 * Semantic System 1.05: a single PMID-centered, deterministic investigation
 * surface shared by all eight research instruments.
 *
 * This is an INDEX, not an adjudicator. Links are limited to explicit PMID
 * membership or existing exact publication-identity crosswalks. It must never
 * transform bibliographic co-mentions into efficacy, safety, or causality.
 */
import type {ResearchStudio} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'

export type IntelligenceInstrument =
  'dna'|'contradictions'|'frontier'|'time'|'voyages'|'safety'|'ask'|'reactor'
export type InstrumentTrace = {
  instrument:IntelligenceInstrument
  linkedItems:number
  basis:string
  limit:string
}
export type ResearchCaseFile = {
  pmid:string
  title:string
  year:string
  sourceUrl:string
  sourceSignature:string
  conceptLabels:string[]
  sourceWitnessCount:number
  unresolvedFields:string[]
  relatedPapers:Array<{pmid:string;sharedConcepts:string[];explanation:string}>
  reviewedCitationIds:string[]
  publicationIdentityBasis:Array<'exact-pmid'|'exact-doi'>
  instruments:InstrumentTrace[]
  status:'source-discovery-only-no-clinical-adjudication'
}

/**
 * All trace counts are counts of visible indexed leads, not the number of
 * globally existing trials or the strength of scientific evidence.
 * In particular, frontier, safety and draft PMID lists may be sampled/capped.
 */
export function buildResearchCaseFile(
  studio:ResearchStudio, network:SemanticNetwork, pmid:string,
):ResearchCaseFile|null {
  if(studio.systemVersion!=='1.05'||studio.researchOnly!==true||
     studio.metrics.automaticallyPromotedClaims!==0) {
    throw new Error('Research case file requires the governed research-only 1.05 snapshot')
  }
  const paper=studio.dna.find(d=>d.pmid===pmid)
  if(!paper)return null
  const entry=network.entries[pmid]
  if(!entry||entry.pmid!==pmid||!entry.sourceSignature||
     paper.grade!=='ungraded-research-intake' ||
     paper.sourceWitnesses.some(w=>w.pmid!==pmid||w.sourceSignature!==entry.sourceSignature)){
    throw new Error('Source case file does not match its pinned semantic graph')
  }
  const crossrefs=studio.publicationLineage.crossReferences.filter(x=>x.intakePmid===pmid)
  const reviewedCitationIds=[...new Set(crossrefs.flatMap(x=>x.reviewedStudyIds))].sort()
  const reviewedIds=new Set(reviewedCitationIds)
  const debates=studio.debates.filter(d=>d.studies.some(s=>reviewedIds.has(s.studyId)))
  const frontier=studio.frontiers.filter(f=>f.samplePmids.includes(pmid))
  const safety=studio.safety.filter(s=>s.pmids.includes(pmid))
  const threads=studio.investigations.filter(t=>t.pmids.includes(pmid))
  const briefs=studio.briefs.filter(b=>b.pmids.includes(pmid)||
    b.sourceStudyIds.some(id=>reviewedIds.has(id)))
  const namedConcepts=paper.concepts.filter(m=>m.kind!=='method')
  const timeline=studio.timeline.some(t=>String(t.year)===paper.year&&t.pmids.includes(pmid))
  return {
    pmid,title:paper.title,year:paper.year,sourceUrl:paper.sourceUrl,
    sourceSignature:entry.sourceSignature,
    conceptLabels:namedConcepts.map(m=>m.label),
    sourceWitnessCount:paper.sourceWitnesses.length,
    unresolvedFields:[...paper.missing],
    relatedPapers:entry.related.slice(0,5).map(r=>({
      pmid:r.pmid,sharedConcepts:r.sharedConcepts,explanation:r.explanation,
    })),
    reviewedCitationIds,
    publicationIdentityBasis:[...new Set(crossrefs.map(x=>x.evidence))],
    instruments:[
      {instrument:'dna',linkedItems:1,basis:'Exact PMID fingerprint and source quotations',limit:'Unreviewed bibliographic metadata'},
      {instrument:'contradictions',linkedItems:debates.length,basis:'Exact citation identifiers in separately reviewed directional candidates',limit:'Trial independence and outcome comparability not established'},
      {instrument:'frontier',linkedItems:frontier.length,basis:'PMID appears in displayed batch-coverage samples',limit:'Sample membership, not an exhaustive global evidence gap'},
      {instrument:'time',linkedItems:Number(timeline),basis:'Dated publication-year bucket for this PMID',limit:'Not an evidence grade change'},
      {instrument:'voyages',linkedItems:entry.related.length,basis:'Named-concept overlap with source-linked neighboring papers',limit:'Text similarity, not a mechanistic or clinical relationship'},
      {instrument:'safety',linkedItems:safety.length+threads.length,basis:'PMID appears in safety and same-paper triad samples',limit:'Mention only; not a confirmed adverse effect or interaction'},
      {instrument:'ask',linkedItems:namedConcepts.length,basis:'Indexed literal concepts usable as source-finder terms',limit:'Question qualifiers and unindexed terms remain unresolved'},
      {instrument:'reactor',linkedItems:briefs.length,basis:'PMID or exact reviewed citation used in draft-only editorial work orders',limit:'No automatic article, clinical claim or publication'},
    ],
    status:'source-discovery-only-no-clinical-adjudication',
  }
}
