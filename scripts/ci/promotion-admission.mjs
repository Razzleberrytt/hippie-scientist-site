import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

const HOLD_LABELS = new Set(['hold-merge', 'do-not-merge', 'manual-merge'])
const SHA_RE = /^[0-9a-f]{40}$/i
const WORKFLOW_CONTROL_PATH = /^\.github\/workflows\//u

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function labelsFor(pr) {
  return new Set((pr?.labels || []).map(label => typeof label === 'string' ? label : label?.name).filter(Boolean))
}

export function isHeldPromotionPr(pr) {
  const labels = labelsFor(pr)
  return [...HOLD_LABELS].some(label => labels.has(label))
}

export function isSameRepoMainPr(pr, repository) {
  return Boolean(
    pr &&
    pr.state === 'open' &&
    pr.base?.ref === 'main' &&
    pr.head?.repo?.full_name === repository
  )
}

export function canAutoRefreshPromotionPr(changedFiles = []) {
  return !changedFiles.some(file => WORKFLOW_CONTROL_PATH.test(String(file || '')))
}

function compareCandidateOrder(a, b) {
  const aCreated = Date.parse(a?.created_at || '') || 0
  const bCreated = Date.parse(b?.created_at || '') || 0
  if (aCreated !== bCreated) return aCreated - bCreated
  return Number(a?.number || 0) - Number(b?.number || 0)
}

function eligibleDraftCandidates(pulls, repository) {
  return pulls
    .filter(pr => isSameRepoMainPr(pr, repository) && pr.draft === true && !isHeldPromotionPr(pr))
    .sort(compareCandidateOrder)
}

export function planPromotionState({ pulls = [], repository }) {
  const scoped = pulls
    .filter(pr => isSameRepoMainPr(pr, repository))
    .sort(compareCandidateOrder)

  const stage = scoped.filter(pr => pr.draft !== true && isHeldPromotionPr(pr))
  const active = scoped.filter(pr => pr.draft !== true && !isHeldPromotionPr(pr))
  const keeper = active[0] || null
  stage.push(...active.slice(1))

  const stagedNumbers = [...new Set(stage.map(pr => Number(pr.number)).filter(Number.isInteger))].sort((a, b) => a - b)
  const draftCandidates = keeper ? [] : eligibleDraftCandidates(pulls, repository)

  return {
    active: keeper,
    stageNumbers: stagedNumbers,
    draftCandidates,
  }
}

async function github(path, token) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'hippie-scientist-promotion-admission',
    },
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`GitHub API ${response.status} for ${path}: ${detail.slice(0, 800)}`)
  }
  return response.json()
}

async function listAll(path, token) {
  const rows = []
  for (let page = 1; ; page += 1) {
    const joiner = path.includes('?') ? '&' : '?'
    const pageRows = await github(`${path}${joiner}per_page=100&page=${page}`, token)
    if (!Array.isArray(pageRows)) throw new Error(`GitHub list response was not an array for ${path}`)
    rows.push(...pageRows)
    if (pageRows.length < 100) return rows
  }
}

async function listOpenMainPulls(repository, token) {
  return listAll(`/repos/${repository}/pulls?state=open&base=main&sort=created&direction=asc`, token)
}

async function changedFilesForPr(repository, prNumber, token) {
  const rows = await listAll(`/repos/${repository}/pulls/${prNumber}/files`, token)
  return rows.map(row => row?.filename).filter(Boolean)
}

async function currentMainSha(repository, token) {
  const branch = await github(`/repos/${repository}/branches/main`, token)
  const sha = branch?.commit?.sha
  if (!SHA_RE.test(String(sha || ''))) throw new Error('Unable to resolve exact current main SHA')
  return sha
}

async function relationshipToMain(repository, mainSha, headSha, token) {
  if (!SHA_RE.test(String(headSha || ''))) return { exact: false, behindBy: null }
  const comparison = await github(`/repos/${repository}/compare/${mainSha}...${headSha}`, token)
  const behindBy = Number(comparison?.behind_by || 0)
  return {
    exact: behindBy === 0 && comparison?.merge_base_commit?.sha === mainSha,
    behindBy,
  }
}

function appendOutputs(entries) {
  const output = process.env.GITHUB_OUTPUT
  if (!output) return
  for (const [key, value] of Object.entries(entries)) {
    const normalized = String(value ?? '')
    if (/[\r\n]/.test(normalized)) throw new Error(`Output ${key} contains a newline`)
    fs.appendFileSync(output, `${key}=${normalized}\n`, 'utf8')
  }
}

export async function assertPromotionTokenFree({ repository, token }) {
  const pulls = await listOpenMainPulls(repository, token)
  const blockers = pulls.filter(pr => isSameRepoMainPr(pr, repository) && pr.draft !== true)
  if (blockers.length) {
    throw new Error(`promotion token already occupied by non-draft PR(s): ${blockers.map(pr => `#${pr.number}`).join(', ')}`)
  }
  return true
}

export async function buildAdmissionPlan({ repository, token }) {
  const pulls = await listOpenMainPulls(repository, token)
  const plan = planPromotionState({ pulls, repository })
  const mainSha = await currentMainSha(repository, token)

  let active = plan.active
  const stageNumbers = [...plan.stageNumbers]
  const cleanRestageNumbers = []
  let candidate = null
  let refreshCandidate = null

  if (active) {
    const relationship = await relationshipToMain(repository, mainSha, active.head?.sha, token)
    if (!relationship.exact) {
      const changedFiles = await changedFilesForPr(repository, active.number, token)
      if (!canAutoRefreshPromotionPr(changedFiles)) {
        stageNumbers.push(active.number)
        cleanRestageNumbers.push(active.number)
        active = null
      }
    }
  }

  const drafts = active ? [] : eligibleDraftCandidates(pulls, repository)
  for (const pr of drafts) {
    const relationship = await relationshipToMain(repository, mainSha, pr.head?.sha, token)
    if (relationship.exact) {
      candidate = pr
      break
    }

    const changedFiles = await changedFilesForPr(repository, pr.number, token)
    if (!canAutoRefreshPromotionPr(changedFiles)) {
      cleanRestageNumbers.push(pr.number)
      continue
    }

    if (!refreshCandidate) {
      const detail = await github(`/repos/${repository}/pulls/${pr.number}`, token)
      if (detail?.mergeable !== false) refreshCandidate = detail
    }
  }

  return {
    ...plan,
    active,
    stageNumbers: [...new Set(stageNumbers)].sort((a, b) => a - b),
    mainSha,
    candidate,
    refreshCandidate: candidate ? null : refreshCandidate,
    cleanRestageNumbers: [...new Set(cleanRestageNumbers)].sort((a, b) => a - b),
  }
}

async function main() {
  const command = process.argv[2]
  const repository = requiredEnv('GITHUB_REPOSITORY')
  const token = requiredEnv('GITHUB_TOKEN')

  if (command === 'assert-token-free') {
    await assertPromotionTokenFree({ repository, token })
    process.stdout.write('Global promotion token is free.\n')
    return
  }

  if (command === 'admit-next') {
    const plan = await buildAdmissionPlan({ repository, token })
    appendOutputs({
      stage_numbers: plan.stageNumbers.join(','),
      active_pr_number: plan.active?.number || '',
      candidate_pr_number: plan.candidate?.number || '',
      candidate_head_sha: plan.candidate?.head?.sha || '',
      refresh_pr_number: plan.refreshCandidate?.number || '',
      refresh_head_sha: plan.refreshCandidate?.head?.sha || '',
      clean_restage_numbers: plan.cleanRestageNumbers.join(','),
      main_sha: plan.mainSha,
    })
    process.stdout.write(`${JSON.stringify({
      stageNumbers: plan.stageNumbers,
      activePrNumber: plan.active?.number || null,
      candidatePrNumber: plan.candidate?.number || null,
      candidateHeadSha: plan.candidate?.head?.sha || null,
      refreshPrNumber: plan.refreshCandidate?.number || null,
      refreshHeadSha: plan.refreshCandidate?.head?.sha || null,
      cleanRestageNumbers: plan.cleanRestageNumbers,
      mainSha: plan.mainSha,
    }, null, 2)}\n`)
    return
  }

  throw new Error('Usage: promotion-admission.mjs assert-token-free|admit-next')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error?.stack || error)
    process.exitCode = 1
  })
}
