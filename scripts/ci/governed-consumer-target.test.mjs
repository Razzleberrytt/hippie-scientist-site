import assert from 'node:assert/strict'
import { it as test } from 'vitest'
import { consumerTargetStatus, dispatchCurrentConsumer } from './governed-consumer-target.mjs'

const sha = 'a'.repeat(40)
const context = { repo: 'owner/site', sourceSha: sha, headRef: 'fix/example', prNumber: '12' }
const pr = { state: 'open', head: { sha, ref: context.headRef, repo: { full_name: context.repo } } }
const dispatch = { workflow: 'build-check.yml', payload: { ref: context.headRef, inputs: { producer_sha: sha } } }

test('current exact-head PR and main targets remain eligible', async () => {
  assert.equal(await consumerTargetStatus(context, async () => pr), 'current')
  assert.equal(await consumerTargetStatus({ ...context, prNumber: '', headRef: 'main' }, async () => ({ commit: { sha } })), 'current')
})

test('closed and superseded targets are obsolete', async () => {
  assert.equal(await consumerTargetStatus(context, async () => ({ ...pr, state: 'closed' })), 'obsolete')
  assert.equal(await consumerTargetStatus(context, async () => ({ ...pr, head: { ...pr.head, sha: 'b'.repeat(40) } })), 'obsolete')
  assert.equal(await consumerTargetStatus({ ...context, prNumber: '', headRef: 'main' }, async () => ({ commit: { sha: 'b'.repeat(40) } })), 'obsolete')
})

test('closed producers never dispatch a consumer', async () => {
  const requests = []
  assert.equal(await dispatchCurrentConsumer(context, dispatch, async (path, options) => {
    requests.push({ path, options })
    return { ...pr, state: 'closed' }
  }), 'obsolete')
  assert.equal(requests.length, 1)
  assert.equal(requests[0].options, undefined)
})

test('current dispatch preserves the existing producer payload', async () => {
  let posted
  assert.equal(await dispatchCurrentConsumer(context, dispatch, async (path, options) => {
    if (!options) return pr
    posted = { path, options }
  }), 'current')
  assert.equal(posted.path, '/repos/owner/site/actions/workflows/build-check.yml/dispatches')
  assert.deepEqual(posted.options, { method: 'POST', body: dispatch.payload })
})

test('a missing-ref 422 race is obsolete only after fresh API proof', async () => {
  let reads = 0
  const error = Object.assign(new Error('No ref found for: fix/example'), { status: 422 })
  assert.equal(await dispatchCurrentConsumer(context, dispatch, async (_path, options) => {
    if (options) throw error
    return ++reads === 1 ? pr : { ...pr, state: 'closed' }
  }), 'obsolete')
  assert.equal(reads, 2)
  await assert.rejects(dispatchCurrentConsumer(context, dispatch, async (_path, options) => {
    if (options) throw error
    return pr
  }), (actual) => actual === error)
})

test('authentication, infrastructure and unrelated 422 errors stay visible', async () => {
  for (const [status, message] of [[403, 'Forbidden'], [503, 'Unavailable'], [422, 'Invalid inputs']]) {
    let reads = 0
    const error = Object.assign(new Error(message), { status })
    await assert.rejects(dispatchCurrentConsumer(context, dispatch, async (_path, options) => {
      if (options) throw error
      reads++
      return pr
    }), (actual) => actual === error)
    assert.equal(reads, 1)
  }
})

test('missing API evidence, foreign heads and invalid input fail closed', async () => {
  for (const response of [{}, { ...pr, head: {} }, { ...pr, head: { ...pr.head, repo: { full_name: 'foreign/site' } } }]) {
    await assert.rejects(consumerTargetStatus(context, async () => response))
  }
  await assert.rejects(consumerTargetStatus({ ...context, sourceSha: '' }, async () => pr))
  await assert.rejects(consumerTargetStatus(context, async () => { throw new Error('API read failed') }))
})
