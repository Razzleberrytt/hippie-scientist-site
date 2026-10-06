// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => {
  class TikTokPublisherError extends Error {
    status: number
    code: string
    constructor(message: string, status = 502, code = 'tiktok_error') {
      super(message)
      this.name = 'TikTokPublisherError'
      this.status = status
      this.code = code
    }
  }
  return {
    store: new Map<string, any>(),
    initialize: vi.fn(),
    status: vi.fn(),
    TikTokPublisherError,
  }
})

vi.mock('../functions/_shared/social-publisher-queue', () => ({
  getPublicationJob: vi.fn(async (_env: unknown, publicationId: string) => {
    const value = h.store.get(publicationId)
    return value ? structuredClone(value) : null
  }),
  replacePublicationJob: vi.fn(async (_env: unknown, job: any, expectedUpdatedAt: string) => {
    const current = h.store.get(job.publicationId)
    if (!current) throw new Error('THS publication job does not exist')
    if (current.updatedAt !== expectedUpdatedAt) throw new Error('THS publication job changed concurrently')
    h.store.set(job.publicationId, structuredClone(job))
    return structuredClone(job)
  }),
}))

vi.mock('../functions/_shared/tiktok-content-posting', () => ({
  initializeTikTokDraftUpload: h.initialize,
  fetchTikTokPublishStatus: h.status,
  TikTokPublisherError: h.TikTokPublisherError,
}))

import {
  cancelPublication,
  dispatchPublication,
  observePublication,
  recordManualPublication,
} from '../functions/_shared/social-publisher-runtime'

function job(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: 'ths-publication-job-v1',
    publicationId: 'pub_1234567890abcdef12345678',
    state: 'QUEUED',
    identity: {
      publicationId: 'pub_1234567890abcdef12345678',
      experimentId: 'EXP-014',
      artifactSha256: 'a'.repeat(64),
      platform: 'tiktok',
      intendedTime: '2026-10-07T14:00:00.000Z',
    },
    governance: {
      lifecycleId: 'dist_lifecycle',
      identityFingerprint: 'b'.repeat(64),
      format: 'vertical-video',
    },
    artifacts: ['https://thehippiescientist.net/media/distribution/publisher/example/video.mp4'],
    attempts: [],
    providerReceipt: null,
    providerReceipts: [],
    observerReceipts: [],
    failure: null,
    createdAt: '2026-10-06T14:00:00.000Z',
    updatedAt: '2026-10-06T14:00:00.000Z',
    ...overrides,
  }
}

function seed(value = job()) {
  h.store.set(value.publicationId, structuredClone(value))
  return value
}

describe('THS Publisher server runtime', () => {
  beforeEach(() => {
    h.store.clear()
    h.initialize.mockReset()
    h.status.mockReset()
  })

  it('dispatches once and binds TikTok publish_id under the canonical publication_id', async () => {
    seed()
    h.initialize.mockResolvedValue({ publishId: 'v_inbox_url~v2.123', logId: 'log-1' })

    const first = await dispatchPublication({} as any, job().publicationId, {
      now: '2026-10-06T14:01:00.000Z',
    })
    expect(first.status).toBe('provider-accepted')
    expect(first.job.state).toBe('PROVIDER_ACCEPTED')
    expect(first.job.attempts).toHaveLength(1)
    expect(first.job.providerReceipt).toMatchObject({
      provider: 'tiktok',
      providerOperationId: 'v_inbox_url~v2.123',
      publicationId: job().publicationId,
    })

    const second = await dispatchPublication({} as any, job().publicationId, {
      now: '2026-10-06T14:02:00.000Z',
    })
    expect(second.status).toBe('already-dispatched')
    expect(second.job.attempts).toHaveLength(1)
    expect(h.initialize).toHaveBeenCalledTimes(1)
  })

  it('freezes an ambiguous network outcome instead of retrying', async () => {
    seed()
    h.initialize.mockRejectedValue(new Error('socket reset after request write'))

    const result = await dispatchPublication({} as any, job().publicationId, {
      now: '2026-10-06T14:01:00.000Z',
    })
    expect(result.status).toBe('needs-reconciliation')
    expect(result.job.state).toBe('NEEDS_RECONCILIATION')
    expect(result.job.failure).toMatchObject({
      code: 'ambiguous_dispatch',
      retryable: false,
      ambiguousDispatch: true,
    })

    await expect(dispatchPublication({} as any, job().publicationId, {
      now: '2026-10-06T14:02:00.000Z',
    })).rejects.toThrow(/reconciliation/i)
    expect(h.initialize).toHaveBeenCalledTimes(1)
  })

  it('keeps explicit TikTok rejection distinct from ambiguous transport failure', async () => {
    seed()
    h.initialize.mockRejectedValue(new h.TikTokPublisherError('TikTok rejected request', 400, 'invalid_param'))

    const result = await dispatchPublication({} as any, job().publicationId, {
      now: '2026-10-06T14:01:00.000Z',
    })
    expect(result.status).toBe('failed')
    expect(result.job.state).toBe('FAILED')
    expect(result.job.failure).toMatchObject({
      provider: 'tiktok',
      code: 'invalid_param',
      ambiguousDispatch: false,
    })
  })

  it('does not treat inbox delivery as publication proof', async () => {
    seed(job({
      state: 'PROVIDER_ACCEPTED',
      providerReceipt: {
        provider: 'tiktok',
        providerOperationId: 'v_inbox_url~v2.123',
        publishId: 'v_inbox_url~v2.123',
      },
      providerReceipts: [{
        provider: 'tiktok',
        providerOperationId: 'v_inbox_url~v2.123',
        publishId: 'v_inbox_url~v2.123',
      }],
    }))
    h.status.mockResolvedValue({
      publishId: 'v_inbox_url~v2.123',
      status: 'SEND_TO_USER_INBOX',
      inboxDelivered: true,
      publishComplete: false,
      failed: false,
      publicPostIds: [],
      logId: 'obs-1',
    })

    const result = await observePublication({} as any, job().publicationId, {
      now: '2026-10-06T14:03:00.000Z',
    })
    expect(result.status).toBe('awaiting-user-post')
    expect(result.job.state).toBe('AWAITING_USER_POST')
    expect(result.job.observerReceipts).toHaveLength(1)
    expect(result.job).not.toHaveProperty('publishedAt')
  })

  it('promotes to PUBLISHED only with verified public post identity', async () => {
    seed(job({
      state: 'PROVIDER_ACCEPTED',
      providerReceipt: {
        provider: 'tiktok',
        providerOperationId: 'v_inbox_url~v2.123',
        publishId: 'v_inbox_url~v2.123',
      },
      providerReceipts: [],
    }))
    h.status.mockResolvedValue({
      publishId: 'v_inbox_url~v2.123',
      status: 'PUBLISH_COMPLETE',
      inboxDelivered: true,
      publishComplete: true,
      failed: false,
      publicPostIds: ['746123456789'],
      logId: 'obs-2',
    })

    const result = await observePublication({} as any, job().publicationId, {
      now: '2026-10-06T14:04:00.000Z',
    })
    expect(result.status).toBe('published')
    expect(result.job.state).toBe('PUBLISHED')
    expect(result.job.providerReceipt).toMatchObject({
      externalId: '746123456789',
      providerOperationId: 'v_inbox_url~v2.123',
    })
    expect(result.job.publishedAt).toBeTruthy()
  })

  it('cancels only jobs without unresolved provider side effects', async () => {
    seed()
    const cancelled = await cancelPublication({} as any, job().publicationId, {
      reason: 'editorial replacement before dispatch',
      now: '2026-10-06T14:01:00.000Z',
    })
    expect(cancelled.state).toBe('CANCELLED')
    expect(cancelled.failure).toMatchObject({ code: 'cancelled', retryable: false })

    h.store.set(job().publicationId, job({
      state: 'PROVIDER_ACCEPTED',
      providerReceipt: { provider: 'tiktok', providerOperationId: 'v_inbox_url~v2.123' },
    }))
    await expect(cancelPublication({} as any, job().publicationId)).rejects.toThrow(/provider side effects/i)
  })

  it('manual receipt records exact public URL without pretending the provider created it', async () => {
    seed()
    const published = await recordManualPublication({} as any, job().publicationId, {
      publicUrl: 'https://www.tiktok.com/@hippiescientist/video/746123456789',
      publishedAt: '2026-10-06T14:10:00.000Z',
      now: '2026-10-06T14:11:00.000Z',
    })
    expect(published.state).toBe('PUBLISHED')
    expect(published.providerReceipt).toMatchObject({
      provider: 'manual',
      publicUrl: 'https://www.tiktok.com/@hippiescientist/video/746123456789',
    })
  })
})
