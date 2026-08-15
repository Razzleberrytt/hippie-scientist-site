#!/usr/bin/env node
/**
 * Generate editorial comparison opportunities from Search Console query pairs.
 *
 * Input: ops/reports/search-opportunities.json, produced by
 * scripts/seo/search-opportunity-engine.mjs.
 * Output: ops/reports/comparison-opportunities.json + .md.
 *
 * This is intentionally an editorial discovery tool. It never creates routes.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const INPUT_PATH = path.join(REPORTS_DIR, 'search-opportunities.json')
const JSON_PATH = path.join(REPORTS_DIR, 'comparison-opportunities.json')
const MD_PATH = path.join(REPORTS_DIR, 'comparison-opportunities.md')
const ENTITY_FILES = [
  { path: path.join(ROOT, 'public', 'data', 'herbs.json'), type: 'herb' },
  { path: path.join(ROOT, 'public', 'data', 'compounds.json'), type: 'compound' },
]

const COMPARATOR_RE = /\s+(?:vs\.?|versus|or|compared\s+(?:with|to))\s+/i
const GENERIC_ALIASES = new Set(['extract', 'root', 'powder', 'supplement', 'herb', 'compound'])

function clean(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function slugify(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function textList(value) {
  if (Array.isArray(value)) return value.flatMap(textList)
  if (typeof value !== 'string') return []
  return value
    .split(/[;,|]/)
    .map(clean)
    .filter(Boolean)
}

function loadJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

export function buildAliasIndex(entityFiles = ENTITY_FILES) {
  const aliases = []
  const seen = new Set()

  for (const source of entityFiles) {
    const records = loadJson(source.path, [])
    if (!Array.isArray(records)) continue

    for (const record of records) {
      const slug = clean(record?.slug)
      if (!slug) continue
      const name = clean(record?.name || record?.canonical_name || record?.compoundName || slug)
      const candidates = [
        name,
        slug.replace(/-/g, ' '),
        clean(record?.scientific_name),
        clean(record?.latin_name),
        ...textList(record?.aliases),
        ...textList(record?.common_names),
      ]

      for (const rawAlias of candidates) {
        const alias = clean(rawAlias).toLowerCase()
        if (alias.length < 3 || GENERIC_ALIASES.has(alias)) continue
        const key = `${source.type}:${slug}:${alias}`
        if (seen.has(key)) continue
        seen.add(key)
        aliases.push({ alias, slug, name: name || slug, type: source.type })
      }
    }
  }

  return aliases.sort((a, b) => b.alias.length - a.alias.length || a.alias.localeCompare(b.alias))
}

function containsAlias(segment, alias) {
  const haystack = ` ${segment.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `
  const needle = ` ${alias.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `
  return haystack.includes(needle)
}

export function resolveEntity(segment, aliasIndex) {
  for (const candidate of aliasIndex) {
    if (containsAlias(segment, candidate.alias)) return candidate
  }
  return null
}

export function extractEntityPair(query, aliasIndex) {
  const normalized = clean(query)
  if (!normalized || !COMPARATOR_RE.test(normalized)) return null
  const parts = normalized.split(COMPARATOR_RE).map(clean).filter(Boolean)
  if (parts.length !== 2) return null

  const left = resolveEntity(parts[0], aliasIndex)
  const right = resolveEntity(parts[1], aliasIndex)
  if (!left || !right || left.slug === right.slug) return null
  return { left, right }
}

function candidateRoute(leftSlug, rightSlug) {
  const direct = `${leftSlug}-vs-${rightSlug}`
  const reverse = `${rightSlug}-vs-${leftSlug}`
  const directPath = path.join(ROOT, 'app', 'guides', 'compare', direct, 'page.tsx')
  const reversePath = path.join(ROOT, 'app', 'guides', 'compare', reverse, 'page.tsx')
  if (existsSync(directPath)) return { slug: direct, status: 'built' }
  if (existsSync(reversePath)) return { slug: reverse, status: 'built-reverse' }
  return { slug: direct, status: 'missing' }
}

export function buildComparisonOpportunities(queries, aliasIndex) {
  const byPair = new Map()

  for (const queryRow of Array.isArray(queries) ? queries : []) {
    const pair = extractEntityPair(queryRow?.query, aliasIndex)
    if (!pair) continue

    const canonicalKey = [pair.left.slug, pair.right.slug].sort().join('::')
    if (!byPair.has(canonicalKey)) {
      byPair.set(canonicalKey, {
        left: pair.left,
        right: pair.right,
        impressions: 0,
        clicks: 0,
        weightedPosition: 0,
        sourceQueries: [],
      })
    }

    const entry = byPair.get(canonicalKey)
    const impressions = Number(queryRow?.impressions || 0)
    const clicks = Number(queryRow?.clicks || 0)
    const position = Number(queryRow?.position || 0)
    entry.impressions += impressions
    entry.clicks += clicks
    entry.weightedPosition += position * impressions
    entry.sourceQueries.push({
      query: queryRow.query,
      impressions,
      clicks,
      position,
      priority: Number(queryRow?.priority || 0),
    })
  }

  return [...byPair.values()]
    .map((entry) => {
      entry.sourceQueries.sort((a, b) => b.impressions - a.impressions || b.priority - a.priority)
      const primary = entry.sourceQueries[0]
      const primaryPair = extractEntityPair(primary.query, aliasIndex) || { left: entry.left, right: entry.right }
      const route = candidateRoute(primaryPair.left.slug, primaryPair.right.slug)
      return {
        pair: [primaryPair.left.slug, primaryPair.right.slug],
        labels: [primaryPair.left.name, primaryPair.right.name],
        entityTypes: [primaryPair.left.type, primaryPair.right.type],
        candidateSlug: route.slug,
        routeStatus: route.status,
        impressions: entry.impressions,
        clicks: entry.clicks,
        ctr: entry.impressions ? Number(((entry.clicks / entry.impressions) * 100).toFixed(2)) : 0,
        position: entry.impressions ? Number((entry.weightedPosition / entry.impressions).toFixed(1)) : 0,
        sourceQueries: entry.sourceQueries.slice(0, 10),
      }
    })
    .sort((a, b) => b.impressions - a.impressions || a.position - b.position)
}

function renderMarkdown(report) {
  const rows = report.opportunities.map((item) =>
    `| ${item.labels.join(' vs ')} | ${item.impressions} | ${item.clicks} | ${item.position} | ${item.routeStatus} | \`${item.candidateSlug}\` |`
  )
  return [
    '# Search Console comparison opportunities',
    '',
    `Generated ${report.generatedAt}. Candidates are discovered from real comparison-shaped Search Console queries and canonical entity aliases.`,
    '',
    '> Discovery only: this report does not auto-publish comparison pages.',
    '',
    '| Pair | Impressions | Clicks | Position | Route | Candidate slug |',
    '| --- | ---: | ---: | ---: | --- | --- |',
    ...rows,
    '',
  ].join('\n')
}

function main() {
  const source = loadJson(INPUT_PATH, null)
  if (!source?.queries) {
    console.error('Missing ops/reports/search-opportunities.json. Run the search opportunity engine first.')
    process.exitCode = 1
    return
  }

  const aliasIndex = buildAliasIndex()
  const opportunities = buildComparisonOpportunities(source.queries, aliasIndex)
  const report = {
    generatedAt: new Date().toISOString(),
    sourceReport: path.relative(ROOT, INPUT_PATH),
    queriesInspected: source.queries.length,
    aliasesIndexed: aliasIndex.length,
    opportunities,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  console.log(`Comparison opportunities: ${opportunities.length}`)
  console.log(`Wrote ${path.relative(ROOT, JSON_PATH)} and ${path.relative(ROOT, MD_PATH)}`)
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) main()
