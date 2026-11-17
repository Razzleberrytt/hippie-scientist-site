#!/usr/bin/env node
/**
 * Critical-route HTTP health checker.
 *
 * Samples a representative set of production routes and verifies each
 * returns a 2xx response. Intended as a fast smoke test before the
 * heavier linkinator crawl in linkchecker.yml, or as a standalone
 * manual check: node scripts/check-links.mjs [--url=https://example.com]
 *
 * Exit code 0 = all OK, 1 = one or more failures.
 */

import { parseArgs } from 'node:util'
import { probeCriticalRoutes, probeCriticalUrl } from './check-links-lib.mjs'

const { values: args } = parseArgs({
  options: {
    url: { type: 'string', default: process.env.SITE_URL ?? 'https://thehippiescientist.net' },
    timeout: { type: 'string', default: '15000' },
    retries: { type: 'string', default: '2' },
  },
  strict: false,
})

const BASE_URL = args.url.replace(/\/$/, '')
const TIMEOUT_MS = parseInt(args.timeout, 10)
const RETRIES = parseInt(args.retries, 10)

const CRITICAL_ROUTES = [
  '/',
  '/start/',
  '/library/',
  '/goals/',
  '/goals/sleep/',
  '/goals/stress/',
  '/goals/anxiety/',
  '/goals/focus/',
  '/guides/',
  '/guides/mental-health/',
  '/guides/adhd/',
  '/guides/compare/',
  '/herbs/',
  '/herbs/ashwagandha/',
  '/herbs/lions-mane/',
  '/compounds/',
  '/compounds/l-theanine/',
  '/safety-checker/',
  '/evidence/evidence-report/',
  '/evidence/evidence-digest/',
  '/info/methodology/',
  '/info/about/',
  '/info/faq/',
  '/articles/',
  '/research/investigations/',
  '/research/investigations/10/',
  '/research/investigations/11/',
  '/research/investigations/12/',
  '/research/investigations/13/',
  '/research/investigations/14/',
  '/research/investigations/15/',
  '/search/',
  '/sitemap.xml',
  '/robots.txt',
]


async function main() {
  console.log(`Checking ${CRITICAL_ROUTES.length} critical routes against ${BASE_URL}\n`)

  const results = await probeCriticalRoutes(
    CRITICAL_ROUTES.map(route => `${BASE_URL}${route}`),
    {
      concurrency: 5,
      probe: (url) => probeCriticalUrl(url, {
        timeoutMs: TIMEOUT_MS,
        retries: RETRIES,
      }),
    },
  )

  const passed = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)

  for (const r of results) {
    const icon = r.ok ? '✓' : '✗'
    const detail = r.error ? ` (${r.error})` : ''
    console.log(`${icon} ${r.status.toString().padStart(3)} ${r.url}${detail} [attempts=${r.attempts}]`)
  }

  console.log(`\n${passed.length}/${results.length} routes OK`)

  if (failed.length > 0) {
    console.error(`\nFailed routes (${failed.length}):`)
    for (const r of failed) {
      console.error(`  ${r.status} ${r.url}${r.error ? ' — ' + r.error : ''}`)
    }
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
