/**
 * P0 integrated research case: ONE source-validated, read-only handoff
 * across the original eight instruments, twelve scientific projections and
 * the editorial/distribution review candidate fabric.
 *
 * This coordinates existing authorities. It is not a scientific finding,
 * a second graph, an approval engine or a publication service.
 */
import {buildResearchCaseFile,type ResearchCaseFile} from './research-intelligence-casefile'
import {buildResearchCaseScope,type ResearchCaseScope} from './research-intelligence-context'
import {buildInstrumentRelay,type InstrumentRelay} from './research-intelligence-relay'
import {buildScientificIntelligenceCase,SCIENCE_CAPABILITIES,type ScientificIntelligenceCase} from './scientific-intelligence-suite'
import {planResearchSemanticFabric,type ResearchFabricPlan,type DistributionIdentity} from './research-semantic-fabric'
import type {ResearchStudio,ReviewedStudyInput} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'

/**
 * Strictly research-only transport shape. A matching DOI and purported
 * claim/source IDs merely identify records for a *human* to inspect.
 * This is neither a reviewed medical claim nor a publication grant.
 */
export type ResearchEditorialReviewHandoff={
  schemaVersion:1
  kind:'research-editorial-review-request'
  sourcePmid:string
  sourceSignature:string
  sourceUrl:string
  sourceDoi:string|null
  reviewedCitationIds:string[]
  instrumentCount:8
  scientificProjectionCount:12
  reviewTargets:Array<{
    requestId:string
    sourcePmid:string
    sourceSignature:string
    exactPublicationDoi:string
    objectId:string
    targetPage:string
    claimedFindingId:string
    claimedPrimarySourceId:string
    identityBasis:'exact-primary-citation-doi'
    status:'human-editorial-review-required'
    claimIndependentlyApproved:false
  }>
  heldChannels:Array<{channel:'editorial'|'social';reason:string;status:'held-for-human-review'}>
  disposition:'review-candidates-await-independent-adjudication'|'held-no-exact-review-targets'
  evidenceAuthority:'research-intake-not-clinical-evidence'
  clinicalPromotions:0
  publicationAllowed:false
  mutationAllowed:false
}

export type IntegratedResearchCase={
  schemaVersion:1
  pmid:string
  sourceSignature:string
  caseFile:ResearchCaseFile
  scope:ResearchCaseScope
  relay:InstrumentRelay
  scientific:ScientificIntelligenceCase
  fabric:ResearchFabricPlan
  reviewHandoff:ResearchEditorialReviewHandoff
  status:'source-bound-human-review-only'
  clinicalPromotions:0
  publicationAllowed:false
  mutationAllowed:false
}

/**
 * A missing PMID is an unavailable case, never a fallback to a global list.
 * Forged source/citation identities, contradictory integration data and an
 * uncalibrated suite throw instead of silently returning a partial case.
 */
export function buildIntegratedResearchCase(
  studio:ResearchStudio,
  graph:SemanticNetwork,
  pmid:string,
  distributionObjects:readonly DistributionIdentity[],
  reviewedStudies:readonly ReviewedStudyInput[]=[],
):IntegratedResearchCase|null{
  if(!/^\d{5,10}$/.test(pmid))return null
  const caseFile=buildResearchCaseFile(studio,graph,pmid)
  if(!caseFile)return null
  const scope=buildResearchCaseScope(studio,caseFile)
  const relay=buildInstrumentRelay(studio,graph,caseFile,scope)
  const scientific=buildScientificIntelligenceCase(studio,graph,caseFile,reviewedStudies)
  const fabric=planResearchSemanticFabric(studio,graph,caseFile,distributionObjects)

  const verifiedSignature=graph.entries[pmid]?.sourceSignature
  const instrumentIds=caseFile.instruments.map(i=>i.instrument)
  const capabilityIds=scientific.capabilities.map(c=>c.id)
  if(!verifiedSignature ||
    caseFile.sourceSignature!==verifiedSignature ||
    fabric.sourcePmid!==pmid || fabric.sourceSignature!==verifiedSignature ||
    relay.pmid!==pmid || scope.pmid!==pmid ||
    scientific.pmid!==pmid || scientific.sourceSignature!==verifiedSignature ||
    new Set(instrumentIds).size!==8 || instrumentIds.length!==8 ||
    new Set(capabilityIds).size!==SCIENCE_CAPABILITIES.length ||
    SCIENCE_CAPABILITIES.some((c,i)=>capabilityIds[i]!==c.id) ||
    scientific.capabilities.some(c=>c.releaseApproved!==false) ||
    !scientific.calibrationPassed || scientific.calibrationFailures!==0 ||
    scientific.clinicalPromotions!==0 || scientific.autopublished!==0 ||
    relay.status!=='source-bound-no-clinical-synthesis' ||
    relay.junctions.some(j=>j.pmid!==pmid||j.status!=='research-navigation-only') ||
    fabric.evidenceAuthority!=='research-intake-not-clinical-evidence' ||
    fabric.status!=='exact-publication-trace-review-only' ||
    fabric.publicationAllowed!==false || fabric.mutationAllowed!==false ||
    fabric.editorialQueue.some(x=>x.sourcePmid!==pmid||
      x.status!=='draft-requires-qualified-editorial-review') ||
    fabric.distributionReviewTargets.some(x=>
      x.status!=='publication-matched-editorial-review-required')) {
    throw Error('Integrated research case failed exact-source, scientific or review-only contract')
  }

  const core={
    schemaVersion:1 as const,pmid,sourceSignature:verifiedSignature,
    caseFile,scope,relay,scientific,fabric,
    status:'source-bound-human-review-only' as const,
    clinicalPromotions:0 as const,publicationAllowed:false as const,mutationAllowed:false as const,
  }
  return {...core,reviewHandoff:compileResearchEditorialReviewHandoff(core)}
}

/** Build from the single canonical 8+12 integrated case, never a new ledger. */
export function compileResearchEditorialReviewHandoff(
  integrated:Omit<IntegratedResearchCase,'reviewHandoff'>,
):ResearchEditorialReviewHandoff{
  const {pmid,sourceSignature,caseFile,scientific,fabric}=integrated
  if(!/^\\d{5,10}$/.test(pmid) ||
    caseFile.pmid!==pmid || caseFile.sourceSignature!==sourceSignature ||
    scientific.pmid!==pmid || scientific.sourceSignature!==sourceSignature ||
    fabric.sourcePmid!==pmid || fabric.sourceSignature!==sourceSignature ||
    caseFile.status!=='source-discovery-only-no-clinical-adjudication' ||
    fabric.evidenceAuthority!=='research-intake-not-clinical-evidence' ||
    fabric.publicationAllowed!==false || fabric.mutationAllowed!==false ||
    scientific.clinicalPromotions!==0 || scientific.autopublished!==0 ||
    scientific.calibrationPassed!==true || scientific.calibrationFailures!==0 ||
    integrated.publicationAllowed!==false || integrated.mutationAllowed!==false ||
    caseFile.instruments.length!==8 || scientific.capabilities.length!==12) {
    throw Error('Editorial handoff rejected conflicting research-only source or scientific authority')
  }
  const requests=fabric.distributionReviewTargets.map(target=>{
    if(!fabric.sourceDoi || target.matchingDoi!==fabric.sourceDoi ||
      target.provenance!=='exact-primary-citation-doi' ||
      target.status!=='publication-matched-editorial-review-required' ||
      !target.objectId || !target.targetPage || !target.citationId || !target.sourceClaimId) {
      throw Error('Editorial handoff rejected mismatched exact publication/claim identifiers')
    }
    return {
      requestId:[pmid,sourceSignature,target.objectId,target.citationId,target.sourceClaimId]
        .map(encodeURIComponent).join(':'),
      sourcePmid:pmid,sourceSignature,
      exactPublicationDoi:target.matchingDoi,
      objectId:target.objectId,targetPage:target.targetPage,
      claimedFindingId:target.sourceClaimId,claimedPrimarySourceId:target.citationId,
      identityBasis:'exact-primary-citation-doi' as const,
      status:'human-editorial-review-required' as const,
      claimIndependentlyApproved:false as const,
    }
  })
  const heldChannels=fabric.unresolvedChannels.map(hold=>({
    channel:hold.channel,reason:hold.reason,status:'held-for-human-review' as const,
  }))
  return {
    schemaVersion:1,kind:'research-editorial-review-request',
    sourcePmid:pmid,sourceSignature,sourceUrl:caseFile.sourceUrl,
    sourceDoi:fabric.sourceDoi,reviewedCitationIds:[...caseFile.reviewedCitationIds],
    instrumentCount:8,scientificProjectionCount:12,
    reviewTargets:requests,heldChannels,
    disposition:requests.length?'review-candidates-await-independent-adjudication':'held-no-exact-review-targets',
    evidenceAuthority:'research-intake-not-clinical-evidence',
    clinicalPromotions:0,publicationAllowed:false,mutationAllowed:false,
  }
}

/**
 * Consumer firewall: regenerate from the CURRENT trusted source/case/fabric.
 * Never accept a serialized claim, stale source or unreviewed approval flag
 * simply because a producer included the right DOI.
 */
export function resolveResearchEditorialReviewHandoff(
  studio:ResearchStudio,graph:SemanticNetwork,pmid:string,
  distributionObjects:readonly DistributionIdentity[],
  received:unknown,reviewedStudies:readonly ReviewedStudyInput[]=[],
):ResearchEditorialReviewHandoff{
  const trusted=buildIntegratedResearchCase(studio,graph,pmid,distributionObjects,reviewedStudies)
  if(!trusted || !received || typeof received!=='object' ||
    JSON.stringify(trusted.reviewHandoff)!==JSON.stringify(received)) {
    throw Error('Editorial review handoff identity/version/revision mismatch: human review required')
  }
  return trusted.reviewHandoff
}
