import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

import { acquireLease, contract, quarantineDecision, runBenchmark } from './governor.mjs'
import { appendJsonl, atomicJson, loadJsonStrict, statePath, withWriterLock } from './state-io.mjs'

const nowIso = () => new Date().toISOString()

function parseArgs(args) {
  const parsed = { _: [] }
  for (const arg of args) {
    if (!arg.startsWith('--')) parsed._.push(arg)
    else {
      const eq = arg.indexOf('=')
      if (eq === -1) parsed[arg.slice(2)] = true
      else parsed[arg.slice(2, eq)] = arg.slice(eq + 1)
    }
  }
  return parsed
}

function csv(value) {
  if (!value) return []
  return String(value).split(',').map(value => value.trim()).filter(Boolean)
}

function event(eventName, details = {}) {
  appendJsonl(statePath('ledger.jsonl'), { event: eventName, at: nowIso(), ...details })
}

function acquire(args) {
  return withWriterLock(() => {
    const queue = loadJsonStrict(statePath('work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
    const request = {
      id: args.id || `lease_${crypto.randomUUID()}`,
      owner: args.owner || 'enrichment-agent',
      purpose: args.purpose || 'enrichment',
      files: csv(args.files),
      entities: csv(args.entities),
    }
    if (!request.files.length && !request.entities.length) throw new Error('lease-acquire requires --files and/or --entities')
    const result = acquireLease(queue, request)
    if (!result.acquired) {
      event('lease_blocked', { requestedLeaseId: request.id, reason: result.reason, files: request.files, entities: request.entities })
      return { ok: false, ...result }
    }
    atomicJson(statePath('work-queue.json'), { ...result.queue, updatedAt: nowIso() })
    event('lease_acquired', { leaseId: result.lease.id, owner: result.lease.owner, files: result.lease.files, entities: result.lease.entities, expiresAt: result.lease.expiresAt })
    return { ok: true, lease: result.lease }
  })
}

function release(args) {
  return withWriterLock(() => {
    if (!args.id) throw new Error('lease-release requires --id')
    const queue = loadJsonStrict(statePath('work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
    const existing = (queue.leases || []).find(lease => lease.id === args.id)
    const leases = (queue.leases || []).filter(lease => lease.id !== args.id)
    atomicJson(statePath('work-queue.json'), { ...queue, leases, updatedAt: nowIso() })
    event('lease_released', { leaseId: args.id, existed: Boolean(existing), disposition: args.disposition || 'completed' })
    return { ok: true, released: Boolean(existing), leaseId: args.id }
  })
}

function queueAdd(args) {
  return withWriterLock(() => {
    if (!args.key) throw new Error('queue-add requires --key')
    const queue = loadJsonStrict(statePath('work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
    const item = {
      key: args.key,
      kind: args.kind || 'enrichment',
      score: Number(args.score || 0),
      entities: csv(args.entities),
      files: csv(args.files),
      reason: args.reason || null,
      createdAt: nowIso(),
    }
    const queued = [...(queue.queued || []).filter(row => row.key !== item.key), item]
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0) || a.key.localeCompare(b.key))
    atomicJson(statePath('work-queue.json'), { ...queue, queued, updatedAt: nowIso() })
    event('work_queued', { key: item.key, kind: item.kind, score: item.score })
    return { ok: true, item }
  })
}

function metric(args) {
  return withWriterLock(() => {
    if (!args.name) throw new Error('metric requires --name')
    const scoreboard = loadJsonStrict(statePath('scoreboard.json'), { version: 1, totals: {}, rates: {}, efficiency: {}, recurringBlockers: {} })
    if (!(args.name in (scoreboard.totals || {}))) throw new Error(`unknown scoreboard metric: ${args.name}`)
    const delta = Number(args.delta ?? 1)
    if (!Number.isFinite(delta)) throw new Error('metric --delta must be numeric')
    scoreboard.totals[args.name] = Number(scoreboard.totals[args.name] || 0) + delta
    scoreboard.updatedAt = nowIso()
    atomicJson(statePath('scoreboard.json'), scoreboard)
    event('metric_updated', { name: args.name, delta, value: scoreboard.totals[args.name] })
    return { ok: true, name: args.name, value: scoreboard.totals[args.name] }
  })
}

function blocker(args) {
  return withWriterLock(() => {
    if (!args.category) throw new Error('blocker requires --category')
    const scoreboard = loadJsonStrict(statePath('scoreboard.json'), { version: 1, totals: {}, rates: {}, efficiency: {}, recurringBlockers: {} })
    scoreboard.recurringBlockers ||= {}
    scoreboard.recurringBlockers[args.category] = Number(scoreboard.recurringBlockers[args.category] || 0) + 1
    scoreboard.updatedAt = nowIso()
    atomicJson(statePath('scoreboard.json'), scoreboard)
    event('blocker_recorded', { category: args.category, count: scoreboard.recurringBlockers[args.category], detail: args.detail || null })
    return { ok: true, category: args.category, count: scoreboard.recurringBlockers[args.category] }
  })
}

function integrityRecord(args) {
  return withWriterLock(() => {
    if (!args.source) throw new Error('integrity-record requires --source')
    const watch = loadJsonStrict(statePath('integrity-watch.json'), { version: 1, generatedAt: null, sources: [] })
    const existing = (watch.sources || []).find(row => row.sourceId === args.source) || { sourceId: args.source }
    const status = args.status || 'clear'
    const concern = ['retracted', 'expression_of_concern', 'major_correction', 'invalid_identifier', 'publication_status_change', 'strong_new_contradiction'].includes(status)
    const updated = {
      ...existing,
      lastCheckedAt: nowIso(),
      status,
      integrityConcern: concern,
      authoritativeUrl: args.url || existing.authoritativeUrl || null,
      note: args.note || null,
    }
    const sources = [...(watch.sources || []).filter(row => row.sourceId !== args.source), updated].sort((a, b) => a.sourceId.localeCompare(b.sourceId))
    atomicJson(statePath('integrity-watch.json'), { ...watch, generatedAt: nowIso(), sources })
    event('publication_integrity_checked', { sourceId: args.source, status, integrityConcern: concern })
    return { ok: true, source: updated }
  })
}

function improvement(args, disposition) {
  return withWriterLock(() => {
    if (!args.id && disposition === 'experimental') args.id = `imp_${crypto.randomUUID()}`
    if (!args.id) throw new Error(`improvement-${disposition} requires --id`)
    const registry = loadJsonStrict(statePath('self-improvements.json'), { version: 1, experimental: [], adopted: [], rejected: [], reverted: [] })
    const allBuckets = ['experimental', 'adopted', 'rejected', 'reverted']
    const current = allBuckets.flatMap(bucket => (registry[bucket] || []).map(row => ({ ...row, _bucket: bucket }))).find(row => row.id === args.id)
    const record = current ? { ...current } : {
      id: args.id,
      observedReason: args.reason || null,
      expectedBenefit: args.benefit || null,
      surface: args.surface || null,
      proposedAt: nowIso(),
    }
    delete record._bucket
    if (disposition === 'experimental') {
      if (!record.observedReason || !record.expectedBenefit) throw new Error('experimental improvement requires --reason and --benefit')
      if (record.surface && !contract.selfImprovement.allowedSurfaces.includes(record.surface)) throw new Error(`self-improvement surface not allowed: ${record.surface}`)
    } else if (!current) {
      throw new Error(`unknown improvement id: ${args.id}`)
    }
    if (disposition === 'adopted') {
      const benchmark = runBenchmark()
      if (!benchmark.ok) throw new Error('cannot adopt self-improvement: fixed benchmark is not green')
      record.benchmarkEvidence = args.benchmark || `${benchmark.passed}/${benchmark.total} fixed cases passed`
      record.adoptedAt = nowIso()
    }
    if (disposition === 'rejected') record.rejectedAt = nowIso()
    if (disposition === 'reverted') record.revertedAt = nowIso()
    record.status = disposition
    for (const bucket of allBuckets) registry[bucket] = (registry[bucket] || []).filter(row => row.id !== args.id)
    registry[disposition].push(record)
    registry[disposition].sort((a, b) => a.id.localeCompare(b.id))
    registry.updatedAt = nowIso()
    atomicJson(statePath('self-improvements.json'), registry)
    event('self_improvement_changed', { id: args.id, disposition, surface: record.surface || null })
    return { ok: true, improvement: record }
  })
}

function failure(args) {
  return withWriterLock(() => {
    if (!args.key) throw new Error('failure requires --key')
    const quarantine = loadJsonStrict(statePath('quarantine.json'), { version: 1, cases: [] })
    const existing = (quarantine.cases || []).find(row => row.key === args.key) || { key: args.key, consecutiveFailures: 0 }
    const next = {
      ...existing,
      consecutiveFailures: Number(existing.consecutiveFailures || 0) + 1,
      lastFailureAt: nowIso(),
      lastRootCause: args.reason || 'unknown',
    }
    const decision = quarantineDecision(next)
    next.quarantined = decision.quarantined
    next.releaseAt = decision.releaseAt || next.releaseAt || null
    next.releaseRequiresMaterialChange = contract.quarantine.releaseRequiresMaterialChange
    const cases = [...(quarantine.cases || []).filter(row => row.key !== args.key), next].sort((a, b) => a.key.localeCompare(b.key))
    atomicJson(statePath('quarantine.json'), { version: 1, cases, updatedAt: nowIso() })
    event('failure_recorded', { key: args.key, consecutiveFailures: next.consecutiveFailures, quarantined: next.quarantined, reason: next.lastRootCause })
    return { ok: true, case: next }
  })
}

function print(value) { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`) }

function printResult(value) {
  print(value)
  if (value?.ok === false) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...raw] = process.argv.slice(2)
  const args = parseArgs(raw)
  try {
    if (command === 'lease-acquire') printResult(acquire(args))
    else if (command === 'lease-release') printResult(release(args))
    else if (command === 'queue-add') printResult(queueAdd(args))
    else if (command === 'metric') printResult(metric(args))
    else if (command === 'blocker') printResult(blocker(args))
    else if (command === 'integrity-record') printResult(integrityRecord(args))
    else if (command === 'improvement-propose') printResult(improvement(args, 'experimental'))
    else if (command === 'improvement-adopt') printResult(improvement(args, 'adopted'))
    else if (command === 'improvement-reject') printResult(improvement(args, 'rejected'))
    else if (command === 'improvement-revert') printResult(improvement(args, 'reverted'))
    else if (command === 'failure') printResult(failure(args))
    else {
      console.error('Usage: control.mjs lease-acquire|lease-release|queue-add|metric|blocker|integrity-record|improvement-propose|improvement-adopt|improvement-reject|improvement-revert|failure [--key=value]')
      process.exitCode = 2
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
