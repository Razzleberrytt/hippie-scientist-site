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
 * Research-only, versioned handoff to the EXISTING editorial review workflow.
 * Source indexes, separately reviewed citation crosswalks and distribution
 * claim IDs are different authorities. Even an exact DOI join only proposes
 * a review target; no clinical finding or publish permission is carried.
 */
export type ResearchEditorialReviewRequestV1={
  schemaVersion:1
  kind:'research-editorial-review-request'
  source:{
    pmid:string
    sourceSignature:string
    sourceUrl:string
    exactDoi:string|null
    witnessIds:string[]
  }
  indexedReviewedCitationIds:string[]
  instrumentIds:string[]
  scientificCapabilityIds:string[]
  reviewTargets:Array<{
    objectId:string
    targetPage:string
    existingClaimId:string
    existingCitationId:string
    exactPublicationDoi:string
    joinBasis:'exact-primary-doi-identity-only'
    claimAdjudication:'not-established-by-this-envelope'
    disposition:'qualified-human-editorial-review-required'
  }>
  heldReasons:string[]
  status:'qualified-human-review-required'|'held-no-exact-review-target'
  evidenceAuthority:'research-source-identity-only'
  approvalAuthority:'not-provided'
  underlyingTrialIndependence:'unknown'
  clinicalPromotions:0
  publicationAllowed:false
  mutationAllowed:false
}

function compileEditorialReviewRequest(
  studio:ResearchStudio,
  c:ResearchCaseFile,
  scientific:ScientificIntelligenceCase,
  fabric:ResearchFabricPlan,
):ResearchEditorialReviewRequestV1{
  if(fabric.sourcePmid!==c.pmid||fabric.sourceSignature!==c.sourceSignature||
    scientific.pmid!==c.pmid||scientific.sourceSignature!==c.sourceSignature||
    fabric.publicationAllowed!==false||fabric.mutationAllowed!==false||
    scientific.clinicalPromotions!==0||scientific.autopublished!==0||
    scientific.capabilities.some(x=>x.releaseApproved!==false)||
    JSON.stringify(fabric.reviewedCitationIds)!==JSON.stringify(c.reviewedCitationIds)){
    throw Error('Editorial handoff requires exact source identity and research-only permissions')
  }
  const dna=studio.dna.find(x=>x.pmid===c.pmid)
  if(!dna||dna.sourceUrl!==c.sourceUrl||
    dna.sourceWitnesses.some(w=>w.pmid!==c.pmid||
      w.sourceSignature!==c.sourceSignature)){
    throw Error('Editorial handoff requires canonical PMID and unmodified source witnesses')
  }
  const sourceDoi=fabric.sourceDoi
  const reviewTargets=fabric.distributionReviewTargets.map(t=>{
    if(!sourceDoi||t.matchingDoi!==sourceDoi||
      t.status!=='publication-matched-editorial-review-required'||
      t.provenance!=='exact-primary-citation-doi'||
      !t.objectId||!t.citationId||!t.sourceClaimId){
      throw Error('Editorial handoff rejected an unverified publication/claim identity')
    }
    return {
      objectId:t.objectId,
      targetPage:t.targetPage,
      existingClaimId:t.sourceClaimId,
      existingCitationId:t.citationId,
      exactPublicationDoi:sourceDoi,
      joinBasis:'exact-primary-doi-identity-only' as const,
      claimAdjudication:'not-established-by-this-envelope' as const,
      disposition:'qualified-human-editorial-review-required' as const,
    }
  }).sort((a,b)=>a.objectId.localeCompare(b.objectId)||
      a.existingCitationId.localeCompare(b.existingCitationId)||
      a.existingClaimId.localeCompare(b.existingClaimId))
  const heldReasons=reviewTargets.length?[]:[
    sourceDoi?'No exact DOI plus existing claim/source identity review target':'No exact source DOI',
  ]
  return {
    schemaVersion:1,kind:'research-editorial-review-request',
    source:{
      pmid:c.pmid,sourceSignature:c.sourceSignature,sourceUrl:c.sourceUrl,
      exactDoi:sourceDoi,witnessIds:dna.sourceWitnesses.map(w=>w.id).sort(),
    },
    indexedReviewedCitationIds:[...c.reviewedCitationIds].sort(),
    instrumentIds:c.instruments.map(i=>i.instrument),
    scientificCapabilityIds:scientific.capabilities.map(i=>i.id),
    reviewTargets,heldReasons,
    status:reviewTargets.length?'qualified-human-review-required':'held-no-exact-review-target',
    evidenceAuthority:'research-source-identity-only',approvalAuthority:'not-provided',
    underlyingTrialIndependence:'unknown',
    clinicalPromotions:0,publicationAllowed:false,mutationAllowed:false,
  }
}

/** Validate a serialized packet against the CURRENT canonical integrated case.
 * Any source revision, swapped PMID/DOI/claim/citation, unknown version,
 * unauthorized field or publication flag invalidates the packet.
 */
export function validateResearchEditorialReviewRequest(
  integrated:IntegratedResearchCase,
  packet:unknown,
):ResearchEditorialReviewRequestV1{
  if(!integrated||integrated.status!=='source-bound-human-review-only'||
    integrated.caseFile.pmid!==integrated.pmid||
    integrated.caseFile.sourceSignature!==integrated.sourceSignature||
    integrated.fabric.sourcePmid!==integrated.pmid||
    integrated.fabric.sourceSignature!==integrated.sourceSignature||
    integrated.scientific.pmid!==integrated.pmid||
    integrated.scientific.sourceSignature!==integrated.sourceSignature||
    integrated.publicationAllowed!==false||integrated.mutationAllowed!==false||
    integrated.clinicalPromotions!==0){
    throw Error('Review packet context is stale, contradictory or grants unauthorized authority')
  }
  // Trust only the already calibrated canonical output; not a caller's claim
  // that a matching DOI is independently reviewed clinical evidence.
  const expected=integrated.reviewRequest
  if(!packet||typeof packet!=='object'||Array.isArray(packet)||
    JSON.stringify(packet)!==JSON.stringify(expected)){
    throw Error('Review packet source, version, target or permissions differ from canonical case')
  }
  return expected
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
  reviewRequest:ResearchEditorialReviewRequestV1
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

  return {
    schemaVersion:1,pmid,sourceSignature:verifiedSignature,
    caseFile,scope,relay,scientific,fabric,
    reviewRequest:compileEditorialReviewRequest(studio,caseFile,scientific,fabric),
    status:'source-bound-human-review-only',
    clinicalPromotions:0,publicationAllowed:false,mutationAllowed:false,
  }
}
