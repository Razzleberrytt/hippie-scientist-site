import {describe,expect,it} from 'vitest'
import {buildResearchSemanticNetwork} from '../research-semantic-network'
import {buildResearchIntelligenceStudio} from '../research-intelligence-studio'
import {buildIntegratedResearchCase} from '../research-intelligence-integration'

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
