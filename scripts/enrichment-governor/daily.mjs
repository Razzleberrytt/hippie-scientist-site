import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  architectureDriftCheck,
  buildClaimSourceGraph,
  buildCoverageHeatmap,
  contract,
  evidenceDecayScore,
  isPublishableEntry,
} from './governor.mjs'
import { verifyCanaries } from './canary.mjs'
import { reconcileQueueWithQuarantine } from './queue-resilience.mjs'
import { atomicJson, loadJsonStrict, repoRoot, stateDir, withWriterLock } from './state-io.mjs'

function parseJsonl(file) {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line) } catch (error) {
      throw new Error(`Malformed JSONL at ${file}:${index + 1}: ${error.message}`)
    }
  })
}

function computeRates(scoreboard) {
  const totals = scoreboard.totals || {}
  const ratio = (num, den) => den ? Math.round((num / den) * 1000) / 1000 : null
  return {
    firstPassPrSuccess: ratio(totals.prsFirstPassGreen || 0, totals.prsOpened || 0),
    mergeSuccess: ratio(totals.prsMerged || 0, totals.prsOpened || 0),
    postMergeRegressionRate: ratio(totals.postMergeRegressions || 0, totals.prsMerged || 0),
  }
}

function buildIntegrityQueue(entries, watch, nowMs, nowIso) {
  const bySource = new Map()
  for (const entry of entries) {
    if (!entry.sourceId) continue
    if (!bySource.has(entry.sourceId)) bySource.set(entry.sourceId, [])
    bySource.get(entry.sourceId).push(entry)
  }
  const previous = new Map((watch.sources || []).map(row => [row.sourceId, row]))
  const rows = []
  for (const [sourceId, sourceEntries] of bySource) {
    const highImpact = sourceEntries.some(entry => entry.claimType === 'safety_risk' || contract.canaries.fixedAnchors.includes(entry.entitySlug))
    const cadenceDays = highImpact ? contract.publicationIntegrity.recheckHighImpactDays : contract.publicationIntegrity.recheckDefaultDays
    const prior = previous.get(sourceId)
    const lastCheckedAt = prior?.lastCheckedAt || null
    const dueAt = lastCheckedAt ? new Date(Date.parse(lastCheckedAt) + cadenceDays * 86_400_000).toISOString() : nowIso
    const due = !lastCheckedAt || Date.parse(dueAt) <= nowMs
    const contradictionCount = sourceEntries.filter(entry => entry.claimType === 'evidence_conflict' || entry.claimType === 'efficacy_null_or_mixed').length
    const decayScore = evidenceDecayScore({
      ageDays: lastCheckedAt ? Math.max(0, (nowMs - Date.parse(lastCheckedAt)) / 86_400_000) : cadenceDays,
      supportingSources: 1,
      contradictionCount,
      integrityConcern: Boolean(prior?.integrityConcern),
      highImpact,
    })
    rows.push({
      sourceId,
      highImpact,
      cadenceDays,
      lastCheckedAt,
      dueAt,
      due,
      decayScore,
      claimCount: sourceEntries.length,
      entities: [...new Set(sourceEntries.map(entry => `${entry.entityType}:${entry.entitySlug}`))].sort(),
      integrityConcern: Boolean(prior?.integrityConcern),
      status: prior?.status || 'unreviewed',
    })
  }
  rows.sort((a, b) => Number(b.due) - Number(a.due) || b.decayScore - a.decayScore || a.sourceId.localeCompare(b.sourceId))
  return { version: 1, generatedAt: nowIso, sources: rows }
}

function buildResearchTargets(heatmap, quarantine) {
  const quarantined = new Set((quarantine.cases || []).filter(row => row.quarantined).map(row => row.key))
  return heatmap.rows.map(row => {
    let score = 100 - row.coverageScore
    if (row.negativeEvidenceGap) score += 15
    if (row.sourceDiversity.flags.includes('low_source_independence')) score += 10
    if (row.sourceDiversity.flags.includes('single_source_dominance')) score += 8
    score = Math.min(100, score)
    return {
      key: row.entity,
      score,
      coverageScore: row.coverageScore,
      negativeEvidenceGap: row.negativeEvidenceGap,
      diversityFlags: row.sourceDiversity.flags,
      quarantined: quarantined.has(row.entity),
    }
  }).sort((a, b) => Number(a.quarantined) - Number(b.quarantined) || b.score - a.score || a.key.localeCompare(b.key))
}

function summarizeLedger() {
  const events = parseJsonl(path.join(stateDir, 'ledger.jsonl'))
  const tail = events.slice(-100)
  const counts = {}
  for (const event of events) counts[event.event || 'unknown'] = (counts[event.event || 'unknown'] || 0) + 1
  return { totalEvents: events.length, counts, recent: tail }
}

function consolidateUnlocked({ write, strict }) {
  const now = new Date()
  const nowMs = now.getTime()
  const nowIso = now.toISOString()
  const entries = parseJsonl(path.join(repoRoot, 'public', 'data', 'enrichment-normalized.jsonl'))
  const publishableEntries = entries.filter(isPublishableEntry)
  const sourceRegistry = loadJsonStrict(path.join(repoRoot, 'public', 'data', 'source-registry.json'), [])
  const state = loadJsonStrict(path.join(stateDir, 'state.json'), { version: 1 })
  const scoreboard = loadJsonStrict(path.join(stateDir, 'scoreboard.json'), { version: 1, totals: {} })
  const rawQueue = loadJsonStrict(path.join(stateDir, 'work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
  const rawQuarantine = loadJsonStrict(path.join(stateDir, 'quarantine.json'), { version: 1, cases: [] })
  const watch = loadJsonStrict(path.join(stateDir, 'integrity-watch.json'), { version: 1, sources: [] })

  const queueReconciliation = reconcileQueueWithQuarantine(rawQueue, rawQuarantine, contract.quarantine, nowMs)
  const queue = queueReconciliation.queue
  const quarantine = queueReconciliation.quarantine
  const heatmap = buildCoverageHeatmap(publishableEntries)
  const graph = buildClaimSourceGraph(publishableEntries, sourceRegistry)
  const canaries = verifyCanaries(entries, sourceRegistry)
  const drift = architectureDriftCheck(repoRoot)
  const integrityWatch = buildIntegrityQueue(publishableEntries, watch, nowMs, nowIso)
  const researchTargets = buildResearchTargets(heatmap, quarantine)
  const nextFrontier = researchTargets.find(row => !row.quarantined) || null
  const ledgerSummary = summarizeLedger()
  const releaseBlockers = [
    ...(!canaries.pass ? canaries.blockers.map(blocker => `canary:${blocker}`) : []),
    ...(!drift.ok ? drift.missing.map(file => `architecture:${file}`) : []),
  ]
  const releaseGatePass = releaseBlockers.length === 0

  const updatedScoreboard = {
    ...scoreboard,
    rates: computeRates(scoreboard),
    recurringBlockers: scoreboard.recurringBlockers || {},
    updatedAt: nowIso,
  }
  const updatedQueue = { ...queue, updatedAt: nowIso }
  const updatedQuarantine = { ...quarantine, updatedAt: nowIso }
  const updatedState = {
    ...state,
    lastDailyConsolidationAt: nowIso,
    nextFrontier: nextFrontier?.key || null,
    lastArchitectureDriftOk: drift.ok,
    lastCanaryPass: canaries.pass,
    releaseBlocked: !releaseGatePass,
    releaseBlockers,
  }
  const summary = {
    generatedAt: nowIso,
    entryCount: entries.length,
    publishableEntryCount: publishableEntries.length,
    sourceGraph: graph.counts,
    canaryPass: canaries.pass,
    canaryStatus: canaries.status,
    canaryBlockers: canaries.blockers,
    canaryWarnings: canaries.warnings,
    canaryDebt: canaries.debt,
    architectureDriftOk: drift.ok,
    architectureMissing: drift.missing,
    releaseGatePass,
    releaseBlockers,
    dueIntegrityRechecks: integrityWatch.sources.filter(row => row.due).length,
    nextFrontier,
    activeLeases: (updatedQueue.leases || []).length,
    quarantinedCases: (updatedQuarantine.cases || []).filter(row => row.quarantined).length,
    quarantineReviewEligible: (updatedQuarantine.cases || []).filter(row => row.quarantined && row.reviewEligible).length,
    queueMaintenance: queueReconciliation.metrics,
    scoreboardRates: updatedScoreboard.rates,
    ledgerEvents: ledgerSummary.totalEvents,
  }

  // Control-plane maintenance is deliberately independent of the release gate.
  // Red canaries or architecture drift must keep publication/release blocked,
  // but they must not prevent lease pruning, quarantine reconciliation,
  // diagnostics, or selection of other executable research work.
  if (write) {
    atomicJson(path.join(stateDir, 'coverage-heatmap.json'), heatmap)
    atomicJson(path.join(stateDir, 'claim-source-graph.json'), graph)
    atomicJson(path.join(stateDir, 'canary-report.json'), canaries)
    atomicJson(path.join(stateDir, 'architecture-fingerprint.json'), { generatedAt: nowIso, ...drift })
    atomicJson(path.join(stateDir, 'integrity-watch.json'), integrityWatch)
    atomicJson(path.join(stateDir, 'research-targets.json'), { version: 1, generatedAt: nowIso, targets: researchTargets })
    atomicJson(path.join(stateDir, 'ledger-summary.json'), ledgerSummary)
    atomicJson(path.join(stateDir, 'scoreboard.json'), updatedScoreboard)
    atomicJson(path.join(stateDir, 'quarantine.json'), updatedQuarantine)
    atomicJson(path.join(stateDir, 'work-queue.json'), updatedQueue)
    atomicJson(path.join(stateDir, 'state.json'), updatedState)
    atomicJson(path.join(stateDir, 'daily-summary.json'), summary)
  }

  if (strict && !releaseGatePass) {
    throw new Error(`Daily consolidation release gate blocked: ${releaseBlockers.join(', ')}`)
  }

  return summary
}

export function runDailyConsolidation({ write = true, strict = true } = {}) {
  return write
    ? withWriterLock(() => consolidateUnlocked({ write: true, strict }))
    : consolidateUnlocked({ write: false, strict })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dryRun = process.argv.includes('--dry-run')
  process.stdout.write(`${JSON.stringify(runDailyConsolidation({ write: !dryRun, strict: true }), null, 2)}\n`)
}
