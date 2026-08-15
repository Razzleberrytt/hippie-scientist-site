#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const OUT = path.resolve(ROOT, process.argv.find((arg) => arg.startsWith('--out='))?.split('=')[1] || 'out')
const OPPORTUNITY_FILE = process.argv.find((arg) => arg.startsWith('--opportunities='))?.split('=')[1]
const REPORT = path.resolve(ROOT, process.argv.find((arg) => arg.startsWith('--report='))?.split('=')[1] || 'artifacts/internal-pagerank.json')
const DAMPING = 0.85
const ITERATIONS = 40
const MAX_RECOMMENDATIONS_PER_SOURCE = 3

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full) : [full]
  })
}

function normalizeRoute(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  const clean = value.split(/[?#]/)[0]
  if (/\.[a-z0-9]+$/i.test(clean)) return null
  return clean === '/' ? '/' : `${clean.replace(/\/+$/, '')}/`
}

function routeForFile(file) {
  const relative = path.relative(OUT, file).replaceAll(path.sep, '/')
  if (relative === 'index.html') return '/'
  if (relative.endsWith('/index.html')) return normalizeRoute(`/${relative.slice(0, -'index.html'.length)}`)
  return normalizeRoute(`/${relative.replace(/\.html$/, '')}`)
}

function linksFromHtml(html) {
  return Array.from(html.matchAll(/href=["']([^"'#]+)["']/gi), (match) => normalizeRoute(match[1]))
    .filter(Boolean)
}

function tokens(route) {
  return new Set(route.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 3 && !['herbs', 'compounds', 'guides', 'learn', 'info'].includes(token)))
}

function semanticRouteOverlap(a, b) {
  const ta = tokens(a)
  const tb = tokens(b)
  if (!ta.size || !tb.size) return 0
  let shared = 0
  for (const token of ta) if (tb.has(token)) shared += 1
  return shared / Math.max(ta.size, tb.size)
}

function readOpportunities() {
  if (!OPPORTUNITY_FILE) return new Map()
  const raw = JSON.parse(fs.readFileSync(path.resolve(ROOT, OPPORTUNITY_FILE), 'utf8'))
  const rows = Array.isArray(raw) ? raw : raw.rows || raw.opportunities || []
  return new Map(rows.map((row) => {
    const route = normalizeRoute(String(row.url || row.path || row.page || ''))
    const impressions = Number(row.impressions || 0)
    const position = Number(row.position || row.averagePosition || row.average_position || 0)
    const explicit = Number(row.opportunityScore || row.opportunity_score || row.score || 0)
    const nearPageOne = position >= 4 && position <= 15 ? 1 : 0
    const impressionSignal = impressions > 0 ? Math.min(1, Math.log10(impressions + 1) / 5) : 0
    const score = explicit > 0 ? (explicit > 1 ? Math.min(1, explicit / 100) : explicit) : impressionSignal * 0.65 + nearPageOne * 0.35
    return [route, { impressions, position, score }]
  }).filter(([route]) => route))
}

const pages = walk(OUT).filter((file) => file.endsWith('.html')).map((file) => ({
  route: routeForFile(file),
  html: fs.readFileSync(file, 'utf8'),
})).filter((page) => page.route)
const routes = new Set(pages.map((page) => page.route))
const graph = new Map()
const inbound = new Map(Array.from(routes, (route) => [route, new Set()]))

for (const page of pages) {
  const targets = new Set(linksFromHtml(page.html).filter((target) => routes.has(target) && target !== page.route))
  graph.set(page.route, targets)
  for (const target of targets) inbound.get(target)?.add(page.route)
}

let scores = new Map(Array.from(routes, (route) => [route, 1 / Math.max(1, routes.size)]))
for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
  const next = new Map(Array.from(routes, (route) => [route, (1 - DAMPING) / Math.max(1, routes.size)]))
  let dangling = 0
  for (const route of routes) {
    const outgoing = graph.get(route) || new Set()
    const score = scores.get(route) || 0
    if (!outgoing.size) dangling += score
    else for (const target of outgoing) next.set(target, (next.get(target) || 0) + DAMPING * score / outgoing.size)
  }
  const danglingShare = DAMPING * dangling / Math.max(1, routes.size)
  for (const route of routes) next.set(route, (next.get(route) || 0) + danglingShare)
  scores = next
}

const opportunities = readOpportunities()
const ranked = Array.from(routes).map((route) => ({
  route,
  pageRank: scores.get(route) || 0,
  inboundLinks: inbound.get(route)?.size || 0,
  outboundLinks: graph.get(route)?.size || 0,
  opportunity: opportunities.get(route) || null,
})).sort((a, b) => b.pageRank - a.pageRank)

const opportunityTargets = ranked.filter((row) => row.opportunity?.score > 0).sort((a, b) => b.opportunity.score - a.opportunity.score)
const authoritySources = ranked.slice(0, Math.max(25, Math.ceil(ranked.length * 0.05)))
const recommendations = []

for (const source of authoritySources) {
  let added = 0
  for (const target of opportunityTargets) {
    if (added >= MAX_RECOMMENDATIONS_PER_SOURCE) break
    if (source.route === target.route || graph.get(source.route)?.has(target.route)) continue
    const semantic = semanticRouteOverlap(source.route, target.route)
    const sameFamily = source.route.split('/').filter(Boolean)[0] === target.route.split('/').filter(Boolean)[0]
    if (semantic === 0 && !sameFamily) continue
    recommendations.push({
      source: source.route,
      target: target.route,
      reason: semantic > 0 ? 'high-authority source + semantic route overlap + search opportunity' : 'high-authority source + same content family + search opportunity',
      semanticOverlap: Number(semantic.toFixed(3)),
      sourcePageRank: source.pageRank,
      targetPageRank: target.pageRank,
      targetInboundLinks: target.inboundLinks,
      targetOpportunity: target.opportunity,
    })
    added += 1
  }
}

const underlinkedImportant = opportunityTargets
  .filter((row) => row.inboundLinks <= 2 || row.pageRank < ranked[Math.min(ranked.length - 1, Math.floor(ranked.length * 0.5))]?.pageRank)
  .slice(0, 100)

fs.mkdirSync(path.dirname(REPORT), { recursive: true })
fs.writeFileSync(REPORT, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  pages: ranked.length,
  damping: DAMPING,
  iterations: ITERATIONS,
  underlinkedImportant,
  recommendedInternalLinks: recommendations,
  ranking: ranked,
}, null, 2)}\n`)

console.log(`[internal-pagerank] ${ranked.length} pages, ${underlinkedImportant.length} underlinked opportunity URLs, ${recommendations.length} recommended links`)
console.log(`Report: ${path.relative(ROOT, REPORT)}`)
