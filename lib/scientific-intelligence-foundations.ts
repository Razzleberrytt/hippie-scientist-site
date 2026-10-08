/** v1.08–1.09 · Research-only Claim DNA, publication lineage, comparability and integrity.
 * No full-text synthesis or implied trial independence. All matches are checked
 * against the original PMID, graph signature and already-reviewed citation identity.
 */
import type {ResearchStudio,ResearchDNA} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'
import type {ResearchCaseFile} from './research-intelligence-casefile'

export type CandidateClaimDNA={
  pmid:string;sourceSignature:string;interventions:string[];population:string[];
  comparators:string[];outcomes:string[];preparation:string|null;
  dose:string|null;duration:string|null;effectDirection:null;
  witnesses:Array<{id:string;quote:string;basis:string}>;missing:string[];
  authority:'research-intake-descriptors-only';review:'required'
}
export type LineageFinding={
  pmid:string;publicationAliases:string[];duplicateCitationGroups:string[][];
  identityConflictIds:string[];underlyingTrialIndependence:'unknown';
  investigation:string[];basis:'exact-publication-identity-only'
}
export type ComparabilityFinding={
  left:string;right:string;sharedInterventions:string[];sharedOutcomes:string[];
  population:string;method:string;comparator:string;dose:'unknown';duration:'unknown';
  verdict:'insufficient-data'|'descriptive-differences';
  compatibleForEvidenceSynthesis:false
}
export type IntegrityFinding={id:string;severity:'hold'|'review';reason:string;pmid:string}
function unique(a:readonly string[]){return [...new Set(a.filter(Boolean))].sort()}
function check(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):ResearchDNA{
  if(s.systemVersion!=='1.05'||s.researchOnly!==true||s.metrics.automaticallyPromotedClaims!==0)
    throw Error('Scientific analysis requires research-only source snapshot')
  const d=s.dna.find(x=>x.pmid===c.pmid),e=g.entries[c.pmid]
  if(!d||!e||!c.sourceSignature||e.sourceSignature!==c.sourceSignature||
    d.grade!=='ungraded-research-intake'||d.sourceWitnesses.some(w=>
      w.pmid!==c.pmid||w.sourceSignature!==c.sourceSignature))
    throw Error('Scientific analysis source identity mismatch')
  return d
}
export function compileClaimDNA(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):CandidateClaimDNA{
  const d=check(s,g,c)
  return {
    pmid:c.pmid,sourceSignature:c.sourceSignature,
    interventions:unique(d.concepts.filter(x=>x.kind==='substance').map(x=>x.label)),
    population:unique(d.populationMentions),
    comparators:d.comparatorBasis==='unknown'?[]:[d.comparator],
    outcomes:unique(d.outcomeMentions),preparation:null,dose:null,duration:null,effectDirection:null,
    witnesses:d.sourceWitnesses.slice(0,24).map(w=>({id:w.id,quote:w.quote,basis:w.basis})),
    missing:unique([...d.missing,'Preparation (not independently extracted)','Dose (not independently extracted)',
      'Duration (not independently extracted)','Effect direction (not established by intake)']),
    authority:'research-intake-descriptors-only',review:'required',
  }
}
export function detectTrialLineage(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):LineageFinding{
  check(s,g,c)
  const ids=new Set(c.reviewedCitationIds)
  const groups=s.publicationLineage.duplicateCitationGroups
    .filter(x=>x.studyIds.some(id=>ids.has(id))).map(x=>unique(x.studyIds))
  const conflicts=s.publicationLineage.identityConflicts
    .filter(x=>x.pmids.includes(c.pmid)||x.studyIds.some(id=>ids.has(id)))
    .flatMap(x=>x.studyIds)
  return {
    pmid:c.pmid,publicationAliases:unique([...ids]),
    duplicateCitationGroups:groups,identityConflictIds:unique(conflicts),
    underlyingTrialIndependence:'unknown',
    investigation:['Check trial registry number and protocol','Compare recruitment dates and sites',
      'Verify participant cohort and follow-up reporting','Review companion publications and corrections'],
    basis:'exact-publication-identity-only',
  }
}
export function compareStudyContexts(s:ResearchStudio,g:SemanticNetwork,
  left:ResearchCaseFile,right:ResearchCaseFile):ComparabilityFinding{
  const a=check(s,g,left),b=check(s,g,right)
  const shared=(x:readonly string[],y:readonly string[])=>{
    const z=new Set(y.map(v=>v.trim().toLowerCase()))
    return unique(x.filter(v=>z.has(v.trim().toLowerCase())))
  }
  const population=shared(a.populationMentions,b.populationMentions).length?'same-indexed-terms':
    a.populationMentions.length&&b.populationMentions.length?'different-indexed-terms':'not-classified'
  const method=a.methodBasis!=='unknown'&&b.methodBasis!=='unknown'?
    (a.method===b.method?'same-indexed-label':'different-indexed-label'):'not-classified'
  const comparator=a.comparatorBasis!=='unknown'&&b.comparatorBasis!=='unknown'?
    (a.comparator===b.comparator?'same-indexed-phrase':'different-indexed-phrase'):'not-classified'
  return {
    left:left.pmid,right:right.pmid,
    sharedInterventions:shared(a.substancesMentioned,b.substancesMentioned),
    sharedOutcomes:shared(a.outcomeMentions,b.outcomeMentions),
    population,method,comparator,dose:'unknown',duration:'unknown',
    verdict:population==='different-indexed-terms'||method==='different-indexed-label'||
      comparator==='different-indexed-phrase'?'descriptive-differences':'insufficient-data',
    compatibleForEvidenceSynthesis:false,
  }
}
export function scanResearchIntegrity(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):IntegrityFinding[]{
  const d=check(s,g,c), findings:IntegrityFinding[]=[]
  const add=(id:string,severity:'hold'|'review',reason:string)=>
    findings.push({id,severity,reason,pmid:c.pmid})
  if(d.sourceWitnesses.length===0)add('no-source-witness','review','No indexed direct quotation for source matching')
  if(d.methodBasis==='unknown')add('method-unknown','review','Study design cannot be classified from permitted source data')
  const lineage=detectTrialLineage(s,g,c)
  if(lineage.identityConflictIds.length)add('identity-conflict','hold','Conflicting published citation identity is quarantined')
  if(lineage.duplicateCitationGroups.length)add('citation-aliases','review','Duplicate citation records must not be counted as independent publications')
  if(!d.doi)add('doi-unavailable','review','DOI unavailable in pinned snapshot; no DOI-based joins')
  add('correction-status-unverified','review','No live retraction, expression-of-concern or correction check performed')
  return findings
}
