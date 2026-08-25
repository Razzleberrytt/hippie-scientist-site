import { describe, expect, it } from 'vitest'
import { scoreShadowQuality } from '../index-quality-shadow.mjs'

const basePublished = {
  kind: 'herb',
  slug: 'example',
  name: 'Example',
  indexability_status: 'PUBLISH',
  robots: 'index,follow',
  sitemap_included: true,
}

describe('index quality shadow gate', () => {
  it('flags a fennel-like partial profile without mutating publication state', () => {
    const row = scoreShadowQuality({
      ...basePublished,
      slug: 'fennel',
      profile_status: 'partial',
      summary: 'It is best handled as an aromatic seed botanical with traditional GI-support use and modest mechanistic confidence.',
      description: 'It is best handled as an aromatic seed botanical with traditional GI-support use and modest mechanistic confidence.',
      mechanisms: ['Inflammatory Signaling Modulation', 'Hormonal Signaling Context', 'Stress Response Modulation'],
      primaryActions: ['stress'],
      safetyNotes: 'Avoid in pregnancy at medicinal doses; caution in estrogen-sensitive conditions and with seizure disorders; allergy possible.',
      contraindications: ['pregnancy/breastfeeding without clinician supervision'],
      interactions: ['Possible estrogenic interaction concerns with concentrated use.'],
      sources: [{}, {}, {}],
      evidence: { sourceCount: 3 },
      claimMap: [],
      preparation: '',
      traditionalUses: [],
      activeCompounds: [],
      relatedHerbs: [],
      evidenceLevel: '',
    })

    expect(row.shadow).toBe('FAIL_SHADOW')
    expect(row.severeSignals).toContain('weak-profile-status')
    expect(row.severeSignals).toContain('summary-quality-missing')
    expect(row.severeSignals).toContain('claim-map-empty')
    expect(row.severeSignals).toContain('evidence-level-missing')
    expect(row.indexabilityStatus).toBe('PUBLISH')
  })

  it('passes a differentiated, strongly grounded profile', () => {
    const row = scoreShadowQuality({
      ...basePublished,
      profile_status: 'complete',
      summary_quality: 'strong',
      summary: 'A source-backed summary that distinguishes the exact outcome, formulation, evidence strength, limitations, and safety context for readers.',
      description: 'A separate description with useful context rather than a duplicate summary.',
      mechanisms: ['Mechanism A', 'Mechanism B'],
      primaryActions: ['sleep', 'stress'],
      safetyNotes: 'Meaningful safety context that explains when caution is warranted and why.',
      contraindications: ['Example contraindication'],
      interactions: ['Example interaction'],
      sources: [{}, {}, {}],
      evidence: { sourceCount: 3 },
      claimMap: [{ claim: 'Example', sourceIds: ['1'] }],
      preparation: 'Preparation-specific context that is grounded and useful to the reader.',
      traditionalUses: ['Traditional use'],
      activeCompounds: ['Compound A'],
      relatedHerbs: ['Related herb'],
      evidenceLevel: 'moderate',
    })

    expect(row.shadow).toBe('PASS')
  })
})
