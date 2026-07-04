import { describe, it, expect, vi, beforeEach } from 'vitest'

const edgesFixture = {
  'herb-a': [
    { partner_slug: 'herb-b', partner_name: 'Herb B', risk_mechanism: 'serotonergic', severity: 'severe', weight: 90, claim_language: '', notes: '' },
    { partner_slug: 'herb-c', partner_name: 'Herb C', risk_mechanism: 'serotonergic', severity: 'severe', weight: 40, claim_language: '', notes: '' },
    { partner_slug: 'herb-d', partner_name: 'Herb D', risk_mechanism: 'cns_sedation', severity: 'moderate', weight: 70, claim_language: '', notes: '' },
  ],
}

const tagsFixture = {
  'herb-a': [
    { risk_mechanism: 'serotonergic', pair_behavior: 'additive', matched_text: '', confidence: 'high' },
    { risk_mechanism: 'cns_sedation', pair_behavior: 'additive', matched_text: '', confidence: 'high' },
    { risk_mechanism: 'renal', pair_behavior: 'single_only', matched_text: '', confidence: 'high' },
  ],
  'herb-no-additive': [
    { risk_mechanism: 'renal', pair_behavior: 'single_only', matched_text: '', confidence: 'high' },
  ],
}

vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn((filePath: string) => {
      if (String(filePath).includes('interaction_edges.json')) return JSON.stringify(edgesFixture)
      if (String(filePath).includes('entity_risk_tags.json')) return JSON.stringify(tagsFixture)
      throw new Error(`unexpected read: ${filePath}`)
    }),
  },
}))

describe('interaction-risk', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns only mechanisms tagged as additive, ordered severe-first', async () => {
    const { getAdditiveRisks } = await import('../../../lib/interaction-risk')
    const risks = getAdditiveRisks('herb-a')

    expect(risks.map(r => r.mechanism)).toEqual(['serotonergic', 'cns_sedation'])
    expect(risks[0].severity).toBe('severe')
    expect(risks[0].label).toBe('Serotonergic activity')
  })

  it('excludes mechanisms marked single_only', async () => {
    const { getAdditiveRisks } = await import('../../../lib/interaction-risk')
    const risks = getAdditiveRisks('herb-a')

    expect(risks.some(r => r.mechanism === 'renal')).toBe(false)
  })

  it('sorts partners within a mechanism by weight descending', async () => {
    const { getAdditiveRisks } = await import('../../../lib/interaction-risk')
    const risks = getAdditiveRisks('herb-a')
    const serotonergic = risks.find(r => r.mechanism === 'serotonergic')!

    expect(serotonergic.topPartners.map(p => p.slug)).toEqual(['herb-b', 'herb-c'])
    expect(serotonergic.partnerCount).toBe(2)
  })

  it('returns an empty array when no additive tags exist for the slug', async () => {
    const { getAdditiveRisks } = await import('../../../lib/interaction-risk')
    expect(getAdditiveRisks('herb-no-additive')).toEqual([])
  })

  it('returns an empty array for an unknown slug', async () => {
    const { getAdditiveRisks } = await import('../../../lib/interaction-risk')
    expect(getAdditiveRisks('does-not-exist')).toEqual([])
  })
})
