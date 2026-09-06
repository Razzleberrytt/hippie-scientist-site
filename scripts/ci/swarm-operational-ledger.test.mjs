import assert from 'node:assert/strict'
import test from 'node:test'

import { deriveScoreboard, recordOutcome, validateState } from './swarm-operational-ledger.mjs'

function baseState() {
  return {
    version: 1,
    updatedAt: '2026-09-05T18:00:00Z',
    lanes: { lane1: null, lane2: null, lane3: null, lane4: null, lane5: null },
    activeWork: [],
    scoreboard: { shipped: 0, validated: 0, staged: 0, blocked: 0, noProgress: 0 },
  }
}

const record = {
  outcome: 'STAGED',
  canonicalWorkItem: 'issue #5337',
  rootBlocker: 'missing persistent operational memory',
  fallbackUsed: 'issue comments',
  lastMaterialChange: 'staged operational ledger contract',
  nextAction: 'admit through canonical promotion control',
  recordedAt: '2026-09-05T18:00:00Z',
}

test('accepts the canonical empty state and derives zero scoreboard', () => {
  const state = baseState()
  assert.equal(validateState(state), true)
  assert.deepEqual(deriveScoreboard(state), state.scoreboard)
})

test('records exactly one lane outcome and derives verified scoreboard', () => {
  const next = recordOutcome(baseState(), 'lane1', record)
  assert.equal(next.lanes.lane1.outcome, 'STAGED')
  assert.deepEqual(next.scoreboard, { shipped: 0, validated: 0, staged: 1, blocked: 0, noProgress: 0 })
})

test('rejects duplicate canonical active work across lanes', () => {
  const state = baseState()
  state.activeWork = [
    { canonicalKey: 'pr:5315', lane: 'lane1' },
    { canonicalKey: 'pr:5315', lane: 'lane5' },
  ]
  assert.throws(() => validateState(state), /duplicate active work/)
})

test('rejects non-terminal outcomes', () => {
  assert.throws(() => recordOutcome(baseState(), 'lane1', { ...record, outcome: 'RUNNING' }), /invalid outcome/)
})
