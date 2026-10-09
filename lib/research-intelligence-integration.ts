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
 * A transfer receipt, NOT a clinical finding or approved editorial claim.
 * Distribution claim/source IDs are existing *claimed* identifiers associated
 * with a matching publication; they are not proof of independent review.
 */
export type EditorialReviewRequest={
  requestId:string
  pmid:string
  sourceSignature:string
  primaryDoi:string
  objectId:string
  targetPage:string
  claimedFindingId:string
  claimedSourceId:string
  status:'requires-independent-human-review'
  basis:'exact-publication-identity-not-claim-support'
}
export type ResearchEditorialReviewHandoff={
  schemaVersion:1
  eventType:'research-editorial-review-request'
  sourcePmid:string
  sourceSignature:string
  sourceUrl:string
  sourceDoi:string|null
  separatelyReviewedCitationIds:string[]
  instrumentCount:8
  scientificProjectionCount:12
  draftBriefIds:string[]
  requests:EditorialReviewRequest[]
  heldReasons:Array<{channel:'editorial'|'social';reason:string}>
  status:'review-requests-pending'|'held-no-exact-review-target'
  evidenceAuthority:'ungraded-research-intake'
  humanReviewRequired:true
  clinicalClaimsApproved:0
  automaticPublications:0
  publicationAllowed:false
  mutationAllowed:false
}

/** Identities are pinned to the *already validated* 8+12+Fabric case. */
export function buildResearchEditorialReviewHandoff(
  integrated:Pick<IntegratedResearchCase,
    'pmid'|'sourceSignature'|'caseFile'|'scientific'|'fabric'|'relay'|
    'clinicalPromotions'|'publicationAllowed'|'mutationAllowed'>,
):ResearchEditorialReviewHandoff{
  const {pmid,sourceSignature,caseFile,scientific,fabric,relay}=integrated
  if(!/^\d{5,10}$/.test(pmid)||!sourceSignature||
    caseFile.pmid!==pmid||caseFile.sourceSignature!==sourceSignature||
    fabric.sourcePmid!==pmid||fabric.sourceSignature!==sourceSignature||
    relay.pmid!==pmid||scientific.pmid!==pmid||
    scientific.sourceSignature!==sourceSignature||
    caseFile.instruments.length!==8||scientific.capabilities.length!==12||
    scientific.calibrationPassed!==true||scientific.calibrationFailures!==0||
    scientific.clinicalPromotions!==0||scientific.autopublished!==0||
    integrated.clinicalPromotions!==0||
    integrated.publicationAllowed!==false||integrated.mutationAllowed!==false||
    fabric.evidenceAuthority!=='research-intake-not-clinical-evidence'||
    fabric.publicationAllowed!==false||fabric.mutationAllowed!==false||
    JSON.stringify(fabric.reviewedCitationIds)!==JSON.stringify(caseFile.reviewedCitationIds)||
    fabric.distributionReviewTargets.some(t=>
      !fabric.sourceDoi||t.matchingDoi!==fabric.sourceDoi||
      t.status!=='publication-matched-editorial-review-required')) {
    throw Error('Editorial handoff rejected inconsistent research-only source or permission authority')
  }
  const requests:EditorialReviewRequest[]=fabric.distributionReviewTargets.map(t=>({
    // JSON tuple avoids ambiguous delimiter collisions and preserves identity.
    requestId:JSON.stringify([pmid,sourceSignature,t.objectId,t.citationId,t.sourceClaimId,t.matchingDoi]),
    pmid,sourceSignature,primaryDoi:t.matchingDoi,
    objectId:t.objectId,targetPage:t.targetPage,
    claimedFindingId:t.sourceClaimId,claimedSourceId:t.citationId,
    status:'requires-independent-human-review' as const,
    basis:'exact-publication-identity-not-claim-support' as const,
  })).sort((a,b)=>a.requestId.localeCompare(b.requestId))
  if(new Set(requests.map(r=>r.requestId)).size!==requests.length)
    throw Error('Editorial handoff rejected duplicate exact review request identity')
  return {
    schemaVersion:1,eventType:'research-editorial-review-request',
    sourcePmid:pmid,sourceSignature,sourceUrl:caseFile.sourceUrl,
    sourceDoi:fabric.sourceDoi,
    separatelyReviewedCitationIds:[...caseFile.reviewedCitationIds].sort(),
    instrumentCount:8,scientificProjectionCount:12,
    draftBriefIds:[...new Set(fabric.editorialQueue.map(b=>b.briefId))].sort(),
    requests,
    heldReasons:fabric.unresolvedChannels.map(c=>({channel:c.channel,reason:c.reason}))
      .sort((a,b)=>a.channel.localeCompare(b.channel)),
    status:requests.length||fabric.editorialQueue.length
      ?'review-requests-pending':'held-no-exact-review-target',
    evidenceAuthority:'ungraded-research-intake',
    humanReviewRequired:true,
    clinicalClaimsApproved:0,automaticPublications:0,
    publicationAllowed:false,mutationAllowed:false,
  }
}

/**
 * Consumer must have the current source/graph and all original identity
 * inputs. Exact structural equality rejects unknown versions/fields, foreign
 * claim IDs, signatures, DOI drift, approval flags and stale source revisions.
 */
export function validateResearchEditorialReviewHandoff(
  raw:unknown,
  studio:ResearchStudio,graph:SemanticNetwork,pmid:string,
  distributionObjects:readonly DistributionIdentity[],
  reviewedStudies:readonly ReviewedStudyInput[]=[],
):ResearchEditorialReviewHandoff{
  const fresh=buildIntegratedResearchCase(studio,graph,pmid,distributionObjects,reviewedStudies)
  if(!fresh||!raw||typeof raw!=='object'||
    JSON.stringify(raw)!==JSON.stringify(fresh.reviewHandoff)) {
    throw Error('Editorial handoff rejected stale, foreign, unreviewed or altered receipt')
  }
  return fresh.reviewHandoff
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

  const base={
    pmid,sourceSignature:verifiedSignature,caseFile,scope,relay,scientific,fabric,
    status:'source-bound-human-review-only' as const,
    clinicalPromotions:0 as const,publicationAllowed:false as const,mutationAllowed:false as const,
  }
  return {...base,schemaVersion:1,reviewHandoff:buildResearchEditorialReviewHandoff(base)}
}
