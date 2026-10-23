#!/usr/bin/env node
/**
 * Pre-PR reservation check. This is an agent-side gate, not GitHub branch
 * protection or a substitute for repository admission and human approval.
 */
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import console from 'node:console'

/**
 * Only an explicitly scoped/closing issue is reserved. General #issue
 * references (e.g. "Depends on #7022") are not ownership declarations.
 */
export function scopedIssueFromBody(body) {
  if (typeof body !== 'string') return null
  const match = body.match(/(?:^|\r?\n)\s*(?:Closes|Fixes|Resolves|Refs|References|Tracks|Tracking|Issue)\s*:?\s*#(\d+)\b/i)
  return match ? Number(match[1]) : null
}

export function assessAdmission(prs, { issue = null, files = [], existing = null, reviewOnly = false, securityApproved = false } = {}) {
  if (!Array.isArray(prs) || !prs.every((p) =>
    Number.isInteger(p.number) && Array.isArray(p.files) &&
    Number.isSafeInteger(p.changedFiles) && p.changedFiles >= 0 &&
    p.files.length === p.changedFiles &&
    p.files.every((file) => typeof file === 'string' && file.length > 0 ||
      typeof file?.path === 'string' && file.path.length > 0) &&
    typeof p.isDraft === 'boolean' && typeof p.body === 'string')) {
    return { decision: 'BLOCK', reason: 'Incomplete open-PR inventory; fail closed', prs: [] }
  }
  if (!issue && !existing) {
    return { decision: 'BLOCK', reason: 'Provide --issue for a new change or --existing to repair an open PR', prs: [] }
  }
  if (existing) {
    const target = prs.find((p) => p.number === existing)
    return target
      ? { decision: 'REUSE', reason: 'Continue the specified existing PR; do not create another', prs: [existing] }
      : { decision: 'BLOCK', reason: 'Specified existing PR not found in open PR inventory', prs: [] }
  }
  if (!Number.isInteger(issue) || issue <= 0) {
    return { decision: 'BLOCK', reason: 'Invalid scoped issue number', prs: [] }
  }
  const fileSet = new Set(files.map((f) => f.trim()).filter(Boolean))
  if (!fileSet.size) return { decision: 'BLOCK', reason: 'Provide --files with the planned changed paths', prs: [] }
  const duplicates = prs.filter((p) => scopedIssueFromBody(p.body) === issue ||
    p.files.some((f) => fileSet.has(typeof f === 'string' ? f : f.path)))
  if (duplicates.length) {
    return { decision: 'BLOCK', reason: 'Open PR already owns the issue or planned files; review and reuse it', prs: duplicates.map((p) => p.number) }
  }
  // Explicitly held PRs are preserved as review-only inventory. They still
  // reserve their scoped issue and files above, but cannot block unrelated
  // engineering indefinitely while awaiting science/human approval.
  const holds = new Set(['hold-merge', 'do-not-merge', 'manual-merge'])
  const active = prs.filter((p) => !p.isDraft &&
    !(Array.isArray(p.labels) && p.labels.some((label) =>
      holds.has(typeof label === 'string' ? label : label?.name))))
  if (active.length && !reviewOnly && !securityApproved) {
    return { decision: 'BLOCK', reason: 'One active implementation PR maximum; finish/reconcile current PR first', prs: active.map((p) => p.number) }
  }
  return { decision: 'READY', reason: 'No open issue/path duplicate or active implementation PR detected; normal sprint admission and review still required', prs: [] }
}

/**
 * GitHub CLI's `pr list --json files` returns only the first 100 paths.
 * Require the independent `changedFiles` count, and paginate whenever the
 * GraphQL file list is incomplete. Never reserve only a truncated subset.
 */
export function completeOpenInventory(prs, repo, run = spawnSync) {
  if (!Array.isArray(prs)) throw Error('Open PR inventory must be an array')
  for (const p of prs) {
    if (!Number.isSafeInteger(p.number) || p.number <= 0 ||
        !Number.isSafeInteger(p.changedFiles) || p.changedFiles < 0 ||
        !Array.isArray(p.files) || p.files.length > p.changedFiles) {
      throw Error('Open PR file count unavailable or inconsistent')
    }
    if (p.files.length === p.changedFiles) continue
    const response = run('gh', [
      'api', `repos/${repo}/pulls/${p.number}/files?per_page=100`,
      '--paginate', '--slurp', '--jq', '[.[][] | .filename]',
    ], { encoding: 'utf8', timeout: 30000, maxBuffer: 32 * 1024 * 1024 })
    if (response.error || response.status !== 0) {
      throw Error(`Unable to obtain complete changed-file inventory for PR #${p.number}`)
    }
    const paths = JSON.parse(response.stdout)
    if (!Array.isArray(paths) || paths.length !== p.changedFiles ||
        paths.some(path => typeof path !== 'string' || !path.length) ||
        new Set(paths).size !== paths.length) {
      throw Error(`Paginated changed-file count mismatch for PR #${p.number}`)
    }
    p.files = paths.map(path => ({ path }))
  }
  return prs
}

export function requestFromOpenPr(prs, number) {
  const current = prs.find((p) => p.number === number)
  if (!current || !Array.isArray(current.files) || typeof current.body !== 'string') {
    return { error: 'Current PR unavailable or its changed-file inventory is incomplete' }
  }
  const scoped = scopedIssueFromBody(current.body)
  if (!Number.isSafeInteger(scoped) || scoped <= 0) return { error: 'PR body must name its scoped issue (for example Refs #1234)' }
  return {
    issue: scoped,
    files: current.files.map((f) => typeof f === 'string' ? f : f.path).filter(Boolean),
    reviewOnly: current.isDraft,
    securityApproved: Array.isArray(current.labels) &&
      current.labels.some((label) => label.name === 'security-interrupt-approved'),
  }
}

function cli() {
  const args = process.argv.slice(2)
  const value = (key) => { const i = args.indexOf(key); return i >= 0 ? args[i + 1] : undefined }
  const repo = value('--repo') || process.env.GH_REPO || process.env.GITHUB_REPOSITORY
  const issue = value('--issue') ? Number(value('--issue')) : null
  const existing = value('--existing') ? Number(value('--existing')) : null
  const fromPr = value('--from-pr') ? Number(value('--from-pr')) : null
  const fileArg = value('--files')
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo) ||
      (args.includes('--issue') && !Number.isInteger(issue)) ||
      (args.includes('--existing') && !Number.isInteger(existing)) ||
      (args.includes('--from-pr') && !Number.isInteger(fromPr))) {
    console.error('BLOCK: require valid --repo owner/name and numeric --issue or --existing')
    process.exitCode = 2; return
  }
  const run = spawnSync('gh', [
    'pr', 'list', '--repo', repo, '--state', 'open', '--limit', '250',
    '--json', 'number,title,body,isDraft,files,changedFiles,url,labels',
  ], { encoding: 'utf8', timeout: 30000, maxBuffer: 32 * 1024 * 1024 })
  if (run.error || run.status !== 0) {
    console.error('BLOCK: live GitHub PR inventory unavailable:', String(run.error || run.stderr).slice(0,400))
    process.exitCode = 2; return
  }
  try {
    const listed = JSON.parse(run.stdout)
    if (!Array.isArray(listed) || listed.length >= 250) throw new Error('open PR inventory not known complete')
    const prs = completeOpenInventory(listed, repo)
    const request = fromPr
      ? requestFromOpenPr(prs, fromPr)
      : { issue, existing, files: (fileArg || '').split(',') }
    if (request.error) throw new Error(request.error)
    const decision = assessAdmission(
      fromPr ? prs.filter((p) => p.number !== fromPr) : prs,
      request,
    )
    console.log(JSON.stringify(decision, null, 2))
    if (decision.decision === 'BLOCK') process.exitCode = 2
  } catch (error) {
    console.error('BLOCK: malformed/incomplete PR inventory:', error.message)
    process.exitCode = 2
  }
}
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('/pr-admission-preflight.mjs')) cli()
