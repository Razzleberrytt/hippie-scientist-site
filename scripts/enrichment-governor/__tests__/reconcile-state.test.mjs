import test from 'node:test'
import assert from 'node:assert/strict'
import { reconcileQueueWithQuarantine } from '../queue-resilience.mjs'

const config = { failureThreshold: 3, cooldownHours: 24, releaseRequiresMaterialChange: true }

test('expired leases are pruned and unrelated queued work remains', () => {
  const now = Date.parse('2026-09-04T12:00:00Z')
  const queue = {
    version: 1,
    leases: [
      { id: 'expired', entities: ['herb:sage'], expiresAt: '2026-09-04T10:00:00Z' },
      { id: 'active', entities: ['herb:kanna'], expiresAt: '2026-09-04T13:00:00Z' }
    ],
    queued: [{ key: 'ready-a' }], batched: [], blocked: []
  }
  const result = reconcileQueueWithQuarantine(queue, { version: 1, cases: [] }, config, now)
  assert.deepEqual(result.queue.leases.map(row => row.id), ['active'])
  assert.deepEqual(result.queue.queued.map(row => row.key), ['ready-a'])
  assert.equal(result.metrics.prunedExpiredLeases, 1)
})

test('quarantined item is isolated and independent items remain executable', () => {
  const now = Date.parse('2026-09-04T12:00:00Z')
  const queue = { version: 1, leases: [], queued: [{ key: 'failed-item' }, { key: 'ready-b' }], batched: [], blocked: [] }
  const quarantine = { version: 1, cases: [{ key: 'failed-item', consecutiveFailures: 3, lastFailureAt: '2026-09-04T11:00:00Z', lastRootCause: 'temporary dependency failure' }] }
  const result = reconcileQueueWithQuarantine(queue, quarantine, config, now)
  assert.deepEqual(result.queue.queued.map(row => row.key), ['ready-b'])
  assert.equal(result.queue.blocked[0].key, 'failed-item')
  assert.equal(result.queue.blocked[0].reason, 'quarantined')
})
