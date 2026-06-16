import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { onRequest } from '../../functions/api/subscribe'

type MockKV = {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

type MockEnv = {
  MAILCHIMP_API_KEY: string
  MAILCHIMP_API_SERVER: string
  MAILCHIMP_LIST_ID: string
  MAILCHIMP_ADHD_TAG: string
  RATE_LIMIT_KV: MockKV
  TURNSTILE_SECRET_KEY?: string
}

const createMockKV = () => {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string) => store.get(key) || null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value)
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key)
    }),
  } as MockKV
}

describe('/api/subscribe Endpoint', () => {
  let mockEnv: MockEnv
  let originalFetch: typeof fetch

  beforeEach(() => {
    mockEnv = {
      MAILCHIMP_API_KEY: 'test-key',
      MAILCHIMP_API_SERVER: 'us19',
      MAILCHIMP_LIST_ID: 'test-audience',
      MAILCHIMP_ADHD_TAG: 'adhd-tag',
      RATE_LIMIT_KV: createMockKV(),
    }
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  const makeJsonRequest = (
    body: unknown,
    options: { method?: string; headers?: Record<string, string>; url?: string } = {}
  ) => {
    const method = options.method || 'POST'
    const headers = {
      'Content-Type': 'application/json',
      Origin: 'https://thehippiescientist.net',
      ...options.headers,
    }
    const url = options.url || 'https://thehippiescientist.net/api/subscribe'
    
    const init: RequestInit = {
      method,
      headers,
    }
    
    if (method !== 'GET' && method !== 'HEAD' && body !== undefined) {
      init.body = JSON.stringify(body)
    }
    
    return new Request(url, init)
  }

  it('rejects non-POST methods', async () => {
    const request = makeJsonRequest({}, { method: 'GET' })
    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(405)
    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.error).toBe('Method not allowed.')
  })

  it('rejects unsupported Content-Type', async () => {
    const request = new Request('https://thehippiescientist.net/api/subscribe', {
      method: 'POST',
      headers: { 
        'Content-Type': 'text/plain',
        Origin: 'https://thehippiescientist.net',
      },
      body: 'plain text',
    })
    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(415)
    const data = await response.json()
    expect(data.error).toContain('Unsupported Content-Type')
  })

  it('rejects oversized bodies', async () => {
    const largeBody = { email: 'a'.repeat(10500) + '@example.com' }
    const request = makeJsonRequest(largeBody)
    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(413)
    const data = await response.json()
    expect(data.error).toContain('Request body too large')
  })

  it('rejects malformed JSON', async () => {
    const request = new Request('https://thehippiescientist.net/api/subscribe', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Origin: 'https://thehippiescientist.net',
      },
      body: '{invalid-json',
    })
    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Invalid JSON body.')
  })

  it('intercepts and accepts honeypot submissions without processing Mailchimp', async () => {
    const request = makeJsonRequest({
      email: 'bot@spambot.com',
      confirmEmail: 'triggered-spam-detector',
    })
    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy

    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.ok).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects invalid email formats', async () => {
    const request = makeJsonRequest({ email: 'not-an-email' })
    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Enter a valid email address.')
  })

  it('rejects non-approved origins in production', async () => {
    // Override the Origin header to something not on our list
    const request = makeJsonRequest(
      { email: 'valid@example.com' },
      {
        url: 'https://thehippiescientist.net/api/subscribe',
        headers: {
          Origin: 'https://evil-hacker.com',
        },
      }
    )
    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(403)
    const data = await response.json()
    expect(data.error).toBe('Invalid origin.')
  })

  it('allows approved apex/www origins in production', async () => {
    const request = makeJsonRequest(
      { email: 'valid@example.com' },
      {
        url: 'https://thehippiescientist.net/api/subscribe',
        headers: {
          Origin: 'https://thehippiescientist.net',
        },
      }
    )

    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })

    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.ok).toBe(true)
  })

  it('implements rate limiting (max 5 requests per 10 mins)', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    })

    // First 5 requests should pass
    for (let i = 0; i < 5; i++) {
      const request = makeJsonRequest(
        { email: `user${i}@example.com` },
        { headers: { 'CF-Connecting-IP': '1.2.3.4' } }
      )
      const res = await onRequest({ request, env: mockEnv })
      expect(res.status).toBe(200)
    }

    // 6th request from same IP should fail with 429
    const requestBlocked = makeJsonRequest(
      { email: 'blocked@example.com' },
      { headers: { 'CF-Connecting-IP': '1.2.3.4' } }
    )
    const resBlocked = await onRequest({ request: requestBlocked, env: mockEnv })
    expect(resBlocked.status).toBe(429)
    const data = await resBlocked.json()
    expect(data.error).toContain('Too many requests')
  })

  it('verifies Cloudflare Turnstile token when TURNSTILE_SECRET_KEY is present', async () => {
    mockEnv.TURNSTILE_SECRET_KEY = 'turnstile-secret'
    
    // Mock Turnstile verification failing
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('siteverify')) {
        return new Response(JSON.stringify({ success: false }), { status: 200 })
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }) as typeof fetch

    const request = makeJsonRequest({
      email: 'valid@example.com',
      turnstileToken: 'invalid-token',
    })
    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Security verification failed.')
  })

  it('sanitizes Mailchimp API upstream error details from client response', async () => {
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          title: 'Forgotten Email Address',
          detail: 'This email address was deleted by user request and cannot be added again.',
        }),
        { status: 400 }
      )
    })

    const request = makeJsonRequest({ email: 'valid@example.com' })
    const response = await onRequest({ request, env: mockEnv })
    
    // Status is 500 (sanitized error status)
    expect(response.status).toBe(500)
    const data = await response.json()
    // The specific Mailchimp error detail must NOT leak to the user
    expect(data.error).toBe('Could not subscribe this email right now. Please try again.')
  })

  it('fails closed with 503 in production when TURNSTILE_SECRET_KEY is missing', async () => {
    const env = { ...mockEnv, ENVIRONMENT: 'production' } as MockEnv & { ENVIRONMENT: string }
    delete (env as { TURNSTILE_SECRET_KEY?: string }).TURNSTILE_SECRET_KEY
    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const request = makeJsonRequest({ email: 'valid@example.com' })
    const response = await onRequest({ request, env })
    expect(response.status).toBe(503)
    const data = await response.json()
    expect(data.error).toBe('Security verification is not configured.')
    // Must not reach Mailchimp when security is not configured.
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fails closed with 429 in production when RATE_LIMIT_KV is not bound', async () => {
    const env = { ...mockEnv, ENVIRONMENT: 'production', TURNSTILE_SECRET_KEY: 'x' } as MockEnv
    delete (env as { RATE_LIMIT_KV?: unknown }).RATE_LIMIT_KV

    const request = makeJsonRequest(
      { email: 'valid@example.com' },
      { headers: { 'CF-Connecting-IP': '9.9.9.9' } }
    )
    const response = await onRequest({ request, env })
    expect(response.status).toBe(429)
    const data = await response.json()
    expect(data.error).toContain('Too many requests')
  })

  it('stays permissive in local dev when RATE_LIMIT_KV is not bound', async () => {
    // No ENVIRONMENT (treated as non-production) and no KV binding.
    const env = { ...mockEnv } as MockEnv
    delete (env as { RATE_LIMIT_KV?: unknown }).RATE_LIMIT_KV
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof fetch

    const request = makeJsonRequest({ email: 'valid@example.com' })
    const response = await onRequest({ request, env })
    expect(response.status).toBe(200)
  })

  it('fails closed with 429 in production when the KV read throws', async () => {
    const failingKv = {
      get: vi.fn(async () => {
        throw new Error('KV unavailable')
      }),
      put: vi.fn(async () => {}),
      delete: vi.fn(async () => {}),
    } as MockKV
    const env = { ...mockEnv, ENVIRONMENT: 'production', TURNSTILE_SECRET_KEY: 'x', RATE_LIMIT_KV: failingKv } as MockEnv

    const request = makeJsonRequest(
      { email: 'valid@example.com' },
      { headers: { 'CF-Connecting-IP': '8.8.8.8' } }
    )
    const response = await onRequest({ request, env })
    expect(response.status).toBe(429)
  })

  it('hashes the client IP before using it as a rate-limit KV key', async () => {
    const kv = createMockKV()
    const env = { ...mockEnv, RATE_LIMIT_KV: kv, RATE_LIMIT_IP_HASH_SALT: 'unit-test-salt' } as MockEnv
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof fetch

    const request = makeJsonRequest(
      { email: 'hash@example.com' },
      { headers: { 'CF-Connecting-IP': '203.0.113.7' } }
    )
    await onRequest({ request, env })

    const putKey = (kv.put as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
    expect(putKey).toMatch(/^rate-limit:[0-9a-f]{64}$/)
    // The raw IP must never appear in the KV key.
    expect(putKey).not.toContain('203.0.113.7')
  })

  it('processes subscription and tagging successfully', async () => {
    const fetchCalls: string[] = []
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      fetchCalls.push(url)
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }) as typeof fetch

    const request = makeJsonRequest({
      email: 'happy@example.com',
      firstName: 'Happy',
      magnet: 'test-magnet',
    })

    const response = await onRequest({ request, env: mockEnv })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.ok).toBe(true)
    expect(data.magnet).toBe('test-magnet')

    // Verifies Mailchimp member PUT and tagging POST endpoints were called
    expect(fetchCalls.length).toBe(2)
    expect(fetchCalls[0]).toContain('/members/4a255c983b9d9ba53244471d5e5adc5a') // md5 of happy@example.com
    expect(fetchCalls[1]).toContain('/members/4a255c983b9d9ba53244471d5e5adc5a/tags')
  })
})
