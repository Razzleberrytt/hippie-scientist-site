import { afterEach, describe, expect, it, vi } from 'vitest'
import { onRequest } from '../../functions/api/subscribe-safety'

type MockKV = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

function createMockKV(): MockKV {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string) => store.get(key) || null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value)
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),
  }
}

function request(email = 'reader@example.com') {
  return new Request('https://thehippiescientist.net/api/subscribe-safety', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://thehippiescientist.net',
    },
    body: JSON.stringify({
      email,
      magnet: 'supplement-safety-checklist',
    }),
  })
}

describe('/api/subscribe-safety segmentation', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('uses the safety-checklist tag instead of the legacy ADHD tag', async () => {
    const calls: Array<{ url: string; body: string }> = []
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), body: String(init?.body || '') })
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }) as typeof fetch

    const response = await onRequest({
      request: request(),
      env: {
        MAILCHIMP_API_KEY: 'test-key',
        MAILCHIMP_API_SERVER: 'us19',
        MAILCHIMP_LIST_ID: 'test-audience',
        MAILCHIMP_ADHD_TAG: 'adhd-tag',
        MAILCHIMP_SAFETY_CHECKLIST_TAG: 'safety-checklist',
        RATE_LIMIT_KV: createMockKV(),
      },
    } as Parameters<typeof onRequest>[0])

    expect(response.status).toBe(200)
    expect(calls).toHaveLength(2)
    expect(calls[1].url).toMatch(/\/tags$/)
    expect(calls[1].body).toContain('safety-checklist')
    expect(calls[1].body).not.toContain('adhd-tag')
  })

  it('does not tag a generic subscriber as ADHD when no safety tag is configured', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    globalThis.fetch = fetchSpy as typeof fetch

    const response = await onRequest({
      request: request('generic@example.com'),
      env: {
        MAILCHIMP_API_KEY: 'test-key',
        MAILCHIMP_API_SERVER: 'us19',
        MAILCHIMP_LIST_ID: 'test-audience',
        MAILCHIMP_ADHD_TAG: 'adhd-tag',
        RATE_LIMIT_KV: createMockKV(),
      },
    } as Parameters<typeof onRequest>[0])

    expect(response.status).toBe(200)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
