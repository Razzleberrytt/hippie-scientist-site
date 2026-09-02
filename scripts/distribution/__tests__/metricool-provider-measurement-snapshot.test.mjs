import { describe, expect, it } from 'vitest'
import { normalizeMetricoolProviderMeasurementSnapshot } from '../metricool-provider-measurement-snapshot.mjs'

const publicationEvidence = {
  schemaVersion: 'metricool-connector-publication-ingestion-v1',
  status: 'accepted',
  provider: 'metricool',
  externalId: 'post-123',
  lifecycle: { identity: { platform: 'youtube' } },
}

const snapshot = {
  provider: 'metricool',
  publicationExternalId: 'post-123',
  platform: 'youtube',
  observedFrom: '2026-08-20T12:04:00.000Z',
  observedTo: '2026-08-27T12:04:00.000Z',
  capturedAt: '2026-08-27T13:00:00.000Z',
  assetViews: 1000,
  qualifiedVisits: 60,
  completionRate: 0.8,
  saveRate: 0.08,
  attributionRisk: 'low',
}

describe('Metricool provider measurement snapshot', () => {
  it('normalizes one identity-bound provider snapshot without inventing metrics', () => {
    expect(normalizeMetricoolProviderMeasurementSnapshot({ publicationEvidence, snapshot })).toEqual({
      observedFrom: snapshot.observedFrom,
      observedTo: snapshot.observedTo,
      capturedAt: snapshot.capturedAt,
      assetViews: 1000,
      qualifiedVisits: 60,
      completionRate: 0.8,
      saveRate: 0.08,
      attributionRisk: 'low',
    })
  })

  it('rejects missing metrics rather than interpreting absence as zero', () => {
    expect(() => normalizeMetricoolProviderMeasurementSnapshot({ publicationEvidence, snapshot: { ...snapshot, assetViews: undefined } }))
      .toThrow(/explicit assetViews.*not zero performance/i)
  })

  it('rejects the wrong provider', () => {
    expect(() => normalizeMetricoolProviderMeasurementSnapshot({ publicationEvidence, snapshot: { ...snapshot, provider: 'other' } }))
      .toThrow(/provider=metricool/i)
  })

  it('rejects cross-publication snapshots', () => {
    expect(() => normalizeMetricoolProviderMeasurementSnapshot({ publicationEvidence, snapshot: { ...snapshot, publicationExternalId: 'post-999' } }))
      .toThrow(/publicationExternalId does not match/i)
  })

  it('rejects cross-platform snapshots', () => {
    expect(() => normalizeMetricoolProviderMeasurementSnapshot({ publicationEvidence, snapshot: { ...snapshot, platform: 'tiktok' } }))
      .toThrow(/platform does not match/i)
  })
})
