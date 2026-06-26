#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const reportDir = path.join(root, 'public', 'data', 'reports')
const routeManifestPath = path.join(root, 'public', 'data', 'runtime-manifests', 'route-manifest.json')
const packagePath = path.join(root, 'package.json')
const siteHost = 'https://thehippiescientist.net'

const staticAssetExt = /\.(?:css|js|json|png|jpe?g|gif|webp|avif|svg|ico|txt|xml|map|woff2?)$/i
const weakTextPattern = /placeholder|research[-\s]?pending|unknown|not specified|not available|needs review|minimal/i
const titleTooLongThreshold = 60
const htmlSizeWarningBytes = 100 * 1024

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeReport(fileName, payload) {
  fs.mkdirSync(reportDir, { recursive: true })
  fs.writeFileSync(path.join(reportDir, fileName), `${JSON.stringify(payload, null, 2)}\n`)
}

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return []
  const files = []
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '_next') continue
      const filePath = path.join(current, entry.name)
      if (entry.isDirectory()) walk(filePath)
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(filePath)
    }
  }
  walk(dir)
  return files
}

function routeFromFile(filePath) {
  const rel = path.relative(outDir, filePath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`.replace(/\/+/g, '/')
}

function normalizeRoute(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return ''
  if (/^https?:\/\//i.test(href)) {
    if (!href.startsWith(siteHost)) return ''
    href = href.slice(siteHost.length) || '/'
  }
  if (!href.startsWith('/')) return ''
  const [pathOnly] = href.split(/[?#]/)
  if (!pathOnly || staticAssetExt.test(pathOnly)) return ''
  return pathOnly.replace(/\/+$/, '') || '/'
}

function nonCanonicalInternalHref(href) {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return null
  if (/^https?:\/\//i.test(href)) {
    if (!href.startsWith(siteHost)) return null
    href = href.slice(siteHost.length) || '/'
  }
  if (!href.startsWith('/') || href === '/') return null
  if (href.includes('?') || href.includes('#')) return null
  if (staticAssetExt.test(href)) return null
  if (href.endsWith('/')) return null
  if (href.split('/').pop()?.includes('.')) return null
  return {
    href,
    canonicalHref: `${href}/`,
  }
}

function htmlMeta(html) {
  const title = (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || ''
  const description = (html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || ''
  const canonical = (html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || [])[1] || ''
  const robots = (html.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) || [])[1] || ''
  const structuredDataBlocks = [...html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g)].map((m) => m[1])
  const h1Count = [...html.matchAll(/<h1\b[^>]*>/gi)].length
  const htmlSizeBytes = Buffer.byteLength(html, 'utf8')
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return {
    title,
    description,
    canonical,
    robots,
    structuredDataBlocks,
    h1Count,
    htmlSizeBytes,
    wordCount: bodyText ? bodyText.split(/\s+/).length : 0,
  }
}

function groupDuplicates(rows, key) {
  const groups = new Map()
  for (const row of rows) {
    const value = String(row[key] || '').trim()
    if (!value) continue
    groups.set(value, [...(groups.get(value) || []), row.route])
  }
  return [...groups.entries()]
    .filter(([, routes]) => routes.length > 1)
    .map(([value, routes]) => ({ value, routes }))
}

function collectHtmlRows() {
  const htmlFiles = walkHtml(outDir)
  return htmlFiles.map((filePath) => {
    const route = routeFromFile(filePath)
    const html = fs.readFileSync(filePath, 'utf8')
    return { route, filePath, html, ...htmlMeta(html) }
  })
}

function collectLinks(rows) {
  const routes = new Set(rows.map((row) => row.route))
  const redirects = readJson(path.join(root, 'public', '_redirects.json'), [])
  const redirectSources = new Set(Array.isArray(redirects) ? redirects.map((row) => normalizeRoute(row?.source || row?.from)).filter(Boolean) : [])
  const links = []
  const nonCanonical = []
  const inbound = new Map([...routes].map((route) => [route, new Set()]))
  const hrefRe = /href=["']([^"'#\s>]+)["']/g

  for (const row of rows) {
    for (const match of row.html.matchAll(hrefRe)) {
      const rawHref = match[1]
      const target = normalizeRoute(rawHref)
      const nonCanonicalHref = nonCanonicalInternalHref(rawHref)
      if (nonCanonicalHref) nonCanonical.push({ source: row.route, ...nonCanonicalHref })
      if (!target) continue
      const exists = routes.has(target) || redirectSources.has(target)
      links.push({ source: row.route, target, exists })
      if (exists && inbound.has(target) && target !== row.route) inbound.get(target).add(row.route)
    }
  }

  return {
    links,
    broken: links.filter((link) => !link.exists),
    nonCanonical,
    orphanRoutes: [...inbound.entries()]
      .filter(([route, sources]) => route !== '/' && sources.size === 0)
      .map(([route]) => route)
      .sort(),
  }
}

function topCounts(rows, key, limit = 25) {
  const counts = new Map()
  for (const row of rows) {
    const value = String(row[key] || '').trim()
    if (!value) continue
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit)
}

function summarizeNonCanonicalLinks(rows) {
  return {
    total: rows.length,
    topHrefs: topCounts(rows, 'href'),
    topCanonicalHrefs: topCounts(rows, 'canonicalHref'),
    topSourceRoutes: topCounts(rows, 'source'),
  }
}

function routeTitle(row) {
  return {
    route: row.route,
    title: row.title,
    titleLength: String(row.title || '').length,
  }
}

function routeHtmlSize(row) {
  return {
    route: row.route,
    htmlSizeBytes: row.htmlSizeBytes,
    htmlSizeKb: Number((row.htmlSizeBytes / 1024).toFixed(1)),
  }
}

function routeH1(row) {
  return {
    route: row.route,
    h1Count: row.h1Count ?? null,
    title: row.title,
  }
}

function collectTechnicalSeoIssues(rows, htmlRows) {
  const titleTooLong = rows
    .filter((row) => String(row.title || '').length > titleTooLongThreshold)
    .map(routeTitle)
    .sort((a, b) => b.titleLength - a.titleLength || a.route.localeCompare(b.route))

  const htmlTooLarge = htmlRows
    .filter((row) => row.htmlSizeBytes > htmlSizeWarningBytes)
    .map(routeHtmlSize)
    .sort((a, b) => b.htmlSizeBytes - a.htmlSizeBytes || a.route.localeCompare(b.route))

  const h1Missing = htmlRows
    .filter((row) => row.h1Count === 0)
    .map(routeH1)
    .sort((a, b) => a.route.localeCompare(b.route))

  const multipleH1 = htmlRows
    .filter((row) => row.h1Count > 1)
    .map(routeH1)
    .sort((a, b) => b.h1Count - a.h1Count || a.route.localeCompare(b.route))

  return {
    generatedThresholds: {
      titleTooLongChars: titleTooLongThreshold,
      htmlSizeWarningBytes,
      htmlSizeWarningKb: htmlSizeWarningBytes / 1024,
    },
    titleTooLong: {
      count: titleTooLong.length,
      pages: titleTooLong,
    },
    htmlTooLarge: {
      count: htmlTooLarge.length,
      pages: htmlTooLarge,
    },
    h1Missing: {
      count: h1Missing.length,
      pages: h1Missing,
    },
    multipleH1: {
      count: multipleH1.length,
      pages: multipleH1,
    },
  }
}

function collectManifestRows() {
  const routes = readJson(routeManifestPath, [])
  return Array.isArray(routes) ? routes.map((row) => ({
    route: row.route || row.path || '',
    title: row.meta_title || '',
    description: row.meta_description || '',
    canonical: row.canonical_url || '',
    type: row.type || row.segment || 'unknown',
  })).filter((row) => row.route) : []
}

function collectDuplicateSlugs() {
  const sources = ['herbs.json', 'compounds.json', 'herbs-summary.json', 'compounds-summary.json']
  const rows = []
  for (const fileName of sources) {
    const data = readJson(path.join(root, 'public', 'data', fileName), [])
    for (const item of Array.isArray(data) ? data : []) {
      if (item?.slug) rows.push({ slug: String(item.slug), source: fileName })
    }
  }
  return groupDuplicates(rows.map((row) => ({ route: row.source, title: row.slug })), 'title')
    .map((item) => ({ slug: item.value, sources: item.routes }))
}

function collectUnusedDependencies() {
  const pkg = readJson(packagePath, {})
  const dependencies = Object.keys(pkg.dependencies || {})
  const sourceFiles = []
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(filePath)
      else if (/\.(?:ts|tsx|js|mjs)$/.test(entry.name)) sourceFiles.push(filePath)
    }
  }
  for (const dir of ['app', 'components', 'lib', 'src', 'scripts', 'config', 'data']) walk(path.join(root, dir))
  const corpus = sourceFiles.map((filePath) => fs.readFileSync(filePath, 'utf8')).join('\n')
  return dependencies.filter((dep) => {
    const importName = dep.startsWith('@') ? dep.split('/').slice(0, 2).join('/') : dep
    return !corpus.includes(`'${importName}`) && !corpus.includes(`"${importName}`) && !corpus.includes(`from ${importName}`)
  })
}

function main() {
  const generatedAt = new Date().toISOString()
  const htmlRows = collectHtmlRows()
  const manifestRows = collectManifestRows()
  const rows = htmlRows.length ? htmlRows : manifestRows
  const linkReport = htmlRows.length ? collectLinks(htmlRows) : { links: [], broken: [], nonCanonical: [], orphanRoutes: [] }
  const nonCanonicalSummary = summarizeNonCanonicalLinks(linkReport.nonCanonical)
  const technicalSeoIssues = collectTechnicalSeoIssues(rows, htmlRows)
  const duplicateSlugs = collectDuplicateSlugs()
  const duplicateMetadata = {
    generatedAt,
    duplicateTitles: groupDuplicates(rows, 'title'),
    duplicateDescriptions: groupDuplicates(rows, 'description'),
    duplicateCanonicals: groupDuplicates(rows, 'canonical'),
    duplicateSlugs,
  }
  const thinPages = rows
    .map((row) => ({
      route: row.route,
      titleLength: String(row.title || '').length,
      descriptionLength: String(row.description || '').length,
      wordCount: row.wordCount ?? null,
      reasons: [
        String(row.title || '').length < 20 ? 'short-title' : '',
        String(row.description || '').length < 80 ? 'short-description' : '',
        row.wordCount != null && row.wordCount < 250 ? 'low-word-count' : '',
        weakTextPattern.test(`${row.title} ${row.description}`) ? 'weak-placeholder-language' : '',
      ].filter(Boolean),
    }))
    .filter((row) => row.reasons.length > 0)
    .sort((a, b) => a.route.localeCompare(b.route))

  const seoAudit = {
    generatedAt,
    source: htmlRows.length ? 'out' : 'route-manifest',
    routeCount: rows.length,
    checks: {
      metadata: {
        missingTitles: rows.filter((row) => !row.title).map((row) => row.route),
        missingDescriptions: rows.filter((row) => !row.description).map((row) => row.route),
        titleTooLong: technicalSeoIssues.titleTooLong.count,
        duplicateTitleGroups: duplicateMetadata.duplicateTitles.length,
        duplicateDescriptionGroups: duplicateMetadata.duplicateDescriptions.length,
      },
      headings: {
        h1Missing: technicalSeoIssues.h1Missing.count,
        multipleH1: technicalSeoIssues.multipleH1.count,
      },
      htmlSize: {
        warningBytes: htmlSizeWarningBytes,
        pagesTooLarge: technicalSeoIssues.htmlTooLarge.count,
      },
      canonicals: {
        missing: rows.filter((row) => !row.canonical).map((row) => row.route),
        duplicateGroups: duplicateMetadata.duplicateCanonicals.length,
        nonCanonicalHost: rows.filter((row) => row.canonical && !String(row.canonical).startsWith(siteHost)).map((row) => ({ route: row.route, canonical: row.canonical })),
      },
      sitemap: {
        filePresent: fs.existsSync(path.join(outDir, 'sitemap.xml')) || fs.existsSync(path.join(root, 'app', 'sitemap.ts')),
      },
      robots: {
        filePresent: fs.existsSync(path.join(outDir, 'robots.txt')) || fs.existsSync(path.join(root, 'app', 'robots.ts')),
      },
      structuredData: {
        routesWithJsonLd: htmlRows.filter((row) => row.structuredDataBlocks?.length > 0).length,
        routesWithoutJsonLd: htmlRows.filter((row) => row.structuredDataBlocks?.length === 0).map((row) => row.route),
      },
      internalLinks: {
        totalInternalLinks: linkReport.links.length,
        brokenInternalLinks: linkReport.broken.length,
        nonCanonicalInternalLinks: linkReport.nonCanonical.length,
        topNonCanonicalInternalHrefs: nonCanonicalSummary.topHrefs.slice(0, 10),
        topNonCanonicalSourceRoutes: nonCanonicalSummary.topSourceRoutes.slice(0, 10),
        orphanRoutes: linkReport.orphanRoutes.length,
      },
      routeGeneration: {
        manifestRows: manifestRows.length,
        duplicateSlugs: duplicateSlugs.length,
      },
      maintainability: {
        unusedDependencies: collectUnusedDependencies(),
      },
    },
  }

  writeReport('seo-audit.json', seoAudit)
  writeReport('orphan-pages.json', { generatedAt, orphanRoutes: linkReport.orphanRoutes })
  writeReport('broken-links.json', { generatedAt, brokenLinks: linkReport.broken })
  writeReport('noncanonical-internal-links.json', {
    generatedAt,
    summary: nonCanonicalSummary,
    links: linkReport.nonCanonical,
  })
  writeReport('technical-seo-issues.json', {
    generatedAt,
    ...technicalSeoIssues,
  })
  writeReport('duplicate-metadata.json', duplicateMetadata)
  writeReport('thin-pages.json', { generatedAt, thinPages })
  console.log(`[seo-audit-reports] wrote reports to ${path.relative(root, reportDir)}`)
}

main()
