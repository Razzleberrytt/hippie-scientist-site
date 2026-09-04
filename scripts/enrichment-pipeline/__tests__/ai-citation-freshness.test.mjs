import { describe, expect, it } from 'vitest'
import {
  DEFAULT_AI_CITATION_MAX_AGE_DAYS,
  aiCitationManifestFreshness,
} from '../lib/ai-citation-freshness.mjs'

describe('AI citation manifest freshness', () => {
  it('accepts a current dated snapshot inside the governed freshness window', () => {
    const result = aiCitationManifestFreshness(
      { snapshotLabel: '2026-09-04' },
      { now: Date.parse('2026-09-10T12:00:00Z') },
    )
    expect(result).toMatchObject({
      fresh: true,
      reason: 'fresh',
      snapshotLabel: '2026-09-04',
      maxAgeDays: DEFAULT_AI_CITATION_MAX_AGE_DAYS,
    })
  })

  it('expires an old snapshot instead of silently carrying winner assumptions forward', () => {
    const result = aiCitationManifestFreshness(
      { snapshotLabel: '2026-09-04' },
      { now: Date.parse('2026-09-20T00:00:00Z') },
    )
    expect(result.fresh).toBe(false)
    expect(result.reason).toBe('snapshot_expired')
    expect(result.ageDays).toBeGreaterThan(DEFAULT_AI_CITATION_MAX_AGE_DAYS)
  })

  it('fails closed on an invalid or materially future-dated snapshot', () => {
    expect(aiCitationManifestFreshness({ snapshotLabel: 'unknown' }).reason).toBe('invalid_snapshot_label')
    expect(aiCitationManifestFreshness(
      { snapshotLabel: '2026-09-20' },
      { now: Date.parse('2026-09-04T12:00:00Z') },
    ).reason).toBe('snapshot_in_future')
  })

  it('supports an explicit tighter freshness policy without weakening the default', () => {
    const result = aiCitationManifestFreshness(
      { snapshotLabel: '2026-09-04', freshnessPolicy: { maxAgeDays: 3 } },
      { now: Date.parse('2026-09-09T00:00:00Z') },
    )
    expect(result).toMatchObject({ fresh: false, reason: 'snapshot_expired', maxAgeDays: 3 })
  })
})
