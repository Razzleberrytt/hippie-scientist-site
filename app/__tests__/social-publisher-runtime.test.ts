import { describe, expect, it, vi } from 'vitest'
import {
  enqueuePublicationJob,
  getPublicationJob,
  listDuePublicationJobs,
  replacePublicationJob,
  type D1DatabaseLike,
} from '../../functions/_shared/social-publisher-queue'
import {
  dispatchPublication,
  observePublication,
  recordManualPublication,
  type SocialPublisherRuntimeEnv,
} from '../../functions/_shared/social-publisher-runtime'
import type { KVNamespace } from '../../functions/_shared/tiktok-content-posting'

type Row = {
  publication_id: string
  experiment_id: string
  artifact_sha256: string
  platform: string
  intended_time: string
  state: string
  attempts: number
  provider: string | null
  provider_operation_id: string | null
  job_json: string
  created_at: string
  updated_at: string
}

class FakeStatement {
  private values: unknown[] = []
  constructor(private database: FakeD1, private query: string) {}
  bind(...values: unknown[]) {
    this.values = values
    return this
  }
  async first<T>() {
    const q = this.query.replace(/\s+/g, ' ').trim()
    if (q.includes('WHERE publication_id = ?1')) {
      return (this.database.rows.get(String(this.values[0])) || null) as T | null
    }
    if (q.includes('WHERE platform = ?1 AND intended_time = ?2')) {
      const row = [...this.database.rows.values()].find((candidate) =>
        candidate.platform === String(this.values[0]) && candidate.intended_time === String(this.values[1]))
      return (row ? { publication_id: row.publication_id } : null) as T | null
    }
    throw new Error('unhandled first SQL: ' + q)
  }
  async run<T>() {
    const q = this.query.replace(/\s+/g, ' ').trim()
    if (q.startsWith('INSERT OR IGNORE INTO ths_publications')) {
      const [
        publication_id, experiment_id, artifact_sha256, platform, intended_time, state,
        attempts, provider, provider_operation_id, job_json, created_at, updated_at,
      ] = this.values.map((value) => value === null ? null : String(value))
      const slotTaken = [...this.database.rows.values()].some((row) =>
        row.platform === platform && row.intended_time === intended_time && row.publication_id !== publication_id)
      if (!this.database.rows.has(String(publication_id)) && !slotTaken) {
        this.database.rows.set(String(publication_id), {
          publication_id: String(publication_id),
          experiment_id: String(experiment_id),
          artifact_sha256: String(artifact_sha256),
          platform: String(platform),
          intended_time: String(intended_time),
          state: String(state),
          attempts: Number(attempts),
          provider: provider === null ? null : String(provider),
          provider_operation_id: provider_operation_id === null ? null : String(provider_operation_id),
          job_json: String(job_json),
          created_at: String(created_at),
          updated_at: String(updated_at),
        })
        return { success: true, meta: { changes: 1 }, results: [] as T[] }
      }
      return { success: true, meta: { changes: 0 }, results: [] as T[] }
    }
    if (q.startsWith('UPDATE ths_publications SET')) {
      const [state, attempts, provider, operation, jobJson, updatedAt, publicationId, expected] = this.values
      const row = this.database.rows.get(String(publicationId))
      if (!row || row.updated_at !== String(expected)) {
        return { success: true, meta: { changes: 0 }, results: [] as T[] }
      }
      this.database.rows.set(String(publicationId), {
        ...row,
        state: String(state),
        attempts: Number(attempts),
        provider: provider === null ? null : String(provider),
        provider_operation_id: operation === null ? null : String(operation),
        job_json: String(jobJson),
        updated_at: String(updatedAt),
      })
      return { success: true, meta: { changes: 1 }, results: [] as T[] }
    }
    if (q.startsWith('SELECT * FROM ths_publications') && q.includes("WHERE state = 'QUEUED'")) {
      const cutoff = String(this.values[0])
      const limit = Number(this.values[1])
      const results = [...this.database.rows.values()]
        .filter((row) => row.state === 'QUEUED' && row.intended_time <= cutoff)
        .sort((a, b) => a.intended_time.localeCompare(b.intended_time) || a.publication_id.localeCompare(b.publication_id))
        .slice(0, limit)
      return { success: true, meta: { changes: 0 }, results: results as T[] }
    }
    throw new Error('unhandled run SQL: ' + q)
  }
}

class FakeD1 {
  rows = new Map<string, Row>()
  prepare(query: string) {
    return new FakeStatement(this, query)
  }
}

function kv(): KVNamespace {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string) => store.get(key) || null),
    put: vi.fn(async (key: string, value: string) => { store.set(key, value) }),
    delete: vi.fn(async (key: string) => { store.delete(key) }),
  }
}

function environment(): SocialPublisherRuntimeEnv {
  return {
    THS_PUBLISHER_DB: new FakeD1() as unknown as D1DatabaseLike,
    THS_PUBLISHER_ADMIN_TOKEN: 'publisher-admin',
    TIKTOK_CLIENT_KEY: 'client-key',
    TIKTOK_CLIENT_SECRET: 'client-secret',
    TIKTOK_REDIRECT_URI: 'https://thehippiescientist.net/api/tiktok/callback',
    TIKTOK_PUBLISHER_ADMIN_TOKEN: 'tiktok-admin',
    TIKTOK_TOKEN_KV: kv(),
  }
}

function job(overrides: Record<string, unknown> = {}) {
  const publicationId = String(overrides.publicationId || 'pub_' + 'a'.repeat(24))
  return {
    schemaVersion: 'ths-publication-job-v1',
    publicationId,
    state: 'QUEUED',
    identity: {
      publicationId,
      experimentId: String(overrides.experimentId || 'EXP-013'),
      artifactSha256: String(overrides.artifactSha256 || 'b'.repeat(64)),
      platform: String(overrides.platform || 'tiktok'),
      intendedTime: String(overrides.intendedTime || '2026-10-06T18:00:00.000Z'),
    },
    governance: {
      lifecycleId: 'dist-example',
      identityFingerprint: 'c'.repeat(64),
      format: 'vertical-video',
    },
    artifacts: [String(overrides.mediaUrl || 'https://thehippiescientist.net/media/distribution/publisher/exp-013/video.mp4')],
    attempts: [],
    providerReceipt: null,
    providerReceipts: [],
    observerReceipts: [],
    failure: null,
    createdAt: '2026-10-06T17:00:00.000Z',
    updatedAt: '2026-10-06T17:00:00.000Z',
  }
}

async function seedTikTok(env: SocialPublisherRuntimeEnv) {
  await env.TIKTOK_TOKEN_KV?.put('tiktok:publisher:user-token:v1', JSON.stringify({
    schemaVersion: 'tiktok-token-v1',
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    openId: 'open-id',
    scope: ['video.upload'],
    tokenType: 'Bearer',
    accessExpiresAt: '2099-01-01T00:00:00.000Z',
    refreshExpiresAt: '2099-01-01T00:00:00.000Z',
    updatedAt: '2026-10-06T17:00:00.000Z',
  }))
}

describe('THS Publisher D1 queue', () => {
  it('enqueues idempotently and rejects a second publication in the same platform/time slot', async () => {
    const env = environment()
    const original = job()
    expect((await enqueuePublicationJob(env, original)).publicationId).toBe(original.publicationId)
    expect((await enqueuePublicationJob(env, original)).publicationId).toBe(original.publicationId)
    await expect(enqueuePublicationJob(env, job({
      publicationId: 'pub_' + 'd'.repeat(24),
      experimentId: 'EXP-OTHER',
      artifactSha256: 'e'.repeat(64),
    }))).rejects.toThrow(/slot/i)
  })

  it('uses compare-and-swap updates and only auto-selects QUEUED work', async () => {
    const env = environment()
    const original = await enqueuePublicationJob(env, job())
    const changed = structuredClone(original)
    changed.state = 'FAILED'
    changed.failure = { retryable: true }
    changed.updatedAt = '2026-10-06T17:01:00.000Z'
    await replacePublicationJob(env, changed, original.updatedAt)
    await expect(replacePublicationJob(env, changed, original.updatedAt)).rejects.toThrow(/concurrently/i)
    const due = await listDuePublicationJobs(env, { now: '2026-10-06T19:00:00.000Z' })
    expect(due).toHaveLength(0)
  })
})

describe('THS Publisher runtime', () => {
  it('dispatches one TikTok upload under publication_id and does not duplicate an accepted job', async () => {
    const env = environment()
    await seedTikTok(env)
    const queued = await enqueuePublicationJob(env, job())
    let calls = 0
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      calls += 1
      if (init?.method === 'HEAD') return new Response(null, { status: 200, headers: { 'content-type': 'video/mp4' } })
      return new Response(JSON.stringify({
        data: { publish_id: 'v_inbox_url~v2.123' },
        error: { code: 'ok', log_id: 'log-1' },
      }), { status: 200 })
    }) as typeof fetch

    const first = await dispatchPublication(env, queued.publicationId, {
      fetchImpl,
      now: '2026-10-06T18:01:00.000Z',
    })
    expect(first.status).toBe('provider-accepted')
    expect(first.job.state).toBe('PROVIDER_ACCEPTED')
    expect(first.job.providerReceipt).toMatchObject({
      provider: 'tiktok',
      providerOperationId: 'v_inbox_url~v2.123',
    })
    const callsAfterFirst = calls
    const second = await dispatchPublication(env, queued.publicationId, {
      fetchImpl,
      now: '2026-10-06T18:02:00.000Z',
    })
    expect(second.status).toBe('already-dispatched')
    expect(calls).toBe(callsAfterFirst)
    expect((await getPublicationJob(env, queued.publicationId))?.attempts).toHaveLength(1)
  })

  it('freezes a lost dispatch response as NEEDS_RECONCILIATION', async () => {
    const env = environment()
    await seedTikTok(env)
    const queued = await enqueuePublicationJob(env, job())
    let request = 0
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      request += 1
      if (init?.method === 'HEAD') return new Response(null, { status: 200, headers: { 'content-type': 'video/mp4' } })
      throw new TypeError('socket reset after write')
    }) as typeof fetch
    const result = await dispatchPublication(env, queued.publicationId, {
      fetchImpl,
      now: '2026-10-06T18:01:00.000Z',
    })
    expect(request).toBe(2)
    expect(result.status).toBe('needs-reconciliation')
    expect(result.job.state).toBe('NEEDS_RECONCILIATION')
    expect(result.job.failure).toMatchObject({ retryable: false, ambiguousDispatch: true })
    await expect(dispatchPublication(env, queued.publicationId, { fetchImpl })).rejects.toThrow(/reconciliation/i)
  })

  it('Observer distinguishes inbox delivery from verified publication', async () => {
    const env = environment()
    await seedTikTok(env)
    const queued = await enqueuePublicationJob(env, job())
    let phase = 'dispatch'
    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'HEAD') return new Response(null, { status: 200, headers: { 'content-type': 'video/mp4' } })
      if (phase === 'dispatch') {
        phase = 'inbox'
        return new Response(JSON.stringify({
          data: { publish_id: 'v_inbox_url~v2.123' },
          error: { code: 'ok', log_id: 'dispatch-log' },
        }), { status: 200 })
      }
      if (phase === 'inbox') {
        phase = 'published'
        return new Response(JSON.stringify({
          data: { status: 'SEND_TO_USER_INBOX', publicaly_available_post_id: [], downloaded_bytes: 100 },
          error: { code: 'ok', log_id: 'inbox-log' },
        }), { status: 200 })
      }
      return new Response(JSON.stringify({
        data: { status: 'PUBLISH_COMPLETE', publicaly_available_post_id: ['746123456789'], downloaded_bytes: 100 },
        error: { code: 'ok', log_id: 'published-log' },
      }), { status: 200 })
    }) as typeof fetch

    await dispatchPublication(env, queued.publicationId, { fetchImpl, now: '2026-10-06T18:01:00.000Z' })
    const inbox = await observePublication(env, queued.publicationId, { fetchImpl, now: '2026-10-06T18:02:00.000Z' })
    expect(inbox.status).toBe('awaiting-user-post')
    expect(inbox.job.state).toBe('AWAITING_USER_POST')
    const published = await observePublication(env, queued.publicationId, { fetchImpl, now: '2026-10-06T18:03:00.000Z' })
    expect(published.status).toBe('published')
    expect(published.job.state).toBe('PUBLISHED')
    expect(published.job.providerReceipt).toMatchObject({ externalId: '746123456789' })
    expect(published.job.observerReceipts).toHaveLength(2)
  })

  it('records manual publication against the same canonical job', async () => {
    const env = environment()
    const queued = await enqueuePublicationJob(env, job({
      platform: 'facebook',
      publicationId: 'pub_' + 'f'.repeat(24),
    }))
    const published = await recordManualPublication(env, queued.publicationId, {
      publicUrl: 'https://www.facebook.com/hippiescientist/posts/123',
      publishedAt: '2026-10-06T14:05:00-04:00',
      now: '2026-10-06T18:06:00.000Z',
    })
    expect(published.publicationId).toBe(queued.publicationId)
    expect(published.state).toBe('PUBLISHED')
    expect(published.providerReceipt).toMatchObject({ provider: 'manual' })
  })
})
