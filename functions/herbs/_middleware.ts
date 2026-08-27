import manifest from '../../experiments/crawl-request-indexing/manifest.json'
import { verifyGooglebotRequest } from '../_shared/googlebot-verification'

interface KVNamespace {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

type Env = {
  CRAWL_EXPERIMENT_KV?: KVNamespace
}

type PagesFunctionContext = {
  request: Request
  env: Env
  next(): Promise<Response>
  waitUntil(promise: Promise<unknown>): void
}

type ExperimentEntry = {
  pathname: string
  arm: 'treatment' | 'control' | 'observational'
  lastmod_block?: string | null
  baseline_last_crawled?: string | null
  baseline_lastmod?: string | null
}

type CrawlEvent = {
  timestamp: string
  pathname: string
  http_status: number
  googlebot_type: string
  verification_method: string
  experiment_arm: 'treatment' | 'control' | 'observational'
  lastmod_block: string | null
  baseline_last_crawled: string | null
  baseline_lastmod: string | null
  cf_ray: string | null
}

type ResponseMetadata = {
  status: number
  contentType: string
  cfRay: string | null
}

type CloudflareRequest = Request & {
  cf?: {
    botManagement?: {
      verifiedBot?: boolean
    }
  }
}

const entries = (manifest.entries ?? []) as ExperimentEntry[]
const experimentActive = manifest.status === 'active'
const entryByPath = new Map(entries.map((entry) => [normalizePath(entry.pathname), entry]))
const LOG_TTL_SECONDS = 60 * 60 * 24 * 90

function normalizePath(value: string): string {
  const path = value.split(/[?#]/)[0] || '/'
  const withSlash = path.startsWith('/') ? path : `/${path}`
  if (withSlash === '/') return '/'
  return withSlash.replace(/\/+$/, '')
}

function isHtmlResponse(metadata: ResponseMetadata): boolean {
  return /text\/html/i.test(metadata.contentType)
}

async function persistEvent(env: Env, event: CrawlEvent): Promise<void> {
  const serialized = JSON.stringify(event)
  console.log('[crawl-experiment]', serialized)

  if (!env.CRAWL_EXPERIMENT_KV) return

  const suffix = event.cf_ray?.replace(/[^a-zA-Z0-9_-]/g, '') || crypto.randomUUID()
  const key = `crawl-experiment/v1/${event.timestamp}/${suffix}`
  await env.CRAWL_EXPERIMENT_KV.put(key, serialized, { expirationTtl: LOG_TTL_SECONDS })
}

async function logVerifiedGooglebotHtml(
  request: Request,
  response: ResponseMetadata,
  env: Env,
  entry: ExperimentEntry,
  observedAt: string,
): Promise<void> {
  if (!isHtmlResponse(response)) return

  const verification = await verifyGooglebotRequest(request)
  if (!verification.verified) return

  const cfVerified = (request as CloudflareRequest).cf?.botManagement?.verifiedBot === true
  const verificationMethod = cfVerified
    ? `${verification.verificationMethod}+cloudflare_verified_bot`
    : verification.verificationMethod

  const event: CrawlEvent = {
    // Capture request observation time before any asynchronous CIDR refresh so a
    // cache miss cannot shift the experiment's primary recrawl timestamp.
    timestamp: observedAt,
    pathname: entry.pathname,
    http_status: response.status,
    googlebot_type: verification.googlebotType,
    verification_method: verificationMethod,
    experiment_arm: entry.arm,
    lastmod_block: entry.lastmod_block ?? null,
    baseline_last_crawled: entry.baseline_last_crawled ?? null,
    baseline_lastmod: entry.baseline_lastmod ?? null,
    cf_ray: request.headers.get('cf-ray') ?? response.cfRay,
  }

  try {
    await persistEvent(env, event)
  } catch (error) {
    // Telemetry must never change crawler-visible behavior or page availability.
    console.warn('[crawl-experiment] telemetry write failed', error)
  }
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  const observedAt = new Date().toISOString()
  const pathname = normalizePath(new URL(context.request.url).pathname)
  const entry = experimentActive ? entryByPath.get(pathname) : undefined
  const looksLikeGooglebot = /Googlebot/i.test(context.request.headers.get('user-agent') ?? '')

  const response = await context.next()

  // Pending/unarmed manifests and URLs outside the exact 97-page registry are
  // intentionally silent: this is an experiment logger, not a general bot log.
  if (!entry || !looksLikeGooglebot) return response

  const metadata: ResponseMetadata = {
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    cfRay: response.headers.get('cf-ray'),
  }
  context.waitUntil(logVerifiedGooglebotHtml(context.request, metadata, context.env, entry, observedAt))

  return response
}
