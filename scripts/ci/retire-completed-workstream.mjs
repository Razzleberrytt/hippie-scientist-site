#!/usr/bin/env node
// Propose a review-gated PR after an exact successful production deployment.
// Never mutate protected main, execute PR code, or waive review/CI.
import { pathToFileURL } from 'node:url'

const ROOT = 'https://api.github.com/repos/'
const sha40 = x => /^[a-f0-9]{40}$/.test(String(x || ''))
const cells = x => x.split('|').slice(1, -1).map(s => s.trim())

export function activeOwners(text, kind) {
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex(s => kind === 'sprint'
    ? /^## Active \/ in review/.test(s) : /^## (?:Now|Active)\b/.test(s))
  if (start < 0) throw Error('Missing canonical active section')
  let end = start + 1
  while (end < lines.length && !/^## /.test(lines[end])) end++
  return lines.slice(start, end).map((line, i) => {
    const row = cells(line)
    const lane = kind === 'sprint' ? row[0] : row[2]
    const id = (kind === 'sprint' ? row[1] : row[0])?.match(/#(\d+)\b/)
    return { index: start + i, line, lane, ticket: Number(id?.[1] || 0), status: row[3] || '' }
  }).filter(x => ['D','R','A'].includes(x.lane) && x.ticket > 0 &&
    !/^(?:completed|historical|retired)\b/i.test(x.status))
}

export function retireDocuments({ sprint, backlog, ticket, pr, sha, date }) {
  if (!Number.isSafeInteger(ticket) || ticket < 1 || !Number.isSafeInteger(pr) ||
    pr < 1 || !sha40(sha) || !/^\d{4}-\d\d-\d\d$/.test(date || '')) throw Error('Invalid verified identity')
  const first = activeOwners(sprint, 'sprint')
  const second = activeOwners(backlog, 'backlog')
  const a = first.filter(x => x.ticket === ticket)
  const b = second.filter(x => x.ticket === ticket)
  if (!a.length && !b.length) return null
  if (a.length !== 1 || b.length !== 1 || a[0].lane !== b[0].lane ||
      first.length !== second.length ||
      !first.every(x => second.some(y => x.ticket === y.ticket && x.lane === y.lane))) {
    throw Error('Active workstream identity mismatch')
  }
  const pinned = a[0].line.match(/\/\s*PR\s+#(\d+)/)
  if (pinned && Number(pinned[1]) !== pr) throw Error('Different active PR owner')
  const remaining = first.filter(x => x.ticket !== ticket)
  const summary = '**Current admission (verified ' + date + ', post-deploy retirement):** Normal implementation WIP is **' +
    remaining.length + '/3**: ' + (remaining.length ? remaining.map(x => x.lane + ' #' + x.ticket).join(', ') : 'D/R/A free') +
    '. Completed issue #' + ticket + ' / PR #' + pr + ' deployed as ' + sha +
    '. No new ticket is admitted. Analytics and revenue remain Unknown without real measurements.'
  const receipt = '### ' + date + ' — Verified closed workstream retired\n\n' +
    'Issue #' + ticket + ' closed, PR #' + pr + ' merged and Cloudflare production deployed exact ' + sha +
    '. Retired the ' + a[0].lane + ' active slot in both canonical records. ' +
    'This review-gated administrative change has no runtime, science, commercial, or billing effect.\n\n'
  const edit = (original, row, kind) => {
    const lines = original.split(/\r?\n/)
    lines.splice(row.index, 1)
    let out = lines.join('\n')
    const before = /^\*\*Current admission[^\n]*$/m
    if (!before.test(out)) throw Error('Missing current admission record')
    out = out.replace(before, summary)
    if (kind === 'sprint') {
      const header = /^## Active \/ in review — implementation WIP \d+\/3$/m
      if (!header.test(out)) throw Error('Missing canonical WIP header')
      out = out.replace(header, receipt + '## Active / in review — implementation WIP ' + remaining.length + '/3')
    }
    return out
  }
  return { sprint: edit(sprint, a[0], 'sprint'), backlog: edit(backlog, b[0], 'backlog'),
    before: first.length, after: remaining.length }
}

export async function proposeRetirement({ repo, sha, runId, token, request = fetch, date = new Date().toISOString().slice(0,10) }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo || '') || !sha40(sha) || !Number.isSafeInteger(runId) || runId <= 0 || !token)
    throw Error('Authenticated production identity is required')
  const url = ROOT + repo + '/'
  const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28' }
  const api = async (method, path, body) => {
    const r = await request(url + path, {
      method, headers: body ? { ...headers, 'Content-Type': 'application/json' } : headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(20000),
    })
    if (!r.ok) throw Error('GitHub ' + method + ' request HTTP ' + r.status)
    return r.json()
  }
  const deployed = await api('GET', 'actions/runs/' + runId)
  if (deployed.name !== 'Deploy to Cloudflare Pages' || deployed.status !== 'completed' ||
    deployed.conclusion !== 'success' || deployed.head_sha !== sha || deployed.head_branch !== 'main')
    return { status: 'blocked', reason: 'Unverified Cloudflare production identity' }
  const base = await api('GET', 'git/ref/heads/main')
  if (base.object?.sha !== sha) return { status: 'blocked', reason: 'Main advanced beyond deployed SHA' }
  const candidates = await api('GET', 'commits/' + sha + '/pulls')
  const matches = candidates.filter(x => x.merge_commit_sha === sha && x.merged_at && x.base?.ref === 'main')
  if (matches.length !== 1) return { status: 'none', reason: 'No unique merged PR for exact SHA' }
  const pull = await api('GET', 'pulls/' + matches[0].number)
  if (!pull.merged || pull.merge_commit_sha !== sha) return { status: 'blocked', reason: 'Merged PR mismatch' }
  const owners = [...new Set([...String(pull.body || '').matchAll(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi)]
    .map(x => Number(x[1])))]
  if (owners.length !== 1) return { status: 'none', reason: 'No unique issue closed by PR' }
  const ticket = owners[0]
  const issue = await api('GET', 'issues/' + ticket)
  if (issue.state !== 'closed' || issue.pull_request)
    return { status: 'blocked', reason: 'Owner is not a closed issue' }
  const getDoc = async file => {
    const x = await api('GET', 'contents/' + file + '?ref=' + sha)
    if (!x.sha || x.encoding !== 'base64' || typeof x.content !== 'string')
      throw Error('Unverified canonical document')
    return { sha: x.sha, content: Buffer.from(x.content.replace(/\s/g,''), 'base64').toString('utf8') }
  }
  const [s, b] = await Promise.all([getDoc('docs/CURRENT_SPRINT.md'), getDoc('docs/MASTER_BACKLOG.md')])
  const plan = retireDocuments({ sprint: s.content, backlog: b.content,
    ticket, pr: pull.number, sha, date })
  if (!plan) return { status: 'none', reason: 'No matching active workstream' }
  const branch = 'control/retire-' + ticket + '-' + pull.number + '-' + sha.slice(0,8)
  const open = await api('GET', 'pulls?state=open&per_page=100')
  if (open.some(x => x.head?.ref === branch)) return { status: 'existing', branch }
  const refreshed = await api('GET', 'git/ref/heads/main')
  if (refreshed.object?.sha !== sha) return { status: 'blocked', reason: 'Main moved during preparation' }
  // Single immutable tree + commit: never expose a partially updated branch.
  const root = await api('GET', 'git/commits/' + sha)
  if (!sha40(root.tree?.sha)) throw Error('Unverified base tree')
  const tree = await api('POST', 'git/trees', {
    base_tree: root.tree.sha,
    tree: [
      { path: 'docs/CURRENT_SPRINT.md', mode: '100644', type: 'blob', content: plan.sprint },
      { path: 'docs/MASTER_BACKLOG.md', mode: '100644', type: 'blob', content: plan.backlog },
    ],
  })
  if (!sha40(tree.sha)) throw Error('Unverified replacement tree')
  const commit = await api('POST', 'git/commits', {
    message: 'docs(control): retire completed issue #' + ticket,
    tree: tree.sha,
    parents: [sha],
  })
  if (!sha40(commit.sha)) throw Error('Unverified replacement commit')
  await api('POST', 'git/refs', { ref: 'refs/heads/' + branch, sha: commit.sha })
  const body = '## Scope\nRetire only closed issue #' + ticket + ' after PR #' + pull.number +
    ' merged and [production run](https://github.com/' + repo + '/actions/runs/' + runId +
    ') succeeded for the exact SHA ' + sha +
    '.\n\n## Acceptance and validation\nCanonical active sprint/backlog ownership stays identical; WIP ' +
    plan.before + '/3 → ' + plan.after +
    '/3. No new ticket admitted, no product code or clinical claim, no paid dependency. ' +
    'Required project-control/CI/Atomic gates and sole merge controller apply.\n\n' +
    '## Rollback and outcomes\nRevert these documentation-only changes if GitHub/deployment provenance was wrong. ' +
    'Business ROI, conversion, subscriptions and revenue remain Unknown; no implementation completion credit.'
  const pr = await api('POST', 'pulls', {
    title: 'docs(control): retire verified completed issue #' + ticket,
    head: branch, base: 'main', draft: false, body,
  })
  return { status: 'proposed', number: pr.number, url: pr.html_url, before: plan.before, after: plan.after }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  proposeRetirement({
    repo: process.env.GITHUB_REPOSITORY, sha: process.env.DEPLOYED_SHA,
    runId: Number(process.env.DEPLOY_RUN_ID), token: process.env.GH_TOKEN,
  }).then(x => console.log('[retire] ' + JSON.stringify(x)))
    .catch(e => { console.error('[retire] blocked: ' + e.message); process.exitCode = 1 })
}
