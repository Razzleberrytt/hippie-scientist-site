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

export type IntegratedResearchCase={
  schemaVersion:1
  pmid:string
  sourceSignature:string
  caseFile:ResearchCaseFile
  scope:ResearchCaseScope
  relay:InstrumentRelay
  scientific:ScientificIntelligenceCase
  fabric:ResearchFabricPlan
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
    status:'source-bound-human-review-only',
    clinicalPromotions:0,publicationAllowed:false,mutationAllowed:false,
  }
}


/**
 * Research → editorial request boundary. This is a stateless projection of
 * an exact source case, not a second review ledger or a publishing command.
 * A DOI, a source-text witness or a pre-existing claim ID is NOT an approved
 * scientific finding. Consumers must re-derive it from current authorities.
 */
export type ResearchEditorialReviewHandoffV1={
  schemaVersion:1
  kind:'research-source-to-editorial-review'
  identity:{
    pmid:string
    sourceSignature:string
    sourceDoi:string|null
  }
  trace:{
    sourceWitnessCount:number
    reviewedCitationIds:string[]
    originalInstrumentCount:8
    scientificProjectionCount:12
    reviewedCitationCrosswalkIsClaimApproval:false
  }
  reviewTargets:Array<{
    objectId:string
    targetPage:string
    primarySourceId:string
    findingClaimId:string
    exactPrimaryDoi:string
    status:'requires-independent-human-editorial-review'
    identityBasis:'exact-publication-doi-not-claim-evidence'
  }>
  draftBriefs:Array<{
    briefId:string
    sourcePmid:string
    status:'requires-qualified-editorial-review'
  }>
  unresolved:Array<{channel:'editorial'|'social';reason:string}>
  disposition:'human-review-required'|'held-no-source-linked-review-target'
  sourceAuthority:'research-intake-not-clinical-evidence'
  clinicalPromotions:0
  mutationAllowed:false
  publicationAllowed:false
}

/**
 * Builds a revision-pinned review REQUEST from the already-governed 8+12
 * integrated case and existing exact-DOI fabric. No new factual authority.
 */
export function buildResearchEditorialReviewHandoff(
  studio:ResearchStudio,
  graph:SemanticNetwork,
  pmid:string,
  distributionObjects:readonly DistributionIdentity[],
  reviewedStudies:readonly ReviewedStudyInput[]=[],
):ResearchEditorialReviewHandoffV1|null{
  const integrated=buildIntegratedResearchCase(studio,graph,pmid,distributionObjects,reviewedStudies)
  if(!integrated)return null
  const {caseFile,scientific,fabric}=integrated
  if(integrated.status!=='source-bound-human-review-only'||
     integrated.publicationAllowed!==false||integrated.mutationAllowed!==false||
     integrated.clinicalPromotions!==0||
     caseFile.pmid!==pmid||fabric.sourcePmid!==pmid||
     caseFile.sourceSignature!==integrated.sourceSignature||
     fabric.sourceSignature!==integrated.sourceSignature||
     caseFile.instruments.length!==8||scientific.capabilities.length!==12||
     !scientific.calibrationPassed||scientific.calibrationFailures!==0||
     scientific.clinicalPromotions!==0||scientific.autopublished!==0||
     fabric.evidenceAuthority!=='research-intake-not-clinical-evidence'||
     fabric.publicationAllowed!==false||fabric.mutationAllowed!==false){
    throw Error('Research editorial handoff cannot widen existing source or review authority')
  }
  const reviewTargets=fabric.distributionReviewTargets.map(target=>({
    objectId:target.objectId,
    targetPage:target.targetPage,
    primarySourceId:target.citationId,
    findingClaimId:target.sourceClaimId,
    exactPrimaryDoi:target.matchingDoi,
    status:'requires-independent-human-editorial-review' as const,
    identityBasis:'exact-publication-doi-not-claim-evidence' as const,
  })).sort((a,b)=>a.objectId.localeCompare(b.objectId)||
    a.primarySourceId.localeCompare(b.primarySourceId))
  const draftBriefs=fabric.editorialQueue.map(brief=>({
    briefId:brief.briefId,
    sourcePmid:brief.sourcePmid,
    status:'requires-qualified-editorial-review' as const,
  })).sort((a,b)=>a.briefId.localeCompare(b.briefId))
  const unresolved=fabric.unresolvedChannels.map(item=>({
    channel:item.channel,reason:item.reason,
  })).sort((a,b)=>a.channel.localeCompare(b.channel)||a.reason.localeCompare(b.reason))
  if(reviewTargets.some(t=>!fabric.sourceDoi||
    t.exactPrimaryDoi!==fabric.sourceDoi||
    !t.findingClaimId||!t.primarySourceId)||
    draftBriefs.some(b=>b.sourcePmid!==pmid)){
    throw Error('Research editorial handoff has conflicting exact source identity')
  }
  return {
    schemaVersion:1,
    kind:'research-source-to-editorial-review',
    identity:{pmid,sourceSignature:integrated.sourceSignature,sourceDoi:fabric.sourceDoi},
    trace:{
      sourceWitnessCount:caseFile.sourceWitnessCount,
      reviewedCitationIds:[...caseFile.reviewedCitationIds].sort(),
      originalInstrumentCount:8,scientificProjectionCount:12,
      reviewedCitationCrosswalkIsClaimApproval:false,
    },
    reviewTargets,draftBriefs,unresolved,
    disposition:reviewTargets.length||draftBriefs.length
      ?'human-review-required':'held-no-source-linked-review-target',
    sourceAuthority:'research-intake-not-clinical-evidence',
    clinicalPromotions:0,mutationAllowed:false,publicationAllowed:false,
  }
}

/**
 * Strict consumer boundary: a previously prepared handoff expires when ANY
 * exact source, graph, claim/source association or reviewed-citation input
 * changes. Unknown schema, extra/missing payload fields and forged approvals
 * fail closed rather than being copied to a publishable artifact.
 */
export function verifyResearchEditorialReviewHandoff(
  candidate:unknown,
  studio:ResearchStudio,
  graph:SemanticNetwork,
  pmid:string,
  distributionObjects:readonly DistributionIdentity[],
  reviewedStudies:readonly ReviewedStudyInput[]=[],
):ResearchEditorialReviewHandoffV1{
  if(!candidate||typeof candidate!=='object'||Array.isArray(candidate)||
    (candidate as {schemaVersion?:unknown}).schemaVersion!==1){
    throw Error('Research editorial handoff has unknown or invalid schema version')
  }
  const current=buildResearchEditorialReviewHandoff(
    studio,graph,pmid,distributionObjects,reviewedStudies,
  )
  if(!current||JSON.stringify(candidate)!==JSON.stringify(current)){
    throw Error('Research editorial handoff is stale, forged or does not match the current exact source/review identity')
  }
  return current
}
