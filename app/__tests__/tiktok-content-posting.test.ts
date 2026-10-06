import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assertGovernedTikTokVideoUrl,
  createTikTokAuthorizationUrl,
  exchangeTikTokAuthorizationCode,
  fetchTikTokPublishStatus,
  initializeTikTokDraftUpload,
  loadTikTokToken,
  type KVNamespace,
  type TikTokPublisherEnv,
} from '../../functions/_shared/tiktok-content-posting'

function createMockKV() {
  const store = new Map<string, string>()
  return {
    get: vi.fn(async (key: string) => store.get(key) || null),
    put: vi.fn(async (key: string, value: string) => { store.set(key, value) }),
    delete: vi.fn(async (key: string) => { store.delete(key) }),
  } as KVNamespace
}

function tokenResponse(overrides: Record<string, unknown> = {}) {
  return {
    access_token: 'access-1',
    expires_in: 86400,
    open_id: 'open-id-123456',
    refresh_expires_in: 31536000,
    refresh_token: 'refresh-1',
    scope: 'video.upload',
    token_type: 'Bearer',
    ...overrides,
  }
}

describe('TikTok Content Posting bridge', () => {
  let env: TikTokPublisherEnv
  let originalFetch: typeof fetch

  beforeEach(() => {
    env = {
      TIKTOK_CLIENT_KEY: 'client-key',
      TIKTOK_CLIENT_SECRET: 'client-secret',
      TIKTOK_REDIRECT_URI: 'https://thehippiescientist.net/api/tiktok/callback',
      TIKTOK_PUBLISHER_ADMIN_TOKEN: 'admin-token',
      TIKTOK_TOKEN_KV: createMockKV(),
    }
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('builds a video.upload-only authorization URL and stores one-time state', async () => {
    const url = new URL(await createTikTokAuthorizationUrl(env))
    expect(url.origin + url.pathname).toBe('https://www.tiktok.com/v2/auth/authorize/')
    expect(url.searchParams.get('client_key')).toBe('client-key')
    expect(url.searchParams.get('scope')).toBe('video.upload')
    expect(url.searchParams.get('redirect_uri')).toBe('https://thehippiescientist.net/api/tiktok/callback')
    const state = url.searchParams.get('state') || ''
    expect(state).toMatch(/^[0-9a-f]{64}$/)
    expect(await env.TIKTOK_TOKEN_KV?.get('tiktok:publisher:oauth-state:' + state)).toBeTruthy()
  })

  it('exchanges an authorization code and stores token material only in KV', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(init?.body)).toContain('grant_type=authorization_code')
      expect(String(init?.body)).toContain('client_secret=client-secret')
      return new Response(JSON.stringify(tokenResponse()), { status: 200 })
    }) as typeof fetch
    const token = await exchangeTikTokAuthorizationCode(env, 'code-123', fetchImpl, Date.parse('2026-10-06T12:00:00Z'))
    expect(token.scope).toContain('video.upload')
    expect(token.accessExpiresAt).toBe('2026-10-07T12:00:00.000Z')
    expect(await env.TIKTOK_TOKEN_KV?.get('tiktok:publisher:user-token:v1')).toContain('refresh-1')
  })

  it('refreshes expiring access tokens and persists a rotated refresh token', async () => {
    const firstFetch = vi.fn(async () => new Response(JSON.stringify(tokenResponse({ expires_in: 60 })), { status: 200 })) as typeof fetch
    await exchangeTikTokAuthorizationCode(env, 'code-123', firstFetch, Date.parse('2026-10-06T12:00:00Z'))
    const refreshFetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      expect(String(init?.body)).toContain('grant_type=refresh_token')
      expect(String(init?.body)).toContain('refresh_token=refresh-1')
      return new Response(JSON.stringify(tokenResponse({
        access_token: 'access-2',
        refresh_token: 'refresh-2',
      })), { status: 200 })
    }) as typeof fetch
    const token = await loadTikTokToken(env, refreshFetch, Date.parse('2026-10-06T12:01:00Z'))
    expect(token.accessToken).toBe('access-2')
    expect(token.refreshToken).toBe('refresh-2')
    expect(await env.TIKTOK_TOKEN_KV?.get('tiktok:publisher:user-token:v1')).toContain('refresh-2')
  })

  it('rejects off-domain and non-governed video URLs', () => {
    expect(assertGovernedTikTokVideoUrl('https://thehippiescientist.net/media/distribution/tiktok/x/video.mp4'))
      .toBe('https://thehippiescientist.net/media/distribution/tiktok/x/video.mp4')
    expect(() => assertGovernedTikTokVideoUrl('https://evil.example/video.mp4')).toThrow(/governed/i)
    expect(() => assertGovernedTikTokVideoUrl('https://thehippiescientist.net/random/video.mp4')).toThrow(/governed/i)
  })

  it('uses PULL_FROM_URL and returns TikTok publish_id for a governed MP4', async () => {
    await env.TIKTOK_TOKEN_KV?.put('tiktok:publisher:user-token:v1', JSON.stringify({
      schemaVersion: 'tiktok-token-v1',
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      openId: 'open-id',
      scope: ['video.upload'],
      tokenType: 'Bearer',
      accessExpiresAt: '2099-01-01T00:00:00.000Z',
      refreshExpiresAt: '2099-01-01T00:00:00.000Z',
      updatedAt: '2026-10-06T12:00:00.000Z',
    }))
    const seen: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      seen.push({ url, init })
      if (init?.method === 'HEAD') {
        return new Response(null, { status: 200, headers: { 'content-type': 'video/mp4' } })
      }
      return new Response(JSON.stringify({
        data: { publish_id: 'v_inbox_url~v2.123' },
        error: { code: 'ok', message: '', log_id: 'log-1' },
      }), { status: 200 })
    }) as typeof fetch
    const result = await initializeTikTokDraftUpload(
      env,
      'https://thehippiescientist.net/media/distribution/tiktok/x/video.mp4',
      fetchImpl,
    )
    expect(result).toEqual({ publishId: 'v_inbox_url~v2.123', logId: 'log-1' })
    const initBody = JSON.parse(String(seen[1].init?.body))
    expect(initBody).toEqual({
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: 'https://thehippiescientist.net/media/distribution/tiktok/x/video.mp4',
      },
    })
    expect(seen[1].init?.headers).toMatchObject({ Authorization: 'Bearer access-1' })
  })

  it('normalizes SEND_TO_USER_INBOX without claiming public publication', async () => {
    await env.TIKTOK_TOKEN_KV?.put('tiktok:publisher:user-token:v1', JSON.stringify({
      schemaVersion: 'tiktok-token-v1',
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      openId: 'open-id',
      scope: ['video.upload'],
      tokenType: 'Bearer',
      accessExpiresAt: '2099-01-01T00:00:00.000Z',
      refreshExpiresAt: '2099-01-01T00:00:00.000Z',
      updatedAt: '2026-10-06T12:00:00.000Z',
    }))
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      data: {
        status: 'SEND_TO_USER_INBOX',
        fail_reason: '',
        publicaly_available_post_id: [],
        downloaded_bytes: 1234,
      },
      error: { code: 'ok', message: '', log_id: 'status-log' },
    }), { status: 200 })) as typeof fetch
    const result = await fetchTikTokPublishStatus(env, 'v_inbox_url~v2.123', fetchImpl)
    expect(result).toMatchObject({
      status: 'SEND_TO_USER_INBOX',
      inboxDelivered: true,
      publishComplete: false,
      failed: false,
      publicPostIds: [],
      downloadedBytes: 1234,
    })
  })
})
