import { describe, expect, it } from 'vitest'
import {
  deriveResearchMaturity,
  hasExplicitResearchMaturitySignal,
  policyForResearchRecord,
} from '../research-maturity'

describe('live research maturity governance', () => {
  it('maps strong human evidence to established research', () => {
    expect(deriveResearchMaturity({ evidence_tier: 'Strong human clinical trial evidence' })).toBe('established')
  })

  it('maps early human evidence to preliminary research', () => {
    expect(deriveResearchMaturity({ evidence_tier: 'Preliminary human evidence' })).toBe('preliminary')
    expect(policyForResearchRecord({ evidence_tier: 'Preliminary human evidence' }).purchaseIntentAllowed).toBe(false)
  })

  it('maps preclinical mechanism-only records to theoretical research', () => {
    const record = { evidence_tier: 'Preclinical animal studies only', mechanisms: ['receptor modulation'] }
    expect(deriveResearchMaturity(record)).toBe('theoretical')
    expect(policyForResearchRecord(record).visualWeight).toBe('research-only')
  })

  it('does not invent a maturity commerce restriction for sparse payloads with no evidence signal', () => {
    expect(hasExplicitResearchMaturitySignal({ slug: 'sparse-payload' })).toBe(false)
    expect(hasExplicitResearchMaturitySignal({ evidence_grade: 'D' })).toBe(true)
  })
})
