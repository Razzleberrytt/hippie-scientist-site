/**
 * Actual governed-source contract smoke test, distinct from the 62 synthetic
 * IF-01/03 native tests. No online requests or public claim promotions.
 */
import {describe,it,expect} from 'vitest'
import {getResearchSourceRegister} from '../../lib/research-source-register'
import {buildResearchSemanticNetwork,semanticSourceSignature} from '../../lib/research-semantic-network'
import {buildResearchIntelligenceStudio} from '../../lib/research-intelligence-studio'
import {inspectResearchStudio} from '../../research/insight-foundry/src/ths-studio-adapter.mjs'

describe('Insight Foundry against the canonical, source-receipt-verified research register',()=>{
  it('derives one bounded research-only snapshot without independent scientific conclusions',()=>{
    const register=getResearchSourceRegister()
    expect(register.latestSourceVerified).toBe(500)
    expect(register.records.length).toBe(500)
    const graph=buildResearchSemanticNetwork(register.records)
    const studio=buildResearchIntelligenceStudio(register.records,graph,[])
    const inspection=inspectResearchStudio(studio,graph,register,semanticSourceSignature)
    expect(inspection.sourceCount).toBe(register.latestSourceVerified)
    expect(inspection.sourceWave).toBe(register.throughWave)
    expect(inspection.sourceWave).toBeGreaterThanOrEqual(studio.sourceWave)
    expect(inspection.snapshotId).toMatch(/^[a-f0-9]{64}$/)
    expect(inspection.publicationAuthorized).toBe(false)
    expect(inspection.evidenceAuthority).toBe('research-only')
    expect(studio.metrics.automaticallyPromotedClaims).toBe(0)
    const pmid=register.records[0].pmid
    expect(inspection.sourceAuthority['studio-pmid:'+pmid].sourceSignature)
      .toBe(graph.entries[pmid].sourceSignature)
    // Exact DOI identity must come from the validated upstream source record,
    // not a forged or stale Studio fingerprint.
    const changed={...studio,dna:[{...studio.dna[0],doi:'10.9999/forged'},...studio.dna.slice(1)]}
    expect(()=>inspectResearchStudio(changed,graph,register,semanticSourceSignature))
      .toThrow(/Studio fingerprint differs/)
  })
})
