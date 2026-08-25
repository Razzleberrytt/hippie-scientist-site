import test from 'node:test'
import assert from 'node:assert/strict'

import { authorizeLeaseRelease } from '../control.mjs'

const queue = {
  version: 1,
  leases: [
    {
      id: 'lease-lane-1',
      owner: 'site-swarm-lane-1',
      purpose: 'governor-reliability',
      files: ['scripts/enrichment-governor/control.mjs'],
      entities: [],
    },
  ],
}

test('lease release requires an owner identity', () => {
  const result = authorizeLeaseRelease(queue, { id: 'lease-lane-1' })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'missing_owner')
})

test('lease release rejects a different owner and keeps the lease eligible to remain intact', () => {
  const result = authorizeLeaseRelease(queue, {
    id: 'lease-lane-1',
    owner: 'site-swarm-lane-2',
  })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'owner_mismatch')
  assert.equal(result.lease.id, 'lease-lane-1')
  assert.equal(queue.leases.length, 1)
})

test('lease release authorizes the matching owner', () => {
  const result = authorizeLeaseRelease(queue, {
    id: 'lease-lane-1',
    owner: 'site-swarm-lane-1',
  })
  assert.equal(result.ok, true)
  assert.equal(result.released, true)
  assert.equal(result.lease.owner, 'site-swarm-lane-1')
})

test('release of an absent lease is idempotent when owner is supplied', () => {
  const result = authorizeLeaseRelease(queue, {
    id: 'lease-already-gone',
    owner: 'site-swarm-lane-1',
  })
  assert.deepEqual(result, { ok: true, released: false, lease: null })
})
