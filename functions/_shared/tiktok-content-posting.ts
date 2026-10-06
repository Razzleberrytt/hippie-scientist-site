export interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

export type TikTokPublisherEnv = {
  TIKTOK_CLIENT_KEY?: string
  TIKTOK_CLIENT_SECRET?: string
  TIKTOK_REDIRECT_URI?: string
  TIKTOK_PUBLISHER_ADMIN_TOKEN?: string
  TIKTOK_TOKEN_KV?: KVNamespace
}

type TikTokTokenRecord = {
  schemaVersion: 'tiktok-token-v1'
  accessToken: string
  refreshToken: string
  openId: string
  scope: string[]
  tokenType: string
  accessExpiresAt: string
  refreshExpiresAt: string
  updatedAt: string
}

type TikTokApiEnvelope<T> = {
  data?: T
  error?: {
    code?: string
    message?: string
    log_id?: string
  }
}

const AUTHORIZE_URL = 'https://www.tiktok.com/v2/auth/authorize/'
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const UPLOAD_URL = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/'
const STATUS_URL = 'https://open.tiktokapis.com/v2/post/publish/status/fetch/'
const TOKEN_KEY = 'tiktok:publisher:user-token:v1'
const STATE_PREFIX = 'tiktok:publisher:oauth-state:'
const STATE_TTL_SECONDS = 10 * 60
const REFRESH_SKEW_MS = 5 * 60 * 1000
const REQUIRED_SCOPE = 'video.upload'

export class TikTokPublisherError extends Error {
  status: number
  code: string

  constructor(message: string, status = 500, code = 'tiktok_publisher_error') {
    super(message)
    this.name = 'TikTokPublisherError'
    this.status = status
    this.code = code
  }
}

export class TikTokAmbiguousDispatchError extends TikTokPublisherError {
  constructor(message: string, status = 502, code = 'ambiguous_upload_dispatch') {
    super(message, status, code)
    this.name = 'TikTokAmbiguousDispatchError'
  }
}

function clean(value: unknown): string {
  return String(value ?? '').trim()
}

function requiredConfig(env: TikTokPublisherEnv) {
  const clientKey = clean(env.TIKTOK_CLIENT_KEY)
  const clientSecret = clean(env.TIKTOK_CLIENT_SECRET)
  const redirectUri = clean(env.TIKTOK_REDIRECT_URI)
  const kv = env.TIKTOK_TOKEN_KV
  if (!clientKey) throw new TikTokPublisherError('TikTok client key is not configured.', 503, 'missing_client_key')
  if (!clientSecret) throw new TikTokPublisherError('TikTok client secret is not configured.', 503, 'missing_client_secret')
  if (!redirectUri) throw new TikTokPublisherError('TikTok redirect URI is not configured.', 503, 'missing_redirect_uri')
  if (!kv) throw new TikTokPublisherError('TikTok token storage is not configured.', 503, 'missing_token_store')
  let parsed: URL
  try {
    parsed = new URL(redirectUri)
  } catch {
    throw new TikTokPublisherError('TikTok redirect URI is invalid.', 503, 'invalid_redirect_uri')
  }
  if (parsed.protocol !== 'https:') {
    throw new TikTokPublisherError('TikTok redirect URI must use HTTPS.', 503, 'invalid_redirect_uri')
  }
  return { clientKey, clientSecret, redirectUri, kv }
}

function constantTimeEqual(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false
  let mismatch = 0
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return mismatch === 0
}

export function requireTikTokAdmin(request: Request, env: TikTokPublisherEnv): void {
  const expected = clean(env.TIKTOK_PUBLISHER_ADMIN_TOKEN)
  if (!expected) {
    throw new TikTokPublisherError('TikTok publisher admin authentication is not configured.', 503, 'missing_admin_token')
  }
  const authorization = clean(request.headers.get('Authorization'))
  const actual = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!constantTimeEqual(actual, expected)) {
    throw new TikTokPublisherError('Unauthorized.', 401, 'unauthorized')
  }
}

function randomState(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
}

function scopesFrom(value: unknown): string[] {
  return [...new Set(clean(value).split(',').map((scope) => scope.trim()).filter(Boolean))]
}

function parseTokenRecord(raw: string | null): TikTokTokenRecord | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as TikTokTokenRecord
    if (
      parsed?.schemaVersion !== 'tiktok-token-v1' ||
      !clean(parsed.accessToken) ||
      !clean(parsed.refreshToken) ||
      !clean(parsed.openId) ||
      !Array.isArray(parsed.scope)
    ) return null
    return parsed
  } catch {
    return null
  }
}

async function storeToken(
  env: TikTokPublisherEnv,
  payload: Record<string, unknown>,
  nowMs = Date.now(),
): Promise<TikTokTokenRecord> {
  const { kv } = requiredConfig(env)
  const accessToken = clean(payload.access_token)
  const refreshToken = clean(payload.refresh_token)
  const openId = clean(payload.open_id)
  const tokenType = clean(payload.token_type) || 'Bearer'
  const scope = scopesFrom(payload.scope)
  const expiresIn = Number(payload.expires_in)
  const refreshExpiresIn = Number(payload.refresh_expires_in)

  if (!accessToken || !refreshToken || !openId || !Number.isFinite(expiresIn) || expiresIn <= 0) {
    throw new TikTokPublisherError('TikTok returned an incomplete token bundle.', 502, 'invalid_token_response')
  }
  if (!scope.includes(REQUIRED_SCOPE)) {
    throw new TikTokPublisherError('TikTok authorization did not grant video.upload.', 403, 'scope_not_authorized')
  }

  const safeRefreshSeconds = Number.isFinite(refreshExpiresIn) && refreshExpiresIn > 0 ? refreshExpiresIn : 31536000
  const record: TikTokTokenRecord = {
    schemaVersion: 'tiktok-token-v1',
    accessToken,
    refreshToken,
    openId,
    scope,
    tokenType,
    accessExpiresAt: new Date(nowMs + expiresIn * 1000).toISOString(),
    refreshExpiresAt: new Date(nowMs + safeRefreshSeconds * 1000).toISOString(),
    updatedAt: new Date(nowMs).toISOString(),
  }
  await kv.put(TOKEN_KEY, JSON.stringify(record))
  return record
}

async function tokenRequest(
  env: TikTokPublisherEnv,
  params: URLSearchParams,
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  let response: Response
  try {
    response = await fetchImpl(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: params,
    })
  } catch {
    throw new TikTokPublisherError('TikTok token service is unreachable.', 503, 'token_transport_failed')
  }
  const raw = await response.text()
  let payload: Record<string, unknown>
  try {
    payload = raw ? JSON.parse(raw) as Record<string, unknown> : {}
  } catch {
    throw new TikTokPublisherError('TikTok token service returned invalid JSON.', 502, 'invalid_token_json')
  }
  if (!response.ok || clean(payload.error)) {
    throw new TikTokPublisherError('TikTok token request was rejected.', response.status || 502, clean(payload.error) || 'token_request_failed')
  }
  return payload
}

export async function createTikTokAuthorizationUrl(env: TikTokPublisherEnv): Promise<string> {
  const { clientKey, redirectUri, kv } = requiredConfig(env)
  const state = randomState()
  await kv.put(STATE_PREFIX + state, JSON.stringify({ createdAt: new Date().toISOString() }), {
    expirationTtl: STATE_TTL_SECONDS,
  })
  const url = new URL(AUTHORIZE_URL)
  url.searchParams.set('client_key', clientKey)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', REQUIRED_SCOPE)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  url.searchParams.set('disable_auto_auth', '1')
  return url.toString()
}

export async function consumeTikTokOAuthState(env: TikTokPublisherEnv, state: string): Promise<void> {
  const { kv } = requiredConfig(env)
  const normalized = clean(state)
  if (!normalized) throw new TikTokPublisherError('Missing OAuth state.', 400, 'missing_oauth_state')
  const key = STATE_PREFIX + normalized
  const stored = await kv.get(key)
  if (!stored) throw new TikTokPublisherError('OAuth state is invalid or expired.', 400, 'invalid_oauth_state')
  await kv.delete(key)
}

export async function exchangeTikTokAuthorizationCode(
  env: TikTokPublisherEnv,
  code: string,
  fetchImpl: typeof fetch = fetch,
  nowMs = Date.now(),
): Promise<TikTokTokenRecord> {
  const { clientKey, clientSecret, redirectUri } = requiredConfig(env)
  const normalizedCode = clean(code)
  if (!normalizedCode) throw new TikTokPublisherError('Missing TikTok authorization code.', 400, 'missing_code')
  const params = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    code: normalizedCode,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  })
  return storeToken(env, await tokenRequest(env, params, fetchImpl), nowMs)
}

export async function loadTikTokToken(
  env: TikTokPublisherEnv,
  fetchImpl: typeof fetch = fetch,
  nowMs = Date.now(),
): Promise<TikTokTokenRecord> {
  const { clientKey, clientSecret, kv } = requiredConfig(env)
  const record = parseTokenRecord(await kv.get(TOKEN_KEY))
  if (!record) throw new TikTokPublisherError('TikTok is not connected yet.', 409, 'not_connected')

  const accessExpiresAt = Date.parse(record.accessExpiresAt)
  if (Number.isFinite(accessExpiresAt) && accessExpiresAt - nowMs > REFRESH_SKEW_MS) return record

  const refreshExpiresAt = Date.parse(record.refreshExpiresAt)
  if (!Number.isFinite(refreshExpiresAt) || refreshExpiresAt <= nowMs) {
    throw new TikTokPublisherError('TikTok authorization has expired and must be reconnected.', 409, 'refresh_expired')
  }

  const params = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
    refresh_token: record.refreshToken,
  })
  return storeToken(env, await tokenRequest(env, params, fetchImpl), nowMs)
}

export async function getTikTokConnectionSummary(env: TikTokPublisherEnv): Promise<Record<string, unknown>> {
  const { kv } = requiredConfig(env)
  const record = parseTokenRecord(await kv.get(TOKEN_KEY))
  if (!record) return { connected: false }
  return {
    connected: true,
    scope: record.scope,
    accessExpiresAt: record.accessExpiresAt,
    refreshExpiresAt: record.refreshExpiresAt,
    updatedAt: record.updatedAt,
    openIdSuffix: record.openId.slice(-6),
  }
}

export function assertGovernedTikTokVideoUrl(value: unknown): string {
  const raw = clean(value)
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new TikTokPublisherError('TikTok video URL is invalid.', 400, 'invalid_video_url')
  }
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'thehippiescientist.net' ||
    url.port ||
    url.username ||
    url.password ||
    !url.pathname.startsWith('/media/distribution/') ||
    !url.pathname.toLowerCase().endsWith('.mp4')
  ) {
    throw new TikTokPublisherError(
      'TikTok video URL must be a governed HTTPS MP4 on the canonical distribution-media path.',
      400,
      'ungoverned_video_url',
    )
  }
  return url.toString()
}

async function parseTikTokEnvelope<T>(response: Response, label: string): Promise<{ data: T; logId: string | null }> {
  const raw = await response.text()
  let payload: TikTokApiEnvelope<T>
  try {
    payload = raw ? JSON.parse(raw) as TikTokApiEnvelope<T> : {}
  } catch {
    throw new TikTokPublisherError(label + ' returned invalid JSON.', 502, 'invalid_tiktok_json')
  }
  const code = clean(payload.error?.code)
  if (!response.ok || (code && code !== 'ok')) {
    throw new TikTokPublisherError(label + ' was rejected by TikTok.', response.status || 502, code || 'tiktok_request_failed')
  }
  if (!payload.data) throw new TikTokPublisherError(label + ' returned no data.', 502, 'missing_tiktok_data')
  return { data: payload.data, logId: clean(payload.error?.log_id) || null }
}

export async function verifyGovernedVideoReachable(
  videoUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const url = assertGovernedTikTokVideoUrl(videoUrl)
  let response: Response
  try {
    response = await fetchImpl(url, { method: 'HEAD', redirect: 'error' })
  } catch {
    throw new TikTokPublisherError('Governed TikTok video reachability check failed.', 503, 'video_reachability_transport_failed')
  }
  if (!response.ok) {
    throw new TikTokPublisherError('Governed TikTok video is not publicly reachable.', 409, 'video_unreachable')
  }
  const type = clean(response.headers.get('content-type')).toLowerCase()
  if (type && !type.includes('video/mp4') && !type.includes('application/octet-stream')) {
    throw new TikTokPublisherError('Governed TikTok video does not resolve as MP4 media.', 409, 'unexpected_video_content_type')
  }
}

export async function initializeTikTokDraftUpload(
  env: TikTokPublisherEnv,
  videoUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{ publishId: string; logId: string | null }> {
  const normalizedUrl = assertGovernedTikTokVideoUrl(videoUrl)
  const token = await loadTikTokToken(env, fetchImpl)
  if (!token.scope.includes(REQUIRED_SCOPE)) {
    throw new TikTokPublisherError('TikTok connection is missing video.upload.', 403, 'scope_not_authorized')
  }
  await verifyGovernedVideoReachable(normalizedUrl, fetchImpl)
  let response: Response
  try {
    response = await fetchImpl(UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token.accessToken,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: normalizedUrl,
        },
      }),
    })
  } catch {
    throw new TikTokAmbiguousDispatchError(
      'TikTok draft upload response was lost after the provider request began; reconcile before retrying.',
      502,
      'ambiguous_upload_transport',
    )
  }
  if (response.status >= 500) {
    throw new TikTokAmbiguousDispatchError(
      'TikTok draft upload returned a server error after the provider request began; reconcile before retrying.',
      response.status,
      'ambiguous_upload_server_error',
    )
  }

  let parsed: { data: { publish_id?: string }; logId: string | null }
  try {
    parsed = await parseTikTokEnvelope<{ publish_id?: string }>(response, 'TikTok draft upload')
  } catch (error) {
    if (
      error instanceof TikTokPublisherError &&
      ['invalid_tiktok_json', 'missing_tiktok_data'].includes(error.code)
    ) {
      throw new TikTokAmbiguousDispatchError(
        'TikTok draft upload returned an unusable response after the provider request began; reconcile before retrying.',
        error.status,
        'ambiguous_upload_response',
      )
    }
    throw error
  }
  const publishId = clean(parsed.data.publish_id)
  if (!publishId) {
    throw new TikTokAmbiguousDispatchError(
      'TikTok draft upload returned no publish_id after the provider request began; reconcile before retrying.',
      502,
      'ambiguous_missing_publish_id',
    )
  }
  return { publishId, logId: parsed.logId }
}

export async function fetchTikTokPublishStatus(
  env: TikTokPublisherEnv,
  publishId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Record<string, unknown>> {
  const normalizedPublishId = clean(publishId)
  if (!normalizedPublishId || normalizedPublishId.length > 64) {
    throw new TikTokPublisherError('TikTok publish_id is invalid.', 400, 'invalid_publish_id')
  }
  const token = await loadTikTokToken(env, fetchImpl)
  const response = await fetchImpl(STATUS_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token.accessToken,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ publish_id: normalizedPublishId }),
  })
  const parsed = await parseTikTokEnvelope<Record<string, unknown>>(response, 'TikTok publish status')
  const status = clean(parsed.data.status)
  return {
    publishId: normalizedPublishId,
    status,
    inboxDelivered: status === 'SEND_TO_USER_INBOX' || status === 'PUBLISH_COMPLETE',
    publishComplete: status === 'PUBLISH_COMPLETE',
    failed: status === 'FAILED',
    failReason: clean(parsed.data.fail_reason) || null,
    publicPostIds: Array.isArray(parsed.data.publicaly_available_post_id)
      ? parsed.data.publicaly_available_post_id.map((value) => String(value))
      : [],
    downloadedBytes: Number(parsed.data.downloaded_bytes) || 0,
    logId: parsed.logId,
  }
}

export function tiktokJsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export function tiktokErrorResponse(error: unknown): Response {
  if (error instanceof TikTokPublisherError) {
    return tiktokJsonResponse({ ok: false, error: error.message, code: error.code }, error.status)
  }
  console.error('TikTok publisher error:', error)
  return tiktokJsonResponse({ ok: false, error: 'TikTok publisher request failed.', code: 'internal_error' }, 500)
}
