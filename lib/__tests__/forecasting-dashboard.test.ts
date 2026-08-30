import { describe, expect, it } from 'vitest'
import {
  buildClusterForecast,
  buildForecastDashboard,
  scoreBacklogTask,
} from '../forecasting-dashboard'

const sleepNow = {
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
}

const sleepBefore = {
  ...sleepNow,
  impressions: 1000,
  clicks: 70,
  averagePosition: 9,
  revenue: 50,
  referringDomains: 15,
  aiCitations: 5,
  conversionRate: 0.08,
}

describe('forecasting dashboard', () => {
  it('displays every requested metric per content cluster and computes momentum', () => {
    const [row] = buildClusterForecast([sleepNow], [sleepBefore])

    expect(row.cluster).toBe('Sleep')
    expect(row.impressions).toBe(1200)
    expect(row.clicks).toBe(90)
    expect(row.averagePosition).toBe(7)
    expect(row.indexedUrls).toBe(40)
    expect(row.crawledNotIndexedUrls).toBe(5)
    expect(row.affiliateClicks).toBe(12)
    expect(row.emailSignups).toBe(8)
    expect(row.revenue).toBe(75)
    expect(row.referringDomains).toBe(18)
    expect(row.aiCitations).toBe(9)
    expect(row.conversionRate).toBe(0.1)
    expect(row.deltas.averagePosition).toBe(2)
    expect(row.momentumScore).toBeGreaterThan(0)
  })

  it('builds site totals without averaging cluster positions naively', () => {
    const dashboard = buildForecastDashboard(
      [
        sleepNow,
        {
          ...sleepNow,
          cluster: 'Focus',
          impressions: 300,
          clicks: 20,
          averagePosition: 3,
        },
      ],
      [],
      '2026-08-15T00:00:00.000Z',
    )

    expect(dashboard.generatedAt).toBe('2026-08-15T00:00:00.000Z')
    expect(dashboard.totals.impressions).toBe(1500)
    expect(dashboard.totals.averagePosition).toBeCloseTo(6.2)
    expect(dashboard.totals.revenue).toBe(150)
  })
})

describe('backlog impact and effort scoring', () => {
  it('normalizes impact and effort onto a 1-10 scale', () => {
    const scored = scoreBacklogTask({
      id: 799,
      title: 'Add expected impact',
      expectedImpact: 14,
      effort: 0,
    })

    expect(scored.expectedImpact).toBe(10)
    expect(scored.effort).toBe(1)
    expect(scored.scoreCompleteness).toBe('complete')
  })

  it('makes missing scores explicit instead of silently pretending confidence', () => {
    const scored = scoreBacklogTask({ id: 800, title: 'Add effort score' })
    expect(scored.scoreCompleteness).toBe('missing-both')
    expect(scored.expectedImpact).toBe(1)
    expect(scored.effort).toBe(10)
  })
})
