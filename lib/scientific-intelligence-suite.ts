/** Scientific Intelligence Suite v1.08–v1.14.
 * A single typed, source-bound read-only orchestration contract for all twelve
 * research capabilities. All outputs carry explicit uncertainty / stop rules.
 */
import type {ResearchStudio,ReviewedStudyInput} from './research-intelligence-studio'
import {compileReviewedClaimFacets} from './scientific-intelligence-reviewed'
import type {SemanticNetwork} from './research-semantic-network'
import {buildResearchCaseFile,type ResearchCaseFile} from './research-intelligence-casefile'
import {compileClaimDNA,detectTrialLineage,compareStudyContexts,scanResearchIntegrity} from './scientific-intelligence-foundations'
import {forgeSourceHypotheses,simulateSourceRemoval,runBoundedInvestigation,
 formCitationConstellation,bridgeMechanismToHumanEvidence} from './scientific-intelligence-discovery'
import {compileLivingReview,challengeLivingReview,calibrateIntelligenceCase} from './scientific-intelligence-review'

export type ScienceCapability={
  id:string;version:string;name:string;summary:string;findings:string[];
  receipt:unknown;limitation:string;releaseApproved:false
}
export type ScientificIntelligenceCase={
  pmid:string;sourceSignature:string;version:'1.14';
  capabilities:ScienceCapability[];calibrationPassed:boolean;
  calibrationChecks:number;calibrationFailures:number;clinicalPromotions:0;autopublished:0
}
export const SCIENCE_CAPABILITIES=[
  {id:'claim-dna',version:'1.08',name:'Claim DNA'},
  {id:'trial-lineage',version:'1.08',name:'Trial Lineage Detective'},
  {id:'comparability',version:'1.09',name:'Evidence Comparability Engine'},
  {id:'integrity',version:'1.09',name:'Research Integrity Radar'},
  {id:'hypotheses',version:'1.10',name:'Hypothesis Forge'},
  {id:'counterfactual',version:'1.10',name:'Counterfactual Evidence Laboratory'},
  {id:'missions',version:'1.11',name:'Autonomous Research Missions'},
  {id:'citations',version:'1.12',name:'Citation Constellations'},
  {id:'mechanism',version:'1.12',name:'Mechanism-to-Human Evidence Bridge'},
  {id:'living',version:'1.13',name:'Living Evidence Review Compiler'},
  {id:'adversarial',version:'1.13',name:'Scientific Adversarial Review Arena'},
  {id:'calibration',version:'1.14',name:'Scientific Intelligence Calibration Lab'},
] as const
const absent='No global absence or safety conclusion can be drawn from missing indexed leads.'
export function buildScientificIntelligenceCase(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile,published:readonly ReviewedStudyInput[]=[]):ScientificIntelligenceCase{
  const claim=compileClaimDNA(s,g,c),lineage=detectTrialLineage(s,g,c)
  const reviewedClaims=compileReviewedClaimFacets(s,g,c,published)
  const compared=c.relatedPapers.slice(0,3).flatMap(link=>{
    const other=buildResearchCaseFile(s,g,link.pmid)
    return other?[compareStudyContexts(s,g,c,other)]:[]
  })
  const integrity=scanResearchIntegrity(s,g,c)
  const hypotheses=forgeSourceHypotheses(s,g,c)
  const counter=simulateSourceRemoval(s,g,c)
  const missions=runBoundedInvestigation(s,g,c)
  const constellation=formCitationConstellation(s,g,c)
  const mechanism=bridgeMechanismToHumanEvidence(s,g,c)
  const living=compileLivingReview(s,g,c)
  const adversarial=challengeLivingReview(s,g,c)
  const calibration=calibrateIntelligenceCase(s,g,c)
  const make=(i:number,summary:string,findings:string[],receipt:unknown,limitation:string):ScienceCapability=>({
    ...SCIENCE_CAPABILITIES[i],summary,findings,receipt,limitation,releaseApproved:false
  })
  const capabilities:ScienceCapability[]=[
    make(0,'Structured descriptors of what this publication mentions, not proof of what it found.',
      ['Interventions: '+(claim.interventions.join(', ')||'unknown'),
       'Outcomes: '+(claim.outcomes.join(', ')||'unknown'),
       'Population: '+(claim.population.join(', ')||'unknown'),
       'Unreviewed intake effect direction: unknown',
       reviewedClaims.length+' independently published exact-citation relationship descriptor(s)',
       ...reviewedClaims.slice(0,3).map(r=>r.intervention+': '+(r.outcome||'outcome unspecified')+
         ' · reviewed label '+r.reviewedRelationship+' · studied dose '+(r.studiedDose||'unknown'))],
       {sourceOnly:claim,reviewedExactCitationFacets:reviewedClaims},
      'No efficacy, safety, sample-size, preparation or dose inference without independent full-text review.'),
    make(1,'Exact publication aliases; underlying cohort/trial independence remains unknown.',
      [lineage.publicationAliases.length+' matching reviewed citation IDs',
       lineage.duplicateCitationGroups.length+' duplicate citation group(s)',
       lineage.identityConflictIds.length+' quarantined ID conflict(s)'],lineage,
      'Registration numbers, enrollment cohorts and participant overlap require external review.'),
    make(2,'Compare descriptor compatibility only within explicitly indexed neighboring PMIDs.',
      compared.length?compared.map(x=>'PMID '+x.right+': '+x.verdict+'; population '+x.population):
      ['No source-indexed comparison eligible. '+absent],compared,
      'Equivalent effects or exchangeable doses are never inferred from matching indexed terms.'),
    make(3,'Flags incomplete source and publication integrity metadata before review.',
      integrity.map(x=>x.id+': '+x.reason),integrity,
      'Retraction/correction status is NOT live checked; consult authoritative publisher and notice databases.'),
    make(4,'Falsifiable questions generated strictly from same-source indexed vocabulary.',
      hypotheses.length?hypotheses.map(h=>h.question):
      ['No eligible substance/outcome co-mention in this indexed source.'],hypotheses,
      'Questions are not predictions, causal associations or demonstrations of benefit.'),
    make(5,'Simulates excluding a source from its bibliographic neighbor map.',
      ['Affected indexed neighbor links: '+counter.affectedLinks,
       'Neighbor papers with other indexed links: '+counter.remainingNeighbors],
      counter,'This is graph sensitivity, not a re-estimation of clinical effects or certainty.'),
    make(6,'Automatically executes bounded local source checks and queues unresolved review steps.',
      missions.map(m=>m.question+' · '+m.actions.filter(a=>a.state==='locally-checked').length+
        ' local check(s)'),missions,
      'No external literature search, autonomous agent or publication is claimed.'),
    make(7,'Navigable cluster distinguishes exact citation identity from textual paper proximity.',
      [constellation.exactCitationIds.length+' exact reviewed citation ID(s)',
       constellation.indexedNeighbors.length+' bibliographic neighbors'],
      constellation,'Citation proximity does not establish independent trials or corroborating effects.'),
    make(8,'Conservative bridge requires both verified mechanism and independent human outcomes.',
      mechanism.missing,mechanism,
      'No authenticated mechanism/human inference can be made from this source-only schema.'),
    make(9,'Deterministic version key tracks source-signature and citation changes.',
      ['Snapshot '+living.revisionKey,
       'Included source PMIDs: '+living.includedSourcePmids.join(', '),
       living.openQuestions.length+' unresolved review questions'],living,
      'This is a versioned review draft, not a continuously refreshed systematic review.'),
    make(10,'Three independent methodological, provenance and safety rule critiques.',
      adversarial.map(x=>x.reviewer+': '+x.question),adversarial,
      'Rule-based adversarial checks; not human peer review or independent AI scientists.'),
    make(11,'Executable identity, interpretation, coverage and release invariants.',
      [calibration.checks.length+' invariant checks',
       calibration.failures+' failures',...calibration.checks.filter(x=>!x.passed).map(x=>x.code)],
      calibration,
      'A passing calibration ensures internal guardrails, not correctness of scientific conclusions.'),
  ]
  if(capabilities.length!==12||new Set(capabilities.map(x=>x.id)).size!==12)
    throw Error('Scientific capability registry incomplete')
  return {pmid:c.pmid,sourceSignature:c.sourceSignature,version:'1.14',
    capabilities,calibrationPassed:calibration.failures===0,
    calibrationChecks:calibration.checks.length,calibrationFailures:calibration.failures,
    clinicalPromotions:0,autopublished:0}
}
