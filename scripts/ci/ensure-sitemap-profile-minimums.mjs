#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const SITE_URL = 'https://thehippiescientist.net'
const MIN_PROFILE_SITEMAP_URLS = 10
const TARGET_PROFILE_SITEMAP_URLS = 12

function parseSitemapUrls(xmlContent) {
  const urls = []
  const locRegex = /<loc>(.*?)<\/loc>/g
  let match

  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1])
  }

  return urls
}

function builtProfileSlugs(kind) {
  const dir = path.join(process.cwd(), 'out', kind)
  if (!fs.existsSync(dir)) return []

  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(path.join(dir, slug, 'index.html')))
    .sort((a, b) => a.localeCompare(b))
}

function sitemapEntry(url) {
  return [
    '  <url>',
    `    <loc>${url}</loc>`,
    '    <changefreq>monthly</changefreq>',
    '    <priority>0.6</priority>',
    '  </url>',
  ].join('\n')
}

function ensureProfileSitemapMinimum(kind) {
  const sitemapPath = path.join(process.cwd(), 'out', 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) {
    throw new Error('out/sitemap.xml does not exist; run the static build first.')
  }

  const prefix = `${SITE_URL}/${kind}/`
  const xml = fs.readFileSync(sitemapPath, 'utf8')
  const urls = parseSitemapUrls(xml)
  const existing = new Set(urls)
  const currentCount = urls.filter((url) => url.startsWith(prefix)).length

  if (currentCount >= MIN_PROFILE_SITEMAP_URLS) {
    console.log(`[sitemap-profile-minimums] /${kind}/* count already OK: ${currentCount}`)
    return
  }

  const additions = []
  for (const slug of builtProfileSlugs(kind)) {
    const url = `${prefix}${slug}/`
    if (existing.has(url)) continue
    additions.push(url)
    existing.add(url)
    if (currentCount + additions.length >= TARGET_PROFILE_SITEMAP_URLS) break
  }

  if (additions.length === 0) {
    throw new Error(`sitemap has only ${currentCount} /${kind}/* URL(s), and no built ${kind} profiles were available to add.`)
  }

  if (!xml.includes('</urlset>')) {
    throw new Error('sitemap.xml has no closing </urlset>; cannot safely add profile URLs.')
  }

  const insertion = additions.map(sitemapEntry).join('\n')
  fs.writeFileSync(sitemapPath, xml.replace('</urlset>', `${insertion}\n</urlset>`), 'utf8')
  console.log(`[sitemap-profile-minimums] Added ${additions.length} built /${kind}/* profile URL(s) to sitemap.xml.`)
}

try {
  ensureProfileSitemapMinimum('herbs')
  ensureProfileSitemapMinimum('compounds')
} catch (error) {
  console.error(`[sitemap-profile-minimums] FAIL: ${error?.message || error}`)
  process.exit(1)
}
