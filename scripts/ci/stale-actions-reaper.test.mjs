import { describe, expect, it } from 'vitest'
import { classifyRun, selectRunsForCancellation } from './stale-actions-reaper.mjs'

const NOW = Date.parse('2026-09-03T23:30:00Z')
const THRESHOLD = 6 * 60 * 60 * 1000
const ZOMBIE_SHA = 'd9713f25e205c2f4b7236a2888bef74a27a9cc7d'
const ZOMBIE_CREATED = '2026-07-13T15:39:31Z'
const zombieNames = ['CI', 'Site Health Check', 'Build Check', 'Fast UI Check', 'Lighthouse CI']

function run(overrides = {}) {
  return {
    id: 100,
    name: 'CI',
    status: 'queued',
    event: 'pull_request',
    head_branch: 'feature/stale',
    head_sha: 'stale-head',
    created_at: '2026-09-03T10:00:00Z',
    pull_requests: [],
    ...overrides,
  }
}

const options = {
  nowMs: NOW,
  thresholdMs: THRESHOLD,
  activePrHeadShas: new Set(),
  currentRunId: '9999',
}

describe('stale Actions reaper selection', () => {
  it('selects all five July orphan fixtures deterministically', () => {
    const fixtures = zombieNames.map((name, index) => run({
      id: 29263155162 - index,
      name,
      head_branch: 'seo/mental-health-pages',
      head_sha: ZOMBIE_SHA,
      created_at: ZOMBIE_CREATED,
    })).reverse()

    const decisions = selectRunsForCancellation(fixtures, options)
    expect(decisions).toHaveLength(5)
    expect(decisions.every(({ decision }) => decision.cancel)).toBe(true)
    expect(decisions.every(({ decision }) => decision.reason === 'stale-orphan-no-associated-pr')).toBe(true)
    expect(decisions.map(({ run: selected }) => selected.id)).toEqual([...fixtures].sort((a, b) => a.id - b.id).map((item) => item.id))
  })

  it('retains a current exact-head PR run even when old', () => {
    const candidate = run({ head_sha: 'active-head', pull_requests: [{ number: 123 }] })
    expect(classifyRun(candidate, { ...options, activePrHeadShas: new Set(['active-head']) })).toMatchObject({
      cancel: false,
      reason: 'open-pr-head-still-matches',
    })
  })

  it('always retains main, deploy, release, publish, and the reaper itself', () => {
    for (const candidate of [
      run({ head_branch: 'main' }),
      run({ name: 'Deploy to Cloudflare Pages' }),
      run({ name: 'Release production' }),
      run({ name: 'Publish package' }),
      run({ name: 'Stale Actions reaper' }),
    ]) {
      expect(classifyRun(candidate, options).cancel).toBe(false)
    }
  })

  it('retains the current reaper run and non-PR work', () => {
    expect(classifyRun(run({ id: 9999 }), options)).toMatchObject({ cancel: false, reason: 'current-reaper-run' })
    expect(classifyRun(run({ event: 'workflow_dispatch' }), options)).toMatchObject({ cancel: false, reason: 'non-pr-event' })
  })

  it('retains stale work whose open PR still has the same head', () => {
    const candidate = run({ head_sha: 'still-open', pull_requests: [{ number: 55 }] })
    expect(classifyRun(candidate, { ...options, activePrHeadShas: new Set(['still-open']) })).toMatchObject({
      cancel: false,
      reason: 'open-pr-head-still-matches',
    })
  })

  it('selects a stale associated run only after the PR closed or its head moved', () => {
    expect(classifyRun(run({ pull_requests: [{ number: 55 }] }), options)).toMatchObject({
      cancel: true,
      reason: 'stale-associated-pr-closed-or-head-moved',
    })
  })

  it('does not select work younger than the threshold', () => {
    expect(classifyRun(run({ created_at: '2026-09-03T22:00:00Z' }), options)).toMatchObject({
      cancel: false,
      reason: 'younger-than-threshold',
    })
  })
})
