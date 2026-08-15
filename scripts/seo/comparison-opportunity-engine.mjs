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
const REVENUE_PRODUCTS_PATH = path.join(ROOT, 'config', 'revenue-products.ts')
const ENTITY_FILES = [
  { path: path.join(ROOT, 'public', 'data', 'herbs.json'), type: 'herb' },
  { path: path.join(ROOT, 'public', 'data', 'compounds.json'), type: 'compound' },
]

const COMPARATOR_RE = /\s+(?:vs\.?|versus|or|compared\s+(?:with|to))\s+/i
const DECISION_MODIFIER_RE = /\b(best|better|which|difference|differences|for|benefits|side effects|dose|dosage|sleep|stress|anxiety|focus)\b/i
const GENERIC_ALIASES = new Set(['extract', 'root', 'powder', 'supplement', 'herb', 'compound'])
const EVIDENCE_SCORES = new Map([
  ['A', 100],
  ['B', 75],
  ['C', 45],
  ['D', 20],
  ['AVOID/INSUFFICIENT', 10],
  ['AVOID', 10],
  ['INSUFFICIENT', 10],
])

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

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
}

function canonicalEvidenceGrade(record) {
  const raw = clean(record?.evidence_grade || record?.evidence_level || record?.grade).toUpperCase()
  if (!raw) return ''
  if (/^A(?:\b|[+-])/.test(raw) || raw.includes('STRONG')) return 'A'
  if (/^B(?:\b|[+-])/.test(raw) || raw.includes('MODERATE')) return 'B'
  if (/^C(?:\b|[+-])/.test(raw) || raw.includes('LIMITED') || raw.includes('PRELIMINARY')) return 'C'
  if (/^D(?:\b|[+-])/.test(raw) || raw.includes('WEAK')) return 'D'
  if (raw.includes('AVOID') || raw.includes('INSUFFICIENT')) return 'AVOID/INSUFFICIENT'
  return ''
}

function evidenceAvailabilityScore(record) {
  const grade = canonicalEvidenceGrade(record)
  if (grade) return EVIDENCE_SCORES.get(grade) ?? 0

  const humanEvidence = clean(record?.human_evidence || record?.evidence_summary)
  const studies = Number(record?.study_count || record?.human_study_count || record?.human_trials || 0)
  if (studies >= 5) return 65
  if (studies >= 2) return 45
  if (studies === 1) return 30
  return humanEvidence ? 25 : 0
}

export function loadRevenueProductSlugs(filePath = REVENUE_PRODUCTS_PATH) {
  if (!existsSync(filePath)) return new Set()
  const source = readFileSync(filePath, 'utf8')
  return new Set(
    [...source.matchAll(/\bslug:\s*['"]([^'"]+)['"]/g)]
      .map((match) => slugify(match[1]))
      .filter(Boolean),
  )
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
      const evidenceScore = evidenceAvailabilityScore(record)
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
        aliases.push({ alias, slug, name: name || slug, type: source.type, evidenceScore })
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

function scoreSearchIntent(entry, position) {
  const demand = Math.min(25, Math.log10(Math.max(0, entry.impressions) + 1) * 8)
  const modifierImpressions = entry.sourceQueries.reduce(
    (total, row) => total + (DECISION_MODIFIER_RE.test(row.query) ? row.impressions : 0),
    0,
  )
  const modifierShare = entry.impressions ? modifierImpressions / entry.impressions : 0
  const decisionSignal = Math.min(15, modifierShare * 15)
  const rankSignal = position >= 4 && position <= 20 ? 10 : position > 20 && position <= 40 ? 5 : position > 0 && position < 4 ? 7 : 0
  return clampScore(50 + demand + decisionSignal + rankSignal)
}

function scoreMonetization(leftSlug, rightSlug, revenueProductSlugs) {
  const coverage = [leftSlug, rightSlug].filter((slug) => revenueProductSlugs.has(slug)).length
  if (coverage === 2) return 100
  if (coverage === 1) return 55
  return 0
}

function scoreEvidence(left, right) {
  return clampScore((Number(left?.evidenceScore || 0) + Number(right?.evidenceScore || 0)) / 2)
}

function scoreOpportunity({ searchIntentScore, monetizationScore, evidenceScore }) {
  return clampScore(searchIntentScore * 0.45 + monetizationScore * 0.25 + evidenceScore * 0.3)
}

export function buildComparisonOpportunities(queries, aliasIndex, revenueProductSlugs = loadRevenueProductSlugs()) {
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
      const position = entry.impressions ? Number((entry.weightedPosition / entry.impressions).toFixed(1)) : 0
      const searchIntentScore = scoreSearchIntent(entry, position)
      const monetizationScore = scoreMonetization(primaryPair.left.slug, primaryPair.right.slug, revenueProductSlugs)
      const evidenceScore = scoreEvidence(primaryPair.left, primaryPair.right)
      const opportunityScore = scoreOpportunity({ searchIntentScore, monetizationScore, evidenceScore })

      return {
        pair: [primaryPair.left.slug, primaryPair.right.slug],
        labels: [primaryPair.left.name, primaryPair.right.name],
        entityTypes: [primaryPair.left.type, primaryPair.right.type],
        candidateSlug: route.slug,
        routeStatus: route.status,
        impressions: entry.impressions,
        clicks: entry.clicks,
        ctr: entry.impressions ? Number(((entry.clicks / entry.impressions) * 100).toFixed(2)) : 0,
        position,
        opportunityScore,
        scoreBreakdown: {
          searchIntent: searchIntentScore,
          monetization: monetizationScore,
          evidenceAvailability: evidenceScore,
        },
        sourceQueries: entry.sourceQueries.slice(0, 10),
      }
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions || a.position - b.position)
}

function renderMarkdown(report) {
  const rows = report.opportunities.map((item) =>
    `| ${item.labels.join(' vs ')} | ${item.opportunityScore} | ${item.scoreBreakdown.searchIntent} | ${item.scoreBreakdown.monetization} | ${item.scoreBreakdown.evidenceAvailability} | ${item.impressions} | ${item.position} | ${item.routeStatus} | \`${item.candidateSlug}\` |`
  )
  return [
    '# Search Console comparison opportunities',
    '',
    `Generated ${report.generatedAt}. Candidates are discovered from real comparison-shaped Search Console queries and canonical entity aliases.`,
    '',
    '> Discovery only: this report does not auto-publish comparison pages.',
    '',
    'Opportunity score = 45% search intent + 25% monetization coverage + 30% evidence availability.',
    '',
    '| Pair | Score | Intent | Monetization | Evidence | Impressions | Position | Route | Candidate slug |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |',
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
  const revenueProductSlugs = loadRevenueProductSlugs()
  const opportunities = buildComparisonOpportunities(source.queries, aliasIndex, revenueProductSlugs)
  const report = {
    generatedAt: new Date().toISOString(),
    sourceReport: path.relative(ROOT, INPUT_PATH),
    queriesInspected: source.queries.length,
    aliasesIndexed: aliasIndex.length,
    revenueProductSetsIndexed: revenueProductSlugs.size,
    scoring: {
      searchIntentWeight: 0.45,
      monetizationWeight: 0.25,
      evidenceAvailabilityWeight: 0.3,
    },
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
