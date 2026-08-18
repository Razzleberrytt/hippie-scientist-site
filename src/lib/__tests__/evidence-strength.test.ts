import { describe, it, expect } from 'vitest'
import { getEvidenceStrengthData } from '../../../lib/evidence-strength'
import type { RuntimeRecord } from '../../types/content'

function record(fields: Partial<RuntimeRecord> & Record<string, unknown> = {}): RuntimeRecord {
  return { slug: 'test-record', ...fields }
}

describe('getEvidenceStrengthData', () => {
  it('gives strong human evidence a high score, "A" grade, and no downgrade reasons', () => {
    // The tier has to name human research. `hasHumanEvidence` deliberately
    // refuses to infer it from strength words alone - "strong" says nothing
    // about whether any cited study involved people - so a fixture claiming
    // strong human evidence has to say so.
    const data = getEvidenceStrengthData(
      record({ evidence_tier: 'Strong human clinical trial evidence', mechanisms: ['GABA modulation'] }),
    )

    expect(data.tier).toBe('strong')
    expect(data.grade).toBe('A')
    expect(data.humanEvidence).toBe(true)
    expect(data.downgradeReasons).toEqual([])
    expect(data.score).toBeGreaterThan(80)
  })

  it('flags a downgrade reason when only mechanistic evidence exists', () => {
    const data = getEvidenceStrengthData(
      record({ evidence_tier: 'Preliminary animal studies', mechanisms: ['adenosine receptor binding'] }),
    )

    expect(data.humanEvidence).toBe(false)
    expect(data.mechanismEvidence).toBe(true)
    expect(data.downgradeReasons).toContain('No direct human clinical trials documented.')
  })

  it('flags a stronger downgrade reason when there is no evidence of any kind', () => {
    const data = getEvidenceStrengthData(record())

    expect(data.humanEvidence).toBe(false)
    expect(data.mechanismEvidence).toBe(false)
    expect(data.downgradeReasons).toContain('No published mechanism or clinical evidence on file.')
  })

  it('keeps the score within the 1-100 bounds for every tier', () => {
    const tiers = [
      'Strong evidence',
      'Moderate evidence',
      'Limited evidence',
      'Mixed evidence',
      'Preliminary evidence',
      'Traditional use',
      'Insufficient evidence',
      'Needs review',
    ]

    for (const evidence_tier of tiers) {
      const data = getEvidenceStrengthData(record({ evidence_tier }))
      expect(data.score).toBeGreaterThanOrEqual(1)
      expect(data.score).toBeLessThanOrEqual(100)
    }
  })

  it('returns a consistent set of Tailwind classes for the "strong" tier', () => {
    const data = getEvidenceStrengthData(record({ evidence_tier: 'Strong evidence' }))

    // Dark-mode variants are appended to these class strings, so the contract is
    // that each carries its base colour, not that it is that string exactly.
    expect(data.barColorClass).toContain('bg-emerald-600')
    expect(data.textColorClass).toContain('text-emerald-800')
    expect(data.bgColorClass).toContain('bg-emerald-50')
    expect(data.borderColorClass).toContain('border-emerald-200')
  })
})
