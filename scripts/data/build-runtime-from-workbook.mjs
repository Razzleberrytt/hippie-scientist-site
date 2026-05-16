#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getSheet,
  getSheetNames,
  readWorkbook,
  sheetToRows,
} from './workbook-parser.mjs'
import { assertWorkbookExists, resolveWorkbookPath } from '../workbook-source.mjs'
import { HERB_RUNTIME_FIELDS } from '../../config/runtime-herb-fields.mjs'
import { COMPOUND_RUNTIME_FIELDS } from '../../config/runtime-compound-fields.mjs'
import { scoreIndexability } from './indexability-policy.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const SHEETS = {
  herbs: ['Herb Master V3', 'Herb Monographs', 'Site Export Herbs'],
  compounds: ['Compound Master V3', 'Site Export Compounds'],
  map: ['Herb Compound Map V3'],
  claims: ['Study Registry'],
}

const GRAPH_SHEETS = {
  topics: ['Topic Ecosystems'],
  pathways: ['Pathway Ecosystems'],
  supernodes: ['Authority Supernodes'],
  relationships: ['Relationship Edges'],
  comparisons: ['Comparison Candidates'],
  stacks: ['Stack Synergy'],
  sparseRecovery: ['Sparse Recovery'],
  nodes: ['KG Nodes'],
}

const INDEX_FIELDS = [
  'slug', 'name', 'summary', 'primary_effects', 'effects', 'evidence_grade',
  'evidence_tier', 'profile_status', 'runtime_export_decision',
  'affiliate_ready', 'visibility_tier', 'robots', 'sitemap_included',
  'indexability_status', 'indexability_score', 'indexability_reasons',
]

function clean(v) {
  if (v === null || v === undefined) return ''
  return String(v).replace(/\s+/g, ' ').trim()
}

function lower(v) { return clean(v).toLowerCase() }

function slug(v) {
  return clean(v)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function splitList(v) {
  if (Array.isArray(v)) return v.flatMap(splitList)
  return clean(v).split(/[\n|;,]+/).map((s) => clean(s).replace(/^[-*•]\s*/, '')).filter(Boolean)
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

function bool(v) {
  if (typeof v === 'boolean') return v
  return ['true', 'yes', 'y', '1', 'ready', 'live', 'approved'].includes(lower(v))
}

function num(v) {
  const n = Number(clean(v))
  return Number.isFinite(n) ? n : null
}

function normKey(v) { return lower(v).replace(/[^a-z0-9]+/g, ' ').trim() }

function first(row, fields) {
  for (const f of fields) if (clean(row?.[f])) return row[f]
  const wanted = fields.map(normKey)
  for (const [k, v] of Object.entries(row || {})) if (wanted.includes(normKey(k)) && clean(v)) return v
  return ''
}

function firstList(row, fields) {
  for (const f of fields) {
    const out = uniqueList(first(row, [f]))
    if (out.length) return out
  }
  return []
}

function compact(v, max = 420) {
  const s = clean(v)
  return s.length <= max ? s : `${s.slice(0, max - 1).trim()}…`
}

function stripEmpty(value) {
  if (Array.isArray(value)) return value.map(stripEmpty).filter((x) => x !== '' && x !== null && x !== undefined && (!Array.isArray(x) || x.length) && (typeof x !== 'object' || Array.isArray(x) || Object.keys(x).length))
  if (value && typeof value === 'object') return stripRecord(value)
  return value
}

function stripRecord(record) {
  return Object.fromEntries(Object.entries(record || {})
    .filter(([k]) => !k.startsWith('__'))
    .map(([k, v]) => [k, stripEmpty(v)])
    .filter(([, v]) => v !== '' && v !== null && v !== undefined && (!Array.isArray(v) || v.length) && (typeof v !== 'object' || Array.isArray(v) || Object.keys(v).length)))
}

function pick(record, fields) {
  const allowed = new Set(fields)
  return stripRecord(Object.fromEntries(Object.entries(record || {}).filter(([k]) => allowed.has(k))))
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }) }
function writeJson(file, data) { ensureDir(path.dirname(file)); fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8') }

function resolveSheet(wb, names) {
  return names.find((n) => getSheet(wb, n)) || null
}

function resolveVersionedSheet(wb, names) {
  const sheetNames = getSheetNames(wb)
  const matches = []
  for (const name of names) {
    const exact = sheetNames.find((s) => lower(s) === lower(name))
    if (exact) matches.push({ name: exact, v: 0 })
    const prefix = `${lower(name)} v`
    for (const s of sheetNames) if (lower(s).startsWith(prefix)) matches.push({ name: s, v: Number.parseInt(lower(s).slice(prefix.length), 10) || 0 })
  }
  matches.sort((a, b) => b.v - a.v || a.name.localeCompare(b.name))
  return matches[0]?.name || null
}

function read(wb, names, versioned = false) {
  const name = versioned ? resolveVersionedSheet(wb, names) : resolveSheet(wb, names)
  if (!name) return []
  try {
    console.log(`[data] sheet loaded: ${name}`)
    return sheetToRows(getSheet(wb, name))
  } catch (e) {
    console.warn(`[data] sheet skipped: ${name} (${e.message})`)
    return []
  }
}

function visibility(record, type) {
  const indexability = scoreIndexability(record, { type })
  const decision = lower(record.runtime_export_decision)
  const visibility_tier =
    indexability.status === 'PUBLISH'
      ? (lower(record.profile_status) === 'complete' && lower(record.summary_quality) === 'strong' ? 'full_publish' : 'limited')
      : indexability.status === 'BLOCKED' && decision === 'hide'
        ? 'hidden'
        : 'noindex'

  return {
    visibility_tier,
    robots: indexability.robots,
    sitemap_included: indexability.sitemap_included,
    indexability_status: indexability.status,
    indexability_score: indexability.score,
    indexability_reasons: indexability.reasons,
  }
}

function affiliate(record) {
  const q = clean(record.affiliate_query) || clean(record.name)
  return stripRecord({
    ...record,
    affiliate_query: q,
    affiliate_ready: bool(record.affiliate_ready) || Boolean(q),
    default_product_type: clean(record.default_product_type) || 'capsules',
    buying_criteria: uniqueList(record.buying_criteria).length ? uniqueList(record.buying_criteria) : ['third-party tested', 'standardized extract', 'minimal fillers', 'transparent labeling'],
    available_forms: uniqueList(record.available_forms).length ? uniqueList(record.available_forms) : ['capsules', 'powder', 'extract'],
    amazon_affiliate_url: clean(record.amazon_affiliate_url) || `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    iherb_affiliate_url: clean(record.iherb_affiliate_url) || `https://www.iherb.com/search?kw=${encodeURIComponent(q)}`,
  })
}

function semantic(row, type) {
  return stripRecord({
    topic_clusters: firstList(row, ['topic_clusters', 'topic clusters', 'ecosystem_tags', 'ecosystem tags']),
    ecosystem_tags: firstList(row, ['ecosystem_tags', 'ecosystem tags', 'topic ecosystems', 'topic_ecosystems']),
    pathway_companions: firstList(row, ['pathway_companions', 'pathway companions']),
    comparison_candidates: firstList(row, ['comparison_candidates', 'comparison candidates']),
    synergy_relationships: firstList(row, ['synergy_relationships', 'synergy relationships', 'stack candidates']),
    authority_supernode: clean(first(row, ['authority_supernode', 'authority supernode', 'supernode'])),
    semantic_neighbors: firstList(row, ['semantic_neighbors', 'semantic neighbors', 'related profiles']),
    ecosystem_anchors: firstList(row, ['ecosystem_anchors', 'ecosystem anchors', 'anchors']),
    related_topics: firstList(row, ['related_topics', 'related topics', 'conditions', 'primary_effects', 'effects']),
    pathway_ecosystems: firstList(row, ['pathway_ecosystems', 'pathway ecosystems', 'pathways_v2', 'pathways']),
    mechanism_ecosystems: firstList(row, ['mechanism_ecosystems', 'mechanism ecosystems', 'mechanism_targets', 'mechanisms', 'mechanism']),
    authority_score: clean(first(row, ['authority_score', 'authority score'])),
    evidence_authority_status: clean(first(row, ['evidence_authority_status', 'evidence authority status'])),
    authority_status: clean(first(row, ['authority_status', 'authority status'])),
    clusters: firstList(row, ['clusters', 'cluster']),
    semantic_ready: clean(first(row, ['semantic_ready', 'semantic ready'])),
    ...(type === 'herb'
      ? { herb_internal_link_cluster: firstList(row, ['herb_internal_link_cluster', 'internal_link_cluster', 'internal link cluster']) }
      : {
          compound_cluster: clean(first(row, ['compound_cluster', 'compound cluster'])),
          comparison_group: clean(first(row, ['comparison_group', 'comparison group'])),
          comparison_priority: clean(first(row, ['comparison_priority', 'comparison priority'])),
          internal_link_cluster: firstList(row, ['internal_link_cluster', 'internal link cluster']),
          pathway_bucket: clean(first(row, ['pathway_bucket', 'pathway bucket'])),
          pathways_v2: firstList(row, ['pathways_v2', 'pathways v2']),
          pathway_weight: clean(first(row, ['pathway_weight', 'pathway weight'])),
        }),
  })
}

function profile(row, type) {
  const allowed = type === 'herb' ? HERB_RUNTIME_FIELDS : COMPOUND_RUNTIME_FIELDS
  const name = clean(first(row, ['name', type, 'title', 'common_name', 'common name']))
  const s = slug(first(row, ['slug', 'id', `${type}_slug`, `${type} slug`]) || name)
  if (!name || !s || name.length === 1 || s.length === 1) return null
  const effects = firstList(row, ['primary_effects', 'primary effects', 'effects'])
  const mechanisms = firstList(row, ['mechanisms', 'mechanism', 'mechanism_targets', 'mechanism targets'])
  const base = {
    ...pick(row, allowed), id: s, slug: s, name,
    summary: clean(first(row, ['summary', 'short_description', 'description', 'core_insight', 'card_blurb'])) || `Evidence-aware ${type} profile with mechanism, safety, and practical context.`,
    summary_quality: clean(first(row, ['summary_quality', 'summary quality'])),
    primary_effects: effects, effects,
    evidence_grade: clean(first(row, ['evidence_grade', 'evidence grade', 'evidence_tier', 'evidence tier', 'evidence_level'])),
    evidence_tier: clean(first(row, ['evidence_tier', 'evidence tier', 'evidence_grade', 'evidence grade'])),
    evidence_summary: clean(first(row, ['evidence_summary', 'evidence summary', 'human_evidence', 'human evidence'])),
    profile_status: clean(first(row, ['profile_status', 'profile status'])),
    runtime_export_decision: clean(first(row, ['runtime_export_decision', 'runtime export decision'])),
    mechanisms, mechanism: mechanisms.join(', '),
    mechanism_targets: firstList(row, ['mechanism_targets', 'mechanism targets']),
    pathways: firstList(row, ['pathways', 'pathway', 'pathways_v2']),
    related_compounds: firstList(row, ['related_compounds', 'related compounds']),
    related_herbs: firstList(row, ['related_herbs', 'related herbs']),
    safety: clean(first(row, ['safety', 'safety_notes', 'safety notes'])),
    contraindications: firstList(row, ['contraindications', 'avoid_if', 'avoid if']),
    interactions: firstList(row, ['interactions']),
    side_effects: firstList(row, ['side_effects', 'side effects']),
    dosage: clean(first(row, ['dosage', 'typical_dosage', 'typical dosage'])),
    typical_dosage: clean(first(row, ['typical_dosage', 'typical dosage', 'dosage'])),
    forms: firstList(row, ['forms', 'available_forms', 'available forms']),
    available_forms: firstList(row, ['available_forms', 'available forms', 'forms']),
    conditions: firstList(row, ['conditions', 'best_for', 'best for']),
    tags: firstList(row, ['tags']), keywords: firstList(row, ['keywords']),
    affiliate_ready: bool(first(row, ['affiliate_ready', 'affiliate ready'])),
    affiliate_query: clean(first(row, ['affiliate_query', 'affiliate query'])),
    default_product_type: clean(first(row, ['default_product_type', 'default product type'])),
    buying_criteria: firstList(row, ['buying_criteria', 'buying criteria']),
    amazon_affiliate_url: clean(first(row, ['amazon_affiliate_url', 'amazon affiliate url'])),
    iherb_affiliate_url: clean(first(row, ['iherb_affiliate_url', 'iherb affiliate url'])),
    meta_title: clean(first(row, ['meta_title', 'meta title'])),
    meta_description: clean(first(row, ['meta_description', 'meta description'])),
    ...semantic(row, type),
  }
  return pick(affiliate({ ...base, ...visibility(base, type) }), allowed)
}

function dedupe(rows) {
  const seen = new Set()
  return rows.filter(Boolean).filter((r) => {
    if (!r.slug || seen.has(r.slug)) return false
    seen.add(r.slug)
    return true
  }).sort((a, b) => clean(a.name).localeCompare(clean(b.name)) || clean(a.slug).localeCompare(clean(b.slug)))
}

function rowId(row, fallbackFields) { return slug(first(row, ['id', ...fallbackFields])) }

function mapRow(row) {
  const herb = first(row, ['herb', 'herb name', 'herb_name'])
  const compound = first(row, ['compound', 'compound name', 'compound_name'])
  const hs = slug(first(row, ['herb_slug', 'herb slug']) || herb)
  const cs = slug(first(row, ['compound_slug', 'compound slug']) || compound)
  if (!hs || !cs) return null
  return stripRecord({ id: `${hs}-${cs}`, herb_slug: hs, compound_slug: cs, herb: clean(herb), compound: clean(compound), relationship: clean(first(row, ['relationship', 'relationship_type', 'role'])), notes: compact(first(row, ['notes', 'summary', 'rationale'])) })
}

function claimRow(row) {
  const title = clean(first(row, ['title', 'study title', 'claim', 'summary']))
  const pmid = clean(first(row, ['pmid', 'PMID']))
  const id = rowId(row, ['claim_id', 'claim id']) || slug(pmid || title)
  if (!id && !title && !pmid) return null
  return stripRecord({ id: id || pmid, title, claim: compact(first(row, ['claim', 'finding', 'summary', 'conclusion'])), pmid, doi: clean(first(row, ['doi', 'DOI'])), source_url: clean(first(row, ['source_url', 'url', 'link'])), evidence_tier: clean(first(row, ['evidence_tier', 'study_type'])), profile_slug: slug(first(row, ['profile_slug', 'slug', 'herb_slug', 'compound_slug'])) })
}

function graphRow(row, kind) {
  const source = slug(first(row, ['source', 'source slug', 'from', 'profile a', 'anchor', 'profile']))
  const target = slug(first(row, ['target', 'target slug', 'to', 'profile b', 'companion', 'candidate']))
  const name = clean(first(row, ['name', kind, 'title', 'topic', 'pathway', 'supernode', 'label']))
  const id = slug(first(row, ['id', 'slug']) || (source && target ? `${source}-${kind}-${target}` : name))
  if (!id && !name && (!source || !target)) return null
  return stripRecord({
    id, slug: slug(first(row, ['slug']) || name || id), name, kind,
    source, target,
    type: clean(first(row, ['type', 'relationship', 'relationship type', `${kind} type`])) || kind,
    weight: num(first(row, ['weight', 'score', 'strength', 'graph score'])),
    summary: compact(first(row, ['summary', 'semantic summary', 'authority summary', 'ecosystem summary'])),
    retrieval_summary: compact(first(row, ['retrieval summary', 'semantic summary', 'summary'])),
    rationale: compact(first(row, ['rationale', 'reason', 'why'])),
    evidence_context: compact(first(row, ['evidence context', 'evidence_context', 'evidence framing'])),
    anchors: firstList(row, ['anchors', 'profiles', 'members']).map(slug),
    herbs: firstList(row, ['herbs', 'related herbs', 'top herbs']).map(slug),
    compounds: firstList(row, ['compounds', 'related compounds', 'top compounds']).map(slug),
    topics: firstList(row, ['topics', 'topic themes', 'topic overlap']),
    pathways: firstList(row, ['pathways', 'pathway themes', 'pathway overlap']),
    mechanisms: firstList(row, ['mechanisms', 'mechanism themes', 'mechanism overlap']),
    recommendations: firstList(row, ['recommendations', 'candidates', 'related', 'relationship targets']).map(slug),
  })
}

function normalizeRows(rows, fn) {
  const seen = new Set()
  return rows.map(fn).filter(Boolean).filter((r) => {
    const key = clean(r.id || r.slug || `${r.source}-${r.target}`)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  }).sort((a, b) => clean(a.id || a.slug || a.name).localeCompare(clean(b.id || b.slug || b.name)))
}

function details(dir, rows) {
  fs.rmSync(dir, { recursive: true, force: true })
  ensureDir(dir)
  for (const row of rows) writeJson(path.join(dir, `${row.slug}.json`), row)
}

function args() {
  const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : (process.argv.find((a) => a.startsWith('--out='))?.slice(6) || 'public/data')
  return path.resolve(repoRoot, out || 'public/data')
}

function main() {
  const outDir = args()
  const workbookPath = resolveWorkbookPath(repoRoot)
  assertWorkbookExists(workbookPath)

  // Workbook loading is intentionally routed through the parser adapter.
  // xlsx is allowed here only for trusted local Node build/data scripts; do
  // not use it for uploads, request bodies, browser input, or remote URLs.
  // Runtime spreadsheet parsing needs a reviewed safer boundary. This keeps
  // xlsx isolated so a future exceljs migration can swap parser internals
  // without rewriting normalization/export logic.
  const wb = readWorkbook(workbookPath)

  for (const required of ['Herb Master V3', 'Compound Master V3']) {
    if (!getSheet(wb, required)) {
      throw new Error(`[data] missing required sheet: ${required}`)
    }
  }

  ensureDir(outDir)

  const herbs = dedupe(read(wb, SHEETS.herbs).map((r) => profile(r, 'herb')))
  const compounds = dedupe(read(wb, SHEETS.compounds).map((r) => profile(r, 'compound')))
  const claims = normalizeRows(read(wb, SHEETS.claims), claimRow)
  const herbCompoundMap = normalizeRows(read(wb, SHEETS.map), mapRow)
  const graph = Object.fromEntries(Object.entries(GRAPH_SHEETS).map(([kind, names]) => [kind, normalizeRows(read(wb, names, true), (r) => graphRow(r, kind))]))

  writeJson(path.join(outDir, 'herbs.json'), herbs)
  writeJson(path.join(outDir, 'compounds.json'), compounds)
  writeJson(path.join(outDir, 'claims.json'), claims)
  writeJson(path.join(outDir, 'herb-compound-map.json'), herbCompoundMap)
  writeJson(path.join(outDir, 'herb-index.json'), herbs.map((r) => pick(r, INDEX_FIELDS)))
  writeJson(path.join(outDir, 'compound-index.json'), compounds.map((r) => pick(r, INDEX_FIELDS)))
  writeJson(path.join(outDir, 'topics.json'), graph.topics || [])
  writeJson(path.join(outDir, 'pathways.json'), graph.pathways || [])
  writeJson(path.join(outDir, 'supernodes.json'), graph.supernodes || [])
  writeJson(path.join(outDir, 'relationships.json'), graph.relationships || [])
  writeJson(path.join(outDir, 'comparison-candidates.json'), graph.comparisons || [])
  writeJson(path.join(outDir, 'stack-synergy.json'), graph.stacks || [])
  writeJson(path.join(outDir, 'sparse-recovery.json'), graph.sparseRecovery || [])
  writeJson(path.join(outDir, 'knowledge-graph.json'), graph)
  writeJson(path.join(outDir, 'agent-patches.json'), [])
  details(path.join(outDir, 'herb-detail'), herbs)
  details(path.join(outDir, 'compound-detail'), compounds)
  writeJson(path.join(outDir, 'build-report.json'), { generatedAt: new Date().toISOString(), workbook: path.basename(workbookPath), counts: { herbs: herbs.length, compounds: compounds.length, claims: claims.length, herbCompoundMap: herbCompoundMap.length, topics: (graph.topics || []).length, pathways: (graph.pathways || []).length, supernodes: (graph.supernodes || []).length } })
  console.log(`[data] wrote ${herbs.length} herbs, ${compounds.length} compounds, ${claims.length} claims`)
}

main()
