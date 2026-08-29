import { describe, expect, it } from 'vitest'
import { buildCompetitorContentGapReport } from '../competitor-content-gap'

describe('competitor content gap strategy', () => {
  it('avoids generic head terms already owned by medical authorities', () => {
    const [gap] = buildCompetitorContentGapReport([], [
      {
        topic: 'What is ashwagandha',
        publisher: 'NIH/NCCIH',
        intent: 'generic-definition',
        authorityTier: 'medical-authority',
      },
    ])

    expect(gap.decision).toBe('avoid-generic-head-term')
    expect(gap.distinctivenessScore).toBeLessThan(0)
  })

  it('prioritizes long-tail decision gaps large publishers underserve', () => {
    const [gap] = buildCompetitorContentGapReport([], [
      {
        topic: 'Ashwagandha morning or night',
        publisher: 'Healthline',
        intent: 'long-tail-decision',
        authorityTier: 'consumer-publisher',
      },
    ])

    expect(gap.decision).toBe('pursue')
    expect(gap.intent).toBe('long-tail-decision')
    expect(gap.distinctivenessScore).toBeGreaterThanOrEqual(7)
  })

  it('protects existing topics while rewarding differentiated site capabilities', () => {
    const [gap] = buildCompetitorContentGapReport(
      [
        {
          topic: 'Magnesium glycinate vs citrate',
          url: '/guides/compare/magnesium-glycinate-vs-citrate/',
          intent: 'comparison',
          capabilities: ['comparison', 'evidence-synthesis', 'structured-data'],
        },
      ],
      [
        {
          topic: 'Magnesium glycinate vs citrate',
          publisher: 'Examine',
          intent: 'comparison',
          authorityTier: 'evidence-specialist',
        },
      ],
    )

    expect(gap.decision).toBe('protect')
    expect(gap.distinctivenessScore).toBeGreaterThan(10)
    expect(gap.siteUrls).toContain('/guides/compare/magnesium-glycinate-vs-citrate/')
  })

  it('infers form, evidence and interaction intents when explicit labels are absent', () => {
    const results = buildCompetitorContentGapReport([], [
      { topic: 'Ashwagandha extract differences', publisher: 'Examine' },
      { topic: 'Ashwagandha mechanism vs human evidence', publisher: 'Healthline' },
      { topic: 'Ashwagandha drug interaction research', publisher: 'NIH/NCCIH' },
    ])

    expect(results.map((result) => result.intent)).toEqual(
      expect.arrayContaining(['form-extract', 'mechanism-vs-human-evidence', 'interaction-research']),
    )
    expect(results.every((result) => result.decision === 'pursue')).toBe(true)
  })
})
