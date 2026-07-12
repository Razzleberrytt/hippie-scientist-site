// GPT patch normalization.
//
// Accepts patches produced by different GPTs in different arrangements
// (canonical JSON, loose JSON object/array, JSONL, YAML, CSV, Markdown tables,
// structured Markdown) and normalizes them to ONE canonical patch shape.
//
// This module NEVER applies anything. It normalizes and flags. Uncertain input
// is quarantined via `requires_review` and explicit warnings rather than
// guessed into structured operations.

import { parse as parseYaml } from 'yaml'
import { parse as parseCsv } from 'csv-parse/sync'
import matter from 'gray-matter'
import { contentHash } from './ids.mjs'
import { resolveFieldName, loadFieldAliases } from './field-aliases.mjs'
import { cleanString, splitList } from './normalize.mjs'
import { PATCH_OPERATIONS } from './schema.mjs'

const OP_SET = new Set(PATCH_OPERATIONS)
const FIXED_VERSION = '1'

// Canonical field names that belong to source/citation data — these are routed
// to source extraction, never turned into field-update operations.
const SOURCE_GROUP_CANONICALS = new Set(Object.keys(loadFieldAliases().groups.source_fields || {}))

// Build a case-insensitive key lookup for a loose object.
function lowerKeyed(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) out[k.toLowerCase()] = v
  return out
}

// ---- format detection ----

export function detectFormat(filename, raw) {
  const ext = (filename.split('.').pop() || '').toLowerCase()
  if (ext === 'json') return 'json'
  if (ext === 'jsonl' || ext === 'ndjson') return 'jsonl'
  if (ext === 'yaml' || ext === 'yml') return 'yaml'
  if (ext === 'csv') return 'csv'
  if (ext === 'md' || ext === 'markdown') return 'markdown'
  // Fall back to sniffing content.
  const trimmed = raw.trim()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return 'json'
  if (/^#|\|.*\|/m.test(trimmed)) return 'markdown'
  return 'yaml'
}

// ---- raw parsing per format → array of "loose objects" ----

function parseJsonish(raw) {
  const value = JSON.parse(raw)
  return Array.isArray(value) ? value : [value]
}

function parseJsonl(raw) {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l))
}

function parseYamlish(raw) {
  const value = parseYaml(raw)
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function parseCsvish(raw) {
  return parseCsv(raw, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true })
}

// Markdown: support (a) a frontmatter block with structured fields, (b) GFM
// tables (each row → a loose object), and (c) "## Section" headers mapping to
// fields. Returns { records, warnings }.
function parseMarkdownish(raw) {
  const warnings = []
  const { data: frontmatter, content } = matter(raw)
  const records = []
  const hasFrontmatter = frontmatter && Object.keys(frontmatter).length > 0

  // GFM tables → one record per row (frontmatter merged in as shared context).
  const tableRows = parseMarkdownTables(content)
  if (tableRows.length) {
    for (const row of tableRows) records.push(hasFrontmatter ? { ...frontmatter, ...row } : row)
  } else {
    // No table: merge frontmatter with any "## Section" fields into one record.
    const sections = parseMarkdownSections(content)
    const merged = { ...(hasFrontmatter ? frontmatter : {}), ...sections }
    if (Object.keys(merged).length) records.push(merged)
  }

  if (records.length === 0) warnings.push('markdown produced no recognizable records')
  return { records, warnings }
}

function parseMarkdownTables(md) {
  const rows = []
  const lines = md.split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (!/^\s*\|.*\|\s*$/.test(line)) continue
    const sep = lines[i + 1] || ''
    if (!/^\s*\|?[\s:-]*\|[\s:|:-]*$/.test(sep) || !sep.includes('-')) continue
    const headers = splitRow(line)
    let j = i + 2
    while (j < lines.length && /^\s*\|.*\|\s*$/.test(lines[j])) {
      const cells = splitRow(lines[j])
      const obj = {}
      headers.forEach((h, k) => { obj[h] = cells[k] ?? '' })
      rows.push(obj)
      j += 1
    }
    i = j
  }
  return rows
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => cleanString(c))
}

function parseMarkdownSections(md) {
  const out = {}
  const parts = md.split(/^#{1,6}\s+/m).filter(Boolean)
  for (const part of parts) {
    const [head, ...rest] = part.split('\n')
    const key = cleanString(head).replace(/:$/, '')
    const body = cleanString(rest.join(' '))
    if (key && body) out[key] = body
  }
  return out
}

// ---- loose object → canonical operations ----

// Reserved keys that describe the patch envelope, not entity fields.
const ENVELOPE_KEYS = new Set([
  'patch_id', 'id', 'patch_version', 'version', 'created_at', 'timestamp',
  'generator', 'author', 'model', 'target', 'entity_id', 'slug',
  'canonical_name', 'name', 'alias', 'entity_type', 'type', 'operations',
  'ops', 'sources', 'citations', 'references', 'notes', 'confidence',
  'requires_review', 'review',
])

function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] != null && cleanString(obj[k]) !== '') return obj[k]
  }
  return undefined
}

// Extract sources from a loose object (array of {pmid,doi,url,...} or delimited
// string of identifiers/URLs).
function extractSources(obj) {
  const lc = lowerKeyed(obj)
  const raw = lc.sources ?? lc.citations ?? lc.references ?? lc.studies ?? lc.bibliography
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((entry) => (typeof entry === 'string' ? parseSourceString(entry) : normalizeSourceObject(entry))).filter(Boolean)
  }
  if (typeof raw === 'object') return [normalizeSourceObject(raw)].filter(Boolean)
  return splitList(raw).map(parseSourceString).filter(Boolean)
}

function normalizeSourceObject(entry) {
  if (!entry || typeof entry !== 'object') return null
  const out = {}
  if (entry.pmid) out.pmid = cleanString(entry.pmid)
  if (entry.doi) out.doi = cleanString(entry.doi)
  if (entry.url) out.url = cleanString(entry.url)
  if (entry.title) out.title = cleanString(entry.title)
  if (entry.year) out.year = cleanString(entry.year)
  return Object.keys(out).length ? out : null
}

function parseSourceString(str) {
  const s = cleanString(str)
  if (!s) return null
  const pmid = s.match(/pmid[:\s]*([0-9]+)/i) || s.match(/^([0-9]{5,9})$/)
  const doi = s.match(/(10\.\d{4,9}\/[^\s]+)/i)
  const url = s.match(/(https?:\/\/[^\s]+)/i)
  const out = {}
  if (pmid) out.pmid = pmid[1]
  if (doi) out.doi = doi[1]
  if (url) out.url = url[1]
  if (!Object.keys(out).length) out.title = s
  return out
}

// Convert a loose object into canonical operations + a target + warnings.
function objectToOperations(obj, warnings) {
  const operations = []

  // If the object already carries explicit operations, normalize those.
  const explicitOps = obj.operations ?? obj.ops
  if (Array.isArray(explicitOps)) {
    for (const op of explicitOps) {
      const normalized = normalizeExplicitOp(op, warnings)
      if (normalized) operations.push(normalized)
    }
  }

  // Otherwise, treat non-envelope keys as field updates via alias resolution.
  for (const [key, value] of Object.entries(obj)) {
    if (ENVELOPE_KEYS.has(key.toLowerCase())) continue
    if (value == null || cleanString(value) === '') continue
    const canonical = resolveFieldName(key)
    if (!canonical) {
      warnings.push(`unmapped field "${key}" preserved as legacy update`)
      operations.push({ op: 'update_field', field: `legacy.${key}`, value, payload: {}, notes: 'unmapped field — review before applying' })
      continue
    }
    // Source/citation fields are handled by extractSources, not as operations.
    if (SOURCE_GROUP_CANONICALS.has(canonical)) continue
    // Map a few canonical fields onto richer operations.
    if (canonical === 'aliases') {
      for (const alias of splitList(value)) operations.push({ op: 'add_alias', field: 'aliases', value: alias, payload: {} })
    } else if (canonical === 'safety' || canonical === 'side_effects') {
      // Safety-bearing content becomes a safety warning (requires review/sources).
      operations.push({ op: 'add_safety_warning', field: canonical, value: cleanString(value), payload: {} })
    } else if (canonical === 'interactions') {
      for (const item of splitList(value)) operations.push({ op: 'add_drug_interaction', field: 'interactions', value: item, payload: {} })
    } else {
      operations.push({ op: 'update_field', field: canonical, value, payload: {} })
    }
  }

  return operations
}

function normalizeExplicitField(value) {
  const field = cleanString(value)
  if (!field) return undefined
  if (/^(?:data|legacy)\.[a-z0-9_.-]+$/i.test(field)) return field
  return resolveFieldName(field) || `legacy.${field}`
}

function normalizeExplicitOp(op, warnings) {
  if (!op || typeof op !== 'object') { warnings.push('operation was not an object'); return null }
  const rawOp = cleanString(op.op || op.operation || op.action).toLowerCase().replace(/[\s-]+/g, '_')
  if (!OP_SET.has(rawOp)) {
    warnings.push(`unknown operation "${op.op || op.operation || op.action}" — flagged for review`)
    return { op: 'update_field', field: normalizeExplicitField(op.field) || 'legacy.unknown_op', value: op.value, payload: { original: op }, notes: 'unrecognized operation' }
  }
  const field = normalizeExplicitField(op.field)
  return {
    op: rawOp,
    field,
    value: op.value,
    payload: op.payload && typeof op.payload === 'object' ? op.payload : {},
    confidence: typeof op.confidence === 'number' ? op.confidence : undefined,
    notes: op.notes ? cleanString(op.notes) : undefined,
  }
}

// ---- top-level normalizer ----

export function normalizePatch({ filename, raw, format }) {
  const warnings = []
  const fmt = format || detectFormat(filename, raw)
  let records = []

  try {
    if (fmt === 'json') records = parseJsonish(raw)
    else if (fmt === 'jsonl') records = parseJsonl(raw)
    else if (fmt === 'yaml') records = parseYamlish(raw)
    else if (fmt === 'csv') records = parseCsvish(raw)
    else if (fmt === 'markdown') {
      const md = parseMarkdownish(raw)
      records = md.records
      warnings.push(...md.warnings)
    } else {
      throw new Error(`unsupported format: ${fmt}`)
    }
  } catch (error) {
    return { ok: false, error: `parse failed (${fmt}): ${error.message}`, format: fmt }
  }

  if (!records.length) {
    return { ok: false, error: `no records parsed from ${fmt}`, format: fmt }
  }

  // Each parsed record becomes one normalized patch. Multi-record inputs (CSV,
  // JSONL, multi-row tables) yield multiple patches.
  const patches = records.map((record, index) => buildPatch(record, { filename, raw, format: fmt, index, warnings: [...warnings] }))
  return { ok: true, format: fmt, patches }
}

function buildPatch(record, { filename, raw, format, index, warnings }) {
  const localWarnings = [...warnings]
  const target = {
    id: pick(record, ['entity_id', 'id']) ? cleanString(pick(record, ['entity_id', 'id'])) : undefined,
    slug: pick(record, ['slug']) ? cleanString(record.slug) : undefined,
    canonical_name: pick(record, ['canonical_name', 'common_name', 'herb_name', 'name', 'title']) ? cleanString(pick(record, ['canonical_name', 'common_name', 'herb_name', 'name', 'title'])) : undefined,
    alias: record.alias ? cleanString(record.alias) : undefined,
    entity_type: pick(record, ['entity_type', 'type']) ? cleanString(pick(record, ['entity_type', 'type'])).toLowerCase() : undefined,
  }
  // Handle a nested `target` object if present.
  if (record.target && typeof record.target === 'object') {
    for (const k of ['id', 'slug', 'canonical_name', 'alias', 'entity_type']) {
      if (record.target[k] != null && cleanString(record.target[k]) !== '') target[k] = cleanString(record.target[k])
    }
  }

  if (!target.id && !target.slug && !target.canonical_name && !target.alias) {
    localWarnings.push('no target identifier found (id/slug/canonical_name/alias) — requires manual targeting')
  }

  const operations = objectToOperations(record, localWarnings)
  const sources = extractSources(record)

  if (operations.length === 0) localWarnings.push('no operations derived from record')

  const hasUnsourced = operations.some((op) => ['add_claim', 'add_safety_warning', 'add_drug_interaction'].includes(op.op)) && sources.length === 0
  if (hasUnsourced) localWarnings.push('evidence-bearing operations present without any source — will require review')

  const destructive = operations.some((op) => ['deprecate', 'merge_candidates'].includes(op.op))
  const patchId = cleanString(pick(record, ['patch_id', 'id'])) || deterministicPatchId(filename, index, raw)

  return {
    patch_id: patchId,
    patch_version: cleanString(pick(record, ['patch_version', 'version'])) || FIXED_VERSION,
    created_at: normalizeTimestamp(pick(record, ['created_at', 'timestamp'])),
    generator: pick(record, ['generator', 'author', 'model']) ? cleanString(pick(record, ['generator', 'author', 'model'])) : undefined,
    target,
    operations,
    sources,
    notes: cleanString(record.notes) || '',
    confidence: clampConfidence(record.confidence),
    requires_review: destructive || hasUnsourced || localWarnings.length > 0 || record.requires_review === true,
    original_filename: filename,
    original_hash: contentHash(raw),
    _warnings: localWarnings,
  }
}

function deterministicPatchId(filename, index, raw) {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `patch-${base}-${index}-${contentHash(raw).slice(0, 8)}`
}

function normalizeTimestamp(value) {
  const v = cleanString(value)
  if (v) {
    const parsed = Date.parse(v)
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString()
  }
  // Deterministic fallback so re-normalizing the same file is stable.
  return '2026-01-01T00:00:00.000Z'
}

function clampConfidence(value) {
  const n = Number(value)
  if (Number.isFinite(n) && n >= 0 && n <= 1) return n
  return 0.5
}
