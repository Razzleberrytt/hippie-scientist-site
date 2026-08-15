#!/usr/bin/env node
/**
 * Score comparison opportunities by decision intent, monetization potential,
 * and evidence availability. Commercial potential is deliberately capped by
 * evidence quality so weak evidence cannot win purely because it monetizes.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const INPUT_PATH = path.join(REPORTS_DIR, 'comparison-opportunities.json')
const JSON_PATH = path.join(REPORTS_DIR, 'comparison-opportunities-scored.json')
const MD_PATH = path.join(REPORTS_DIR, 'comparison-opportunities-scored.md')
const ENTITY_PATHS = [
  path.join(ROOT, 'public', 'data', 'herbs.json'),
  path.join(ROOT, 'public', 'data', 'compounds.json'),
]

function clean(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function loadJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function truthy(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  const text = clean(value).toLowerCase()
  return ['true', 'yes', 'y', '1', 'ready', 'active'].includes(text)
}

function buildEntityIndex() {
  const index = new Map()
  for (const filePath of ENTITY_PATHS) {
    const records = loadJson(filePath, [])
    if (!Array.isArray(records)) continue
    for (const record of records) {
      const slug = clean(record?.slug)
      if (slug && !index.has(slug)) index.set(slug, record)
    }
  }
  return index
}

function normalizeGrade(value) {
  const text = clean(value).toUpperCase()
  if (!text) return ''
  if (text.startsWith('AVOID') || text.includes('INSUFFICIENT')) return 'AVOID/INSUFFICIENT'
  if (/^A(?:\b|[+-])/.test(text)) return 'A'
  if (/^B(?:\b|[+-])/.test(text)) return 'B'
  if (/^C(?:\b|[+-])/.test(text)) return 'C'
  if (/^D(?:\b|[+-])/.test(text)) return 'D'
  return ''
}

function recordEvidenceScore(record) {
  if (!record) return 0
  const grade = normalizeGrade(record.evidence_grade || record.evidence_level || record.evidence_tier)
  const gradeScore = { A: 100, B: 80, C: 55, D: 30, 'AVOID/INSUFFICIENT': 5 }[grade]
  if (gradeScore !== undefined) return gradeScore

  const humanEvidence = clean(record.human_evidence || record.evidence_summary)
  return humanEvidence ? 35 : 10
}

function pairEvidenceScore(left, right) {
  const scores = [recordEvidenceScore(left), recordEvidenceScore(right)]
  const average = (scores[0] + scores[1]) / 2
  const weakest = Math.min(...scores)
  return Math.round((average * 0.4) + (weakest * 0.6))
}

function recordMonetizationScore(record) {
  if (!record) return 0
  let score = 0
  if (truthy(record.affiliate_ready)) score += 25
  if (clean(record.affiliate_url) || clean(record.amazon_affiliate_url) || clean(record.iherb_affiliate_url) || clean(record.preferred_vendor_url)) score += 35
  if (clean(record.buying_criteria) || clean(record.product_cta)) score += 20
  if (clean(record.default_product_type) || clean(record.affiliate_query)) score += 20
  return Math.min(100, score)
}

function pairMonetizationScore(left, right) {
  return Math.round((recordMonetizationScore(left) + recordMonetizationScore(right)) / 2)
}

function intentScore(opportunity) {
  const queries = (opportunity?.sourceQueries || []).map((item) => clean(item?.query).toLowerCase()).filter(Boolean)
  if (!queries.length) return 0
  const text = queries.slice(0, 5).join(' | ')
  let score = 65 // already comparison-shaped by the discovery engine
  if (/\b(which|better|best|choose)\b/.test(text)) score += 15
  if (/\bfor\s+(sleep|stress|anxiety|focus|energy|cognition|memory|blood sugar|weight|recovery)\b/.test(text)) score += 10
  if (/\b(form|type|glycinate|citrate|oxide|threonate|extract|monohydrate)\b/.test(text)) score += 5
  if (/\b(price|cost|buy|brand|product)\b/.test(text)) score += 5
  return Math.min(100, score)
}

export function scoreOpportunity(opportunity, entityIndex) {
  const [leftSlug, rightSlug] = opportunity?.pair || []
  const left = entityIndex.get(leftSlug)
  const right = entityIndex.get(rightSlug)
  const intent = intentScore(opportunity)
  const monetization = pairMonetizationScore(left, right)
  const evidence = pairEvidenceScore(left, right)

  let score = Math.round((intent * 0.4) + (evidence * 0.35) + (monetization * 0.25))
  if (evidence < 30) score = Math.min(score, 55)
  if (evidence < 15) score = Math.min(score, 40)

  return {
    ...opportunity,
    scoreComponents: { intent, monetization, evidence },
    opportunityScore: score,
  }
}

export function scoreComparisonOpportunities(opportunities, entityIndex = buildEntityIndex()) {
  return (Array.isArray(opportunities) ? opportunities : [])
    .map((item) => scoreOpportunity(item, entityIndex))
    .sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions)
}

function renderMarkdown(report) {
  return [
    '# Scored comparison opportunities',
    '',
    'Composite score = 40% search intent + 35% evidence availability + 25% monetization potential. Weak evidence caps the total score.',
    '',
    '| Pair | Score | Intent | Evidence | Monetization | Impressions | Route |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...report.opportunities.map((item) =>
      `| ${item.labels?.join(' vs ') || item.pair?.join(' vs ')} | ${item.opportunityScore} | ${item.scoreComponents.intent} | ${item.scoreComponents.evidence} | ${item.scoreComponents.monetization} | ${item.impressions || 0} | ${item.routeStatus || 'unknown'} |`
    ),
    '',
  ].join('\n')
}

function main() {
  const source = loadJson(INPUT_PATH, null)
  if (!source?.opportunities) {
    console.error('Missing ops/reports/comparison-opportunities.json. Run comparison-opportunity-engine.mjs first.')
    process.exitCode = 1
    return
  }

  const entityIndex = buildEntityIndex()
  const opportunities = scoreComparisonOpportunities(source.opportunities, entityIndex)
  const report = {
    generatedAt: new Date().toISOString(),
    sourceReport: path.relative(ROOT, INPUT_PATH),
    scoring: {
      intentWeight: 0.4,
      evidenceWeight: 0.35,
      monetizationWeight: 0.25,
      weakEvidenceCapsCommercialScore: true,
    },
    opportunities,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  console.log(`Scored comparison opportunities: ${opportunities.length}`)
  console.log(`Wrote ${path.relative(ROOT, JSON_PATH)} and ${path.relative(ROOT, MD_PATH)}`)
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) main()
