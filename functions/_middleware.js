import {
  CRAWL_EXPERIMENT_ACTIVE,
  CRAWL_EXPERIMENT_ID,
  CRAWL_EXPERIMENT_REGISTRY,
} from './_shared/crawl-experiment-registry.mjs'
import { classifyGooglebot, isVerifiedGoogleCommonCrawlerIp } from './_shared/googlebot-verification.mjs'

function lookupRegistry(pathname) {
  const normalized = `/${pathname.replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/')
  return CRAWL_EXPERIMENT_REGISTRY[normalized] || null
}

function writeEvent(env, event) {
  const analytics = env?.CRAWL_EXPERIMENT_ANALYTICS
  if (analytics && typeof analytics.writeDataPoint === 'function') {
    analytics.writeDataPoint({
      indexes: [CRAWL_EXPERIMENT_ID],
      blobs: [
        event.timestamp,
        event.pathname,
        String(event.http_status),
        event.googlebot_type,
        event.verification_method,
        event.experiment_arm,
        event.lastmod_block || '',
        event.baseline_last_crawled || '',
        event.baseline_lastmod || '',
        event.cf_ray || '',
      ],
      doubles: [event.http_status],
    })
    return
  }
  console.log(JSON.stringify({ event: 'verified_googlebot_html_crawl', experiment_id: CRAWL_EXPERIMENT_ID, ...event }))
}

export async function onRequest(context) {
  if (!CRAWL_EXPERIMENT_ACTIVE) return context.next()

  const url = new URL(context.request.url)
  const registry = lookupRegistry(url.pathname)
  if (!registry) return context.next()

  const googlebotType = classifyGooglebot(context.request.headers.get('user-agent'))
  if (!googlebotType) return context.next()

  const sourceIp = context.request.headers.get('cf-connecting-ip') || ''
  if (!isVerifiedGoogleCommonCrawlerIp(sourceIp)) return context.next()

  const response = await context.next()
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('text/html')) return response

  const cfVerified = context.request.cf?.botManagement?.verifiedBot === true
  writeEvent(context.env, {
    timestamp: new Date().toISOString(),
    pathname: registry.pathname,
    http_status: response.status,
    googlebot_type: googlebotType,
    verification_method: cfVerified
      ? 'google-common-crawler-cidr+cloudflare-verified-bot'
      : 'google-common-crawler-cidr',
    experiment_arm: registry.arm,
    lastmod_block: registry.lastmod_block || null,
    baseline_last_crawled: registry.baseline_last_crawled || null,
    baseline_lastmod: registry.baseline_lastmod || null,
    cf_ray: context.request.headers.get('cf-ray') || null,
  })

  return response
}
