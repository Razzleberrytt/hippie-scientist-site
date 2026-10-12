import { describe, expect, it } from 'vitest'
import { buildCompoundTrustGuidance } from '../compound-trust'

describe('compound trust warning-before-evidence parsing', () => {
  it('preserves urgent safety first while retaining bounded evidence label', () => {
    const lead = 'CONCENTRATED EGCG/GREEN TEA EXTRACT LIVER WARNING: Severe injury has been reported.'
    const guidance = buildCompoundTrustGuidance({
      safety: lead + ' Safety evidence: limited human safety evidence and rare case reports. High concentrations warrant caution.',
      interactions: [],
    }, ['liver disease'])
    expect(guidance.evidenceLabel).toBe('limited human safety evidence and rare case reports')
    expect(guidance.safetyDetail).toBe(lead + ' High concentrations warrant caution.')
    expect(guidance.providerGuidance).toMatch(/condition named in this safety summary/)
  })

  it('preserves Safety evidence first parsing', () => {
    const guidance = buildCompoundTrustGuidance({ safety: 'Safety evidence: limited human evidence. Use clinical judgment.' }, [])
    expect(guidance.evidenceLabel).toBe('limited human evidence')
    expect(guidance.safetyDetail).toBe('Use clinical judgment.')
  })

  it('does not invent an evidence label when no marker exists', () => {
    const guidance = buildCompoundTrustGuidance({ safety: 'Urgent liver warning: seek medical evaluation.' }, [])
    expect(guidance.evidenceLabel).toBe('')
    expect(guidance.safetyDetail).toMatch(/^Urgent liver warning:/)
  })
})
