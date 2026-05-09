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

const REQUIRED_SHEETS = [
  'Herb Master V3',
  'Compound Master V3',
  'Herb Compound Map V3',
  'Affiliate Mapping',
  'Product Top Picks System',
  'Protocol Engine',
  'SEO Page Targets',
  'Canonical_Effects',
  'Canonical_Mechanisms',
  'Canonical_Theme_Palettes',
  'Canonical_Compare_Groups',
  'Affiliate Config',
  'Study Registry',
  'Effect Canonical Map',
]

const OPTIONAL_SHEETS = [
  'Herb Monographs',
  'Site Export Herbs',
  'Site Export Compounds',
  'Affiliate Experiments',
]

const SHEETS = {
  herbs: ['Herb Master V3', 'Herb Monographs', 'Site Export Herbs'],
  compounds: ['Compound Master V3', 'Site Export Compounds'],
}

const GRAPH_SHEETS = {
  nodes: ['KG Nodes'], // Resolves KG Nodes, KG Nodes v4, KG Nodes v5, etc.
  relationships: ['Relationship Edges'],
  topics: ['Topic Ecosystems'],
  pathways: ['Pathway Ecosystems'],
  comparisons: ['Comparison Candidates'],
  stacks: ['Stack Synergy'],
  supernodes: ['Authority Supernodes'],
  sparseRecovery: ['Sparse Recovery'],
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

function validateWorkbookSheets(workbook) {
  const sheetNames = workbook.SheetNames || []

  const missingRequired = REQUIRED_SHEETS.filter(
    (sheet) => !sheetNames.includes(sheet)
  )

  const missingOptional = OPTIONAL_SHEETS.filter(
    (sheet) => !sheetNames.includes(sheet)
  )

  for (const sheet of missingOptional) {
    console.warn(`[data] optional sheet missing: ${sheet}`)
  }

  for (const [key, candidates] of Object.entries(GRAPH_SHEETS)) {
    const resolved = resolveLatestVersionedSheet(workbook, candidates)
    if (!resolved) {
      console.warn(`[data] graph sheet missing: ${key}`)
    }
  }

  if (missingRequired.length) {
    for (const sheet of missingRequired) {
      console.error(`[data] missing required sheet: ${sheet}`)
    }

    throw new Error(
      `Workbook validation failed. Missing required sheets: ${missingRequired.join(', ')}`
    )
  }

  console.log('[data] workbook sheets verified')
}

function clean(v) {
  return v ? String(v).trim() : ''
}

function lower(v) {
  return clean(v).toLowerCase()
}

function slug(v) {
  return clean(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitList(v) {
  if (Array.isArray(v)) {
    return v.map(clean).filter(Boolean)
  }

  return clean(v)
    .split(/[|;,]/)
    .map((s) => clean(s))
    .filter(Boolean)
}

function uniqueList(v) {
  const seen = new Set()
  return splitList(v).filter((item) => {
    const key = lower(item)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
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

function resolveLatestVersionedSheet(workbook, candidates) {
  const sheetNames = workbook.SheetNames || []
  const matches = []

  for (const candidate of candidates) {
    const exact = sheetNames.find(
      (sheet) => lower(sheet) === lower(candidate)
    )
    if (exact) matches.push({ name: exact, version: 0 })

    const prefix = `${lower(candidate)} v`
    for (const sheet of sheetNames) {
      const normalized = lower(sheet)
      if (!normalized.startsWith(prefix)) continue
      const version = Number.parseInt(normalized.slice(prefix.length), 10)
      matches.push({
        name: sheet,
        version: Number.isFinite(version) ? version : 0,
      })
    }
  }

  matches.sort((a, b) => b.version - a.version || a.name.localeCompare(b.name))
  return matches[0]?.name || null
}

function read(workbook, candidates) {
  const resolved = resolveSheet(workbook, candidates)
  if (!resolved) return []

  return XLSX.utils.sheet_to_json(workbook.Sheets[resolved], {
    defval: '',
  })
}

function readGraph(workbook, candidates) {
  const resolved = resolveLatestVersionedSheet(workbook, candidates)
  if (!resolved) return []

  const sheet = workbook.Sheets[resolved]
  if (!sheet) return []

  try {
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    console.log(`[data] graph sheet loaded: ${resolved}`)
    return Array.isArray(rows) ? rows : []
  } catch (error) {
    console.warn(`[data] graph sheet skipped: ${resolved} (${error.message})`)
    return []
  }
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

function removeEmptyInternalFields(record) {
  return Object.fromEntries(
    Object.entries(record).filter(([key, value]) => {
      if (key.startsWith('__')) return false
      if (value == null || value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      ) {
        return false
      }
      return true
    })
  )
}

function compactText(value, maxLength = 420) {
  const text = clean(value).replace(/\s+/g, ' ')
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trim()}…`
}

function firstValue(row, fields) {
  for (const field of fields) {
    if (row[field] != null && clean(row[field])) return row[field]
  }

  const normalizedFields = fields.map(lower)
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = lower(key).replace(/[_\s-]+/g, ' ')
    if (normalizedFields.includes(normalizedKey) && clean(value)) {
      return value
    }
  }

  return ''
}

function normalizeGraphNode(row) {
  const name = clean(firstValue(row, ['name', 'node name', 'label', 'title']))
  const type = lower(firstValue(row, ['type', 'node type', 'entity type']))
  const id = slug(firstValue(row, ['id', 'node id', 'key']) || name)
  const profileSlug = slug(firstValue(row, [
    'slug',
    'profile slug',
    'profile_slug',
    'entity slug',
    'entity_slug',
  ]) || name)

  if (!id && !name) return null

  return removeEmptyInternalFields({
    id: id || profileSlug,
    slug: profileSlug || id,
    name,
    type,
    aliases: uniqueList(firstValue(row, ['aliases', 'alias', 'synonyms'])),
    topics: uniqueList(firstValue(row, ['topics', 'topic', 'topic cluster'])),
    pathways: uniqueList(firstValue(row, ['pathways', 'pathway'])),
    mechanisms: uniqueList(firstValue(row, ['mechanisms', 'mechanism'])),
    effects: uniqueList(firstValue(row, ['effects', 'primary effects', 'primary_effects'])),
    evidence_tier: clean(firstValue(row, ['evidence tier', 'evidence_tier', 'evidence grade'])),
    authority_score: clean(firstValue(row, ['authority score', 'authority_score', 'score'])),
    summary: compactText(firstValue(row, ['summary', 'semantic summary', 'graph summary'])),
    retrieval_summary: compactText(firstValue(row, [
      'retrieval summary',
      'semantic summary',
      'graph context summary',
      'summary',
    ])),
  })
}

function normalizeRelationship(row) {
  const source = slug(firstValue(row, ['source', 'source slug', 'source_slug', 'from', 'from slug']))
  const target = slug(firstValue(row, ['target', 'target slug', 'target_slug', 'to', 'to slug']))
  const relationshipType = lower(firstValue(row, [
    'relationship',
    'relationship type',
    'edge type',
    'type',
  ]))

  if (!source || !target) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id', 'edge id']) || `${source}-${relationshipType || 'related'}-${target}`),
    source,
    target,
    type: relationshipType || 'related',
    weight: clean(firstValue(row, ['weight', 'score', 'strength'])),
    rationale: compactText(firstValue(row, ['rationale', 'reason', 'why', 'overlap rationale'])),
    evidence_context: compactText(firstValue(row, [
      'evidence context',
      'evidence_context',
      'evidence',
    ])),
    pathways: uniqueList(firstValue(row, ['pathways', 'pathway overlap', 'pathway_overlap'])),
    mechanisms: uniqueList(firstValue(row, ['mechanisms', 'mechanism overlap', 'mechanism_overlap'])),
    topics: uniqueList(firstValue(row, ['topics', 'topic overlap', 'topic_overlap'])),
  })
}

function normalizeEcosystem(row, kind) {
  const name = clean(firstValue(row, ['name', 'topic', 'pathway', 'ecosystem', 'title']))
  const id = slug(firstValue(row, ['id', `${kind} id`, `${kind}_id`, 'slug']) || name)
  if (!id && !name) return null

  return removeEmptyInternalFields({
    id: id || slug(name),
    slug: slug(firstValue(row, ['slug']) || name || id),
    name,
    kind,
    summary: compactText(firstValue(row, ['summary', 'ecosystem summary', 'semantic summary'])),
    retrieval_summary: compactText(firstValue(row, [
      'retrieval summary',
      'ecosystem summary',
      'semantic summary',
      'summary',
    ])),
    anchors: uniqueList(firstValue(row, ['anchors', 'anchor profiles', 'authority anchors'])).map(slug),
    herbs: uniqueList(firstValue(row, ['herbs', 'related herbs'])).map(slug),
    compounds: uniqueList(firstValue(row, ['compounds', 'related compounds'])).map(slug),
    mechanisms: uniqueList(firstValue(row, ['mechanisms', 'mechanism themes'])),
    pathways: uniqueList(firstValue(row, ['pathways', 'pathway themes'])),
    topics: uniqueList(firstValue(row, ['topics', 'topic themes'])),
  })
}

function normalizeComparison(row) {
  const source = slug(firstValue(row, ['source', 'source slug', 'profile a', 'a']))
  const target = slug(firstValue(row, ['target', 'target slug', 'profile b', 'b']))
  if (!source || !target) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id']) || `${source}-vs-${target}`),
    source,
    target,
    rationale: compactText(firstValue(row, ['rationale', 'overlap rationale', 'why compare'])),
    evidence_context: compactText(firstValue(row, ['evidence context', 'evidence_context', 'evidence framing'])),
    mechanism_overlap: uniqueList(firstValue(row, ['mechanism overlap', 'mechanism_overlap', 'mechanisms'])),
    pathway_overlap: uniqueList(firstValue(row, ['pathway overlap', 'pathway_overlap', 'pathways'])),
    topic_overlap: uniqueList(firstValue(row, ['topic overlap', 'topic_overlap', 'topics'])),
  })
}

function normalizeStack(row) {
  const source = slug(firstValue(row, ['source', 'source slug', 'anchor', 'profile']))
  const target = slug(firstValue(row, ['target', 'target slug', 'companion', 'candidate']))
  if (!source || !target) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id']) || `${source}-stack-${target}`),
    source,
    target,
    rationale: compactText(firstValue(row, ['rationale', 'why', 'stack rationale'])),
    framing: compactText(firstValue(row, ['framing', 'evidence framing', 'exploratory framing'])),
    mechanism_complementarity: uniqueList(firstValue(row, [
      'mechanism complementarity',
      'mechanism_complementarity',
      'mechanisms',
    ])),
    pathway_complementarity: uniqueList(firstValue(row, [
      'pathway complementarity',
      'pathway_complementarity',
      'pathways',
    ])),
  })
}

function normalizeSupernode(row) {
  const name = clean(firstValue(row, ['name', 'supernode', 'anchor', 'title']))
  const id = slug(firstValue(row, ['id', 'slug']) || name)
  if (!id && !name) return null

  return removeEmptyInternalFields({
    id: id || slug(name),
    slug: slug(firstValue(row, ['slug']) || name || id),
    name,
    summary: compactText(firstValue(row, ['summary', 'authority summary', 'semantic summary'])),
    retrieval_summary: compactText(firstValue(row, [
      'retrieval summary',
      'authority summary',
      'semantic summary',
      'summary',
    ])),
    anchors: uniqueList(firstValue(row, ['anchors', 'profiles', 'members'])).map(slug),
    topics: uniqueList(firstValue(row, ['topics', 'topic ecosystems'])),
    pathways: uniqueList(firstValue(row, ['pathways', 'pathway ecosystems'])),
    mechanisms: uniqueList(firstValue(row, ['mechanisms'])),
  })
}

function normalizeSparseRecovery(row) {
  const source = slug(firstValue(row, ['source', 'slug', 'profile', 'entity']))
  if (!source) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id']) || source),
    source,
    recovery_type: lower(firstValue(row, ['recovery type', 'recovery_type', 'type'])),
    recommendations: uniqueList(firstValue(row, ['recommendations', 'candidates', 'related'])).map(slug),
    rationale: compactText(firstValue(row, ['rationale', 'reason', 'notes'])),
  })
}

function sortById(a, b) {
  return clean(a.id || a.slug || a.name).localeCompare(clean(b.id || b.slug || b.name))
}

function normalizeGraphRows(rows, normalizer) {
  const seen = new Set()
  if (!Array.isArray(rows)) return []

  return rows
    .map((row) => {
      try {
        if (!row || typeof row !== 'object') return null
        return normalizer(row)
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .filter((row) => {
      const key = clean(row.id || row.slug || `${row.source}-${row.target}`)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort(sortById)
}

function loadWorkbookGraphSheets(workbook) {
  return {
    nodes: normalizeGraphRows(readGraph(workbook, GRAPH_SHEETS.nodes), normalizeGraphNode),
    relationships: normalizeGraphRows(
      readGraph(workbook, GRAPH_SHEETS.relationships),
      normalizeRelationship
    ),
    topics: normalizeGraphRows(
      readGraph(workbook, GRAPH_SHEETS.topics),
      (row) => normalizeEcosystem(row, 'topic')
    ),
    pathways: normalizeGraphRows(
      readGraph(workbook, GRAPH_SHEETS.pathways),
      (row) => normalizeEcosystem(row, 'pathway')
    ),
    comparisons: normalizeGraphRows(
      readGraph(workbook, GRAPH_SHEETS.comparisons),
      normalizeComparison
    ),
    stacks: normalizeGraphRows(readGraph(workbook, GRAPH_SHEETS.stacks), normalizeStack),
    supernodes: normalizeGraphRows(
      readGraph(workbook, GRAPH_SHEETS.supernodes),
      normalizeSupernode
    ),
    sparseRecovery: normalizeGraphRows(
      readGraph(workbook, GRAPH_SHEETS.sparseRecovery),
      normalizeSparseRecovery
    ),
  }
}

function logWorkbookGraphSheetCounts(graph) {
  console.log(`[data] graph nodes loaded: ${graph.nodes.length}`)
  console.log(`[data] graph relationships loaded: ${graph.relationships.length}`)
  console.log(`[data] graph topics loaded: ${graph.topics.length}`)
  console.log(`[data] graph pathways loaded: ${graph.pathways.length}`)
  console.log(`[data] graph comparisons loaded: ${graph.comparisons.length}`)
  console.log(`[data] graph stacks loaded: ${graph.stacks.length}`)
  console.log(`[data] graph supernodes loaded: ${graph.supernodes.length}`)
  console.log(`[data] graph sparse recovery loaded: ${graph.sparseRecovery.length}`)
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

  if (!fs.existsSync(workbookPath)) {
    throw new Error(`[data] workbook missing: ${workbookPath}`)
  }

  console.log(`[data] workbook loaded: ${path.basename(workbookPath)}`)

  const wb = XLSX.readFile(workbookPath)

  validateWorkbookSheets(wb)

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

  const graph = loadWorkbookGraphSheets(wb)
  logWorkbookGraphSheetCounts(graph)

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
  console.log('[data] workbook graph sheets loaded without runtime export')
}

main()
