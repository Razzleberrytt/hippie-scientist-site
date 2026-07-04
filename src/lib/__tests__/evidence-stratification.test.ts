import { describe, it, expect } from 'vitest'
import { getEvidenceStrata, getEvidenceDisciplineSummary } from '../../../lib/evidence-stratification'

describe('getEvidenceStrata', () => {
  it('separates human evidence from safety considerations rather than merging them', () => {
    const strata = getEvidenceStrata({
      evidence_tier: 'Strong clinical trial evidence',
      safety: 'Caution: may interact with blood thinners.',
    })

    const labels = strata.map(s => s.label)
    expect(labels).toContain('Human Evidence')
    expect(labels).toContain('Safety Considerations')
  })

  it('flags mechanistic-only evidence without implying clinical proof', () => {
    const strata = getEvidenceStrata({ summary: 'Mechanistic in vitro findings on cortisol pathways.' })
    const labels = strata.map(s => s.label)

    expect(labels).toContain('Mechanistic Evidence')
    expect(labels).not.toContain('Human Evidence')
  })

  it('separates traditional-use context from modern clinical evidence', () => {
    const strata = getEvidenceStrata({ traditional_use: 'Used in Ayurveda for centuries.' })
    expect(strata.map(s => s.label)).toContain('Traditional Use Context')
  })

  it('falls back to "Evidence-Limited" when no structured signal is found', () => {
    const strata = getEvidenceStrata({})
    expect(strata).toEqual([
      {
        label: 'Evidence-Limited',
        description: 'This profile currently has limited structured evidence context available.',
        tone: 'neutral',
      },
    ])
  })

  it('caps the result at 5 strata', () => {
    const strata = getEvidenceStrata({
      evidence_tier: 'human clinical trial, mechanistic pathway, limited preliminary, mixed',
      traditional_use: 'traditional ayurveda folk use',
      safety: 'caution interaction avoid contraindicated',
    })
    expect(strata.length).toBeLessThanOrEqual(5)
  })
})

describe('getEvidenceDisciplineSummary', () => {
  it('explains that evidence and safety are kept separate when both are present', () => {
    const strata = getEvidenceStrata({
      evidence_tier: 'Strong clinical trial evidence',
      safety: 'Caution: may interact with blood thinners.',
    })
    expect(getEvidenceDisciplineSummary(strata)).toMatch(/presented separately/)
  })

  it('flags mechanistic emphasis when human evidence is absent', () => {
    const strata = getEvidenceStrata({ summary: 'Mechanistic in vitro findings only.' })
    expect(getEvidenceDisciplineSummary(strata)).toMatch(/mechanistic plausibility/)
  })

  it('gives a generic explanation when nothing specific applies', () => {
    const strata = getEvidenceStrata({})
    expect(getEvidenceDisciplineSummary(strata)).toMatch(/Evidence is separated by type/)
  })
})
