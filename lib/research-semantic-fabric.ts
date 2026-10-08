/**
 * THS Semantic Fabric 1.07: exact-publication downstream impact *candidates*.
 *
 * This is a read-only bridge between the research-only PubMed atlas, the
 * separately governed editorial review queue, and pre-existing distribution
 * research objects. It does not grade evidence, infer effects from topic overlap,
 * revise content, authorize publishing, or generate social scripts.
 */
import {buildResearchCaseFile,type ResearchCaseFile} from './research-intelligence-casefile'
import {buildResearchCaseScope} from './research-intelligence-context'
import {buildInstrumentRelay} from './research-intelligence-relay'
import type {ResearchStudio} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'

export type DistributionIdentity={
 id:string
 sourceUrl:string
 primarySourceUrl?:string
 findingClaimId?:string
 primarySourceId?:string
}
export type FabricDistributionLink={
 objectId:string
 targetPage:string
 citationId:string
 sourceClaimId:string
 matchingDoi:string
 status:'publication-matched-editorial-review-required'
 provenance:'exact-primary-citation-doi'
 limitation:'same-publication-identity-does-not-prove-claim-support-or-independence'
}
export type FabricEditorialQueue={
 briefId:string
 title:string
 sourcePmid:string
 status:'draft-requires-qualified-editorial-review'
}
export type ResearchFabricPlan={
 schemaVersion:1
 systemCapability:'semantic-fabric-1.07'
 sourcePmid:string
 sourceSignature:string
 sourceDoi:string|null
 reviewedCitationIds:string[]
 instrumentHandoffs:Array<{id:string;from:string;to:string;basis:string}>
 editorialQueue:FabricEditorialQueue[]
 distributionReviewTargets:FabricDistributionLink[]
 unresolvedChannels:Array<{
  channel:'editorial'|'social'
  reason:string
  status:'requires-authoritative-source-link-or-human-review'
 }>
 evidenceAuthority:'research-intake-not-clinical-evidence'
 publicationAllowed:false
 mutationAllowed:false
 status:'exact-publication-trace-review-only'
}

// Normalize exact DOI identity only. Never use titles, topic similarity,
// fuzzy matching, ingredients, populations, or related-PMID graph paths.
function normalizedDoi(value:unknown):string {
 if(typeof value!=='string')return ''
 const v=value.trim().toLowerCase()
  .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i,'')
  .replace(/[\s.]+$/,'')
 return /^10\.\d{4,9}\/[^\s?#]+$/.test(v)?v:''
}
const sitePath=(url:string)=>{
 try {
  const u=new URL(url)
  if(u.protocol!=='https:'||u.hostname!=='thehippiescientist.net'||u.search||u.hash||
    !u.pathname.startsWith('/')||u.pathname==='/'||/\/\//.test(u.pathname))return ''
  return u.pathname
 }catch{return ''}
}

export function planResearchSemanticFabric(
 studio:ResearchStudio,graph:SemanticNetwork,caseFile:ResearchCaseFile,
 objects:readonly DistributionIdentity[],
):ResearchFabricPlan{
 const verified=buildResearchCaseFile(studio,graph,caseFile.pmid)
 if(!verified||verified.sourceSignature!==caseFile.sourceSignature||
    verified.sourceUrl!==caseFile.sourceUrl||verified.title!==caseFile.title||
    JSON.stringify(verified.reviewedCitationIds)!==JSON.stringify(caseFile.reviewedCitationIds)) {
  throw Error('Semantic Fabric requires the exact canonical source case and reviewed citation identities')
 }
 const scope=buildResearchCaseScope(studio,verified)
 const relay=buildInstrumentRelay(studio,graph,verified,scope)
 const dna=studio.dna.find(d=>d.pmid===verified.pmid)
 if(!dna||!/^\d{5,10}$/.test(dna.pmid))throw Error('Verified source must have exact PubMed identity')
 const doi=normalizedDoi(dna.doi)
 const targets:FabricDistributionLink[]=[]
 const byObject=new Map<string,string>()
 const byCitation=new Map<string,string>()
 for(const raw of objects){
  if(!raw||typeof raw.id!=='string'||!raw.id.trim())throw Error('Distribution identity lacks stable object ID')
  const sourceDoi=normalizedDoi(raw.primarySourceUrl)
  const identity=raw.id.trim(),prior=byObject.get(identity)
  if(prior!==undefined&&prior!==sourceDoi)throw Error('One distribution ID has conflicting DOI identity')
  byObject.set(identity,sourceDoi)
  if(!doi||sourceDoi!==doi)continue
  const page=sitePath(raw.sourceUrl)
  // Even an exact DOI match cannot claim that a distribution finding is
  // actually supported by a paper unless claim/source IDs are present.
  // IDs are disclosed as reviewer targets, never attached as claim proof.
  if(!page||!/^[a-z][\w-]+$/i.test(raw.findingClaimId||'')||
     !/^[a-z][\w-]+$/i.test(raw.primarySourceId||''))continue
  const citationId=raw.primarySourceId!,priorCitationDoi=byCitation.get(citationId)
  if(priorCitationDoi!==undefined&&priorCitationDoi!==sourceDoi)
    throw Error('Distribution citation ID maps to conflicting exact DOI')
  byCitation.set(citationId,sourceDoi)
  targets.push({
    objectId:identity,targetPage:page,citationId,sourceClaimId:raw.findingClaimId!,
    matchingDoi:doi,status:'publication-matched-editorial-review-required',
    provenance:'exact-primary-citation-doi',
    limitation:'same-publication-identity-does-not-prove-claim-support-or-independence',
  })
 }
 const uniqueTargets=[...new Map(targets.map(t=>[t.objectId+':'+t.citationId,t])).values()]
  .sort((a,b)=>a.objectId.localeCompare(b.objectId)||a.citationId.localeCompare(b.citationId))
 return {
  schemaVersion:1,systemCapability:'semantic-fabric-1.07',
  sourcePmid:verified.pmid,sourceSignature:verified.sourceSignature,
  sourceDoi:doi||null,reviewedCitationIds:[...verified.reviewedCitationIds],
  instrumentHandoffs:relay.junctions.map(j=>({id:j.id,from:j.from,to:j.to,basis:j.basis})),
  editorialQueue:scope.briefs.filter(b=>b.pmids.includes(verified.pmid)||
     b.sourceStudyIds.some(id=>verified.reviewedCitationIds.includes(id)))
   .map(b=>({briefId:b.id,title:b.title,sourcePmid:verified.pmid,
    status:'draft-requires-qualified-editorial-review'})),
  distributionReviewTargets:uniqueTargets,
  unresolvedChannels:[
   ...(!scope.briefs.length?[{
    channel:'editorial' as const,reason:'No exact source-linked draft editorial brief is indexed for this PMID',
    status:'requires-authoritative-source-link-or-human-review' as const}]:[]),
   ...(!uniqueTargets.length?[{
    channel:'social' as const,
    reason:'No distribution object is linked by exact primary DOI plus its existing claim/source identifiers',
    status:'requires-authoritative-source-link-or-human-review' as const}]:[]),
  ],
  evidenceAuthority:'research-intake-not-clinical-evidence',
  publicationAllowed:false,mutationAllowed:false,
  status:'exact-publication-trace-review-only',
 }
}
