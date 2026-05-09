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

function writeCompactJson(filePath, data) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, JSON.stringify(data))
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
  const entries = Object.entries(record)
    .filter(([key]) => !key.startsWith('__'))
    .map(([key, value]) => [key, sanitizeGraphValue(value)])
    .filter(([, value]) => {
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

  return Object.fromEntries(entries)
}

function sanitizeGraphValue(value) {
  if (Array.isArray(value)) {
    return value
      .map(sanitizeGraphValue)
      .filter((item) => item != null && item !== '')
      .filter((item) => !Array.isArray(item) || item.length > 0)
      .filter((item) => typeof item !== 'object' || Array.isArray(item) || Object.keys(item).length > 0)
  }

  if (value && typeof value === 'object') {
    return removeEmptyInternalFields(value)
  }

  return value
}

function graphNumber(value) {
  const text = clean(value)
  if (!text) return null
  const number = Number(text)
  return Number.isFinite(number) ? number : null
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
  const type = lower(firstValue(row, ['type', 'node type', 'entity type', 'profile type', 'profile_type']))
  const id = slug(firstValue(row, ['id', 'node id', 'key', 'slug']) || name)
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
    topics: uniqueList(firstValue(row, ['topics', 'topic', 'topic cluster', 'topic ecosystems', 'topic_ecosystems'])),
    pathways: uniqueList(firstValue(row, ['pathways', 'pathway', 'canonical pathways', 'canonical_pathways'])),
    mechanisms: uniqueList(firstValue(row, ['mechanisms', 'mechanism', 'canonical mechanisms', 'canonical_mechanisms'])),
    effects: uniqueList(firstValue(row, ['effects', 'primary effects', 'primary_effects'])),
    evidence_tier: clean(firstValue(row, ['evidence tier', 'evidence_tier', 'evidence grade'])),
    graph_score: graphNumber(firstValue(row, ['graph score', 'graph_score'])),
    relationship_density: graphNumber(firstValue(row, ['relationship density', 'relationship_density'])),
    centrality_score: graphNumber(firstValue(row, ['centrality score', 'centrality_score'])),
    authority_role: clean(firstValue(row, ['authority role', 'authority_role'])),
    sparse_profile: lower(firstValue(row, ['sparse profile', 'sparse_profile'])),
    safety_flags: uniqueList(firstValue(row, ['safety flags', 'safety_flags'])),
    summary: compactText(firstValue(row, ['summary', 'semantic summary', 'graph summary', 'ecosystem aware frame', 'ecosystem_aware_frame'])),
    retrieval_summary: compactText(firstValue(row, [
      'retrieval summary',
      'semantic summary',
      'graph context summary',
      'ecosystem aware frame',
      'ecosystem_aware_frame',
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
    'relationship_type',
    'edge type',
    'type',
  ]))

  if (!source || !target) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id', 'edge id']) || `${source}-${relationshipType || 'related'}-${target}`),
    source,
    target,
    type: relationshipType || 'related',
    weight: graphNumber(firstValue(row, ['weight', 'score', 'strength', 'overlap score', 'overlap_score'])),
    rationale: compactText(firstValue(row, ['rationale', 'reason', 'why', 'overlap rationale'])),
    evidence_context: compactText(firstValue(row, [
      'evidence context',
      'evidence_context',
      'evidence',
    ])),
    pathways: uniqueList(firstValue(row, ['pathways', 'shared pathways', 'shared_pathways', 'pathway overlap', 'pathway_overlap'])),
    mechanisms: uniqueList(firstValue(row, ['mechanisms', 'shared mechanisms', 'shared_mechanisms', 'mechanism overlap', 'mechanism_overlap'])),
    topics: uniqueList(firstValue(row, ['topics', 'shared topics', 'shared_topics', 'topic overlap', 'topic_overlap'])),
  })
}

function normalizeEcosystem(row, kind) {
  const name = clean(firstValue(row, ['name', 'topic', 'topic ecosystem', 'topic_ecosystem', 'pathway', 'ecosystem', 'title']))
  const id = slug(firstValue(row, ['id', `${kind} id`, `${kind}_id`, 'slug']) || name)
  if (!id && !name) return null

  return removeEmptyInternalFields({
    id: id || slug(name),
    slug: slug(firstValue(row, ['slug']) || name || id),
    name,
    kind,
    summary: compactText(firstValue(row, ['summary', 'ecosystem summary', 'semantic summary', 'ecosystem notes', 'ecosystem_notes', 'evidence context'])),
    retrieval_summary: compactText(firstValue(row, [
      'retrieval summary',
      'ecosystem summary',
      'semantic summary',
      'evidence framing',
      'evidence clusters',
      'strongest evidence supported relationships',
      'summary',
    ])),
    anchors: uniqueList(firstValue(row, ['anchors', 'anchor profiles', 'authority anchors', 'representative hubs', 'relationship hubs', 'relationship_hubs'])).map(slug),
    herbs: uniqueList(firstValue(row, ['herbs', 'related herbs', 'top herbs', 'top_herbs'])).map(slug),
    compounds: uniqueList(firstValue(row, ['compounds', 'related compounds', 'top compounds', 'top_compounds'])).map(slug),
    mechanisms: uniqueList(firstValue(row, ['mechanisms', 'mechanism themes', 'core mechanisms', 'core_mechanisms', 'overlapping mechanisms', 'overlapping_mechanisms', 'mechanism overlap'])),
    pathways: uniqueList(firstValue(row, ['pathways', 'pathway themes', 'core pathways', 'core_pathways'])),
    topics: uniqueList(firstValue(row, ['topics', 'topic themes', 'related topics', 'related_topics'])),
    companions: uniqueList(firstValue(row, ['pathway companions', 'pathway_companions'])).map(slug),
    related_pathways: uniqueList(firstValue(row, ['related pathways', 'related_pathways'])),
  })
}

function normalizeComparison(row) {
  const source = slug(firstValue(row, ['source', 'source slug', 'profile a slug', 'profile_a_slug', 'profile a', 'profile_a', 'entity a', 'entity_a', 'a']))
  const target = slug(firstValue(row, ['target', 'target slug', 'profile b slug', 'profile_b_slug', 'profile b', 'profile_b', 'entity b', 'entity_b', 'b']))
  if (!source || !target) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id']) || `${source}-vs-${target}`),
    source,
    target,
    rationale: compactText(firstValue(row, ['rationale', 'comparison rationale', 'comparison_rationale', 'overlap rationale', 'why compare'])),
    evidence_context: compactText(firstValue(row, ['evidence context', 'evidence_context', 'evidence framing', 'evidence relationship', 'evidence_relationship', 'evidence restraint', 'evidence_restraint'])),
    mechanism_overlap: uniqueList(firstValue(row, ['mechanism overlap', 'mechanism_overlap', 'mechanism similarity', 'mechanism_similarity', 'mechanisms'])),
    pathway_overlap: uniqueList(firstValue(row, ['pathway overlap', 'pathway_overlap', 'pathways'])),
    topic_overlap: uniqueList(firstValue(row, ['topic overlap', 'topic_overlap', 'overlap context', 'overlap_context', 'comparison basis', 'comparison_basis', 'topics'])),
    type: clean(firstValue(row, ['type', 'comparison type', 'comparison_type', 'candidate type', 'candidate_type'])),
    claim_restraint: compactText(firstValue(row, ['claim restraint', 'claim_restraint'])),
    priority: lower(firstValue(row, ['priority'])),
  })
}

function normalizeStack(row) {
  const source = slug(firstValue(row, ['source', 'source slug', 'profile a slug', 'profile_a_slug', 'profile a', 'profile_a', 'anchor', 'profile']))
  const target = slug(firstValue(row, ['target', 'target slug', 'profile b slug', 'profile_b_slug', 'profile b', 'profile_b', 'companion', 'candidate']))
  if (!source || !target) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id']) || `${source}-stack-${target}`),
    source,
    target,
    rationale: compactText(firstValue(row, ['rationale', 'why', 'stack rationale'])),
    framing: compactText(firstValue(row, ['framing', 'evidence framing', 'exploratory framing', 'stack context', 'stack_context'])),
    safety_gate: compactText(firstValue(row, ['safety gate', 'safety_gate'])),
    mechanism_complementarity: uniqueList(firstValue(row, [
      'mechanism complementarity',
      'mechanism_complementarity',
      'complementary mechanisms',
      'complementary_mechanisms',
      'mechanisms',
    ])),
    pathway_complementarity: uniqueList(firstValue(row, [
      'pathway complementarity',
      'pathway_complementarity',
      'pathway context',
      'pathway_context',
      'pathways',
    ])),
  })
}

function normalizeSupernode(row) {
  const name = clean(firstValue(row, ['name', 'supernode', 'anchor', 'title', 'profile']))
  const id = slug(firstValue(row, ['id', 'slug']) || name)
  if (!id && !name) return null

  return removeEmptyInternalFields({
    id: id || slug(name),
    slug: slug(firstValue(row, ['slug']) || name || id),
    name,
    type: clean(firstValue(row, ['supernode type', 'supernode_type', 'type'])),
    profile_type: lower(firstValue(row, ['profile type', 'profile_type'])),
    graph_score: graphNumber(firstValue(row, ['graph score', 'graph_score'])),
    relationship_density: graphNumber(firstValue(row, ['relationship density', 'relationship_density'])),
    summary: compactText(firstValue(row, ['summary', 'authority summary', 'semantic summary', 'authority notes', 'authority_notes'])),
    retrieval_summary: compactText(firstValue(row, [
      'retrieval summary',
      'authority summary',
      'semantic summary',
      'authority notes',
      'authority_notes',
      'summary',
    ])),
    anchors: uniqueList(firstValue(row, ['anchors', 'profiles', 'members'])).map(slug),
    topics: uniqueList(firstValue(row, ['topics', 'topic ecosystems', 'primary ecosystems', 'primary_ecosystems'])),
    pathways: uniqueList(firstValue(row, ['pathways', 'pathway ecosystems', 'primary pathways', 'primary_pathways'])),
    mechanisms: uniqueList(firstValue(row, ['mechanisms'])),
  })
}

function normalizeSparseRecovery(row) {
  const source = slug(firstValue(row, ['source', 'slug', 'profile', 'entity']))
  if (!source) return null

  return removeEmptyInternalFields({
    id: slug(firstValue(row, ['id']) || source),
    source,
    profile_type: lower(firstValue(row, ['profile type', 'profile_type'])),
    topics: uniqueList(firstValue(row, ['ecosystem placement', 'ecosystem_placement'])),
    mechanisms: uniqueList(firstValue(row, ['strongest mechanistic signal', 'strongest_mechanistic_signal'])),
    pathways: uniqueList(firstValue(row, ['strongest pathway context', 'strongest_pathway_context'])),
    recommendations: uniqueList(firstValue(row, ['relationship targets', 'relationship_targets', 'recommendations', 'candidates', 'related'])).map(slug),
    rationale: compactText(firstValue(row, ['exploratory research frame', 'exploratory_research_frame', 'rationale', 'reason', 'notes'])),
    sparse_reason: compactText(firstValue(row, ['sparse reason', 'sparse_reason'])),
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

function mergeSparseRecoveryIntoNodes(nodes, sparseRecovery) {
  const sparseBySlug = new Map(sparseRecovery.map((row) => [row.source, row]))
  const merged = nodes.map((node) => {
    const recovery = sparseBySlug.get(node.slug || node.id)
    if (!recovery) return node

    sparseBySlug.delete(node.slug || node.id)
    return removeEmptyInternalFields({
      ...node,
      sparse_recovery: {
        topics: recovery.topics,
        mechanisms: recovery.mechanisms,
        pathways: recovery.pathways,
        recommendations: recovery.recommendations,
        rationale: recovery.rationale,
        sparse_reason: recovery.sparse_reason,
      },
    })
  })

  for (const recovery of sparseBySlug.values()) {
    merged.push(removeEmptyInternalFields({
      id: recovery.source,
      slug: recovery.source,
      type: recovery.profile_type,
      sparse_profile: 'yes',
      sparse_recovery: {
        topics: recovery.topics,
        mechanisms: recovery.mechanisms,
        pathways: recovery.pathways,
        recommendations: recovery.recommendations,
        rationale: recovery.rationale,
        sparse_reason: recovery.sparse_reason,
      },
    }))
  }

  return merged.sort(sortById)
}


const SEMANTIC_RELATED_LIMIT = 12
const SEMANTIC_COMPARISON_LIMIT = 8
const SEMANTIC_STACK_LIMIT = 6

function nodeIdentity(node) {
  return slug(node?.slug || node?.id || node?.name)
}

function sharedGraphItems(a, b) {
  const left = new Set(splitList(a).map(slug).filter(Boolean))
  if (!left.size) return []

  return uniqueList(b).filter((value) => left.has(slug(value)))
}

function semanticScore(candidate) {
  const weight = Number(candidate.weight || 0)
  const mechanisms = splitList(candidate.mechanism_overlap || candidate.mechanism_complementarity || candidate.mechanisms).length
  const pathways = splitList(candidate.pathway_overlap || candidate.pathway_complementarity || candidate.pathways).length
  const topics = splitList(candidate.topic_overlap || candidate.topics).length

  return (Number.isFinite(weight) ? weight : 0) + mechanisms * 3 + pathways * 2 + topics
}

function semanticSort(a, b) {
  const scoreDelta = semanticScore(b) - semanticScore(a)
  if (scoreDelta !== 0) return scoreDelta
  return clean(a.id || `${a.source}-${a.target}`).localeCompare(clean(b.id || `${b.source}-${b.target}`))
}

function semanticBaseCandidates(nodes, source) {
  const sourceSlug = nodeIdentity(source)
  if (!sourceSlug) return []

  return nodes
    .filter((candidate) => nodeIdentity(candidate) && nodeIdentity(candidate) !== sourceSlug)
    .map((candidate) => {
      const targetSlug = nodeIdentity(candidate)
      const mechanisms = sharedGraphItems(source.mechanisms, candidate.mechanisms)
      const pathways = sharedGraphItems(source.pathways, candidate.pathways)
      const topics = sharedGraphItems(source.topics, candidate.topics)

      return {
        source: sourceSlug,
        target: targetSlug,
        mechanisms,
        pathways,
        topics,
        relatedWeight: mechanisms.length * 3 + pathways.length * 2 + topics.length,
        comparisonWeight: mechanisms.length * 3 + pathways.length * 2 + topics.length,
        stackWeight: mechanisms.length * 2 + pathways.length * 2 + topics.length,
      }
    })
}

function buildPrecomputedSemanticCandidates(nodes) {
  const rows = []
  const mergedNodes = Array.isArray(nodes) ? nodes : []

  for (const node of mergedNodes) {
    const sourceSlug = nodeIdentity(node)
    if (!sourceSlug) continue

    const base = semanticBaseCandidates(mergedNodes, node)

    rows.push(
      ...base
        .filter((candidate) => candidate.mechanisms.length > 0 || candidate.pathways.length > 0 || candidate.topics.length >= 2)
        .map((candidate) => removeEmptyInternalFields({
          id: `${sourceSlug}-semantic-${candidate.target}`,
          source: sourceSlug,
          target: candidate.target,
          type: 'semantic-overlap',
          weight: candidate.relatedWeight,
          rationale: 'Related by shared mechanisms, pathways, or topic ecosystem context.',
          evidence_context: 'Precomputed semantic graph context; use profile evidence and safety notes for interpretation.',
          mechanisms: candidate.mechanisms,
          pathways: candidate.pathways,
          topics: candidate.topics,
        }))
        .sort(semanticSort)
        .slice(0, SEMANTIC_RELATED_LIMIT),
      ...base
        .filter((candidate) => candidate.mechanisms.length > 0 || candidate.pathways.length > 0 || candidate.topics.length >= 2)
        .map((candidate) => removeEmptyInternalFields({
          id: `${sourceSlug}-compare-${candidate.target}`,
          source: sourceSlug,
          target: candidate.target,
          type: 'semantic-comparison',
          weight: candidate.comparisonWeight,
          rationale: 'Semantic comparison candidate based on shared mechanisms, pathways, or ecosystem context; not an efficacy or superiority claim.',
          evidence_context: 'Evidence context should be read from each profile before interpretation.',
          mechanism_overlap: candidate.mechanisms,
          pathway_overlap: candidate.pathways,
          topic_overlap: candidate.topics,
          ecosystem_overlap: candidate.topics,
        }))
        .sort(semanticSort)
        .slice(0, SEMANTIC_COMPARISON_LIMIT),
      ...base
        .filter((candidate) => {
          const mechanismCount = candidate.mechanisms.length
          const pathwayCount = candidate.pathways.length
          const topicCount = candidate.topics.length
          return mechanismCount >= 2 || pathwayCount >= 2 || (mechanismCount + pathwayCount >= 2 && topicCount > 0)
        })
        .map((candidate) => removeEmptyInternalFields({
          id: `${sourceSlug}-stack-${candidate.target}`,
          source: sourceSlug,
          target: candidate.target,
          type: 'biological-adjacency',
          weight: candidate.stackWeight,
          rationale: 'Biologically adjacent research candidate; use only as exploratory education context, not stack advice.',
          framing: candidate.topics.join('; '),
          evidence_context: 'Exploratory graph context; review profile-specific evidence and safety notes.',
          mechanism_complementarity: candidate.mechanisms,
          pathway_complementarity: candidate.pathways,
          topic_overlap: candidate.topics,
          ecosystem_overlap: candidate.topics,
          safety_gate: 'review safety context before combining',
        }))
        .sort(semanticSort)
        .slice(0, SEMANTIC_STACK_LIMIT)
    )
  }

  return normalizeGraphRows(rows, (row) => row)
}

function writeWorkbookGraphPayloads(outDir, graph) {
  const graphDir = path.join(outDir, 'graph')
  const nodes = mergeSparseRecoveryIntoNodes(graph.nodes, graph.sparseRecovery)
  const payloads = {
    'nodes.json': nodes,
    'relationships.json': graph.relationships,
    'topics.json': graph.topics,
    'pathways.json': graph.pathways,
    'comparisons.json': graph.comparisons,
    'stacks.json': graph.stacks,
    'supernodes.json': graph.supernodes,
    'semantic.json': buildPrecomputedSemanticCandidates(nodes),
  }

  for (const [filename, payload] of Object.entries(payloads)) {
    writeCompactJson(path.join(graphDir, filename), payload)
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
  writeWorkbookGraphPayloads(outDir, graph)

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
  console.log('[data] workbook graph runtime exports written')
}

main()
