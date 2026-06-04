#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const buildDir = path.join(rootDir, 'out')

// Cap to avoid scanning all 900+ pages — sample a representative spread
const MAX_PAGES = 60

function collectHtmlFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (results.length >= MAX_PAGES * 4) break // over-collect then sample
    const res = path.resolve(dir, entry.name)
    if (entry.isDirectory()) {
      // Skip raw data directories — not real HTML pages
      if (['blogdata', '_next'].includes(entry.name)) continue
      collectHtmlFiles(res, results)
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(res)
    }
  }
  return results
}

// Sample evenly from collected files
function sampleFiles(files, n) {
  if (files.length <= n) return files
  const step = Math.floor(files.length / n)
  return files.filter((_, i) => i % step === 0).slice(0, n)
}

console.log(`[seo-metadata-validation] scanning build directory: ${path.relative(rootDir, buildDir)}`)

const allFiles = collectHtmlFiles(buildDir)
const filesToCheck = sampleFiles(allFiles, MAX_PAGES)

let totalPages = 0
let failedPages = 0
const errors = []

for (const filePath of filesToCheck) {
  totalPages++
  const relPath = path.relative(buildDir, filePath).replace(/\\/g, '/')

  // Read only the first 8KB — enough for <head> checks, avoids slow reads on huge pages
  const fd = fs.openSync(filePath, 'r')
  const buf = Buffer.alloc(8192)
  const bytesRead = fs.readSync(fd, buf, 0, 8192, 0)
  fs.closeSync(fd)
  const content = buf.slice(0, bytesRead).toString('utf8')

  const pageErrors = []

  // 1. Verify title
  const titleMatch = content.match(/<title>(.*?)<\/title>/i)
  if (!titleMatch) {
    pageErrors.push('Missing <title> tag')
  } else if (!titleMatch[1].trim()) {
    pageErrors.push('Empty <title> tag')
  }

  // 2. Verify meta description
  const metaDescMatch =
    content.match(/<meta\s+[^>]*name=["']description["']\s+[^>]*content=["']([^"']*)['"]/i) ||
    content.match(/<meta\s+[^>]*content=["']([^"']*)['"]\s+[^>]*name=["']description["']/i)
  if (!metaDescMatch) {
    pageErrors.push('Missing <meta name="description"> tag')
  } else if (!metaDescMatch[1].trim()) {
    pageErrors.push('Empty <meta name="description"> tag')
  }

  // 3. Verify viewport meta tag
  const viewportMatch = content.match(/<meta\s+[^>]*name=["']viewport["']/i)
  if (!viewportMatch) {
    pageErrors.push('Missing <meta name="viewport"> tag')
  }

  // 4. Verify Open Graph tags (P0 requirement)
  const ogTitle = content.match(/<meta\s+[^>]*property=["']og:title["']\s+[^>]*content=["']([^"']*)['"]/i) ||
                  content.match(/<meta\s+[^>]*content=["']([^"']*)['"]\s+[^>]*property=["']og:title["']/i)
  if (!ogTitle || !ogTitle[1].trim()) pageErrors.push('Missing or empty og:title')

  const ogDesc = content.match(/<meta\s+[^>]*property=["']og:description["']\s+[^>]*content=["']([^"']*)['"]/i) ||
                 content.match(/<meta\s+[^>]*content=["']([^"']*)['"]\s+[^>]*property=["']og:description["']/i)
  if (!ogDesc || !ogDesc[1].trim()) pageErrors.push('Missing or empty og:description')

  const ogImage = content.match(/<meta\s+[^>]*property=["']og:image["']\s+[^>]*content=["']([^"']*)['"]/i) ||
                  content.match(/<meta\s+[^>]*content=["']([^"']*)['"]\s+[^>]*property=["']og:image["']/i)
  if (!ogImage || !ogImage[1].trim()) pageErrors.push('Missing or empty og:image')

  const ogType = content.match(/<meta\s+[^>]*property=["']og:type["']\s+[^>]*content=["']([^"']*)['"]/i)
  if (!ogType || !ogType[1].trim()) pageErrors.push('Missing or empty og:type')

  // 5. Verify Twitter Card tags (P0 requirement)
  const twCard = content.match(/<meta\s+[^>]*name=["']twitter:card["']\s+[^>]*content=["']([^"']*)['"]/i) ||
                 content.match(/<meta\s+[^>]*content=["']([^"']*)['"]\s+[^>]*name=["']twitter:card["']/i)
  if (!twCard || !twCard[1].trim()) pageErrors.push('Missing or empty twitter:card')

  const twSite = content.match(/<meta\s+[^>]*name=["']twitter:site["']\s+[^>]*content=["']([^"']*)['"]/i) ||
                 content.match(/<meta\s+[^>]*content=["']([^"']*)['"]\s+[^>]*name=["']twitter:site["']/i)
  if (!twSite || !twSite[1].trim()) pageErrors.push('Missing or empty twitter:site')

  const twTitle = content.match(/<meta\s+[^>]*name=["']twitter:title["']\s+[^>]*content=["']([^"']*)['"]/i)
  if (!twTitle || !twTitle[1].trim()) pageErrors.push('Missing or empty twitter:title')

  const twDesc = content.match(/<meta\s+[^>]*name=["']twitter:description["']\s+[^>]*content=["']([^"']*)['"]/i)
  if (!twDesc || !twDesc[1].trim()) pageErrors.push('Missing or empty twitter:description')

  const twImage = content.match(/<meta\s+[^>]*name=["']twitter:image["']\s+[^>]*content=["']([^"']*)['"]/i)
  if (!twImage || !twImage[1].trim()) pageErrors.push('Missing or empty twitter:image')

  if (pageErrors.length > 0) {
    failedPages++
    errors.push(`Page: /${relPath}\n${pageErrors.map(e => `  - ${e}`).join('\n')}`)
  }
}

console.log(`[seo-metadata-validation] sampled ${totalPages} of ${allFiles.length} static pages.`)

// P0: Explicit checks on representative routes for full OG + Twitter metadata (must be present in built static HTML)
const requiredRepresentativeRoutes = [
  { route: '/', file: 'index.html', label: 'homepage' },
  { route: '/blog/', file: 'blog/index.html', label: 'blog index' },
  { route: '/herbs/', file: 'herbs/index.html', label: 'herbs index' },
  { route: '/herbs/ashwagandha/', file: 'herbs/ashwagandha/index.html', label: 'herb profile (ashwagandha)' },
  { route: '/compounds/', file: 'compounds/index.html', label: 'compounds index' },
  { route: '/compounds/caffeine/', file: 'compounds/caffeine/index.html', label: 'compound profile (caffeine)' },
  { route: '/faq/', file: 'faq/index.html', label: 'faq' },
]

for (const rep of requiredRepresentativeRoutes) {
  const repPath = path.join(buildDir, rep.file)
  if (!fs.existsSync(repPath)) {
    console.error(`[seo-metadata-validation] Missing representative route HTML for ${rep.label}: ${rep.route} (expected ${rep.file})`)
    process.exit(1)
  }
  const repContent = fs.readFileSync(repPath, 'utf8')
  const tagChecks = [
    { re: /property=["']og:title["']/i, name: 'og:title' },
    { re: /property=["']og:description["']/i, name: 'og:description' },
    { re: /property=["']og:image["']/i, name: 'og:image' },
    { re: /property=["']og:type["']/i, name: 'og:type' },
    { re: /name=["']twitter:card["']/i, name: 'twitter:card' },
    { re: /name=["']twitter:site["']/i, name: 'twitter:site' },
    { re: /name=["']twitter:title["']/i, name: 'twitter:title' },
    { re: /name=["']twitter:description["']/i, name: 'twitter:description' },
    { re: /name=["']twitter:image["']/i, name: 'twitter:image' },
  ]
  const missingTags = tagChecks.filter(c => !c.re.test(repContent)).map(c => c.name)
  if (missingTags.length > 0) {
    console.error(`[seo-metadata-validation] Representative ${rep.label} (${rep.route}) missing required social tags: ${missingTags.join(', ')}`)
    process.exit(1)
  }
}

if (failedPages > 0) {
  console.error(`[seo-metadata-validation] FAIL: ${failedPages} pages failed validation:`)
  errors.forEach(err => console.error(err))
  process.exit(1)
}

console.log('[seo-metadata-validation] PASS: all sampled static pages and representative OG/Twitter routes verified successfully.')
