/**
 * T1 proof to run INSIDE the original repository once #6769 is admitted.
 * The isolated candidate cannot run this test: the governed source loader and
 * integrated 8+12 science engine live in the THS repository, not this ZIP.
 * No PubMed requests, publication, article mutation or new clinical authority.
 */
import {describe,it,expect} from 'vitest'
import {getResearchSourceRegister} from '../../lib/research-source-register'
import {buildResearchSemanticNetwork,semanticSourceSignature} from '../../lib/research-semantic-network'
import {buildResearchIntelligenceStudio} from '../../lib/research-intelligence-studio'
import {discoverResearchIntake} from '../../lib/research-intelligence-discovery'
import {buildIntegratedResearchCase} from '../../lib/research-intelligence-integration'
import currentDistributionObjects from '../../data/distribution/research-objects.json'
import type {DistributionIdentity} from '../../lib/research-semantic-fabric'
import {createOpportunity,validateOpportunity} from '../../research/insight-foundry/src/contracts.mjs'
import {inspectResearchStudio} from '../../research/insight-foundry/src/ths-studio-adapter.mjs'
import {compileOpportunityReport,renderOpportunityMarkdown,verifyOpportunityReport} from '../../research/insight-foundry/src/opportunity-compiler.mjs'
import {compileCurrentResearchOpportunity,verifyCurrentResearchOpportunityReport} from '../../lib/research-semantic-opportunity-compiler'

const question='What outcomes have been examined in a source-verified research record?'
const pico={
  population:'as reported by each paper',intervention:'record-specific exposure',
  comparator:'as reported by each paper',outcomes:['reported outcomes'],
  timeframe:'as reported by each paper',
}

describe('Semantic Opportunity Compiler — actual THS source-bound adapter proof',()=>{
  it('uses the current upstream register and exact integrated 8+12 case without scientific promotion',()=>{
    const register=getResearchSourceRegister() // upstream git-blob receipt verification
    const network=buildResearchSemanticNetwork(register.records)
    const studio=buildResearchIntelligenceStudio(register.records,network,[])
    const inspection=inspectResearchStudio(studio,network,register,semanticSourceSignature)
    const originSignals=[{kind:'source-identity-review',referenceId:'bounded-current-studio',
      limitation:'An indexed source is a review question, never proof of clinical benefit.'}]
    const opportunity=createOpportunity({question,pico,intakeSnapshotId:inspection.snapshotId,originSignals})
    expect(validateOpportunity(opportunity)).toBe(opportunity)
    // Select a registered source; do not invent a synthetic PMID or claim.
    const first=register.records[0]
    if(!first)throw new Error("Verified research register is empty")
    const pmid=first.pmid
    expect(pmid).toMatch(/^\d{5,10}$/)
    const researchCase=buildIntegratedResearchCase(studio,network,pmid,currentDistributionObjects as readonly DistributionIdentity[],[])
    if(!researchCase)throw new Error("Current exact PMID did not produce integrated 8+12 case")
    const report=compileOpportunityReport({opportunity,inspection,cases:[researchCase],sections:[],comparisons:[]})
    expect(report.sources).toHaveLength(1)
    expect(report.sources[0].pmid).toBe(pmid)
    expect(report.sources[0].sourceSignature).toBe(network.entries[pmid].sourceSignature)
    expect(report.independentTrialCount).toBeNull()
    expect(report.exactArticleSections).toEqual([])
    expect(report.comparisonsAffected).toEqual([])
    expect(report.publicationAllowed).toBe(false)
    expect(report.mutationAllowed).toBe(false)
    expect(report.contentChangeAllowed).toBe(false)
    expect(report.reviewRequests.every(x=>x.status.includes('review-required'))).toBe(true)
    expect(report.unresolved.some(x=>x.kind==='comparison-identity-unavailable')).toBe(true)
    expect(renderOpportunityMarkdown(report)).toContain('Independent underlying trials: Unknown')
    // Replays of the exact same canonical graph generate the same report hash.
    const replay=compileOpportunityReport({opportunity,inspection,cases:[researchCase]})
    expect(replay.reportDigest).toBe(report.reportDigest)
    const args={question,pico,selectedPmids:[pmid],originSignals}
    const fromAdapter=compileCurrentResearchOpportunity(args)
    // The trusted adapter adds a mandatory explicit-PMID selection receipt.
    // It therefore MUST NOT share the digest of a manually compiled report
    // lacking that receipt, even when both refer to the same exact paper.
    expect(fromAdapter.reportDigest).not.toBe(report.reportDigest)
    expect(fromAdapter.sources).toEqual(report.sources)
    expect(fromAdapter.reviewRequests).toEqual(report.reviewRequests)
    expect(fromAdapter.originSignals).toEqual(expect.arrayContaining([
      expect.objectContaining({kind:'investigator-selected-source-identities',referenceId:'explicit-pmid-selection'}),
    ]))
    expect(verifyCurrentResearchOpportunityReport(fromAdapter,args).reportDigest).toBe(fromAdapter.reportDigest)
    expect(verifyOpportunityReport(report,{opportunity,inspection,cases:[researchCase],sections:[],comparisons:[]})).toEqual(report)
    for(const forgedAuthority of ['sections','comparisons','trialLineage','reviewedStudies','distributionObjects']){
      expect(()=>compileCurrentResearchOpportunity({...args,[forgedAuthority]:{verified:true}} as any))
        .toThrow(/untrusted external authority/)
    }
  })

  it('rejects a changed source signature even with a visually similar PMID',()=>{
    const register=getResearchSourceRegister()
    const graph=buildResearchSemanticNetwork(register.records)
    const studio=buildResearchIntelligenceStudio(register.records,graph,[])
    const inspection=inspectResearchStudio(studio,graph,register,semanticSourceSignature)
    const opportunity=createOpportunity({question,pico,intakeSnapshotId:inspection.snapshotId,
      originSignals:[{kind:'source-identity-review',referenceId:'bounded-current-studio',limitation:'Not a clinical conclusion'}]})
    const first=register.records[0]
    if(!first)throw new Error("Verified research register is empty")
    const pmid=first.pmid
    const researchCase=buildIntegratedResearchCase(studio,graph,pmid,currentDistributionObjects as readonly DistributionIdentity[],[])
    if(!researchCase)throw new Error("Current exact PMID did not produce integrated 8+12 case")
    const forged={...researchCase,sourceSignature:'2-deadbeef-deadbeef'}
    expect(()=>compileOpportunityReport({opportunity,inspection,cases:[forged]})).toThrow(/stale or foreign source/)
  })

  it('finds an actual registered source through the existing bounded Studio discovery index',()=>{
    const register=getResearchSourceRegister()
    const first=register.records[0]
    if(!first)throw new Error('Current signed research register is empty')
    // Search an exact EXISTING PMID to guarantee a reproducible bounded
    // index match; this is not an inferred clinical effect or a PubMed request.
    const graph=buildResearchSemanticNetwork(register.records)
    const studio=buildResearchIntelligenceStudio(register.records,graph,[])
    const indexed=discoverResearchIntake(studio.dna,graph,first.pmid,6)
    expect(indexed.matches[0]?.pmid).toBe(first.pmid)
    expect(indexed.sourceCount).toBe(register.records.length)
    const originSignals=[{kind:'source-identity-review',referenceId:'registered-pmid-probe',
      limitation:'Exact PubMed identity is not a reviewed finding'}]
    const args={question,pico,discoveryQuery:first.pmid,originSignals}
    const report=compileCurrentResearchOpportunity(args)
    expect(report.sources.map(x=>x.pmid)).toContain(first.pmid)
    expect(report.originSignals.some(x=>x.kind==='bounded-current-studio-index-match')).toBe(true)
    expect(report.sources.every(x=>x.status==='research-only-not-extracted')).toBe(true)
    expect(report.independentTrialCount).toBeNull()
    expect(report.publicationAllowed).toBe(false)
    expect(report.comparisonsAffected).toEqual([])
    expect(verifyCurrentResearchOpportunityReport(report,args).reportDigest).toBe(report.reportDigest)
    // Bounded discovery must FAIL CLOSED on a query with no matching record.
    expect(()=>compileCurrentResearchOpportunity({...args,discoveryQuery:'nonexistent-query-xyzzzz-999999999'}))
      .toThrow(/no exact source matches/)
  })

})
