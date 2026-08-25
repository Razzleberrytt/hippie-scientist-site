import fs from 'node:fs'
import path from 'node:path'
import { contractDir } from './paths.mjs'
import { PRIORITY_BANDS } from './contract.mjs'
import { isGap } from './canonical.mjs'

/**
 * Deterministic priority scoring.
 *
 * Two independent judgements are produced for every job:
 *
 *   value  — an ROI score in 0..100 built only from signals that already exist
 *            in the repository. A missing signal contributes nothing and its
 *            weight is redistributed, so a partially instrumented corpus still
 *            produces a usable ordering instead of a fabricated one.
 *   risk   — a band derived from safety and claim-integrity rules. Risk can
 *            only ever raise urgency, never lower it, which is what lets a
 *            safety gap outrank a high-traffic cosmetic opportunity.
 *
 * Alphabetical order is used solely to break exact ties.
 */

export const priorityConfigPath = path.join(contractDir, 'priority-config.json')

let cachedConfig = null

export function loadPriorityConfig({ force = false } = {}) {
  if (cachedConfig && !force) return cachedConfig
  const config = JSON.parse(fs.readFileSync(priorityConfigPath, 'utf8'))
  if (config.config_version !== 1) throw new Error('priority-config.json: config_version must equal 1')

  const weightTotal = Object.values(config.weights).reduce((sum, w) => sum + w, 0)
  if (Math.abs(weightTotal - 1) > 1e-6) {
    throw new Error(`priority-config.json: weights must sum to 1, got ${weightTotal}`)
  }
  for (const band of Object.keys(config.value_bands)) {
    if (!PRIORITY_BANDS.includes(band)) throw new Error(`priority-config.json: unknown value band ${band}`)
  }
  cachedConfig = Object.freeze(config)
  return cachedConfig
}

function lookup(table, value) {
  const key = String(value ?? '').trim()
  if (!key) return null
  if (Object.prototype.hasOwnProperty.call(table, key)) return table[key]
  const lower = key.toLowerCase()
  const match = Object.keys(table).find((k) => k.toLowerCase() === lower)
  return match ? table[match] : null
}

function mean(values) {
  const present = values.filter((v) => typeof v === 'number' && Number.isFinite(v))
  if (!present.length) return null
  return present.reduce((sum, v) => sum + v, 0) / present.length
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function searchObservationSlug(observation) {
  try {
    const pathname = new URL(String(observation?.url ?? ''), 'https://thehippiescientist.net').pathname
    const match = pathname.match(/^\/(?:herbs|compounds)\/([^/]+)\/?$/i)
    if (!match) return ''

    const urlSlug = match[1].toLowerCase()
    const explicit = String(observation?.slug ?? '').trim().toLowerCase()
    return explicit && explicit !== urlSlug ? '' : urlSlug
  } catch {
    return ''
  }
}

/**
 * Latest active search-engine observation per profile slug. Equal-date
 * observations resolve to the stronger rejection score, which keeps the result
 * deterministic and conservative without inventing recency decay.
 */
function buildSearchIndexFeedback(publicSignals, config) {
  const rows = publicSignals?.searchIndexObservations?.observations
  const weights = config.signals.search_index_feedback?.status_weights
  if (!Array.isArray(rows) || !weights) return new Map()

  const feedback = new Map()
  for (const observation of rows) {
    if (!observation || observation.active === false) continue
    const slug = searchObservationSlug(observation)
    if (!slug) continue
    const score = lookup(weights, observation.status)
    if (typeof score !== 'number' || !Number.isFinite(score)) continue

    const observedAt = String(observation.observed_at ?? '').trim()
    const entry = {
      slug,
      score: clamp01(score),
      status: String(observation.status ?? '').trim().toLowerCase(),
      engine: String(observation.engine ?? '').trim().toLowerCase(),
      observedAt,
      source: String(observation.source ?? '').trim(),
    }
    const previous = feedback.get(slug)
    if (
      !previous ||
      observedAt > previous.observedAt ||
      (observedAt === previous.observedAt && entry.score > previous.score)
    ) {
      feedback.set(slug, entry)
    }
  }
  return feedback
}

/**
 * Corpus-level context computed once per scan: normalization maxima, the
 * open-maintenance-backlog index, and optional external index-selection evidence.
 * Passing this in keeps per-job scoring pure.
 */
export function buildPriorityContext(canonical, publicSignals = {}, config = loadPriorityConfig()) {
  const authorityColumns = config.signals.authority_weight.columns
  const maxima = {}
  for (const column of authorityColumns) {
    let max = 0
    for (const { row } of canonical.bySlug.values()) {
      const num = Number.parseFloat(String(row[column] ?? '').trim())
      if (Number.isFinite(num) && num > max) max = num
    }
    maxima[column] = max
  }

  const openStatuses = new Set(config.signals.maintenance_backlog.open_statuses.map((s) => s.toLowerCase()))
  const priorityWeights = config.signals.maintenance_backlog.priority_weights
  const backlog = new Map()
  for (const row of canonical.maintenanceRows || []) {
    const status = String(row.status ?? '').trim().toLowerCase()
    if (!openStatuses.has(status)) continue
    const slug = String(row.entity_slug ?? '').trim().toLowerCase()
    if (!slug) continue
    const weight = lookup(priorityWeights, row.priority) ?? 0.3
    const current = backlog.get(slug) || { weight: 0, rows: 0, areas: new Set(), topPriority: null }
    current.weight += weight
    current.rows += 1
    const area = String(row.issue_area ?? '').trim()
    if (area) current.areas.add(area)
    const p = String(row.priority ?? '').trim().toUpperCase()
    if (p.startsWith('P')) {
      if (!current.topPriority || p < current.topPriority) current.topPriority = p
    }
    backlog.set(slug, current)
  }

  const curated = new Set()
  const report = publicSignals?.seoPriority
  for (const key of ['topHerbs', 'topCompounds']) {
    for (const entry of report?.[key] || []) {
      const slug = String(entry?.slug ?? '').trim().toLowerCase()
      if (slug) curated.add(slug)
    }
  }

  const searchIndexFeedback = buildSearchIndexFeedback(publicSignals, config)

  return { maxima, backlog, curated, searchIndexFeedback, config }
}

function signalRuntimeVisibility(row, config) {
  const s = config.signals.runtime_visibility
  return mean([
    lookup(s.runtime_export_decision, row.runtime_export_decision),
    lookup(s.public_search_visibility, row.public_search_visibility),
    lookup(s.seo_indexing_recommendation, row.seo_indexing_recommendation),
  ])
}

function signalRetrievalPriority(row, config) {
  const s = config.signals.retrieval_priority
  return mean([
    lookup(s.ai_retrieval_priority, row.ai_retrieval_priority),
    lookup(s.semantic_priority, row.semantic_priority),
  ])
}

function signalAuthorityWeight(row, context) {
  const values = context.config.signals.authority_weight.columns.map((column) => {
    const max = context.maxima[column]
    if (!max) return null
    const num = Number.parseFloat(String(row[column] ?? '').trim())
    return Number.isFinite(num) ? clamp01(num / max) : null
  })
  return mean(values)
}

function signalMaintenanceBacklog(slug, context) {
  const entry = context.backlog.get(slug)
  if (!entry) return 0
  const saturation = context.config.signals.maintenance_backlog.saturation_rows || 8
  return clamp01(entry.weight / saturation)
}

function signalSearchIndexFeedback(slug, context) {
  const entry = context.searchIndexFeedback?.get(String(slug ?? '').trim().toLowerCase())
  return entry ? entry.score : null
}

/**
 * Prefer work that adds differentiated user value instead of simply increasing
 * the count of populated cells. The field weights live in the contract so this
 * remains deterministic, auditable, and benchmarkable.
 */
function signalUniqueAddedValue(row, config) {
  const fieldWeights = config.signals.unique_added_value?.field_weights
  if (!fieldWeights || typeof fieldWeights !== 'object') return null

  let availableWeight = 0
  let missingValueWeight = 0
  for (const [field, rawWeight] of Object.entries(fieldWeights)) {
    if (!Object.prototype.hasOwnProperty.call(row, field)) continue
    const weight = Number(rawWeight)
    if (!Number.isFinite(weight) || weight <= 0) continue
    availableWeight += weight
    if (isGap(row[field])) missingValueWeight += weight
  }

  return availableWeight > 0 ? clamp01(missingValueWeight / availableWeight) : null
}

/**
 * Weighted score over available signals only. Weights for absent signals are
 * redistributed proportionally across the signals that did resolve, so the
 * result stays on a 0..100 scale without inventing a value for missing data.
 */
export function scoreEntity({ row, slug, completenessDeficit }, context) {
  const config = context.config
  const raw = {
    runtime_visibility: signalRuntimeVisibility(row, config),
    retrieval_priority: signalRetrievalPriority(row, config),
    authority_weight: signalAuthorityWeight(row, context),
    completeness_deficit: typeof completenessDeficit === 'number' ? clamp01(completenessDeficit) : null,
    maintenance_backlog: signalMaintenanceBacklog(slug, context),
    curated_prominence: context.curated.has(slug) ? 1 : 0,
    unique_added_value: signalUniqueAddedValue(row, config),
    search_index_feedback: signalSearchIndexFeedback(slug, context),
  }

  let available = 0
  for (const [name, value] of Object.entries(raw)) {
    if (value !== null) available += config.weights[name]
  }
  if (available === 0) return { score: 0, signals: raw, signalsUsed: [] }

  let score = 0
  const signalsUsed = []
  for (const [name, value] of Object.entries(raw)) {
    if (value === null) continue
    score += (config.weights[name] / available) * value
    signalsUsed.push(name)
  }

  return {
    score: Math.round(clamp01(score) * 1000) / 10,
    signals: raw,
    signalsUsed: signalsUsed.sort(),
  }
}

function bandIndex(band) {
  const index = PRIORITY_BANDS.indexOf(band)
  return index === -1 ? PRIORITY_BANDS.length - 1 : index
}

export function valueBand(score, config = loadPriorityConfig()) {
  const ordered = Object.entries(config.value_bands).sort((a, b) => b[1] - a[1])
  for (const [band, threshold] of ordered) {
    if (score >= threshold) return band
  }
  return 'P4'
}

/**
 * Risk rules that currently fire for an entity.
 *
 * The rules are reported rather than collapsed to a single band because risk is
 * field-scoped: a published entity missing its contraindications makes the
 * *contraindications* job urgent, not the keywords job on the same row. Only
 * structural defects (`scope: 'entity'`) raise every job on the entity.
 */
export function entityRiskRules(
  { row, runtimeVisibility, hasIntegrityDefect },
  config = loadPriorityConfig(),
) {
  const rules = config.risk_rules
  const fired = []

  if (hasIntegrityDefect && rules.duplicate_or_integrity_defect) {
    fired.push({
      key: 'duplicate_or_integrity_defect',
      band: rules.duplicate_or_integrity_defect.band,
      scope: 'entity',
      fields: [],
      reason: 'structural integrity defect (duplicate slug)',
    })
  }

  const visibility = typeof runtimeVisibility === 'number' ? runtimeVisibility : 0
  for (const key of ['safety_gap_on_published_entity', 'claim_integrity_gap_on_published_entity']) {
    const rule = rules[key]
    if (!rule) continue
    if (visibility < (rule.requires_runtime_visibility_at_least ?? 0)) continue
    const missing = rule.fields.filter((field) => isGap(row[field]))
    if (!missing.length) continue
    fired.push({
      key,
      band: rule.band,
      scope: 'field',
      fields: missing,
      reason: `${key}: ${missing.join(', ')}`,
    })
  }

  return fired
}

/**
 * Collapse the fired rules to the band that applies to one specific job.
 * A field-scoped rule only applies when the job would actually close it.
 */
export function jobRiskBand(firedRules, requestedFields) {
  const requested = new Set(requestedFields || [])
  let band = 'P4'
  const reasons = []
  for (const rule of firedRules) {
    const applies = rule.scope === 'entity' || rule.fields.some((f) => requested.has(f))
    if (!applies) continue
    if (bandIndex(rule.band) < bandIndex(band)) band = rule.band
    reasons.push(rule.reason)
  }
  return { band, reasons }
}

/**
 * Combine the value score, the contract's field priority, and the risk band.
 * Risk can only raise urgency. Field priority and value are averaged so a
 * low-value entity cannot drag a P1 field to the bottom of the queue, and a
 * high-value entity cannot promote a cosmetic P4 field to the top.
 */
export function combineBands({ score, fieldPriority, risk }, config = loadPriorityConfig()) {
  const valueIndex = bandIndex(valueBand(score, config))
  const fieldIndex = bandIndex(fieldPriority || 'P3')
  const baseIndex = Math.round((valueIndex + fieldIndex) / 2)
  const finalIndex = Math.min(baseIndex, bandIndex(risk))
  return PRIORITY_BANDS[finalIndex]
}

/** Research budget for a job, most specific rule wins. */
export function researchBudget({ fields, band, exception }, config = loadPriorityConfig()) {
  const budgets = config.research_budgets
  let budget = { ...budgets.default }

  if (budgets.by_field_priority?.[band]) {
    budget = { ...budget, ...budgets.by_field_priority[band] }
  }
  for (const field of fields || []) {
    if (budgets.by_field?.[field]) budget = { ...budget, ...budgets.by_field[field] }
  }
  if (exception) {
    const rule = budgets.exceptions?.[exception]
    if (!rule) {
      throw new Error(
        `Unknown research budget exception "${exception}". Known: ${Object.keys(budgets.exceptions || {}).join(', ')}`,
      )
    }
    budget = { ...budget, ...rule }
  }

  const { requires_explicit_flag: _flag, ...rest } = budget
  return rest
}

/** Deterministic queue ordering. Alphabetical slug is the last tie-break only. */
export function compareJobs(a, b) {
  const bandDelta = bandIndex(a.priority) - bandIndex(b.priority)
  if (bandDelta !== 0) return bandDelta
  if (b.score !== a.score) return b.score - a.score
  const fieldDelta = bandIndex(a.field_priority) - bandIndex(b.field_priority)
  if (fieldDelta !== 0) return fieldDelta
  if (a.slug !== b.slug) return a.slug.localeCompare(b.slug)
  return a.job_id.localeCompare(b.job_id)
}
