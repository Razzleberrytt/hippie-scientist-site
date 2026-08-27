#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const GOOGLE_RANGES_URL = 'https://developers.google.com/static/crawling/ipranges/common-crawlers.json'

export async function refreshGoogleCrawlerRanges({ root = process.cwd(), write = true } = {}) {
  const response = await fetch(GOOGLE_RANGES_URL, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`Google crawler ranges fetch failed: HTTP ${response.status}`)
  const payload = await response.json()
  const prefixes = (Array.isArray(payload?.prefixes) ? payload.prefixes : [])
    .flatMap((entry) => [entry?.ipv4Prefix, entry?.ipv6Prefix])
    .filter(Boolean)
    .sort()
  if (prefixes.length < 20 || !payload?.creationTime) throw new Error('Google crawler ranges payload is unexpectedly incomplete')

  const moduleText = `// Generated from ${GOOGLE_RANGES_URL}\n` +
    `export const GOOGLE_COMMON_CRAWLER_RANGES_GENERATED_AT = ${JSON.stringify(payload.creationTime)}\n` +
    `export const GOOGLE_COMMON_CRAWLER_PREFIXES = Object.freeze(${JSON.stringify(prefixes, null, 2)})\n`

  if (write) {
    const output = path.join(root, 'functions', '_shared', 'google-common-crawler-ranges.mjs')
    await fs.mkdir(path.dirname(output), { recursive: true })
    await fs.writeFile(output, moduleText, 'utf8')
  }
  return { creationTime: payload.creationTime, prefixes, moduleText }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  refreshGoogleCrawlerRanges().then(({ creationTime, prefixes }) => {
    console.log(`Captured ${prefixes.length} official Google common-crawler CIDRs (${creationTime})`)
  }).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
