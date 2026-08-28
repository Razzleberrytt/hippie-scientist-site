import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

export const CONTROL_PATHS = ['docs/CURRENT_SPRINT.md', 'docs/MASTER_BACKLOG.md', 'docs/ROADMAP.md']
const ids = (text) => [...text.matchAll(/#(\d+)\b/g)].map((m) => Number(m[1]))
const cells = (line) => line.split('|').slice(1, -1).map((s) => s.trim())
const sorted = (values) => [...new Set(values)].sort((a, b) => a - b)
const digest = (text) => createHash('sha256').update(text).digest('hex')

export function parseControlDocument(path, text) {
  const active = [], ready = [], milestones = {}, dependencies = {}
  const errors = []
  let section = '', activeSections = 0, readySections = 0
  for (const line of text.split(/\r?\n/)) {
    if (/^## /.test(line)) {
      section = /^## (Active|Now)\b/.test(line) ? 'active' : /^## (Ready next|Next)\b/.test(line) ? 'ready' : ''
      if (section === 'active') activeSections++
      if (section === 'ready') readySections++
    }
    if (line.startsWith('|')) {
      const row = cells(line)
      const milestone = row[0]?.match(/^(M[0-6])(?:\s|$)/)?.[1]
      if (milestone) {
        if (milestones[milestone]) errors.push('duplicate milestone ' + milestone)
        milestones[milestone] = row[1]?.toLowerCase()
      }
      if (section) {
        const cell = path.endsWith('CURRENT_SPRINT.md') ? row[1] : row[0]
        const refs = ids(cell || '')
        const local = (cell || '').match(/\b(?:SEO|AUTH|REV|DOC)-\d+\b/)?.[0]
        if (refs.length || local) {
          const status = row[3] || ''
          if (!/^(completed|historical|retired)\b/i.test(status)) {
            const record = { id: refs[0] ? '#' + refs[0] : local, refs, status }
            if (section === 'active') active.push(record)
            else ready.push(record)
          }
        }
      }
    }
    if (section === 'ready' && /^### /.test(line)) {
      const refs = ids(line)
      if (refs.length) ready.push({ id: '#' + refs[0], refs: [refs[0]], status: 'queued' })
    }
    if (line.startsWith('**Control dependencies:**')) {
      for (const entry of line.split('**Control dependencies:**')[1].trim().split(';')) {
        const match = entry.trim().match(/^#(\d+)\s*<-\s*(#\d+(?:\s*,\s*#\d+)*)$/)
        if (!match) errors.push('invalid dependency entry: ' + entry.trim())
        else if (dependencies[match[1]]) errors.push('duplicate dependency owner #' + match[1])
        else dependencies[match[1]] = sorted(ids(match[2]))
      }
    }
  }
  const caps = [...text.matchAll(/^\*\*WIP cap:\*\* (\d+)\s*$/gm)].map((m) => Number(m[1]))
  const exceptionLines = text.split(/\r?\n/).filter((line) => line.startsWith('**WIP exception:**'))
  let exception = null
  if (exceptionLines.length) {
    const match = exceptionLines[0].match(/^\*\*WIP exception:\*\* owner=#(\d+); maximum=(\d+); expires=(\S+); admission=blocked; reason=(.+)$/)
    if (exceptionLines.length !== 1 || !match) errors.push('invalid or duplicate bounded WIP exception')
    else exception = { owner: Number(match[1]), maximum: Number(match[2]), expires: match[3], reason: match[4] }
  }
  if (!path.endsWith('ROADMAP.md')) {
    if (activeSections !== 1 || readySections !== 1) errors.push('expected exactly one active and one ready section')
    if (caps.length !== 1 || caps[0] < 1) errors.push('expected exactly one positive WIP cap')
  }
  for (let n = 0; n <= 6; n++) {
    if (!['in progress', 'blocked', 'not started', 'complete'].includes(milestones['M' + n])) errors.push('missing/invalid milestone M' + n)
  }
  if (!Object.keys(dependencies).length) errors.push('missing immediate dependency chain')
  return { path, hash: digest(text), active, ready, milestones, dependencies, cap: caps[0], exception, errors }
}

export function requiredReferences(documents) {
  return sorted(documents.flatMap((d) => [
    ...d.active.flatMap((t) => t.refs),
    ...d.ready.flatMap((t) => t.refs),
    ...Object.entries(d.dependencies).flatMap(([id, refs]) => [Number(id), ...refs]),
  ]))
}

// The injected request boundary supports offline fixtures. Production uses only GET.
export async function collectGitHubState({ repository, revision, refs, token, request = fetch }) {
  const snapshot = { version: 1, repository, revision, records: {}, openPulls: [], available: false }
  if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !/^[a-f0-9]{40}$/.test(revision || '')) {
    return { ...snapshot, reason: 'Authenticated GitHub access, repository and exact revision are required' }
  }
  const get = async (suffix) => {
    const response = await request('https://api.github.com/repos/' + repository + '/' + suffix, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    })
    if (!response.ok) throw new Error('GitHub HTTP ' + response.status)
    return response.json()
  }
  try {
    const commit = await get('commits/' + revision)
    if (commit.sha !== revision) throw new Error('GitHub revision mismatch')
    for (const ref of refs) {
      const issue = await get('issues/' + ref)
      if (issue.number !== ref || !['open', 'closed'].includes(issue.state)) throw new Error('Invalid GitHub issue response')
      if (issue.pull_request) {
        const pr = await get('pulls/' + ref)
        if (pr.number !== ref || typeof pr.merged !== 'boolean' || !['open', 'closed'].includes(pr.state)) throw new Error('Invalid GitHub PR response')
        snapshot.records[ref] = { kind: 'pr', state: pr.state, merged: pr.merged, head: pr.head.sha }
      } else snapshot.records[ref] = { kind: 'issue', state: issue.state }
    }
    for (let page = 1; ; page++) {
      const prs = await get('pulls?state=open&per_page=100&page=' + page)
      if (!Array.isArray(prs)) throw new Error('Invalid open PR response')
      for (const pr of prs) {
        if (!Number.isInteger(pr.number) || pr.state !== 'open') throw new Error('Invalid open PR identity')
        snapshot.openPulls.push({
          number: pr.number,
          closes: sorted([...String(pr.body || '').matchAll(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi)].map((m) => Number(m[1]))),
        })
      }
      if (prs.length < 100) break
    }
    snapshot.available = true
  } catch (error) {
    // Never include tokens, provider response bodies, or person-level details.
    snapshot.reason = error.message.startsWith('GitHub HTTP ') ? error.message : 'GitHub state unavailable or malformed'
  }
  return snapshot
}

export function reconcile({ documents, snapshot, repository, revision, now }) {
  const findings = []
  const fail = (message) => findings.push(message)
  const [sprint, backlog, roadmap] = documents
  for (const document of documents) for (const error of document.errors) fail(document.path + ': ' + error)
  for (const document of [sprint, backlog]) {
    for (const [id, status] of Object.entries(roadmap.milestones)) {
      if (document.milestones[id] !== status) fail(document.path + ': milestone ' + id + ' contradicts roadmap')
    }
    if (JSON.stringify(document.dependencies) !== JSON.stringify(roadmap.dependencies)) fail(document.path + ': immediate dependency chain contradicts roadmap')
    const owners = new Set()
    for (const ticket of document.active) {
      for (const ref of ticket.refs) {
        if (owners.has(ref)) fail(document.path + ': duplicate active ownership #' + ref)
        owners.add(ref)
      }
    }
    for (const ticket of document.ready) {
      if (document.active.some((active) => active.id === ticket.id)) fail(document.path + ': ticket both active and ready: ' + ticket.id)
    }
  }
  if (sprint.cap !== backlog.cap) fail('Sprint/backlog WIP caps disagree')
  const identity = (records) => records.map((t) => t.id + ':' + sorted(t.refs).join(',')).sort()
  if (JSON.stringify(identity(sprint.active)) !== JSON.stringify(identity(backlog.active))) fail('Sprint/backlog active ownership disagrees')
  for (const ticket of sprint.ready) {
    if (!backlog.ready.some((candidate) => candidate.id === ticket.id)) fail('Sprint ready ticket missing from backlog: ' + ticket.id)
  }
  if (JSON.stringify(sprint.exception) !== JSON.stringify(backlog.exception)) fail('Sprint/backlog WIP exceptions disagree')
  const wip = sprint.active.length, exception = sprint.exception
  if (exception) {
    if (!Number.isFinite(Date.parse(now)) || !Number.isFinite(Date.parse(exception.expires)) || Date.parse(exception.expires) <= Date.parse(now)) fail('WIP exception expired or has no valid evaluation clock')
    if (!sprint.active.some((ticket) => ticket.refs.includes(exception.owner))) fail('WIP exception owner is not active')
    if (exception.maximum <= sprint.cap || wip > exception.maximum) fail('WIP exception maximum is invalid or exceeded')
  } else if (wip > sprint.cap) fail('WIP exceeds normal cap without bounded admission-blocking exception')
  const visiting = new Set(), visited = new Set()
  const visit = (id) => {
    if (visiting.has(id)) { fail('Dependency cycle at #' + id); return }
    if (visited.has(id)) return
    visiting.add(id)
    for (const ref of roadmap.dependencies[id] || []) visit(String(ref))
    visiting.delete(id); visited.add(id)
  }
  Object.keys(roadmap.dependencies).forEach(visit)
  const refs = requiredReferences(documents)
  const available = snapshot?.available === true && snapshot.version === 1 && snapshot.repository === repository && snapshot.revision === revision &&
    Array.isArray(snapshot.openPulls) && snapshot.openPulls.every((p) => Number.isInteger(p.number) && Array.isArray(p.closes) && p.closes.every(Number.isInteger)) &&
    refs.every((ref) => {
      const record = snapshot.records?.[ref]
      return record && ['issue', 'pr'].includes(record.kind) && ['open', 'closed'].includes(record.state) &&
        (record.kind !== 'pr' || typeof record.merged === 'boolean')
    })
  const waiting = []
  if (!available) waiting.push('Unknown/waiting: complete GitHub evidence bound to this repository/revision is unavailable')
  else {
    for (const document of [sprint, backlog]) {
      for (const ticket of document.active) {
        for (const ref of ticket.refs) {
          const state = snapshot.records[ref]
          if (state.state === 'closed' || state.merged) fail(document.path + ': closed/merged active reference #' + ref)
        }
      }
      for (const ticket of document.ready) {
        for (const ref of ticket.refs) {
          const state = snapshot.records[ref]
          if (state.state === 'closed' || state.merged) fail(document.path + ': closed/merged queued reference #' + ref)
        }
      }
    }
    const owners = new Map()
    for (const pr of snapshot.openPulls) for (const issue of pr.closes) {
      const prior = owners.get(issue)
      if (prior && prior !== pr.number) fail('Duplicate open PR ownership of #' + issue + ': #' + prior + ', #' + pr.number)
      owners.set(issue, pr.number)
    }
    for (const ticket of sprint.active) {
      const issue = ticket.refs.find((ref) => snapshot.records[ref]?.kind === 'issue')
      if (issue && owners.has(issue) && !ticket.refs.includes(owners.get(issue))) fail('Active issue #' + issue + ' has unrecorded owning PR #' + owners.get(issue))
    }
    for (const [id, dependencies] of Object.entries(roadmap.dependencies)) {
      const unresolved = dependencies.filter((ref) => {
        const state = snapshot.records[ref]
        return state.kind === 'pr' ? !state.merged : state.state !== 'closed'
      })
      if (unresolved.length) {
        if (sprint.active.some((t) => t.refs.includes(Number(id)))) fail('Active #' + id + ' has unmet dependencies: ' + unresolved.map((n) => '#' + n).join(', '))
        else waiting.push('#' + id + ' waiting for ' + unresolved.map((n) => '#' + n).join(', '))
      }
    }
  }
  const state = !available ? 'UNKNOWN' : findings.length ? 'DRIFT' : 'PASS'
  return {
    state, repository, revision, documentHashes: Object.fromEntries(documents.map((d) => [d.path, d.hash])),
    wip, cap: sprint.cap ?? null, admission: state !== 'PASS' || exception || wip >= sprint.cap ? 'blocked' : 'available',
    findings: [...new Set(findings)].sort(), waiting: [...new Set(waiting)].sort(),
  }
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: {
    github: { type: 'boolean' }, snapshot: { type: 'string' }, repository: { type: 'string' },
    revision: { type: 'string' }, now: { type: 'string' },
  } })
  if (values.github && values.snapshot) throw new Error('Choose --github or --snapshot, not both')
  const documents = CONTROL_PATHS.map((path) => parseControlDocument(path, readFileSync(path, 'utf8')))
  const repository = values.repository || process.env.GITHUB_REPOSITORY
  const revision = values.revision || process.env.GITHUB_SHA
  let snapshot
  if (values.github) snapshot = await collectGitHubState({ repository, revision, refs: requiredReferences(documents), token: process.env.GITHUB_TOKEN })
  else if (values.snapshot) snapshot = JSON.parse(readFileSync(values.snapshot, 'utf8'))
  const report = reconcile({ documents, snapshot, repository, revision, now: values.now || new Date().toISOString() })
  console.log(JSON.stringify(report, null, 2))
  console.error('Control reconciliation: ' + report.state + '; WIP ' + report.wip + '/' + report.cap + '; admission ' + report.admission)
  for (const message of [...report.findings, ...report.waiting]) console.error('- ' + message)
  process.exitCode = report.state === 'PASS' ? 0 : report.state === 'DRIFT' ? 1 : 2
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(() => {
    console.log(JSON.stringify({ state: 'UNKNOWN', admission: 'blocked', waiting: ['Unreadable or invalid control inputs'] }))
    console.error('Control reconciliation: UNKNOWN; input acquisition failed')
    process.exitCode = 2
  })
}
