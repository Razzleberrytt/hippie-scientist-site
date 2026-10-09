/** v1.10–1.12 · bounded hypothesis/counterfactual/mission/citation/mechanism engines.
 * All projections use the existing pinned source graph and separate reviewed
 * citation crosswalk. They NEVER convert lexical correlations into trial results.
 */
import type {ResearchStudio} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'
import type {ResearchCaseFile} from './research-intelligence-casefile'
import {compileClaimDNA,detectTrialLineage,scanResearchIntegrity,compareStudyContexts} from './scientific-intelligence-foundations'

export type ReviewHypothesis={
  id:string;pmid:string;question:string;basis:string;sourceSignature:string;
  falsification:string;status:'hypothesis-unverified'
}
export type Counterfactual={
  pmid:string;sourceSignature:string;removedPublication:string;affectedLinks:number;
  remainingNeighbors:number;changedScientificConclusion:false;status:'graph-sensitivity-only'
}
export type InvestigationMission={
  id:string;pmid:string;question:string;priority:number;sourceSignature:string;
  actions:Array<{step:string;state:'locally-checked'|'requires-independent-review';finding:string}>;
  status:'review-required';automaticallyPublished:false
}
export type CitationConstellation={
  pmid:string;exactCitationIds:string[];indexedNeighbors:string[];
  separatelyReviewedCitationCount:number;unverifiedTrialIndependence:true;
  links:Array<{target:string;basis:'exact-identity'|'shared-indexed-vocabulary';clinicalSupport:false}>
}
export type MechanismHumanBridge={
  pmid:string;reviewedCitationIds:string[];humanEvidenceEstablished:false;
  mechanismEstablished:false;missing:string[];status:'review-required-before-linking'
}
function guard(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile){
  compileClaimDNA(s,g,c)
  if(!g.entries[c.pmid]||g.entries[c.pmid].sourceSignature!==c.sourceSignature)
    throw Error('Source signature conflict')
}
export function forgeSourceHypotheses(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):ReviewHypothesis[]{
  guard(s,g,c)
  const source=g.entries[c.pmid]
  const substances=source.mentions.filter(m=>m.kind==='substance').slice(0,3)
  const outcomes=source.mentions.filter(m=>m.kind==='outcome').slice(0,3)
  const hypotheses:ReviewHypothesis[]=[]
  for(const a of substances)for(const b of outcomes){
    if(a.id===b.id)continue
    hypotheses.push({
      id:c.pmid+':'+a.id+':'+b.id,pmid:c.pmid,
      question:'In which independently verified populations, if any, has '+a.label+
        ' been tested for '+b.label+' using comparable interventions and outcomes?',
      basis:'Co-mentioned in exact PMID '+c.pmid+'; wording is a question, not a finding',
      sourceSignature:c.sourceSignature,
      falsification:'Review all eligible studies, including null findings, and prespecified outcomes',
      status:'hypothesis-unverified',
    })
  }
  return hypotheses.slice(0,6)
}
export function simulateSourceRemoval(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):Counterfactual{
  guard(s,g,c)
  const entry=g.entries[c.pmid],neighbors=entry.related.filter(x=>Boolean(g.entries[x.pmid]))
  const retained=neighbors.filter(x=>g.entries[x.pmid].related.some(r=>
    r.pmid!==c.pmid && r.pmid!==x.pmid))
  return {
    pmid:c.pmid,sourceSignature:c.sourceSignature,removedPublication:c.pmid,
    affectedLinks:neighbors.length,remainingNeighbors:retained.length,
    changedScientificConclusion:false,status:'graph-sensitivity-only',
  }
}
export function runBoundedInvestigation(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):InvestigationMission[]{
  guard(s,g,c)
  const integrity=scanResearchIntegrity(s,g,c)
  const lineage=detectTrialLineage(s,g,c)
  const hypotheses=forgeSourceHypotheses(s,g,c)
  const missions:InvestigationMission[]=[]
  const push=(id:string,question:string,priority:number,actions:InvestigationMission['actions'])=>
    missions.push({id,pmid:c.pmid,question,priority,sourceSignature:c.sourceSignature,
      actions,status:'review-required',automaticallyPublished:false})
  push('integrity:'+c.pmid,'What identity and correction verification is missing?',100,
    integrity.map(x=>({step:x.id,state:'requires-independent-review',finding:x.reason})))
  push('lineage:'+c.pmid,'Are the publications from independent recruited trials?',90,
    [{step:'resolve-exact-pubmed',state:'locally-checked',
      finding:String(lineage.publicationAliases.length)+' exact published citation identifiers indexed'},
     ...lineage.investigation.map(step=>({step,state:'requires-independent-review' as const,
       finding:'Underlying participant independence is not established'}))])
  for(const h of hypotheses.slice(0,2)){
    const neighbors=g.entries[c.pmid].related.slice(0,4).map(x=>x.pmid)
    push('hypothesis:'+h.id,h.question,65,[
      {step:'find-indexed-neighbors',state:'locally-checked',
        finding:neighbors.length+' bounded related PMIDs: '+neighbors.join(', ')},
      {step:'assess-independent-evidence',state:'requires-independent-review',
        finding:'No clinical efficacy inference from co-occurrence or similarity'},
    ])
  }
  return missions.sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id)).slice(0,5)
}
export function formCitationConstellation(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):CitationConstellation{
  guard(s,g,c)
  const linked=new Set(c.reviewedCitationIds)
  const neighbors=g.entries[c.pmid].related
    .filter(x=>Boolean(g.entries[x.pmid])&&x.pmid!==c.pmid).slice(0,8)
  return {
    pmid:c.pmid,exactCitationIds:[...linked].sort(),
    indexedNeighbors:neighbors.map(x=>x.pmid),
    separatelyReviewedCitationCount:linked.size,unverifiedTrialIndependence:true,
    links:[
      ...[...linked].sort().map(id=>({target:id,basis:'exact-identity' as const,clinicalSupport:false as const})),
      ...neighbors.map(x=>({target:x.pmid,basis:'shared-indexed-vocabulary' as const,clinicalSupport:false as const})),
    ],
  }
}
export function bridgeMechanismToHumanEvidence(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):MechanismHumanBridge{
  guard(s,g,c)
  // The research-only schema has no authenticated mechanistic experimental
  // pathway mapping or design-level human eligibility. Explicitly refuse a join.
  return {
    pmid:c.pmid,reviewedCitationIds:[...c.reviewedCitationIds].sort(),
    humanEvidenceEstablished:false,mechanismEstablished:false,
    missing:['Curated mechanistic experiment with primary source',
      'Independently screened human eligibility and endpoints',
      'Intervention preparation, dose and duration comparability',
      'Underlying trial/cohort independence and risk of bias'],
    status:'review-required-before-linking',
  }
}
export function compareBoundedNeighbor(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile,
  other:ResearchCaseFile){
  guard(s,g,c)
  return compareStudyContexts(s,g,c,other)
}
