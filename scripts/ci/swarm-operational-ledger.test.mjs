import assert from 'node:assert/strict'
import test from 'node:test'
import {
  deriveScoreboard,
  recordOutcome,
  validateState,
} from './swarm-operational-ledger.mjs'
function baseState() {
  return {
    version: 2,
    updatedAt: '2026-09-05T18:00:00Z',
    lanes: {
      'discovery-seo': null,
      'revenue-conversion': null,
      'authority-content': null,
    },
    activeWork: [],
    scoreboard: {
      shipped: 0,
      validated: 0,
      staged: 0,
      blocked: 0,
      noProgress: 0,
    },
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
test('records exactly one workstream outcome and derives verified scoreboard', () => {
  const next = recordOutcome(
    baseState(),
    'discovery-seo',
    record,
  )
  assert.equal(next.lanes['discovery-seo'].outcome, 'STAGED')
  assert.deepEqual(next.scoreboard, {
    shipped: 0,
    validated: 0,
    staged: 1,
    blocked: 0,
    noProgress: 0,
  })
})
test('rejects duplicate canonical active work across workstreams', () => {
  const state = baseState()
  state.activeWork = [
    {
      canonicalKey: 'pr:5315',
      lane: 'discovery-seo',
    },
    {
      canonicalKey: 'pr:5315',
      lane: 'authority-content',
    },
  ]
  assert.throws(
    () => validateState(state),
    /duplicate active work/,
  )
})
test('rejects multiple active items in the same workstream', () => {
  const state = baseState()
  state.activeWork = [
    {
      canonicalKey: 'pr:5315',
      lane: 'discovery-seo',
    },
    {
      canonicalKey: 'pr:5436',
      lane: 'discovery-seo',
    },
  ]
  assert.throws(
    () => validateState(state),
    /multiple active work items in workstream/,
  )
})
test('rejects more than three active implementation work items', () => {
  const state = baseState()
  state.activeWork = [
    {
      canonicalKey: 'pr:5315',
      lane: 'discovery-seo',
    },
    {
      canonicalKey: 'pr:5436',
      lane: 'revenue-conversion',
    },
    {
      canonicalKey: 'pr:5440',
      lane: 'authority-content',
    },
    {
      canonicalKey: 'pr:5441',
      lane: 'invalid-extra-slot',
    },
  ]
  assert.throws(
    () => validateState(state),
    /workstream WIP cap exceeded/,
  )
})
test('rejects non-terminal outcomes', () => {
  assert.throws(
    () =>
      recordOutcome(
        baseState(),
        'discovery-seo',
        {
          ...record,
          outcome: 'RUNNING',
        },
      ),
    /invalid outcome/,
  )
})
