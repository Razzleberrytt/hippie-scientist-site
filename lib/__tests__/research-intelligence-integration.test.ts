import {describe,expect,it} from 'vitest'
import {buildResearchSemanticNetwork} from '../research-semantic-network'
import {buildResearchIntelligenceStudio} from '../research-intelligence-studio'
import {buildIntegratedResearchCase,buildResearchEditorialReviewHandoff,verifyResearchEditorialReviewHandoff} from '../research-intelligence-integration'

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
})


describe('P0 typed editorial request — exact source and human-only permissions',()=>{
  const build=(objects:readonly typeof matching[]=[matching])=>
    buildResearchEditorialReviewHandoff(studio,graph,'10000001',objects)
  const verify=(candidate:unknown,objects:readonly typeof matching[]=[matching])=>
    verifyResearchEditorialReviewHandoff(candidate,studio,graph,'10000001',objects)

  it('delivers one source-pinned, 8+12 trace with human review targets only',()=>{
    const value=build()
    expect(value).not.toBeNull()
    if(!value)throw Error('Missing exact-source case')
    expect(value).toMatchObject({
      schemaVersion:1,kind:'research-source-to-editorial-review',
      identity:{pmid:'10000001',sourceSignature:graph.entries['10000001'].sourceSignature,
        sourceDoi:'10.5555/verified-test'},
      trace:{originalInstrumentCount:8,scientificProjectionCount:12,
        reviewedCitationCrosswalkIsClaimApproval:false},
      disposition:'human-review-required',
      sourceAuthority:'research-intake-not-clinical-evidence',
      publicationAllowed:false,mutationAllowed:false,clinicalPromotions:0,
    })
    expect(value.reviewTargets).toEqual([{
      objectId:'test-distro-1',targetPage:'/herbs/magnesium/',
      primarySourceId:'src_review_1',findingClaimId:'clm_review_1',
      exactPrimaryDoi:'10.5555/verified-test',
      status:'requires-independent-human-editorial-review',
      identityBasis:'exact-publication-doi-not-claim-evidence',
    }])
    expect(verify(value)).toEqual(value)
  })

  it('is deterministic and idempotent with identical inputs',()=>{
    const first=build(),second=build()
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    expect(verify(first)).toEqual(second)
  })

  it('holds a source with no exact linked review target, never promotes it',()=>{
    const held=build([])
    expect(held).toMatchObject({
      disposition:'held-no-source-linked-review-target',
      reviewTargets:[],
      publicationAllowed:false,mutationAllowed:false,clinicalPromotions:0,
    })
    expect(held?.unresolved.some(item=>item.channel==='social')).toBe(true)
    expect(verify(held,[])).toEqual(held)
  })

  it('does not elevate DOI-only or absent existing claim/source identifiers',()=>{
    const held=build([
      {...matching,findingClaimId:undefined},
      {...matching,id:'missing-source-id',primarySourceId:undefined},
      {...matching,id:'wrong-doi',primarySourceUrl:'https://doi.org/10.5555/unrelated-test'},
    ])
    expect(held?.reviewTargets).toHaveLength(0)
    expect(held?.publicationAllowed).toBe(false)
  })

  it('rejects unknown versions and added authorization / publication fields',()=>{
    const original=build()
    expect(()=>verify({...original,schemaVersion:2})).toThrow(/schema version/)
    expect(()=>verify({...original,publicationAllowed:true})).toThrow(/stale, forged/)
    expect(()=>verify({...original,mutationAllowed:true})).toThrow(/stale, forged/)
    expect(()=>verify({...original,clinicalPromotions:1})).toThrow(/stale, forged/)
    expect(()=>verify({...original,approved:true})).toThrow(/stale, forged/)
  })

  it('rejects source PMID swaps and forged source signatures',()=>{
    const original=build()
    if(!original)throw Error('Missing exact-source case')
    expect(()=>verify({...original,identity:{...original.identity,pmid:'10000002'}}))
      .toThrow(/stale, forged/)
    expect(()=>verify({...original,identity:{...original.identity,sourceSignature:'forged'}}))
      .toThrow(/stale, forged/)
  })

  it('rejects an altered DOI, changed claim ID and swapped source ID',()=>{
    const original=build()
    if(!original)throw Error('Missing exact-source case')
    expect(()=>verify({...original,identity:{...original.identity,sourceDoi:'10.5555/unrelated-test'}}))
      .toThrow(/stale, forged/)
    expect(()=>verify({...original,reviewTargets:original.reviewTargets.map(t=>({
      ...t,findingClaimId:'clm_other-paper',
    }))})).toThrow(/stale, forged/)
    expect(()=>verify({...original,reviewTargets:original.reviewTargets.map(t=>({
      ...t,primarySourceId:'src_other-paper',
    }))})).toThrow(/stale, forged/)
  })

  it('rejects an injected review target or changed human-review permission',()=>{
    const original=build()
    if(!original)throw Error('Missing exact-source case')
    expect(()=>verify({...original,reviewTargets:[...original.reviewTargets,{
      ...original.reviewTargets[0],objectId:'injected-target',
    }]})).toThrow(/stale, forged/)
    expect(()=>verify({...original,reviewTargets:original.reviewTargets.map(t=>({
      ...t,status:'approved-for-automatic-publication',
    }))})).toThrow(/stale, forged/)
  })

  it('expires a previously valid request when source metadata is revised',()=>{
    const original=build()
    const revisedSources=[
      {...sources[0],title:'Changed title invalidates original source signature'},
      sources[1],
    ]
    const revisedGraph=buildResearchSemanticNetwork(revisedSources)
    const revisedStudio=buildResearchIntelligenceStudio(revisedSources,revisedGraph,[])
    expect(()=>verifyResearchEditorialReviewHandoff(
      original,revisedStudio,revisedGraph,'10000001',[matching],
    )).toThrow(/stale, forged/)
  })

  it('refuses a case from a different PMID with the same distribution identity',()=>{
    const original=build()
    expect(()=>verifyResearchEditorialReviewHandoff(
      original,studio,graph,'10000002',[matching],
    )).toThrow(/stale, forged/)
    const other=buildResearchEditorialReviewHandoff(studio,graph,'10000002',[matching])
    expect(other?.reviewTargets).toEqual([])
    expect(other?.publicationAllowed).toBe(false)
  })

  it('returns null for an unknown source rather than a global or similar study',()=>{
    expect(buildResearchEditorialReviewHandoff(studio,graph,'99999999',[matching]))
      .toBeNull()
    expect(()=>verifyResearchEditorialReviewHandoff(
      build(),studio,graph,'99999999',[matching],
    )).toThrow(/stale, forged/)
  })

  it('does not accept altered reviewed-citation crosswalk provenance',()=>{
    const original=build()
    if(!original)throw Error('Missing exact-source case')
    expect(()=>verify({...original,trace:{
      ...original.trace,reviewedCitationIds:['unrelated-claim'],
    }})).toThrow(/stale, forged/)
    expect(()=>verify({...original,trace:{
      ...original.trace,reviewedCitationCrosswalkIsClaimApproval:true,
    }})).toThrow(/stale, forged/)
  })
})
