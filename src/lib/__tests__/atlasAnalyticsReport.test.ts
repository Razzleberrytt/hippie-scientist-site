import { describe, expect, it } from 'vitest'
import { buildAtlasSourcePerformance, parseAtlasContext } from '../atlasAnalyticsReport'

describe('atlas analytics report', () => {
  it('parses colon-delimited context values without losing later fields', () => {
    const values = parseAtlasContext('effect:12;session:abc;source:sleep_hub;distinct_filters:2')
    expect(values.get('session')).toBe('abc')
    expect(values.get('source')).toBe('sleep_hub')
    expect(values.get('distinct_filters')).toBe('2')
  })

  it('deduplicates events into sessions and calculates profile-open rate', () => {
    const report = buildAtlasSourcePerformance([
      { type: 'botanical_atlas_filter', context: 'effect:10;session:a;first_filter:effect;distinct_filters:1;profile_opened:no;source:sleep_hub' },
      { type: 'botanical_atlas_filter', context: 'safety:4;session:a;first_filter:effect;distinct_filters:2;profile_opened:no;source:sleep_hub' },
      { type: 'botanical_atlas_profile_click', context: 'position:1;session:a;first_filter:effect;distinct_filters:2;profile_opened:yes;source:sleep_hub' },
      { type: 'botanical_atlas_filter', context: 'effect:8;session:b;first_filter:effect;distinct_filters:1;profile_opened:no;source:sleep_hub' },
    ])

    expect(report.attributedSessions).toBe(2)
    expect(report.rows[0]).toMatchObject({
      source: 'sleep_hub',
      sessions: 2,
      profileOpens: 1,
      profileOpenRate: 0.5,
      averageFilterDepth: 1.5,
      topFirstFilter: 'effect',
    })
  })

  it('ranks stronger conversion before raw session volume', () => {
    const report = buildAtlasSourcePerformance([
      { type: 'botanical_atlas_filter', context: 'effect:3;session:a;first_filter:effect;distinct_filters:1;profile_opened:no;source:focus_hub' },
      { type: 'botanical_atlas_filter', context: 'effect:3;session:b;first_filter:effect;distinct_filters:1;profile_opened:no;source:focus_hub' },
      { type: 'botanical_atlas_profile_click', context: 'position:1;session:c;first_filter:safety;distinct_filters:2;profile_opened:yes;source:anxiety_hub' },
    ])

    expect(report.rows.map((row) => row.source)).toEqual(['anxiety_hub', 'focus_hub'])
  })

  it('excludes pre-session legacy events from conversion denominators', () => {
    const report = buildAtlasSourcePerformance([
      { type: 'botanical_atlas_filter', context: 'effect:10;source:sleep_hub' },
      { type: 'affiliate_link_click', context: 'unrelated' },
    ])

    expect(report.attributedSessions).toBe(0)
    expect(report.unattributedEvents).toBe(1)
    expect(report.rows).toEqual([])
  })
})
