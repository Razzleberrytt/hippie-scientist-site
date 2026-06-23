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

const { values: args } = parseArgs({
  options: {
    url: { type: 'string', default: process.env.SITE_URL ?? 'https://thehippiescientist.net' },
    timeout: { type: 'string', default: '10000' },
  },
  strict: false,
})

const BASE_URL = args.url.replace(/\/$/, '')
const TIMEOUT_MS = parseInt(args.timeout, 10)

const CRITICAL_ROUTES = [
  '/',
  '/herbs/ashwagandha/',
  '/herbs/lions-mane/',
  '/herbs/valerian-root/',
  '/compounds/l-theanine/',
  '/compounds/ashwagandha-ksm-66/',
  '/goals/sleep/',
  '/goals/anxiety/',
  '/goals/focus/',
  '/stacks/sleep-stack/',
  '/about/',
  '/faq/',
  '/methodology/',
  '/safety-checker/',
  '/evidence-digest/',
  '/sitemap.xml',
  '/robots.txt',
  '/search/',
  '/compare/',
  '/articles/',
]

async function checkUrl(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'HippieScientist-LinkChecker/1.0' },
    })
    clearTimeout(timer)
    return { url, status: res.status, ok: res.status >= 200 && res.status < 400 }
  } catch (err) {
    clearTimeout(timer)
    return { url, status: 0, ok: false, error: err.message }
  }
}

async function main() {
  console.log(`Checking ${CRITICAL_ROUTES.length} critical routes against ${BASE_URL}\n`)

  const results = await Promise.all(
    CRITICAL_ROUTES.map(route => checkUrl(`${BASE_URL}${route}`))
  )

  const passed = results.filter(r => r.ok)
  const failed = results.filter(r => !r.ok)

  for (const r of results) {
    const icon = r.ok ? '✓' : '✗'
    const detail = r.error ? ` (${r.error})` : ''
    console.log(`${icon} ${r.status.toString().padStart(3)} ${r.url}${detail}`)
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
