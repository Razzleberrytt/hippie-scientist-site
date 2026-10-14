/**
 * #6769 candidate / NOT admitted. Repository-side adapter for exactly one
 * source-bound read-only semantic opportunity report. Safe only in a trusted
 * server/build process. No API endpoint, scheduler, dynamic route or write.
 *
 * Bind the existing controlled source register, Studio, semantic network,
 * eight+12 integrated case, Insight Foundry and review-only fabric. Never
 * treat a signed research publication as an independently approved claim.
 */
import 'server-only'
import {getResearchSourceRegister} from './research-source-register'
import {buildResearchSemanticNetwork,semanticSourceSignature} from './research-semantic-network'
import {buildResearchIntelligenceStudio,type ReviewedStudyInput} from './research-intelligence-studio'
import {discoverResearchIntake} from './research-intelligence-discovery'
import {buildIntegratedResearchCase,type IntegratedResearchCase} from './research-intelligence-integration'
import type {DistributionIdentity} from './research-semantic-fabric'
import currentDistributionObjects from '../data/distribution/research-objects.json'
import {createOpportunity,validateOpportunity,digest} from '../research/insight-foundry/src/contracts.mjs'
import {inspectResearchStudio} from '../research/insight-foundry/src/ths-studio-adapter.mjs'
import {compileOpportunityReport,verifyOpportunityReport} from '../research/insight-foundry/src/opportunity-compiler.mjs'

type QuestionScope={
  population:string
  intervention:string
  comparator:string
  outcomes:string[]
  timeframe:string
}
type ResearchOrigin={kind:string;referenceId:string;limitation:string}
/**
 * Only a research question, scope, source selection and investigation rationale
 * may be supplied by the caller. All source and distribution authorities are
 * reconstructed from governed current imports; NOT from args supplied by a
 * page, worker, user, LLM, local JSON or a stale report.
 *
 * There is currently no independently verified article-section, comparison-
 * revision, or trial-lineage loader. Those integrations deliberately return
 * unresolved findings instead of trusting a caller's `verified: true` flag.
 * Future integration must add actual authenticated upstream loaders, not
 * broaden this input type to admit fake authority receipts.
 */
export type SemanticOpportunityCompileArgs={
  question:string
  pico:QuestionScope
  /** Supply one of exact selected PMIDs OR a local-catalog discovery query. */
  selectedPmids?:string[]
  discoveryQuery?:string
  originSignals:ResearchOrigin[]
}

const PMID=/^\d{5,10}$/
const TRUSTED_FIELDS=new Set(['question','pico','selectedPmids','discoveryQuery','originSignals'])
const isPlainObject=(x:unknown):x is Record<string,unknown>=>{
  if(!x||typeof x!=='object'||Array.isArray(x))return false
  const proto=Object.getPrototypeOf(x)
  // Accept plain records from a separate JS realm, not custom class instances.
  return proto!==null&&(proto===Object.prototype||Object.getPrototypeOf(proto)===null)
}
const bounded=(v:unknown,max:number):v is string=>
  typeof v==='string'&&v.trim().length>0&&v.length<=max

/**
 * Cheap input validation must run BEFORE loading the 500-record source register.
 * A caller can propose a question; a caller cannot assert scientific authority.
 * This is a size/shape check, not user consent or verified research evidence.
 */
export function validateResearchOpportunityRequest(args:unknown):asserts args is SemanticOpportunityCompileArgs{
  if(!isPlainObject(args)||Object.keys(args).some(k=>!TRUSTED_FIELDS.has(k)))
    throw Error('Semantic Opportunity Compiler adapter: untrusted external authority or unknown input field')
  if(!bounded(args.question,500)||!isPlainObject(args.pico))
    throw Error('Semantic Opportunity Compiler adapter: missing or unbounded research question/PICO')
  const scope=args.pico
  if(Object.keys(scope).some(k=>!['population','intervention','comparator','outcomes','timeframe'].includes(k))||
    !['population','intervention','comparator','timeframe'].every(k=>bounded(scope[k],250))||
    !Array.isArray(scope.outcomes)||scope.outcomes.length<1||scope.outcomes.length>12||
    !scope.outcomes.every((x:unknown)=>bounded(x,250)))
    throw Error('Semantic Opportunity Compiler adapter: invalid or unbounded PICO scope')
  if(!Array.isArray(args.originSignals)||args.originSignals.length<1||args.originSignals.length>12||
    !args.originSignals.every((v:unknown)=>isPlainObject(v)&&
      Object.keys(v).every(k=>['kind','referenceId','limitation'].includes(k))&&
      bounded(v.kind,100)&&bounded(v.referenceId,200)&&bounded(v.limitation,600)))
    throw Error('Semantic Opportunity Compiler adapter: missing or unbounded investigator rationale')
  const manual=Object.prototype.hasOwnProperty.call(args,'selectedPmids')
  const discovery=Object.prototype.hasOwnProperty.call(args,'discoveryQuery')
  if(manual===discovery)throw Error('Semantic Opportunity Compiler adapter: supply exactly one source selection mode')
  if(manual&&(!Array.isArray(args.selectedPmids)||args.selectedPmids.length<1||
      args.selectedPmids.length>16||args.selectedPmids.some((id:unknown)=>typeof id!=='string'||!PMID.test(id))))
    throw Error('Semantic Opportunity Compiler adapter: invalid or unbounded exact PMID selection')
  if(discovery&&!bounded(args.discoveryQuery,240))
    throw Error('Semantic Opportunity Compiler adapter: missing or unbounded local research discovery query')
}

function fromCurrentAuthorities(untrustedArgs:SemanticOpportunityCompileArgs){
  validateResearchOpportunityRequest(untrustedArgs)
  const args=untrustedArgs
  const register=getResearchSourceRegister() // validates pinned source manifest/blob receipts
  const graph=buildResearchSemanticNetwork(register.records)
  // A research-only Studio can still link exact DOI publication identities
  // using the repo-owned distribution register, without approved effect claims.
  const reviewedStudies:ReviewedStudyInput[]=[]
  const studio=buildResearchIntelligenceStudio(register.records,graph,reviewedStudies)
  const inspection=inspectResearchStudio(studio,graph,register,semanticSourceSignature)
  const usingDiscovery=typeof args.discoveryQuery==='string'
  const query=args.discoveryQuery||''
  const matches=usingDiscovery?discoverResearchIntake(studio.dna,graph,query,6):null
  if(usingDiscovery&&(!matches||matches.sourceCount!==inspection.sourceCount||
     matches.matches.length===0||matches.matches.length>6||
     matches.matches.some(x=>!inspection.sourceAuthority[`studio-pmid:${x.pmid}`])))
    throw Error('Semantic Opportunity Compiler adapter: local discovery unavailable or no exact source matches; do not fabricate related research')
  const ids=[...new Set(usingDiscovery?matches!.matches.map(x=>x.pmid):args.selectedPmids!)].sort()
  const selectionSignal:ResearchOrigin=usingDiscovery?{
    kind:'bounded-current-studio-index-match',
    referenceId:`ths-studio-query:${digest({query,wave:inspection.sourceWave}).slice(0,24)}`,
    limitation:'Only current signed source-title and metadata matching; relevance, prior art, clinical effects and global completeness have NOT been established.',
  }: {
    kind:'investigator-selected-source-identities',referenceId:'explicit-pmid-selection',
    limitation:'Exact PMID identities were selected by an investigator; relevance to the study question has NOT been verified.',
  }
  const opportunity=createOpportunity({
    question:args.question,pico:args.pico,originSignals:[...args.originSignals,selectionSignal],
    intakeSnapshotId:inspection.snapshotId,
  })
  validateOpportunity(opportunity)
  const cases:IntegratedResearchCase[]=ids.map(pmid=>{
    const result=buildIntegratedResearchCase(
      studio,graph,pmid,currentDistributionObjects as readonly DistributionIdentity[],reviewedStudies)
    if(!result)throw Error('Semantic Opportunity Compiler adapter: selected PMID missing from exact current register')
    return result
  })
  return {opportunity,inspection,cases,
    sections:[],comparisons:[],trialLineage:{}}
}

export function compileCurrentResearchOpportunity(args:SemanticOpportunityCompileArgs){
  return compileOpportunityReport(fromCurrentAuthorities(args))
}

/**
 * Called BEFORE any consumer reads a stored report. Input identities are
 * reconstructed from the CURRENT canonical authorities; hashes alone cannot
 * establish freshness or release approval.
 */
export function verifyCurrentResearchOpportunityReport(candidate:unknown,args:SemanticOpportunityCompileArgs){
  return verifyOpportunityReport(candidate,fromCurrentAuthorities(args))
}
