import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

// Point every pipeline write at a throwaway directory before the modules that
// resolve those paths are loaded, so no test can touch a real job ledger.
const opsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'enrichment-jobstore-'))
process.env.ENRICHMENT_OPS_DIR = opsDir

const {
  JOB_STATUSES,
  assertTransition,
  claimJobs,
  getJob,
  listJobs,
  readStore,
  recordError,
  recoverStaleClaims,
  setStatus,
  statusCounts,
  syncQueue,
} = await import('../lib/job-store.mjs')
const { buildCandidate, candidatePath, listCandidates, readCandidate, writeCandidate } = await import(
  '../lib/candidates.mjs'
)
const { assertPipelineWritePath, jobsPath, opsRoot } = await import('../lib/paths.mjs')
const { filterByShard, partition, buildWorkerBrief } = await import('../lib/worker.mjs')
const { makeCanonical, makeCandidate, makeJob, publishedHerb, contract } = await import('./fixtures.mjs')

afterAll(() => {
  fs.rmSync(opsDir, { recursive: true, force: true })
})

beforeEach(() => {
  fs.rmSync(opsDir, { recursive: true, force: true })
  fs.mkdirSync(opsDir, { recursive: true })
})

const jobs = [
  makeJob({ job_id: 'job_a', slug: 'alpha' }),
  makeJob({ job_id: 'job_b', slug: 'beta' }),
  makeJob({ job_id: 'job_c', slug: 'gamma' }),
]

describe('write isolation', () => {
  it('resolves pipeline state inside the configured ops directory', () => {
    expect(path.resolve(opsRoot)).toBe(path.resolve(opsDir))
    expect(path.resolve(jobsPath).startsWith(path.resolve(opsDir))).toBe(true)
  })

  it('refuses any write target outside the pipeline state directory', () => {
    expect(() => assertPipelineWritePath('/etc/passwd')).toThrow(/Refusing to write outside/)
    expect(() => assertPipelineWritePath(path.join(opsDir, '..', 'herb_monograph_master.xlsx'))).toThrow(
      /Refusing to write outside/,
    )
    expect(() => assertPipelineWritePath(path.join(opsDir, 'candidates/x.json'))).not.toThrow()
  })

  it('refuses to write a candidate to a canonical path', () => {
    const candidate = makeCandidate()
    expect(() =>
      writeCandidate(candidate, { attempt: 1, job: makeJob() }),
    ).not.toThrow()
    expect(path.resolve(candidatePath('job_x')).startsWith(path.resolve(opsDir))).toBe(true)
  })
})

describe('queue sync', () => {
  it('adds every job on the first sync', () => {
    const summary = syncQueue(jobs)
    expect(summary.added).toBe(3)
    expect(listJobs()).toHaveLength(3)
  })

  it('is idempotent for unchanged canonical data', () => {
    syncQueue(jobs)
    const second = syncQueue(jobs)
    expect(second.added).toBe(0)
    expect(second.unchanged).toBe(3)
    expect(listJobs()).toHaveLength(3)
  })

  it('refreshes scan-derived fields without disturbing lifecycle state', () => {
    syncQueue(jobs)
    claimJobs({ worker: 'w1', limit: 1, filter: (job) => job.job_id === 'job_a' })
    syncQueue(jobs.map((job) => (job.job_id === 'job_a' ? { ...job, score: 99, priority: 'P0' } : job)))
    const job = getJob('job_a')
    expect(job.status).toBe('claimed')
    expect(job.score).toBe(99)
    expect(job.priority).toBe('P0')
  })

  it('retires a job whose gap is no longer present', () => {
    syncQueue(jobs)
    const summary = syncQueue(jobs.slice(0, 2))
    expect(summary.retired).toBe(1)
    expect(getJob('job_c').status).toBe('integrated')
  })
})

describe('claims', () => {
  it('never hands the same job to two workers', () => {
    syncQueue(jobs)
    const first = claimJobs({ worker: 'w1', limit: 3 })
    const second = claimJobs({ worker: 'w2', limit: 3 })
    expect(first).toHaveLength(3)
    expect(second).toHaveLength(0)
  })

  it('recovers a stale claim and hands it to the next worker', () => {
    syncQueue(jobs)
    let now = Date.parse('2026-01-01T00:00:00.000Z')
    const clock = () => now
    claimJobs({ worker: 'w1', limit: 1, clock })
    now += 60 * 60 * 1000
    const reclaimed = claimJobs({ worker: 'w2', limit: 1, clock })
    expect(reclaimed).toHaveLength(1)
    expect(getJob(reclaimed[0].job_id).claim.worker).toBe('w2')
  })

  it('returns stale claims to the pool without claiming them', () => {
    syncQueue(jobs)
    let now = Date.parse('2026-01-01T00:00:00.000Z')
    const clock = () => now
    claimJobs({ worker: 'w1', limit: 2, clock })
    now += 60 * 60 * 1000
    const recovered = recoverStaleClaims({ clock })
    expect(recovered).toHaveLength(2)
    expect(statusCounts().pending).toBe(3)
  })

  it('fails a job that exhausts its attempts instead of retrying forever', () => {
    syncQueue(jobs.slice(0, 1))
    for (let i = 0; i < 3; i += 1) {
      claimJobs({ worker: `w${i}`, limit: 1 })
      setStatus('job_a', 'pending', { note: 'released' })
    }
    const claimed = claimJobs({ worker: 'w-final', limit: 1 })
    expect(claimed).toHaveLength(0)
    expect(getJob('job_a').status).toBe('failed')
  })

  it('stops another worker from changing a claimed job', () => {
    syncQueue(jobs)
    claimJobs({ worker: 'w1', limit: 1, filter: (job) => job.job_id === 'job_a' })
    expect(() => setStatus('job_a', 'researching', { worker: 'w2' })).toThrow(/claimed by w1/)
  })
})

describe('lifecycle', () => {
  it('permits only declared transitions', () => {
    expect(() => assertTransition('pending', 'claimed')).not.toThrow()
    expect(() => assertTransition('pending', 'integrated')).toThrow(/Illegal job transition/)
    expect(() => assertTransition('integrated', 'pending')).toThrow(/terminal/)
    expect(() => assertTransition('pending', 'not-a-status')).toThrow(/Unknown job status/)
  })

  it('records every transition with a note', () => {
    syncQueue(jobs)
    claimJobs({ worker: 'w1', limit: 1, filter: (job) => job.job_id === 'job_a' })
    setStatus('job_a', 'researching', { worker: 'w1', note: 'started' })
    const history = getJob('job_a').history.map((h) => h.status)
    expect(history).toEqual(['pending', 'claimed', 'researching'])
  })

  it('keeps errors on the job for triage', () => {
    syncQueue(jobs)
    recordError('job_a', 'network timeout')
    expect(getJob('job_a').errors[0].message).toBe('network timeout')
  })

  it('survives process interruption because state is on disk', async () => {
    syncQueue(jobs)
    claimJobs({ worker: 'w1', limit: 1, filter: (job) => job.job_id === 'job_a' })
    // Simulate a fresh process by re-reading the ledger from disk.
    const onDisk = JSON.parse(fs.readFileSync(jobsPath, 'utf8'))
    expect(onDisk.jobs.job_a.status).toBe('claimed')
    expect(readStore().jobs.job_a.attempts).toBe(1)
  })

  it('exposes every declared status in its counts', () => {
    syncQueue(jobs)
    const counts = statusCounts()
    for (const status of JOB_STATUSES) expect(counts).toHaveProperty(status)
  })
})

describe('candidates', () => {
  it('round-trips a candidate through the isolated store', () => {
    const job = makeJob()
    const candidate = buildCandidate({
      job,
      worker: 'w1',
      changes: makeCandidate().changes,
      sources: makeCandidate().sources,
      clock: () => Date.parse('2026-01-01T00:00:00.000Z'),
    })
    const written = writeCandidate(candidate, { job })
    expect(fs.existsSync(written)).toBe(true)
    expect(readCandidate(written).job_id).toBe(job.job_id)
    expect(listCandidates()).toHaveLength(1)
  })

  it('gives a candidate a deterministic id for a given job and attempt', () => {
    const job = makeJob()
    const build = () =>
      buildCandidate({
        job,
        worker: 'w1',
        changes: makeCandidate().changes,
        sources: makeCandidate().sources,
        clock: () => 0,
      })
    expect(build().candidate_id).toBe(build().candidate_id)
  })
})

describe('sharding', () => {
  const many = Array.from({ length: 200 }, (_, i) => makeJob({ job_id: `job_${i}`, slug: `slug-${i}` }))

  it('partitions jobs into disjoint, exhaustive shards', () => {
    const shards = partition(many, 4)
    expect(shards.flat()).toHaveLength(many.length)
    const seen = new Set()
    for (const shard of shards) {
      for (const job of shard) {
        expect(seen.has(job.job_id)).toBe(false)
        seen.add(job.job_id)
      }
    }
  })

  it('assigns the same job to the same shard regardless of queue order', () => {
    const ids = (jobList) =>
      partition(jobList, 4).map((shard) => shard.map((job) => job.job_id).sort((a, b) => a.localeCompare(b)))
    expect(ids(many)).toEqual(ids([...many].reverse()))
  })

  it('rejects an out-of-range shard index', () => {
    expect(() => filterByShard(many, { shard: 4, shardCount: 4 })).toThrow(/shard must be an integer/)
    expect(() => filterByShard(many, { shard: 0, shardCount: 0 })).toThrow(/shardCount/)
  })

  it('lets two sharded workers claim without overlap', () => {
    syncQueue(many.slice(0, 20))
    const a = claimJobs({
      worker: 'w1',
      limit: 20,
      filter: (job) => filterByShard([job], { shard: 0, shardCount: 2 }).length > 0,
    })
    const b = claimJobs({
      worker: 'w2',
      limit: 20,
      filter: (job) => filterByShard([job], { shard: 1, shardCount: 2 }).length > 0,
    })
    const overlap = a.filter((job) => b.some((other) => other.job_id === job.job_id))
    expect(overlap).toHaveLength(0)
    expect(a.length + b.length).toBe(20)
  })
})

describe('worker brief', () => {
  const canonical = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: '' })])

  it('carries only the requested fields', () => {
    const brief = buildWorkerBrief({ job: makeJob(), canonical, contract })
    expect(brief.requested_fields.map((f) => f.field)).toEqual(['latin_name'])
  })

  it('never exposes a requested field twice as context', () => {
    const brief = buildWorkerBrief({
      job: makeJob({ requested_fields: ['latin_name', 'keywords'], reasons: { latin_name: 'missing', keywords: 'missing' } }),
      canonical,
      contract,
    })
    expect(Object.keys(brief.entity.context)).not.toContain('latin_name')
  })

  it('states the contract requirements the answer must meet', () => {
    const [field] = buildWorkerBrief({ job: makeJob(), canonical, contract }).requested_fields
    expect(field.min_sources).toBeGreaterThanOrEqual(1)
    expect(field.accepted_source_classes.length).toBeGreaterThan(0)
    expect(field.overwrite_policy).toBe('only-if-empty')
  })

  it('tells the worker that a no-op is a valid answer', () => {
    const brief = buildWorkerBrief({ job: makeJob(), canonical, contract })
    expect(brief.rules.join(' ')).toMatch(/no-op/)
  })
})
