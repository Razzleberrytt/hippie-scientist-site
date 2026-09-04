import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const API_ROOT = process.env.GITHUB_API_URL || 'https://api.github.com'
const DEFAULT_THRESHOLD_HOURS = 6
const ELIGIBLE_EVENTS = new Set(['pull_request'])
const ELIGIBLE_STATUSES = new Set(['queued', 'in_progress'])
const REAPER_WORKFLOW_NAME = 'Stale Actions reaper'

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function parseThresholdHours(value) {
  const parsed = Number(value || DEFAULT_THRESHOLD_HOURS)
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 168) {
    throw new Error(`REAPER_THRESHOLD_HOURS must be between 1 and 168; got ${value}`)
  }
  return parsed
}

async function github(pathname, { method = 'GET' } = {}) {
  const token = requiredEnv('GITHUB_TOKEN')
  const response = await fetch(`${API_ROOT}${pathname}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hippie-scientist-stale-actions-reaper',
    },
  })
  if (response.status === 409 && method === 'POST') return { conflict: true }
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${method} ${pathname} failed (${response.status}): ${text.slice(0, 1000)}`)
  }
  if (response.status === 204 || response.status === 202) return {}
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

async function listRuns(repo, status) {
  const runs = []
  for (let page = 1; ; page += 1) {
    const payload = await github(`/repos/${repo}/actions/runs?status=${status}&per_page=100&page=${page}`)
    const batch = payload.workflow_runs || []
    runs.push(...batch)
    if (batch.length < 100) break
  }
  return runs
}

async function listOpenPrHeadShas(repo) {
  const heads = new Set()
  for (let page = 1; ; page += 1) {
    const payload = await github(`/repos/${repo}/pulls?state=open&per_page=100&page=${page}`)
    for (const pr of payload) {
      if (pr.head?.sha) heads.add(pr.head.sha)
    }
    if (payload.length < 100) break
  }
  return heads
}

function protectedWorkflowName(name = '') {
  if (name === REAPER_WORKFLOW_NAME) return true
  if (name === 'Deploy to Cloudflare Pages') return true
  return /(?:^|\b)(?:release|publish)(?:\b|$)/iu.test(name)
}

function runAgeMs(run, nowMs) {
  const createdMs = Date.parse(run.created_at || '')
  return Number.isFinite(createdMs) ? Math.max(0, nowMs - createdMs) : 0
}

export function classifyRun(run, {
  nowMs,
  thresholdMs,
  activePrHeadShas = new Set(),
  currentRunId = '',
} = {}) {
  if (!run || !ELIGIBLE_STATUSES.has(run.status)) return { cancel: false, reason: 'status-not-eligible' }
  if (String(run.id) === String(currentRunId || '')) return { cancel: false, reason: 'current-reaper-run' }
  if (run.head_branch === 'main') return { cancel: false, reason: 'main-branch-run' }
  if (protectedWorkflowName(run.name)) return { cancel: false, reason: 'protected-workflow' }
  if (!ELIGIBLE_EVENTS.has(run.event)) return { cancel: false, reason: 'non-pr-event' }

  const ageMs = runAgeMs(run, nowMs)
  if (ageMs < thresholdMs) return { cancel: false, reason: 'younger-than-threshold', ageMs }
  if (run.head_sha && activePrHeadShas.has(run.head_sha)) {
    return { cancel: false, reason: 'open-pr-head-still-matches', ageMs }
  }

  const associations = Array.isArray(run.pull_requests) ? run.pull_requests : []
  return {
    cancel: true,
    reason: associations.length === 0 ? 'stale-orphan-no-associated-pr' : 'stale-associated-pr-closed-or-head-moved',
    ageMs,
  }
}

export function selectRunsForCancellation(runs, options) {
  return [...runs]
    .sort((a, b) => {
      const created = String(a.created_at || '').localeCompare(String(b.created_at || ''))
      return created || Number(a.id || 0) - Number(b.id || 0)
    })
    .map((run) => ({ run, decision: classifyRun(run, options) }))
}

function receiptRow(run, decision, thresholdMs) {
  const ageHours = Number(((decision.ageMs || 0) / 3_600_000).toFixed(2))
  return {
    runId: run.id,
    workflow: run.name,
    status: run.status,
    event: run.event,
    headSha: run.head_sha || null,
    headRef: run.head_branch || null,
    createdAt: run.created_at || null,
    ageHours,
    thresholdHours: thresholdMs / 3_600_000,
    reason: decision.reason,
  }
}

export async function cancelRunWithFallback({ repo, runId, request = github, classifyOptions }) {
  const normal = await request(`/repos/${repo}/actions/runs/${runId}/cancel`, { method: 'POST' })
  if (!normal.conflict) {
    return { cancelled: true, mode: 'cancel' }
  }

  const liveRun = await request(`/repos/${repo}/actions/runs/${runId}`)
  const liveDecision = classifyRun(liveRun, classifyOptions)
  if (!liveDecision.cancel) {
    return {
      cancelled: false,
      mode: null,
      liveRun,
      liveDecision,
      reason: 'became-ineligible-before-force-cancel',
    }
  }

  const forced = await request(`/repos/${repo}/actions/runs/${runId}/force-cancel`, { method: 'POST' })
  if (!forced.conflict) {
    return { cancelled: true, mode: 'force-cancel', liveRun, liveDecision }
  }

  return {
    cancelled: false,
    mode: 'force-cancel',
    liveRun,
    liveDecision,
    reason: 'force-cancel-conflict',
  }
}

async function main() {
  const repo = requiredEnv('GITHUB_REPOSITORY')
  const thresholdHours = parseThresholdHours(process.env.REAPER_THRESHOLD_HOURS)
  const thresholdMs = thresholdHours * 3_600_000
  const dryRun = process.env.REAPER_DRY_RUN !== 'false'
  const currentRunId = process.env.REAPER_CURRENT_RUN_ID || process.env.GITHUB_RUN_ID || ''
  const nowMs = Date.now()

  const [queued, inProgress, activePrHeadShas] = await Promise.all([
    listRuns(repo, 'queued'),
    listRuns(repo, 'in_progress'),
    listOpenPrHeadShas(repo),
  ])
  const deduped = new Map([...queued, ...inProgress].map((run) => [run.id, run]))
  const classified = selectRunsForCancellation([...deduped.values()], {
    nowMs,
    thresholdMs,
    activePrHeadShas,
    currentRunId,
  })

  const receipt = {
    generatedAt: new Date(nowMs).toISOString(),
    repository: repo,
    dryRun,
    thresholdHours,
    currentRunId: currentRunId || null,
    selected: [],
    retained: [],
    cancelled: [],
    raced: [],
  }

  for (const { run, decision } of classified) {
    const row = receiptRow(run, decision, thresholdMs)
    if (!decision.cancel) receipt.retained.push(row)
    else receipt.selected.push(row)
  }

  if (!dryRun && receipt.selected.length > 0) {
    const freshActivePrHeadShas = await listOpenPrHeadShas(repo)
    for (const selected of receipt.selected) {
      const liveRun = await github(`/repos/${repo}/actions/runs/${selected.runId}`)
      const classifyOptions = {
        nowMs: Date.now(),
        thresholdMs,
        activePrHeadShas: freshActivePrHeadShas,
        currentRunId,
      }
      const liveDecision = classifyRun(liveRun, classifyOptions)
      if (!liveDecision.cancel) {
        receipt.raced.push(receiptRow(liveRun, liveDecision, thresholdMs))
        continue
      }

      const result = await cancelRunWithFallback({
        repo,
        runId: liveRun.id,
        classifyOptions,
      })
      const finalRun = result.liveRun || liveRun
      const finalDecision = result.liveDecision || liveDecision
      if (result.cancelled) {
        receipt.cancelled.push({
          ...receiptRow(finalRun, finalDecision, thresholdMs),
          cancellationMode: result.mode,
        })
      } else {
        receipt.raced.push({
          ...receiptRow(finalRun, finalDecision, thresholdMs),
          reason: result.reason || 'cancellation-not-accepted',
          cancellationMode: result.mode,
        })
      }
    }
  }

  const outputDir = path.join(process.cwd(), 'artifacts', 'ci')
  fs.mkdirSync(outputDir, { recursive: true })
  const outputPath = path.join(outputDir, 'stale-actions-reaper-receipt.json')
  fs.writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8')

  console.log(`Stale Actions reaper: selected=${receipt.selected.length} cancelled=${receipt.cancelled.length} retained=${receipt.retained.length} raced=${receipt.raced.length} dryRun=${dryRun}`)
  for (const row of receipt.cancelled) {
    console.log(`Cancelled run ${row.runId} ${row.workflow} ${row.headRef || ''} mode=${row.cancellationMode} ${row.reason}`)
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch((error) => {
    console.error(error?.stack || error)
    process.exitCode = 1
  })
}
