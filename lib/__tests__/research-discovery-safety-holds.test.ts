import { describe, expect, it } from 'vitest'
import { canDiscoverResearchProfile } from '../search/research-discovery-eligibility'
import { isRestrictedRecord } from '../restricted-ingredients'

describe('research discovery is distinct from shopping restrictions', () => {
  it('preserves ordinary scientific results and excludes controlled primary identities', () => {
    expect(canDiscoverResearchProfile({slug:'ashwagandha',name:'Ashwagandha'})).toBe(true)
    expect(canDiscoverResearchProfile({slug:'dmt',name:'DMT',indexability_status:'PUBLISH'})).toBe(false)
    expect(canDiscoverResearchProfile({slug:'kratom',name:'Kratom',indexability_status:'PUBLISH'})).toBe(false)
  })

  it('allows approved-for-publication educational profiles without opening shopping', () => {
    const held = {slug:'black-cohosh',name:'Black Cohosh',indexability_status:'PUBLISH',
      governance:{monetizationAllowed:false,recommendationAllowed:false,indexingAllowed:true}}
    expect(isRestrictedRecord(held)).toBe(true)
    expect(canDiscoverResearchProfile(held)).toBe(true)
    expect(canDiscoverResearchProfile({...held,runtime_export_decision:'hide'})).toBe(false)
    expect(canDiscoverResearchProfile({...held,doNotPromote:true})).toBe(false)
    expect(canDiscoverResearchProfile({...held,legal_status:'Controlled substance'})).toBe(false)
  })

  it('does not hide an ordinary published ingredient merely for mentioning saffron in its summary', () => {
    const crocin={slug:'crocin',name:'Crocin',indexability_status:'PUBLISH',
      summary:'Crocin is a constituent discussed in saffron research.'}
    expect(isRestrictedRecord(crocin)).toBe(true)
    expect(canDiscoverResearchProfile(crocin)).toBe(true)
  })

  it('retains explicit and regulatory publication exclusions', () => {
    const common={slug:'crocin',name:'Crocin',summary:'Related to saffron',
      indexability_status:'PUBLISH'}
    expect(canDiscoverResearchProfile({...common,doNotPromote:'true'})).toBe(false)
    expect(canDiscoverResearchProfile({...common,legal_status:'Controlled substance'})).toBe(false)
  })
})
