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

function readCanonicalGoalRepresentatives() {
  const sourcePath = path.join(rootDir, 'lib/core-goals.ts')
  if (!fs.existsSync(sourcePath)) {
    console.error('[seo-metadata-validation] Missing canonical goal taxonomy: lib/core-goals.ts')
    process.exit(1)
  }

  const source = fs.readFileSync(sourcePath, 'utf8')
  const routes = [...source.matchAll(/href:\s*['"](\/goals\/[^'"]+\/)['"]/g)]
    .map((match) => match[1])
    .filter(Boolean)

  if (routes.length === 0) {
    console.error('[seo-metadata-validation] Canonical goal taxonomy contains no /goals/* routes.')
    process.exit(1)
  }

  return [...new Set(routes)].map((route) => ({
    route,
    file: `${route.replace(/^\/+|\/+$/g, '')}/index.html`,
    label: `canonical goal (${route.split('/').filter(Boolean).pop()})`,
  }))
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

  // Read through </head> so valid metadata is not missed when the generated
  // document head is larger than the previous fixed 8KB prefix.
  const content = fs.readFileSync(filePath, 'utf8')
  const headEnd = content.search(/<\/head\s*>/i)
  const headContent = headEnd >= 0 ? content.slice(0, headEnd + 7) : content

  const pageErrors = []

  // 1. Verify title
  const titleMatch = headContent.match(/<title(?:\s[^>]*)?>(.*?)<\/title>/i)
  if (!titleMatch) {
    pageErrors.push('Missing <title> tag')
  } else if (!titleMatch[1].trim()) {
    pageErrors.push('Empty <title> tag')
  }

  // 2. Verify meta description
  const metaDescMatch =
    headContent.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)['"]/i) ||
    headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*name=["']description["']/i)
  if (!metaDescMatch) {
    pageErrors.push('Missing <meta name="description"> tag')
  } else if (!metaDescMatch[1].trim()) {
    pageErrors.push('Empty <meta name="description"> tag')
  }

  // 3. Verify viewport meta tag
  const viewportMatch = headContent.match(/<meta\s+[^>]*name=["']viewport["']/i)
  if (!viewportMatch) {
    pageErrors.push('Missing <meta name="viewport"> tag')
  }

  // 4. Verify Open Graph tags (P0 requirement)
  const ogTitle = headContent.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']*)['"]/i) ||
                  headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*property=["']og:title["']/i)
  if (!ogTitle || !ogTitle[1].trim()) pageErrors.push('Missing or empty og:title')

  const ogDesc = headContent.match(/<meta\s+[^>]*property=["']og:description["'][^>]*content=["']([^"']*)['"]/i) ||
                 headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*property=["']og:description["']/i)
  if (!ogDesc || !ogDesc[1].trim()) pageErrors.push('Missing or empty og:description')

  const ogImage = headContent.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']*)['"]/i) ||
                  headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*property=["']og:image["']/i)
  if (!ogImage || !ogImage[1].trim()) pageErrors.push('Missing or empty og:image')

  const ogType = headContent.match(/<meta\s+[^>]*property=["']og:type["'][^>]*content=["']([^"']*)['"]/i)
  if (!ogType || !ogType[1].trim()) pageErrors.push('Missing or empty og:type')

  // 5. Verify Twitter Card tags (P0 requirement)
  const twCard = headContent.match(/<meta\s+[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)['"]/i) ||
                 headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*name=["']twitter:card["']/i)
  if (!twCard || !twCard[1].trim()) pageErrors.push('Missing or empty twitter:card')

  const twSite = headContent.match(/<meta\s+[^>]*name=["']twitter:site["'][^>]*content=["']([^"']*)['"]/i) ||
                 headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*name=["']twitter:site["']/i)
  if (!twSite || !twSite[1].trim()) pageErrors.push('Missing or empty twitter:site')

  const twTitle = headContent.match(/<meta\s+[^>]*name=["']twitter:title["'][^>]*content=["']([^"']*)['"]/i) ||
                  headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*name=["']twitter:title["']/i)
  if (!twTitle || !twTitle[1].trim()) pageErrors.push('Missing or empty twitter:title')

  const twDesc = headContent.match(/<meta\s+[^>]*name=["']twitter:description["'][^>]*content=["']([^"']*)['"]/i) ||
                 headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*name=["']twitter:description["']/i)
  if (!twDesc || !twDesc[1].trim()) pageErrors.push('Missing or empty twitter:description')

  const twImage = headContent.match(/<meta\s+[^>]*name=["']twitter:image["'][^>]*content=["']([^"']*)['"]/i) ||
                  headContent.match(/<meta\s+[^>]*content=["']([^"']*)['"][^>]*name=["']twitter:image["']/i)
  if (!twImage || !twImage[1].trim()) pageErrors.push('Missing or empty twitter:image')

  if (pageErrors.length > 0) {
    failedPages++
    errors.push(`Page: /${relPath}\n${pageErrors.map(e => `  - ${e}`).join('\n')}`)
  }
}

console.log(`[seo-metadata-validation] sampled ${totalPages} of ${allFiles.length} static pages.`)

// Explicit checks on the canonical information architecture plus representative
// content routes, so broad sampling cannot miss metadata regressions on the
// site's main navigation and decision surfaces.
const requiredRepresentativeRoutes = [
  { route: '/', file: 'index.html', label: 'homepage' },
  { route: '/start/', file: 'start/index.html', label: 'start router' },
  { route: '/library/', file: 'library/index.html', label: 'master directory' },
  { route: '/goals/', file: 'goals/index.html', label: 'goals index' },
  ...readCanonicalGoalRepresentatives(),
  { route: '/guides/', file: 'guides/index.html', label: 'guides index' },
  { route: '/herbs/', file: 'herbs/index.html', label: 'herbs index' },
  { route: '/herbs/ashwagandha/', file: 'herbs/ashwagandha/index.html', label: 'herb profile (ashwagandha)' },
  { route: '/compounds/', file: 'compounds/index.html', label: 'compounds index' },
  { route: '/compounds/caffeine/', file: 'compounds/caffeine/index.html', label: 'compound profile (caffeine)' },
  { route: '/info/faq/', file: 'info/faq/index.html', label: 'faq' },
]

// Semrush July 2026 reported these URLs in the "pages don't have title tags"
// issue panel. Keep them as explicit static-export checks so a sampling pass
// cannot miss regressions on audited compound profiles.
const semrushTitleAuditRoutes = [
  { route: '/compounds/semaglutide/', file: 'compounds/semaglutide/index.html', label: 'compound profile (semaglutide)' },
  { route: '/compounds/taurine/', file: 'compounds/taurine/index.html', label: 'compound profile (taurine)' },
  { route: '/compounds/trimethylglycine/', file: 'compounds/trimethylglycine/index.html', label: 'compound profile (trimethylglycine)' },
  { route: '/compounds/vitamin-a/', file: 'compounds/vitamin-a/index.html', label: 'compound profile (vitamin-a)' },
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

for (const audited of semrushTitleAuditRoutes) {
  const auditedPath = path.join(buildDir, audited.file)
  if (!fs.existsSync(auditedPath)) {
    console.error(`[seo-metadata-validation] Missing Semrush title-audit route HTML for ${audited.label}: ${audited.route} (expected ${audited.file})`)
    process.exit(1)
  }
  const auditedContent = fs.readFileSync(auditedPath, 'utf8')
  const titleMatch = auditedContent.match(/<title[^>]*>(.*?)<\/title>/i)
  if (!titleMatch || !titleMatch[1].trim()) {
    console.error(`[seo-metadata-validation] Semrush title-audit route ${audited.route} is missing a non-empty <title> tag.`)
    process.exit(1)
  }
}

if (failedPages > 0) {
  console.error(`[seo-metadata-validation] FAIL: ${failedPages} pages failed validation:`)
  errors.forEach(err => console.error(err))
  process.exit(1)
}

console.log('[seo-metadata-validation] PASS: all sampled static pages and representative OG/Twitter routes verified successfully.')
