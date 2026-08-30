import { assertPublishableLifecycle, promoteDryRunScheduleToLive, transitionDistributionLifecycle } from './distribution-lifecycle.mjs'

const METRICOOL_API_BASE = 'https://app.metricool.com/api'
const DEFAULT_TIMEZONE = 'America/New_York'
const SUPPORTED_NETWORKS = new Set(['facebook', 'tiktok', 'youtube'])
const CAROUSEL_NETWORKS = new Set(['facebook', 'tiktok'])
const VERTICAL_VIDEO_NETWORKS = new Set(['facebook', 'tiktok', 'youtube'])
const OFFSET_AWARE_ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/i

function clean(value) {
  return String(value ?? '').trim()
}

function asArray(value) {
  if (Array.isArray(value)) return value
  return clean(value).split(',').map((item) => item.trim()).filter(Boolean)
}

function formatLocalDateTime(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`
}

function parseMetricoolNormalizedUrl(raw) {
  const value = clean(raw)
  if (!value) throw new Error('Metricool media normalization returned an empty URL')
  let normalized = value
  if (value.startsWith('"')) {
    try { normalized = JSON.parse(value) } catch { throw new Error('Metricool media normalization returned invalid URL data') }
  }
  let parsed
  try { parsed = new URL(normalized) } catch { throw new Error('Metricool media normalization returned an invalid URL') }
  if (parsed.protocol !== 'https:') throw new Error('Metricool media normalization returned a non-HTTPS URL')
  return parsed.toString()
}

export function normalizeMetricoolNetworks(value, { availableNetworks = [...SUPPORTED_NETWORKS] } = {}) {
  const available = new Set(asArray(availableNetworks).map((item) => clean(item).toLowerCase()))
  const networks = [...new Set(asArray(value).map((item) => clean(item).toLowerCase()))]
  if (!networks.length) throw new Error('Metricool scheduling requires at least one explicit network')
  const unsupported = networks.filter((network) => !SUPPORTED_NETWORKS.has(network))
  if (unsupported.length) throw new Error(`unsupported Metricool network(s): ${unsupported.join(', ')}`)
  const unavailable = networks.filter((network) => !available.has(network))
  if (unavailable.length) throw new Error(`Metricool brand is not configured for network(s): ${unavailable.join(', ')}`)
  return networks
}

export function buildMetricoolSchedulerRequest({
  format,
  networks,
  text,
  mediaUrls,
  publicationAt,
  timezone = DEFAULT_TIMEZONE,
  title,
  autoPublish = true,
  madeForKids = false,
  now = new Date(),
  availableNetworks = [...SUPPORTED_NETWORKS],
} = {}) {
  const normalizedFormat = clean(format).toLowerCase()
  if (!['carousel', 'vertical-video'].includes(normalizedFormat)) {
    throw new Error(`unsupported Metricool publication format: ${normalizedFormat || '<missing>'}`)
  }

  const selectedNetworks = normalizeMetricoolNetworks(networks, { availableNetworks })
  const allowed = normalizedFormat === 'carousel' ? CAROUSEL_NETWORKS : VERTICAL_VIDEO_NETWORKS
  const invalidForFormat = selectedNetworks.filter((network) => !allowed.has(network))
  if (invalidForFormat.length) {
    throw new Error(`${normalizedFormat} cannot publish to network(s): ${invalidForFormat.join(', ')}`)
  }

  const bodyText = clean(text)
  if (!bodyText) throw new Error('Metricool scheduling requires governed post text')

  const urls = asArray(mediaUrls)
  if (!urls.length) throw new Error('Metricool scheduling requires at least one public media URL')
  if (normalizedFormat === 'vertical-video' && urls.length !== 1) {
    throw new Error('vertical-video Metricool scheduling requires exactly one media URL')
  }
  for (const mediaUrl of urls) {
    let parsed
    try { parsed = new URL(mediaUrl) } catch { throw new Error(`invalid Metricool media URL: ${mediaUrl}`) }
    if (parsed.protocol !== 'https:') throw new Error(`Metricool media URL must use HTTPS: ${mediaUrl}`)
    if (parsed.hostname !== 'thehippiescientist.net') {
      throw new Error(`Metricool media URL must use the canonical publication host: ${mediaUrl}`)
    }
    if (!parsed.pathname.startsWith('/media/distribution/')) {
      throw new Error(`Metricool media URL must use the governed distribution-media path: ${mediaUrl}`)
    }
  }

  const publicationInput = clean(publicationAt)
  if (!OFFSET_AWARE_ISO_DATETIME.test(publicationInput)) {
    throw new Error('Metricool publicationAt must be an offset-aware ISO date/time')
  }
  const publishInstant = new Date(publicationInput)
  if (Number.isNaN(publishInstant.getTime())) throw new Error('Metricool publicationAt must be an offset-aware ISO date/time')
  const nowInstant = now instanceof Date ? now : new Date(now)
  if (Number.isNaN(nowInstant.getTime())) throw new Error('invalid scheduling clock')
  if (publishInstant.getTime() <= nowInstant.getTime()) throw new Error('Metricool publicationAt must be in the future')

  const publicationDate = {
    dateTime: formatLocalDateTime(publishInstant, timezone),
    timezone,
  }
  const request = {
    publicationDate,
    text: bodyText,
    providers: selectedNetworks.map((network) => ({ network })),
    autoPublish: Boolean(autoPublish),
    draft: false,
    shortener: false,
    saveExternalMediaFiles: true,
    media: urls,
  }

  if (selectedNetworks.includes('facebook')) {
    request.facebookData = { type: normalizedFormat === 'vertical-video' ? 'REEL' : 'POST', title: clean(title) }
  }
  if (selectedNetworks.includes('tiktok')) {
    request.tiktokData = {
      disableComment: false,
      disableDuet: false,
      disableStitch: false,
      privacyOption: 'PUBLIC_TO_EVERYONE',
      commercialContentThirdParty: false,
      commercialContentOwnBrand: false,
      title: clean(title),
      autoAddMusic: false,
      photoCoverIndex: 0,
      isAigc: false,
    }
  }
  if (selectedNetworks.includes('youtube')) {
    const videoTitle = clean(title)
    if (!videoTitle) throw new Error('YouTube Metricool scheduling requires a title')
    request.youtubeData = {
      title: videoTitle,
      type: 'short',
      privacy: 'public',
      tags: [],
      madeForKids: Boolean(madeForKids),
      isAiGeneratedContent: false,
    }
  }

  return request
}

async function normalizeMetricoolImageMedia({ urls, token, userId, blogId, fetchImpl }) {
  const normalized = []
  for (const mediaUrl of urls) {
    const endpoint = new URL(`${METRICOOL_API_BASE}/actions/normalize/image/url`)
    endpoint.searchParams.set('url', mediaUrl)
    endpoint.searchParams.set('blogId', blogId)
    endpoint.searchParams.set('userId', userId)
    const response = await fetchImpl(endpoint.toString(), {
      method: 'GET',
      headers: {
        Accept: 'text/plain',
        'X-Mc-Auth': token,
      },
    })
    const raw = await response.text()
    if (!response.ok) {
      throw new Error(`Metricool media normalization failed (${response.status}): ${raw.slice(0, 500)}`)
    }
    normalized.push(parseMetricoolNormalizedUrl(raw))
  }
  return normalized
}

function extractProviderIdentity(payload) {
  let candidate = payload?.data ?? payload
  if (Array.isArray(candidate)) candidate = candidate[0]
  if (Array.isArray(candidate?.data)) candidate = candidate.data[0]
  const externalId = clean(candidate?.id ?? candidate?.uuid ?? candidate?.postId)
  if (!externalId) throw new Error('Metricool scheduler response did not include a provider post id')
  return externalId
}

export async function scheduleMetricoolPublication({
  lifecycle,
  currentIdentity,
  request,
  mediaType = 'image',
  userToken = process.env.METRICOOL_USER_TOKEN,
  userId = process.env.METRICOOL_USER_ID,
  blogId = process.env.METRICOOL_BLOG_ID,
  fetchImpl = globalThis.fetch,
  now = new Date().toISOString(),
} = {}) {
  assertPublishableLifecycle(lifecycle, currentIdentity)
  const token = clean(userToken)
  const metricoolUserId = clean(userId)
  const metricoolBlogId = clean(blogId)
  if (!token) throw new Error('missing METRICOOL_USER_TOKEN')
  if (!metricoolUserId) throw new Error('missing METRICOOL_USER_ID')
  if (!metricoolBlogId) throw new Error('missing METRICOOL_BLOG_ID')
  if (typeof fetchImpl !== 'function') throw new Error('Metricool provider requires fetch')
  if (clean(mediaType).toLowerCase() !== 'image') {
    throw new Error('live Metricool media normalization is currently enabled for governed image/carousel assets only')
  }

  const rawMedia = asArray(request?.media)
  if (!rawMedia.length) throw new Error('Metricool provider request requires media before dispatch')
  const normalizedMedia = await normalizeMetricoolImageMedia({
    urls: rawMedia,
    token,
    userId: metricoolUserId,
    blogId: metricoolBlogId,
    fetchImpl,
  })
  const providerRequest = structuredClone(request)
  providerRequest.media = normalizedMedia
  providerRequest.saveExternalMediaFiles = true

  const endpoint = `${METRICOOL_API_BASE}/v2/scheduler/posts?blogId=${encodeURIComponent(metricoolBlogId)}&userId=${encodeURIComponent(metricoolUserId)}`
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Mc-Auth': token,
    },
    body: JSON.stringify(providerRequest),
  })
  const raw = await response.text()
  if (!response.ok) {
    throw new Error(`Metricool scheduler failed (${response.status}): ${raw.slice(0, 500)}`)
  }

  let payload
  try { payload = raw ? JSON.parse(raw) : {} } catch { throw new Error('Metricool scheduler returned invalid JSON') }
  const externalId = extractProviderIdentity(payload)
  const requestId = clean(response.headers?.get?.('x-request-id')) || null

  let nextLifecycle
  if (lifecycle.state === 'ready') {
    nextLifecycle = transitionDistributionLifecycle(lifecycle, 'scheduled', {
      currentIdentity,
      now,
      provider: 'metricool',
      externalId,
      requestId,
      dryRun: false,
    })
  } else {
    nextLifecycle = promoteDryRunScheduleToLive(lifecycle, {
      currentIdentity,
      now,
      provider: 'metricool',
      externalId,
      requestId,
    })
  }

  return {
    provider: 'metricool',
    externalId,
    requestId,
    lifecycle: nextLifecycle,
    response: payload,
  }
}
