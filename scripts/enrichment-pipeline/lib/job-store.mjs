import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assertPipelineWritePath, jobsPath, opsRoot, relative } from './paths.mjs'

/**
 * Persistent job lifecycle.
 *
 * The store is a single JSON ledger under ops/enrichment. Every mutation goes
 * through `withStore`, which takes a directory lock, re-reads from disk, applies
 * the change, and writes atomically through a temp file + rename. That makes the
 * ledger safe for several workers in separate processes and means an
 * interrupted run never leaves a half-written file behind — the worst case is
 * that the interrupted job keeps its previous status and is recovered as a
 * stale claim.
 */

export const JOB_STATUSES = [
  'pending',
  'claimed',
  'researching',
  'candidate_ready',
  'validated',
  'accepted',
  'needs_review',
  'rejected',
  'integrated',
  'failed',
]

/** Allowed status transitions. Anything else is rejected with an explicit error. */
export const TRANSITIONS = {
  pending: ['claimed', 'rejected', 'failed'],
  claimed: ['researching', 'pending', 'failed', 'rejected'],
  researching: ['candidate_ready', 'pending', 'failed', 'rejected'],
  candidate_ready: ['validated', 'needs_review', 'rejected', 'failed', 'pending'],
  validated: ['accepted', 'needs_review', 'rejected', 'pending'],
  accepted: ['integrated', 'needs_review', 'rejected'],
  needs_review: ['accepted', 'rejected', 'pending'],
  rejected: ['pending'],
  integrated: [],
  failed: ['pending', 'rejected'],
}

/** Statuses a worker may claim from. */
export const CLAIMABLE = new Set(['pending'])

/** A claim older than this is treated as abandoned and returned to the queue. */
export const DEFAULT_STALE_CLAIM_MS = 30 * 60 * 1000

export const MAX_ATTEMPTS = 3

const LOCK_DIR = path.join(opsRoot, '.lock')
const LOCK_STALE_MS = 60 * 1000

function nowIso(clock = Date.now) {
  return new Date(clock()).toISOString()
}

function ensureOps() {
  fs.mkdirSync(opsRoot, { recursive: true })
}

function acquireLock({ timeoutMs = 10_000, clock = Date.now } = {}) {
  ensureOps()
  const deadline = clock() + timeoutMs
  for (;;) {
    try {
      fs.mkdirSync(LOCK_DIR)
      fs.writeFileSync(path.join(LOCK_DIR, 'owner'), String(process.pid), 'utf8')
      return
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
      let age = 0
      try {
        age = clock() - fs.statSync(LOCK_DIR).mtimeMs
      } catch {
        continue
      }
      if (age > LOCK_STALE_MS) {
        fs.rmSync(LOCK_DIR, { recursive: true, force: true })
        continue
      }
      if (clock() > deadline) {
        throw new Error(
          `Timed out waiting for the enrichment job lock (${relative(LOCK_DIR)}). ` +
            `Remove it if no worker is running.`,
        )
      }
      // Busy-wait briefly; contention here is between a handful of local
      // workers, not a hot path.
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25)
    }
  }
}

function releaseLock() {
  fs.rmSync(LOCK_DIR, { recursive: true, force: true })
}

export function emptyStore() {
  return { store_version: 1, updated_at: null, jobs: {} }
}

export function readStore() {
  if (!fs.existsSync(jobsPath)) return emptyStore()
  try {
    const parsed = JSON.parse(fs.readFileSync(jobsPath, 'utf8'))
    if (parsed?.store_version !== 1) throw new Error('store_version must equal 1')
    return parsed
  } catch (error) {
    throw new Error(`Cannot read job store ${relative(jobsPath)}: ${error.message}`)
  }
}

function writeStoreAtomic(store) {
  assertPipelineWritePath(jobsPath)
  ensureOps()
  const tmp = path.join(os.tmpdir(), `enrichment-jobs-${process.pid}-${Math.abs(hashCode(JSON.stringify(store)))}.json`)
  fs.writeFileSync(tmp, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
  fs.copyFileSync(tmp, `${jobsPath}.tmp`)
  fs.rmSync(tmp, { force: true })
  fs.renameSync(`${jobsPath}.tmp`, jobsPath)
}

function hashCode(text) {
  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0
  }
  return hash
}

/** Run `mutate` against the on-disk store under the lock, then persist it. */
export function withStore(mutate, { clock = Date.now } = {}) {
  acquireLock({ clock })
  try {
    const store = readStore()
    const result = mutate(store)
    store.updated_at = nowIso(clock)
    writeStoreAtomic(store)
    return result
  } finally {
    releaseLock()
  }
}

export function assertTransition(from, to) {
  if (!JOB_STATUSES.includes(to)) {
    throw new Error(`Unknown job status "${to}". Known: ${JOB_STATUSES.join(', ')}`)
  }
  if (from === to) return
  const allowed = TRANSITIONS[from] || []
  if (!allowed.includes(to)) {
    throw new Error(
      `Illegal job transition ${from} -> ${to}. Allowed from ${from}: ${allowed.join(', ') || '(terminal)'}`,
    )
  }
}

/**
 * Merge a freshly scanned queue into the store.
 *
 * Jobs are keyed by their deterministic id, so a rescan of unchanged canonical
 * data reconciles cleanly: work already done keeps its status and history, and
 * a job whose gap has since been filled is retired rather than re-run.
 */
export function syncQueue(jobs, { clock = Date.now, retireMissing = true } = {}) {
  return withStore((store) => {
    const seen = new Set()
    const summary = { added: 0, refreshed: 0, retired: 0, unchanged: 0 }

    for (const job of jobs) {
      seen.add(job.job_id)
      const existing = store.jobs[job.job_id]
      if (!existing) {
        store.jobs[job.job_id] = {
          ...job,
          status: 'pending',
          attempts: 0,
          claim: null,
          candidate_path: null,
          history: [{ at: nowIso(clock), status: 'pending', note: 'queued by scan' }],
          errors: [],
        }
        summary.added += 1
        continue
      }

      // Refresh the scan-derived fields but never touch lifecycle state.
      const before = JSON.stringify({
        priority: existing.priority,
        score: existing.score,
        current_values: existing.current_values,
        reasons: existing.reasons,
      })
      Object.assign(existing, {
        priority: job.priority,
        score: job.score,
        field_priority: job.field_priority,
        value_signals: job.value_signals,
        risk_band: job.risk_band,
        risk_reasons: job.risk_reasons,
        reasons: job.reasons,
        current_values: job.current_values,
        budget: job.budget,
        row_number: job.row_number,
      })
      const after = JSON.stringify({
        priority: existing.priority,
        score: existing.score,
        current_values: existing.current_values,
        reasons: existing.reasons,
      })
      if (before === after) summary.unchanged += 1
      else summary.refreshed += 1
    }

    if (retireMissing) {
      for (const [id, job] of Object.entries(store.jobs)) {
        if (seen.has(id)) continue
        if (job.status === 'integrated' || job.status === 'retired') continue
        job.status_before_retire = job.status
        job.status = 'integrated'
        job.history.push({
          at: nowIso(clock),
          status: 'integrated',
          note: 'gap no longer present in canonical data; retired by rescan',
        })
        summary.retired += 1
      }
    }

    return summary
  }, { clock })
}

/**
 * Claim up to `limit` jobs for a worker. Claims are exclusive: a job already
 * claimed by a live worker is skipped, and a claim older than `staleMs` is
 * reclaimed automatically so a killed worker does not strand its work.
 */
export function claimJobs({
  worker,
  limit = 1,
  filter = () => true,
  staleMs = DEFAULT_STALE_CLAIM_MS,
  clock = Date.now,
} = {}) {
  if (!worker) throw new Error('claimJobs requires a worker id')

  return withStore((store) => {
    const claimed = []
    const now = clock()

    const candidates = Object.values(store.jobs)
      .filter((job) => {
        if (!filter(job)) return false
        if (CLAIMABLE.has(job.status)) return true
        if (job.status === 'claimed' || job.status === 'researching') {
          const claimedAt = job.claim ? Date.parse(job.claim.at) : 0
          return now - claimedAt > staleMs
        }
        return false
      })
      .sort((a, b) => a.job_id.localeCompare(b.job_id))

    for (const job of candidates) {
      if (claimed.length >= limit) break
      if (job.status !== 'pending') {
        job.history.push({
          at: nowIso(clock),
          status: 'pending',
          note: `stale claim by ${job.claim?.worker ?? 'unknown'} recovered`,
        })
        job.status = 'pending'
      }
      if (job.attempts >= MAX_ATTEMPTS) {
        transition(job, 'failed', `exceeded ${MAX_ATTEMPTS} attempts`, clock)
        continue
      }
      job.attempts += 1
      job.claim = { worker, at: nowIso(clock), attempt: job.attempts }
      transition(job, 'claimed', `claimed by ${worker}`, clock)
      claimed.push(job)
    }

    return claimed.map((job) => structuredClone(job))
  }, { clock })
}

function transition(job, status, note, clock = Date.now) {
  assertTransition(job.status, status)
  job.status = status
  job.history.push({ at: nowIso(clock), status, note })
}

export function setStatus(jobId, status, { note = '', worker = null, patch = {}, clock = Date.now } = {}) {
  return withStore((store) => {
    const job = store.jobs[jobId]
    if (!job) throw new Error(`Unknown job ${jobId}`)
    if (worker && job.claim && job.claim.worker !== worker) {
      throw new Error(
        `Job ${jobId} is claimed by ${job.claim.worker}; worker ${worker} may not change its status`,
      )
    }
    Object.assign(job, patch)
    transition(job, status, note, clock)
    if (status === 'pending' || status === 'failed') job.claim = null
    return structuredClone(job)
  }, { clock })
}

export function recordError(jobId, message, { clock = Date.now } = {}) {
  return withStore((store) => {
    const job = store.jobs[jobId]
    if (!job) throw new Error(`Unknown job ${jobId}`)
    job.errors.push({ at: nowIso(clock), message: String(message) })
    return structuredClone(job)
  }, { clock })
}

/** Return stale claims to the pool without claiming them. */
export function recoverStaleClaims({ staleMs = DEFAULT_STALE_CLAIM_MS, clock = Date.now } = {}) {
  return withStore((store) => {
    const now = clock()
    const recovered = []
    for (const job of Object.values(store.jobs)) {
      if (job.status !== 'claimed' && job.status !== 'researching') continue
      const claimedAt = job.claim ? Date.parse(job.claim.at) : 0
      if (now - claimedAt <= staleMs) continue
      job.history.push({
        at: nowIso(clock),
        status: 'pending',
        note: `stale claim by ${job.claim?.worker ?? 'unknown'} recovered`,
      })
      job.status = 'pending'
      job.claim = null
      recovered.push(job.job_id)
    }
    return recovered
  }, { clock })
}

export function listJobs(filter = () => true) {
  return Object.values(readStore().jobs).filter(filter)
}

export function getJob(jobId) {
  return readStore().jobs[jobId] || null
}

export function statusCounts() {
  const counts = Object.fromEntries(JOB_STATUSES.map((s) => [s, 0]))
  for (const job of Object.values(readStore().jobs)) {
    counts[job.status] = (counts[job.status] || 0) + 1
  }
  return counts
}
