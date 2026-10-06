import {
  assertPublishableLifecycle,
  promoteDryRunScheduleToLive,
  transitionDistributionLifecycle,
} from './distribution-lifecycle.mjs'

const DEFAULT_BRIDGE_BASE = 'https://thehippiescientist.net'
const CANONICAL_HOST = 'thehippiescientist.net'

function clean(value) {
  return String(value ?? '').trim()
}

export function assertGovernedTikTokDraftUrl(value) {
  const raw = clean(value)
  let url
  try { url = new URL(raw) } catch { throw new Error('TikTok draft video URL is invalid') }
  if (
    url.protocol !== 'https:' ||
    url.hostname !== CANONICAL_HOST ||
    url.port ||
    url.username ||
    url.password ||
    !url.pathname.startsWith('/media/distribution/') ||
    !url.pathname.toLowerCase().endsWith('.mp4')
  ) {
    throw new Error('TikTok draft video must be a governed HTTPS MP4 on the canonical distribution-media path')
  }
  return url.toString()
}

async function bridgeRequest(pathname, {
  adminToken,
  bridgeBase = DEFAULT_BRIDGE_BASE,
  body,
  fetchImpl = globalThis.fetch,
} = {}) {
  const token = clean(adminToken)
  if (!token) throw new Error('missing TIKTOK_PUBLISHER_ADMIN_TOKEN')
  if (typeof fetchImpl !== 'function') throw new Error('TikTok upload provider requires fetch')
  const base = new URL(bridgeBase)
  const localBridge = ['localhost', '127.0.0.1'].includes(base.hostname)
  if (localBridge) {
    if (!['http:', 'https:'].includes(base.protocol)) throw new Error('local TikTok bridge must use HTTP(S)')
  } else if (base.protocol !== 'https:' || base.hostname !== CANONICAL_HOST || base.port) {
    throw new Error('TikTok bridge must use the canonical HTTPS publisher host')
  }
  if (base.username || base.password) throw new Error('TikTok bridge URL cannot contain credentials')
  const url = new URL(pathname, base).toString()
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const raw = await response.text()
  let payload
  try { payload = raw ? JSON.parse(raw) : {} } catch { throw new Error('TikTok bridge returned invalid JSON') }
  if (!response.ok || payload?.ok !== true) {
    throw new Error('TikTok bridge failed (' + response.status + '): ' + clean(payload?.code || payload?.error || 'unknown_error'))
  }
  return payload
}

export async function uploadGovernedTikTokDraft({
  lifecycle,
  currentIdentity,
  videoUrl,
  adminToken = process.env.TIKTOK_PUBLISHER_ADMIN_TOKEN,
  bridgeBase = process.env.TIKTOK_PUBLISHER_BRIDGE_BASE || DEFAULT_BRIDGE_BASE,
  fetchImpl = globalThis.fetch,
  now = new Date().toISOString(),
} = {}) {
  assertPublishableLifecycle(lifecycle, currentIdentity)
  const format = clean(currentIdentity?.format).toLowerCase()
  if (!['vertical-video', 'short-video'].includes(format)) {
    throw new Error('TikTok draft upload requires a governed short/vertical-video lifecycle identity')
  }
  const normalizedVideoUrl = assertGovernedTikTokDraftUrl(videoUrl)
  const payload = await bridgeRequest('/api/tiktok/upload', {
    adminToken,
    bridgeBase,
    fetchImpl,
    body: { videoUrl: normalizedVideoUrl },
  })
  const publishId = clean(payload.publishId)
  if (!publishId) throw new Error('TikTok bridge returned no publishId')
  const requestId = clean(payload.logId) || null

  const lifecycleNext = lifecycle.state === 'ready'
    ? transitionDistributionLifecycle(lifecycle, 'scheduled', {
        currentIdentity,
        now,
        provider: 'tiktok-draft-upload',
        externalId: publishId,
        requestId,
        dryRun: false,
      })
    : promoteDryRunScheduleToLive(lifecycle, {
        currentIdentity,
        now,
        provider: 'tiktok-draft-upload',
        externalId: publishId,
        requestId,
      })

  return {
    provider: 'tiktok-draft-upload',
    publishId,
    requestId,
    videoUrl: normalizedVideoUrl,
    lifecycle: lifecycleNext,
  }
}

export async function getGovernedTikTokDraftStatus({
  publishId,
  adminToken = process.env.TIKTOK_PUBLISHER_ADMIN_TOKEN,
  bridgeBase = process.env.TIKTOK_PUBLISHER_BRIDGE_BASE || DEFAULT_BRIDGE_BASE,
  fetchImpl = globalThis.fetch,
} = {}) {
  const id = clean(publishId)
  if (!id || id.length > 64) throw new Error('invalid TikTok publishId')
  const payload = await bridgeRequest('/api/tiktok/status', {
    adminToken,
    bridgeBase,
    fetchImpl,
    body: { publishId: id },
  })
  return {
    publishId: id,
    status: clean(payload.status),
    inboxDelivered: Boolean(payload.inboxDelivered),
    publishComplete: Boolean(payload.publishComplete),
    failed: Boolean(payload.failed),
    failReason: clean(payload.failReason) || null,
    publicPostIds: Array.isArray(payload.publicPostIds) ? payload.publicPostIds.map(String) : [],
    downloadedBytes: Number(payload.downloadedBytes) || 0,
    logId: clean(payload.logId) || null,
  }
}
