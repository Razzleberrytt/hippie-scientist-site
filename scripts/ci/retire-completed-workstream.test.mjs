import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeOwners, retireDocuments, proposeRetirement } from './retire-completed-workstream.mjs'

const SHA = 'b'.repeat(40)
const sprint = [
  '# Current Sprint','**WIP cap:** 3',
  '**Current admission (verified 2026-10-09):** Normal implementation WIP is **2/3**: A #6500 and R #444.',
  '## Active / in review — implementation WIP 2/3',
  '| Workstream | Ticket / owning PR | Scope | Status | Priority | Score | Freshness |',
  '|---|---|---|---|---|---:|---|',
  '| A | #6500 | Explain grades | Active — admitted | P0 | 80.0 | 2026-10-09 |',
  '| R | #444 | Referral | Active — admitted | P0 | 80.0 | 2026-10-09 |',
  '## Ready next','### #200 Coming','## History','| A | #6491 | Old | Completed | P0 | 80.0 | 2026-10-08 |',
].join('\n')
const backlog = [
  '# Backlog','**WIP cap:** 3',
  '**Current admission (verified 2026-10-09):** Normal implementation WIP is **2/3**: A #6500 and R #444.',
  '## Now',
  '| ID / owning PR | Scope | WS | Status | Priority | BI/UV/TP/SL/C/E | Score | Freshness |',
  '|---|---|---|---|---|---|---:|---|',
  '| #6500 | Explain grades | A | Active — admitted | P0 | 4/5/4/4/0.75/3 | 80.0 | 2026-10-09 |',
  '| #444 | Referral | R | Active — admitted | P0 | 4/5/4/4/0.75/3 | 80.0 | 2026-10-09 |',
  '## Next','### #200 Coming','## History',
].join('\n')

test('retirement keeps other lanes and consistent WIP without inventing new tickets', () => {
  const p = retireDocuments({ sprint, backlog, ticket: 6500, pr: 6505, sha: SHA, date: '2026-10-09' })
  assert.equal(p.before, 2)
  assert.equal(p.after, 1)
  assert.deepEqual(activeOwners(p.sprint, 'sprint').map(x => x.ticket), [444])
  assert.deepEqual(activeOwners(p.backlog, 'backlog').map(x => x.ticket), [444])
  assert.match(p.sprint, /implementation WIP 1\/3/)
  assert.match(p.sprint, /issue #6500/i)
  assert.match(p.backlog, /\*\*1\/3\*\*/)
  assert.match(p.sprint, /## History\n\| A \| #6491/)
})
test('retirement is an idempotent no-op for absent active owner', () => {
  assert.equal(retireDocuments({ sprint, backlog, ticket: 6000, pr: 6505, sha: SHA, date: '2026-10-09' }), null)
})
test('mismatch and duplicate owners fail closed', () => {
  assert.throws(() => retireDocuments({ sprint, backlog: backlog.replace('| #6500 |', '| #5000 |'),
    ticket: 6500, pr: 6505, sha: SHA, date: '2026-10-09' }), /mismatch/)
  assert.throws(() => retireDocuments({ sprint: sprint.replace('| R | #444', '| A | #6500'),
    backlog, ticket: 6500, pr: 6505, sha: SHA, date: '2026-10-09' }), /mismatch/)
  assert.throws(() => retireDocuments({ sprint: sprint.replace('| A | #6500 |', '| A | #6500 / PR #9999 |'),
    backlog, ticket: 6500, pr: 6505, sha: SHA, date: '2026-10-09' }), /Different active PR/)
})
test('disallows unverifiable merge identity', () => {
  assert.throws(() => retireDocuments({ sprint, backlog, ticket: 6500, pr: 6505, sha: 'abc', date: '2026-10-09' }), /Invalid/)
})
function response(json) { return { ok: true, json: async () => json } }
function fakeApi({ deployment = {}, main = SHA, issueState = 'closed', duplicate = false, closes = 'Closes #6500' } = {}) {
  const requests = []
  const handler = async (url, options) => {
    const endpoint = url.split('/repos/example/repo/')[1]
    requests.push({ endpoint, method: options.method })
    if (endpoint === 'actions/runs/123') return response({ name: 'Deploy to Cloudflare Pages',
      status: 'completed', conclusion: 'success', head_sha: SHA, head_branch: 'main', ...deployment })
    if (endpoint === 'git/ref/heads/main') return response({ object: { sha: main } })
    if (endpoint === 'commits/' + SHA + '/pulls') return response([{
      number: 6505, merge_commit_sha: SHA, merged_at: '2026-10-09T12:00:00Z', base: { ref: 'main' },
    }])
    if (endpoint === 'pulls/6505') return response({
      number: 6505, merged: true, merge_commit_sha: SHA, body: closes,
    })
    if (endpoint === 'issues/6500') return response({ number: 6500, state: issueState })
    if (endpoint.startsWith('contents/')) {
      const isSprint = endpoint.includes('CURRENT_SPRINT')
      const body = isSprint ? sprint : backlog
      if (options.method === 'PUT') return response({ content: { sha: 'new' } })
      return response({ sha: 'old', encoding: 'base64', content: Buffer.from(body).toString('base64') })
    }
    if (endpoint === 'pulls?state=open&per_page=100') return response(duplicate
      ? [{ head: { ref: 'control/retire-6500-6505-' + SHA.slice(0,8) } }] : [])
    if (endpoint === 'git/refs' && options.method === 'POST') return response({ ref: 'new' })
    if (endpoint === 'pulls' && options.method === 'POST') return response({ number: 9000, html_url: 'https://github.com/example/repo/pull/9000' })
    throw Error('Unexpected API: ' + endpoint)
  }
  return { requests, handler }
}
test('a verified production run proposes exactly one reviewed docs PR, never changes main', async () => {
  const { handler, requests } = fakeApi()
  const result = await proposeRetirement({ repo: 'example/repo', sha: SHA, runId: 123, token: 'test',
    request: handler, date: '2026-10-09' })
  assert.equal(result.status, 'proposed')
  assert.equal(result.before, 2)
  assert.equal(result.after, 1)
  const writes = requests.filter(x => x.method !== 'GET')
  assert.deepEqual(writes.map(x => x.endpoint), ['git/refs',
    'contents/docs/CURRENT_SPRINT.md', 'contents/docs/MASTER_BACKLOG.md', 'pulls'])
  assert.ok(!writes.some(x => x.endpoint === 'git/ref/heads/main'))
})
test('blocks a failed deploy or outdated main without ANY write', async () => {
  for (const cfg of [{ deployment: { conclusion: 'failure' } }, { main: 'c'.repeat(40) }]) {
    const { handler, requests } = fakeApi(cfg)
    const result = await proposeRetirement({ repo: 'example/repo', sha: SHA, runId: 123, token: 'test',
      request: handler, date: '2026-10-09' })
    assert.equal(result.status, 'blocked')
    assert.ok(requests.every(x => x.method === 'GET'))
  }
})
test('never proposes on a still-open issue or ambiguous PR closer', async () => {
  for (const cfg of [{ issueState: 'open' }, { closes: 'Closes #6500 and fixes #6501' }]) {
    const { handler, requests } = fakeApi(cfg)
    const result = await proposeRetirement({ repo: 'example/repo', sha: SHA, runId: 123, token: 'test',
      request: handler, date: '2026-10-09' })
    assert.ok(['blocked', 'none'].includes(result.status))
    assert.ok(requests.every(x => x.method === 'GET'))
  }
})
test('duplicate proposal branch is idempotently skipped', async () => {
  const { handler, requests } = fakeApi({ duplicate: true })
  const result = await proposeRetirement({ repo: 'example/repo', sha: SHA, runId: 123, token: 'test',
    request: handler, date: '2026-10-09' })
  assert.equal(result.status, 'existing')
  assert.ok(requests.every(x => x.method === 'GET'))
})
