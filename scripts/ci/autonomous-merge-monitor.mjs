import fs from 'node:fs'

import { classifyRisk, evaluateReadiness } from './autonomous-merge-controller.mjs'

const API_ROOT = process.env.GITHUB_API_URL || 'https://api.github.com'
const DISPATCH_EVENTS = new Set(['pull_request', 'workflow_dispatch'])
const TRANSIENT_CONCLUSIONS = new Set(['cancelled', 'timed_out', 'stale', 'startup_failure'])

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function writeOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) return
  fs.appendFileSync(output, `${name}=${String(value)}\n`, 'utf8')
}

function newestBy(items, keyFn, scoreFn) {
  const result = new Map()
  for (const item of items) {
    const key = keyFn(item)
    const current = result.get(key)
    if (!current || scoreFn(item) > scoreFn(current)) result.set(key, item)
  }
  return [...result.values()]
}

function runScore(run) {
  return (Number(run.run_number || 0) * 1000) + Number(run.run_attempt || 0)
}

function checkScore(check) {
  return Number(check.id || 0)
}

async function github(path) {
  const token = requiredEnv('GITHUB_TOKEN')
  const response = await fetch(`${API_ROOT}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hippie-scientist-autonomous-merge-monitor',
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GET ${path} failed (${response.status}): ${text.slice(0, 1000)}`)
  }
  return response.json()
}

async function getPr(repo, number) {
  return github(`/repos/${repo}/pulls/${number}`)
}

async function getPrFiles(repo, number) {
  const files = []
  for (let page = 1; ; page += 1) {
    const payload = await github(`/repos/${repo}/pulls/${number}/files?per_page=100&page=${page}`)
    files.push(...payload.map((file) => file.filename).filter(Boolean))
    if (payload.length < 100) break
  }
  return files
}

async function getBranchSha(repo, branch) {
  const payload = await github(`/repos/${repo}/branches/${encodeURIComponent(branch)}`)
  return payload?.commit?.sha || null
}

async function getWorkflowRuns(repo, sha) {
  const payload = await github(`/repos/${repo}/actions/runs?head_sha=${encodeURIComponent(sha)}&per_page=100`)
  const exact = (payload.workflow_runs || []).filter((run) => run.head_sha === sha && DISPATCH_EVENTS.has(run.event))
  return newestBy(exact, (run) => run.name, runScore)
}

async function getCheckRuns(repo, sha) {
  const payload = await github(`/repos/${repo}/commits/${sha}/check-runs?per_page=100`)
  return newestBy(payload.check_runs || [], (check) => `${check.app?.slug || 'unknown'}:${check.name}`, checkScore)
}

async function getRunJobs(repo, runId) {
  const payload = await github(`/repos/${repo}/actions/runs/${runId}/jobs?filter=all&per_page=100`)
  return payload.jobs || []
}

async function headContainsBase(repo, baseSha, headSha) {
  const comparison = await github(`/repos/${repo}/compare/${baseSha}...${headSha}`)
  return comparison?.status === 'ahead' || comparison?.status === 'identical'
}

async function isSerializedRecoveryFailure(repo, verdict) {
  const failedRuns = verdict.failedWorkflows || []
  if (!failedRuns.length) return false

  if (failedRuns.every((run) => run.status === 'completed' && TRANSIENT_CONCLUSIONS.has(run.conclusion || ''))) {
    return true
  }

  if (!failedRuns.every((run) => run.event === 'pull_request' && run.status === 'completed' && run.conclusion === 'action_required')) {
    return false
  }

  for (const run of failedRuns) {
    const jobs = await getRunJobs(repo, run.id)
    if (jobs.length !== 0) return false
  }
  return true
}

async function main() {
  const repo = requiredEnv('GITHUB_REPOSITORY')
  const number = Number(requiredEnv('PR_NUMBER'))
  const expectedHeadSha = requiredEnv('EXPECTED_HEAD_SHA')
  const controllerRunId = process.env.CONTROLLER_RUN_ID || ''

  writeOutput('ready', 'false')
  writeOutput('head_sha', expectedHeadSha)

  const pr = await getPr(repo, number)
  const currentHeadSha = pr.head?.sha
  if (!currentHeadSha || currentHeadSha !== expectedHeadSha) {
    console.log(`[PR #${number}] stop: head moved; a newer controller event owns readiness`)
    return
  }

  const [workflowRuns, checkRuns, currentBaseSha, changedFiles] = await Promise.all([
    getWorkflowRuns(repo, currentHeadSha),
    getCheckRuns(repo, currentHeadSha),
    getBranchSha(repo, pr.base.ref),
    getPrFiles(repo, number),
  ])
  const riskTier = classifyRisk({ pr, changedFiles })

  if (!currentBaseSha || !(await headContainsBase(repo, currentBaseSha, currentHeadSha))) {
    console.log(`[PR #${number}] [${riskTier}] defer: base drift is owned by the serialized fallback sweep`)
    return
  }

  const verdict = evaluateReadiness({
    pr,
    workflowRuns,
    checkRuns,
    expectedHeadSha: currentHeadSha,
    currentBaseSha,
    controllerRunId,
    riskTier,
    changedFiles,
  })

  if (verdict.action === 'sync') {
    console.log(`[PR #${number}] [${riskTier}] defer: ${verdict.reason}; serialized fallback sweep owns refresh`)
    return
  }
  if (verdict.action === 'wait' || verdict.action === 'stop') {
    console.log(`[PR #${number}] [${riskTier}] ${verdict.action}: ${verdict.reason}`)
    return
  }
  if (verdict.action === 'failed' && await isSerializedRecoveryFailure(repo, verdict)) {
    console.log(`[PR #${number}] [${riskTier}] defer: transient/zero-job recovery belongs to serialized fallback sweep`)
    return
  }
  if (verdict.action === 'blocked' || verdict.action === 'failed') {
    throw new Error(`[PR #${number}] ${verdict.reason}`)
  }
  if (verdict.action !== 'merge') {
    throw new Error(`[PR #${number}] unexpected monitor verdict: ${verdict.action}`)
  }

  writeOutput('ready', 'true')
  writeOutput('head_sha', currentHeadSha)
  writeOutput('base_sha', currentBaseSha)
  writeOutput('risk_tier', riskTier)
  console.log(`[PR #${number}] [${riskTier}] ready: exact head is terminal-green against current base; serialized merge may proceed`)
}

main().catch((error) => {
  console.error(error?.stack || error)
  process.exitCode = 1
})
