#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'out')
const outputArg = process.argv.indexOf('--output')
const outputPath = path.resolve(root, outputArg >= 0 && process.argv[outputArg + 1]
  ? process.argv[outputArg + 1]
  : 'public/data/reports/production-quality-snapshot.json')

function decode(value) {
  return String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number.parseInt(n, 10)))
    .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
}

function text(value) {
  return decode(String(value || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function attr(tag, name) {
  const match = String(tag || '').match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))
  return match ? decode(match[1]).trim() : ''
}

function routeFromFile(file) {
  const rel = path.relative(outDir, file).replace(/\\/g, '/')
  if (rel === 'index.html') return '/'
  return `/${rel.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`.replace(/\/+/g, '/')
}

function walkHtml(dir) {
  const files = []
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '_next') continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full)
    }
  }
  if (fs.existsSync(dir)) walk(dir)
  return files
}

function normalizeInternalHref(raw) {
  const href = String(raw || '').trim()
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return ''
  try {
    const url = new URL(href, 'https://thehippiescientist.net')
    if (url.hostname !== 'thehippiescientist.net' && url.hostname !== 'www.thehippiescientist.net') return ''
    return `${url.pathname}${url.search}` || '/'
  } catch {
    return ''
  }
}

function buildRouteSnapshot() {
  const routes = {}
  for (const file of walkHtml(outDir)) {
    const route = routeFromFile(file)
    if (route === '/404' || route === '/500') continue
    const html = fs.readFileSync(file, 'utf8')
    const title = text((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1])
    const h1 = text((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1])
    const canonicalTag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [])[0] ||
      (html.match(/<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i) || [])[0] || ''
    const canonical = attr(canonicalTag, 'href')
    const robotsTag = (html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/i) || [])[0] ||
      (html.match(/<meta\b[^>]*content=["'][^"']+["'][^>]*name=["']robots["'][^>]*>/i) || [])[0] || ''
    const robots = attr(robotsTag, 'content').toLowerCase()
    const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)]
      .map(match => normalizeInternalHref(match[1]))
      .filter(Boolean)
    routes[route] = {
      title,
      h1,
      canonical,
      indexable: !/\bnoindex\b/.test(robots),
      internalLinks: [...new Set(links)].sort(),
    }
  }
  return routes
}

function readJson(rel) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) return []
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return [] }
}

function recordsFrom(value) {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.records)) return value.records
  if (Array.isArray(value?.items)) return value.items
  return []
}

function evidenceGrade(record) {
  const value = record?.evidence_grade ?? record?.evidenceGrade ?? record?.evidence_tier ?? record?.evidenceTier ?? ''
  const raw = String(value || '').trim()
  const upper = raw.toUpperCase()
  if (/^A\b/.test(upper)) return 'A'
  if (/^B\b/.test(upper)) return 'B'
  if (/^C\b/.test(upper)) return 'C'
  if (/^D\b/.test(upper)) return 'D'
  if (/AVOID|INSUFFICIENT/.test(upper)) return 'Avoid/Insufficient'
  return raw || 'Unclassified'
}

function buildEvidenceSnapshot() {
  const fullRecords = [
    ...recordsFrom(readJson('public/data/herbs.json')),
    ...recordsFrom(readJson('public/data/compounds.json')),
  ]
  const summaries = [
    ...recordsFrom(readJson('public/data/herbs-summary.json')),
    ...recordsFrom(readJson('public/data/compounds-summary.json')),
  ]
  const gradeDistribution = {}
  for (const record of fullRecords) {
    const grade = evidenceGrade(record)
    gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1
  }
  const sourceCounts = {}
  for (const record of summaries) {
    const slug = String(record?.slug || '').trim()
    if (!slug) continue
    const explicit = Number(record?.source_count ?? record?.citation_count)
    const pmids = Array.isArray(record?.pubmed_ids) ? record.pubmed_ids.length : 0
    sourceCounts[slug] = Number.isFinite(explicit) ? explicit : pmids
  }
  return {
    recordCount: fullRecords.length,
    gradeDistribution,
    totalSources: Object.values(sourceCounts).reduce((sum, value) => sum + Number(value || 0), 0),
    sourceCounts,
  }
}

function main() {
  if (!fs.existsSync(outDir)) {
    console.error('[quality-snapshot] built output is required in out/.')
    process.exit(2)
  }
  const routes = buildRouteSnapshot()
  const snapshot = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    routes,
    totals: {
      pages: Object.keys(routes).length,
      indexablePages: Object.values(routes).filter(route => route.indexable).length,
      internalLinks: Object.values(routes).reduce((sum, route) => sum + route.internalLinks.length, 0),
    },
    evidence: buildEvidenceSnapshot(),
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`[quality-snapshot] wrote ${outputPath} with ${snapshot.totals.pages} built pages.`)
}

main()
