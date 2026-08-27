const API_ROOT = process.env.GITHUB_API_URL || 'https://api.github.com'

const GOOD_CONCLUSIONS = new Set(['success', 'neutral', 'skipped'])
const TRANSIENT_CONCLUSIONS = new Set(['cancelled', 'timed_out', 'stale', 'startup_failure'])
const REQUIRED_WORKFLOWS = [
  'CI',
  'Site Health Check',
  'Atomic upgrade gate',
  'Production Content Lint',
  'Build quality regression',
]
const HOLD_LABELS = new Set(['hold-merge', 'do-not-merge', 'manual-merge'])

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

function isGood(conclusion) {
  return GOOD_CONCLUSIONS.has(conclusion || '')
}

function isControllerCheck(check, controllerRunId) {
  if (check.name === 'merge-controller' || check.name === 'fallback-sweep') return true
  return Boolean(controllerRunId && String(check.details_url || '').includes(`/actions/runs/${controllerRunId}`))
}

function labelNames(pr) {
  return new Set((pr.labels || []).map((label) => typeof label === 'string' ? label : label.name).filter(Boolean))
}

function summarizeRun(run) {
  return `${run.name}: ${run.status}/${run.conclusion || 'pending'}`
}

function summarizeCheck(check) {
  const app = check.app?.slug ? `${check.app.slug}/` : ''
  return `${app}${check.name}: ${check.status}/${check.conclusion || 'pending'}`
}

async function github(path, { method = 'GET', body } = {}) {
  const token = requiredEnv('GITHUB_TOKEN')
  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hippie-scientist-autonomous-merge-controller',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${method} ${path} failed (${response.status}): ${text.slice(0, 1000)}`)
  }

  if (response.status === 204) return null
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

async function getPr(repo, number) {
  return github(`/repos/${repo}/pulls/${number}`)
}

async function getWorkflowRuns(repo, sha) {
  const payload = await github(`/repos/${repo}/actions/runs?head_sha=${encodeURIComponent(sha)}&event=pull_request&per_page=100`)
  const exact = (payload.workflow_runs || []).filter((run) => run.head_sha === sha && run.event === 'pull_request')
  return newestBy(exact, (run) => run.name, runScore)
}

async function getCheckRuns(repo, sha) {
  const payload = await github(`/repos/${repo}/commits/${sha}/check-runs?per_page=100`)
  return newestBy(payload.check_runs || [], (check) => `${check.app?.slug || 'unknown'}:${check.name}`, checkScore)
}

async function retryTransientRuns(repo, runs) {
  let retried = false
  for (const run of runs) {
    if (run.status !== 'completed') continue
    if (!TRANSIENT_CONCLUSIONS.has(run.conclusion || '')) continue
    if (Number(run.run_attempt || 1) >= 2) continue

    console.log(`Retrying transient workflow once: ${summarizeRun(run)} (run ${run.id})`)
    await github(`/repos/${repo}/actions/runs/${run.id}/rerun-failed-jobs`, { method: 'POST' })
    retried = true
  }
  return retried
}

export function evaluateReadiness({ pr, workflowRuns, checkRuns, expectedHeadSha, controllerRunId }) {
  if (pr.state !== 'open') return { action: 'stop', reason: `PR is ${pr.state}` }
  if (pr.draft) return { action: 'stop', reason: 'PR is draft' }
  if (pr.head?.sha !== expectedHeadSha) return { action: 'stop', reason: 'PR head moved; newer controller owns it' }
  if (pr.head?.repo?.full_name !== pr.base?.repo?.full_name) return { action: 'stop', reason: 'fork PRs are never privileged-auto-merged' }

  const labels = labelNames(pr)
  const hold = [...HOLD_LABELS].find((label) => labels.has(label))
  if (hold) return { action: 'stop', reason: `explicit merge hold label present: ${hold}` }

  if (pr.mergeable === false || pr.mergeable_state === 'dirty') {
    return { action: 'blocked', reason: `PR is not cleanly mergeable (${pr.mergeable_state || 'unknown'})` }
  }

  const latestWorkflows = newestBy(workflowRuns, (run) => run.name, runScore)
  const workflowsByName = new Map(latestWorkflows.map((run) => [run.name, run]))
  const missingRequired = REQUIRED_WORKFLOWS.filter((name) => !workflowsByName.has(name))
  if (missingRequired.length) {
    return { action: 'wait', reason: `required workflows not registered yet: ${missingRequired.join(', ')}` }
  }

  const pendingWorkflows = latestWorkflows.filter((run) => run.status !== 'completed')
  if (pendingWorkflows.length) {
    return { action: 'wait', reason: `workflow runs pending: ${pendingWorkflows.map(summarizeRun).join('; ')}` }
  }

  const failedWorkflows = latestWorkflows.filter((run) => !isGood(run.conclusion))
  if (failedWorkflows.length) {
    return { action: 'failed', reason: `workflow runs failed: ${failedWorkflows.map(summarizeRun).join('; ')}`, failedWorkflows }
  }

  const requiredFailures = REQUIRED_WORKFLOWS
    .map((name) => workflowsByName.get(name))
    .filter((run) => !isGood(run?.conclusion))
  if (requiredFailures.length) {
    return { action: 'failed', reason: `required workflow failure: ${requiredFailures.map(summarizeRun).join('; ')}` }
  }

  const relevantChecks = newestBy(
    checkRuns.filter((check) => !isControllerCheck(check, controllerRunId)),
    (check) => `${check.app?.slug || 'unknown'}:${check.name}`,
    checkScore,
  )

  const pendingChecks = relevantChecks.filter((check) => check.status !== 'completed')
  if (pendingChecks.length) {
    return { action: 'wait', reason: `checks pending: ${pendingChecks.map(summarizeCheck).join('; ')}` }
  }

  const failedChecks = relevantChecks.filter((check) => !isGood(check.conclusion))
  if (failedChecks.length) {
    return { action: 'failed', reason: `checks failed: ${failedChecks.map(summarizeCheck).join('; ')}` }
  }

  return { action: 'merge', reason: 'all universal workflows and every triggered exact-head check are terminal-green' }
}

async function mergePr(repo, number, expectedHeadSha) {
  const result = await github(`/repos/${repo}/pulls/${number}/merge`, {
    method: 'PUT',
    body: {
      sha: expectedHeadSha,
      merge_method: 'merge',
    },
  })
  if (!result?.merged) throw new Error(`GitHub refused merge for PR #${number}: ${result?.message || 'unknown reason'}`)
  console.log(`Merged PR #${number} as ${result.sha}`)
  return result
}

async function evaluateOnce({ repo, number, expectedHeadSha, controllerRunId, allowRetry }) {
  const pr = await getPr(repo, number)
  const currentHeadSha = pr.head?.sha
  if (!currentHeadSha) return { action: 'blocked', reason: 'PR has no head SHA' }

  if (expectedHeadSha && currentHeadSha !== expectedHeadSha) {
    return { action: 'stop', reason: `head moved from ${expectedHeadSha} to ${currentHeadSha}` }
  }

  const [workflowRuns, checkRuns] = await Promise.all([
    getWorkflowRuns(repo, currentHeadSha),
    getCheckRuns(repo, currentHeadSha),
  ])

  const verdict = evaluateReadiness({
    pr,
    workflowRuns,
    checkRuns,
    expectedHeadSha: currentHeadSha,
    controllerRunId,
  })

  if (verdict.action === 'failed' && allowRetry) {
    const retried = await retryTransientRuns(repo, verdict.failedWorkflows || [])
    if (retried) return { action: 'wait', reason: 'bounded transient retry triggered' }
  }

  return { ...verdict, headSha: currentHeadSha }
}

async function followOnePr() {
  const repo = requiredEnv('GITHUB_REPOSITORY')
  const number = Number(requiredEnv('PR_NUMBER'))
  const initialHeadSha = requiredEnv('EXPECTED_HEAD_SHA')
  const controllerRunId = process.env.CONTROLLER_RUN_ID || ''
  const intervalMs = Math.max(10, Number(process.env.MERGE_POLL_SECONDS || 30)) * 1000
  const maxWaitMs = Math.max(1, Number(process.env.MERGE_MAX_WAIT_MINUTES || 165)) * 60 * 1000
  const deadline = Date.now() + maxWaitMs
  let lastReason = ''

  while (Date.now() < deadline) {
    const verdict = await evaluateOnce({
      repo,
      number,
      expectedHeadSha: initialHeadSha,
      controllerRunId,
      allowRetry: true,
    })

    if (verdict.reason !== lastReason) {
      console.log(`[PR #${number}] ${verdict.action}: ${verdict.reason}`)
      lastReason = verdict.reason
    }

    if (verdict.action === 'merge') {
      await mergePr(repo, number, initialHeadSha)
      return
    }
    if (verdict.action === 'stop') return
    if (verdict.action === 'blocked' || verdict.action === 'failed') {
      throw new Error(`[PR #${number}] ${verdict.reason}`)
    }

    await sleep(intervalMs)
  }

  console.log(`[PR #${number}] controller window ended without bypassing gates; fallback sweep will continue ownership`)
}

async function fallbackSweep() {
  const repo = requiredEnv('GITHUB_REPOSITORY')
  const controllerRunId = process.env.CONTROLLER_RUN_ID || ''
  const payload = await github(`/repos/${repo}/pulls?state=open&per_page=100`)
  let merged = 0

  for (const pr of payload) {
    if (pr.draft || pr.head?.repo?.full_name !== repo) continue
    const verdict = await evaluateOnce({
      repo,
      number: pr.number,
      expectedHeadSha: pr.head.sha,
      controllerRunId,
      allowRetry: true,
    })
    console.log(`[fallback PR #${pr.number}] ${verdict.action}: ${verdict.reason}`)
    if (verdict.action === 'merge') {
      await mergePr(repo, pr.number, pr.head.sha)
      merged += 1
    }
  }

  console.log(`Fallback sweep complete; merged ${merged} PR(s)`)
}

async function main() {
  if (process.env.SWEEP_OPEN_PRS === 'true') await fallbackSweep()
  else await followOnePr()
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname
if (isMain) {
  main().catch((error) => {
    console.error(error?.stack || error)
    process.exitCode = 1
  })
}
