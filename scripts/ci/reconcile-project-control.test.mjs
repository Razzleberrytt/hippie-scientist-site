import { describe, expect, it } from 'vitest'
import { CONTROL_PATHS, collectGitHubState, parseControlDocument, reconcile, requiredReferences } from './reconcile-project-control.mjs'

const repository = 'example/site'
const revision = 'a'.repeat(40)
const now = '2026-08-28T03:10:13.542Z'
const milestones = '| M0 | In progress |\n| M1 | In progress |\n| M2 | Blocked |\n' +
  [3, 4, 5, 6].map((n) => '| M' + n + ' | Not started |').join('\n')
const chain = '**Control dependencies:** #10 <- #9; #20 <- #10'
const activeRow = '| #10 / PR #11 | Task | O | In Review |'
function fixture({ rows = [activeRow], exception = '', milestoneText = milestones, dependencyText = chain } = {}) {
  const activeSprint = rows.map((row) => {
    const cells = row.split('|').slice(1, -1)
    return '| O |' + cells[0] + '|' + cells[1] + '|' + cells[3] + '| proof |'
  }).join('\n')
  const source = [
    '**WIP cap:** 3\n' + exception + '\n' + milestoneText + '\n' + dependencyText +
      '\n## Active\n' + activeSprint + '\n## Ready next\n### 1. #20 next ticket',
    '**WIP cap:** 3\n' + exception + '\n' + milestones + '\n' + chain +
      '\n## Now\n' + rows.join('\n') + '\n## Next\n| #20 | Next | O | Ready after #10 |',
    milestones + '\n' + chain,
  ]
  const documents = source.map((text, i) => parseControlDocument(CONTROL_PATHS[i], text))
  const records = Object.fromEntries(requiredReferences(documents).map((n) => [n, { kind: 'issue', state: 'open' }]))
  records[9] = { kind: 'pr', state: 'closed', merged: true }
  records[11] = { kind: 'pr', state: 'open', merged: false }
  return { documents, snapshot: { version: 1, available: true, repository, revision, records, openPulls: [{ number: 11, closes: [10] }] }, repository, revision, now }
}

describe('authoritative project-control reconciliation', () => {
  it('parses active/ready references, ignores history, and reports deterministic proof', () => {
    const input = fixture()
    const report = reconcile(input)
    expect(report.state).toBe('PASS')
    expect(report.wip).toBe(1)
    expect(report.admission).toBe('available')
    expect(report.waiting).toEqual(['#20 waiting for #10'])
    expect(reconcile(input)).toEqual(report)
    const parsed = parseControlDocument(CONTROL_PATHS[0],
      '**WIP cap:** 3\n' + milestones + '\n' + chain + '\n## Active\n| O | #10 / PR #11 | T | In Review |\n## Ready next\n### #20 Next\n## History\n| O | #99 | T | Completed |')
    expect(parsed.active[0].refs).toEqual([10, 11])
    expect(requiredReferences([parsed])).not.toContain(99)
  })
  it('fails a merged owning PR and a closed active issue', () => {
    for (const ref of [10, 11]) {
      const input = fixture()
      input.snapshot.records[ref].state = 'closed'
      if (ref === 11) input.snapshot.records[ref].merged = true
      expect(reconcile(input).state).toBe('DRIFT')
      expect(reconcile(input).findings.join(' ')).toContain('closed/merged active reference #' + ref)
    }
  })
  it('does not count explicitly completed/historical active rows', () => {
    const input = fixture({ rows: [activeRow, '| #30 | History | O | Completed |'] })
    expect(reconcile(input).wip).toBe(1)
    expect(reconcile(input).state).toBe('PASS')
  })
  it('rejects duplicate active ownership and competing open PR owners', () => {
    const duplicate = fixture({ rows: [activeRow, activeRow] })
    expect(reconcile(duplicate).findings.join(' ')).toContain('duplicate active ownership #10')
    const input = fixture()
    input.snapshot.openPulls.push({ number: 12, closes: [10] })
    expect(reconcile(input).findings.join(' ')).toContain('Duplicate open PR ownership')
  })
  it('detects an unrecorded owning PR and cross-document ownership drift', () => {
    const input = fixture()
    input.snapshot.openPulls = [{ number: 12, closes: [10] }]
    expect(reconcile(input).findings.join(' ')).toContain('unrecorded owning PR #12')
    input.documents[1].active = []
    expect(reconcile(input).findings.join(' ')).toContain('active ownership disagrees')
  })
  it('rejects unbounded WIP overflow; valid temporary exception never admits work', () => {
    const rows = [activeRow, ...[30, 40, 50].map((n) => '| #' + n + ' | Task | O | In Progress |')]
    expect(reconcile(fixture({ rows })).findings.join(' ')).toContain('WIP exceeds normal cap')
    const exception = '**WIP exception:** owner=#10; maximum=4; expires=2026-08-29T00:00:00Z; admission=blocked; reason=Incident repair'
    const input = fixture({ rows, exception })
    expect(reconcile(input).state).toBe('PASS')
    expect(reconcile(input).admission).toBe('blocked')
    input.now = '2026-08-30T00:00:00Z'
    expect(reconcile(input).findings.join(' ')).toContain('exception expired')
    input.documents[0].exception.maximum = 3
    expect(reconcile(input).state).toBe('DRIFT')
  })
  it('blocks admission at the normal cap without falsely calling it overflow', () => {
    const rows = [activeRow, ...[30, 40].map((n) => '| #' + n + ' | Task | O | In Review |')]
    const report = reconcile(fixture({ rows }))
    expect(report.state).toBe('PASS')
    expect(report.admission).toBe('blocked')
  })
  it('rejects milestone and immediate dependency contradictions', () => {
    const input = fixture({ milestoneText: milestones.replace('M1 | In progress', 'M1 | Complete') })
    expect(reconcile(input).findings.join(' ')).toContain('milestone M1 contradicts roadmap')
    expect(reconcile(fixture({ dependencyText: chain.replace('#9', '#8') })).findings.join(' ')).toContain('dependency chain contradicts roadmap')
  })
  it('rejects dependency cycles and active work with unfinished prerequisites', () => {
    const input = fixture()
    input.snapshot.records[9] = { kind: 'pr', state: 'closed', merged: false }
    expect(reconcile(input).findings.join(' ')).toContain('unmet dependencies')
    for (const document of input.documents) document.dependencies = { 10: [20], 20: [10] }
    expect(reconcile(input).findings.join(' ')).toContain('Dependency cycle')
  })
  it('rejects stale ready entries and active/ready overlap', () => {
    const input = fixture()
    input.snapshot.records[20].state = 'closed'
    expect(reconcile(input).findings.join(' ')).toContain('closed/merged queued reference #20')
    input.documents[0].ready.push(input.documents[0].active[0])
    expect(reconcile(input).findings.join(' ')).toContain('both active and ready')
  })
  it('never reports PASS for missing, partial, malformed, wrong-revision, or wrong-repository evidence', () => {
    const input = fixture()
    const bad = [
      undefined, { ...input.snapshot, available: false }, { ...input.snapshot, records: {} },
      { ...input.snapshot, revision: 'b'.repeat(40) }, { ...input.snapshot, repository: 'other/site' },
      { ...input.snapshot, openPulls: [{}] },
    ]
    for (const snapshot of bad) {
      const report = reconcile({ ...input, snapshot })
      expect(report.state).toBe('UNKNOWN')
      expect(report.admission).toBe('blocked')
      expect(report.waiting.join(' ')).toContain('Unknown/waiting')
    }
  })
  it('fails malformed/missing control sections rather than parsing an empty queue as healthy', () => {
    const input = fixture()
    input.documents[0] = parseControlDocument(CONTROL_PATHS[0], '# Empty document')
    expect(reconcile(input).state).not.toBe('PASS')
    expect(reconcile(input).findings.join(' ')).toContain('expected exactly one active')
  })
})

describe('authenticated read-only GitHub boundary', () => {
  it('missing credentials and API failures are Unknown with no sensitive response leakage', async () => {
    let called = false
    const request = async () => { called = true; throw new Error('secret data') }
    expect((await collectGitHubState({ repository, revision, refs: [10], request })).available).toBe(false)
    expect(called).toBe(false)
    const failed = await collectGitHubState({ repository, revision, refs: [10], token: 'test-only', request })
    expect(failed.available).toBe(false)
    expect(JSON.stringify(failed)).not.toContain('secret data')
  })
  it('uses only GET, binds the exact revision, and paginates open PR ownership', async () => {
    const calls = []
    const request = async (url, options) => {
      calls.push({ url, options })
      let body
      if (url.endsWith('commits/' + revision)) body = { sha: revision }
      else if (url.endsWith('issues/11')) body = { number: 11, state: 'open', pull_request: {} }
      else if (url.endsWith('pulls/11')) body = { number: 11, state: 'open', merged: false, head: { sha: revision } }
      else if (url.endsWith('page=1')) body = Array.from({ length: 100 }, (_, n) => ({ number: n + 100, state: 'open', body: 'Closes #10' }))
      else body = []
      return { ok: true, json: async () => body }
    }
    const state = await collectGitHubState({ repository, revision, refs: [11], token: 'test-only', request })
    expect(state.available).toBe(true)
    expect(state.records[11].kind).toBe('pr')
    expect(state.openPulls).toHaveLength(100)
    expect(state.openPulls[0].closes).toEqual([10])
    expect(calls.some((c) => c.url.endsWith('page=2'))).toBe(true)
    expect(calls.every((c) => c.options.method === 'GET' && c.options.redirect === 'error')).toBe(true)
    expect(JSON.stringify(state)).not.toContain('test-only')
  })
})
