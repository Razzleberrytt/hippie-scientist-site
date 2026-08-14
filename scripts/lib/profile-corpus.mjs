/**
 * profile-corpus.mjs
 *
 * One loader for the herb/compound corpus, shared by the content-quality
 * scripts so they all score the same fields the same way. Reads only generated
 * runtime data under `public/data` — never the workbook — so it stays fast and
 * matches exactly what ships to crawlers.
 *
 * Every consumer gets a normalized `ProfileEntry`:
 *   { kind, slug, name, indexable, summary, dosing, safety, mechanisms,
 *     sourceCount, claimCount, evidenceGrade, ... }
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')

/* --------------------------------------------------------------- shaping -- */

/** Flatten any string-ish value (string | string[] | nested object) to text. */
export function text(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(' · ')
  if (typeof value === 'object') return Object.values(value).map(text).filter(Boolean).join(' · ')
  return ''
}

/** Coerce to a clean string array, splitting delimited strings. */
export function list(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.map(text).map((s) => s.trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[|;]|(?:,\s(?=[A-Z]))/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  if (typeof value === 'object') return Object.values(value).map(text).filter(Boolean)
  return []
}

/**
 * Placeholder / pipeline-leak detector. These strings appear in generated data
 * where a human sentence was expected and must never count toward quality.
 */
const PLACEHOLDER_RE =
  /^(n\/a|na|none|null|undefined|tbd|todo|unknown|not available|not specified|no data|-+|\.+)$/i
const LEAKED_PIPELINE_RE = /(study_count=|rct_count=|meta_analysis_count=|systematic_review_count=|aggregate-row|lorem ipsum)/i

export function isMeaningful(value, minChars = 12) {
  const str = text(value)
  if (!str) return false
  if (PLACEHOLDER_RE.test(str)) return false
  if (LEAKED_PIPELINE_RE.test(str)) return false
  return str.length >= minChars
}

export const isLeakedPipelineText = (value) => LEAKED_PIPELINE_RE.test(text(value))

/* ------------------------------------------------------- evidence grades -- */

/**
 * Canonical evidence bands. The workbook currently carries ~130 free-text
 * variants ("c", "C+", "moderate-high", "Strong drug evidence", ...), which
 * makes cross-profile comparison impossible. Everything normalizes into one of
 * five bands plus `unrated`.
 */
export const EVIDENCE_BANDS = ['strong', 'moderate', 'limited', 'preliminary', 'insufficient', 'unrated']

const BAND_RULES = [
  [/^(a\+?|strong|high|robust)$/i, 'strong'],
  [/^(b\+?|b-|moderate|moderate-high|good)$/i, 'moderate'],
  [/^(c\+?|c-|limited|low-moderate|mixed|emerging)$/i, 'limited'],
  [/^(d\+?|d-|preliminary|weak|low|early)$/i, 'preliminary'],
  [/^(f|insufficient|none|no evidence|avoid|not_applicable.*)$/i, 'insufficient'],
]

const BAND_KEYWORDS = [
  [/\b(strong|robust|high[- ]quality|well[- ]established)\b/i, 'strong'],
  [/\bmoderate[- ]to[- ]strong\b/i, 'strong'],
  [/\bmoderate\b/i, 'moderate'],
  [/\b(limited[- ]to[- ]moderate|mixed|inconsistent|limited)\b/i, 'limited'],
  [/\b(preliminary|pilot|early|weak|low)\b/i, 'preliminary'],
  [/\b(insufficient|no human|avoid|blocked)\b/i, 'insufficient'],
]

/** Normalize any raw evidence grade into a canonical band. */
export function normalizeEvidenceGrade(raw) {
  const str = text(raw).trim()
  if (!str) return { band: 'unrated', canonical: false, raw: '' }
  for (const [re, band] of BAND_RULES) {
    if (re.test(str)) return { band, canonical: /^[a-df][+-]?$/i.test(str), raw: str }
  }
  for (const [re, band] of BAND_KEYWORDS) {
    if (re.test(str)) return { band, canonical: false, raw: str }
  }
  return { band: 'unrated', canonical: false, raw: str }
}

/* ----------------------------------------------------------- data access -- */

function readJson(file, fallback) {
  const full = path.isAbsolute(file) ? file : path.join(DATA_DIR, file)
  if (!existsSync(full)) return fallback
  try {
    return JSON.parse(readFileSync(full, 'utf8'))
  } catch {
    return fallback
  }
}

function readDetailDir(dirName) {
  const dir = path.join(DATA_DIR, dirName)
  if (!existsSync(dir)) return new Map()
  const map = new Map()
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    const slug = file.replace(/\.json$/, '')
    const parsed = readJson(path.join(dir, file), null)
    if (parsed) map.set(slug, parsed)
  }
  return map
}

/** Claims grouped by profile slug, with pipeline-leak rows separated out. */
export function loadClaims() {
  const rows = readJson('claims.json', [])
  const bySlug = new Map()
  const leaked = []
  for (const row of Array.isArray(rows) ? rows : []) {
    const slug = text(row.profile_slug)
    const claim = text(row.claim || row.title)
    const entry = { ...row, slug, claim }
    if (!claim || isLeakedPipelineText(claim) || /^aggregate-row/.test(text(row.id))) {
      leaked.push(entry)
      continue
    }
    if (!slug) continue
    if (!bySlug.has(slug)) bySlug.set(slug, [])
    bySlug.get(slug).push(entry)
  }
  return { bySlug, leaked, total: Array.isArray(rows) ? rows.length : 0 }
}

/* ---------------------------------------------------------------- corpus -- */

function buildEntry(kind, record, detail, claims) {
  const slug = text(record.slug)
  const merged = { ...(detail ?? {}), ...record }

  const sources = Array.isArray(detail?.sources) ? detail.sources : list(record.sources).map((s) => ({ title: s }))
  const evidence = detail?.evidence ?? {}
  const grade = normalizeEvidenceGrade(record.evidence_grade ?? record.evidence_tier ?? detail?.evidenceLevel)

  const dosing = [record.dosage, record.typical_dosage, detail?.dosage, detail?.typical_dosage]
    .map(text)
    .find((v) => isMeaningful(v, 8)) ?? ''

  const safetyParts = [
    text(record.safety),
    list(record.contraindications).join(' · '),
    list(record.side_effects).join(' · '),
    list(detail?.safetyNotes).join(' · '),
    list(detail?.contraindications).join(' · '),
  ].filter(Boolean)

  const mechanisms = [
    ...list(record.mechanisms),
    ...list(record.canonical_mechanisms),
    ...list(detail?.mechanisms),
  ]
  const interactions = [...list(record.interactions), ...list(detail?.interactions)]

  const robots = text(record.robots)
  const indexable =
    text(record.indexability_status).toUpperCase() === 'PUBLISH' &&
    !/noindex/i.test(robots) &&
    record.sitemap_included !== false

  return {
    kind,
    slug,
    name: text(record.name) || slug,
    url: `/${kind === 'herb' ? 'herbs' : 'compounds'}/${slug}/`,
    indexable,
    indexabilityStatus: text(record.indexability_status),
    indexabilityScore: Number(record.indexability_score) || 0,
    robots,
    summary: text(record.summary),
    description: text(record.description),
    dosing,
    safety: safetyParts.join(' · '),
    mechanisms: [...new Set(mechanisms)],
    interactions: [...new Set(interactions)],
    conditions: [...new Set([...list(record.conditions), ...list(record.effects)])],
    evidenceGrade: grade,
    evidenceRationale: text(record.evidence_rationale),
    reviewStatus: text(evidence.reviewStatus),
    sources,
    sourceCount: sources.length || Number(evidence.sourceCount) || 0,
    claims,
    claimCount: claims.length,
    lastUpdated: text(record.last_updated),
    lastReviewed: text(record.last_reviewed),
    doNotMonetize: record.doNotMonetize === true,
    raw: merged,
  }
}

/**
 * Load the full profile corpus.
 * @param {{ kinds?: ('herb'|'compound')[] }} [options]
 * @returns {{ entries: object[], claims: ReturnType<typeof loadClaims> }}
 */
export function loadProfileCorpus(options = {}) {
  const kinds = options.kinds ?? ['herb', 'compound']
  const claims = loadClaims()
  const entries = []

  if (kinds.includes('herb')) {
    const herbs = readJson('herbs.json', [])
    const details = readDetailDir('herbs-detail')
    for (const record of herbs) {
      const slug = text(record.slug)
      entries.push(buildEntry('herb', record, details.get(slug), claims.bySlug.get(slug) ?? []))
    }
  }

  if (kinds.includes('compound')) {
    const compounds = readJson('compounds.json', [])
    const details = readDetailDir('compounds-detail')
    for (const record of compounds) {
      const slug = text(record.slug)
      entries.push(buildEntry('compound', record, details.get(slug), claims.bySlug.get(slug) ?? []))
    }
  }

  return { entries, claims }
}

/* ----------------------------------------------------------------- utils -- */

export function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return 0
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10
}

export function percent(numerator, denominator) {
  if (!denominator) return 0
  return Number(((numerator / denominator) * 100).toFixed(1))
}

export const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
export { ROOT, DATA_DIR }
