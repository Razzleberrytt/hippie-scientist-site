/** v1.13–1.14 · versioned research review, independent-rule challenges and calibration.
 * "Adversarial" means three separately computed critiques, NOT fake AI agents.
 * Calibration is deterministic, source-bound and executable in CI.
 */
import type {ResearchStudio} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'
import type {ResearchCaseFile} from './research-intelligence-casefile'
import {compileClaimDNA,detectTrialLineage,scanResearchIntegrity} from './scientific-intelligence-foundations'
import {forgeSourceHypotheses,formCitationConstellation,runBoundedInvestigation,
 simulateSourceRemoval,bridgeMechanismToHumanEvidence} from './scientific-intelligence-discovery'

export type LivingReview={
  version:'1.13';pmid:string;sourceSignature:string;revisionKey:string;
  reviewState:'draft-requires-external-synthesis';includedSourcePmids:string[];
  independentlyEstablishedTrialCount:null;approvedClinicalClaims:0;
  reviewedCitationIds:string[];openQuestions:string[];evidenceDirection:'not-adjudicated';
  publicationAllowed:false
}
export type AdversarialChallenge={
  reviewer:'methods'|'provenance'|'safety';question:string;
  disposition:'unresolved-requires-human-review';blockAutopublish:true
}
export type CalibrationCheck={
  code:string;passed:boolean;class:'identity'|'coverage'|'interpretation'|'release';
  explanation:string
}
export type CalibrationReport={
  version:'1.14';pmid:string;checks:CalibrationCheck[];failures:number;
  publicationAllowed:false;independentlyVerifiedTrialCount:null;
  reviewedSourceCount:number
}
function hash(input:string){
  // Stable identifier for local snapshot comparison, not a cryptographic source attestation.
  let h=2166136261
  for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}
  return (h>>>0).toString(16).padStart(8,'0')
}
export function compileLivingReview(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):LivingReview{
  const dna=compileClaimDNA(s,g,c)
  const lineage=detectTrialLineage(s,g,c)
  const tasks=runBoundedInvestigation(s,g,c)
  const sources=[c.pmid,...c.relatedPapers.filter(x=>Boolean(g.entries[x.pmid]))
    .slice(0,5).map(x=>x.pmid)].sort()
  return {
    version:'1.13',pmid:c.pmid,sourceSignature:c.sourceSignature,
    revisionKey:'review-'+hash([c.pmid,c.sourceSignature,
      ...sources.map(id=>id+':'+g.entries[id].sourceSignature),
      ...c.reviewedCitationIds].join('|')),
    reviewState:'draft-requires-external-synthesis',
    includedSourcePmids:sources,independentlyEstablishedTrialCount:null,
    approvedClinicalClaims:0,reviewedCitationIds:lineage.publicationAliases,
    openQuestions:[
      ...dna.missing.slice(0,4),
      ...tasks.slice(0,3).map(t=>t.question),
      'Check fresh corrections/retractions with authoritative publisher record',
    ],evidenceDirection:'not-adjudicated',publicationAllowed:false,
  }
}
export function challengeLivingReview(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):AdversarialChallenge[]{
  const review=compileLivingReview(s,g,c)
  const challenges:AdversarialChallenge[]=[
    {reviewer:'methods',question:'Are enrolled populations, interventions, endpoints and independent trials actually comparable for '+review.pmid+'?',disposition:'unresolved-requires-human-review',blockAutopublish:true},
    {reviewer:'provenance',question:'Have exact citation aliases, source signatures and any source corrections been independently verified for '+review.revisionKey+'?',disposition:'unresolved-requires-human-review',blockAutopublish:true},
    {reviewer:'safety',question:'Were adverse outcomes, contraindications and null findings checked across full text and current safety guidance?',disposition:'unresolved-requires-human-review',blockAutopublish:true},
  ]
  return challenges
}
export function calibrateIntelligenceCase(s:ResearchStudio,g:SemanticNetwork,c:ResearchCaseFile):CalibrationReport{
  const dna=compileClaimDNA(s,g,c)
  const lineage=detectTrialLineage(s,g,c)
  const constellation=formCitationConstellation(s,g,c)
  const hypothetical=forgeSourceHypotheses(s,g,c)
  const counterfactual=simulateSourceRemoval(s,g,c)
  const tasks=runBoundedInvestigation(s,g,c)
  const bridge=bridgeMechanismToHumanEvidence(s,g,c)
  const review=compileLivingReview(s,g,c)
  const integrity=scanResearchIntegrity(s,g,c)
  const checks:CalibrationCheck[]=[]
  const add=(code:string,passed:boolean,category:CalibrationCheck['class'],explanation:string)=>
    checks.push({code,passed,class:category,explanation})
  add('verified-identity',Boolean(g.entries[c.pmid]&&
    g.entries[c.pmid].sourceSignature===c.sourceSignature),'identity',
    'Selected case uses an unchanged graph signature')
  add('witness-binding',dna.witnesses.every(w=>w.id.startsWith(c.pmid+':'))||
    dna.witnesses.length===0,'identity','Quoted text witnesses stay with selected PMID')
  add('citation-subset',constellation.exactCitationIds.every(id=>
    c.reviewedCitationIds.includes(id)),'identity','Only independently registered citation IDs')
  add('independence-unresolved',lineage.underlyingTrialIndependence==='unknown',
    'interpretation','No independence inferred from duplicate publication identity')
  add('direction-unreviewed',dna.effectDirection===null,'interpretation',
    'No effect direction inferred from intake title or abstract')
  add('hypotheses-unverified',hypothetical.every(x=>x.status==='hypothesis-unverified'&&
    x.pmid===c.pmid&&x.sourceSignature===c.sourceSignature),'interpretation',
    'All forged hypotheses are marked unverified and source-bound')
  add('counterfactual-nonclinical',counterfactual.changedScientificConclusion===false,
    'interpretation','Graph removal never claims altered medical conclusions')
  add('bounded-missions',tasks.length<=5&&tasks.every(x=>x.pmid===c.pmid&&
    !x.automaticallyPublished),'coverage','Local missions are finite and remain review-only')
  add('constellation-sources',constellation.indexedNeighbors.every(id=>Boolean(g.entries[id])),
    'coverage','Neighbors are part of the pinned graph')
  add('mechanism-firewall',!bridge.humanEvidenceEstablished&&!bridge.mechanismEstablished,
    'interpretation','Text co-occurrence cannot authenticate mechanistic-human translation')
  add('living-review-blocked',!review.publicationAllowed&&review.approvedClinicalClaims===0,
    'release','Review version is draft only')
  add('adversarial-release-veto',challengeLivingReview(s,g,c).every(x=>x.blockAutopublish),
    'release','Every independent critique blocks clinical publication pending human review')
  add('integrity-flags-logged',integrity.every(x=>x.pmid===c.pmid),
    'identity','Identity and corrections flags stay source-specific')
  return {
    version:'1.14',pmid:c.pmid,checks,failures:checks.filter(x=>!x.passed).length,
    publicationAllowed:false,independentlyVerifiedTrialCount:null,
    reviewedSourceCount:c.reviewedCitationIds.length,
  }
}
