// optimized runtime payload exporter
// centralized runtime visibility + SEO gating
// affiliate runtime optimization enabled

#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import Ajv from 'ajv'
import { resolveWorkbookPath } from '../workbook-source.mjs'
import { HERB_RUNTIME_FIELDS } from '../../config/runtime-herb-fields.mjs'
import { COMPOUND_RUNTIME_FIELDS } from '../../config/runtime-compound-fields.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')
const ajv = new Ajv({ allErrors: true })

const SHEETS = {
  herbs: ['Herb Master V3', 'Herb Monographs', 'Site Export Herbs'],
  compounds: ['Compound Master V3', 'Site Export Compounds'],
}

const INDEX_FIELDS = [
  'slug',
  'name',
  'summary',
  'primary_effects',
  'evidence_grade',
  'profile_status',
  'runtime_export_decision',
  'affiliate_ready',
  'visibility_tier',
  'robots',
]

function clean(v) {
  return v ? String(v).trim() : ''
}

function slug(v) {
  return clean(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitList(v) {
  return clean(v)
    .split(/[|;,]/)
    .map((s) => clean(s))
    .filter(Boolean)
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function normalizeAffiliateQuery(value) {
  return encodeURIComponent(
    clean(value)
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

function buildAmazonSearchUrl(query) {
  return `https://www.amazon.com/s?k=${normalizeAffiliateQuery(query)}`
}

function buildIHerbSearchUrl(query) {
  return `https://www.iherb.com/search?kw=${normalizeAffiliateQuery(query)}`
}

function determineDefaultProductType(record) {
  const effects = (record.primary_effects || []).join(' ').toLowerCase()

  if (effects.includes('sleep') || effects.includes('sedative')) {
    return 'capsules'
  }

  if (effects.includes('digestive')) {
    return 'tea'
  }

  if (effects.includes('adaptogenic')) {
    return 'extract'
  }

  return 'capsules'
}

function determineAvailableForms(record) {
  if (record.available_forms?.length) {
    return record.available_forms
  }

  return ['capsules', 'powder', 'extract']
}

function determineBuyingCriteria(record) {
  if (clean(record.buying_criteria)) {
    return record.buying_criteria
  }

  return [
    'third-party tested',
    'standardized extract',
    'minimal fillers',
    'transparent labeling',
  ]
}

function applyAffiliateMetadata(record) {
  const affiliate_query =
    clean(record.affiliate_query) || clean(record.name)

  const amazon_url =
    clean(record.amazon_affiliate_url) ||
    buildAmazonSearchUrl(affiliate_query)

  const iherb_url =
    clean(record.iherb_affiliate_url) ||
    buildIHerbSearchUrl(affiliate_query)

  return {
    ...record,
    affiliate_query,
    default_product_type:
      clean(record.default_product_type) ||
      determineDefaultProductType(record),
    buying_criteria: determineBuyingCriteria(record),
    available_forms: determineAvailableForms(record),
    amazon_affiliate_url: amazon_url,
    iherb_affiliate_url: iherb_url,
    affiliate_ready:
      record.affiliate_ready || Boolean(affiliate_query),
  }
}

function resolveSheet(workbook, candidates) {
  for (const candidate of candidates) {
    if (workbook.Sheets[candidate]) return candidate
  }

  return null
}

function read(workbook, candidates) {
  const resolved = resolveSheet(workbook, candidates)
  if (!resolved) return []

  return XLSX.utils.sheet_to_json(workbook.Sheets[resolved], {
    defval: '',
  })
}

function dedupe(rows) {
  const seen = new Set()

  return rows.filter((r) => {
    if (!r.slug || seen.has(r.slug)) return false
    seen.add(r.slug)
    return true
  })
}

function pickRuntimeFields(record, allowedFields) {
  return Object.fromEntries(
    Object.entries(record).filter(([k, v]) => {
      if (!allowedFields.includes(k)) return false
      if (v === '' || v == null) return false
      if (Array.isArray(v) && v.length === 0) return false
      return true
    })
  )
}

function determineVisibility(record) {
  const profile = clean(record.profile_status).toLowerCase()
  const quality = clean(record.summary_quality).toLowerCase()
  const decision = clean(record.runtime_export_decision).toLowerCase()

  if (decision === 'hide') {
    return {
      include: false,
      visibility_tier: 'hidden',
      robots: 'noindex,nofollow',
      sitemap: false,
    }
  }

  if (profile === 'complete' && quality === 'strong') {
    return {
      include: true,
      visibility_tier: 'full_publish',
      robots: 'index,follow',
      sitemap: true,
    }
  }

  if (
    ['partial', 'moderate'].includes(profile) ||
    ['moderate', 'medium'].includes(quality)
  ) {
    return {
      include: true,
      visibility_tier: 'limited',
      robots: 'index,follow',
      sitemap: true,
    }
  }

  return {
    include: true,
    visibility_tier: 'noindex',
    robots: 'noindex,follow',
    sitemap: false,
  }
}

function applyVisibilityMetadata(record) {
  const visibility = determineVisibility(record)

  return {
    ...record,
    visibility_tier: visibility.visibility_tier,
    robots: visibility.robots,
    sitemap_included: visibility.sitemap,
  }
}

function createIndexPayload(record) {
  return pickRuntimeFields(record, INDEX_FIELDS)
}

function writeDetailPayloads(baseDir, rows) {
  ensureDir(baseDir)

  for (const row of rows) {
    if (!row.slug) continue

    writeJson(path.join(baseDir, `${row.slug}.json`), row)
  }
}

function loadAgentPatches() {
  const patchDir = path.resolve(repoRoot, 'agent/patches')

  if (!fs.existsSync(patchDir)) return []

  const files = fs
    .readdirSync(patchDir)
    .filter((f) => f.endsWith('.json'))

  const patches = []

  for (const file of files) {
    try {
      patches.push(
        JSON.parse(fs.readFileSync(path.join(patchDir, file), 'utf8'))
      )
    } catch {}
  }

  return patches
}

function main() {
  const outDir = path.resolve(repoRoot, 'public/data')
  const herbDetailDir = path.join(outDir, 'herb-detail')
  const compoundDetailDir = path.join(outDir, 'compound-detail')

  const workbookPath = resolveWorkbookPath(repoRoot)
  const wb = XLSX.readFile(workbookPath)

  const rawHerbs = dedupe(
    read(wb, SHEETS.herbs).map((r) => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      summary: clean(r.summary),
      summary_quality: clean(r.summary_quality),
      primary_effects: splitList(r.primary_effects || r.effects),
      evidence_grade: clean(r.evidence_grade || r.evidence_tier),
      profile_status: clean(r.profile_status),
      runtime_export_decision: clean(r.runtime_export_decision),
      affiliate_ready: Boolean(r.affiliate_ready),
      affiliate_query: clean(r.affiliate_query),
      default_product_type: clean(r.default_product_type),
      buying_criteria: splitList(r.buying_criteria),
      available_forms: splitList(r.available_forms),
      amazon_affiliate_url: clean(r.amazon_affiliate_url),
      iherb_affiliate_url: clean(r.iherb_affiliate_url),
      mechanisms: splitList(r.mechanisms),
      related_compounds: splitList(r.related_compounds),
      safety: clean(r.safety),
    }))
  )

  const rawCompounds = dedupe(
    read(wb, SHEETS.compounds).map((r) => ({
      slug: slug(r.slug || r.name),
      name: clean(r.name),
      summary: clean(r.summary),
      summary_quality: clean(r.summary_quality),
      primary_effects: splitList(r.primary_effects || r.effects),
      evidence_grade: clean(r.evidence_grade || r.evidence_tier),
      profile_status: clean(r.profile_status),
      runtime_export_decision: clean(r.runtime_export_decision),
      affiliate_ready: Boolean(r.affiliate_ready),
      affiliate_query: clean(r.affiliate_query),
      default_product_type: clean(r.default_product_type),
      buying_criteria: splitList(r.buying_criteria),
      available_forms: splitList(r.available_forms),
      amazon_affiliate_url: clean(r.amazon_affiliate_url),
      iherb_affiliate_url: clean(r.iherb_affiliate_url),
      mechanism: clean(r.mechanism || r.mechanisms),
      dosage: clean(r.dosage),
      safety: clean(r.safety),
    }))
  )

  const herbs = rawHerbs
    .map(applyAffiliateMetadata)
    .map(applyVisibilityMetadata)
    .filter((r) => determineVisibility(r).include)
    .map((r) => pickRuntimeFields(r, HERB_RUNTIME_FIELDS.concat([
      'visibility_tier',
      'robots',
      'sitemap_included',
      'affiliate_query',
      'default_product_type',
      'buying_criteria',
      'available_forms',
      'amazon_affiliate_url',
      'iherb_affiliate_url',
    ])))

  const compounds = rawCompounds
    .map(applyAffiliateMetadata)
    .map(applyVisibilityMetadata)
    .filter((r) => determineVisibility(r).include)
    .map((r) => pickRuntimeFields(r, COMPOUND_RUNTIME_FIELDS.concat([
      'visibility_tier',
      'robots',
      'sitemap_included',
      'affiliate_query',
      'default_product_type',
      'buying_criteria',
      'available_forms',
      'amazon_affiliate_url',
      'iherb_affiliate_url',
    ])))

  const herbIndex = herbs.map(createIndexPayload)
  const compoundIndex = compounds.map(createIndexPayload)

  writeJson(path.join(outDir, 'herbs-index.json'), herbIndex)
  writeJson(path.join(outDir, 'compounds-index.json'), compoundIndex)

  writeDetailPayloads(herbDetailDir, herbs)
  writeDetailPayloads(compoundDetailDir, compounds)

  writeJson(path.join(outDir, 'herbs.json'), herbs)
  writeJson(path.join(outDir, 'compounds.json'), compounds)
  writeJson(path.join(outDir, 'agent-patches.json'), loadAgentPatches())

  console.log(`[data] herbs-index: ${herbIndex.length}`)
  console.log(`[data] compounds-index: ${compoundIndex.length}`)
  console.log(`[data] herb-detail files: ${herbs.length}`)
  console.log(`[data] compound-detail files: ${compounds.length}`)
  console.log('[data] affiliate runtime optimization enabled')
}

main()
