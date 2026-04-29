#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const SHEETS = {
  compounds: 'Compound Master V3',
  claims: 'Claim Rows',
  herbCompoundMap: 'Herb Compound Map V3',
}

const ALLOWED_DOMAINS = new Set([
  'performance',
  'metabolic',
  'cardiovascular',
  'cognition',
  'sleep',
  'stress',
  'liver',
  'pain',
])

const ALLOWED_TIME_TO_EFFECT = new Set(['acute', 'short-term', 'chronic'])

function parseArgs(argv) {
  const args = argv.slice(2)
  let outDir = 'public/data'

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--out') {
      outDir = args[i + 1] || ''
      i += 1
    } else if (args[i].startsWith('--out=')) {
      outDir = args[i].slice('--out='.length)
    }
  }

  if (!String(outDir).trim()) {
    throw new Error('[data] Missing --out value')
  }

  return path.resolve(repoRoot, outDir)
}

function clean(value) {
  if (value === null || value === undefined) return ''
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text
}

function toSlug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toNumber(value) {
  const n = Number.parseFloat(clean(value))
  return Number.isFinite(n) ? n : null
}

function getFirst(row, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      const value = clean(row[key])
      if (value) return value
    }
  }
  return ''
}

function getList(row, keys) {
  const value = getFirst(row, keys)
  if (!value) return []
  return value
    .split(/[;,|\n]/)
    .map(item => clean(item))
    .filter(Boolean)
}

function isDataRow(row) {
  return Object.values(row).some(value => clean(value))
}

function readSheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`[data] Missing required sheet: ${sheetName}`)
  }

  return XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  }).filter(isDataRow)
}

function normalizeDomain(value) {
  const raw = clean(value).toLowerCase()
  if (!raw) return null

  const compact = raw.replace(/\s+/g, ' ').trim()
  const stripped = compact.replace(/[^a-z\- ]+/g, '')

  const map = new Map([
    ['performance', 'performance'],
    ['metabolic', 'metabolic'],
    ['metabolism', 'metabolic'],
    ['cardiovascular', 'cardiovascular'],
    ['cardio', 'cardiovascular'],
    ['cognition', 'cognition'],
    ['cognitive', 'cognition'],
    ['sleep', 'sleep'],
    ['stress', 'stress'],
    ['liver', 'liver'],
    ['pain', 'pain'],
  ])

  const mapped = map.get(stripped)
  if (mapped && ALLOWED_DOMAINS.has(mapped)) return mapped

  if (ALLOWED_DOMAINS.has(stripped)) return stripped
  return null
}

function normalizeTimeToEffect(value) {
  const raw = clean(value).toLowerCase()
  if (!raw) return null

  if (ALLOWED_TIME_TO_EFFECT.has(raw)) return raw
  if (raw.includes('acute')) return 'acute'
  if (raw.includes('short')) return 'short-term'
  if (raw.includes('chronic') || raw.includes('long')) return 'chronic'
  return null
}

function evidenceRank(grade) {
  const normalized = clean(grade).toUpperCase()
  const rank = {
    'A+': 7,
    A: 6,
    'A-': 5,
    B: 4,
    C: 3,
    D: 2,
    E: 1,
  }

  if (Object.prototype.hasOwnProperty.call(rank, normalized)) {
    return rank[normalized]
  }

  return 0
}

function pickBestClaim(current, candidate) {
  if (!current) return candidate

  const gradeDelta = evidenceRank(candidate.evidence_grade) - evidenceRank(current.evidence_grade)
  if (gradeDelta > 0) return candidate

  if (gradeDelta === 0) {
    const effectDelta = (candidate.effect_size ?? -Infinity) - (current.effect_size ?? -Infinity)
    if (effectDelta > 0) return candidate
  }

  return current
}

function buildClaimsIndex(claimRows) {
  const bySlug = new Map()

  for (const row of claimRows) {
    const slug = toSlug(
      getFirst(row, ['slug', 'compound_slug', 'compoundSlug', 'compound_id', 'compound', 'compound_name']),
    )

    if (!slug) continue

    const claim = {
      evidence_grade: getFirst(row, ['evidence_grade', 'evidenceGrade', 'grade', 'evidence']),
      minimum_effective_dose: getFirst(row, ['minimum_effective_dose', 'minimumEffectiveDose', 'med', 'dose']),
      effect_size: toNumber(getFirst(row, ['effect_size', 'effectSize'])),
      population_tags: getList(row, ['population_tags', 'populationTags', 'population']).map(toSlug),
    }

    const current = bySlug.get(slug)
    bySlug.set(slug, pickBestClaim(current, claim))
  }

  return bySlug
}

function assertRequired(record, field) {
  if (record[field] === null || record[field] === undefined || record[field] === '') {
    throw new Error(`[data] Missing required field: ${field} for slug=${record.slug || 'unknown'}`)
  }
}

function main() {
  const outputDir = parseArgs(process.argv)
  const workbookPath = resolveWorkbookPath(repoRoot)
  const workbook = XLSX.readFile(workbookPath, { cellDates: false })

  const compoundsRows = readSheetRows(workbook, SHEETS.compounds)
  const claimRows = readSheetRows(workbook, SHEETS.claims)
  readSheetRows(workbook, SHEETS.herbCompoundMap)

  const claimsBySlug = buildClaimsIndex(claimRows)

  const compounds = compoundsRows
    .map(row => {
    const slug = toSlug(getFirst(row, ['slug', 'compound_slug', 'compoundSlug', 'canonicalCompoundId', 'compound_id', 'name', 'compound_name', 'compoundName']))

    const benefit = toNumber(getFirst(row, ['benefit_score', 'benefitScore']))
    const risk = toNumber(getFirst(row, ['risk_score', 'riskScore']))
    const explicitNet = toNumber(getFirst(row, ['net_score', 'netScore']))
    const netScore = explicitNet ?? (benefit !== null && risk !== null ? benefit - risk : null)

    const claim = claimsBySlug.get(slug) || {
      evidence_grade: null,
      minimum_effective_dose: null,
      effect_size: null,
      population_tags: [],
    }

    if (!slug) return null

    const record = {
      slug,
      domain: normalizeDomain(getFirst(row, ['domain', 'primary_domain', 'goal_domain'])),
      net_score: netScore,
      evidence_grade: claim.evidence_grade || null,
      pathway_bucket: getFirst(row, ['pathway_bucket', 'pathwayBucket']) || null,
      minimum_effective_dose: claim.minimum_effective_dose || null,
      time_to_effect: normalizeTimeToEffect(getFirst(row, ['time_to_effect', 'timeToEffect'])),
      population_tags: claim.population_tags,
      interaction_type: getFirst(row, ['interaction_type', 'interactionType']) || null,
    }

    assertRequired(record, 'slug')

    return record
  })
    .filter(Boolean)

  fs.mkdirSync(outputDir, { recursive: true })
  const outFile = path.join(outputDir, 'compounds.json')
  fs.writeFileSync(outFile, `${JSON.stringify(compounds, null, 2)}\n`, 'utf8')

  console.log(`[data] Wrote ${compounds.length} compounds → ${path.relative(repoRoot, outFile)}`)
}

main()
