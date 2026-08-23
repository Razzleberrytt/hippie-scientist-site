import { JOB_STATUSES, readStore } from './job-store.mjs'
import { listCandidates, readCandidate } from './candidates.mjs'
import { reuseMetrics } from './research-index.mjs'
import { dedupeSources } from './source-identity.mjs'

/**
 * Metrics.
 *
 * Every number here is recomputed from the job ledger and the candidate store,
 * so identical state always produces an identical report — no counters that can
 * drift from reality, and nothing that needs a separate accumulation step.
 */

export function computeMetrics({ scan = null, researchIndex = null } = {}) {
  const store = readStore()
  const jobs = Object.values(store.jobs)

  const byStatus = Object.fromEntries(JOB_STATUSES.map((s) => [s, 0]))
  const byBand = {}
  const byField = {}
  const byMode = {}
  for (const job of jobs) {
    byStatus[job.status] = (byStatus[job.status] || 0) + 1
    byBand[job.priority] = (byBand[job.priority] || 0) + 1
    byMode[job.mode] = (byMode[job.mode] || 0) + 1
    for (const field of job.requested_fields) byField[field] = (byField[field] || 0) + 1
  }

  const candidates = listCandidates()
  let fieldsProposed = 0
  let noOps = 0
  let citations = 0
  let duplicatesPrevented = 0
  let sourcesReused = 0
  let sourcesNew = 0
  let cacheHits = 0
  let externalResearch = 0

  for (const filePath of candidates) {
    let candidate
    try {
      candidate = readCandidate(filePath)
    } catch {
      continue
    }
    for (const change of candidate.changes) {
      if (change.operation === 'no-op') noOps += 1
      else fieldsProposed += 1
    }
    citations += candidate.sources.length
    duplicatesPrevented += dedupeSources(candidate.sources).duplicatesRemoved
    if (researchIndex) {
      const reuse = reuseMetrics(researchIndex, candidate.sources)
      sourcesReused += reuse.reused
      sourcesNew += reuse.fresh
    } else {
      sourcesReused += candidate.provenance?.sources_reused ?? 0
      sourcesNew += candidate.provenance?.sources_new ?? 0
    }
    cacheHits += candidate.provenance?.cache_hits ?? 0
    if (candidate.provenance?.external_research_required) externalResearch += 1
  }

  const withCandidates = candidates.length || 1

  return {
    metrics_version: 1,
    scan: scan
      ? {
          entities_scanned: scan.entities_scanned,
          gaps_found: scan.jobs.length,
          fields_considered: scan.fields_considered.length,
          populated_cells_skipped: scan.skipped.populated,
        }
      : null,
    jobs: {
      total: jobs.length,
      by_status: byStatus,
      by_priority_band: sortKeys(byBand),
      by_mode: sortKeys(byMode),
      by_field: sortKeys(byField),
    },
    candidates: {
      total: candidates.length,
      fields_proposed: fieldsProposed,
      no_ops: noOps,
      fields_per_candidate: round(fieldsProposed / withCandidates),
      citations_total: citations,
      citations_per_candidate: round(citations / withCandidates),
      sources_reused: sourcesReused,
      sources_new: sourcesNew,
      reuse_rate: round(sourcesReused / Math.max(1, sourcesReused + sourcesNew)),
      duplicates_prevented: duplicatesPrevented,
      cache_hits: cacheHits,
      external_research_required: externalResearch,
    },
  }
}

function sortKeys(object) {
  return Object.fromEntries(Object.entries(object).sort((a, b) => a[0].localeCompare(b[0])))
}

function round(value) {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0
}

export function formatMetrics(metrics) {
  const lines = []
  if (metrics.scan) {
    lines.push('scan')
    lines.push(`  entities scanned        ${metrics.scan.entities_scanned}`)
    lines.push(`  gaps found              ${metrics.scan.gaps_found}`)
    lines.push(`  populated cells skipped ${metrics.scan.populated_cells_skipped}`)
  }
  lines.push('jobs')
  lines.push(`  total                   ${metrics.jobs.total}`)
  for (const [status, count] of Object.entries(metrics.jobs.by_status)) {
    if (count) lines.push(`    ${status.padEnd(18)} ${count}`)
  }
  lines.push(`  by band                 ${JSON.stringify(metrics.jobs.by_priority_band)}`)
  lines.push('candidates')
  const c = metrics.candidates
  lines.push(`  total                   ${c.total}`)
  lines.push(`  fields proposed         ${c.fields_proposed} (${c.fields_per_candidate}/candidate)`)
  lines.push(`  no-ops                  ${c.no_ops}`)
  lines.push(`  citations               ${c.citations_total} (${c.citations_per_candidate}/candidate)`)
  lines.push(`  sources reused / new    ${c.sources_reused} / ${c.sources_new} (reuse ${c.reuse_rate})`)
  lines.push(`  duplicates prevented    ${c.duplicates_prevented}`)
  return lines.join('\n')
}
