import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const API_ROOT = process.env.GITHUB_API_URL || 'https://api.github.com'
const WORKFLOW_PATH = /^\.github\/workflows\//u

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

async function github(path) {
  const token = requiredEnv('GITHUB_TOKEN')
  const response = await fetch(`${API_ROOT}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hippie-scientist-autonomous-merge-safe-entry',
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

async function headContainsBase(repo, baseSha, headSha) {
  const payload = await github(`/repos/${repo}/compare/${baseSha}...${headSha}`)
  return payload?.status === 'ahead' || payload?.status === 'identical'
}

export function touchesWorkflowFiles(changedFiles = []) {
  return changedFiles.some((file) => WORKFLOW_PATH.test(file))
}

export function classifyRefreshSafety({ pr, changedFiles = [], currentBaseSha, containsCurrentBase }) {
  const headSha = pr?.head?.sha || null
  if (!headSha || !currentBaseSha) {
    return { safe: false, stale: true, reason: 'exact head/base is not observable; refusing mutation' }
  }

  const stale = containsCurrentBase === false ||
    pr?.mergeable_state === 'behind' ||
    Boolean(pr?.base?.sha && pr.base.sha !== currentBaseSha)

  if (!stale) return { safe: true, stale: false, reason: 'head already contains current base' }
  if (!touchesWorkflowFiles(changedFiles)) {
    return { safe: true, stale: true, reason: 'ordinary stale PR may use canonical update-branch recovery' }
  }

  return {
    safe: false,
    stale: true,
    reason: 'workflow-changing PR requires clean restage on current main; refusing bot-authored update-branch',
  }
}

async function inspectRefreshSafety(repo, pr) {
  const [changedFiles, currentBaseSha] = await Promise.all([
    getPrFiles(repo, pr.number),
    getBranchSha(repo, pr.base.ref),
  ])
  const containsCurrentBase = currentBaseSha && pr.head?.sha
    ? await headContainsBase(repo, currentBaseSha, pr.head.sha)
    : false
  return {
    changedFiles,
    currentBaseSha,
    containsCurrentBase,
    decision: classifyRefreshSafety({ pr, changedFiles, currentBaseSha, containsCurrentBase }),
  }
}

function runCanonicalController(envOverrides = {}) {
  const result = spawnSync(process.execPath, ['scripts/ci/autonomous-merge-controller.mjs'], {
    env: { ...process.env, ...envOverrides },
    stdio: 'inherit',
  })
  if (result.error) throw result.error
  if ((result.status ?? 1) !== 0) process.exitCode = result.status ?? 1
  return result.status ?? 1
}

async function runOne(repo, number, expectedHeadSha) {
  const pr = await getPr(repo, number)
  if (!pr?.head?.sha) throw new Error(`PR #${number} has no observable head SHA`)
  if (expectedHeadSha && pr.head.sha !== expectedHeadSha) {
    console.log(`Safe entry stopped PR #${number}: head moved from ${expectedHeadSha} to ${pr.head.sha}`)
    return
  }

  const inspection = await inspectRefreshSafety(repo, pr)
  if (!inspection.decision.safe) {
    console.log(`NEEDS_CLEAN_RESTAGE PR #${number}: ${inspection.decision.reason}`)
    return
  }

  runCanonicalController({
    SWEEP_OPEN_PRS: 'false',
    PR_NUMBER: String(number),
    EXPECTED_HEAD_SHA: pr.head.sha,
  })
}

async function runSweep(repo) {
  const prs = await github(`/repos/${repo}/pulls?state=open&per_page=100`)
  for (const pr of prs) {
    if (pr.draft || pr.head?.repo?.full_name !== repo) continue

    const inspection = await inspectRefreshSafety(repo, pr)
    if (!inspection.decision.safe) {
      console.log(`[fallback PR #${pr.number}] NEEDS_CLEAN_RESTAGE: ${inspection.decision.reason}`)
      continue
    }

    console.log(`[fallback PR #${pr.number}] delegated to canonical controller after refresh-safety check`)
    runCanonicalController({
      SWEEP_OPEN_PRS: 'false',
      PR_NUMBER: String(pr.number),
      EXPECTED_HEAD_SHA: pr.head.sha,
      MERGE_POLL_SECONDS: process.env.MERGE_POLL_SECONDS || '10',
      MERGE_MAX_WAIT_MINUTES: process.env.MERGE_MAX_WAIT_MINUTES || '1',
    })
    return
  }
  console.log('Fallback sweep found no eligible PR after workflow-refresh safety checks')
}

async function main() {
  const repo = requiredEnv('GITHUB_REPOSITORY')
  if (process.env.SWEEP_OPEN_PRS === 'true') {
    await runSweep(repo)
    return
  }

  const number = Number(requiredEnv('PR_NUMBER'))
  const expectedHeadSha = process.env.EXPECTED_HEAD_SHA?.trim() || ''
  await runOne(repo, number, expectedHeadSha)
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch((error) => {
    console.error(error?.stack || error)
    process.exitCode = 1
  })
}
