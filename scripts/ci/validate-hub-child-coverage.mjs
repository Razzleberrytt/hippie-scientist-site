#!/usr/bin/env node
/**
 * validate:hub-child-coverage — every indexable, sitemapped page under a hub must
 * be linked from that hub.
 *
 * `/guides/compare/` is built from a hand-curated FEATURED_CATEGORIES list in
 * app/guides/compare/page.tsx while the comparison pages themselves are added
 * separately. The two drifted: 7 comparison pages were indexable, in the sitemap,
 * and reachable from their own hub by no link at all. Each had a single inbound
 * internal link site-wide, which for commercial-intent "X vs Y" pages is the
 * difference between a page Google weighs and a page it barely sees.
 *
 * Curation is still allowed to be selective about what it *features*. What it may
 * not do is publish a page, advertise it in the sitemap, and then leave it
 * unreachable from its own section. If a page should not be featured, the honest
 * options are to noindex it or drop it from the sitemap — not to strand it.
 *
 * Runs against built output, so it needs `out/`. Part of verify:postbuild.
 */

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'out')

// Hubs whose children must all be reachable from the hub page itself.
//
// /guides is deliberately absent. Its hub lists sections rather than pages, and
// its three stranded children (/guides/ashwagandha, /guides/cognition,
// /guides/lions-mane) sit outside that taxonomy. Two of them also compete with
// existing pages for the same queries — /guides/ashwagandha "Complete Guide to
// Benefits" against /guides/herbs/ashwagandha "What the Evidence Supports for
// Stress", both indexable and self-canonical. Linking them from the section list
// would entrench that overlap; consolidating or canonicalizing them is an
// editorial call. Tracked in #5078.
const HUBS = [
  '/guides/compare',
  '/learn',
  '/evidence/evidence-report',
  '/guides/sleep',
  '/guides/adhd',
]

function readHtml(routePath) {
  const file = path.join(OUT, routePath.replace(/^\//, ''), 'index.html')
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null
}

function quotedAttributes(tag) {
  const attributes = new Map()
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)) {
    attributes.set(match[1].toLowerCase(), match[3])
  }
  return attributes
}

function metaContent(html, metaName) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []

  for (const tag of tags) {
    const attributes = quotedAttributes(tag)
    if ((attributes.get('name') ?? '').toLowerCase() === metaName.toLowerCase()) {
      return attributes.get('content') ?? ''
    }
  }

  return ''
}

function linkedTargets(html) {
  const targets = new Set()
  const tags = html.match(/<a\b[^>]*>/gi) ?? []

  for (const tag of tags) {
    const href = quotedAttributes(tag).get('href')
    if (href) targets.add(href)
  }

  return targets
}

function isIndexable(html) {
  return !/\bnoindex\b/i.test(metaContent(html, 'robots'))
}

function main() {
  if (!fs.existsSync(OUT)) {
    console.error('[hub-child-coverage] out/ not found — run `npm run build` first')
    process.exit(1)
  }

  const sitemapPath = path.join(OUT, 'sitemap.xml')
  const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : ''

  const failures = []
  let checked = 0

  for (const hub of HUBS) {
    const hubHtml = readHtml(hub)
    if (!hubHtml) {
      failures.push(`${hub} — hub page is missing from out/`)
      continue
    }
    const hubLinks = linkedTargets(hubHtml)

    const hubDir = path.join(OUT, hub.replace(/^\//, ''))
    const children = fs.readdirSync(hubDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)

    for (const child of children) {
      const route = `${hub}/${child}`
      const html = readHtml(route)
      if (!html) continue
      // Only pages the site has already committed to indexing are in scope.
      if (!isIndexable(html)) continue
      if (!sitemap.includes(`${route}/`)) continue

      checked += 1
      if (!hubLinks.has(`${route}/`)) failures.push(`${route}/ — indexable and in the sitemap, but not linked from ${hub}/`)
    }
  }

  if (failures.length) {
    console.error(`[hub-child-coverage] FAILED — ${failures.length} stranded page(s):`)
    for (const failure of failures) console.error(`  ${failure}`)
    console.error('')
    console.error('  Link it from the hub, or stop advertising it: set noindex or remove it')
    console.error('  from the sitemap. A page cannot be worth indexing and not worth linking.')
    process.exit(1)
  }

  console.log(`[hub-child-coverage] PASS: ${checked} indexable hub child page(s) are linked from their hub.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
