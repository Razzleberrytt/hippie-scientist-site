/** Independently published evidence metadata joined to a research case ONLY by
 * the already-verified citation crosswalk. It enriches Claim DNA with actual
 * reviewed descriptors, but NEVER grants a new clinical release authority.
 */
import type {ResearchStudio,ReviewedStudyInput} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'
import type {ResearchCaseFile} from './research-intelligence-casefile'
import {compileClaimDNA} from './scientific-intelligence-foundations'
type DetailedStudy=ReviewedStudyInput&{
  dose?:string;duration?:string;population?:string;outcome?:string;extractName?:string;
}
type DetailedRelationship=ReviewedStudyInput['relationships'][number]&{
  dose?:string;extractName?:string;result?:string;confidence?:string;safetyOutcome?:string
}
export type ReviewedClaimFacet={
  citationId:string;publicationPmid:string;basis:'independently-reviewed-exact-publication';
  intervention:string;outcome:string|null;population:string|null;preparation:string|null;
  studiedDose:string|null;studiedDuration:string|null;
  reviewedRelationship:string;reviewedEvidenceClass:string;reviewedConfidence:string|null;
  quotedResult:string|null;limitation:string|null;isClinicalPublicationApproved:false
}
function normDoi(value:string|undefined){
  const doi=String(value||'').trim().toLowerCase()
    .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/,'')
    .replace(/[.\s]+$/,'')
  return /^10\.\d{4,9}\/[^\s?#]+$/.test(doi)?doi:''
}
const bounded=(value:unknown):string|null=>{
  if(typeof value!=='string'||!value.trim())return null
  return value.trim().slice(0,260)
}
export function compileReviewedClaimFacets(s:ResearchStudio,g:SemanticNetwork,
 c:ResearchCaseFile,published:readonly ReviewedStudyInput[]):ReviewedClaimFacet[]{
  compileClaimDNA(s,g,c)
  const allowed=new Set(c.reviewedCitationIds)
  const original=s.dna.find(x=>x.pmid===c.pmid)!
  const sourceDoi=normDoi(original.doi)
  const matched=new Map<string,DetailedStudy>()
  for(const row of published){
    if(!allowed.has(row.id))continue
    if(matched.has(row.id))throw Error('Duplicate exact reviewed citation identity requires review')
    const pmid=String(row.pmid||'').trim()
    const doi=normDoi(row.doi)
    if(!((pmid&&pmid===c.pmid)||(doi&&doi===sourceDoi))||
      (pmid&&pmid!==c.pmid)||(sourceDoi&&doi&&doi!==sourceDoi))
      throw Error('Reviewed evidence record conflicts with exact source publication')
    matched.set(row.id,row)
  }
  const findings:ReviewedClaimFacet[]=[]
  for(const id of [...matched.keys()].sort()){
    const row=matched.get(id)! as DetailedStudy
    for(const relation of row.relationships.slice(0,20)){
      const r=relation as DetailedRelationship
      findings.push({
        citationId:id,publicationPmid:c.pmid,basis:'independently-reviewed-exact-publication',
        intervention:r.ingredientName,outcome:bounded(r.outcome||row.outcome),
        population:bounded(r.population||row.population),
        preparation:bounded(r.extractName||row.extractName),
        studiedDose:bounded(r.dose||row.dose),studiedDuration:bounded(r.duration||row.duration),
        reviewedRelationship:r.relationship,reviewedEvidenceClass:row.evidenceClass,
        reviewedConfidence:bounded(r.confidence),quotedResult:bounded(r.result),
        limitation:bounded(r.limitation),isClinicalPublicationApproved:false,
      })
    }
  }
  return findings.slice(0,40)
}
