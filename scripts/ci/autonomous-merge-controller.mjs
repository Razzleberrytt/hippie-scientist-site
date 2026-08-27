import fs from 'node:fs'

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
  if (['merge-controller-monitor', 'merge-commit', 'fallback-sweep'].includes(check.name)) return true
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

function associatedPr(run, prNumber) {
  return (run.pull_requests || []).find((candidate) => Number(candidate.number) === Number(prNumber)) || null
}

function writeOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) return
  fs.appendFileSync(output, `${name}=${String(value)}\n`, 'utf8')
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

async function getBranchSha(repo, branch) {
  const payload = await github(`/repos/${repo}/branches/${encodeURIComponent(branch)}`)
  return payload?.commit?.sha || null
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

async function syncPrBranch(repo, number, expectedHeadSha) {
  const result = await github(`/repos/${repo}/pulls/${number}/update-branch`, {
    method: 'PUT',
    body: { expected_head_sha: expectedHeadSha },
  })
  console.log(`Updated PR #${number} with latest base: ${result?.message || 'update accepted'}`)
  return result
}

export function evaluateReadiness({ pr, workflowRuns, checkRuns, expectedHeadSha, currentBaseSha, controllerRunId }) {
  if (pr.state !== 'open') return { action: 'stop', reason: `PR is ${pr.state}` }
  if (pr.draft) return { action: 'stop', reason: 'PR is draft' }
  if (pr.head?.sha !== expectedHeadSha) return { action: 'stop', reason: 'PR head moved; newer controller owns it' }
  if (pr.head?.repo?.full_name !== pr.base?.repo?.full_name) return { action: 'stop', reason: 'fork PRs are never privileged-auto-merged' }

  const labels = labelNames(pr)
  const hold = [...HOLD_LABELS].find((label) => labels.has(label))
  if (hold) return { action: 'stop', reason: `explicit merge hold label present: ${hold}` }

  if (!currentBaseSha) return { action: 'wait', reason: 'current base SHA is not observable yet' }

  if (pr.mergeable === null || pr.mergeable_state === 'unknown') {
    return { action: 'wait', reason: 'GitHub is still calculating mergeability' }
  }

  if (pr.mergeable === false || pr.mergeable_state === 'dirty') {
    return { action: 'blocked', reason: `PR is not cleanly mergeable (${pr.mergeable_state || 'unknown'})` }
  }

  if (pr.mergeable_state === 'behind' || (pr.base?.sha && pr.base.sha !== currentBaseSha)) {
    return { action: 'sync', reason: 'PR base is behind main; update branch and revalidate exact head' }
  }

  const latestWorkflows = newestBy(workflowRuns, (run) => run.name, runScore)
  const workflowsByName = new Map(latestWorkflows.map((run) => [run.name, run]))
  const missingRequired = REQUIRED_WORKFLOWS.filter((name) => !workflowsByName.has(name))
  if (missingRequired.length) {
    return { action: 'wait', reason: `required workflows not registered yet: ${missingRequired.join(', ')}` }
  }

  const unverifiableRequired = REQUIRED_WORKFLOWS.filter((name) => {
    const run = workflowsByName.get(name)
    return !associatedPr(run, pr.number)?.base?.sha
  })
  if (unverifiableRequired.length) {
    return { action: 'wait', reason: `required workflow base proof missing: ${unverifiableRequired.join(', ')}` }
  }

  const staleBaseRuns = latestWorkflows.filter((run) => {
    const association = associatedPr(run, pr.number)
    return association?.base?.sha && association.base.sha !== currentBaseSha
  })
  if (staleBaseRuns.length) {
    return {
      action: 'sync',
      reason: `workflow evidence targets stale base; refresh required: ${staleBaseRuns.map((run) => run.name).join(', ')}`,
    }
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

  const staleBaseChecks = relevantChecks.filter((check) => {
    const association = associatedPr(check, pr.number)
    return association?.base?.sha && association.base.sha !== currentBaseSha
  })
  if (staleBaseChecks.length) {
    return { action: 'sync', reason: 'triggered check evidence targets stale base; refresh required' }
  }

  const pendingChecks = relevantChecks.filter((check) => check.status !== 'completed')
  if (pendingChecks.length) {
    return { action: 'wait', reason: `checks pending: ${pendingChecks.map(summarizeCheck).join('; ')}` }
  }

  const failedChecks = relevantChecks.filter((check) => !isGood(check.conclusion))
  if (failedChecks.length) {
    return { action: 'failed', reason: `checks failed: ${failedChecks.map(summarizeCheck).join('; ')}` }
  }

  return {
    action: 'merge',
    reason: 'all universal workflows and every triggered exact-head check are terminal-green against current base',
    baseSha: currentBaseSha,
  }
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

  const [workflowRuns, checkRuns, currentBaseSha] = await Promise.all([
    getWorkflowRuns(repo, currentHeadSha),
    getCheckRuns(repo, currentHeadSha),
    getBranchSha(repo, pr.base.ref),
  ])

  const verdict = evaluateReadiness({
    pr,
    workflowRuns,
    checkRuns,
    expectedHeadSha: currentHeadSha,
    currentBaseSha,
    controllerRunId,
  })

  if (verdict.action === 'sync') {
    await syncPrBranch(repo, number, currentHeadSha)
    return {
      action: 'stop',
      reason: 'base refresh requested; synchronize event will own the new exact head',
      headSha: currentHeadSha,
      baseSha: currentBaseSha,
    }
  }

  if (verdict.action === 'failed' && allowRetry) {
    const retried = await retryTransientRuns(repo, verdict.failedWorkflows || [])
    if (retried) return { action: 'wait', reason: 'bounded transient retry triggered' }
  }

  return { ...verdict, headSha: currentHeadSha, baseSha: verdict.baseSha || currentBaseSha }
}

async function mergeIfStillCurrent({ repo, number, headSha, validatedBaseSha }) {
  const pr = await getPr(repo, number)
  if (pr.head?.sha !== headSha) {
    console.log(`PR #${number} head moved before serialized merge; newer controller owns it.`)
    return false
  }

  const latestBaseSha = await getBranchSha(repo, pr.base.ref)
  if (latestBaseSha !== validatedBaseSha) {
    console.log(`PR #${number} base advanced from ${validatedBaseSha} to ${latestBaseSha}; refreshing before merge.`)
    await syncPrBranch(repo, number, headSha)
    return false
  }

  await mergePr(repo, number, headSha)
  return true
}

async function followOnePr() {
  const repo = requiredEnv('GITHUB_REPOSITORY')
  const number = Number(requiredEnv('PR_NUMBER'))
  const initialHeadSha = requiredEnv('EXPECTED_HEAD_SHA')
  const controllerRunId = process.env.CONTROLLER_RUN_ID || ''
  const checkOnly = process.env.CHECK_ONLY === 'true'
  const intervalMs = Math.max(10, Number(process.env.MERGE_POLL_SECONDS || 30)) * 1000
  const maxWaitMs = Math.max(1, Number(process.env.MERGE_MAX_WAIT_MINUTES || 165)) * 60 * 1000
  const deadline = Date.now() + maxWaitMs
  let lastReason = ''

  writeOutput('ready', 'false')
  writeOutput('head_sha', initialHeadSha)

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
      if (checkOnly) {
        writeOutput('ready', 'true')
        writeOutput('head_sha', verdict.headSha)
        writeOutput('base_sha', verdict.baseSha)
        console.log(`[PR #${number}] exact head is ready for serialized merge against base ${verdict.baseSha}`)
        return
      }
      await mergeIfStillCurrent({
        repo,
        number,
        headSha: verdict.headSha,
        validatedBaseSha: verdict.baseSha,
      })
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
      const didMerge = await mergeIfStillCurrent({
        repo,
        number: pr.number,
        headSha: verdict.headSha,
        validatedBaseSha: verdict.baseSha,
      })
      if (didMerge) merged += 1
      break
    }
    if (verdict.action === 'stop' && verdict.reason.startsWith('base refresh requested')) break
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
