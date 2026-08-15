import { describe, expect, it } from 'vitest'
import {
  buildCompetitorGapArtifact,
  renderCompetitorGapMarkdown,
  siteTopicsFromRouteManifest,
  summarizePublisherCoverage,
} from '../competitor-gap-reporting'

describe('competitor gap reporting', () => {
  it('turns indexed route-manifest entries into comparable topics and capabilities', () => {
    const topics = siteTopicsFromRouteManifest([
      {
        route: '/guides/compare/magnesium-glycinate-vs-citrate',
        canonical_url: 'https://thehippiescientist.net/guides/compare/magnesium-glycinate-vs-citrate/',
      },
      {
        route: '/tools/botanical-activity-atlas',
        canonical_url: 'https://thehippiescientist.net/tools/botanical-activity-atlas/',
      },
    ])

    expect(topics[0]).toMatchObject({
      topic: 'magnesium glycinate vs citrate',
      intent: 'comparison',
    })
    expect(topics[0].capabilities).toContain('comparison')
    expect(topics[1]).toMatchObject({ topic: 'botanical activity atlas', intent: 'interactive-tool' })
    expect(topics[1].capabilities).toContain('interactive-tool')
  })

  it('always reports coverage status for the three core publishers', () => {
    const coverage = summarizePublisherCoverage([
      { topic: 'ashwagandha', publisher: 'Examine' },
      { topic: 'ashwagandha', publisher: 'Healthline' },
      { topic: 'ashwagandha', publisher: 'Independent Evidence Lab' },
    ])

    expect(coverage.find((row) => row.publisher === 'Examine')).toMatchObject({ present: true, topicCount: 1 })
    expect(coverage.find((row) => row.publisher === 'NIH/NCCIH')).toMatchObject({ present: false, topicCount: 0 })
    expect(coverage.find((row) => row.publisher === 'Healthline')).toMatchObject({ present: true, topicCount: 1 })
  })

  it('builds pursue/protect/avoid decisions and renders an incomplete-coverage warning', () => {
    const report = buildCompetitorGapArtifact(
      [
        {
          route: '/herbs/ashwagandha',
          canonical_url: 'https://thehippiescientist.net/herbs/ashwagandha/',
        },
      ],
      {
        topics: [
          { topic: 'ashwagandha', publisher: 'Examine', authorityTier: 'evidence-specialist' },
          {
            topic: 'what is magnesium',
            publisher: 'NIH/NCCIH',
            intent: 'generic-definition',
            authorityTier: 'medical-authority',
          },
          {
            topic: 'ashwagandha morning or night',
            publisher: 'Examine',
            intent: 'long-tail-decision',
          },
        ],
      },
      '2026-08-15T00:00:00.000Z',
    )

    expect(report.decisionCounts.protect).toBe(1)
    expect(report.decisionCounts.pursue).toBe(1)
    expect(report.decisionCounts['avoid-generic-head-term']).toBe(1)

    const markdown = renderCompetitorGapMarkdown(report)
    expect(markdown).toContain('Coverage warning')
    expect(markdown).toContain('Healthline')
    expect(markdown).toContain('Pursue: differentiated gaps')
    expect(markdown).toContain('Avoid: generic medical head terms')
  })
})
