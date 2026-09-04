import test from 'node:test'
import assert from 'node:assert/strict'

import {
  CircuitBreaker,
  retryWithBackoff,
  runWorkerPool,
  withTimeout,
} from './runtime-resilience.js'
import { harvestMetadataBatch } from './metadata-harvester.js'

test('worker pool releases a failed item and continues processing remaining work', async () => {
  const visited = []
  const failures = []

  const results = await runWorkerPool([1, 2, 3, 4], async value => {
    visited.push(value)
    if (value === 2) throw new Error('synthetic blocker')
    return value * 10
  }, {
    concurrency: 2,
    onItemError: ({ item, error }) => failures.push({ item, message: error.message }),
  })

  assert.deepEqual([...visited].sort((a, b) => a - b), [1, 2, 3, 4])
  assert.equal(results.length, 4)
  assert.equal(results[0].value, 10)
  assert.equal(results[1].ok, false)
  assert.equal(results[2].value, 30)
  assert.equal(results[3].value, 40)
  assert.deepEqual(failures, [{ item: 2, message: 'synthetic blocker' }])
})

test('timeout converts a hung task into a bounded failure', async () => {
  await assert.rejects(
    () => withTimeout(() => new Promise(() => {}), 15, 'hung-fixture'),
    error => error?.code === 'TASK_TIMEOUT' && /hung-fixture/.test(error.message)
  )
})

test('transient failures retry with a ceiling and eventually recover', async () => {
  let attempts = 0
  const value = await retryWithBackoff(async () => {
    attempts += 1
    if (attempts < 3) {
      const error = new Error('temporary upstream failure')
      error.status = 503
      throw error
    }
    return 'recovered'
  }, {
    attempts: 4,
    baseDelayMs: 1,
    maxDelayMs: 2,
  })

  assert.equal(value, 'recovered')
  assert.equal(attempts, 3)
})

test('circuit breaker opens after repeated failures and allows a half-open probe after cooldown', () => {
  const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 100 })

  assert.equal(breaker.canRun('pubmed', 0).allowed, true)
  breaker.recordFailure('pubmed', 10)
  assert.equal(breaker.canRun('pubmed', 11).allowed, true)
  breaker.recordFailure('pubmed', 20)

  const open = breaker.canRun('pubmed', 50)
  assert.equal(open.allowed, false)
  assert.equal(open.state, 'open')

  const halfOpen = breaker.canRun('pubmed', 120)
  assert.equal(halfOpen.allowed, true)
  assert.equal(halfOpen.state, 'half_open')

  breaker.recordSuccess('pubmed')
  assert.equal(breaker.canRun('pubmed', 121).state, 'closed')
})

test('metadata batch preserves useful work when one source fails for one compound', async () => {
  const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 1_000 })

  const results = await harvestMetadataBatch({
    compounds: [{ slug: 'alpha' }, { slug: 'beta' }],
    concurrency: 2,
    timeoutMs: 100,
    breaker,
    harvestPubMed: async ({ slug }) => {
      if (slug === 'alpha') throw new Error('pubmed unavailable')
      return { articles: [{ pmid: '123456', title: 'beta trial' }] }
    },
    harvestClinicalTrials: async ({ slug }) => ({
      trial_metadata: [{ nct_id: `NCT-${slug}`, title: `${slug} trial` }],
    }),
  })

  assert.equal(results.length, 2)
  assert.equal(results[0].slug, 'alpha')
  assert.deepEqual(results[0].metadata_sources, ['clinicaltrials'])
  assert.equal(results[0].source_failures.length, 1)
  assert.equal(results[0].source_failures[0].source, 'pubmed')
  assert.equal(results[0].clinical_trials.trial_metadata.length, 1)

  assert.equal(results[1].slug, 'beta')
  assert.deepEqual(results[1].metadata_sources, ['pubmed', 'clinicaltrials'])
  assert.equal(results[1].source_failures.length, 0)
})

test('dead source is bypassed after the circuit opens while alternate source work continues', async () => {
  const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 10_000 })
  let pubmedCalls = 0
  let trialCalls = 0

  const results = await harvestMetadataBatch({
    compounds: [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }],
    concurrency: 1,
    timeoutMs: 100,
    breaker,
    harvestPubMed: async () => {
      pubmedCalls += 1
      throw new Error('source outage')
    },
    harvestClinicalTrials: async ({ slug }) => {
      trialCalls += 1
      return { trial_metadata: [{ nct_id: slug }] }
    },
  })

  assert.equal(pubmedCalls, 2)
  assert.equal(trialCalls, 3)
  assert.equal(results[2].source_failures[0].source, 'pubmed')
  assert.equal(results[2].source_failures[0].reason, 'circuit_open')
  assert.equal(results[2].source_failures[0].skipped, true)
  assert.deepEqual(results.map(row => row.metadata_sources), [
    ['clinicaltrials'],
    ['clinicaltrials'],
    ['clinicaltrials'],
  ])
})
