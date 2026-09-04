import test from 'node:test'
import assert from 'node:assert/strict'

import {
  evaluateQuarantine,
  reconcileQueueWithQuarantine,
  releaseQuarantineRecord,
} from '../queue-resilience.mjs'

const config = {
  failureThreshold: 3,
  cooldownHours: 72,
  releaseRequiresMaterialChange: true,
}

const HOUR = 3_600_000

test('quarantine remains durable after cooldown and becomes review-eligible instead of auto-releasing', () => {
  const lastFailureAt = new Date(1_000_000).toISOString()
  const decision = evaluateQuarantine({
    key: 'compound:fixture',
    consecutiveFailures: 3,
    lastFailureAt,
  }, config, 1_000_000 + 73 * HOUR)

  assert.equal(decision.quarantined, true)
  assert.equal(decision.reviewEligible, true)
  assert.equal(decision.reason, 'material_change_review_required')
})

test('quarantine release requires both cooldown completion and documented material change', () => {
  const record = {
    key: 'compound:fixture',
    consecutiveFailures: 3,
    lastFailureAt: new Date(1_000_000).toISOString(),
    quarantined: true,
  }

  const early = releaseQuarantineRecord(record, {
    config,
    materialChange: 'new authoritative source added',
    now: 1_000_000 + 24 * HOUR,
  })
  assert.equal(early.ok, false)
  assert.equal(early.code, 'cooldown_active')

  const undocumented = releaseQuarantineRecord(record, {
    config,
    now: 1_000_000 + 73 * HOUR,
  })
  assert.equal(undocumented.ok, false)
  assert.equal(undocumented.code, 'material_change_required')

  const released = releaseQuarantineRecord(record, {
    config,
    materialChange: 'new authoritative source added and identity conflict resolved',
    now: 1_000_000 + 73 * HOUR,
  })
  assert.equal(released.ok, true)
  assert.equal(released.released, true)
  assert.equal(released.record.quarantined, false)
  assert.equal(released.record.consecutiveFailures, 0)
  assert.match(released.record.releaseMaterialChange, /identity conflict resolved/)
})

test('queue reconciliation removes quarantined work but preserves unrelated executable work', () => {
  const now = 1_000_000 + HOUR
  const queue = {
    version: 1,
    leases: [
      { id: 'expired', expiresAt: new Date(now - 1).toISOString() },
      { id: 'active', expiresAt: new Date(now + HOUR).toISOString() },
    ],
    queued: [
      { key: 'compound:blocked', score: 100 },
      { key: 'compound:ready', score: 80 },
    ],
    batched: [
      { key: 'compound:blocked' },
      { key: 'compound:batch-ready' },
    ],
    blocked: [{ key: 'other:block', reason: 'manual' }],
  }
  const quarantine = {
    version: 1,
    cases: [{
      key: 'compound:blocked',
      consecutiveFailures: 3,
      lastFailureAt: new Date(now - HOUR).toISOString(),
      lastRootCause: 'source timeout',
    }],
  }

  const result = reconcileQueueWithQuarantine(queue, quarantine, config, now)

  assert.deepEqual(result.queue.leases.map(row => row.id), ['active'])
  assert.deepEqual(result.queue.queued.map(row => row.key), ['compound:ready'])
  assert.deepEqual(result.queue.batched.map(row => row.key), ['compound:batch-ready'])
  assert.ok(result.queue.blocked.some(row => row.key === 'compound:blocked' && row.reason === 'quarantined'))
  assert.ok(result.queue.blocked.some(row => row.key === 'other:block' && row.reason === 'manual'))
  assert.equal(result.metrics.prunedExpiredLeases, 1)
  assert.equal(result.metrics.quarantinedQueuedItems, 1)
  assert.equal(result.metrics.quarantinedBatchedItems, 1)
})

test('below-threshold failure does not remove useful work from the queue', () => {
  const now = 5_000_000
  const result = reconcileQueueWithQuarantine({
    version: 1,
    leases: [],
    queued: [{ key: 'compound:retryable', score: 90 }],
    batched: [],
    blocked: [],
  }, {
    version: 1,
    cases: [{
      key: 'compound:retryable',
      consecutiveFailures: 2,
      lastFailureAt: new Date(now).toISOString(),
    }],
  }, config, now)

  assert.deepEqual(result.queue.queued.map(row => row.key), ['compound:retryable'])
  assert.equal(result.queue.blocked.length, 0)
})
