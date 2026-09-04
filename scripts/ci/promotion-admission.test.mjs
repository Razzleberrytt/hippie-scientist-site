import assert from 'node:assert/strict'
import test from 'node:test'

import {
  canAutoRefreshPromotionPr,
  isHeldPromotionPr,
  isSameRepoMainPr,
  planPromotionState,
  shouldStageStalePromotion,
} from './promotion-admission.mjs'

const repo = 'Razzleberrytt/hippie-scientist-site'

function pr(number, {
  draft = true,
  labels = [],
  createdAt = `2026-09-04T19:${String(number % 60).padStart(2, '0')}:00Z`,
  repository = repo,
  base = 'main',
  state = 'open',
} = {}) {
  return {
    number,
    state,
    draft,
    created_at: createdAt,
    labels: labels.map(name => ({ name })),
    base: { ref: base },
    head: {
      sha: String(number).padStart(40, '0'),
      repo: { full_name: repository },
    },
  }
}

test('held labels are hard promotion exclusions', () => {
  for (const label of ['hold-merge', 'do-not-merge', 'manual-merge']) {
    assert.equal(isHeldPromotionPr(pr(1, { labels: [label] })), true)
  }
  assert.equal(isHeldPromotionPr(pr(2)), false)
})

test('promotion scope is open same-repository PRs targeting main', () => {
  assert.equal(isSameRepoMainPr(pr(1), repo), true)
  assert.equal(isSameRepoMainPr(pr(2, { repository: 'someone/fork' }), repo), false)
  assert.equal(isSameRepoMainPr(pr(3, { base: 'release' }), repo), false)
  assert.equal(isSameRepoMainPr(pr(4, { state: 'closed' }), repo), false)
})

test('workflow-control PRs require clean restage instead of automatic refresh', () => {
  assert.equal(canAutoRefreshPromotionPr(['content/articles/example.mdx']), true)
  assert.equal(canAutoRefreshPromotionPr(['scripts/ci/promotion-admission.mjs']), true)
  assert.equal(canAutoRefreshPromotionPr(['.github/workflows/ci.yml']), false)
  assert.equal(
    canAutoRefreshPromotionPr(['content/articles/example.mdx', '.github/workflows/check.yml']),
    false,
  )
})

test('stale active promotions always release the global token', () => {
  assert.equal(shouldStageStalePromotion({ exact: true }), false)
  assert.equal(shouldStageStalePromotion({ exact: false }), true)
  assert.equal(shouldStageStalePromotion({}), true)
})

test('one existing non-draft PR keeps the promotion token and other ready PRs are staged', () => {
  const plan = planPromotionState({
    repository: repo,
    pulls: [
      pr(40, { draft: false, createdAt: '2026-09-04T19:40:00Z' }),
      pr(20, { draft: false, createdAt: '2026-09-04T19:20:00Z' }),
      pr(50, { draft: true, createdAt: '2026-09-04T19:50:00Z' }),
    ],
  })

  assert.equal(plan.active.number, 20)
  assert.deepEqual(plan.stageNumbers, [40])
  assert.deepEqual(plan.draftCandidates, [])
})

test('held ready PRs are staged and do not consume the next promotion slot', () => {
  const plan = planPromotionState({
    repository: repo,
    pulls: [
      pr(10, { draft: false, labels: ['hold-merge'] }),
      pr(11, { draft: true, createdAt: '2026-09-04T19:11:00Z' }),
      pr(12, { draft: true, createdAt: '2026-09-04T19:12:00Z' }),
    ],
  })

  assert.equal(plan.active, null)
  assert.deepEqual(plan.stageNumbers, [10])
  assert.deepEqual(plan.draftCandidates.map(candidate => candidate.number), [11, 12])
})

test('draft candidates are deterministic FIFO and fork or non-main PRs are ignored', () => {
  const plan = planPromotionState({
    repository: repo,
    pulls: [
      pr(30, { createdAt: '2026-09-04T19:30:00Z' }),
      pr(10, { createdAt: '2026-09-04T19:10:00Z' }),
      pr(5, { repository: 'someone/fork', createdAt: '2026-09-04T19:05:00Z' }),
      pr(6, { base: 'release', createdAt: '2026-09-04T19:06:00Z' }),
    ],
  })

  assert.equal(plan.active, null)
  assert.deepEqual(plan.stageNumbers, [])
  assert.deepEqual(plan.draftCandidates.map(candidate => candidate.number), [10, 30])
})
