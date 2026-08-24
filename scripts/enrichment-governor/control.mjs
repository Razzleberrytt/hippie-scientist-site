import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

import { acquireLease, contract, quarantineDecision, runBenchmark } from './governor.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const stateDir = path.join(repoRoot, 'ops', 'enrichment-governor')
const lockPath = path.join(stateDir, '.lock')

const statePath = name => path.join(stateDir, name)
const nowIso = () => new Date().toISOString()

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function atomicJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`)
  fs.renameSync(temp, file)
}

function appendJsonl(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.appendFileSync(file, `${JSON.stringify(value)}\n`)
}

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

function withLock(fn) {
  fs.mkdirSync(stateDir, { recursive: true })
  let fd
  try {
    fd = fs.openSync(lockPath, 'wx')
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, acquiredAt: nowIso() }))
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('enrichment governor state is locked by another writer')
    throw error
  }

  let result
  let operationError = null
  try {
    result = fn()
  } catch (error) {
    operationError = error
  }

  let cleanupError = null
  try {
    fs.closeSync(fd)
  } catch (error) {
    if (error?.code !== 'EBADF') cleanupError = error
  }
  try {
    fs.unlinkSync(lockPath)
  } catch (error) {
    if (error?.code !== 'ENOENT' && !cleanupError) cleanupError = error
  }

  if (operationError) throw operationError
  if (cleanupError) throw cleanupError
  return result
}

function event(event, details = {}) {
  appendJsonl(statePath('ledger.jsonl'), { event, at: nowIso(), ...details })
}

function acquire(args) {
  return withLock(() => {
    const queue = loadJson(statePath('work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
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
  return withLock(() => {
    if (!args.id) throw new Error('lease-release requires --id')
    const queue = loadJson(statePath('work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
    const existing = (queue.leases || []).find(lease => lease.id === args.id)
    const leases = (queue.leases || []).filter(lease => lease.id !== args.id)
    atomicJson(statePath('work-queue.json'), { ...queue, leases, updatedAt: nowIso() })
    event('lease_released', { leaseId: args.id, existed: Boolean(existing), disposition: args.disposition || 'completed' })
    return { ok: true, released: Boolean(existing), leaseId: args.id }
  })
}

function queueAdd(args) {
  return withLock(() => {
    if (!args.key) throw new Error('queue-add requires --key')
    const queue = loadJson(statePath('work-queue.json'), { version: 1, leases: [], queued: [], batched: [], blocked: [] })
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
  return withLock(() => {
    if (!args.name) throw new Error('metric requires --name')
    const scoreboard = loadJson(statePath('scoreboard.json'), { version: 1, totals: {}, rates: {}, efficiency: {}, recurringBlockers: {} })
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
  return withLock(() => {
    if (!args.category) throw new Error('blocker requires --category')
    const scoreboard = loadJson(statePath('scoreboard.json'), { version: 1, totals: {}, rates: {}, efficiency: {}, recurringBlockers: {} })
    scoreboard.recurringBlockers ||= {}
    scoreboard.recurringBlockers[args.category] = Number(scoreboard.recurringBlockers[args.category] || 0) + 1
    scoreboard.updatedAt = nowIso()
    atomicJson(statePath('scoreboard.json'), scoreboard)
    event('blocker_recorded', { category: args.category, count: scoreboard.recurringBlockers[args.category], detail: args.detail || null })
    return { ok: true, category: args.category, count: scoreboard.recurringBlockers[args.category] }
  })
}

function integrityRecord(args) {
  return withLock(() => {
    if (!args.source) throw new Error('integrity-record requires --source')
    const watch = loadJson(statePath('integrity-watch.json'), { version: 1, generatedAt: null, sources: [] })
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
  return withLock(() => {
    if (!args.id && disposition === 'experimental') args.id = `imp_${crypto.randomUUID()}`
    if (!args.id) throw new Error(`improvement-${disposition} requires --id`)
    const registry = loadJson(statePath('self-improvements.json'), { version: 1, experimental: [], adopted: [], rejected: [], reverted: [] })
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
  return withLock(() => {
    if (!args.key) throw new Error('failure requires --key')
    const quarantine = loadJson(statePath('quarantine.json'), { version: 1, cases: [] })
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...raw] = process.argv.slice(2)
  const args = parseArgs(raw)
  try {
    if (command === 'lease-acquire') print(acquire(args))
    else if (command === 'lease-release') print(release(args))
    else if (command === 'queue-add') print(queueAdd(args))
    else if (command === 'metric') print(metric(args))
    else if (command === 'blocker') print(blocker(args))
    else if (command === 'integrity-record') print(integrityRecord(args))
    else if (command === 'improvement-propose') print(improvement(args, 'experimental'))
    else if (command === 'improvement-adopt') print(improvement(args, 'adopted'))
    else if (command === 'improvement-reject') print(improvement(args, 'rejected'))
    else if (command === 'improvement-revert') print(improvement(args, 'reverted'))
    else if (command === 'failure') print(failure(args))
    else {
      console.error('Usage: control.mjs lease-acquire|lease-release|queue-add|metric|blocker|integrity-record|improvement-propose|improvement-adopt|improvement-reject|improvement-revert|failure [--key=value]')
      process.exitCode = 2
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
