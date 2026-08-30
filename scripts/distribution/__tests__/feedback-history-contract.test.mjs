import { describe, expect, it } from 'vitest'

import { FEEDBACK_HISTORY_SCHEMA_VERSION, validateFeedbackHistoryEnvelope } from '../feedback-history-contract.mjs'

function record(overrides = {}) {
  return {
    observationId: 'obs-1',
    lifecycleId: 'lifecycle-1',
    identityFingerprint: 'fingerprint-1',
    candidateId: 'ashwagandha-stress-evidence',
    platform: 'carousel',
    angleKey: 'ashwagandha-stress-evidence:carousel:fresh-angle',
    publishedAt: '2026-08-20T12:00:00.000Z',
    observedFrom: '2026-08-20T12:00:00.000Z',
    observedTo: '2026-08-27T12:00:00.000Z',
    capturedAt: '2026-08-27T13:00:00.000Z',
    assetViews: 1000,
    qualifiedVisits: 50,
    completionRate: 0.7,
    saveRate: 0.05,
    ...overrides,
  }
}

function envelope(history, overrides = {}) {
  return {
    schemaVersion: FEEDBACK_HISTORY_SCHEMA_VERSION,
    status: history.length ? 'observed' : 'waiting-for-qualified-observations',
    history,
    counts: { accepted: history.length, rejected: 0 },
    ...overrides,
  }
}

describe('feedback history contract', () => {
  it('accepts normalized governed observation history', () => {
    const result = validateFeedbackHistoryEnvelope(envelope([record()]))
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
    expect(result.history).toHaveLength(1)
  })

  it('rejects bare arrays and wrong schema versions', () => {
    expect(validateFeedbackHistoryEnvelope([record()]).valid).toBe(false)
    const wrong = validateFeedbackHistoryEnvelope(envelope([], { schemaVersion: 'ad-hoc-history-v1' }))
    expect(wrong.errors.join('\n')).toMatch(/schemaVersion/i)
  })

  it('rejects duplicate observation identities', () => {
    const result = validateFeedbackHistoryEnvelope(envelope([record(), record()]))
    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toMatch(/observationId is duplicated/i)
  })

  it('rejects impossible metric and time relationships', () => {
    const result = validateFeedbackHistoryEnvelope(envelope([record({
      observedFrom: '2026-08-19T12:00:00.000Z',
      qualifiedVisits: 1200,
      completionRate: 1.2,
      saveRate: -0.1,
    })]))
    const errors = result.errors.join('\n')
    expect(errors).toMatch(/cannot predate publication/i)
    expect(errors).toMatch(/cannot exceed assetViews/i)
    expect(errors).toMatch(/completionRate/i)
    expect(errors).toMatch(/saveRate/i)
  })
})
