#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const ROOT = process.cwd()
const DIST = path.join(ROOT, 'dist')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'publishing-regression-report.json')
const SITE_URL = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/+$/, '')

const NAN_TOKEN_PATTERN = /(^|[^a-z0-9])nan([^a-z0-9]|$)/i
const OBJECT_TOKEN_PATTERN = /\[object\s+object\]/i
const NUMERIC_ONLY_NAME = /^\d+(?:[\s.,/-]\d+)*$/
const ESSENTIAL_TAGS = [
  /<meta[^>]+name=["']description["'][^>]*>/i,
  /<link[^>]+rel=["']canonical["'][^>]*>/i,
  /<meta[^>]+property=["']og:title["'][^>]*>/i,
  /<meta[^>]+property=["']og:description["'][^>]*>/i,
  /<meta[^>]+property=["']og:image["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:card["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:title["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:description["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:image["'][^>]*>/i,
]
const THIN_PLACEHOLDER_SIGNALS = [
  'interactive content loads after hydration',
  'metadata. interactive content loads',
  'content is being updated.',
  'not available in prerender assets',
]

const normalizeRoute = route => {
  if (!route || route === '/') return '/'
  return `/${String(route).replace(/^\/+|\/+$/g, '')}`
}

const stripTags = html =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const readJson = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return null
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
}

const readJsonArray = relativePath => {
  const parsed = readJson(relativePath)
  return Array.isArray(parsed) ? parsed : []
}

function loadEntityRecords(type) {
  const primary = type === 'herb' ? 'public/data/herbs_combined_updated.json' : 'public/data/compounds_combined_updated.json'
  const fallback = type === 'herb' ? 'public/data/herbs.json' : 'public/data/compounds.json'
  const primaryRecords = readJsonArray(primary)
  return primaryRecords.length > 0 ? primaryRecords : readJsonArray(fallback)
}

function parseSitemapRoutes() {
  const sitemapPath = path.join(DIST, 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) return []
  const xml = fs.readFileSync(sitemapPath, 'utf8')
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  return [...new Set(matches.map(match => {
    const url = String(match[1] || '').trim()
    const normalized = url.startsWith(SITE_URL) ? url.slice(SITE_URL.length) || '/' : new URL(url).pathname || '/'
    return normalizeRoute(normalized)
  }))]
}

function collectDistHtmlFiles() {
  if (!fs.existsSync(DIST)) return []
  const found = []
  const stack = [DIST]
  while (stack.length > 0) {
    const next = stack.pop()
    const entries = fs.readdirSync(next, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(next, entry.name)
      if (entry.isDirectory()) {
        stack.push(full)
      } else if (entry.isFile() && entry.name.toLowerCase() === 'index.html') {
        found.push(full)
      }
    }
  }
  return found
}

function escapePattern(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function routeFromDistHtml(filePath) {
  const rel = path.relative(DIST, filePath).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return normalizeRoute(rel.replace(/\/index\.html$/, ''))
}

function findExcludedEntityRoutes(type, publicationRoutes) {
  const records = loadEntityRecords(type)
  const prefix = type === 'herb' ? '/herbs/' : '/compounds/'

  return records
    .map(record => {
      const fromRoute = normalizeRoute(record?.route || '')
      const slug = String(record?.slug || '').trim().toLowerCase()
      const route = fromRoute.startsWith(prefix) ? fromRoute : slug ? `${prefix}${slug}` : null
      return route
    })
    .filter(Boolean)
    .filter(route => !publicationRoutes.has(route))
}

function run() {
  if (!fs.existsSync(DIST)) {
    console.error('[verify-publishing] dist/ is missing. Run build + postbuild first.')
    process.exit(1)
  }

  const { prerenderRoutes, sitemapRoutes, routeDirectives, metadata } = getSharedRouteManifest()
  const publicationManifest = readJson('public/data/publication-manifest.json') || {}

  const publicationEntityRoutes = new Set([
    ...((publicationManifest?.routes?.herbs || []).map(normalizeRoute)),
    ...((publicationManifest?.routes?.compounds || []).map(normalizeRoute)),
  ])

  const distHtmlFiles = collectDistHtmlFiles()
  const distRoutes = new Set(distHtmlFiles.map(routeFromDistHtml))
  const sitemapXmlRoutes = new Set(parseSitemapRoutes())

  const checks = {
    buildTokens: [],
    entityNameQuality: [],
    headTagIntegrity: [],
    routeParity: [],
    thinIndexablePages: [],
    excludedStillPublished: [],
  }

  for (const filePath of distHtmlFiles) {
    const html = fs.readFileSync(filePath, 'utf8')
    const route = routeFromDistHtml(filePath)
    if (NAN_TOKEN_PATTERN.test(html)) checks.buildTokens.push({ route, file: path.relative(ROOT, filePath), reason: 'nan-token' })
    if (OBJECT_TOKEN_PATTERN.test(html)) checks.buildTokens.push({ route, file: path.relative(ROOT, filePath), reason: 'object-object-token' })

    const titleCount = (html.match(/<title[\s>]/gi) || []).length
    if (titleCount !== 1) checks.headTagIntegrity.push({ route, reason: `duplicate-or-missing-title:${titleCount}` })

    const directives = routeDirectives.get(route) || {}
    for (const tagPattern of ESSENTIAL_TAGS) {
      if (!tagPattern.test(html)) {
        checks.headTagIntegrity.push({ route, reason: `missing-essential-tag:${tagPattern}` })
      }
    }

    const expectedCanonical = `${SITE_URL}${route === '/' ? '/' : route}`
    const canonicalRegex = new RegExp(
      `<link[^>]+rel=["']canonical["'][^>]+href=["']${escapePattern(expectedCanonical)}["']`,
      'i'
    )
    if (!canonicalRegex.test(html)) checks.headTagIntegrity.push({ route, reason: 'canonical-url-mismatch' })

    if (!directives.noindex) {
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      const bodyText = stripTags(mainMatch?.[1] || html)
      const lower = bodyText.toLowerCase()
      const hasThinSignal = THIN_PLACEHOLDER_SIGNALS.some(signal => lower.includes(signal))
      if (bodyText.length < 160 || hasThinSignal) {
        checks.thinIndexablePages.push({ route, bodyLength: bodyText.length, hasThinSignal })
      }
    }
  }

  for (const file of ['public/data/publication-manifest.json', 'public/data/indexable-herbs.json', 'public/data/indexable-compounds.json']) {
    const fullPath = path.join(ROOT, file)
    if (fs.existsSync(fullPath)) {
      const raw = fs.readFileSync(fullPath, 'utf8')
      if (NAN_TOKEN_PATTERN.test(raw)) checks.buildTokens.push({ route: null, file, reason: 'nan-token' })
      if (OBJECT_TOKEN_PATTERN.test(raw)) checks.buildTokens.push({ route: null, file, reason: 'object-object-token' })
    }
  }

  const publicationEntities = [
    ...((publicationManifest?.entities?.herbs || []).map(entity => ({ ...entity, kind: 'herb' }))),
    ...((publicationManifest?.entities?.compounds || []).map(entity => ({ ...entity, kind: 'compound' }))),
  ]

  for (const entity of publicationEntities) {
    const route = normalizeRoute(entity?.route || '')
    const name = String(entity?.name || '').trim()
    const numericAllowed = Boolean(entity?.allowNumericName)
    if (!name) {
      checks.entityNameQuality.push({ route, reason: 'missing-name' })
      continue
    }
    if (OBJECT_TOKEN_PATTERN.test(name) || NAN_TOKEN_PATTERN.test(name)) {
      checks.entityNameQuality.push({ route, reason: 'invalid-token-in-name', name })
      continue
    }
    if (NUMERIC_ONLY_NAME.test(name) && !numericAllowed) {
      checks.entityNameQuality.push({ route, reason: 'numeric-only-name-not-allowed', name })
    }
  }

  const routeSets = {
    prerenderRoutes: new Set(prerenderRoutes),
    sitemapEligiblePrerenderRoutes: new Set(
      prerenderRoutes.filter(route => routeDirectives.get(route)?.noindex !== true),
    ),
    sharedSitemapRoutes: new Set(sitemapRoutes),
  }

  const addMismatch = (label, onlyLeft, onlyRight) => {
    if (onlyLeft.length > 0 || onlyRight.length > 0) {
      checks.routeParity.push({ label, onlyLeft, onlyRight })
    }
  }

  const setDiff = (left, right) => [...left].filter(route => !right.has(route)).sort()

  addMismatch(
    'shared-sitemap-vs-prerender',
    setDiff(routeSets.sharedSitemapRoutes, routeSets.sitemapEligiblePrerenderRoutes),
    setDiff(routeSets.sitemapEligiblePrerenderRoutes, routeSets.sharedSitemapRoutes),
  )
  addMismatch(
    'sitemap-xml-vs-prerender',
    setDiff(sitemapXmlRoutes, routeSets.sitemapEligiblePrerenderRoutes),
    setDiff(routeSets.sitemapEligiblePrerenderRoutes, sitemapXmlRoutes),
  )
  addMismatch('dist-html-vs-prerender', setDiff(distRoutes, routeSets.prerenderRoutes), setDiff(routeSets.prerenderRoutes, distRoutes))

  const excludedHerbRoutes = findExcludedEntityRoutes('herb', publicationEntityRoutes)
  const excludedCompoundRoutes = findExcludedEntityRoutes('compound', publicationEntityRoutes)
  const excludedCollectionRoutes = Array.isArray(metadata?.excludedCollections)
    ? metadata.excludedCollections.map(entry => normalizeRoute(entry?.route || '')).filter(Boolean)
    : []

  for (const route of [...excludedHerbRoutes, ...excludedCompoundRoutes, ...excludedCollectionRoutes]) {
    if (routeSets.prerenderRoutes.has(route) || sitemapXmlRoutes.has(route) || distRoutes.has(route)) {
      checks.excludedStillPublished.push({ route, reason: 'excluded-route-still-published-or-indexed' })
    }
  }

  const warningChecks = {
    thinIndexablePages: checks.thinIndexablePages,
    excludedStillPublished: checks.excludedStillPublished,
  }
  const failureChecks = {
    buildTokens: checks.buildTokens,
    entityNameQuality: checks.entityNameQuality,
    headTagIntegrity: checks.headTagIntegrity,
    routeParity: checks.routeParity,
  }
  const failureCount = Object.values(failureChecks).reduce((sum, items) => sum + items.length, 0)
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      checkedRoutes: prerenderRoutes.length,
      distHtmlRoutes: distRoutes.size,
      sitemapXmlRoutes: sitemapXmlRoutes.size,
      publicationEntityRoutes: publicationEntityRoutes.size,
      failureCount,
      failuresByCheck: Object.fromEntries(Object.entries(failureChecks).map(([name, items]) => [name, items.length])),
      warningsByCheck: Object.fromEntries(Object.entries(warningChecks).map(([name, items]) => [name, items.length])),
    },
    checks,
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8')

  const parts = Object.entries(report.summary.failuresByCheck)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => `${name}=${count}`)

  if (failureCount > 0) {
    console.error(`[verify-publishing] FAIL (${failureCount}) ${parts.join(' | ')}`)
    console.error(`[verify-publishing] report: ${path.relative(ROOT, REPORT_PATH)}`)
    process.exit(1)
  }

  console.log(`[verify-publishing] OK checked=${prerenderRoutes.length} dist=${distRoutes.size} sitemap=${sitemapXmlRoutes.size}`)
  const warningCount = Object.values(warningChecks).reduce((sum, items) => sum + items.length, 0)
  if (warningCount > 0) {
    const warningParts = Object.entries(report.summary.warningsByCheck)
      .filter(([, count]) => count > 0)
      .map(([name, count]) => `${name}=${count}`)
    console.warn(`[verify-publishing] WARN (${warningCount}) ${warningParts.join(' | ')}`)
  }
  console.log(`[verify-publishing] report: ${path.relative(ROOT, REPORT_PATH)}`)
}

run()
