import { describe, expect, it } from 'vitest'
import {
  buildForecastReportArtifact,
  renderForecastReportMarkdown,
} from '../forecasting-reporting'

describe('forecasting reporting', () => {
  it('renders every requested cluster metric and backlog impact/effort fields', () => {
    const report = buildForecastReportArtifact({
      generatedAt: '2026-08-15T00:00:00.000Z',
      current: [
        {
          cluster: 'Sleep',
          impressions: 1200,
          clicks: 90,
          averagePosition: 7,
          indexedUrls: 40,
          crawledNotIndexedUrls: 5,
          affiliateClicks: 12,
          emailSignups: 8,
          revenue: 75,
          referringDomains: 18,
          aiCitations: 9,
          conversionRate: 0.1,
        },
      ],
      backlog: [
        { id: 799, title: 'Add expected-impact score', expectedImpact: 9, effort: 2, cluster: 'Ops' },
      ],
    })

    const markdown = renderForecastReportMarkdown(report)
    expect(markdown).toContain('Content Cluster Forecasting Dashboard')
    expect(markdown).toContain('| Sleep | 1,200 | 90 | 7.0 | 40 | 5 | 12 | 8 | $75.00 | 18 | 9 | 10.0% |')
    expect(markdown).toContain('799 — Add expected-impact score')
    expect(markdown).toContain('| Ops | 9.0 | 2.0 | complete |')
  })

  it('warns instead of pretending missing impact/effort values are known', () => {
    const report = buildForecastReportArtifact({
      current: [],
      backlog: [{ id: 800, title: 'Effort score pending' }],
    })

    expect(report.scoreWarnings).toEqual(['Task 800: missing-both'])
    expect(renderForecastReportMarkdown(report)).toContain('Scoring warning')
  })

  it('does not introduce the 801+ confidence formula early', () => {
    const markdown = renderForecastReportMarkdown(buildForecastReportArtifact({ current: [] }))
    expect(markdown).toContain('Confidence weighting')
    expect(markdown).toContain('801–803')
  })
})
