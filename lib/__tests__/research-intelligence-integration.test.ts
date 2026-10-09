import {describe,expect,it} from 'vitest'
import {buildResearchSemanticNetwork} from '../research-semantic-network'
import {buildResearchIntelligenceStudio} from '../research-intelligence-studio'
import {buildIntegratedResearchCase,buildResearchEditorialReviewHandoff,validateResearchEditorialReviewHandoff} from '../research-intelligence-integration'

// Deliberately synthetic PubMed-like records: these tests validate the
// interoperability/authorization boundaries, not any scientific result.
const sources=[
  {pmid:'10000001',title:'Magnesium and sleep outcomes in adults',abstract:'An unreviewed comparison with placebo.',journal:'Test',year:'2023',category:'sleep',pubType:'Journal Article',doi:'10.5555/verified-test'},
  {pmid:'10000002',title:'Creatine and memory outcomes in adults',abstract:'An unreviewed comparison.',journal:'Test',year:'2022',category:'cognition_focus',pubType:'Journal Article',doi:'10.5555/unrelated-test'},
]
const graph=buildResearchSemanticNetwork(sources)
const studio=buildResearchIntelligenceStudio(sources,graph,[])
const matching={
 id:'test-distro-1',sourceUrl:'https://thehippiescientist.net/herbs/magnesium/',
 primarySourceUrl:'https://doi.org/10.5555/verified-test',
 findingClaimId:'clm_review_1',primarySourceId:'src_review_1',
}

describe('P0 integrated twenty-tool exact-source case',()=>{
  it('binds eight instruments, twelve science receipts and editorial review to one source',()=>{
    const result=buildIntegratedResearchCase(studio,graph,'10000001',[matching])
    expect(result).not.toBeNull()
    if(!result)throw Error('Missing case')
    expect(result.pmid).toBe('10000001')
    expect(result.sourceSignature).toBe(graph.entries['10000001'].sourceSignature)
    expect(result.caseFile.instruments).toHaveLength(8)
    expect(result.scientific.capabilities).toHaveLength(12)
    expect(result.scientific.calibrationFailures).toBe(0)
    expect([result.scope.pmid,result.relay.pmid,result.scientific.pmid,result.fabric.sourcePmid])
      .toEqual(Array(4).fill(result.pmid))
    expect(result.fabric.distributionReviewTargets.map(x=>x.objectId))
      .toEqual(['test-distro-1'])
    expect(result.status).toBe('source-bound-human-review-only')
    expect(result.clinicalPromotions).toBe(0)
    expect(result.publicationAllowed).toBe(false)
    expect(result.mutationAllowed).toBe(false)
    expect(result.scientific.capabilities.every(c=>!c.releaseApproved)).toBe(true)
  })

  it('rejects unknown PMIDs without silently replacing the source',()=>{
    expect(buildIntegratedResearchCase(studio,graph,'99999999',[matching])).toBeNull()
    expect(buildIntegratedResearchCase(studio,graph,'malformed',[matching])).toBeNull()
  })

  it('rejects a changed exact-source signature before producing any review target',()=>{
    const otherGraph={...graph,entries:{...graph.entries,
      '10000001':{...graph.entries['10000001'],sourceSignature:'tampered'}}}
    expect(()=>buildIntegratedResearchCase(studio,otherGraph,'10000001',[matching]))
      .toThrow()
  })

  it('does not turn DOI similarity or missing claim ID into review approval',()=>{
    const result=buildIntegratedResearchCase(studio,graph,'10000001',[
      {...matching,id:'unrelated-source',primarySourceUrl:'10.5555/unrelated-test'},
      {...matching,id:'no-reviewed-claim',findingClaimId:undefined},
    ])
    expect(result?.fabric.distributionReviewTargets).toHaveLength(0)
    expect(result?.fabric.publicationAllowed).toBe(false)
    expect(result?.fabric.mutationAllowed).toBe(false)
  })

  it('never imports a source-specific review target into another PMID',()=>{
    const other=buildIntegratedResearchCase(studio,graph,'10000002',[matching])
    expect(other?.fabric.distributionReviewTargets).toHaveLength(0)
    expect(other?.pmid).toBe('10000002')
  })

  it('refuses source-only cases carrying an audited retraction release hold',()=>{
    const retractedSource={
      pmid:'41461240',
      title:'Omega 3 retracted study',
      abstract:'Source-only abstract metadata is not an approved finding.',
      journal:'Test',year:'2025',category:'sleep',pubType:'Journal Article',
      doi:'10.1016/j.jad.2025.121055',
    }
    const retractedGraph=buildResearchSemanticNetwork([retractedSource])
    const retractedStudio=buildResearchIntelligenceStudio([retractedSource],retractedGraph,[])
    expect(()=>buildIntegratedResearchCase(retractedStudio,retractedGraph,retractedSource.pmid,[]))
      .toThrow(/Integrated research case failed/)
  })

  it('quarantines conflicting publication metadata rather than guessing',()=>{
    expect(()=>buildIntegratedResearchCase(studio,graph,'10000001',[
      matching,{...matching,primarySourceUrl:'https://doi.org/10.5555/unrelated-test'},
    ])).toThrow(/conflicting DOI identity/)
  })

  it('emits a deterministic v1 review REQUEST tied to actual 8+12 source context',()=>{
    const integrated=buildIntegratedResearchCase(studio,graph,'10000001',[matching])
    expect(integrated).not.toBeNull()
    if(!integrated)throw Error('Fixture must create an integrated case')
    const receipt=integrated.reviewHandoff
    expect(receipt.schemaVersion).toBe(1)
    expect(receipt.eventType).toBe('research-editorial-review-request')
    expect(receipt.sourcePmid).toBe('10000001')
    expect(receipt.sourceSignature).toBe(graph.entries['10000001'].sourceSignature)
    expect(receipt.sourceDoi).toBe('10.5555/verified-test')
    expect(receipt.instrumentCount).toBe(8)
    expect(receipt.scientificProjectionCount).toBe(12)
    expect(receipt.requests).toHaveLength(1)
    expect(receipt.requests[0]).toEqual(expect.objectContaining({
      pmid:'10000001',sourceSignature:receipt.sourceSignature,
      primaryDoi:'10.5555/verified-test',objectId:matching.id,
      claimedFindingId:matching.findingClaimId,claimedSourceId:matching.primarySourceId,
      status:'requires-independent-human-review',
      basis:'exact-publication-identity-not-claim-support',
    }))
    expect(receipt.separatelyReviewedCitationIds).toEqual([])
    expect(receipt.humanReviewRequired).toBe(true)
    expect(receipt.clinicalClaimsApproved).toBe(0)
    expect(receipt.automaticPublications).toBe(0)
    expect(receipt.publicationAllowed).toBe(false)
    expect(receipt.mutationAllowed).toBe(false)
    expect(validateResearchEditorialReviewHandoff(receipt,studio,graph,'10000001',[matching]))
      .toEqual(receipt)
    expect(buildResearchEditorialReviewHandoff(integrated)).toEqual(receipt)
    expect(buildIntegratedResearchCase(studio,graph,'10000001',[matching])?.reviewHandoff)
      .toEqual(receipt)
  })

  it('keeps unknown/missing exact DOI or claim/source identity on hold',()=>{
    const cases=[
      [],[{...matching,primarySourceUrl:'https://doi.org/10.5555/unrelated-test'}],
      [{...matching,findingClaimId:undefined}],
      [{...matching,primarySourceId:undefined}],
    ]
    for(const records of cases){
      const result=buildIntegratedResearchCase(studio,graph,'10000001',records)
      expect(result?.reviewHandoff.requests).toHaveLength(0)
      expect(result?.reviewHandoff.status).toBe('held-no-exact-review-target')
      expect(result?.reviewHandoff.heldReasons.some(x=>x.channel==='social')).toBe(true)
      expect(result?.reviewHandoff.publicationAllowed).toBe(false)
    }
    const unrelated=buildIntegratedResearchCase(studio,graph,'10000002',[matching])
    expect(unrelated?.reviewHandoff.requests).toHaveLength(0)
    expect(unrelated?.reviewHandoff.sourcePmid).toBe('10000002')
  })

  it('validates latest source and every claim/DOI/permission field fail-closed',()=>{
    const receipt=buildIntegratedResearchCase(studio,graph,'10000001',[matching])!.reviewHandoff
    const mutated=[
      {...receipt,schemaVersion:2},
      {...receipt,sourcePmid:'10000002'},
      {...receipt,sourceSignature:'forged'},
      {...receipt,sourceDoi:'10.5555/unrelated-test'},
      {...receipt,humanReviewRequired:false},
      {...receipt,publicationAllowed:true},
      {...receipt,mutationAllowed:true},
      {...receipt,clinicalClaimsApproved:1},
      {...receipt,automaticPublications:1},
      {...receipt,requests:receipt.requests.map(r=>({...r,claimedFindingId:'borrowed_foreign_claim'}))},
      {...receipt,requests:receipt.requests.map(r=>({...r,claimedSourceId:'borrowed_foreign_source'}))},
      {...receipt,requests:receipt.requests.map(r=>({...r,primaryDoi:'10.5555/unrelated-test'}))},
      {...receipt,requests:receipt.requests.map(r=>({...r,status:'approved'}))},
      {...receipt,requests:receipt.requests.map(r=>({...r,pmid:'10000002'}))},
      {...receipt,requests:receipt.requests.map(r=>({...r,sourceSignature:'stale-signature'}))},
      {...receipt,requests:receipt.requests.concat(receipt.requests)},
      {...receipt,unknownPermission:true},
    ]
    for(const forged of mutated){
      expect(()=>validateResearchEditorialReviewHandoff(forged,studio,graph,'10000001',[matching]))
        .toThrow(/rejected/)
    }
    expect(()=>validateResearchEditorialReviewHandoff(receipt,studio,graph,'10000002',[matching]))
      .toThrow(/rejected/)
    expect(()=>validateResearchEditorialReviewHandoff(receipt,studio,graph,'10000001',[
      {...matching,primarySourceUrl:'https://doi.org/10.5555/unrelated-test'},
    ])).toThrow(/rejected/)
    expect(()=>validateResearchEditorialReviewHandoff(receipt,studio,graph,'10000001',[
      {...matching,findingClaimId:'replacement_claim'},
    ])).toThrow(/rejected/)
  })

  it('invalidates source revisions and refuses fabricated integrated case permissions',()=>{
    const old=buildIntegratedResearchCase(studio,graph,'10000001',[matching])!
    const changedSources=sources.map(x=>x.pmid==='10000001'
      ?{...x,abstract:x.abstract+' Additional source revision.'}:x)
    const changedGraph=buildResearchSemanticNetwork(changedSources)
    const changedStudio=buildResearchIntelligenceStudio(changedSources,changedGraph,[])
    expect(changedGraph.entries['10000001'].sourceSignature).not.toBe(old.sourceSignature)
    expect(()=>validateResearchEditorialReviewHandoff(old.reviewHandoff,changedStudio,changedGraph,
      '10000001',[matching])).toThrow(/rejected/)
    for(const altered of [
      {...old,sourceSignature:'forged'},
      {...old,publicationAllowed:true},
      {...old,fabric:{...old.fabric,publicationAllowed:true}},
      {...old,fabric:{...old.fabric,sourceDoi:'10.5555/unrelated-test'}},
      {...old,scientific:{...old.scientific,clinicalPromotions:1}},
    ]){
      expect(()=>buildResearchEditorialReviewHandoff(altered as typeof old)).toThrow(/rejected/)
    }
  })

  it('is order-independent and distinguishes two existing object IDs without conflating sources',()=>{
    const another={...matching,id:'another-reviewed-object'}
    const first=buildIntegratedResearchCase(studio,graph,'10000001',[matching,another])!
    const second=buildIntegratedResearchCase(studio,graph,'10000001',[another,matching])!
    expect(first.reviewHandoff).toEqual(second.reviewHandoff)
    expect(first.reviewHandoff.requests).toHaveLength(2)
    expect(new Set(first.reviewHandoff.requests.map(r=>r.requestId)).size).toBe(2)
    expect(first.reviewHandoff.requests.every(r=>r.status==='requires-independent-human-review'))
      .toBe(true)
  })

})
