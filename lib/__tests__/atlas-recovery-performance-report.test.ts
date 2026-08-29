import { describe, expect, it } from 'vitest'
import { buildAtlasRecoveryPerformance } from '../atlasAnalyticsReport'

const shown = (session: string, item: string) => ({
  type: 'botanical_atlas_recovery_shown',
  item,
  context: `suggestions:2;session:${session};source:sleep_hub;profile_opened:no`,
})

const accepted = (session: string, action: string, restored: number) => ({
  type: 'botanical_atlas_recovery_accepted',
  item: action,
  context: `restored:${restored};session:${session};source:sleep_hub;profile_opened:no;recovery:${action}`,
})

const profile = (session: string, action: string) => ({
  type: 'botanical_atlas_profile_click',
  item: 'valerian',
  context: `position:1;session:${session};source:sleep_hub;profile_opened:yes;recovery:${action}`,
})

describe('atlas recovery performance report', () => {
  it('deduplicates repeated impressions by session and action', () => {
    const report = buildAtlasRecoveryPerformance([
      shown('s1', 'clear-effect:8,clear-safety:12'),
      shown('s1', 'clear-effect:8,clear-safety:12'),
    ])

    expect(report.rows.find((row) => row.action === 'clear-effect')?.impressions).toBe(1)
    expect(report.rows.find((row) => row.action === 'clear-safety')?.impressions).toBe(1)
  })

  it('calculates acceptance and post-recovery profile rates from sessions', () => {
    const report = buildAtlasRecoveryPerformance([
      shown('s1', 'include-pathways:9'),
      accepted('s1', 'include-pathways', 9),
      profile('s1', 'include-pathways'),
      shown('s2', 'include-pathways:5'),
      accepted('s2', 'include-pathways', 5),
      shown('s3', 'include-pathways:7'),
    ])

    const row = report.rows[0]
    expect(row.action).toBe('include-pathways')
    expect(row.impressions).toBe(3)
    expect(row.acceptances).toBe(2)
    expect(row.acceptanceRate).toBeCloseTo(2 / 3)
    expect(row.profileOpens).toBe(1)
    expect(row.postRecoveryProfileRate).toBe(0.5)
    expect(row.averageRestoredResults).toBe(7)
  })

  it('counts recovery events without session IDs as legacy exclusions', () => {
    const report = buildAtlasRecoveryPerformance([
      { type: 'botanical_atlas_recovery_shown', item: 'clear-query:4', context: 'suggestions:1' },
      { type: 'botanical_atlas_filter', item: 'Calming', context: 'effect:2' },
    ])

    expect(report.unattributedEvents).toBe(1)
    expect(report.rows).toEqual([])
  })

  it('ranks profile-converting actions before high-impression nonconverters', () => {
    const report = buildAtlasRecoveryPerformance([
      shown('s1', 'clear-query:4,clear-effect:8'),
      accepted('s1', 'clear-query', 4),
      profile('s1', 'clear-query'),
      shown('s2', 'clear-effect:8'),
      shown('s3', 'clear-effect:8'),
      accepted('s2', 'clear-effect', 8),
    ])

    expect(report.rows.map((row) => row.action)).toEqual(['clear-query', 'clear-effect'])
  })
})
