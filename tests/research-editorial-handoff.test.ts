import {describe,expect,it} from 'vitest'
import {buildResearchSemanticNetwork} from '../lib/research-semantic-network'
import {buildResearchIntelligenceStudio} from '../lib/research-intelligence-studio'
import {
  buildIntegratedResearchCase,
  compileResearchEditorialReviewHandoff,
  resolveResearchEditorialReviewHandoff,
} from '../lib/research-intelligence-integration'
import type {DistributionIdentity} from '../lib/research-semantic-fabric'

const source=(pmid:string,doi:string,title:string)=>({
  pmid,doi,title,year:'2025',abstract:'This source is research intake, not a reviewed clinical claim.',
  category:'sleep',journal:'Synthetic journal',pubType:'Journal Article',
})
const pmid='10000001'
const sources=[
  source(pmid,'10.5555/verified-source','Synthetic observational magnesium trial'),
  source('10000002','10.5555/another-source','Another paper with the same general topic'),
]
const graph=buildResearchSemanticNetwork(sources)
const studio=buildResearchIntelligenceStudio(sources,graph,[])
const exact:DistributionIdentity={
  id:'review-candidate-a',sourceUrl:'https://thehippiescientist.net/herbs/sage/',
  primarySourceUrl:'https://doi.org/10.5555/verified-source',
  findingClaimId:'claimed_a',primarySourceId:'source_a',
}
const build=(objects:readonly DistributionIdentity[]=[exact])=>{
  const integrated=buildIntegratedResearchCase(studio,graph,pmid,objects)
  expect(integrated).not.toBeNull()
  return integrated!
}

describe('P0 #6466 research-to-editorial identity firewall',()=>{
  it('connects all 8+12 source-bound projections to a typed, immutable review-only request',()=>{
    const {reviewHandoff,caseFile,scientific}=build()
    expect(caseFile.instruments).toHaveLength(8)
    expect(scientific.capabilities).toHaveLength(12)
    expect(reviewHandoff).toMatchObject({
      schemaVersion:1,kind:'research-editorial-review-request',
      sourcePmid:pmid,sourceDoi:'10.5555/verified-source',
      instrumentCount:8,scientificProjectionCount:12,
      disposition:'review-candidates-await-independent-adjudication',
      evidenceAuthority:'research-intake-not-clinical-evidence',
      clinicalPromotions:0,publicationAllowed:false,mutationAllowed:false,
    })
    expect(reviewHandoff.reviewTargets).toHaveLength(1)
    expect(reviewHandoff.reviewTargets[0]).toMatchObject({
      sourcePmid:pmid,sourceSignature:reviewHandoff.sourceSignature,
      exactPublicationDoi:reviewHandoff.sourceDoi,
      objectId:exact.id,claimedFindingId:exact.findingClaimId,
      claimedPrimarySourceId:exact.primarySourceId,
      status:'human-editorial-review-required',claimIndependentlyApproved:false,
    })
    expect(reviewHandoff.reviewTargets[0].requestId).toContain(reviewHandoff.sourceSignature)
    expect(resolveResearchEditorialReviewHandoff(studio,graph,pmid,[exact],reviewHandoff))
      .toEqual(reviewHandoff)
    expect(compileResearchEditorialReviewHandoff(build())).toEqual(reviewHandoff)
  })

  it('holds DOI-only, title-only, cross-publication and missing claim/source identity',()=>{
    for(const objects of [
      [{...exact,primarySourceUrl:'https://doi.org/10.5555/another-source'}],
      [{...exact,primarySourceUrl:''}],
      [{...exact,findingClaimId:undefined}],
      [{...exact,primarySourceId:undefined}],
      [{...exact,sourceUrl:'https://not-thehippiescientist.net/herbs/sage/'}],
    ]){
      const h=build(objects).reviewHandoff
      expect(h.reviewTargets).toHaveLength(0)
      expect(h.disposition).toBe('held-no-exact-review-targets')
      expect(h.publicationAllowed).toBe(false)
      expect(h.heldChannels.some(x=>x.channel==='social'&&x.status==='held-for-human-review')).toBe(true)
    }
    const wrong=buildIntegratedResearchCase(studio,graph,'10000002',[exact])!
    expect(wrong.reviewHandoff.reviewTargets).toHaveLength(0)
  })

  it('refuses cross-PMID, forged signature, changed DOI, tampered reviewer approval and unknown versions',()=>{
    const handoff=build().reviewHandoff
    const altered=[
      {...handoff,sourcePmid:'10000002'},
      {...handoff,sourceSignature:'fake'},
      {...handoff,sourceDoi:'10.5555/another-source'},
      {...handoff,schemaVersion:2},
      {...handoff,publicationAllowed:true},
      {...handoff,mutationAllowed:true},
      {...handoff,clinicalPromotions:1},
      {...handoff,reviewTargets:handoff.reviewTargets.map(x=>({...x,sourcePmid:'10000002'}))},
      {...handoff,reviewTargets:handoff.reviewTargets.map(x=>({...x,claimedFindingId:'foreign'}))},
      {...handoff,reviewTargets:handoff.reviewTargets.map(x=>({...x,claimedPrimarySourceId:'foreign'}))},
      {...handoff,reviewTargets:handoff.reviewTargets.map(x=>({...x,claimIndependentlyApproved:true}))},
      {...handoff,reviewTargets:handoff.reviewTargets.map(x=>({...x,exactPublicationDoi:'10.5555/another-source'}))},
      {...handoff,approved:true},
    ]
    for(const value of altered){
      expect(()=>resolveResearchEditorialReviewHandoff(studio,graph,pmid,[exact],value))
        .toThrow(/identity\/version\/revision mismatch/)
    }
    expect(()=>resolveResearchEditorialReviewHandoff(studio,graph,'10000002',[exact],handoff))
      .toThrow(/identity\/version\/revision mismatch/)
  })

  it('rejects an old receipt after a source revision changes the exact signature',()=>{
    const old=build().reviewHandoff
    const updatedSources=[{...sources[0],title:'Synthetic observational magnesium trial: revised title'},sources[1]]
    const updatedGraph=buildResearchSemanticNetwork(updatedSources)
    const updatedStudio=buildResearchIntelligenceStudio(updatedSources,updatedGraph,[])
    expect(()=>resolveResearchEditorialReviewHandoff(updatedStudio,updatedGraph,pmid,[exact],old))
      .toThrow(/identity\/version\/revision mismatch/)
  })

  it('deduplicates stable request identities and ignores input insertion order',()=>{
    const second={...exact,id:'review-candidate-b',findingClaimId:'claimed_b'}
    const first=build([second,exact,exact]).reviewHandoff
    const reordered=build([exact,second]).reviewHandoff
    expect(first).toEqual(reordered)
    expect(first.reviewTargets.map(x=>x.objectId)).toEqual(['review-candidate-a','review-candidate-b'])
    expect(new Set(first.reviewTargets.map(x=>x.requestId)).size).toBe(2)
  })

  it('does not allow a compromised integrated science snapshot to mint review permission',()=>{
    const full=build()
    expect(()=>compileResearchEditorialReviewHandoff({
      ...full,scientific:{...full.scientific,clinicalPromotions:1},
    })).toThrow(/conflicting research-only/)
    expect(()=>compileResearchEditorialReviewHandoff({
      ...full,fabric:{...full.fabric,sourceSignature:'fabricated'},
    })).toThrow(/conflicting research-only/)
    expect(()=>compileResearchEditorialReviewHandoff({
      ...full,publicationAllowed:true,
    })).toThrow(/conflicting research-only/)
  })
})
