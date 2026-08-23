import { normalizeStructuredText, hasMeaningfulText } from '../../../lib/data-quality.mjs'
import { loadContract, fieldAppliesToEntityType, needsHumanReview } from './contract.mjs'
import { isGap, entityType as readEntityType, loadPublicDataSignals } from './canonical.mjs'
import { jobId } from './ids.mjs'
import {
  buildPriorityContext,
  combineBands,
  compareJobs,
  loadPriorityConfig,
  researchBudget,
  entityRiskRules,
  jobRiskBand,
  scoreEntity,
} from './priority.mjs'

/**
 * Gap scanner.
 *
 * Strictly read-only against canonical data. It walks every entity row, asks
 * the contract which fields are enrichable for that entity, and emits one job
 * per (entity, coherent field group). Jobs are keyed by a content hash of the
 * entity and its requested field set, so a rescan of unchanged data produces
 * byte-identical ids and a resumed run recognises work it has already done.
 *
 * A populated, meaningful cell is never re-queued. The only way a filled field
 * enters the queue is an open Maintenance_Queue row that disputes that exact
 * field on that exact entity.
 */

export const GAP_REASONS = {
  MISSING: 'missing',
  PLACEHOLDER: 'placeholder',
  UNSUPPORTED: 'unsupported',
}

/**
 * Fields researched together because one literature pass answers all of them.
 * Anything not listed here becomes its own single-field job — grouping is the
 * exception, not the default, so retries stay narrow.
 */
export const FIELD_GROUPS = [
  {
    name: 'classification',
    fields: ['canonical_ecosystem', 'topic_ecosystems'],
    rationale: 'Both are re-derived from the same canonical pathway/domain read.',
  },
]

function fieldGroupsFor(fieldNames) {
  const remaining = new Set(fieldNames)
  const groups = []

  for (const group of FIELD_GROUPS) {
    const present = group.fields.filter((f) => remaining.has(f))
    if (present.length >= 2) {
      groups.push({ group: group.name, fields: present })
      for (const f of present) remaining.delete(f)
    }
  }
  for (const field of [...remaining].sort()) {
    groups.push({ group: null, fields: [field] })
  }
  return groups
}

function classifyGap(value) {
  const text = normalizeStructuredText(value)
  if (!text) return GAP_REASONS.MISSING
  if (isGap(text)) return GAP_REASONS.PLACEHOLDER
  if (!hasMeaningfulText(text)) return GAP_REASONS.PLACEHOLDER
  return null
}

/**
 * Per-entity deficiency flags read from Maintenance_Queue.
 *
 * This is the only route by which a populated, meaningful cell can be queued,
 * so the status filter has to be narrow. A plain `open` row is a *gap ticket*
 * ("this cell is blank, go find a value") — it justifies queuing an empty cell,
 * which the missing-value check already covers, and it says nothing about a
 * value once one exists. Treating it as a dispute means filling the cell never
 * closes the job: the same ticket re-queues it forever.
 *
 * Only the statuses that explicitly question an existing value count here,
 * e.g. `latin_name_present_needs_authority_check`.
 *
 * The Unresolved_Gaps sheet is deliberately not used at all: its rows are
 * field-level blank counts for a whole sheet, not per-entity verdicts.
 */
function maintenanceDeficiencies(canonical, contract) {
  const openStatuses = new Set(
    (loadPriorityConfig().signals.maintenance_backlog.disputes_populated_value_statuses || []).map((s) =>
      s.toLowerCase(),
    ),
  )
  const bySlug = new Map()
  for (const row of canonical.maintenanceRows || []) {
    const field = String(row.issue_area ?? '').trim()
    if (!contract.fields.has(field)) continue
    if (!openStatuses.has(String(row.status ?? '').trim().toLowerCase())) continue
    const slug = String(row.entity_slug ?? '').trim().toLowerCase()
    if (!slug) continue
    if (!bySlug.has(slug)) bySlug.set(slug, new Set())
    bySlug.get(slug).add(field)
  }
  return bySlug
}

export function scanGaps(canonical, options = {}) {
  const {
    contract = loadContract(),
    config = loadPriorityConfig(),
    publicSignals = loadPublicDataSignals(),
    includeManualReview = true,
  } = options

  const context = buildPriorityContext(canonical, publicSignals, config)
  const deficienciesBySlug = maintenanceDeficiencies(canonical, contract)
  const duplicateSlugSet = new Set(canonical.duplicateSlugs.map((d) => d.slug))

  const enrichableFields = [...contract.fields.values()].filter(
    (f) => f.enrichment === 'automatic' || (includeManualReview && f.enrichment === 'manual-review'),
  )

  const jobs = []
  const skipped = { populated: 0, notApplicable: 0, locked: 0 }
  let entitiesScanned = 0

  for (const [slug, { row, rowNumber }] of canonical.bySlug) {
    entitiesScanned += 1
    const type = readEntityType({ row })

    const applicable = enrichableFields.filter((field) => {
      if (!fieldAppliesToEntityType(field, type)) {
        skipped.notApplicable += 1
        return false
      }
      return Object.prototype.hasOwnProperty.call(row, field.name)
    })

    const deficient = deficienciesBySlug.get(slug)
    const gaps = new Map()
    for (const field of applicable) {
      const reason = classifyGap(row[field.name])
      if (!reason) {
        // Populated and meaningful. The only way it is re-queued is an open
        // maintenance row that disputes this exact field on this exact entity.
        if (deficient?.has(field.name)) {
          gaps.set(field.name, GAP_REASONS.UNSUPPORTED)
        } else {
          skipped.populated += 1
        }
        continue
      }
      gaps.set(field.name, reason)
    }

    if (!gaps.size) continue

    const deficit = applicable.length ? gaps.size / applicable.length : 0
    const { score, signals, signalsUsed } = scoreEntity(
      { row, slug, completenessDeficit: deficit },
      context,
    )
    const firedRules = entityRiskRules(
      {
        row,
        runtimeVisibility: signals.runtime_visibility ?? 0,
        hasIntegrityDefect: duplicateSlugSet.has(slug),
      },
      config,
    )

    const automaticGaps = [...gaps.keys()].filter(
      (name) => contract.fields.get(name).enrichment === 'automatic',
    )
    const manualGaps = [...gaps.keys()].filter(
      (name) => contract.fields.get(name).enrichment === 'manual-review',
    )

    for (const [mode, fieldNames] of [
      ['automatic', automaticGaps],
      ['manual-review', manualGaps],
    ]) {
      if (!fieldNames.length) continue
      for (const { group, fields } of fieldGroupsFor(fieldNames)) {
        const fieldDefs = fields.map((name) => contract.fields.get(name))
        const fieldPriority = fieldDefs
          .map((f) => f.field_priority)
          .sort()[0]
        const risk = jobRiskBand(firedRules, fields)
        const priority = combineBands({ score, fieldPriority, risk: risk.band }, config)
        const id = jobId({ entityType: type, slug, fields })

        jobs.push({
          job_id: id,
          entity_type: type,
          slug,
          name: normalizeStructuredText(row.name),
          sheet: canonical.entitySheet,
          row_number: rowNumber,
          mode,
          field_group: group,
          requested_fields: [...fields].sort(),
          field_priority: fieldPriority,
          priority,
          score,
          value_signals: signalsUsed,
          risk_band: risk.band,
          risk_reasons: risk.reasons,
          requires_human_review: fieldDefs.some((f) => needsHumanReview(f)),
          reasons: Object.fromEntries(fields.map((name) => [name, gaps.get(name)])),
          current_values: Object.fromEntries(
            fields.map((name) => [name, normalizeStructuredText(row[name])]),
          ),
          budget: researchBudget({ fields, band: priority }, config),
          status: 'pending',
        })
      }
    }
  }

  jobs.sort(compareJobs)

  return {
    entities_scanned: entitiesScanned,
    fields_considered: enrichableFields.map((f) => f.name).sort(),
    jobs,
    skipped,
    duplicate_slugs: canonical.duplicateSlugs,
  }
}

/** Filter helpers used by the CLI and by shard assignment. */
export function filterJobs(jobs, filters = {}) {
  const { entityType: type, field, priority, mode, slug, status } = filters
  return jobs.filter((job) => {
    if (type && job.entity_type !== type) return false
    if (mode && job.mode !== mode) return false
    if (slug && job.slug !== slug) return false
    if (status && job.status !== status) return false
    if (priority && !toList(priority).includes(job.priority)) return false
    if (field && !toList(field).some((f) => job.requested_fields.includes(f))) return false
    return true
  })
}

function toList(value) {
  return Array.isArray(value) ? value : String(value).split(',').map((v) => v.trim()).filter(Boolean)
}
