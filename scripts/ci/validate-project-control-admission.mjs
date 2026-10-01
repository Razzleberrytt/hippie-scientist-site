import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

const DAY_MS = 24 * 60 * 60 * 1000
const LANES = new Set(['D', 'R', 'A'])
const cells = (line) => line.split('|').slice(1, -1).map((value) => value.trim())
const issueId = (value = '') => Number(value.match(/#(\d+)\b/)?.[1] || 0)
const capOf = (text) => Number(text.match(/^\*\*WIP cap:\*\* (\d+)\s*$/m)?.[1] || 0)

export function scoreAdmission({ businessImpact, userValue, trafficPotential, strategicLeverage, confidence, effort }) {
  const factors = [businessImpact, userValue, trafficPotential, strategicLeverage, effort]
  if (factors.some((value) => !Number.isInteger(value) || value < 1 || value > 5)) {
    throw new Error('BI/UV/TP/SL/E must each be integers from 1 to 5')
  }
  if (![0.5, 0.75, 1].includes(confidence)) throw new Error('Confidence must be 0.50, 0.75, or 1.00')
  return (businessImpact * userValue * trafficPotential * strategicLeverage * confidence) / effort
}

export function parseActiveRows(path, text) {
  const rows = []
  let section = ''
  for (const line of text.split(/\r?\n/)) {
    if (/^## /.test(line)) {
      section = path.endsWith('CURRENT_SPRINT.md') && /^## Active\b/.test(line)
        ? 'active'
        : path.endsWith('MASTER_BACKLOG.md') && /^## Now\b/.test(line)
          ? 'active'
          : ''
    }
    if (section !== 'active' || !line.startsWith('|')) continue
    const row = cells(line)
    if (!row.length || /^---/.test(row[0])) continue
    const lane = path.endsWith('CURRENT_SPRINT.md') ? row[0] : row[2]
    const ticket = path.endsWith('CURRENT_SPRINT.md') ? row[1] : row[0]
    const title = path.endsWith('CURRENT_SPRINT.md') ? row[2] : row[1]
    const status = path.endsWith('CURRENT_SPRINT.md') ? row[3] : row[3]
    const priority = path.endsWith('CURRENT_SPRINT.md') ? row[4] : row[4]
    const score = path.endsWith('CURRENT_SPRINT.md') ? row[5] : row[6]
    const freshness = path.endsWith('CURRENT_SPRINT.md') ? row[6] : row[7]
    const issue = issueId(ticket)
    if (issue && !/^(completed|historical|retired)\b/i.test(status || '')) {
      rows.push({ issue, lane, ticket, title, status, priority, score, freshness })
    }
  }
  return rows
}

function exactLane(value) {
  const lane = String(value || '').trim().toUpperCase()
  if (!LANES.has(lane)) throw new Error('Admission lane must be exactly D, R, or A')
  return lane
}

function labelsOf(candidate) {
  return (candidate?.labels || []).map((label) => typeof label === 'string' ? label : label?.name).filter(Boolean)
}

export function validateAdmissionTransaction({
  baseSprint, baseBacklog, headSprint, headBacklog, manifest,
  baseRevision, now, candidate, openPulls = [],
}) {
  const errors = []
  const fail = (message) => errors.push(message)
  const lane = (() => { try { return exactLane(manifest?.lane) } catch (error) { fail(error.message); return '' } })()
  const ticket = Number(manifest?.ticket)
  if (!Number.isInteger(ticket) || ticket < 1) fail('Manifest ticket must be a positive issue number')
  if (!/^[a-f0-9]{40}$/.test(baseRevision || '')) fail('Exact PR base revision is required')
  if (manifest?.base_revision !== baseRevision) fail('Manifest base_revision must equal the exact PR base SHA')

  const baseCap = capOf(baseSprint)
  const backlogCap = capOf(baseBacklog)
  const headCap = capOf(headSprint)
  const headBacklogCap = capOf(headBacklog)
  if (!baseCap || baseCap !== backlogCap || baseCap !== headCap || baseCap !== headBacklogCap) fail('Sprint/backlog WIP caps must exist and remain identical')

  const baseSprintRows = parseActiveRows('docs/CURRENT_SPRINT.md', baseSprint)
  const baseBacklogRows = parseActiveRows('docs/MASTER_BACKLOG.md', baseBacklog)
  const headSprintRows = parseActiveRows('docs/CURRENT_SPRINT.md', headSprint)
  const headBacklogRows = parseActiveRows('docs/MASTER_BACKLOG.md', headBacklog)
  const baseIds = baseSprintRows.map((row) => row.issue).sort((a,b)=>a-b)
  const baseBacklogIds = baseBacklogRows.map((row) => row.issue).sort((a,b)=>a-b)
  const headIds = headSprintRows.map((row) => row.issue).sort((a,b)=>a-b)
  const headBacklogIds = headBacklogRows.map((row) => row.issue).sort((a,b)=>a-b)

  if (JSON.stringify(baseIds) !== JSON.stringify(baseBacklogIds)) fail('Base sprint/backlog active ownership disagrees')
  if (JSON.stringify(headIds) !== JSON.stringify(headBacklogIds)) fail('Head sprint/backlog active ownership disagrees')
  if (baseIds.includes(ticket)) fail('Candidate is already active on the PR base')
  const expected = [...baseIds, ticket].sort((a,b)=>a-b)
  if (JSON.stringify(headIds) !== JSON.stringify(expected)) fail('Admission transaction must add exactly the candidate and preserve all existing active tickets')
  if (headIds.length > baseCap) fail('Admission exceeds the normal WIP cap')

  const baseLaneOwners = baseSprintRows.filter((row) => LANES.has(String(row.lane).trim().toUpperCase()))
  if (lane && baseLaneOwners.some((row) => String(row.lane).trim().toUpperCase() === lane)) fail('Admission lane is already occupied on the exact PR base')
  const headLaneOwners = headSprintRows.filter((row) => LANES.has(String(row.lane).trim().toUpperCase()))
  for (const key of LANES) {
    if (headLaneOwners.filter((row) => String(row.lane).trim().toUpperCase() === key).length > 1) fail('Head contains duplicate active ownership for lane ' + key)
  }

  const sprintRow = headSprintRows.find((row) => row.issue === ticket)
  const backlogRow = headBacklogRows.find((row) => row.issue === ticket)
  if (!sprintRow || !backlogRow) fail('Candidate must appear in both authoritative active tables')
  if (sprintRow && exactLane(sprintRow.lane) !== lane) fail('Sprint candidate lane does not match manifest')
  if (backlogRow && exactLane(backlogRow.lane) !== lane) fail('Backlog candidate lane does not match manifest')
  if (manifest?.title && (sprintRow?.title !== manifest.title || backlogRow?.title !== manifest.title)) fail('Candidate title must match the manifest in both documents')
  if (manifest?.priority && (sprintRow?.priority !== manifest.priority || backlogRow?.priority !== manifest.priority)) fail('Candidate priority must match the manifest in both documents')

  let computed
  try { computed = scoreAdmission(manifest?.score_inputs || {}) } catch (error) { fail(error.message) }
  const expectedScore = Number.isFinite(computed) ? computed.toFixed(1) : ''
  if (Number(manifest?.score) !== Number(expectedScore)) fail('Manifest score must equal the single master formula')
  if (sprintRow && sprintRow.score !== expectedScore) fail('Sprint score must equal the calculated admission score')
  if (backlogRow && backlogRow.score !== expectedScore) fail('Backlog score must equal the calculated admission score')

  const verifiedAt = Date.parse(manifest?.last_verified || '')
  const clock = Date.parse(now || '')
  if (!Number.isFinite(verifiedAt) || !Number.isFinite(clock)) fail('A valid last_verified date and evaluation clock are required')
  else {
    if (verifiedAt > clock) fail('last_verified cannot be in the future')
    if (clock - verifiedAt > 7 * DAY_MS) fail('Admission freshness is older than seven days')
  }
  if (sprintRow && !String(sprintRow.freshness || '').includes(manifest?.last_verified || '')) fail('Sprint freshness must include last_verified')
  if (backlogRow && !String(backlogRow.freshness || '').includes(manifest?.last_verified || '')) fail('Backlog freshness must include last_verified')

  if (!candidate || candidate.number !== ticket || candidate.state !== 'open') fail('Candidate issue must be open and match the manifest ticket')
  if (!labelsOf(candidate).includes('ready-next')) fail('Candidate issue must carry the ready-next label at admission time')
  if (!String(candidate?.body || '').includes(baseRevision)) fail('Candidate issue must be revalidated against the exact PR base SHA')
  if (openPulls.some((pr) => Array.isArray(pr.closes) && pr.closes.includes(ticket))) fail('Candidate already has an owning implementation PR')

  return { state: errors.length ? 'BLOCKED' : 'PASS', errors: [...new Set(errors)].sort(), ticket, lane, score: expectedScore, wip: headIds.length, cap: baseCap }
}

const readAt = (revision, path) => execFileSync('git', ['show', revision + ':' + path], { encoding: 'utf8' })
const closingRefs = (body = '') => [...String(body).matchAll(/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)\b/gi)].map((match) => Number(match[1]))

// This records work already owned by an open PR before the fixed base existed.
// It is not a ready-next admission and never authorizes additional capacity.
export function validateExistingOwnerReconciliation({ baseSprint, baseBacklog, headSprint, headBacklog,
  manifest, baseRevision, baseCommittedAt, now, issues = [], openPulls = [], associations = [] }) {
  const errors = []
  const fail = (message) => errors.push(message)
  const baseS = parseActiveRows('docs/CURRENT_SPRINT.md', baseSprint)
  const baseB = parseActiveRows('docs/MASTER_BACKLOG.md', baseBacklog)
  const headS = parseActiveRows('docs/CURRENT_SPRINT.md', headSprint)
  const headB = parseActiveRows('docs/MASTER_BACKLOG.md', headBacklog)
  const identity = (rows) => rows.map((row) => `${row.issue}:${row.lane}`).sort().join(',')
  if (identity(baseS) !== identity(baseB) || identity(headS) !== identity(headB)) fail('Sprint/backlog ownership must agree')
  const cap = capOf(baseSprint)
  if (!cap || [baseBacklog, headSprint, headBacklog].some((text) => capOf(text) !== cap)) fail('WIP caps must remain identical')
  if (headS.length > cap) fail('Reconciliation exceeds normal WIP cap')
  if (!/^[a-f0-9]{40}$/.test(baseRevision || '') || manifest?.base_revision !== baseRevision) fail('Exact base revision mismatch')
  if (manifest?.mode !== 'existing-owner-reconciliation') fail('Explicit reconciliation mode is required')
  const verified = Date.parse(manifest?.last_verified || '')
  const clock = Date.parse(now || '')
  const baseTime = Date.parse(baseCommittedAt || '')
  if (![verified, clock, baseTime].every(Number.isFinite) || baseTime > clock || verified > clock || clock - verified > 7 * DAY_MS) fail('Fresh verification and base commit time are required')
  for (const [prior, current] of [[baseS, headS], [baseB, headB]]) for (const row of prior) {
    if (!current.some((head) => head.issue === row.issue && head.lane === row.lane && head.ticket === row.ticket)) fail('Existing base owners must be preserved in both tables')
  }
  const additions = headS.filter((row) => !baseS.some((prior) => prior.issue === row.issue))
  const owners = Array.isArray(manifest?.owners) ? manifest.owners : []
  if (!additions.length || owners.length !== additions.length || new Set(owners.map((owner) => owner.ticket)).size !== owners.length) fail('Declare exactly the added owners')
  for (const lane of LANES) if (headS.filter((row) => row.lane === lane).length > 1) fail('Duplicate lane ' + lane)
  if (headS.some((row) => !LANES.has(row.lane)) || new Set(headS.map((row) => row.issue)).size !== headS.length) fail('Invalid or duplicate roster identity')
  for (const row of additions) {
    const owner = owners.find((item) => item.ticket === row.issue)
    const backlogRow = headB.find((item) => item.issue === row.issue)
    if (!owner || !Number.isInteger(owner.pr) || owner.pr < 1 || owner.lane !== row.lane || !LANES.has(owner.lane)) { fail('Missing or invalid owner declaration'); continue }
    const ticketRefs = (value) => [...String(value).matchAll(/#(\d+)\b/g)].map((match) => Number(match[1])).sort((a,b) => a-b).join(',')
    const expectedRefs = [owner.ticket, owner.pr].sort((a,b) => a-b).join(',')
    if (ticketRefs(row.ticket) !== expectedRefs || ticketRefs(backlogRow?.ticket) !== expectedRefs) fail('Roster PR identity mismatch')
    if (!issues.some((issue) => issue.number === owner.ticket && issue.state === 'open' && !issue.pull_request)) fail('Owner must be an open issue, not a PR')
    const matches = openPulls.filter((pr) => pr.closes?.includes(owner.ticket))
    const pr = matches[0]
    const created = Date.parse(pr?.created_at || '')
    if (matches.length !== 1 || pr?.number !== owner.pr || pr?.state !== 'open' || !Number.isFinite(created) || created >= baseTime) fail('Unique open owning PR must predate the exact base')
    if (!associations.some((link) => link.ticket === owner.ticket && link.pr === owner.pr &&
      Number.isFinite(Date.parse(link.createdAt)) && Date.parse(link.createdAt) < baseTime)) fail('Issue/PR association must predate the exact base')
  }
  return { state: errors.length ? 'BLOCKED' : 'PASS', mode: 'existing-owner-reconciliation', errors: [...new Set(errors)].sort(), wip: headS.length, cap }
}

async function githubJson(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error('GitHub HTTP ' + response.status)
  return response.json()
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: {
    manifest: { type: 'string', default: 'ops/project-control/admission-transaction.json' },
    'base-revision': { type: 'string' },
    github: { type: 'boolean' },
    now: { type: 'string' },
  } })
  const baseRevision = values['base-revision'] || process.env.ADMISSION_BASE_SHA
  const headSprint = readFileSync('docs/CURRENT_SPRINT.md', 'utf8')
  const headBacklog = readFileSync('docs/MASTER_BACKLOG.md', 'utf8')
  const baseSprint = readAt(baseRevision, 'docs/CURRENT_SPRINT.md')
  const baseBacklog = readAt(baseRevision, 'docs/MASTER_BACKLOG.md')
  const baseIds = parseActiveRows('docs/CURRENT_SPRINT.md', baseSprint).map((row) => row.issue)
  const headIds = parseActiveRows('docs/CURRENT_SPRINT.md', headSprint).map((row) => row.issue)
  const additions = headIds.filter((id) => !baseIds.includes(id))
  if (additions.length === 0) {
    console.log(JSON.stringify({ state: 'PASS', admission: 'not-required', reason: 'Active WIP did not increase' }, null, 2))
    return
  }
  const manifest = JSON.parse(readFileSync(values.manifest, 'utf8'))
  if (manifest.mode === 'existing-owner-reconciliation') {
    if (!values.github) throw new Error('Existing-owner reconciliation requires authenticated live GitHub evidence')
    const repository = process.env.GITHUB_REPOSITORY
    const token = process.env.GITHUB_TOKEN
    if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repository || '')) throw new Error('Authenticated GitHub access is required')
    if (!Array.isArray(manifest.owners) || !manifest.owners.every((owner) => Number.isInteger(owner.ticket) && owner.ticket > 0)) throw new Error('Invalid reconciliation owners')
    const api = 'https://api.github.com/repos/' + repository + '/'
    const commit = await githubJson(api + 'commits/' + baseRevision, token)
    if (commit.sha !== baseRevision) throw new Error('Base commit identity mismatch')
    const issues = await Promise.all(manifest.owners.map((owner) => githubJson(api + 'issues/' + owner.ticket, token)))
    const associations = []
    for (const owner of manifest.owners) for (let page = 1; ; page++) {
      const events = await githubJson(api + 'issues/' + owner.ticket + '/timeline?per_page=100&page=' + page, token)
      for (const event of events) if (event.event === 'cross-referenced' && event.source?.issue?.pull_request &&
        event.source.issue.url === api + 'issues/' + owner.pr) {
        associations.push({ ticket: owner.ticket, pr: event.source.issue.number, createdAt: event.created_at })
      }
      if (events.length < 100) break
    }
    const pulls = []
    for (let page = 1; ; page++) {
      const prs = await githubJson(api + 'pulls?state=open&per_page=100&page=' + page, token)
      for (const pr of prs) pulls.push({ number: pr.number, state: pr.state, created_at: pr.created_at, closes: closingRefs(pr.body) })
      if (prs.length < 100) break
    }
    const report = validateExistingOwnerReconciliation({ baseSprint, baseBacklog, headSprint, headBacklog, manifest,
      baseRevision, baseCommittedAt: commit.commit?.committer?.date, now: values.now || new Date().toISOString(), issues, openPulls: pulls, associations })
    console.log(JSON.stringify(report, null, 2))
    if (report.state !== 'PASS') process.exitCode = 1
    return
  }
  let candidate, openPulls = []
  if (values.github) {
    const repository = process.env.GITHUB_REPOSITORY
    const token = process.env.GITHUB_TOKEN
    if (!token || !/^[\w.-]+\/[\w.-]+$/.test(repository || '')) throw new Error('Authenticated GitHub access is required')
    candidate = await githubJson('https://api.github.com/repos/' + repository + '/issues/' + manifest.ticket, token)
    for (let page = 1; ; page++) {
      const prs = await githubJson('https://api.github.com/repos/' + repository + '/pulls?state=open&per_page=100&page=' + page, token)
      for (const pr of prs) openPulls.push({ number: pr.number, closes: closingRefs(pr.body) })
      if (prs.length < 100) break
    }
  } else {
    candidate = manifest.candidate_fixture
    openPulls = manifest.open_pulls_fixture || []
  }
  const report = validateAdmissionTransaction({
    baseSprint, baseBacklog, headSprint, headBacklog, manifest,
    baseRevision, now: values.now || new Date().toISOString(), candidate, openPulls,
  })
  console.log(JSON.stringify(report, null, 2))
  if (report.state !== 'PASS') process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error('Admission validation failed closed: ' + error.message)
    process.exitCode = 2
  })
}
