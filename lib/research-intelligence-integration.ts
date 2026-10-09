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

/** An immutable, local, source-identity REVIEW REQUEST, not an approval. */
export type ResearchReviewRequestV1={
  schemaVersion:1
  kind:'ResearchReviewRequested.v1'
  sourcePmid:string
  sourceSignature:string
  sourceDoi:string|null
  reviewedCitationIds:string[]
  researchInstrumentIds:string[]
  scientificCapabilityIds:string[]
  editorialCandidates:Array<{briefId:string;sourcePmid:string;status:'draft-requires-qualified-editorial-review'}>
  distributionTargets:Array<{
    objectId:string;targetPage:string;matchingDoi:string;existingClaimId:string;existingPrimarySourceId:string
    status:'publication-matched-editorial-review-required'
  }>
  unresolvedChannels:Array<{channel:'editorial'|'social';reason:string}>
  status:'human-review-required'|'held-no-exact-target'
  authority:'source-identity-only-not-claim-support'
  independentClaimApproved:false
  mutationAllowed:false
  publicationAllowed:false
}

function compileReviewRequest(input: {
  pmid:string
  signature:string
  caseFile:ResearchCaseFile
  scientific:ScientificIntelligenceCase
  fabric:ResearchFabricPlan
}):ResearchReviewRequestV1{
  const {pmid,signature,caseFile,scientific,fabric}=input
  if(!signature||caseFile.pmid!==pmid||caseFile.sourceSignature!==signature||
    scientific.pmid!==pmid||scientific.sourceSignature!==signature||
    fabric.sourcePmid!==pmid||fabric.sourceSignature!==signature||
    fabric.publicationAllowed!==false||fabric.mutationAllowed!==false||
    scientific.clinicalPromotions!==0||scientific.autopublished!==0){
    throw Error('Review request source identity or non-promotion policy mismatch')
  }
  return {
    schemaVersion:1,kind:'ResearchReviewRequested.v1',
    sourcePmid:pmid,sourceSignature:signature,sourceDoi:fabric.sourceDoi,
    reviewedCitationIds:[...caseFile.reviewedCitationIds],
    researchInstrumentIds:caseFile.instruments.map(i=>i.instrument),
    scientificCapabilityIds:scientific.capabilities.map(c=>c.id),
    editorialCandidates:fabric.editorialQueue.map(x=>({
      briefId:x.briefId,sourcePmid:x.sourcePmid,status:x.status,
    })),
    distributionTargets:fabric.distributionReviewTargets.map(x=>({
      objectId:x.objectId,targetPage:x.targetPage,matchingDoi:x.matchingDoi,
      existingClaimId:x.sourceClaimId,existingPrimarySourceId:x.citationId,status:x.status,
    })),
    unresolvedChannels:fabric.unresolvedChannels.map(x=>({channel:x.channel,reason:x.reason})),
    status:fabric.editorialQueue.length||fabric.distributionReviewTargets.length
      ?'human-review-required':'held-no-exact-target',
    authority:'source-identity-only-not-claim-support',
    independentClaimApproved:false,mutationAllowed:false,publicationAllowed:false,
  }
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
  reviewRequest:ResearchReviewRequestV1
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
    reviewRequest:compileReviewRequest({
      pmid,signature:verifiedSignature,caseFile,scientific,fabric,
    }),
    status:'source-bound-human-review-only',
    clinicalPromotions:0,publicationAllowed:false,mutationAllowed:false,
  }
}

/**
 * A consumer must re-evaluate against the EXACT canonical source+review dataset.
 * The caller-supplied payload alone cannot approve a claim, reuse a stale
 * signature, or silently add a publication permission.
 */
export function validateResearchReviewRequest(
  candidate:unknown,studio:ResearchStudio,graph:SemanticNetwork,pmid:string,
  objects:readonly DistributionIdentity[],reviewedStudies:readonly ReviewedStudyInput[]=[],
):ResearchReviewRequestV1{
  const integrated=buildIntegratedResearchCase(studio,graph,pmid,objects,reviewedStudies)
  if(!integrated)throw Error('Review request cannot resolve an exact PMID case')
  const canonical=integrated.reviewRequest
  if(JSON.stringify(candidate)!==JSON.stringify(canonical)){
    throw Error('Review request version, source, claims, target identity or review-only contract mismatch')
  }
  return canonical
}
