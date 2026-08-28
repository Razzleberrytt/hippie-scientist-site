import fs from 'node:fs'

const API_ROOT = process.env.GITHUB_API_URL || 'https://api.github.com'
const GOOD_CONCLUSIONS = new Set(['success', 'neutral', 'skipped'])
const TRANSIENT_CONCLUSIONS = new Set(['cancelled', 'timed_out', 'stale', 'startup_failure'])
const HOLD_LABELS = new Set(['hold-merge', 'do-not-merge', 'manual-merge'])
const DISPATCH_EVENTS = new Set(['pull_request', 'workflow_dispatch'])

const FAST_REQUIRED_WORKFLOWS = []
const MEDIUM_CORE_REQUIRED_WORKFLOWS = [
  'Atomic upgrade gate',
  'Build quality regression',
]
const CORE_REQUIRED_CHECKS = ['Validation, tests, and data']
const HIGH_REQUIRED_WORKFLOWS = [
  'CI',
  ...MEDIUM_CORE_REQUIRED_WORKFLOWS,
  'Site Health Check',
  'Production Content Lint',
]

const DOMAIN_REQUIRED_WORKFLOWS = [
  {
    workflow: 'Research Distribution',
    patterns: [
      /^scripts\/distribution\//,
      /^schemas\/distribution(?:\/|[-_.])/,
      /^docs\/distribution-engine\.md$/,
    ],
  },
  {
    workflow: 'Site Health Check',
    patterns: [
      /^src\//,
      /^app\//,
      /^pages\//,
      /^components\//,
      /^public\//,
      /^lib\//,
      /^next\.config\./,
      /^middleware\./,
    ],
  },
  {
    workflow: 'Production Content Lint',
    patterns: [
      /^src\//,
      /^app\//,
      /^pages\//,
      /^components\//,
      /^public\//,
      /^lib\//,
      /^content\//,
      /^next\.config\./,
      /^middleware\./,
      /^scripts\/(?:build|generate)[^/]*\.(?:mjs|js|ts)$/i,
    ],
  },
]

const HIGH_RISK_PATTERNS = [
  /^\.github\/workflows\//,
  /^scripts\/ci\//,
  /^scripts\/data\//,
  /^scripts\/(?:enrichment-governor|enrichment|evidence|governance)\//,
  /^scripts\/[^/]*(?:data|evidence|citation|safety|runtime|content)[^/]*\.(?:mjs|js|ts)$/i,
  /^public\/data\//,
  /^data-sources\//,
  /^data\//,
  /^content\//,
  /(?:^|\/)(?:evidence|citation|safety|dose|interaction|contraindication|regulatory)(?:[./_-]|$)/i,
  /(?:^|\/)(?:robots|sitemap|canonical|redirect|indexability|crawl)(?:[./_-]|$)/i,
  /(?:^|\/)(?:deploy|cloudflare)(?:[./_-]|$)/i,
  /(?:^|\/)profile-summary\./i,
  /(?:^|\/)Evidence[A-Z][^/]*\./,
]

const LOW_RISK_PATTERNS = [
  /(?:^|\/)__tests__\//,
  /(?:^|\/)tests?\//,
  /\.(?:md|mdx|txt)$/i,
  /^docs\//,
  /^\.github\/(?:ISSUE_TEMPLATE|PULL_REQUEST_TEMPLATE)\//,
]

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

function runHasBaseProof(run, prNumber, expectedHeadSha) {
  if (run.event === 'workflow_dispatch') return run.head_sha === expectedHeadSha
  return Boolean(associatedPr(run, prNumber)?.base?.sha)
}

function writeOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) return
  fs.appendFileSync(output, `${name}=${String(value)}\n`, 'utf8')
}

export function classifyRisk({ pr, changedFiles = [] }) {
  const labels = labelNames(pr)
  if (labels.has('risk:high') || labels.has('merge-risk:high') || labels.has('scientific-integrity')) return 'high'
  if (changedFiles.some((path) => HIGH_RISK_PATTERNS.some((pattern) => pattern.test(path)))) return 'high'
  if (changedFiles.length > 0 && changedFiles.every((path) => LOW_RISK_PATTERNS.some((pattern) => pattern.test(path)))) return 'low'
  return 'medium'
}

export function requiredWorkflowsFor(riskTier, changedFiles = []) {
  if (riskTier === 'low') return [...FAST_REQUIRED_WORKFLOWS]
  if (riskTier === 'high') return [...HIGH_REQUIRED_WORKFLOWS]

  const required = new Set(MEDIUM_CORE_REQUIRED_WORKFLOWS)
  for (const { workflow, patterns } of DOMAIN_REQUIRED_WORKFLOWS) {
    if (changedFiles.some((path) => patterns.some((pattern) => pattern.test(path)))) required.add(workflow)
  }
  return [...required]
}

export function requiredChecksFor(riskTier) {
  return riskTier === 'high' ? [] : [...CORE_REQUIRED_CHECKS]
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

async function retryTransientRuns(repo, runs) {
  let retried = false
  for (const run of runs) {
    if (run.status !== 'completed' || !TRANSIENT_CONCLUSIONS.has(run.conclusion || '') || Number(run.run_attempt || 1) >= 2) continue
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

function recoveryInputsFor(runName, pr) {
  if (runName === 'Atomic upgrade gate' || runName === 'Build quality regression') {
    return {
      recovery_pr_number: String(pr.number),
      recovery_base_ref: pr.base.ref,
    }
  }
  if (runName === 'Production Content Lint') {
    return { recovery_pr_number: String(pr.number) }
  }
  return null
}

async function dispatchWorkflowRun(repo, run, pr) {
  if (!run.workflow_id) throw new Error(`Cannot recover ${run.name}: workflow_id is unavailable`)
  const body = { ref: pr.head.ref }
  const inputs = recoveryInputsFor(run.name, pr)
  if (inputs) body.inputs = inputs
  await github(`/repos/${repo}/actions/workflows/${run.workflow_id}/dispatches`, { method: 'POST', body })
  console.log(`Dispatched exact-head recovery workflow: ${run.name} on ${pr.head.sha}`)
}

async function dispatchRegisteredWorkflows(repo, sourceRuns, pr) {
  await sleep(3000)
  const existingRuns = await getWorkflowRuns(repo, pr.head.sha)
  const existingNames = new Set(existingRuns.map((run) => run.name))
  const registered = newestBy(sourceRuns, (run) => run.name, runScore)
  let dispatched = 0
  for (const run of registered) {
    if (existingNames.has(run.name)) continue
    await dispatchWorkflowRun(repo, run, pr)
    dispatched += 1
  }
  console.log(`Recovery dispatch complete for PR #${pr.number}; dispatched ${dispatched}/${registered.length} registered workflow(s)`)
  return dispatched
}

async function waitForHeadMove(repo, number, previousHeadSha) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    await sleep(1000)
    const pr = await getPr(repo, number)
    if (pr.head?.sha && pr.head.sha !== previousHeadSha) return pr
  }
  throw new Error(`PR #${number} branch refresh did not produce a new head within 30 seconds`)
}

async function headContainsBase(repo, baseSha, headSha) {
  const comparison = await github(`/repos/${repo}/compare/${baseSha}...${headSha}`)
  return comparison?.status === 'ahead' || comparison?.status === 'identical'
}

async function refreshPrAndDispatch({ repo, pr, workflowRuns, currentBaseSha }) {
  let workingPr = pr
  let expectedBaseSha = currentBaseSha
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const previousHeadSha = workingPr.head.sha
    await syncPrBranch(repo, workingPr.number, previousHeadSha)
    workingPr = await waitForHeadMove(repo, workingPr.number, previousHeadSha)
    expectedBaseSha = await getBranchSha(repo, workingPr.base.ref)
    if (!expectedBaseSha) throw new Error(`Cannot observe current base SHA for ${workingPr.base.ref}`)
    if (await headContainsBase(repo, expectedBaseSha, workingPr.head.sha)) {
      await dispatchRegisteredWorkflows(repo, workflowRuns, workingPr)
      return { pr: workingPr, baseSha: expectedBaseSha }
    }
    console.log(`Base moved again during PR #${workingPr.number} refresh; reconciling attempt ${attempt + 1}`)
  }
  throw new Error(`PR #${workingPr.number} could not be refreshed onto a stable exact base after 3 attempts`)
}

async function recoverZeroJobActionRequired(repo, pr, failedRuns) {
  if (!failedRuns.length) return false
  if (!failedRuns.every((run) => run.event === 'pull_request' && run.status === 'completed' && run.conclusion === 'action_required')) return false
  for (const run of failedRuns) {
    const jobs = await getRunJobs(repo, run.id)
    if (jobs.length !== 0) return false
  }
  console.log(`Classified ${failedRuns.length} action_required workflow(s) on ${pr.head.sha} as zero-job control-plane failures`)
  for (const run of failedRuns) await dispatchWorkflowRun(repo, run, pr)
  return true
}

export function evaluateReadiness({ pr, workflowRuns, checkRuns, expectedHeadSha, currentBaseSha, controllerRunId, riskTier = 'high', changedFiles = [] }) {
  if (pr.state !== 'open') return { action: 'stop', reason: `PR is ${pr.state}` }
  if (pr.draft) return { action: 'stop', reason: 'PR is draft' }
  if (pr.head?.sha !== expectedHeadSha) return { action: 'stop', reason: 'PR head moved; newer controller owns it' }
  if (pr.head?.repo?.full_name !== pr.base?.repo?.full_name) return { action: 'stop', reason: 'fork PRs are never privileged-auto-merged' }

  const labels = labelNames(pr)
  const hold = [...HOLD_LABELS].find((label) => labels.has(label))
  if (hold) return { action: 'stop', reason: `explicit merge hold label present: ${hold}` }
  if (!currentBaseSha) return { action: 'wait', reason: 'current base SHA is not observable yet' }
  if (pr.mergeable === null || pr.mergeable_state === 'unknown') return { action: 'wait', reason: 'GitHub is still calculating mergeability' }
  if (pr.mergeable === false || pr.mergeable_state === 'dirty') return { action: 'blocked', reason: `PR is not cleanly mergeable (${pr.mergeable_state || 'unknown'})` }
  if (pr.mergeable_state === 'behind' || (pr.base?.sha && pr.base.sha !== currentBaseSha)) return { action: 'sync', reason: 'PR base is behind main; update branch and revalidate exact head' }

  const latestWorkflows = newestBy(workflowRuns, (run) => run.name, runScore)
  const workflowsByName = new Map(latestWorkflows.map((run) => [run.name, run]))
  const requiredNames = requiredWorkflowsFor(riskTier, changedFiles)
  const missingRequired = requiredNames.filter((name) => !workflowsByName.has(name))
  if (missingRequired.length) return { action: 'wait', reason: `${riskTier}-risk required workflows not registered yet: ${missingRequired.join(', ')}` }

  const unverifiableRequired = requiredNames.filter((name) => !runHasBaseProof(workflowsByName.get(name), pr.number, expectedHeadSha))
  if (unverifiableRequired.length) return { action: 'wait', reason: `required workflow base proof missing: ${unverifiableRequired.join(', ')}` }

  const requiredRuns = requiredNames.map((name) => workflowsByName.get(name)).filter(Boolean)
  const staleRuns = (riskTier === 'high' ? latestWorkflows : requiredRuns).filter((run) => {
    if (run.event === 'workflow_dispatch') return false
    const association = associatedPr(run, pr.number)
    return association?.base?.sha && association.base.sha !== currentBaseSha
  })
  if (staleRuns.length) return { action: 'sync', reason: `workflow evidence targets stale base: ${staleRuns.map((run) => run.name).join(', ')}` }

  const pendingRequired = requiredRuns.filter((run) => run.status !== 'completed')
  if (pendingRequired.length) return { action: 'wait', reason: `required workflows pending: ${pendingRequired.map(summarizeRun).join('; ')}` }

  const failedCompletedWorkflows = latestWorkflows.filter((run) => {
    if (run.status !== 'completed' || isGood(run.conclusion)) return false
    if (riskTier !== 'high' && run.conclusion === 'action_required' && !requiredNames.includes(run.name)) return false
    return true
  })
  if (failedCompletedWorkflows.length) return { action: 'failed', reason: `known workflow failure: ${failedCompletedWorkflows.map(summarizeRun).join('; ')}`, failedWorkflows: failedCompletedWorkflows }

  if (riskTier === 'high') {
    const pendingWorkflows = latestWorkflows.filter((run) => run.status !== 'completed')
    if (pendingWorkflows.length) return { action: 'wait', reason: `high-risk workflows pending: ${pendingWorkflows.map(summarizeRun).join('; ')}` }
  }

  const relevantChecks = newestBy(
    checkRuns.filter((check) => !isControllerCheck(check, controllerRunId)),
    (check) => `${check.app?.slug || 'unknown'}:${check.name}`,
    checkScore,
  )
  const checksByName = new Map(relevantChecks.map((check) => [check.name, check]))
  const requiredCheckNames = requiredChecksFor(riskTier)
  const missingRequiredChecks = requiredCheckNames.filter((name) => !checksByName.has(name))
  if (missingRequiredChecks.length) return { action: 'wait', reason: `${riskTier}-risk required checks not registered yet: ${missingRequiredChecks.join(', ')}` }

  const pendingRequiredChecks = requiredCheckNames
    .map((name) => checksByName.get(name))
    .filter((check) => check && check.status !== 'completed')
  if (pendingRequiredChecks.length) return { action: 'wait', reason: `required checks pending: ${pendingRequiredChecks.map(summarizeCheck).join('; ')}` }

  const failedCompletedChecks = relevantChecks.filter((check) => check.status === 'completed' && !isGood(check.conclusion))
  if (failedCompletedChecks.length) return { action: 'failed', reason: `known check failure: ${failedCompletedChecks.map(summarizeCheck).join('; ')}`, failedChecks: failedCompletedChecks }

  if (riskTier === 'high') {
    const pendingChecks = relevantChecks.filter((check) => check.status !== 'completed')
    if (pendingChecks.length) return { action: 'wait', reason: `high-risk checks pending: ${pendingChecks.map(summarizeCheck).join('; ')}` }
  }

  return {
    action: 'merge',
    reason: riskTier === 'high'
      ? 'high-risk exact head is fully terminal-green against current base'
      : `${riskTier}-risk changed-file-relevant gates are green; unrelated pending checks are non-blocking`,
    baseSha: currentBaseSha,
    riskTier,
  }
}

async function mergePr(repo, number, expectedHeadSha) {
  const result = await github(`/repos/${repo}/pulls/${number}/merge`, {
    method: 'PUT',
    body: { sha: expectedHeadSha, merge_method: 'merge' },
  })
  if (!result?.merged) throw new Error(`GitHub refused merge for PR #${number}: ${result?.message || 'unknown reason'}`)
  console.log(`Merged PR #${number} as ${result.sha}`)
  return result
}

async function evaluateOnce({ repo, number, expectedHeadSha, controllerRunId, allowRetry }) {
  const pr = await getPr(repo, number)
  const currentHeadSha = pr.head?.sha
  if (!currentHeadSha) return { action: 'blocked', reason: 'PR has no head SHA' }
  if (expectedHeadSha && currentHeadSha !== expectedHeadSha) return { action: 'stop', reason: `head moved from ${expectedHeadSha} to ${currentHeadSha}` }

  const [workflowRuns, checkRuns, currentBaseSha, changedFiles] = await Promise.all([
    getWorkflowRuns(repo, currentHeadSha),
    getCheckRuns(repo, currentHeadSha),
    getBranchSha(repo, pr.base.ref),
    getPrFiles(repo, number),
  ])
  const riskTier = classifyRisk({ pr, changedFiles })
  const containsCurrentBase = currentBaseSha ? await headContainsBase(repo, currentBaseSha, currentHeadSha) : false
  const verdict = currentBaseSha && !containsCurrentBase
    ? { action: 'sync', reason: 'PR head does not contain current base; update branch and revalidate exact head' }
    : evaluateReadiness({ pr, workflowRuns, checkRuns, expectedHeadSha: currentHeadSha, currentBaseSha, controllerRunId, riskTier, changedFiles })

  if (verdict.action === 'sync') {
    const refreshed = await refreshPrAndDispatch({ repo, pr, workflowRuns, currentBaseSha })
    return { action: 'refresh', reason: 'base refreshed; canonical workflows dispatched on the new exact head', headSha: refreshed.pr.head.sha, baseSha: refreshed.baseSha, riskTier }
  }
  if (verdict.action === 'failed' && allowRetry) {
    const recovered = await recoverZeroJobActionRequired(repo, pr, verdict.failedWorkflows || [])
    if (recovered) return { action: 'wait', reason: 'zero-job control-plane failure recovered through canonical workflow dispatch', headSha: currentHeadSha, baseSha: currentBaseSha, riskTier }
    const retried = await retryTransientRuns(repo, verdict.failedWorkflows || [])
    if (retried) return { action: 'wait', reason: 'bounded transient retry triggered', riskTier }
  }
  return { ...verdict, headSha: currentHeadSha, baseSha: verdict.baseSha || currentBaseSha, riskTier }
}

async function mergeIfStillCurrent({ repo, number, headSha, validatedBaseSha }) {
  const pr = await getPr(repo, number)
  if (pr.head?.sha !== headSha) return false
  const latestBaseSha = await getBranchSha(repo, pr.base.ref)
  if (latestBaseSha !== validatedBaseSha || !(await headContainsBase(repo, latestBaseSha, headSha))) {
    const workflowRuns = await getWorkflowRuns(repo, headSha)
    await refreshPrAndDispatch({ repo, pr, workflowRuns, currentBaseSha: latestBaseSha })
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
  let trackedHeadSha = initialHeadSha
  let lastReason = ''

  writeOutput('ready', 'false')
  writeOutput('head_sha', trackedHeadSha)
  while (Date.now() < deadline) {
    const verdict = await evaluateOnce({ repo, number, expectedHeadSha: trackedHeadSha, controllerRunId, allowRetry: true })
    if (verdict.reason !== lastReason) {
      console.log(`[PR #${number}] [${verdict.riskTier || 'unknown'}] ${verdict.action}: ${verdict.reason}`)
      lastReason = verdict.reason
    }
    if (verdict.action === 'refresh') {
      trackedHeadSha = verdict.headSha
      writeOutput('head_sha', trackedHeadSha)
      continue
    }
    if (verdict.action === 'merge') {
      if (checkOnly) {
        writeOutput('ready', 'true')
        writeOutput('head_sha', verdict.headSha)
        writeOutput('base_sha', verdict.baseSha)
        writeOutput('risk_tier', verdict.riskTier)
        return
      }
      await mergeIfStillCurrent({ repo, number, headSha: verdict.headSha, validatedBaseSha: verdict.baseSha })
      return
    }
    if (verdict.action === 'stop') return
    if (verdict.action === 'blocked' || verdict.action === 'failed') throw new Error(`[PR #${number}] ${verdict.reason}`)
    await sleep(intervalMs)
  }
  console.log(`[PR #${number}] controller window ended; fallback sweep will continue ownership`)
}

async function fallbackSweep() {
  const repo = requiredEnv('GITHUB_REPOSITORY')
  const controllerRunId = process.env.CONTROLLER_RUN_ID || ''
  const payload = await github(`/repos/${repo}/pulls?state=open&per_page=100`)
  let merged = 0
  for (const pr of payload) {
    if (pr.draft || pr.head?.repo?.full_name !== repo) continue
    const verdict = await evaluateOnce({ repo, number: pr.number, expectedHeadSha: pr.head.sha, controllerRunId, allowRetry: true })
    console.log(`[fallback PR #${pr.number}] [${verdict.riskTier || 'unknown'}] ${verdict.action}: ${verdict.reason}`)
    if (verdict.action === 'merge') {
      if (await mergeIfStillCurrent({ repo, number: pr.number, headSha: verdict.headSha, validatedBaseSha: verdict.baseSha })) merged += 1
      break
    }
    if (verdict.action === 'refresh') break
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
