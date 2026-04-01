#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const HERBS_PATH = path.join(ROOT, 'public', 'data', 'herbs.json')
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'herb-missing-data-inventory.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'herb-missing-data-inventory.md')

const PLACEHOLDER_PATTERNS = [
  /\bunknown\b/i,
  /\btbd\b/i,
  /\bnone\s+documented\b/i,
  /\bnot\s+(?:established|available|known|specified)\b/i,
  /\binsufficient\s+data\b/i,
  /\bn\/a\b/i,
  /\bplaceholder\b/i,
  /\bcoming\s+soon\b/i,
  /^\s*\[object\s+object\]\s*$/i,
]

const INDEXABILITY_WEIGHTS = {
  name: 20,
  slug: 25,
  description: 25,
  effects: 20,
  sources: 18,
  mechanism: 14,
  contraindications: 14,
  interactions: 14,
  safetyNotes: 12,
  legalStatus: 10,
  therapeuticUses: 10,
  activeCompounds: 10,
  dosage: 8,
  preparation: 6,
  region: 4,
}

const AUDIT_FIELDS = Object.keys(INDEXABILITY_WEIGHTS)

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function hasValue(value) {
  if (Array.isArray(value)) return value.some(hasValue)
  if (value && typeof value === 'object') return Object.values(value).some(hasValue)
  if (value == null) return false
  return String(value).trim().length > 0
}

function isPlaceholderText(value) {
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(String(value ?? '').trim()))
}

function collectFieldStates(record, field) {
  const value = record?.[field]

  if (Array.isArray(value)) {
    const missing = value.length === 0 || !value.some(hasValue)
    const placeholder = value.some(item => {
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return isPlaceholderText(item)
      if (item && typeof item === 'object') {
        return Object.values(item).some(v => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') && isPlaceholderText(v))
      }
      return false
    })
    return { missing, placeholder }
  }

  if (value && typeof value === 'object') {
    const values = Object.values(value)
    const missing = values.length === 0 || !values.some(hasValue)
    const placeholder = values.some(v => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') && isPlaceholderText(v))
    return { missing, placeholder }
  }

  const missing = !hasValue(value)
  const placeholder = !missing && isPlaceholderText(value)
  return { missing, placeholder }
}

function pct(part, total) {
  return total === 0 ? 0 : Number(((part / total) * 100).toFixed(2))
}

function listFiles(relativeDir, matcher) {
  const fullDir = path.join(ROOT, relativeDir)
  if (!fs.existsSync(fullDir)) return []
  return fs
    .readdirSync(fullDir)
    .filter(name => matcher(name))
    .map(name => path.posix.join(relativeDir, name))
    .sort()
}

function run() {
  const herbs = readJson(HERBS_PATH)
  if (!Array.isArray(herbs)) throw new Error('public/data/herbs.json must be an array')

  const completion = Object.fromEntries(AUDIT_FIELDS.map(field => [field, 0]))
  const missingCounts = Object.fromEntries(AUDIT_FIELDS.map(field => [field, 0]))
  const placeholderCounts = Object.fromEntries(AUDIT_FIELDS.map(field => [field, 0]))

  const missingFieldsByHerb = []
  const placeholderFieldsByHerb = []
  const rankedEnrichmentOrder = []

  for (const herb of herbs) {
    const herbId = herb.slug || herb.id || herb.name
    const herbName = herb.name || herb.displayName || herbId

    const missingFields = []
    const placeholderFields = []

    let impactScore = 0

    for (const field of AUDIT_FIELDS) {
      const { missing, placeholder } = collectFieldStates(herb, field)

      if (!missing) completion[field] += 1
      if (missing) {
        missingCounts[field] += 1
        missingFields.push(field)
        impactScore += INDEXABILITY_WEIGHTS[field] || 0
      }

      if (placeholder) {
        placeholderCounts[field] += 1
        placeholderFields.push(field)
        impactScore += Math.round((INDEXABILITY_WEIGHTS[field] || 0) * 0.8)
      }
    }

    if (missingFields.length > 0) {
      missingFieldsByHerb.push({ slug: herbId, name: herbName, missingFields })
    }

    if (placeholderFields.length > 0) {
      placeholderFieldsByHerb.push({ slug: herbId, name: herbName, placeholderFields })
    }

    if (impactScore > 0) {
      rankedEnrichmentOrder.push({
        slug: herbId,
        name: herbName,
        impactScore,
        missingFieldCount: missingFields.length,
        placeholderFieldCount: placeholderFields.length,
        topImpactFields: [...missingFields, ...placeholderFields]
          .sort((a, b) => (INDEXABILITY_WEIGHTS[b] || 0) - (INDEXABILITY_WEIGHTS[a] || 0))
          .slice(0, 6),
      })
    }
  }

  const completionPercentages = Object.fromEntries(
    AUDIT_FIELDS.map(field => [field, {
      populated: completion[field],
      total: herbs.length,
      completionPct: pct(completion[field], herbs.length),
    }])
  )

  const mostFrequentlyMissingFieldTypes = Object.entries(missingCounts)
    .map(([field, count]) => ({ field, count, missingPct: pct(count, herbs.length) }))
    .sort((a, b) => b.count - a.count)

  rankedEnrichmentOrder.sort((a, b) => b.impactScore - a.impactScore)

  const enrichmentAssets = {
    scripts: listFiles('scripts/enrichment', name => name.endsWith('.mjs') || name.endsWith('.md')),
    schemas: listFiles('schemas', name => name.includes('enrichment') || name.includes('source') || name.includes('patch') || name.includes('interaction') || name.includes('dosage') || name.includes('mechanism')),
    reports: listFiles('ops/reports', name => name.includes('enrichment') || name.includes('indexability') || name.includes('source') || name.includes('coverage')),
    targets: listFiles('ops/targets', name => name.endsWith('.json')),
  }

  const report = {
    generatedAt: new Date().toISOString(),
    dataset: {
      file: 'public/data/herbs.json',
      totalHerbs: herbs.length,
      auditedFields: AUDIT_FIELDS,
    },
    missingFieldsByHerb,
    placeholderFieldsByHerb,
    fieldCompletionPercentages: completionPercentages,
    mostFrequentlyMissingFieldTypes,
    recommendedEnrichmentOrderRankedByIndexabilityImpact: rankedEnrichmentOrder,
    enrichmentAssets,
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8')

  const topMissing = mostFrequentlyMissingFieldTypes.slice(0, 10)
  const topQueue = rankedEnrichmentOrder.slice(0, 25)
  const md = [
    '# Herb Missing-Data Inventory',
    '',
    `Generated at: ${report.generatedAt}`,
    '',
    `Total herbs audited: **${herbs.length}**`,
    '',
    '## Most frequently missing field types',
    '',
    '| Field | Missing Count | Missing % |',
    '| --- | ---: | ---: |',
    ...topMissing.map(item => `| ${item.field} | ${item.count} | ${item.missingPct}% |`),
    '',
    '## Recommended enrichment order (top 25 by indexability impact)',
    '',
    '| Rank | Slug | Name | Impact score | Missing fields | Placeholder fields |',
    '| --- | --- | --- | ---: | ---: | ---: |',
    ...topQueue.map((item, index) => `| ${index + 1} | ${item.slug} | ${String(item.name).replace(/\|/g, '\\|')} | ${item.impactScore} | ${item.missingFieldCount} | ${item.placeholderFieldCount} |`),
    '',
    '## Existing enrichment assets discovered',
    '',
    `- Enrichment scripts: ${enrichmentAssets.scripts.length}`,
    `- Enrichment-related schemas: ${enrichmentAssets.schemas.length}`,
    `- Enrichment/indexability reports: ${enrichmentAssets.reports.length}`,
    `- Target wave profiles: ${enrichmentAssets.targets.length}`,
    '',
    'See JSON report for full per-herb missing and placeholder inventories.',
    '',
  ].join('\n')

  fs.writeFileSync(REPORT_MD_PATH, md, 'utf8')

  console.log(`[report-herb-missing-data-inventory] herbs=${herbs.length} missingHerbs=${missingFieldsByHerb.length} placeholderHerbs=${placeholderFieldsByHerb.length}`)
  console.log(`[report-herb-missing-data-inventory] wrote ${path.relative(ROOT, REPORT_JSON_PATH)}`)
  console.log(`[report-herb-missing-data-inventory] wrote ${path.relative(ROOT, REPORT_MD_PATH)}`)
}

run()
